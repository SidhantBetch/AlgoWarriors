const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  interview: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Interview',
    required: true,
  },
  totalScore: {
    type: Number,
    required: true,
  },
  strengths: [{
    type: String,
  }],
  weaknesses: [{
    type: String,
  }],
  recommendation: {
    type: String,
    enum: ['strong_hire', 'hire', 'weak_hire', 'no_hire'],
    required: true,
  },
  report: {
    type: String, // detailed text report
  }
}, { timestamps: true });

module.exports = mongoose.model('Result', resultSchema);
