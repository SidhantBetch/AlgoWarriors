const { pool } = require('../config/db');

// @desc    Get Candidate / Recruiter Results
// @route   GET /api/results
const getResults = async (req, res, next) => {
  try {
    let queryArgs = [];
    let queryStr = `
      SELECT r.*, 
             u.name as candidate_name, u.email as candidate_email,
             j.title as job_title
      FROM results r
      JOIN interviews i ON r.interview_id = i.id
      JOIN users u ON i.candidate_id = u.id
      JOIN jobs j ON i.job_id = j.id
    `;

    if (req.user.role === 'candidate') {
      queryStr += ` WHERE i.candidate_id = $1`;
      queryArgs.push(req.user.id);
    } else {
      queryStr += ` WHERE j.recruiter_id = $1`;
      queryArgs.push(req.user.id);
    }

    const { rows } = await pool.query(queryStr, queryArgs);
    
    // Format response
    const formatted = rows.map(r => ({
      id: r.id,
      totalScore: r.total_score,
      recommendation: r.recommendation,
      report: r.report,
      strengths: r.strengths,
      weaknesses: r.weaknesses,
      interview: {
        id: r.interview_id,
        candidate: { name: r.candidate_name, email: r.candidate_email },
        job: { title: r.job_title }
      }
    }));

    res.json(formatted);
  } catch (error) {
    next(error);
  }
};

module.exports = { getResults };
