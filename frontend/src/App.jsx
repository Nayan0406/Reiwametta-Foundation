
import Home from './pages/Home'
import ScrollToTop from "./components/ScrollToTop";
import Contribute from './pages/Contribute'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Initiative from './pages/Initiative'
import InitiativeSubpage from './pages/InitiativeSubpage'
import Events from './pages/Events'
import Src from './pages/Src'
import About from './pages/About'
import Register from './pages/Register'
import EventSubPage from './pages/EventSubPage'
import { Routes, Route } from 'react-router-dom'
import DonateNow from './pages/DonateNow';


const App = () => {
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/event" element={<Events />} />
        <Route path="/about" element={<About />} />
        <Route path="/src" element={<Src />} />
        <Route path="/register" element={<Register />} />
        <Route path="/contribute" element={<Contribute />} />
        <Route path="/initiative" element={<Initiative />} />
        <Route path="/initiatives/:id" element={<InitiativeSubpage />} />
        <Route path="/events" element={<Events />} />
        <Route path="/eventSubPage/:id" element={<EventSubPage />} />
        <Route path="/donateNow" element={<DonateNow />} />
      </Routes>
      <Footer />
    </>
  )
}

export default App
