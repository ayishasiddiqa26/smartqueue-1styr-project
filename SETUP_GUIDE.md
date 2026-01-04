# XeroQ Setup Guide

This guide will help you set up XeroQ from scratch after cloning from GitHub.

## Quick Start

The application will show a configuration screen when Firebase is not properly configured. Follow these steps to get it running:

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Firebase Project Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create a project" or "Add project"
3. Enter project name (e.g., "xeroq-campus")
4. Enable Google Analytics (optional)
5. Create project

### Step 3: Enable Firebase Services

#### Authentication
1. Go to Authentication > Get started
2. Click "Sign-in method" tab
3. Enable "Email/Password"
4. Save

#### Firestore Database
1. Go to Firestore Database > Create database
2. Choose "Start in test mode" (we'll add security rules later)
3. Select a location close to your users
4. Done

### Step 4: Get Firebase Configuration

1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps"
3. Click "Web app" icon (</>)
4. Register app with nickname "XeroQ Web"
5. Copy the `firebaseConfig` object

### Step 5: Update Configuration Files

#### Update `src/firebase.ts`
Replace the placeholder config with your actual Firebase config:

```typescript
const firebaseConfig = {
  apiKey: "your-actual-api-key-here",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-actual-project-id",
  storageBucket: "your-project.firebasestorage.app",
  messagingSenderId: "your-actual-sender-id",
  appId: "your-actual-app-id"
};
```

#### Update `.firebaserc`
```json
{
  "projects": {
    "default": "your-actual-project-id"
  }
}
```

### Step 6: Deploy Security Rules

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Deploy rules: `firebase deploy --only firestore:rules`

Or manually copy rules from `firestore.rules` to Firebase Console > Firestore > Rules

### Step 7: Start Development Server

```bash
npm run dev
```

The app should now load properly and show the login/register screen instead of the configuration screen.

## Creating Admin User

The first user to register will automatically become an admin. After that:

1. Go to the app
2. Click "Register"
3. Choose "Admin" role
4. Fill in details and register
5. You're now an admin!

## Troubleshooting

### Configuration Screen Still Shows
- Check that `src/firebase.ts` has real values, not placeholders
- Verify Firebase project is created and services are enabled
- Check browser console for errors

### Authentication Errors
- Ensure Email/Password is enabled in Firebase Auth
- Check that the domain is authorized (localhost should work by default)

### Firestore Permission Errors
- Deploy the security rules from `firestore.rules`
- Make sure Firestore is created and not in "locked mode"

### Build Errors
- Run `npm install` to ensure all dependencies are installed
- Check Node.js version (requires 18+)

## Production Deployment

### Firebase Hosting (Recommended)

1. Build the app: `npm run build`
2. Deploy: `firebase deploy`
3. Your app will be live at `https://your-project-id.web.app`

### Other Hosting Providers

1. Build: `npm run build`
2. Upload the `dist` folder to your hosting provider
3. Configure redirects for SPA (all routes to `index.html`)

## Environment Variables (Optional)

For additional security, you can use environment variables:

1. Create `.env.local`:
```
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
# ... other config values
```

2. Update `src/firebase.ts` to use `import.meta.env.VITE_*` variables

## Need Help?

- Check the main README.md for feature documentation
- Review Firebase documentation for service-specific issues
- Create an issue in the GitHub repository for bugs or questions