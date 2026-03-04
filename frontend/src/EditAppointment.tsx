import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { API_URL } from './config';
const EditAppointment = () => {
  const { aptId } = useParams<{ aptId: string }>();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState<any>(null);
  const [timeSlot, setTimeSlot] = useState('');
  const [serviceType, setServiceType] = useState('consultation');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const res = await fetch(`${API_URL}/user/appointments/details/${aptId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setAppointment(data);
          setTimeSlot(data.time_slot);
          setServiceType(data.service_type || 'consultation');
        } else {
          setMessage(' Appointment not found');
        }
      } catch (err) {
        setMessage('Network error');
      } finally {
        setLoading(false);
      }
    };
    if (aptId) fetchAppointment();
  }, [aptId, token]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/user/appointments/details/${aptId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ time_slot: timeSlot, service_type: serviceType })
      });
      if (res.ok) {
        alert('✅ Updated Successfully!');
        navigate('/dashboard');
      } else {
        setMessage(' Update failed');
      }
    } catch (err) {
      setMessage(' Error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{textAlign:'center', padding:'50px'}}>Loading...</div>;
  if (!appointment) return <div style={{textAlign:'center', padding:'50px'}}>{message || 'Not found'}</div>;

  return (
    <div style={{maxWidth: '500px', margin: '2rem auto', padding: '20px', background: '#fff', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'}}>
      <h2 style={{color: '#1f2937', marginBottom: '20px'}}>Edit Appointment</h2>
      <form onSubmit={handleUpdate}>
        <div style={{marginBottom: '15px', padding: '10px', background: '#f9fafb', borderRadius: '8px'}}>
          <p style={{margin: 0}}>Doctor: <strong>{appointment.doctor_name}</strong></p>
          <p style={{margin: 0, fontSize: '14px', color: '#6b7280'}}>Date: {appointment.appointment_date}</p>
        </div>

        <label style={{fontWeight: 'bold'}}>Time Slot:</label>
        <select value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)} style={{width: '100%', padding: '12px', margin: '10px 0', borderRadius: '6px', border: '1px solid #d1d5db'}}>
          {['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'].map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        <label style={{fontWeight: 'bold'}}>Service Type:</label>
        <select value={serviceType} onChange={(e) => setServiceType(e.target.value)} style={{width: '100%', padding: '12px', margin: '10px 0', borderRadius: '6px', border: '1px solid #d1d5db'}}>
          <option value="consultation">Consultation</option>
          <option value="checkup">Regular Checkup</option>
          <option value="followup">Follow-up</option>
        </select>

        <button type="submit" disabled={saving} style={{width: '100%', padding: '12px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px'}}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
        <button type="button" onClick={() => navigate('/dashboard')} style={{width: '100%', padding: '10px', background: 'transparent', color: '#6b7280', border: 'none', marginTop: '5px', cursor: 'pointer'}}>
          Cancel
        </button>
      </form>
    </div>
  );
};

export default EditAppointment;