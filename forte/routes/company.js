'use strict';

const { Router } = require('express');
const router = new Router();

const Company = require('./../models/company.js');
const Invoice = require('./../models/invoice.js');
const User = require('./../models/user.js');

const isSignedIn = require('./../middleware/route-guard.js');

//******************************************************************************************
//DASHBOARD VIEWS

router.get('/:url/profile/:status', isSignedIn ,(req, res, next) => {
  //console.log('The company ID is:',req.session.company);
  const companyUrl = req.params.url;
  const invoiceStatus = req.params.status;
  let comp = {};
  Company.findOne({url:companyUrl})
  .then(company =>{
    const companyId = company._id;
    comp = company;
    return Invoice.find({companyWorkedFor: companyId, status: invoiceStatus});
  })
  .then(invoices =>{
    //console.log(comp, invoices);
    switch (invoiceStatus) {
      case "approved":
        res.render('./dashboard/approved', { comp, invoices });
        break;
      case "unapproved":
        res.render('./dashboard/unapproved', { comp, invoices });
        break;
      case "rejected":
        res.render('./dashboard/rejected', { comp, invoices });
        break;
      case "paid":
        res.render('./dashboard/paid', { comp, invoices });
        break;
    }
  })
  .catch(error =>{
    next(error);
  });
});

//******************************************************************************************
//COMPANY SETTINGS VIEW

router.get('/:url/settings', isSignedIn , (req, res, next) => {
  // const companyUrl = req.params.url;
  const companyId = (req.session.company);
  let usersInCompany = {};
  User.find({companyId: companyId})
  .then(usersList =>{
    usersInCompany = usersList;
    return Company.findById(companyId);
  })
  .then(company => {
    res.render('./dashboard/settings', { company, usersInCompany });
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
