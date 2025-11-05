import React, { useState } from 'react';

const amountOptions = [100, 250, 500, 1000, 2000];
// Use Vite env var VITE_API_URL for API base, fallback to localhost:8080 for local backend
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const DonateNow = () => {
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [autoPay, setAutoPay] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contact: '',
    address: '',
    pincode: '',
    message: '',
  });
  const [subscriptionId, setSubscriptionId] = useState(null);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Function to save payment data to database
  const savePaymentToDatabase = async (paymentData) => {
    try {
      console.log('💾 Saving payment data:', paymentData); // Debug log
      
      // Clean and validate data before sending
      const cleanData = {
        paymentId: String(paymentData.paymentId || ''),
        amount: Number(paymentData.amount) || 0,
        name: String(paymentData.name || ''),
        email: String(paymentData.email || ''),
        contact: String(paymentData.contact || ''),
        address: String(paymentData.address || ''),
        pincode: String(paymentData.pincode || ''),
        message: String(paymentData.message || '')
        , isRecurring: Boolean(paymentData.isRecurring || false)
        , subscriptionId: paymentData.subscriptionId || null
      };
      
      console.log('📤 Clean data to send:', cleanData);
      
  // Use configured API base or fallback to http://localhost:8080
  // e.g. set VITE_API_URL to production backend URL in .env
  const response = await fetch(`${API_BASE}/save-payment`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(cleanData),
      });
      
      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Server response error:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      const result = await response.json();
      console.log('✅ Payment saved to database:', result);
      
        if (result.success) {
        alert('✅ Payment data saved successfully!');
        console.log('💰 Donation ID:', result.donationId);
      } else {
        console.warn('⚠️ Database save warning:', result);
        alert('⚠️ Payment successful but database save failed: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('❌ Error saving payment to database:', error);
      alert('❌ Failed to save payment data: ' + error.message);
    }
  };

  const handlePayment = async () => {
    const res = await loadRazorpayScript();
    if (!res) {
      alert("Razorpay SDK failed to load. Check your internet connection.");
      return;
    }

    let options = {
      key: "rzp_live_VmUHSwmTktjf2l", // Live Razorpay key
      // For subscriptions, we'll set subscription_id instead of amount
      amount: autoPay ? undefined : selectedAmount * 100,
      currency: "INR",
      name: "Reiwametta Foundation",
      description: autoPay ? "Monthly Recurring Donation" : "Donation",
      image: "/logo.png", // Path to your logo in public folder
      handler: async function (response) {
        // response.razorpay_payment_id is available for payment events
        alert((autoPay ? 'Monthly' : 'Payment') + " successful! Payment ID: " + response.razorpay_payment_id);

        // Save payment (recurring or one-time) to database for our records
        await savePaymentToDatabase({
          paymentId: response.razorpay_payment_id,
          amount: selectedAmount,
          name: formData.name,
          email: formData.email,
          contact: formData.contact,
          address: formData.address,
          pincode: formData.pincode,
          message: formData.message + (autoPay ? " (Monthly Recurring)" : ""),
        });
      },
      prefill: {
        name: formData.name,
        email: formData.email,
        contact: formData.contact,
      },
      theme: {
        color: "#EAB308",
      },
    };
    // If autoPay (recurring) is requested, create a subscription on the server first
    if (autoPay) {
      try {
        const subRes = await fetch(`${API_BASE}/create-subscription`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: formData.name, email: formData.email, contact: formData.contact })
        });

        if (!subRes.ok) {
          const txt = await subRes.text();
          throw new Error(`Subscription creation failed: ${subRes.status} ${txt}`);
        }

        const subJson = await subRes.json();
        const subscriptionId = subJson.subscriptionId || subJson.subscription?.id;
        if (!subscriptionId) throw new Error('No subscription id returned from server');

        // Attach subscription id to Razorpay checkout options and remember it
        options.subscription_id = subscriptionId;
        setSubscriptionId(subscriptionId);
      } catch (err) {
        console.error('❌ Error creating subscription:', err);
        alert('❌ Could not create subscription: ' + err.message);
        return;
      }
    }

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
  };

  const handleAmountClick = (amount) => {
    setSelectedAmount(amount);
    setCustomAmount('');
    setShowForm(true);
  };

  const handleCustomAmountChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setCustomAmount(value);
    setSelectedAmount(value ? parseInt(value, 10) : null);
    setShowForm(!!value);
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-gradient-to-br from-blue-50 to-yellow-50 rounded-2xl shadow-lg mt-8">
      <h2 className="text-3xl font-extrabold mb-6 text-center text-yellow-500 tracking-tight drop-shadow">Donate Now</h2>

      <div className="flex flex-col md:flex-row md:justify-center gap-4 mb-4">
        {amountOptions.map((amount) => (
          <button
            key={amount}
            type="button"
            onClick={() => handleAmountClick(amount)}
            className={`flex-1 py-3 px-6 rounded-xl font-semibold border-2 transition-all duration-200 shadow-sm focus:outline-none focus:ring-2   ${
              selectedAmount === amount && !customAmount
                ? 'bg-yellow-500 text-white border-yellow-500 scale-105 shadow-lg'
                : 'bg-white text-yellow-500 hover:bg-blue-100'
            }`}
          >
            ₹{amount}
          </button>
        ))}
      </div>

      {/* Custom Amount Section */}
      <div className="mb-4 flex flex-col items-center">
        <label className="text-gray-700 font-medium mb-1" htmlFor="custom-amount">Or enter a custom amount</label>
        <input
          id="custom-amount"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="Enter amount (min ₹100)"
          value={customAmount}
          onChange={handleCustomAmountChange}
          className="w-48 p-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 text-center text-lg font-semibold text-yellow-500 shadow-sm"
        />
      </div>

      {/* Auto Pay Toggle */}
      <div className="mb-8 flex items-center justify-center">
        <input
          id="auto-pay"
          type="checkbox"
          checked={autoPay}
          onChange={() => setAutoPay((prev) => !prev)}
          className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-400"
        />
        <label htmlFor="auto-pay" className="ml-2 text-yellow-500 font-medium select-none">
          Mark as Monthly Donation
        </label>
      </div>

      {showForm && (
        <div className="bg-white p-6 border border-blue-100 rounded-2xl shadow space-y-4 animate-fade-in">
          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 text-gray-800"
            />
            <input
              type="email"
              name="email"
              placeholder="Your Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 text-gray-800"
            />
            <input
              type="tel"
              name="contact"
              placeholder="Your Phone"
              value={formData.contact}
              onChange={handleChange}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 text-gray-800"
            />
            <input
              type="text"
              name="address"
              placeholder="Address"
              value={formData.address}
              onChange={handleChange}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 text-gray-800"
            />
            <input
              type="text"
              name="pincode"
              placeholder="Pincode"
              value={formData.pincode}
              onChange={handleChange}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 text-gray-800"
            />
          </div>
          <textarea
            name="message"
            placeholder="Write a message (optional)"
            value={formData.message}
            onChange={handleChange}
            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 text-gray-800 resize-none"
            rows={3}
          />
        </div>
      )}

      {showForm && (
        <button
          onClick={handlePayment}
          className="w-full py-3 mt-4 rounded-xl font-bold text-lg shadow-md transition-all duration-200 focus:outline-none focus:ring-2 bg-yellow-500 text-white hover:bg-yellow-600 scale-105 cursor-pointer"
        >
          Donate ₹{selectedAmount}
        </button>
      )}
    </div>
  );
};

export default DonateNow;
