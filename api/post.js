const express = require('express');
const db = require('../db');
const app = express();

app.use(express.json());

app.post('/api/post', async (req, res) => {
  const { name, email, age, job, city } = req.body;

  try {
    const result = await db.query(
      'INSERT INTO users (name, email, age, job, city) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, email, age, job, city]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = app;
