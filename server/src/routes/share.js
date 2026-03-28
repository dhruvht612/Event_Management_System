const express = require('express');
const { getDb } = require('../db/init');

const router = express.Router();

router.post('/events/:id/click', (req, res) => {
  const db = getDb();
  const row = db.prepare('SELECT id FROM share_events WHERE event_id = ?').get(req.params.id);
  if (row) {
    db.prepare('UPDATE share_events SET clicks = clicks + 1 WHERE event_id = ?').run(req.params.id);
  }
  res.json({ ok: true });
});

router.post('/events/:id/share', (req, res) => {
  const db = getDb();
  const row = db.prepare('SELECT id FROM share_events WHERE event_id = ?').get(req.params.id);
  if (row) {
    db.prepare('UPDATE share_events SET shares = shares + 1 WHERE event_id = ?').run(req.params.id);
  }
  res.json({ ok: true });
});

router.get('/events/:id/meta', (req, res) => {
  const db = getDb();
  const ev = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
  if (!ev) return res.status(404).json({ error: 'Not found' });
  const tags = db.prepare('SELECT tag FROM event_tags WHERE event_id = ?').all(req.params.id).map((r) => r.tag);
  const client = process.env.CLIENT_URL || 'http://localhost:5173';
  res.json({
    title: ev.title,
    description: ev.description?.slice(0, 300) || '',
    url: `${client}/events/${ev.id}`,
    image: `${client}/og-default.png`,
    tags,
  });
});

module.exports = router;
