import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  Facebook,
  Linkedin,
  Youtube,
  Instagram,
  Twitter,
} from "lucide-react";
import Register from "../pages/Register";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeItem, setActiveItem] = useState("Home");
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const currentPath = location.pathname;

    // Check if the current route is part of the Events section
    if (currentPath.startsWith("/eventsubpage")) {
      setActiveItem("Events");
      return;
    }

    // Otherwise, find the matching nav item
    const matchingNavItem = navItems.find((item) => item.to === currentPath);
    setActiveItem(matchingNavItem ? matchingNavItem.name : "Home");
  }, [location.pathname]);

  const navItems = [
    { name: "Home", to: "/" },
    { name: "About Us", to: "/about" },
    { name: "SRC", to: "/src" },
    { name: "Events", to: "/event" },
    { name: "Our Initiative", to: "/initiative" },
    { name: "Contribute", to: "/contribute" },
  ];

  const socialIcons = [
    {
      Icon: Facebook,
      href: "https://www.facebook.com/savitribairesourcecenter?mibextid=ZbWKwL",
    },
    {
      Icon: Linkedin,
      href: "https://www.linkedin.com/company/savitribai-phule-resource-centre/posts/?feedView=all",
    },
    {
      Icon: Youtube,
      href: "https://www.youtube.com/@src_networks",
    },
    {
      Icon: Instagram,
      href: "https://www.instagram.com/src_networks?igsh=ZHdsamd1NjF6YTNq",
    }, // Updated Instagram link
    { Icon: Twitter, href: "https://x.com/src_networks" },
  ];

  return (
    <nav className="bg-white shadow-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/Home">
              <img
                src="/logo.png"
                alt="Reiwa Meta Logo"
                className="h-10 sm:h-12 w-auto mr-2 cursor-pointer"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {/* Nav Links */}
            <div className="flex space-x-6">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.to}
                  className={`text-sm hover:text-yellow-500 transition-colors duration-300 ${
                    activeItem === item.name
                      ? "text-yellow-500"
                      : "text-gray-700"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Social Icons */}
            <div className="flex items-center space-x-4">
              {socialIcons.map(({ Icon, href }, index) => (
                <a
                  key={index}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-yellow-500 transition-colors duration-300"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>

            {/* Register Button */}
            <button
              onClick={() => setIsRegisterOpen(true)}
              className="bg-yellow-500 text-white px-6 py-2 rounded-full hover:bg-yellow-600 transition-colors duration-300 text-sm"
            >
              Register
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-yellow-500 focus:outline-none"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden bg-white shadow-md absolute top-16 left-0 w-full px-4 py-6 z-50">
          <div className="flex flex-col space-y-4">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.to}
                onClick={() => setIsOpen(false)}
                className={`text-sm hover:text-yellow-500 transition-colors duration-300 ${
                  activeItem === item.name ? "text-yellow-500" : "text-gray-700"
                }`}
              >
                {item.name}
              </Link>
            ))}

            {/* Social Icons in Mobile View */}
            <div className="flex justify-center space-x-4 mt-4">
              {socialIcons.map(({ Icon, href }, index) => (
                <a
                  key={index}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-yellow-500 transition-colors duration-300"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>

            {/* Register Button */}
            <button
              onClick={() => {
                setIsRegisterOpen(true);
                setIsOpen(false);
              }}
              className="bg-yellow-500 text-white px-6 py-2 rounded-full hover:bg-yellow-600 transition-colors duration-300 text-sm w-full"
            >
              Register
            </button>
          </div>
        </div>
      )}

      {/* Register Modal */}
      {isRegisterOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-200 opacity-95">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg w-full max-w-4xl max-h-screen overflow-y-auto relative">
            <Register onClose={() => setIsRegisterOpen(false)} />
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;