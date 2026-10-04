/**
 * Philippine Statutory Tables & Default Configurations
 * Compliant with 2025/2026 SSS Circular, PhilHealth Circular 2024/2025, HDMF Circular, and BIR TRAIN Law
 */

import { SSSConfig, PhilHealthConfig, PagIBIGConfig, BIRConfig, SSSBracket, PayrollPolicy, Holiday } from '../types';

/**
 * Generate 2025 SSS Contribution Table brackets (15% rate: 10% ER, 5% EE)
 * Floor MSC: 5,000; Ceiling MSC: 35,000; Step: 500
 * Regular SS up to 20,000 MSC. Excess MSC up to 35,000 goes to WISP/MPF.
 * EC is 10 for MSC <= 14,500, 30 for MSC >= 15,000.
 */
export function generateSSS2025Brackets(): SSSBracket[] {
  const brackets: SSSBracket[] = [];
  const minMsc = 5000;
  const maxMsc = 35000;
  const step = 500;

  for (let msc = minMsc; msc <= maxMsc; msc += step) {
    const minSalary = msc === minMsc ? 0 : msc - 250;
    const maxSalary = msc === maxMsc ? 9999999 : msc + 249.99;

    const regularMsc = Math.min(msc, 20000);
    const mpfMsc = Math.max(0, msc - 20000);

    const employeeShare = Number((regularMsc * 0.05).toFixed(2));
    const employerShare = Number((regularMsc * 0.10).toFixed(2));

    const mpfEmployee = Number((mpfMsc * 0.05).toFixed(2));
    const mpfEmployer = Number((mpfMsc * 0.10).toFixed(2));

    const ecContribution = msc >= 15000 ? 30 : 10;

    const totalEE = Number((employeeShare + mpfEmployee).toFixed(2));
    const totalER = Number((employerShare + mpfEmployer + ecContribution).toFixed(2));
    const totalContribution = Number((totalEE + totalER).toFixed(2));

    brackets.push({
      minSalary,
      maxSalary,
      msc,
      employeeShare,
      employerShare,
      ecContribution,
      mpfEmployee,
      mpfEmployer,
      totalEE,
      totalER,
      totalContribution
    });
  }

  return brackets;
}

export const defaultSSSConfig: SSSConfig = {
  effectiveFrom: '2025-01-01',
  ssRateEmployee: 0.05,
  ssRateEmployer: 0.10,
  minMsc: 5000,
  maxMsc: 35000,
  brackets: generateSSS2025Brackets()
};

export const defaultPhilHealthConfig: PhilHealthConfig = {
  effectiveFrom: '2025-01-01',
  rate: 0.05, // 5.0%
  floor: 10000,
  ceiling: 100000,
  employeeSplit: 0.50, // 2.5%
  employerSplit: 0.50  // 2.5%
};

export const defaultPagIBIGConfig: PagIBIGConfig = {
  effectiveFrom: '2024-02-01',
  thresholdSalary: 1500,
  rateBelowThreshold: 0.01, // 1%
  rateAboveThreshold: 0.02, // 2%
  employerRate: 0.02, // 2%
  maxCompensationBase: 10000 // Updated HDMF ceiling: 200 EE / 200 ER
};

export const defaultBIRConfig: BIRConfig = {
  effectiveFrom: '2023-01-01',
  bracketsSemiMonthly: [
    { frequency: 'SEMI_MONTHLY', minIncome: 0, maxIncome: 10417, baseTax: 0, excessRate: 0 },
    { frequency: 'SEMI_MONTHLY', minIncome: 10417, maxIncome: 16666, baseTax: 0, excessRate: 0.15 },
    { frequency: 'SEMI_MONTHLY', minIncome: 16667, maxIncome: 33332, baseTax: 937.50, excessRate: 0.20 },
    { frequency: 'SEMI_MONTHLY', minIncome: 33333, maxIncome: 83332, baseTax: 4270.70, excessRate: 0.25 },
    { frequency: 'SEMI_MONTHLY', minIncome: 83333, maxIncome: 333332, baseTax: 16770.70, excessRate: 0.30 },
    { frequency: 'SEMI_MONTHLY', minIncome: 333333, maxIncome: 999999999, baseTax: 91770.70, excessRate: 0.35 },
  ],
  bracketsMonthly: [
    { frequency: 'MONTHLY', minIncome: 0, maxIncome: 20833, baseTax: 0, excessRate: 0 },
    { frequency: 'MONTHLY', minIncome: 20833, maxIncome: 33332, baseTax: 0, excessRate: 0.15 },
    { frequency: 'MONTHLY', minIncome: 33333, maxIncome: 66666, baseTax: 1875.00, excessRate: 0.20 },
    { frequency: 'MONTHLY', minIncome: 66667, maxIncome: 166666, baseTax: 8541.80, excessRate: 0.25 },
    { frequency: 'MONTHLY', minIncome: 166667, maxIncome: 666666, baseTax: 33541.80, excessRate: 0.30 },
    { frequency: 'MONTHLY', minIncome: 666667, maxIncome: 999999999, baseTax: 183541.80, excessRate: 0.35 },
  ]
};

export const defaultPayrollPolicy: PayrollPolicy = {
  monthlyDivisor: 26, // standard 26 days/month or 313/12
  workHoursPerDay: 8,
  graceMinutes: 15,
  overtimeEnabled: true,
  nightDiffStartTime: '22:00',
  nightDiffEndTime: '06:00',
  nightDiffRate: 0.10, // 10% premium
  regularOtMultiplier: 1.25, // 125%
  restDayMultiplier: 1.30, // 130%
  specialHolidayMultiplier: 1.30, // 130%
  regularHolidayMultiplier: 2.00, // 200%
  statutoryDeductionTiming: 'SPLIT_EQUAL' // Deduct half each semi-monthly cutoff
};

export const defaultHolidays2026: Holiday[] = [
  { id: 'hol-1', name: "New Year's Day", date: '2026-01-01', type: 'REGULAR', isPaid: true, payMultiplierWorked: 2.0, payMultiplierUnworked: 1.0 },
  { id: 'hol-2', name: 'Maundy Thursday', date: '2026-04-02', type: 'REGULAR', isPaid: true, payMultiplierWorked: 2.0, payMultiplierUnworked: 1.0 },
  { id: 'hol-3', name: 'Good Friday', date: '2026-04-03', type: 'REGULAR', isPaid: true, payMultiplierWorked: 2.0, payMultiplierUnworked: 1.0 },
  { id: 'hol-4', name: 'Araw ng Kagitingan', date: '2026-04-09', type: 'REGULAR', isPaid: true, payMultiplierWorked: 2.0, payMultiplierUnworked: 1.0 },
  { id: 'hol-5', name: 'Labor Day', date: '2026-05-01', type: 'REGULAR', isPaid: true, payMultiplierWorked: 2.0, payMultiplierUnworked: 1.0 },
  { id: 'hol-6', name: 'Independence Day', date: '2026-06-12', type: 'REGULAR', isPaid: true, payMultiplierWorked: 2.0, payMultiplierUnworked: 1.0 },
  { id: 'hol-7', name: 'National Heroes Day', date: '2026-08-31', type: 'REGULAR', isPaid: true, payMultiplierWorked: 2.0, payMultiplierUnworked: 1.0 },
  { id: 'hol-8', name: 'Bonifacio Day', date: '2026-11-30', type: 'REGULAR', isPaid: true, payMultiplierWorked: 2.0, payMultiplierUnworked: 1.0 },
  { id: 'hol-9', name: 'Christmas Day', date: '2026-12-25', type: 'REGULAR', isPaid: true, payMultiplierWorked: 2.0, payMultiplierUnworked: 1.0 },
  { id: 'hol-10', name: 'Rizal Day', date: '2026-12-30', type: 'REGULAR', isPaid: true, payMultiplierWorked: 2.0, payMultiplierUnworked: 1.0 },
  { id: 'hol-11', name: 'Chinese New Year', date: '2026-02-17', type: 'SPECIAL_NON_WORKING', isPaid: false, payMultiplierWorked: 1.30, payMultiplierUnworked: 0 },
  { id: 'hol-12', name: 'EDSA Revolution Anniversary', date: '2026-02-25', type: 'SPECIAL_NON_WORKING', isPaid: false, payMultiplierWorked: 1.30, payMultiplierUnworked: 0 },
  { id: 'hol-13', name: 'Black Saturday', date: '2026-04-04', type: 'SPECIAL_NON_WORKING', isPaid: false, payMultiplierWorked: 1.30, payMultiplierUnworked: 0 },
  { id: 'hol-14', name: 'Ninoy Aquino Day', date: '2026-08-21', type: 'SPECIAL_NON_WORKING', isPaid: false, payMultiplierWorked: 1.30, payMultiplierUnworked: 0 },
  { id: 'hol-15', name: "All Saints' Day", date: '2026-11-01', type: 'SPECIAL_NON_WORKING', isPaid: false, payMultiplierWorked: 1.30, payMultiplierUnworked: 0 },
  { id: 'hol-16', name: 'Feast of the Immaculate Conception', date: '2026-12-08', type: 'SPECIAL_NON_WORKING', isPaid: false, payMultiplierWorked: 1.30, payMultiplierUnworked: 0 },
  { id: 'hol-17', name: 'Last Day of the Year', date: '2026-12-31', type: 'SPECIAL_NON_WORKING', isPaid: false, payMultiplierWorked: 1.30, payMultiplierUnworked: 0 },
];
