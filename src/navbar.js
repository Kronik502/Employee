import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate for redirection
import { auth, db } from './firebase'; // Firebase imports
import { doc, getDoc } from 'firebase/firestore'; // Firestore imports
import { signOut } from 'firebase/auth';  // Firebase sign out function
import { toast } from 'react-toastify'; // For toast notifications
import './navbar.css';

const Navbar = () => {
  const [role, setRole] = useState(null);  // State to hold user role
  const [name, setName] = useState(null);  // State to hold user name
  const [photo, setPhoto] = useState(null);  // State to hold user profile photo
  const [loading, setLoading] = useState(true);  // State to handle loading state
  const [dropdownVisible, setDropdownVisible] = useState(false);  // State to control dropdown visibility
  const navigate = useNavigate(); // Initialize useNavigate for conditional redirects

  const defaultAvatar = '/path/to/default-avatar.png';  // Define a path for a default avatar image

  const handleLogout = async () => {
    try {
      await signOut(auth); // Firebase sign out function
      navigate('/login');  // Redirect to login page after successful logout
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const handleProfileClick = useCallback(() => {
    setDropdownVisible(prevState => !prevState);  // Toggle the dropdown visibility
  }, []);

  useEffect(() => {
    const fetchUserDetails = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          const userData = userDoc.data();
          setRole(userData?.role);
          setName(`${userData?.name} ${userData?.surname}`);
          setPhoto(userData?.photo);
        } catch (error) {
          toast.error('Failed to fetch user details. Please log in again.');
          navigate('/login');
        }
      } else {
        navigate('/login');
      }
      setLoading(false);
    };

    fetchUserDetails();
  }, [navigate]);

  if (loading) {
    return <div className="loading-indicator">Loading...</div>;  // You can add a spinner or progress bar here
  }

  const roleBasedLinks = {
    'general-admin': [
      { to: '/dashboard', label: 'General Admin Dashboard' },
      { to: '/employees', label: 'Employee Management' },
    ],
    'super-admin': [
      { to: '/super-admin-dashboard', label: 'Super Admin Dashboard' },
      { to: '/assign-admin', label: 'Assign Role' },
      { to: '/employees', label: 'Employee Management' },
    ],
  };

  const userLinks = roleBasedLinks[role] || [];

  return (
    <nav className="navbar">
      <ul>
        {userLinks.map((link) => (
          <li key={link.to}>
            <Link to={link.to}>{link.label}</Link>
          </li>
        ))}
        {auth.currentUser ? (
          <li className="user-info">
            <div className="user-profile" onClick={handleProfileClick}>
              <img
                src={photo || defaultAvatar}
                alt="Profile"
                className="profile-photo"
                style={{ width: '40px', height: '40px', borderRadius: '50%' }}
              />
              <span className="user-name">{name}</span>
            </div>

            {dropdownVisible && (
              <div className="profile-dropdown">
                <ul>
                  <li><Link to="/profile">View Profile</Link></li>
                  <li><button onClick={handleLogout}>Logout</button></li>
                </ul>
              </div>
            )}
          </li>
        ) : (
          <li><Link to="/login">Login</Link></li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
