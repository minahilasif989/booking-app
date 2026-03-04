import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from './config';
interface Appointment {
  id: string;
  _id?: string; 
  doctor_name: string;
  appointment_date: string;
  time_slot: string;
  status: string;
}

const Dashboard = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAppointments, setShowAppointments] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (token) {
      fetchAppointments();
    }
  }, [token]);

  const fetchAppointments = async () => {
    try {
      const res = await fetch(`${API_URL}/user/appointments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAppointments(data || []);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  //  NEW: Mark as Done Logic
 const handleStatusUpdate = async (id: string) => {
    try {
        const res = await fetch(`${API_URL}/user/appointments/done/${id}`, {
            method: 'PATCH', // <--- Yeh "PATCH" hi hona chahiye
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json' 
            }
        });

        if (!res.ok) {
            const errorData = await res.json();
            console.error("Server Error:", errorData);
            alert(errorData.detail || "Update failed");
            return;
        }

        fetchAppointments(); // Refresh list
    } catch (err) {
        console.error("Network Error:", err);
    }
};

  //  NEW: Delete Logic
  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this booking?")) {
      try {
        const res = await fetch(`${API_URL}/user/appointments/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          fetchAppointments(); // Refresh list
        }
      } catch (err) {
        alert("Failed to delete");
      }
    }
  };

  const toggleAppointments = () => {
    setShowAppointments(!showAppointments);
  };

  if (!token) {
    navigate('/');
    return null;
  }

  return (
    <div className="container" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div className="dashboard-header" style={{ marginBottom: '30px' }}>
        <h1 style={{ color: '#333', fontSize: '28px', margin: '0 0 20px 0' }}>
          Welcome to Dashboard
        </h1>
        <div className="stats" style={{ display: 'flex', gap: '20px' }}>
          <div className="stat-card" style={{
            background: 'white', padding: '20px', borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)', textAlign: 'center'
          }}>
            <h2 style={{ color: '#4f46e5', fontSize: '32px', margin: '0 0 8px 0' }}>
              {appointments.length}
            </h2>
            <p style={{ color: '#6b7280', margin: 0, fontSize: '16px' }}>
              Total Appointments
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '1rem', margin: '2rem 0', flexWrap: 'wrap' }}>
        <button 
          onClick={() => navigate('/book')}
          style={{
            padding: '12px 24px', background: '#4f46e5', color: 'white', border: 'none',
            borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px'
          }}
        >
          + Book Appointment
        </button>

        <button 
          onClick={toggleAppointments}
          style={{
            padding: '12px 24px', background: showAppointments ? '#ef4444' : '#10b981',
            color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'
          }}
        >
          📋 My Appointments ({appointments.length}) {showAppointments ? ' ❌' : ' ▶️'}
        </button>
      </div>

      {/* Appointments List */}
      {showAppointments && !loading && appointments.length > 0 && (
        <div className="recent-appointments" style={{ marginTop: '30px' }}>
          <h3 style={{ color: '#1f2937', fontSize: '24px', marginBottom: '20px', paddingBottom: '8px', borderBottom: '2px solid #e5e7eb' }}>
            My Bookings
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {appointments.map((apt) => {
              const aptId = apt.id || apt._id || "";
              return (
                <div key={aptId} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '20px', border: '1px solid #e5e7eb', borderRadius: '12px',
                  background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}>
                  <div style={{ flex: 1 }}>
                    <strong style={{ color: '#1f2937', fontSize: '18px', display: 'block' }}>{apt.doctor_name}</strong>
                    <p style={{ color: '#6b7280', margin: '4px 0', fontSize: '15px' }}>
                      {apt.appointment_date} | {apt.time_slot}
                    </p>
                    <span style={{
                      display: 'inline-block', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold',
                      background: apt.status === 'completed' ? '#d1fae5' : '#dcfce7',
                      color: apt.status === 'completed' ? '#065f46' : '#166534'
                    }}>
                      {apt.status.toUpperCase()}
                    </span>
                  </div>

                  {/* ACTION BUTTONS GROUP */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {/* EDIT */}
                    <button 
                      onClick={() => navigate(`/appointment/${aptId}/edit`)}
                      style={{ padding: '8px 15px', background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer' }}
                    >
                       Edit
                    </button>

                    {/* DONE (Show only if not already completed) */}
                    {apt.status !== 'completed' && (
                      <button 
                        onClick={() => handleStatusUpdate(aptId)}
                        style={{ padding: '8px 15px', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                      >
                        ✅ Done
                      </button>
                    )}

                    {/* DELETE */}
                    <button 
                      onClick={() => handleDelete(aptId)}
                      style={{ padding: '8px 15px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                    >
                       Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Loading & Empty States remain the same... */}
      {loading && <div style={{ textAlign: 'center', padding: '60px' }}>Loading...</div>}
    </div>
  );
};

export default Dashboard;