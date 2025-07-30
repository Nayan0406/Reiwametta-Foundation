// src/App.jsx
// import React from 'react';
// import { MdAdminPanelSettings } from "react-icons/md";
import LoginForm from "./pages/LoginForm";
import { Routes, Route } from "react-router-dom";
import EventForm from "./pages/EventForm";
import Reaches from "./pages/Reaches";
import InitiativeForm from "./pages/InitiativeForm";
import AdminDashboard from "./pages/AdminDashboard";
import AdminPanel from "./pages/AdminPanel";
import TeachersForm from "./pages/TeachersForm";
import SrcForm from "./pages/SrcForm";
import HomeContent from "./pages/HomeContent";
import Mentors from './pages/Mentors';
import Educators from './pages/Educators';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<LoginForm />} />
      {/* <Route path="/admin-panel" element={<Admin-Panel />} /> */}

      {/* Additional routes */}
      <Route path="/eventForm" element={<EventForm />} />

      <Route path="/reaches" element={<Reaches />} />

      <Route path="/initiativeForm" element={<InitiativeForm />} />

      <Route path="/adminDashboard" element={<AdminDashboard />} />

      <Route path="/adminPanel" element={<AdminPanel />} />

      {/* <Route path="/blogForm" element={<BlogForm />} /> */}

      <Route path="/teachersForm" element={<TeachersForm />} />

      <Route path="/srcForm" element={<SrcForm />} />

      <Route path="/homeContent" element={<HomeContent />} />

      <Route path="/mentors" element={<Mentors />} />

      <Route path="/educators" element={<Educators />} />
    </Routes>
  );
};

export default App;
