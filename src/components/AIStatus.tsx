import React, { useState, useEffect } from 'react';
import { Bot, Printer, Zap, Clock, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { calculatePrinterStatus, PrinterStatus } from '@/lib/geminiAI';
import { usePrintQueue } from '@/hooks/usePrintQueue';
import { useAuth } from '@/contexts/AuthContext';

interface AIStatusProps {
  showDetailedInsights?: boolean;
}

const AIStatus: React.FC<AIStatusProps> = ({ showDetailedInsights = false }) => {
  const { getAllJobs } = usePrintQueue();
  const { role } = useAuth();
  const [printerStatus, setPrinterStatus] = useState<{
    printer1: PrinterStatus;
    printer2: PrinterStatus;
  } | null>(null);

  // Show detailed insights for admin or when explicitly requested
  const showDetails = showDetailedInsights || role === 'admin';

  useEffect(() => {
    // Update printer status based on current jobs
    const updateStatus = () => {
      const allJobs = getAllJobs();
      setPrinterStatus(calculatePrinterStatus(allJobs));
    };

    updateStatus();
    // Update every 5 seconds for real-time accuracy
    const interval = setInterval(updateStatus, 5000);

    return () => clearInterval(interval);
  }, [getAllJobs]);

  if (!printerStatus) {
    return (
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary animate-pulse" />
            <span className="text-sm">Loading AI printer analysis...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { printer1, printer2 } = printerStatus;

  const getPrinterLoad = (printer: PrinterStatus) => {
    const maxCapacity = 200; // Assume max 200 pages capacity
    return Math.min((printer.totalPages / maxCapacity) * 100, 100);
  };

  const getLoadColor = (load: number) => {
    if (load < 30) return 'text-success';
    if (load < 70) return 'text-warning';
    return 'text-destructive';
  };

  const getLoadBadgeVariant = (load: number) => {
    if (load < 30) return 'default';
    if (load < 70) return 'secondary';
    return 'destructive';
  };

  // Simple view for students - just shows printer assignments
  if (!showDetails) {
    return (
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Bot className="h-4 w-4 text-primary" />
            AI Printer Assignment
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
              <Printer className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <div className="font-medium text-sm text-blue-900">Printer 1</div>
              <div className="text-xs text-blue-700 mt-1">
                {printer1.currentJobs} jobs queued
              </div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
              <Printer className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <div className="font-medium text-sm text-green-900">Printer 2</div>
              <div className="text-xs text-green-700 mt-1">
                {printer2.currentJobs} jobs queued
              </div>
            </div>
          </div>
          <div className="mt-3 text-center">
            <p className="text-xs text-muted-foreground">
              Your job will be automatically assigned to the optimal printer
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Detailed view for admins - shows full AI insights and printer optimization
  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Bot className="h-4 w-4 text-primary" />
          AI-Powered Printer Optimization
          <Badge variant="outline" className="text-xs">
            <Zap className="h-3 w-3 mr-1" />
            Live
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Printer 1 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Printer className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-sm">{printer1.name}</span>
              </div>
              <Badge variant={getLoadBadgeVariant(getPrinterLoad(printer1))} className="text-xs">
                {getPrinterLoad(printer1).toFixed(0)}% Load
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Queue: {printer1.currentJobs} jobs</span>
                <span>{printer1.totalPages} pages</span>
              </div>
              <Progress 
                value={getPrinterLoad(printer1)} 
                className="h-2"
              />
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Speed: {printer1.averageSpeed} ppm</span>
                <span className={`font-medium ${getLoadColor(getPrinterLoad(printer1))}`}>
                  ~{Math.ceil(printer1.totalPages / printer1.averageSpeed)} min
                </span>
              </div>
            </div>
          </div>

          {/* Printer 2 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Printer className="h-4 w-4 text-green-600" />
                <span className="font-medium text-sm">{printer2.name}</span>
              </div>
              <Badge variant={getLoadBadgeVariant(getPrinterLoad(printer2))} className="text-xs">
                {getPrinterLoad(printer2).toFixed(0)}% Load
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Queue: {printer2.currentJobs} jobs</span>
                <span>{printer2.totalPages} pages</span>
              </div>
              <Progress 
                value={getPrinterLoad(printer2)} 
                className="h-2"
              />
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Speed: {printer2.averageSpeed} ppm</span>
                <span className={`font-medium ${getLoadColor(getPrinterLoad(printer2))}`}>
                  ~{Math.ceil(printer2.totalPages / printer2.averageSpeed)} min
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Insights */}
        <div className="mt-4 pt-3 border-t border-primary/20">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-3 w-3 text-primary" />
            <span className="text-xs font-medium text-primary">AI Insights</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {getPrinterLoad(printer1) < getPrinterLoad(printer2) 
              ? `Printer 1 recommended for new jobs (${(getPrinterLoad(printer2) - getPrinterLoad(printer1)).toFixed(0)}% less load)`
              : `Printer 2 recommended for new jobs (${(getPrinterLoad(printer1) - getPrinterLoad(printer2)).toFixed(0)}% less load)`
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIStatus;