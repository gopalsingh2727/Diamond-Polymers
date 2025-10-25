import React, { useState, forwardRef, useImperativeHandle, useEffect } from "react";
import Data from "../../../../allCompones/date";
import CustomerSuggestions from "../SuggestionInput/CustomerSuggestionInput";
import "../materialAndProduct/materialAndProduct.css";
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
}

interface Account {
  _id: string; 
  firstName?: string;
  lastName?: string;
  companyName?: string;
  address1?: string;
  address2?: string;
  phone1?: string;
  telephone?: string;
  whatsapp?: string;
  email?: string;
  phone2?: string;
  pinCode?: string;
  state?: string;
  imageUrl?: string;
}

export interface CustomerNameRef {
  getCustomerData: () => CustomerData;
  resetCustomerData: () => void;
}

interface CustomerNameProps {
  initialData?: any;
  isEditMode?: boolean;
}

const CustomerName = forwardRef<CustomerNameRef, CustomerNameProps>(({ initialData, isEditMode }, ref) => {
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
  });
  
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
      });
    }
  }, [isEditMode, initialData]);

  const handleCustomerSelect = (account: Account) => {
    console.log('Customer selected:', account);
    setCustomerData({
      _id: account._id || '',
      name: `${account.firstName || ''} ${account.lastName || ''}`.trim() || account.companyName || '',
      companyName: account.companyName || "",
      address: `${account.address1 || ''} ${account.address2 || ''}`.trim(),
      phone: account.phone1 || account.telephone || "",
      whatsapp: account.whatsapp || "",
      email: account.email || "",
      phone2: account.phone2 || "",
      pinCode: account.pinCode || "",
      state: account.state || "",
      imageUrl: account.imageUrl || "",
    });
  };

  const handleCustomerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCustomerData(prev => ({ ...prev, [name]: value }));
    console.log('Customer input changed:', { name, value });
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
    });
  };

  useImperativeHandle(ref, () => ({
    getCustomerData: () => customerData,
    resetCustomerData,
  }));

  return (
    <div>
      <div className="OrderIDanddata">
        <label className="OrderIDCreate">
          <h5>Order ID:</h5>
        </label>
        <div className="customerInputRow">
          <h6>
            {isEditMode && initialData?.orderId ? (
              <span className="edit-order-id">{initialData.orderId}</span>
            ) : (
              <Data />
            )}
          </h6>
          <div className="customerImage">
            <div className="customerImageDiv">
              {customerData.imageUrl && (
                <img 
                  src={customerData.imageUrl} 
                  alt="Customer" 
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )}
            </div>
            <div>
              <h6>Status:</h6>
              <h6>{isEditMode && initialData?.status ? initialData.status : ''}</h6>
            </div>
          </div>
        </div>
      </div>

      <div className="CreateOrdersForm">
        <div>
          <input
            name="name"
            className="CurstomerNameInput"
            value={customerData.name}
            onChange={handleCustomerChange}
            type="text"
            placeholder="Enter Customer Name"
            autoComplete="off"
            required
          />
          {!isEditMode && (
            <CustomerSuggestions
              customerName={customerData.name}
              onSelect={handleCustomerSelect}
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
          name="phone"
          className="CurstomerInput"
          value={customerData.phone}
          onChange={handleCustomerChange}
          type="tel"
          placeholder="Phone Number"
          pattern="[0-9\-\+\s\(\)]+"
        />

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
    </div>
  );
});

CustomerName.displayName = 'CustomerName';
export default CustomerName;