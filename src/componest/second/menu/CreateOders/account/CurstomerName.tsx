import React, { useState, forwardRef, useImperativeHandle, useEffect } from "react";
import Data from "../../../../allCompones/date";
import OptimizedSuggestions from "../SuggestionInput/OptimizedSuggestions";
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

export interface CustomerNameRef {
  getCustomerData: () => CustomerData & { status: string };
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

  const [status, setStatus] = useState<string>('Wait for Approval');
  const [showCustomerSuggestions, setShowCustomerSuggestions] = useState(false);
  
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
  });
  setShowCustomerSuggestions(false);
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
    setStatus('Wait for Approval');
  };

  useImperativeHandle(ref, () => ({
    getCustomerData: () => ({ ...customerData, status }),
    resetCustomerData,
  }));
  

  return (
    <div>
      <div className="OrderIDanddata">
        <label className="OrderIDCreate">
          <h5 className ="ManufacturingStepsTitel">Order ID:  {isEditMode && initialData?.orderId ? (
                <span className="edit-order-id">{initialData.orderId}</span>
              ):(
                <p></p>
              )}</h5><h6>
             
            
                   
          
          </h6>
        </label>
        <div className="customerInputRow">
             
             {isEditMode && initialData?.createdAt ? (
             <div className="createDateAndupdateDate">
               <span className="edit-order-id">{initialData.createdAt}</span>
               {/* <span className="edit-order-id">{initialData.updatedAt}</span> */}
             </div>
             
                   
            ) : (
              <Data  />
            )}
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
              <h6 className ="ManufacturingStepsTitel">Status:</h6>
              <select
                name="overallStatus"
                id="myDropdown"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="Wait for Approval" className ="ManufacturingStepsTitel">Wait for Approval</option>
                <option value="pending" className ="ManufacturingStepsTitel">Pending</option>
                <option value="approved" className ="ManufacturingStepsTitel">Approved</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="dispatched">Dispatched</option>
                <option value="cancelled">Cancelled</option>
              </select>
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
            onFocus={() => !isEditMode && setShowCustomerSuggestions(true)}
            onBlur={() => setTimeout(() => setShowCustomerSuggestions(false), 200)}
            type="text"
            placeholder="Enter Customer Name"
            autoComplete="off"
            required
            readOnly={isEditMode}
          />
          {!isEditMode && (
            <OptimizedSuggestions
              searchTerm={customerData.name}
              onSelect={handleCustomerSelect}
              suggestionType="customer"
              showSuggestions={showCustomerSuggestions && customerData.name.length > 0}
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