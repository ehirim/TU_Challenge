const express = require('express');
const mongoose = require('mongoose');

const randomstring = require('randomstring');

const qr = require('qrcode');
const yup = require('yup');
const fs = require('fs');

const app = express();
app.use(express.json());

// Connect to our database using mongoose
mongoose.connect('mongodb://localhost:27017/donwilly', { useNewUrlParser: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', function() {
  console.log('Connected to MongoDB.');
});


// schema for a sample collection
const DataSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    phoneNumber: Number,
    email: String,
    message: String
  });
  
  // Define a model for the data to be saved
  const DataModel = mongoose.model('links', DataSchema);
  
  

    // schema for validating user data
    const RequestSchema = yup.object().shape({
        firstName: yup.string().required(),
        lastName: yup.string().required(),
        phoneNumber: yup.number().required(),
        email: yup.string().matches(/@.*\.com$/, {message: 'Must be a valid .com email address.'}).required(),
        message: yup.string().required()
      });


// Define a route to handle post requests
app.post('/users', async (req, res) => {
    try {
		// TODO:
		// data validation

		const isValid = await RequestSchema.validate(req.body)
		if(!isValid) {
		  throw new Error(RequestSchema.validate.error);
		}
		
	  // Save the data to the database
      const data = new DataModel(req.body);
      await data.save();
  
      // Generate a unique ID and QR code
      const id = randomstring.generate(7);
      const qrDataUrl = await qr.toDataURL('http://bus.me/' + id);
  
      // Return a JSON response with the link containing the unique ID
      const response = {
        link: 'http://bus.me/' + id,
        qrCode: qrDataUrl,
      };
      res.json(response);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  });

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}.`));
