const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { z } = require('zod');
const { getDb } = require('../db/init');
const { authOptional, authRequired, requireRoles } = require('../middleware/auth');

const router = express.Router();

const eventBody = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  startAt: z.string(),
  endAt: z.string(),
  locationType: z.enum(['physical', 'virtual']),
  locationText: z.string().optional(),
  capacity: z.number().int().positive(),
  tags: z.array(z.string()).optional(),
  exclusiveTier: z.enum(['premium', 'vip']).nullable().optional(),
  earlyAccessHours: z.number().int().min(0).optional(),
  discountPercent: z.number().int().min(0).max(100).optional(),
});

function mapEvent(row, tags = []) {
  const o = {
    id: row.id,
    title: row.title,
    description: row.description,
    startAt: row.start_at,
    endAt: row.end_at,
    locationType: row.location_type,
    locationText: row.location_text,
    capacity: row.capacity,
    organizerId: row.organizer_id,
    exclusiveTier: row.exclusive_tier,
    earlyAccessHours: row.early_access_hours,
    discountPercent: row.discount_percent,
    createdAt: row.created_at,
    tags,
  };
  if (row.organizer_name != null) o.organizerName = row.organizer_name;
  if (row.confirmed_count != null) o.confirmedCount = row.confirmed_count;
  return o;
}

function loadTags(db, eventId) {
  return db
    .prepare('SELECT tag FROM event_tags WHERE event_id = ? ORDER BY tag')
    .all(eventId)
    .map((r) => r.tag);
}

router.get('/', authOptional, (req, res) => {
  const db = getDb();
  const { tag, search, mine, tab, sort } = req.query;
  let sql = `
    SELECT e.*, u.name as organizer_name,
    (SELECT COUNT(*) FROM registrations r WHERE r.event_id = e.id AND r.status = 'confirmed') as confirmed_count
    FROM events e
    LEFT JOIN users u ON u.id = e.organizer_id
    WHERE 1=1`;
  const params = [];
  const t = tab || 'upcoming';
  if (t === 'upcoming') {
    sql += ` AND datetime(e.start_at) > datetime('now')`;
  } else if (t === 'past') {
    sql += ` AND datetime(e.start_at) <= datetime('now')`;
  } else if (t === 'registered') {
    if (!req.user) {
      return res.json({ events: [] });
    }
    sql += ` AND EXISTS (SELECT 1 FROM registrations reg WHERE reg.event_id = e.id AND reg.user_id = ? AND reg.status != 'cancelled')`;
    params.push(req.user.id);
  }
  if (tag) {
    sql += ` AND EXISTS (SELECT 1 FROM event_tags et WHERE et.event_id = e.id AND et.tag = ?)`;
    params.push(tag);
  }
  if (search) {
    sql += ` AND (e.title LIKE ? OR e.description LIKE ?)`;
    const q = `%${search}%`;
    params.push(q, q);
  }
  if (mine === '1' && req.user) {
    sql += ` AND e.organizer_id = ?`;
    params.push(req.user.id);
  }
  const sortKey = sort || 'date';
  if (sortKey === 'newest') {
    sql += ` ORDER BY e.created_at DESC`;
  } else if (sortKey === 'popular') {
    sql += ` ORDER BY confirmed_count DESC, e.start_at ASC`;
  } else {
    sql +=
      t === 'past'
        ? ` ORDER BY e.start_at DESC`
        : ` ORDER BY e.start_at ASC`;
  }
  const rows = db.prepare(sql).all(...params);
  const events = rows.map((r) => mapEvent(r, loadTags(db, r.id)));
  res.json({ events });
});

router.get('/:id', authOptional, (req, res) => {
  const db = getDb();
  const row = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  const tags = loadTags(db, row.id);
  const confirmed = db
    .prepare(`SELECT COUNT(*) as c FROM registrations WHERE event_id = ? AND status = 'confirmed'`)
    .get(req.params.id).c;
  res.json({ event: mapEvent(row, tags), confirmedCount: confirmed });
});

router.post('/', authRequired, requireRoles('admin', 'organizer'), (req, res) => {
  const parsed = eventBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const b = parsed.data;
  const id = uuidv4();
  const db = getDb();
  db.prepare(
    `INSERT INTO events (id, title, description, start_at, end_at, location_type, location_text, capacity, organizer_id, exclusive_tier, early_access_hours, discount_percent)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`
  ).run(
    id,
    b.title,
    b.description || '',
    b.startAt,
    b.endAt,
    b.locationType,
    b.locationText || '',
    b.capacity,
    req.user.id,
    b.exclusiveTier ?? null,
    b.earlyAccessHours ?? 0,
    b.discountPercent ?? 0
  );
  const insTag = db.prepare('INSERT OR IGNORE INTO event_tags (event_id, tag) VALUES (?,?)');
  for (const t of b.tags || []) {
    insTag.run(id, t);
  }
  db.prepare('INSERT OR IGNORE INTO share_events (id, event_id) VALUES (?,?)').run(uuidv4(), id);
  const row = db.prepare('SELECT * FROM events WHERE id = ?').get(id);
  res.status(201).json({ event: mapEvent(row, loadTags(db, id)) });
});

router.patch('/:id', authRequired, requireRoles('admin', 'organizer'), (req, res) => {
  const parsed = eventBody.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const db = getDb();
  const existing = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Not found' });
  if (req.user.role !== 'admin' && existing.organizer_id !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const b = parsed.data;
  const sets = [];
  const vals = [];
  const map = {
    title: 'title',
    description: 'description',
    startAt: 'start_at',
    endAt: 'end_at',
    locationType: 'location_type',
    locationText: 'location_text',
    capacity: 'capacity',
    exclusiveTier: 'exclusive_tier',
    earlyAccessHours: 'early_access_hours',
    discountPercent: 'discount_percent',
  };
  for (const [k, col] of Object.entries(map)) {
    if (b[k] !== undefined) {
      sets.push(`${col} = ?`);
      vals.push(b[k]);
    }
  }
  if (sets.length) {
    sets.push("updated_at = datetime('now')");
    vals.push(req.params.id);
    db.prepare(`UPDATE events SET ${sets.join(', ')} WHERE id = ?`).run(...vals);
  }
  if (b.tags) {
    db.prepare('DELETE FROM event_tags WHERE event_id = ?').run(req.params.id);
    const ins = db.prepare('INSERT INTO event_tags (event_id, tag) VALUES (?,?)');
    for (const t of b.tags) ins.run(req.params.id, t);
  }
  const row = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
  res.json({ event: mapEvent(row, loadTags(db, req.params.id)) });
});

router.delete('/:id', authRequired, requireRoles('admin', 'organizer'), (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Not found' });
  if (req.user.role !== 'admin' && existing.organizer_id !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  db.prepare('DELETE FROM events WHERE id = ?').run(req.params.id);
  res.status(204).send();
});

module.exports = router;
