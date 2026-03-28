const express = require('express');
const Stripe = require('stripe');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../db/init');
const { authRequired } = require('../middleware/auth');
const { notifyUser } = require('../services/notifications');

const router = express.Router();

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key);
}

router.post('/checkout', authRequired, async (req, res) => {
  const stripe = getStripe();
  if (!stripe) return res.status(503).json({ error: 'Payments not configured' });
  const { tier } = req.body;
  if (!['premium', 'vip'].includes(tier)) {
    return res.status(400).json({ error: 'Invalid tier' });
  }
  const price =
    tier === 'premium' ? process.env.STRIPE_PRICE_PREMIUM : process.env.STRIPE_PRICE_VIP;
  if (!price) {
    return res.status(503).json({ error: 'Stripe prices not configured' });
  }
  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  let customerId = user.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name,
      metadata: { userId: user.id },
    });
    customerId = customer.id;
    db.prepare('UPDATE users SET stripe_customer_id = ? WHERE id = ?').run(customerId, user.id);
  }
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer: customerId,
    line_items: [{ price, quantity: 1 }],
    success_url: `${process.env.CLIENT_URL}/account?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.CLIENT_URL}/account`,
    metadata: { userId: user.id, tier },
  });
  const payId = uuidv4();
  db.prepare(
    `INSERT INTO payments (id, user_id, stripe_session_id, amount_cents, tier, status)
     VALUES (?,?,?,?,?,'pending')`
  ).run(payId, user.id, session.id, 0, tier);
  res.json({ url: session.url });
});

function webhookRouter() {
  const wh = express.Router();
  const stripe = getStripe();
  wh.post(
    '/',
    express.raw({ type: 'application/json' }),
    async (req, res) => {
      if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
        return res.status(503).send('Not configured');
      }
      let event;
      try {
        event = stripe.webhooks.constructEvent(
          req.body,
          req.headers['stripe-signature'],
          process.env.STRIPE_WEBHOOK_SECRET
        );
      } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }
      const db = getDb();
      if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        const tier = session.metadata?.tier;
        if (userId && tier) {
          db.prepare('UPDATE users SET membership_tier = ?, updated_at = datetime(\'now\') WHERE id = ?').run(
            tier,
            userId
          );
          db.prepare(
            `UPDATE payments SET status = 'completed', amount_cents = ?, stripe_payment_intent = ? WHERE stripe_session_id = ?`
          ).run(
            session.amount_total || 0,
            typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id,
            session.id
          );
          const u = db.prepare('SELECT email FROM users WHERE id = ?').get(userId);
          await notifyUser(userId, {
            type: 'membership',
            title: 'Membership upgraded',
            body: `Your account is now ${tier}. Enjoy early access and discounts on eligible events.`,
            link: '/account',
            email: u?.email,
          });
        }
      }
      res.json({ received: true });
    }
  );
  return wh;
}

module.exports = { router, webhookRouter };
