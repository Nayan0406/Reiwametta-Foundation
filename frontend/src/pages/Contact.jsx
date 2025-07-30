import React, { useState } from 'react';
// import backgroundImage from '../assets/contactbg.png';

const Contact = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        subject: '',
        message: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Form submitted:', formData);
        alert('Message sent successfully!');
        setFormData({ firstName: '', lastName: '', email: '', subject: '', message: '' });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    return (
        <div className="relative">
            {/* Form Section with Background Image */}
            <div className="relative min-h-screen">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${'./public/contactbg.png'})`, zIndex: -1 }}
                />

                <div className="container mx-auto px-4 py-16 flex justify-end">
                    <div className="w-full max-w-lg bg-black bg-opacity-50 backdrop-blur-md rounded-lg p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    name="firstName"
                                    placeholder="First Name"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 bg-transparent border border-gray-300 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500"
                                    required
                                />
                                <input
                                    type="text"
                                    name="lastName"
                                    placeholder="Last Name"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 bg-transparent border border-gray-300 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500"
                                    required
                                />
                            </div>

                            <input
                                type="email"
                                name="email"
                                placeholder="Email Id"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-transparent border border-gray-300 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500"
                                required
                            />

                            <input
                                type="text"
                                name="subject"
                                placeholder="Subject"
                                value={formData.subject}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-transparent border border-gray-300 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500"
                            />

                            <textarea
                                name="message"
                                placeholder="Type your Message"
                                value={formData.message}
                                onChange={handleChange}
                                rows="4"
                                className="w-full px-4 py-2 bg-transparent border border-gray-300 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 resize-none"
                                required
                            />

                            <button
                                type="submit"
                                className="w-full bg-yellow-500 text-black font-semibold py-2 rounded-md hover:bg-yellow-600 transition-colors duration-300"
                            >
                                Send message
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Contact Information Section */}
            <div className="bg-[#FFF3E0] py-16">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {/* Left Column */}
                        <div className="space-y-6">
                            <div className="uppercase text-sm font-medium tracking-wider text-gray-700">
                                Contact us
                            </div>

                            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                                We'd love to hear <br /> from you
                            </h1>

                            <p className="text-gray-600 max-w-md">
                                Have any questions in mind or want to inquire? Please feel free to
                                contact us through the form or the following details.
                            </p>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-8">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">Let's talk!</h2>
                                <div className="space-y-2 text-gray-700">
                                    <p>📞 +91 90123 46514</p>
                                    <p>✉️ metta.src2024@gmail.com</p>
                                </div>
                            </div>

                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">Address</h2>
                                <p className="text-gray-700 max-w-md">
                                    REIWAMETTA FOUNDATION, 4-20-5/B, Behind C.B.S. Garampani,
                                    Near Kapil Buda, Aurangabad (MH) - 431001, Maharashtra
                                </p>
                            </div>

                            {/* Social Links */}
                            <div className="flex space-x-4">
                                <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-gray-900">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"></path>
                                    </svg>
                                </a>
                                <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-gray-900">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"></path>
                                    </svg>
                                </a>
                                <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-gray-900">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"></path>
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
