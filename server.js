const express = require('express');
const app = express();
const port = 3000;
var bodyParser = require('body-parser');
const AccountModel = require('./models/account');

app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

app.post('/register', (req, res, next) => {
    var username = req.body.username;
    var password = req.body.password;

    AccountModel.findOne({
            username: username
        }).then(data => {
            if (data) {
                res.json('Tài khoản đã tồn tại!');
            } else {
                return AccountModel.create({
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
    AccountModel.findOne({  
        username: username,
        password: password
    }).then(data => {
        if (data) {
            res.status(200).json('Đăng nhập thành công!')
        } else {
            res.status(300).json('Sai tài khoản hoặc mật khẩu!');
        }
    }).catch(err => {
        res.status(500).json('Đăng nhập thất bại!');
    })
})

const accountRouter = require('./routers/account');

app.use('/api/account/', accountRouter);

app.get('/', (req, res, next) => {
    res.json('Home');
});


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
})