const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const admin = require('firebase-admin');
const { body, validationResult } = require('express-validator');

// Initialize Firebase Admin (still using Firebase for user management)
const serviceAccount = require('./firebase-credentials.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://your-project-id.firebaseio.com', // Update with your Firebase DB URL
});

const db = admin.firestore();
const app = express();

// Middleware setup
app.use(cors());
app.use(cookieParser());
app.use(bodyParser.json({ limit: '10mb' })); // Allow large payloads (e.g., Base64 images)

// Session middleware setup
app.use(session({
  secret: 'your-secret-key',  // Use a strong secret key
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }  // Set to true if using HTTPS in production
}));

// === Middleware to Check Super Admin Status (using session) ===
const isSuperAdmin = async (req, res, next) => {
  if (!req.session.user || req.session.user.role !== 'super-admin') {
    return res.status(403).json({ message: 'Access denied: Not a super admin' });
  }
  next();  // Proceed to the next middleware/handler
};

// === Routes ===

// Home Route
app.get('/', (req, res) => res.status(200).send('Welcome to the Employee Management API!'));

// 1. Login (User should login to set session)
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const userRecord = await admin.auth().getUserByEmail(email);
    
    // Check if the password matches (you'll need a password check logic, possibly using Firebase Auth or a custom solution)
    // For example, assume we validate the password here:

    if (password === 'password') {  // Replace with actual password validation
      req.session.user = {
        uid: userRecord.uid,
        email: userRecord.email,
        role: 'super-admin' // Set this dynamically based on your Firestore or user roles
      };
      return res.status(200).json({ message: 'Login successful' });
    } else {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
});

// 2. Add Employee
app.post('/api/employee', async (req, res) => {
  const { name, email, phone, position, saId, photo } = req.body;

  

  if (!name || !email || !phone || !position || !saId || !photo) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  if (!/^\d{13}$/.test(saId)) {
    return res.status(400).json({ message: 'Invalid South African ID' });
  }

  try {
    const employeeRef = db.collection('employees').doc();
    await employeeRef.set({ name, email, phone, position, saId, photo });
    res.status(201).json({ message: 'Employee added successfully' });
  } catch (error) {
    console.error('Error adding employee:', error);
    res.status(500).json({ message: 'Error adding employee' });
  }
});

// 3. Get All Employees
app.get('/api/employees', async (req, res) => {
  try {
    const snapshot = await db.collection('employees').get();
    const employees = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ message: 'Error fetching employees' });
  }
});

// 4. Update Employee
app.put('/api/employee/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, position, saId, photo } = req.body;

  if (!name || !email || !phone || !position || !saId || !photo) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  if (!/^\d{13}$/.test(saId)) {
    return res.status(400).json({ message: 'Invalid South African ID' });
  }

  try {
    const employeeRef = db.collection('employees').doc(id);
    await employeeRef.update({ name, email, phone, position, saId, photo });
    res.status(200).json({ message: 'Employee updated successfully' });
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({ message: 'Error updating employee' });
  }
});

// 5. Delete Employee
app.delete('/api/employee/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const employeeRef = db.collection('employees').doc(id);
    await employeeRef.delete();
    res.status(200).json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({ message: 'Error deleting employee' });
  }
});

// 6. Assign General Admin Role (only accessible by super admin)
// POST - Assign General Admin Role (Create)
app.post('/api/assign-general-admin', async (req, res) => {
  const { email, name, surname, age, idNumber, photo, role, password } = req.body;

  try {
    // Create user in Firebase Authentication
    const user = await admin.auth().createUser({
      email,
      password,
      displayName: name,
    });

    // Store user data in Firestore (or any other database)
    const newAdminData = {
      name,
      surname,
      age: parseInt(age, 10),
      idNumber,
      photo,
      role,
      userID: user.uid,
    };

    await db.collection('users').doc(user.uid).set(newAdminData);

    res.status(201).json({ message: 'General admin role assigned successfully' });
  } catch (error) {
    console.error('Error assigning admin role:', error);
    res.status(500).json({ message: 'Error assigning admin role' });
  }
});
// GET - Get User Profile by User ID (Read)
app.get('/api/user/:userID', async (req, res) => {
  const { userID } = req.params;

  try {
    const userDoc = await db.collection('users').doc(userID).get();

    if (!userDoc.exists) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(userDoc.data());
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ message: 'Error fetching user data' });
  }
});

// PUT - Update User Profile (Update)
app.put('/api/user/:userID', async (req, res) => {
  const { userID } = req.params;
  const { name, surname, age, idNumber, photo, role } = req.body;

  try {
    const userRef = db.collection('users').doc(userID);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updatedData = {
      name,
      surname,
      age: parseInt(age, 10),
      idNumber,
      photo,
      role,
    };

    await userRef.update(updatedData);

    res.status(200).json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Error updating profile' });
  }
});
// DELETE - Remove User (Delete)
app.delete('/api/user/:userID', async (req, res) => {
  const { userID } = req.params;

  try {
    // Delete user from Firebase Authentication
    await admin.auth().deleteUser(userID);

    // Remove user data from Firestore
    await db.collection('users').doc(userID).delete();

    res.status(200).json({ message: 'User removed successfully' });
  } catch (error) {
    console.error('Error removing user:', error);
    res.status(500).json({ message: 'Error removing user' });
  }
});


// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
