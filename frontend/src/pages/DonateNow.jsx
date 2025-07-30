import React, { useState } from 'react';

const amountOptions = [100, 250, 500, 1000, 2000];

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

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    const res = await loadRazorpayScript();
    if (!res) {
      alert("Razorpay SDK failed to load. Check your internet connection.");
      return;
    }

    let options = {
      key: "rzp_live_VmUHSwmTktjf2l", // Live Razorpay key
      amount: selectedAmount * 100,
      currency: "INR",
      name: "Reiwametta Foundation",
      description: autoPay ? "Monthly Recurring Donation" : "Donation",
      image: "/logo.png", // Path to your logo in public folder
      handler: function (response) {
        if (autoPay) {
          alert("Subscription successful! Subscription ID: " + response.razorpay_subscription_id);
        } else {
          alert("Payment successful! Payment ID: " + response.razorpay_payment_id);
        }
        console.log("User Message:", formData.message); // You can send this to your backend
      },
      prefill: {
        name: formData.name,
        email: formData.email,
        contact: formData.contact,
      },
      theme: {
        color: "#bg-yellow-500",
      },
    };

    if (autoPay) {
      // Call backend to create a real subscription and get subscription_id
      try {
        const response = await fetch("https://backend.reiwamettafoundations.org/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: selectedAmount,
            name: formData.name,
            email: formData.email,
            contact: formData.contact,
          }),
        });
        const data = await response.json();
        if (!data.subscription_id) {
          alert("Failed to create subscription. Please try again.");
          return;
        }
        options.subscription_id = data.subscription_id;
        delete options.amount; // Remove amount for subscriptions
      } catch (err) {
        alert("Error creating subscription: " + err.message);
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
          placeholder="Enter amount (min ₹1)"
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
          Auto Pay (Monthly Recurring)
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
          disabled={
            !selectedAmount ||
            !formData.name ||
            !formData.email ||
            !formData.contact ||
            !formData.address ||
            !formData.pincode
          }
          className={`w-full py-3 mt-4 rounded-xl font-bold text-lg shadow-md transition-all duration-200 focus:outline-none focus:ring-2  cursor-pointer ${
            selectedAmount && formData.name && formData.email && formData.contact && formData.address && formData.pincode
              ? 'bg-yellow-500 text-white hover:bg-yellow-500 scale-105'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Donate ₹{selectedAmount}
        </button>
      )}
    </div>
  );
};

export default DonateNow;
