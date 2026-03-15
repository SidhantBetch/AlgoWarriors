const { pool } = require('../config/db');
const { generateQuestions, evaluateAnswers } = require('../services/ai.service');

// @desc    Start Interview / Generate Questions
// @route   GET /api/interview/start/:jobId
const startInterview = async (req, res, next) => {
  try {
    const jobRes = await pool.query('SELECT * FROM jobs WHERE id = $1', [req.params.jobId]);
    const job = jobRes.rows[0];

    if (!job) {
      res.status(404);
      throw new Error('Job not found');
    }

    const generated = await generateQuestions(job.title, job.description, job.skills, job.difficulty);
    
    // Create Interview session
    const interviewRes = await pool.query(
      'INSERT INTO interviews (candidate_id, job_id, status) VALUES ($1, $2, $3) RETURNING id',
      [req.user.id, job.id, 'in_progress']
    );
    const interviewId = interviewRes.rows[0].id;

    // Save questions to DB
    const savedQuestions = [];
    for (const q of generated) {
      const qRes = await pool.query(`
        INSERT INTO questions (job_id, type, content, options, correct_answer, test_cases)
        VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, type, content, options
      `, [job.id, q.type, q.content, q.options || [], q.correct_answer || null, q.test_cases ? JSON.stringify(q.test_cases) : '[]']);
      
      const newQ = qRes.rows[0];
      savedQuestions.push(newQ);

      // Link to interview
      await pool.query('INSERT INTO interview_questions (interview_id, question_id) VALUES ($1, $2)', [interviewId, newQ.id]);
    }

    res.status(201).json({
      interviewId,
      questions: savedQuestions
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Submit Answers & Evaluate
// @route   POST /api/interview/submit/:interviewId
const submitInterview = async (req, res, next) => {
  try {
    const { answers } = req.body; 
    const interviewId = req.params.interviewId;

    const interviewRes = await pool.query('SELECT * FROM interviews WHERE id = $1', [interviewId]);
    if (interviewRes.rows.length === 0) {
      res.status(404);
      throw new Error('Interview not found');
    }

    // Fetch original questions to compare correct answers
    const questionsRes = await pool.query('SELECT * FROM questions WHERE job_id = $1', [interviewRes.rows[0].job_id]);
    const questions = questionsRes.rows;

    let totalDeterministicScore = 0;
    let correctAnswersCount = 0;
    let incorrectAnswersCount = 0;
    const codingAnswers = [];

    // Phase 1: Evaluate MCQ and NAT Deterministically
    for (const ans of answers) {
      const q = questions.find(question => question.id === ans.questionId);
      if (!q) continue;

      let score = 0;
      let feedback = "";

      if (q.type === 'mcq') {
        if (q.correct_answer && ans.answer.trim().toLowerCase() === q.correct_answer.trim().toLowerCase()) {
          score = 10;
          correctAnswersCount++;
          feedback = "Correct";
        } else {
          incorrectAnswersCount++;
          feedback = `Incorrect. Expected: ${q.correct_answer}`;
        }
        totalDeterministicScore += score;
        
        await pool.query(`
          INSERT INTO submissions (interview_id, question_id, answer, score, feedback)
          VALUES ($1, $2, $3, $4, $5)
        `, [interviewId, ans.questionId, ans.answer, score, feedback]);

      } else if (q.type === 'nat') {
        // Simple inclusion / pattern match
        if (q.correct_answer && ans.answer.toLowerCase().includes(q.correct_answer.toLowerCase())) {
          score = 10;
          correctAnswersCount++;
          feedback = "Correct pattern match";
        } else {
          incorrectAnswersCount++;
          feedback = `Incorrect pattern. Expected something like: ${q.correct_answer}`;
        }
        totalDeterministicScore += score;

        await pool.query(`
          INSERT INTO submissions (interview_id, question_id, answer, score, feedback)
          VALUES ($1, $2, $3, $4, $5)
        `, [interviewId, ans.questionId, ans.answer, score, feedback]);

      } else if (q.type === 'coding') {
        // Defer to AI
        codingAnswers.push(ans);
      }
    }

    // Phase 2: AI Evaluates Coding
    let evaluation = { totalScore: totalDeterministicScore, strengths: [], weaknesses: [], recommendation: 'pending', report: '', coding_performance: '', evaluations: [] };
    
    if (codingAnswers.length > 0) {
      evaluation = await evaluateAnswers(codingAnswers, totalDeterministicScore);
      
      // Save AI evaluation for the coding submissions
      for (const ans of codingAnswers) {
        const evalFeedback = evaluation.evaluations.find(e => e.questionId === ans.questionId);
        await pool.query(`
          INSERT INTO submissions (interview_id, question_id, answer, score, feedback)
          VALUES ($1, $2, $3, $4, $5)
        `, [interviewId, ans.questionId, ans.answer, evalFeedback ? evalFeedback.score : 0, evalFeedback ? evalFeedback.feedback : null]);
      }
    }

    // Save Result
    const resultRes = await pool.query(`
      INSERT INTO results (interview_id, total_score, correct_answers, incorrect_answers, strengths, weaknesses, recommendation, report, coding_performance)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *
    `, [
      interviewId, 
      evaluation.totalScore, 
      correctAnswersCount, 
      incorrectAnswersCount, 
      JSON.stringify(evaluation.strengths), 
      JSON.stringify(evaluation.weaknesses), 
      evaluation.recommendation, 
      evaluation.report,
      evaluation.coding_performance || null
    ]);

    await pool.query('UPDATE interviews SET status = $1 WHERE id = $2', ['completed', interviewId]);

    res.status(201).json(resultRes.rows[0]);

  } catch (error) {
    next(error);
  }
};

module.exports = { startInterview, submitInterview };
