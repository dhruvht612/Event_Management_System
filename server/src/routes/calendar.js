const express = require('express');
const { getDb } = require('../db/init');

const router = express.Router();

function buildGoogleCalendarUrl(event) {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${formatGCal(event.start_at)}/${formatGCal(event.end_at)}`,
    details: event.description || '',
    location: event.location_text || '',
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function formatGCal(iso) {
  const d = new Date(iso);
  return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

router.get('/events/:id/google', (req, res) => {
  const ev = getDb().prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
  if (!ev) return res.status(404).json({ error: 'Not found' });
  res.json({ url: buildGoogleCalendarUrl(ev) });
});

module.exports = router;
