const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/personDB')
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Error connecting to MongoDB:', err));

// Define a Mongoose schema and model
const personSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  age: { type: Number, required: true },
});

const Person = mongoose.model('Person', personSchema);

// Serve the static HTML file
app.use(express.static('public'));

// Handle POST requests to /save
app.post('/save', async (req, res) => {
  try {
    const { name, email, age } = req.body;

    // Validate the data
    if (!name || !email || !age) {
      return res.status(400).send('All fields are required!');
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).send('Invalid email format!');
    }

    if (isNaN(age) || age <= 0) {
      return res.status(400).send('Age must be a positive number!');
    }

    // Create and save the new person
    const newPerson = new Person({ name, email, age });
    await newPerson.save();

    // Success response
    res.status(201).send('Details saved successfully');
  } catch (error) {
    if (error.code === 11000) {
      // Handle duplicate email error
      return res.status(400).send('Email already exists!');
    }
    console.error('Error saving data:', error);
    
    res.status(500).send('Error saving data');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
