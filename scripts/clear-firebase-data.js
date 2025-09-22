#!/usr/bin/env node

/**
 * Clear all Firebase Realtime Database data for SafariVerse
 * 
 * This script will clear:
 * - tunedInUsers (Music Stage users)
 * - socialHubUsers (Social Hub users)
 * - socialHubMessages (Chat messages)
 * - Any other data in the database
 */

const { initializeApp } = require('firebase/app');
const { getDatabase, ref, remove, set } = require('firebase/database');

// Firebase configuration (same as in lib/firebase.ts)
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

async function clearFirebaseData() {
  try {
    console.log('🔥 Starting Firebase data cleanup...');
    
    // List of collections to clear
    const collectionsToRemove = [
      'tunedInUsers',
      'socialHubUsers', 
      'socialHubMessages'
    ];
    
    console.log('📋 Collections to clear:', collectionsToRemove);
    
    // Clear each collection
    for (const collection of collectionsToRemove) {
      console.log(`🗑️ Clearing ${collection}...`);
      const collectionRef = ref(database, collection);
      await remove(collectionRef);
      console.log(`✅ ${collection} cleared successfully`);
    }
    
    // Clear the entire root (optional - uncomment if you want to clear everything)
    // console.log('🗑️ Clearing entire database...');
    // const rootRef = ref(database, '/');
    // await remove(rootRef);
    // console.log('✅ Entire database cleared successfully');
    
    console.log('🎉 Firebase cleanup completed successfully!');
    console.log('');
    console.log('📊 Summary:');
    console.log(`   - Cleared ${collectionsToRemove.length} collections`);
    console.log('   - tunedInUsers: Music stage users removed');
    console.log('   - socialHubUsers: Social hub users removed');
    console.log('   - socialHubMessages: All chat messages removed');
    console.log('');
    console.log('🚀 Your Firebase database is now clean and ready for fresh data!');
    
  } catch (error) {
    console.error('❌ Error clearing Firebase data:', error);
    console.error('');
    console.error('🔧 Troubleshooting:');
    console.error('   - Check your Firebase permissions');
    console.error('   - Ensure you have admin access to the database');
    console.error('   - Verify your Firebase configuration is correct');
    process.exit(1);
  }
}

// Optional: Add confirmation prompt
function askForConfirmation() {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve) => {
    rl.question('⚠️  This will permanently delete all Firebase data. Are you sure? (yes/no): ', (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y');
    });
  });
}

// Main execution
async function main() {
  console.log('🔥 SafariVerse Firebase Data Cleaner');
  console.log('====================================');
  console.log('');
  
  // Ask for confirmation
  const confirmed = await askForConfirmation();
  
  if (!confirmed) {
    console.log('❌ Operation cancelled by user');
    process.exit(0);
  }
  
  console.log('');
  await clearFirebaseData();
  process.exit(0);
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { clearFirebaseData };
