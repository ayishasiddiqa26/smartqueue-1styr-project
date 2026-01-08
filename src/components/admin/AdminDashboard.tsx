import React from 'react';
import { Printer, Clock, Package, CheckCircle, CalendarClock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import JobCard from './JobCard';
import QRVerifier from './QRVerifier';
import AIStatus from '../AIStatus';
import { usePrintQueue } from '@/hooks/usePrintQueue';
import { TIME_SLOTS } from '@/types/printJob';

const AdminDashboard: React.FC = () => {
  const { getAllJobs, updateJobStatus } = usePrintQueue();
  const allJobs = getAllJobs();

  const waiting = allJobs.filter(j => j.status === 'waiting');
  const printing = allJobs.filter(j => j.status === 'printing');
  const printed = allJobs.filter(j => j.status === 'printed');
  const collected = allJobs.filter(j => j.status === 'collected');

  // Active jobs are waiting and printing jobs only (exclude printed jobs)
  const activeJobs = allJobs.filter(j => j.status === 'waiting' || j.status === 'printing');
  
  // Keep jobs in their original order, only sort by priority and creation time
  // Do NOT reorder based on status to prevent jobs from moving around
  const sortedActiveJobs = activeJobs.sort((a, b) => {
    // First by payment status (paid jobs first)
    if (a.isPaid !== b.isPaid) {
      return a.isPaid ? -1 : 1;
    }
    
    // Then by job priority (urgent first)
    if (a.priority !== b.priority) {
      return a.priority === 'urgent' ? -1 : 1;
    }
    
    // Then by creation time (oldest first) - maintains original submission order
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  // Ready jobs are printed jobs sorted the same way
  const readyJobs = printed.sort((a, b) => {
    // First by payment status (paid jobs first)
    if (a.isPaid !== b.isPaid) {
      return a.isPaid ? -1 : 1;
    }
    
    // Then by job priority (urgent first)
    if (a.priority !== b.priority) {
      return a.priority === 'urgent' ? -1 : 1;
    }
    
    // Then by creation time (oldest first)
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  // Group active jobs by pickup slot with consistent sorting
  const jobsBySlot = TIME_SLOTS.map(slot => ({
    slot,
    jobs: sortedActiveJobs.filter(job => job.timeSlot === slot.id)
  })).filter(group => group.jobs.length > 0);

  // Group ready jobs by pickup slot
  const readyJobsBySlot = TIME_SLOTS.map(slot => ({
    slot,
    jobs: readyJobs.filter(job => job.timeSlot === slot.id)
  })).filter(group => group.jobs.length > 0);

  const stats = [
    { label: 'Waiting', count: waiting.length, icon: Clock, color: 'text-warning' },
    { label: 'Printing', count: printing.length, icon: Printer, color: 'text-primary' },
    { label: 'Ready', count: printed.length, icon: Package, color: 'text-success' },
    { label: 'Collected', count: collected.length, icon: CheckCircle, color: 'text-muted-foreground' },
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-secondary ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.count}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* QR Verifier */}
      <div className="mb-6">
        <QRVerifier />
      </div>

      {/* AI Status */}
      <div className="mb-6">
        <AIStatus />
      </div>

      {/* Job Tabs */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-4">
          <TabsTrigger value="active">
            Active Jobs ({waiting.length + printing.length})
          </TabsTrigger>
          <TabsTrigger value="ready" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Ready ({printed.length})
          </TabsTrigger>
          <TabsTrigger value="by-slot" className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4" />
            By Pickup Slot
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({collected.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <ScrollArea className="h-[calc(100vh-420px)]">
            {sortedActiveJobs.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="p-8 text-center">
                  <Printer className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No active print jobs</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {sortedActiveJobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onUpdateStatus={updateJobStatus}
                  />
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="ready">
          <ScrollArea className="h-[calc(100vh-420px)]">
            {readyJobs.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="p-8 text-center">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No jobs ready for pickup</p>
                </CardContent>
              </Card>
            ) : (
              <Tabs defaultValue="all-slots" className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-4">
                  <TabsTrigger value="all-slots">
                    All Slots ({readyJobs.length})
                  </TabsTrigger>
                  {TIME_SLOTS.map((slot) => {
                    const slotJobs = readyJobs.filter(job => job.timeSlot === slot.id);
                    return (
                      <TabsTrigger key={slot.id} value={slot.id} disabled={slotJobs.length === 0}>
                        {slot.label} ({slotJobs.length})
                      </TabsTrigger>
                    );
                  })}
                </TabsList>

                {/* All Slots View for Ready Jobs */}
                <TabsContent value="all-slots">
                  <div className="space-y-6">
                    {readyJobsBySlot.map(({ slot, jobs }) => (
                      <Card key={slot.id} className="overflow-hidden">
                        <CardHeader className="bg-success/5 border-b border-success/20">
                          <CardTitle className="text-lg flex items-center gap-3">
                            <div className="bg-success/10 p-2 rounded-lg">
                              <Package className="h-5 w-5 text-success" />
                            </div>
                            <div>
                              <p className="font-bold text-success">Slot - {slot.label}</p>
                              <p className="text-sm text-muted-foreground font-normal">
                                {slot.time} • {jobs.length} {jobs.length === 1 ? 'job' : 'jobs'} ready for pickup
                              </p>
                            </div>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            {jobs.map((job) => (
                              <JobCard
                                key={job.id}
                                job={job}
                                onUpdateStatus={updateJobStatus}
                              />
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                {/* Individual Slot Views for Ready Jobs */}
                {TIME_SLOTS.map((slot) => {
                  const slotJobs = readyJobs
                    .filter(job => job.timeSlot === slot.id)
                    .sort((a, b) => {
                      // Sort by priority first, then by creation time
                      if (a.priority !== b.priority) {
                        return a.priority === 'urgent' ? -1 : 1;
                      }
                      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                    });
                  
                  return (
                    <TabsContent key={slot.id} value={slot.id}>
                      {slotJobs.length === 0 ? (
                        <Card className="border-dashed">
                          <CardContent className="p-8 text-center">
                            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                            <h3 className="font-medium text-foreground mb-1">No Ready Jobs for {slot.label}</h3>
                            <p className="text-sm text-muted-foreground">
                              No jobs ready for pickup during {slot.time}
                            </p>
                          </CardContent>
                        </Card>
                      ) : (
                        <div className="space-y-4">
                          {/* Slot Header */}
                          <Card className="bg-gradient-to-r from-success/5 to-success/10 border-success/20">
                            <CardContent className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="bg-success/20 p-3 rounded-lg">
                                  <Package className="h-6 w-6 text-success" />
                                </div>
                                <div>
                                  <h2 className="text-xl font-bold text-success">Ready - {slot.label}</h2>
                                  <p className="text-sm text-muted-foreground">
                                    {slot.time} • {slotJobs.length} {slotJobs.length === 1 ? 'job' : 'jobs'} ready for pickup
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Ready Jobs List */}
                          <div className="space-y-3">
                            {slotJobs.map((job) => (
                              <JobCard key={job.id} job={job} onUpdateStatus={updateJobStatus} />
                            ))}
                          </div>
                        </div>
                      )}
                    </TabsContent>
                  );
                })}
              </Tabs>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="by-slot">
          <ScrollArea className="h-[calc(100vh-420px)]">
            {jobsBySlot.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="p-8 text-center">
                  <CalendarClock className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No active jobs to sort by pickup slot</p>
                </CardContent>
              </Card>
            ) : (
              <Tabs defaultValue="all-slots" className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-4">
                  <TabsTrigger value="all-slots">
                    All Slots ({sortedActiveJobs.length})
                  </TabsTrigger>
                  {TIME_SLOTS.map((slot) => {
                    const slotJobs = sortedActiveJobs.filter(job => job.timeSlot === slot.id);
                    return (
                      <TabsTrigger key={slot.id} value={slot.id} disabled={slotJobs.length === 0}>
                        {slot.label} ({slotJobs.length})
                      </TabsTrigger>
                    );
                  })}
                </TabsList>

                {/* All Slots View */}
                <TabsContent value="all-slots">
                  <div className="space-y-6">
                    {jobsBySlot.map(({ slot, jobs }) => (
                      <Card key={slot.id} className="overflow-hidden">
                        <CardHeader className="bg-primary/5 border-b">
                          <CardTitle className="text-lg flex items-center gap-3">
                            <div className="bg-primary/10 p-2 rounded-lg">
                              <CalendarClock className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-bold">Slot - {slot.label}</p>
                              <p className="text-sm text-muted-foreground font-normal">
                                {slot.time} • {jobs.length} {jobs.length === 1 ? 'job' : 'jobs'}
                              </p>
                            </div>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            {jobs.map((job) => (
                              <JobCard
                                key={job.id}
                                job={job}
                                onUpdateStatus={updateJobStatus}
                              />
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                {/* Individual Slot Views */}
                {TIME_SLOTS.map((slot) => {
                  const slotJobs = sortedActiveJobs
                    .filter(job => job.timeSlot === slot.id)
                    .sort((a, b) => {
                      // Sort by priority first, then by creation time
                      // Do NOT sort by status to prevent reordering
                      if (a.priority !== b.priority) {
                        return a.priority === 'urgent' ? -1 : 1;
                      }
                      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                    });
                  
                  return (
                    <TabsContent key={slot.id} value={slot.id}>
                      {slotJobs.length === 0 ? (
                        <Card className="border-dashed">
                          <CardContent className="p-8 text-center">
                            <CalendarClock className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                            <h3 className="font-medium text-foreground mb-1">No Jobs for {slot.label}</h3>
                            <p className="text-sm text-muted-foreground">
                              No active print jobs scheduled for {slot.time}
                            </p>
                          </CardContent>
                        </Card>
                      ) : (
                        <div className="space-y-4">
                          {/* Slot Header */}
                          <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
                            <CardContent className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="bg-primary/20 p-3 rounded-lg">
                                  <CalendarClock className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                  <h2 className="text-xl font-bold text-primary">Slot - {slot.label}</h2>
                                  <p className="text-sm text-muted-foreground">
                                    {slot.time} • {slotJobs.length} {slotJobs.length === 1 ? 'job' : 'jobs'} to process
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Jobs List - Show all jobs in order without status-based sections */}
                          <div className="space-y-3">
                            {slotJobs.map((job) => (
                              <JobCard key={job.id} job={job} onUpdateStatus={updateJobStatus} />
                            ))}
                          </div>
                        </div>
                      )}
                    </TabsContent>
                  );
                })}
              </Tabs>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="completed">
          <ScrollArea className="h-[calc(100vh-420px)]">
            {collected.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="p-8 text-center">
                  <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No completed jobs yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {collected.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onUpdateStatus={updateJobStatus}
                  />
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
