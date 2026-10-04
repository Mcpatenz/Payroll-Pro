/**
 * Payroll Pro — Overtime Management Module
 * Compliant with Philippine Labor Code (Regular 125%, Rest Day 130%, Holiday 200%)
 */

import React, { useState } from 'react';
import { usePayroll } from '../../context/PayrollContext';
import { OvertimeRequest } from '../../types';
import { Timer, Plus, CheckCircle2, XCircle, Search, Filter, X } from 'lucide-react';

export const OvertimeView: React.FC = () => {
  const {
    overtimeRequests,
    employees,
    submitOvertimeRequest,
    approveOvertimeRequest,
    rejectOvertimeRequest,
    payrollPolicy,
    currentRole
  } = usePayroll();

  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    employeeId: employees[0]?.id || '',
    workDate: new Date().toISOString().split('T')[0],
    startTime: '17:30',
    endTime: '20:30',
    hours: 3,
    otType: 'REGULAR_DAY' as OvertimeRequest['otType'],
    reason: ''
  });

  const canApprove = ['OWNER', 'SUPER_ADMIN', 'HR_ADMIN', 'PAYROLL_ADMIN', 'MANAGER', 'SUPERVISOR'].includes(
    currentRole
  );

  const filtered = overtimeRequests.filter((ot) => {
    const emp = employees.find((e) => e.id === ot.employeeId);
    const empName = emp ? `${emp.firstName} ${emp.lastName}`.toLowerCase() : '';
    const matchesSearch = empName.includes(search.toLowerCase()) || ot.reason?.toLowerCase().includes(search.toLowerCase());
    const matchesType = selectedType === 'ALL' || ot.otType === selectedType;
    return matchesSearch && matchesType;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.reason) {
      alert('Please specify the justification for the overtime work.');
      return;
    }

    submitOvertimeRequest({
      employeeId: form.employeeId,
      workDate: form.workDate,
      startTime: form.startTime,
      endTime: form.endTime,
      hours: Number(form.hours),
      otType: form.otType,
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
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Overtime Management</h1>
          <p className="text-xs text-slate-500">
            Labor Code multipliers: Regular Workday (125%), Rest Day (130%), Regular Holiday (200%)
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 rounded-md bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition"
        >
          <Plus className="h-4 w-4" />
          <span>Request Overtime</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Pending Review</span>
          <div className="mt-1 text-2xl font-bold text-amber-600">
            {overtimeRequests.filter((ot) => ot.status === 'PENDING').length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Awaiting supervisor signoff</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Approved OT Hours</span>
          <div className="mt-1 text-2xl font-bold text-emerald-600">
            {overtimeRequests.filter((ot) => ot.status === 'APPROVED').reduce((sum, ot) => sum + ot.hours, 0)} hrs
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Calculated in payroll</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Regular OT Rate</span>
          <div className="mt-1 text-2xl font-bold text-slate-900">
            {(payrollPolicy.regularOtMultiplier * 100).toFixed(0)}%
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">+25% premium standard</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Holiday OT Rate</span>
          <div className="mt-1 text-2xl font-bold text-indigo-600">
            {(payrollPolicy.regularHolidayMultiplier * 100).toFixed(0)}%
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Double pay rate</div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold uppercase text-slate-500 tracking-wider">
              <tr>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Date &amp; Shift</th>
                <th className="py-3 px-4">OT Classification</th>
                <th className="py-3 px-4 text-center">Hours</th>
                <th className="py-3 px-4">Business Justification</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Approved By</th>
                {canApprove && <th className="py-3 px-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((ot) => {
                const emp = employees.find((e) => e.id === ot.employeeId);
                return (
                  <tr key={ot.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">
                        {emp ? `${emp.lastName}, ${emp.firstName}` : 'Unknown'}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">{emp?.employeeNumber}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800 font-mono">{ot.workDate}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {ot.startTime} – {ot.endTime}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-700">
                        {ot.otType === 'REGULAR_DAY'
                          ? 'Regular Day (125%)'
                          : ot.otType === 'REST_DAY'
                          ? 'Rest Day (130%)'
                          : 'Holiday (200%)'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center font-bold font-mono text-slate-900">
                      {ot.hours} hrs
                    </td>

                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate" title={ot.reason}>
                      {ot.reason}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center rounded-sm px-2 py-0.5 text-[10px] font-semibold border ${
                          ot.status === 'APPROVED'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : ot.status === 'PENDING'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-red-50 text-red-700 border-red-200'
                        }`}
                      >
                        {ot.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-[11px] text-slate-500">
                      {ot.approvedBy ? (
                        <div>
                          <div className="font-medium text-slate-800">{ot.approvedBy}</div>
                          <div className="text-[10px] text-slate-400">{ot.approvedAt}</div>
                        </div>
                      ) : (
                        <span className="italic text-slate-400">Awaiting approval</span>
                      )}
                    </td>

                    {canApprove && (
                      <td className="py-3 px-4 text-right">
                        {ot.status === 'PENDING' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => approveOvertimeRequest(ot.id)}
                              className="rounded bg-emerald-50 border border-emerald-200 px-2 py-1 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100 transition"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => rejectOvertimeRequest(ot.id)}
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

      {/* Request Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Request Overtime Authorization</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded p-1 text-slate-400 hover:bg-slate-100 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Work Date</label>
                  <input
                    type="date"
                    required
                    value={form.workDate}
                    onChange={(e) => setForm({ ...form, workDate: e.target.value })}
                    className="w-full rounded border border-slate-300 p-2 font-mono text-xs focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Overtime Type</label>
                  <select
                    value={form.otType}
                    onChange={(e) => setForm({ ...form, otType: e.target.value as any })}
                    className="w-full rounded border border-slate-300 p-2 text-xs focus:border-indigo-500 focus:outline-hidden"
                  >
                    <option value="REGULAR_DAY">Regular Day (125%)</option>
                    <option value="REST_DAY">Rest Day (130%)</option>
                    <option value="SPECIAL_HOLIDAY">Special Holiday (130%)</option>
                    <option value="REGULAR_HOLIDAY">Regular Holiday (200%)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    required
                    value={form.startTime}
                    onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                    className="w-full rounded border border-slate-300 p-2 font-mono text-xs focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">End Time</label>
                  <input
                    type="time"
                    required
                    value={form.endTime}
                    onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                    className="w-full rounded border border-slate-300 p-2 font-mono text-xs focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Total Hours</label>
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    required
                    value={form.hours}
                    onChange={(e) => setForm({ ...form, hours: Number(e.target.value) })}
                    className="w-full rounded border border-slate-300 p-2 font-mono text-xs focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Justification *</label>
                <textarea
                  rows={3}
                  required
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  placeholder="Describe emergency deliverables or client escalation requirements..."
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
