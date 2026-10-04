/**
 * Payroll Pro — Statutory Rules & Company Policy Settings
 * Dynamic effective-dated configuration tables for SSS, PhilHealth, Pag-IBIG, BIR, and Holidays
 */

import React, { useState } from 'react';
import { usePayroll } from '../../context/PayrollContext';
import { formatPHP } from '../../lib/statutoryEngine';
import { Holiday, HolidayType } from '../../types';
import {
  SlidersHorizontal,
  Shield,
  Save,
  Plus,
  Trash2,
  Calendar,
  Building,
  CheckCircle2
} from 'lucide-react';

type SettingsTab = 'POLICY' | 'SSS' | 'PHILHEALTH' | 'PAGIBIG' | 'BIR' | 'HOLIDAYS';

export const SettingsView: React.FC = () => {
  const {
    company,
    updateCompany,
    payrollPolicy,
    updatePayrollPolicy,
    sssConfig,
    updateSSSConfig,
    philhealthConfig,
    updatePhilHealthConfig,
    pagibigConfig,
    updatePagIBIGConfig,
    birConfig,
    holidays,
    addHoliday,
    deleteHoliday
  } = usePayroll();

  const [activeTab, setActiveTab] = useState<SettingsTab>('POLICY');
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Policy Form state
  const [policyForm, setPolicyForm] = useState({ ...payrollPolicy });
  // PhilHealth Form state
  const [phForm, setPhForm] = useState({ ...philhealthConfig });
  // Pag-IBIG Form state
  const [pagibigForm, setPagibigForm] = useState({ ...pagibigConfig });
  // New holiday modal/form
  const [newHoliday, setNewHoliday] = useState<Omit<Holiday, 'id'>>({
    name: '',
    date: '2026-12-24',
    type: 'SPECIAL_NON_WORKING',
    isPaid: false,
    payMultiplierWorked: 1.3,
    payMultiplierUnworked: 0
  });

  const showToast = (msg: string) => {
    setSaveMessage(msg);
    setTimeout(() => setSaveMessage(null), 3000);
  };

  const handleSavePolicy = (e: React.FormEvent) => {
    e.preventDefault();
    updatePayrollPolicy(policyForm);
    showToast('Company payroll policy rules successfully updated!');
  };

  const handleSavePhilHealth = (e: React.FormEvent) => {
    e.preventDefault();
    updatePhilHealthConfig(phForm);
    showToast('PhilHealth effective parameters successfully saved!');
  };

  const handleSavePagIBIG = (e: React.FormEvent) => {
    e.preventDefault();
    updatePagIBIGConfig(pagibigForm);
    showToast('Pag-IBIG Fund contribution parameters updated!');
  };

  const handleAddHoliday = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHoliday.name) return;
    addHoliday({
      ...newHoliday,
      id: `hol-${Date.now()}`
    });
    setNewHoliday({
      name: '',
      date: '2026-12-24',
      type: 'SPECIAL_NON_WORKING',
      isPaid: false,
      payMultiplierWorked: 1.3,
      payMultiplierUnworked: 0
    });
    showToast('New official holiday added to system calendar!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          Statutory Tables &amp; Payroll Policies
        </h1>
        <p className="text-xs text-slate-500">
          Effective-dated Philippine statutory schedules (SSS, PhilHealth, Pag-IBIG, BIR) and payroll calculation rules
        </p>
      </div>

      {saveMessage && (
        <div className="rounded-md bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{saveMessage}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200 text-xs">
        {[
          { key: 'POLICY', label: 'Company Payroll Policy' },
          { key: 'SSS', label: 'SSS 2025 Contribution Table' },
          { key: 'PHILHEALTH', label: 'PhilHealth 2025 (5%)' },
          { key: 'PAGIBIG', label: 'Pag-IBIG Fund (HDMF)' },
          { key: 'BIR', label: 'BIR TRAIN Tax Tables' },
          { key: 'HOLIDAYS', label: 'Holiday Calendar' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as SettingsTab)}
            className={`px-3 py-1.5 font-semibold rounded-md transition-all ${
              activeTab === tab.key
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Company Payroll Policy */}
      {activeTab === 'POLICY' && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs max-w-2xl">
          <h2 className="text-sm font-bold text-slate-900 mb-1">Company Payroll Policy Configuration</h2>
          <p className="text-xs text-slate-500 mb-4">
            Defines attendance grace periods, monthly divisors for daily/hourly wage conversion, and overtime premiums.
          </p>

          <form onSubmit={handleSavePolicy} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Monthly Divisor (Days/Month)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={policyForm.monthlyDivisor}
                  onChange={(e) => setPolicyForm({ ...policyForm, monthlyDivisor: Number(e.target.value) })}
                  className="w-full rounded border border-slate-300 p-2 font-mono text-xs focus:border-indigo-500 focus:outline-hidden"
                />
                <span className="text-[10px] text-slate-400">
                  Standard: 26 days (or 261 / 313 factor / 12)
                </span>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Standard Work Hours / Day</label>
                <input
                  type="number"
                  required
                  value={policyForm.workHoursPerDay}
                  onChange={(e) => setPolicyForm({ ...policyForm, workHoursPerDay: Number(e.target.value) })}
                  className="w-full rounded border border-slate-300 p-2 font-mono text-xs focus:border-indigo-500 focus:outline-hidden"
                />
                <span className="text-[10px] text-slate-400">DOLE standard: 8 hours</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Tardiness Grace Period (Minutes)</label>
                <input
                  type="number"
                  required
                  value={policyForm.graceMinutes}
                  onChange={(e) => setPolicyForm({ ...policyForm, graceMinutes: Number(e.target.value) })}
                  className="w-full rounded border border-slate-300 p-2 font-mono text-xs focus:border-indigo-500 focus:outline-hidden"
                />
                <span className="text-[10px] text-slate-400">
                  Lates within grace are excused from salary deduction
                </span>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Semi-Monthly Statutory Timing</label>
                <select
                  value={policyForm.statutoryDeductionTiming}
                  onChange={(e) => setPolicyForm({ ...policyForm, statutoryDeductionTiming: e.target.value as any })}
                  className="w-full rounded border border-slate-300 p-2 text-xs focus:border-indigo-500 focus:outline-hidden"
                >
                  <option value="SPLIT_EQUAL">Split Equally (50% 1st cutoff, 50% 2nd cutoff)</option>
                  <option value="FIRST_CUTOFF_ONLY">1st Cutoff Only</option>
                  <option value="SECOND_CUTOFF_ONLY">2nd Cutoff Only</option>
                </select>
              </div>
            </div>

            {/* Overtime Multipliers */}
            <div className="border-t border-slate-100 pt-3">
              <span className="font-semibold text-slate-800 block mb-2">Overtime Multipliers (Philippine Labor Code)</span>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1">Regular Workday OT</label>
                  <input
                    type="number"
                    step="0.01"
                    value={policyForm.regularOtMultiplier}
                    onChange={(e) => setPolicyForm({ ...policyForm, regularOtMultiplier: Number(e.target.value) })}
                    className="w-full rounded border border-slate-300 p-1.5 font-mono text-xs"
                  />
                  <span className="text-[10px] text-slate-400">1.25 (125%)</span>
                </div>
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1">Rest Day OT</label>
                  <input
                    type="number"
                    step="0.01"
                    value={policyForm.restDayMultiplier}
                    onChange={(e) => setPolicyForm({ ...policyForm, restDayMultiplier: Number(e.target.value) })}
                    className="w-full rounded border border-slate-300 p-1.5 font-mono text-xs"
                  />
                  <span className="text-[10px] text-slate-400">1.30 (130%)</span>
                </div>
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1">Regular Holiday OT</label>
                  <input
                    type="number"
                    step="0.01"
                    value={policyForm.regularHolidayMultiplier}
                    onChange={(e) => setPolicyForm({ ...policyForm, regularHolidayMultiplier: Number(e.target.value) })}
                    className="w-full rounded border border-slate-300 p-1.5 font-mono text-xs"
                  />
                  <span className="text-[10px] text-slate-400">2.00 (200%)</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-md bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition"
              >
                <Save className="h-3.5 w-3.5" />
                <span>Save Company Policy</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 2: SSS 2025 Contribution Table */}
      {activeTab === 'SSS' && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                SSS Contribution Schedule (Effective January 1, 2025)
              </h2>
              <p className="text-xs text-slate-500">
                15% Total Rate: 10% Employer Share, 5% Employee Share. Max MSC ₱35,000. Brackets over ₱20,000 MSC allocated to WISP / Mandatory Provident Fund (MPF).
              </p>
            </div>
            <span className="rounded bg-indigo-50 border border-indigo-200 px-2 py-1 text-xs font-mono font-semibold text-indigo-700">
              {sssConfig.brackets.length} Brackets Loaded
            </span>
          </div>

          <div className="overflow-x-auto max-h-96 border rounded-lg">
            <table className="w-full text-left text-xs font-mono">
              <thead className="sticky top-0 bg-slate-100 border-b border-slate-200 text-[11px] font-semibold uppercase text-slate-600">
                <tr>
                  <th className="py-2.5 px-3">Range of Compensation</th>
                  <th className="py-2.5 px-3 text-right">MSC</th>
                  <th className="py-2.5 px-3 text-right">SS EE (5%)</th>
                  <th className="py-2.5 px-3 text-right">SS ER (10%)</th>
                  <th className="py-2.5 px-3 text-right">EC ER</th>
                  <th className="py-2.5 px-3 text-right">MPF EE</th>
                  <th className="py-2.5 px-3 text-right">MPF ER</th>
                  <th className="py-2.5 px-3 text-right font-bold text-slate-900">Total Contribution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sssConfig.brackets.map((b, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2 px-3 text-slate-700 font-sans">
                      {formatPHP(b.minSalary)} – {b.maxSalary > 900000 ? 'and above' : formatPHP(b.maxSalary)}
                    </td>
                    <td className="py-2 px-3 text-right font-bold">{formatPHP(b.msc)}</td>
                    <td className="py-2 px-3 text-right text-slate-600">{formatPHP(b.employeeShare)}</td>
                    <td className="py-2 px-3 text-right text-slate-600">{formatPHP(b.employerShare)}</td>
                    <td className="py-2 px-3 text-right text-slate-500">{formatPHP(b.ecContribution)}</td>
                    <td className="py-2 px-3 text-right text-slate-600">{formatPHP(b.mpfEmployee)}</td>
                    <td className="py-2 px-3 text-right text-slate-600">{formatPHP(b.mpfEmployer)}</td>
                    <td className="py-2 px-3 text-right font-bold text-slate-900">{formatPHP(b.totalContribution)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: PhilHealth 2025 Table */}
      {activeTab === 'PHILHEALTH' && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs max-w-xl">
          <h2 className="text-sm font-bold text-slate-900 mb-1">
            PhilHealth Premium Parameters (Circular 2024-0001 / 2025 Schedule)
          </h2>
          <p className="text-xs text-slate-500 mb-4">
            Published 2025 premium rate is 5.0% split 50/50 between Employee (2.5%) and Employer (2.5%).
          </p>

          <form onSubmit={handleSavePhilHealth} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Premium Rate</label>
                <input
                  type="number"
                  step="0.001"
                  value={phForm.rate}
                  onChange={(e) => setPhForm({ ...phForm, rate: Number(e.target.value) })}
                  className="w-full rounded border border-slate-300 p-2 font-mono text-xs"
                />
                <span className="text-[10px] text-slate-400">Current: 0.05 (5.0%)</span>
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Employee Share Ratio</label>
                <input
                  type="number"
                  step="0.01"
                  value={phForm.employeeSplit}
                  onChange={(e) => setPhForm({ ...phForm, employeeSplit: Number(e.target.value) })}
                  className="w-full rounded border border-slate-300 p-2 font-mono text-xs"
                />
                <span className="text-[10px] text-slate-400">0.50 (50% EE / 50% ER)</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Income Floor (₱)</label>
                <input
                  type="number"
                  value={phForm.floor}
                  onChange={(e) => setPhForm({ ...phForm, floor: Number(e.target.value) })}
                  className="w-full rounded border border-slate-300 p-2 font-mono text-xs"
                />
                <span className="text-[10px] text-slate-400">Min base: ₱10,000 (₱500 premium)</span>
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Income Ceiling (₱)</label>
                <input
                  type="number"
                  value={phForm.ceiling}
                  onChange={(e) => setPhForm({ ...phForm, ceiling: Number(e.target.value) })}
                  className="w-full rounded border border-slate-300 p-2 font-mono text-xs"
                />
                <span className="text-[10px] text-slate-400">Max base: ₱100,000 (₱5,000 premium)</span>
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-md bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition"
              >
                <Save className="h-3.5 w-3.5" />
                <span>Save PhilHealth Settings</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 4: Pag-IBIG Fund */}
      {activeTab === 'PAGIBIG' && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs max-w-xl">
          <h2 className="text-sm font-bold text-slate-900 mb-1">
            Pag-IBIG Fund (HDMF) Contribution Rules
          </h2>
          <p className="text-xs text-slate-500 mb-4">
            Standard: 1% for compensation ≤ ₱1,500; 2% for &gt; ₱1,500. Employer counterpart 2%. Maximum compensation base up to ₱10,000.
          </p>

          <form onSubmit={handleSavePagIBIG} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Threshold Salary (₱)</label>
                <input
                  type="number"
                  value={pagibigForm.thresholdSalary}
                  onChange={(e) => setPagibigForm({ ...pagibigForm, thresholdSalary: Number(e.target.value) })}
                  className="w-full rounded border border-slate-300 p-2 font-mono text-xs"
                />
                <span className="text-[10px] text-slate-400">Default: ₱1,500</span>
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Maximum Base Compensation (₱)</label>
                <input
                  type="number"
                  value={pagibigForm.maxCompensationBase}
                  onChange={(e) => setPagibigForm({ ...pagibigForm, maxCompensationBase: Number(e.target.value) })}
                  className="w-full rounded border border-slate-300 p-2 font-mono text-xs"
                />
                <span className="text-[10px] text-slate-400">₱10,000 (₱200 EE / ₱200 ER)</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Employee Rate (Above Threshold)</label>
                <input
                  type="number"
                  step="0.01"
                  value={pagibigForm.rateAboveThreshold}
                  onChange={(e) => setPagibigForm({ ...pagibigForm, rateAboveThreshold: Number(e.target.value) })}
                  className="w-full rounded border border-slate-300 p-2 font-mono text-xs"
                />
                <span className="text-[10px] text-slate-400">0.02 (2.0%)</span>
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Employer Counterpart Rate</label>
                <input
                  type="number"
                  step="0.01"
                  value={pagibigForm.employerRate}
                  onChange={(e) => setPagibigForm({ ...pagibigForm, employerRate: Number(e.target.value) })}
                  className="w-full rounded border border-slate-300 p-2 font-mono text-xs"
                />
                <span className="text-[10px] text-slate-400">0.02 (2.0%)</span>
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-md bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition"
              >
                <Save className="h-3.5 w-3.5" />
                <span>Save Pag-IBIG Settings</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 5: BIR TRAIN Tax Tables */}
      {activeTab === 'BIR' && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              BIR Revised Withholding Tax Tables (Republic Act No. 10963 / TRAIN Law)
            </h2>
            <p className="text-xs text-slate-500">
              Prescribed withholding tax table used for semi-monthly and monthly payroll frequencies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Semi-Monthly Brackets */}
            <div>
              <div className="font-semibold text-slate-800 text-xs mb-2">Semi-Monthly Tax Brackets</div>
              <div className="overflow-x-auto border rounded-lg">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-50 border-b text-[10px] uppercase text-slate-600">
                    <tr>
                      <th className="py-2 px-3">Taxable Range</th>
                      <th className="py-2 px-3 text-right">Base Tax</th>
                      <th className="py-2 px-3 text-right">Excess Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {birConfig.bracketsSemiMonthly.map((b, i) => (
                      <tr key={i}>
                        <td className="py-2 px-3">
                          {formatPHP(b.minIncome)} – {b.maxIncome > 5000000 ? 'above' : formatPHP(b.maxIncome)}
                        </td>
                        <td className="py-2 px-3 text-right font-medium">{formatPHP(b.baseTax)}</td>
                        <td className="py-2 px-3 text-right font-bold">{(b.excessRate * 100).toFixed(0)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Monthly Brackets */}
            <div>
              <div className="font-semibold text-slate-800 text-xs mb-2">Monthly Tax Brackets</div>
              <div className="overflow-x-auto border rounded-lg">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-50 border-b text-[10px] uppercase text-slate-600">
                    <tr>
                      <th className="py-2 px-3">Taxable Range</th>
                      <th className="py-2 px-3 text-right">Base Tax</th>
                      <th className="py-2 px-3 text-right">Excess Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {birConfig.bracketsMonthly.map((b, i) => (
                      <tr key={i}>
                        <td className="py-2 px-3">
                          {formatPHP(b.minIncome)} – {b.maxIncome > 5000000 ? 'above' : formatPHP(b.maxIncome)}
                        </td>
                        <td className="py-2 px-3 text-right font-medium">{formatPHP(b.baseTax)}</td>
                        <td className="py-2 px-3 text-right font-bold">{(b.excessRate * 100).toFixed(0)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Holidays */}
      {activeTab === 'HOLIDAYS' && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Philippine Official Holidays Calendar (2026)
              </h2>
              <p className="text-xs text-slate-500">
                Regular Holidays (200% worked, 100% unworked) and Special Non-Working Holidays (130% worked).
              </p>
            </div>
          </div>

          <form onSubmit={handleAddHoliday} className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">Holiday Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Quezon City Day"
                value={newHoliday.name}
                onChange={(e) => setNewHoliday({ ...newHoliday, name: e.target.value })}
                className="w-full rounded border border-slate-300 p-1.5 text-xs bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">Date</label>
              <input
                type="date"
                required
                value={newHoliday.date}
                onChange={(e) => setNewHoliday({ ...newHoliday, date: e.target.value })}
                className="w-full rounded border border-slate-300 p-1.5 font-mono text-xs bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">Holiday Classification</label>
              <select
                value={newHoliday.type}
                onChange={(e) => {
                  const t = e.target.value as HolidayType;
                  setNewHoliday({
                    ...newHoliday,
                    type: t,
                    isPaid: t === 'REGULAR',
                    payMultiplierWorked: t === 'REGULAR' ? 2.0 : 1.3
                  });
                }}
                className="w-full rounded border border-slate-300 p-1.5 text-xs bg-white"
              >
                <option value="REGULAR">Regular Holiday (200%)</option>
                <option value="SPECIAL_NON_WORKING">Special Non-Working (130%)</option>
                <option value="COMPANY">Company Holiday</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full rounded bg-indigo-600 py-1.5 px-3 text-xs font-semibold text-white hover:bg-indigo-700 transition"
              >
                + Add Holiday
              </button>
            </div>
          </form>

          <div className="overflow-x-auto border rounded-lg max-h-80">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-slate-100 border-b border-slate-200 text-[11px] font-semibold uppercase text-slate-600">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Holiday Name</th>
                  <th className="py-2.5 px-3">Classification</th>
                  <th className="py-2.5 px-3 text-center">Worked Rate</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {holidays.map((h) => (
                  <tr key={h.id} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-mono font-medium text-slate-900">{h.date}</td>
                    <td className="py-2 px-3 font-semibold text-slate-800">{h.name}</td>
                    <td className="py-2 px-3 text-slate-600">{h.type.replace(/_/g, ' ')}</td>
                    <td className="py-2 px-3 text-center font-bold font-mono">
                      {(h.payMultiplierWorked * 100).toFixed(0)}%
                    </td>
                    <td className="py-2 px-3 text-right">
                      <button
                        onClick={() => deleteHoliday(h.id)}
                        className="rounded p-1 text-slate-400 hover:text-red-600 transition"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
