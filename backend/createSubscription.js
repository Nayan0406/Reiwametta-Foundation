// backend/createSubscription.js
// Sample Node.js Express backend for creating a Razorpay subscription
// Install dependencies: npm install express body-parser cors razorpay dotenv

const express = require('express');
const Razorpay = require('razorpay');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors({ origin: true }));
app.use(bodyParser.json());

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID, // set in .env
  key_secret: process.env.RAZORPAY_KEY_SECRET, // set in .env
});

// POST /create-subscription
app.post('/create-subscription', async (req, res) => {
  const { amount, name, email, contact } = req.body;
  try {
    // Create a plan if you don't have one already (do this once in dashboard or via API)
    // Here, we use a fixed plan_id for monthly recurring
    const plan_id = process.env.RAZORPAY_PLAN_ID; // set in .env (create plan in dashboard)

    // Create subscription
    const subscription = await razorpay.subscriptions.create({
      plan_id,
      customer_notify: 1,
      total_count: 12, // 12 months
      quantity: amount, // User-selected monthly donation amount
      notes: {
        donor_name: name,
        donor_email: email,
        donor_contact: contact,
        donor_amount: amount,
      },
    });
    res.json({ subscription_id: subscription.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
