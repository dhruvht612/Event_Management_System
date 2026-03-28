const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { z } = require('zod');
const { getDb } = require('../db/init');
const { authRequired, requireRoles } = require('../middleware/auth');

const router = express.Router();

const bodySchema = z.object({ body: z.string().min(1).max(5000) });
const announceSchema = z.object({ title: z.string().min(1), body: z.string().min(1) });

router.get('/events/:eventId', authRequired, (req, res) => {
  const db = getDb();
  const reg = db
    .prepare(
      `SELECT 1 FROM registrations WHERE event_id = ? AND user_id = ? AND status IN ('confirmed','waitlist')`
    )
    .get(req.params.eventId, req.user.id);
  const org = db.prepare('SELECT organizer_id FROM events WHERE id = ?').get(req.params.eventId);
  if (!org) return res.status(404).json({ error: 'Event not found' });
  if (!reg && req.user.role !== 'admin' && org.organizer_id !== req.user.id) {
    return res.status(403).json({ error: 'Join the event to view chat' });
  }
  const messages = db
    .prepare(
      `SELECT m.*, u.name as user_name FROM event_messages m
       JOIN users u ON u.id = m.user_id
       WHERE m.event_id = ? AND m.flagged = 0
       ORDER BY m.created_at ASC
       LIMIT 500`
    )
    .all(req.params.eventId);
  res.json({ messages });
});

router.post('/events/:eventId', authRequired, (req, res) => {
  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const db = getDb();
  const reg = db
    .prepare(
      `SELECT 1 FROM registrations WHERE event_id = ? AND user_id = ? AND status = 'confirmed'`
    )
    .get(req.params.eventId, req.user.id);
  if (!reg) return res.status(403).json({ error: 'Confirmed registration required to chat' });
  const id = uuidv4();
  db.prepare(
    `INSERT INTO event_messages (id, event_id, user_id, body) VALUES (?,?,?,?)`
  ).run(id, req.params.eventId, req.user.id, parsed.data.body);
  const row = db
    .prepare(`SELECT m.*, u.name as user_name FROM event_messages m JOIN users u ON u.id = m.user_id WHERE m.id = ?`)
    .get(id);
  const io = req.app.get('io');
  if (io) {
    io.to(`event:${req.params.eventId}`).emit('chat:message', row);
  }
  res.status(201).json({ message: row });
});

router.post('/events/:eventId/report/:messageId', authRequired, (req, res) => {
  getDb()
    .prepare('UPDATE event_messages SET flagged = 1 WHERE id = ? AND event_id = ?')
    .run(req.params.messageId, req.params.eventId);
  res.json({ ok: true });
});

router.get('/events/:eventId/announcements', authRequired, (req, res) => {
  const rows = getDb()
    .prepare(
      `SELECT a.*, u.name as author_name FROM announcements a
       JOIN users u ON u.id = a.user_id
       WHERE a.event_id = ?
       ORDER BY a.created_at DESC`
    )
    .all(req.params.eventId);
  res.json({ announcements: rows });
});

router.post('/events/:eventId/announcements', authRequired, requireRoles('admin', 'organizer'), (req, res) => {
  const parsed = announceSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const db = getDb();
  const ev = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.eventId);
  if (!ev) return res.status(404).json({ error: 'Not found' });
  if (req.user.role !== 'admin' && ev.organizer_id !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const id = uuidv4();
  db.prepare(
    `INSERT INTO announcements (id, event_id, user_id, title, body) VALUES (?,?,?,?,?)`
  ).run(id, req.params.eventId, req.user.id, parsed.data.title, parsed.data.body);
  const row = db
    .prepare(
      `SELECT a.*, u.name as author_name FROM announcements a JOIN users u ON u.id = a.user_id WHERE a.id = ?`
    )
    .get(id);

  const regs = db
    .prepare(`SELECT user_id FROM registrations WHERE event_id = ? AND status = 'confirmed'`)
    .all(req.params.eventId);
  const { createInApp } = require('../services/notifications');
  const { sendMail } = require('../services/email');
  for (const r of regs) {
    createInApp(r.user_id, {
      type: 'announcement',
      title: parsed.data.title,
      body: parsed.data.body.slice(0, 200),
      link: `/events/${req.params.eventId}`,
    });
    const u = db.prepare('SELECT email FROM users WHERE id = ?').get(r.user_id);
    if (u?.email) {
      sendMail({
        to: u.email,
        subject: `[${ev.title}] ${parsed.data.title}`,
        text: parsed.data.body,
      });
    }
  }

  const io = req.app.get('io');
  if (io) {
    io.to(`event:${req.params.eventId}`).emit('announcement:new', row);
  }
  res.status(201).json({ announcement: row });
});

module.exports = router;
