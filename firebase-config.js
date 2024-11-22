const admin = require('firebase-admin');
const path = require('path');

// Path to your Firebase Admin SDK service account credentials file
const serviceAccount = path.join(__dirname, 'firebase-credentials.json');

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

module.exports = { db };
