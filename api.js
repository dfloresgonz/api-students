const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

const app = express();
const PORT = 8001;

// Middleware para parsear JSON y datos de formularios
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Conexión a la base de datos SQLite
const db = new sqlite3.Database('./students.sqlite', (err) => {
  if (err) {
    console.error('Error connecting to SQLite database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// Crear tabla si no existe
db.run(
  `CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    firstname TEXT NOT NULL,
    lastname TEXT NOT NULL,
    gender TEXT NOT NULL,
    age INTEGER NOT NULL
  )`
);

// Obtener todos los estudiantes
app.get('/students', (req, res) => {
  const query = 'SELECT * FROM students';
  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: 'Error fetching students.' });
    } else {
      res.status(200).json(rows);
    }
  });
});

// Crear un estudiante
app.post('/students', (req, res) => {
  const { firstname, lastname, gender, age } = req.body;
  const query = 'INSERT INTO students (firstname, lastname, gender, age) VALUES (?, ?, ?, ?)';
  db.run(query, [firstname, lastname, gender, age], function (err) {
    if (err) {
      res.status(500).json({ error: 'Error creating student.' });
    } else {
      res.status(201).json({ message: 'Student created successfully.', id: this.lastID });
    }
  });
});

// Obtener un estudiante por ID
app.get('/student/:id', (req, res) => {
  const query = 'SELECT * FROM students WHERE id = ?';
  db.get(query, [req.params.id], (err, row) => {
    if (err) {
      res.status(500).json({ error: 'Error fetching student.' });
    } else if (!row) {
      res.status(404).json({ error: 'Student not found.' });
    } else {
      res.status(200).json(row);
    }
  });
});

// Actualizar un estudiante por ID
app.put('/student/:id', (req, res) => {
  const { firstname, lastname, gender, age } = req.body;
  const query = 'UPDATE students SET firstname = ?, lastname = ?, gender = ?, age = ? WHERE id = ?';
  db.run(query, [firstname, lastname, gender, age, req.params.id], function (err) {
    if (err) {
      res.status(500).json({ error: 'Error updating student.' });
    } else if (this.changes === 0) {
      res.status(404).json({ error: 'Student not found.' });
    } else {
      res.status(200).json({ message: 'Student updated successfully.' });
    }
  });
});

// Eliminar un estudiante por ID
app.delete('/student/:id', (req, res) => {
  const query = 'DELETE FROM students WHERE id = ?';
  db.run(query, [req.params.id], function (err) {
    if (err) {
      res.status(500).json({ error: 'Error deleting student.' });
    } else if (this.changes === 0) {
      res.status(404).json({ error: 'Student not found.' });
    } else {
      res.status(200).json({ message: `Student with id ${req.params.id} deleted successfully.` });
    }
  });
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});