/**
 * Payroll Pro — Leave Management Module
 * Philippine statutory leave (VL, SL, SIL, Maternity/Paternity, Bereavement) & approvals
 */

import React, { useState } from 'react';
import { usePayroll } from '../../context/PayrollContext';
import { LeaveType, LeaveRequest } from '../../types';
import {
  CalendarDays,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  X,
  AlertCircle
} from 'lucide-react';

export const LeaveView: React.FC = () => {
  const {
    leaveRequests,
    employees,
    submitLeaveRequest,
    approveLeaveRequest,
    rejectLeaveRequest,
    currentRole,
    currentUserName
  } = usePayroll();

  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    employeeId: employees[0]?.id || '',
    leaveType: 'VACATION' as LeaveType,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    days: 1,
    reason: ''
  });

  const canApprove = ['OWNER', 'SUPER_ADMIN', 'HR_ADMIN', 'MANAGER', 'SUPERVISOR'].includes(
    currentRole
  );

  const filteredRequests = leaveRequests.filter((l) => {
    const emp = employees.find((e) => e.id === l.employeeId);
    const empName = emp ? `${emp.firstName} ${emp.lastName}`.toLowerCase() : '';
    const matchesSearch = empName.includes(search.toLowerCase()) || l.reason?.toLowerCase().includes(search.toLowerCase());
    const matchesType = selectedType === 'ALL' || l.leaveType === selectedType;
    const matchesStatus = selectedStatus === 'ALL' || l.status === selectedStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleCreateLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.reason) {
      alert('Please specify the reason for the leave application.');
      return;
    }

    submitLeaveRequest({
      employeeId: form.employeeId,
      leaveType: form.leaveType,
      startDate: form.startDate,
      endDate: form.endDate,
      days: Number(form.days),
      reason: form.reason
    });

    setIsModalOpen(false);
    setForm({
      ...form,
      reason: ''
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Leave Management</h1>
          <p className="text-xs text-slate-500">
            Track statutory Service Incentive Leaves (SIL), vacation, sick, and emergency leaves
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 rounded-md bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition"
        >
          <Plus className="h-4 w-4" />
          <span>Apply for Leave</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Pending Reviews</span>
          <div className="mt-1 text-2xl font-bold text-amber-600">
            {leaveRequests.filter((l) => l.status === 'PENDING').length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Awaiting supervisor signoff</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Approved Leaves</span>
          <div className="mt-1 text-2xl font-bold text-emerald-600">
            {leaveRequests.filter((l) => l.status === 'APPROVED').length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Credited to attendance</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Statutory SIL Credits</span>
          <div className="mt-1 text-2xl font-bold text-indigo-600">5.0 Days</div>
          <div className="text-[11px] text-slate-400 mt-0.5">DOLE Labor Code mandate</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Days Filed</span>
          <div className="mt-1 text-2xl font-bold text-slate-900">
            {leaveRequests.reduce((sum, l) => sum + Number(l.days), 0)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Current fiscal cycle</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search employee or reason..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border border-slate-300 pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:border-indigo-500 focus:outline-hidden"
          >
            <option value="ALL">All Leave Types</option>
            <option value="VACATION">Vacation Leave</option>
            <option value="SICK">Sick Leave</option>
            <option value="SERVICE_INCENTIVE">Service Incentive (SIL)</option>
            <option value="EMERGENCY">Emergency Leave</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:border-indigo-500 focus:outline-hidden"
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Leave Requests Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold uppercase text-slate-500 tracking-wider">
              <tr>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Leave Type</th>
                <th className="py-3 px-4">Period</th>
                <th className="py-3 px-4 text-center">Days</th>
                <th className="py-3 px-4">Reason &amp; Remarks</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Reviewed By</th>
                {canApprove && <th className="py-3 px-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRequests.map((req) => {
                const emp = employees.find((e) => e.id === req.employeeId);
                return (
                  <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">
                        {emp ? `${emp.lastName}, ${emp.firstName}` : 'Unknown'}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">{emp?.employeeNumber}</div>
                    </td>

                    <td className="py-3 px-4 font-medium text-slate-800">
                      {req.leaveType.replace('_', ' ')}
                    </td>

                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                      {req.startDate} to {req.endDate}
                    </td>

                    <td className="py-3 px-4 text-center font-bold font-mono text-slate-900">
                      {req.days}
                    </td>

                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate" title={req.reason}>
                      {req.reason}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center rounded-sm px-2 py-0.5 text-[10px] font-semibold border ${
                          req.status === 'APPROVED'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : req.status === 'PENDING'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-red-50 text-red-700 border-red-200'
                        }`}
                      >
                        {req.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-[11px] text-slate-500">
                      {req.reviewedBy ? (
                        <div>
                          <div className="font-medium text-slate-800">{req.reviewedBy}</div>
                          <div className="text-[10px] text-slate-400">{req.reviewedAt}</div>
                        </div>
                      ) : (
                        <span className="italic text-slate-400">Awaiting signoff</span>
                      )}
                    </td>

                    {canApprove && (
                      <td className="py-3 px-4 text-right">
                        {req.status === 'PENDING' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => approveLeaveRequest(req.id)}
                              className="rounded bg-emerald-50 border border-emerald-200 px-2 py-1 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100 transition"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => {
                                const reason = prompt('State reason for rejection:');
                                if (reason) rejectLeaveRequest(req.id, reason);
                              }}
                              className="rounded bg-red-50 border border-red-200 px-2 py-1 text-[11px] font-semibold text-red-700 hover:bg-red-100 transition"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">—</span>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Apply Leave Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">File Leave Request</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded p-1 text-slate-400 hover:bg-slate-100 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateLeave} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Employee</label>
                <select
                  value={form.employeeId}
                  onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
                  className="w-full rounded border border-slate-300 p-2 text-xs focus:border-indigo-500 focus:outline-hidden"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.employeeNumber} — {emp.lastName}, {emp.firstName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Leave Type</label>
                <select
                  value={form.leaveType}
                  onChange={(e) => setForm({ ...form, leaveType: e.target.value as LeaveType })}
                  className="w-full rounded border border-slate-300 p-2 text-xs focus:border-indigo-500 focus:outline-hidden"
                >
                  <option value="VACATION">Vacation Leave (VL)</option>
                  <option value="SICK">Sick Leave (SL)</option>
                  <option value="SERVICE_INCENTIVE">Service Incentive Leave (SIL)</option>
                  <option value="EMERGENCY">Emergency Leave (EL)</option>
                  <option value="MATERNITY">Maternity Leave (105 days)</option>
                  <option value="PATERNITY">Paternity Leave (7 days)</option>
                  <option value="BEREAVEMENT">Bereavement Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className="w-full rounded border border-slate-300 p-2 font-mono text-xs focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    className="w-full rounded border border-slate-300 p-2 font-mono text-xs focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Number of Days</label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  required
                  value={form.days}
                  onChange={(e) => setForm({ ...form, days: Number(e.target.value) })}
                  className="w-full rounded border border-slate-300 p-2 font-mono text-xs focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Reason &amp; Details *</label>
                <textarea
                  rows={3}
                  required
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  placeholder="State official reason for absence or leave..."
                  className="w-full rounded border border-slate-300 p-2 text-xs focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded border border-slate-200 px-3 py-1.5 text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-indigo-600 px-4 py-1.5 font-semibold text-white hover:bg-indigo-700 transition"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
