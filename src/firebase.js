
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth"; // Import auth functions
import { getFirestore, collection, getDocs, addDoc, updateDoc, doc, deleteDoc } from "firebase/firestore";  // Firestore functions
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBv3CoUJMoqcgh62NUQV7cy7iGASTIaTkE",
  authDomain: "employees-cd583.firebaseapp.com",
  projectId: "employees-cd583",
  storageBucket: "employees-cd583.firebasestorage.app",
  messagingSenderId: "336183396071",
  appId: "1:336183396071:web:d6d8cec9b173c48c234442",
  measurementId: "G-2DS8HW6HS0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);  // Initialize Firebase Authentication
const db = getFirestore(app);  // Initialize Firestore
const analytics = getAnalytics(app);  // Initialize Firebase Analytics (if needed)

// Export Firebase services
export { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, db, collection, getDocs, addDoc, updateDoc, doc, deleteDoc };
