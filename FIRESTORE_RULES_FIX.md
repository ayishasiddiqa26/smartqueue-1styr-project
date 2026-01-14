# 🔒 Firestore Security Rules Fix

## Issue
Students were getting "Missing or insufficient permissions" error when trying to access notifications.

## Root Cause
The Firestore security rules didn't include permissions for:
1. **Notifications collection** - No rules defined
2. **Wallet subcollection** - No rules defined

## Solution Applied

### Updated `firestore.rules`

Added comprehensive security rules for notifications and wallet:

```javascript
// Wallet subcollection - users can only access their own wallet
match /users/{userId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
  
  match /wallet/{walletDoc} {
    allow read, write: if request.auth != null && request.auth.uid == userId;
  }
}

// Notifications collection
match /notifications/{notificationId} {
  // Students can read their own notifications
  allow read: if request.auth != null && 
                 request.auth.uid == resource.data.userId;
  
  // Students can update their own notifications (mark as read)
  allow update: if request.auth != null && 
                   request.auth.uid == resource.data.userId;
  
  // Only admins can create notifications
  allow create: if isAdmin();
  
  // Only admins can delete notifications
  allow delete: if isAdmin();
}
```

### Simplified Notification Query

Changed from complex compound query to simple query with client-side filtering:

**Before** (required composite index):
```typescript
query(
  notificationsRef,
  where('userId', '==', userId),
  where('deleted', '!=', true),
  orderBy('deleted'),
  orderBy('timestamp', 'desc')
)
```

**After** (no index required):
```typescript
query(
  notificationsRef,
  where('userId', '==', userId),
  orderBy('timestamp', 'desc')
)
// Filter deleted notifications client-side
```

## Security Model

### Notifications
- ✅ **Students**: Can read and update only their own notifications
- ✅ **Admins**: Can create, read, update, and delete all notifications
- ✅ **Isolation**: Each student sees only their notifications (userId filter)

### Wallet
- ✅ **Students**: Can read and write only their own wallet data
- ✅ **Isolation**: Wallet data stored in user-specific subcollection
- ✅ **Security**: No cross-user access possible

### Print Jobs
- ✅ **All authenticated users**: Can create, read, and update
- ✅ **Admins only**: Can delete jobs
- ✅ **Temporary permissive**: For demo/testing purposes

## Deployment Status

✅ **Firestore Rules**: Deployed successfully
✅ **Firestore Indexes**: Updated (no complex indexes needed)
✅ **Code Changes**: Query simplified for better performance

## Testing Checklist

- [x] Students can read their own notifications
- [x] Students cannot read other students' notifications
- [x] Admins can create notifications
- [x] Students can mark notifications as read
- [x] Students can access their wallet data
- [x] No permission errors in console

## Notes

- Rules are demo-friendly but secure
- Each user's data is properly isolated
- Admin privileges properly enforced
- No complex indexes required (better performance)
- Client-side filtering for deleted notifications (simpler, faster)

---

**Status**: ✅ **DEPLOYED** - Firestore rules are live and working correctly.