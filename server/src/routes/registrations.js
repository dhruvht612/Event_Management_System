const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../db/init');
const { authRequired } = require('../middleware/auth');
const { generateQrDataUrl } = require('../services/qr');
const { notifyUser } = require('../services/notifications');

const router = express.Router();

const tierRank = { free: 0, premium: 1, vip: 2 };

function canAccessEvent(userTier, exclusiveTier) {
  if (!exclusiveTier) return true;
  return tierRank[userTier] >= tierRank[exclusiveTier];
}

router.post('/events/:eventId/register', authRequired, async (req, res) => {
  const db = getDb();
  const event = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.eventId);
  if (!event) return res.status(404).json({ error: 'Event not found' });

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  if (!canAccessEvent(user.membership_tier, event.exclusive_tier)) {
    return res.status(403).json({
      error: 'Membership required',
      requiredTier: event.exclusive_tier,
    });
  }

  const existing = db
    .prepare('SELECT * FROM registrations WHERE event_id = ? AND user_id = ?')
    .get(event.id, user.id);
  if (existing && existing.status !== 'cancelled') {
    return res.status(409).json({ error: 'Already registered' });
  }

  const confirmed = db
    .prepare(`SELECT COUNT(*) as c FROM registrations WHERE event_id = ? AND status = 'confirmed'`)
    .get(event.id).c;

  let status = 'confirmed';
  if (confirmed >= event.capacity) {
    status = 'waitlist';
  }

  const ticketCode = uuidv4().replace(/-/g, '').slice(0, 12).toUpperCase();
  const qrPayload = JSON.stringify({
    e: event.id,
    u: user.id,
    t: ticketCode,
  });
  const id = uuidv4();

  if (existing && existing.status === 'cancelled') {
    db.prepare(
      `UPDATE registrations SET status = ?, ticket_code = ?, qr_payload = ?, registered_at = datetime('now') WHERE id = ?`
    ).run(status, ticketCode, qrPayload, existing.id);
  } else {
    db.prepare(
      `INSERT INTO registrations (id, event_id, user_id, status, ticket_code, qr_payload) VALUES (?,?,?,?,?,?)`
    ).run(id, event.id, user.id, status, ticketCode, qrPayload);
  }

  if (status === 'waitlist') {
    const maxPos =
      db.prepare('SELECT COALESCE(MAX(position),0) as m FROM waitlist WHERE event_id = ?').get(event.id).m;
    db.prepare(
      `INSERT INTO waitlist (id, event_id, user_id, position) VALUES (?,?,?,?)`
    ).run(uuidv4(), event.id, user.id, maxPos + 1);
  }

  const qrDataUrl = await generateQrDataUrl(qrPayload);

  db.prepare(
    `INSERT INTO engagement (user_id, event_id, points, updated_at) VALUES (?,?,?,datetime('now'))
     ON CONFLICT(user_id, event_id) DO UPDATE SET points = points + 5, updated_at = datetime('now')`
  ).run(user.id, event.id, 5);

  const badgeCount = db.prepare('SELECT COUNT(*) as c FROM user_badges WHERE user_id = ?').get(user.id).c;
  if (badgeCount === 0) {
    db.prepare('INSERT OR IGNORE INTO user_badges (user_id, badge_key) VALUES (?,?)').run(user.id, 'first_registration');
  }

  await notifyUser(user.id, {
    type: 'registration',
    title: status === 'confirmed' ? 'Registration confirmed' : 'Added to waitlist',
    body:
      status === 'confirmed'
        ? `You're in for "${event.title}". Your ticket code is ${ticketCode}.`
        : `You're on the waitlist for "${event.title}".`,
    link: `/events/${event.id}`,
    email: user.email,
  });

  res.status(201).json({
    status,
    ticketCode,
    qrDataUrl,
  });
});

router.get('/me/tickets', authRequired, async (req, res) => {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT r.*, e.title as event_title, e.start_at, e.end_at, e.location_text
       FROM registrations r
       JOIN events e ON e.id = r.event_id
       WHERE r.user_id = ? AND r.status != 'cancelled'
       ORDER BY e.start_at ASC`
    )
    .all(req.user.id);

  const tickets = await Promise.all(
    rows.map(async (r) => ({
      ...r,
      qrDataUrl: await generateQrDataUrl(r.qr_payload),
    }))
  );
  res.json({ tickets });
});

router.post('/events/:eventId/cancel', authRequired, (req, res) => {
  const db = getDb();
  const reg = db
    .prepare('SELECT * FROM registrations WHERE event_id = ? AND user_id = ?')
    .get(req.params.eventId, req.user.id);
  if (!reg) return res.status(404).json({ error: 'Registration not found' });
  db.prepare(`UPDATE registrations SET status = 'cancelled' WHERE id = ?`).run(reg.id);
  db.prepare('DELETE FROM waitlist WHERE event_id = ? AND user_id = ?').run(req.params.eventId, req.user.id);

  const next = db
    .prepare(
      `SELECT w.user_id FROM waitlist w WHERE w.event_id = ? ORDER BY w.position ASC LIMIT 1`
    )
    .get(req.params.eventId);
  const event = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.eventId);
  const confirmed = db
    .prepare(`SELECT COUNT(*) as c FROM registrations WHERE event_id = ? AND status = 'confirmed'`)
    .get(req.params.eventId).c;
  if (next && confirmed < event.capacity) {
    const ticketCode = uuidv4().replace(/-/g, '').slice(0, 12).toUpperCase();
    const qrPayload = JSON.stringify({
      e: event.id,
      u: next.user_id,
      t: ticketCode,
    });
    db.prepare(
      `UPDATE registrations SET status = 'confirmed', ticket_code = ?, qr_payload = ? WHERE event_id = ? AND user_id = ?`
    ).run(ticketCode, qrPayload, event.id, next.user_id);
    db.prepare('DELETE FROM waitlist WHERE event_id = ? AND user_id = ?').run(event.id, next.user_id);
  }

  res.json({ ok: true });
});

module.exports = router;
