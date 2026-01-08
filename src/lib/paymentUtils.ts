// Demo payment utilities for hackathon
// NO REAL MONEY IS PROCESSED - SIMULATION ONLY

import { PrintColor } from '@/types/printJob';

export interface PaymentCalculation {
  baseAmount: number;
  colorSurcharge: number;
  totalAmount: number;
  breakdown: string[];
}

// Demo pricing (in rupees)
const PRICING = {
  BLACK_WHITE_PER_PAGE: 2,
  COLOR_PER_PAGE: 5,
  URGENT_SURCHARGE: 5,
} as const;

export const calculatePaymentAmount = (
  pageCount: number,
  copies: number,
  color: PrintColor,
  isUrgent: boolean = false
): PaymentCalculation => {
  const perPageRate = color === 'color' ? PRICING.COLOR_PER_PAGE : PRICING.BLACK_WHITE_PER_PAGE;
  const baseAmount = pageCount * copies * perPageRate;
  const colorSurcharge = 0; // Already included in per-page rate
  const urgentSurcharge = isUrgent ? PRICING.URGENT_SURCHARGE : 0;
  const totalAmount = baseAmount + urgentSurcharge;

  const breakdown = [
    `${pageCount} pages × ${copies} copies × ₹${perPageRate} = ₹${baseAmount}`,
  ];

  if (isUrgent) {
    breakdown.push(`Urgent processing fee: ₹${urgentSurcharge}`);
  }

  return {
    baseAmount,
    colorSurcharge,
    totalAmount,
    breakdown,
  };
};

export const generateDemoPaymentId = (): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `DEMO_${timestamp}_${random}`.toUpperCase();
};

// Simulate payment processing with random success/failure
export const simulatePaymentProcessing = async (amount: number): Promise<{
  success: boolean;
  paymentId?: string;
  error?: string;
}> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

  // 95% success rate for demo purposes
  const success = Math.random() > 0.05;

  if (success) {
    return {
      success: true,
      paymentId: generateDemoPaymentId(),
    };
  } else {
    const errors = [
      'Payment gateway timeout',
      'Insufficient balance (Demo)',
      'Card declined (Demo)',
      'Network error (Demo)',
    ];
    return {
      success: false,
      error: errors[Math.floor(Math.random() * errors.length)],
    };
  }
};