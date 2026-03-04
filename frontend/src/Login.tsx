import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from './config';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false); // Add this
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const apiCall = async () => {
    try {
      setMessage('');
      
      // Determine which API to hit
      let endpoint = '';
      if (isRegister) {
        endpoint = '/auth/register';
      } else {
        endpoint = isAdmin ? '/admin/login' : '/auth/login';
      }

      const body = isRegister ? { email, name, password } : { email, password };
      
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      const data = await res.json();
      
      if (res.ok) {
        // Handle both 'access_token' (user) and 'token' (admin) keys
        const token = data.access_token || data.token;
        localStorage.setItem('token', token);
        
        // Redirect based on role
        if (isAdmin && !isRegister) {
          navigate('/admin/dashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        const errorMsg = data.detail || 'Authentication failed';
        setMessage(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
      }
    } catch (err: any) {
      setMessage('Network error. Is the backend running?');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '100px auto' }}>
      <div className="card">
        {/* The Admin Toggle Switch */}
        {!isRegister && (
          <div style={{ textAlign: 'right', marginBottom: '10px' }}>
            <label style={{ fontSize: '0.8rem', cursor: 'pointer', color: '#666' }}>
              <input 
                type="checkbox" 
                checked={isAdmin} 
                onChange={() => setIsAdmin(!isAdmin)} 
              /> Admin Login
            </label>
          </div>
        )}

        <h1>{isRegister ? 'Register' : (isAdmin ? 'Admin Portal' : 'Login')}</h1>
        
        {message && <div className="alert alert-error">{message}</div>}
        
        {isRegister && (
          <input 
            className="input" 
            placeholder="Full Name" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
          />
        )}
        
        <input 
          className="input" 
          type="email" 
          placeholder="Email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
        />
        
        <input 
          className="input" 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
        />
        
        <button 
          className="btn btn-primary"
          onClick={apiCall} 
          disabled={!email || !password}
        >
          {isRegister ? 'Register' : 'Login'}
        </button>
        
        <p style={{ textAlign: 'center', marginTop: '20px' }}>
          {isRegister ? 'Already have account?' : "Don't have account?"}
          <button 
            onClick={() => {
              setIsRegister(!isRegister);
              setIsAdmin(false); // Reset admin mode if switching to register
            }} 
            style={{ background: 'none', border: 'none', color: '#4f46e5', fontWeight: 'bold', cursor: 'pointer', marginLeft: '5px' }}
          >
            {isRegister ? 'Login' : 'Register'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;