import React, { useState } from 'react';
import { CreditCard, AlertTriangle, CheckCircle, Loader2, IndianRupee } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PrintJob } from '@/types/printJob';
import { calculatePaymentAmount, simulatePaymentProcessing } from '@/lib/paymentUtils';

interface PaymentDialogProps {
  job: PrintJob;
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: (paymentId: string, amount: number) => void;
}

const PaymentDialog: React.FC<PaymentDialogProps> = ({
  job,
  isOpen,
  onClose,
  onPaymentSuccess,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState<{
    success: boolean;
    paymentId?: string;
    error?: string;
  } | null>(null);

  const payment = calculatePaymentAmount(
    job.pageCount || 1,
    job.copies,
    job.color,
    job.priority === 'urgent'
  );

  const handlePayment = async () => {
    setIsProcessing(true);
    setPaymentResult(null);

    try {
      const result = await simulatePaymentProcessing(payment.totalAmount);
      setPaymentResult(result);

      if (result.success && result.paymentId) {
        // Wait a moment to show success, then call parent
        setTimeout(() => {
          onPaymentSuccess(result.paymentId!, payment.totalAmount);
          onClose();
        }, 2000);
      }
    } catch (error) {
      setPaymentResult({
        success: false,
        error: 'Payment processing failed',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (!isProcessing) {
      setPaymentResult(null);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Demo Payment Required
          </DialogTitle>
          <DialogDescription>
            Complete payment to prioritize your print job in the queue
          </DialogDescription>
        </DialogHeader>

        {/* Job Details */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">File:</span>
            <span className="font-medium">{job.fileName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Pages:</span>
            <span>{job.pageCount || 1}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Copies:</span>
            <span>{job.copies}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Color:</span>
            <Badge variant={job.color === 'color' ? 'default' : 'secondary'}>
              {job.color === 'color' ? 'Color' : 'Black & White'}
            </Badge>
          </div>
          {job.priority === 'urgent' && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Priority:</span>
              <Badge variant="destructive">Urgent</Badge>
            </div>
          )}
        </div>

        {/* Payment Breakdown */}
        <div className="border rounded-lg p-3 space-y-2">
          <h4 className="font-medium text-sm">Payment Breakdown</h4>
          {payment.breakdown.map((line, index) => (
            <div key={index} className="text-sm text-muted-foreground">
              {line}
            </div>
          ))}
          <div className="border-t pt-2 flex justify-between items-center font-medium">
            <span>Total Amount:</span>
            <span className="flex items-center gap-1">
              <IndianRupee className="h-4 w-4" />
              {payment.totalAmount}
            </span>
          </div>
        </div>

        {/* Payment Result */}
        {paymentResult && (
          <Alert className={paymentResult.success ? 'border-success/50 bg-success/10' : 'border-destructive/50 bg-destructive/10'}>
            {paymentResult.success ? (
              <CheckCircle className="h-4 w-4 text-success" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-destructive" />
            )}
            <AlertDescription className={paymentResult.success ? 'text-success-foreground' : 'text-destructive-foreground'}>
              {paymentResult.success ? (
                <>
                  <strong>Payment Successful!</strong><br />
                  Payment ID: {paymentResult.paymentId}<br />
                  Your job will be prioritized in the queue.
                </>
              ) : (
                <>
                  <strong>Payment Failed</strong><br />
                  {paymentResult.error}
                </>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isProcessing}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handlePayment}
            disabled={isProcessing || paymentResult?.success}
            className="flex-1"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : paymentResult?.success ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Paid
              </>
            ) : (
              <>
                <IndianRupee className="h-4 w-4 mr-2" />
                Pay {payment.totalAmount}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;