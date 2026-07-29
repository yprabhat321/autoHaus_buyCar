const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const authRoutes = require('./routes/authRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const { errorHandler, notFound } = require('./middleware/errorHandler');

/**
 * The Express app is built in its own module (separate from server.js,
 * which owns the DB connection + `listen()` call). This lets Supertest
 * import `app` directly in integration tests without opening a real
 * network port or requiring a live server process.
 */
const createApp = () => {
  const app = express();

  app.use(cors());
  app.use(express.json());
  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
  }

  app.get('/api/health', (req, res) => {
    res.status(200).json({ success: true, message: 'API is healthy' });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/vehicles', vehicleRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
};

module.exports = createApp;
