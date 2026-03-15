const { pool } = require('../config/db');

// @desc    Get all jobs
// @route   GET /api/jobs
const getJobs = async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT j.*, u.name as recruiter_name, u.email as recruiter_email 
      FROM jobs j 
      JOIN users u ON j.recruiter_id = u.id
    `);
    
    // Format output
    const jobs = result.rows.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      skills: row.skills,
      difficulty: row.difficulty,
      recruiter: {
        id: row.recruiter_id,
        name: row.recruiter_name,
        email: row.recruiter_email
      },
      created_at: row.created_at
    }));

    res.json(jobs);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new job
// @route   POST /api/jobs
const createJob = async (req, res, next) => {
  try {
    const { title, description, skills, difficulty } = req.body;

    const result = await pool.query(`
      INSERT INTO jobs (title, description, skills, difficulty, recruiter_id) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING *
    `, [title, description, skills || [], difficulty || 'medium', req.user.id]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

module.exports = { getJobs, createJob };
