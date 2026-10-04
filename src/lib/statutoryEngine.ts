/**
 * Philippine Statutory Engine & Rate Calculators
 * Handles deterministic computation of SSS, PhilHealth, Pag-IBIG, and BIR Tax
 */

import {
  SSSConfig,
  PhilHealthConfig,
  PagIBIGConfig,
  BIRConfig,
  PayrollPolicy,
  PayFrequency,
  SSSBracket
} from '../types';

export interface CalculatedRates {
  dailyRate: number;
  hourlyRate: number;
  minuteRate: number;
}

export function calculateRates(monthlySalary: number, policy: PayrollPolicy): CalculatedRates {
  const divisor = policy.monthlyDivisor > 0 ? policy.monthlyDivisor : 26;
  const hoursPerDay = policy.workHoursPerDay > 0 ? policy.workHoursPerDay : 8;

  const dailyRate = Number((monthlySalary / divisor).toFixed(4));
  const hourlyRate = Number((dailyRate / hoursPerDay).toFixed(4));
  const minuteRate = Number((hourlyRate / 60).toFixed(4));

  return {
    dailyRate: Number(dailyRate.toFixed(2)),
    hourlyRate: Number(hourlyRate.toFixed(2)),
    minuteRate: Number(minuteRate.toFixed(2))
  };
}

export interface SSSCalculationResult {
  msc: number;
  employeeShare: number;
  employerShare: number;
  ecContribution: number;
  mpfEmployee: number;
  mpfEmployer: number;
  totalEE: number;
  totalER: number;
  totalContribution: number;
}

export function calculateSSS(monthlySalary: number, config: SSSConfig): SSSCalculationResult {
  const brackets = config.brackets;
  if (!brackets || brackets.length === 0) {
    return {
      msc: 0,
      employeeShare: 0,
      employerShare: 0,
      ecContribution: 0,
      mpfEmployee: 0,
      mpfEmployer: 0,
      totalEE: 0,
      totalER: 0,
      totalContribution: 0
    };
  }

  // Find matching bracket
  let matchedBracket: SSSBracket | undefined = brackets.find(
    (b) => monthlySalary >= b.minSalary && monthlySalary <= b.maxSalary
  );

  if (!matchedBracket) {
    if (monthlySalary < brackets[0].minSalary) {
      matchedBracket = brackets[0];
    } else {
      matchedBracket = brackets[brackets.length - 1];
    }
  }

  return {
    msc: matchedBracket.msc,
    employeeShare: matchedBracket.employeeShare,
    employerShare: matchedBracket.employerShare,
    ecContribution: matchedBracket.ecContribution,
    mpfEmployee: matchedBracket.mpfEmployee,
    mpfEmployer: matchedBracket.mpfEmployer,
    totalEE: matchedBracket.totalEE,
    totalER: matchedBracket.totalER,
    totalContribution: matchedBracket.totalContribution
  };
}

export interface PhilHealthCalculationResult {
  baseSalary: number;
  rate: number;
  totalPremium: number;
  employeeShare: number;
  employerShare: number;
}

export function calculatePhilHealth(
  monthlySalary: number,
  config: PhilHealthConfig
): PhilHealthCalculationResult {
  const clampedSalary = Math.min(Math.max(monthlySalary, config.floor), config.ceiling);
  const totalPremium = Number((clampedSalary * config.rate).toFixed(2));
  const employeeShare = Number((totalPremium * config.employeeSplit).toFixed(2));
  const employerShare = Number((totalPremium - employeeShare).toFixed(2));

  return {
    baseSalary: clampedSalary,
    rate: config.rate,
    totalPremium,
    employeeShare,
    employerShare
  };
}

export interface PagIBIGCalculationResult {
  baseSalary: number;
  employeeRate: number;
  employerRate: number;
  employeeShare: number;
  employerShare: number;
  totalContribution: number;
}

export function calculatePagIBIG(
  monthlySalary: number,
  config: PagIBIGConfig
): PagIBIGCalculationResult {
  const clampedSalary = Math.min(monthlySalary, config.maxCompensationBase);
  const employeeRate =
    clampedSalary <= config.thresholdSalary
      ? config.rateBelowThreshold
      : config.rateAboveThreshold;
  const employerRate = config.employerRate;

  const employeeShare = Number((clampedSalary * employeeRate).toFixed(2));
  const employerShare = Number((clampedSalary * employerRate).toFixed(2));
  const totalContribution = Number((employeeShare + employerShare).toFixed(2));

  return {
    baseSalary: clampedSalary,
    employeeRate,
    employerRate,
    employeeShare,
    employerShare,
    totalContribution
  };
}

export interface BIRCalculationResult {
  minIncome: number;
  baseTax: number;
  excessRate: number;
  taxableIncome: number;
  excessIncome: number;
  taxOnExcess: number;
  totalTax: number;
}

export function calculateBIRTax(
  taxableIncome: number,
  frequency: PayFrequency,
  config: BIRConfig
): BIRCalculationResult {
  if (taxableIncome <= 0) {
    return {
      minIncome: 0,
      baseTax: 0,
      excessRate: 0,
      taxableIncome: 0,
      excessIncome: 0,
      taxOnExcess: 0,
      totalTax: 0
    };
  }

  const brackets =
    frequency === 'MONTHLY' ? config.bracketsMonthly : config.bracketsSemiMonthly;

  const matched = brackets.find(
    (b) => taxableIncome >= b.minIncome && taxableIncome <= b.maxIncome
  ) || brackets[brackets.length - 1];

  const excessIncome = Math.max(0, taxableIncome - matched.minIncome);
  const taxOnExcess = Number((excessIncome * matched.excessRate).toFixed(2));
  const totalTax = Number((matched.baseTax + taxOnExcess).toFixed(2));

  return {
    minIncome: matched.minIncome,
    baseTax: matched.baseTax,
    excessRate: matched.excessRate,
    taxableIncome,
    excessIncome,
    taxOnExcess,
    totalTax
  };
}

/**
 * Format currency in Philippine Peso
 */
export function formatPHP(value: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

/**
 * Convert number into Philippine Peso Words (e.g. For official bank checks/payslips)
 */
export function numberToWordsPHP(num: number): string {
  if (num === 0) return 'ZERO PESOS ONLY';

  const a = [
    '', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE',
    'TEN', 'ELEVEN', 'TWELVE', 'THIRTEEN', 'FOURTEEN', 'FIFTEEN', 'SIXTEEN',
    'SEVENTEEN', 'EIGHTEEN', 'NINETEEN'
  ];
  const b = ['', '', 'TWENTY', 'THIRTY', 'FORTY', 'FIFTY', 'SIXTY', 'SEVENTY', 'EIGHTY', 'NINETY'];

  function inWords(n: number): string {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '');
    if (n < 1000)
      return (
        a[Math.floor(n / 100)] +
        ' HUNDRED' +
        (n % 100 !== 0 ? ' ' + inWords(n % 100) : '')
      );
    if (n < 1000000)
      return (
        inWords(Math.floor(n / 1000)) +
        ' THOUSAND' +
        (n % 1000 !== 0 ? ' ' + inWords(n % 1000) : '')
      );
    if (n < 1000000000)
      return (
        inWords(Math.floor(n / 1000000)) +
        ' MILLION' +
        (n % 1000000 !== 0 ? ' ' + inWords(n % 1000000) : '')
      );
    return n.toString();
  }

  const integerPart = Math.floor(Math.abs(num));
  const decimalPart = Math.round((Math.abs(num) - integerPart) * 100);

  const words = inWords(integerPart);
  const cents = decimalPart.toString().padStart(2, '0');

  return `${words} PESOS AND ${cents}/100 ONLY`;
}
