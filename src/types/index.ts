/**
 * Payroll Pro — Philippine HR & Payroll Management System
 * Core Domain Types and Interfaces
 */

export type UserRole =
  | 'OWNER'
  | 'SUPER_ADMIN'
  | 'HR_ADMIN'
  | 'PAYROLL_ADMIN'
  | 'MANAGER'
  | 'SUPERVISOR'
  | 'EMPLOYEE'
  | 'AUDITOR';

export type EmploymentStatus =
  | 'ACTIVE'
  | 'INACTIVE'
  | 'PROBATIONARY'
  | 'TERMINATED'
  | 'RESIGNED'
  | 'RETIRED';

export type EmploymentType =
  | 'REGULAR'
  | 'PROBATIONARY'
  | 'CONTRACTUAL'
  | 'PART_TIME'
  | 'PROJECT_BASED'
  | 'SEASONAL'
  | 'INTERN';

export type PayFrequency =
  | 'MONTHLY'
  | 'SEMI_MONTHLY'
  | 'WEEKLY'
  | 'BI_WEEKLY';

export type PayrollStatus =
  | 'DRAFT'
  | 'PROCESSING'
  | 'FOR_REVIEW'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'POSTED'
  | 'PAID'
  | 'CANCELLED';

export type AttendanceStatus =
  | 'PRESENT'
  | 'ABSENT'
  | 'LATE'
  | 'ON_LEAVE'
  | 'REST_DAY'
  | 'HOLIDAY'
  | 'HALF_DAY';

export type PayrollRecordStatus = 'PENDING' | 'APPROVED' | 'PROCESSED';

export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export type LeaveType =
  | 'VACATION'
  | 'SICK'
  | 'EMERGENCY'
  | 'MATERNITY'
  | 'PATERNITY'
  | 'SERVICE_INCENTIVE'
  | 'BEREAVEMENT'
  | 'SOLO_PARENT'
  | 'OTHER';

export type HolidayType = 'REGULAR' | 'SPECIAL_NON_WORKING' | 'COMPANY' | 'LOCAL';

export type LoanType =
  | 'SSS_SALARY_LOAN'
  | 'SSS_CALAMITY_LOAN'
  | 'PAGIBIG_MULTI_PURPOSE'
  | 'PAGIBIG_CALAMITY'
  | 'COMPANY_CASH_ADVANCE'
  | 'EMERGENCY_LOAN';

export interface Company {
  id: string;
  name: string;
  tradeName?: string;
  registrationNumber: string;
  tin: string;
  sssNumber: string;
  philhealthNumber: string;
  pagibigNumber: string;
  rdoCode: string;
  address: string;
  city: string;
  province: string;
  zipCode: string;
  phone: string;
  email: string;
  website?: string;
  authorizedSignatory: string;
  signatoryTitle: string;
}

export interface Branch {
  id: string;
  code: string;
  name: string;
  address: string;
  managerName?: string;
  status: boolean;
}

export interface Department {
  id: string;
  code: string;
  name: string;
  managerId?: string;
  managerName?: string;
  managerEmail?: string;
}

export interface DepartmentPayrollNotification {
  id: string;
  departmentId: string;
  departmentName: string;
  recipientName: string;
  recipientEmail: string;
  periodId: string;
  periodCode: string;
  dispatchedAt: string;
  subject: string;
  employeeCount: number;
  totalGrossPay: number;
  totalStatutoryDeductions: number;
  totalNetPay: number;
  payDate: string;
  status: 'SENT' | 'DELIVERED';
}

export interface Position {
  id: string;
  name: string;
  departmentId: string;
  jobGrade?: string;
  baseSalaryMin?: number;
  baseSalaryMax?: number;
}

export interface SalaryHistory {
  id: string;
  employeeId: string;
  salaryType: 'MONTHLY' | 'DAILY' | 'HOURLY';
  basicSalary: number;
  dailyRate: number;
  hourlyRate: number;
  allowanceTaxable: number;
  allowanceNonTaxable: number;
  effectiveFrom: string;
  effectiveTo?: string;
  remarks?: string;
}

export interface LeaveBalance {
  vacationLeaveTotal: number;
  vacationLeaveUsed: number;
  sickLeaveTotal: number;
  sickLeaveUsed: number;
  serviceIncentiveTotal: number;
  serviceIncentiveUsed: number;
  emergencyLeaveTotal: number;
  emergencyLeaveUsed: number;
}

export interface Employee {
  id: string;
  employeeNumber: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  suffix?: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  birthDate: string;
  civilStatus: 'SINGLE' | 'MARRIED' | 'WIDOWED' | 'LEGALLY_SEPARATED';
  email: string;
  mobile: string;
  address: string;

  // Organization
  branchId: string;
  departmentId: string;
  positionId: string;
  supervisorId?: string;
  employmentType: EmploymentType;
  status: EmploymentStatus;
  dateHired: string;
  regularizationDate?: string;
  terminationDate?: string;

  // Statutory IDs
  tin: string;
  sssNumber: string;
  philhealthNumber: string;
  pagibigNumber: string;

  // Bank Info
  bankName: string;
  bankAccountNumber: string;

  // Compensation
  currentSalary: SalaryHistory;
  leaveBalance: LeaveBalance;

  // Emergency contact
  emergencyContactName: string;
  emergencyContactRelation: string;
  emergencyContactPhone: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  workDate: string; // YYYY-MM-DD
  timeIn?: string; // HH:mm
  breakOut?: string;
  breakIn?: string;
  timeOut?: string;
  scheduledIn: string; // e.g., '08:00'
  scheduledOut: string; // e.g., '17:00'
  workedMinutes: number;
  lateMinutes: number;
  undertimeMinutes: number;
  overtimeMinutes: number;
  nightDiffMinutes: number;
  status: AttendanceStatus;
  isHoliday: boolean;
  holidayType?: HolidayType;
  remarks?: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: LeaveStatus;
  requestedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

export interface OvertimeRequest {
  id: string;
  employeeId: string;
  workDate: string;
  startTime: string;
  endTime: string;
  hours: number;
  otType: 'REGULAR_DAY' | 'REST_DAY' | 'SPECIAL_HOLIDAY' | 'REGULAR_HOLIDAY';
  reason: string;
  approved: boolean;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestedAt: string;
  approvedBy?: string;
  approvedAt?: string;
}

export interface EmployeeLoan {
  id: string;
  employeeId: string;
  type: LoanType;
  referenceNumber: string;
  principal: number;
  interestRate: number; // percentage, e.g. 5
  totalAmount: number;
  termMonths: number;
  monthlyAmortization: number;
  semiMonthlyAmortization: number;
  remainingBalance: number;
  startDate: string;
  endDate: string;
  active: boolean;
  deductionsHistory?: {
    payrollPeriodId: string;
    date: string;
    amount: number;
  }[];
}

export interface Holiday {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
  type: HolidayType;
  isPaid: boolean;
  payMultiplierWorked: number; // e.g., 2.0 for Regular, 1.3 for Special
  payMultiplierUnworked: number; // e.g., 1.0 for Regular, 0 for Special
}

export interface PayrollPolicy {
  monthlyDivisor: number; // e.g. 26 (default), 261, 313, or 365
  workHoursPerDay: number; // standard 8
  graceMinutes: number; // e.g. 15
  overtimeEnabled: boolean;
  nightDiffStartTime: string; // '22:00'
  nightDiffEndTime: string; // '06:00'
  nightDiffRate: number; // 0.10 (10%)
  regularOtMultiplier: number; // 1.25
  restDayMultiplier: number; // 1.30
  specialHolidayMultiplier: number; // 1.30
  regularHolidayMultiplier: number; // 2.00
  statutoryDeductionTiming: 'SPLIT_EQUAL' | 'FIRST_CUTOFF_ONLY' | 'SECOND_CUTOFF_ONLY';
}

// Statutory Rules Config
export interface SSSBracket {
  minSalary: number;
  maxSalary: number;
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

export interface SSSConfig {
  effectiveFrom: string;
  effectiveTo?: string;
  ssRateEmployee: number; // 0.05
  ssRateEmployer: number; // 0.10
  maxMsc: number; // 35,000
  minMsc: number; // 5,000
  brackets: SSSBracket[];
}

export interface PhilHealthConfig {
  effectiveFrom: string;
  effectiveTo?: string;
  rate: number; // 0.05 (5%)
  floor: number; // 10,000
  ceiling: number; // 100,000
  employeeSplit: number; // 0.50
  employerSplit: number; // 0.50
}

export interface PagIBIGConfig {
  effectiveFrom: string;
  effectiveTo?: string;
  thresholdSalary: number; // 1,500
  rateBelowThreshold: number; // 0.01 (1%)
  rateAboveThreshold: number; // 0.02 (2%)
  employerRate: number; // 0.02 (2%)
  maxCompensationBase: number; // 5,000 or 10,000
}

export interface BIRBracket {
  frequency: PayFrequency;
  minIncome: number;
  maxIncome: number; // 99999999 for top bracket
  baseTax: number;
  excessRate: number; // e.g. 0.15, 0.20, 0.25, 0.30, 0.35
}

export interface BIRConfig {
  effectiveFrom: string;
  bracketsSemiMonthly: BIRBracket[];
  bracketsMonthly: BIRBracket[];
}

export interface PayrollItem {
  id: string;
  payrollId: string;
  employeeId: string;
  employeeNumber: string;
  employeeName: string;
  departmentName: string;
  positionName: string;
  bankName: string;
  bankAccountNumber: string;
  status?: PayrollRecordStatus;
  approvedBy?: string;
  approvedAt?: string;

  // Base
  salaryType: 'MONTHLY' | 'DAILY' | 'HOURLY';
  basicSalary: number;
  periodBasicPay: number;
  daysWorked: number;
  hoursWorked: number;

  // DTR deductions
  lateMinutes: number;
  lateDeduction: number;
  undertimeMinutes: number;
  undertimeDeduction: number;
  absentDays: number;
  absentDeduction: number;

  // Earnings
  regularOtHours: number;
  regularOtPay: number;
  restDayOtHours: number;
  restDayOtPay: number;
  holidayOtHours: number;
  holidayOtPay: number;
  nightDiffHours: number;
  nightDiffPay: number;
  allowanceTaxable: number;
  allowanceNonTaxable: number;
  bonus: number;
  adjustmentsEarning: number;
  grossPay: number;

  // Statutory Deductions (Employee Share)
  sssEE: number;
  sssMpfEE: number;
  philhealthEE: number;
  pagibigEE: number;
  totalStatutoryEE: number;

  // Taxes
  taxableIncome: number;
  withholdingTax: number;

  // Non-statutory deductions
  loanDeduction: number;
  loanDetails?: { loanType: LoanType; amount: number }[];
  otherDeductions: number;
  totalDeductions: number;

  // Net Pay
  netPay: number;

  // Employer Liabilities
  sssER: number;
  sssEcER: number;
  sssMpfER: number;
  philhealthER: number;
  pagibigER: number;
  totalEmployerCost: number;
}

export interface PayrollPeriod {
  id: string;
  periodCode: string; // e.g. '2026-10-A'
  frequency: PayFrequency;
  cutoffStart: string; // YYYY-MM-DD
  cutoffEnd: string;
  payDate: string;
  status: PayrollStatus;
  preparedBy: string;
  preparedAt?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  postedBy?: string;
  postedAt?: string;
  paidAt?: string;

  // Aggregated totals
  totalEmployees: number;
  totalGrossPay: number;
  totalDeductions: number;
  totalNetPay: number;
  totalEmployerLiability: number;
  totalWithholdingTax: number;
  totalSSSEE: number;
  totalSSSER: number;
  totalPhilHealthEE: number;
  totalPhilHealthER: number;
  totalPagIBIGEE: number;
  totalPagIBIGER: number;
  totalLoans: number;

  items: PayrollItem[];
}

export interface PayrollAdjustment {
  id: string;
  employeeId: string;
  payrollPeriodId?: string;
  type: 'ADDITION' | 'DEDUCTION' | 'CORRECTION' | 'REIMBURSEMENT' | 'BONUS' | 'ADVANCE';
  amount: number;
  reason: string;
  isTaxable: boolean;
  createdAt: string;
  createdBy: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userName: string;
  userRole: UserRole;
  action: string;
  module: string;
  entity: string;
  entityId: string;
  description: string;
  oldValue?: string;
  newValue?: string;
  ipAddress: string;
}
