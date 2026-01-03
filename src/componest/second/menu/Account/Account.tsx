import { BackButton } from "../../../allCompones/BackButton";
import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useFormDataCache } from "../Edit/hooks/useFormDataCache";
import './Account.css';

// Quick Send Modal Component
const QuickSendModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  account: any;
  mode: 'email' | 'whatsapp';
}> = ({ isOpen, onClose, account, mode }) => {
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState('');

  useEffect(() => {
    if (account) {
      const name = account.companyName || `${account.firstName || ''} ${account.lastName || ''}`.trim() || 'Customer';
      setSubject(`Hello from 27 Infinity - ${name}`);
      setMessage(`Dear ${name},\n\nThank you for your business with 27 Infinity!\n\nBest regards,\n27 Infinity Team`);
    }
  }, [account]);

  if (!isOpen || !account) return null;

  const handleSend = () => {
    if (mode === 'whatsapp') {
      const phone = (account.whatsapp || account.phone1 || '').replace(/\D/g, '');
      const formattedPhone = phone.startsWith('91') ? phone : `91${phone}`;
      const encodedMessage = encodeURIComponent(message);
      window.open(`https://wa.me/${formattedPhone}?text=${encodedMessage}`, '_blank');
    } else {
      const encodedSubject = encodeURIComponent(subject);
      const encodedBody = encodeURIComponent(message);
      window.open(`mailto:${account.email}?subject=${encodedSubject}&body=${encodedBody}`, '_blank');
    }
    onClose();
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white', borderRadius: '16px', width: '100%', maxWidth: '450px', boxShadow: '0 25px 50px rgba(0,0,0,0.25)'
      }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, color: mode === 'email' ? '#FF6B35' : '#25D366', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {mode === 'email' ?
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg> :

            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              </svg>
            }
            {mode === 'email' ? 'Send Email' : 'Send WhatsApp'}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '24px', color: '#6b7280' }}>×</button>
        </div>
        <div style={{ padding: '24px' }}>
          <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
            <div style={{ fontWeight: 600, color: '#111827' }}>{account.companyName}</div>
            <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
              {mode === 'email' ? account.email : account.whatsapp || account.phone1}
            </div>
          </div>
          {mode === 'email' &&
          <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '6px', color: '#374151' }}>Subject</label>
              <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)}
            style={{ width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '8px', boxSizing: 'border-box', fontSize: '14px' }} />
            </div>
          }
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '6px', color: '#374151' }}>Message</label>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={5}
            style={{ width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '8px', resize: 'vertical', boxSizing: 'border-box', fontSize: '14px' }} />
          </div>
          <button onClick={handleSend}
          style={{
            width: '100%', padding: '12px', backgroundColor: mode === 'email' ? '#FF6B35' : '#25D366',
            color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '15px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
          }}>
            {mode === 'email' ?
            <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
                Open Email Client
              </> :

            <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                </svg>
                Open WhatsApp
              </>
            }
          </button>
        </div>
      </div>
    </div>);

};

export interface AccountData {
  _id: string;
  companyName: string;
  firstName: string;
  lastName: string;
  phone1: string;
  phone2?: string;
  whatsapp?: string;
  telephone?: string;
  address1: string;
  address2?: string;
  state: string;
  pinCode: string;
  email: string;
  branchId?: string;
  orderTypes?: string[];
  totalOrders?: number;
}

const Account: React.FC = () => {
  const navigate = useNavigate();

  // 🚀 OPTIMIZED: Get data from cached form data (no API calls!)
  const { customers: rawAccounts, loading, error } = useFormDataCache();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // Quick send modal state
  const [showSendModal, setShowSendModal] = useState(false);
  const [sendModalMode, setSendModalMode] = useState<'email' | 'whatsapp'>('email');
  const [sendModalAccount, setSendModalAccount] = useState<AccountData | null>(null);

  // Open send modal for an account
  const handleQuickSend = (e: React.MouseEvent, account: AccountData, mode: 'email' | 'whatsapp') => {
    e.stopPropagation();
    setSendModalAccount(account);
    setSendModalMode(mode);
    setShowSendModal(true);
  };

  // Transform cached customers to AccountData format
  const accounts = useMemo(() => {
    return rawAccounts.map((customer: any) => ({
      _id: customer._id,
      companyName: customer.companyName || '',
      firstName: customer.firstName || '',
      lastName: customer.lastName || '',
      phone1: customer.phone1 || '',
      phone2: customer.phone2 || '',
      whatsapp: customer.whatsapp || '',
      telephone: customer.telephone || '',
      address1: customer.address1 || '',
      address2: customer.address2 || '',
      state: customer.state || '',
      pinCode: customer.pinCode || '',
      email: customer.email || '',
      branchId: customer.branchId || '',
      orderTypes: [], // Note: Order types not available in customer data
      totalOrders: 0  // Note: Order count not available in customer data
    }));
  }, [rawAccounts]);

  const displayedAccounts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return accounts || [];

    return (accounts || []).filter((acc) =>
    acc.companyName?.toLowerCase().includes(query) ||
    acc.firstName?.toLowerCase().includes(query) ||
    acc.lastName?.toLowerCase().includes(query) ||
    `${acc.firstName || ''} ${acc.lastName || ''}`.toLowerCase().includes(query) ||
    acc.email?.toLowerCase().includes(query) ||
    acc.phone1?.includes(query) ||
    acc.phone2?.includes(query) ||
    acc.whatsapp?.includes(query) ||
    acc.telephone?.includes(query) ||
    acc.state?.toLowerCase().includes(query) ||
    acc.pinCode?.includes(query) ||
    acc.address1?.toLowerCase().includes(query) ||
    acc.address2?.toLowerCase().includes(query)
    );
  }, [searchQuery, accounts]);

  useEffect(() => {
    if (selectedIndex >= 0) {
      const el = document.getElementById(`account-${selectedIndex}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [selectedIndex]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!displayedAccounts.length) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % displayedAccounts.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => prev > 0 ? prev - 1 : displayedAccounts.length - 1);
        break;
      case "Enter":
        if (selectedIndex >= 0) {
          e.preventDefault();
          handleAccountSelect(displayedAccounts[selectedIndex]);
        }
        break;
      case "Escape":
        setSelectedIndex(-1);
        break;
      default:
        break;
    }
  };

  const handleAccountSelect = (account: AccountData) => {
    // Clear previous account data and store new one
    sessionStorage.removeItem('currentAccountData');
    navigate('/menu/AccountInfo', { state: { accountData: account } });
  };

  const getFullName = (a: AccountData) => `${a.firstName || ''} ${a.lastName || ''}`.trim();
  const getFullAddress = (a: AccountData) =>
  [a.address1, a.address2, a.state, a.pinCode].filter(Boolean).join(', ');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <BackButton />
        <div className="max-w-4xl mx-auto text-center py-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6B35] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading accounts...</p>
        </div>
      </div>);

  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <BackButton />
        <div className="max-w-4xl mx-auto text-center py-6">
          <p className="text-red-600">{error}</p>
        </div>
      </div>);

  }

  return (
    <div className="min-h-screen bg-gray-50">
      <BackButton />
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-4">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Search Accounts</h1>
          <p className="text-gray-600">Find companies and contacts</p>
        </div>

        <div className="relative mb-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search by company, name, email, phone..."
            className="w-full px-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#FF6B35] transition-all" />

        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-4 py-2 border-b bg-gray-50 rounded-t-lg sticky top-0 z-10">
            <h2 className="text-lg font-semibold text-gray-800">
              {searchQuery ? 'Search Results' : 'All Accounts'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {displayedAccounts.length} {displayedAccounts.length === 1 ? 'account' : 'accounts'}
              {searchQuery && ` found for "${searchQuery}"`}
              {displayedAccounts.length > 0 &&
              <span className="ml-2 text-[#FF6B35]">Use ↑↓ keys to navigate, Enter to select</span>
              }
            </p>
          </div>

          <div className="accounts-list divide-y divide-gray-200">
            {displayedAccounts.length > 0 ? displayedAccounts.map((acc, idx) =>
            <div
              key={acc._id}
              id={`account-${idx}`}
              className={`px-4 py-2 hover:bg-orange-50 cursor-pointer transition-colors ${
              selectedIndex === idx ? 'bg-orange-100 border-l-4 border-[#FF6B35]' : ''}`
              }
              onClick={() => handleAccountSelect(acc)}>

                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-baseline flex-wrap gap-2">
                      <h3 className="text-lg font-semibold text-gray-800">{acc.companyName}</h3>
                      {acc.state && <span className="text-xs px-2 py-1 bg-orange-100 text-[#FF6B35] rounded-full">{acc.state}</span>}
                    </div>
                    <p className="text-gray-600 mt-1 font-medium">{getFullName(acc)}</p>

                    <div className="mt-2 text-sm text-gray-500 space-y-1">
                      {acc.email && <div>{acc.email}</div>}
                      {acc.phone1 && <div>{acc.phone1}</div>}
                      {acc.whatsapp && <div>WhatsApp: {acc.whatsapp}</div>}
                      {acc.telephone && <div>Tel: {acc.telephone}</div>}
                      {getFullAddress(acc) && <div>{getFullAddress(acc)}</div>}
                    </div>
                  </div>

                  {/* Quick Send Buttons */}
                  <div className="flex gap-2 ml-3">
                    {acc.email &&
                  <button
                    onClick={(e) => handleQuickSend(e, acc, 'email')}
                    title="Send Email"
                    className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 bg-white hover:bg-[#FF6B35] hover:border-[#FF6B35] hover:text-white transition-colors"
                    style={{ color: '#FF6B35' }}>

                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                          <polyline points="22,6 12,13 2,6" />
                        </svg>
                      </button>
                  }
                    {(acc.whatsapp || acc.phone1) &&
                  <button
                    onClick={(e) => handleQuickSend(e, acc, 'whatsapp')}
                    title="Send WhatsApp"
                    className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 bg-white hover:bg-[#25D366] hover:border-[#25D366] hover:text-white transition-colors"
                    style={{ color: '#25D366' }}>

                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                        </svg>
                      </button>
                  }
                  </div>
                </div>
              </div>
            ) :
            <div className="px-4 py-6 text-center">
                <h3 className="text-lg font-medium text-gray-700 mb-2">No results found</h3>
                <p className="text-gray-500">No accounts match your search term "{searchQuery}"</p>
              </div>
            }
          </div>
        </div>
      </div>

      {/* Quick Send Modal */}
      <QuickSendModal
        isOpen={showSendModal}
        onClose={() => setShowSendModal(false)}
        account={sendModalAccount}
        mode={sendModalMode} />

    </div>);

};

export default Account;