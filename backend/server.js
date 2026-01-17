const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Povezivanje s MySQL bazom
const db = mysql.createConnection({
  host: 'ucka.veleri.hr',
  user: 'mpintar',
  password: '11',
  database: 'mpintar'
});

db.connect(err => {
    if (err) {
        console.error('Greška kod povezivanja s bazom:', err);
        return;
    }
    console.log('Povezano na bazu koncerti!');
});

// Root endpoint
app.get('/', (req, res) => {
    res.send('Backend radi! Za koncerte posjeti /koncerti');
});

// Dohvat svih koncerata
app.get('/koncerti', (req, res) => {
    db.query('SELECT * FROM koncerti', (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
    });
});

// Dohvat jednog koncerta po ID‑u
app.get('/koncerti/:id', (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM koncerti WHERE id = ?', [id], (err, results) => {
        if (err) return res.status(500).json({ error: err });
        if (results.length === 0) return res.status(404).json({ error: 'Koncert nije pronađen' });
        res.json(results[0]);
    });
});

// Dodavanje koncerta
app.post('/koncerti', (req, res) => {
    const { naziv, cijena, broj_karata, datum, vrijeme, mjesto } = req.body;

    // Osnovne provjere minimalno
    if (!naziv || cijena <= 0) {
        return res.status(400).json({ error: 'Neispravan naziv ili cijena!' });
    }

    db.query(
        'INSERT INTO koncerti (naziv, cijena, broj_karata, datum, vrijeme, mjesto) VALUES (?, ?, ?, ?, ?, ?)',
        [naziv, cijena, broj_karata, datum, vrijeme, mjesto],
        (err, result) => {
            if (err) return res.status(500).json({ error: err });
            res.json({ id: result.insertId });
        }
    );
});

// Ažuriranje koncerta
app.put('/koncerti/:id', (req, res) => {
    const { id } = req.params;
    const { naziv, cijena, broj_karata, datum, vrijeme, mjesto } = req.body;

    db.query(
        'UPDATE koncerti SET naziv=?, cijena=?, broj_karata=?, datum=?, vrijeme=?, mjesto=? WHERE id=?',
        [naziv, cijena, broj_karata, datum, vrijeme, mjesto, id],
        (err) => {
            if (err) return res.status(500).json({ error: err });
            res.json({ message: 'Koncert ažuriran' });
        }
    );
});

// Brisanje koncerta
app.delete('/koncerti/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM koncerti WHERE id=?', [id], (err) => {
        if (err) return res.status(500).json({ error: err });
        res.json({ message: 'Koncert izbrisan' });
    });
});

// Pokretanje servera
app.listen(3000, () => {
    console.log('Server radi na portu 3000');
});
