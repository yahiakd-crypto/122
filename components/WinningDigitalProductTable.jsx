import React, { useState, useMemo } from 'react';
import { Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';

export default function WinningDigitalProductTable({ data }) {
  const [search, setSearch] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'opportunity_score', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Try to extract an array of products from the data
  const products = useMemo(() => {
    let parsedData = data;
    if (typeof data === 'string') {
      try {
        const cleaned = data.replace(/```json\s*/, '').replace(/```\s*$/, '').trim();
        parsedData = JSON.parse(cleaned);
      } catch (e) {
        console.error("Failed to parse AI output as JSON", e);
        return [];
      }
    }
    
    if (!parsedData) return [];
    if (Array.isArray(parsedData)) return parsedData;
    if (typeof parsedData === 'object') {
      for (const key of Object.keys(parsedData)) {
        if (Array.isArray(parsedData[key]) && parsedData[key].length > 0 && typeof parsedData[key][0] === 'object') {
          return parsedData[key];
        }
      }
      return [parsedData];
    }
    return [];
  }, [data]);

  const sortedProducts = useMemo(() => {
    let sortableItems = [...products];
    if (search) {
      sortableItems = sortableItems.filter(p => 
        String(p.product_name || p.name || '').toLowerCase().includes(search.toLowerCase()) ||
        String(p.category || '').toLowerCase().includes(search.toLowerCase())
      );
    }
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const aVal = a[sortConfig.key] ?? 0;
        const bVal = b[sortConfig.key] ?? 0;
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [products, sortConfig, search]);

  const totalPages = Math.max(1, Math.ceil(sortedProducts.length / pageSize));
  
  // Ensure current page is valid when filtering changes
  if (currentPage > totalPages) {
    setCurrentPage(totalPages);
  } else if (currentPage < 1) {
    setCurrentPage(1);
  }

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedProducts.slice(start, start + pageSize);
  }, [sortedProducts, currentPage]);

  const requestSort = (key) => {
    let direction = 'desc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  const getStatusColor = (status) => {
    if (!status) return '#94a3b8';
    const s = String(status).toUpperCase();
    if (s.includes('WIN')) return '#10b981';
    if (s.includes('TEST')) return '#3b82f6';
    if (s.includes('WATCH')) return '#f59e0b';
    if (s.includes('AVOID')) return '#ef4444';
    return '#64748b';
  };

  if (!products || products.length === 0) {
    return <div style={{ padding: 20, color: '#64748b', fontSize: 13 }}>No product data found in the analysis result.</div>;
  }

  const thStyle = { padding: '10px 8px', fontSize: 10, fontWeight: 700, color: '#475569', textTransform: 'uppercase', cursor: 'pointer', lineHeight: 1.2 };
  const tdStyle = { padding: '10px 8px', fontSize: 12, color: '#475569' };

  return (
    <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: 12, borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Digital Product Opportunities</h3>
        <input 
          type="text" 
          placeholder="Search..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: '6px 10px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 12, width: 150, outline: 'none' }}
        />
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', tableLayout: 'auto' }}>
          <thead>
            <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #e2e8f0' }}>
              <th onClick={() => requestSort('product_name')} style={thStyle}>Product</th>
              <th onClick={() => requestSort('category')} style={thStyle}>Category</th>
              <th onClick={() => requestSort('source_price')} style={thStyle}>Cost</th>
              <th onClick={() => requestSort('recommended_sell_price')} style={thStyle}>Sell Price</th>
              <th onClick={() => requestSort('estimated_profit')} style={thStyle}>Profit</th>
              <th onClick={() => requestSort('demand_level')} style={thStyle}>Demand</th>
              <th onClick={() => requestSort('competition_level')} style={thStyle}>Comp</th>
              <th onClick={() => requestSort('risk_level')} style={thStyle}>Risk</th>
              <th onClick={() => requestSort('opportunity_score')} style={thStyle}>Score</th>
              <th onClick={() => requestSort('status')} style={thStyle}>Status</th>
            </tr>
          </thead>
          <tbody>
            {paginatedProducts.map((p, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #e2e8f0', background: i % 2 === 0 ? '#fff' : '#f8fafc', transition: 'background 0.2s' }}>
                <td style={{ ...tdStyle, fontWeight: 600, color: '#0f172a' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {p.images && p.images[0] ? (
                      <div style={{ width: 28, height: 28, borderRadius: 4, backgroundImage: `url(${p.images[0]})`, backgroundSize: 'cover', backgroundPosition: 'center', border: '1px solid #e2e8f0', flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: 28, height: 28, borderRadius: 4, background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', flexShrink: 0 }}><ImageIcon size={14} /></div>
                    )}
                    <div style={{ maxWidth: 140, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: 11 }} title={p.product_name || p.name}>{p.product_name || p.name || 'Unknown'}</div>
                  </div>
                </td>
                <td style={{ ...tdStyle, fontSize: 11 }}>{p.category || '-'}</td>
                <td style={tdStyle}>${p.source_price ?? p.source_cost ?? '-'}</td>
                <td style={{ ...tdStyle, fontWeight: 600, color: '#0f172a' }}>${p.recommended_sell_price ?? '-'}</td>
                <td style={{ ...tdStyle, fontWeight: 600, color: '#10b981' }}>${p.estimated_profit ?? '-'}</td>
                <td style={{ ...tdStyle, fontSize: 11 }}>{p.demand_level || '-'}</td>
                <td style={{ ...tdStyle, fontSize: 11 }}>{p.competition_level || '-'}</td>
                <td style={{ ...tdStyle, fontSize: 11 }}>{p.risk_level || '-'}</td>
                <td style={{ ...tdStyle, fontWeight: 800, color: '#3b82f6', fontSize: 13 }}>{p.opportunity_score ?? '-'}</td>
                <td style={tdStyle}>
                  <span style={{ padding: '3px 6px', borderRadius: 4, fontSize: 10, fontWeight: 700, color: '#fff', background: getStatusColor(p.status) }}>
                    {p.status || 'UNK'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {totalPages > 1 && (
        <div style={{ padding: '10px 16px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
          <div style={{ fontSize: 11, color: '#64748b' }}>
            Showing {(currentPage - 1) * pageSize + 1} to Math.min(currentPage * pageSize, sortedProducts.length) of {sortedProducts.length} entries
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={{ padding: '4px 8px', display: 'flex', alignItems: 'center', gap: 4, background: currentPage === 1 ? '#e2e8f0' : '#fff', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 11, fontWeight: 600, color: currentPage === 1 ? '#94a3b8' : '#0f172a', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
            >
              <ChevronLeft size={14} /> Prev
            </button>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              style={{ padding: '4px 8px', display: 'flex', alignItems: 'center', gap: 4, background: currentPage === totalPages ? '#e2e8f0' : '#fff', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 11, fontWeight: 600, color: currentPage === totalPages ? '#94a3b8' : '#0f172a', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
