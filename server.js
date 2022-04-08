const express = require('express');
const app = express();
const port = 3000;
const bodyParser = require('body-parser');
const UserModel = require('./models/user');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const googleAuth = require('./auth/google')
const userRouter = require('./routers/user');
const passport = require('passport');
require('dotenv').config({ path: require('find-config')('.env') })

const isLoggedIn = (req, res, next) => {
    req.user ? next() : res.sendStatus(401);
}

app.use(session({ secret: 'cats', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());


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


app.post('/register', (req, res, next) => {
    var username = req.body.username;
    var password = req.body.password;

    UserModel.findOne({
        username: username
    }).then(data => {
        if (data) {
            res.json('Tài khoản đã tồn tại!');
        } else {
            return UserModel.create({
                username: username,
                password: password
            })
        }
    }).then(data => {
        res.status(200).json('Tạo tài khoản thành công!');
    })
        .catch(err => {
            res.status(500).json('Tạo tài khoản thất bại!');
        })
});

app.post('/login', (req, res, next) => {
    var username = req.body.username;
    var password = req.body.password;
    UserModel.findOne({
        username: username,
        password: password
    }).then(data => {
        if (data) {
            var token = jwt.sign({
                _id: data._id
            }, 'mk', {
                expiresIn: "7d"
            })
            return res.json({
                message: 'Successfully!',
                token: token,
            })
        } else {
            res.status(300).json('Sai tài khoản hoặc mật khẩu!');
        }
    }).catch(err => {
        res.status(500).json('Đăng nhập thất bại!');
    })
})

app.get('/auth/google',
    passport.authenticate('google', { scope: ['email', 'profile'] })
)
app.get('/auth/google/callback',
    passport.authenticate('google', {
        successRedirect: '/protected',
        failureRedirect: '/auth/failure',
    })
)

app.get('/auth/failure', (req, res, next) => {
    res.send('something went wrong..');
});
app.get('/protected', isLoggedIn, (req, res, next) => {
    res.send({
        googleId: req.user.id,
        name: req.user.displayName,
        email: req.user.email,
        picture: req.user.picture
    });
});


app.get('/logout', (req, res) => {
    req.logout();
    req.session.destroy();
    res.send('Goodbye!');
});


app.use('/api/user/', userRouter);

// Session được lưu ở trong cookie và cả 2 được lưu trong bộ nhớ tạm của server, ở máy chúng ta thì là ram
app.get('/', function (req, res, next) {
    if (req.session.views) {
        req.session.views++
        res.setHeader('Content-Type', 'text/html')
        res.write('<p>views: ' + req.session.views + '</p>')
        res.write('<p>expires in: ' + (req.session.cookie.maxAge / 1000) + 's</p>')
        res.end()
    } else {
        req.session.views = 1
        res.end('welcome to the session demo. refresh!')
    }
})

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
})

