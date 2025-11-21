import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import "./CreateOders.css";
import "./DynamicForm.css";
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
import { RootState } from "../../../redux/rootReducer";
import { AppDispatch } from "../../../../store";

// Section configuration type
type SectionConfig = {
  id: string;
  name: string;
  enabled: boolean;
  order: number;
  fields: {
    name: string;
    label: string;
    type: string;
    required: boolean;
    enabled: boolean;
  }[];
};

// Order type configuration type
type OrderTypeConfig = {
  _id: string;
  typeName: string;
  typeCode: string;
  sections: SectionConfig[];
  enablePrinting: boolean;
  enableMixing: boolean;
};

const CreateOrders = () => {
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();

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
  const [orderTypeConfig, setOrderTypeConfig] = useState<OrderTypeConfig | null>(null);

  // Get order types from form data (already loaded in useOrderFormData)
  const orderTypes = allData?.orderTypes || [];

  // Refs to access child component data
  const customerNameRef = useRef<CustomerNameRef>(null);
  const materialRef = useRef<{ getMaterialData: () => MaterialData }>(null);
  const productRef = useRef<{ getProductData: () => ProductData }>(null);
  const stepContainerRef = useRef<StepContainerRef>(null);

  // Update order type config when order type changes
  useEffect(() => {
    if (selectedOrderType && orderTypes.length > 0) {
      const selectedConfig = orderTypes.find(
        (ot: any) => ot._id === selectedOrderType || ot.typeCode === selectedOrderType
      );
      if (selectedConfig) {
        setOrderTypeConfig(selectedConfig);
        console.log('=== Order Type Config Loaded ===');
        console.log('Type Name:', selectedConfig.typeName);
        console.log('Sections from DB:', selectedConfig.sections);
        console.log('Sections Count:', selectedConfig.sections?.length || 0);
        if (selectedConfig.sections && selectedConfig.sections.length > 0) {
          console.log('Enabled Section IDs:', selectedConfig.sections.map((s: any) => s.id).join(', '));
        } else {
          console.log('No sections configured - showing ALL sections');
        }
        console.log('================================');
      }
    } else if (!selectedOrderType) {
      setOrderTypeConfig(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedOrderType, orderTypes.length]);

  // Helper function to check if a section is enabled
  const isSectionEnabled = (sectionId: string): boolean => {
    if (!orderTypeConfig || !orderTypeConfig.sections || orderTypeConfig.sections.length === 0) {
      // Default to showing all sections if no config
      return true;
    }
    // Find section in config - if not found, it's NOT enabled for this order type
    const section = orderTypeConfig.sections.find(s => s.id === sectionId);
    // IMPORTANT: If section not in config, return FALSE (not enabled)
    return section ? section.enabled !== false : false;
  };

  // Helper function to get section config
  const getSectionConfig = (sectionId: string): SectionConfig | undefined => {
    if (!orderTypeConfig || !orderTypeConfig.sections) return undefined;
    return orderTypeConfig.sections.find(s => s.id === sectionId);
  };

  // Sort sections by order
  const getSortedSections = (): SectionConfig[] => {
    if (!orderTypeConfig || !orderTypeConfig.sections || orderTypeConfig.sections.length === 0) {
      // Return default order
      return [
        { id: 'product', name: 'Product', enabled: true, order: 1, fields: [] },
        { id: 'material', name: 'Material', enabled: true, order: 2, fields: [] },
        { id: 'printing', name: 'Printing', enabled: true, order: 3, fields: [] },
        { id: 'steps', name: 'Steps', enabled: true, order: 4, fields: [] }
      ];
    }
    return [...orderTypeConfig.sections].sort((a, b) => a.order - b.order);
  };

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
            orderTypes={orderTypes}
            loading={formDataLoading}
          />

          {/* Hidden input for order type ID - needed for DOM data collection */}
          <input
            type="hidden"
            name="orderTypeId"
            value={selectedOrderType}
          />

          {/* Dynamic sections - only render when order type is selected */}
          {selectedOrderType && (
            <>
              {/* Dynamic sections - render based on order type configuration */}
              {getSortedSections().map(section => {
                // Check if this section should be shown
                if (!isSectionEnabled(section.id)) return null;

                switch (section.id) {
                  case 'product':
                    return (
                      <div key="product" className="dynamicSection">
                        <ProductInOrders
                          ref={productRef}
                          initialData={orderData}
                          isEditMode={editMode}
                          sectionConfig={getSectionConfig('product')}
                        />
                      </div>
                    );

                  case 'material':
                    return (
                      <div key="material" className="dynamicSection">
                        <MaterialInOders
                          ref={materialRef}
                          showBottomGusset={showBottomGusset}
                          showFlap={showFlap}
                          showAirHole={showAirHole}
                          initialData={orderData}
                          isEditMode={editMode}
                          sectionConfig={getSectionConfig('material')}
                        />
                      </div>
                    );

                  case 'printing':
                    return (
                      <div key="printing" className="dynamicSection">
                        <PrintImage
                          orderData={orderData}
                          isEditMode={editMode}
                          onPrintDataChange={(printData) => {
                            console.log('Print data changed:', printData);
                          }}
                          sectionConfig={getSectionConfig('printing')}
                        />
                      </div>
                    );

                  case 'steps':
                    return (
                      <div key="steps" className="dynamicSection">
                        <StepContainer
                          ref={stepContainerRef}
                          initialData={orderData}
                          isEditMode={editMode}
                          onStepsChange={(steps) => {
                            console.log('Steps changed:', steps);
                          }}
                          sectionConfig={getSectionConfig('steps')}
                        />
                      </div>
                    );

                  default:
                    return null;
                }
              })}
            </>
          )}
            
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