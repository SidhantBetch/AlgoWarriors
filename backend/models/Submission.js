const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  interview: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Interview',
    required: true,
  },
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true,
  },
  answer: {
    type: String,
    required: true,
  },
  score: {
    type: Number,
    default: 0,
  },
  feedback: {
    type: String,
  }
}, { timestamps: true });

module.exports = mongoose.model('Submission', submissionSchema);
