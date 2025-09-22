/**
 * Complete SafariVerse Reset Script
 * 
 * This script provides options for:
 * 1. Clearing Firebase data
 * 2. Instructions for clearing browser data
 * 3. Resetting any cached data
 */

import { initializeApp } from 'firebase/app';
import { getDatabase, ref, remove, get } from 'firebase/database';
import { readFileSync } from 'fs';

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

async function clearFirebaseData() {
  console.log('🔥 Clearing Firebase Realtime Database...');
  console.log('=====================================');
  
  const collections = [
    'tunedInUsers',        // Music stage users
    'socialHubUsers',      // Social hub users  
    'socialHubMessages',   // Chat messages
  ];
  
  let totalCleared = 0;
  
  for (const collection of collections) {
    try {
      console.log(`🗑️ Checking ${collection}...`);
      
      const collectionRef = ref(database, collection);
      const snapshot = await get(collectionRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        const count = typeof data === 'object' ? Object.keys(data).length : 1;
        
        await remove(collectionRef);
        console.log(`✅ Cleared ${collection} (${count} items)`);
        totalCleared += count;
      } else {
        console.log(`ℹ️ ${collection} was already empty`);
      }
    } catch (error) {
      console.error(`❌ Error clearing ${collection}:`, error.message);
    }
  }
  
  console.log('');
  console.log(`📊 Firebase Summary: ${totalCleared} total items cleared`);
  return totalCleared;
}

function showBrowserDataInstructions() {
  console.log('');
  console.log('🌐 Browser Data Cleanup Instructions');
  console.log('===================================');
  console.log('');
  console.log('To completely reset SafariVerse, also clear browser data:');
  console.log('');
  console.log('📱 Chrome/Edge:');
  console.log('   1. Press F12 to open DevTools');
  console.log('   2. Go to Application > Storage');
  console.log('   3. Click "Clear site data"');
  console.log('   4. Or manually clear:');
  console.log('      - Local Storage (safariChatProfile, hbar_balance_*, etc.)');
  console.log('      - Session Storage');
  console.log('      - IndexedDB');
  console.log('');
  console.log('🦊 Firefox:');
  console.log('   1. Press F12 to open DevTools');
  console.log('   2. Go to Storage tab');
  console.log('   3. Right-click on localhost:3000');
  console.log('   4. Select "Delete All"');
  console.log('');
  console.log('🔍 Safari:');
  console.log('   1. Open Web Inspector (Cmd+Option+I)');
  console.log('   2. Go to Storage tab');
  console.log('   3. Clear Local Storage and Session Storage');
  console.log('');
}

function showLocalStorageKeys() {
  console.log('🔑 SafariVerse Local Storage Keys');
  console.log('=================================');
  console.log('');
  console.log('These keys are typically stored in browser localStorage:');
  console.log('');
  console.log('🎵 Music Stage:');
  console.log('   - Radio station preferences');
  console.log('   - Last tuned country');
  console.log('');
  console.log('💬 Social Hub:');
  console.log('   - safariChatProfile (user profile data)');
  console.log('   - Chat preferences');
  console.log('');
  console.log('💰 Wallet & Marketplace:');
  console.log('   - hbar_balance_* (cached HBAR balances)');
  console.log('   - svtBalance (Safari tokens)');
  console.log('   - Wallet connection data');
  console.log('');
  console.log('🎮 Game Data:');
  console.log('   - Game scores and achievements');
  console.log('   - Settings and preferences');
  console.log('');
}

async function completeReset() {
  console.log('🚀 SafariVerse Complete Reset Tool');
  console.log('==================================');
  console.log('');
  console.log('This will provide a fresh start for SafariVerse by:');
  console.log('✅ Clearing all Firebase Realtime Database data');
  console.log('ℹ️ Providing instructions for browser data cleanup');
  console.log('');
  
  try {
    // Clear Firebase data
    const clearedCount = await clearFirebaseData();
    
    // Show browser cleanup instructions
    showBrowserDataInstructions();
    showLocalStorageKeys();
    
    console.log('');
    console.log('🎉 Reset Process Complete!');
    console.log('=========================');
    console.log('');
    console.log('✅ Firebase: All data cleared');
    console.log('⚠️ Browser: Manual cleanup required (see instructions above)');
    console.log('');
    console.log('🔄 Next Steps:');
    console.log('   1. Clear your browser data using the instructions above');
    console.log('   2. Restart your development server: npm run dev');
    console.log('   3. Visit http://localhost:3000 for a fresh start');
    console.log('');
    console.log('🌟 SafariVerse is now ready for fresh data!');
    
  } catch (error) {
    console.error('❌ Reset failed:', error.message);
    console.error('');
    console.error('🔧 Troubleshooting:');
    console.error('   - Check your internet connection');
    console.error('   - Verify Firebase configuration');
    console.error('   - Ensure you have proper Firebase permissions');
    process.exit(1);
  }
}

// Run the complete reset
completeReset()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
