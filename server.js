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
  app.post('/nuevo', async (req, res) => {
    const { nombre, hora_inicio, hora_fin } = req.body;
  
    // Validación simple para formato HH:MM
    const timeRegex = /^\\d{2}:\\d{2}$/;
    if (!nombre || !timeRegex.test(hora_inicio) || !timeRegex.test(hora_fin)) {
      return res.status(400).send('Invalid input. Ensure name and time format HH:MM are correct.');
    }
  
    try {
      await pool.query(
        'INSERT INTO nombres (nombre, hora_inicio, hora_fin, contador) VALUES ($1, $2, $3, 0)',
        [nombre, hora_inicio, hora_fin]
      );
      res.status(201).send('Name added.');
    } catch (err) {
      console.error('Error inserting name:', err);
      res.status(500).send('Server error');
    }
  });
  
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
app.post('/ciclo', async (req, res) => {
  const { id } = req.body;
  const nombreQuery = await pool.query('SELECT nombre FROM nombres WHERE id = $1', [id]);
  const nombre = nombreQuery.rows[0]?.nombre;

  if (nombre) {
    await pool.query('UPDATE nombres SET contador = contador + 1 WHERE id = $1', [id]);
    await pool.query('INSERT INTO registro_uso (nombre_id, nombre) VALUES ($1, $2)', [id, nombre]);
    res.sendStatus(200);
  } else {
    res.status(404).send('Nombre no encontrado');
  }
});

app.get('/uso', async (req, res) => {
  const { desde, hasta } = req.query;
  const result = await pool.query(
    `SELECT nombre, COUNT(*) as conteo
     FROM registro_uso
     WHERE fecha BETWEEN $1 AND $2
     GROUP BY nombre
     ORDER BY nombre`,
    [desde, hasta]
  );
  res.json(result.rows);
});
