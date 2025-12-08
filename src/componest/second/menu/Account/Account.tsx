import { BackButton } from "../../../allCompones/BackButton";
import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../redux/rootReducer";
import { fetchOrders } from "../../../redux/oders/OdersActions";
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
  orderTypes?: string[];
  totalOrders?: number;
}

const Account: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const ordersList = useSelector((state: RootState) => state.orders?.list);
  const orders = ordersList?.orders || [];
  const loading = ordersList?.loading || false;
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // Fetch orders if not already loaded (orders are stored locally after fetch)
  useEffect(() => {
    if (orders.length === 0 && !loading) {
      dispatch(fetchOrders() as any);
    }
  }, [dispatch, orders.length, loading]);

  // Extract unique accounts from orders data (stored locally)
  const accounts = useMemo(() => {
    const customerMap = new Map<string, AccountData>();
    const customerOrderTypes = new Map<string, Set<string>>();
    const customerOrderCount = new Map<string, number>();

    console.log('📦 Total orders:', orders.length);

    orders.forEach((order: any, index: number) => {
      // Get customer - could be object or just ID string
      let customer = order.customer;
      let customerId = '';

      // If customer is a string (just ID), use customerId from order
      if (typeof customer === 'string') {
        customerId = customer;
        customer = null; // No customer object available
      } else if (customer && typeof customer === 'object') {
        // Customer is an object
        customerId = customer._id || customer.id || order.customerId || '';
      } else {
        // No customer object, try to get customerId directly
        customerId = order.customerId || '';
      }

      // Get order type name
      const orderTypeName = order.orderType?.typeName || order.orderType?.name || '';

      console.log(`📋 Order ${index}:`, {
        orderId: order._id || order.orderId,
        customerId,
        hasCustomerObject: !!customer,
        customerName: customer?.companyName || customer?.name || 'N/A',
        orderType: orderTypeName
      });

      if (customerId) {
        // Track order types for this customer
        if (!customerOrderTypes.has(customerId)) {
          customerOrderTypes.set(customerId, new Set());
        }
        if (orderTypeName) {
          customerOrderTypes.get(customerId)?.add(orderTypeName);
        }

        // Track order count
        customerOrderCount.set(customerId, (customerOrderCount.get(customerId) || 0) + 1);

        // Add customer if not exists
        if (!customerMap.has(customerId)) {
          if (customer && typeof customer === 'object') {
            customerMap.set(customerId, {
              _id: customerId,
              companyName: customer.companyName || customer.name || '',
              firstName: customer.firstName || customer.name?.split(' ')[0] || '',
              lastName: customer.lastName || customer.name?.split(' ').slice(1).join(' ') || '',
              phone1: customer.phone1 || customer.phone || '',
              phone2: customer.phone2 || '',
              whatsapp: customer.whatsapp || '',
              telephone: customer.telephone || '',
              address1: customer.address1 || customer.address || '',
              address2: customer.address2 || '',
              state: customer.state || '',
              pinCode: customer.pinCode || customer.zipCode || '',
              email: customer.email || '',
              branchId: customer.branchId || '',
              orderTypes: [],
              totalOrders: 0,
            });
          } else {
            customerMap.set(customerId, {
              _id: customerId,
              companyName: `Customer ${customerId.slice(-4)}`,
              firstName: '',
              lastName: '',
              phone1: '',
              phone2: '',
              whatsapp: '',
              telephone: '',
              address1: '',
              address2: '',
              state: '',
              pinCode: '',
              email: '',
              branchId: '',
              orderTypes: [],
              totalOrders: 0,
            });
          }
        }
      }
    });

    // Add order types and counts to each customer
    customerMap.forEach((account, customerId) => {
      account.orderTypes = Array.from(customerOrderTypes.get(customerId) || []);
      account.totalOrders = customerOrderCount.get(customerId) || 0;
    });

    console.log('👥 Unique accounts found:', customerMap.size);
    return Array.from(customerMap.values());
  }, [orders]);

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
      </div>
    );
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
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search by company, name, email, phone..."
            className="w-full px-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#FF6B35] transition-all"
          />
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-4 py-2 border-b bg-gray-50 rounded-t-lg">
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

          <div className="divide-y divide-gray-200">
            {displayedAccounts.length > 0 ? displayedAccounts.map((acc, idx) => (
              <div
                key={acc._id}
                id={`account-${idx}`}
                className={`px-4 py-2 hover:bg-orange-50 cursor-pointer transition-colors ${
                  selectedIndex === idx ? 'bg-orange-100 border-l-4 border-[#FF6B35]' : ''
                }`}
                onClick={() => handleAccountSelect(acc)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-baseline flex-wrap gap-2">
                      <h3 className="text-lg font-semibold text-gray-800">{acc.companyName}</h3>
                      {acc.state && <span className="text-xs px-2 py-1 bg-orange-100 text-[#FF6B35] rounded-full">{acc.state}</span>}
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded-full">
                        {acc.totalOrders || 0} orders
                      </span>
                    </div>
                    <p className="text-gray-600 mt-1 font-medium">{getFullName(acc)}</p>

                    {/* Order Types */}
                    {acc.orderTypes && acc.orderTypes.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {acc.orderTypes.map((type, i) => (
                          <span key={i} className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                            {type}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="mt-2 text-sm text-gray-500 space-y-1">
                      {acc.email && <div>{acc.email}</div>}
                      {acc.phone1 && <div>{acc.phone1}</div>}
                      {acc.whatsapp && <div>WhatsApp: {acc.whatsapp}</div>}
                      {acc.telephone && <div>Tel: {acc.telephone}</div>}
                      {getFullAddress(acc) && <div>{getFullAddress(acc)}</div>}
                    </div>
                  </div>
                </div>
              </div>
            )) : (
              <div className="px-4 py-6 text-center">
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