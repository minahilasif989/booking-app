import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from './config';
interface FormData {
  doctor_id: string;
  doctor_name: string;
  service_id: string;
  appointment_date: string;
  time_slot: string;
}

interface Doctor {
  _id: string;
  name: string;
  specialty: string;
  specialization?: string; 
  id?: string; 
}

const Book = () => {
  const [formData, setFormData] = useState<FormData>({
    doctor_id: '',
    doctor_name: '',
    service_id: '',
    appointment_date: '',
    time_slot: '09:00'
  });
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  // FETCH DOCTORS FROM BACKEND
  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      // FIX: Prefix "/user" added to match backend
     const res = await fetch(`${API_URL}/user/doctors`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (res.ok && data.length > 0) {
        setDoctors(data);
      } else {
        // Fallback agar database khali ho
        setDoctors([
          { _id: "1", name: "Dr. Ahmed Khan", specialty: "Cardiologist" },
          { _id: "2", name: "Dr. Fatima Ali", specialty: "Dentist" }
        ]);
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      setDoctors([
        { _id: "1", name: "Dr. Ahmed Khan", specialty: "Cardiologist" },
        { _id: "2", name: "Dr. Fatima Ali", specialty: "Dentist" }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // 🔥 HANDLES SUBMISSION
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!token) {
      navigate('/');
      return;
    }

    try {
      // FIX: URL with /user prefix
     const res = await fetch(`${API_URL}/user/appointments`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.detail || "Booking failed");
        return;
      }

      alert("✅ Appointment Booked Successfully!");
      navigate("/dashboard");

    } catch (err) {
      console.error("Submit Error:", err);
      alert("Something went wrong! Check backend connection.");
    }
  };

  if (!token) {
    return null;
  }

  return (
    <div className="card" style={{maxWidth: '500px', margin: '2rem auto', padding: '2rem', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)'}}>
      <h2 style={{textAlign: 'center', marginBottom: '1.5rem'}}> Book Appointment</h2>
      
      {message && (
        <div className={`alert ${message.includes('✅') ? 'alert-success' : 'alert-error'}`} style={{padding: '10px', marginBottom: '10px', borderRadius: '5px', background: message.includes('✅') ? '#dcfce7' : '#fee2e2'}}>
          {message}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        {/* DOCTOR DROPDOWN */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Doctor</label>
          {loading ? (
            <div style={{color: '#666', fontSize: '14px'}}>Loading doctors...</div>
          ) : (
            <select
              name="doctor_id"
              value={formData.doctor_id}
              onChange={(e) => {
                const selectedId = e.target.value;
                const selectedDoc = doctors.find((d: any) => (d.id || d._id) === selectedId);
                
                setFormData({
                  ...formData,
                  doctor_id: selectedId,
                  doctor_name: selectedDoc ? selectedDoc.name : "Unknown Doctor"
                });
              }}
              required
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }}
            >
              <option value="">Select Doctor</option>
              {doctors.map((doctor: any) => (
                <option key={doctor.id || doctor._id} value={doctor.id || doctor._id}>
                  {doctor.name} - {doctor.specialty || doctor.specialization}
                </option>
              ))}
            </select>
          )}
        </div>
        
        {/* SERVICE DROPDOWN */}
        <div style={{marginBottom: '1rem'}}>
          <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 'bold'}}>Service</label>
          <select 
            name="service_id"
            value={formData.service_id}
            onChange={handleInputChange}
            required
            style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc'}}
          >
            <option value="">Select Service</option>
            <option value="checkup">Regular Checkup (5000 Rs)</option>
            <option value="consultation">Consultation (3000 Rs)</option>
            <option value="followup">Follow-up (4000 Rs)</option>
          </select>
        </div>
        
        {/* DATE */}
        <div style={{marginBottom: '1rem'}}>
          <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 'bold'}}>Date</label>
          <input 
            type="date"
            name="appointment_date"
            value={formData.appointment_date}
            onChange={handleInputChange}
            required
            min={new Date().toISOString().split('T')[0]}
            style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc'}}
          />
        </div>
        
        {/* TIME */}
        <div style={{marginBottom: '1.5rem'}}>
          <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 'bold'}}>Time</label>
          <select 
            name="time_slot"
            value={formData.time_slot}
            onChange={handleInputChange}
            style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc'}}
          >
            <option value="09:00">09:00 AM</option>
            <option value="10:00">10:00 AM</option>
            <option value="11:00">11:00 AM</option>
            <option value="14:00">02:00 PM</option>
            <option value="15:00">03:00 PM</option>
          </select>
        </div>
        
        <button 
          type="submit" 
          disabled={!formData.doctor_id || !formData.service_id || !formData.appointment_date || loading}
          style={{
            width: '100%', padding: '14px', fontSize: '16px', fontWeight: 'bold',
            background: '#4f46e5', color: 'white', border: 'none',
            borderRadius: '8px', cursor: 'pointer', transition: '0.3s'
          }}
        >
          {loading ? 'Processing...' : 'Book Appointment'}
        </button>
      </form>

      <div style={{marginTop: '1.5rem', textAlign: 'center'}}>
        <button 
          onClick={() => navigate('/dashboard')}
          style={{
            background: 'transparent', color: '#4f46e5', border: '2px solid #4f46e5',
            padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '500'
          }}
        >
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default Book;