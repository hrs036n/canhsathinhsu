const express = require('express');
const db = require('../db');
const app = express();

app.use(express.json());

app.put('/api/update/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, age, job, city } = req.body;

  try {
    const result = await db.query(
      'UPDATE users SET name = $1, email = $2, age = $3, job = $4, city = $5 WHERE id = $6 RETURNING *',
      [name, email, age, job, city, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = app;
