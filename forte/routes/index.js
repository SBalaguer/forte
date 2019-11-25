'use strict';

const { Router } = require('express');
const router = new Router();
const Company = require('./../models/company.js');

router.get('/', (req, res, next) => {
  res.render('index', { title: 'Hello World!' });
});

router.get('/:companyName', (req, res, next) => {
  const companyName = req.params.companyName;
  Company.findOne({companyName:companyName})
  .then(company =>{
    console.log(company);
    res.render('./admin/dashboard', { company });
  })
  .catch(error =>{
    next(error);
  });
});

module.exports = router;
