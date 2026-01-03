/**
 * CreateEmployee Component
 * Form for creating/editing employees with salary and permissions configuration
 */

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  createEmployeeV2,
  updateEmployeeV2,
  deleteEmployeeV2,
  Employee,
  CreateEmployeeData,
  EmployeePermissions,
  CRUDPermission,
  Allowance,
  Deduction,
} from '../../../../../redux/unifiedV2';
import { RootState, AppDispatch } from '../../../../../../store';
import { useCanManageEmployees } from '../../../../../../hooks/usePermissions';
import { useCRUD } from '../../../../../../hooks/useCRUD';
import { ToastContainer } from '../../../../../../components/shared/Toast';
import { BackButton } from '../../../../../allCompones/BackButton';

// Permission groups for UI organization
const PERMISSION_GROUPS = {
  'Orders & Accounts': ['orders', 'accounts', 'customerCategory', 'parentCompany'],
  'Machines': ['machines', 'machineType', 'machineOperator', 'step'],
  'Options': ['categories', 'optionType', 'optionSpec', 'options'],
  'Configuration': ['orderType', 'printType', 'excelExportType', 'reportType', 'template'],
  'System': ['deviceAccess', 'inventory'],
  'Features': ['daybook', 'dispatch', 'reports'],
};

// Default CRUD permission
const defaultCRUD: CRUDPermission = { create: false, read: false, update: false, delete: false };

// Default allowances
const DEFAULT_ALLOWANCES: Allowance[] = [
  { name: 'HRA', amount: 0, type: 'percentage' },
  { name: 'Travel', amount: 0, type: 'fixed' },
];

// Default deductions
const DEFAULT_DEDUCTIONS: Deduction[] = [
  { name: 'PF', amount: 0, type: 'percentage' },
  { name: 'Tax', amount: 0, type: 'fixed' },
];

interface LocationState {
  editMode?: boolean;
  initialData?: Employee;
}

const CreateEmployee: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const canManage = useCanManageEmployees();
  const { handleSave, saveState, toast } = useCRUD();

  const locationState = location.state as LocationState | null;
  const initialData = locationState?.initialData;
  const editMode = locationState?.editMode || !!initialData?._id;

  const { error } = useSelector((state: RootState) => state.v2.employee);
  const branches = useSelector((state: RootState) => state.auth.userData?.branches || []);

  // Form state
  const [formData, setFormData] = useState({
    username: initialData?.username || '',
    email: initialData?.email || '',
    password: '',
    fullName: initialData?.fullName || '',
    phone: initialData?.phone || '',
    address: initialData?.address || '',
    designation: initialData?.designation || '',
    department: initialData?.department || '',
    joiningDate: initialData?.joiningDate ? new Date(initialData.joiningDate).toISOString().split('T')[0] : '',
    branchId: initialData?.branchId || '',
  });

  const [salary, setSalary] = useState({
    basic: initialData?.salary?.basic || 0,
    type: initialData?.salary?.type || 'monthly' as 'monthly' | 'daily' | 'hourly',
    paymentDay: initialData?.salary?.paymentDay || 1,
    bankName: initialData?.salary?.bankName || '',
    accountNumber: initialData?.salary?.accountNumber || '',
    ifscCode: initialData?.salary?.ifscCode || '',
  });

  const [allowances, setAllowances] = useState<Allowance[]>(
    initialData?.salary?.allowances || DEFAULT_ALLOWANCES
  );

  const [deductions, setDeductions] = useState<Deduction[]>(
    initialData?.salary?.deductions || DEFAULT_DEDUCTIONS
  );

  const [permissions, setPermissions] = useState<EmployeePermissions>(
    initialData?.permissions || {}
  );

  const [activeTab, setActiveTab] = useState<'basic' | 'salary' | 'permissions'>('basic');

  // Access check
  if (!canManage) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-bold text-red-700 mb-2">Access Denied</h2>
          <p className="text-red-600">You do not have permission to manage employees.</p>
        </div>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setSalary(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  // Allowance handlers
  const handleAllowanceChange = (index: number, field: keyof Allowance, value: any) => {
    const updated = [...allowances];
    updated[index] = { ...updated[index], [field]: field === 'amount' ? parseFloat(value) || 0 : value };
    setAllowances(updated);
  };

  const addAllowance = () => {
    setAllowances([...allowances, { name: '', amount: 0, type: 'fixed' }]);
  };

  const removeAllowance = (index: number) => {
    setAllowances(allowances.filter((_, i) => i !== index));
  };

  // Deduction handlers
  const handleDeductionChange = (index: number, field: keyof Deduction, value: any) => {
    const updated = [...deductions];
    updated[index] = { ...updated[index], [field]: field === 'amount' ? parseFloat(value) || 0 : value };
    setDeductions(updated);
  };

  const addDeduction = () => {
    setDeductions([...deductions, { name: '', amount: 0, type: 'fixed' }]);
  };

  const removeDeduction = (index: number) => {
    setDeductions(deductions.filter((_, i) => i !== index));
  };

  // Permission handlers
  const handlePermissionChange = (entity: string, action: string, value: boolean) => {
    setPermissions(prev => {
      const entityPerms = prev[entity as keyof EmployeePermissions] || {};
      return {
        ...prev,
        [entity]: { ...entityPerms, [action]: value },
      };
    });
  };

  const toggleAllPermissions = (entity: string, value: boolean) => {
    const isFeature = ['daybook', 'reports'].includes(entity);
    const isDispatch = entity === 'dispatch';

    if (isFeature) {
      setPermissions(prev => ({
        ...prev,
        [entity]: { read: value },
      }));
    } else if (isDispatch) {
      setPermissions(prev => ({
        ...prev,
        [entity]: { read: value, update: value },
      }));
    } else {
      setPermissions(prev => ({
        ...prev,
        [entity]: { create: value, read: value, update: value, delete: value },
      }));
    }
  };

  // Calculate net salary
  const calculateNetSalary = () => {
    const basic = salary.basic;
    let totalAllowances = 0;
    let totalDeductions = 0;

    allowances.forEach(a => {
      totalAllowances += a.type === 'percentage' ? (basic * a.amount) / 100 : a.amount;
    });

    deductions.forEach(d => {
      totalDeductions += d.type === 'percentage' ? (basic * d.amount) / 100 : d.amount;
    });

    return {
      basic,
      totalAllowances,
      totalDeductions,
      net: basic + totalAllowances - totalDeductions,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const employeeData: CreateEmployeeData = {
      ...formData,
      salary: {
        ...salary,
        allowances: allowances.filter(a => a.name && a.amount > 0),
        deductions: deductions.filter(d => d.name && d.amount > 0),
      },
      permissions,
    };

    const saveAction = async () => {
      if (editMode && initialData?._id) {
        return dispatch(updateEmployeeV2(initialData._id, employeeData));
      } else {
        return dispatch(createEmployeeV2(employeeData));
      }
    };

    handleSave(saveAction, {
      successMessage: editMode ? 'Employee updated successfully' : 'Employee created successfully! Credentials sent to email.',
      onSuccess: () => {
        if (!editMode) {
          // Reset form only for create mode
          setFormData({
            username: '',
            email: '',
            password: '',
            fullName: '',
            phone: '',
            address: '',
            designation: '',
            department: '',
            joiningDate: '',
            branchId: '',
          });
          setSalary({
            basic: 0,
            type: 'monthly',
            paymentDay: 1,
            bankName: '',
            accountNumber: '',
            ifscCode: '',
          });
          setAllowances(DEFAULT_ALLOWANCES);
          setDeductions(DEFAULT_DEDUCTIONS);
          setPermissions({});
        }
      }
    });
  };

  const salaryBreakdown = calculateNetSalary();

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="flex items-center gap-4 mb-6">
        <BackButton />
        <h2 className="text-2xl font-bold text-gray-800">{editMode ? 'Edit Employee' : 'Create Employee'}</h2>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded mb-4">{error}</div>}

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-gray-200 mb-6">
        <button
          type="button"
          className={`${
            activeTab === 'basic'
              ? 'bg-[#FF6B35] text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          } px-6 py-2.5 rounded-t-lg font-medium text-sm transition-all cursor-pointer`}
          onClick={() => setActiveTab('basic')}
        >
          Basic Info
        </button>
        <button
          type="button"
          className={`${
            activeTab === 'salary'
              ? 'bg-[#FF6B35] text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          } px-6 py-2.5 rounded-t-lg font-medium text-sm transition-all cursor-pointer`}
          onClick={() => setActiveTab('salary')}
        >
          Salary & Bank
        </button>
        <button
          type="button"
          className={`${
            activeTab === 'permissions'
              ? 'bg-[#FF6B35] text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          } px-6 py-2.5 rounded-t-lg font-medium text-sm transition-all cursor-pointer`}
          onClick={() => setActiveTab('permissions')}
        >
          Permissions
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Basic Info Tab */}
        {activeTab === 'basic' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border rounded focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35] outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border rounded focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35] outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border rounded focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35] outline-none"
                />
              </div>

              {!editMode && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required={!editMode}
                    minLength={8}
                    className="w-full p-2 border rounded focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35] outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35] outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                <input
                  type="text"
                  name="designation"
                  value={formData.designation}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35] outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35] outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Joining Date</label>
                <input
                  type="date"
                  name="joiningDate"
                  value={formData.joiningDate}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35] outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Branch <span className="text-red-500">*</span>
                </label>
                <select
                  name="branchId"
                  value={formData.branchId}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border rounded focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35] outline-none"
                >
                  <option value="">Select Branch</option>
                  {branches.map((branch: any) => (
                    <option key={branch._id} value={branch._id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  rows={3}
                  className="w-full p-2 border rounded focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35] outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Salary Tab */}
        {activeTab === 'salary' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Salary Configuration</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Basic Salary</label>
                <input
                  type="number"
                  name="basic"
                  value={salary.basic}
                  onChange={handleSalaryChange}
                  min="0"
                  className="w-full p-2 border rounded focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35] outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Salary Type</label>
                <select
                  name="type"
                  value={salary.type}
                  onChange={handleSalaryChange}
                  className="w-full p-2 border rounded focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35] outline-none"
                >
                  <option value="monthly">Monthly</option>
                  <option value="daily">Daily</option>
                  <option value="hourly">Hourly</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Day</label>
                <input
                  type="number"
                  name="paymentDay"
                  value={salary.paymentDay}
                  onChange={handleSalaryChange}
                  min="1"
                  max="31"
                  className="w-full p-2 border rounded focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35] outline-none"
                />
              </div>
            </div>

            {/* Allowances */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-semibold text-gray-800">Allowances</h4>
                <button
                  type="button"
                  onClick={addAllowance}
                  className="text-sm text-[#FF6B35] hover:text-[#e55a2a] font-medium cursor-pointer"
                >
                  + Add
                </button>
              </div>
              {allowances.map((allowance, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <input
                    type="text"
                    placeholder="Name"
                    value={allowance.name}
                    onChange={(e) => handleAllowanceChange(index, 'name', e.target.value)}
                    className="flex-1 p-2 border rounded focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35] outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Amount"
                    value={allowance.amount}
                    onChange={(e) => handleAllowanceChange(index, 'amount', e.target.value)}
                    className="w-24 p-2 border rounded focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35] outline-none"
                  />
                  <select
                    value={allowance.type}
                    onChange={(e) => handleAllowanceChange(index, 'type', e.target.value)}
                    className="w-32 p-2 border rounded focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35] outline-none"
                  >
                    <option value="fixed">Fixed</option>
                    <option value="percentage">% of Basic</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => removeAllowance(index)}
                    className="px-3 py-2 text-red-500 hover:text-red-700 text-sm cursor-pointer font-medium"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            {/* Deductions */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-semibold text-gray-800">Deductions</h4>
                <button
                  type="button"
                  onClick={addDeduction}
                  className="text-sm text-[#FF6B35] hover:text-[#e55a2a] font-medium cursor-pointer"
                >
                  + Add
                </button>
              </div>
              {deductions.map((deduction, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <input
                    type="text"
                    placeholder="Name"
                    value={deduction.name}
                    onChange={(e) => handleDeductionChange(index, 'name', e.target.value)}
                    className="flex-1 p-2 border rounded focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35] outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Amount"
                    value={deduction.amount}
                    onChange={(e) => handleDeductionChange(index, 'amount', e.target.value)}
                    className="w-24 p-2 border rounded focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35] outline-none"
                  />
                  <select
                    value={deduction.type}
                    onChange={(e) => handleDeductionChange(index, 'type', e.target.value)}
                    className="w-32 p-2 border rounded focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35] outline-none"
                  >
                    <option value="fixed">Fixed</option>
                    <option value="percentage">% of Basic</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => removeDeduction(index)}
                    className="px-3 py-2 text-red-500 hover:text-red-700 text-sm cursor-pointer font-medium"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            {/* Salary Summary */}
            <div className="border rounded-lg p-4 bg-gray-50 space-y-3">
              <h4 className="text-sm font-semibold text-gray-800 mb-2">Salary Breakdown</h4>
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-sm text-gray-600">Basic:</span>
                <span className="text-sm font-medium">₹{salaryBreakdown.basic.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-sm text-gray-600">+ Allowances:</span>
                <span className="text-sm font-medium text-green-600">₹{salaryBreakdown.totalAllowances.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-sm text-gray-600">- Deductions:</span>
                <span className="text-sm font-medium text-red-600">₹{salaryBreakdown.totalDeductions.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-base font-semibold text-gray-800">Net Salary:</span>
                <span className="text-xl font-bold text-[#FF6B35]">₹{salaryBreakdown.net.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Bank Details */}
            <h4 className="text-sm font-semibold text-gray-800 mt-6 mb-3">Bank Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                <input
                  type="text"
                  name="bankName"
                  value={salary.bankName}
                  onChange={handleSalaryChange}
                  className="w-full p-2 border rounded focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35] outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                <input
                  type="text"
                  name="accountNumber"
                  value={salary.accountNumber}
                  onChange={handleSalaryChange}
                  className="w-full p-2 border rounded focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35] outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">IFSC Code</label>
                <input
                  type="text"
                  name="ifscCode"
                  value={salary.ifscCode}
                  onChange={handleSalaryChange}
                  className="w-full p-2 border rounded focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35] outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Permissions Tab */}
        {activeTab === 'permissions' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Permissions</h3>
              <p className="text-sm text-gray-600 mb-4">
                Configure what this employee can access and do in the application.
              </p>
            </div>

            {Object.entries(PERMISSION_GROUPS).map(([groupName, entities]) => (
              <div key={groupName} className="space-y-3">
                <h4 className="font-semibold text-gray-800 text-base border-b pb-2">{groupName}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {entities.map((entity) => {
                    const entityPerms = permissions[entity as keyof EmployeePermissions] || {};
                    const isFeature = ['daybook', 'reports'].includes(entity);
                    const isDispatch = entity === 'dispatch';

                    return (
                      <div key={entity} className="border rounded-lg p-4 space-y-3 bg-gray-50">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-800 capitalize">{entity}</span>
                          <button
                            type="button"
                            className="text-xs text-[#FF6B35] hover:text-[#e55a2a] font-medium"
                            onClick={() => {
                              const hasAny = isFeature
                                ? (entityPerms as any)?.read
                                : isDispatch
                                ? (entityPerms as any)?.read || (entityPerms as any)?.update
                                : (entityPerms as CRUDPermission)?.create ||
                                  (entityPerms as CRUDPermission)?.read ||
                                  (entityPerms as CRUDPermission)?.update ||
                                  (entityPerms as CRUDPermission)?.delete;
                              toggleAllPermissions(entity, !hasAny);
                            }}
                          >
                            Toggle All
                          </button>
                        </div>
                        <div className="space-y-2">
                          {isFeature ? (
                            <label className="flex items-center gap-2 cursor-pointer hover:bg-white p-2 rounded">
                              <input
                                type="checkbox"
                                checked={(entityPerms as any)?.read || false}
                                onChange={(e) =>
                                  handlePermissionChange(entity, 'read', e.target.checked)
                                }
                                className="w-4 h-4 text-[#FF6B35] rounded border-gray-300 focus:ring-[#FF6B35]"
                              />
                              <span className="text-sm text-gray-700">Read</span>
                            </label>
                          ) : isDispatch ? (
                            <>
                              <label className="flex items-center gap-2 cursor-pointer hover:bg-white p-2 rounded">
                                <input
                                  type="checkbox"
                                  checked={(entityPerms as any)?.read || false}
                                  onChange={(e) =>
                                    handlePermissionChange(entity, 'read', e.target.checked)
                                  }
                                  className="w-4 h-4 text-[#FF6B35] rounded border-gray-300 focus:ring-[#FF6B35]"
                                />
                                <span className="text-sm text-gray-700">Read</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer hover:bg-white p-2 rounded">
                                <input
                                  type="checkbox"
                                  checked={(entityPerms as any)?.update || false}
                                  onChange={(e) =>
                                    handlePermissionChange(entity, 'update', e.target.checked)
                                  }
                                  className="w-4 h-4 text-[#FF6B35] rounded border-gray-300 focus:ring-[#FF6B35]"
                                />
                                <span className="text-sm text-gray-700">Update</span>
                              </label>
                            </>
                          ) : (
                            <>
                              <label className="flex items-center gap-2 cursor-pointer hover:bg-white p-2 rounded">
                                <input
                                  type="checkbox"
                                  checked={(entityPerms as CRUDPermission)?.create || false}
                                  onChange={(e) =>
                                    handlePermissionChange(entity, 'create', e.target.checked)
                                  }
                                  className="w-4 h-4 text-[#FF6B35] rounded border-gray-300 focus:ring-[#FF6B35]"
                                />
                                <span className="text-sm text-gray-700">Create</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer hover:bg-white p-2 rounded">
                                <input
                                  type="checkbox"
                                  checked={(entityPerms as CRUDPermission)?.read || false}
                                  onChange={(e) =>
                                    handlePermissionChange(entity, 'read', e.target.checked)
                                  }
                                  className="w-4 h-4 text-[#FF6B35] rounded border-gray-300 focus:ring-[#FF6B35]"
                                />
                                <span className="text-sm text-gray-700">Read</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer hover:bg-white p-2 rounded">
                                <input
                                  type="checkbox"
                                  checked={(entityPerms as CRUDPermission)?.update || false}
                                  onChange={(e) =>
                                    handlePermissionChange(entity, 'update', e.target.checked)
                                  }
                                  className="w-4 h-4 text-[#FF6B35] rounded border-gray-300 focus:ring-[#FF6B35]"
                                />
                                <span className="text-sm text-gray-700">Update</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer hover:bg-white p-2 rounded">
                                <input
                                  type="checkbox"
                                  checked={(entityPerms as CRUDPermission)?.delete || false}
                                  onChange={(e) =>
                                    handlePermissionChange(entity, 'delete', e.target.checked)
                                  }
                                  className="w-4 h-4 text-[#FF6B35] rounded border-gray-300 focus:ring-[#FF6B35]"
                                />
                                <span className="text-sm text-gray-700">Delete</span>
                              </label>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Submit Button */}
        <div className="flex gap-3 mt-6">
          <button
            type="button"
            className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-50 transition-colors"
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 bg-[#FF6B35] text-white px-4 py-2 rounded hover:bg-[#e55a2a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={saveState === 'loading'}
          >
            {saveState === 'loading'
              ? 'Saving...'
              : editMode
              ? 'Update Employee'
              : 'Create Employee'}
          </button>
        </div>
      </form>
      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
    </div>
  );
};

export default CreateEmployee;
