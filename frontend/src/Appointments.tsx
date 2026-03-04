import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from './config';
interface Appointment {
  id: string;
  _id?: string; // MongoDB compatibility
  doctor_name: string;
  doctor_id: string;
  appointment_date: string;
  time_slot: string;
  status: string;
  created_at: string;
}

const Appointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  // 1. FETCH ALL APPOINTMENTS
  const fetchAppointments = async () => {
    if (!token) {
      navigate('/');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/user/appointments`, {
  headers: { 'Authorization': `Bearer ${token}` }
});
      if (res.ok) {
        const data = await res.json();
        // Backend agar list bhej raha hai ya { appointments: [] } bhej raha hai:
        setAppointments(Array.isArray(data) ? data : data.appointments || []);
      } else {
        setError('Failed to load appointments');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  // 2. MARK AS DONE
  const handleMarkDone = async (id: string) => {
    try {
     const res = await fetch(`${API_URL}/user/appointments/done/${id}/done`, {
  method: 'PATCH',
  headers: { 'Authorization': `Bearer ${token}` }
});

      if (res.ok) {
        fetchAppointments(); // Refresh list
      } else {
        alert("Update failed (404/500)");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 3. DELETE APPOINTMENT
  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this appointment?")) return;
    
    try {
     const res = await fetch(`${API_URL}/user/appointments/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        fetchAppointments(); // Refresh list
      } else {
        alert("Delete failed");
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  if (!token) return null;

  return (
    <div className="container" style={{maxWidth: '1000px', margin: '2rem auto', padding: '0 1rem'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'}}>
        <h1> My Appointments ({appointments.length})</h1>
        <button onClick={() => navigate('/book')} className="btn btn-primary">
          + Book New
        </button>
      </div>

      {loading && <div>Loading...</div>}
      {error && <div style={{color: 'red'}}>{error}</div>}

      <div className="appointments-grid" style={{display: 'grid', gap: '1rem'}}>
        {appointments.map((apt) => {
          const aptId = apt.id || apt._id || "";
          return (
            <div key={aptId} className="appointment-card" style={{
              padding: '1.5rem', border: '1px solid #ddd', borderRadius: '12px', background: 'white'
            }}>
              <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <h3>{apt.doctor_name}</h3>
                <span style={{
                  padding: '4px 10px', borderRadius: '20px', fontSize: '12px',
                  background: apt.status === 'completed' ? '#dcfce7' : '#e0e7ff',
                  color: apt.status === 'completed' ? '#166534' : '#4338ca'
                }}>
                  {apt.status.toUpperCase()}
                </span>
              </div>
              
              <p> {new Date(apt.appointment_date).toLocaleDateString()} |  {apt.time_slot}</p>

              <div style={{marginTop: '1rem', display: 'flex', gap: '0.5rem'}}>
                <button onClick={() => navigate(`/appointment/${aptId}/edit`)} className="btn btn-secondary">Edit</button>
                
                {apt.status !== 'completed' && (
                  <button onClick={() => handleMarkDone(aptId)} className="btn btn-success" style={{background: '#10b981', color: 'white', border: 'none', padding: '5px 15px', borderRadius: '5px'}}>
                    Done
                  </button>
                )}
                
                <button onClick={() => handleDelete(aptId)} style={{background: '#ef4444', color: 'white', border: 'none', padding: '5px 15px', borderRadius: '5px'}}>
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Appointments;
