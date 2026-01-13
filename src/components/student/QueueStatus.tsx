import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Clock, Users, CheckCircle, Printer, Package, Eye, ExternalLink, MessageSquare, AlertTriangle, RefreshCw, CreditCard, IndianRupee, Bot, Zap, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PrintJob, TIME_SLOTS } from '@/types/printJob';
import { usePrintQueue } from '@/hooks/usePrintQueue';
import AIStatus from '../AIStatus';

interface QueueStatusProps {
  jobs: PrintJob[];
  isLoading?: boolean;
  onRefresh?: () => void;
  onPaymentClick?: (job: PrintJob) => void;
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

const QueueStatus: React.FC<QueueStatusProps> = ({ jobs, isLoading = false, onRefresh, onPaymentClick }) => {
  const activeJobs = jobs.filter(j => j.status !== 'collected');
  const { clearStudentAction } = usePrintQueue();
  
  // Check if there are any unpaid jobs
  const hasUnpaidJobs = activeJobs.some(job => !job.isPaid && job.status === 'waiting');

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

  if (isLoading) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto mb-4" />
          <h3 className="font-medium text-foreground mb-1">Loading Queue Status...</h3>
          <p className="text-sm text-muted-foreground">
            Fetching your print jobs
          </p>
        </CardContent>
      </Card>
    );
  }

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
      {/* Priority Queue Information Banner */}
      {hasUnpaidJobs && (
        <Alert className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-sm">
          <CreditCard className="h-5 w-5 text-blue-600" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold text-blue-700 mb-1">
                  🚀 Priority Queue Available
                </p>
                <p className="text-sm text-blue-600">
                  Complete payment to join the priority queue for faster processing
                </p>
              </div>
              <div className="ml-4 text-right">
                <div className="bg-blue-100 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-blue-700">Priority Benefits:</p>
                  <p className="text-xs text-blue-600">• Faster processing</p>
                  <p className="text-xs text-blue-600">• Higher queue position</p>
                  <p className="text-xs text-blue-600">• Reduced wait time</p>
                </div>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Users className="h-5 w-5" />
          Your Print Jobs
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh || (() => window.location.reload())}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* AI Status Component */}
      <AIStatus />

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
                  {/* AI Assignment Info */}
                  {job.assignedPrinter && (
                    <div className="flex items-center gap-2 mt-1">
                      <Bot className="h-3 w-3 text-primary" />
                      <span className="text-xs text-primary font-medium">
                        {job.assignedPrinter === 'printer1' ? 'Printer 1' : 'Printer 2'}
                      </span>
                      {job.aiPriorityLevel && (
                        <Badge 
                          variant={job.aiPriorityLevel === 'High' ? 'default' : job.aiPriorityLevel === 'Medium' ? 'secondary' : 'outline'}
                          className="text-xs"
                        >
                          <Target className="h-2 w-2 mr-1" />
                          {job.aiPriorityLevel} Priority
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {/* Payment Status - Friendly */}
                  {job.isPaid ? (
                    <Badge variant="default" className="bg-green-100 text-green-700 border border-green-300 font-medium">
                      <IndianRupee className="h-3 w-3 mr-1" />
                      Priority Queue
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-blue-300 text-blue-600 bg-blue-50 font-medium">
                      <CreditCard className="h-3 w-3 mr-1" />
                      Standard Queue
                    </Badge>
                  )}
                  
                  <Badge variant="outline" className={status.color}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {status.label}
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              {/* Simple AI Assignment */}
              {job.assignedPrinter && (
                <div className="mb-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Bot className="h-4 w-4 text-primary" />
                    <p className="text-sm font-medium text-primary">
                      Your job is assigned to {job.assignedPrinter === 'printer1' ? 'Printer 1' : 'Printer 2'}
                    </p>
                  </div>
                </div>
              )}

              {/* Payment Section - Friendly & Professional */}
              {!job.isPaid && job.status === 'waiting' && (
                <Alert className="mb-4 border-2 border-blue-300 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-md">
                  <CreditCard className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-base font-semibold text-blue-700 mb-1">
                        💳 Payment Required
                      </p>
                      <p className="text-sm text-blue-600 mb-1">
                        Complete payment to join the priority queue
                      </p>
                      <p className="text-xs text-blue-500">
                        Paid jobs receive faster processing
                      </p>
                    </div>
                    {onPaymentClick && (
                      <Button
                        size="sm"
                        onClick={() => onPaymentClick(job)}
                        className="ml-3 bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2 shadow-sm"
                      >
                        <IndianRupee className="h-4 w-4 mr-1" />
                        Pay Now
                      </Button>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              {/* Payment Success Info */}
              {job.isPaid && (
                <div className="mb-4 p-3 bg-success/10 border border-success/30 rounded-lg">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-success mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-success">Payment Completed ✅</p>
                      <div className="text-xs text-success/80 mt-1 space-y-1">
                        <p>Amount: ₹{job.paymentAmount}</p>
                        <p>Payment ID: {job.paymentId}</p>
                        {job.paymentTimestamp && (
                          <p>Paid: {new Date(job.paymentTimestamp).toLocaleString()}</p>
                        )}
                      </div>
                      <Badge variant="outline" className="mt-2 text-success border-success/50">
                        🚀 Priority Queue
                      </Badge>
                    </div>
                  </div>
                </div>
              )}

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
                          <span className="text-muted-foreground">AI Estimated Wait Time</span>
                          <span className="font-medium flex items-center gap-1">
                            <Bot className="h-3 w-3 text-primary" />
                            {job.aiEstimatedWait || job.estimatedWait} min
                          </span>
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
