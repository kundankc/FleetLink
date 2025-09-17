import React from 'react';
import './components.css';

export default function VehicleCard({ v, onBook, busy = false, disabled = false }) {
  return (
    <div className="card">
      <div className="title">{v.name}</div>
      <div className="meta">Capacity: <strong>{v.capacityKg} kg</strong></div>
      <div className="meta">Tyres: <strong>{v.tyres}</strong></div>
      <div className="meta">Estimated Duration: <strong>{v.estimatedRideDurationHours} hours</strong></div>
      <div className="foot">
        <div className="meta" />
        <button className="book" onClick={() => onBook(v)} disabled={busy || disabled}>
          {busy ? 'Booking...' : 'Book Now'}
        </button>
      </div>
    </div>
  );
}
