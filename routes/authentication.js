'use strict';

const { Router } = require('express');
const router = new Router();
const bcryptjs = require('bcryptjs');
const Company = require('./../models/company.js');
const User = require('./../models/user.js');
const multer = require('multer');
const nodemailer = require('nodemailer');
const cloudinary = require('cloudinary');
const storageCloudinary = require('multer-storage-cloudinary');

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
  folder: 'forte-company-profile-pic',
  allowedFormats: ['jpg', 'png']
});

const uploader = multer({
  storage
});

//******************************************************************************************
//SIGN-UP ROUTES
router.get('/sign-up', (req, res, next) => {
  res.render('sign-up');
});

router.post('/sign-up', uploader.single('companyLogo') ,(req,res,next) =>{
    // res.redirect('/');
    const { companyName, adminEmail, password, url, street, number, city, NIPC } = req.body;
    //console.log(req.body, req.file);
    const token = generateId(14);
    let passHash = ''
    let fullCompany={};
    let logoUrl = ""
    if(!req.file){
        logoUrl = undefined;
      }else{
        logoUrl = req.file.url
      }
    // console.log(url);
    bcryptjs
    .hash(password, 10)
    .then(hash => {
      passHash = hash;
      return Company.create({
        companyName,
        passwordHash: hash,
        adminEmail,
        url,
        logoUrl,
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
    .then(company =>{
      const companyId = company._id;
      fullCompany = company;
      return User.create({
        name: companyName,
        email: adminEmail,
        role: 'Administrator',
        companyId,
        passwordHash: passHash,
        verificationStatus: false,
        verificationToken: token
      });
    })
    .then(user => {
        req.session.user = user._id;
        // console.log('Created user', company);
        res.redirect(`/${fullCompany.url}/profile/approved`);
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
        <a href="https://ironhack-forte.herokuapp.com/confirm/${token}">Confirm email</a>
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
  let userId;
  let userRole;
  let companyUrl;
  User.findOne({email: adminEmail})
  .populate('companyId')
  .then(user =>{
    // console.log(user);
    if (user) {
      userId = user._id;
      userRole = user.role;
      companyUrl = user.companyId.url;
      // console.log('This is the info of the user logging-in',userId, companyUrl);
      return bcryptjs.compare(password, user.passwordHash);
    } else {
        return Promise.reject(new Error('Username does not exist.')); 
    }
  })
  .then(response => {
    if (response) {
        // console.log('user has loggedin');
        req.session.user = userId;
        switch(userRole){
          case "Administrator":
            res.redirect(`/${companyUrl}/profile/approved`);
            break;
          case "Payer":
            res.redirect(`/${companyUrl}/profile/approved`);
            break;
          case "Controller":
            res.redirect(`/${companyUrl}/profile/unapproved`);
            break;
        }
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
  // console.log(confirmationToken);
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
        // console.log(req.company);
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

router.post('/:url/sign-out', (req,res,next) =>{
  const companyUrl = req.params.url;
  req.session.destroy();
  res.redirect(`/${companyUrl}`);
});



module.exports = router;
