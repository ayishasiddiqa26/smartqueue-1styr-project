import React, { useState } from 'react';
import { CreditCard, Wallet, Clock, AlertTriangle, CheckCircle, Loader2, IndianRupee } from 'lucide-react';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { PrintJob } from '@/types/printJob';
import { calculatePaymentAmount, simulatePaymentProcessing, PaymentMethod, PaymentResult } from '@/lib/paymentUtils';
import { useWallet } from '@/hooks/useWallet';

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
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('wallet');
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);
  const { balance, deductFromWallet, hasSufficientBalance, loading: walletLoading } = useWallet();

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
      let result: PaymentResult;

      if (paymentMethod === 'wallet') {
        console.log(`Attempting wallet payment: Amount: ₹${payment.totalAmount}, Balance: ₹${balance}`);
        
        if (!hasSufficientBalance(payment.totalAmount)) {
          result = {
            success: false,
            message: `Insufficient wallet balance. You have ₹${balance}, but need ₹${payment.totalAmount}`,
          };
        } else {
          const walletSuccess = await deductFromWallet(
            payment.totalAmount,
            `Print job payment - ${job.fileName}`,
            job.id
          );
          
          if (walletSuccess) {
            result = {
              success: true,
              message: 'Payment successful via wallet',
              transactionId: `WALLET_${Date.now()}`,
              remainingBalance: balance - payment.totalAmount
            };
            console.log('Wallet payment successful');
          } else {
            console.error('Wallet deduction failed');
            result = {
              success: false,
              message: 'Wallet payment failed. Please check your balance and try again.',
            };
          }
        }
      } else {
        result = await simulatePaymentProcessing(payment.totalAmount, paymentMethod);
      }

      setPaymentResult(result);

      if (result.success && result.transactionId) {
        // Wait a moment to show success, then call parent
        setTimeout(() => {
          onPaymentSuccess(result.transactionId!, payment.totalAmount);
          onClose();
        }, 2000);
      }
    } catch (error) {
      setPaymentResult({
        success: false,
        message: 'Payment processing failed',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (!isProcessing) {
      setPaymentResult(null);
      setPaymentMethod('wallet');
      onClose();
    }
  };

  const getPaymentMethodIcon = (method: PaymentMethod) => {
    switch (method) {
      case 'wallet':
        return <Wallet className="h-4 w-4" />;
      case 'card':
        return <CreditCard className="h-4 w-4" />;
      case 'pay_later':
        return <Clock className="h-4 w-4" />;
    }
  };

  const getPaymentMethodLabel = (method: PaymentMethod) => {
    switch (method) {
      case 'wallet':
        if (walletLoading) return 'Wallet (Loading...)';
        return `Wallet (₹${balance} available)`;
      case 'card':
        return 'Credit/Debit Card';
      case 'pay_later':
        return 'Pay Later';
    }
  };

  const isPaymentDisabled = () => {
    if (isProcessing || paymentResult?.success) return true;
    if (paymentMethod === 'wallet') {
      if (walletLoading) return true; // Disable if wallet is still loading
      if (!hasSufficientBalance(payment.totalAmount)) return true;
    }
    return false;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Required
          </DialogTitle>
          <DialogDescription>
            Complete payment to prioritize your print job in the queue
          </DialogDescription>
        </DialogHeader>

        {/* Payment Method Selection */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Select Payment Method</h4>
          <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="wallet" id="wallet" />
              <Label htmlFor="wallet" className="flex items-center gap-2 cursor-pointer">
                {getPaymentMethodIcon('wallet')}
                {getPaymentMethodLabel('wallet')}
                {!hasSufficientBalance(payment.totalAmount) && (
                  <Badge variant="destructive" className="text-xs">Insufficient Balance</Badge>
                )}
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="card" id="card" />
              <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer">
                {getPaymentMethodIcon('card')}
                {getPaymentMethodLabel('card')}
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="pay_later" id="pay_later" />
              <Label htmlFor="pay_later" className="flex items-center gap-2 cursor-pointer">
                {getPaymentMethodIcon('pay_later')}
                {getPaymentMethodLabel('pay_later')}
                <Badge variant="outline" className="text-xs">No Priority</Badge>
              </Label>
            </div>
          </RadioGroup>
        </div>

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
                  Transaction ID: {paymentResult.transactionId}<br />
                  {paymentResult.remainingBalance !== undefined && (
                    <>Wallet Balance: ₹{paymentResult.remainingBalance}<br /></>
                  )}
                  {paymentMethod === 'pay_later' ? 
                    'Job submitted - payment can be completed later.' :
                    'Your job will be prioritized in the queue.'
                  }
                </>
              ) : (
                <>
                  <strong>Payment Failed</strong><br />
                  {paymentResult.message}
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
            disabled={isPaymentDisabled()}
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
                {paymentMethod === 'pay_later' ? 'Submitted' : 'Paid'}
              </>
            ) : (
              <>
                {getPaymentMethodIcon(paymentMethod)}
                <span className="ml-2">
                  {paymentMethod === 'pay_later' 
                    ? 'Submit Job' 
                    : `Pay ₹${payment.totalAmount}`
                  }
                </span>
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;