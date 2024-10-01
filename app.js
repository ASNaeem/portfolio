const express = require('express');
const cors = require('cors');
const db = require('./dbConfig');
const path = require('path');
require('dotenv').config();  // Load environment variables from .env
const app = express();

const PORT = process.env.PORT || 3300;
const HOST = process.env.HOST || 'localhost';


app.use(cors());

//Middleware for parsing JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Middleware for static files
app.use(express.static(path.join(__dirname, 'public')));

//Connecting to MySQL
db.getConnection((err) => {
    if (err) {
        console.error('Error connecting to MySQL Database: ', err);
        process.exit(1);  // Exit the process if DB connection fails
    } else {
        console.log('Connected to MySQL Database');
    }
});

//API for visitor counter
app.get('/visit', (req, res) => {
    db.query('UPDATE visit_counter SET count = count + 1', (err) => {
        if (err) return res.status(500).send('Error updating visit count');

        db.query('SELECT count FROM visit_counter', (err, results) => {
            if (err) return res.status(500).send('Error retrieving visit count');
            const visitCount = results[0].count;
            res.json({ status: 'success', visitCount });
        });
    });
});


//API for projects
app.get('/projects', (req, res) => {
    db.query('SELECT * FROM projects', (err, results) => {
        if (err) return res.status(500).json({ error: 'Database query error' });
        res.json(results);
    });
});

//API for guestbook messages
app.post('/guestbook', (req, res) => {
    console.log(`Received request at ${req.path}`);
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    const { name, email, message, message_type } = req.body;

    console.log('Request Body:', { name, email, message, message_type });

    if (!name || !message || !message_type) {
        return res.status(400).json({ error: 'Name, message, and message type are required.' });
    }
    
    const emailValue = email ? email : null;
    const query = 'INSERT INTO messages (name, email, message, message_type) VALUES (?, ?, ?, ?)';
    
    db.query(query, [name, emailValue, message, message_type], (err) => {
        if (err) {
            console.error('Database insertion error:', err);
            return res.status(500).json({ error: 'Database insertion error' });
        }
        res.status(201).json({ message: 'Entry added successfully!' });
    });
});

//API for retrieving guestbook entries
app.get('/guestbook', (req, res) => {
    db.query('SELECT * FROM messages WHERE message_type = "guestbook" ORDER BY mtime DESC', (err, results) => {
        if (err) return res.status(500).json({ error: 'Database query error' });
        res.json(results);
    });
});

//Start server
app.listen(PORT, HOST, () => {
    console.log(`Server running on http://${HOST}:${PORT}`);
});
