const express = require('express');
const { getDb } = require('../db/init');
const { authRequired, requireRoles } = require('../middleware/auth');

const router = express.Router();

router.get('/events/:id/analytics', authRequired, requireRoles('admin', 'organizer'), (req, res) => {
  const db = getDb();
  const ev = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
  if (!ev) return res.status(404).json({ error: 'Not found' });
  if (req.user.role !== 'admin' && ev.organizer_id !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const confirmed = db
    .prepare(`SELECT COUNT(*) as c FROM registrations WHERE event_id = ? AND status = 'confirmed'`)
    .get(req.params.id).c;
  const waitlist = db
    .prepare(`SELECT COUNT(*) as c FROM registrations WHERE event_id = ? AND status = 'waitlist'`)
    .get(req.params.id).c;
  const share = db.prepare('SELECT clicks, shares FROM share_events WHERE event_id = ?').get(req.params.id);
  const messages = db
    .prepare(`SELECT COUNT(*) as c FROM event_messages WHERE event_id = ?`)
    .get(req.params.id).c;

  res.json({
    eventId: req.params.id,
    confirmed,
    waitlist,
    capacity: ev.capacity,
    fillRate: ev.capacity ? Math.min(100, Math.round((confirmed / ev.capacity) * 100)) : 0,
    shareClicks: share?.clicks ?? 0,
    shareCount: share?.shares ?? 0,
    chatMessages: messages,
  });
});

module.exports = router;
