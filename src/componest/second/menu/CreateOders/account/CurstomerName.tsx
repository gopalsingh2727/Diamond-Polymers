import React, { useState } from "react";
import Data from "../../../../allCompones/date";
import CustomerSuggestions from "../SuggestionInput/CustomerSuggestionInput";
import PrintImage from "../printoptions"; 
import "../materialAndProduct/materialAndProduct.css";
import './curstomerName.css'

const CustomerName: React.FC = () => {
  const [customerData, setCustomerData] = useState({
    name: '',
    address: '',
    phone: '',
    whatsapp: '',
    email: '',
    companyName: '',
    phone2: '',
    pinCode: '',
    state: '',
    imageUrl:'',
  });

  const [printData, setPrintData] = useState({
    printWork: '',
    selectedFile: null as File | null
  });

  const handleCustomerSelect = (account: any) => {
    console.log('Customer selected:', account);
    setCustomerData({
      name: `${account.firstName || ''} ${account.lastName || ''}`.trim(),
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

  const handlePrintDataChange = (newPrintData: { printWork: string; selectedFile: File | null }) => {
    setPrintData(newPrintData);
    console.log('Print data updated:', newPrintData);
  };

  // Check if customer data is available and print is selected
  const showPrintSection = customerData.name.trim() !== '';

  return (
    <div>
      <div>
        <div className="OrderIDanddata">
          <label className="OrderIDCreate">
            <h5>Order ID:</h5>
          </label>
          <div className="customerInputRow">
            <h6><Data /></h6>
            <div className="customerImage">
              <div className="customerImageDiv">
                {customerData.imageUrl ? (
                  <img src={customerData.imageUrl} alt="Customer" />
                ) : null}
              </div>
              <div>
                <h6>status:</h6>
                <h6></h6>
              </div>
            </div>
          </div>
        </div>

        <div className="CreateOrdersForm">
          <div>
            <div>
              <input
                name="name"
                className="CurstomerNameInput"
                value={customerData.name}
                onChange={handleCustomerChange}
                type="text"
                placeholder="Enter Customer Name"
                autoComplete="off"
              />
              <CustomerSuggestions
                customerName={customerData.name}
                onSelect={handleCustomerSelect}
              />
            </div>
          </div>

          <div>
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
          />

          <input
            name="whatsapp"
            className="CurstomerInput"
            value={customerData.whatsapp}
            onChange={handleCustomerChange}
            type="tel"
            placeholder="WhatsApp Number"
          />

          <input
            name="email"
            className="CurstomerInput"
            value={customerData.email}
            onChange={handleCustomerChange}
            type="email"
            placeholder="Email"
          />
        </div>

        {/* Print Section - Shows when customer data is available */}
        {showPrintSection && (
          <div className="printWorkSection">
            <h5>Print Work Options</h5>
            <PrintImage 
              customerData={customerData}
              onPrintDataChange={handlePrintDataChange}
            />
            
           
            {printData.printWork && (
              <div className="orderSummary">
                <h6>Order Summary:</h6>
                <div className="summaryDetails">
                
                  <p><strong>Company:</strong> {customerData.companyName}</p>
          
                  <p><strong>Print Work:</strong> {printData.printWork === 'yes' ? 'Yes' : 'No'}</p>
                  {printData.printWork === 'yes' && printData.selectedFile && (
                    <p><strong>Print File:</strong> {printData.selectedFile.name}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerName;