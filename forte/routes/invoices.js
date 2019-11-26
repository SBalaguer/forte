'use strict';

const {
  Router
} = require('express');
const router = new Router();
const multer = require('multer');
const nodemailer = require('nodemailer');
const Company = require('./../models/company.js');
const Invoice = require('./../models/invoice.js');

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
router.get('/:url/submission', (req, res, next) => {
  //console.log('The company ID is:',req.session.company);
  const companyUrl = req.params.url;
  Company.findOne({
      url: companyUrl
    })
    .then(company => {
      //console.log('This is the logged in company', company);
      res.render('./submission', {
        company
      });
    })
    .catch(error => {
      next(error);
    });
});

router.post('/:url/submission', uploader.single('pdf'), (req, res, next) => {
  // res.redirect('/');
  const {
    contractorName,
    email,
    cellphone,
    iban,
    jobDescription,
    hiredByPerson,
    amountDue,
    dateOfCompletion,
    comment
  } = req.body;
  const companyUrl = req.params.url;
  console.log(req.body.dateOfCompletion);
  //console.log(req.body, req.file);
  let companyId = "";
  let invoiceId = "";
  Company.findOne({
      url: companyUrl
    })
    .then(company => {
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
        vat: {
          chargeVat: req.body.chargeVat,
          rate: 18
        },
        irs: {
          retention: req.body.retainIrs,
          rate: 25
        },
        comment,
        pdf: req.file.path,
        status: 'unapproved',
        companyWorkedFor: companyId
      });
    })
    .then(invoice => {
      invoiceId = invoice._id
      res.redirect(`/${companyUrl}/submission/${invoiceId}`);
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

//******************************************************************************************
//SETTING UP SINGLE VIEWING ROUTES

router.get('/:url/submission/:invoiceId', (req, res, next) => {
  let companyData = {};
  const companyUrl = req.params.url;
  const invoiceId = req.params.invoiceId;
  Company.findOne({
      url: companyUrl
    })
    .then(company => {
      companyData = company;
      return Invoice.findById(invoiceId);
    })
    .then(invoice => {
      res.render('./invoice/check-and-submit', {
        companyData,
        invoice
      });
    })
    .catch(error => {
      next(error);
    });
});

router.get('/:url/submission/:invoiceId/thanks', (req, res, next) => {
  res.render('./invoice/thanks');
});

//******************************************************************************************
//EDITING INVOICE
router.get('/:url/submission/:invoiceId/edit', (req, res, next) => {
  let companyData = {};
  const companyUrl = req.params.url;
  const invoiceId = req.params.invoiceId;
  Company.findOne({
      url: companyUrl
    })
    .then(company => {
      companyData = company;
      return Invoice.findById(invoiceId);
    })
    .then(invoice => {
      // console.log(companyData, invoice);
      res.render('./invoice/edit', {
        companyData,
        invoice
      });
    })
    .catch(error => {
      next(error);
    });
});

router.post('/:url/submission/:invoiceId/edit', uploader.single('pdf'), (req, res, next) => {
  const companyUrl = req.params.url;
  const invoiceId = req.params.invoiceId;
  const {
    contractorName,
    email,
    cellphone,
    iban,
    jobDescription,
    hiredByPerson,
    amountDue,
    dateOfCompletion,
    comment
  } = req.body;
  Invoice.findByIdAndUpdate(invoiceId, {
      contractorName,
      email,
      cellphone,
      iban,
      jobDescription,
      hiredByPerson,
      amountDue,
      dateOfCompletion,
      vat: {
        chargeVat: req.body.chargeVat,
        rate: 18
      },
      irs: {
        retention: req.body.retainIrs,
        rate: 25
      },
      comment,
      pdf: req.file.path
    })
    .then(() => {
      res.redirect(`/${companyUrl}/submission/${invoiceId}`);
    })
    .catch(error => {
      next(error);
    });
});

//******************************************************************************************
//DELETING INVOICE

router.post('/:url/submission/:invoiceId/delete', (req, res, next) => {
  const invoiceId = req.params.invoiceId;
  Invoice.findByIdAndDelete(invoiceId)
    .then(() => {
      console.log('Item has been removed');
      res.redirect('/');
    })
    .catch(error => {
      next(error);
    });
});
//******************************************************************************************
//status change from approved to reject

router.post('/:id/:action', (req, res, next) => {

  const id = req.params.id;
  const action = req.params.action;
  console.log("id: ", id, "action: ", action);

  Invoice.findByIdAndUpdate(id, {
    status: action
  }).then(document => {
    res.redirect('back');

  }).catch(err => {
    next(err);
  });
});






module.exports = router;