import { BackButton } from "../../../allCompones/BackButton";
import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getAccounts } from "../../../redux/create/createNewAccount/NewAccountActions";
import { RootState } from "../../../redux/rootReducer";
import './Account.css';

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
}

const Account: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { accounts = [], loading } = useSelector((state: RootState) => state.getAccounts || {});
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(-1);

  useEffect(() => {
    dispatch(getAccounts());
  }, [dispatch]);

  const displayedAccounts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return accounts || [];

    return (accounts || []).filter(acc =>
      acc.companyName?.toLowerCase().includes(query) ||
      acc.firstName?.toLowerCase().includes(query) ||
      acc.lastName?.toLowerCase().includes(query) ||
      (`${acc.firstName || ''} ${acc.lastName || ''}`).toLowerCase().includes(query) ||
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
        setSelectedIndex(prev => (prev + 1) % displayedAccounts.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : displayedAccounts.length - 1));
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
    navigate('/menu/AccountInfo', { state: { accountData: account } });
  };

  const getFullName = (a: AccountData) => `${a.firstName || ''} ${a.lastName || ''}`.trim();
  const getFullAddress = (a: AccountData) =>
    [a.address1, a.address2, a.state, a.pinCode].filter(Boolean).join(', ');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <BackButton />
        <div className="max-w-4xl mx-auto text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6B35] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading accounts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <BackButton />
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Search Accounts</h1>
          <p className="text-gray-600">Find companies and contacts</p>
        </div>

        <div className="relative mb-6">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search by company, name, email, phone..."
            className="w-full px-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#FF6B35] transition-all"
          />
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b bg-gray-50 rounded-t-lg">
            <h2 className="text-lg font-semibold text-gray-800">
              {searchQuery ? 'Search Results' : 'All Accounts'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {displayedAccounts.length} {displayedAccounts.length === 1 ? 'account' : 'accounts'}
              {searchQuery && ` found for "${searchQuery}"`}
              {displayedAccounts.length > 0 && (
                <span className="ml-2 text-[#FF6B35]">Use ↑↓ keys to navigate, Enter to select</span>
              )}
            </p>
          </div>

          <div className="max-h-96 overflow-y-auto divide-y divide-gray-200">
            {displayedAccounts.length > 0 ? displayedAccounts.map((acc, idx) => (
              <div
                key={acc._id}
                id={`account-${idx}`}
                className={`px-6 py-4 hover:bg-orange-50 cursor-pointer transition-colors ${
                  selectedIndex === idx ? 'bg-orange-100 border-l-4 border-[#FF6B35]' : ''
                }`}
                onClick={() => handleAccountSelect(acc)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-baseline">
                      <h3 className="text-lg font-semibold text-gray-800 mr-3">{acc.companyName}</h3>
                      <span className="text-xs px-2 py-1 bg-orange-100 text-[#FF6B35] rounded-full">{acc.state}</span>
                    </div>
                    <p className="text-gray-600 mt-1 font-medium">{getFullName(acc)}</p>
                    <div className="mt-2 text-sm text-gray-500 space-y-1">
                      <div>{acc.email}</div>
                      <div>{acc.phone1}</div>
                      {acc.whatsapp && <div>WhatsApp: {acc.whatsapp}</div>}
                      {acc.telephone && <div>Tel: {acc.telephone}</div>}
                      <div>{getFullAddress(acc)}</div>
                    </div>
                  </div>
                </div>
              </div>
            )) : (
              <div className="px-6 py-12 text-center">
                <h3 className="text-lg font-medium text-gray-700 mb-2">No results found</h3>
                <p className="text-gray-500">No accounts match your search term "{searchQuery}"</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;