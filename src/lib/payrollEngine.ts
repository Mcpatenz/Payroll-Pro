/**
 * Payroll Pro — Philippine Payroll Engine
 * Calculates gross pay, statutory contributions, taxes, loans, and net pay.
 */

import {
  Employee,
  PayrollPeriod,
  PayrollItem,
  AttendanceRecord,
  OvertimeRequest,
  EmployeeLoan,
  PayrollPolicy,
  SSSConfig,
  PhilHealthConfig,
  PagIBIGConfig,
  BIRConfig,
  PayrollAdjustment,
  Department,
  Position
} from '../types';
import {
  calculateRates,
  calculateSSS,
  calculatePhilHealth,
  calculatePagIBIG,
  calculateBIRTax
} from './statutoryEngine';

export interface PayrollCalculationInput {
  period: Omit<PayrollPeriod, 'items' | 'totalEmployees' | 'totalGrossPay' | 'totalDeductions' | 'totalNetPay' | 'totalEmployerLiability' | 'totalWithholdingTax' | 'totalSSSEE' | 'totalSSSER' | 'totalPhilHealthEE' | 'totalPhilHealthER' | 'totalPagIBIGEE' | 'totalPagIBIGER' | 'totalLoans'>;
  employees: Employee[];
  departments: Department[];
  positions: Position[];
  attendances: AttendanceRecord[];
  overtimeRequests: OvertimeRequest[];
  loans: EmployeeLoan[];
  adjustments: PayrollAdjustment[];
  policy: PayrollPolicy;
  sssConfig: SSSConfig;
  philhealthConfig: PhilHealthConfig;
  pagibigConfig: PagIBIGConfig;
  birConfig: BIRConfig;
}

export function computePayroll(input: PayrollCalculationInput): PayrollPeriod {
  const {
    period,
    employees,
    departments,
    positions,
    attendances,
    overtimeRequests,
    loans,
    adjustments,
    policy,
    sssConfig,
    philhealthConfig,
    pagibigConfig,
    birConfig
  } = input;

  const activeEmployees = employees.filter(
    (e) => e.status === 'ACTIVE' || e.status === 'PROBATIONARY'
  );

  const freqDivisor = period.frequency === 'SEMI_MONTHLY' ? 2 : 1;

  const items: PayrollItem[] = activeEmployees.map((emp) => {
    const dept = departments.find((d) => d.id === emp.departmentId);
    const pos = positions.find((p) => p.id === emp.positionId);

    const basicSalary = emp.currentSalary.basicSalary;
    const rates = calculateRates(basicSalary, policy);

    // Period basic pay
    const periodBasicPay = Number((basicSalary / freqDivisor).toFixed(2));

    // Filter employee attendances for this period
    const empAttendances = attendances.filter(
      (a) =>
        a.employeeId === emp.id &&
        a.workDate >= period.cutoffStart &&
        a.workDate <= period.cutoffEnd
    );

    // Filter approved overtime
    const empOvertimes = overtimeRequests.filter(
      (ot) =>
        ot.employeeId === emp.id &&
        ot.status === 'APPROVED' &&
        ot.workDate >= period.cutoffStart &&
        ot.workDate <= period.cutoffEnd
    );

    // Filter active loans
    const empLoans = loans.filter((l) => l.employeeId === emp.id && l.active && l.remainingBalance > 0);

    // Filter adjustments
    const empAdjustments = adjustments.filter(
      (adj) => adj.employeeId === emp.id && (!adj.payrollPeriodId || adj.payrollPeriodId === period.id)
    );

    // Tally attendance metrics
    let totalLateMins = 0;
    let totalUndertimeMins = 0;
    let absentDays = 0;
    let daysWorked = 0;
    let nightDiffMinutes = 0;

    empAttendances.forEach((att) => {
      if (att.status === 'PRESENT' || att.status === 'LATE' || att.status === 'HALF_DAY') {
        daysWorked += att.status === 'HALF_DAY' ? 0.5 : 1;
        // Check grace period for lates
        if (att.lateMinutes > policy.graceMinutes) {
          totalLateMins += att.lateMinutes;
        }
        totalUndertimeMins += att.undertimeMinutes;
        nightDiffMinutes += att.nightDiffMinutes || 0;
      } else if (att.status === 'ABSENT') {
        absentDays += 1;
      }
    });

    // Default standard days if no manual DTR punches were added yet
    if (empAttendances.length === 0) {
      daysWorked = period.frequency === 'SEMI_MONTHLY' ? Math.round(policy.monthlyDivisor / 2) : policy.monthlyDivisor;
    }

    const hoursWorked = Number((daysWorked * policy.workHoursPerDay).toFixed(2));

    // DTR Deductions
    const lateDeduction = Number((totalLateMins * rates.minuteRate).toFixed(2));
    const undertimeDeduction = Number((totalUndertimeMins * rates.minuteRate).toFixed(2));
    const absentDeduction = Number((absentDays * rates.dailyRate).toFixed(2));

    // Overtime Calculations
    let regularOtHours = 0;
    let restDayOtHours = 0;
    let holidayOtHours = 0;

    empOvertimes.forEach((ot) => {
      if (ot.otType === 'REGULAR_DAY') {
        regularOtHours += ot.hours;
      } else if (ot.otType === 'REST_DAY') {
        restDayOtHours += ot.hours;
      } else {
        holidayOtHours += ot.hours;
      }
    });

    const regularOtPay = Number(
      (regularOtHours * rates.hourlyRate * policy.regularOtMultiplier).toFixed(2)
    );
    const restDayOtPay = Number(
      (restDayOtHours * rates.hourlyRate * policy.restDayMultiplier).toFixed(2)
    );
    const holidayOtPay = Number(
      (holidayOtHours * rates.hourlyRate * policy.regularHolidayMultiplier).toFixed(2)
    );

    // Night differential
    const nightDiffHours = Number((nightDiffMinutes / 60).toFixed(2));
    const nightDiffPay = Number(
      (nightDiffHours * rates.hourlyRate * policy.nightDiffRate).toFixed(2)
    );

    // Allowances
    const allowanceTaxable = Number(
      ((emp.currentSalary.allowanceTaxable || 0) / freqDivisor).toFixed(2)
    );
    const allowanceNonTaxable = Number(
      ((emp.currentSalary.allowanceNonTaxable || 0) / freqDivisor).toFixed(2)
    );

    // Adjustments & Bonuses
    let bonus = 0;
    let adjustmentsEarning = 0;
    let adjustmentsDeduction = 0;

    empAdjustments.forEach((adj) => {
      if (adj.type === 'BONUS') {
        bonus += adj.amount;
      } else if (adj.type === 'ADDITION' || adj.type === 'REIMBURSEMENT') {
        adjustmentsEarning += adj.amount;
      } else if (adj.type === 'DEDUCTION' || adj.type === 'ADVANCE') {
        adjustmentsDeduction += adj.amount;
      }
    });

    // Gross Pay
    const grossPay = Number(
      Math.max(
        0,
        periodBasicPay -
          absentDeduction -
          lateDeduction -
          undertimeDeduction +
          regularOtPay +
          restDayOtPay +
          holidayOtPay +
          nightDiffPay +
          allowanceTaxable +
          allowanceNonTaxable +
          bonus +
          adjustmentsEarning
      ).toFixed(2)
    );

    // Statutory Calculations (Full Monthly computed, then split if semi-monthly)
    const sssFull = calculateSSS(basicSalary, sssConfig);
    const philhealthFull = calculatePhilHealth(basicSalary, philhealthConfig);
    const pagibigFull = calculatePagIBIG(basicSalary, pagibigConfig);

    const statFactor = period.frequency === 'SEMI_MONTHLY' && policy.statutoryDeductionTiming === 'SPLIT_EQUAL' ? 2 : 1;

    const sssEE = Number((sssFull.employeeShare / statFactor).toFixed(2));
    const sssMpfEE = Number((sssFull.mpfEmployee / statFactor).toFixed(2));
    const philhealthEE = Number((philhealthFull.employeeShare / statFactor).toFixed(2));
    const pagibigEE = Number((pagibigFull.employeeShare / statFactor).toFixed(2));

    const totalStatutoryEE = Number((sssEE + sssMpfEE + philhealthEE + pagibigEE).toFixed(2));

    // Employer shares
    const sssER = Number((sssFull.employerShare / statFactor).toFixed(2));
    const sssEcER = Number((sssFull.ecContribution / statFactor).toFixed(2));
    const sssMpfER = Number((sssFull.mpfEmployer / statFactor).toFixed(2));
    const philhealthER = Number((philhealthFull.employerShare / statFactor).toFixed(2));
    const pagibigER = Number((pagibigFull.employerShare / statFactor).toFixed(2));

    const totalEmployerCost = Number(
      (sssER + sssEcER + sssMpfER + philhealthER + pagibigER).toFixed(2)
    );

    // Taxable Income computation
    // Taxable = Gross Pay - Non-Taxable Allowances - Statutory Employee Share
    const taxableIncome = Number(
      Math.max(0, grossPay - allowanceNonTaxable - totalStatutoryEE).toFixed(2)
    );

    // Withholding Tax
    const taxResult = calculateBIRTax(taxableIncome, period.frequency, birConfig);
    const withholdingTax = taxResult.totalTax;

    // Loan Deductions
    let loanDeduction = 0;
    const loanDetails: { loanType: any; amount: number }[] = [];

    empLoans.forEach((loan) => {
      const deductionAmount =
        period.frequency === 'SEMI_MONTHLY'
          ? Math.min(loan.semiMonthlyAmortization, loan.remainingBalance)
          : Math.min(loan.monthlyAmortization, loan.remainingBalance);

      loanDeduction += deductionAmount;
      loanDetails.push({ loanType: loan.type, amount: deductionAmount });
    });
    loanDeduction = Number(loanDeduction.toFixed(2));

    const otherDeductions = Number(adjustmentsDeduction.toFixed(2));

    // Total deductions
    const totalDeductions = Number(
      (totalStatutoryEE + withholdingTax + loanDeduction + otherDeductions).toFixed(2)
    );

    // Net Pay
    const netPay = Number(Math.max(0, grossPay - totalDeductions).toFixed(2));

    return {
      id: `item-${period.id}-${emp.id}`,
      payrollId: period.id,
      employeeId: emp.id,
      employeeNumber: emp.employeeNumber,
      employeeName: `${emp.lastName}, ${emp.firstName} ${emp.middleName ? emp.middleName[0] + '.' : ''}`,
      departmentName: dept?.name || 'General',
      positionName: pos?.name || 'Staff',
      bankName: emp.bankName,
      bankAccountNumber: emp.bankAccountNumber,
      status: period.status === 'PAID' || period.status === 'POSTED' ? 'PROCESSED' : period.status === 'APPROVED' ? 'APPROVED' : 'PENDING',
      approvedBy: period.approvedBy || (period.status === 'APPROVED' || period.status === 'PAID' || period.status === 'POSTED' ? 'Maria Elena V. Santos' : undefined),
      approvedAt: period.approvedAt || (period.status === 'APPROVED' || period.status === 'PAID' || period.status === 'POSTED' ? '2026-10-02 14:00' : undefined),

      salaryType: emp.currentSalary.salaryType,
      basicSalary,
      periodBasicPay,
      daysWorked,
      hoursWorked,

      lateMinutes: totalLateMins,
      lateDeduction,
      undertimeMinutes: totalUndertimeMins,
      undertimeDeduction,
      absentDays,
      absentDeduction,

      regularOtHours,
      regularOtPay,
      restDayOtHours,
      restDayOtPay,
      holidayOtHours,
      holidayOtPay,
      nightDiffHours,
      nightDiffPay,
      allowanceTaxable,
      allowanceNonTaxable,
      bonus,
      adjustmentsEarning,
      grossPay,

      sssEE,
      sssMpfEE,
      philhealthEE,
      pagibigEE,
      totalStatutoryEE,

      taxableIncome,
      withholdingTax,

      loanDeduction,
      loanDetails,
      otherDeductions,
      totalDeductions,

      netPay,

      sssER,
      sssEcER,
      sssMpfER,
      philhealthER,
      pagibigER,
      totalEmployerCost
    };
  });

  // Calculate aggregates
  const totalEmployees = items.length;
  const totalGrossPay = Number(items.reduce((sum, item) => sum + item.grossPay, 0).toFixed(2));
  const totalDeductions = Number(items.reduce((sum, item) => sum + item.totalDeductions, 0).toFixed(2));
  const totalNetPay = Number(items.reduce((sum, item) => sum + item.netPay, 0).toFixed(2));
  const totalEmployerLiability = Number(
    items.reduce((sum, item) => sum + item.totalEmployerCost, 0).toFixed(2)
  );
  const totalWithholdingTax = Number(
    items.reduce((sum, item) => sum + item.withholdingTax, 0).toFixed(2)
  );
  const totalSSSEE = Number(
    items.reduce((sum, item) => sum + item.sssEE + item.sssMpfEE, 0).toFixed(2)
  );
  const totalSSSER = Number(
    items.reduce((sum, item) => sum + item.sssER + item.sssEcER + item.sssMpfER, 0).toFixed(2)
  );
  const totalPhilHealthEE = Number(
    items.reduce((sum, item) => sum + item.philhealthEE, 0).toFixed(2)
  );
  const totalPhilHealthER = Number(
    items.reduce((sum, item) => sum + item.philhealthER, 0).toFixed(2)
  );
  const totalPagIBIGEE = Number(
    items.reduce((sum, item) => sum + item.pagibigEE, 0).toFixed(2)
  );
  const totalPagIBIGER = Number(
    items.reduce((sum, item) => sum + item.pagibigER, 0).toFixed(2)
  );
  const totalLoans = Number(items.reduce((sum, item) => sum + item.loanDeduction, 0).toFixed(2));

  return {
    ...period,
    totalEmployees,
    totalGrossPay,
    totalDeductions,
    totalNetPay,
    totalEmployerLiability,
    totalWithholdingTax,
    totalSSSEE,
    totalSSSER,
    totalPhilHealthEE,
    totalPhilHealthER,
    totalPagIBIGEE,
    totalPagIBIGER,
    totalLoans,
    items
  };
}
