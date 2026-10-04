/**
 * Payroll Pro — Central Application State & Data Provider
 * React Context with persistence & audit logging
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Company,
  Branch,
  Department,
  Position,
  Employee,
  AttendanceRecord,
  OvertimeRequest,
  LeaveRequest,
  EmployeeLoan,
  PayrollAdjustment,
  PayrollPeriod,
  UserRole,
  SSSConfig,
  PhilHealthConfig,
  PagIBIGConfig,
  BIRConfig,
  PayrollPolicy,
  Holiday,
  AuditLog,
  PayFrequency,
  PayrollRecordStatus,
  DepartmentPayrollNotification
} from '../types';
import {
  mockCompany,
  mockBranches,
  mockDepartments,
  mockPositions,
  mockEmployees,
  mockLoans,
  mockOvertimeRequests,
  mockLeaveRequests,
  mockAttendanceRecords,
  mockAdjustments,
  mockAuditLogs
} from '../data/mockData';
import {
  defaultSSSConfig,
  defaultPhilHealthConfig,
  defaultPagIBIGConfig,
  defaultBIRConfig,
  defaultPayrollPolicy,
  defaultHolidays2026
} from '../lib/statutoryTables';
import { computePayroll } from '../lib/payrollEngine';

interface PayrollContextType {
  // Master data
  company: Company;
  branches: Branch[];
  departments: Department[];
  positions: Position[];
  employees: Employee[];
  loans: EmployeeLoan[];
  overtimeRequests: OvertimeRequest[];
  leaveRequests: LeaveRequest[];
  attendances: AttendanceRecord[];
  adjustments: PayrollAdjustment[];
  payrollPeriods: PayrollPeriod[];
  activePeriodId: string;
  auditLogs: AuditLog[];
  emailNotifications: DepartmentPayrollNotification[];

  // Statutory & Policies
  sssConfig: SSSConfig;
  philhealthConfig: PhilHealthConfig;
  pagibigConfig: PagIBIGConfig;
  birConfig: BIRConfig;
  payrollPolicy: PayrollPolicy;
  holidays: Holiday[];

  // RBAC & Persona Switcher
  currentRole: UserRole;
  currentUserId: string;
  currentUserName: string;
  currentEmployeeId: string; // Used for ESS Employee Self-Service
  setCurrentRole: (role: UserRole) => void;
  setCurrentEmployeeId: (id: string) => void;
  setActivePeriodId: (id: string) => void;

  // Actions
  addEmployee: (employee: Omit<Employee, 'id'>) => void;
  updateEmployee: (id: string, updates: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;

  recordAttendancePunch: (employeeId: string, punchType: 'IN' | 'OUT') => void;
  batchImportAttendance: (records: AttendanceRecord[]) => void;

  submitLeaveRequest: (data: Omit<LeaveRequest, 'id' | 'requestedAt' | 'status'>) => void;
  approveLeaveRequest: (id: string) => void;
  rejectLeaveRequest: (id: string, reason: string) => void;

  submitOvertimeRequest: (data: Omit<OvertimeRequest, 'id' | 'requestedAt' | 'status' | 'approved'>) => void;
  approveOvertimeRequest: (id: string) => void;
  rejectOvertimeRequest: (id: string) => void;

  addLoan: (loan: Omit<EmployeeLoan, 'id'>) => void;
  updateLoan: (id: string, updates: Partial<EmployeeLoan>) => void;

  createPayrollPeriod: (params: {
    cutoffStart: string;
    cutoffEnd: string;
    payDate: string;
    frequency: PayFrequency;
    periodCode: string;
  }) => PayrollPeriod;
  recalculatePayroll: (periodId: string) => void;
  submitPayrollForReview: (periodId: string) => void;
  approvePayroll: (periodId: string) => void;
  postPayroll: (periodId: string) => void;
  markPayrollPaid: (periodId: string) => void;
  updatePayrollItemsStatus: (periodId: string, itemIds: string[], newStatus: PayrollRecordStatus) => void;
  dispatchDepartmentNotifications: (periodId: string, departmentNames?: string[]) => DepartmentPayrollNotification[];

  updateSSSConfig: (config: SSSConfig) => void;
  updatePhilHealthConfig: (config: PhilHealthConfig) => void;
  updatePagIBIGConfig: (config: PagIBIGConfig) => void;
  updateBIRConfig: (config: BIRConfig) => void;
  updatePayrollPolicy: (policy: PayrollPolicy) => void;
  updateCompany: (company: Company) => void;
  addHoliday: (holiday: Holiday) => void;
  deleteHoliday: (id: string) => void;

  resetToDefaults: () => void;
}

const PayrollContext = createContext<PayrollContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'payroll_pro_v1_store';

export const PayrollProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Role & Persona State
  const [currentRole, setCurrentRole] = useState<UserRole>('PAYROLL_ADMIN');
  const [currentEmployeeId, setCurrentEmployeeId] = useState<string>('emp-001');

  // Master Data State
  const [company, setCompany] = useState<Company>(mockCompany);
  const [branches] = useState<Branch[]>(mockBranches);
  const [departments] = useState<Department[]>(mockDepartments);
  const [positions] = useState<Position[]>(mockPositions);
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [loans, setLoans] = useState<EmployeeLoan[]>(mockLoans);
  const [overtimeRequests, setOvertimeRequests] = useState<OvertimeRequest[]>(mockOvertimeRequests);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(mockLeaveRequests);
  const [attendances, setAttendances] = useState<AttendanceRecord[]>(mockAttendanceRecords);
  const [adjustments, setAdjustments] = useState<PayrollAdjustment[]>(mockAdjustments);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(mockAuditLogs);
  const [emailNotifications, setEmailNotifications] = useState<DepartmentPayrollNotification[]>([
    {
      id: 'notif-past-01',
      departmentId: 'dept-eng',
      departmentName: 'Engineering & Technology',
      recipientName: 'Alex M. Santos',
      recipientEmail: 'alex.santos@acrovatech.ph',
      periodId: 'pay-2026-09-B',
      periodCode: '2026-09-B',
      dispatchedAt: '2026-10-05 09:05:12',
      subject: '[CONFIDENTIAL] Payroll Summary Report: Engineering & Technology - Period 2026-09-B Processed',
      employeeCount: 4,
      totalGrossPay: 215000,
      totalStatutoryDeductions: 17200,
      totalNetPay: 178500,
      payDate: '2026-10-05',
      status: 'DELIVERED'
    },
    {
      id: 'notif-past-02',
      departmentId: 'dept-prod',
      departmentName: 'Product & UX Design',
      recipientName: 'Patricia Anne Aquino',
      recipientEmail: 'patricia.aquino@acrovatech.ph',
      periodId: 'pay-2026-09-B',
      periodCode: '2026-09-B',
      dispatchedAt: '2026-10-05 09:05:18',
      subject: '[CONFIDENTIAL] Payroll Summary Report: Product & UX Design - Period 2026-09-B Processed',
      employeeCount: 2,
      totalGrossPay: 135000,
      totalStatutoryDeductions: 10800,
      totalNetPay: 112200,
      payDate: '2026-10-05',
      status: 'DELIVERED'
    }
  ]);

  // Statutory & Configs
  const [sssConfig, setSssConfig] = useState<SSSConfig>(defaultSSSConfig);
  const [philhealthConfig, setPhilhealthConfig] = useState<PhilHealthConfig>(defaultPhilHealthConfig);
  const [pagibigConfig, setPagibigConfig] = useState<PagIBIGConfig>(defaultPagIBIGConfig);
  const [birConfig, setBirConfig] = useState<BIRConfig>(defaultBIRConfig);
  const [payrollPolicy, setPayrollPolicy] = useState<PayrollPolicy>(defaultPayrollPolicy);
  const [holidays, setHolidays] = useState<Holiday[]>(defaultHolidays2026);

  // Initial computed payroll period
  const initialPeriodInput = {
    period: {
      id: 'pay-2026-10-A',
      periodCode: '2026-10-A',
      frequency: 'SEMI_MONTHLY' as PayFrequency,
      cutoffStart: '2026-10-01',
      cutoffEnd: '2026-10-15',
      payDate: '2026-10-20',
      status: 'FOR_REVIEW' as const,
      preparedBy: 'Juan Dela Cruz (Payroll Admin)',
      preparedAt: '2026-10-03 09:50'
    },
    employees: mockEmployees,
    departments: mockDepartments,
    positions: mockPositions,
    attendances: mockAttendanceRecords,
    overtimeRequests: mockOvertimeRequests,
    loans: mockLoans,
    adjustments: mockAdjustments,
    policy: defaultPayrollPolicy,
    sssConfig: defaultSSSConfig,
    philhealthConfig: defaultPhilHealthConfig,
    pagibigConfig: defaultPagIBIGConfig,
    birConfig: defaultBIRConfig
  };

  const initialComputedPeriod = computePayroll(initialPeriodInput);

  // Completed past period for historical comparison
  const pastPeriodInput = {
    period: {
      id: 'pay-2026-09-B',
      periodCode: '2026-09-B',
      frequency: 'SEMI_MONTHLY' as PayFrequency,
      cutoffStart: '2026-09-16',
      cutoffEnd: '2026-09-30',
      payDate: '2026-10-05',
      status: 'PAID' as const,
      preparedBy: 'Juan Dela Cruz',
      preparedAt: '2026-09-30 18:00',
      reviewedBy: 'Maria Cristina Reyes',
      reviewedAt: '2026-10-01 10:15',
      approvedBy: 'Maria Elena Santos',
      approvedAt: '2026-10-02 14:00',
      postedBy: 'Eduardo M. Rivera',
      postedAt: '2026-10-03 08:30',
      paidAt: '2026-10-05 09:00'
    },
    employees: mockEmployees,
    departments: mockDepartments,
    positions: mockPositions,
    attendances: [],
    overtimeRequests: [],
    loans: mockLoans,
    adjustments: [],
    policy: defaultPayrollPolicy,
    sssConfig: defaultSSSConfig,
    philhealthConfig: defaultPhilHealthConfig,
    pagibigConfig: defaultPagIBIGConfig,
    birConfig: defaultBIRConfig
  };

  const pastComputedPeriod = computePayroll(pastPeriodInput);

  const [payrollPeriods, setPayrollPeriods] = useState<PayrollPeriod[]>([
    initialComputedPeriod,
    pastComputedPeriod
  ]);
  const [activePeriodId, setActivePeriodId] = useState<string>('pay-2026-10-A');

  // Derive current user name by role
  const currentUserName =
    currentRole === 'OWNER'
      ? 'Eduardo M. Rivera (Company President)'
      : currentRole === 'SUPER_ADMIN'
      ? 'System Administrator'
      : currentRole === 'HR_ADMIN'
      ? 'Maria Cristina Reyes (HR Manager)'
      : currentRole === 'PAYROLL_ADMIN'
      ? 'Aileen Mae Gomez (Payroll Specialist)'
      : currentRole === 'MANAGER'
      ? 'Christian Paul Castillo (Sales Director)'
      : currentRole === 'SUPERVISOR'
      ? 'Joshua Gabriel Mercado (Tech Lead)'
      : currentRole === 'AUDITOR'
      ? 'External Statutory Auditor'
      : employees.find((e) => e.id === currentEmployeeId)
      ? `${employees.find((e) => e.id === currentEmployeeId)!.firstName} ${employees.find((e) => e.id === currentEmployeeId)!.lastName}`
      : 'Juan Dela Cruz';

  const logAudit = (
    action: string,
    module: string,
    entity: string,
    entityId: string,
    description: string,
    oldValue?: string,
    newValue?: string
  ) => {
    const newEntry: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      userName: currentUserName,
      userRole: currentRole,
      action,
      module,
      entity,
      entityId,
      description,
      oldValue,
      newValue,
      ipAddress: '192.168.1.100'
    };
    setAuditLogs((prev) => [newEntry, ...prev]);
  };

  // Employee CRUD
  const addEmployee = (data: Omit<Employee, 'id'>) => {
    const id = `emp-${Date.now()}`;
    const newEmp: Employee = { ...data, id };
    setEmployees((prev) => [newEmp, ...prev]);
    logAudit(
      'CREATE_EMPLOYEE',
      'EMPLOYEE',
      'Employee',
      id,
      `Added new employee: ${newEmp.lastName}, ${newEmp.firstName} (${newEmp.employeeNumber})`
    );
  };

  const updateEmployee = (id: string, updates: Partial<Employee>) => {
    setEmployees((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates } : e))
    );
    logAudit('UPDATE_EMPLOYEE', 'EMPLOYEE', 'Employee', id, `Updated profile fields for employee ID ${id}`);
  };

  const deleteEmployee = (id: string) => {
    const target = employees.find((e) => e.id === id);
    setEmployees((prev) => prev.filter((e) => e.id !== id));
    logAudit(
      'DELETE_EMPLOYEE',
      'EMPLOYEE',
      'Employee',
      id,
      `Removed employee record ${target?.employeeNumber || id}`
    );
  };

  // Attendance Punch
  const recordAttendancePunch = (employeeId: string, punchType: 'IN' | 'OUT') => {
    const today = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toTimeString().substring(0, 5); // HH:mm

    setAttendances((prev) => {
      const existing = prev.find((a) => a.employeeId === employeeId && a.workDate === today);
      if (existing) {
        if (punchType === 'OUT') {
          return prev.map((a) =>
            a.id === existing.id
              ? {
                  ...a,
                  timeOut: nowTime,
                  workedMinutes: 480
                }
              : a
          );
        }
        return prev;
      } else {
        const newRecord: AttendanceRecord = {
          id: `att-${Date.now()}`,
          employeeId,
          workDate: today,
          timeIn: nowTime,
          scheduledIn: '08:00',
          scheduledOut: '17:00',
          workedMinutes: 480,
          lateMinutes: 0,
          undertimeMinutes: 0,
          overtimeMinutes: 0,
          nightDiffMinutes: 0,
          status: 'PRESENT',
          isHoliday: false
        };
        return [newRecord, ...prev];
      }
    });

    logAudit('ATTENDANCE_PUNCH', 'ATTENDANCE', 'AttendanceRecord', employeeId, `Recorded biometric clock ${punchType} for employee`);
  };

  const batchImportAttendance = (records: AttendanceRecord[]) => {
    setAttendances((prev) => [...records, ...prev]);
    logAudit(
      'BATCH_IMPORT_ATTENDANCE',
      'ATTENDANCE',
      'AttendanceRecord',
      `batch-${Date.now()}`,
      `Imported ${records.length} DTR records from CSV`
    );
  };

  // Leave Actions
  const submitLeaveRequest = (data: Omit<LeaveRequest, 'id' | 'requestedAt' | 'status'>) => {
    const newLeave: LeaveRequest = {
      ...data,
      id: `lv-${Date.now()}`,
      status: 'PENDING',
      requestedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    setLeaveRequests((prev) => [newLeave, ...prev]);
    logAudit('SUBMIT_LEAVE', 'LEAVE', 'LeaveRequest', newLeave.id, `Submitted ${newLeave.leaveType} leave request for ${newLeave.days} day(s)`);
  };

  const approveLeaveRequest = (id: string) => {
    setLeaveRequests((prev) =>
      prev.map((l) =>
        l.id === id
          ? {
              ...l,
              status: 'APPROVED',
              reviewedBy: currentUserName,
              reviewedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
            }
          : l
      )
    );
    logAudit('APPROVE_LEAVE', 'LEAVE', 'LeaveRequest', id, `Approved leave request by ${currentUserName}`);
  };

  const rejectLeaveRequest = (id: string, reason: string) => {
    setLeaveRequests((prev) =>
      prev.map((l) =>
        l.id === id
          ? {
              ...l,
              status: 'REJECTED',
              reviewedBy: currentUserName,
              reviewedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
              rejectionReason: reason
            }
          : l
      )
    );
    logAudit('REJECT_LEAVE', 'LEAVE', 'LeaveRequest', id, `Rejected leave request: ${reason}`);
  };

  // Overtime Actions
  const submitOvertimeRequest = (
    data: Omit<OvertimeRequest, 'id' | 'requestedAt' | 'status' | 'approved'>
  ) => {
    const newOt: OvertimeRequest = {
      ...data,
      id: `ot-${Date.now()}`,
      status: 'PENDING',
      approved: false,
      requestedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    setOvertimeRequests((prev) => [newOt, ...prev]);
    logAudit('SUBMIT_OVERTIME', 'OVERTIME', 'OvertimeRequest', newOt.id, `Requested ${newOt.hours}h overtime on ${newOt.workDate}`);
  };

  const approveOvertimeRequest = (id: string) => {
    setOvertimeRequests((prev) =>
      prev.map((ot) =>
        ot.id === id
          ? {
              ...ot,
              status: 'APPROVED',
              approved: true,
              approvedBy: currentUserName,
              approvedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
            }
          : ot
      )
    );
    logAudit('APPROVE_OVERTIME', 'OVERTIME', 'OvertimeRequest', id, `Approved overtime by ${currentUserName}`);
  };

  const rejectOvertimeRequest = (id: string) => {
    setOvertimeRequests((prev) =>
      prev.map((ot) =>
        ot.id === id
          ? {
              ...ot,
              status: 'REJECTED',
              approved: false,
              approvedBy: currentUserName,
              approvedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
            }
          : ot
      )
    );
    logAudit('REJECT_OVERTIME', 'OVERTIME', 'OvertimeRequest', id, `Rejected overtime request`);
  };

  // Loan Actions
  const addLoan = (data: Omit<EmployeeLoan, 'id'>) => {
    const id = `loan-${Date.now()}`;
    const newLoan: EmployeeLoan = { ...data, id };
    setLoans((prev) => [newLoan, ...prev]);
    logAudit('ADD_LOAN', 'LOANS', 'EmployeeLoan', id, `Enrolled ${newLoan.type} with total balance of ₱${newLoan.totalAmount.toLocaleString()}`);
  };

  const updateLoan = (id: string, updates: Partial<EmployeeLoan>) => {
    setLoans((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...updates } : l))
    );
    logAudit('UPDATE_LOAN', 'LOANS', 'EmployeeLoan', id, `Updated loan ledger parameters`);
  };

  // Payroll Lifecycle & Approval Workflow
  const createPayrollPeriod = (params: {
    cutoffStart: string;
    cutoffEnd: string;
    payDate: string;
    frequency: PayFrequency;
    periodCode: string;
  }) => {
    const newId = `pay-${Date.now()}`;
    const draftPeriod = {
      id: newId,
      periodCode: params.periodCode,
      frequency: params.frequency,
      cutoffStart: params.cutoffStart,
      cutoffEnd: params.cutoffEnd,
      payDate: params.payDate,
      status: 'DRAFT' as const,
      preparedBy: currentUserName,
      preparedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    const computed = computePayroll({
      period: draftPeriod,
      employees,
      departments,
      positions,
      attendances,
      overtimeRequests,
      loans,
      adjustments,
      policy: payrollPolicy,
      sssConfig,
      philhealthConfig,
      pagibigConfig,
      birConfig
    });

    setPayrollPeriods((prev) => [computed, ...prev]);
    setActivePeriodId(newId);
    logAudit('CREATE_PAYROLL_PERIOD', 'PAYROLL', 'PayrollPeriod', newId, `Initialized payroll cutoff ${params.periodCode}`);
    return computed;
  };

  const recalculatePayroll = (periodId: string) => {
    setPayrollPeriods((prev) =>
      prev.map((p) => {
        if (p.id !== periodId) return p;
        if (p.status === 'POSTED' || p.status === 'PAID') {
          // Cannot modify posted or paid payroll without explicit reversal
          return p;
        }

        const recomputed = computePayroll({
          period: p,
          employees,
          departments,
          positions,
          attendances,
          overtimeRequests,
          loans,
          adjustments,
          policy: payrollPolicy,
          sssConfig,
          philhealthConfig,
          pagibigConfig,
          birConfig
        });
        return recomputed;
      })
    );
    logAudit('RECALCULATE_PAYROLL', 'PAYROLL', 'PayrollPeriod', periodId, `Recalculated earnings and deductions with latest rates`);
  };

  const submitPayrollForReview = (periodId: string) => {
    setPayrollPeriods((prev) =>
      prev.map((p) =>
        p.id === periodId
          ? {
              ...p,
              status: 'FOR_REVIEW',
              reviewedBy: currentUserName,
              reviewedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
            }
          : p
      )
    );
    logAudit('SUBMIT_FOR_REVIEW', 'PAYROLL', 'PayrollPeriod', periodId, `Submitted payroll period for management review`);
  };

  const approvePayroll = (periodId: string) => {
    setPayrollPeriods((prev) =>
      prev.map((p) =>
        p.id === periodId
          ? {
              ...p,
              status: 'APPROVED',
              approvedBy: currentUserName,
              approvedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
            }
          : p
      )
    );
    logAudit('APPROVE_PAYROLL', 'PAYROLL', 'PayrollPeriod', periodId, `Approved payroll by authorized executive: ${currentUserName}`);
  };

  const postPayroll = (periodId: string) => {
    setPayrollPeriods((prev) =>
      prev.map((p) =>
        p.id === periodId
          ? {
              ...p,
              status: 'POSTED',
              postedBy: currentUserName,
              postedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
            }
          : p
      )
    );
    logAudit('POST_PAYROLL', 'PAYROLL', 'PayrollPeriod', periodId, `Locked and posted payroll to general ledger and payslips`);
  };

  const markPayrollPaid = (periodId: string) => {
    setPayrollPeriods((prev) =>
      prev.map((p) =>
        p.id === periodId
          ? {
              ...p,
              status: 'PAID',
              paidAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
            }
          : p
      )
    );
    logAudit('DISBURSE_PAYROLL', 'PAYROLL', 'PayrollPeriod', periodId, `Marked payroll as fully paid & disbursed to employee bank accounts`);
    dispatchDepartmentNotifications(periodId);
  };

  const dispatchDepartmentNotifications = (
    periodId: string,
    departmentNames?: string[]
  ): DepartmentPayrollNotification[] => {
    const period = payrollPeriods.find((p) => p.id === periodId);
    if (!period) return [];

    const targetItems =
      departmentNames && departmentNames.length > 0
        ? period.items.filter((i) => departmentNames.includes(i.departmentName))
        : period.items;

    const deptMap = new Map<string, typeof targetItems>();
    targetItems.forEach((item) => {
      const list = deptMap.get(item.departmentName) || [];
      list.push(item);
      deptMap.set(item.departmentName, list);
    });

    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const newNotifications: DepartmentPayrollNotification[] = [];

    deptMap.forEach((items, deptName) => {
      const dept = departments.find((d) => d.name === deptName);
      const gross = items.reduce((sum, i) => sum + i.grossPay, 0);
      const statutory = items.reduce(
        (sum, i) =>
          sum + (i.totalStatutoryEE || (i.sssEE + i.sssMpfEE + i.philhealthEE + i.pagibigEE)),
        0
      );
      const net = items.reduce((sum, i) => sum + i.netPay, 0);

      const recipientName = dept?.managerName || 'Department Head';
      const recipientEmail =
        dept?.managerEmail || `head.${dept?.code?.toLowerCase() || 'dept'}@acrovatech.ph`;

      const notification: DepartmentPayrollNotification = {
        id: `notif-${Date.now()}-${dept?.id || Math.random().toString(36).substring(2, 6)}`,
        departmentId: dept?.id || 'dept-gen',
        departmentName: deptName,
        recipientName,
        recipientEmail,
        periodId: period.id,
        periodCode: period.periodCode,
        dispatchedAt: now,
        subject: `[CONFIDENTIAL] Payroll Summary Report: ${deptName} - Period ${period.periodCode} Processed`,
        employeeCount: items.length,
        totalGrossPay: Number(gross.toFixed(2)),
        totalStatutoryDeductions: Number(statutory.toFixed(2)),
        totalNetPay: Number(net.toFixed(2)),
        payDate: period.payDate,
        status: 'DELIVERED'
      };

      newNotifications.push(notification);

      logAudit(
        'EMAIL_REPORT_DISPATCH',
        'PAYROLL',
        'DepartmentPayrollNotification',
        dept?.id || period.id,
        `Automated summary report dispatched to Department Head ${recipientName} (${recipientEmail}) for ${deptName}`
      );
    });

    if (newNotifications.length > 0) {
      setEmailNotifications((prev) => [...newNotifications, ...prev]);
    }

    return newNotifications;
  };

  const updatePayrollItemsStatus = (
    periodId: string,
    itemIds: string[],
    newStatus: PayrollRecordStatus
  ) => {
    const idSet = new Set(itemIds);
    setPayrollPeriods((prev) =>
      prev.map((p) => {
        if (p.id !== periodId) return p;
        return {
          ...p,
          items: p.items.map((item) => {
            if (idSet.has(item.id)) {
              const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
              return {
                ...item,
                status: newStatus,
                approvedBy:
                  newStatus === 'APPROVED'
                    ? currentUserName
                    : newStatus === 'PENDING'
                    ? undefined
                    : (item.approvedBy || currentUserName),
                approvedAt:
                  newStatus === 'APPROVED'
                    ? now
                    : newStatus === 'PENDING'
                    ? undefined
                    : (item.approvedAt || now)
              };
            }
            return item;
          })
        };
      })
    );

    logAudit(
      'BATCH_STATUS_UPDATE',
      'PAYROLL',
      'PayrollItem',
      periodId,
      `Transitioned ${itemIds.length} employee record(s) to ${newStatus}`
    );

    // Automated Department Head Email Notification on Transition to PROCESSED
    if (newStatus === 'PROCESSED') {
      const currentPeriod = payrollPeriods.find((p) => p.id === periodId);
      if (currentPeriod) {
        const processedItems = currentPeriod.items.filter((i) => idSet.has(i.id));
        const uniqueDeptNames = Array.from(new Set(processedItems.map((i) => i.departmentName)));
        dispatchDepartmentNotifications(periodId, uniqueDeptNames);
      }
    }
  };

  // Statutory updates
  const updateSSSConfig = (config: SSSConfig) => {
    setSssConfig(config);
    logAudit('UPDATE_STATUTORY_SSS', 'SETTINGS', 'SSSConfig', 'sss-2025', `Updated SSS contribution table brackets`);
  };

  const updatePhilHealthConfig = (config: PhilHealthConfig) => {
    setPhilhealthConfig(config);
    logAudit('UPDATE_STATUTORY_PHILHEALTH', 'SETTINGS', 'PhilHealthConfig', 'ph-2025', `Updated PhilHealth premium parameters`);
  };

  const updatePagIBIGConfig = (config: PagIBIGConfig) => {
    setPagibigConfig(config);
    logAudit('UPDATE_STATUTORY_PAGIBIG', 'SETTINGS', 'PagIBIGConfig', 'hdmf-2024', `Updated Pag-IBIG Fund contribution parameters`);
  };

  const updateBIRConfig = (config: BIRConfig) => {
    setBirConfig(config);
    logAudit('UPDATE_STATUTORY_BIR', 'SETTINGS', 'BIRConfig', 'bir-train', `Updated BIR withholding tax brackets`);
  };

  const updatePayrollPolicy = (policy: PayrollPolicy) => {
    setPayrollPolicy(policy);
    logAudit('UPDATE_PAYROLL_POLICY', 'SETTINGS', 'PayrollPolicy', 'policy-default', `Updated monthly divisor / OT multipliers`);
  };

  const updateCompany = (updatedCompany: Company) => {
    setCompany(updatedCompany);
    logAudit('UPDATE_COMPANY_INFO', 'SETTINGS', 'Company', updatedCompany.id, `Updated company corporate details`);
  };

  const addHoliday = (holiday: Holiday) => {
    setHolidays((prev) => [...prev, holiday]);
    logAudit('ADD_HOLIDAY', 'SETTINGS', 'Holiday', holiday.id, `Added official holiday: ${holiday.name} (${holiday.date})`);
  };

  const deleteHoliday = (id: string) => {
    setHolidays((prev) => prev.filter((h) => h.id !== id));
    logAudit('DELETE_HOLIDAY', 'SETTINGS', 'Holiday', id, `Removed holiday entry`);
  };

  const resetToDefaults = () => {
    setEmployees(mockEmployees);
    setLoans(mockLoans);
    setOvertimeRequests(mockOvertimeRequests);
    setLeaveRequests(mockLeaveRequests);
    setAttendances(mockAttendanceRecords);
    setAdjustments(mockAdjustments);
    setSssConfig(defaultSSSConfig);
    setPhilhealthConfig(defaultPhilHealthConfig);
    setPagibigConfig(defaultPagIBIGConfig);
    setBirConfig(defaultBIRConfig);
    setPayrollPolicy(defaultPayrollPolicy);
    setHolidays(defaultHolidays2026);
    setPayrollPeriods([initialComputedPeriod, pastComputedPeriod]);
    setActivePeriodId('pay-2026-10-A');
    logAudit('RESET_SYSTEM', 'SETTINGS', 'System', 'all', `System restored to fresh demo state`);
  };

  return (
    <PayrollContext.Provider
      value={{
        company,
        branches,
        departments,
        positions,
        employees,
        loans,
        overtimeRequests,
        leaveRequests,
        attendances,
        adjustments,
        payrollPeriods,
        activePeriodId,
        auditLogs,
        emailNotifications,

        sssConfig,
        philhealthConfig,
        pagibigConfig,
        birConfig,
        payrollPolicy,
        holidays,

        currentRole,
        currentUserId: 'usr-admin-01',
        currentUserName,
        currentEmployeeId,
        setCurrentRole,
        setCurrentEmployeeId,
        setActivePeriodId,

        addEmployee,
        updateEmployee,
        deleteEmployee,

        recordAttendancePunch,
        batchImportAttendance,

        submitLeaveRequest,
        approveLeaveRequest,
        rejectLeaveRequest,

        submitOvertimeRequest,
        approveOvertimeRequest,
        rejectOvertimeRequest,

        addLoan,
        updateLoan,

        createPayrollPeriod,
        recalculatePayroll,
        submitPayrollForReview,
        approvePayroll,
        postPayroll,
        markPayrollPaid,
        updatePayrollItemsStatus,
        dispatchDepartmentNotifications,

        updateSSSConfig,
        updatePhilHealthConfig,
        updatePagIBIGConfig,
        updateBIRConfig,
        updatePayrollPolicy,
        updateCompany,
        addHoliday,
        deleteHoliday,

        resetToDefaults
      }}
    >
      {children}
    </PayrollContext.Provider>
  );
};

export const usePayroll = (): PayrollContextType => {
  const context = useContext(PayrollContext);
  if (!context) {
    throw new Error('usePayroll must be used within a PayrollProvider');
  }
  return context;
};
