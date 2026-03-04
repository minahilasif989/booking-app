import { useState, useEffect } from 'react';
import { API_URL } from './config';
interface Doctor {
  _id?: string;
  name: string;
  specialty: string;
  experience: string;
}

const ManageDoctors = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [newDoctor, setNewDoctor] = useState({ name: '', specialty: '', experience: '' });
  const adminToken = localStorage.getItem('admin_token');

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/doctors`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      if (res.ok) setDoctors(await res.json());
    } catch {
      console.log('Doctors fetch failed');
    }
  };

  const addDoctor = async () => {
    try {
      await fetch(`${API_URL}/admin/doctors`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(newDoctor)
      });
      setNewDoctor({ name: '', specialty: '', experience: '' });
      fetchDoctors();
    } catch {
      alert('Add failed');
    }
  };

  const deleteDoctor = async (id: string) => {
    if (!window.confirm('Delete this doctor?')) return;
    try {
      await fetch(`${API_URL}/admin/doctors/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      fetchDoctors();
    } catch {
      alert('Delete failed');
    }
  };

  return (
    <div style={{ padding: '40px', background: '#0f172a', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ color: 'white', marginBottom: '30px' }}> Manage Doctors</h1>
        
        {/* ADD DOCTOR FORM */}
        <div style={{ 
          background: '#1e293b', padding: '25px', borderRadius: '16px', marginBottom: '30px' 
        }}>
          <h3 style={{ color: 'white', marginBottom: '20px' }}>➕ Add New Doctor</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            <input 
              placeholder="Doctor Name" 
              value={newDoctor.name}
              onChange={(e) => setNewDoctor({...newDoctor, name: e.target.value})}
              style={{ padding: '12px', borderRadius: '8px', border: '1px solid #475569', background: '#334155', color: 'white' }}
            />
            <input 
              placeholder="Specialty" 
              value={newDoctor.specialty}
              onChange={(e) => setNewDoctor({...newDoctor, specialty: e.target.value})}
              style={{ padding: '12px', borderRadius: '8px', border: '1px solid #475569', background: '#334155', color: 'white' }}
            />
            <input 
              placeholder="Experience" 
              value={newDoctor.experience}
              onChange={(e) => setNewDoctor({...newDoctor, experience: e.target.value})}
              style={{ padding: '12px', borderRadius: '8px', border: '1px solid #475569', background: '#334155', color: 'white' }}
            />
            <button onClick={addDoctor} style={{ 
              padding: '12px 24px', background: '#10b981', color: 'white', 
              border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'
            }}>
              ➕ Add Doctor
            </button>
          </div>
        </div>

        {/* DOCTORS LIST */}
        <div style={{ background: '#1e293b', borderRadius: '16px', padding: '30px', overflow: 'auto' }}>
          <table style={{ width: '100%', color: 'white' }}>
            <thead>
              <tr style={{ background: '#334155' }}>
                <th style={{ padding: '16px', textAlign: 'left' }}>Name</th>
                <th style={{ padding: '16px', textAlign: 'left' }}>Specialty</th>
                <th style={{ padding: '16px', textAlign: 'left' }}>Experience</th>
                <th style={{ padding: '16px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {doctors.map((doctor) => (
                <tr key={doctor._id} style={{ borderBottom: '1px solid #475569' }}>
                  <td style={{ padding: '16px' }}>{doctor.name}</td>
                  <td style={{ padding: '16px' }}>{doctor.specialty}</td>
                  <td style={{ padding: '16px' }}>{doctor.experience}</td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    <button onClick={() => deleteDoctor(doctor._id!)} style={{ 
                      padding: '8px 16px', background: '#ef4444', color: 'white', 
                      border: 'none', borderRadius: '6px', cursor: 'pointer', marginRight: '10px'
                    }}>
                       Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageDoctors;
