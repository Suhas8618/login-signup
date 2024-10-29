const express = require('express');
const mysql = require('mysql');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const app = express();
const cors=require("cors");

app.use(bodyParser.json());
app.use(cors());

// Database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'login'
});

db.connect(err => {
    if (err) {
        console.error('Database connection failed:', err);
    } else {
        console.log('Connected to database');
    }
});

app.get("/",(req,res)=>[
    res.send("hello from the server")
])

// Signup endpoint
app.post('/signup', async (req, res) => {
    const { email, password } = req.body;
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the user into the database
    db.query(
        'INSERT INTO users (email, password) VALUES (?, ?)',
        [email, hashedPassword],
        (err, results) => {
            if (err) {
                return res.json({ success: false, message: 'Error registering user' });
            }
            return res.json({ success: true });
        }
    );
});

// Login endpoint
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Check if the user exists
    db.query('SELECT * FROM users WHERE email = ?', [username], async (err, results) => {
        if (err) {
            return res.json({ success: false, message: 'Error logging in' });
        }

        if (results.length > 0) {
            const user = results[0];

            // Compare password
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (isPasswordValid) {
                return res.json({ success: true, message: 'Login successful' });
            } else {
                return res.json({ success: false, message: 'Invalid password' });
            }
        } else {
            return res.json({ success: false, message: 'User not found' });
        }
    });
});

// Start the server
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
