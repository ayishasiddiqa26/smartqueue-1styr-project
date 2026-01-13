// Notification utilities for student alerts
import { toast } from '@/hooks/use-toast';

export interface NotificationData {
  jobId: string;
  studentName: string;
  fileName: string;
  qrCode: string;
  timestamp: Date;
}

// Request notification permission from browser
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission === 'denied') {
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
};

// Send browser notification
export const sendBrowserNotification = (data: NotificationData) => {
  if (Notification.permission === 'granted') {
    const notification = new Notification('🖨️ Print Job Ready!', {
      body: `Your document "${data.fileName}" is ready for pickup. Use code: ${data.qrCode}`,
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      tag: `print-job-${data.jobId}`,
      requireInteraction: true,
      actions: [
        {
          action: 'view',
          title: 'View Details'
        }
      ]
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    // Auto close after 10 seconds
    setTimeout(() => {
      notification.close();
    }, 10000);
  }
};

// Send toast notification
export const sendToastNotification = (data: NotificationData) => {
  toast({
    title: "🎉 Print Job Ready!",
    description: `Your document "${data.fileName}" is ready for pickup. Use 4-digit code: ${data.qrCode}`,
    duration: 8000,
  });
};

// Send visual alert notification
export const sendVisualAlert = (data: NotificationData) => {
  // Create a visual alert element
  const alertElement = document.createElement('div');
  alertElement.className = 'fixed top-4 right-4 z-50 bg-green-500 text-white p-4 rounded-lg shadow-lg max-w-sm animate-bounce';
  alertElement.innerHTML = `
    <div class="flex items-center gap-3">
      <div class="text-2xl">🖨️</div>
      <div>
        <div class="font-bold">Print Job Ready!</div>
        <div class="text-sm">${data.fileName}</div>
        <div class="text-xs mt-1">Code: ${data.qrCode}</div>
      </div>
      <button class="ml-2 text-white hover:text-gray-200" onclick="this.parentElement.parentElement.remove()">
        ✕
      </button>
    </div>
  `;

  document.body.appendChild(alertElement);

  // Auto remove after 8 seconds
  setTimeout(() => {
    if (alertElement.parentNode) {
      alertElement.remove();
    }
  }, 8000);
};

// Main notification function - sends all types
export const notifyStudentJobReady = async (data: NotificationData) => {
  console.log('📧 Sending notification to student:', data);

  // Send toast notification (always works)
  sendToastNotification(data);

  // Send browser notification if permission granted
  const hasPermission = await requestNotificationPermission();
  if (hasPermission) {
    sendBrowserNotification(data);
  }

  // Send visual alert as backup
  sendVisualAlert(data);

  // Log for demo purposes
  console.log(`✅ Student notified: ${data.studentName} - Job ${data.jobId} ready for pickup`);
};

// Initialize notification system
export const initializeNotifications = async () => {
  // Request permission on app load
  await requestNotificationPermission();
  
  console.log('🔔 Notification system initialized');
};