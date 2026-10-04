/**
 * Payroll Pro — Employee Masterlist & Profile Management
 * Comprehensive employee dossier with effective-dated compensation & government IDs
 */

import React, { useState } from 'react';
import { usePayroll } from '../../context/PayrollContext';
import { Employee, EmploymentStatus, EmploymentType } from '../../types';
import { formatPHP, calculateRates, calculateSSS, calculatePhilHealth, calculatePagIBIG } from '../../lib/statutoryEngine';
import {
  Users,
  Search,
  Plus,
  Filter,
  Eye,
  Edit,
  Trash2,
  Building,
  CreditCard,
  FileText,
  Shield,
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const EmployeesView: React.FC = () => {
  const {
    employees,
    departments,
    positions,
    branches,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    payrollPolicy,
    sssConfig,
    philhealthConfig,
    pagibigConfig
  } = usePayroll();

  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [activeEmployee, setActiveEmployee] = useState<Employee | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Form state for creating a new employee
  const [newEmpForm, setNewEmpForm] = useState({
    employeeNumber: `EMP-${100 + employees.length + 1}`,
    firstName: '',
    middleName: '',
    lastName: '',
    gender: 'MALE' as const,
    birthDate: '1995-01-01',
    civilStatus: 'SINGLE' as const,
    email: '',
    mobile: '',
    address: '',
    branchId: branches[0]?.id || '',
    departmentId: departments[0]?.id || '',
    positionId: positions[0]?.id || '',
    employmentType: 'REGULAR' as EmploymentType,
    status: 'ACTIVE' as EmploymentStatus,
    dateHired: new Date().toISOString().split('T')[0],
    tin: '',
    sssNumber: '',
    philhealthNumber: '',
    pagibigNumber: '',
    bankName: 'BDO Unibank',
    bankAccountNumber: '',
    basicSalary: 35000,
    allowanceTaxable: 1000,
    allowanceNonTaxable: 2000,
    emergencyContactName: '',
    emergencyContactRelation: '',
    emergencyContactPhone: ''
  });

  const filteredEmployees = employees.filter((emp) => {
    const fullName = `${emp.firstName} ${emp.middleName || ''} ${emp.lastName}`.toLowerCase();
    const matchesSearch =
      fullName.includes(search.toLowerCase()) ||
      emp.employeeNumber.toLowerCase().includes(search.toLowerCase()) ||
      emp.tin.includes(search);
    const matchesDept = selectedDept === 'ALL' || emp.departmentId === selectedDept;
    const matchesStatus = selectedStatus === 'ALL' || emp.status === selectedStatus;
    return matchesSearch && matchesDept && matchesStatus;
  });

  const handleCreateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmpForm.firstName || !newEmpForm.lastName || !newEmpForm.employeeNumber) {
      alert('Please fill out the required employee name and number.');
      return;
    }

    const rates = calculateRates(Number(newEmpForm.basicSalary), payrollPolicy);

    addEmployee({
      employeeNumber: newEmpForm.employeeNumber,
      firstName: newEmpForm.firstName,
      middleName: newEmpForm.middleName,
      lastName: newEmpForm.lastName,
      gender: newEmpForm.gender,
      birthDate: newEmpForm.birthDate,
      civilStatus: newEmpForm.civilStatus,
      email: newEmpForm.email || `${newEmpForm.firstName.toLowerCase()}@acrovatech.ph`,
      mobile: newEmpForm.mobile || '+63 900 000 0000',
      address: newEmpForm.address || 'Metro Manila, Philippines',
      branchId: newEmpForm.branchId,
      departmentId: newEmpForm.departmentId,
      positionId: newEmpForm.positionId,
      employmentType: newEmpForm.employmentType,
      status: newEmpForm.status,
      dateHired: newEmpForm.dateHired,
      tin: newEmpForm.tin || '000-000-000-000',
      sssNumber: newEmpForm.sssNumber || '00-0000000-0',
      philhealthNumber: newEmpForm.philhealthNumber || '00-000000000-0',
      pagibigNumber: newEmpForm.pagibigNumber || '0000-0000-0000',
      bankName: newEmpForm.bankName,
      bankAccountNumber: newEmpForm.bankAccountNumber || '0000-0000-00',
      currentSalary: {
        id: `sal-${Date.now()}`,
        employeeId: '',
        salaryType: 'MONTHLY',
        basicSalary: Number(newEmpForm.basicSalary),
        dailyRate: rates.dailyRate,
        hourlyRate: rates.hourlyRate,
        allowanceTaxable: Number(newEmpForm.allowanceTaxable),
        allowanceNonTaxable: Number(newEmpForm.allowanceNonTaxable),
        effectiveFrom: newEmpForm.dateHired
      },
      leaveBalance: {
        vacationLeaveTotal: 15,
        vacationLeaveUsed: 0,
        sickLeaveTotal: 15,
        sickLeaveUsed: 0,
        serviceIncentiveTotal: 5,
        serviceIncentiveUsed: 0,
        emergencyLeaveTotal: 3,
        emergencyLeaveUsed: 0
      },
      emergencyContactName: newEmpForm.emergencyContactName || 'Family Member',
      emergencyContactRelation: newEmpForm.emergencyContactRelation || 'Parent',
      emergencyContactPhone: newEmpForm.emergencyContactPhone || '+63 900 000 0000'
    });

    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Employee Masterlist</h1>
          <p className="text-xs text-slate-500">
            Total of {employees.length} personnel enrolled across {departments.length} departments
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center gap-1.5 rounded-md bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition"
        >
          <Plus className="h-4 w-4" />
          <span>Add Employee</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, ID, or TIN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border border-slate-300 pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Department Filter */}
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:border-indigo-500 focus:outline-hidden"
          >
            <option value="ALL">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:border-indigo-500 focus:outline-hidden"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="PROBATIONARY">Probationary</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </div>

      {/* Employee Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold uppercase text-slate-500 tracking-wider">
              <tr>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Department &amp; Position</th>
                <th className="py-3 px-4">Employment</th>
                <th className="py-3 px-4 text-right">Basic Monthly Salary</th>
                <th className="py-3 px-4">Government IDs</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEmployees.map((emp) => {
                const dept = departments.find((d) => d.id === emp.departmentId);
                const pos = positions.find((p) => p.id === emp.positionId);
                return (
                  <tr key={emp.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">
                        {emp.lastName}, {emp.firstName} {emp.middleName ? emp.middleName[0] + '.' : ''}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">{emp.employeeNumber}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">{dept?.name || 'General'}</div>
                      <div className="text-[11px] text-slate-500">{pos?.name || 'Staff'}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-700">{emp.employmentType}</div>
                      <div className="text-[11px] text-slate-400">Hired {emp.dateHired}</div>
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-semibold text-slate-900">
                      {formatPHP(emp.currentSalary.basicSalary)}
                      <div className="text-[10px] text-slate-400 font-sans font-normal">
                        Daily: {formatPHP(emp.currentSalary.dailyRate)}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-[11px] font-mono text-slate-500">
                      <div>TIN: {emp.tin}</div>
                      <div>SSS: {emp.sssNumber}</div>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center rounded-sm px-2 py-0.5 text-[10px] font-semibold border ${
                          emp.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {emp.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setActiveEmployee(emp)}
                          className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
                          title="View Full Employee Dossier"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Remove employee ${emp.lastName}, ${emp.firstName}?`)) {
                              deleteEmployee(emp.id);
                            }
                          }}
                          className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
                          title="Remove Employee"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Employee Dossier Modal */}
      {activeEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {activeEmployee.lastName}, {activeEmployee.firstName} {activeEmployee.middleName || ''}
                </h3>
                <p className="text-xs text-slate-500 font-mono">{activeEmployee.employeeNumber} · {activeEmployee.email}</p>
              </div>
              <button
                onClick={() => setActiveEmployee(null)}
                className="rounded p-1 text-slate-400 hover:bg-slate-100 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-5 text-xs text-slate-700">
              {/* Statutory ID Card */}
              <div className="rounded-lg bg-slate-50 p-3.5 border border-slate-200">
                <div className="font-semibold text-slate-900 mb-2 flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5 text-indigo-600" />
                  <span>Philippine Statutory &amp; Government Numbers</span>
                </div>
                <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                  <div>TIN: <span className="font-semibold text-slate-900">{activeEmployee.tin}</span></div>
                  <div>SSS No: <span className="font-semibold text-slate-900">{activeEmployee.sssNumber}</span></div>
                  <div>PhilHealth PIN: <span className="font-semibold text-slate-900">{activeEmployee.philhealthNumber}</span></div>
                  <div>Pag-IBIG MID: <span className="font-semibold text-slate-900">{activeEmployee.pagibigNumber}</span></div>
                </div>
              </div>

              {/* Compensation Breakdown */}
              <div>
                <div className="font-semibold text-slate-900 mb-2">Compensation &amp; Rate Structure</div>
                <div className="grid grid-cols-3 gap-3 rounded-lg border border-slate-200 p-3">
                  <div>
                    <span className="text-[11px] text-slate-400">Monthly Basic</span>
                    <div className="text-sm font-bold text-slate-900 font-mono">
                      {formatPHP(activeEmployee.currentSalary.basicSalary)}
                    </div>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400">Daily Rate (Divisor {payrollPolicy.monthlyDivisor})</span>
                    <div className="text-sm font-semibold text-slate-800 font-mono">
                      {formatPHP(activeEmployee.currentSalary.dailyRate)}
                    </div>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400">Hourly Rate (8h/day)</span>
                    <div className="text-sm font-semibold text-slate-800 font-mono">
                      {formatPHP(activeEmployee.currentSalary.hourlyRate)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Statutory Contributions Projection Preview */}
              <div>
                <div className="font-semibold text-slate-900 mb-2">
                  Monthly Statutory Contributions Projection (2025 Tables)
                </div>
                {(() => {
                  const sss = calculateSSS(activeEmployee.currentSalary.basicSalary, sssConfig);
                  const ph = calculatePhilHealth(activeEmployee.currentSalary.basicSalary, philhealthConfig);
                  const hdmf = calculatePagIBIG(activeEmployee.currentSalary.basicSalary, pagibigConfig);
                  return (
                    <div className="grid grid-cols-3 gap-3 text-[11px]">
                      <div className="rounded-md border border-slate-200 p-2.5 bg-slate-50">
                        <div className="font-semibold text-slate-800">SSS (MSC: {formatPHP(sss.msc)})</div>
                        <div className="mt-1 text-slate-600">Employee: {formatPHP(sss.totalEE)}</div>
                        <div className="text-slate-600">Employer: {formatPHP(sss.totalER)}</div>
                        <div className="font-bold text-slate-900 border-t border-slate-200 mt-1 pt-1">
                          Total: {formatPHP(sss.totalContribution)}
                        </div>
                      </div>

                      <div className="rounded-md border border-slate-200 p-2.5 bg-slate-50">
                        <div className="font-semibold text-slate-800">PhilHealth (5%)</div>
                        <div className="mt-1 text-slate-600">Employee: {formatPHP(ph.employeeShare)}</div>
                        <div className="text-slate-600">Employer: {formatPHP(ph.employerShare)}</div>
                        <div className="font-bold text-slate-900 border-t border-slate-200 mt-1 pt-1">
                          Total: {formatPHP(ph.totalPremium)}
                        </div>
                      </div>

                      <div className="rounded-md border border-slate-200 p-2.5 bg-slate-50">
                        <div className="font-semibold text-slate-800">Pag-IBIG Fund</div>
                        <div className="mt-1 text-slate-600">Employee: {formatPHP(hdmf.employeeShare)}</div>
                        <div className="text-slate-600">Employer: {formatPHP(hdmf.employerShare)}</div>
                        <div className="font-bold text-slate-900 border-t border-slate-200 mt-1 pt-1">
                          Total: {formatPHP(hdmf.totalContribution)}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Bank & Emergency Details */}
              <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-3">
                <div>
                  <span className="font-semibold text-slate-800">Disbursement Bank:</span>
                  <div className="mt-0.5 text-slate-600">
                    {activeEmployee.bankName} — <span className="font-mono">{activeEmployee.bankAccountNumber}</span>
                  </div>
                </div>
                <div>
                  <span className="font-semibold text-slate-800">Emergency Contact:</span>
                  <div className="mt-0.5 text-slate-600">
                    {activeEmployee.emergencyContactName} ({activeEmployee.emergencyContactRelation}) · {activeEmployee.emergencyContactPhone}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Employee Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Enroll New Employee</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="rounded p-1 text-slate-400 hover:bg-slate-100 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateEmployee} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Employee Number *</label>
                  <input
                    type="text"
                    required
                    value={newEmpForm.employeeNumber}
                    onChange={(e) => setNewEmpForm({ ...newEmpForm, employeeNumber: e.target.value })}
                    className="w-full rounded border border-slate-300 p-2 font-mono text-xs focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Employment Type</label>
                  <select
                    value={newEmpForm.employmentType}
                    onChange={(e) => setNewEmpForm({ ...newEmpForm, employmentType: e.target.value as any })}
                    className="w-full rounded border border-slate-300 p-2 text-xs focus:border-indigo-500 focus:outline-hidden"
                  >
                    <option value="REGULAR">Regular</option>
                    <option value="PROBATIONARY">Probationary</option>
                    <option value="CONTRACTUAL">Contractual</option>
                    <option value="PART_TIME">Part Time</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={newEmpForm.firstName}
                    onChange={(e) => setNewEmpForm({ ...newEmpForm, firstName: e.target.value })}
                    className="w-full rounded border border-slate-300 p-2 text-xs focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Middle Name</label>
                  <input
                    type="text"
                    value={newEmpForm.middleName}
                    onChange={(e) => setNewEmpForm({ ...newEmpForm, middleName: e.target.value })}
                    className="w-full rounded border border-slate-300 p-2 text-xs focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={newEmpForm.lastName}
                    onChange={(e) => setNewEmpForm({ ...newEmpForm, lastName: e.target.value })}
                    className="w-full rounded border border-slate-300 p-2 text-xs focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Department</label>
                  <select
                    value={newEmpForm.departmentId}
                    onChange={(e) => setNewEmpForm({ ...newEmpForm, departmentId: e.target.value })}
                    className="w-full rounded border border-slate-300 p-2 text-xs focus:border-indigo-500 focus:outline-hidden"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Position</label>
                  <select
                    value={newEmpForm.positionId}
                    onChange={(e) => setNewEmpForm({ ...newEmpForm, positionId: e.target.value })}
                    className="w-full rounded border border-slate-300 p-2 text-xs focus:border-indigo-500 focus:outline-hidden"
                  >
                    {positions.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Compensation */}
              <div className="rounded-lg bg-slate-50 p-3 border border-slate-200 space-y-3">
                <div className="font-semibold text-slate-900">Compensation Package</div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1">Basic Monthly (₱) *</label>
                    <input
                      type="number"
                      required
                      value={newEmpForm.basicSalary}
                      onChange={(e) => setNewEmpForm({ ...newEmpForm, basicSalary: Number(e.target.value) })}
                      className="w-full rounded border border-slate-300 p-1.5 text-xs font-mono focus:border-indigo-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1">Taxable Allowance</label>
                    <input
                      type="number"
                      value={newEmpForm.allowanceTaxable}
                      onChange={(e) => setNewEmpForm({ ...newEmpForm, allowanceTaxable: Number(e.target.value) })}
                      className="w-full rounded border border-slate-300 p-1.5 text-xs font-mono focus:border-indigo-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1">De Minimis Non-Taxable</label>
                    <input
                      type="number"
                      value={newEmpForm.allowanceNonTaxable}
                      onChange={(e) => setNewEmpForm({ ...newEmpForm, allowanceNonTaxable: Number(e.target.value) })}
                      className="w-full rounded border border-slate-300 p-1.5 text-xs font-mono focus:border-indigo-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Government IDs */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">TIN Number</label>
                  <input
                    type="text"
                    placeholder="000-000-000-000"
                    value={newEmpForm.tin}
                    onChange={(e) => setNewEmpForm({ ...newEmpForm, tin: e.target.value })}
                    className="w-full rounded border border-slate-300 p-2 font-mono text-xs focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">SSS Number</label>
                  <input
                    type="text"
                    placeholder="00-0000000-0"
                    value={newEmpForm.sssNumber}
                    onChange={(e) => setNewEmpForm({ ...newEmpForm, sssNumber: e.target.value })}
                    className="w-full rounded border border-slate-300 p-2 font-mono text-xs focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">PhilHealth PIN</label>
                  <input
                    type="text"
                    placeholder="00-000000000-0"
                    value={newEmpForm.philhealthNumber}
                    onChange={(e) => setNewEmpForm({ ...newEmpForm, philhealthNumber: e.target.value })}
                    className="w-full rounded border border-slate-300 p-2 font-mono text-xs focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Pag-IBIG MID</label>
                  <input
                    type="text"
                    placeholder="0000-0000-0000"
                    value={newEmpForm.pagibigNumber}
                    onChange={(e) => setNewEmpForm({ ...newEmpForm, pagibigNumber: e.target.value })}
                    className="w-full rounded border border-slate-300 p-2 font-mono text-xs focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Bank */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Disbursement Bank</label>
                  <select
                    value={newEmpForm.bankName}
                    onChange={(e) => setNewEmpForm({ ...newEmpForm, bankName: e.target.value })}
                    className="w-full rounded border border-slate-300 p-2 text-xs focus:border-indigo-500 focus:outline-hidden"
                  >
                    <option value="BDO Unibank">BDO Unibank</option>
                    <option value="BPI (Bank of the Philippine Islands)">BPI</option>
                    <option value="Metrobank">Metrobank</option>
                    <option value="UnionBank of the Philippines">UnionBank</option>
                    <option value="Security Bank">Security Bank</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Bank Account Number</label>
                  <input
                    type="text"
                    placeholder="Account Number"
                    value={newEmpForm.bankAccountNumber}
                    onChange={(e) => setNewEmpForm({ ...newEmpForm, bankAccountNumber: e.target.value })}
                    className="w-full rounded border border-slate-300 p-2 font-mono text-xs focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-md border border-slate-200 px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition"
                >
                  Enroll Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
