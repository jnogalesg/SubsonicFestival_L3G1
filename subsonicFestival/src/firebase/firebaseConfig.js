// src/firebase/firebaseConfig.js
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDtOf1PKkWOF6qSOL20yyh0cjDzDH2JY4I",
  authDomain: "subsonicfestivall3g1.firebaseapp.com",
  projectId: "subsonicfestivall3g1",
  storageBucket: "subsonicfestivall3g1.firebasestorage.app",
  messagingSenderId: "610386815594",
  appId: "1:610386815594:web:5f91c538bb5f1628697813"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Exportamos la autenticación para que la use el frontend
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();



