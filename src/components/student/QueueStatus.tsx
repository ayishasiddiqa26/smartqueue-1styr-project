import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Clock, Users, CheckCircle, Printer, Package, Eye, ExternalLink, MessageSquare, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PrintJob, TIME_SLOTS } from '@/types/printJob';
import { usePrintQueue } from '@/hooks/usePrintQueue';

interface QueueStatusProps {
  jobs: PrintJob[];
}

const statusConfig = {
  waiting: {
    icon: Clock,
    label: 'Waiting',
    color: 'bg-warning/10 text-warning border-warning/30',
  },
  printing: {
    icon: Printer,
    label: 'Printing',
    color: 'bg-primary/10 text-primary border-primary/30',
  },
  printed: {
    icon: Package,
    label: 'Ready for Pickup',
    color: 'bg-success/10 text-success border-success/30',
  },
  collected: {
    icon: CheckCircle,
    label: 'Collected',
    color: 'bg-muted text-muted-foreground border-muted',
  },
};

const QueueStatus: React.FC<QueueStatusProps> = ({ jobs }) => {
  const activeJobs = jobs.filter(j => j.status !== 'collected');
  const { clearStudentAction } = usePrintQueue();

  // File viewing function (commented out - no file storage)
  /*
  const handleViewFile = (fileUrl: string, fileName: string) => {
    if (fileUrl) {
      window.open(fileUrl, '_blank');
    }
  };
  */

  const handleAcknowledgeAction = async (jobId: string) => {
    try {
      await clearStudentAction(jobId);
    } catch (error) {
      console.error('Error acknowledging action:', error);
    }
  };

  if (activeJobs.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-8 text-center">
          <div className="bg-muted/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Printer className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-medium text-foreground mb-1">No Print Jobs</h3>
          <p className="text-sm text-muted-foreground">
            Submit a document to see your queue status here
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <Users className="h-5 w-5" />
        Your Print Jobs
      </h2>

      {activeJobs.map((job) => {
        const status = statusConfig[job.status];
        const StatusIcon = status.icon;
        const timeSlot = TIME_SLOTS.find(t => t.id === job.timeSlot);

        return (
          <Card key={job.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base truncate max-w-[200px]">
                    {job.fileName}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {job.copies} {job.copies === 1 ? 'copy' : 'copies'} • 
                    {job.pageCount && ` ${job.pageCount} ${job.pageCount === 1 ? 'page' : 'pages'} • `}
                    {timeSlot?.label} • 
                    <span className={`ml-1 px-1.5 py-0.5 rounded text-xs font-medium ${
                      job.color === 'color' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {job.color === 'color' ? 'Color' : 'B&W'}
                    </span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {/* Commented out until Firebase Storage is enabled
                  {job.fileUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewFile(job.fileUrl!, job.fileName)}
                      className="flex items-center gap-1"
                    >
                      <Eye className="h-3 w-3" />
                      View
                    </Button>
                  )}
                  */}
                  <Badge variant="outline" className={status.color}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {status.label}
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              {/* Action Required Alert */}
              {job.requiresStudentAction && (
                <Alert className="mb-4 border-orange-200 bg-orange-50">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="flex items-center justify-between">
                    <span className="text-orange-800">Admin requires your attention - check comments below</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAcknowledgeAction(job.id)}
                      className="ml-2"
                    >
                      Acknowledge
                    </Button>
                  </AlertDescription>
                </Alert>
              )}

              {/* Student Comment */}
              {job.studentComment && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <MessageSquare className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">Your Instructions:</p>
                      <p className="text-sm text-blue-700 mt-1">{job.studentComment}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Admin Comments */}
              {job.adminComments && job.adminComments.length > 0 && (
                <div className="mb-4 space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Admin Comments:</p>
                  {job.adminComments.map((comment) => (
                    <div
                      key={comment.id}
                      className={`p-3 rounded-lg border ${
                        comment.requiresAction
                          ? 'bg-orange-50 border-orange-200'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <MessageSquare className={`h-4 w-4 mt-0.5 ${
                          comment.requiresAction ? 'text-orange-600' : 'text-gray-600'
                        }`} />
                        <div className="flex-1">
                          <p className={`text-sm ${
                            comment.requiresAction ? 'text-orange-800' : 'text-gray-700'
                          }`}>
                            {comment.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(comment.createdAt).toLocaleString()}
                          </p>
                          {comment.requiresAction && (
                            <Badge variant="outline" className="mt-1 text-orange-600 border-orange-300">
                              Action Required
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {job.status === 'printed' ? (
                // Special layout for ready jobs - prominent QR display
                <div className="space-y-4">
                  <div className="text-center py-4 bg-success/5 border border-success/20 rounded-lg">
                    <div className="bg-white p-3 rounded-lg shadow-sm mx-auto w-fit mb-3">
                      <QRCodeSVG value={job.qrCode} size={120} />
                    </div>
                    <p className="font-medium text-success text-lg mb-1">Ready for Pickup!</p>
                    <p className="text-sm text-muted-foreground mb-2">Show this QR code to admin</p>
                    <div className="bg-success/10 border border-success/30 rounded-lg p-2 mx-4">
                      <p className="text-xs font-medium text-success">📱 Keep this screen ready</p>
                      <p className="text-xs text-muted-foreground">Admin will scan this QR code</p>
                      <div className="mt-2 text-center">
                        <code className="bg-white px-3 py-1 rounded font-mono text-lg font-bold text-foreground border">
                          {job.qrCode}
                        </code>
                        <p className="text-xs text-muted-foreground mt-1">4-digit pickup code</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm pt-2 border-t">
                    <span className="text-muted-foreground">4-Digit Code</span>
                    <code className="bg-muted px-3 py-1 rounded font-mono font-bold text-lg">
                      {job.qrCode}
                    </code>
                  </div>
                </div>
              ) : (
                // Regular layout for other statuses
                <div className="flex items-center gap-6">
                  {/* QR Code */}
                  <div className="bg-white p-2 rounded-lg shadow-sm">
                    <QRCodeSVG value={job.qrCode} size={80} />
                  </div>

                  {/* Status Info */}
                  <div className="flex-1 space-y-2">
                    {(job.status === 'waiting' || job.status === 'printing') && (
                      <>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Queue Position</span>
                          <span className="font-bold text-lg">#{job.queuePosition}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Est. Wait</span>
                          <span className="font-medium">{job.estimatedWait} min</span>
                        </div>
                      </>
                    )}

                    <div className="flex items-center justify-between text-sm pt-2 border-t">
                      <span className="text-muted-foreground">4-Digit Code</span>
                      <code className="bg-muted px-3 py-1 rounded font-mono font-bold text-lg">
                        {job.qrCode}
                      </code>
                    </div>
                  </div>
                </div>
              )}

              {job.priority === 'urgent' && (
                <Badge className="mt-3 bg-accent text-accent-foreground">
                  ⚡ Urgent Priority
                </Badge>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default QueueStatus;
