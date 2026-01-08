// Google Gemini AI integration for print queue optimization
// Demo implementation for hackathon - can be replaced with real API

export interface PrinterStatus {
  id: 'printer1' | 'printer2';
  name: string;
  currentJobs: number;
  totalPages: number;
  averageSpeed: number; // pages per minute
  status: 'online' | 'offline' | 'maintenance';
}

export interface JobAnalysisInput {
  pageCount: number;
  isUrgent: boolean;
  isPaid: boolean;
  currentQueueLength: number;
  printer1: PrinterStatus;
  printer2: PrinterStatus;
  submissionTime: Date;
}

export interface AIRecommendation {
  assignedPrinter: 'printer1' | 'printer2';
  estimatedWaitTime: number; // in minutes
  priorityLevel: 'High' | 'Medium' | 'Low';
  reasoning: string;
  confidence: number; // 0-100%
}

// Simulated Gemini API response for demo purposes
const simulateGeminiResponse = async (input: JobAnalysisInput): Promise<AIRecommendation> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));

  const { pageCount, isUrgent, isPaid, printer1, printer2 } = input;

  // STRICT PRINTER ASSIGNMENT RULES
  let assignedPrinter: 'printer1' | 'printer2';
  let assignmentReason = '';

  // Rule 1: If both printers have zero jobs and zero pages, assign to Printer 1
  if (printer1.currentJobs === 0 && printer1.totalPages === 0 && 
      printer2.currentJobs === 0 && printer2.totalPages === 0) {
    assignedPrinter = 'printer1';
    assignmentReason = 'First job assigned to Printer 1 (both printers empty)';
  }
  // Rule 2: If Printer 1 has jobs but Printer 2 is empty, assign to Printer 2
  else if (printer1.currentJobs > 0 && printer2.currentJobs === 0 && printer2.totalPages === 0) {
    assignedPrinter = 'printer2';
    assignmentReason = 'Second job assigned to Printer 2 (balancing load)';
  }
  // Rule 3: From third job onwards, compare total pages
  else {
    if (printer1.totalPages < printer2.totalPages) {
      assignedPrinter = 'printer1';
      assignmentReason = `Printer 1 has fewer pages (${printer1.totalPages} vs ${printer2.totalPages})`;
    } else if (printer2.totalPages < printer1.totalPages) {
      assignedPrinter = 'printer2';
      assignmentReason = `Printer 2 has fewer pages (${printer2.totalPages} vs ${printer1.totalPages})`;
    } else {
      // Equal pages, assign to Printer 1
      assignedPrinter = 'printer1';
      assignmentReason = `Equal page load (${printer1.totalPages} pages each), defaulting to Printer 1`;
    }
  }

  // PRIORITY LEVEL CALCULATION
  let priorityScore = 0;
  const priorityReasons = [];

  if (isPaid) {
    priorityScore += 3;
    priorityReasons.push('paid job');
  }
  if (isUrgent) {
    priorityScore += 2;
    priorityReasons.push('urgent request');
  }
  if (pageCount <= 5) {
    priorityScore += 1;
    priorityReasons.push('small job');
  }

  let priorityLevel: 'High' | 'Medium' | 'Low';
  if (priorityScore >= 4) priorityLevel = 'High';
  else if (priorityScore >= 2) priorityLevel = 'Medium';
  else priorityLevel = 'Low';

  // WAIT TIME ESTIMATION
  const selectedPrinter = assignedPrinter === 'printer1' ? printer1 : printer2;
  const baseWaitTime = selectedPrinter.totalPages / selectedPrinter.averageSpeed;
  const setupTime = selectedPrinter.currentJobs * 0.5; // 30 seconds per job setup
  const priorityMultiplier = priorityLevel === 'High' ? 0.7 : priorityLevel === 'Medium' ? 0.85 : 1.0;
  
  const estimatedWaitTime = Math.max(1, Math.round((baseWaitTime + setupTime) * priorityMultiplier));

  // BUILD EXPLANATION
  let explanation = assignmentReason;
  if (priorityReasons.length > 0) {
    explanation += `. ${priorityLevel} priority due to ${priorityReasons.join(', ')}`;
  }
  explanation += `. Estimated ${estimatedWaitTime} min wait`;

  return {
    assignedPrinter,
    estimatedWaitTime,
    priorityLevel,
    reasoning: explanation,
    confidence: Math.round(90 + Math.random() * 8), // 90-98% confidence for strict rules
  };
};

// Main function to get AI recommendation
export const getAIRecommendation = async (input: JobAnalysisInput): Promise<AIRecommendation> => {
  try {
    console.log('🤖 Gemini AI Analysis Input:', input);
    
    // In production, this would call the actual Gemini API
    // const response = await callGeminiAPI(generatePrompt(input));
    
    // For demo, use simulated response
    const recommendation = await simulateGeminiResponse(input);
    
    console.log('🤖 Gemini AI Recommendation:', recommendation);
    return recommendation;
    
  } catch (error) {
    console.error('Gemini AI Error:', error);
    
    // Fallback recommendation
    return {
      assignedPrinter: 'printer1',
      estimatedWaitTime: Math.max(1, Math.ceil(input.pageCount / 10)),
      priorityLevel: input.isUrgent ? 'High' : 'Medium',
      reasoning: 'Fallback assignment due to AI service unavailability',
      confidence: 60,
    };
  }
};

// Generate prompt for Gemini API (for future real implementation)
export const generateGeminiPrompt = (input: JobAnalysisInput): string => {
  return `
You are an AI assistant for a campus print queue system called XeroQ.

System context:
- There are exactly TWO printers: Printer 1 and Printer 2.
- Jobs are assigned only when the admin clicks "Start Printing".
- Initially, both printers have ZERO load.

Printer assignment rules (must be followed strictly):
1. If Printer 1 and Printer 2 both have zero jobs and zero pages:
   - Assign the first print job to Printer 1.
2. If Printer 1 has at least one job and Printer 2 has zero jobs:
   - Assign the second print job to Printer 2.
3. From the third job onwards:
   - Compare the TOTAL NUMBER OF PAGES currently assigned to Printer 1 and Printer 2.
   - Assign the new job to the printer with the LOWER total page load.
   - If both printers have the same number of pages, assign to Printer 1.

Priority rules (used to calculate priority level, not printer order):
- Paid jobs have higher priority than unpaid jobs.
- Urgent jobs have higher priority than normal jobs.
- Jobs with fewer pages have higher priority.
- Older jobs are considered for fairness.

CURRENT JOB:
- Pages: ${input.pageCount}
- Paid: ${input.isPaid}
- Urgent: ${input.isUrgent}
- Submission Time: ${input.submissionTime.toISOString()}

CURRENT PRINTER STATUS:
- Printer 1: ${input.printer1.currentJobs} jobs, ${input.printer1.totalPages} pages, ${input.printer1.averageSpeed} pages/min
- Printer 2: ${input.printer2.currentJobs} jobs, ${input.printer2.totalPages} pages, ${input.printer2.averageSpeed} pages/min

Your tasks:
1. Decide which printer the job should be assigned to.
2. Estimate the waiting time in minutes based on current load and print speed.
3. Assign a priority level: High, Medium, or Low.
4. Explain the decision clearly in simple terms suitable for a hackathon demo.

Output ONLY in valid JSON format:
{
  "assigned_printer": "Printer 1 or Printer 2",
  "estimated_wait_time_minutes": number,
  "priority_level": "High / Medium / Low",
  "explanation": "Short and simple explanation of the decision"
}`;
};

// Mock printer status for demo - starts with zero load
export const getMockPrinterStatus = (): { printer1: PrinterStatus; printer2: PrinterStatus } => {
  // For demo purposes, we'll simulate realistic but varying loads
  // In a real system, this would come from actual printer monitoring
  return {
    printer1: {
      id: 'printer1',
      name: 'Printer 1',
      currentJobs: Math.floor(Math.random() * 5), // 0-4 jobs for demo variety
      totalPages: Math.floor(Math.random() * 80), // 0-80 pages for demo variety
      averageSpeed: 25, // pages per minute
      status: 'online',
    },
    printer2: {
      id: 'printer2',
      name: 'Printer 2',
      currentJobs: Math.floor(Math.random() * 4), // 0-3 jobs for demo variety
      totalPages: Math.floor(Math.random() * 60), // 0-60 pages for demo variety
      averageSpeed: 30, // pages per minute
      status: 'online',
    },
  };
};

// Calculate actual printer status from current jobs (for real-time accuracy)
export const calculatePrinterStatus = (jobs: any[]): { printer1: PrinterStatus; printer2: PrinterStatus } => {
  const activeJobs = jobs.filter(job => job.status === 'waiting' || job.status === 'printing');
  
  const printer1Jobs = activeJobs.filter(job => job.assignedPrinter === 'printer1');
  const printer2Jobs = activeJobs.filter(job => job.assignedPrinter === 'printer2');
  
  const printer1Pages = printer1Jobs.reduce((total, job) => total + (job.pageCount || 0) * job.copies, 0);
  const printer2Pages = printer2Jobs.reduce((total, job) => total + (job.pageCount || 0) * job.copies, 0);
  
  return {
    printer1: {
      id: 'printer1',
      name: 'Printer 1',
      currentJobs: printer1Jobs.length,
      totalPages: printer1Pages,
      averageSpeed: 25,
      status: 'online',
    },
    printer2: {
      id: 'printer2',
      name: 'Printer 2',
      currentJobs: printer2Jobs.length,
      totalPages: printer2Pages,
      averageSpeed: 30,
      status: 'online',
    },
  };
};