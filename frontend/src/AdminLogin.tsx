import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from './config';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
const res = await fetch(`${API_URL}/admin/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('admin_token', data.token);
        localStorage.removeItem('token'); 
        navigate('/admin/dashboard');
      } else {
        alert(' Invalid admin credentials');
      }
    } catch {
      alert(' Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{
        background: '#1e293b',
        padding: '40px',
        borderRadius: '20px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
        width: '100%',
        maxWidth: '400px',
        color: 'white'
      }}>
        <h1 style={{ textAlign: 'center', marginBottom: '10px', fontSize: '28px' }}>
           Admin Panel
        </h1>
        <p style={{ textAlign: 'center', opacity: 0.9, marginBottom: '30px' }}>
          Enter admin credentials
        </p>

        <form onSubmit={handleAdminLogin}>
          <div style={{ marginBottom: '20px' }}>
            <input
              type="email"
              placeholder="Admin Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '15px',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                background: '#334155',
                color: 'white',
                outline: 'none'
              }}
            />
          </div>
          <div style={{ marginBottom: '30px' }}>
            <input
              type="password"
              placeholder="Admin Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '15px',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                background: '#334155',
                color: 'white',
                outline: 'none'
              }}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '15px',
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? ' Logging in...' : ' Enter Admin Panel'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', opacity: 0.7 }}>
          <button
            onClick={() => navigate('/')}
            style={{
              background: 'none',
              border: 'none',
              color: '#60a5fa',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            ← Back to User Login
          </button>
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
