/**
 * Payroll Pro — Top Navigation Bar
 * Features organization branding, active cutoff status, and interactive persona switcher
 */

import React, { useState } from 'react';
import { usePayroll } from '../../context/PayrollContext';
import { UserRole } from '../../types';
import {
  Building2,
  Clock,
  ChevronDown,
  UserCheck,
  RotateCcw,
  CheckCircle2,
  Shield,
  Briefcase
} from 'lucide-react';

interface NavbarProps {
  onClockInClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onClockInClick }) => {
  const {
    company,
    payrollPeriods,
    activePeriodId,
    setActivePeriodId,
    currentRole,
    setCurrentRole,
    currentUserName,
    resetToDefaults
  } = usePayroll();

  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [periodMenuOpen, setPeriodMenuOpen] = useState(false);

  const activePeriod = payrollPeriods.find((p) => p.id === activePeriodId) || payrollPeriods[0];

  const rolesList: { role: UserRole; label: string; desc: string }[] = [
    { role: 'PAYROLL_ADMIN', label: 'Payroll Admin', desc: 'Prepares & processes payroll cutoffs' },
    { role: 'HR_ADMIN', label: 'HR Admin', desc: 'Manages employees, leaves, attendance' },
    { role: 'OWNER', label: 'Owner / Exec', desc: 'Final approval, financial audit & policies' },
    { role: 'SUPER_ADMIN', label: 'Super Admin', desc: 'Full system administration' },
    { role: 'MANAGER', label: 'Dept Manager', desc: 'Approves team leave & overtime' },
    { role: 'EMPLOYEE', label: 'Employee (ESS)', desc: 'Self-service: payslips, requests' },
    { role: 'AUDITOR', label: 'External Auditor', desc: 'Compliance & government review' }
  ];

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'APPROVED':
      case 'POSTED':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'FOR_REVIEW':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      default:
        return 'text-slate-700 bg-slate-100 border-slate-200';
    }
  };

  return (
    <header className="no-print sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-4 lg:px-6 shadow-xs">
      {/* Left: Brand & Company */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold shadow-xs">
            <span className="text-lg tracking-tight">₱</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold tracking-tight text-slate-900">Payroll Pro</span>
              <span className="text-[11px] font-medium tracking-wide text-slate-500 uppercase">PH Compliance 2025/2026</span>
            </div>
            <p className="text-xs text-slate-500 font-medium truncate max-w-[220px] sm:max-w-xs">{company.name}</p>
          </div>
        </div>

        {/* Separator */}
        <div className="hidden md:block h-6 w-px bg-slate-200" />

        {/* Active Cutoff Selector */}
        <div className="relative hidden md:block">
          <button
            onClick={() => setPeriodMenuOpen(!periodMenuOpen)}
            className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50/70 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <Clock className="h-3.5 w-3.5 text-slate-500" />
            <span className="font-semibold text-slate-900">Period: {activePeriod?.periodCode}</span>
            <span className="text-slate-400">({activePeriod?.cutoffStart} to {activePeriod?.cutoffEnd})</span>
            <span
              className={`rounded px-1.5 py-0.5 text-[10px] font-semibold border ${getStatusBadgeStyle(
                activePeriod?.status || 'DRAFT'
              )}`}
            >
              {activePeriod?.status?.replace('_', ' ')}
            </span>
            <ChevronDown className="h-3 w-3 text-slate-400 ml-0.5" />
          </button>

          {periodMenuOpen && (
            <div
              className="absolute left-0 mt-1 w-72 rounded-lg border border-slate-200 bg-white p-1.5 shadow-lg z-50 text-xs"
              onMouseLeave={() => setPeriodMenuOpen(false)}
            >
              <div className="px-2 py-1 text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                Select Payroll Cutoff
              </div>
              {payrollPeriods.map((period) => (
                <button
                  key={period.id}
                  onClick={() => {
                    setActivePeriodId(period.id);
                    setPeriodMenuOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded px-2.5 py-2 text-left transition-colors ${
                    period.id === activePeriodId ? 'bg-indigo-50 text-indigo-900 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div>
                    <div className="font-medium text-slate-900">{period.periodCode}</div>
                    <div className="text-[11px] text-slate-500">
                      {period.cutoffStart} — {period.cutoffEnd}
                    </div>
                  </div>
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-medium border ${getStatusBadgeStyle(
                      period.status
                    )}`}
                  >
                    {period.status}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Controls: Quick Clock In, Persona Switcher, Reset Demo */}
      <div className="flex items-center gap-2.5">
        {/* Quick Time Clock Punch button */}
        <button
          onClick={onClockInClick}
          className="flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 active:scale-98 transition shadow-xs"
          title="Record biometric DTR punch"
        >
          <Clock className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Time Clock</span>
        </button>

        {/* Role Persona Switcher (Crucial for testing all 8 roles & RBAC) */}
        <div className="relative">
          <button
            onClick={() => setRoleMenuOpen(!roleMenuOpen)}
            className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs hover:border-slate-300 transition-colors"
          >
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-[10px] font-semibold text-white">
              {currentRole[0]}
            </div>
            <div className="text-left hidden sm:block">
              <span className="block font-semibold text-slate-800 leading-tight">
                {rolesList.find((r) => r.role === currentRole)?.label || currentRole}
              </span>
              <span className="block text-[10px] text-slate-500 leading-tight truncate max-w-[130px]">
                {currentUserName}
              </span>
            </div>
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </button>

          {roleMenuOpen && (
            <div
              className="absolute right-0 mt-1 w-64 rounded-lg border border-slate-200 bg-white p-1.5 shadow-xl z-50"
              onMouseLeave={() => setRoleMenuOpen(false)}
            >
              <div className="px-2.5 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Switch Role / Persona (RBAC)
              </div>
              <div className="mt-1 space-y-0.5">
                {rolesList.map((item) => (
                  <button
                    key={item.role}
                    onClick={() => {
                      setCurrentRole(item.role);
                      setRoleMenuOpen(false);
                    }}
                    className={`flex w-full items-start gap-2.5 rounded-md px-2.5 py-2 text-left transition-colors ${
                      item.role === currentRole ? 'bg-indigo-50 text-indigo-900' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <Shield
                      className={`h-4 w-4 mt-0.5 shrink-0 ${
                        item.role === currentRole ? 'text-indigo-600' : 'text-slate-400'
                      }`}
                    />
                    <div>
                      <div className="text-xs font-semibold leading-tight">{item.label}</div>
                      <div className="text-[11px] text-slate-500 leading-tight mt-0.5">{item.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Reset Demo Data button */}
        <button
          onClick={() => {
            if (confirm('Reset Payroll Pro sample data to initial demonstration state?')) {
              resetToDefaults();
            }
          }}
          className="hidden lg:flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1.5 text-xs text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
          title="Reset to fresh demo data"
        >
          <RotateCcw className="h-3 w-3 text-slate-400" />
          <span>Reset Demo</span>
        </button>
      </div>
    </header>
  );
};
