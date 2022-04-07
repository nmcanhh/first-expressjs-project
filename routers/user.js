const express = require('express');
var router = express.Router();
const UserModel = require('../models/user');
const PAGE_SIZE = 10;

// Lấy dữ liệu từ DB
router.get('/', (req, res, next) => {
    var page = req.query.page;
    if (page) {
        // Get Page
        page = parseInt(page);
        if(page < 0) {
            page = 1;
        }
        var skipLength = (page - 1) * PAGE_SIZE;

        UserModel.find({}).skip(skipLength).limit(PAGE_SIZE).then((data) => {
            res.status(200).json(data);
        }).catch((err) => {
            res.status(500).json('Lỗi Server!');
        });;

    } else {
        // Get All User
        UserModel.find({}).then(data => { // find({}) tìm tất cả thì để {}
            res.status(200).json(data);
        }).catch(err => {
            res.status(500).json('Lỗi Server!');
        })
    }
});

// Lấy dữ liệu chi tiết của 1 record từ DB
router.get('/:id', (req, res, next) => {
    var id = req.params.id;

    UserModel.findById(id).then(data => {
        res.status(200).json(data);
    }).catch(err => {
        res.status(500).json('Lỗi Server!');
    })
});

// Thêm mới dữ liệu vào DB
router.post('/create', (req, res, next) => {
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

// Update dữ liệu trong DB
router.put('/change-password/:id', (req, res, next) => {
    var id = req.params.id;
    var newPassword = req.body.newPassword;

    UserModel.findByIdAndUpdate(id, {
            password: newPassword // line này truyền giá trị cần thay đổi trong database
        })
        .then((data) => {
            res.status(200).json('Cập nhật mật khẩu thành công!')
        }).catch((err) => {
            res.status(500).json('Cập nhật mật khẩu thất bại!')
        });
});

// Xóa dữ liệu trong DB
router.delete('/delete/:id', (req, res, next) => {
    var id = req.params.id;

    UserModel.deleteOne({
            _id: id
        })
        .then((data) => {
            res.status(200).json("Xoá tài khoản thành công!")
        }).catch((err) => {
            res.status(500).json("Xoá tài khoản thất bại!")
        });
});


module.exports = router;