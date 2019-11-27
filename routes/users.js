'use strict';

const { Router } = require('express');
const router = new Router();

const Company = require('./../models/company.js');
const Invoice = require('./../models/invoice.js');
const User = require('./../models/user.js');
const bcryptjs = require('bcryptjs');
const nodemailer = require('nodemailer');

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
//SETING UP RANDOM GENERATOR
const createRandom = (length) => {
    const characters =
      '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let token = '';
    for (let i = 0; i < length; i++) {
      token += characters[Math.floor(Math.random() * characters.length)];
    }
    return token;
};

// const isSignedIn = require('./../middleware/route-guard.js');

//******************************************************************************************
//SETING UP USER CREATOR
router.post('/:url/settings/new-user',(req,res,next) =>{
    let companyId = "";
    const companyUrl = req.params.url;
    const firstPass = createRandom(6);
    let hashPass = "";
    const verificationToken = createRandom(14);
    const {
        name,
        email,
        role
      } = req.body;
    // console.log(req.body);
    bcryptjs
    .hash(firstPass, 10)
    .then(hash =>{
      hashPass = hash
      return Company.findOne({url: companyUrl})
    })
    .then(company =>{
      companyId = company._id;
      console.log(companyId)
      return User.create({
        name,
        email,
        role,
        companyId,
        passwordHash: hashPass,
        verificationStatus: false,
        verificationToken: verificationToken
      });
    })
    .then((newUser) =>{
        // console.log(newUser);
        transporter.sendMail({
            from: `FORTE <${process.env.NODEMAIL_MAIL}>`,
            to: req.body.email,
            subject: 'Welcome to Forte!',
            //text: 'This should be the body of the text email'
            html: `
              </style>
              <h1 style="color: Black">Welcome to forte!</h1>
              <p>A new account has been created for you.</p>
              <p>Please <strong>Confirm</strong> your email down here. Once logged-in, please change your password!</p>
              <a href="http://localhost:3000/users/confirm/${verificationToken}">Confirm email</a>
              <p>Temporary Password: ${firstPass}</p>
            `
        });
        req.session.user = newUser._id;
        res.redirect(`/${companyUrl}/settings`);
    })
    .catch(error =>{
        next(error);
    });
});

//******************************************************************************************
//SETING UP EMAIL-CONFIRMATION ROUTE CREATOR

router.get('/users/confirm/:token', (req,res,next) =>{
    const confirmationToken = req.params.token;
    // console.log(confirmationToken);
    User.findOneAndUpdate({ verificationToken: confirmationToken }, {
      verificationStatus: true
    })
      .then(user => {
        // console.log('you are confirmed my friend!');
        // console.log(company);
        if (!user) {
          return Promise.reject(new Error("There's no user with that email."));
        } else {
          // req.session.user = user._id
          req.user = user;
          res.locals.user = req.user;
          //console.log(req.company);
          res.render('./user/success-log-in');
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

//******************************************************************************************
//DELETING USERS

router.post('/users/delete/:id', (req,res,next) =>{
  const userId = req.params.id;
  let companyUrl = "";
  User.findById(userId)
  .populate("companyId")
  .then(user =>{
    companyUrl = user.companyId.url
    return User.findByIdAndDelete(userId)
  })
  .then(()=>{
    console.log('A user has been deleted')
    res.redirect(`/${companyUrl}/settings`);
  })
  .catch(error =>{
    next(error);
  });
});



module.exports = router;