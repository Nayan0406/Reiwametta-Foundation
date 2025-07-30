import React from "react";
import { Facebook, Twitter, Instagram, Youtube, Linkedin } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-500 text-white py-6 px-4 sm:px-6 w-full">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-start">
        {/* Logo Section */}
        <div className="flex justify-center md:justify-start">
          <img
            src="/image (31).png"
            alt="Reiwametta Foundation"
            className="w-40 sm:w-52 h-auto"
          />
        </div>

        {/* About Us Section */}
        <div className="text-center md:text-left">
          <h2 className="font-bold text-lg sm:text-xl mb-4">About us</h2>
          <p className="text-sm sm:text-base max-w-xs mx-auto md:mx-0">
            Promoting equal education for marginalized communities | Inspired by
            Dr. Ambedkar & Savitribai Phule | Join the movement! #ShikshaSamtaAndolan
          </p>
        </div>

        {/* Navigation Section */}
        <div className="text-center md:text-left">
          <h2 className="font-bold text-lg sm:text-xl mb-4">Navigation</h2>
          <ul className="space-y-2">
            <li>
              <Link to="/about" className="hover:text-yellow-300 text-sm sm:text-base">
                About Us
              </Link>
            </li>
            <li>
              <Link to="/src" className="hover:text-yellow-300 text-sm sm:text-base">
                SRC
              </Link>
            </li>
            <li>
              <Link to="/events" className="hover:text-yellow-300 text-sm sm:text-base">
                Events
              </Link>
            </li>
            <li>
              <Link to="/initiative" className="hover:text-yellow-300 text-sm sm:text-base">
                Our Initiative
              </Link>
            </li>
          </ul>
        </div>

        {/* Subscribe Section */}
        <div className="text-center md:text-left">
          <h2 className="font-bold text-lg sm:text-xl mb-4">SUBSCRIBE NOW</h2>
          <div className="space-y-4 max-w-xs mx-auto md:mx-0">
            <input
              type="email"
              placeholder="E-Mail Address"
              className="w-full p-2 rounded bg-white text-gray-800 text-sm sm:text-base"
            />
            <button className="bg-yellow-500 text-white px-6 py-2 rounded w-full hover:bg-yellow-600 text-sm sm:text-base">
              Send
            </button>
            {/* Social Media Icons */}
            <div className="flex justify-center md:justify-start space-x-4 mt-4">
              <a href="https://www.facebook.com/savitribairesourcecenter?mibextid=ZbWKwL" className="hover:text-yellow-300" aria-label="Facebook">
                <Facebook className="w-5 h-5 sm:w-6 sm:h-6" />
              </a>
              <a href="https://x.com/src_networks" className="hover:text-yellow-300" aria-label="Twitter">
                <Twitter className="w-5 h-5 sm:w-6 sm:h-6" />
              </a>
              <a href="https://www.instagram.com/src_networks/?igsh=MWdpbHZ2MjloZ2ZkdQ%3D%3D#" className="hover:text-yellow-300" aria-label="Instagram">
                <Instagram className="w-5 h-5 sm:w-6 sm:h-6" />
              </a>
              <a href="https://www.youtube.com/@src_networks" className="hover:text-yellow-300" aria-label="YouTube">
                <Youtube className="w-5 h-5 sm:w-6 sm:h-6" />
              </a>
              <a href="https://www.linkedin.com/company/savitribai-phule-resource-centre/posts/?feedView=all" className="hover:text-yellow-300" aria-label="LinkedIn">
                <Linkedin className="w-5 h-5 sm:w-6 sm:h-6" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Back to Top Button */}
      <div className="flex justify-center md:justify-end p-4 mt-6">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="bg-yellow-500 text-white py-2 px-4 rounded-full hover:bg-yellow-600 text-sm sm:text-base"
        >
          ↑ Back to Top
        </button>
      </div>
    </footer>
  );
};

export default Footer;