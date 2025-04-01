CREATE TABLE IF NOT EXISTS nombres (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  contador INT DEFAULT 0,
  actualizado TIMESTAMP DEFAULT NOW()
);
