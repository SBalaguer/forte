'use strict';

const { Router } = require('express');
const router = new Router();

const Company = require('./../models/company.js');
const Invoice = require('./../models/invoice.js');

const mockupData = [
  {contractor:"joe",amount:"50",status:"approved"},
  {contractor:"ruth",amount:"30",status:"paid"},
  {contractor:"jane",amount:"100",status:"rejected"},
  {contractor:"donny",amount:"10",status:"unaproved"}
];

const isSignedIn = require('./../middleware/route-guard.js');

router.get('/:url/profile/approved', isSignedIn ,(req, res, next) => {
  //console.log('The company ID is:',req.session.company);
  const companyUrl = req.params.url;
  let comp = {};
  Company.findOne({url:companyUrl})
  .then(company =>{
    const companyId = company._id;
    comp = company;
    return Invoice.find({companyWorkedFor: companyId});
  })
  .then(invoices =>{
    //console.log(comp, invoices);
    res.render('./dashboard/approved', { comp, invoices });
  })
  .catch(error =>{
    next(error);
  });
});

router.get('/:url/profile/unnaproved', isSignedIn ,(req, res, next) => {
  //console.log('The company ID is:',req.session.company);
  res.render('./dashboard/unnaproved');
});

router.get('/:url/profile/rejected', isSignedIn ,(req, res, next) => {
  //console.log('The company ID is:',req.session.company);
  res.render('./dashboard/rejected');
});

router.get('/:url/profile/paid', isSignedIn ,(req, res, next) => {
  //console.log('The company ID is:',req.session.company);
  res.render('./dashboard/paid');
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
