import React, { useState } from 'react';
import { QrCode, Search, CheckCircle, XCircle, User, FileText, Copy, Clock, Package, Camera } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePrintQueue } from '@/hooks/usePrintQueue';
import { useToast } from '@/hooks/use-toast';
import { useStudentName } from '@/hooks/useStudentName';
import { PrintJob, TIME_SLOTS } from '@/types/printJob';
import QRScanner from './QRScanner';
import PickupConfirmation from './PickupConfirmation';

const QRVerifier: React.FC = () => {
  const [code, setCode] = useState('');
  const [verifiedJob, setVerifiedJob] = useState<PrintJob | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [scannedJob, setScannedJob] = useState<PrintJob | null>(null);
  const { getJobByQrCode, updateJobStatus } = usePrintQueue();
  const { toast } = useToast();
  const verifiedStudentName = useStudentName(verifiedJob);
  const scannedStudentName = useStudentName(scannedJob);

  const handleVerify = () => {
    const job = getJobByQrCode(code);
    
    if (!job) {
      setVerifiedJob(null);
      toast({
        title: "Not Found",
        description: "No job found with this pickup code",
        variant: "destructive",
      });
      return;
    }

    setVerifiedJob(job);

    if (job.status === 'collected') {
      toast({
        title: "Already Collected",
        description: "This job has already been picked up",
        variant: "destructive",
      });
      return;
    }

    if (job.status !== 'printed') {
      toast({
        title: "Not Ready",
        description: `This job is currently ${job.status}. Please wait until it's printed.`,
        variant: "destructive",
      });
      return;
    }
  };

  const handleConfirmPickup = () => {
    if (verifiedJob) {
      updateJobStatus(verifiedJob.id, 'collected');
      setCode('');
      setVerifiedJob(null);
      
      toast({
        title: "Pickup Confirmed! ✓",
        description: `Job for ${verifiedStudentName} marked as collected`,
      });
    }
  };

  const handleQRScanned = (job: PrintJob) => {
    setScannedJob(job);
    setShowScanner(false);
    setShowConfirmation(true);
  };

  const handleConfirmScannedPickup = () => {
    if (scannedJob) {
      updateJobStatus(scannedJob.id, 'collected');
      setShowConfirmation(false);
      setScannedJob(null);
      
      toast({
        title: "Pickup Completed! ✓",
        description: `Job for ${scannedStudentName} has been collected`,
      });
    }
  };

  const timeSlot = verifiedJob ? TIME_SLOTS.find(t => t.id === verifiedJob.timeSlot) : null;

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <QrCode className="h-4 w-4" />
            Verify Pickup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Scanner and Manual Input Options */}
          <div className="grid grid-cols-2 gap-2">
            <Button 
              onClick={() => setShowScanner(true)}
              className="flex items-center gap-2"
              variant="default"
            >
              <Camera className="h-4 w-4" />
              Scan QR Code
            </Button>
            <Button 
              variant="outline"
              onClick={() => document.getElementById('manual-input')?.focus()}
            >
              <Search className="h-4 w-4 mr-1" />
              Manual Entry
            </Button>
          </div>

          {/* Manual Input */}
          <div className="flex gap-2">
            <Input
              id="manual-input"
              placeholder="Enter 4-digit code..."
              value={code}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, ''); // Only allow digits
                if (value.length <= 4) {
                  setCode(value);
                }
              }}
              className="font-mono text-center text-lg tracking-widest"
              maxLength={4}
              onKeyDown={(e) => e.key === 'Enter' && code.length === 4 && handleVerify()}
            />
            <Button onClick={handleVerify} disabled={code.length !== 4} variant="secondary">
              <Search className="h-4 w-4 mr-1" />
              Verify
            </Button>
          </div>

          {/* Job Details */}
          {verifiedJob && (
            <div className="border rounded-lg p-4 bg-secondary/20">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="bg-white p-2 rounded-lg shadow-sm">
                    <QRCodeSVG value={verifiedJob.qrCode} size={80} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <User className="h-4 w-4" />
                      <span className="font-medium">{verifiedJob.studentEmail || verifiedJob.studentId}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="h-4 w-4" />
                      <span className="text-sm truncate max-w-[200px]">{verifiedJob.fileName}</span>
                    </div>
                    <div className="grid grid-cols-1 gap-2 mt-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Copies:</span>
                        <span className="font-medium">{verifiedJob.copies} {verifiedJob.copies === 1 ? 'copy' : 'copies'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Slot:</span>
                        <span className="font-medium">Slot - {timeSlot?.label}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Type:</span>
                        <span className={`font-medium ${
                          verifiedJob.color === 'color' ? 'text-purple-600' : 'text-gray-600'
                        }`}>
                          {verifiedJob.color === 'color' ? 'Color Print' : 'Black & White'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <Badge 
                  variant="outline" 
                  className={
                    verifiedJob.status === 'printed' 
                      ? 'bg-success/10 text-success border-success/30'
                      : verifiedJob.status === 'collected'
                      ? 'bg-muted text-muted-foreground border-muted'
                      : 'bg-warning/10 text-warning border-warning/30'
                  }
                >
                  {verifiedJob.status === 'printed' && <Package className="h-3 w-3 mr-1" />}
                  {verifiedJob.status === 'collected' && <CheckCircle className="h-3 w-3 mr-1" />}
                  {verifiedJob.status === 'waiting' && <Clock className="h-3 w-3 mr-1" />}
                  {verifiedJob.status.charAt(0).toUpperCase() + verifiedJob.status.slice(1)}
                </Badge>
              </div>

              {verifiedJob.status === 'printed' && (
                <div className="flex justify-between items-center pt-3 border-t">
                  <div className="text-sm text-success font-medium">
                    ✓ Ready for pickup - Student should show this QR code
                  </div>
                  <Button onClick={handleConfirmPickup} className="bg-success hover:bg-success/90">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Confirm Pickup
                  </Button>
                </div>
              )}

              {verifiedJob.status === 'collected' && (
                <div className="pt-3 border-t text-sm text-muted-foreground">
                  ✓ This job has already been collected
                </div>
              )}

              {verifiedJob.status !== 'printed' && verifiedJob.status !== 'collected' && (
                <div className="pt-3 border-t text-sm text-warning">
                  ⚠ This job is not ready for pickup yet (Status: {verifiedJob.status})
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* QR Scanner Modal */}
      {showScanner && (
        <QRScanner
          onClose={() => setShowScanner(false)}
          onJobScanned={handleQRScanned}
        />
      )}

      {/* Pickup Confirmation Modal */}
      {showConfirmation && scannedJob && (
        <PickupConfirmation
          job={scannedJob}
          onConfirm={handleConfirmScannedPickup}
          onCancel={() => {
            setShowConfirmation(false);
            setScannedJob(null);
          }}
        />
      )}
    </>
  );
};

export default QRVerifier;
