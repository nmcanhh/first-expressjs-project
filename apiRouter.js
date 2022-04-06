const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.json('GET Method');
  });

router.post('/', (req, res) => {
    console.log(req.body.username);
    res.json('POST Method');
  });

router.put('/', (req, res) => {
    res.json('PUT Method');
  });

router.delete('/', (req, res) => {
    res.json('Delete Method');
  });

router.get('/cart', (req, res) => {
    res.json('Router 1 Cart');
  });

router.get('/:id', (req, res) => {
    res.json('Router 1 Cart' + req.params.id);
  });


module.exports = router;

