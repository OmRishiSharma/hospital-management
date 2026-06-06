import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { hospitalAPI } from '../../utils/api';
import '../administration/SuperAdmin.css';

const AdminFacilities = () => {
  const navigate = useNavigate();
  const [hospitalInfo, setHospitalInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const role = (user.role || '').toLowerCase();
    if (role !== 'admin' && role !== 'hospitaladmin') {
      navigate('/');
      return;
    }
    fetchMyHospital();
  }, [navigate]);

  const fetchMyHospital = async () => {
    try {
      setLoading(true);
      const res = await hospitalAPI.getMyHospital();
      if (res.success && res.hospital) {
        setHospitalInfo(res.hospital);
      }
    } catch (err) {
      console.error('Error fetching hospital info:', err);
      setError('Error loading hospital information');
    } finally {
      setLoading(false);
    }
  };

  const handleAddFacility = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const name = e.target.name.value.trim();
    const price = Number(e.target.price.value);

    if (!name || isNaN(price)) {
      setError('Facility name and price per day are required');
      return;
    }

    try {
      const newFacility = { name, pricePerDay: price };
      const newFacilities = [...(hospitalInfo?.facilities || []), newFacility];
      const res = await hospitalAPI.updateFacilities({ facilities: newFacilities });
      if (res.success) {
        setHospitalInfo(res.hospital);
        setSuccess('Facility added successfully!');
        e.target.reset();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error adding facility');
    }
  };

  const handleDeleteFacility = async (idx) => {
    if (!window.confirm('Are you sure you want to delete this facility/ward?')) return;
    setError('');
    setSuccess('');

    try {
      const newFacilities = hospitalInfo.facilities.filter((_, i) => i !== idx);
      const res = await hospitalAPI.updateFacilities({ facilities: newFacilities });
      if (res.success) {
        setHospitalInfo(res.hospital);
        setSuccess('Facility deleted successfully!');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting facility');
    }
  };

  const formatCurrency = (n) => `₹${(n || 0).toLocaleString('en-IN')}`;

  return (
    <div className="superadmin-page">
      <div className="superadmin-container">
        <div className="admin-header">
          <div>
            <h1>Manage Facilities & Wards</h1>
            <p>Add and manage hospital rooms, wards (ICU, OT, General Ward), and their daily pricing</p>
          </div>
          <button onClick={() => navigate('/admin')} className="btn btn-secondary">
            ← Back to Dashboard
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="form-card" style={{ marginBottom: '30px' }}>
          <h2>Add New Facility / Ward</h2>
          <form onSubmit={handleAddFacility}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Facility/Ward Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="e.g., ICU, OT, General Ward, Deluxe Room"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="price">Price Per Day (₹) *</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  placeholder="e.g., 5000"
                  min="0"
                  required
                />
              </div>
            </div>
            <div className="form-actions" style={{ marginTop: '10px' }}>
              <button type="submit" className="btn btn-primary">
                + Add Facility
              </button>
            </div>
          </form>
        </div>

        <div className="users-table">
          <h2>Active Facilities & Wards</h2>
          {loading ? (
            <div className="loading-message">Loading facilities...</div>
          ) : !hospitalInfo?.facilities || hospitalInfo.facilities.length === 0 ? (
            <div className="empty-message">No facilities configured. Add one above to get started.</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Facility/Ward Name</th>
                  <th>Price Per Day</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {hospitalInfo.facilities.map((fac, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 600 }}>{fac.name}</td>
                    <td>{formatCurrency(fac.pricePerDay)} / day</td>
                    <td>
                      <button
                        onClick={() => handleDeleteFacility(idx)}
                        className="btn-delete"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminFacilities;
