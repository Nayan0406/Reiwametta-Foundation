const express = require('express');
const Razorpay = require('razorpay');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const mongoose = require('mongoose');

// Check environment variables
console.log("🔍 Environment variable check:");
console.log("MONGO_DB_URI:", process.env.MONGO_DB_URI ? "✅ Set" : "❌ Missing");
console.log("RAZORPAY_KEY_ID:", process.env.RAZORPAY_KEY_ID ? "✅ Set" : "❌ Missing");
console.log("RAZORPAY_KEY_SECRET:", process.env.RAZORPAY_KEY_SECRET ? "✅ Set" : "❌ Missing");
console.log("RAZORPAY_PLAN_ID:", process.env.RAZORPAY_PLAN_ID ? "✅ Set" : "❌ Missing");

console.log("Attempting to connect to MongoDB...");
console.log("Connection URI format check:", process.env.MONGO_DB_URI ? "✅ URI provided" : "❌ URI missing");

// Add retry logic for MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_DB_URI, {
      serverSelectionTimeoutMS: 30000, // Increase timeout to 30s
      socketTimeoutMS: 45000,
      family: 4, // Use IPv4, skip trying IPv6
      maxPoolSize: 10,
      retryWrites: true,
      w: 'majority'
    });
    console.log("✅ MongoDB connected successfully");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    console.log("🔄 Retrying MongoDB connection in 5 seconds...");
    setTimeout(connectDB, 5000); // Retry after 5 seconds
  }
};

connectDB();

const app = express();
app.use(cors({ 
  origin: [
    'http://localhost:5173',
    'https://reiwametta-foundation-frontend.vercel.app',
    'https://reiwametta-foundation-frontend.vercel.app/',
  ],
  credentials: true 
}));

// Use express.json() instead of bodyParser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Add error handling for JSON parsing
app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    console.error('JSON Parse Error:', error.message);
    return res.status(400).json({ error: 'Invalid JSON format' });
  }
  next();
});

// Donation schema
const donationSchema = new mongoose.Schema({
  name: { type: String, default: '' },
  email: { type: String, default: '' },
  contact: { type: String, default: '' },
  address: { type: String, default: '' },
  pincode: { type: String, default: '' },
  amount: { type: Number, required: true },
  isRecurring: { type: Boolean, default: false },
  subscriptionId: String,
  paymentId: String,
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  message: { type: String, default: '' }
});

const Donation = mongoose.model('Donation', donationSchema);

// Health check endpoint
app.get('/', (req, res) => {
  const mongoStatus = mongoose.connection.readyState;
  const mongoStatusText = {
    0: '❌ Disconnected',
    1: '✅ Connected', 
    2: '🔄 Connecting',
    3: '⚠️  Disconnecting'
  }[mongoStatus] || '❓ Unknown';

  res.json({ 
    status: '✅ Backend is running',
    timestamp: new Date().toISOString(),
    mongodb: mongoStatusText,
    mongodb_ready: mongoStatus === 1,
    mongodb_state_code: mongoStatus,
    razorpay_key: process.env.RAZORPAY_KEY_ID ? '✅ Configured' : '❌ Missing',
    razorpay_key_preview: process.env.RAZORPAY_KEY_ID ? process.env.RAZORPAY_KEY_ID.substring(0, 12) + '...' : 'Not set',
    cors_origins: [
      'http://localhost:5173',
      'https://reiwametta-foundation-frontend.vercel.app',
      'https://reiwametta-foundation-frontend.vercel.app/'
    ],
    environment_vars: {
      MONGO_DB_URI: process.env.MONGO_DB_URI ? '✅ Set' : '❌ Missing',
      RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID ? '✅ Set' : '❌ Missing',
      RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET ? '✅ Set' : '❌ Missing',
      RAZORPAY_PLAN_ID: process.env.RAZORPAY_PLAN_ID ? '✅ Set' : '❌ Missing'
    },
    help: mongoStatus !== 1 ? 'If MongoDB is not connected, whitelist Vercel IPs in MongoDB Atlas Network Access' : null
  });
});

// Test Razorpay connection endpoint
app.get('/test-razorpay', async (req, res) => {
  try {
    console.log('🧪 Testing Razorpay connection...');
    
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ 
        error: 'Razorpay credentials not configured',
        key_id: process.env.RAZORPAY_KEY_ID ? 'Set' : 'Missing',
        key_secret: process.env.RAZORPAY_KEY_SECRET ? 'Set' : 'Missing'
      });
    }

    // Try to fetch payment methods to test the connection
    const result = await razorpay.payments.all({ count: 1 });
    
    res.json({
      status: '✅ Razorpay connection successful',
      key_id: process.env.RAZORPAY_KEY_ID.substring(0, 12) + '...',
      test_result: 'API accessible'
    });
  } catch (error) {
    console.error('❌ Razorpay test failed:', error);
    res.status(500).json({
      error: 'Razorpay connection failed',
      message: error.message,
      key_id: process.env.RAZORPAY_KEY_ID ? process.env.RAZORPAY_KEY_ID.substring(0, 12) + '...' : 'Not set'
    });
  }
});

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID, // set in .env
  key_secret: process.env.RAZORPAY_KEY_SECRET, // set in .env
});

console.log('🔑 Razorpay Key ID configured:', process.env.RAZORPAY_KEY_ID ? 'YES' : 'NO');
console.log('🔐 Razorpay Secret configured:', process.env.RAZORPAY_KEY_SECRET ? 'YES' : 'NO');

// POST /create-subscription
app.post('/create-subscription', async (req, res) => {
  console.log('=== CREATE SUBSCRIPTION REQUEST ===');
  console.log('Request body:', req.body);
  console.log('Request headers:', req.headers);
  
  const { amount, name, email, contact, address, pincode, message } = req.body;
  console.log('Received subscription request:', { amount, name, email, contact, address, pincode, message });
  
  try {
    // Validate required fields
    if (!amount || amount <= 0) {
      console.log('Validation failed: Invalid amount:', amount);
      return res.status(400).json({ error: 'Valid amount is required', received: amount });
    }

    // Create a plan if you don't have one already (do this once in dashboard or via API)
    // Here, we use a fixed plan_id for monthly recurring
    const plan_id = process.env.RAZORPAY_PLAN_ID; // set in .env (create plan in dashboard)
    
    if (!plan_id) {
      console.log('Validation failed: No plan ID configured');
      return res.status(500).json({ error: 'Razorpay plan ID not configured' });
    }
    
    console.log('Creating subscription with plan_id:', plan_id);

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
    
    console.log('Razorpay subscription created:', subscription.id);

    // Save donation record to database
    try {
      if (mongoose.connection.readyState !== 1) {
        console.log('⚠️  MongoDB not connected, skipping database save');
        return res.json({ 
          subscription_id: subscription.id,
          warning: 'Database not available - subscription created but not saved locally'
        });
      }

      const donation = new Donation({
        name,
        email,
        contact,
        address,
        pincode,
        amount,
        isRecurring: true,
        subscriptionId: subscription.id,
        status: 'subscription_created',
        message
      });
      
      await donation.save();
      console.log('✅ Donation record saved to database');
    } catch (dbError) {
      console.error('❌ Database save error (subscription still created):', dbError.message);
      // Continue even if database save fails - subscription was created
    }

    res.json({ subscription_id: subscription.id });
  } catch (err) {
    console.error('Error creating subscription:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /save-payment - for one-time donations
app.post('/save-payment', async (req, res) => {
  try {
    console.log('💰 Received payment data:', req.body);
    console.log('🔍 MongoDB connection state:', mongoose.connection.readyState);
    
    if (mongoose.connection.readyState !== 1) {
      console.log('⚠️  MongoDB not connected, payment received but not saved');
      console.log('📊 Connection states: 0=disconnected, 1=connected, 2=connecting, 3=disconnecting');
      console.log('🔧 Current state:', mongoose.connection.readyState);
      
      return res.status(503).json({ 
        success: false,
        error: 'Database not available',
        mongodb_state: mongoose.connection.readyState,
        message: 'Payment successful but database not available for saving'
      });
    }
    
    const { paymentId, amount, name, email, contact, address, pincode, message } = req.body;
    
    // Validate required fields
    if (!paymentId || !amount) {
      console.log('❌ Validation failed: Missing required fields');
      console.log('PaymentId:', paymentId, 'Amount:', amount);
      return res.status(400).json({ 
        error: 'Missing payment ID or amount',
        received: { paymentId, amount }
      });
    }
    
    console.log('✅ Creating donation record...');
    const donation = new Donation({
      name: String(name || ''),
      email: String(email || ''),
      contact: String(contact || ''),
      address: String(address || ''),
      pincode: String(pincode || ''),
      amount: Number(amount),
      isRecurring: false,
      paymentId: String(paymentId),
      status: 'completed',
      message: String(message || '')
    });
    
    console.log('💾 Saving to database...');
    const savedDonation = await donation.save();
    console.log('✅ One-time donation saved to database with ID:', savedDonation._id);
    
    res.json({ 
      success: true, 
      message: 'Donation saved successfully',
      donationId: savedDonation._id,
      paymentId: paymentId
    });
  } catch (err) {
    console.error('❌ Error saving payment:', err.message);
    console.error('📋 Full error:', err);
    res.status(500).json({ 
      success: false,
      error: err.message,
      details: err.name
    });
  }
});

// GET /donations - to fetch all donations
app.get('/donations', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ 
        error: 'Database not connected',
        mongodb_state: mongoose.connection.readyState
      });
    }
    
    const donations = await Donation.find().sort({ createdAt: -1 });
    console.log(`📊 Fetched ${donations.length} donations from database`);
    res.json({
      success: true,
      count: donations.length,
      donations: donations
    });
  } catch (err) {
    console.error('Error fetching donations:', err);
    res.status(500).json({ error: err.message });
  }
});

// Test database connection endpoint
app.get('/test-db', async (req, res) => {
  try {
    console.log('🧪 Testing database connection...');
    
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        status: 'Database not connected',
        mongodb_state: mongoose.connection.readyState,
        state_meaning: {
          0: 'Disconnected',
          1: 'Connected',
          2: 'Connecting', 
          3: 'Disconnecting'
        }[mongoose.connection.readyState]
      });
    }
    
    // Try to perform a simple operation
    const testDoc = new Donation({
      name: 'Test User',
      email: 'test@example.com',
      amount: 1,
      isRecurring: false,
      paymentId: 'test_payment_' + Date.now(),
      status: 'test'
    });
    
    const saved = await testDoc.save();
    console.log('✅ Test document saved with ID:', saved._id);
    
    // Delete the test document
    await Donation.deleteOne({ _id: saved._id });
    console.log('🗑️ Test document deleted');
    
    res.json({
      status: '✅ Database connection working',
      test_result: 'Successfully created and deleted test document',
      mongodb_state: mongoose.connection.readyState
    });
  } catch (err) {
    console.error('❌ Database test failed:', err);
    res.status(500).json({
      status: 'Database test failed',
      error: err.message,
      mongodb_state: mongoose.connection.readyState
    });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
