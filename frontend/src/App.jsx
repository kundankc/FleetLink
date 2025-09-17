import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import AddVehicle from './pages/AddVehicle.jsx';
import SearchBook from './pages/SearchBook.jsx';
import Bookings from './pages/Bookings.jsx';

function App() {
  return (
    <div>
      <header className="app-header">
        <div className="wrap">
          <h1>FleetLink</h1>
          <nav>
            <Link to="/">Search & Book</Link>
            <Link to="/add">Add Vehicle</Link>
            <Link to="/bookings" style={{ marginLeft: 12 }}>Bookings</Link>
          </nav>
        </div>
      </header>

      <main className="app-container">
        <Routes>
          <Route path="/" element={<SearchBook />} />
          <Route path="/add" element={<AddVehicle />} />
          <Route path="/bookings" element={<Bookings />} />
        </Routes>
      </main>

      <footer className="app-footer">
        <div className="wrap">
          <div>FleetLink © {new Date().getFullYear()}</div>
        </div>
      </footer>
    </div>
  );
}

export default App;
