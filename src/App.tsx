/**
 * Payroll Pro — Philippine HR & Payroll Management System
 * Core Application Entry Shell
 */

import React, { useState } from 'react';
import { PayrollProvider, usePayroll } from './context/PayrollContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar, ActiveTab } from './components/layout/Sidebar';
import { DashboardView } from './components/dashboard/DashboardView';
import { PayrollView } from './components/payroll/PayrollView';
import { EmployeesView } from './components/employees/EmployeesView';
import { AttendanceView } from './components/attendance/AttendanceView';
import { LeaveView } from './components/leave/LeaveView';
import { OvertimeView } from './components/overtime/OvertimeView';
import { LoansView } from './components/loans/LoansView';
import { PayslipsView } from './components/payslips/PayslipsView';
import { GovernmentReportsView } from './components/reports/GovernmentReportsView';
import { RegistersView } from './components/reports/RegistersView';
import { SettingsView } from './components/settings/SettingsView';
import { AuditView } from './components/audit/AuditView';
import { EmployeePortalView } from './components/ess/EmployeePortalView';
import { TimeClockModal } from './components/attendance/TimeClockModal';

const MainContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('payroll');
  const [isTimeClockOpen, setIsTimeClockOpen] = useState(false);
  const [payslipEmpId, setPayslipEmpId] = useState<string | undefined>(undefined);

  const handleViewPayslip = (empId: string) => {
    setPayslipEmpId(empId);
    setActiveTab('payslips');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar onClockInClick={() => setIsTimeClockOpen(true)} />

      {/* Main Layout Container */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Dynamic Main Workspace */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && (
              <DashboardView onNavigate={(tab) => setActiveTab(tab)} />
            )}

            {/* Core Payroll Processing Table View with Department Filter & Salary Records */}
            {activeTab === 'payroll' && (
              <PayrollView onViewPayslip={handleViewPayslip} />
            )}

            {activeTab === 'employees' && <EmployeesView />}

            {activeTab === 'attendance' && (
              <AttendanceView onOpenTimeClock={() => setIsTimeClockOpen(true)} />
            )}

            {activeTab === 'leave' && <LeaveView />}

            {activeTab === 'overtime' && <OvertimeView />}

            {activeTab === 'loans' && <LoansView />}

            {activeTab === 'payslips' && (
              <PayslipsView initialEmployeeId={payslipEmpId} />
            )}

            {activeTab === 'reports-gov' && <GovernmentReportsView />}

            {activeTab === 'reports-reg' && <RegistersView />}

            {activeTab === 'settings' && <SettingsView />}

            {activeTab === 'audit' && <AuditView />}

            {activeTab === 'ess' && (
              <EmployeePortalView
                onOpenPayslip={handleViewPayslip}
                onOpenTimeClock={() => setIsTimeClockOpen(true)}
              />
            )}
          </div>
        </main>
      </div>

      {/* Global Interactive Biometric Time Clock Modal */}
      <TimeClockModal
        isOpen={isTimeClockOpen}
        onClose={() => setIsTimeClockOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <PayrollProvider>
      <MainContent />
    </PayrollProvider>
  );
}
