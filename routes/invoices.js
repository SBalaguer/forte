'use strict';

const {
  Router
} = require('express');
const router = new Router();
const multer = require('multer');
const nodemailer = require('nodemailer');
const Company = require('./../models/company.js');
const Invoice = require('./../models/invoice.js');
const User = require('./../models/user.js');
const cloudinary = require('cloudinary');
const storageCloudinary = require('multer-storage-cloudinary');

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
//SETTING UP MULTER AND CLOUDINARY

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_API_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = storageCloudinary({
  cloudinary,
  folder: 'forte-company-invoice-submission',
  allowedFormats: ['pdf']
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
    vat,
    irs,
    amountToTransfer,
    dateOfCompletion,
    comment
  } = req.body;
  console.log(amountToTransfer);
  let pdfUrl = ""
  if(!req.file){
      pdfUrl = undefined;
  }else{
    pdfUrl = req.file.url
  }
  // console.log(pdfUrl);
  const companyUrl = req.params.url;
  // console.log(req.body.dateOfCompletion);
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
        amountToTransfer,
        pdf: pdfUrl,
        vat,
        irs,
        comment,
        status: 'unapproved',
        companyWorkedFor: companyId
      });
    })
    .then(invoice => {
      invoiceId = invoice._id
      res.redirect(`/${companyUrl}/submission/${invoiceId}`);
    })
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
  const invoiceId = req.params.invoiceId;
  const companyUrl = req.params.url
  let contractorEmail = "";
  Invoice.findById(invoiceId)
    .then(invoice => {
      contractorEmail = invoice.email;
      // console.log(contractorEmail);
      //console.log('This is the contractor Email:', contractorEmail)
      transporter.sendMail({
        from: `FORTE <${process.env.NODEMAIL_MAIL}>`,
        to: contractorEmail,
        subject: 'Your payment has been submited to',
        //text: 'This should be the body of the text email'
        html: `
      </style>
      <h1 style="color: Black">Thanks for using Forte!</h1>
      <a href="http://localhost:3000/invoices/view/${invoiceId}">Follow Payment Status</a>
    `
      });
    })
    .then(() => {
      res.render('./invoice/thanks', {companyUrl});
    })
    .catch(error => {
      next(error);
    });
});

{
  /* <p><strong>Follow</strong> your payment in our website</p> */
}

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
    vat,
    irs,
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
      vat,
      irs,

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
//STATUS CHANGED FROM CURRENT TO NEW

router.post('/:id/:action', (req, res, next) => {
  const id = req.params.id;
  const action = req.params.action;
  // console.log(req.session.company);
  // console.log("id: ", id, "action: ", action);
  const userId = req.session.user;
  let companyUrl = '';
  let previousStatus = '';
  User.findById(userId)
  .populate('companyId')
  .then(user => {
    companyUrl = user.companyId.url;
    return Invoice.findById(id);
  })
  .then(invoice => {
    previousStatus = invoice.status;
    return Invoice.findByIdAndUpdate(id, {
      status: action
    });
  })
  .then(() => {
    res.redirect(`/${companyUrl}/profile/${previousStatus}`);
  }).catch(err => {
    next(err);
  });
});

//******************************************************************************************
//FINDING A SINGLE INVOICE

router.get('/invoices/view/:invoiceId', (req, res, next) => {
  const invoiceId = req.params.invoiceId;
  Invoice.findById(invoiceId)
    .then(invoice => {
      res.render('./invoice/single-invoice', {
        invoice
      });
    })
    .catch(error => {
      next(error);
    });
});

//******************************************************************************************
//FINDING A SINGLE INVOICE

router.get('/invoices/:invoiceId', (req, res, next) => {
  const invoiceId = req.params.invoiceId;
  Invoice.findById(invoiceId)
    .then(invoice => {
      res.render('./dashboard/single-payment', {
        invoice
      });
    })
    .catch(error => {
      next(error);
    });
});




module.exports = router;