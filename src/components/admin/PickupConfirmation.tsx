import React from 'react';
import { CheckCircle, User, FileText, Copy, Clock, Package, X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PrintJob, TIME_SLOTS } from '@/types/printJob';
import { formatDistanceToNow } from 'date-fns';

interface PickupConfirmationProps {
  job: PrintJob;
  onConfirm: () => void;
  onCancel: () => void;
}

const PickupConfirmation: React.FC<PickupConfirmationProps> = ({ job, onConfirm, onCancel }) => {
  const timeSlot = TIME_SLOTS.find(t => t.id === job.timeSlot);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2 text-success">
              <CheckCircle className="h-5 w-5" />
              Confirm Pickup
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Success Message */}
          <div className="text-center p-4 bg-success/10 border border-success/20 rounded-lg">
            <CheckCircle className="h-12 w-12 text-success mx-auto mb-2" />
            <p className="font-medium text-success">QR Code Verified Successfully!</p>
            <p className="text-sm text-muted-foreground mt-1">
              This print job is ready for pickup
            </p>
          </div>

          {/* Job Details */}
          <div className="border rounded-lg p-4 bg-secondary/20">
            <div className="flex items-start gap-4 mb-4">
              <div className="bg-white p-2 rounded-lg shadow-sm">
                <QRCodeSVG value={job.qrCode} size={80} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4" />
                  <span className="font-medium">{job.studentEmail || job.studentId}</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm truncate">{job.fileName}</span>
                </div>
                <div className="grid grid-cols-1 gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <span>Copies:</span>
                    <span className="font-medium text-foreground">{job.copies} {job.copies === 1 ? 'copy' : 'copies'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Pickup Slot:</span>
                    <span className="font-medium text-foreground">Slot - {timeSlot?.label}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Print Type:</span>
                    <span className={`font-medium ${
                      job.color === 'color' ? 'text-purple-600' : 'text-gray-600'
                    }`}>
                      {job.color === 'color' ? 'Color Print' : 'Black & White'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t">
              <div className="flex items-center gap-2">
                <Badge className="bg-success/10 text-success border-success/30">
                  <Package className="h-3 w-3 mr-1" />
                  Ready for Pickup
                </Badge>
                {job.priority === 'urgent' && (
                  <Badge className="bg-accent text-accent-foreground">
                    ⚡ Urgent
                  </Badge>
                )}
              </div>
              <code className="bg-muted px-2 py-1 rounded font-mono text-sm">
                {job.qrCode}
              </code>
            </div>

            <div className="mt-3 text-xs text-muted-foreground">
              Submitted {formatDistanceToNow(job.createdAt, { addSuffix: true })}
            </div>
          </div>

          {/* Confirmation Instructions */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
            <p className="text-sm font-medium mb-1">Pickup Instructions:</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Verify the student ID matches the person collecting</li>
              <li>• Hand over the printed documents</li>
              <li>• Click "Confirm Pickup" to complete the transaction</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
            <Button onClick={onConfirm} className="flex-1 bg-success hover:bg-success/90">
              <CheckCircle className="h-4 w-4 mr-2" />
              Confirm Pickup
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PickupConfirmation;