import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
    apiKey: "AIzaSyB4A2Fz7AFW5tJkwicyFaWMZCbII2wdxdc",
    authDomain: "accessibility-with-ai-app.firebaseapp.com",
    projectId: "accessibility-with-ai-app",
    storageBucket: "accessibility-with-ai-app.firebasestorage.app",
    messagingSenderId: "458455053809",
    appId: "1:458455053809:web:0879498236f224ef0d8050",
    measurementId: "G-V0SZW3QT9B"  
  };
  

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const rtdb = getDatabase(app);

export { app, auth, db, rtdb }; 