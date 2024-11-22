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
app.post('/api/assign-general-admin', async (req, res) => {
  const { email, name, surname, age, idNumber, photo, role } = req.body;

  if (!email || !name || !surname || !age || !idNumber || !photo) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {

    console.log('bas');
    

    // const userRecord = await admin.auth().getUserByEmail(email);
    // console.log(userRecord);
    
    // const userDoc = await db.collection('users').doc(userRecord.uid).get();

    // if (!userDoc.exists) {
    //   return res.status(404).json({ message: 'User not found' });
    // }

    // await db.collection('users').doc(userRecord.uid).update({ role: 'sysadmin' });
    res.status(201).json({ message: 'General admin role assigned successfully' });
  } catch (error) {
    console.error('Error assigning admin role:', error);
    res.status(500).json({ message: 'Error assigning admin role' });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
