#!/usr/bin/env node

/**
 * Switch Firebase Configuration Script
 * 
 * This script helps switch between placeholder and real Firebase configuration.
 * 
 * Usage: 
 *   node switch-config.js real    - Switch to real config for development/deployment
 *   node switch-config.js placeholder - Switch to placeholder config for GitHub
 */

import fs from 'fs';
import path from 'path';

const BACKUP_FILE = 'firebase.config.backup.js';
const CONFIG_FILE = 'src/firebase.ts';
const FIREBASERC_FILE = '.firebaserc';

const PLACEHOLDER_CONFIG = `import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Placeholder Firebase configuration for GitHub
// Replace with your actual config when deploying
const firebaseConfig = {
  apiKey: "your-api-key-here",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.firebasestorage.app",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
`;

const PLACEHOLDER_FIREBASERC = `{
  "projects": {
    "default": "your-firebase-project-id"
  }
}`;

function switchToReal() {
  console.log('🔄 Switching to real Firebase configuration...');

  // Check if backup file exists
  if (!fs.existsSync(BACKUP_FILE)) {
    console.error('❌ Backup file not found:', BACKUP_FILE);
    console.log('💡 Make sure you have the firebase.config.backup.js file with your real config.');
    process.exit(1);
  }

  try {
    // Read backup config
    const backupContent = fs.readFileSync(BACKUP_FILE, 'utf8');
    const configMatch = backupContent.match(/const firebaseConfig = ({[\\s\\S]*?});/);
    
    if (!configMatch) {
      console.error('❌ Could not parse Firebase config from backup file');
      process.exit(1);
    }

    const firebaseConfig = configMatch[1];

    // Create new firebase.ts content with real config
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

    // Update .firebaserc with real project ID
    const realFirebaserc = `{
  "projects": {
    "default": "smartqueue-e53e2"
  }
}`;
    fs.writeFileSync(FIREBASERC_FILE, realFirebaserc);

    console.log('✅ Switched to real Firebase configuration!');
    console.log('📁 Updated:', CONFIG_FILE);
    console.log('📁 Updated:', FIREBASERC_FILE);
    console.log('🚀 Ready for development and deployment!');

  } catch (error) {
    console.error('❌ Error switching to real configuration:', error.message);
    process.exit(1);
  }
}

function switchToPlaceholder() {
  console.log('🔄 Switching to placeholder Firebase configuration...');

  try {
    // Write placeholder config
    fs.writeFileSync(CONFIG_FILE, PLACEHOLDER_CONFIG);
    fs.writeFileSync(FIREBASERC_FILE, PLACEHOLDER_FIREBASERC);

    console.log('✅ Switched to placeholder Firebase configuration!');
    console.log('📁 Updated:', CONFIG_FILE);
    console.log('📁 Updated:', FIREBASERC_FILE);
    console.log('🔒 Safe for GitHub commits!');

  } catch (error) {
    console.error('❌ Error switching to placeholder configuration:', error.message);
    process.exit(1);
  }
}

// Main script
const mode = process.argv[2];

if (mode === 'real') {
  switchToReal();
} else if (mode === 'placeholder') {
  switchToPlaceholder();
} else {
  console.log('🔧 Firebase Configuration Switcher');
  console.log('');
  console.log('Usage:');
  console.log('  node switch-config.js real         - Switch to real config');
  console.log('  node switch-config.js placeholder  - Switch to placeholder config');
  console.log('');
  console.log('Examples:');
  console.log('  node switch-config.js real         # For development/deployment');
  console.log('  node switch-config.js placeholder  # Before GitHub commits');
}