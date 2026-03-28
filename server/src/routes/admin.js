const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { stringify } = require('csv-stringify/sync');
const { z } = require('zod');
const { getDb } = require('../db/init');
const { authRequired, requireRoles } = require('../middleware/auth');

const router = express.Router();
router.use(authRequired, requireRoles('admin'));

router.get('/stats', (req, res) => {
  const db = getDb();
  const users = db.prepare('SELECT COUNT(*) as c FROM users').get().c;
  const events = db.prepare('SELECT COUNT(*) as c FROM events').get().c;
  const regs = db.prepare(`SELECT COUNT(*) as c FROM registrations WHERE status = 'confirmed'`).get().c;
  const revenue = db
    .prepare(`SELECT COALESCE(SUM(amount_cents),0) as s FROM payments WHERE status = 'completed'`)
    .get().s;
  const activeUsers = db
    .prepare(
      `SELECT COUNT(DISTINCT user_id) as c FROM registrations WHERE registered_at > datetime('now','-30 days')`
    )
    .get().c;
  const flaggedMessages = db.prepare(`SELECT COUNT(*) as c FROM event_messages WHERE flagged = 1`).get().c;
  const premiumMembers = db
    .prepare(`SELECT COUNT(*) as c FROM users WHERE membership_tier IN ('premium','vip')`)
    .get().c;
  res.json({
    totalUsers: users,
    totalEvents: events,
    totalRegistrations: regs,
    revenueCents: revenue,
    activeUsersLast30Days: activeUsers,
    flaggedMessages,
    activeMemberships: premiumMembers,
  });
});

router.get('/users', (req, res) => {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT u.id, u.email, u.name, u.organization, u.role, u.membership_tier, u.created_at,
        (SELECT COUNT(*) FROM registrations r WHERE r.user_id = u.id AND r.status != 'cancelled') as reg_count
       FROM users u
       ORDER BY u.created_at DESC LIMIT 500`
    )
    .all();
  res.json({
    users: rows.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      organization: u.organization,
      role: u.role,
      membershipTier: u.membership_tier,
      createdAt: u.created_at,
      registrationCount: u.reg_count,
    })),
  });
});

const roleSchema = z.object({ role: z.enum(['admin', 'organizer', 'attendee']) });

router.patch('/users/:id/role', (req, res) => {
  const parsed = roleSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const db = getDb();
  if (req.params.id === req.user.id && parsed.data.role !== 'admin') {
    return res.status(400).json({ error: 'Cannot demote yourself' });
  }
  const target = db.prepare('SELECT role FROM users WHERE id = ?').get(req.params.id);
  if (!target) return res.status(404).json({ error: 'User not found' });
  if (target.role === 'admin' && parsed.data.role !== 'admin') {
    const admins = db.prepare(`SELECT COUNT(*) as c FROM users WHERE role = 'admin'`).get().c;
    if (admins <= 1) return res.status(400).json({ error: 'Cannot demote the last admin' });
  }
  db.prepare('UPDATE users SET role = ?, updated_at = datetime(\'now\') WHERE id = ?').run(
    parsed.data.role,
    req.params.id
  );
  res.json({ ok: true });
});

const tierSchema = z.object({ membershipTier: z.enum(['free', 'premium', 'vip']) });

router.patch('/users/:id/membership', (req, res) => {
  const parsed = tierSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const db = getDb();
  const r = db.prepare('UPDATE users SET membership_tier = ?, updated_at = datetime(\'now\') WHERE id = ?').run(
    parsed.data.membershipTier,
    req.params.id
  );
  if (r.changes === 0) return res.status(404).json({ error: 'User not found' });
  res.json({ ok: true });
});

router.get('/events', (req, res) => {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT e.*, u.name as organizer_name,
        (SELECT COUNT(*) FROM registrations r WHERE r.event_id = e.id AND r.status = 'confirmed') as confirmed_count
       FROM events e
       LEFT JOIN users u ON u.id = e.organizer_id
       ORDER BY e.start_at DESC LIMIT 500`
    )
    .all();
  const tagsFor = (id) =>
    db
      .prepare('SELECT tag FROM event_tags WHERE event_id = ?')
      .all(id)
      .map((r) => r.tag);
  const now = Date.now();
  res.json({
    events: rows.map((r) => {
      const start = new Date(r.start_at).getTime();
      const end = new Date(r.end_at).getTime();
      let scheduleStatus = 'upcoming';
      if (now > end) scheduleStatus = 'past';
      else if (now >= start && now <= end) scheduleStatus = 'live';
      return {
        id: r.id,
        title: r.title,
        description: r.description,
        startAt: r.start_at,
        endAt: r.end_at,
        locationType: r.location_type,
        locationText: r.location_text,
        capacity: r.capacity,
        organizerId: r.organizer_id,
        organizerName: r.organizer_name,
        exclusiveTier: r.exclusive_tier,
        confirmedCount: r.confirmed_count,
        createdAt: r.created_at,
        tags: tagsFor(r.id),
        scheduleStatus,
      };
    }),
  });
});

router.post('/events/:id/duplicate', (req, res) => {
  const db = getDb();
  const src = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
  if (!src) return res.status(404).json({ error: 'Not found' });
  const newId = uuidv4();
  db.prepare(
    `INSERT INTO events (id, title, description, start_at, end_at, location_type, location_text, capacity, organizer_id, exclusive_tier, early_access_hours, discount_percent)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`
  ).run(
    newId,
    `${src.title} (copy)`,
    src.description,
    src.start_at,
    src.end_at,
    src.location_type,
    src.location_text,
    src.capacity,
    src.organizer_id,
    src.exclusive_tier,
    src.early_access_hours,
    src.discount_percent
  );
  const tags = db.prepare('SELECT tag FROM event_tags WHERE event_id = ?').all(req.params.id);
  const ins = db.prepare('INSERT INTO event_tags (event_id, tag) VALUES (?,?)');
  for (const t of tags) ins.run(newId, t.tag);
  db.prepare('INSERT OR IGNORE INTO share_events (id, event_id) VALUES (?,?)').run(uuidv4(), newId);
  const row = db.prepare('SELECT * FROM events WHERE id = ?').get(newId);
  res.status(201).json({ id: newId, event: row });
});

router.get('/registrations', (req, res) => {
  const db = getDb();
  const limit = Math.min(500, Math.max(20, parseInt(req.query.limit, 10) || 200));
  const rows = db
    .prepare(
      `SELECT r.id, r.event_id, r.user_id, r.status, r.ticket_code, r.registered_at,
        u.name as user_name, u.email as user_email,
        e.title as event_title, e.start_at as event_start_at
       FROM registrations r
       JOIN users u ON u.id = r.user_id
       JOIN events e ON e.id = r.event_id
       ORDER BY r.registered_at DESC
       LIMIT ?`
    )
    .all(limit);
  res.json({ registrations: rows });
});

router.get('/registrations/export.csv', (req, res) => {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT r.id, r.status, r.ticket_code, r.registered_at,
        u.name as user_name, u.email as user_email,
        e.title as event_title
       FROM registrations r
       JOIN users u ON u.id = r.user_id
       JOIN events e ON e.id = r.event_id
       ORDER BY r.registered_at DESC
       LIMIT 5000`
    )
    .all();
  const csv = stringify(rows, { header: true });
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="registrations-export.csv"');
  res.send(csv);
});

router.get('/analytics', (req, res) => {
  const db = getDb();
  const regByDay = db
    .prepare(
      `SELECT date(registered_at) as d, COUNT(*) as c
       FROM registrations
       WHERE registered_at > datetime('now','-30 days')
       GROUP BY date(registered_at)
       ORDER BY d ASC`
    )
    .all();
  const usersByDay = db
    .prepare(
      `SELECT date(created_at) as d, COUNT(*) as c
       FROM users
       WHERE created_at > datetime('now','-30 days')
       GROUP BY date(created_at)
       ORDER BY d ASC`
    )
    .all();
  const tagPopularity = db
    .prepare(
      `SELECT et.tag as tag, COUNT(*) as c
       FROM event_tags et
       JOIN events e ON e.id = et.event_id
       GROUP BY et.tag
       ORDER BY c DESC
       LIMIT 12`
    )
    .all();
  const membershipTiers = db
    .prepare(`SELECT membership_tier as tier, COUNT(*) as c FROM users GROUP BY membership_tier`)
    .all();
  res.json({
    registrationsOverTime: regByDay.map((r) => ({ date: r.d, count: r.c })),
    usersOverTime: usersByDay.map((r) => ({ date: r.d, count: r.c })),
    tagPopularity: tagPopularity.map((r) => ({ tag: r.tag, count: r.c })),
    membershipDistribution: membershipTiers.map((r) => ({ tier: r.tier, count: r.c })),
  });
});

router.get('/activity', (req, res) => {
  const db = getDb();
  const recentUsers = db
    .prepare(
      `SELECT id, email, name, role, created_at as at, 'user_signup' as type
       FROM users ORDER BY created_at DESC LIMIT 8`
    )
    .all();
  const recentEvents = db
    .prepare(
      `SELECT id, title, created_at as at, 'event_created' as type
       FROM events ORDER BY created_at DESC LIMIT 8`
    )
    .all();
  const recentRegs = db
    .prepare(
      `SELECT r.id, r.registered_at as at, 'registration' as type,
        u.name as u_name, e.title as e_title
       FROM registrations r
       JOIN users u ON u.id = r.user_id
       JOIN events e ON e.id = r.event_id
       ORDER BY r.registered_at DESC LIMIT 8`
    )
    .all();
  res.json({ recentUsers, recentEvents, recentRegistrations: recentRegs });
});

router.get('/events/:id/attendees.csv', (req, res) => {
  const db = getDb();
  const event = db.prepare('SELECT title FROM events WHERE id = ?').get(req.params.id);
  if (!event) return res.status(404).json({ error: 'Not found' });
  const rows = db
    .prepare(
      `SELECT u.name, u.email, u.organization, r.status, r.ticket_code, r.registered_at
       FROM registrations r
       JOIN users u ON u.id = r.user_id
       WHERE r.event_id = ? AND r.status != 'cancelled'
       ORDER BY r.registered_at`
    )
    .all(req.params.id);
  const csv = stringify(rows, { header: true });
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="attendees-${req.params.id}.csv"`);
  res.send(csv);
});

router.get('/messages/flagged', (req, res) => {
  const rows = getDb()
    .prepare(
      `SELECT m.*, u.name as user_name, e.title as event_title
       FROM event_messages m
       JOIN users u ON u.id = m.user_id
       JOIN events e ON e.id = m.event_id
       WHERE m.flagged = 1
       ORDER BY m.created_at DESC
       LIMIT 200`
    )
    .all();
  res.json({ messages: rows });
});

router.delete('/messages/:id', (req, res) => {
  getDb().prepare('DELETE FROM event_messages WHERE id = ?').run(req.params.id);
  res.status(204).send();
});

router.post('/messages/:id/unflag', (req, res) => {
  getDb().prepare('UPDATE event_messages SET flagged = 0 WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
