// server.js
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const cron = require('node-cron');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

app.get('/nombres', async (req, res) => {
  const result = await pool.query('SELECT * FROM nombres');
  res.json(result.rows);
});

app.post('/ciclo', async (req, res) => {
  const { id } = req.body;
  await pool.query('UPDATE nombres SET contador = contador + 1 WHERE id = $1', [id]);
  res.sendStatus(200);
});

app.post('/nuevo', async (req, res) => {
  const { nombre, hora_inicio, hora_fin } = req.body;
  await pool.query(
    'INSERT INTO nombres (nombre, hora_inicio, hora_fin) VALUES ($1, $2, $3)',
    [nombre, hora_inicio, hora_fin]
  );
  res.sendStatus(201);
});

cron.schedule('59 23 * * *', async () => {
  console.log('Reseteando contadores');
  await pool.query('UPDATE nombres SET contador = 0');
}, {
  timezone: 'America/New_York'
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Servidor activo');
});
