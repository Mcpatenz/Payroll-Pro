/**
 * Payroll Pro — Sidebar Navigation
 * Strict clean typography, category dividers, badge alerts for pending items
 */

import React from 'react';
import { usePayroll } from '../../context/PayrollContext';
import {
  LayoutDashboard,
  Users,
  Clock,
  CalendarDays,
  Timer,
  CreditCard,
  Calculator,
  Receipt,
  FileSpreadsheet,
  BarChart3,
  SlidersHorizontal,
  History,
  UserCheck
} from 'lucide-react';

export type ActiveTab =
  | 'dashboard'
  | 'employees'
  | 'attendance'
  | 'leave'
  | 'overtime'
  | 'loans'
  | 'payroll'
  | 'payslips'
  | 'reports-gov'
  | 'reports-reg'
  | 'settings'
  | 'audit'
  | 'ess';

interface NavItem {
  id: ActiveTab;
  label: string;
  icon: any;
  badge?: number;
  badgeText?: string;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { leaveRequests, overtimeRequests, payrollPeriods, activePeriodId, currentRole } = usePayroll();

  // Pending counts
  const pendingLeaves = leaveRequests.filter((l) => l.status === 'PENDING').length;
  const pendingOvertimes = overtimeRequests.filter((ot) => ot.status === 'PENDING').length;
  const activePeriod = payrollPeriods.find((p) => p.id === activePeriodId);
  const isPayrollPendingReview = activePeriod?.status === 'FOR_REVIEW';

  const navSections: NavSection[] = [
    {
      label: 'Main Operations',
      items: [
        { id: 'dashboard' as ActiveTab, label: 'Dashboard', icon: LayoutDashboard },
        { id: 'employees' as ActiveTab, label: 'Employees', icon: Users },
        { id: 'attendance' as ActiveTab, label: 'Attendance & DTR', icon: Clock },
        {
          id: 'leave' as ActiveTab,
          label: 'Leave Management',
          icon: CalendarDays,
          badge: pendingLeaves > 0 ? pendingLeaves : undefined
        },
        {
          id: 'overtime' as ActiveTab,
          label: 'Overtime Requests',
          icon: Timer,
          badge: pendingOvertimes > 0 ? pendingOvertimes : undefined
        },
        { id: 'loans' as ActiveTab, label: 'Loans & Advances', icon: CreditCard }
      ]
    },
    {
      label: 'Payroll & Compensation',
      items: [
        {
          id: 'payroll' as ActiveTab,
          label: 'Payroll Processing',
          icon: Calculator,
          badgeText: isPayrollPendingReview ? 'Review' : undefined
        },
        { id: 'payslips' as ActiveTab, label: 'Payslip Archive', icon: Receipt }
      ]
    },
    {
      label: 'Compliance & Reports',
      items: [
        { id: 'reports-gov' as ActiveTab, label: 'Government Reports', icon: FileSpreadsheet },
        { id: 'reports-reg' as ActiveTab, label: 'Payroll Registers', icon: BarChart3 }
      ]
    },
    {
      label: 'Administration & ESS',
      items: [
        { id: 'settings' as ActiveTab, label: 'Statutory & Policy', icon: SlidersHorizontal },
        { id: 'audit' as ActiveTab, label: 'Audit Trail', icon: History },
        { id: 'ess' as ActiveTab, label: 'Employee Portal (ESS)', icon: UserCheck }
      ]
    }
  ];

  return (
    <aside className="no-print w-64 shrink-0 border-r border-slate-200 bg-white flex flex-col justify-between h-[calc(100vh-4rem)] overflow-y-auto">
      <div className="p-3 space-y-6">
        {navSections.map((section) => (
          <div key={section.label} className="space-y-1">
            <div className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              {section.label}
            </div>
            <nav className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`group flex w-full items-center justify-between rounded-md px-3 py-2 text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-slate-900 text-white font-semibold shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon
                        className={`h-4 w-4 shrink-0 transition-colors ${
                          isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-700'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge !== undefined && (
                      <span
                        className={`ml-2 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold ${
                          isActive ? 'bg-amber-400 text-slate-950' : 'bg-amber-100 text-amber-900'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}

                    {item.badgeText && (
                      <span
                        className={`ml-2 text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                          isActive ? 'bg-indigo-400 text-white' : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                        }`}
                      >
                        {item.badgeText}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Footer info: PH Statutory Compliance Status */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50">
        <div className="rounded-md border border-slate-200 bg-white p-2.5 text-[11px]">
          <div className="flex items-center justify-between text-slate-700 font-semibold mb-1">
            <span>Statutory Status</span>
            <span className="text-[10px] text-emerald-600 font-bold">2025/2026 ACTIVE</span>
          </div>
          <div className="text-[10px] text-slate-500 space-y-0.5">
            <div>SSS: 15% (10% ER / 5% EE)</div>
            <div>PhilHealth: 5% (₱10k - ₱100k)</div>
            <div>Pag-IBIG: 2% (₱10,000 cap)</div>
            <div>BIR: TRAIN Semi-Monthly</div>
          </div>
        </div>
      </div>
    </aside>
  );
};
