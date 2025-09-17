import React from 'react';
import './components.css';

export default function Pagination({ pagination, onPageChange }) {
  const { page, pages, total } = pagination || { page: 1, pages: 1, total: 0 };
  
  if (!pagination || total === 0) return null;
  
  const pageNumbers = [];
  const maxPagesToShow = 5;
  
  let startPage = Math.max(1, page - Math.floor(maxPagesToShow / 2));
  let endPage = Math.min(pages, startPage + maxPagesToShow - 1);
  
  if (endPage - startPage + 1 < maxPagesToShow) {
    startPage = Math.max(1, endPage - maxPagesToShow + 1);
  }
  
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }
  
  return (
    <div className="pagination">
      <button 
        onClick={() => onPageChange(1)} 
        disabled={page === 1}
        className="page-btn"
        aria-label="First page"
      >
        &laquo;
      </button>
      
      <button 
        onClick={() => onPageChange(page - 1)} 
        disabled={page === 1}
        className="page-btn"
        aria-label="Previous page"
      >
        &lsaquo;
      </button>
      
      {pageNumbers.map(number => (
        <button
          key={number}
          onClick={() => onPageChange(number)}
          className={`page-btn ${page === number ? 'active' : ''}`}
          aria-current={page === number ? 'page' : undefined}
        >
          {number}
        </button>
      ))}
      
      <button 
        onClick={() => onPageChange(page + 1)} 
        disabled={page === pages}
        className="page-btn"
        aria-label="Next page"
      >
        &rsaquo;
      </button>
      
      <button 
        onClick={() => onPageChange(pages)} 
        disabled={page === pages}
        className="page-btn"
        aria-label="Last page"
      >
        &raquo;
      </button>
      
      <div className="page-info">
        Page {page} of {pages} ({total} items)
      </div>
    </div>
  );
}
