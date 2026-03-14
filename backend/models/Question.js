const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
  },
  type: {
    type: String,
    enum: ['mcq', 'coding', 'conceptual'],
    required: true,
  },
  content: {
    type: String, // The actual question text or prompt
    required: true,
  },
  options: [{
    type: String, // For MCQs
  }],
  correct_answer: {
    type: String, // The expected answer for MCQ or reference for conceptual
  },
  test_cases: [{ // For Coding questions
    input: String,
    expected_output: String,
  }],
}, { timestamps: true });

module.exports = mongoose.model('Question', questionSchema);
