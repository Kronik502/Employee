import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate for redirection
import { auth, db } from './firebase'; // Firebase imports
import { doc, getDoc } from 'firebase/firestore'; // Firestore imports
import { signOut } from 'firebase/auth';  // Firebase sign out function
import './navbar.css'
const Navbar = () => {
  const [role, setRole] = useState(null);  // State to hold user role
  const [name, setName] = useState(null);  // State to hold user name
  const [photo, setPhoto] = useState(null);  // State to hold user profile photo
  const [loading, setLoading] = useState(true);  // State to handle loading state
  const navigate = useNavigate(); // Initialize useNavigate for conditional redirects

  // Function to handle user logout
  const handleLogout = async () => {
    try {
      await signOut(auth); // Firebase sign out function
      navigate('/login');  // Redirect to login page after successful logout
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  useEffect(() => {
    // Function to fetch user details from Firestore
    const fetchUserDetails = async () => {
      const user = auth.currentUser; // Get the currently authenticated user
      if (user) {
        try {
          
          // Fetch user details from Firestore using user.uid
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          const userData = userDoc.data();
          console.log(userData);
          
          
          // Set role, name, and profile photo in state
          setRole(userData?.role);
          setName(`${userData?.name} ${userData?.surname}`);  // Combine name and surname
          setPhoto(userData?.photo);  // Set the profile photo URL (base64 or Firebase URL)
        } catch (error) {
          console.error("Error fetching user details:", error);
          navigate('/login');  // Redirect to login if there's an error
        }
      } else {
        navigate('/login'); // Redirect to login if no user is authenticated
      }
      setLoading(false); // Set loading to false after the details are fetched or if there's an error
    };

    fetchUserDetails(); // Call the function to fetch the details when the component loads
  }, [navigate]); // Only re-run the effect when the navigate function changes

  if (loading) {
    return <div>Loading...</div>;  // Show loading indicator while the user role and name are being fetched
  }

  return (
    <nav className="navbar">
      <ul>
        {/* Conditionally render links based on user role */}
        {role === 'general-admin' && (
          <>
            <li><Link to="/dashboard">General Admin Dashboard</Link></li>
            <li><Link to="/employees">Employee Management</Link></li>
          </>
        )}

        {role === 'super-admin' && (
          <>
            <li><Link to="/super-admin-dashboard">Super Admin Dashboard</Link></li>
            <li><Link to="/assign-admin">Assign Role</Link></li>
            <li><Link to="/employees">Employee Management</Link></li>
          </>
        )}

        {/* Display the full name and profile photo */}
        {auth.currentUser ? (
          <li className="user-info">
            <div className="user-profile">
              {photo ? (
                <img
                  src={photo}
                  alt="Profile"
                  className="profile-photo"
                  style={{ width: "40px", height: "40px", borderRadius: "50%" }}  // Round profile photo
                />
              ) : (
                <div className="default-avatar">👤</div>  // Placeholder if no photo is available
              )}
              <span className="user-name">{name}</span>
            </div>
            <button onClick={handleLogout}>Logout</button>
          </li>
        ) : (
          <li><Link to="/login">Login</Link></li>  // Login link if user is not authenticated
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
