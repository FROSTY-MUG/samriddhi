import { CalculationSummary, AmortizationRow } from '../types';

export function calculateConcessionalLoan(
  projectCost: number,
  assistancePct: number = 90,
  annualInterestRate: number = 6.5,
  tenureYears: number = 5,
  moratoriumMonths: number = 6
): CalculationSummary {
  // Ensure valid minimums
  const safeCost = Math.max(10000, projectCost);
  const safeRate = Math.max(1.0, annualInterestRate);
  const safeTenure = Math.max(1, tenureYears);
  const safeMoratorium = Math.min(Math.max(0, moratoriumMonths), (safeTenure * 12) - 3);

  // Eligible loan up to 90% (or requested assistancePct)
  const loanAmount = Math.round(safeCost * (assistancePct / 100));
  const promoterContribution = safeCost - loanAmount;

  const totalTenureMonths = safeTenure * 12;
  const repaymentMonths = Math.max(1, totalTenureMonths - safeMoratorium);
  const monthlyRate = safeRate / 100 / 12;

  // Simple interest during moratorium per month
  const moratoriumInterestMonthly = Math.round(loanAmount * monthlyRate);

  // Standard Reducing Balance EMI post-moratorium
  let monthlyEmi = 0;
  if (monthlyRate === 0) {
    monthlyEmi = Math.round(loanAmount / repaymentMonths);
  } else {
    const factor = Math.pow(1 + monthlyRate, repaymentMonths);
    monthlyEmi = Math.round((loanAmount * monthlyRate * factor) / (factor - 1));
  }

  // Generate Amortization Schedule
  const schedule: AmortizationRow[] = [];
  let currentBalance = loanAmount;
  let totalInterestPayable = 0;

  // Moratorium period
  for (let m = 1; m <= safeMoratorium; m++) {
    const year = Math.ceil(m / 12);
    const intPayment = moratoriumInterestMonthly;
    totalInterestPayable += intPayment;

    schedule.push({
      month: m,
      year,
      beginningBalance: currentBalance,
      principalPayment: 0,
      interestPayment: intPayment,
      totalPayment: intPayment,
      endingBalance: currentBalance,
      isMoratorium: true
    });
  }

  // Active Repayment Period
  for (let m = safeMoratorium + 1; m <= totalTenureMonths; m++) {
    const year = Math.ceil(m / 12);
    const intPayment = Math.round(currentBalance * monthlyRate);
    let princPayment = monthlyEmi - intPayment;

    if (m === totalTenureMonths || currentBalance < monthlyEmi) {
      princPayment = currentBalance;
    }

    const totalPayment = princPayment + intPayment;
    const endingBalance = Math.max(0, currentBalance - princPayment);
    totalInterestPayable += intPayment;

    schedule.push({
      month: m,
      year,
      beginningBalance: currentBalance,
      principalPayment: princPayment,
      interestPayment: intPayment,
      totalPayment,
      endingBalance,
      isMoratorium: false
    });

    currentBalance = endingBalance;
    if (currentBalance <= 0) break;
  }

  const totalAmountPayable = loanAmount + totalInterestPayable;

  return {
    projectCost: safeCost,
    loanAmount,
    promoterContribution,
    interestRate: safeRate,
    tenureYears: safeTenure,
    moratoriumMonths: safeMoratorium,
    monthlyEmi,
    moratoriumInterestMonthly,
    totalInterestPayable,
    totalAmountPayable,
    schedule
  };
}

export function formatIndianCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}


export type CalculatorMode = 'reducing_balance' | 'flat_interest' | 'subsidy_adjusted' | 'prepayment';

export interface AdvancedLoanInputs {
  projectCost: number;
  assistancePct: number;
  annualInterestRate: number;
  tenureYears: number;
  moratoriumMonths: number;
  subsidyAmount?: number;
  processingFeePct?: number;
  insuranceAmount?: number;
  gstAmount?: number;
  downPayment?: number;
  monthlyIncome?: number;
  existingEmi?: number;
  expectedBusinessRevenue?: number;
  prepaymentAmount?: number;
  mode?: CalculatorMode;
}

export interface AdvancedLoanResult {
  mode: CalculatorMode;
  financedAmount: number;
  subsidyAmount: number;
  downPayment: number;
  processingFee: number;
  insuranceAmount: number;
  gstAmount: number;
  monthlyEmi: number;
  totalInterest: number;
  totalCost: number;
  debtToIncomeRatio?: number;
  affordability: 'comfortable' | 'watch' | 'high' | 'unknown';
}

/** Offline calculator supporting reducing-balance, flat-interest, subsidy, and prepayment scenarios. */
export function calculateAdvancedLoan(inputs: AdvancedLoanInputs): AdvancedLoanResult {
  const cost = Math.max(0, inputs.projectCost || 0);
  const subsidyAmount = Math.min(cost, Math.max(0, inputs.subsidyAmount || 0));
  const downPayment = Math.min(cost - subsidyAmount, Math.max(0, inputs.downPayment || 0));
  const financedAmount = Math.max(0, (cost - subsidyAmount - downPayment) * Math.min(1, Math.max(0, (inputs.assistancePct || 90) / 100)));
  const rate = Math.max(0, inputs.annualInterestRate || 0);
  const months = Math.max(1, Math.round((inputs.tenureYears || 1) * 12 - Math.max(0, inputs.moratoriumMonths || 0)));
  const mode = inputs.mode || 'reducing_balance';
  const monthlyRate = rate / 100 / 12;
  const prepayment = Math.min(financedAmount, Math.max(0, inputs.prepaymentAmount || 0));
  const principalAfterPrepayment = mode === 'prepayment' ? financedAmount - prepayment : financedAmount;
  let monthlyEmi = 0;
  let totalInterest = 0;

  if (mode === 'flat_interest') {
    totalInterest = principalAfterPrepayment * (rate / 100) * (months / 12);
    monthlyEmi = (principalAfterPrepayment + totalInterest) / months;
  } else if (monthlyRate === 0) {
    monthlyEmi = principalAfterPrepayment / months;
  } else {
    const factor = Math.pow(1 + monthlyRate, months);
    monthlyEmi = (principalAfterPrepayment * monthlyRate * factor) / (factor - 1);
    totalInterest = monthlyEmi * months - principalAfterPrepayment;
  }

  const processingFee = cost * Math.max(0, inputs.processingFeePct || 0) / 100;
  const insuranceAmount = Math.max(0, inputs.insuranceAmount || 0);
  const gstAmount = Math.max(0, inputs.gstAmount || 0);
  const totalCost = principalAfterPrepayment + totalInterest + processingFee + insuranceAmount + gstAmount + downPayment;
  const debtToIncomeRatio = inputs.monthlyIncome && inputs.monthlyIncome > 0
    ? ((monthlyEmi + Math.max(0, inputs.existingEmi || 0)) / inputs.monthlyIncome) * 100
    : undefined;

  return {
    mode,
    financedAmount: Math.round(financedAmount),
    subsidyAmount: Math.round(subsidyAmount),
    downPayment: Math.round(downPayment),
    processingFee: Math.round(processingFee),
    insuranceAmount: Math.round(insuranceAmount),
    gstAmount: Math.round(gstAmount),
    monthlyEmi: Math.round(monthlyEmi),
    totalInterest: Math.round(totalInterest),
    totalCost: Math.round(totalCost),
    debtToIncomeRatio: debtToIncomeRatio === undefined ? undefined : Math.round(debtToIncomeRatio * 10) / 10,
    affordability: debtToIncomeRatio === undefined ? 'unknown' : debtToIncomeRatio <= 35 ? 'comfortable' : debtToIncomeRatio <= 50 ? 'watch' : 'high'
  };
}
