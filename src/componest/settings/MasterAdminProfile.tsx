/**
 * Master Admin Profile Page
 * Shows master admin profile, email, Product27InfinityId, company details, and billing
 * Only accessible by master_admin role
 */

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../redux/rootReducer';
import { getMasterAdminProfile } from '../redux/unifiedV2/masterAdminProfileActions';
import {
  getCurrentBill,
  getBillingHistory,
  generateBill,
} from '../redux/unifiedV2/billingActions';
import { InfinitySpinner } from '../../components/InfinitySpinner';

interface ProfileData {
  profile: {
    _id: string;
    username: string;
    email: string;
    fullName: string;
    phone: string;
    bio: string;
    profileImage: string;
    role: string;
    permissions: string[];
    isActive: boolean;
    emailVerified: boolean;
    phoneVerified: boolean;
    twoFactorEnabled: boolean;
    lastLogin: string;
    createdAt: string;
    updatedAt: string;
  };
  company: {
    _id: string;
    Product27InfinityId: string;
    name: string;
    description: string;
    type: string;
    category: string;
    status: string;
    version: string;
    pricing: {
      model: string;
      amount: number;
      currency: string;
      billingCycle: string;
    };
    features: Array<{
      name: string;
      description: string;
      enabled: boolean;
    }>;
    metrics: {
      totalUsers: number;
      activeUsers: number;
      totalRevenue: number;
      lastUpdated: string;
    };
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
  statistics: {
    totalBranches: number;
    totalAdmins: number;
    totalManagers: number;
  };
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MasterAdminProfile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [copied, setCopied] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'billing'>('profile');
  const [generatingBill, setGeneratingBill] = useState(false);

  const { userData } = useSelector((state: RootState) => state.auth);
  const { data, loading, error } = useSelector(
    (state: RootState) => state.v2?.masterAdminProfile || { data: null, loading: false, error: null }
  );
  const billingState = useSelector(
    (state: RootState) => state.v2?.billing || { current: null, history: null, summary: null, loading: false, error: null }
  );

  const profileData = data as ProfileData | null;

  useEffect(() => {
    // Only master_admin can access this page
    if (userData?.role !== 'master_admin') {
      navigate('/');
      return;
    }

    const fetchData = async () => {
      try {
        await dispatch(getMasterAdminProfile() as any);
        await dispatch(getCurrentBill() as any);
        await dispatch(getBillingHistory() as any);
      } finally {
        setIsInitialLoad(false);
      }
    };

    fetchData();
  }, [dispatch, userData, navigate]);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatShortDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleGenerateBill = async () => {
    setGeneratingBill(true);
    try {
      await dispatch(generateBill() as any);
      await dispatch(getCurrentBill() as any);
      await dispatch(getBillingHistory() as any);
    } catch (err) {
      console.error('Failed to generate bill:', err);
    } finally {
      setGeneratingBill(false);
    }
  };

  // NOTE: Pay/Unpay functionality removed
  // Bill status updates are now managed by dashboard admin only

  // Show loading on initial load or when loading
  if (loading || isInitialLoad) {
    return (
      <div style={styles.loadingContainer}>
        <InfinitySpinner />
        <p style={styles.loadingText}>Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <button style={styles.backButton} onClick={() => navigate('/')}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h1 style={styles.pageTitle}>Master Admin Profile</h1>
        </div>
        <div style={styles.errorCard}>
          <h2 style={styles.errorTitle}>Error Loading Profile</h2>
          <p style={styles.errorText}>{error}</p>
          <button
            style={styles.retryButton}
            onClick={() => dispatch(getMasterAdminProfile() as any)}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <button style={styles.backButton} onClick={() => navigate('/')}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h1 style={styles.pageTitle}>Master Admin Profile</h1>
        </div>
        <div style={styles.errorCard}>
          <p style={styles.errorText}>No profile data available</p>
          <button
            style={styles.retryButton}
            onClick={() => dispatch(getMasterAdminProfile() as any)}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { profile, company, statistics } = profileData;
  const currentBill = billingState.current;
  const billHistory = billingState.history || [];
  const billSummary = billingState.summary;

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button style={styles.backButton} onClick={() => navigate('/')}>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <h1 style={styles.pageTitle}>Master Admin Profile</h1>
      </div>

      {/* Tabs */}
      <div style={styles.tabsContainer}>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === 'profile' ? styles.activeTab : {}),
          }}
          onClick={() => setActiveTab('profile')}
        >
          Profile & Company
        </button>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === 'billing' ? styles.activeTab : {}),
          }}
          onClick={() => setActiveTab('billing')}
        >
          Billing
        </button>
      </div>

      {activeTab === 'profile' ? (
        <div style={styles.content}>
          {/* Profile Card */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={styles.profileIcon}>
                {profile.profileImage ? (
                  <img src={profile.profileImage} alt="Profile" style={styles.profileImage} />
                ) : (
                  <span style={styles.profileInitial}>
                    {profile.fullName?.charAt(0)?.toUpperCase() || 'M'}
                  </span>
                )}
              </div>
              <div style={styles.profileInfo}>
                <h2 style={styles.profileName}>{profile.fullName}</h2>
                <span style={styles.roleBadge}>Master Admin</span>
              </div>
            </div>

            <div style={styles.cardBody}>
              <h3 style={styles.sectionTitle}>Account Information</h3>

              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Email</span>
                <div style={styles.infoValueContainer}>
                  <span style={styles.infoValue}>{profile.email}</span>
                  <button
                    style={styles.copyButton}
                    onClick={() => copyToClipboard(profile.email, 'email')}
                  >
                    {copied === 'email' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Username</span>
                <span style={styles.infoValue}>{profile.username}</span>
              </div>

              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Phone</span>
                <span style={styles.infoValue}>{profile.phone || 'Not set'}</span>
              </div>

              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Email Verified</span>
                <span style={{...styles.statusBadge, backgroundColor: profile.emailVerified ? '#dcfce7' : '#fef3c7', color: profile.emailVerified ? '#166534' : '#92400e'}}>
                  {profile.emailVerified ? 'Verified' : 'Not Verified'}
                </span>
              </div>

              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Two-Factor Auth</span>
                <span style={{...styles.statusBadge, backgroundColor: profile.twoFactorEnabled ? '#dcfce7' : '#fee2e2', color: profile.twoFactorEnabled ? '#166534' : '#991b1b'}}>
                  {profile.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>

              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Last Login</span>
                <span style={styles.infoValue}>{formatDate(profile.lastLogin)}</span>
              </div>

              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Account Created</span>
                <span style={styles.infoValue}>{formatDate(profile.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Company Card */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={styles.companyIcon}>
                <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#FF6B35" strokeWidth="2">
                  <path d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-4M9 9v.01M9 12v.01M9 15v.01M9 18v.01" />
                </svg>
              </div>
              <div style={styles.profileInfo}>
                <h2 style={styles.profileName}>{company.name}</h2>
                <span style={{...styles.statusBadge, backgroundColor: company.status === 'active' ? '#dcfce7' : '#fef3c7', color: company.status === 'active' ? '#166534' : '#92400e'}}>
                  {company.status}
                </span>
              </div>
            </div>

            <div style={styles.cardBody}>
              <h3 style={styles.sectionTitle}>Company Information</h3>

              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Product27 Infinity ID</span>
                <div style={styles.infoValueContainer}>
                  <span style={styles.idValue}>{company.Product27InfinityId}</span>
                  <button
                    style={styles.copyButton}
                    onClick={() => copyToClipboard(company.Product27InfinityId, 'product27Id')}
                  >
                    {copied === 'product27Id' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Company ID</span>
                <div style={styles.infoValueContainer}>
                  <span style={styles.idValue}>{company._id}</span>
                  <button
                    style={styles.copyButton}
                    onClick={() => copyToClipboard(company._id, 'companyId')}
                  >
                    {copied === 'companyId' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Type</span>
                <span style={styles.infoValue}>{company.type}</span>
              </div>

              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Category</span>
                <span style={styles.infoValue}>{company.category}</span>
              </div>

              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Version</span>
                <span style={styles.infoValue}>{company.version}</span>
              </div>

              {company.description && (
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Description</span>
                  <span style={styles.infoValue}>{company.description}</span>
                </div>
              )}

              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Created</span>
                <span style={styles.infoValue}>{formatDate(company.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Statistics Card */}
          <div style={styles.card}>
            <div style={styles.cardBody}>
              <h3 style={styles.sectionTitle}>Organization Statistics</h3>
              <div style={styles.statsGrid}>
                <div style={styles.statItem}>
                  <span style={styles.statNumber}>{statistics.totalBranches}</span>
                  <span style={styles.statLabel}>Branches</span>
                </div>
                <div style={styles.statItem}>
                  <span style={styles.statNumber}>{statistics.totalAdmins}</span>
                  <span style={styles.statLabel}>Admins</span>
                </div>
                <div style={styles.statItem}>
                  <span style={styles.statNumber}>{statistics.totalManagers}</span>
                  <span style={styles.statLabel}>Managers</span>
                </div>
              </div>
            </div>
          </div>

          {/* Permissions Card */}
          {profile.permissions && profile.permissions.length > 0 && (
            <div style={styles.card}>
              <div style={styles.cardBody}>
                <h3 style={styles.sectionTitle}>Permissions ({profile.permissions.length})</h3>
                <div style={styles.permissionsGrid}>
                  {profile.permissions.map((permission, index) => (
                    <span key={index} style={styles.permissionBadge}>
                      {permission.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div style={styles.billingContent}>
          {/* Pricing Info Card */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={styles.companyIcon}>
                <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#FF6B35" strokeWidth="2">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <div style={styles.profileInfo}>
                <h2 style={styles.profileName}>Monthly Pricing</h2>
                <span style={styles.statusBadge}>Per Unit Rates</span>
              </div>
            </div>
            <div style={styles.cardBody}>
              <div style={styles.pricingTable}>
                <div style={styles.pricingTableRow}>
                  <span style={styles.pricingTableLabel}>Base</span>
                  <span style={styles.pricingTableRate}>{formatCurrency(30)}</span>
                  <span style={styles.pricingTableUnit}>/ branch / month</span>
                </div>
                <div style={{...styles.pricingTableRow, backgroundColor: '#f9fafb'}}>
                  <span style={styles.pricingTableLabel}>Branch</span>
                  <span style={styles.pricingTableRate}>{formatCurrency(499)}</span>
                  <span style={styles.pricingTableUnit}>/ month</span>
                </div>
                <div style={styles.pricingTableRow}>
                  <span style={styles.pricingTableLabel}>Admin</span>
                  <span style={styles.pricingTableRate}>{formatCurrency(70)}</span>
                  <span style={styles.pricingTableUnit}>/ month</span>
                </div>
                <div style={{...styles.pricingTableRow, backgroundColor: '#f9fafb'}}>
                  <span style={styles.pricingTableLabel}>Manager</span>
                  <span style={styles.pricingTableRate}>{formatCurrency(50)}</span>
                  <span style={styles.pricingTableUnit}>/ month</span>
                </div>
                <div style={styles.pricingTableRow}>
                  <span style={styles.pricingTableLabel}>Operator</span>
                  <span style={styles.pricingTableRate}>{formatCurrency(40)}</span>
                  <span style={styles.pricingTableUnit}>/ month</span>
                </div>
                <div style={{...styles.pricingTableRow, backgroundColor: '#f9fafb'}}>
                  <span style={styles.pricingTableLabel}>Old Order</span>
                  <span style={styles.pricingTableRate}>{formatCurrency(0.9)}</span>
                  <span style={styles.pricingTableUnit}>/ order</span>
                </div>
                <div style={{...styles.pricingTableRow, borderBottom: 'none'}}>
                  <span style={styles.pricingTableLabel}>New Order</span>
                  <span style={styles.pricingTableRate}>{formatCurrency(2.5)}</span>
                  <span style={styles.pricingTableUnit}>/ order</span>
                </div>
              </div>
              <p style={styles.taxNote}>+ 18% GST on all charges</p>
            </div>
          </div>

          {/* Current Month Bill Card - ALWAYS shows LIVE data */}
          <div style={styles.card}>
            <div style={styles.cardBody}>
              <div style={styles.billHeaderRow}>
                <h3 style={styles.sectionTitle}>
                  {currentBill?.isGenerated ? 'Current Month (Live Usage)' : 'Current Month (Live Preview)'}
                </h3>
                {!currentBill?.isGenerated && (
                  <button
                    style={styles.generateButton}
                    onClick={handleGenerateBill}
                    disabled={generatingBill}
                  >
                    {generatingBill ? 'Generating...' : 'Generate Bill'}
                  </button>
                )}
              </div>

              {currentBill?.preview ? (
                <>
                  <div style={styles.billPeriod}>
                    {MONTH_NAMES[currentBill.preview.billingMonth - 1]} {currentBill.preview.billingYear}
                    <span style={styles.liveIndicator}>LIVE</span>
                  </div>

                  {/* Billing Period Date Range */}
                  <div style={styles.billDateRange}>
                    <span style={styles.dateRangeLabel}>Period:</span>
                    <span style={styles.dateRangeValue}>
                      {formatShortDate(currentBill.preview.periodStart)} - {formatShortDate(currentBill.preview.periodEnd)}
                    </span>
                  </div>

                  {/* Always show LIVE preview data (real-time usage) */}
                  <div style={styles.billBreakdown}>
                    <div style={styles.billRow}>
                      <span>Base Charge ({currentBill.preview.usage.branches} branches x {formatCurrency(30)})</span>
                      <span>{formatCurrency(currentBill.preview.breakdown.baseAmount)}</span>
                    </div>
                    <div style={styles.billRow}>
                      <span>Branches ({currentBill.preview.usage.branches} x {formatCurrency(499)})</span>
                      <span>{formatCurrency(currentBill.preview.breakdown.branchAmount)}</span>
                    </div>
                    <div style={styles.billRow}>
                      <span>Admins ({currentBill.preview.usage.admins} x {formatCurrency(70)})</span>
                      <span>{formatCurrency(currentBill.preview.breakdown.adminAmount)}</span>
                    </div>
                    <div style={styles.billRow}>
                      <span>Managers ({currentBill.preview.usage.managers} x {formatCurrency(50)})</span>
                      <span>{formatCurrency(currentBill.preview.breakdown.managerAmount)}</span>
                    </div>
                    <div style={styles.billRow}>
                      <span>Operators ({currentBill.preview.usage.operators} x {formatCurrency(40)})</span>
                      <span>{formatCurrency(currentBill.preview.breakdown.operatorAmount)}</span>
                    </div>
                    <div style={styles.billRow}>
                      <span>Old Orders ({currentBill.preview.usage.oldOrders || 0} x {formatCurrency(0.9)})</span>
                      <span>{formatCurrency(currentBill.preview.breakdown.oldOrderAmount || 0)}</span>
                    </div>
                    <div style={styles.billRow}>
                      <span>New Orders ({currentBill.preview.usage.newOrders || 0} x {formatCurrency(2.5)})</span>
                      <span>{formatCurrency(currentBill.preview.breakdown.newOrderAmount || 0)}</span>
                    </div>
                    <div style={styles.billDivider} />
                    <div style={styles.billRow}>
                      <span>Subtotal</span>
                      <span>{formatCurrency(currentBill.preview.subtotal)}</span>
                    </div>
                    {/* Discount Display */}
                    {currentBill.preview.discount && currentBill.preview.discount.amount > 0 && (
                      <>
                        <div style={styles.discountRow}>
                          <span>
                            Discount ({currentBill.preview.discount.type === 'percentage'
                              ? `${currentBill.preview.discount.value}%`
                              : 'Fixed'})
                            {currentBill.preview.discount.reason && (
                              <span style={styles.discountReason}> - {currentBill.preview.discount.reason}</span>
                            )}
                          </span>
                          <span style={styles.discountAmount}>-{formatCurrency(currentBill.preview.discount.amount)}</span>
                        </div>
                        <div style={styles.billRow}>
                          <span>Discounted Subtotal</span>
                          <span>{formatCurrency(currentBill.preview.discountedSubtotal || currentBill.preview.subtotal)}</span>
                        </div>
                      </>
                    )}
                    <div style={styles.billRow}>
                      <span>GST (18%)</span>
                      <span>{formatCurrency(currentBill.preview.tax)}</span>
                    </div>
                    <div style={styles.billDivider} />
                    <div style={styles.billTotalRow}>
                      <span>Total Amount</span>
                      <span style={styles.billTotal}>{formatCurrency(currentBill.preview.totalAmount)}</span>
                    </div>
                  </div>

                  {/* Show bill status if generated (read-only - status managed by dashboard admin) */}
                  {currentBill.isGenerated && currentBill.bill && (
                    <div style={styles.billActions}>
                      <span style={{
                        ...styles.billStatusBadge,
                        backgroundColor: currentBill.bill.status === 'paid' ? '#dcfce7' : '#fef3c7',
                        color: currentBill.bill.status === 'paid' ? '#166534' : '#92400e',
                      }}>
                        BILL {currentBill.bill.status.toUpperCase()}
                      </span>
                    </div>
                  )}
                </>
              ) : billingState.loading ? (
                <p style={styles.noBillText}>Loading billing data...</p>
              ) : (
                <p style={styles.noBillText}>No billing data available</p>
              )}
            </div>
          </div>

          {/* Bill Summary Card */}
          {billSummary && (
            <div style={styles.card}>
              <div style={styles.cardBody}>
                <h3 style={styles.sectionTitle}>Billing Summary</h3>
                <div style={styles.summaryGrid}>
                  <div style={styles.summaryItem}>
                    <span style={styles.summaryNumber}>{billSummary.total}</span>
                    <span style={styles.summaryLabel}>Total Bills</span>
                  </div>
                  <div style={{...styles.summaryItem, backgroundColor: '#dcfce7'}}>
                    <span style={{...styles.summaryNumber, color: '#166534'}}>{billSummary.paid.count}</span>
                    <span style={styles.summaryLabel}>Paid</span>
                    <span style={styles.summaryAmount}>{formatCurrency(billSummary.paid.amount)}</span>
                  </div>
                  <div style={{...styles.summaryItem, backgroundColor: '#fef3c7'}}>
                    <span style={{...styles.summaryNumber, color: '#92400e'}}>{billSummary.pending.count}</span>
                    <span style={styles.summaryLabel}>Pending</span>
                    <span style={styles.summaryAmount}>{formatCurrency(billSummary.pending.amount)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bill History Card */}
          <div style={styles.card}>
            <div style={styles.cardBody}>
              <h3 style={styles.sectionTitle}>Bill History</h3>
              {billHistory.length > 0 ? (
                <div style={styles.billHistoryList}>
                  {billHistory.map((bill: any) => (
                    <div key={bill._id} style={styles.billHistoryItem}>
                      <div style={styles.billHistoryInfo}>
                        <span style={styles.billHistoryMonth}>
                          {MONTH_NAMES[bill.billingMonth - 1]} {bill.billingYear}
                        </span>
                        <span style={styles.billHistoryNumber}>{bill.billNumber}</span>
                        <span style={styles.billHistoryPeriod}>
                          {formatShortDate(bill.periodStart)} - {formatShortDate(bill.periodEnd)}
                        </span>
                        {/* Show discount badge if bill has discount */}
                        {bill.discount && bill.discount.amount > 0 && (
                          <span style={styles.billHistoryDiscount}>
                            Discount: -{formatCurrency(bill.discount.amount)}
                            {bill.discount.type === 'percentage' ? ` (${bill.discount.value}%)` : ' (Fixed)'}
                          </span>
                        )}
                      </div>
                      <div style={styles.billHistoryDetails}>
                        <span style={styles.billHistoryAmount}>{formatCurrency(bill.totalAmount)}</span>
                        <span style={{
                          ...styles.billHistoryStatus,
                          backgroundColor: bill.status === 'paid' ? '#dcfce7' : '#fef3c7',
                          color: bill.status === 'paid' ? '#166534' : '#92400e',
                        }}>
                          {bill.status}
                        </span>
                      </div>
                      {/* Pay/Unpay buttons removed - status managed by dashboard admin */}
                    </div>
                  ))}
                </div>
              ) : (
                <p style={styles.noBillText}>No billing history available</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    height: '100vh',
    backgroundColor: '#f9fafb',
    padding: '20px',
    overflowY: 'auto',
    overflowX: 'hidden',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    marginTop: '16px',
    color: '#6b7280',
    fontSize: '14px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '16px',
  },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    backgroundColor: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#374151',
    transition: 'background-color 0.2s',
  },
  pageTitle: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#111827',
    margin: 0,
  },
  tabsContainer: {
    display: 'flex',
    gap: '8px',
    marginBottom: '24px',
    borderBottom: '1px solid #e5e7eb',
    paddingBottom: '0',
  },
  tab: {
    padding: '12px 24px',
    backgroundColor: 'transparent',
    border: 'none',
    borderBottom: '2px solid transparent',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    color: '#6b7280',
    transition: 'all 0.2s',
  },
  activeTab: {
    color: '#FF6B35',
    borderBottomColor: '#FF6B35',
  },
  content: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '20px',
    maxWidth: '1400px',
    margin: '0 auto',
  },
  billingContent: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '20px',
    maxWidth: '1400px',
    margin: '0 auto',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '20px',
    backgroundColor: '#fff7ed',
    borderBottom: '1px solid #fed7aa',
  },
  profileIcon: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    backgroundColor: '#FF6B35',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  profileInitial: {
    fontSize: '28px',
    fontWeight: '600',
    color: 'white',
  },
  companyIcon: {
    width: '64px',
    height: '64px',
    borderRadius: '12px',
    backgroundColor: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid #FF6B35',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#111827',
    margin: '0 0 8px 0',
  },
  roleBadge: {
    display: 'inline-block',
    padding: '4px 12px',
    backgroundColor: '#FF6B35',
    color: 'white',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '500',
  },
  cardBody: {
    padding: '20px',
    borderBottom: '1px solid #f3f4f6',
  },
  sectionTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    margin: '0 0 16px 0',
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid #f3f4f6',
  },
  infoLabel: {
    fontSize: '14px',
    color: '#6b7280',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: '14px',
    color: '#111827',
    fontWeight: '500',
  },
  infoValueContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  idValue: {
    fontSize: '13px',
    color: '#374151',
    fontFamily: 'monospace',
    backgroundColor: '#f3f4f6',
    padding: '4px 8px',
    borderRadius: '4px',
    maxWidth: '200px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  copyButton: {
    padding: '4px 12px',
    backgroundColor: '#f3f4f6',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    color: '#374151',
    transition: 'background-color 0.2s',
  },
  statusBadge: {
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '16px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
  },
  statNumber: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#FF6B35',
  },
  statLabel: {
    fontSize: '12px',
    color: '#6b7280',
    marginTop: '4px',
  },
  permissionsGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  permissionBadge: {
    display: 'inline-block',
    padding: '6px 12px',
    backgroundColor: '#eff6ff',
    color: '#1d4ed8',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  errorCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '40px',
    textAlign: 'center',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    maxWidth: '400px',
    margin: '100px auto',
  },
  errorTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#991b1b',
    margin: '0 0 12px 0',
  },
  errorText: {
    fontSize: '14px',
    color: '#6b7280',
    margin: '0 0 20px 0',
  },
  retryButton: {
    padding: '10px 24px',
    backgroundColor: '#FF6B35',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },
  // Billing styles
  pricingGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '12px',
  },
  pricingGrid6: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    gap: '12px',
  },
  pricingGrid7: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '10px',
  },
  pricingItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '16px 8px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
  },
  pricingIcon: {
    fontSize: '12px',
    color: '#6b7280',
    marginBottom: '8px',
    fontWeight: '500',
  },
  pricingRate: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#FF6B35',
  },
  pricingUnit: {
    fontSize: '11px',
    color: '#9ca3af',
    marginTop: '4px',
  },
  // Table-like pricing styles
  pricingTable: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  pricingTableRow: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    backgroundColor: '#fff',
    borderBottom: '1px solid #e5e7eb',
  },
  pricingTableLabel: {
    flex: '0 0 100px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
  },
  pricingTableRate: {
    flex: '0 0 100px',
    fontSize: '15px',
    fontWeight: '700',
    color: '#FF6B35',
  },
  pricingTableUnit: {
    flex: '1',
    fontSize: '13px',
    color: '#6b7280',
  },
  taxNote: {
    fontSize: '12px',
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: '12px',
    marginBottom: 0,
  },
  billHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  generateButton: {
    padding: '8px 16px',
    backgroundColor: '#FF6B35',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
  },
  billPeriod: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '16px',
    textAlign: 'center',
    padding: '12px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '12px',
  },
  liveIndicator: {
    display: 'inline-block',
    padding: '4px 8px',
    backgroundColor: '#22c55e',
    color: 'white',
    borderRadius: '4px',
    fontSize: '10px',
    fontWeight: '700',
    letterSpacing: '1px',
    animation: 'pulse 2s infinite',
  },
  billDateRange: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '16px',
    padding: '8px',
    backgroundColor: '#eff6ff',
    borderRadius: '6px',
  },
  dateRangeLabel: {
    fontSize: '12px',
    color: '#6b7280',
    fontWeight: '500',
  },
  dateRangeValue: {
    fontSize: '13px',
    color: '#1d4ed8',
    fontWeight: '600',
  },
  billBreakdown: {
    marginBottom: '16px',
  },
  billRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    fontSize: '14px',
    color: '#374151',
  },
  discountRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    fontSize: '14px',
    color: '#16a34a',
    backgroundColor: '#f0fdf4',
    margin: '4px -8px',
    paddingLeft: '8px',
    paddingRight: '8px',
    borderRadius: '4px',
  },
  discountReason: {
    fontSize: '12px',
    color: '#6b7280',
    fontStyle: 'italic',
  },
  discountAmount: {
    fontWeight: '600',
    color: '#16a34a',
  },
  billDivider: {
    height: '1px',
    backgroundColor: '#e5e7eb',
    margin: '8px 0',
  },
  billTotalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '12px 0',
    fontSize: '16px',
    fontWeight: '600',
    color: '#111827',
  },
  billTotal: {
    color: '#FF6B35',
    fontSize: '20px',
  },
  billActions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '16px',
    paddingTop: '16px',
    borderTop: '1px solid #e5e7eb',
  },
  billStatusBadge: {
    padding: '6px 16px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
  },
  // REMOVED: payButton and unpayButton styles (status managed by dashboard admin)
  noBillText: {
    fontSize: '14px',
    color: '#9ca3af',
    textAlign: 'center',
    padding: '20px',
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
  },
  summaryItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '16px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
  },
  summaryNumber: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#FF6B35',
  },
  summaryLabel: {
    fontSize: '12px',
    color: '#6b7280',
    marginTop: '4px',
  },
  summaryAmount: {
    fontSize: '11px',
    color: '#374151',
    marginTop: '4px',
    fontWeight: '500',
  },
  billHistoryList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  billHistoryItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
  },
  billHistoryInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  billHistoryMonth: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#111827',
  },
  billHistoryNumber: {
    fontSize: '11px',
    color: '#9ca3af',
    fontFamily: 'monospace',
  },
  billHistoryPeriod: {
    fontSize: '11px',
    color: '#1d4ed8',
    fontWeight: '500',
  },
  billHistoryDiscount: {
    fontSize: '11px',
    color: '#16a34a',
    fontWeight: '500',
    backgroundColor: '#f0fdf4',
    padding: '2px 6px',
    borderRadius: '4px',
    marginTop: '2px',
  },
  billHistoryDetails: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  billHistoryAmount: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
  },
  billHistoryStatus: {
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  // REMOVED: billHistoryActions, smallPayButton, smallUnpayButton (status managed by dashboard admin)
};

export default MasterAdminProfile;
