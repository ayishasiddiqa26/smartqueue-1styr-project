import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { requestNotificationPermission } from '@/lib/notificationUtils';

const NotificationStatus: React.FC = () => {
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if notifications are supported
    setIsSupported('Notification' in window);
    
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      setNotificationPermission('granted');
    }
  };

  if (!isSupported) {
    return (
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <BellOff className="h-4 w-4 text-orange-600" />
            <span className="text-sm text-orange-700">
              Browser notifications not supported
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-2 ${
      notificationPermission === 'granted' 
        ? 'border-green-200 bg-green-50' 
        : 'border-blue-200 bg-blue-50'
    }`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Bell className={`h-4 w-4 ${
            notificationPermission === 'granted' ? 'text-green-600' : 'text-blue-600'
          }`} />
          Print Job Notifications
          <Badge variant={notificationPermission === 'granted' ? 'default' : 'secondary'} className="text-xs">
            {notificationPermission === 'granted' ? 'Enabled' : 'Disabled'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {notificationPermission === 'granted' ? (
          <div className="space-y-2">
            <p className="text-sm text-green-700">
              ✅ You'll be notified when your print jobs are ready for pickup
            </p>
            <div className="text-xs text-green-600 space-y-1">
              <div>• Browser notifications</div>
              <div>• Visual alerts</div>
              <div>• Toast messages</div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-blue-700">
              Get instant notifications when your print jobs are ready!
            </p>
            <Button 
              onClick={handleEnableNotifications}
              size="sm"
              className="w-full"
              variant={notificationPermission === 'denied' ? 'outline' : 'default'}
            >
              <Settings className="h-3 w-3 mr-2" />
              {notificationPermission === 'denied' 
                ? 'Enable in Browser Settings' 
                : 'Enable Notifications'
              }
            </Button>
            {notificationPermission === 'denied' && (
              <p className="text-xs text-orange-600">
                Please enable notifications in your browser settings and refresh the page
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationStatus;