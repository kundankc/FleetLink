import React from 'react';
import './components.css';

export default function Spinner({ size = 18 }) {
  return <div style={{ width: size, height: size, borderRadius: 9999, border: '3px solid rgba(0,0,0,0.08)', borderTopColor: '#2563eb', animation: 'spin 1s linear infinite' }} />;
}
