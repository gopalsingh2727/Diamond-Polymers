/**
 * PayrollSettings Component
 * Configure default allowances and deductions for payroll
 */

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../../../../store';
import { useCanAccessPayroll } from '../../../../../hooks/usePermissions';
import { useCRUD } from '../../../../../hooks/useCRUD';
import { ToastContainer } from '../../../../../components/shared/Toast';
import { BackButton } from '../../../../allCompones/BackButton';
import './PayrollSettings.css';

type AllowanceDeduction = {
  name: string;
  defaultAmount: number;
  type: 'fixed' | 'percentage';
  isDefault: boolean;
};

type PayrollSettingsData = {
  defaultAllowances: AllowanceDeduction[];
  defaultDeductions: AllowanceDeduction[];
  paymentDay: number;
  autoCalculateTax: boolean;
};

const PayrollSettings: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const canAccess = useCanAccessPayroll();
  const { handleSave, saveState, toast } = useCRUD();

  const [settings, setSettings] = useState<PayrollSettingsData>({
    defaultAllowances: [
    { name: 'HRA', defaultAmount: 40, type: 'percentage', isDefault: true },
    { name: 'Travel Allowance', defaultAmount: 0, type: 'fixed', isDefault: true },
    { name: 'Medical Allowance', defaultAmount: 0, type: 'fixed', isDefault: true }],

    defaultDeductions: [
    { name: 'PF', defaultAmount: 12, type: 'percentage', isDefault: true },
    { name: 'Professional Tax', defaultAmount: 200, type: 'fixed', isDefault: true },
    { name: 'ESI', defaultAmount: 0.75, type: 'percentage', isDefault: false }],

    paymentDay: 1,
    autoCalculateTax: false
  });

  useEffect(() => {
    // Load settings from localStorage or API
    const savedSettings = localStorage.getItem('payrollSettings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {

      }
    }
  }, []);

  if (!canAccess) {
    return (
      <div className="payroll-settings-container">
        <div className="access-denied">
          <h2>Access Denied</h2>
          <p>You do not have permission to access payroll settings.</p>
        </div>
      </div>);

  }

  const handleAllowanceChange = (index: number, field: keyof AllowanceDeduction, value: any) => {
    const updated = [...settings.defaultAllowances];
    if (field === 'defaultAmount') {
      updated[index] = { ...updated[index], [field]: parseFloat(value) || 0 };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setSettings({ ...settings, defaultAllowances: updated });
  };

  const handleDeductionChange = (index: number, field: keyof AllowanceDeduction, value: any) => {
    const updated = [...settings.defaultDeductions];
    if (field === 'defaultAmount') {
      updated[index] = { ...updated[index], [field]: parseFloat(value) || 0 };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setSettings({ ...settings, defaultDeductions: updated });
  };

  const addAllowance = () => {
    setSettings({
      ...settings,
      defaultAllowances: [
      ...settings.defaultAllowances,
      { name: '', defaultAmount: 0, type: 'fixed', isDefault: false }]

    });
  };

  const removeAllowance = (index: number) => {
    setSettings({
      ...settings,
      defaultAllowances: settings.defaultAllowances.filter((_, i) => i !== index)
    });
  };

  const addDeduction = () => {
    setSettings({
      ...settings,
      defaultDeductions: [
      ...settings.defaultDeductions,
      { name: '', defaultAmount: 0, type: 'fixed', isDefault: false }]

    });
  };

  const removeDeduction = (index: number) => {
    setSettings({
      ...settings,
      defaultDeductions: settings.defaultDeductions.filter((_, i) => i !== index)
    });
  };

  const handleSaveSettings = () => {
    handleSave(
      async () => {
        // Save to localStorage for now - you can implement API call later
        localStorage.setItem('payrollSettings', JSON.stringify(settings));
        return Promise.resolve({ success: true });
      },
      {
        successMessage: 'Payroll settings saved successfully'
      }
    );
  };

  return (
    <div className="payroll-settings-container">
      <div className="payroll-settings-header">
        <BackButton />
        <h2>Payroll Settings</h2>
        <p className="subtitle">Configure default allowances and deductions for employees</p>
      </div>

      <div className="settings-content">
        {/* General Settings */}
        <div className="settings-section">
          <h3>General Settings</h3>
          <div className="form-group">
            <label>Default Payment Day of Month</label>
            <input
              type="number"
              min="1"
              max="31"
              value={settings.paymentDay}
              onChange={(e) => setSettings({ ...settings, paymentDay: parseInt(e.target.value) || 1 })}
              className="settings-input" />

            <small>Day of the month when salaries are typically paid</small>
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={settings.autoCalculateTax}
                onChange={(e) => setSettings({ ...settings, autoCalculateTax: e.target.checked })} />

              <span>Auto-calculate tax deductions</span>
            </label>
            <small>Automatically calculate income tax based on salary slabs</small>
          </div>
        </div>

        {/* Default Allowances */}
        <div className="settings-section">
          <div className="section-header">
            <h3>Default Allowances</h3>
            <button type="button" onClick={addAllowance} className="add-btn">
              + Add Allowance
            </button>
          </div>
          <p className="help-text">These allowances will be added to new employees by default</p>

          <div className="items-list">
            {settings.defaultAllowances.map((allowance, index) =>
            <div key={index} className="item-row">
                <input
                type="text"
                placeholder="Allowance Name"
                value={allowance.name}
                onChange={(e) => handleAllowanceChange(index, 'name', e.target.value)}
                className="item-name" />

                <input
                type="number"
                placeholder="Amount"
                value={allowance.defaultAmount}
                onChange={(e) => handleAllowanceChange(index, 'defaultAmount', e.target.value)}
                className="item-amount"
                step="0.01" />

                <select
                value={allowance.type}
                onChange={(e) => handleAllowanceChange(index, 'type', e.target.value)}
                className="item-type">

                  <option value="fixed">Fixed Amount</option>
                  <option value="percentage">% of Basic</option>
                </select>
                <label className="default-checkbox">
                  <input
                  type="checkbox"
                  checked={allowance.isDefault}
                  onChange={(e) => handleAllowanceChange(index, 'isDefault', e.target.checked)} />

                  <span>Auto-add</span>
                </label>
                <button
                type="button"
                onClick={() => removeAllowance(index)}
                className="remove-btn"
                title="Remove">

                  ×
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Default Deductions */}
        <div className="settings-section">
          <div className="section-header">
            <h3>Default Deductions</h3>
            <button type="button" onClick={addDeduction} className="add-btn">
              + Add Deduction
            </button>
          </div>
          <p className="help-text">These deductions will be added to new employees by default</p>

          <div className="items-list">
            {settings.defaultDeductions.map((deduction, index) =>
            <div key={index} className="item-row">
                <input
                type="text"
                placeholder="Deduction Name"
                value={deduction.name}
                onChange={(e) => handleDeductionChange(index, 'name', e.target.value)}
                className="item-name" />

                <input
                type="number"
                placeholder="Amount"
                value={deduction.defaultAmount}
                onChange={(e) => handleDeductionChange(index, 'defaultAmount', e.target.value)}
                className="item-amount"
                step="0.01" />

                <select
                value={deduction.type}
                onChange={(e) => handleDeductionChange(index, 'type', e.target.value)}
                className="item-type">

                  <option value="fixed">Fixed Amount</option>
                  <option value="percentage">% of Basic</option>
                </select>
                <label className="default-checkbox">
                  <input
                  type="checkbox"
                  checked={deduction.isDefault}
                  onChange={(e) => handleDeductionChange(index, 'isDefault', e.target.checked)} />

                  <span>Auto-add</span>
                </label>
                <button
                type="button"
                onClick={() => removeDeduction(index)}
                className="remove-btn"
                title="Remove">

                  ×
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Save Button */}
        <div className="settings-actions">
          <button
            type="button"
            onClick={handleSaveSettings}
            disabled={saveState === 'loading'}
            className="save-btn">

            {saveState === 'loading' ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
    </div>);

};

export default PayrollSettings;