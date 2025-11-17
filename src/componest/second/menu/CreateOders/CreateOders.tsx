import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "./CreateOders.css";
import { BackButton } from "../../../allCompones/BackButton";
import MaterialInOders from "./odersType/material";
import ProductInOrders from "./odersType/product";
import CustomerName, { CustomerNameRef } from "./account/CurstomerName";
import OrderTypeSelect from "./OrderTypeSelect";
import Notes from "./notes";
import Priority from "./priority";
import SaveOrders from "./saveTheOdes";
import  StepContainer, { StepContainerRef } from "./stepContainer";
import PrintImage from "./printoptions";
import { useOrderFormData } from "./useOrderFormData";

import { MaterialData } from "./odersType/material";
import { ProductData } from "./odersType/product";

const CreateOrders = () => {
  const location = useLocation();

  // Enhanced edit mode detection
  const { orderData, isEdit, isEditMode } = location.state || {};
  const editMode = Boolean(isEdit || isEditMode || (orderData && orderData._id));

  // 🚀 OPTIMIZED: Single API call for all form data
  const {
    loading: formDataLoading,
    error: formDataError,
    allData
  } = useOrderFormData();

  console.log('🔍 CreateOrders - Location state:', location.state);
  console.log('🔍 CreateOrders - Edit mode detected:', editMode);
  console.log('🔍 CreateOrders - Order data:', orderData);
  console.log('✅ Form data loaded:', allData ? 'Yes' : 'Loading...');

  const [showBottomGusset, setShowBottomGusset] = useState(false);
  const [showFlap, setShowFlap] = useState(false);
  const [showAirHole, setShowAirHole] = useState(false);
  const [selectedOrderType, setSelectedOrderType] = useState("");

  // Refs to access child component data
  const customerNameRef = useRef<CustomerNameRef>(null);
  const materialRef = useRef<{ getMaterialData: () => MaterialData }>(null);
  const productRef = useRef<{ getProductData: () => ProductData }>(null);
  const stepContainerRef = useRef<StepContainerRef>(null);

  // Initialize form with order data if editing
  useEffect(() => {
    if (orderData && editMode) {
      console.log('📝 Edit mode - Loading order data:', orderData);
      
      // Set additional fields based on order data
      if (orderData.BottomGusset || orderData.bottomGusset) {
        console.log('✅ Setting bottom gusset');
        setShowBottomGusset(true);
      }
      if (orderData.Flap || orderData.flap) {
        console.log('✅ Setting flap');
        setShowFlap(true);
      }
      if (orderData.AirHole || orderData.airHole) {
        console.log('✅ Setting air hole');
        setShowAirHole(true);
      }
    }
  }, [orderData, editMode]);

  // Show loading state while fetching form data
  if (formDataLoading && !editMode) {
    return (
      <div className="CreateOrders">
        <div className="CrateOrdersHaders">
          <BackButton />
          <div className="CreateOrdersHaders1">
            <p className="CreteOrdersTitel">Loading Form Data...</p>
          </div>
        </div>
        <div className="CreateOrdersBody" style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #0c214e',
              borderRadius: '50%',
              width: '50px',
              height: '50px',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 20px'
            }}></div>
            <p>Loading customers, products, materials...</p>
            <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
              This happens only once per session
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if data fetch failed
  if (formDataError && !editMode) {
    return (
      <div className="CreateOrders">
        <div className="CrateOrdersHaders">
          <BackButton />
          <div className="CreateOrdersHaders1">
            <p className="CreteOrdersTitel">Error Loading Form</p>
          </div>
        </div>
        <div className="CreateOrdersBody" style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px'
        }}>
          <div style={{
            textAlign: 'center',
            padding: '20px',
            backgroundColor: '#fee',
            borderRadius: '8px',
            maxWidth: '400px'
          }}>
            <p style={{ color: '#c00', fontWeight: 'bold', marginBottom: '10px' }}>
              ❌ Failed to load form data
            </p>
            <p style={{ fontSize: '14px' }}>{formDataError}</p>
            <button
              onClick={() => window.location.reload()}
              style={{
                marginTop: '15px',
                padding: '10px 20px',
                backgroundColor: '#0c214e',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="CreateOrders">
      <div className="CrateOrdersHaders">
        <BackButton />
        <div className="CreateOrdersHaders1">
          <p className="CreteOrdersTitel">
            {editMode ? 'Edit Order' : 'Create Orders'}
          </p>
          {editMode && orderData && (
            <span className="edit-order-id">
              Order ID: {orderData.orderId || orderData._id}
            </span>
          )}
        </div>
      </div>

      <div className="CreateOrdersBody">
        <div className="createOdersForm">
          <CustomerName
            ref={customerNameRef}
            initialData={orderData}
            isEditMode={editMode}
          />

          <OrderTypeSelect
            value={selectedOrderType}
            onChange={setSelectedOrderType}
            initialValue={orderData?.orderType || orderData?.orderTypeId}
          />

          <ProductInOrders
            ref={productRef}
            initialData={orderData}
            isEditMode={editMode}
          />

          <MaterialInOders
            ref={materialRef}
            showBottomGusset={showBottomGusset}
            showFlap={showFlap}
            showAirHole={showAirHole}
            initialData={orderData}
            isEditMode={editMode}
          />

          <PrintImage
            orderData={orderData}
            isEditMode={editMode}
            onPrintDataChange={(printData) => {
              console.log('Print data changed:', printData);
            }}
          />
           <div>
             <StepContainer
              ref={stepContainerRef}
              initialData={orderData}
              isEditMode={editMode}
              onStepsChange={(steps) => {
                console.log('Steps changed:', steps);
              }}
            />
           </div>
            
        </div>
        
        <div className="CreateOrdersFooter">
          <Notes
            initialNotes={orderData?.Notes || orderData?.notes}
            isEditMode={editMode}
          />
          <Priority
            initialPriority={orderData?.priority}
            isEditMode={editMode}
            onPriorityChange={(priority) => {
              console.log('Priority changed:', priority);
            }}
          />
          <SaveOrders
            isEditMode={editMode}
            orderId={orderData?._id}
            orderData={orderData}
          />
        </div>
      </div>
      
      <div className="sideMenu">
        <div className="sideMenuPtag">
          <p>Address</p>
          <p>Send Email</p>
          <p>WhatsApp</p>
          <p>Print</p>
        </div>
      </div>
    </div>
  );
};

export default CreateOrders;