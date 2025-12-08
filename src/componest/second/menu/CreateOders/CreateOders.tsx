import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import "./CreateOders.css";
import "./DynamicForm.css";
import { BackButton } from "../../../allCompones/BackButton";
import { deleteOrder } from "../../../redux/oders/OdersActions";
import { ToastContainer } from "../../../../components/shared/Toast";
import { useCRUD } from "../../../../hooks/useCRUD";
import CustomerName, { CustomerNameRef } from "./account/CurstomerName";
import OrderTypeSelect from "./OrderTypeSelect";
import Notes from "./notes";
import Priority from "./priority";
import Status from "./status";
import SaveOrders from "./saveTheOdes";
import  StepContainer, { StepContainerRef } from "./stepContainer";
import { useOrderFormData } from "./useOrderFormData";
import InlineOptionsInput from "./optionsSection/InlineOptionsInput";

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

// OptionType from allowedOptionTypes
type AllowedOptionType = {
  _id: string;
  name: string;
  code?: string;
  category?: string;
  specifications?: any[];
};

// Order type configuration type
type OrderTypeConfig = {
  _id: string;
  typeName: string;
  typeCode: string;
  sections: SectionConfig[];
  enablePrinting: boolean;
  enableMixing: boolean;
  allowedOptionTypes?: AllowedOptionType[];
};

// Helper function to generate unique IDs for options
let optionIdCounter = 0;
const generateOptionId = () => {
  optionIdCounter++;
  return `option-${Date.now()}-${optionIdCounter}`;
};

// Transform options from database format to component format for edit mode
const transformOptionsForEdit = (orderData: any): any[] => {
  console.log('🔍 transformOptionsForEdit called with:', {
    hasOrderData: !!orderData,
    orderDataKeys: orderData ? Object.keys(orderData) : [],
    hasOptions: !!(orderData?.options),
    optionsLength: orderData?.options?.length || 0,
    options: orderData?.options
  });

  if (!orderData) {
    console.log('❌ No orderData - returning empty array');
    return [];
  }

  const dbOptions = orderData.options || [];
  const optionsWithDetails = orderData.optionsWithDetails || [];

  if (!Array.isArray(dbOptions) || dbOptions.length === 0) {
    console.log('❌ No options to transform:', {
      isArray: Array.isArray(dbOptions),
      length: dbOptions.length,
      dbOptions
    });
    return [];
  }

  console.log('🔄 Transforming options for edit mode:', {
    dbOptions: dbOptions.length,
    withDetails: optionsWithDetails.length
  });

  return dbOptions.map((opt: any, index: number) => {
    // Get enriched data if available
    const enriched = optionsWithDetails[index] || {};
    const specDetails = enriched.specDetails || {};

    // Transform specificationValues from array to object format
    const specsObject: { [key: string]: any } = {};
    if (Array.isArray(opt.specificationValues)) {
      opt.specificationValues.forEach((spec: any) => {
        specsObject[spec.name] = spec.value;
      });
    } else if (opt.specificationValues && typeof opt.specificationValues === 'object') {
      // Already in object format
      Object.assign(specsObject, opt.specificationValues);
    }

    // Build the component-expected format
    const transformed = {
      id: generateOptionId(),
      optionId: opt.optionId || opt._id,
      optionName: opt.optionName || specDetails.name || 'Unknown Option',
      optionTypeId: opt.optionTypeId || specDetails.optionTypeId || '',
      optionTypeName: opt.optionTypeName || opt.category || specDetails.typeName || 'product',
      specificationValues: specsObject,
      mixingData: opt.mixingData || undefined
    };

    console.log('✅ Transformed option:', {
      original: opt.optionName,
      specs: Object.keys(specsObject).length,
      hasMixing: !!transformed.mixingData
    });

    return transformed;
  });
};

const CreateOrders = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useCRUD();

  // Enhanced edit mode detection
  const { orderData, isEdit, isEditMode } = location.state || {};
  const editMode = Boolean(isEdit || isEditMode || (orderData && orderData._id));

  // Delete confirmation modal state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

  // NEW: Unified Options data state
  const [options, setOptions] = useState<any[]>([]);

  // Track status and priority changes for edit mode
  const [currentStatus, setCurrentStatus] = useState<string>(orderData?.overallStatus || 'Wait for Approval');
  const [currentPriority, setCurrentPriority] = useState<string>(orderData?.priority || 'normal');

  // Get order types from form data (already loaded in useOrderFormData)
  const orderTypes = allData?.orderTypes || [];

  // Refs to access child component data
  const customerNameRef = useRef<CustomerNameRef>(null);
  const stepContainerRef = useRef<StepContainerRef>(null);

  // Set order type from orderData in edit mode
  useEffect(() => {
    if (editMode && orderData && orderTypes.length > 0 && !selectedOrderType) {
      // Extract order type ID - handle both string and object formats
      let orderTypeId = '';

      if (typeof orderData.orderType === 'string') {
        orderTypeId = orderData.orderType;
      } else if (orderData.orderType?._id) {
        orderTypeId = orderData.orderType._id;
      } else if (orderData.orderTypeId) {
        orderTypeId = typeof orderData.orderTypeId === 'string'
          ? orderData.orderTypeId
          : orderData.orderTypeId._id || '';
      }

      if (orderTypeId) {
        console.log('📝 Edit mode - Setting order type from orderData:', orderTypeId);
        setSelectedOrderType(orderTypeId);
      }
    }
  }, [editMode, orderData, orderTypes.length, selectedOrderType]);

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

    // Find section in config
    const section = orderTypeConfig.sections.find(s => s.id === sectionId);

    // BACKWARD COMPATIBILITY: Show 'options' and 'steps' sections by default if not in config
    // This handles order types created before these sections were added
    if ((sectionId === 'options' || sectionId === 'steps') && !section) {
      return true;
    }

    // For other sections: if not found, it's NOT enabled
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
      // Return default order with new unified options section
      return [
        { id: 'options', name: 'Options', enabled: true, order: 1, fields: [] },
        { id: 'steps', name: 'Steps', enabled: true, order: 2, fields: [] }
      ];
    }

    // BACKWARD COMPATIBILITY: Add 'options' and 'steps' sections if not present in config
    const sections = [...orderTypeConfig.sections];
    const hasOptionsSection = sections.some(s => s.id === 'options');
    const hasStepsSection = sections.some(s => s.id === 'steps');

    if (!hasOptionsSection) {
      // Add options section with order 0 so it appears first
      sections.push({
        id: 'options',
        name: 'Options',
        enabled: true,
        order: 0,
        fields: []
      });
    }

    if (!hasStepsSection) {
      // Add steps section with high order number so it appears last
      sections.push({
        id: 'steps',
        name: 'Steps',
        enabled: true,
        order: 999,
        fields: []
      });
    }

    return sections.sort((a, b) => a.order - b.order);
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

  // Handle delete order
  const handleDelete = async () => {
    if (!orderData?._id) return;

    setDeleting(true);
    try {
      await dispatch(deleteOrder(orderData._id) as any);
      toast.success('Deleted', 'Order deleted successfully');
      setShowDeleteConfirm(false);
      setTimeout(() => {
        navigate(-1);
      }, 1000);
    } catch (err) {
      toast.error('Error', 'Failed to delete order');
    } finally {
      setDeleting(false);
    }
  };

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
    <div className="CreateOrders CreateForm">
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '12px',
            maxWidth: '400px',
            width: '90%',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
            <h3 style={{ margin: '0 0 8px 0', color: '#1f2937' }}>Delete Order?</h3>
            <p style={{ color: '#6b7280', marginBottom: '24px' }}>
              Are you sure you want to delete this order? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                style={{ padding: '10px 24px', background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                style={{ padding: '10px 24px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="CrateOrdersHaders">
                      <BackButton />
        <div className="CreateOrdersHaders1" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>

          <div>
        
            <p className="CreteOrdersTitel">
              {editMode ? 'Edit Order' : 'Create Orders'}
            </p>
            {editMode && orderData && (
              <span className="edit-order-id">
                Order ID: {orderData.orderId || orderData._id}
              </span>
            )}
          </div>
          {editMode && (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              style={{
                padding: '8px 16px',
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginRight: '20px'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14zM10 11v6M14 11v6"/>
              </svg>
              Delete
            </button>
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
            initialValue={
              typeof orderData?.orderType === 'string'
                ? orderData.orderType
                : (orderData?.orderType?._id || orderData?.orderTypeId || '')
            }
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
          {selectedOrderType && (() => {
            const sections = getSortedSections();
            console.log('🔍 Sorted sections:', sections.map(s => ({ id: s.id, enabled: isSectionEnabled(s.id) })));
            return (
              <>
                {/* Dynamic sections - render based on order type configuration */}
                {sections.map(section => {
                  // Check if this section should be shown
                  const isEnabled = isSectionEnabled(section.id);
                  console.log(`🔍 Section "${section.id}" enabled:`, isEnabled);

                  if (!isEnabled) return null;

                  switch (section.id) {
                    case 'options':
                      console.log('🎯 Rendering options section - editMode:', editMode);
                      console.log('🎯 allowedOptionTypes:', orderTypeConfig?.allowedOptionTypes);
                      return (
                        <div key="options" className="dynamicSection">
                          <InlineOptionsInput
                            title="Options"
                            orderTypeId={selectedOrderType}
                            onDataChange={setOptions}
                            initialData={editMode ? transformOptionsForEdit(orderData) : []}
                            isEditMode={editMode}
                            allowedOptionTypes={orderTypeConfig?.allowedOptionTypes || []}
                        />
                      </div>
                    );

                  case 'steps':
                    console.log('🎯 Rendering steps section - editMode:', editMode, 'orderData:', orderData);
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
            );
          })()}
            
        </div>
        
        <div className="CreateOrdersFooter">
          <Notes
            initialNotes={orderData?.Notes || orderData?.notes}
            isEditMode={editMode}
          />
          <Status
            initialStatus={orderData?.overallStatus || 'Wait for Approval'}
            isEditMode={editMode}
            onStatusChange={(status) => {
              console.log('Status changed:', status);
              setCurrentStatus(status);
            }}
          />
          <Priority
            initialPriority={orderData?.priority}
            isEditMode={editMode}
            onPriorityChange={(priority) => {
              console.log('Priority changed:', priority);
              setCurrentPriority(priority);
            }}
          />
          <SaveOrders
            isEditMode={editMode}
            orderId={orderData?._id}
            orderData={{
              ...orderData,
              overallStatus: currentStatus,
              priority: currentPriority
            }}
            optionsData={options}
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

      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
    </div>
  );
};

export default CreateOrders;