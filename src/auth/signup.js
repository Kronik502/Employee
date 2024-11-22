// Signup.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // React Router v6
import { toast } from 'react-toastify';
import { auth, createUserWithEmailAndPassword, db } from '../firebase'; // Firebase functions
import { setDoc, doc } from 'firebase/firestore';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('admin'); // Default role is 'admin'
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Store the user's role in Firestore (you can also store other information here)
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        role: role, // Store the user's role
        createdAt: new Date(),
      });

      toast.success('Signup successful');
      
      // Redirect based on the user role
      if (role === 'super-admin') {
        navigate('/superadmin/dashboard');
      } else {
        navigate('/admin/dashboard');
      }
    } catch (error) {
      toast.error(error.message || 'Error during signup');
    }
  };

  return (
    <div className="signup-container">
      <h2>Signup</h2>
      <form onSubmit={handleSubmit}>
        <input 
          type="email" 
          placeholder="Email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
        />
        <select value={role} onChange={(e) => setRole(e.target.value)} required>
          <option value="admin">Admin</option>
          <option value="super-admin">Super Admin</option>
        </select>
        <button type="submit">Signup</button>
      </form>
    </div>
  );
};

export default Signup;
