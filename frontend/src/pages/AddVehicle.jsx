import React, { useState } from 'react';
import API from '../services/api';
import './pages.css';

export default function AddVehicle() {
  const [form, setForm] = useState({ name: '', capacityKg: '', tyres: '' });
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  const onChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setMsg(null);
    setLoading(true);
    try {
      const payload = { name: form.name, capacityKg: Number(form.capacityKg), tyres: Number(form.tyres) };
      const res = await API.post('/vehicles', payload);
      setMsg({ type: 'success', text: `Created vehicle: ${res.data.name}` });
      setForm({ name: '', capacityKg: '', tyres: '' });
    } catch (err) {
      setMsg({ type: 'error', text: err?.response?.data?.error || 'Error creating vehicle' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <h2>Add Vehicle</h2>
      <div className="form">
        <form onSubmit={submit}>
          <div className="field">
            <label>Name</label>
            <input name="name" value={form.name} onChange={onChange} required />
          </div>
          <div className="field">
            <label>Capacity (KG)</label>
            <input name="capacityKg" type="number" value={form.capacityKg} onChange={onChange} required />
          </div>
          <div className="field">
            <label>Tyres</label>
            <input name="tyres" type="number" value={form.tyres} onChange={onChange} required />
          </div>
          <div className="actions">
            <button className="btn" type="submit" disabled={loading}>{loading ? 'Saving...' : 'Add Vehicle'}</button>
          </div>
        </form>
        {msg && (
          <div className={`msg ${msg.type === 'error' ? 'error' : 'success'}`}>{msg.text}</div>
        )}
      </div>
    </div>
  );
}
