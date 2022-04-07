const express = require('express');
var router = express.Router();
const AccountModel = require('../models/account');

// Lấy dữ liệu từ DB
router.get('/', (req, res, next)=>{
    AccountModel.find({}).then(data=>{
        res.status(200).json(data);
    }).catch(err => {
        res.status(500).json('Lỗi Server!');
    })
});

// Lấy dữ liệu chi tiết của 1 record từ DB
router.get('/:id', (req, res, next)=>{
    var id = req.params.id;
    
    AccountModel.findById(id).then(data=>{
        res.status(200).json(data);
    }).catch(err => {
        res.status(500).json('Lỗi Server!');
    })
});

// Thêm mới dữ liệu vào DB
router.post('/create', (req, res, next)=>{
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

// Update dữ liệu trong DB
router.put('/change-password/:id', (req, res, next)=>{
    var id = req.params.id;
    var newPassword = req.body.newPassword;

    AccountModel.findByIdAndUpdate(id, {
        password: newPassword // line này truyền giá trị cần thay đổi trong database
    })
    .then((data) => {
        res.status(200).json('Cập nhật mật khẩu thành công!')
    }).catch((err) => {
        res.status(500).json('Cập nhật mật khẩu thất bại!')
    });
});

// Xóa dữ liệu trong DB
router.delete('/delete/:id', (req, res, next)=>{
    var id = req.params.id;

    AccountModel.deleteOne({
        _id: id
    })
    .then((data) => {
        res.status(200).json("Xoá tài khoản thành công!")
    }).catch((err) => {
        res.status(500).json("Xoá tài khoản thất bại!")
    });
});


module.exports = router;