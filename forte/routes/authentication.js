'use strict';

const { Router } = require('express');
const router = new Router();
const bcryptjs = require('bcryptjs');
const Company = require('./../models/company.js');
const multer = require('multer');
const nodemailer = require('nodemailer');

//******************************************************************************************
//TOKEN GENERATOR FUNCTION
const generateId = length => {
  const characters =
    '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let token = '';
  for (let i = 0; i < length; i++) {
    token += characters[Math.floor(Math.random() * characters.length)];
  }
  return token;
};


// const EMAIL = 'santi.ironhack.test@gmail.com';
// const PASSWORD = 's@anti1234';

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
    // console.log(file);
    callback(null, file.originalname);
  }
});

const uploader = multer({
  storage
});

//******************************************************************************************
//SIGN-UP ROUTES
router.get('/sign-up', (req, res, next) => {
  res.render('sign-up');
});

router.post('/sign-up', uploader.single('logoUrl') ,(req,res,next) =>{
    // res.redirect('/');
    const { companyName, adminEmail, password, url, street, number, city, NIPC } = req.body;
    //console.log(req.body, req.file);
    const token = generateId(14);
    bcryptjs
    .hash(password, 10)
    .then(hash => {
      return Company.create({
        companyName,
        passwordHash: hash,
        adminEmail,
        url,
        address: {
            street: street,
            number: number,
            city: city
        },
        NIPC,
        verificationStatus: false,
        verificationToken: token
      });
    })
    .then(company => {
        req.session.company = company._id;
        // console.log('Created user', company);
        res.redirect(`/${company.url}/profile`);
    })
    .then(
      transporter.sendMail({
      from: `FORTE <${process.env.NODEMAIL_MAIL}>`,
      to: req.body.adminEmail,
      subject: 'Welcome to Forte!',
      //text: 'This should be the body of the text email'
      html: `
        </style>
        <h1 style="color: Black">Welcome to forte!</h1>
        <p><strong>Confirm</strong> your email down here:</p>
        <a href="http://localhost:3000/confirm/${token}">Confirm email</a>
      `
    }))
    .catch(error => {
      next(error);
    });
});

//******************************************************************************************
//SIGN-IN ROUTES
router.get('/sign-in', (req,res,next) =>{
  res.render('./admin/sign-in');
});

router.post('/sign-in', (req,res,next) =>{
  const { adminEmail, password } = req.body;
  console.log(req.body);
  let companyId;
  let companyUrl;
  Company.findOne({adminEmail})
  .then(company =>{
      if (company) {
        companyId = company._id;
        companyUrl = company.url;
        console.log('This is the info of the company logging-in',companyId, companyUrl);
        return bcryptjs.compare(password, company.passwordHash);
      } else {
          return Promise.reject(new Error('Username does not exist.')); 
      }
  })
  .then(response => {
      if (response) {
          console.log('user has loggedin');
          req.session.company = companyId;
          res.redirect(`/${companyUrl}/profile/approved`);
      } else {
          return Promise.reject(new Error('Wrong password.'));
      }
  })
  .catch((error) =>{
      next(error);
  });
});

//******************************************************************************************
//CHECKING TOKENS WITH E-MAILS, CREATING SESSIONS AND RE-DIRECTING TO PROFILE
//"http://localhost:3000/confirm/${token}"

router.get('/confirm/:token', (req,res,next) =>{
  const confirmationToken = req.params.token;
  console.log(confirmationToken);
  Company.findOneAndUpdate({ verificationToken: confirmationToken }, {
    verificationStatus: true
  })
    .then(company => {
      // console.log('you are confirmed my friend!');
      // console.log(company);
      if (!company) {
        return Promise.reject(new Error("There's no user with that email."));
      } else {
        // req.session.user = user._id
        req.company = company;
        res.locals.company = req.company;
        console.log(req.company);
        res.render('./admin/success-log-in', { company });
      }
    })
    .catch(error =>{
      next(error);
    })
    .finally(() =>{
      // console.log(req.session.user);
      // console.log(req.session)
    });
});



module.exports = router;
