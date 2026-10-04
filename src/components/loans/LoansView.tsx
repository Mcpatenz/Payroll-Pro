/**
 * Payroll Pro — Loans & Advances Module
 * Manages SSS Salary Loans, Pag-IBIG Multi-Purpose Loans (MPL), and Company Cash Advances
 */

import React, { useState } from 'react';
import { usePayroll } from '../../context/PayrollContext';
import { LoanType, EmployeeLoan } from '../../types';
import { formatPHP } from '../../lib/statutoryEngine';
import { CreditCard, Plus, Search, Filter, CheckCircle2, X } from 'lucide-react';

export const LoansView: React.FC = () => {
  const { loans, employees, addLoan } = usePayroll();
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    employeeId: employees[0]?.id || '',
    type: 'SSS_SALARY_LOAN' as LoanType,
    referenceNumber: `SSS-LN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    principal: 30000,
    interestRate: 10,
    termMonths: 24,
    startDate: new Date().toISOString().split('T')[0]
  });

  const activeLoans = loans.filter((l) => l.active && l.remainingBalance > 0);
  const totalPrincipal = loans.reduce((sum, l) => sum + l.principal, 0);
  const totalRemaining = loans.reduce((sum, l) => sum + l.remainingBalance, 0);
  const totalMonthlyAmort = activeLoans.reduce((sum, l) => sum + l.monthlyAmortization, 0);

  const filtered = loans.filter((l) => {
    const emp = employees.find((e) => e.id === l.employeeId);
    const empName = emp ? `${emp.firstName} ${emp.lastName}`.toLowerCase() : '';
    const matchesSearch = empName.includes(search.toLowerCase()) || l.referenceNumber.toLowerCase().includes(search.toLowerCase());
    const matchesType = selectedType === 'ALL' || l.type === selectedType;
    return matchesSearch && matchesType;
  });

  const handleEnrollLoan = (e: React.FormEvent) => {
    e.preventDefault();
    const principal = Number(form.principal);
    const interest = Number(form.interestRate);
    const term = Number(form.termMonths);

    const totalAmount = principal + principal * (interest / 100);
    const monthlyAmort = Number((totalAmount / term).toFixed(2));
    const semiMonthlyAmort = Number((monthlyAmort / 2).toFixed(2));

    const endDate = new Date(form.startDate);
    endDate.setMonth(endDate.getMonth() + term);

    addLoan({
      employeeId: form.employeeId,
      type: form.type,
      referenceNumber: form.referenceNumber,
      principal,
      interestRate: interest,
      totalAmount,
      termMonths: term,
      monthlyAmortization: monthlyAmort,
      semiMonthlyAmortization: semiMonthlyAmort,
      remainingBalance: totalAmount,
      startDate: form.startDate,
      endDate: endDate.toISOString().split('T')[0],
      active: true
    });

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Loans &amp; Advances</h1>
          <p className="text-xs text-slate-500">
            Track SSS, Pag-IBIG, and Company loan amortizations deducted per payroll cutoff
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 rounded-md bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition"
        >
          <Plus className="h-4 w-4" />
          <span>Enroll Loan</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Accounts</span>
          <div className="mt-1 text-2xl font-bold text-slate-900">{activeLoans.length}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Under payroll amortization</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Principal</span>
          <div className="mt-1 text-2xl font-bold text-indigo-600">{formatPHP(totalPrincipal)}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Cumulative loans enrolled</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Remaining Balance</span>
          <div className="mt-1 text-2xl font-bold text-amber-600">{formatPHP(totalRemaining)}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Total unamortized balance</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Monthly Deductions</span>
          <div className="mt-1 text-2xl font-bold text-emerald-600">{formatPHP(totalMonthlyAmort)}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Cutoff: {formatPHP(totalMonthlyAmort / 2)}</div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold uppercase text-slate-500 tracking-wider">
              <tr>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Loan Type</th>
                <th className="py-3 px-4">Reference No.</th>
                <th className="py-3 px-4 text-right">Principal</th>
                <th className="py-3 px-4 text-right">Amortization (Semi-Mo)</th>
                <th className="py-3 px-4 text-right">Remaining Balance</th>
                <th className="py-3 px-4 text-center">Term</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((l) => {
                const emp = employees.find((e) => e.id === l.employeeId);
                return (
                  <tr key={l.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">
                        {emp ? `${emp.lastName}, ${emp.firstName}` : 'Unknown'}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">{emp?.employeeNumber}</div>
                    </td>

                    <td className="py-3 px-4 font-medium text-slate-800">
                      {l.type.replace(/_/g, ' ')}
                    </td>

                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                      {l.referenceNumber}
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-medium text-slate-900">
                      {formatPHP(l.principal)}
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold text-amber-700">
                      {formatPHP(l.semiMonthlyAmortization)}
                      <div className="text-[10px] text-slate-400 font-normal font-sans">
                        Mo: {formatPHP(l.monthlyAmortization)}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-semibold text-slate-900">
                      {formatPHP(l.remainingBalance)}
                    </td>

                    <td className="py-3 px-4 text-center font-mono text-[11px] text-slate-600">
                      {l.termMonths} mos
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center rounded-sm px-2 py-0.5 text-[10px] font-semibold border ${
                          l.active && l.remainingBalance > 0
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {l.active && l.remainingBalance > 0 ? 'ACTIVE' : 'FULLY PAID'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Enroll Employee Loan</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded p-1 text-slate-400 hover:bg-slate-100 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleEnrollLoan} className="mt-4 space-y-3.5 text-xs">
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
                <label className="block font-medium text-slate-700 mb-1">Loan Program</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as LoanType })}
                  className="w-full rounded border border-slate-300 p-2 text-xs focus:border-indigo-500 focus:outline-hidden"
                >
                  <option value="SSS_SALARY_LOAN">SSS Salary Loan</option>
                  <option value="SSS_CALAMITY_LOAN">SSS Calamity Loan</option>
                  <option value="PAGIBIG_MULTI_PURPOSE">Pag-IBIG Multi-Purpose Loan (MPL)</option>
                  <option value="PAGIBIG_CALAMITY">Pag-IBIG Calamity Loan</option>
                  <option value="COMPANY_CASH_ADVANCE">Company Cash Advance</option>
                  <option value="EMERGENCY_LOAN">Emergency Loan</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Voucher / Reference No.</label>
                <input
                  type="text"
                  required
                  value={form.referenceNumber}
                  onChange={(e) => setForm({ ...form, referenceNumber: e.target.value })}
                  className="w-full rounded border border-slate-300 p-2 font-mono text-xs focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Principal Amount (₱)</label>
                  <input
                    type="number"
                    required
                    value={form.principal}
                    onChange={(e) => setForm({ ...form, principal: Number(e.target.value) })}
                    className="w-full rounded border border-slate-300 p-2 font-mono text-xs focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Interest Rate (%)</label>
                  <input
                    type="number"
                    value={form.interestRate}
                    onChange={(e) => setForm({ ...form, interestRate: Number(e.target.value) })}
                    className="w-full rounded border border-slate-300 p-2 font-mono text-xs focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Term (Months)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={form.termMonths}
                    onChange={(e) => setForm({ ...form, termMonths: Number(e.target.value) })}
                    className="w-full rounded border border-slate-300 p-2 font-mono text-xs focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
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
              </div>

              <div className="rounded bg-slate-50 p-2.5 text-[11px] text-slate-600 border border-slate-200">
                Estimated Amortization: <span className="font-bold text-slate-900 font-mono">{formatPHP((form.principal * (1 + form.interestRate / 100)) / (form.termMonths * 2))}</span> / cutoff
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
                  Enroll Loan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
