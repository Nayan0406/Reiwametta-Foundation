import React, { useState } from "react";
import { Menu, X, Home, Users, Settings, Box, BarChart } from "lucide-react";
import AdminDashboard from "./AdminDashboard";
import InitiativeForm from "./InitiativeForm";

import Reaches from "./Reaches";
import EventForm from "./EventForm";

import TeachersForm from "./TeachersForm";
import MarqueeComponent from "./MarqueeComponent";
import SrcForm from "./SrcForm";
import HomeContent from "./HomeContent";
import Mentors from "./Mentors";
import Educators from "./Educators";
// import ProgramManager from "./ProgramManager";

const AdminPanel = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeContent, setActiveContent] = useState("admindashboard");

  const menuItems = [
    { id: "admindashboard", label: "AdminDashboard", icon: Home },
    { id: "events", label: "Events", icon: Users },
    { id: "initiatives", label: "Initiatives", icon: Box },

    { id: "reaches", label: "Reaches", icon: Settings },

    { id: "TeachersForm", label: "TeachersForm", icon: Settings },
    { id: "MarqueeComponent", label: "MarqueeComponent", icon: Settings },
    { id: "SrcForm", label: "SrcForm", icon: Settings },
    { id: "HomeContent", label: "HomeContent", icon: Settings },
    { id: "Mentors", label: "Mentors", icon: Settings },
    // { id: "ProgramManager", label: "Program Manager", icon: BarChart },
     { id: "Educators", label: "Educators", icon: Settings }
  ];

  const renderContent = () => {
    switch (activeContent) {
      case "admindashboard":
        return <AdminDashboard />;
      case "events":
        return <EventForm />;
      case "initiatives":
        return <InitiativeForm />;

      case "reaches":
        return <Reaches />;

      case "TeachersForm":
        return <TeachersForm />;
      case "MarqueeComponent":
        return <MarqueeComponent />;
      case "SrcForm":
        return <SrcForm />;
      case "HomeContent":
        return <HomeContent />;
        case "Mentors":
          return <Mentors />;
        case "Educators":
          return <Educators />;
     
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Top Navbar with Centered Title and Menu Button */}
      <div className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
        <div className="flex items-center justify-between p-3">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Centered Admin Panel Title */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <h1 className="text-xl font-bold">Admin Panel</h1>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50
          transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold">Admin Menu</h1>
        </div>
        <nav className="mt-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveContent(item.id);
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center px-4 py-2 text-gray-600 hover:bg-gray-100
                  ${activeContent === item.id ? "bg-gray-100 text-blue-600" : ""}
                `}
              >
                <Icon size={20} className="mr-2" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 pt-16">
        <main className="p-4">{renderContent()}</main>
      </div>
    </div>
  );
};

export default AdminPanel;
