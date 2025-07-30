// Vercel serverless function for Razorpay subscription
const Razorpay = require('razorpay');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // For Vercel, use process.env for secrets (set in Vercel dashboard)
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  const { amount, name, email, contact } = req.body;
  try {
    const plan_id = process.env.RAZORPAY_PLAN_ID;
    const subscription = await razorpay.subscriptions.create({
      plan_id,
      customer_notify: 1,
      total_count: 12,
      quantity: amount,
      notes: {
        donor_name: name,
        donor_email: email,
        donor_contact: contact,
        donor_amount: amount,
      },
    });
    res.status(200).json({ subscription_id: subscription.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
