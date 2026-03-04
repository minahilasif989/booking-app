import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from './config';

interface Appointment {
  id: string;
  user_email: string;
  doctor_name: string;
  appointment_date: string;
  time_slot: string;
  status: string;
  service_type: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  total_appointments: number;
  created_at: string;
}

const AdminDashboard = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, today: 0, completed: 0 });
  const navigate = useNavigate();
  const adminToken = localStorage.getItem('admin_token');

  useEffect(() => {
    if (!adminToken) {
      navigate('/admin');
      return;
    }
    fetchData();
    fetchUsers();
  }, [adminToken, navigate]);

  const fetchData = async () => {
    try {
      const [appsRes, statsRes] = await Promise.all([
        fetch(`${API_URL}/admin/appointments`, {

          headers: { 'Authorization': `Bearer ${adminToken}` }
        }),
        fetch(`${API_URL}/admin/stats`, {
          headers: { 'Authorization': `Bearer ${adminToken}` }
        })
      ]);

      if (appsRes.ok) setAppointments(await appsRes.json());
      if (statsRes.ok) setStats(await statsRes.json());
    } catch {
      alert(' Admin session expired');
      localStorage.removeItem('admin_token');
      navigate('/admin');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
    const res = await fetch(`${API_URL}/admin/users`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      if (res.ok) {
        setUsers(await res.json());
      }
    } catch {
      console.log('Users fetch failed');
    }
  };

  const cancelAppointment = async (id: string) => {
   if (!window.confirm('Cancel this appointment?')) return;
    
    try {
      await fetch(`${API_URL}/admin/appointments/${id}/cancel`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      fetchData();
    } catch {
      alert(' Cancel failed');
    }
  };

  const markDone = async (id: string) => {
    try {
      await fetch(`${API_URL}/admin/appointments/${id}/done`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      fetchData();
    } catch {
      alert(' Update failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    navigate('/admin');
  };

  if (loading) return <div style={{ padding: '60px', textAlign: 'center', color: 'white' }}>Loading...</div>;

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#0f172a', 
      color: 'white',
      padding: '20px 0'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 20px' }}>
        {/* STATS CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          <div style={{ background: '#1e293b', padding: '25px', borderRadius: '16px', textAlign: 'center' }}>
            <h3 style={{ color: '#94a3b8', margin: '0 0 15px 0' }}> Total</h3>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#10b981' }}>{stats.total}</div>
          </div>
          <div style={{ background: '#1e293b', padding: '25px', borderRadius: '16px', textAlign: 'center' }}>
            <h3 style={{ color: '#94a3b8', margin: '0 0 15px 0' }}> Today</h3>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#3b82f6' }}>{stats.today}</div>
          </div>
          <div style={{ background: '#1e293b', padding: '25px', borderRadius: '16px', textAlign: 'center' }}>
            <h3 style={{ color: '#94a3b8', margin: '0 0 15px 0' }}> Completed</h3>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#f59e0b' }}>{stats.completed}</div>
          </div>
        </div>

        {/* ALL APPOINTMENTS */}
        <div style={{ 
          background: '#1e293b', 
          borderRadius: '16px', 
          padding: '30px',
          marginBottom: '30px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
        }}>
          <h2 style={{ margin: '0 0 30px 0', fontSize: '28px' }}> All Appointments</h2>
          <div style={{ maxHeight: '400px', overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#334155' }}>
                  <th style={{ padding: '16px', textAlign: 'left' }}>User</th>
                  <th style={{ padding: '16px', textAlign: 'left' }}>Doctor</th>
                  <th style={{ padding: '16px', textAlign: 'left' }}>Date</th>
                  <th style={{ padding: '16px', textAlign: 'left' }}>Time</th>
                  <th style={{ padding: '16px', textAlign: 'left' }}>Status</th>
                  <th style={{ padding: '16px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appointment) => (
                  <tr key={appointment.id} style={{ borderBottom: '1px solid #475569' }}>
                    <td style={{ padding: '16px' }}>{appointment.user_email}</td>
                    <td style={{ padding: '16px' }}>{appointment.doctor_name}</td>
                    <td style={{ padding: '16px' }}>{appointment.appointment_date}</td>
                    <td style={{ padding: '16px' }}>{appointment.time_slot}</td>
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '20px',
                        background: appointment.status === 'done' ? '#10b981' : 
                                  appointment.status === 'cancelled' ? '#ef4444' : '#3b82f6',
                        color: 'white',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        {appointment.status.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      {appointment.status !== 'done' && (
                        <button
                          onClick={() => markDone(appointment.id)}
                          style={{
                            marginRight: '8px',
                            padding: '8px 16px',
                            background: '#f59e0b',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer'
                          }}
                        >
                           Done
                        </button>
                      )}
                      <button
                        onClick={() => cancelAppointment(appointment.id)}
                        style={{
                          padding: '8px 16px',
                          background: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}
                      >
                         Cancel
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {appointments.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                No appointments found
              </div>
            )}
          </div>
        </div>

        {/* ALL USERS TABLE */}
        <div style={{ 
          background: '#1e293b', 
          borderRadius: '16px', 
          padding: '30px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
        }}>
          <h2 style={{ margin: '0 0 30px 0', fontSize: '28px' }}>👥 All Users ({users.length})</h2>
          <div style={{ maxHeight: '400px', overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#334155' }}>
                  <th style={{ padding: '16px', textAlign: 'left' }}>Email</th>
                  <th style={{ padding: '16px', textAlign: 'left' }}>Name</th>
                  <th style={{ padding: '16px', textAlign: 'center' }}>Appointments</th>
                  <th style={{ padding: '16px', textAlign: 'center' }}>Created</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} style={{ borderBottom: '1px solid #475569' }}>
                    <td style={{ padding: '16px' }}>{user.email}</td>
                    <td style={{ padding: '16px' }}>{user.name || 'N/A'}</td>
                    <td style={{ padding: '16px', textAlign: 'center', fontWeight: 'bold' }}>
                      {user.total_appointments}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center', color: '#94a3b8' }}>
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                No users found
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
