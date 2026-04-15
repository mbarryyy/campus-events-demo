const express = require('express');
const cors = require('cors');
const createEventsRouter = require('./routes/events');
const createAuthRouter = require('./routes/auth');
const errorHandler = require('./middleware/errorHandler');

function createApp(db) {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use('/api/auth', createAuthRouter(db));
  app.use('/api/events', createEventsRouter(db));

  app.use(errorHandler);

  return app;
}

// Start server when run directly
if (require.main === module) {
  const db = require('./db');
  const app = createApp(db);
  const PORT = process.env.PORT || 3001;

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = { createApp };
