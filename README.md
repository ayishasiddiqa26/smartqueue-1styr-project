# XeroQ - Campus Print Queue Management System

A modern web application for managing print queues in educational institutions. Students can submit print jobs and track their status, while administrators can manage the queue and handle pickups.

## Features

- **Student Portal**: Submit print jobs, track queue status, add comments
- **Admin Dashboard**: Manage print queue, QR code scanning, job status updates
- **Real-time Updates**: Live queue status and notifications
- **Secure Authentication**: Role-based access control
- **Mobile Responsive**: Works on all devices

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **UI**: Tailwind CSS + shadcn/ui
- **Backend**: Firebase (Auth, Firestore, Storage)
- **QR Scanning**: @zxing/library
- **State Management**: TanStack Query

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- Firebase account

### 1. Clone and Install

```bash
git clone <repository-url>
cd xeroq
npm install
```

### 2. Firebase Configuration

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Authentication (Email/Password)
3. Create Firestore Database
4. Copy your Firebase config and replace the placeholder values in `src/firebase.ts`:

```typescript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-actual-project-id",
  storageBucket: "your-project.firebasestorage.app",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

### 3. Deploy Firestore Rules

Copy the security rules from `firestore.rules` to your Firebase project:

1. Go to Firestore Database > Rules
2. Replace the default rules with the content from `firestore.rules`
3. Publish the rules

### 4. Update Firebase Project ID

Update `.firebaserc` with your project ID:

```json
{
  "projects": {
    "default": "your-actual-project-id"
  }
}
```

### 5. Run the Application

```bash
# Development
npm run dev

# Build for production
npm run build

# Deploy to Firebase Hosting (optional)
npm install -g firebase-tools
firebase login
firebase deploy
```

## Usage

### First Time Setup

1. Register as an admin user (first user becomes admin)
2. Students can register with their email addresses
3. Start submitting and managing print jobs!

### Student Features

- Upload PDF files (up to 500MB)
- Select print options (copies, color, pickup time)
- Track job status in real-time
- Add optional comments for admin

### Admin Features

- View all print jobs by status or pickup slot
- QR code scanning for quick pickup
- Manual pickup confirmation with 4-digit codes
- Add comments and mark jobs requiring action
- Real-time queue management

## Security

- Role-based access control
- Secure Firestore rules
- Input validation and sanitization
- HTTPS-only in production

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions, please create an issue in the GitHub repository.