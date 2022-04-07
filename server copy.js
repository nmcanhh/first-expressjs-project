const express = require('express');
const app = express();
const port = 3000;
const router1 = require('./apiRouter.js');
var bodyParser = require('body-parser');

// const checkAdmin = (req, res, next) => {
//     if(dangnhap) {
//         user.role  = 'admin';
//         next();
//     } else {
//         res.json('Ban chua dang nhap');
//     };
// }

// app.get('/', check , (req, res, next)=> {
//     res.json('End!')
//   });

app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());


app.use('/admin/api/v1/', router1);
//   // localhost:3000/api1/

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
})