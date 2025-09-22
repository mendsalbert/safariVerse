/**
 * Simple Firebase Data Cleaner for SafariVerse
 * Run with: node scripts/clear-firebase-simple.js
 */

import { initializeApp } from 'firebase/app';
import { getDatabase, ref, remove, get } from 'firebase/database';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCG4a2gbbMCVUYjtYv_uFjRcu0tukw-Sa8",
  authDomain: "safariverse-2fdf5.firebaseapp.com",
  databaseURL: "https://safariverse-2fdf5-default-rtdb.firebaseio.com/",
  projectId: "safariverse-2fdf5",
  storageBucket: "safariverse-2fdf5.firebasestorage.app",
  messagingSenderId: "1080598906073",
  appId: "1:1080598906073:web:a7575e230f92e98ccfaac8",
  measurementId: "G-TC7SQ3X1H2",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

async function clearAllData() {
  console.log('🔥 SafariVerse Firebase Data Cleaner');
  console.log('====================================');
  
  try {
    // Collections to clear
    const collections = ['tunedInUsers', 'socialHubUsers', 'socialHubMessages'];
    
    for (const collection of collections) {
      console.log(`🗑️ Clearing ${collection}...`);
      
      // Check if collection exists first
      const collectionRef = ref(database, collection);
      const snapshot = await get(collectionRef);
      
      if (snapshot.exists()) {
        const count = Object.keys(snapshot.val()).length;
        await remove(collectionRef);
        console.log(`✅ Cleared ${collection} (${count} items)`);
      } else {
        console.log(`ℹ️ ${collection} was already empty`);
      }
    }
    
    console.log('');
    console.log('🎉 Firebase cleanup completed!');
    console.log('🚀 Your database is ready for fresh data!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
  
  process.exit(0);
}

clearAllData();
