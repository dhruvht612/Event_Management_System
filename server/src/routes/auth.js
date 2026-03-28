const express = require('express');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const { v4: uuidv4 } = require('uuid');
const { z } = require('zod');
const { getDb } = require('../db/init');
const { signToken, authRequired } = require('../middleware/auth');

const router = express.Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
  organization: z.string().optional(),
  role: z.enum(['attendee', 'organizer']).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

function userRowToPublic(row) {
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    organization: row.organization,
    role: row.role,
    membershipTier: row.membership_tier,
    avatarUrl: row.avatar_url,
  };
}

router.post('/register', (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const { email, password, name, organization, role } = parsed.data;
  const db = getDb();
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    return res.status(409).json({ error: 'Email already registered' });
  }
  const id = uuidv4();
  const hash = bcrypt.hashSync(password, 12);
  const userRole = role === 'organizer' ? 'organizer' : 'attendee';
  db.prepare(
    `INSERT INTO users (id, email, password_hash, name, organization, role) VALUES (?,?,?,?,?,?)`
  ).run(id, email, hash, name, organization || '', userRole);
  const token = signToken({ sub: id });
  const user = db
    .prepare(
      'SELECT id, email, name, organization, role, membership_tier, avatar_url FROM users WHERE id = ?'
    )
    .get(id);
  res.status(201).json({ token, user: userRowToPublic(user) });
});

router.post('/login', (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const { email, password } = parsed.data;
  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || !user.password_hash) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  if (!bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = signToken({ sub: user.id });
  res.json({
    token,
    user: userRowToPublic(user),
  });
});

router.get('/me', authRequired, (req, res) => {
  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  const events = db
    .prepare(
      `SELECT e.id, e.title, e.start_at, r.status, r.ticket_code
       FROM registrations r
       JOIN events e ON e.id = r.event_id
       WHERE r.user_id = ? AND r.status != 'cancelled'
       ORDER BY e.start_at DESC`
    )
    .all(req.user.id);
  res.json({
    user: userRowToPublic(user),
    registeredEvents: events,
  });
});

function configurePassport() {
  const clientID = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const callbackURL = process.env.GOOGLE_CALLBACK_URL;
  if (!clientID || !clientSecret || !callbackURL) {
    return;
  }
  passport.use(
    new GoogleStrategy(
      {
        clientID,
        clientSecret,
        callbackURL,
      },
      (accessToken, refreshToken, profile, done) => {
        done(null, profile);
      }
    )
  );
}

configurePassport();

router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/api/auth/google/fail' }),
  (req, res) => {
    const profile = req.user;
    const email = profile.emails?.[0]?.value;
    const name = profile.displayName || email;
    const googleId = profile.id;
    const avatar = profile.photos?.[0]?.value;
    if (!email) {
      return res.redirect(`${process.env.CLIENT_URL}/login?error=no_email`);
    }
    const db = getDb();
    let user = db.prepare('SELECT * FROM users WHERE google_id = ?').get(googleId);
    if (!user) {
      user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
      if (user) {
        db.prepare('UPDATE users SET google_id = ?, avatar_url = COALESCE(avatar_url, ?) WHERE id = ?').run(
          googleId,
          avatar,
          user.id
        );
        user = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);
      } else {
        const id = uuidv4();
        db.prepare(
          `INSERT INTO users (id, email, name, google_id, avatar_url) VALUES (?,?,?,?,?)`
        ).run(id, email, name, googleId, avatar || null);
        user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
      }
    }
    const token = signToken({ sub: user.id });
    const client = process.env.CLIENT_URL || 'http://localhost:5173';
    res.redirect(`${client}/auth/callback#token=${encodeURIComponent(token)}`);
  }
);

router.get('/google/fail', (req, res) => {
  res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=google`);
});

module.exports = router;
