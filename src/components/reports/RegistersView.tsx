/**
 * Payroll Pro — Payroll Registers & Bank Remittance Advice
 * Comprehensive payroll register, department costing, and bank payroll crediting advice
 */

import React, { useState } from 'react';
import { usePayroll } from '../../context/PayrollContext';
import { formatPHP } from '../../lib/statutoryEngine';
import { BarChart3, Building, CreditCard, Download, Printer } from 'lucide-react';

export const RegistersView: React.FC = () => {
  const { company, payrollPeriods, activePeriodId, departments } = usePayroll();
  const [selectedBank, setSelectedBank] = useState('ALL');

  const activePeriod =
    payrollPeriods.find((p) => p.id === activePeriodId) || payrollPeriods[0];

  const banks = Array.from(new Set(activePeriod.items.map((i) => i.bankName)));

  const filteredItems = activePeriod.items.filter((item) => {
    return selectedBank === 'ALL' || item.bankName === selectedBank;
  });

  const exportBankCsv = () => {
    const header = 'Bank Name,Account Number,Employee Name,Employee Number,Net Amount';
    const rows = filteredItems.map(
      (i) => `"${i.bankName}","${i.bankAccountNumber}","${i.employeeName}","${i.employeeNumber}",${i.netPay}`
    );
    const blob = new Blob([`${header}\n${rows.join('\n')}`], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Bank_Disbursement_${activePeriod.periodCode}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Payroll Registers &amp; Bank Advice
          </h1>
          <p className="text-xs text-slate-500">
            Automated disbursement files, bank advice manifests, and general ledger journal registers
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportBankCsv}
            className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export Bank Advice</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 rounded-md bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 transition"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print Register</span>
          </button>
        </div>
      </div>

      {/* Bank Crediting Advice Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Bank Payroll Disbursement Advice</h2>
            <p className="text-xs text-slate-500">
              Electronic bank batch crediting list for {activePeriod.payDate}
            </p>
          </div>

          <div className="no-print flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Bank Filter:</span>
            <select
              value={selectedBank}
              onChange={(e) => setSelectedBank(e.target.value)}
              className="rounded border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-800"
            >
              <option value="ALL">All Banks ({banks.length})</option>
              {banks.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold uppercase text-slate-600">
              <tr>
                <th className="py-2.5 px-3">Bank Name</th>
                <th className="py-2.5 px-3">Account Number</th>
                <th className="py-2.5 px-3">Employee Name</th>
                <th className="py-2.5 px-3">Employee No</th>
                <th className="py-2.5 px-3 text-right">Net Crediting Amount</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="py-2 px-3 font-semibold text-slate-800">{item.bankName}</td>
                  <td className="py-2 px-3 font-mono font-medium text-slate-900">{item.bankAccountNumber}</td>
                  <td className="py-2 px-3 font-medium text-slate-900">{item.employeeName}</td>
                  <td className="py-2 px-3 font-mono text-slate-500">{item.employeeNumber}</td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-emerald-700">
                    {formatPHP(item.netPay)}
                  </td>
                  <td className="py-2 px-3 text-center">
                    <span className="inline-flex items-center rounded-sm bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
                      READY TO TRANSMIT
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-50 border-t border-slate-200 font-bold text-xs">
              <tr>
                <td colSpan={4} className="py-2.5 px-3 text-slate-900 uppercase">
                  Batch Total ({filteredItems.length} accounts):
                </td>
                <td className="py-2.5 px-3 text-right font-mono text-sm text-emerald-800">
                  {formatPHP(filteredItems.reduce((s, i) => s + i.netPay, 0))}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
