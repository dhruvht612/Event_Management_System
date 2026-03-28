const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../db/init');
const { sendMail } = require('./email');

function createInApp(userId, { type, title, body, link }) {
  const id = uuidv4();
  getDb()
    .prepare(
      `INSERT INTO notifications (id, user_id, type, title, body, link) VALUES (?,?,?,?,?,?)`
    )
    .run(id, userId, type, title, body, link || null);
  return id;
}

async function notifyUser(userId, { type, title, body, link, email }) {
  createInApp(userId, { type, title, body, link });
  if (email) {
    await sendMail({
      to: email,
      subject: title,
      text: body,
      html: `<p>${body}</p>`,
    });
  }
}

module.exports = { createInApp, notifyUser };
