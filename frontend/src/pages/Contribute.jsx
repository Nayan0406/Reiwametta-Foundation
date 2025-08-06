import { useState } from 'react';
import { Link } from 'react-router-dom';

const Contribute = () => {

    const details = [
        { label: "Account Name", value: "Reiwametta Foundation" },
        { label: "Bank/Branch Name", value: "Axis Bank" },
        { label: "Account Number", value: "924010044967907" },
        { label: "IFSC Code", value: "UTIB0003541" },
        { label: "UPI ID", value: "mab.037324035410065@axisbank" }
    ];

    const [frequency, setFrequency] = useState('one-time');
    const [isAnonymous, setIsAnonymous] = useState(false);

    const frequencies = [
        { id: 'one-time', label: 'One Time' },
        { id: 'monthly', label: 'Monthly' },
        { id: 'frequently', label: 'Frequently' }
    ];

    return (
        <>
            <div className="bg-[#FFF3E0] min-h-min p-8 md:p-16">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col-reverse md:flex-row gap-20 items-center">
                        <div className="space-y-6 flex-1">
                            <div className="uppercase text-sm font-medium tracking-wider text-gray-600">
                                Contribute
                            </div>

                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                                Making a donation for our students and children.
                            </h2>

                            <p className="text-gray-600 max-w-lg">
                                When you donate, you&apos;re supporting effective care to children with
                                special needs—an investment in the leaders of tomorrow.
                            </p>

                            <Link to="/donateNow">
                                <button className="bg-yellow-500 text-white px-4 py-2 rounded cursor-pointer  transition-colors">
                                    Donate Now
                                </button>
                            </Link>
                        </div>

                        <div className="relative flex-1 flex justify-center">
                            <img
                                src="/donate-img.png"
                                alt="Donation box being held"
                                className="rounded-lg object-cover w-96 h-full shadow-lg"
                            />
                        </div>
                    </div>
                </div>
            </div>
            

            {/* Donation Section */}

            <div className="max-w-4xl mx-auto p-6 space-y-8">
                {/* Header Section */}
                {/* <div className="space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Donate !</h1>
                        <p className="text-gray-600">
                            Your support makes the difference – it helps Miginalised communities transform
                            their lives. To make the difference, donate now!
                        </p>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Donate !</h2>
                        <p className="text-gray-600">
                            Help our organization by donating today! All donations go directly to making a
                            difference for our cause.
                        </p>
                    </div>
                </div>
{/*  */}
                {/* Donation Frequency Tabs */}
                {/* <div className="border-b border-gray-200">
                    <div className="flex space-x-4">
                        {frequencies.map((freq) => (
                            <button
                                key={freq.id}
                                className={`pb-2 px-4 ${frequency === freq.id
                                    ? 'border-b-2 border-yellow-400 text-gray-900'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                onClick={() => setFrequency(freq.id)}
                            >
                                {freq.label}
                            </button>
                        ))}
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                        Choose your donation frequency.
                    </p>
                </div>

                // {/* Secure Donation Label 
                <div className="text-lg font-semibold text-gray-900">
                    100% Secure Donation
                </div> */} 

                {/* Donation Form */}
                {/* <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-gray-700 mb-2">
                                How much would you like to donate today?
                            </label>
                            <input
                                type="text"
                                placeholder="Enter the Amount"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 mb-2">
                                Who&apos;s giving today?
                            </label>
                            <p className="text-sm text-gray-500 mb-2">
                                We&apos;ll never share this information with anyone.
                            </p>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <input
                                    type="text"
                                    placeholder="First Name"
                                    className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                                />
                                <input
                                    type="text"
                                    placeholder="Last Name"
                                    className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                                />
                            </div>
                            <input
                                type="email"
                                placeholder="Email Address"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                            />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center mb-4">
                            <input
                                type="checkbox"
                                id="anonymous"
                                checked={isAnonymous}
                                onChange={(e) => setIsAnonymous(e.target.checked)}
                                className="w-4 h-4 text-yellow-400 border-gray-300 rounded focus:ring-yellow-400"
                            />
                            <label htmlFor="anonymous" className="ml-2 text-gray-700">
                                Make this an anonymous donation.
                            </label>
                        </div>
                        <textarea
                            placeholder="Leave a comment with your Donation"
                            rows={6}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                        />
                    </div>
                </div> */}

                {/* Success Story Section */}
                <div className="relative rounded-lg overflow-hidden">
                    <img
                        src="/contribute_img.jpeg"
                        alt="Students"
                        className="w-full h-96 object-cover"
                    />
                    <div className="absolute inset-0  bg-opacity-40 flex items-center justify-center">
                        <div className="text-center px-6">
                            <p className="text-white text-2xl md:text-3xl font-bold mb-6">
                                &quot;33 SRC student cleared the coveted Azeem Premji University&apos;s entrance exam for academic year 2025-26.&quot;
                            </p>
                            {/* <button className="bg-white text-gray-900 px-6 py-2 rounded-md font-medium hover:bg-gray-100 transition-colors">
                                Donate
                            </button> */}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Contribute;
