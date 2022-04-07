const express = require('express');
const app = express();
const port = 3000;
var bodyParser = require('body-parser');
const UserModel = require('./models/user');
const jwt = require('jsonwebtoken');

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

const userRouter = require('./routers/user');

app.use('/api/user/', userRouter);

app.get('/', (req, res, next) => {
    res.json('Home');
});


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
})

