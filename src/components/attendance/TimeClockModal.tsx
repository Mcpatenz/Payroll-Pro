/**
 * Payroll Pro — Interactive Biometric Time Clock Modal
 * Real-time punch terminal for employees & admins
 */

import React, { useState, useEffect } from 'react';
import { usePayroll } from '../../context/PayrollContext';
import { Clock, CheckCircle2, UserCheck, X, AlertCircle } from 'lucide-react';

interface TimeClockModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TimeClockModal: React.FC<TimeClockModalProps> = ({ isOpen, onClose }) => {
  const { employees, recordAttendancePunch, attendances } = usePayroll();
  const [selectedEmpId, setSelectedEmpId] = useState<string>(employees[0]?.id || '');
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [lastAction, setLastAction] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!isOpen) return null;

  const todayStr = currentTime.toISOString().split('T')[0];
  const currentEmployee = employees.find((e) => e.id === selectedEmpId);
  const todayRecord = attendances.find(
    (a) => a.employeeId === selectedEmpId && a.workDate === todayStr
  );

  const handlePunch = (type: 'IN' | 'OUT') => {
    if (!selectedEmpId) return;
    recordAttendancePunch(selectedEmpId, type);
    setLastAction(
      `Successfully recorded Clock ${type} for ${currentEmployee?.firstName} ${currentEmployee?.lastName} at ${currentTime.toLocaleTimeString()}`
    );
    setTimeout(() => setLastAction(null), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Biometric Time Clock</h3>
              <p className="text-xs text-slate-500">Employee Daily Time Record (DTR) Terminal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Digital Clock Display */}
        <div className="my-5 rounded-lg bg-slate-950 p-4 text-center text-white font-mono shadow-inner">
          <div className="text-3xl font-bold tracking-widest text-emerald-400">
            {currentTime.toLocaleTimeString('en-US', { hour12: true })}
          </div>
          <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider">
            {currentTime.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
        </div>

        {/* Employee Selection */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Employee
            </label>
            <select
              value={selectedEmpId}
              onChange={(e) => setSelectedEmpId(e.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-indigo-500 focus:outline-hidden"
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.employeeNumber} — {emp.lastName}, {emp.firstName} ({emp.currentSalary.salaryType})
                </option>
              ))}
            </select>
          </div>

          {/* Current Punch Status */}
          <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-xs">
            <div className="font-semibold text-slate-800 mb-1">Today's Log:</div>
            {todayRecord ? (
              <div className="space-y-1 text-slate-600">
                <div className="flex justify-between">
                  <span>Time In:</span>
                  <span className="font-semibold text-emerald-700 font-mono">
                    {todayRecord.timeIn || '—'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Time Out:</span>
                  <span className="font-semibold text-blue-700 font-mono">
                    {todayRecord.timeOut || 'Not yet timed out'}
                  </span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-1 mt-1 text-[11px]">
                  <span>Status:</span>
                  <span className="font-medium">{todayRecord.status}</span>
                </div>
              </div>
            ) : (
              <div className="text-slate-500 italic">No attendance punch recorded for today.</div>
            )}
          </div>

          {/* Punch Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => handlePunch('IN')}
              className="flex items-center justify-center gap-1.5 rounded-md bg-emerald-600 py-2.5 px-3 text-xs font-semibold text-white hover:bg-emerald-700 active:scale-98 transition shadow-xs"
            >
              <Clock className="h-3.5 w-3.5" />
              <span>CLOCK IN</span>
            </button>
            <button
              onClick={() => handlePunch('OUT')}
              className="flex items-center justify-center gap-1.5 rounded-md bg-slate-800 py-2.5 px-3 text-xs font-semibold text-white hover:bg-slate-900 active:scale-98 transition shadow-xs"
            >
              <Clock className="h-3.5 w-3.5" />
              <span>CLOCK OUT</span>
            </button>
          </div>

          {lastAction && (
            <div className="flex items-start gap-2 rounded-md bg-emerald-50 border border-emerald-200 p-2.5 text-xs text-emerald-800 animate-in fade-in">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>{lastAction}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
