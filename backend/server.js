const express = require('express');
const dotenv = require('dotenv');
dotenv.config();

const cors = require('cors');
const { initializeDatabase } = require('./config/db');
const { notFound, errorHandler } = require('./middleware/error.middleware');

const app = express();

app.use(cors());
app.use(express.json());

// Init DB Tables on Startup
initializeDatabase();

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/jobs', require('./routes/job.routes'));
app.use('/api/interview', require('./routes/interview.routes'));
app.use('/api/results', require('./routes/result.routes'));

app.get('/', (req, res) => {
  res.send('AlgoWarrior Postgres API is running...');
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
