import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import CreateBranch from './create/createBranch';
import CreateManager from './create/createManger';
import CreateAdmin from './create/createAdmin';
import CreateEmployee from './create/createEmployee/CreateEmployee';
import SeeAllBranchAndEdit from './edit/editBranch';
import AllSeeMangerAndEdit from './edit/editManger';
import SeeAllAdminAndEdit from './edit/editAdmin';
import EditEmployeeList from './edit/editEmployee';
import PayrollDashboard from './Payroll/PayrollDashboard';
import { BackButton } from '../../../allCompones/BackButton';
import ErrorBoundary from '../../../error/error';

interface RootState {
  auth: {
    userData: {
      role?: string;
    } | null;
  };
}

type Tab = 'branch' | 'manager' | 'admin' | 'employee' | 'payroll';
type Mode = 'create' | 'list';

const UnifiedSettings = () => {
  const userData = useSelector((state: RootState) => state.auth.userData);
  const userRole = userData?.role || '';
  const isMasterAdmin = userRole === 'master_admin';

  const [activeTab, setActiveTab] = useState<Tab>('branch');
  const [mode, setMode] = useState<Mode>('create');

  const tabs = [
    { key: 'branch' as Tab, label: 'Branch' },
    { key: 'manager' as Tab, label: 'Manager' },
    { key: 'admin' as Tab, label: 'Admin' },
    { key: 'employee' as Tab, label: 'Employee' },
    { key: 'payroll' as Tab, label: 'Payroll' },
  ];

  const renderContent = () => {
    // Payroll doesn't have create/list modes
    if (activeTab === 'payroll') {
      return <PayrollDashboard />;
    }

    if (mode === 'create') {
      switch (activeTab) {
        case 'branch':
          return <CreateBranch />;
        case 'manager':
          return <CreateManager />;
        case 'admin':
          return <CreateAdmin />;
        case 'employee':
          return <CreateEmployee />;
        default:
          return null;
      }
    } else {
      switch (activeTab) {
        case 'branch':
          return <SeeAllBranchAndEdit />;
        case 'manager':
          return <AllSeeMangerAndEdit />;
        case 'admin':
          return <SeeAllAdminAndEdit />;
        case 'employee':
          return <EditEmployeeList />;
        default:
          return null;
      }
    }
  };

  // Master Admin can create all entities, Admin/Manager can create employees only
  const canCreateEntity = isMasterAdmin; // For Branch, Manager, Admin creation
  const canCreateEmployee = true; // All roles can create employees (filtered by their branches)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <BackButton />
              <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-6 py-3 font-medium text-sm transition-colors relative ${
                  activeTab === tab.key
                    ? 'text-[#FF6B35] border-b-2 border-[#FF6B35]'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mode Toggle - Hide for Payroll tab */}
      {activeTab !== 'payroll' && (
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex gap-2">
              {((activeTab === 'employee' && canCreateEmployee) || (activeTab !== 'employee' && canCreateEntity)) && (
                <button
                  onClick={() => setMode('create')}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    mode === 'create'
                      ? 'bg-[#FF6B35] text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  + Create New
                </button>
              )}
              <button
                onClick={() => setMode('list')}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  mode === 'list'
                    ? 'bg-[#FF6B35] text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                View & Edit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <ErrorBoundary>
          {renderContent()}
        </ErrorBoundary>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-500">
            © 2025 27infinity. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UnifiedSettings;
