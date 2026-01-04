import React, { useRef, useEffect, useState } from 'react';
import { Camera, X, Scan, CheckCircle, AlertCircle } from 'lucide-react';
import { BrowserMultiFormatReader } from '@zxing/library';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePrintQueue } from '@/hooks/usePrintQueue';
import { useToast } from '@/hooks/use-toast';
import { useStudentName } from '@/hooks/useStudentName';
import { PrintJob } from '@/types/printJob';

interface QRScannerProps {
  onClose: () => void;
  onJobScanned: (job: PrintJob) => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onClose, onJobScanned }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [codeReader, setCodeReader] = useState<BrowserMultiFormatReader | null>(null);
  const [scannedJob, setScannedJob] = useState<PrintJob | null>(null);
  const { getJobByQrCode } = usePrintQueue();
  const { toast } = useToast();
  const studentName = useStudentName(scannedJob);

  useEffect(() => {
    const reader = new BrowserMultiFormatReader();
    setCodeReader(reader);
    startScanning(reader);

    return () => {
      reader.reset();
    };
  }, []);

  const startScanning = async (reader: BrowserMultiFormatReader) => {
    try {
      setIsScanning(true);
      setError(null);

      const videoInputDevices = await reader.listVideoInputDevices();
      if (videoInputDevices.length === 0) {
        throw new Error('No camera found');
      }

      // Use the first available camera (usually back camera on mobile)
      const selectedDeviceId = videoInputDevices[0].deviceId;

      reader.decodeFromVideoDevice(selectedDeviceId, videoRef.current!, (result, error) => {
        if (result) {
          const scannedCode = result.getText().toUpperCase();
          handleQRCodeScanned(scannedCode);
        }
        if (error && !(error.name === 'NotFoundException')) {
          console.error('QR Scanner error:', error);
        }
      });
    } catch (err) {
      console.error('Failed to start camera:', err);
      setError('Failed to access camera. Please check permissions.');
      setIsScanning(false);
    }
  };

  const handleQRCodeScanned = (scannedCode: string) => {
    // Extract numeric code from QR (in case QR contains additional data)
    const numericCode = scannedCode.replace(/\D/g, '');
    
    if (numericCode.length !== 4) {
      toast({
        title: "Invalid QR Code",
        description: "QR code should contain a 4-digit pickup code",
        variant: "destructive",
      });
      return;
    }

    const job = getJobByQrCode(numericCode);
    
    if (!job) {
      toast({
        title: "Invalid QR Code",
        description: "This QR code doesn't match any print job",
        variant: "destructive",
      });
      return;
    }

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

    // Success - job is ready for pickup
    setScannedJob(job);
    onJobScanned(job);
    toast({
      title: "QR Code Verified! ✓",
      description: `Job for ${job.studentEmail || job.studentId} is ready for pickup`,
    });
  };

  const stopScanning = () => {
    if (codeReader) {
      codeReader.reset();
    }
    setIsScanning(false);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Scan className="h-5 w-5" />
              Scan Student QR Code
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Camera View */}
          <div className="relative bg-black rounded-lg overflow-hidden aspect-square">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
            />
            
            {/* Scanning Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-48 h-48 border-2 border-primary rounded-lg relative">
                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-primary rounded-tl-lg"></div>
                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-primary rounded-tr-lg"></div>
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-primary rounded-bl-lg"></div>
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-primary rounded-br-lg"></div>
                
                {/* Scanning line animation */}
                {isScanning && (
                  <div className="absolute inset-x-0 top-0 h-0.5 bg-primary animate-pulse"></div>
                )}
              </div>
            </div>

            {/* Status Indicators */}
            {isScanning && (
              <div className="absolute top-4 left-4">
                <Badge className="bg-success text-success-foreground">
                  <Camera className="h-3 w-3 mr-1" />
                  Scanning...
                </Badge>
              </div>
            )}

            {error && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="text-center text-white p-4">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="text-center space-y-2">
            <p className="text-sm font-medium">Position the QR code within the frame</p>
            <p className="text-xs text-muted-foreground">
              Ask the student to show their 4-digit pickup QR code
            </p>
          </div>

          {/* Controls */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            {!isScanning && !error && (
              <Button 
                onClick={() => codeReader && startScanning(codeReader)} 
                className="flex-1"
              >
                <Camera className="h-4 w-4 mr-2" />
                Start Camera
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QRScanner;