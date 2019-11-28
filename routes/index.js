'use strict';

const {
  Router
} = require('express');
const router = new Router();

router.get('/', (req, res, next) => {
  res.render('index', {
    title: 'Forte'
  });
});

module.exports = router;