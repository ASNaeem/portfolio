const express = require('express');
const db = require('./dbConfig');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 3307;
app.use(express.static(path.join(__dirname, 'public')));
//connecting to mysql
db.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL Database');
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//api for visitor counter
app.get('/visit', (req, res) => {
  db.query('UPDATE visit_counter SET count = count + 1', err => {
    if (err) {
      return res.status(500).send('Error updating visit count');
    }

    db.query('SELECT count FROM visit_counter', (err, results) => {
      if (err) {
        return res.status(500).send('Error retrieving visit count');
      }
      const visitCount = results[0].count;
      console.log('Visit count:', visitCount);  // Log visit count to the console
      res.json({ visitCount });
    });
  });
});
//api for projects
app.get('/projects', (req, res) => {
    db.query('SELECT * FROM projects', (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

//api for messages

app.post('/guestbook', (req, res) => {
    const { name, email, message, message_type } = req.body;

    if (!name || !message || !message_type) {
        console.log(name, message, message_type)
        return res.status(400).json({ error: 'Name, message, and message type are required.' });
    }
    const emailValue = email ? email : null;
    const query = 'INSERT INTO messages (name, email, message, message_type) VALUES (?, ?, ?, ?)';
    db.query(query, [name, emailValue, message, message_type], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database insertion error' });
        }
        res.status(201).json({ message: 'Entry added successfully!' });
    });
});

app.get('/guestbook', (req, res) => {
    db.query('SELECT * FROM messages WHERE message_type = "guestbook" ORDER BY mtime DESC', (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database query error' });
        }
        res.json(results);
    });
});
app.listen(PORT, () => {
    console.log('Server running on port ${PORT}');


});
