'use strict';

const { Router } = require('express');
const router = new Router();
const multer = require('multer');
const nodemailer = require('nodemailer');
const Company = require('./../models/company.js');
const Invoice = require('./../models/invoice.js');

const mockupData = [
  {contractor:"joe",amount:"50",status:"approved"},
  {contractor:"ruth",amount:"30",status:"paid"},
  {contractor:"jane",amount:"100",status:"rejected"},
  {contractor:"donny",amount:"10",status:"unaproved"}
];

//******************************************************************************************
//SETING UP NODEMAILER
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.NODEMAIL_MAIL,
      pass: process.env.NODEMAIL_PASSWORD
    }
  });


//******************************************************************************************
//SETTING UP MULTER
const storage = multer.diskStorage({
    destination: (req, file, callback) => {
      callback(null, '/tmp');
    },
    filename: (req, file, callback) => {
    //   console.log(file);
      callback(null, file.originalname);
    }
  });
  
  const uploader = multer({
    storage
  });

//******************************************************************************************
//SETTING UP SUBMISSION ROUTES
router.get('/:url/submission' ,(req, res, next) => {
  //console.log('The company ID is:',req.session.company);
  const companyUrl = req.params.url;
  Company.findOne({url:companyUrl})
  .then(company =>{
    //console.log('This is the logged in company', company);
    res.render('./submission', { company });
  })
  .catch(error =>{
    next(error);
  });
});

router.post('/:url/submission', uploader.single('pdf') ,(req,res,next) =>{
    // res.redirect('/');
    const { contractorName, email, cellphone, iban, jobDescription, hiredByPerson, amountDue, dateOfCompletion, comment} = req.body;
    const companyUrl = req.params.url;
    //console.log(req.body, req.file);
    let companyId = "";
    Company.findOne({url: companyUrl})
    .then(company =>{
      companyId = company._id;
      return Invoice.create({
        contractorName,
        email,
        cellphone,
        iban,
        jobDescription,
        hiredByPerson,
        amountDue,
        dateOfCompletion,
        vat:{
            chargeVat: req.body.chargeVat,
            rate: 18
        },
        irs:{
            retention: req.body.retainIrs,
            rate: 25
        },
        comment,
        pdf: req.file.path,
        status: 'unapproved',
        companyWorkedFor: companyId
      });
    })
    .then(company => {
        res.redirect(`/${company.url}/profile`);
    })
    .then(
      transporter.sendMail({
      from: `FORTE <${process.env.NODEMAIL_MAIL}>`,
      to: req.body.email,
      subject: 'Your payment has been submited to',
      //text: 'This should be the body of the text email'
      html: `
        </style>
        <h1 style="color: Black">Thanks for using Forte!</h1>
        <p><strong>Follow</strong> your payment in our website</p>
      `
    }))
    .catch(error => {
      next(error);
    });
});



module.exports = router;