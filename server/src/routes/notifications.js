const express = require('express');
const { getDb } = require('../db/init');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

router.get('/', authRequired, (req, res) => {
  const rows = getDb()
    .prepare(
      `SELECT id, type, title, body, read, link, created_at FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 100`
    )
    .all(req.user.id);
  res.json({ notifications: rows });
});

router.post('/:id/read', authRequired, (req, res) => {
  const db = getDb();
  const r = db
    .prepare('UPDATE notifications SET read = 1 WHERE id = ? AND user_id = ?')
    .run(req.params.id, req.user.id);
  if (r.changes === 0) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
});

router.post('/read-all', authRequired, (req, res) => {
  getDb().prepare('UPDATE notifications SET read = 1 WHERE user_id = ?').run(req.user.id);
  res.json({ ok: true });
});

module.exports = router;
