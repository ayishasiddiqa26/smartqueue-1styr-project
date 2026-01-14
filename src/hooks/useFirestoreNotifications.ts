// Real-time Firestore notifications hook
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  doc, 
  updateDoc,
  addDoc,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/firebase';

export interface FirestoreNotification {
  id: string;
  userId: string;
  jobId: string;
  message: string;
  status: 'printed' | 'ready' | 'completed';
  timestamp: Date;
  read: boolean;
  jobFileName?: string;
  qrCode?: string;
}

export const useFirestoreNotifications = () => {
  const { userId, role } = useAuth();
  const [notifications, setNotifications] = useState<FirestoreNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Real-time listener for student notifications
  useEffect(() => {
    if (!userId || role !== 'student') {
      setLoading(false);
      return;
    }

    console.log('🔔 Setting up notifications listener for student:', userId);
    setLoading(true);
    setError(null);

    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        try {
          const notificationsList: FirestoreNotification[] = [];
          
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            // Skip deleted notifications
            if (data.deleted === true) return;
            
            notificationsList.push({
              id: doc.id,
              userId: data.userId,
              jobId: data.jobId,
              message: data.message,
              status: data.status,
              timestamp: data.timestamp instanceof Timestamp ? data.timestamp.toDate() : new Date(data.timestamp),
              read: data.read || false,
              jobFileName: data.jobFileName,
              qrCode: data.qrCode
            });
          });

          console.log(`📬 Received ${notificationsList.length} notifications`);
          setNotifications(notificationsList);
          setLoading(false);
        } catch (error) {
          console.error('❌ Error processing notifications:', error);
          setError('Failed to load notifications');
          setLoading(false);
        }
      },
      (error) => {
        console.error('❌ Notifications listener error:', error);
        setError('Failed to connect to notification service');
        setLoading(false);
      }
    );

    return () => {
      console.log('🔌 Cleaning up notifications listener');
      unsubscribe();
    };
  }, [userId, role]);

  // Mark notification as read
  const markAsRead = async (notificationId: string): Promise<boolean> => {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        read: true
      });
      console.log('✅ Notification marked as read:', notificationId);
      return true;
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
      return false;
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async (): Promise<boolean> => {
    try {
      const unreadNotifications = notifications.filter(n => !n.read);
      const promises = unreadNotifications.map(notification =>
        updateDoc(doc(db, 'notifications', notification.id), { read: true })
      );
      
      await Promise.all(promises);
      console.log(`✅ Marked ${unreadNotifications.length} notifications as read`);
      return true;
    } catch (error) {
      console.error('❌ Error marking all notifications as read:', error);
      return false;
    }
  };

  // Clear all notifications (mark as deleted)
  const clearNotifications = async (): Promise<boolean> => {
    try {
      const promises = notifications.map(notification =>
        updateDoc(doc(db, 'notifications', notification.id), { deleted: true })
      );
      
      await Promise.all(promises);
      console.log(`✅ Cleared ${notifications.length} notifications`);
      setNotifications([]); // Clear local state immediately
      return true;
    } catch (error) {
      console.error('❌ Error clearing notifications:', error);
      return false;
    }
  };

  // Create notification (admin only)
  const createNotification = async (
    targetUserId: string,
    jobId: string,
    message: string,
    status: 'printed' | 'ready' | 'completed',
    jobFileName?: string,
    qrCode?: string
  ): Promise<boolean> => {
    if (role !== 'admin') {
      console.error('❌ Only admins can create notifications');
      return false;
    }

    try {
      await addDoc(collection(db, 'notifications'), {
        userId: targetUserId,
        jobId,
        message,
        status,
        timestamp: serverTimestamp(),
        read: false,
        deleted: false,
        jobFileName,
        qrCode
      });
      
      console.log('✅ Notification created for user:', targetUserId);
      return true;
    } catch (error) {
      console.error('❌ Error creating notification:', error);
      return false;
    }
  };

  // Get unread count
  const getUnreadCount = (): number => {
    return notifications.filter(n => !n.read).length;
  };

  return {
    notifications,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    createNotification,
    unreadCount: getUnreadCount()
  };
};