/**
 * Payroll Pro — Employee Self-Service (ESS) Portal
 * Dedicated employee personal dashboard for payslips, DTR, leave balances, loans, and filing
 */

import React, { useState } from 'react';
import { usePayroll } from '../../context/PayrollContext';
import { formatPHP } from '../../lib/statutoryEngine';
import {
  UserCheck,
  Receipt,
  CalendarDays,
  Clock,
  CreditCard,
  Download,
  Plus,
  ArrowRight,
  Shield
} from 'lucide-react';

interface EmployeePortalViewProps {
  onOpenPayslip: (employeeId: string) => void;
  onOpenTimeClock: () => void;
}

export const EmployeePortalView: React.FC<EmployeePortalViewProps> = ({
  onOpenPayslip,
  onOpenTimeClock
}) => {
  const {
    employees,
    currentEmployeeId,
    setCurrentEmployeeId,
    payrollPeriods,
    activePeriodId,
    leaveRequests,
    overtimeRequests,
    loans,
    attendances
  } = usePayroll();

  const currentEmp = employees.find((e) => e.id === currentEmployeeId) || employees[0];
  const activePeriod =
    payrollPeriods.find((p) => p.id === activePeriodId) || payrollPeriods[0];

  const myPayslipItem = activePeriod?.items?.find((i) => i.employeeId === currentEmp?.id);
  const myLeaves = leaveRequests.filter((l) => l.employeeId === currentEmp?.id);
  const myOvertimes = overtimeRequests.filter((ot) => ot.employeeId === currentEmp?.id);
  const myLoans = loans.filter((l) => l.employeeId === currentEmp?.id && l.active);
  const myDTR = attendances.filter((a) => a.employeeId === currentEmp?.id);

  return (
    <div className="space-y-6">
      {/* Header & Persona Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Employee Self-Service (ESS)</h1>
            <span className="rounded bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700 border border-indigo-200">
              Personal Portal
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Welcome back, <span className="font-semibold text-slate-800">{currentEmp?.firstName} {currentEmp?.lastName}</span> ({currentEmp?.employeeNumber})
          </p>
        </div>

        {/* Switch employee view (for demo testing) */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-500 font-medium">Viewing Profile As:</label>
          <select
            value={currentEmp?.id}
            onChange={(e) => setCurrentEmployeeId(e.target.value)}
            className="rounded border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-800 font-medium"
          >
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.employeeNumber} — {e.lastName}, {e.firstName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Top Banner: Latest Payslip Snapshot */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Latest Cutoff Pay Voucher ({activePeriod.periodCode})
            </span>
            <div className="mt-1 flex items-baseline gap-3">
              <span className="text-3xl font-bold font-mono tracking-tight text-slate-900">
                {formatPHP(myPayslipItem?.netPay || 0)}
              </span>
              <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Net Take-Home
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Disbursed to: {currentEmp.bankName} (Acct: {currentEmp.bankAccountNumber})
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenPayslip(currentEmp.id)}
              className="flex items-center gap-1.5 rounded-md bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition"
            >
              <Receipt className="h-3.5 w-3.5" />
              <span>View Full Payslip</span>
            </button>
            <button
              onClick={onOpenTimeClock}
              className="flex items-center gap-1.5 rounded-md bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition"
            >
              <Clock className="h-3.5 w-3.5" />
              <span>Punch Time Clock</span>
            </button>
          </div>
        </div>

        {/* Quick Earnings / Deductions breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-100 text-xs">
          <div>
            <span className="text-slate-400 text-[11px]">Period Basic Pay:</span>
            <div className="font-semibold text-slate-800 font-mono">
              {formatPHP(myPayslipItem?.periodBasicPay || 0)}
            </div>
          </div>
          <div>
            <span className="text-slate-400 text-[11px]">Overtime &amp; Allowances:</span>
            <div className="font-semibold text-slate-800 font-mono">
              {formatPHP(
                (myPayslipItem?.regularOtPay || 0) +
                  (myPayslipItem?.allowanceTaxable || 0) +
                  (myPayslipItem?.allowanceNonTaxable || 0)
              )}
            </div>
          </div>
          <div>
            <span className="text-slate-400 text-[11px]">Total Deductions:</span>
            <div className="font-semibold text-amber-700 font-mono">
              {formatPHP(myPayslipItem?.totalDeductions || 0)}
            </div>
          </div>
          <div>
            <span className="text-slate-400 text-[11px]">Withholding Tax (BIR):</span>
            <div className="font-semibold text-slate-800 font-mono">
              {formatPHP(myPayslipItem?.withholdingTax || 0)}
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Leave Balances & Active Loans */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Leave Balances Card */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4 text-indigo-600" />
              <span>Leave Credit Balances</span>
            </h2>
            <span className="text-[11px] text-slate-400">Fiscal Year 2026</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5">
              <div className="text-[11px] text-slate-500">Vacation Leave (VL)</div>
              <div className="text-lg font-bold text-slate-900 font-mono mt-0.5">
                {currentEmp.leaveBalance.vacationLeaveTotal - currentEmp.leaveBalance.vacationLeaveUsed} / {currentEmp.leaveBalance.vacationLeaveTotal}
              </div>
              <div className="text-[10px] text-slate-400">Available Days</div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5">
              <div className="text-[11px] text-slate-500">Sick Leave (SL)</div>
              <div className="text-lg font-bold text-slate-900 font-mono mt-0.5">
                {currentEmp.leaveBalance.sickLeaveTotal - currentEmp.leaveBalance.sickLeaveUsed} / {currentEmp.leaveBalance.sickLeaveTotal}
              </div>
              <div className="text-[10px] text-slate-400">Available Days</div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5">
              <div className="text-[11px] text-slate-500">Service Incentive (SIL)</div>
              <div className="text-lg font-bold text-slate-900 font-mono mt-0.5">
                {currentEmp.leaveBalance.serviceIncentiveTotal - currentEmp.leaveBalance.serviceIncentiveUsed} / {currentEmp.leaveBalance.serviceIncentiveTotal}
              </div>
              <div className="text-[10px] text-slate-400">Statutory 5 Days</div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5">
              <div className="text-[11px] text-slate-500">Emergency Leave (EL)</div>
              <div className="text-lg font-bold text-slate-900 font-mono mt-0.5">
                {currentEmp.leaveBalance.emergencyLeaveTotal - currentEmp.leaveBalance.emergencyLeaveUsed} / {currentEmp.leaveBalance.emergencyLeaveTotal}
              </div>
              <div className="text-[10px] text-slate-400">Company Benefit</div>
            </div>
          </div>
        </div>

        {/* Active Loans Ledger Card */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <CreditCard className="h-4 w-4 text-purple-600" />
              <span>My Active Loan Deductions</span>
            </h2>
            <span className="text-[11px] text-slate-400">{myLoans.length} Enrolled</span>
          </div>

          {myLoans.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              No active loans or salary advances on file.
            </div>
          ) : (
            <div className="space-y-2 text-xs">
              {myLoans.map((l) => (
                <div key={l.id} className="rounded-lg border border-slate-200 p-3 bg-slate-50 flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-slate-900">{l.type.replace(/_/g, ' ')}</div>
                    <div className="text-[11px] text-slate-500 font-mono">Ref: {l.referenceNumber}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-900 font-mono">{formatPHP(l.remainingBalance)}</div>
                    <div className="text-[11px] text-amber-700 font-medium">
                      -{formatPHP(l.semiMonthlyAmortization)} / cutoff
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
