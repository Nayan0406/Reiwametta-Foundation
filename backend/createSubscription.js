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

// Add retry logic for MongoDB connection with better error reporting
const connectDB = async () => {
  try {
    console.log("🔗 Attempting MongoDB connection...");
    console.log("🔍 Connection URI (masked):", process.env.MONGO_DB_URI?.replace(/\/\/.*@/, '//***:***@'));
    
    await mongoose.connect(process.env.MONGO_DB_URI, {
      serverSelectionTimeoutMS: 5000, // Fail fast - 5 seconds
      connectTimeoutMS: 5000, // Connection timeout
      socketTimeoutMS: 5000, // Socket timeout
      family: 4, // Use IPv4, skip trying IPv6
      maxPoolSize: 10,
      retryWrites: true,
      w: 'majority'
    });
    console.log("✅ MongoDB connected successfully");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    console.error("🔍 Error code:", err.code);
    console.error("🔍 Error name:", err.name);
    if (err.reason) {
      console.error("🔍 Error reason:", err.reason);
    }
    
    // Common error messages and solutions
    if (err.message.includes('ENOTFOUND')) {
      console.error("💡 Solution: Check your cluster hostname in the connection string");
    } else if (err.message.includes('authentication failed')) {
      console.error("💡 Solution: Check your username and password in MongoDB Atlas");
    } else if (err.message.includes('bad auth')) {
      console.error("💡 Solution: Verify MongoDB user credentials");
    } else if (err.message.includes('timeout')) {
      console.error("� Solution: Check Network Access in MongoDB Atlas - add 0.0.0.0/0");
    }
    
    console.log("�🔄 Retrying MongoDB connection in 10 seconds...");
    setTimeout(connectDB, 10000); // Retry after 10 seconds
  }
};

connectDB();

const app = express();
app.use(cors({ 
  origin: [
    'http://localhost:5173',
    'https://reiwametta-foundation-frontend.vercel.app',
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

// Health check endpoint with detailed connection info
app.get('/', (req, res) => {
  const mongoStatus = mongoose.connection.readyState;
  const mongoStatusText = {
    0: '❌ Disconnected',
    1: '✅ Connected', 
    2: '🔄 Connecting',
    3: '⚠️  Disconnecting'
  }[mongoStatus] || '❓ Unknown';

  // Get detailed connection info
  const connectionInfo = {
    host: mongoose.connection.host || 'Not connected',
    name: mongoose.connection.name || 'No database selected',
    port: mongoose.connection.port || 'Unknown',
    readyState: mongoStatus
  };

  res.json({ 
    status: '✅ Backend is running',
    timestamp: new Date().toISOString(),
    mongodb: mongoStatusText,
    mongodb_ready: mongoStatus === 1,
    mongodb_state_code: mongoStatus,
    mongodb_details: connectionInfo,
    connection_uri_check: {
      uri_provided: !!process.env.MONGO_DB_URI,
      uri_format_ok: process.env.MONGO_DB_URI?.includes('mongodb+srv://'),
      has_database_name: process.env.MONGO_DB_URI?.includes('/reiwametta_foundation'),
      uri_preview: process.env.MONGO_DB_URI?.replace(/\/\/.*@/, '//***:***@')
    },
    razorpay_key: process.env.RAZORPAY_KEY_ID ? '✅ Configured' : '❌ Missing',
    razorpay_key_preview: process.env.RAZORPAY_KEY_ID ? process.env.RAZORPAY_KEY_ID.substring(0, 12) + '...' : 'Not set',
    cors_origins: [
      'http://localhost:5173',
      'https://reiwametta-foundation-frontend.vercel.app',
    ],
    environment_vars: {
      MONGO_DB_URI: process.env.MONGO_DB_URI ? '✅ Set' : '❌ Missing',
      RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID ? '✅ Set' : '❌ Missing',
      RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET ? '✅ Set' : '❌ Missing',
      RAZORPAY_PLAN_ID: process.env.RAZORPAY_PLAN_ID ? '✅ Set' : '❌ Missing'
    },
    troubleshooting: mongoStatus !== 1 ? {
      step1: 'Check MongoDB Atlas - is your cluster running?',
      step2: 'Check Network Access - add 0.0.0.0/0 to IP whitelist',
      step3: 'Check Database Access - ensure user has read/write permissions',
      step4: 'Verify connection string has correct username, password, and database name'
    } : null
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
