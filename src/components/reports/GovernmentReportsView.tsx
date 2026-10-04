/**
 * Payroll Pro — Philippine Government Statutory Reports Module
 * Generates official compliance schedules for SSS (R-3), PhilHealth (RF-1), Pag-IBIG (MCRF), and BIR (Form 1601-C)
 */

import React, { useState } from 'react';
import { usePayroll } from '../../context/PayrollContext';
import { formatPHP } from '../../lib/statutoryEngine';
import {
  FileSpreadsheet,
  Download,
  Printer,
  Shield,
  Building,
  CheckCircle2,
  FileText
} from 'lucide-react';

type AgencyTab = 'SSS' | 'PHILHEALTH' | 'PAGIBIG' | 'BIR';

export const GovernmentReportsView: React.FC = () => {
  const { company, payrollPeriods, activePeriodId, employees } = usePayroll();
  const [activeTab, setActiveTab] = useState<AgencyTab>('SSS');

  const activePeriod =
    payrollPeriods.find((p) => p.id === activePeriodId) || payrollPeriods[0];

  const handlePrint = () => {
    window.print();
  };

  const exportCSV = () => {
    let csvHeader = '';
    let csvRows: string[] = [];
    let filename = '';

    if (activeTab === 'SSS') {
      filename = `SSS_R3_${activePeriod.periodCode}.csv`;
      csvHeader = 'SSS Number,Employee Name,MSC,SS EE,SS ER,EC ER,MPF EE,MPF ER,Total Contribution';
      activePeriod.items.forEach((item) => {
        const emp = employees.find((e) => e.id === item.employeeId);
        const msc = item.basicSalary;
        const total = item.sssEE + item.sssER + item.sssEcER + item.sssMpfEE + item.sssMpfER;
        csvRows.push(
          `"${emp?.sssNumber || ''}","${item.employeeName}",${msc},${item.sssEE},${item.sssER},${item.sssEcER},${item.sssMpfEE},${item.sssMpfER},${total.toFixed(2)}`
        );
      });
    } else if (activeTab === 'PHILHEALTH') {
      filename = `PhilHealth_RF1_${activePeriod.periodCode}.csv`;
      csvHeader = 'PhilHealth PIN,Employee Name,Basic Salary,EE Share,ER Share,Total Premium';
      activePeriod.items.forEach((item) => {
        const emp = employees.find((e) => e.id === item.employeeId);
        const total = item.philhealthEE + item.philhealthER;
        csvRows.push(
          `"${emp?.philhealthNumber || ''}","${item.employeeName}",${item.basicSalary},${item.philhealthEE},${item.philhealthER},${total.toFixed(2)}`
        );
      });
    } else if (activeTab === 'PAGIBIG') {
      filename = `PagIBIG_MCRF_${activePeriod.periodCode}.csv`;
      csvHeader = 'Pag-IBIG MID,Employee Name,Compensation Base,EE Share,ER Share,Total Remittance';
      activePeriod.items.forEach((item) => {
        const emp = employees.find((e) => e.id === item.employeeId);
        const total = item.pagibigEE + item.pagibigER;
        csvRows.push(
          `"${emp?.pagibigNumber || ''}","${item.employeeName}",${item.basicSalary},${item.pagibigEE},${item.pagibigER},${total.toFixed(2)}`
        );
      });
    } else {
      filename = `BIR_1601C_${activePeriod.periodCode}.csv`;
      csvHeader = 'TIN,Employee Name,Gross Compensation,Non-Taxable,Taxable Income,Tax Withheld';
      activePeriod.items.forEach((item) => {
        const emp = employees.find((e) => e.id === item.employeeId);
        csvRows.push(
          `"${emp?.tin || ''}","${item.employeeName}",${item.grossPay},${item.allowanceNonTaxable + item.totalStatutoryEE},${item.taxableIncome},${item.withholdingTax}`
        );
      });
    }

    const blob = new Blob([`${csvHeader}\n${csvRows.join('\n')}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header (No print) */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Government Compliance Reports
          </h1>
          <p className="text-xs text-slate-500">
            Exportable statutory schedules aligned with SSS, PhilHealth, Pag-IBIG, and BIR Form 1601-C
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-md bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 transition"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print Form</span>
          </button>
        </div>
      </div>

      {/* Agency Tabs (No print) */}
      <div className="no-print flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200">
        {[
          { key: 'SSS', label: 'SSS Form R-3 / R-1A (Contribution List)' },
          { key: 'PHILHEALTH', label: 'PhilHealth RF-1 / M-1 (Remittance)' },
          { key: 'PAGIBIG', label: 'Pag-IBIG MCRF (Monthly Schedule)' },
          { key: 'BIR', label: 'BIR Form 1601-C & Compensation Alphalist' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as AgencyTab)}
            className={`flex-1 px-3 py-2 text-xs font-semibold rounded-md transition-all text-center ${
              activeTab === tab.key
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Printable Report Paper Container */}
      <div className="print-container rounded-xl border border-slate-300 bg-white p-6 shadow-xs space-y-5">
        {/* Official Header */}
        <div className="border-b pb-3 border-slate-200 flex justify-between items-start">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
              REPUBLIC OF THE PHILIPPINES
            </div>
            <h2 className="text-base font-bold text-slate-900 mt-0.5">
              {activeTab === 'SSS' && 'SOCIAL SECURITY SYSTEM — MONTHLY CONTRIBUTION LIST (FORM R-3)'}
              {activeTab === 'PHILHEALTH' && 'PHILIPPINE HEALTH INSURANCE CORP. — MONTHLY REMITTANCE (RF-1)'}
              {activeTab === 'PAGIBIG' && 'HOME DEVELOPMENT MUTUAL FUND — MONTHLY REMITTANCE SCHEDULE (MCRF)'}
              {activeTab === 'BIR' && 'BUREAU OF INTERNAL REVENUE — MONTHLY REMITTANCE RETURN (FORM 1601-C)'}
            </h2>
            <div className="text-xs text-slate-600 mt-1">
              Employer: <span className="font-semibold text-slate-900">{company.name}</span> · TIN: {company.tin}
            </div>
          </div>
          <div className="text-right text-xs font-mono text-slate-600">
            <div>Cutoff: {activePeriod.cutoffStart} – {activePeriod.cutoffEnd}</div>
            <div>Remittance Period: {activePeriod.periodCode}</div>
          </div>
        </div>

        {/* Tab 1: SSS R-3 */}
        {activeTab === 'SSS' && (
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-3 text-xs rounded-md bg-slate-50 p-3 border border-slate-200">
              <div>
                <span className="text-[11px] text-slate-400">Employer SSS No:</span>
                <div className="font-mono font-bold text-slate-900">{company.sssNumber}</div>
              </div>
              <div>
                <span className="text-[11px] text-slate-400">Total SSS (EE):</span>
                <div className="font-mono font-bold text-slate-900">{formatPHP(activePeriod.totalSSSEE)}</div>
              </div>
              <div>
                <span className="text-[11px] text-slate-400">Total SSS (ER + EC):</span>
                <div className="font-mono font-bold text-slate-900">{formatPHP(activePeriod.totalSSSER)}</div>
              </div>
              <div>
                <span className="text-[11px] text-slate-400">Total Remittance:</span>
                <div className="font-mono font-bold text-indigo-700">
                  {formatPHP(activePeriod.totalSSSEE + activePeriod.totalSSSER)}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-y border-slate-200 text-[11px] font-semibold uppercase text-slate-600">
                  <tr>
                    <th className="py-2.5 px-3">SS Number</th>
                    <th className="py-2.5 px-3">Employee Name</th>
                    <th className="py-2.5 px-3 text-right">Basic Salary</th>
                    <th className="py-2.5 px-3 text-right">SS (EE)</th>
                    <th className="py-2.5 px-3 text-right">SS (ER)</th>
                    <th className="py-2.5 px-3 text-right">EC (ER)</th>
                    <th className="py-2.5 px-3 text-right">WISP (EE)</th>
                    <th className="py-2.5 px-3 text-right">WISP (ER)</th>
                    <th className="py-2.5 px-3 text-right font-bold">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {activePeriod.items.map((item) => {
                    const emp = employees.find((e) => e.id === item.employeeId);
                    const total = item.sssEE + item.sssER + item.sssEcER + item.sssMpfEE + item.sssMpfER;
                    return (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="py-2 px-3">{emp?.sssNumber || '—'}</td>
                        <td className="py-2 px-3 font-sans font-medium text-slate-900">{item.employeeName}</td>
                        <td className="py-2 px-3 text-right">{formatPHP(item.basicSalary)}</td>
                        <td className="py-2 px-3 text-right">{formatPHP(item.sssEE)}</td>
                        <td className="py-2 px-3 text-right">{formatPHP(item.sssER)}</td>
                        <td className="py-2 px-3 text-right">{formatPHP(item.sssEcER)}</td>
                        <td className="py-2 px-3 text-right">{formatPHP(item.sssMpfEE)}</td>
                        <td className="py-2 px-3 text-right">{formatPHP(item.sssMpfER)}</td>
                        <td className="py-2 px-3 text-right font-bold text-slate-900">{formatPHP(total)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: PhilHealth RF-1 */}
        {activeTab === 'PHILHEALTH' && (
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-3 text-xs rounded-md bg-slate-50 p-3 border border-slate-200">
              <div>
                <span className="text-[11px] text-slate-400">Employer PhilHealth No:</span>
                <div className="font-mono font-bold text-slate-900">{company.philhealthNumber}</div>
              </div>
              <div>
                <span className="text-[11px] text-slate-400">Total Premium (EE):</span>
                <div className="font-mono font-bold text-slate-900">{formatPHP(activePeriod.totalPhilHealthEE)}</div>
              </div>
              <div>
                <span className="text-[11px] text-slate-400">Total Premium (ER):</span>
                <div className="font-mono font-bold text-slate-900">{formatPHP(activePeriod.totalPhilHealthER)}</div>
              </div>
              <div>
                <span className="text-[11px] text-slate-400">Total PhilHealth Remittance:</span>
                <div className="font-mono font-bold text-indigo-700">
                  {formatPHP(activePeriod.totalPhilHealthEE + activePeriod.totalPhilHealthER)}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-y border-slate-200 text-[11px] font-semibold uppercase text-slate-600">
                  <tr>
                    <th className="py-2.5 px-3">PhilHealth PIN</th>
                    <th className="py-2.5 px-3">Employee Name</th>
                    <th className="py-2.5 px-3 text-right">Actual Monthly Salary</th>
                    <th className="py-2.5 px-3 text-right">Employee Share (2.5%)</th>
                    <th className="py-2.5 px-3 text-right">Employer Share (2.5%)</th>
                    <th className="py-2.5 px-3 text-right font-bold">Total Premium</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {activePeriod.items.map((item) => {
                    const emp = employees.find((e) => e.id === item.employeeId);
                    const total = item.philhealthEE + item.philhealthER;
                    return (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="py-2 px-3">{emp?.philhealthNumber || '—'}</td>
                        <td className="py-2 px-3 font-sans font-medium text-slate-900">{item.employeeName}</td>
                        <td className="py-2 px-3 text-right">{formatPHP(item.basicSalary)}</td>
                        <td className="py-2 px-3 text-right">{formatPHP(item.philhealthEE)}</td>
                        <td className="py-2 px-3 text-right">{formatPHP(item.philhealthER)}</td>
                        <td className="py-2 px-3 text-right font-bold text-slate-900">{formatPHP(total)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Pag-IBIG MCRF */}
        {activeTab === 'PAGIBIG' && (
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-3 text-xs rounded-md bg-slate-50 p-3 border border-slate-200">
              <div>
                <span className="text-[11px] text-slate-400">Employer Pag-IBIG No:</span>
                <div className="font-mono font-bold text-slate-900">{company.pagibigNumber}</div>
              </div>
              <div>
                <span className="text-[11px] text-slate-400">Total EE Share:</span>
                <div className="font-mono font-bold text-slate-900">{formatPHP(activePeriod.totalPagIBIGEE)}</div>
              </div>
              <div>
                <span className="text-[11px] text-slate-400">Total ER Share:</span>
                <div className="font-mono font-bold text-slate-900">{formatPHP(activePeriod.totalPagIBIGER)}</div>
              </div>
              <div>
                <span className="text-[11px] text-slate-400">Total Pag-IBIG Remittance:</span>
                <div className="font-mono font-bold text-indigo-700">
                  {formatPHP(activePeriod.totalPagIBIGEE + activePeriod.totalPagIBIGER)}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-y border-slate-200 text-[11px] font-semibold uppercase text-slate-600">
                  <tr>
                    <th className="py-2.5 px-3">Pag-IBIG MID</th>
                    <th className="py-2.5 px-3">Employee Name</th>
                    <th className="py-2.5 px-3 text-right">Compensation Base</th>
                    <th className="py-2.5 px-3 text-right">EE Share</th>
                    <th className="py-2.5 px-3 text-right">ER Counterpart</th>
                    <th className="py-2.5 px-3 text-right font-bold">Total Remittance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {activePeriod.items.map((item) => {
                    const emp = employees.find((e) => e.id === item.employeeId);
                    const total = item.pagibigEE + item.pagibigER;
                    return (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="py-2 px-3">{emp?.pagibigNumber || '—'}</td>
                        <td className="py-2 px-3 font-sans font-medium text-slate-900">{item.employeeName}</td>
                        <td className="py-2 px-3 text-right">{formatPHP(item.basicSalary)}</td>
                        <td className="py-2 px-3 text-right">{formatPHP(item.pagibigEE)}</td>
                        <td className="py-2 px-3 text-right">{formatPHP(item.pagibigER)}</td>
                        <td className="py-2 px-3 text-right font-bold text-slate-900">{formatPHP(total)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: BIR Form 1601-C */}
        {activeTab === 'BIR' && (
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-3 text-xs rounded-md bg-slate-50 p-3 border border-slate-200">
              <div>
                <span className="text-[11px] text-slate-400">Employer TIN &amp; RDO:</span>
                <div className="font-mono font-bold text-slate-900">{company.tin} ({company.rdoCode})</div>
              </div>
              <div>
                <span className="text-[11px] text-slate-400">Total Gross Compensation:</span>
                <div className="font-mono font-bold text-slate-900">{formatPHP(activePeriod.totalGrossPay)}</div>
              </div>
              <div>
                <span className="text-[11px] text-slate-400">Total Statutory / Exempt:</span>
                <div className="font-mono font-bold text-slate-900">
                  {formatPHP(
                    activePeriod.items.reduce(
                      (s, i) => s + i.allowanceNonTaxable + i.totalStatutoryEE,
                      0
                    )
                  )}
                </div>
              </div>
              <div>
                <span className="text-[11px] text-slate-400">Total Tax Withheld (1601-C):</span>
                <div className="font-mono font-bold text-indigo-700">{formatPHP(activePeriod.totalWithholdingTax)}</div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-y border-slate-200 text-[11px] font-semibold uppercase text-slate-600">
                  <tr>
                    <th className="py-2.5 px-3">TIN Number</th>
                    <th className="py-2.5 px-3">Employee Name</th>
                    <th className="py-2.5 px-3 text-right">Gross Pay</th>
                    <th className="py-2.5 px-3 text-right">Non-Taxable Deductions</th>
                    <th className="py-2.5 px-3 text-right">Taxable Compensation</th>
                    <th className="py-2.5 px-3 text-right font-bold">Withholding Tax</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {activePeriod.items.map((item) => {
                    const emp = employees.find((e) => e.id === item.employeeId);
                    return (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="py-2 px-3">{emp?.tin || '—'}</td>
                        <td className="py-2 px-3 font-sans font-medium text-slate-900">{item.employeeName}</td>
                        <td className="py-2 px-3 text-right">{formatPHP(item.grossPay)}</td>
                        <td className="py-2 px-3 text-right">{formatPHP(item.allowanceNonTaxable + item.totalStatutoryEE)}</td>
                        <td className="py-2 px-3 text-right">{formatPHP(item.taxableIncome)}</td>
                        <td className="py-2 px-3 text-right font-bold text-slate-900">{formatPHP(item.withholdingTax)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Certification Signoff Footer */}
        <div className="border-t border-slate-200 pt-4 text-xs text-slate-600 flex justify-between items-end">
          <div>
            <p className="italic">
              I declare under penalties of perjury that this report has been prepared in good faith, verified by me, and to the best of my knowledge and belief, is true and correct pursuant to the provisions of Philippine labor and tax laws.
            </p>
          </div>
          <div className="text-right min-w-[200px]">
            <div className="font-semibold text-slate-900">{company.authorizedSignatory}</div>
            <div className="text-[11px] text-slate-500">{company.signatoryTitle}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
