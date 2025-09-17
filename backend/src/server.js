require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const routes = require('./routes');
const seedDatabase = require('./utils/seedDatabase');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', routes);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/fleetlink';

if (require.main === module) {
  mongoose.connect(MONGO_URI, { })
    .then(async () => {
      console.log('MongoDB connected');
      
      await seedDatabase();
      
      app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch(err => {
      console.error('MongoDB connection failed:', err);
      process.exit(1);
    });
}

module.exports = app;
