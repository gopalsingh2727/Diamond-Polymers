/**
 * Transaction History Component
 * Displays inventory transaction history with filtering
 */

import React, { useState } from 'react';

interface TransactionHistoryProps {
  transactions: any[];
  loading: boolean;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  transactions,
  loading,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterDateRange, setFilterDateRange] = useState<'all' | 'today' | 'week' | 'month'>('all');

  // Filter transactions
  const filteredTransactions = transactions.filter((txn) => {
    const matchesSearch =
      txn.optionId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txn.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txn.referenceId?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === 'all' || txn.type === filterType;

    let matchesDate = true;
    if (filterDateRange !== 'all') {
      const txnDate = new Date(txn.createdAt);
      const now = new Date();
      const startOfToday = new Date(now.setHours(0, 0, 0, 0));
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - 7);
      const startOfMonth = new Date(now);
      startOfMonth.setDate(now.getDate() - 30);

      if (filterDateRange === 'today') matchesDate = txnDate >= startOfToday;
      else if (filterDateRange === 'week') matchesDate = txnDate >= startOfWeek;
      else if (filterDateRange === 'month') matchesDate = txnDate >= startOfMonth;
    }

    return matchesSearch && matchesType && matchesDate;
  });

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      credit: 'Credit',
      debit: 'Debit',
      transfer_in: 'Transfer In',
      transfer_out: 'Transfer Out',
      adjustment: 'Adjustment',
      reservation: 'Reserved',
      release: 'Released',
      auto_debit: 'Auto Debit',
    };
    return labels[type] || type;
  };

  const getTypeClass = (type: string) => {
    if (type.includes('credit') || type === 'transfer_in' || type === 'release') {
      return 'positive';
    }
    if (type.includes('debit') || type === 'transfer_out' || type === 'reservation' || type === 'auto_debit') {
      return 'negative';
    }
    return 'neutral';
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="inventory-loading">
        Loading transactions...
      </div>
    );
  }

  return (
    <div className="transaction-history">
      {/* Filters */}
      <div className="txn-filters">
        <div className="filter-group">
          <input
            type="text"
            placeholder="Search by option, reason, or reference..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="stock-search-input"
          />
        </div>
        <div className="filter-group">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="stock-filter-select"
          >
            <option value="all">All Types</option>
            <option value="credit">Credit</option>
            <option value="debit">Debit</option>
            <option value="transfer_in">Transfer In</option>
            <option value="transfer_out">Transfer Out</option>
            <option value="auto_debit">Auto Debit</option>
            <option value="adjustment">Adjustment</option>
          </select>
        </div>
        <div className="filter-group">
          <select
            value={filterDateRange}
            onChange={(e) => setFilterDateRange(e.target.value as any)}
            className="stock-filter-select"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
          </select>
        </div>
        <div className="filter-count">
          {filteredTransactions.length} of {transactions.length} transactions
        </div>
      </div>

      {/* Transaction Table */}
      {filteredTransactions.length > 0 ? (
        <div className="txn-table-wrapper">
          <table className="txn-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Date & Time</th>
                <th>Option</th>
                <th>Type</th>
                <th>Quantity</th>
                <th>Before</th>
                <th>After</th>
                <th>Reason</th>
                <th>Reference</th>
                <th>By</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((txn, index) => (
                <tr key={txn._id}>
                  <td>{index + 1}</td>
                  <td className="date-cell">{formatDate(txn.createdAt)}</td>
                  <td className="option-name">{txn.optionId?.name || 'Unknown'}</td>
                  <td>
                    <span className={`type-badge ${getTypeClass(txn.type)}`}>
                      {getTypeLabel(txn.type)}
                    </span>
                  </td>
                  <td className={`qty-cell ${getTypeClass(txn.type)}`}>
                    {getTypeClass(txn.type) === 'positive' ? '+' : '-'}
                    {txn.quantity}
                  </td>
                  <td className="qty-cell">{txn.quantityBefore}</td>
                  <td className="qty-cell">{txn.quantityAfter}</td>
                  <td>{txn.reason}</td>
                  <td className="reference-cell">
                    {txn.referenceType && (
                      <span className="ref-type">{txn.referenceType}</span>
                    )}
                    {txn.referenceId && (
                      <span className="ref-id">{txn.referenceId.slice(-8)}</span>
                    )}
                  </td>
                  <td>{txn.createdBy?.name || 'System'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="txn-empty">
          {transactions.length === 0
            ? 'No transactions recorded yet. Transactions are created when you credit, debit, or transfer inventory.'
            : 'No transactions match your filters.'}
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;
