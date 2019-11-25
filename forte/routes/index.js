'use strict';

const { Router } = require('express');
const router = new Router();
const Company = require('./../models/company.js');

const mockupData = [
  {contractor:"joe",amount:"50",status:"approved"},
  {contractor:"ruth",amount:"30",status:"paid"},
  {contractor:"jane",amount:"100",status:"rejected"},
  {contractor:"donny",amount:"10",status:"unaproved"}
];

router.get('/', (req, res, next) => {
  res.render('index', { title: 'Forte' });
});
 
const isSignedIn = require('./../middleware/route-guard.js');

router.get('/:url/profile', isSignedIn ,(req, res, next) => {
  //console.log('The company ID is:',req.session.company);
  const companyUrl = req.params.url;
  Company.findOne({url:companyUrl})
  .then(company =>{
    //console.log('This is the logged in company', company);
    res.render('./admin/dashboard', { company , mockupData });
  })
  .catch(error =>{
    next(error);
  });
});

router.get('/:url', (req, res, next) => {
  const url = req.params.url;
  Company.findOne({url:url})
  .then(company =>{
    console.log(company);
    res.render('./companylandingpage', { company, mockupData });
  })
  .catch(error =>{
    next(error);
  });
});



module.exports = router;
