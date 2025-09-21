import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCG4a2gbbMCVUYjtYv_uFjRcu0tukw-Sa8",
  authDomain: "safariverse-2fdf5.firebaseapp.com",
  databaseURL: "https://safariverse-2fdf5-default-rtdb.firebaseio.com/", // Add this line!
  projectId: "safariverse-2fdf5",
  storageBucket: "safariverse-2fdf5.firebasestorage.app",
  messagingSenderId: "1080598906073",
  appId: "1:1080598906073:web:a7575e230f92e98ccfaac8",
  measurementId: "G-TC7SQ3X1H2",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database and get a reference to the service
export const database = getDatabase(app);

// Debug logging
console.log("🔥 Firebase initialized with config:", {
  projectId: firebaseConfig.projectId,
  databaseURL: firebaseConfig.databaseURL,
  hasDatabase: !!database,
});

export default app;
