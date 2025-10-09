// server.js — PayMeBack backend (CommonJS)

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const Stripe = require('stripe');

const app = express();

/* -------------------- Config -------------------- */
const PORT = Number(process.env.PORT || 4242);
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
const CURRENCY = process.env.CURRENCY || 'usd';
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' });

app.use(express.json());
app.use(cors({ origin: CLIENT_ORIGIN }));

/* -------------------- Tiny JSON DB -------------------- */
const DB_FILE = path.resolve(__dirname, 'db.json');
function readDB() {
  try { return JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); }
  catch { return { users: {}, plans: {} }; }
}
function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

/* -------------------- Health -------------------- */
app.get('/health', (_req, res) => res.json({ ok: true }));

/* -------------------------------------------------------
   1) Save Payment Method Flow
   ------------------------------------------------------- */

/**
 * Create a SetupIntent to collect & save a card
 * Body: {} OR { customerId?: string }
 * Returns: { customerId, clientSecret }
 */
app.post('/create-setup-intent', async (req, res) => {
  try {
    const { customerId } = req.body || {};
    // create a customer if none provided
    const customer = customerId || (await stripe.customers.create({})).id;

    const setupIntent = await stripe.setupIntents.create({
      customer,
      usage: 'off_session',
      payment_method_types: ['card'],
    });

    res.json({
      customerId: customer,
      clientSecret: setupIntent.client_secret,
    });
  } catch (err) {
    console.error('SetupIntent error:', err);
    res.status(500).json({ error: { message: err.message } });
  }
});

/**
 * Attach payment method to customer + set as default
 * Body: { userId, customerId, paymentMethodId }
 */
app.post('/save-payment-method', async (req, res) => {
  try {
    const { userId, customerId, paymentMethodId } = req.body || {};
    if (!userId || !customerId || !paymentMethodId) {
      return res.status(400).json({ error: { message: 'Missing userId, customerId, or paymentMethodId' } });
    }

    // Ensure PM is attached to this customer
    const pm = await stripe.paymentMethods.retrieve(paymentMethodId);
    if (!pm.customer) {
      await stripe.paymentMethods.attach(paymentMethodId, { customer: customerId });
    } else if (pm.customer !== customerId) {
      return res.status(400).json({ error: { message: 'Payment method belongs to a different customer.' } });
    }

    // Set as default for invoices/off-session
    await stripe.customers.update(customerId, {
      invoice_settings: { default_payment_method: paymentMethodId },
    });

    // Persist in dev DB
    const db = readDB();
    db.users[userId] = db.users[userId] || {};
    db.users[userId].stripe = {
      customerId,
      paymentMethodId,
      currency: CURRENCY,
      updatedAt: new Date().toISOString(),
    };
    writeDB(db);

    res.json({ ok: true });
  } catch (err) {
    console.error('Save PM error:', err);
    res.status(500).json({ error: { message: err.message } });
  }
});

/* -------------------------------------------------------
   2) Plans (create + list) — schedule generated server-side
   ------------------------------------------------------- */

/**
 * Body:
 * {
 *   userId: string,
 *   counterparty: string,
 *   total: number,
 *   mode: 'amount' | 'count',
 *   amountPerPayment?: number,
 *   numPayments?: number,
 *   frequency: 'weekly'|'biweekly'|'monthly',
 *   startDate: 'YYYY-MM-DD',
 *   timezone: string,
 *   note?: string
 * }
 */
app.post('/create-plan', async (req, res) => {
  try {
    const body = req.body || {};
    const required = ['userId', 'counterparty', 'total', 'mode', 'frequency', 'startDate', 'timezone'];
    for (const k of required) {
      if (body[k] === undefined || body[k] === null || body[k] === '') {
        return res.status(400).json({ error: { message: `Missing field: ${k}` } });
      }
    }
    if (body.mode === 'amount' && (!body.amountPerPayment || body.amountPerPayment <= 0)) {
      return res.status(400).json({ error: { message: 'amountPerPayment must be > 0' } });
    }
    if (body.mode === 'count' && (!body.numPayments || body.numPayments <= 0)) {
      return res.status(400).json({ error: { message: 'numPayments must be > 0' } });
    }

    const planId = `plan_${crypto.randomUUID()}`;
    const schedule = generateSchedule({
      total: Number(body.total),
      mode: body.mode,
      amountPerPayment: body.amountPerPayment ? Number(body.amountPerPayment) : undefined,
      numPayments: body.numPayments ? Number(body.numPayments) : undefined,
      frequency: body.frequency,
      startDate: body.startDate,
    });

    const plan = {
      planId,
      userId: String(body.userId),
      counterparty: String(body.counterparty),
      note: body.note || '',
      total: Number(body.total),
      mode: body.mode,
      amountPerPayment: body.amountPerPayment ? Number(body.amountPerPayment) : undefined,
      numPayments: body.numPayments ? Number(body.numPayments) : undefined,
      frequency: body.frequency,
      startDate: body.startDate,
      timezone: body.timezone,
      status: 'active', // active | paused | completed | canceled
      createdAt: new Date().toISOString(),
      installments: schedule.map((s, idx) => ({
        idx,
        dueDate: s.dueDate,
        amount: s.amount,
        status: 'scheduled', // scheduled | paid | failed | skipped
        attempts: 0,
        chargeId: null,
      })),
    };

    const db = readDB();
    db.plans[planId] = plan;
    writeDB(db);

    res.json({ ok: true, plan });
  } catch (err) {
    console.error('Create plan error:', err);
    res.status(500).json({ error: { message: err.message } });
  }
});

/** List plans for a user: GET /plans?userId=... */
app.get('/plans', (req, res) => {
  const userId = String(req.query.userId || '');
  if (!userId) return res.status(400).json({ error: { message: 'Missing userId' } });
  const db = readDB();
  const plans = Object.values(db.plans || {}).filter((p) => p.userId === userId);
  res.json({ plans });
});

/* -------------------------------------------------------
   3) (Optional) One-off charge using saved PM (for testing)
   Body: { userId, amount }  amount in dollars
   ------------------------------------------------------- */
app.post('/charge', async (req, res) => {
  try {
    const { userId, amount } = req.body || {};
    if (!userId || !amount) {
      return res.status(400).json({ error: { message: 'Missing userId or amount' } });
    }
    const db = readDB();
    const u = db.users[userId];
    if (!u || !u.stripe || !u.stripe.customerId || !u.stripe.paymentMethodId) {
      return res.status(400).json({ error: { message: 'User missing payment setup' } });
    }

    const pi = await stripe.paymentIntents.create({
      customer: u.stripe.customerId,
      amount: Math.round(Number(amount) * 100), // cents
      currency: u.stripe.currency || CURRENCY,
      payment_method: u.stripe.paymentMethodId,
      off_session: true,
      confirm: true,
    });

    res.json({ ok: true, paymentIntent: { id: pi.id, status: pi.status } });
  } catch (err) {
    console.error('Charge error:', err);
    res.status(500).json({ error: { message: err.message } });
  }
});

/* -------------------- Start Server -------------------- */
app.listen(PORT, () => {
  console.log(`Stripe server listening on http://localhost:${PORT}`);
  console.log(`CORS allowed origin: ${CLIENT_ORIGIN}`);
});

/* -------------------- Helpers -------------------- */
function round2(n) { return Math.round(n * 100) / 100; }
function addInterval(dateISO, frequency, stepIndex) {
  const copy = new Date(dateISO + 'T00:00:00');
  if (Number.isNaN(+copy)) throw new Error('Invalid startDate');
  if (frequency === 'weekly') copy.setDate(copy.getDate() + 7 * stepIndex);
  else if (frequency === 'biweekly') copy.setDate(copy.getDate() + 14 * stepIndex);
  else if (frequency === 'monthly') copy.setMonth(copy.getMonth() + stepIndex);
  else throw new Error('Invalid frequency');
  return copy.toISOString().slice(0, 10);
}
function generateSchedule({ total, mode, amountPerPayment, numPayments, frequency, startDate }) {
  let payments = 0;
  let baseAmount = 0;
  if (mode === 'amount') {
    payments = Math.max(1, Math.ceil(round2(total) / round2(amountPerPayment)));
    baseAmount = round2(amountPerPayment);
  } else {
    payments = Math.max(1, Math.floor(numPayments));
    baseAmount = round2(total / payments);
  }
  const list = [];
  let running = 0;
  for (let i = 0; i < payments; i++) {
    const dueDate = addInterval(startDate, frequency, i);
    let amt = baseAmount;
    if (i === payments - 1) amt = round2(total - running); // final balance fix
    running = round2(running + amt);
    list.push({ dueDate, amount: amt });
  }
  return list;
}
