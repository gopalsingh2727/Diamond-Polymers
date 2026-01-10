/**
 * EditEmployeeList Component
 * List all employees with edit/delete/view actions
 */

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  getEmployeesV2,
  deleteEmployeeV2,
  Employee,
} from '../../../../redux/unifiedV2';
import { RootState, AppDispatch } from '../../../../../store';
import { useCanManageEmployees } from '../../../../../hooks/usePermissions';
import { useCRUD } from '../../../../../hooks/useCRUD';
import { ToastContainer } from '../../../../../components/shared/Toast';
import { BackButton } from '../../../../allCompones/BackButton';
import DeletionOTPModal from '../../../../shared/DeletionOTPModal';

const EditEmployeeList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const canManage = useCanManageEmployees();
  const { handleDelete: crudDelete, deleteState, confirmDialog, closeConfirmDialog, toast } = useCRUD();

  const { list: employees, loading, error } = useSelector(
    (state: RootState) => state.v2.employee
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [deleteModal, setDeleteModal] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    dispatch(getEmployeesV2());
  }, [dispatch]);

  if (!canManage) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-bold text-red-700 mb-2">Access Denied</h2>
          <p className="text-red-600">You do not have permission to manage employees.</p>
        </div>
      </div>
    );
  }

  // Get unique departments for filter
  const departments = [...new Set(employees.map((emp: Employee) => emp.department).filter(Boolean))];

  // Filter employees
  const filteredEmployees = employees.filter((emp: Employee) => {
    const matchesSearch =
      emp.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employeeId?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || emp.status === statusFilter;
    const matchesDept = departmentFilter === 'all' || emp.department === departmentFilter;

    return matchesSearch && matchesStatus && matchesDept;
  });

  const handleEdit = (employee: Employee) => {
    navigate('/menu/create/employee', {
      state: { editMode: true, initialData: employee },
    });
  };

  const handleDeleteClick = (id: string, name: string) => {
    setDeleteModal({ id, name });
  };

  const handleViewPayroll = (employeeId: string) => {
    navigate('/menu/payroll', { state: { employeeId } });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-50 text-green-700 border border-green-200';
      case 'inactive':
        return 'bg-yellow-50 text-yellow-700 border border-yellow-200';
      case 'terminated':
        return 'bg-red-50 text-red-700 border border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border border-gray-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <BackButton />
          <h2 className="text-2xl font-bold text-gray-800">Employees</h2>
        </div>
        <button
          className="bg-[#FF6B35] text-white px-4 py-2 rounded hover:bg-[#e55a2a] transition-colors flex items-center gap-2"
          onClick={() => navigate('/menu/create/employee')}
        >
          <span>+</span> Add Employee
        </button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded mb-4">{error}</div>}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-lg shadow-sm">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by name, email, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border rounded focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35] outline-none"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto p-2 border rounded focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35] outline-none"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="terminated">Terminated</option>
          </select>
        </div>

        <div>
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="w-full sm:w-auto p-2 border rounded focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35] outline-none"
          >
            <option value="all">All Departments</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-[#FF6B35]">
          <div className="text-3xl font-bold text-gray-800">{employees.length}</div>
          <div className="text-sm text-gray-600 mt-1">Total Employees</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-green-500">
          <div className="text-3xl font-bold text-gray-800">
            {employees.filter((e: Employee) => e.status === 'active').length}
          </div>
          <div className="text-sm text-gray-600 mt-1">Active</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-500">
          <div className="text-3xl font-bold text-gray-800">
            {formatCurrency(
              employees
                .filter((e: Employee) => e.status === 'active')
                .reduce((sum: number, e: Employee) => sum + (e.salaryBreakdown?.netSalary || 0), 0)
            )}
          </div>
          <div className="text-sm text-gray-600 mt-1">Monthly Payroll</div>
        </div>
      </div>

      {/* Employee Table */}
      {loading ? (
        <div className="bg-white p-12 rounded-lg shadow-sm text-center text-gray-600">Loading employees...</div>
      ) : filteredEmployees.length === 0 ? (
        <div className="bg-white p-12 rounded-lg shadow-sm text-center text-gray-600">
          <p>No employees found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Designation</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Salary</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEmployees.map((employee: Employee) => (
                  <tr key={employee._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{employee.fullName}</div>
                        <div className="text-sm text-gray-500">{employee.email}</div>
                        <div className="text-xs text-gray-400">{employee.employeeId}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{employee.department || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{employee.designation || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <span className="text-sm font-medium text-gray-900">
                          {formatCurrency(employee.salaryBreakdown?.netSalary || 0)}
                        </span>
                        <span className="text-xs text-gray-500">/{employee.salary?.type || 'monthly'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(employee.status)}`}>
                        {employee.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <button
                          className="text-[#FF6B35] hover:text-[#e55a2a] font-medium"
                          onClick={() => handleEdit(employee)}
                          title="Edit"
                        >
                          Edit
                        </button>
                        <button
                          className="text-blue-600 hover:text-blue-800 font-medium"
                          onClick={() => handleViewPayroll(employee._id)}
                          title="Payroll"
                        >
                          Payroll
                        </button>
                        <button
                          className="text-red-600 hover:text-red-800 font-medium"
                          onClick={() => handleDeleteClick(employee._id, employee.fullName || employee.username)}
                          title="Delete"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Deletion OTP Modal */}
      <DeletionOTPModal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        entityType="employee"
        entityId={deleteModal?.id || ''}
        entityName={deleteModal?.name || ''}
        onSuccess={() => {
          setDeleteModal(null);
          dispatch(getEmployeesV2());
        }}
      />
      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
    </div>
  );
};

export default EditEmployeeList;
