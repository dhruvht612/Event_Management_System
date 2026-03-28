const express = require('express');
const { z } = require('zod');
const { getDb } = require('../db/init');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  organization: z.string().optional(),
});

router.patch('/profile', authRequired, (req, res) => {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { name, organization } = parsed.data;
  const db = getDb();
  const sets = [];
  const vals = [];
  if (name !== undefined) {
    sets.push('name = ?');
    vals.push(name);
  }
  if (organization !== undefined) {
    sets.push('organization = ?');
    vals.push(organization);
  }
  if (sets.length === 0) {
    const u = db.prepare('SELECT id, email, name, organization, role, membership_tier, avatar_url FROM users WHERE id = ?').get(req.user.id);
    return res.json({
      id: u.id,
      email: u.email,
      name: u.name,
      organization: u.organization,
      role: u.role,
      membershipTier: u.membership_tier,
      avatarUrl: u.avatar_url,
    });
  }
  sets.push("updated_at = datetime('now')");
  vals.push(req.user.id);
  db.prepare(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`).run(...vals);
  const u = db.prepare('SELECT id, email, name, organization, role, membership_tier, avatar_url FROM users WHERE id = ?').get(req.user.id);
  res.json({
    id: u.id,
    email: u.email,
    name: u.name,
    organization: u.organization,
    role: u.role,
    membershipTier: u.membership_tier,
    avatarUrl: u.avatar_url,
  });
});

router.get('/badges', authRequired, (req, res) => {
  const rows = getDb()
    .prepare('SELECT badge_key, earned_at FROM user_badges WHERE user_id = ? ORDER BY earned_at DESC')
    .all(req.user.id);
  res.json({ badges: rows });
});

const CONFIRMED_SUB = `(SELECT COUNT(*) FROM registrations r WHERE r.event_id = e.id AND r.status = 'confirmed')`;

router.get('/saved-events', authRequired, (req, res) => {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT e.*, ${CONFIRMED_SUB} AS confirmed_count
       FROM saved_events s
       JOIN events e ON e.id = s.event_id
       WHERE s.user_id = ?
       ORDER BY datetime(e.start_at) > datetime('now') DESC, e.start_at ASC`
    )
    .all(req.user.id);

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

router.post('/saved-events/:eventId', authRequired, (req, res) => {
  const { eventId } = req.params;
  const db = getDb();
  const ev = db.prepare('SELECT id FROM events WHERE id = ?').get(eventId);
  if (!ev) return res.status(404).json({ error: 'Event not found' });
  db.prepare(
    `INSERT OR IGNORE INTO saved_events (user_id, event_id) VALUES (?, ?)`
  ).run(req.user.id, eventId);
  res.status(201).json({ ok: true, saved: true });
});

router.delete('/saved-events/:eventId', authRequired, (req, res) => {
  const { eventId } = req.params;
  getDb()
    .prepare('DELETE FROM saved_events WHERE user_id = ? AND event_id = ?')
    .run(req.user.id, eventId);
  res.json({ ok: true, saved: false });
});

router.get('/saved-events/check/:eventId', authRequired, (req, res) => {
  const row = getDb()
    .prepare('SELECT 1 FROM saved_events WHERE user_id = ? AND event_id = ?')
    .get(req.user.id, req.params.eventId);
  res.json({ saved: Boolean(row) });
});

router.get('/networking/:eventId', authRequired, (req, res) => {
  const { eventId } = req.params;
  const db = getDb();
  const myTags = db
    .prepare(
      `SELECT DISTINCT et.tag FROM event_tags et
       JOIN registrations r ON r.event_id = et.event_id
       WHERE r.user_id = ? AND r.event_id = ? AND r.status = 'confirmed'`
    )
    .all(req.user.id, eventId)
    .map((r) => r.tag);
  if (myTags.length === 0) {
    return res.json({ suggestions: [] });
  }
  const placeholders = myTags.map(() => '?').join(',');
  const others = db
    .prepare(
      `SELECT DISTINCT u.id, u.name, u.organization, COUNT(DISTINCT et.tag) as overlap
       FROM users u
       JOIN registrations r ON r.user_id = u.id AND r.event_id = ? AND r.status = 'confirmed' AND u.id != ?
       JOIN event_tags et ON et.event_id = r.event_id AND et.tag IN (${placeholders})
       GROUP BY u.id
       ORDER BY overlap DESC
       LIMIT 10`
    )
    .all(eventId, req.user.id, ...myTags);
  res.json({ suggestions: others });
});

module.exports = router;
