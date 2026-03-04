import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import Login from './Login';
import Dashboard from './Dashboard';
import Book from './Book';
import Appointments from './Appointments';
import EditAppointment from './EditAppointment';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';
import ManageDoctors from './ManageDoctors';
import './App.css';

function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [adminToken, setAdminToken] = useState<string | null>(localStorage.getItem('admin_token'));

  useEffect(() => {
    const checkTokens = () => {
      const savedToken = localStorage.getItem('token');
      const savedAdminToken = localStorage.getItem('admin_token');
      setToken(savedToken);
      setAdminToken(savedAdminToken);
    };

    checkTokens();
    const interval = setInterval(checkTokens, 1000);
    return () => clearInterval(interval);
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('admin_token');
    setToken(null);
    setAdminToken(null);
    window.location.href = '/';
  };

  return (
    <BrowserRouter>
      <div className="App">
        {/* USER NAVBAR */}
        {token && !adminToken && (
          <nav style={{ 
            background: '#4f46e5', color: 'white', padding: '1rem', 
            display: 'flex', justifyContent: 'space-between',
            position: 'sticky', top: 0, zIndex: 1000
          }}>
            <div>
              <Link to="/dashboard" style={{ color: 'white', marginRight: '20px', textDecoration: 'none' }}>
                 Dashboard
              </Link>
              <Link to="/book" style={{ color: 'white', marginRight: '20px', textDecoration: 'none' }}>
                 Book
              </Link>
              <Link to="/appointments" style={{ color: 'white', textDecoration: 'none' }}>
                 Appointments
              </Link>
            </div>
            <div>
              <Link to="/admin" style={{ 
                color: '#dbeafe', marginRight: '20px', textDecoration: 'none',
                padding: '8px 16px', border: '1px solid #dbeafe', borderRadius: '6px'
              }}>
                 Admin Login
              </Link>
              <button onClick={logout} style={{ 
                background: '#ef4444', color: 'white', border: 'none', 
                padding: '8px 16px', borderRadius: '4px', cursor: 'pointer'
              }}>
                 Logout
              </button>
            </div>
          </nav>
        )}

        {/* ADMIN NAVBAR */}
        {adminToken && (
          <nav style={{ 
            background: '#1e293b', color: 'white', padding: '1rem', 
            display: 'flex', justifyContent: 'space-between',
            position: 'sticky', top: 0, zIndex: 1000,
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
          }}>
            <div>
              <Link to="/admin/dashboard" style={{ color: 'white', marginRight: '30px', textDecoration: 'none', fontWeight: 'bold' }}>
                 Dashboard
              </Link>
              <Link to="/admin/doctors" style={{ color: '#94a3b8', marginRight: '30px', textDecoration: 'none' }}>
                 Doctors
              </Link>
            </div>
            <button onClick={logout} style={{ 
              background: '#ef4444', color: 'white', border: 'none', 
              padding: '10px 20px', borderRadius: '8px', cursor: 'pointer',
              fontWeight: 'bold'
            }}>
               Logout
            </button>
          </nav>
        )}

        <Routes>
          <Route path="/" element={!token && !adminToken ? <Login /> : <Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={token && !adminToken ? <Dashboard /> : <Navigate to="/" replace />} />
          <Route path="/book" element={token && !adminToken ? <Book /> : <Navigate to="/" replace />} />
          <Route path="/appointments" element={token && !adminToken ? <Appointments /> : <Navigate to="/" replace />} />
          <Route path="/appointment/:aptId/edit" element={token && !adminToken ? <EditAppointment /> : <Navigate to="/" replace />} />
          <Route path="/admin" element={!adminToken ? <AdminLogin /> : <Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={adminToken ? <AdminDashboard /> : <Navigate to="/admin" replace />} />
          <Route path="/admin/doctors" element={adminToken ? <ManageDoctors /> : <Navigate to="/admin" replace />} />
          <Route path="*" element={<Navigate to={adminToken ? "/admin/dashboard" : token ? "/dashboard" : "/"} replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
