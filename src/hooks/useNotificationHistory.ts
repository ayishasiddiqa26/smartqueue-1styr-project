// Hook for managing notification history
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export interface NotificationHistoryItem {
  id: string;
  jobId: string;
  fileName: string;
  qrCode: string;
  timestamp: Date;
  read: boolean;
  type: 'job_ready' | 'job_completed' | 'payment_confirmed';
  message: string;
}

export const useNotificationHistory = () => {
  const { userId } = useAuth();
  const [notifications, setNotifications] = useState<NotificationHistoryItem[]>([]);

  // Load notifications from localStorage on mount
  useEffect(() => {
    if (userId) {
      const stored = localStorage.getItem(`notifications_${userId}`);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          // Convert timestamp strings back to Date objects
          const withDates = parsed.map((notif: any) => ({
            ...notif,
            timestamp: new Date(notif.timestamp)
          }));
          setNotifications(withDates);
        } catch (error) {
          console.error('Error loading notification history:', error);
          setNotifications([]);
        }
      }
    }
  }, [userId]);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    if (userId && notifications.length > 0) {
      localStorage.setItem(`notifications_${userId}`, JSON.stringify(notifications));
    }
  }, [notifications, userId]);

  const addNotification = (notification: Omit<NotificationHistoryItem, 'id' | 'read'>) => {
    const newNotification: NotificationHistoryItem = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      read: false
    };

    setNotifications(prev => [newNotification, ...prev].slice(0, 50)); // Keep only last 50 notifications
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
    if (userId) {
      localStorage.removeItem(`notifications_${userId}`);
    }
  };

  const getUnreadCount = () => {
    return notifications.filter(notif => !notif.read).length;
  };

  return {
    notifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    unreadCount: getUnreadCount()
  };
};