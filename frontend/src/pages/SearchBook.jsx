import React, { useState, useEffect } from 'react';
import API from '../services/api';
import VehicleCard from '../components/VehicleCard';
import Pagination from '../components/Pagination';
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
  const [minDate, setMinDate] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 5, total: 0, pages: 1 });
  
  useEffect(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    setMinDate(`${year}-${month}-${day}T00:00`);
  }, []);

  const onChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  
  const validatePincode = (pincode) => {
    const pincodeRegex = /^\d{5,6}$/;
    return pincodeRegex.test(pincode);
  };

  const search = async (e, page = 1) => {
    e?.preventDefault();
    setMsg(null);
    setResults([]);
    
    if (!validatePincode(form.fromPincode)) {
      setMsg({ type: 'error', text: 'From pincode must be 5-6 digits' });
      return;
    }
    if (!validatePincode(form.toPincode)) {
      setMsg({ type: 'error', text: 'To pincode must be 5-6 digits' });
      return;
    }
    
    setLoading(true);
    try {
      const params = { ...form, page, limit: pagination.limit };
      if (params.startTime) {
        const d = new Date(params.startTime);
        params.startTime = d.toISOString();
      }
      const res = await API.get('/vehicles/available', { params });
      setResults(res.data.vehicles);
      setPagination(res.data.pagination);
      if (res.data.vehicles.length === 0) setMsg({ type: 'info', text: 'No vehicles available' });
    } catch (err) {
      setMsg({ type: 'error', text: err?.response?.data?.error || 'Search failed' });
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    search(null, page);
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
            <input 
              name="fromPincode" 
              value={form.fromPincode} 
              onChange={onChange}
              pattern="\d{5,6}"
              title="Pincode must be 5-6 digits"
              required
            />
          </div>
          <div className="field">
            <label>To Pincode</label>
            <input 
              name="toPincode" 
              value={form.toPincode} 
              onChange={onChange}
              pattern="\d{5,6}"
              title="Pincode must be 5-6 digits"
              required
            />
          </div>
          <div className="field">
            <label>Start Time</label>
            <input 
              name="startTime" 
              type="datetime-local" 
              value={form.startTime} 
              onChange={onChange}
              min={minDate}
              required
            />
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
        
        {results.length > 0 && (
          <Pagination 
            pagination={pagination} 
            onPageChange={handlePageChange} 
          />
        )}
      </div>
    </div>
  );
}
