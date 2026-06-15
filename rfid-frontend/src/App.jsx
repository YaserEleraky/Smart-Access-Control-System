import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import RegisterPerson from "./pages/RegisterPerson";
import RegisteredPeople from "./pages/RegisteredPeople";

function App() {
  return (
    <BrowserRouter>

      <nav className="navbar">
        <h2>RFID Access Control System</h2>

        <div className="nav-links">
          <Link to="/">Dashboard</Link>
          <Link to="/register">Register Person</Link>
          <Link to="/cards">Registered People</Link>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/register" element={<RegisterPerson />} />
        <Route path="/cards" element={<RegisteredPeople />} />
      </Routes>

    </BrowserRouter>
  );
}

export default App;