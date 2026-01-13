import React from 'react';
import { Bell, BellOff, Clock, FileText, Trash2, CheckCheck, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useFirestoreNotifications, FirestoreNotification } from '@/hooks/useFirestoreNotifications';
import { formatDistanceToNow } from 'date-fns';

const NotificationTab: React.FC = () => {
  const { notifications, markAsRead, markAllAsRead, clearNotifications, unreadCount, loading } = useFirestoreNotifications();

  const getNotificationIcon = (status: string) => {
    switch (status) {
      case 'printed':
      case 'ready':
        return <Package className="h-4 w-4 text-green-600" />;
      case 'completed':
        return <CheckCheck className="h-4 w-4 text-blue-600" />;
      default:
        return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  const getNotificationColor = (status: string, read: boolean) => {
    if (read) return 'border-gray-200 bg-gray-50';
    
    switch (status) {
      case 'printed':
      case 'ready':
        return 'border-green-200 bg-green-50';
      case 'completed':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-white';
    }
  };

  const handleNotificationClick = (notification: FirestoreNotification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
              <Badge variant="secondary" className="ml-auto">
                Loading...
              </Badge>
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mb-4" />
            <p className="text-sm text-muted-foreground">Loading notifications...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="space-y-4">
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
              <Badge variant="secondary" className="ml-auto">
                0 notifications
              </Badge>
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Empty State */}
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BellOff className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              No notifications yet
            </h3>
            <p className="text-sm text-muted-foreground text-center max-w-sm">
              You'll receive notifications here when your print jobs are ready for pickup or when important updates occur.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
            <Badge variant={unreadCount > 0 ? 'default' : 'secondary'} className="ml-auto">
              {unreadCount > 0 ? `${unreadCount} unread` : `${notifications.length} total`}
            </Badge>
          </CardTitle>
          {notifications.length > 0 && (
            <div className="flex gap-2 pt-2">
              {unreadCount > 0 && (
                <Button onClick={markAllAsRead} variant="outline" size="sm">
                  <CheckCheck className="h-3 w-3 mr-2" />
                  Mark All Read
                </Button>
              )}
              <Button onClick={clearNotifications} variant="outline" size="sm">
                <Trash2 className="h-3 w-3 mr-2" />
                Clear All
              </Button>
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Notifications List */}
      <ScrollArea className="h-[600px]">
        <div className="space-y-3">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`cursor-pointer transition-all hover:shadow-md ${getNotificationColor(notification.status, notification.read)}`}
              onClick={() => handleNotificationClick(notification)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.status)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className={`text-sm ${notification.read ? 'text-muted-foreground' : 'text-foreground font-medium'}`}>
                          {notification.message}
                        </p>
                        
                        {/* Job Details */}
                        <div className="mt-2 space-y-1">
                          {notification.jobFileName && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <FileText className="h-3 w-3" />
                              <span>{notification.jobFileName}</span>
                            </div>
                          )}
                          {notification.qrCode && (
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-muted-foreground">Pickup Code:</span>
                              <code className="bg-muted px-2 py-1 rounded font-mono font-bold">
                                {notification.qrCode}
                              </code>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Timestamp and Read Status */}
                      <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{formatDistanceToNow(notification.timestamp, { addSuffix: true })}</span>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default NotificationTab;