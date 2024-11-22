import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';  // Import useNavigate (React Router v6)
import { toast } from 'react-toastify';
import { signInWithEmailAndPassword, getAuth } from 'firebase/auth';  // Import Firebase auth functions

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);  // Loading state
  const [error, setError] = useState('');  // General error state
  const [emailError, setEmailError] = useState(''); // Email validation error
  const [passwordError, setPasswordError] = useState(''); // Password validation error
  const navigate = useNavigate();  // Initialize useNavigate hook

  // Hardcoded Super Admin UID (Change this to your actual Super Admin's UID)
  const SUPER_ADMIN_UID = 'vd72A1BS1gQRDOB0zTuhF3VdbNo1';

  const validateForm = () => {
    let isValid = true;
    setEmailError('');
    setPasswordError('');

    // Validate email
    if (!email) {
      setEmailError('Email is required.');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Please enter a valid email.');
      isValid = false;
    }

    // Validate password
    if (!password) {
      setPasswordError('Password is required.');
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;  // Prevent submission if form is invalid

    setLoading(true);  // Set loading state to true
    setError('');  // Reset general error state

    try {
      // Authenticate with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(getAuth(), email, password);
      const user = userCredential.user;
      localStorage.setItem('idToken', await user.getIdToken()); // Store ID token from Firebase
      toast.success('Login successful');
      
      // Check if the logged-in user is the super admin
      if (user.uid === SUPER_ADMIN_UID) {
        // Navigate to Super Admin Dashboard if the user is the super admin
        navigate('/superadmin/dashboard');
      } else {
        // Navigate to General Admin Dashboard for all other users
        navigate('/admin/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);  // Log errors for debugging

      // Handle Firebase error messages
      let errorMessage = 'An error occurred during login';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'User not found. Please check your email.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many login attempts. Please try again later.';
      }

      toast.error(errorMessage);
      setError(errorMessage); // Set error state to display the error message
    } finally {
      setLoading(false);  // Set loading state to false after operation is complete
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input 
            type="email" 
            placeholder="Email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            disabled={loading} // Disable input when loading
          />
          {emailError && <div className="error-message">{emailError}</div>} {/* Display email error */}
        </div>
        
        <div className="form-group">
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            disabled={loading} // Disable input when loading
          />
          {passwordError && <div className="error-message">{passwordError}</div>} {/* Display password error */}
        </div>

        {error && <div className="error-message">{error}</div>} {/* Display general error message */}
        
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'} {/* Show loading text when submitting */}
        </button>
      </form>
    </div>
  );
};

export default Login;
