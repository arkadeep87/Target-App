const express = require('express');
const quoteRoutes = require('./routes/quoteRoutes');

function createApp(deps) {
  const app = express();
  app.use(express.json());
  app.use('/api/quotes', quoteRoutes(deps));
  return app;
}

module.exports = { createApp };
