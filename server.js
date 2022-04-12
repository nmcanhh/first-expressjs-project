const express = require('express');
const app = express();
const port = 3000;
const bodyParser = require('body-parser');
const UserModel = require('./models/user.model');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const googleAuth = require('./auth/google')
const githubAuth = require('./auth/github')
const userRouter = require('./routes/user.route');
const authRouter = require('./routes/auth.route');
const passport = require('passport');
require('dotenv').config({ path: require('find-config')('.env') });
const bcrypt = require('bcrypt');
const axios = require('axios').default;

const isLoggedIn = (req, res, next) => {
    req.user ? next() : res.sendStatus(401);
}

app.use(session({ secret: 'cats', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());


const userStatus = {
    inactive: 'inactive',
    active: 'active',
};

// có thể lưu cookie lên database Redis
app.use(session({
    secret: 'keyboard cat', // 1 chuỗi key bí mật
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false,
        maxAge: 60000 //thời gian sống: 60s -> sau khoảng thời gian này sẽ bị xóa đi, khi ta vào lại route đó thì nó tạo mới lại
    } // false: http, https, true: https
}))


app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*'); //example.com
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
})




app.use('/api/user/', userRouter);
app.use('/auth/', userRouter);

app.post('/register', async (req, res, next) => {
    try {
        var username = req.body.username;
        var password = req.body.password;
        const saltRounds = 10;

        const salt = bcrypt.genSaltSync(saltRounds);
        const hash = bcrypt.hashSync(password, salt);
        const user = await UserModel.findOne({
            username: username
        });

        // const compare = bcrypt.compareSync("12345rqwr6789", user.password); // true

        if (user) {
            return res.status(400).json({
                code: 400,
                message: "Account already exists!"
            })
        }

        const create = await UserModel.create({
            username,
            password: hash,
            role: "member"
        });

        const result = create.toObject();
        delete result.password;

        return res.send({
            result
        })
    } catch (error) {
        throw new Error(error)
    }
});

app.post('/login', async (req, res, next) => {
    try {
        var username = req.body.username;
        var password = req.body.password;

        const saltRounds = 10;
        const salt = bcrypt.genSaltSync(saltRounds);
        const hash = bcrypt.hashSync(password, salt);

        const user = await UserModel.findOne({
            username: username,
        }).exec();
        if (!user) {
            return res.status(400).json({
                code: 400,
                message: "Account does not exist!"
            })
        }

        const compare = bcrypt.compareSync(password, user.password);

        if (!compare) {
            return res.status(400).json({
                code: 400,
                message: "Account or password is wrong!"
            })
        }
        var token = jwt.sign({
            _id: user._id
        }, 'nmcanhh_signature', {
            expiresIn: "7d"
        })
        return res.json({
            message: 'Create account success!',
            token: token,
        })

    } catch (error) {
        throw new Error(error)
    }
})

app.get('/auth/google',
    passport.authenticate('google', { scope: ['email', 'profile'] })
)
app.get('/auth/google/callback',
    passport.authenticate('google', {
        successRedirect: '/auth/google/protected',
        failureRedirect: '/auth/google/failure',
    })
)

app.get('/auth/google/failure', (req, res, next) => {
    res.send('Something went wrong!');
});

app.get('/auth/google/protected', isLoggedIn, async (req, res, next) => {
    try {
        const userInfo = req.user._json;
        const user = await UserModel.findOne({
            googleId: userInfo.sub,
        }).exec();

        let token;

        if (user && user.status === userStatus.inactive) {
            throw new Error(JSON.stringify({
                code: 403,
                message: 'Inactive User',
            }));
        }

        if (user && user.status === userStatus.active) {
            token = jwt.sign({
                _id: user._id
            }, 'nmcanhh_signature', {
                expiresIn: "7d"
            })
            return res.redirect(`${process.env.BE_HOST}?token=${token}`);
        }

        const createOne = await UserModel.create({
            googleId: userInfo.sub,
            firstName: userInfo.family_name,
            lastName: userInfo.given_name,
            email: userInfo.email,
            profilePhoto: userInfo.picture,
            status: userStatus.active,
            role: "member"
        });

        token = jwt.sign({
            _id: createOne._id
        }, 'nmcanhh_signature', {
            expiresIn: "7d"
        })

        return res.redirect(`${process.env.BE_HOST}?token=${token}`);
    } catch (error) {
        throw new Error(error)
    }
});


app.get('/auth/github', (req, res) => {
    res.redirect(`https://github.com/login/oauth/authorize?client_id=44656768f3d173fe9945`);
});

app.get('/auth/github/callback', async (req, res) => {
    try {
        const body = {
            client_id: '44656768f3d173fe9945',
            client_secret: '11b933014b2d048a2ef4b71b1f20297f25c7c434',
            code: req.query.code,
        };

        const opts = { headers: { accept: 'application/json' } };
        const response = await axios.post('https://github.com/login/oauth/access_token', body, opts);

        //  return response?.data?.access_token;

        const { data: userInfo } = await axios.get('https://api.github.com/user', {
            headers: {
                Authorization: `token ${response.data.access_token}`,
            },
        });

        const user = await UserModel.findOne({
            githubId: userInfo.id,
        }).exec();

        let token;

        if (user && user.status === userStatus.inactive) {
            throw new Error(JSON.stringify({
                code: 403,
                message: 'Inactive User',
            }));
        }

        if (user && user.status === userStatus.active) {
            token = jwt.sign({
                _id: user._id
            }, 'nmcanhh_signature', {
                expiresIn: "7d"
            })
            return res.redirect(`${process.env.BE_HOST}?token=${token}`);
        }

        const createOne = await UserModel.create({
            githubId: userInfo.id,
            // firstName: userInfo.family_name,
            // lastName: userInfo.given_name,
            fullName: userInfo.name,
            email: userInfo.email,
            profilePhoto: userInfo.avatar_url,
            status: userStatus.active,
            role: "member"
        });

        token = jwt.sign({
            _id: createOne._id
        }, 'nmcanhh_signature', {
            expiresIn: "7d"
        })

        return res.redirect(`${process.env.BE_HOST}?token=${token}`);

        // console.log(req);
    } catch (error) {
        throw new Error(error)
    }
});

app.get('/auth/github/failure', (req, res, next) => {
    res.send('Something went wrong!');
});

app.get('/auth/github/protected', isLoggedIn, async (req, res, next) => {
    try {
        const userInfo = req.user;
        const user = await UserModel.findOne({
            githubId: userInfo.id,
        }).exec();

        let token;

        if (user && user.status === userStatus.inactive) {
            throw new Error(JSON.stringify({
                code: 403,
                message: 'Inactive User',
            }));
        }

        if (user && user.status === userStatus.active) {
            token = jwt.sign({
                _id: user._id
            }, 'nmcanhh_signature', {
                expiresIn: "7d"
            })
            return res.redirect(`${process.env.BE_HOST}?token=${token}`);
        }

        const createOne = await UserModel.create({
            githubId: userInfo.id,
            firstName: userInfo.family_name,
            lastName: userInfo.given_name,
            fullName: userInfo.displayName,
            email: userInfo._json.email,
            profilePhoto: userInfo._json.avatar_url,
            status: userStatus.active,
        });

        token = jwt.sign({
            _id: user._id
        }, 'nmcanhh_signature', {
            expiresIn: "7d"
        })

        return res.redirect(`${process.env.BE_HOST}?token=${token}`);
    } catch (error) {
        throw new Error(error)
    }
});


app.get('/logout', (req, res) => {
    req.logout();
    req.session.destroy();
    res.send('Goodbye!');
});

// Session được lưu ở trong cookie và cả 2 được lưu trong bộ nhớ tạm của server, ở máy chúng ta thì là ram
// app.get('/', function (req, res, next) {
//     if (req.session.views) {
//         req.session.views++
//         res.setHeader('Content-Type', 'text/html')
//         res.write('<p>views: ' + req.session.views + '</p>')
//         res.write('<p>expires in: ' + (req.session.cookie.maxAge / 1000) + 's</p>')
//         res.end()
//     } else {
//         req.session.views = 1
//         res.end('welcome to the session demo. refresh!')
//     }
// })


app.get('/', (req, res, next) => {
    res.json('Home');
});


// Xóa Session
// app.get('/logout', (req, res, next) => {
//     req.session.destroy();
//     res.json('Log out!')
// });


app.listen(port, () => {
    console.log(`Example app listening on port ${process.env.PORT}`);
});

