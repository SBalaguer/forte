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

const makePicRound = function(url, w){
  if (url === "https://www.amphenol-socapex.com/sites/default/files/wysiwyg/groupe_1.png"){
    return url;
  }else{
    const roundUrl = `ar_1:1,bo_0px_solid_rgb:ffffff,c_fill,co_rgb:ffffff,f_png,g_auto,r_max,${w}`
    let a = url.split('/')
    let indexOfUpload = a.indexOf('upload');
    a.splice(indexOfUpload+1,0,roundUrl);
    return a.join("/");
  }
}

router.get('/:url/settings' , isSignedIn, (req, res, next) => {
  const companyUrl = req.params.url;
  let companyId = "";
  let company = {};
  let companyProfileRound=""
  Company.findOne({url: companyUrl})
  .then(companyData =>{
    company = companyData;
    companyId = company._id;
    console.log('this is the company url logo:', company.logoUrl);
    companyProfileRound = makePicRound(company.logoUrl, "w_300");
    console.log(companyProfileRound);
    // console.log("this is the companyId", companyId);
    return User.find({companyId: companyId});
  })
  .then(usersInCompany =>{
    // console.log('company:', company);
    // console.log('users:', usersInCompany);
    res.render('./dashboard/settings', { company , usersInCompany, companyProfileRound });
  })
  .catch(error =>{
    next(error);
  });
});

//******************************************************************************************
//EDIT COMPANY ROUTE

router.post('/:url/settings/edit', isSignedIn, (req,res,next) =>{
  const { companyName, adminEmail, street, number, city, NIPC } = req.body;
  const companyUrl = req.params.url;
  let company = {};
  Company.findOneAndUpdate({url: companyUrl},{
    companyName,
    adminEmail,
    address: {
        street: street,
        number: number,
        city: city
    },
    NIPC,
  })
  .then(companyData =>{
    company = companyData;
    const companyId = company._id;
    return User.find({companyId: companyId});
  })
  .then(usersInCompany =>{
    // console.log('company:', company);
    // console.log('users:', usersInCompany);
    res.redirect(`/${companyUrl}/settings`);
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
    console.log(company);
    if (!company) {
      next(new Error('That company does not exist'));
    } else { 
      res.render('./companylandingpage', { company });
    }
  })
  .catch(error =>{
    next(error);
  });
});


module.exports = router;
