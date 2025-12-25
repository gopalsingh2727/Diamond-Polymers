import React, { useState, forwardRef, useImperativeHandle, useEffect, useRef } from "react";
import Data from "../../../../allCompones/date";
import OptimizedSuggestions from "../SuggestionInput/OptimizedSuggestions";

import './curstomerName.css';

interface CustomerData {
  _id: string;
  name: string;
  address: string;
  phone: string;
  whatsapp: string;
  email: string;
  companyName: string;
  phone2: string;
  pinCode: string;
  state: string;
  imageUrl: string;
  gstNumber: string;
}

export interface CustomerNameRef {
  getCustomerData: () => CustomerData & { status: string };
  resetCustomerData: () => void;
  focus: () => void;
}

interface CustomerNameProps {
  initialData?: any;
  isEditMode?: boolean;
  onCustomerSelect?: () => void;
}

const CustomerName = forwardRef<CustomerNameRef, CustomerNameProps>(({ initialData, isEditMode, onCustomerSelect }, ref) => {
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus the account name input when component mounts (only in create mode)
  useEffect(() => {
    if (!isEditMode && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [isEditMode]);

  // Keyboard navigation for suggestions
  const [suggestionSelectedIndex, setSuggestionSelectedIndex] = useState(-1);
  const [currentSuggestions, setCurrentSuggestions] = useState<any[]>([]);

  const [customerData, setCustomerData] = useState<CustomerData>({
    _id: '',
    name: '',
    address: '',
    phone: '',
    whatsapp: '',
    email: '',
    companyName: '',
    phone2: '',
    pinCode: '',
    state: '',
    imageUrl: '',
    gstNumber: '',
  });

  const [status, setStatus] = useState<string>('Wait for Approval');
  const [showCustomerSuggestions, setShowCustomerSuggestions] = useState(false);
  const [showCustomerDetails, setShowCustomerDetails] = useState(false);

  console.log('🔍 CustomerName - Initial data:', initialData);
  console.log('🔍 CustomerName - Is edit mode:', isEditMode);

  // FIXED: Load initial data if in edit mode with comprehensive mapping
  useEffect(() => {
    if (isEditMode && initialData) {
      console.log('🔄 Loading customer data for edit:', initialData);

      // Handle different possible data structures
      const customer = initialData.customer || initialData;

      setCustomerData({
        _id: customer._id || initialData.customerId || '',
        name: customer.name ||
              customer.companyName ||
              initialData.companyName ||
              (customer.firstName && customer.lastName ? `${customer.firstName} ${customer.lastName}`.trim() : '') ||
              '',
        companyName: customer.companyName || initialData.companyName || '',
        address: customer.address ||
                 customer.address1 ||
                 (customer.address1 && customer.address2 ? `${customer.address1} ${customer.address2}`.trim() : customer.address1 || '') ||
                 '',
        phone: customer.phone ||
               customer.phone1 ||
               customer.telephone ||
               initialData.customerPhone ||
               '',
        whatsapp: customer.whatsapp || '',
        email: customer.email || '',
        phone2: customer.phone2 || '',
        pinCode: customer.pinCode || '',
        state: customer.state || '',
        imageUrl: customer.imageUrl || '',
        gstNumber: customer.gstNumber || '',
      });

      // Set status from initial data
      if (initialData.status) {
        setStatus(initialData.overallStatus || initialData.status || 'Wait for Approval');
      }
    }
  }, [isEditMode, initialData]);

// Replace your handleCustomerSelect function in CustomerName.tsx with this:

const handleCustomerSelect = (account: any) => {
  console.log('Customer selected:', account);

  // Extract username from email as fallback for name
  const emailUsername = account.email
    ? account.email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
    : '';

  setCustomerData({
    _id: account._id || '',
    // Handle incomplete backend data with multiple fallbacks
    name: account.accountName ||
          (account.firstName && account.lastName ? `${account.firstName} ${account.lastName}`.trim() : '') ||
          account.firstName ||
          account.companyName ||
          emailUsername ||
          `Customer ${account._id?.slice(-6) || ''}` ||
          '',
    companyName: account.companyName || account.company || "",
    address: account.address ||
             (account.address1 && account.address2 ? `${account.address1} ${account.address2}`.trim() : account.address1 || '') ||
             "",
    phone: account.phoneNumber ||
           account.phone1 ||
           account.phone ||
           account.telephone ||
           account.mobile ||
           "",
    whatsapp: account.whatsapp || "",
    email: account.email || "",
    phone2: account.phone2 || "",
    pinCode: account.pinCode || "",
    state: account.state || "",
    imageUrl: account.imageUrl || "",
    gstNumber: account.gstNumber || "",
  });
  setShowCustomerSuggestions(false);
  // Notify parent that customer was selected (for auto-focus on next field)
  if (onCustomerSelect) {
    onCustomerSelect();
  }
};

  const handleCustomerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCustomerData(prev => ({ ...prev, [name]: value }));
    // Reset selection when typing
    setSuggestionSelectedIndex(-1);
    console.log('Customer input changed:', { name, value });
  };

  // Handle keyboard navigation for suggestions
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showCustomerSuggestions || currentSuggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSuggestionSelectedIndex(prev =>
          prev < currentSuggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSuggestionSelectedIndex(prev =>
          prev > 0 ? prev - 1 : currentSuggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (suggestionSelectedIndex >= 0 && suggestionSelectedIndex < currentSuggestions.length) {
          handleCustomerSelect(currentSuggestions[suggestionSelectedIndex]);
          setSuggestionSelectedIndex(-1);
        }
        break;
      case 'Escape':
        setShowCustomerSuggestions(false);
        setSuggestionSelectedIndex(-1);
        break;
    }
  };

  // Handle suggestions change from OptimizedSuggestions
  const handleSuggestionsChange = (suggestions: any[]) => {
    setCurrentSuggestions(suggestions);
    // Reset selection if suggestions changed
    if (suggestions.length === 0) {
      setSuggestionSelectedIndex(-1);
    }
  };

  const resetCustomerData = () => {
    setCustomerData({
      _id: '',
      name: '',
      address: '',
      phone: '',
      whatsapp: '',
      email: '',
      companyName: '',
      phone2: '',
      pinCode: '',
      state: '',
      imageUrl: '',
      gstNumber: '',
    });
    setStatus('Wait for Approval');
  };

  useImperativeHandle(ref, () => ({
    getCustomerData: () => ({ ...customerData, status }),
    resetCustomerData,
    focus: () => {
      nameInputRef.current?.focus();
    }
  }));


  return (
    <div className="CustomerStickySection">
      <div className="OrderIDanddata">
        {/* Left side: Order ID (only in edit mode) */}
        <div className="OrderIDCreate">
          {isEditMode && initialData?.orderId && (
            <span className="OrderIDBadge">{initialData.orderId}</span>
          )}
        </div>

        {/* Right side: Date and Customer Image */}
        <div className="customerInputRow">
          {isEditMode && initialData?.createdAt ? (
            <div className="createDateAndupdateDate">
              <span>{initialData.createdAt}</span>
            </div>
          ) : (
            <Data />
          )}
          {customerData.imageUrl && (
            <div className="customerImage">
              <div className="customerImageDiv">
                <img
                  src={customerData.imageUrl}
                  alt="Customer"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="CreateOrdersForm">
        <div>
          <input
            ref={nameInputRef}
            name="name"
            className="CurstomerNameInput"
            value={customerData.name}
            onChange={handleCustomerChange}
            onKeyDown={handleKeyDown}
            onFocus={() => !isEditMode && setShowCustomerSuggestions(true)}
            onBlur={() => setTimeout(() => setShowCustomerSuggestions(false), 200)}
            onDoubleClick={() => customerData._id && setShowCustomerDetails(true)}
            type="text"
            placeholder="Enter Customer Name"
            autoComplete="off"
            required
            readOnly={isEditMode}
            style={{ cursor: customerData._id ? 'pointer' : 'text' }}
            title={customerData._id ? 'Double-click to view customer details' : ''}
          />
          {!isEditMode && (
            <OptimizedSuggestions
              searchTerm={customerData.name}
              onSelect={handleCustomerSelect}
              suggestionType="customer"
              showSuggestions={showCustomerSuggestions && customerData.name.length > 0}
              selectedIndex={suggestionSelectedIndex}
              onSuggestionsChange={handleSuggestionsChange}
            />
          )}
        </div>

        <div>
          <input
            type="hidden"
            name="customerId"
            value={customerData._id}
          />
          <input
            name="address"
            className="CurstomerAddressInput"
            value={customerData.address}
            onChange={handleCustomerChange}
            type="text"
            placeholder="Enter Customer Address"
          />
        </div>

        <input
          name="whatsapp"
          className="CurstomerInput"
          value={customerData.whatsapp}
          onChange={handleCustomerChange}
          type="tel"
          placeholder="WhatsApp Number"
          pattern="[0-9\-\+\s\(\)]+"
        />

        <input
          name="email"
          className="CurstomerInput"
          value={customerData.email}
          onChange={handleCustomerChange}
          type="email"
          placeholder="Email"
        />

        <input
          name="companyName"
          className="CurstomerInput"
          value={customerData.companyName}
          onChange={handleCustomerChange}
          type="text"
          placeholder="Company Name"
        />

        <input
          name="gstNumber"
          className="CurstomerInput"
          value={customerData.gstNumber}
          onChange={handleCustomerChange}
          type="text"
          placeholder="GST Number"
          pattern="^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$"
        />

        <input
          name="pinCode"
          className="CurstomerInput"
          value={customerData.pinCode}
          onChange={handleCustomerChange}
          type="text"
          placeholder="Pin Code"
          pattern="[0-9]{6}"
        />

        <input
          name="state"
          className="CurstomerInput"
          value={customerData.state}
          onChange={handleCustomerChange}
          type="text"
          placeholder="State"
        />
      </div>

      {/* Customer Details Popup */}
      {showCustomerDetails && customerData._id && (
        <div className="customer-details-overlay" onClick={() => setShowCustomerDetails(false)}>
          <div className="customer-details-popup" onClick={(e) => e.stopPropagation()}>
            <div className="customer-details-header">
              <h3>Customer Details</h3>
              <button
                className="customer-details-close"
                onClick={() => setShowCustomerDetails(false)}
              >
                ×
              </button>
            </div>

            <div className="customer-details-content">
              {/* Customer Image */}
              {customerData.imageUrl && (
                <div className="customer-details-image">
                  <img
                    src={customerData.imageUrl}
                    alt="Customer"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}

              {/* Customer Info Grid */}
              <div className="customer-details-grid">
                <div className="customer-detail-item full-width">
                  <label>Company Name</label>
                  <span>{customerData.companyName || '-'}</span>
                </div>

                <div className="customer-detail-item">
                  <label>First Name</label>
                  <span>{customerData.name || '-'}</span>
                </div>

                <div className="customer-detail-item">
                  <label>GST Number</label>
                  <span>{customerData.gstNumber || '-'}</span>
                </div>

                <div className="customer-detail-item">
                  <label>Phone 1</label>
                  <span>{customerData.phone || '-'}</span>
                </div>

                <div className="customer-detail-item">
                  <label>Phone 2</label>
                  <span>{customerData.phone2 || '-'}</span>
                </div>

                <div className="customer-detail-item">
                  <label>WhatsApp</label>
                  <span>{customerData.whatsapp || '-'}</span>
                </div>

                <div className="customer-detail-item">
                  <label>Email</label>
                  <span>{customerData.email || '-'}</span>
                </div>

                <div className="customer-detail-item full-width">
                  <label>Address</label>
                  <span>{customerData.address || '-'}</span>
                </div>

                <div className="customer-detail-item">
                  <label>State</label>
                  <span>{customerData.state || '-'}</span>
                </div>

                <div className="customer-detail-item">
                  <label>Pin Code</label>
                  <span>{customerData.pinCode || '-'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

CustomerName.displayName = 'CustomerName';
export default CustomerName;
