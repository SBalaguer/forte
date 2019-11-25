'use strict';

const { Router } = require('express');
const router = new Router();
const bcryptjs = require('bcryptjs');
const Company = require('./../models/company.js');

router.get('/', (req, res, next) => {
  res.render('sign-up');
});

router.post('/', (req,res,next) =>{
    // res.redirect('/');
    const { companyName, adminEmail, password, url, street, number, city, NIPC } = req.body;
    console.log(req.body);
    const token = Math.floor(Math.random()*100000000);
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
        vertifactionToken: token
      });
    })
    .then(company => {
        req.session.company = company._id;
        console.log('Created user', company);
        res.redirect('/');
    })
    .catch(error => {
      next(error);
    });
});

module.exports = router;
