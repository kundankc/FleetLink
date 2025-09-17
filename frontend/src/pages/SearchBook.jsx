import React, { useState } from 'react';
import API from '../services/api';
import VehicleCard from '../components/VehicleCard';
import './pages.css';

export default function SearchBook() {
  const [form, setForm] = useState({
    capacityRequired: '',
    fromPincode: '',
    toPincode: '',
    startTime: ''
  });
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [busyMap, setBusyMap] = useState({});
  const [msg, setMsg] = useState(null);

  const onChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const search = async (e) => {
    e?.preventDefault();
    setMsg(null);
    setResults([]);
    setLoading(true);
    try {
      const params = { ...form };
      if (params.startTime) {
        const d = new Date(params.startTime);
        params.startTime = d.toISOString();
      }
      const res = await API.get('/vehicles/available', { params });
      setResults(res.data);
      if (res.data.length === 0) setMsg({ type: 'info', text: 'No vehicles available' });
    } catch (err) {
      setMsg({ type: 'error', text: err?.response?.data?.error || 'Search failed' });
    } finally {
      setLoading(false);
    }
  };

  const bookNow = async (vehicle) => {
    setMsg(null);
    setBusyMap(prev => ({ ...prev, [vehicle._id]: true }));
    try {
      const payload = {
        vehicleId: vehicle._id,
        fromPincode: form.fromPincode,
        toPincode: form.toPincode,
        startTime: form.startTime,
        customerId: 'demo-customer-1'
      };
      const res = await API.post('/bookings', payload);
      setMsg({ type: 'success', text: `Booking created: ${res.data._id}` });
      // refresh search results
      await search();
    } catch (err) {
      setMsg({ type: 'error', text: err?.response?.data?.error || 'Booking failed' });
    }
    finally {
      setBusyMap(prev => {
        const next = { ...prev };
        delete next[vehicle._1d];
        delete next[vehicle._id];
        return next;
      });
    }
  };

  return (
    <div className="page">
      <h2>Search & Book</h2>
      <div className="form">
        <form onSubmit={search}>
          <div className="field">
            <label>Capacity Required</label>
            <input name="capacityRequired" value={form.capacityRequired} onChange={onChange} required />
          </div>
          <div className="field">
            <label>From Pincode</label>
            <input name="fromPincode" value={form.fromPincode} onChange={onChange} required />
          </div>
          <div className="field">
            <label>To Pincode</label>
            <input name="toPincode" value={form.toPincode} onChange={onChange} required />
          </div>
          <div className="field">
            <label>Start Time</label>
            <input name="startTime" type="datetime-local" value={form.startTime} onChange={onChange} required />
          </div>
          <div className="actions">
            <button className="btn" type="submit" disabled={loading}>{loading ? 'Searching...' : 'Search Availability'}</button>
          </div>
        </form>
        {msg && <div className={`msg ${msg.type === 'error' ? 'error' : 'success'}`}>{msg.text}</div>}
      </div>

      <div className="results">
        {results.map(v => (
          <VehicleCard
            key={v._id}
            v={v}
            onBook={bookNow}
            busy={!!busyMap[v._id]}
          />
        ))}
      </div>
    </div>
  );
}
