const express = require('express');
const { getDb } = require('../db/init');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

const CONFIRMED_SUB = `(SELECT COUNT(*) FROM registrations r WHERE r.event_id = e.id AND r.status = 'confirmed')`;

router.get('/', authRequired, (req, res) => {
  const db = getDb();
  const userTags = db
    .prepare(
      `SELECT DISTINCT et.tag FROM event_tags et
       JOIN registrations r ON r.event_id = et.event_id
       WHERE r.user_id = ?`
    )
    .all(req.user.id)
    .map((r) => r.tag);

  const registered = db
    .prepare('SELECT event_id FROM registrations WHERE user_id = ?')
    .all(req.user.id)
    .map((r) => r.event_id);

  let rows;
  if (userTags.length) {
    const placeholders = userTags.map(() => '?').join(',');
    rows = db
      .prepare(
        `SELECT DISTINCT e.*, ${CONFIRMED_SUB} AS confirmed_count
         FROM events e
         JOIN event_tags et ON et.event_id = e.id
         WHERE datetime(e.start_at) > datetime('now') AND et.tag IN (${placeholders})
         ORDER BY e.start_at ASC LIMIT 20`
      )
      .all(...userTags);
  } else {
    rows = db
      .prepare(
        `SELECT e.*, ${CONFIRMED_SUB} AS confirmed_count
         FROM events e
         WHERE datetime(e.start_at) > datetime('now')
         ORDER BY e.start_at ASC LIMIT 20`
      )
      .all();
  }

  rows = rows.filter((e) => !registered.includes(e.id)).slice(0, 8);

  if (rows.length < 4) {
    const more = db
      .prepare(
        `SELECT e.*, ${CONFIRMED_SUB} AS confirmed_count
         FROM events e
         WHERE datetime(e.start_at) > datetime('now')
         ORDER BY e.start_at ASC LIMIT 20`
      )
      .all();
    const ids = new Set(rows.map((r) => r.id));
    for (const m of more) {
      if (!ids.has(m.id) && !registered.includes(m.id)) {
        rows.push(m);
        ids.add(m.id);
      }
      if (rows.length >= 8) break;
    }
  }

  const tagsFor = (id) =>
    db
      .prepare('SELECT tag FROM event_tags WHERE event_id = ?')
      .all(id)
      .map((r) => r.tag);

  res.json({
    events: rows.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      startAt: r.start_at,
      endAt: r.end_at,
      locationType: r.location_type,
      locationText: r.location_text,
      capacity: r.capacity,
      confirmedCount: r.confirmed_count,
      createdAt: r.created_at,
      exclusiveTier: r.exclusive_tier,
      tags: tagsFor(r.id),
    })),
  });
});

module.exports = router;
