/**
 * Payroll Pro — Attendance & Daily Time Record (DTR) Module
 * Handles biometric punch logs, late/undertime minutes, CSV imports, and shifts
 */

import React, { useState } from 'react';
import { usePayroll } from '../../context/PayrollContext';
import { AttendanceRecord, AttendanceStatus } from '../../types';
import {
  Clock,
  Upload,
  Calendar,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Plus,
  X
} from 'lucide-react';

interface AttendanceViewProps {
  onOpenTimeClock: () => void;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({ onOpenTimeClock }) => {
  const { attendances, employees, payrollPolicy, batchImportAttendance } = usePayroll();
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const filteredAttendances = attendances.filter((att) => {
    const emp = employees.find((e) => e.id === att.employeeId);
    const empName = emp ? `${emp.firstName} ${emp.lastName} ${emp.employeeNumber}`.toLowerCase() : '';
    const matchesSearch = empName.includes(search.toLowerCase()) || att.workDate.includes(search);
    const matchesStatus = selectedStatus === 'ALL' || att.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const totalLates = attendances.reduce((sum, a) => sum + a.lateMinutes, 0);
  const totalUndertime = attendances.reduce((sum, a) => sum + a.undertimeMinutes, 0);
  const totalOtMins = attendances.reduce((sum, a) => sum + a.overtimeMinutes, 0);

  const sampleCsvContent = `employeeNumber,workDate,timeIn,timeOut
EMP-00101,2026-10-08,07:55,17:05
EMP-00102,2026-10-08,08:02,17:15
EMP-00103,2026-10-08,08:25,17:00
EMP-00105,2026-10-08,08:40,17:00
EMP-00108,2026-10-08,08:00,16:30`;

  const handleProcessCsv = () => {
    if (!csvText.trim()) return;
    try {
      const lines = csvText.trim().split('\n');
      const recordsToImport: AttendanceRecord[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const [empNum, date, timeIn, timeOut] = line.split(',').map((s) => s.trim());
        const emp = employees.find((e) => e.employeeNumber === empNum);
        if (!emp) continue;

        // Simple late calculation vs 08:00
        let lateMins = 0;
        if (timeIn) {
          const [h, m] = timeIn.split(':').map(Number);
          const arrivalTotalMins = h * 60 + m;
          const shiftStartMins = 8 * 60; // 08:00
          if (arrivalTotalMins > shiftStartMins) {
            lateMins = arrivalTotalMins - shiftStartMins;
          }
        }

        // Undertime vs 17:00
        let undertimeMins = 0;
        if (timeOut) {
          const [h, m] = timeOut.split(':').map(Number);
          const outTotalMins = h * 60 + m;
          const shiftEndMins = 17 * 60; // 17:00
          if (outTotalMins < shiftEndMins) {
            undertimeMins = shiftEndMins - outTotalMins;
          }
        }

        recordsToImport.push({
          id: `att-import-${Date.now()}-${i}`,
          employeeId: emp.id,
          workDate: date,
          timeIn,
          timeOut,
          scheduledIn: '08:00',
          scheduledOut: '17:00',
          workedMinutes: 480 - lateMins - undertimeMins,
          lateMinutes: lateMins,
          undertimeMinutes: undertimeMins,
          overtimeMinutes: 0,
          nightDiffMinutes: 0,
          status: lateMins > payrollPolicy.graceMinutes ? 'LATE' : 'PRESENT',
          isHoliday: false,
          remarks: 'CSV Biometric Import'
        });
      }

      if (recordsToImport.length > 0) {
        batchImportAttendance(recordsToImport);
        setImportStatus(`Successfully imported ${recordsToImport.length} records!`);
        setTimeout(() => {
          setIsCsvModalOpen(false);
          setImportStatus(null);
          setCsvText('');
        }, 1500);
      } else {
        alert('No matching employee records found in CSV.');
      }
    } catch (err) {
      alert('Error parsing CSV format. Please ensure standard comma-separated lines.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Attendance &amp; DTR</h1>
          <p className="text-xs text-slate-500">
            Biometric Daily Time Records with grace period ({payrollPolicy.graceMinutes} mins) and undertime tracking
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsCsvModalOpen(true)}
            className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition"
          >
            <Upload className="h-3.5 w-3.5" />
            <span>Import Biometric CSV</span>
          </button>
          <button
            onClick={onOpenTimeClock}
            className="flex items-center gap-1.5 rounded-md bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition"
          >
            <Clock className="h-3.5 w-3.5" />
            <span>Time Clock Terminal</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">DTR Entries</span>
          <div className="mt-1 text-2xl font-bold text-slate-900">{attendances.length}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Recorded punch logs</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Late Minutes</span>
          <div className="mt-1 text-2xl font-bold text-amber-600">{totalLates} min</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Grace: {payrollPolicy.graceMinutes} min policy</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Undertime Minutes</span>
          <div className="mt-1 text-2xl font-bold text-slate-800">{totalUndertime} min</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Deducted pro-rata</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Logged Overtime</span>
          <div className="mt-1 text-2xl font-bold text-indigo-600">{(totalOtMins / 60).toFixed(1)} hrs</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Subject to approval</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search employee or date (YYYY-MM-DD)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border border-slate-300 pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:border-indigo-500 focus:outline-hidden"
          >
            <option value="ALL">All Statuses</option>
            <option value="PRESENT">Present</option>
            <option value="LATE">Late</option>
            <option value="ABSENT">Absent</option>
            <option value="HALF_DAY">Half Day</option>
          </select>
        </div>
      </div>

      {/* DTR Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold uppercase text-slate-500 tracking-wider">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Scheduled Shift</th>
                <th className="py-3 px-4 font-mono">Time In</th>
                <th className="py-3 px-4 font-mono">Time Out</th>
                <th className="py-3 px-4 text-center">Late</th>
                <th className="py-3 px-4 text-center">Undertime</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAttendances.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No DTR attendance records match the selected query.
                  </td>
                </tr>
              ) : (
                filteredAttendances.map((att) => {
                  const emp = employees.find((e) => e.id === att.employeeId);
                  const isLateOverGrace = att.lateMinutes > payrollPolicy.graceMinutes;
                  return (
                    <tr key={att.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-slate-900">{att.workDate}</td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">
                          {emp ? `${emp.lastName}, ${emp.firstName}` : 'Unknown'}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">{emp?.employeeNumber}</div>
                      </td>

                      <td className="py-3 px-4 text-slate-500">
                        {att.scheduledIn} – {att.scheduledOut}
                      </td>

                      <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                        {att.timeIn || '—'}
                      </td>

                      <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                        {att.timeOut || '—'}
                      </td>

                      <td className="py-3 px-4 text-center">
                        {att.lateMinutes > 0 ? (
                          <span
                            className={`font-mono font-medium ${
                              isLateOverGrace ? 'text-amber-600 font-bold' : 'text-slate-500'
                            }`}
                          >
                            {att.lateMinutes}m {isLateOverGrace ? '(deduct)' : '(grace)'}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-mono">0</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">
                        {att.undertimeMinutes > 0 ? (
                          <span className="font-mono font-semibold text-amber-700">
                            {att.undertimeMinutes}m
                          </span>
                        ) : (
                          <span className="text-slate-400 font-mono">0</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center rounded-sm px-2 py-0.5 text-[10px] font-semibold border ${
                            att.status === 'PRESENT'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : att.status === 'LATE'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {att.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-[11px] text-slate-500 italic">
                        {att.remarks || '—'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CSV Import Modal */}
      {isCsvModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">Import Biometric DTR (CSV)</h3>
              </div>
              <button
                onClick={() => setIsCsvModalOpen(false)}
                className="rounded p-1 text-slate-400 hover:bg-slate-100 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-3 space-y-3 text-xs">
              <p className="text-slate-600">
                Paste raw biometric export text or CSV content below. Required format:
                <code className="block mt-1 font-mono text-[11px] bg-slate-100 p-1.5 rounded text-slate-800">
                  employeeNumber,workDate,timeIn,timeOut
                </code>
              </p>

              <div>
                <button
                  type="button"
                  onClick={() => setCsvText(sampleCsvContent)}
                  className="text-[11px] text-indigo-600 hover:underline font-semibold"
                >
                  Load Sample Biometric Batch
                </button>
              </div>

              <textarea
                rows={7}
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                placeholder={sampleCsvContent}
                className="w-full rounded border border-slate-300 p-2 font-mono text-xs text-slate-800 focus:border-indigo-500 focus:outline-hidden"
              />

              {importStatus && (
                <div className="rounded bg-emerald-50 border border-emerald-200 p-2 text-xs text-emerald-800 flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>{importStatus}</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => setIsCsvModalOpen(false)}
                  className="rounded border border-slate-200 px-3 py-1.5 text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleProcessCsv}
                  className="rounded bg-indigo-600 px-4 py-1.5 font-semibold text-white hover:bg-indigo-700 transition"
                >
                  Parse &amp; Import
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
