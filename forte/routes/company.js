'use strict';

const { Router } = require('express');
const router = new Router();

const Company = require('./../models/company.js');
const Invoice = require('./../models/invoice.js');
const User = require('./../models/user.js');

const isSignedIn = require('./../middleware/route-guard.js');

//******************************************************************************************
//DASHBOARD VIEWS

router.get('/:url/profile/:status', isSignedIn, (req, res, next) => {
  //console.log('The company ID is:',req.session.company);
  const companyUrl = req.params.url;
  const invoiceStatus = req.params.status;
  const userId = req.session.user;
  // console.log(userId);
  let user = {};
  User.findById(userId)
  .populate('companyId')
  .then(userAndCompany => {
    user = userAndCompany;
    // console.log('this is the user: ',user);
    const companyId = user.companyId._id;
    // console.log('this is the company ID: ', companyId);
    return Invoice.find({companyWorkedFor: companyId, status: invoiceStatus});
  })
  .then(invoices =>{
    // console.log(comp, invoices);
    switch (invoiceStatus) {
      case "approved":
        res.render('./dashboard/approved', { user, invoices });
        break;
      case "unapproved":
        res.render('./dashboard/unapproved', { user, invoices });
        break;
      case "rejected":
        res.render('./dashboard/rejected', { user, invoices });
        break;
      case "paid":
        res.render('./dashboard/paid', { user, invoices });
        break;
    }
  })
  .catch(error =>{
    next(error);
  });
});

//******************************************************************************************
//COMPANY SETTINGS VIEW

router.get('/:url/settings' , isSignedIn, (req, res, next) => {
  const companyUrl = req.params.url;
  let companyId = "";
  let company = {};
  Company.findOne({url: companyUrl})
  .then(companyData =>{
    company = companyData;
    companyId = company._id;
    console.log("this is the companyId", companyId);
    return User.find({companyId: companyId});
  })
  .then(usersInCompany =>{
    console.log('company:', company);
    console.log('users:', usersInCompany);
    res.render('./dashboard/settings', { company , usersInCompany });
  })
  .catch(error =>{
    next(error);
  });
});


//******************************************************************************************
//COMPANY URL VIEW

router.get('/:url', (req, res, next) => {
  const url = req.params.url;
  Company.findOne({url:url})
  .then(company =>{
    // console.log(company);
    res.render('./companylandingpage', { company });
  })
  .catch(error =>{
    next(error);
  });
});


module.exports = router;
