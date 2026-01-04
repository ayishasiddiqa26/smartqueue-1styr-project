#!/usr/bin/env node

/**
 * Restore Firebase Configuration Script
 * 
 * This script helps restore the real Firebase configuration from the backup file.
 * Run this when you're ready to deploy with your actual Firebase credentials.
 * 
 * Usage: node restore-config.js
 */

const fs = require('fs');
const path = require('path');

const BACKUP_FILE = 'firebase.config.backup.js';
const CONFIG_FILE = 'src/firebase.ts';

function restoreConfig() {
  console.log('🔄 Restoring Firebase configuration...');

  // Check if backup file exists
  if (!fs.existsSync(BACKUP_FILE)) {
    console.error('❌ Backup file not found:', BACKUP_FILE);
    console.log('💡 Make sure you have the firebase.config.backup.js file with your real config.');
    process.exit(1);
  }

  try {
    // Read backup config
    const backupContent = fs.readFileSync(BACKUP_FILE, 'utf8');
    const configMatch = backupContent.match(/const firebaseConfig = ({[\s\S]*?});/);
    
    if (!configMatch) {
      console.error('❌ Could not parse Firebase config from backup file');
      process.exit(1);
    }

    const firebaseConfig = configMatch[1];

    // Create new firebase.ts content
    const newContent = `import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration - restored from backup
const firebaseConfig = ${firebaseConfig};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
`;

    // Write to firebase.ts
    fs.writeFileSync(CONFIG_FILE, newContent);

    console.log('✅ Firebase configuration restored successfully!');
    console.log('📁 Updated:', CONFIG_FILE);
    console.log('');
    console.log('🚀 Next steps:');
    console.log('1. Update .firebaserc with your project ID');
    console.log('2. Deploy Firestore rules: firebase deploy --only firestore:rules');
    console.log('3. Test the application: npm run dev');
    console.log('4. Deploy: firebase deploy');

  } catch (error) {
    console.error('❌ Error restoring configuration:', error.message);
    process.exit(1);
  }
}

// Run the script
restoreConfig();