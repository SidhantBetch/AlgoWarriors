const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
});

const initializeDatabase = async () => {
  const client = await pool.connect();
  try {
    console.log("Initializing database tables if not exist...");
    
    // Enable uuid-ossp extension for UUID generation
    await client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

    // Users
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'candidate',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Jobs
    await client.query(`
      CREATE TABLE IF NOT EXISTS jobs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        skills TEXT[] DEFAULT '{}',
        difficulty VARCHAR(50) DEFAULT 'medium',
        recruiter_id UUID REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Questions
    await client.query(`
      CREATE TABLE IF NOT EXISTS questions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        content TEXT NOT NULL,
        options TEXT[] DEFAULT '{}',
        correct_answer TEXT,
        test_cases JSONB DEFAULT '[]',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Interviews
    await client.query(`
      CREATE TABLE IF NOT EXISTS interviews (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        candidate_id UUID REFERENCES users(id) ON DELETE CASCADE,
        job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Interview Questions (Many-to-Many mapping)
    await client.query(`
      CREATE TABLE IF NOT EXISTS interview_questions (
        interview_id UUID REFERENCES interviews(id) ON DELETE CASCADE,
        question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
        PRIMARY KEY (interview_id, question_id)
      );
    `);

    // Submissions
    await client.query(`
      CREATE TABLE IF NOT EXISTS submissions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        interview_id UUID REFERENCES interviews(id) ON DELETE CASCADE,
        question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
        answer TEXT NOT NULL,
        score INTEGER DEFAULT 0,
        feedback TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Results
    await client.query(`
      CREATE TABLE IF NOT EXISTS results (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        interview_id UUID REFERENCES interviews(id) ON DELETE CASCADE,
        total_score INTEGER DEFAULT 0,
        correct_answers INTEGER DEFAULT 0,
        incorrect_answers INTEGER DEFAULT 0,
        strengths JSONB,
        weaknesses JSONB,
        recommendation VARCHAR(50),
        report TEXT,
        coding_performance TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log("Database initialized successfully!");
  } catch (error) {
    console.error("Database initialization failed:", error);
  } finally {
    client.release();
  }
};

module.exports = { pool, initializeDatabase };
