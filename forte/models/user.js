'use strict';

const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  name: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    lowercase: true,
    trim: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  role:{
    type: String,
    enum: ['Payer', 'Controller', 'Admin']
  },
  companyId:{
    type: mongoose.Types.ObjectId,
    required: true,
    ref: 'Company'
  },
  verificationStatus: {
    type: Boolean
  },
  verificationToken:{
      type: String
  },
  profilePicUrl:{
    type: String,
    default: "https://www.trzcacak.rs/myfile/detail/508-5082157_black-circle-png-shadow-default-profile-picture-round.png"
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', schema);
