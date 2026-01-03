/**
 * PayrollDashboard Component
 * Monthly payroll overview, process payments, view history
 */

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import {
  getPayrollSummary,
  processPayment,
  processBulkPayments,
  getPaymentHistory,
  generatePayslip,
  getCurrentMonth,
  formatCurrency,
  PayrollSummary,
  Payslip } from
'../../../../redux/unifiedV2';
import { RootState, AppDispatch } from '../../../../../store';
import { useCanAccessPayroll } from '../../../../../hooks/usePermissions';
import { BackButton } from '../../../../allCompones/BackButton';
import './PayrollDashboard.css';

const PayrollDashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();
  const canAccess = useCanAccessPayroll();

  const { summary, history, payslip, loading, processing, error } = useSelector(
    (state: RootState) => state.v2.payroll
  );

  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [activeTab, setActiveTab] = useState<'overview' | 'pending' | 'paid' | 'history'>('overview');
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(
    (location.state as any)?.employeeId || null
  );
  const [showPayslip, setShowPayslip] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [bulkProcessing, setBulkProcessing] = useState(false);

  useEffect(() => {
    if (canAccess) {
      dispatch(getPayrollSummary({ month: selectedMonth }));
    }
  }, [dispatch, selectedMonth, canAccess]);

  useEffect(() => {
    if (selectedEmployee && canAccess) {
      dispatch(getPaymentHistory(selectedEmployee));
    }
  }, [dispatch, selectedEmployee, canAccess]);

  if (!canAccess) {
    return (
      <div className="payroll-container">
        <div className="access-denied">
          <h2>Access Denied</h2>
          <p>You do not have permission to access payroll.</p>
        </div>
      </div>);

  }

  const summaryData: PayrollSummary | null = summary;

  const handleProcessPayment = async (employeeId: string, employeeName: string) => {
    setProcessingId(employeeId);
    try {
      await dispatch(processPayment({
        employeeId,
        month: selectedMonth,
        paymentMethod: 'bank'
      }));
      // Refresh summary
      dispatch(getPayrollSummary({ month: selectedMonth }));
    } catch (err) {

    } finally {
      setProcessingId(null);
    }
  };

  const handleBulkProcess = async () => {
    setBulkProcessing(true);
    try {
      await dispatch(processBulkPayments({
        month: selectedMonth,
        paymentMethod: 'bank'
      }));
      // Refresh summary
      dispatch(getPayrollSummary({ month: selectedMonth }));
    } catch (err) {

    } finally {
      setBulkProcessing(false);
    }
  };

  const handleViewPayslip = async (employeeId: string) => {
    setSelectedEmployee(employeeId);
    await dispatch(generatePayslip(employeeId, selectedMonth));
    setShowPayslip(true);
  };

  const getMonthOptions = () => {
    const options = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      options.push({ value, label });
    }
    return options;
  };

  return (
    <div className="payroll-container">
      <div className="payroll-header">
        <BackButton />
        <h2>Payroll Management</h2>
        <div className="header-controls">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="month-select">

            {getMonthOptions().map((opt) =>
            <option key={opt.value} value={opt.value}>{opt.label}</option>
            )}
          </select>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Summary Cards */}
      {summaryData &&
      <div className="summary-cards">
          <div className="summary-card">
            <div className="card-icon employees"></div>
            <div className="card-content">
              <span className="card-value">{summaryData.summary?.totalEmployees || 0}</span>
              <span className="card-label">Total Employees</span>
            </div>
          </div>
          <div className="summary-card">
            <div className="card-icon payroll"></div>
            <div className="card-content">
              <span className="card-value">{formatCurrency(summaryData.summary?.totalMonthlyPayroll || 0)}</span>
              <span className="card-label">Monthly Payroll</span>
            </div>
          </div>
          <div className="summary-card success">
            <div className="card-icon paid"></div>
            <div className="card-content">
              <span className="card-value">{summaryData.summary?.paidCount || 0}</span>
              <span className="card-label">Paid ({formatCurrency(summaryData.summary?.totalPaidAmount || 0)})</span>
            </div>
          </div>
          <div className="summary-card warning">
            <div className="card-icon pending"></div>
            <div className="card-content">
              <span className="card-value">{summaryData.summary?.pendingCount || 0}</span>
              <span className="card-label">Pending ({formatCurrency(summaryData.summary?.totalPendingAmount || 0)})</span>
            </div>
          </div>
        </div>
      }

      {/* Tabs */}
      <div className="payroll-tabs">
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}>

          Overview
        </button>
        <button
          className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}>

          Pending ({summaryData?.summary?.pendingCount || 0})
        </button>
        <button
          className={`tab-btn ${activeTab === 'paid' ? 'active' : ''}`}
          onClick={() => setActiveTab('paid')}>

          Paid ({summaryData?.summary?.paidCount || 0})
        </button>
        <button
          className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}>

          History
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {loading ?
        <div className="loading">Loading...</div> :

        <>
            {/* Pending Payments */}
            {activeTab === 'pending' &&
          <div className="payments-section">
                <div className="section-header">
                  <h3>Pending Payments</h3>
                  {(summaryData?.pendingPayments?.length || 0) > 0 &&
              <button
                className="bulk-btn"
                onClick={handleBulkProcess}
                disabled={bulkProcessing}>

                      {bulkProcessing ? 'Processing...' : 'Process All'}
                    </button>
              }
                </div>
                {(summaryData?.pendingPayments?.length || 0) === 0 ?
            <div className="empty-state">No pending payments for this month.</div> :

            <table className="payroll-table">
                    <thead>
                      <tr>
                        <th>Employee</th>
                        <th>Department</th>
                        <th>Branch</th>
                        <th>Net Salary</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summaryData?.pendingPayments?.map((emp: any) =>
                <tr key={emp.employeeId}>
                          <td>{emp.employeeName}</td>
                          <td>{emp.department || '-'}</td>
                          <td>{emp.branch || '-'}</td>
                          <td>{formatCurrency(emp.netSalary)}</td>
                          <td>
                            <button
                      className="process-btn"
                      onClick={() => handleProcessPayment(emp.employeeId, emp.employeeName)}
                      disabled={processingId === emp.employeeId}>

                              {processingId === emp.employeeId ? 'Processing...' : 'Pay Now'}
                            </button>
                          </td>
                        </tr>
                )}
                    </tbody>
                  </table>
            }
              </div>
          }

            {/* Paid This Month */}
            {activeTab === 'paid' &&
          <div className="payments-section">
                <h3>Paid This Month</h3>
                {(summaryData?.paidThisMonth?.length || 0) === 0 ?
            <div className="empty-state">No payments processed for this month yet.</div> :

            <table className="payroll-table">
                    <thead>
                      <tr>
                        <th>Employee</th>
                        <th>Department</th>
                        <th>Branch</th>
                        <th>Amount Paid</th>
                        <th>Paid On</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summaryData?.paidThisMonth?.map((emp: any) =>
                <tr key={emp.employeeId}>
                          <td>{emp.employeeName}</td>
                          <td>{emp.department || '-'}</td>
                          <td>{emp.branch || '-'}</td>
                          <td>{formatCurrency(emp.netPaid)}</td>
                          <td>{new Date(emp.paidOn).toLocaleDateString()}</td>
                          <td>
                            <button
                      className="view-btn"
                      onClick={() => handleViewPayslip(emp.employeeId)}>

                              Payslip
                            </button>
                          </td>
                        </tr>
                )}
                    </tbody>
                  </table>
            }
              </div>
          }

            {/* Overview */}
            {activeTab === 'overview' &&
          <div className="overview-section">
                <div className="overview-grid">
                  <div className="overview-card">
                    <h4>Payment Status</h4>
                    <div className="progress-bar">
                      <div
                    className="progress-fill"
                    style={{
                      width: `${
                      summaryData?.summary?.totalEmployees ?
                      summaryData.summary.paidCount / summaryData.summary.totalEmployees * 100 :
                      0}%`

                    }}>
                  </div>
                    </div>
                    <p>
                      {summaryData?.summary?.paidCount || 0} of {summaryData?.summary?.totalEmployees || 0} employees paid
                    </p>
                  </div>
                  <div className="overview-card">
                    <h4>Amount Breakdown</h4>
                    <div className="breakdown-row">
                      <span>Total Payroll:</span>
                      <span>{formatCurrency(summaryData?.summary?.totalMonthlyPayroll || 0)}</span>
                    </div>
                    <div className="breakdown-row paid">
                      <span>Paid:</span>
                      <span>{formatCurrency(summaryData?.summary?.totalPaidAmount || 0)}</span>
                    </div>
                    <div className="breakdown-row pending">
                      <span>Pending:</span>
                      <span>{formatCurrency(summaryData?.summary?.totalPendingAmount || 0)}</span>
                    </div>
                  </div>
                </div>
              </div>
          }

            {/* History */}
            {activeTab === 'history' &&
          <div className="history-section">
                <h3>Payment History</h3>
                {selectedEmployee && history ?
            <div className="history-content">
                    <div className="employee-header">
                      <h4>{history.employee?.fullName}</h4>
                      <p>{history.employee?.email}</p>
                    </div>
                    <table className="payroll-table">
                      <thead>
                        <tr>
                          <th>Month</th>
                          <th>Basic</th>
                          <th>Allowances</th>
                          <th>Deductions</th>
                          <th>Net Paid</th>
                          <th>Paid On</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {history.paymentHistory?.map((payment: any, idx: number) =>
                  <tr key={idx}>
                            <td>{payment.month}</td>
                            <td>{formatCurrency(payment.basicPaid || 0)}</td>
                            <td>{formatCurrency(payment.allowancesPaid || 0)}</td>
                            <td>{formatCurrency(payment.deductionsMade || 0)}</td>
                            <td>{formatCurrency(payment.netPaid || 0)}</td>
                            <td>{new Date(payment.paidOn).toLocaleDateString()}</td>
                            <td>
                              <span className={`status-badge ${payment.status}`}>
                                {payment.status}
                              </span>
                            </td>
                          </tr>
                  )}
                      </tbody>
                    </table>
                  </div> :

            <div className="empty-state">
                    Select an employee from the Paid list to view their payment history.
                  </div>
            }
              </div>
          }
          </>
        }
      </div>

      {/* Payslip Modal */}
      {showPayslip && payslip &&
      <div className="modal-overlay" onClick={() => setShowPayslip(false)}>
          <div className="payslip-modal" onClick={(e) => e.stopPropagation()}>
            <div className="payslip-header">
              <h3>Payslip</h3>
              <button className="close-btn" onClick={() => setShowPayslip(false)}>×</button>
            </div>
            <div className="payslip-content">
              <div className="payslip-company">
                <h4>{payslip.company?.name}</h4>
                <p>{payslip.company?.branch}</p>
              </div>
              <div className="payslip-employee">
                <p><strong>Employee:</strong> {payslip.employee?.name}</p>
                <p><strong>ID:</strong> {payslip.employee?.id}</p>
                <p><strong>Period:</strong> {payslip.payPeriod?.month}</p>
              </div>
              <div className="payslip-earnings">
                <h5>Earnings</h5>
                <div className="payslip-row">
                  <span>Basic:</span>
                  <span>{formatCurrency(payslip.earnings?.basic || 0)}</span>
                </div>
                {payslip.earnings?.allowances?.map((a: any, i: number) =>
              <div key={i} className="payslip-row">
                    <span>{a.name}:</span>
                    <span>{formatCurrency(a.amount)}</span>
                  </div>
              )}
                <div className="payslip-row total">
                  <span>Gross:</span>
                  <span>{formatCurrency(payslip.earnings?.grossEarnings || 0)}</span>
                </div>
              </div>
              <div className="payslip-deductions">
                <h5>Deductions</h5>
                {payslip.deductions?.items?.map((d: any, i: number) =>
              <div key={i} className="payslip-row">
                    <span>{d.name}:</span>
                    <span>{formatCurrency(d.amount)}</span>
                  </div>
              )}
                <div className="payslip-row total">
                  <span>Total Deductions:</span>
                  <span>{formatCurrency(payslip.deductions?.totalDeductions || 0)}</span>
                </div>
              </div>
              <div className="payslip-net">
                <span>Net Pay:</span>
                <span>{formatCurrency(payslip.netPay || 0)}</span>
              </div>
            </div>
            <div className="payslip-actions">
              <button onClick={() => window.print()} className="print-btn">
                Print Payslip
              </button>
            </div>
          </div>
        </div>
      }
    </div>);

};

export default PayrollDashboard;