import React, { useState, useEffect } from 'react';
import { pharmacyOrderAPI } from '../../utils/api';
import './PharmacyInventory.css';

const PharmacyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const res = await pharmacyOrderAPI.getOrders();
            if (res.success) {
                setOrders(res.orders || []);
            }
        } catch (err) {
            console.error("Failed to fetch pharmacy orders", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCompleteOrder = async (orderId) => {
        if (!window.confirm("Approve and mark this order as Dispensed / Delivered?")) return;
        try {
            const res = await pharmacyOrderAPI.completeOrder(orderId);
            if (res.success) {
                alert("Order approved and marked as completed!");
                fetchOrders();
            } else {
                alert(res.message || 'Failed to complete order');
            }
        } catch (err) {
            alert("Failed to update order: " + (err.response?.data?.message || err.message));
        }
    };

    const handleMarkPaid = async (orderId) => {
        if (!window.confirm("Mark money as Paid for this order?")) return;
        try {
            const res = await pharmacyOrderAPI.markPaid(orderId);
            if (res.success) {
                alert("Payment status updated!");
                fetchOrders();
            }
        } catch (err) {
            alert("Failed to update payment: " + (err.response?.data?.message || err.message));
        }
    };

    const handleCancelOrder = async (orderId) => {
        if (!window.confirm("Are you sure you want to cancel this order?")) return;
        try {
            const res = await pharmacyOrderAPI.cancelOrder(orderId);
            if (res.success) {
                alert("Order cancelled successfully.");
                fetchOrders();
            }
        } catch (err) {
            alert("Failed to cancel order: " + (err.response?.data?.message || err.message));
        }
    };

    const q = searchQuery.toLowerCase().trim();
    const filtered = orders.filter(o => {
        if (q && !(o.patientName || o.userId?.name || '').toLowerCase().includes(q) &&
            !(o.orderId || '').toLowerCase().includes(q) &&
            !(o.doctorId?.name || '').toLowerCase().includes(q)) return false;
        if (statusFilter !== 'all' && o.orderStatus?.toLowerCase() !== statusFilter && o.status !== statusFilter) return false;
        return true;
    });

    const pendingCount = orders.filter(o => (o.orderStatus || o.status || '').toLowerCase() === 'pending' || o.orderStatus === 'Upcoming').length;
    const completedCount = orders.filter(o => (o.orderStatus || o.status || '').toLowerCase() === 'completed' || o.orderStatus === 'Completed' || o.status === 'delivered').length;
    const totalRevenue = orders.filter(o => (o.paymentStatus || '').toLowerCase() === 'paid').reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);

    const getStatusBadge = (order) => {
        const status = (order.orderStatus || order.status || '').toLowerCase();
        if (status === 'completed' || status === 'delivered') return 'status-active';
        if (status === 'cancelled') return 'status-inactive';
        return 'status-low';
    };

    const getStatusLabel = (order) => order.orderStatus || order.status || 'pending';

    return (
        <div className="pharmacy-management-container">
            <div className="pharmacy-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <h1>Prescriptions & Patient Orders</h1>
                    <p>Process prescriptions sent by doctors and medicine requests from patients.</p>
                </div>
                <button onClick={fetchOrders} className="btn-edit" style={{ padding: '8px 16px', cursor: 'pointer', fontWeight: 'bold' }}>
                    ↻ Refresh
                </button>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px', marginBottom: '20px' }}>
                <div style={{ background: '#eff6ff', borderRadius: '10px', padding: '14px', textAlign: 'center', border: '1px solid #bfdbfe' }}>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#2563eb' }}>{orders.length}</div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Total Orders</div>
                </div>
                <div style={{ background: '#fffbeb', borderRadius: '10px', padding: '14px', textAlign: 'center', border: '1px solid #fde68a' }}>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#d97706' }}>{pendingCount}</div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Pending</div>
                </div>
                <div style={{ background: '#f0fdf4', borderRadius: '10px', padding: '14px', textAlign: 'center', border: '1px solid #bbf7d0' }}>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#16a34a' }}>{completedCount}</div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Completed</div>
                </div>
                <div style={{ background: '#f5f3ff', borderRadius: '10px', padding: '14px', textAlign: 'center', border: '1px solid #ddd6fe' }}>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#7c3aed' }}>₹{totalRevenue.toLocaleString('en-IN')}</div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Collected Revenue</div>
                </div>
            </div>

            {/* Search + Filter */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                <input
                    type="text"
                    placeholder="Search by patient, order ID, or doctor..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    style={{ flex: 1, minWidth: '200px', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '0.9rem', outline: 'none' }}
                />
                <div style={{ display: 'flex', gap: '4px' }}>
                    {['all', 'pending', 'completed', 'cancelled'].map(s => (
                        <button key={s} onClick={() => setStatusFilter(s)}
                            style={{
                                padding: '6px 14px', borderRadius: '8px', border: '1.5px solid', cursor: 'pointer', fontWeight: 600, fontSize: '0.78rem',
                                borderColor: statusFilter === s ? '#3b82f6' : '#e2e8f0',
                                background: statusFilter === s ? '#eff6ff' : '#fff',
                                color: statusFilter === s ? '#2563eb' : '#64748b'
                            }}>
                            {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            <div className="inventory-table-wrapper">
                {loading ? <div className="loader">Loading Orders...</div> : filtered.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>{searchQuery ? '🔍' : '📭'}</div>
                        <div style={{ fontWeight: 600, fontSize: '1rem' }}>{searchQuery ? 'No orders match your search' : 'No orders yet'}</div>
                    </div>
                ) : (
                    <table className="inventory-table">
                        <thead>
                            <tr>
                                <th>Patient Details</th>
                                <th>Doctor / Channel</th>
                                <th>Requested Items</th>
                                <th>Total</th>
                                <th>Order Status</th>
                                <th>Payment</th>
                                <th style={{ minWidth: '220px' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((order) => (
                                <tr key={order._id || order.orderId}>
                                    <td>
                                        <div style={{ fontWeight: 'bold' }}>{order.patientName || order.userId?.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{order.patientEmail || order.userId?.email}</div>
                                        {order.deliveryAddress && (
                                            <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '4px' }}>
                                                📍 {order.deliveryAddress}
                                            </div>
                                        )}
                                    </td>
                                    <td>
                                        {order.doctorId?.name ? (
                                            order.doctorId.name.startsWith('Dr.') || order.doctorId.name === 'Self Requested'
                                                ? order.doctorId.name
                                                : `Dr. ${order.doctorId.name}`
                                        ) : '—'}
                                    </td>
                                    <td>
                                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.9rem' }}>
                                            {(order.items || []).map((item, idx) => {
                                                const isUnavailable = !item.unitPrice || item.unitPrice === 0;
                                                return (
                                                    <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                                        <span style={{ color: isUnavailable ? '#dc2626' : '#10b981', fontWeight: 'bold' }}>{isUnavailable ? '⚠️' : '✓'}</span>
                                                         <span>
                                                              <strong>{item.medicineName || item.name}</strong>
                                                              {isUnavailable ? (
                                                                  <span style={{ color: '#dc2626', fontSize: '0.75rem', fontWeight: 'bold', marginLeft: '6px', padding: '1px 8px', background: '#fee2e2', borderRadius: '4px', display: 'inline-block' }}>
                                                                      Unavailable in Inventory
                                                                  </span>
                                                              ) : (
                                                                  <>
                                                                      <span style={{ color: '#64748b', fontSize: '0.8rem', marginLeft: '6px' }}>
                                                                          (Qty: {item.quantity || 1} • ₹{item.unitPrice}/unit)
                                                                      </span>
                                                                      <span style={{ marginLeft: '8px', color: '#0d9488', fontWeight: '700', fontSize: '0.82rem' }}>
                                                                          Total: ₹{item.totalPrice || item.price || 0}
                                                                      </span>
                                                                  </>
                                                              )}
                                                         </span>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </td>
                                    <td style={{ fontWeight: '700', color: '#0f172a' }}>₹{order.totalAmount}</td>
                                    <td>
                                        <span className={`status-badge ${getStatusBadge(order)}`}>{getStatusLabel(order)}</span>
                                    </td>
                                    <td>
                                        <span style={{ color: (order.paymentStatus || '').toLowerCase() === 'paid' ? '#16a34a' : '#dc2626', fontWeight: 'bold', fontSize: '13px' }}>
                                            {order.paymentStatus || 'Pending'}
                                        </span>
                                    </td>
                                    <td>
                                        {(order.orderStatus === 'Upcoming' || (order.status || '').toLowerCase() === 'pending' || (order.orderStatus || '').toLowerCase() === 'pending') ? (
                                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                                <button className="btn-add" style={{ padding: '6px 12px', fontSize: '0.75rem', background: '#10b981', border: 'none', color: 'white', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                                                    onClick={() => handleCompleteOrder(order._id)}>
                                                    Approve & Dispense
                                                </button>
                                                {(order.paymentStatus || '').toLowerCase() !== 'paid' && (
                                                    <button style={{ padding: '6px 12px', fontSize: '0.75rem', background: '#3b82f6', border: 'none', color: 'white', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                                                        onClick={() => handleMarkPaid(order._id)}>
                                                        Mark Paid
                                                    </button>
                                                )}
                                                <button style={{ padding: '6px 12px', fontSize: '0.75rem', background: '#ef4444', border: 'none', color: 'white', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                                                    onClick={() => handleCancelOrder(order._id)}>
                                                    Cancel
                                                </button>
                                            </div>
                                        ) : (
                                            <span style={{ color: '#94a3b8', fontSize: '12px' }}>Processed</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default PharmacyOrders;
