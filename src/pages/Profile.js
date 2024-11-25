import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getAuth } from 'firebase/auth'; // Firebase Authentication
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore'; // Firestore for data fetch & update
import './Profile.css'; // Assuming the CSS is in the same folder

const Profile = () => {
  const [userData, setUserData] = useState({
    name: '',
    surname: '',
    age: '',
    idNumber: '',
    photo: '',
    email: '',
    role: 'sysadmin',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const auth = getAuth();
  const db = getFirestore();

  useEffect(() => {
    // Ensure the user is authenticated
    const user = auth.currentUser;
    if (!user) {
      toast.error("Please log in to view your profile.");
      return;
    }

    // Fetch user data from Firestore
    const fetchUserData = async () => {
      try {
        const docRef = doc(db, 'users', user.uid); // Use the UID from Firebase Authentication to get the correct user
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setUserData(docSnap.data()); // Set the data if the user document exists
        } else {
          toast.error("User data not found");
        }
      } catch (error) {
        toast.error("Failed to load user data");
      }
    };

    fetchUserData();
  }, [auth, db]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setUserData({
      ...userData,
      [id]: value,
    });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // Max file size is 5MB
        toast.error("File size should be less than 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserData({
          ...userData,
          photo: reader.result, // Save Base64 encoded string
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const user = auth.currentUser;

    if (!user) {
      toast.error("Please log in to update your profile.");
      setIsSubmitting(false);
      return;
    }

    try {
      // Update user data in Firestore
      const docRef = doc(db, 'users', user.uid);
      await updateDoc(docRef, userData);

      toast.success('Profile updated successfully');
      setIsEditing(false); // Exit edit mode after update
    } catch (error) {
      toast.error('Failed to update profile');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="profile-container">
      <h2>Profile</h2>
      <div className="profile-info">
        <div className="profile-photo">
          <img
            src={userData.photo || 'https://via.placeholder.com/150'}
            alt="Profile"
          />
          {isEditing && (
            <input
              type="file"
              id="photo"
              onChange={handlePhotoChange}
              accept="image/*"
              className="file-input"
            />
          )}
        </div>
        <div className="profile-fields">
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Name</label>
              {isEditing ? (
                <input
                  type="text"
                  id="name"
                  value={userData.name}
                  onChange={handleInputChange}
                />
              ) : (
                <p>{userData.name}</p>
              )}
            </div>

            <div className="field">
              <label>Surname</label>
              {isEditing ? (
                <input
                  type="text"
                  id="surname"
                  value={userData.surname}
                  onChange={handleInputChange}
                />
              ) : (
                <p>{userData.surname}</p>
              )}
            </div>

            <div className="field">
              <label>Age</label>
              {isEditing ? (
                <input
                  type="number"
                  id="age"
                  value={userData.age}
                  onChange={handleInputChange}
                />
              ) : (
                <p>{userData.age}</p>
              )}
            </div>

            <div className="field">
              <label>ID Number</label>
              {isEditing ? (
                <input
                  type="text"
                  id="idNumber"
                  value={userData.idNumber}
                  onChange={handleInputChange}
                />
              ) : (
                <p>{userData.idNumber}</p>
              )}
            </div>

            <div className="field">
              <label>Email</label>
              {isEditing ? (
                <input
                  type="email"
                  id="email"
                  value={userData.email}
                  onChange={handleInputChange}
                />
              ) : (
                <p>{userData.email}</p>
              )}
            </div>

           

            {isEditing && (
              <>
                <button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Updating...' : 'Update Profile'}
                </button>
                <button type="button" onClick={() => setIsEditing(false)}>Cancel</button>
              </>
            )}

            {!isEditing && (
              <button type="button" onClick={() => setIsEditing(true)}>
                Edit Profile
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
