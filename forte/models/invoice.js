'use strict';

const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  contractorName: {
    type: String,
    trim: true,
    required: true
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
    required: true
  },
  companyWorkedFor: {
    type: String
  },
  cellphone: {
    type: String,
    required: true
  },
  iban: {
    type: String,
    lowercase: true,
    trim: true,
    required: true
  },
  jobDescription: {
    type: String,
    required: true
  },
  hiredByPerson: {
    type: String
  },
  amountDue: {
    type: Number,
    required: true
  },
  vat: {
    chargeVat: {
      type: Boolean,
      required: true
    },
    rate: {
      type: Number,
      enum: [18, 23]
    }
  },
  irs: {
    retention: {
      type: Boolean,
      required: true
    },
    rate: {
      type: Number,
      enum: [25, 30]
    }
  },
  amountToTransfer: {
    type: Number
  },
  comment: {
    type: String
  },
  pdf: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['unapproved', 'approved', 'rejected', 'paid']
  },
  dateOfCompletion: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Invoice', schema);