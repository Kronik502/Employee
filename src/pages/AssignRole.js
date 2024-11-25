import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";


const AssignRole = () => {
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [age, setAge] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [photo, setPhoto] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("sysadmin"); // Default role
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle photo upload (convert to Base64)
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size should be less than 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result); // Save Base64 encoded string
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate input fields
    if (!name || !surname || !age || !idNumber || !photo || !email || !password) {
      toast.error("All fields are required.");
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('test');
      
      // Step 1: Create the user in Firebase Auth
      const auth = getAuth();
      // const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // const uid =' userCredential.user.uid';

      // Step 2: Save the admin details (without email and password) in Firestore
      // const db = getFirestore();
      const newAdminData = {
        name,
        surname,
        email,
        age: parseInt(age, 10),
        idNumber,
        photo,
        role,
        password
        // uid, // Include UID to link Firebase Auth with Firestore
      };
      // console.log(newAdminData);
      

      
      // Save the user data to Firestore
      // await setDoc(doc(db, "users", uid), newAdminData);

      // Step 3: Send the data to your backend API to assign the role (if needed)
      // const token = localStorage.getItem("idToken");  // Assuming the token is stored after authentication
      const response = await axios.post(
        "http://localhost:5000/api/assign-general-admin", // Endpoint to assign role in the backend
        newAdminData );

      toast.success(response.data.message); // Show success message
      setIsSubmitting(false);

      // Clear the form after successful submission
      setName("");
      setSurname("");
      setAge("");
      setIdNumber("");
      setPhoto(null);
      setEmail("");
      setPassword("");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Unexpected error occurred.";
      toast.error(errorMessage); // Show error message
      setIsSubmitting(false);
    }
  };

  return (
    <div className="assign-role-container">
      <h2>Assign Role to New Admin</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter Name"
            required
          />
        </div>
        <div>
          <label htmlFor="surname">Surname</label>
          <input
            type="text"
            id="surname"
            value={surname}
            onChange={(e) => setSurname(e.target.value)}
            placeholder="Enter Surname"
            required
          />
        </div>
        <div>
          <label htmlFor="age">Age</label>
          <input
            type="number"
            id="age"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="Enter Age"
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
            value={idNumber}
            onChange={(e) => setIdNumber(e.target.value)}
            placeholder="Enter ID Number"
            required
          />
        </div>
        <div>
          <label htmlFor="photo">Photo</label>
          <input
            type="file"
            id="photo"
            onChange={handlePhotoChange}
            accept="image/*"
            required
          />
          {photo && (
            <img
              src={photo}
              alt="Preview"
              style={{ maxWidth: "100px", maxHeight: "100px" }}
            />
          )}
        </div>
        <div>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter Email"
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter Password"
            required
            minLength="6"
          />
        </div>
        <div>
          <label htmlFor="role">Role</label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            disabled
          >
            <option value="sysadmin">SysAdmin</option>
            <option value="general-admin">General Admin</option>
          </select>
        </div>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Assigning..." : "Assign Role"}
        </button>
      </form>
    </div>
  );
};

export default AssignRole;
