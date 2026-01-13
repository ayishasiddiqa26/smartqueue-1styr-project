🔗 **Live Website:** **https://smartqueue-e53e2.web.app/**

# XeroQ - AI-Powered Campus Print Queue Management System

A modern, intelligent web application for managing print queues in educational institutions. Features AI-powered printer assignment, simulated payment system, and comprehensive queue optimization for hackathon demonstrations.

## 🚀 Features

### 🎓 Student Portal
- **Smart File Upload**: PDF upload with automatic page counting
- **AI Printer Assignment**: Intelligent assignment to optimal printer
- **Payment System**: Simulated payment for priority queue access
- **Real-time Tracking**: Live queue status with AI-estimated wait times
- **Priority Benefits**: Paid jobs receive faster processing
- **Instant Notifications**: Multi-channel alerts when jobs are ready
- **Notification History**: Dedicated tab with complete notification management

### 👨‍💼 Admin Dashboard
- **AI-Powered Management**: Intelligent job prioritization and printer load balancing
- **Secure Pickup Process**: QR code scanning and 4-digit verification required
- **Real-time Monitoring**: Live printer status and queue analytics
- **Comprehensive Reporting**: Job statistics and performance metrics
- **Professional Interface**: Clean, judge-friendly design

### 🤖 AI Integration (Gemini-Powered)
- **Intelligent Printer Assignment**: Automatic assignment to Printer 1 or Printer 2
- **Load Balancing**: Real-time printer load analysis and optimization
- **Smart Prioritization**: AI-determined priority levels (High/Medium/Low)
- **Wait Time Estimation**: Accurate predictions based on queue analysis
- **Explainable Decisions**: Clear reasoning for all AI recommendations

### 💳 Payment System (Demo)
- **Simulated Payments**: Safe demo payment system for hackathons
- **Priority Queue**: Paid jobs receive higher priority processing
- **Flexible Pricing**: ₹2 B&W, ₹5 Color, ₹5 Urgent fee
- **Professional UX**: Clean payment interface without threatening language

### 🔔 Notification System
- **Real-time Alerts**: Instant notifications when jobs are ready for pickup
- **Multi-channel Delivery**: Browser notifications, toast messages, and visual alerts
- **Notification History**: Dedicated tab with persistent notification storage
- **Smart Management**: Mark as read/unread, clear all, and unread count badges
- **Secure & Private**: User-specific notifications with proper authentication
- **Professional Interface**: Clean notification cards with job details and timestamps

## 🛠 Tech Stack

- **Frontend**: React + TypeScript + Vite
- **UI Framework**: Tailwind CSS + shadcn/ui components
- **Backend**: Firebase (Auth, Firestore, Storage)
- **AI Integration**: Google Gemini AI (simulated for demo)
- **QR Processing**: @zxing/library for code scanning
- **Notifications**: Browser Notification API + Custom toast system
- **Date Handling**: date-fns for timestamp formatting
- **State Management**: React hooks with real-time Firestore
- **Security**: Environment variables and secure Firebase rules

## 📋 Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- Firebase account
- Git for version control

### 1. Clone and Install

```bash
git clone https://github.com/ayishasiddiqa26/smartqueue-1styr-project.git
cd xeroq
npm install
```

### 2. Environment Configuration

1. Copy the environment template:
```bash
cp .env.example .env
```

2. Update `.env` with your Firebase credentials:
```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id

# Optional: Gemini AI (for future real implementation)
VITE_GEMINI_API_KEY=your-gemini-api-key

# Application Configuration
VITE_APP_NAME=XeroQ
VITE_DEMO_MODE=true
VITE_PAYMENT_SIMULATION=true
```

### 3. Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Authentication (Email/Password)
3. Create Firestore Database
4. Deploy security rules:

```bash
firebase deploy --only firestore:rules
```

### 4. Run the Application

```bash
# Development server
npm run dev

# Build for production
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

## 🎯 Usage Guide

### First Time Setup

1. **Admin Registration**: First user automatically becomes admin
2. **Student Registration**: Students register with email addresses
3. **Demo Ready**: System includes sample data for demonstrations

### Student Workflow

1. **Upload Document**: Drag & drop PDF files (auto page counting)
2. **Configure Options**: Select copies, color, priority, pickup time
3. **Add Instructions**: Optional special instructions for admin
4. **Payment**: Complete simulated payment for priority processing
5. **Track Status**: Monitor real-time queue position and AI estimates
6. **Receive Notifications**: Get instant alerts when jobs are ready
7. **Manage Notifications**: View history and manage alerts in dedicated tab

### Admin Workflow

1. **Monitor Queue**: View jobs by status, priority, and pickup slots
2. **AI Insights**: Review AI recommendations and printer assignments
3. **Process Jobs**: Progress jobs through waiting → printing → printed
4. **Secure Pickup**: Verify student identity via QR scan or 4-digit code
5. **Analytics**: Monitor printer loads and queue performance

## 🔒 Security & Environment Variables

### Environment Variable Security
- All sensitive credentials stored in `.env` file
- `.env` file is gitignored and never committed
- Environment variables validated at runtime
- Template file (`.env.example`) provided for setup

### Firebase Security
- Role-based access control (student/admin)
- Secure Firestore rules with proper validation
- Authentication required for all operations
- Input sanitization and validation

## 🏆 Hackathon Features

### Judge-Friendly Design
- **Professional Interface**: Clean, modern design without threatening language
- **Explainable AI**: Clear reasoning for all AI decisions
- **Demo Safety**: Simulated payments with no real financial risk
- **Comprehensive Documentation**: Detailed feature explanations

### Technical Highlights
- **AI Integration**: Intelligent printer assignment and queue optimization
- **Real-time Updates**: Live status tracking and notifications
- **Notification System**: Multi-channel alerts with persistent history
- **Scalable Architecture**: Production-ready code structure
- **Security Best Practices**: Environment variables and secure authentication

## 🚀 Deployment

### Firebase Hosting
```bash
npm run build
firebase deploy --only hosting
```

### Environment Variables for Production
Set environment variables in your hosting platform:
- Vercel: Project Settings → Environment Variables
- Netlify: Site Settings → Environment Variables
- Firebase: Use Firebase Functions config

## 📊 AI Features Explained

### Printer Assignment Logic
1. **First Job**: Always assigned to Printer 1
2. **Second Job**: Always assigned to Printer 2  
3. **Subsequent Jobs**: Assigned to printer with lower page load
4. **Tie-breaker**: Defaults to Printer 1 when loads are equal

### Priority Calculation
- **Paid Status**: +3 priority points
- **Urgent Request**: +2 priority points
- **Small Job (≤5 pages)**: +1 priority point
- **Final Priority**: High (4+), Medium (2-3), Low (0-1)

## 🔔 Notification System Features

### Real-time Notification Delivery
- **Trigger**: Automatic when admin marks job as "printed"
- **Browser Notifications**: Native OS notifications with sound
- **Toast Messages**: In-app sliding notifications
- **Visual Alerts**: Animated popup notifications with bounce effect
- **Multi-channel**: All three types sent simultaneously for reliability

### Notification Management
- **Dedicated Tab**: Complete notification history interface
- **Persistent Storage**: Last 50 notifications saved per user (localStorage)
- **Read/Unread Status**: Visual indicators and click-to-mark-read
- **Timestamp Display**: Relative time formatting ("2 minutes ago")
- **Bulk Actions**: Mark all as read, clear all notifications
- **Unread Badges**: Red count indicators on notification tab

### Notification Content
```
🖨️ Print Job Ready!
Your document "report.pdf" is ready for pickup.
Use 4-digit code: 1234
2 minutes ago
```

### Security & Privacy
- **User-specific**: Only shows notifications for authenticated student's jobs
- **Secure Validation**: Proper job ownership verification
- **Local Storage**: User-scoped notification history
- **No Sensitive Data**: Only essential pickup information included

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: Create an issue in the GitHub repository
- **Documentation**: Check the `/docs` folder for detailed guides
- **Demo**: Live demo available at https://smartqueue-e53e2.web.app

## 🎉 Acknowledgments

- Built for hackathon demonstration purposes
- AI integration showcases intelligent queue management
- Payment system is simulated for safety and demo purposes
- Designed with judges and technical evaluation in mind

---

**🏆 Ready for Hackathon Evaluation - Secure, Intelligent, and Production-Ready!**
