/**
 * Payroll Pro — Philippine Standard Payslip Viewer & Generator
 * Compliant with DOLE Labor Code and BIR Withholding guidelines
 * Features print-ready formatting, net pay in words, and YTD balances.
 */

import React, { useState } from 'react';
import { usePayroll } from '../../context/PayrollContext';
import { formatPHP, numberToWordsPHP } from '../../lib/statutoryEngine';
import { PayrollItem } from '../../types';
import {
  Printer,
  Download,
  Search,
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Shield
} from 'lucide-react';

interface PayslipsViewProps {
  initialEmployeeId?: string;
}

export const PayslipsView: React.FC<PayslipsViewProps> = ({ initialEmployeeId }) => {
  const { company, payrollPeriods, activePeriodId, employees } = usePayroll();

  const activePeriod =
    payrollPeriods.find((p) => p.id === activePeriodId) || payrollPeriods[0];

  const [selectedEmpId, setSelectedEmpId] = useState<string>(
    initialEmployeeId || activePeriod?.items?.[0]?.employeeId || employees[0]?.id || ''
  );
  const [search, setSearch] = useState('');

  const currentItem: PayrollItem | undefined = activePeriod?.items?.find(
    (item) => item.employeeId === selectedEmpId
  );
  const currentEmp = employees.find((e) => e.id === selectedEmpId);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Bar (Hidden in print) */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Payslip Archive</h1>
          <p className="text-xs text-slate-500">
            Official Philippine DOLE &amp; BIR compliant salary vouchers for Period: {activePeriod?.periodCode}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Employee Selector Dropdown */}
          <select
            value={selectedEmpId}
            onChange={(e) => setSelectedEmpId(e.target.value)}
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800 font-medium focus:border-indigo-500 focus:outline-hidden"
          >
            {activePeriod?.items?.map((item) => (
              <option key={item.employeeId} value={item.employeeId}>
                {item.employeeNumber} — {item.employeeName}
              </option>
            ))}
          </select>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-md bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 transition"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {/* Payslip Document Container */}
      {!currentItem ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-400">
          No payslip record available for the selected employee in this period.
        </div>
      ) : (
        <div className="print-container max-w-3xl mx-auto rounded-xl border border-slate-300 bg-white p-8 shadow-sm">
          {/* Company Header */}
          <div className="border-b-2 border-slate-900 pb-4">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-base font-bold text-slate-900 uppercase tracking-tight">
                  {company.name}
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5">{company.address}, {company.city}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-mono text-slate-600 mt-1">
                  <span>TIN: {company.tin}</span>
                  <span>SSS No: {company.sssNumber}</span>
                  <span>PhilHealth: {company.philhealthNumber}</span>
                  <span>Pag-IBIG: {company.pagibigNumber}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="rounded bg-slate-900 text-white px-2.5 py-1 text-xs font-bold uppercase tracking-wider">
                  CONFIDENTIAL PAYSLIP
                </span>
                <div className="text-[11px] text-slate-500 font-mono mt-1">
                  Voucher: PAY-{activePeriod.periodCode}-{currentItem.employeeNumber}
                </div>
              </div>
            </div>
          </div>

          {/* Employee & Pay Period Details Grid */}
          <div className="grid grid-cols-2 gap-4 py-4 border-b border-slate-200 text-xs">
            <div className="space-y-1">
              <div>
                <span className="text-slate-400 text-[11px]">Employee Name:</span>{' '}
                <span className="font-bold text-slate-900">{currentItem.employeeName}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px]">Employee No:</span>{' '}
                <span className="font-mono font-semibold text-slate-800">{currentItem.employeeNumber}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px]">Department &amp; Position:</span>{' '}
                <span className="text-slate-700">{currentItem.departmentName} — {currentItem.positionName}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px]">Disbursement Bank:</span>{' '}
                <span className="text-slate-700 font-mono">{currentItem.bankName} ({currentItem.bankAccountNumber})</span>
              </div>
            </div>

            <div className="space-y-1 sm:text-right">
              <div>
                <span className="text-slate-400 text-[11px]">Payroll Cutoff:</span>{' '}
                <span className="font-mono font-semibold text-slate-800">
                  {activePeriod.cutoffStart} to {activePeriod.cutoffEnd}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px]">Pay Date:</span>{' '}
                <span className="font-mono font-semibold text-slate-800">{activePeriod.payDate}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px]">Pay Frequency:</span>{' '}
                <span className="text-slate-700">{activePeriod.frequency.replace(/_/g, ' ')}</span>
              </div>
              <div className="text-[11px] font-mono text-slate-500">
                TIN: {currentEmp?.tin || '—'} · SSS: {currentEmp?.sssNumber || '—'}
              </div>
            </div>
          </div>

          {/* Earnings & Deductions 2-Column Table */}
          <div className="grid grid-cols-2 gap-8 py-4 border-b border-slate-200 text-xs">
            {/* Left: Earnings */}
            <div>
              <div className="font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1.5 mb-2">
                EARNINGS
              </div>
              <div className="space-y-1.5 text-slate-700">
                <div className="flex justify-between">
                  <span>Period Basic Salary</span>
                  <span className="font-mono font-semibold">{formatPHP(currentItem.periodBasicPay)}</span>
                </div>

                {currentItem.regularOtPay > 0 && (
                  <div className="flex justify-between">
                    <span>Regular Overtime ({currentItem.regularOtHours}h @ 125%)</span>
                    <span className="font-mono">{formatPHP(currentItem.regularOtPay)}</span>
                  </div>
                )}

                {currentItem.restDayOtPay > 0 && (
                  <div className="flex justify-between">
                    <span>Rest Day Overtime ({currentItem.restDayOtHours}h @ 130%)</span>
                    <span className="font-mono">{formatPHP(currentItem.restDayOtPay)}</span>
                  </div>
                )}

                {currentItem.nightDiffPay > 0 && (
                  <div className="flex justify-between">
                    <span>Night Differential ({currentItem.nightDiffHours}h @ 10%)</span>
                    <span className="font-mono">{formatPHP(currentItem.nightDiffPay)}</span>
                  </div>
                )}

                {currentItem.allowanceTaxable > 0 && (
                  <div className="flex justify-between">
                    <span>Taxable Allowance</span>
                    <span className="font-mono">{formatPHP(currentItem.allowanceTaxable)}</span>
                  </div>
                )}

                {currentItem.allowanceNonTaxable > 0 && (
                  <div className="flex justify-between">
                    <span>De Minimis Non-Taxable</span>
                    <span className="font-mono">{formatPHP(currentItem.allowanceNonTaxable)}</span>
                  </div>
                )}

                {currentItem.bonus > 0 && (
                  <div className="flex justify-between font-semibold text-indigo-700">
                    <span>Bonus / Performance Award</span>
                    <span className="font-mono">{formatPHP(currentItem.bonus)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Deductions */}
            <div>
              <div className="font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1.5 mb-2">
                DEDUCTIONS
              </div>
              <div className="space-y-1.5 text-slate-700">
                <div className="flex justify-between">
                  <span>SSS Premium (EE)</span>
                  <span className="font-mono font-semibold">{formatPHP(currentItem.sssEE)}</span>
                </div>

                {currentItem.sssMpfEE > 0 && (
                  <div className="flex justify-between">
                    <span>SSS WISP / MPF</span>
                    <span className="font-mono font-semibold">{formatPHP(currentItem.sssMpfEE)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>PhilHealth Premium (EE)</span>
                  <span className="font-mono font-semibold">{formatPHP(currentItem.philhealthEE)}</span>
                </div>

                <div className="flex justify-between">
                  <span>Pag-IBIG Fund (EE)</span>
                  <span className="font-mono font-semibold">{formatPHP(currentItem.pagibigEE)}</span>
                </div>

                <div className="flex justify-between">
                  <span>BIR Withholding Tax</span>
                  <span className="font-mono font-semibold">{formatPHP(currentItem.withholdingTax)}</span>
                </div>

                {currentItem.lateDeduction > 0 && (
                  <div className="flex justify-between text-amber-700">
                    <span>Tardiness / Late ({currentItem.lateMinutes} mins)</span>
                    <span className="font-mono">{formatPHP(currentItem.lateDeduction)}</span>
                  </div>
                )}

                {currentItem.undertimeDeduction > 0 && (
                  <div className="flex justify-between text-amber-700">
                    <span>Undertime ({currentItem.undertimeMinutes} mins)</span>
                    <span className="font-mono">{formatPHP(currentItem.undertimeDeduction)}</span>
                  </div>
                )}

                {currentItem.loanDeduction > 0 && (
                  <div className="flex justify-between text-amber-800 font-semibold">
                    <span>Loan Amortization (SSS/HDMF/Co)</span>
                    <span className="font-mono">{formatPHP(currentItem.loanDeduction)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Subtotals & Net Pay Box */}
          <div className="py-4 border-b border-slate-200">
            <div className="grid grid-cols-2 gap-8 text-xs mb-3">
              <div className="flex justify-between font-bold text-slate-900 border-t border-slate-300 pt-1">
                <span>TOTAL GROSS PAY:</span>
                <span className="font-mono text-sm">{formatPHP(currentItem.grossPay)}</span>
              </div>
              <div className="flex justify-between font-bold text-amber-800 border-t border-slate-300 pt-1">
                <span>TOTAL DEDUCTIONS:</span>
                <span className="font-mono text-sm">{formatPHP(currentItem.totalDeductions)}</span>
              </div>
            </div>

            {/* Official Net Take-Home Highlight */}
            <div className="rounded-lg bg-slate-900 text-white p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-300">
                  NET TAKE-HOME PAY
                </span>
                <div className="text-2xl font-bold font-mono tracking-tight text-emerald-400">
                  {formatPHP(currentItem.netPay)}
                </div>
              </div>
              <div className="sm:text-right max-w-sm">
                <span className="text-[10px] text-slate-400 block uppercase">Amount in Words</span>
                <span className="text-[11px] font-mono text-slate-200 font-medium leading-tight">
                  {numberToWordsPHP(currentItem.netPay)}
                </span>
              </div>
            </div>
          </div>

          {/* Footnotes & Employer Statutory Counterparts */}
          <div className="py-3 border-b border-slate-100 text-[10px] text-slate-500 space-y-1">
            <div className="font-semibold text-slate-600">Employer Counterparts (Company Cost, Non-Deducted):</div>
            <div className="flex flex-wrap gap-x-6 gap-y-1 font-mono">
              <span>SSS ER: {formatPHP(currentItem.sssER)}</span>
              <span>SSS EC: {formatPHP(currentItem.sssEcER)}</span>
              <span>SSS WISP ER: {formatPHP(currentItem.sssMpfER)}</span>
              <span>PhilHealth ER: {formatPHP(currentItem.philhealthER)}</span>
              <span>Pag-IBIG ER: {formatPHP(currentItem.pagibigER)}</span>
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-12 pt-8 text-xs text-slate-700">
            <div className="border-t border-slate-400 pt-2 text-center">
              <div className="font-semibold">{company.authorizedSignatory}</div>
              <div className="text-[11px] text-slate-500">{company.signatoryTitle}</div>
              <div className="text-[10px] text-slate-400 mt-1">Authorized Employer Signature</div>
            </div>

            <div className="border-t border-slate-400 pt-2 text-center">
              <div className="font-semibold">{currentItem.employeeName}</div>
              <div className="text-[11px] text-slate-500 font-mono">{currentItem.employeeNumber}</div>
              <div className="text-[10px] text-slate-400 mt-1">Employee Acknowledgment Signature</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
