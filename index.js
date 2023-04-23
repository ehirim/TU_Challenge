const express = require('express');
const mongoose = require('mongoose');
const { nanoid } = require('nanoid');
const qr = require('qrcode');
const yup = require('yup');
const fs = require('fs');

const app = express();

// Connect to Mongoose
mongoose.connect('mongodb://localhost:27017/test', { useNewUrlParser: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', function() {
  console.log('Connected to MongoDB.');
});


// schema for a sample collection
const SampleSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    phoneNumber: integer,
    email: String,
    message: String
  });
  
  // model for the sample collection
  const SampleModel = mongoose.model('Sample', SampleSchema);

// schema for validating user data
const userSchema = yup.object().shape({
    firstName: yup.string().required(),
    lastName: yup.string().required(),
    phoneNumber: yup.number().positive().integer().max(11).required(),
    email: yup.string().email(new RegExp('/\.com$/')).required(),
    message: yup.string().required()
  });


// Sample user data to validate
const user = {
    firstName: 'John',
    lastName: 'Williams',
    phoneNumber: 08031356723,
    email: 'john@example.com',
    message: 'Top Universe is awesome!',
  };
  
  // Validate the user data using the schema
  userSchema.validate(user)
    .then(validUser => console.log(validUser))
    .catch(err => console.log(err));


// Define a schema for the data to be saved
const DataSchema = new mongoose.Schema({
  field1: String,
  field2: String,
  field3: integer,
  field4: String,
  field5: String
});

// Define a model for the data to be saved
const DataModel = mongoose.model('Data', DataSchema);

// Define a route to handle post requests
app.post('/users', async (req, res) => {
    try {
      // Save the data to the database
      const data = new DataModel(req.body);
      await data.save();
  
      // Generate a unique ID and QR code
      const id = nanoid(7);
      const qrDataUrl = await qr.toDataURL('http://bus.me/' + id);
  
      // Return a JSON response with the link containing the unique ID
      const response = {
        link: 'http://bus.me/' + id,
        qrCode: qrDataUrl,
      };
      res.json(response);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error.' });
    }
  });

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}.`));
