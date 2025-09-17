import React, { useEffect, useState } from 'react';
import API from '../services/api';
import '../pages/pages.css';
import Spinner from '../components/Spinner';
import Pagination from '../components/Pagination';

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [msg, setMsg] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 5, total: 0, pages: 1 });

  const load = async (page = 1) => {
    setLoading(true);
    setMsg(null);
    try {
      const res = await API.get('/bookings', { params: { page, limit: pagination.limit } });
      setBookings(res.data.bookings);
      setPagination(res.data.pagination);
    } catch (err) {
      setMsg({ type: 'error', text: err?.response?.data?.error || 'Failed to load bookings' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handlePageChange = (page) => {
    load(page);
  };

  const cancel = async (id) => {
    setBusyId(id);
    setMsg(null);
    try {
      await API.delete(`/bookings/${id}`);
      setBookings(bookings.filter(b => b._id !== id));
      setMsg({ type: 'success', text: 'Booking cancelled successfully' });
    } catch (err) {
      setMsg({ type: 'error', text: err?.response?.data?.error || 'Failed to cancel booking' });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="page">
      <h2>Bookings</h2>
      <div className="form">
        {msg && <div className={`msg ${msg.type === 'error' ? 'error' : 'success'}`}>{msg.text}</div>}
        {loading ? <Spinner /> : (
          bookings.length === 0 ? <div>No bookings found</div> : (
            <div style={{ display: 'grid', gap: 10 }}>
              {bookings.map(b => (
                <div key={b._id} className="card">
                  <div className="title">{b.vehicleId?.name || 'Vehicle'}</div>
                  <div className="meta">From: {b.fromPincode} → To: {b.toPincode}</div>
                  <div className="meta">Start: {new Date(b.startTime).toLocaleString()}</div>
                  <div className="meta">Duration: {b.estimatedRideDurationHours} hours</div>
                  <div className="foot">
                    <div />
                    <button className="book" onClick={() => cancel(b._id)} disabled={busyId === b._id}>{busyId === b._id ? <Spinner size={14} /> : 'Cancel'}</button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
        
        {!loading && bookings.length > 0 && (
          <Pagination 
            pagination={pagination} 
            onPageChange={handlePageChange} 
          />
        )}
      </div>
    </div>
  );
}
