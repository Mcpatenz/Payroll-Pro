/**
 * Payroll Pro — Executive Dashboard
 * High-density metrics, SVG analytics charts, cutoff workflow stepper, compliance overview
 */

import React from 'react';
import { usePayroll } from '../../context/PayrollContext';
import { formatPHP } from '../../lib/statutoryEngine';
import { ActiveTab } from '../layout/Sidebar';
import {
  Users,
  Wallet,
  TrendingUp,
  Receipt,
  FileCheck2,
  CalendarDays,
  ShieldCheck,
  Building,
  ArrowUpRight,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight
} from 'lucide-react';

interface DashboardViewProps {
  onNavigate: (tab: ActiveTab) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const {
    company,
    employees,
    departments,
    payrollPeriods,
    activePeriodId,
    leaveRequests,
    overtimeRequests,
    auditLogs,
    currentRole
  } = usePayroll();

  const activePeriod =
    payrollPeriods.find((p) => p.id === activePeriodId) || payrollPeriods[0];
  const previousPeriod = payrollPeriods.find((p) => p.id !== activePeriod?.id);

  const activeEmployees = employees.filter((e) => e.status === 'ACTIVE' || e.status === 'PROBATIONARY');
  const regularCount = employees.filter((e) => e.employmentType === 'REGULAR').length;
  const probationaryCount = employees.filter((e) => e.employmentType === 'PROBATIONARY').length;

  const pendingLeaves = leaveRequests.filter((l) => l.status === 'PENDING').length;
  const pendingOvertimes = overtimeRequests.filter((ot) => ot.status === 'PENDING').length;

  // Department cost calculation for active period
  const deptCostMap: Record<string, number> = {};
  departments.forEach((d) => (deptCostMap[d.name] = 0));

  activePeriod?.items?.forEach((item) => {
    deptCostMap[item.departmentName] = (deptCostMap[item.departmentName] || 0) + item.grossPay;
  });

  const deptCostList = Object.entries(deptCostMap).map(([name, cost]) => ({
    name,
    cost,
    percent: activePeriod?.totalGrossPay ? Math.round((cost / activePeriod.totalGrossPay) * 100) : 0
  }));

  const steps = [
    { key: 'DRAFT', label: '1. Draft' },
    { key: 'PROCESSING', label: '2. Process' },
    { key: 'FOR_REVIEW', label: '3. For Review' },
    { key: 'APPROVED', label: '4. Approved' },
    { key: 'POSTED', label: '5. Posted' },
    { key: 'PAID', label: '6. Disbursed' }
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === activePeriod?.status);

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                Philippine Payroll Management
              </h1>
              <span className="rounded bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
                BIR &amp; SSS 2025/2026 Compliant
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {company.name} · TIN: {company.tin} · SSS: {company.sssNumber} · RDO: {company.rdoCode}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => onNavigate('payroll')}
              className="flex items-center gap-1.5 rounded-md bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition"
            >
              <span>Manage Active Cutoff</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => onNavigate('reports-gov')}
              className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition"
            >
              <span>Statutory Reports</span>
            </button>
          </div>
        </div>

        {/* Cutoff Workflow Stepper */}
        <div className="mt-5 border-t border-slate-100 pt-4">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-semibold text-slate-700">
              Cutoff Pipeline: {activePeriod?.periodCode} ({activePeriod?.cutoffStart} to {activePeriod?.cutoffEnd})
            </span>
            <span className="font-mono text-slate-500">Pay Date: {activePeriod?.payDate}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
            {steps.map((st, idx) => {
              const isPast = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              return (
                <div
                  key={st.key}
                  className={`rounded-md p-2 text-center text-xs border transition-all ${
                    isCurrent
                      ? 'border-indigo-600 bg-indigo-50 font-bold text-indigo-900 shadow-xs ring-1 ring-indigo-500'
                      : isPast
                      ? 'border-emerald-200 bg-emerald-50/60 font-medium text-emerald-800'
                      : 'border-slate-200 bg-slate-50 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1">
                    {isPast && <CheckCircle2 className="h-3 w-3 text-emerald-600 shrink-0" />}
                    {isCurrent && <Clock className="h-3 w-3 text-indigo-600 animate-spin shrink-0" />}
                    <span className="truncate">{st.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Gross Pay */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Period Gross Pay
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {formatPHP(activePeriod?.totalGrossPay || 0)}
          </div>
          <div className="mt-1 flex items-center text-xs text-slate-500">
            <span>{activePeriod?.totalEmployees || 0} employees processed</span>
          </div>
        </div>

        {/* Card 2: Total Deductions */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Deductions
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <Receipt className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {formatPHP(activePeriod?.totalDeductions || 0)}
          </div>
          <div className="mt-1 flex items-center text-xs text-slate-500">
            <span>Tax: {formatPHP(activePeriod?.totalWithholdingTax || 0)}</span>
          </div>
        </div>

        {/* Card 3: Net Pay Disbursed */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Disbursed Net Pay
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900 text-emerald-700">
            {formatPHP(activePeriod?.totalNetPay || 0)}
          </div>
          <div className="mt-1 flex items-center text-xs text-slate-500">
            <span>Bank direct deposit transfer</span>
          </div>
        </div>

        {/* Card 4: Employer Statutory Liability */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Employer Liability
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {formatPHP(activePeriod?.totalEmployerLiability || 0)}
          </div>
          <div className="mt-1 flex items-center text-xs text-slate-500">
            <span>SSS ER + PhilHealth + Pag-IBIG</span>
          </div>
        </div>
      </div>

      {/* Second Row: Analytics & Visual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Gross Allocation (Progress Bars) */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Department Compensation Allocation</h2>
              <p className="text-xs text-slate-500">Breakdown of gross payroll expenditure across operational units</p>
            </div>
            <button
              onClick={() => onNavigate('employees')}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition flex items-center gap-1"
            >
              <span>View Roster</span>
              <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>

          <div className="mt-4 space-y-4">
            {deptCostList.map((item) => (
              <div key={item.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700">{item.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">{formatPHP(item.cost)}</span>
                    <span className="text-slate-400 font-mono text-[11px]">({item.percent}%)</span>
                  </div>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                    style={{ width: `${Math.max(item.percent, 3)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Statutory Breakdown Summary Bar */}
          <div className="mt-6 rounded-lg bg-slate-50 p-3.5 border border-slate-200 text-xs">
            <div className="font-semibold text-slate-800 mb-2">Government Statutory Totals (This Cutoff)</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-600">
              <div>
                <span className="block text-[11px] text-slate-400">SSS EE + ER</span>
                <span className="font-semibold text-slate-900">
                  {formatPHP((activePeriod?.totalSSSEE || 0) + (activePeriod?.totalSSSER || 0))}
                </span>
              </div>
              <div>
                <span className="block text-[11px] text-slate-400">PhilHealth EE + ER</span>
                <span className="font-semibold text-slate-900">
                  {formatPHP((activePeriod?.totalPhilHealthEE || 0) + (activePeriod?.totalPhilHealthER || 0))}
                </span>
              </div>
              <div>
                <span className="block text-[11px] text-slate-400">Pag-IBIG EE + ER</span>
                <span className="font-semibold text-slate-900">
                  {formatPHP((activePeriod?.totalPagIBIGEE || 0) + (activePeriod?.totalPagIBIGER || 0))}
                </span>
              </div>
              <div>
                <span className="block text-[11px] text-slate-400">BIR Withholding Tax</span>
                <span className="font-semibold text-slate-900">
                  {formatPHP(activePeriod?.totalWithholdingTax || 0)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Center / Quick Approvals */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="pb-3 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-900">Pending Actions &amp; Compliance</h2>
              <p className="text-xs text-slate-500">Items requiring manager or HR review</p>
            </div>

            <div className="mt-4 space-y-3">
              <div
                onClick={() => onNavigate('leave')}
                className="flex items-center justify-between rounded-lg border border-slate-200 p-3 hover:bg-slate-50 cursor-pointer transition"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-amber-50 text-amber-600">
                    <CalendarDays className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-800">Pending Leaves</div>
                    <div className="text-[11px] text-slate-500">Requests awaiting supervisor signoff</div>
                  </div>
                </div>
                <span className="text-sm font-bold text-amber-600">{pendingLeaves}</span>
              </div>

              <div
                onClick={() => onNavigate('overtime')}
                className="flex items-center justify-between rounded-lg border border-slate-200 p-3 hover:bg-slate-50 cursor-pointer transition"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-50 text-blue-600">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-800">Overtime Requests</div>
                    <div className="text-[11px] text-slate-500">Unapproved overtime hours</div>
                  </div>
                </div>
                <span className="text-sm font-bold text-blue-600">{pendingOvertimes}</span>
              </div>

              <div
                onClick={() => onNavigate('loans')}
                className="flex items-center justify-between rounded-lg border border-slate-200 p-3 hover:bg-slate-50 cursor-pointer transition"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-purple-50 text-purple-600">
                    <Receipt className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-800">Active Employee Loans</div>
                    <div className="text-[11px] text-slate-500">SSS, HDMF, &amp; Cash Advances</div>
                  </div>
                </div>
                <span className="text-sm font-bold text-purple-600">{formatPHP(activePeriod?.totalLoans || 0)}</span>
              </div>
            </div>
          </div>

          {/* Quick Audits snippet */}
          <div className="mt-5 border-t border-slate-100 pt-3 text-[11px]">
            <div className="font-semibold text-slate-500 mb-2">Latest Audit Log:</div>
            {auditLogs[0] ? (
              <div className="rounded bg-slate-50 p-2 text-slate-600">
                <span className="font-medium text-slate-900">{auditLogs[0].userName}:</span> {auditLogs[0].description}
                <div className="text-[10px] text-slate-400 mt-0.5">{auditLogs[0].timestamp}</div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
