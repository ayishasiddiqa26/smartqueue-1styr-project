import React from 'react';
import { Clock, CheckCircle, Printer, Package, User, Copy, Zap, QrCode, Palette, Eye, Download, FileText, MessageSquare, IndianRupee, CreditCard, Bot, Target } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PrintJob, TIME_SLOTS, PrintJobStatus } from '@/types/printJob';
import { formatDistanceToNow } from 'date-fns';
import AdminCommentDialog from './AdminCommentDialog';

interface JobCardProps {
  job: PrintJob;
  onUpdateStatus: (jobId: string, status: PrintJobStatus) => void;
}

const statusConfig = {
  waiting: {
    icon: Clock,
    label: 'Waiting',
    color: 'bg-warning/10 text-warning border-warning/30',
    nextAction: 'Start Printing',
    nextStatus: 'printing' as PrintJobStatus,
  },
  printing: {
    icon: Printer,
    label: 'Printing',
    color: 'bg-primary/10 text-primary border-primary/30 animate-pulse-subtle',
    nextAction: 'Mark as Printed',
    nextStatus: 'printed' as PrintJobStatus,
  },
  printed: {
    icon: Package,
    label: 'Ready',
    color: 'bg-success/10 text-success border-success/30',
    nextAction: 'Confirm Pickup',
    nextStatus: 'collected' as PrintJobStatus,
  },
  collected: {
    icon: CheckCircle,
    label: 'Collected',
    color: 'bg-muted text-muted-foreground border-muted',
    nextAction: null,
    nextStatus: null,
  },
};

const JobCard: React.FC<JobCardProps> = ({ job, onUpdateStatus }) => {
  const status = statusConfig[job.status];
  const StatusIcon = status.icon;
  const timeSlot = TIME_SLOTS.find(t => t.id === job.timeSlot);

  // Debug logging for student comments
  console.log('JobCard received job:', {
    id: job.id,
    studentId: job.studentId,
    studentEmail: job.studentEmail,
    fileName: job.fileName,
    studentComment: job.studentComment ? `"${job.studentComment}"` : 'NO COMMENT'
  });

  // File handling functions (commented out - no file storage)
  /*
  const handleViewFile = () => {
    if (job.fileUrl) {
      window.open(job.fileUrl, '_blank');
    } else {
      alert('File viewing will be available once Firebase Storage is configured.');
    }
  };

  const handleDownloadFile = () => {
    if (job.fileUrl) {
      const link = document.createElement('a');
      link.href = job.fileUrl;
      link.download = job.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert('File download will be available once Firebase Storage is configured.');
    }
  };

  const handlePrintFile = () => {
    if (job.fileUrl) {
      const printWindow = window.open(job.fileUrl, '_blank');
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      }
    } else {
      alert('File printing will be available once Firebase Storage is configured.');
    }
  };
  */

  return (
    <Card className={`transition-all ${job.priority === 'urgent' && job.status !== 'collected' ? 'ring-2 ring-accent/50' : ''} ${job.requiresStudentAction ? 'ring-2 ring-orange-300' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="bg-secondary p-2 rounded-lg">
              <User className="h-5 w-5 text-secondary-foreground" />
            </div>
            <div>
              <p className="font-semibold">{job.studentEmail || job.studentId}</p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(job.createdAt, { addSuffix: true })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {job.requiresStudentAction && (
              <Badge className="bg-orange-100 text-orange-800 border-orange-300">
                Action Required
              </Badge>
            )}
            {job.isPaid && (
              <Badge className="bg-success/10 text-success border-success/30">
                <IndianRupee className="h-3 w-3 mr-1" />
                Paid
              </Badge>
            )}
            {job.aiPriorityLevel && (
              <Badge 
                variant={job.aiPriorityLevel === 'High' ? 'default' : job.aiPriorityLevel === 'Medium' ? 'secondary' : 'outline'}
                className="bg-primary/10 text-primary border-primary/30"
              >
                <Target className="h-3 w-3 mr-1" />
                {job.aiPriorityLevel} AI Priority
              </Badge>
            )}
            {job.priority === 'urgent' && (
              <Badge className="bg-accent text-accent-foreground">
                <Zap className="h-3 w-3 mr-1" />
                Urgent
              </Badge>
            )}
            <Badge variant="outline" className={status.color}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {status.label}
            </Badge>
          </div>
        </div>

        {/* Student Comment */}
        {job.studentComment && job.studentComment.trim() !== '' && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <MessageSquare className="h-4 w-4 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-800">Student Instructions:</p>
                <p className="text-sm text-blue-700 mt-1">{job.studentComment}</p>
              </div>
            </div>
          </div>
        )}

        {/* Admin Comments */}
        {job.adminComments && job.adminComments.length > 0 && (
          <div className="mb-4 space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Previous Comments:</p>
            {job.adminComments.slice(-2).map((comment) => (
              <div
                key={comment.id}
                className={`p-2 rounded-lg border text-sm ${
                  comment.requiresAction
                    ? 'bg-orange-50 border-orange-200 text-orange-800'
                    : 'bg-gray-50 border-gray-200 text-gray-700'
                }`}
              >
                <p>{comment.message}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(comment.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
            {job.adminComments.length > 2 && (
              <p className="text-xs text-muted-foreground">
                +{job.adminComments.length - 2} more comments
              </p>
            )}
          </div>
        )}

        <div className="bg-secondary/50 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <p className="font-medium truncate text-base flex-1 mr-4">{job.fileName}</p>
            {/* Commented out until Firebase Storage is enabled
            {job.fileUrl && (
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleViewFile}
                  className="flex items-center gap-1"
                >
                  <Eye className="h-3 w-3" />
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrintFile}
                  className="flex items-center gap-1"
                >
                  <Printer className="h-3 w-3" />
                  Print
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadFile}
                  className="flex items-center gap-1"
                >
                  <Download className="h-3 w-3" />
                  Download
                </Button>
              </div>
            )}
            */}
          </div>
          
          {/* Enhanced Job Details */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* AI Printer Assignment */}
            {job.assignedPrinter && (
              <div className="flex items-center gap-2 bg-primary/10 border-primary/30 rounded-lg p-3 border">
                <div className="bg-primary/20 p-2 rounded-full">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">AI Assignment</p>
                  <p className="font-bold text-sm text-primary">
                    {job.assignedPrinter === 'printer1' ? 'Printer 1' : 'Printer 2'}
                  </p>
                  {job.aiEstimatedWait && (
                    <p className="text-xs text-muted-foreground">
                      ~{job.aiEstimatedWait} min wait
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Payment Status */}
            <div className={`flex items-center gap-2 rounded-lg p-3 border ${
              job.isPaid 
                ? 'bg-success/10 border-success/30' 
                : 'bg-warning/10 border-warning/30'
            }`}>
              <div className={`p-2 rounded-full ${
                job.isPaid ? 'bg-success/20' : 'bg-warning/20'
              }`}>
                {job.isPaid ? (
                  <IndianRupee className="h-4 w-4 text-success" />
                ) : (
                  <CreditCard className="h-4 w-4 text-warning" />
                )}
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Payment</p>
                <p className={`font-bold text-sm ${
                  job.isPaid ? 'text-success' : 'text-warning'
                }`}>
                  {job.isPaid ? `₹${job.paymentAmount}` : 'Unpaid'}
                </p>
                {job.isPaid && (
                  <p className="text-xs text-muted-foreground">
                    ID: {job.paymentId?.slice(-6)}
                  </p>
                )}
              </div>
            </div>

            {/* Copies */}
            <div className="flex items-center gap-2 bg-white/50 rounded-lg p-3 border">
              <div className="bg-blue-100 p-2 rounded-full">
                <Copy className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Copies</p>
                <p className="font-bold text-sm">
                  {job.copies} {job.copies === 1 ? 'copy' : 'copies'}
                </p>
              </div>
            </div>

            {/* Page Count */}
            {job.pageCount && (
              <div className="flex items-center gap-2 bg-white/50 rounded-lg p-3 border">
                <div className="bg-orange-100 p-2 rounded-full">
                  <FileText className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Pages</p>
                  <p className="font-bold text-sm">
                    {job.pageCount} {job.pageCount === 1 ? 'page' : 'pages'}
                  </p>
                </div>
              </div>
            )}

            {/* Time Slot */}
            <div className="flex items-center gap-2 bg-white/50 rounded-lg p-3 border">
              <div className="bg-green-100 p-2 rounded-full">
                <Clock className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Pickup Slot</p>
                <p className="font-bold text-sm">
                  Slot - {timeSlot?.label || 'Unknown'}
                </p>
              </div>
            </div>

            {/* Color */}
            <div className="flex items-center gap-2 bg-white/50 rounded-lg p-3 border">
              <div className={`p-2 rounded-full ${
                job.color === 'color' ? 'bg-purple-100' : 'bg-gray-100'
              }`}>
                <Palette className={`h-4 w-4 ${
                  job.color === 'color' ? 'text-purple-600' : 'text-gray-600'
                }`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Print Type</p>
                <p className={`font-bold text-sm ${
                  job.color === 'color' ? 'text-purple-600' : 'text-gray-600'
                }`}>
                  {job.color === 'color' ? 'Color Print' : 'Black & White'}
                </p>
              </div>
            </div>
          </div>

          {/* AI Reasoning Section */}
          {job.aiReasoning && (
            <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
              <div className="flex items-start gap-2">
                <Bot className="h-4 w-4 text-primary mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-primary">AI Assignment Reasoning</p>
                  <p className="text-sm text-primary/80 mt-1">{job.aiReasoning}</p>
                  {job.aiConfidence && (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-muted-foreground">Confidence:</span>
                      <Badge variant="outline" className="text-xs">
                        {job.aiConfidence}%
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <code className="bg-muted px-3 py-1 rounded font-mono text-sm font-bold">
              {job.qrCode}
            </code>
            
            {/* Show QR Code for printed jobs */}
            {job.status === 'printed' && (
              <div className="bg-white p-2 rounded-lg shadow-sm border">
                <QRCodeSVG value={job.qrCode} size={60} />
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <AdminCommentDialog 
              jobId={job.id} 
              studentEmail={job.studentEmail || job.studentId} 
            />
            {status.nextAction && status.nextStatus && (
              <>
                {job.status === 'printed' ? (
                  // For printed jobs, require QR verification instead of direct pickup
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Use QR Verifier above</p>
                      <p className="text-xs text-primary font-medium">↑ Scan QR or Enter Code</p>
                    </div>
                    <Button
                      size="sm"
                      disabled
                      variant="outline"
                      className="opacity-50 cursor-not-allowed"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Requires Verification
                    </Button>
                  </div>
                ) : (
                  // For other statuses, allow direct action
                  <Button
                    size="sm"
                    onClick={() => onUpdateStatus(job.id, status.nextStatus!)}
                    variant="secondary"
                  >
                    {status.nextAction}
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Additional info for printed jobs */}
        {job.status === 'printed' && (
          <div className="mt-3 p-3 bg-blue/5 border border-blue/20 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-blue-600 text-sm font-medium">
                <Package className="h-4 w-4" />
                Ready for Student Pickup
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <QrCode className="h-3 w-3" />
                Code: <strong>{job.qrCode}</strong>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default JobCard;
