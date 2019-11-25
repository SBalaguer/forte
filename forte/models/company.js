'use strict';

const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  companyName: {
    type: String,
    trim: true,
    required: true
  },
  adminEmail: {
    type: String,
    lowercase: true,
    trim: true,
    required: true
  },
  passwordHash: {
      type: String,
      required: true
  },
  verificationStatus: {
      type: Boolean
  },
  verificationToken:{
      type: String
  },
  url: {
      type: String,
      required: true
  },
  address:{
    street: {
        type: String
    },
    number:{
        type: Number
    },
    city: {
        type: String
    },
    country: {
        type: String
    }
  },
  fiscalNumber:{
        type: Number,
        required: true
    },
  logoUrl:{
        type: String,
        default: "https://www.amphenol-socapex.com/sites/default/files/wysiwyg/groupe_1.png"
    },
  timestamps: true
});

module.exports = mongoose.model('Company', schema);