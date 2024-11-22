import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { getAuth, updateEmail, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { getFirestore, doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";

const Profile = () => {
  const [userData, setUserData] = useState({
    name: "",
    surname: "",
    age: "",
    idNumber: "",
    photo: "",
    email: "",
    role: "",
  });
  const [newPassword, setNewPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const auth = getAuth();
  const db = getFirestore();

  // Fetch user data when the component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return toast.error("No user logged in.");

        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        } else {
          toast.error("User data not found.");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("Error fetching user data.");
      }
    };

    fetchUserData();
  }, [auth.currentUser]);

  // Handle profile update
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated.");

      // Update user info in Firestore
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, userData);

      // Optionally update Firebase Auth info (like email)
      if (user.email !== userData.email) {
        await updateEmail(user, userData.email);
      }

      toast.success("Profile updated successfully.");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Error updating profile.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle password update
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated.");

      // Prompt for current password for reauthentication
      const credential = EmailAuthProvider.credential(user.email, prompt("Please enter your current password"));
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, newPassword);
      toast.success("Password updated successfully.");
    } catch (error) {
      console.error("Error updating password:", error);
      toast.error("Error updating password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle user profile deletion
  const handleDeleteProfile = async () => {
    if (window.confirm("Are you sure you want to delete your profile? This action is irreversible.")) {
      setIsSubmitting(true);

      try {
        const user = auth.currentUser;
        if (!user) throw new Error("User not authenticated.");

        // Delete user data from Firestore
        const userRef = doc(db, "users", user.uid);
        await deleteDoc(userRef);

        // Optionally, delete Firebase Auth account
        await user.delete();

        toast.success("Profile deleted successfully.");
      } catch (error) {
        console.error("Error deleting profile:", error);
        toast.error("Error deleting profile.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="profile-container">
      <h2>User Profile</h2>

      {/* Display Profile Information */}
      <form onSubmit={handleUpdateProfile}>
        <div>
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            value={userData.name}
            onChange={(e) => setUserData({ ...userData, name: e.target.value })}
            required
          />
        </div>

        <div>
          <label htmlFor="surname">Surname</label>
          <input
            type="text"
            id="surname"
            value={userData.surname}
            onChange={(e) => setUserData({ ...userData, surname: e.target.value })}
            required
          />
        </div>

        <div>
          <label htmlFor="age">Age</label>
          <input
            type="number"
            id="age"
            value={userData.age}
            onChange={(e) => setUserData({ ...userData, age: e.target.value })}
            required
            min="1"
            max="150"
          />
        </div>

        <div>
          <label htmlFor="idNumber">ID Number</label>
          <input
            type="text"
            id="idNumber"
            value={userData.idNumber}
            onChange={(e) => setUserData({ ...userData, idNumber: e.target.value })}
            required
          />
        </div>

        <div>
          <label htmlFor="photo">Photo</label>
          <input
            type="file"
            id="photo"
            onChange={(e) => setUserData({ ...userData, photo: URL.createObjectURL(e.target.files[0]) })}
            accept="image/*"
          />
          {userData.photo && <img src={userData.photo} alt="Profile Preview" style={{ maxWidth: "100px", maxHeight: "100px" }} />}
        </div>

        <div>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={userData.email}
            onChange={(e) => setUserData({ ...userData, email: e.target.value })}
            required
          />
        </div>

        <div>
          <label htmlFor="role">Role</label>
          <input
            type="text"
            id="role"
            value={userData.role}
            onChange={(e) => setUserData({ ...userData, role: e.target.value })}
            required
            disabled
          />
        </div>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Updating..." : "Update Profile"}
        </button>
      </form>

      {/* Password Update Form */}
      <h3>Change Password</h3>
      <form onSubmit={handleUpdatePassword}>
        <div>
          <label htmlFor="newPassword">New Password</label>
          <input
            type="password"
            id="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Updating..." : "Update Password"}
        </button>
      </form>

      {/* Profile Deletion */}
      <button onClick={handleDeleteProfile} disabled={isSubmitting}>
        {isSubmitting ? "Deleting..." : "Delete Profile"}
      </button>
    </div>
  );
};

export default Profile;
