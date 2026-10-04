/**
 * Payroll Pro — Audit Trail & Security Logs
 * Immutable system audit logs for four-eyes compliance and SOX/BIR audit trails
 */

import React, { useState } from 'react';
import { usePayroll } from '../../context/PayrollContext';
import { History, Search, Shield, Filter, Calendar } from 'lucide-react';

export const AuditView: React.FC = () => {
  const { auditLogs } = usePayroll();
  const [search, setSearch] = useState('');
  const [selectedModule, setSelectedModule] = useState('ALL');

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.description.toLowerCase().includes(search.toLowerCase()) ||
      log.userName.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase());
    const matchesModule = selectedModule === 'ALL' || log.module === selectedModule;
    return matchesSearch && matchesModule;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Audit Trail</h1>
        <p className="text-xs text-slate-500">
          Permanent log of all salary adjustments, payroll approvals, masterfile changes, and biometric punches
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search action, user, or details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border border-slate-300 pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
            className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:border-indigo-500 focus:outline-hidden"
          >
            <option value="ALL">All Modules</option>
            <option value="PAYROLL">Payroll</option>
            <option value="EMPLOYEE">Employees</option>
            <option value="ATTENDANCE">Attendance</option>
            <option value="LEAVE">Leaves</option>
            <option value="OVERTIME">Overtime</option>
            <option value="LOANS">Loans</option>
            <option value="SETTINGS">Settings</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold uppercase text-slate-500 tracking-wider">
              <tr>
                <th className="py-3 px-4 font-mono">Timestamp</th>
                <th className="py-3 px-4">User &amp; Role</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Module</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4 font-mono">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                    {log.timestamp}
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{log.userName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{log.userRole}</div>
                  </td>

                  <td className="py-3 px-4">
                    <span className="font-mono text-[11px] font-semibold text-indigo-700">
                      {log.action}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700">
                      {log.module}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-slate-700 max-w-md">
                    {log.description}
                  </td>

                  <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                    {log.ipAddress}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
