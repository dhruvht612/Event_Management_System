require('dotenv').config();
const http = require('http');
const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const passport = require('passport');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

const { migrate } = require('./db/init');
const { webhookRouter, router: paymentsRouter } = require('./routes/payments');

migrate();

const app = express();
const server = http.createServer(app);

const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
const io = new Server(server, {
  cors: { origin: clientUrl, methods: ['GET', 'POST'] },
});

function getJwtSecret() {
  const s = process.env.JWT_SECRET;
  if (!s && process.env.NODE_ENV === 'production') throw new Error('JWT_SECRET required');
  return s || 'dev-only-secret-change-me';
}

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) {
    socket.userId = null;
    return next();
  }
  try {
    const decoded = jwt.verify(token, getJwtSecret());
    socket.userId = decoded.sub;
    next();
  } catch {
    socket.userId = null;
    next();
  }
});

io.on('connection', (socket) => {
  socket.on('join:event', (eventId) => {
    if (!eventId || typeof eventId !== 'string') return;
    socket.join(`event:${eventId}`);
  });
  socket.on('leave:event', (eventId) => {
    if (eventId) socket.leave(`event:${eventId}`);
  });
});

app.set('io', io);

app.use('/api/stripe/webhook', webhookRouter());

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(
  cors({
    origin: clientUrl,
    credentials: true,
  })
);
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(passport.initialize());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

app.get('/api/health', (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/events', require('./routes/events'));
app.use('/api', require('./routes/registrations'));
app.use('/api/payments', paymentsRouter);
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/share', require('./routes/share'));
app.use('/api/recommendations', require('./routes/recommendations'));
app.use('/api/organizer', require('./routes/organizer'));
app.use('/api/calendar', require('./routes/calendar'));
app.use('/api/admin', require('./routes/admin'));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

const port = Number(process.env.PORT || 4000);
server.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
