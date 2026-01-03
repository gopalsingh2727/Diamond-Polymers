import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  saveOrder,
  updateOrder,
  clearError,
  clearSuccessMessage } from
"../../../redux/oders/OdersActions";
import { getPrintTypes, getPrintTypesByOrderType } from "../../../redux/create/printType/printTypeActions";
import { RootState } from "../../../redux/rootReducer";
import { ActionButton } from "../../../../components/shared/ActionButton";
import { ToastContainer } from "../../../../components/shared/Toast";
import { useCRUD } from "../../../../hooks/useCRUD";

interface SaveOrdersProps {
  isEditMode?: boolean;
  orderId?: string;
  orderData?: any;
  optionsData?: any[]; // Unified options array format
}

// PrintType interface
interface PrintType {
  _id: string;
  typeName: string;
  typeCode: string;
  description?: string;
  paperSize: string;
  orientation: string;
  margins?: {top: number;right: number;bottom: number;left: number;};
  headerTemplate?: string;
  bodyTemplate?: string;
  footerTemplate?: string;
  isDefault?: boolean;
}

const SaveOrders: React.FC<SaveOrdersProps> = ({
  isEditMode = false,
  orderId,
  orderData,
  optionsData
}) => {
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();

  // 🚀 CRUD System Integration
  const { saveState, updateState, handleSave, handleUpdate, toast } = useCRUD();

  // Local state management for success popup
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successType, setSuccessType] = useState<'save' | 'update'>('save');
  const [savedOrderData, setSavedOrderData] = useState<any>(null);

  // Print type selection states
  const [showPrintTypeSelector, setShowPrintTypeSelector] = useState(false);
  const [printTypes, setPrintTypes] = useState<PrintType[]>([]);
  const [selectedPrintType, setSelectedPrintType] = useState<PrintType | null>(null);
  const [loadingPrintTypes, setLoadingPrintTypes] = useState(false);

  // Redux state
  const orderState = useSelector((state: RootState) => {
    return (
      (state as any).orders ||
      (state as any).orderCreate ||
      (state as any).createOrder ||
      (state as any).order ||
      {});

  });

  const { successMessage, order } = orderState;

  // Get options from Redux to access specifications
  const optionsFromRedux = useSelector((state: RootState) => (state as any).option?.options || []);

  // Determine which state to use (save for create, update for edit)
  const buttonState = isEditMode ? updateState : saveState;

  // Main save handler with CRUD system
  const handleSaveOrder = () => {


    const saveFunction = async () => {
      let result;

      // Handle unified options array format
      const allOptions = (optionsData || []).map((option) => {
        // Find the full option data from Redux to get specifications
        const fullOptionData = optionsFromRedux.find((opt: any) => opt._id === option.optionId);

        // Get specifications from either optionSpecId or optionTypeId
        const specs = fullOptionData?.optionSpecId?.specifications ||
        fullOptionData?.optionTypeId?.specifications || [];

        return {
          optionId: option.optionId,
          optionName: option.optionName,
          optionCode: option.optionId, // Use optionId as code for now
          optionTypeId: option.optionTypeId || undefined, // Include option type ID
          optionTypeName: option.optionTypeName || undefined, // Include option type name
          category: 'product', // Keep as valid enum value (actual type stored in optionTypeName)
          quantity: 1, // Default quantity
          // Transform specificationValues from object to array with proper type conversion
          specificationValues: Object.entries(option.specificationValues || {}).map(([name, value]) => {
            // Find the specification template to get dataType
            const specTemplate = specs.find((s: any) => s.name === name);

            // Log file uploads
            if (specTemplate?.dataType === 'file') {

            }

            // Convert value based on dataType
            let convertedValue = value;
            if (specTemplate) {
              if (specTemplate.dataType === 'number') {
                // Convert to number
                convertedValue = typeof value === 'number' ? value : parseFloat(value as string) || 0;
              } else if (specTemplate.dataType === 'boolean') {
                // Convert to boolean
                convertedValue = typeof value === 'boolean' ? value : value === 'true' || value === true;
              } else if (specTemplate.dataType === 'file') {
                // Keep file object structure intact (Firebase URL, metadata)
                convertedValue = typeof value === 'object' ? value : { fileName: String(value) };
              }
              // string and other types remain as-is
            }

            return {
              name,
              value: convertedValue,
              unit: specTemplate?.unit || '',
              dataType: specTemplate?.dataType || 'string' // Include dataType for backend
            };
          }),
          mixingData: option.mixingData || undefined
        };
      });

      const orderDataWithOptions = {
        ...(orderData || {}),
        options: allOptions
      };




      if (isEditMode && orderId) {
        const actualOrderId = orderData?.orderId || orderId;

        setSuccessType('update');
        result = await dispatch(updateOrder(actualOrderId, orderDataWithOptions));
      } else {

        setSuccessType('save');
        result = await dispatch(saveOrder(orderDataWithOptions));
      }



      // Check if successful
      const isSuccess =
      result?.orderId ||
      result?.data?.orderId ||
      result?._id ||
      result && !result.error;

      if (isSuccess) {
        setSavedOrderData(result);
        return result;
      } else {
        throw new Error(result?.error || result?.message || 'Failed to save order');
      }
    };

    // Use appropriate CRUD handler
    if (isEditMode) {
      handleUpdate(saveFunction, {
        successMessage: 'Order updated successfully!',
        onSuccess: (data) => {

          // Set refresh flag for daybook/order lists
          sessionStorage.setItem('orders_updated', Date.now().toString());

          setShowSuccessPopup(true);
        }
      });
    } else {
      handleSave(saveFunction, {
        successMessage: 'Order saved successfully!',
        onSuccess: (data) => {

          // Set refresh flag for daybook/order lists
          sessionStorage.setItem('orders_updated', Date.now().toString());

          setShowSuccessPopup(true);
        }
      });
    }
  };

  // Watch for Redux success message
  useEffect(() => {
    if (successMessage) {

      toast.success('Success', successMessage);
    }
  }, [successMessage, toast]);

  // Watch for Redux order state changes
  useEffect(() => {
    if (order && !savedOrderData) {

      setSavedOrderData(order);
    }
  }, [order, savedOrderData]);

  // Handle success popup close
  const handleCloseSuccess = () => {

    setShowSuccessPopup(false);
    setSavedOrderData(null);

    if (successMessage) {
      dispatch(clearSuccessMessage());
    }

    // Set refresh flag for daybook/order lists
    sessionStorage.setItem('orders_updated', Date.now().toString());


    // Navigate back
    setTimeout(() => {
      if (window.history.length > 1) {
        navigate(-1);
      } else {
        navigate('/');
      }
    }, 300);
  };

  // Fetch print types when opening the selector
  const fetchPrintTypes = async () => {
    setLoadingPrintTypes(true);
    try {
      // If order has an order type, get print types for that order type
      if (orderData?.orderTypeId) {
        const result = await dispatch(getPrintTypesByOrderType(orderData.orderTypeId));
        // Handle both old format (result.printTypes) and new format (result.data)
        const printTypesArray = result?.printTypes || result?.data || (Array.isArray(result) ? result : []);
        if (printTypesArray && printTypesArray.length > 0) {
          setPrintTypes(printTypesArray);
          // Auto-select default print type
          const defaultType = printTypesArray.find((pt: PrintType) => pt.isDefault);
          if (defaultType) setSelectedPrintType(defaultType);else
          setSelectedPrintType(printTypesArray[0]);
          return;
        }
      }
      // Fallback: get all print types
      const result = await dispatch(getPrintTypes());
      // Handle both old format (result.printTypes) and new format (result.data)
      const printTypesArray = result?.printTypes || result?.data || (Array.isArray(result) ? result : []);
      if (printTypesArray && printTypesArray.length > 0) {
        setPrintTypes(printTypesArray);
        const defaultType = printTypesArray.find((pt: PrintType) => pt.isDefault);
        if (defaultType) setSelectedPrintType(defaultType);else
        setSelectedPrintType(printTypesArray[0]);
      }
    } catch (error) {

      // Even on error, allow printing with default browser print
      setPrintTypes([]);
    } finally {
      setLoadingPrintTypes(false);
    }
  };

  // Handle print button click - show print type selector
  const handlePrint = async () => {

    setShowPrintTypeSelector(true);
    await fetchPrintTypes();
  };

  // Helper function to convert specificationValues array to object
  const specsToObject = (specs: any): Record<string, any> => {
    if (!specs) return {};
    // If already an object (not array), return as-is
    if (!Array.isArray(specs)) return specs;
    // Convert array format to object format
    const obj: Record<string, any> = {};
    specs.forEach((spec: any) => {
      if (spec && spec.name !== undefined) {
        obj[spec.name] = spec.value;
      }
    });
    return obj;
  };

  // Generate print HTML from template
  const generatePrintHtml = (printType: PrintType) => {
    const customer = orderData?.customer || orderData?.account || {};
    const options = optionsData || [];
    const orderId = savedOrderData?.orderId || orderData?.orderId || '';

    // Get first option for single-item templates
    const firstOption = options[0] || {};
    // Convert specificationValues from array to object if needed
    const firstSpecs = specsToObject(firstOption.specificationValues);
    const firstDims = firstOption.dim || firstOption.dimensions || firstSpecs || {};

    // Replace placeholders in templates with Handlebars-like syntax support
    const replacePlaceholders = (template: string) => {
      if (!template) return '';

      let result = template;

      // Handle {{#items}}...{{/items}} loop
      result = result.replace(/\{\{#items\}\}([\s\S]*?)\{\{\/items\}\}/g, (match, itemTemplate) => {
        if (!options || options.length === 0) return '';
        return options.map((item: any, index: number) => {
          let itemResult = itemTemplate;
          // Replace @index
          itemResult = itemResult.replace(/\{\{@index\}\}/g, String(index + 1));
          // Replace item properties
          itemResult = itemResult.replace(/\{\{optionName\}\}/g, item.optionName || item.name || 'N/A');
          itemResult = itemResult.replace(/\{\{optionType\}\}/g, item.optionTypeName || item.optionType || item.category || 'N/A');
          itemResult = itemResult.replace(/\{\{optionCode\}\}/g, item.optionCode || 'N/A');
          itemResult = itemResult.replace(/\{\{quantity\}\}/g, String(item.quantity || 1));
          itemResult = itemResult.replace(/\{\{amount\}\}/g, item.amount || item.total || 'N/A');

          // Replace dimension variables - convert array to object if needed
          const itemSpecs = specsToObject(item.specificationValues);
          const dims = item.dim || item.dimensions || itemSpecs || {};

          // Handle conditional blocks {{#dim.variable}}...{{/dim.variable}}
          itemResult = itemResult.replace(/\{\{#dim\.([^}]+)\}\}([\s\S]*?)\{\{\/dim\.\1\}\}/g, (m: string, key: string, content: string) => {
            const value = dims[key];
            if (value !== undefined && value !== null && value !== '') {
              return content.replace(/\{\{dim\.\w+\}\}/g, String(value));
            }
            return '';
          });

          // Replace dim.* variables
          itemResult = itemResult.replace(/\{\{dim\.([^}]+)\}\}/g, (m: string, key: string) => {
            return dims[key] !== undefined ? String(dims[key]) : '';
          });

          // Replace direct dimension variables
          itemResult = itemResult.replace(/\{\{wt\}\}/g, dims.wt || dims.weight || item.wt || '');
          itemResult = itemResult.replace(/\{\{wastage\}\}/g, dims.wastage || item.wastage || '');
          itemResult = itemResult.replace(/\{\{calculation\}\}/g, dims.calculation || item.calculation || '');
          itemResult = itemResult.replace(/\{\{mc_gram\}\}/g, dims.mc_gram || item.mc_gram || '');
          itemResult = itemResult.replace(/\{\{purity\}\}/g, dims.purity || item.purity || '');
          itemResult = itemResult.replace(/\{\{rate\}\}/g, dims.rate || item.rate || '');
          itemResult = itemResult.replace(/\{\{weight\}\}/g, dims.weight || dims.wt || item.weight || '');

          return itemResult;
        }).join('');
      });

      // Handle conditional blocks at order level {{#dim.variable}}...{{/dim.variable}}
      result = result.replace(/\{\{#dim\.([^}]+)\}\}([\s\S]*?)\{\{\/dim\.\1\}\}/g, (m: string, key: string, content: string) => {
        const value = firstDims[key];
        if (value !== undefined && value !== null && value !== '') {
          return content.replace(/\{\{dim\.\w+\}\}/g, String(value));
        }
        return '';
      });

      // Handle conditional blocks {{#variable}}...{{/variable}} for any variable
      result = result.replace(/\{\{#([^}]+)\}\}([\s\S]*?)\{\{\/\1\}\}/g, (m: string, key: string, content: string) => {
        let value;
        // Check in firstDims first
        if (key.startsWith('dim.')) {
          value = firstDims[key.replace('dim.', '')];
        } else {
          value = firstOption[key] || firstDims[key] || orderData?.[key] || customer[key];
        }
        if (value !== undefined && value !== null && value !== '') {
          // Replace the variable inside the content
          return content.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), String(value));
        }
        return '';
      });

      // Replace order-level option placeholders (for single-item templates)
      result = result.
      replace(/\{\{optionName\}\}/g, firstOption.optionName || firstOption.name || '').
      replace(/\{\{optionType\}\}/g, firstOption.optionTypeName || firstOption.optionType || firstOption.category || '').
      replace(/\{\{optionCode\}\}/g, firstOption.optionCode || '');

      // Replace dim.* variables at order level
      result = result.replace(/\{\{dim\.([^}]+)\}\}/g, (m: string, key: string) => {
        return firstDims[key] !== undefined ? String(firstDims[key]) : '';
      });

      // Replace direct dimension variables at order level
      result = result.
      replace(/\{\{wt\}\}/g, firstDims.wt || firstDims.weight || firstOption.wt || '').
      replace(/\{\{wastage\}\}/g, firstDims.wastage || firstOption.wastage || '').
      replace(/\{\{calculation\}\}/g, firstDims.calculation || firstOption.calculation || '').
      replace(/\{\{mc_gram\}\}/g, firstDims.mc_gram || firstOption.mc_gram || '').
      replace(/\{\{purity\}\}/g, firstDims.purity || firstOption.purity || '').
      replace(/\{\{rate\}\}/g, firstDims.rate || firstOption.rate || '').
      replace(/\{\{weight\}\}/g, firstDims.weight || firstDims.wt || firstOption.weight || '');

      // Replace order-level placeholders
      result = result.
      replace(/\{\{orderId\}\}/g, orderId).
      replace(/\{\{orderNumber\}\}/g, orderId).
      replace(/\{\{orderDate\}\}/g, new Date(orderData?.createdAt || Date.now()).toLocaleDateString('en-IN')).
      replace(/\{\{date\}\}/g, new Date(orderData?.createdAt || Date.now()).toLocaleDateString('en-IN')).
      replace(/\{\{orderStatus\}\}/g, orderData?.status || orderData?.overallStatus || 'Pending').
      replace(/\{\{status\}\}/g, orderData?.status || orderData?.overallStatus || 'Pending').
      replace(/\{\{orderType\}\}/g, orderData?.orderTypeName || orderData?.orderType?.name || '').
      replace(/\{\{priority\}\}/g, orderData?.priority || 'Normal').
      replace(/\{\{notes\}\}/g, orderData?.notes || '').
      replace(/\{\{totalOptions\}\}/g, String(options.length)).
      replace(/\{\{totalItems\}\}/g, String(options.length)).
      replace(/\{\{totalQuantity\}\}/g, String(options.reduce((sum: number, o: any) => sum + (o.quantity || 1), 0))).
      replace(/\{\{companyName\}\}/g, '27 Infinity Manufacturing').
      replace(/\{\{companyAddress\}\}/g, '').
      replace(/\{\{companyPhone\}\}/g, '').
      replace(/\{\{companyEmail\}\}/g, '')
      // Customer placeholders
      .replace(/\{\{customerName\}\}/g, customer.name || customer.accountName || '').
      replace(/\{\{customerPhone\}\}/g, customer.phone || customer.mobile || '').
      replace(/\{\{customerEmail\}\}/g, customer.email || '').
      replace(/\{\{customerAddress\}\}/g, customer.address || '')
      // Totals
      .replace(/\{\{subtotal\}\}/g, orderData?.subtotal || '').
      replace(/\{\{tax\}\}/g, orderData?.tax || '').
      replace(/\{\{discount\}\}/g, orderData?.discount || '').
      replace(/\{\{grandTotal\}\}/g, orderData?.grandTotal || orderData?.total || '');

      return result;
    };

    // Build options table
    const optionsHtml = options.length > 0 ? `
      <table style="width: 100%; border-collapse: collapse; margin: 10px 0;">
        <thead>
          <tr style="background: #f3f4f6;">
            <th style="border: 1px solid #e5e7eb; padding: 8px; text-align: left;">#</th>
            <th style="border: 1px solid #e5e7eb; padding: 8px; text-align: left;">Option</th>
            <th style="border: 1px solid #e5e7eb; padding: 8px; text-align: left;">Type</th>
            <th style="border: 1px solid #e5e7eb; padding: 8px; text-align: left;">Specifications</th>
          </tr>
        </thead>
        <tbody>
          ${options.map((opt: any, idx: number) => `
            <tr>
              <td style="border: 1px solid #e5e7eb; padding: 8px;">${idx + 1}</td>
              <td style="border: 1px solid #e5e7eb; padding: 8px;">${opt.optionName || 'N/A'}</td>
              <td style="border: 1px solid #e5e7eb; padding: 8px;">${opt.optionTypeName || opt.category || 'N/A'}</td>
              <td style="border: 1px solid #e5e7eb; padding: 8px;">
                ${opt.specificationValues ? Object.entries(opt.specificationValues).map(([k, v]) => `${k}: ${v}`).join(', ') : 'N/A'}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    ` : '<p>No options added</p>';

    // Default templates if not provided
    const defaultHeader = `
      <div style="text-align: center; padding: 20px; border-bottom: 2px solid #FF6B35;">
        <h1 style="margin: 0; color: #FF6B35;">27 Infinity Manufacturing</h1>
        <p style="margin: 5px 0; color: #6b7280;">Order: {{orderId}}</p>
      </div>
    `;

    const defaultBody = `
      <div style="padding: 20px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
          <div>
            <h3 style="margin: 0 0 10px 0;">Customer Details</h3>
            <p style="margin: 5px 0;"><strong>Name:</strong> {{customerName}}</p>
            <p style="margin: 5px 0;"><strong>Phone:</strong> {{customerPhone}}</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> {{customerEmail}}</p>
          </div>
          <div>
            <h3 style="margin: 0 0 10px 0;">Order Info</h3>
            <p style="margin: 5px 0;"><strong>Date:</strong> {{date}}</p>
            <p style="margin: 5px 0;"><strong>Status:</strong> {{status}}</p>
            <p style="margin: 5px 0;"><strong>Priority:</strong> {{priority}}</p>
          </div>
        </div>
        <h3>Order Items</h3>
        ${optionsHtml}
        ${orderData?.notes ? `<div style="margin-top: 20px;"><strong>Notes:</strong> ${orderData.notes}</div>` : ''}
      </div>
    `;

    const defaultFooter = `
      <div style="text-align: center; padding: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px;">
        <p>Thank you for your business!</p>
        <p>27 Infinity Manufacturing - Quality Products, Trusted Service</p>
      </div>
    `;

    const header = replacePlaceholders(printType.headerTemplate || defaultHeader);
    const body = replacePlaceholders(printType.bodyTemplate || defaultBody);
    const footer = replacePlaceholders(printType.footerTemplate || defaultFooter);

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Order ${savedOrderData?.orderId || orderData?.orderId || ''}</title>
        <style>
          @page {
            size: ${printType.paperSize || 'A4'} ${printType.orientation || 'portrait'};
            margin: ${printType.margins?.top || 10}mm ${printType.margins?.right || 10}mm ${printType.margins?.bottom || 10}mm ${printType.margins?.left || 10}mm;
          }
          body {
            font-family: Arial, sans-serif;
            line-height: 1.5;
            color: #333;
          }
          ${printType.cssTemplate || ''}
        </style>
      </head>
      <body>
        ${header}
        ${body}
        ${footer}
      </body>
      </html>
    `;
  };

  // Execute print with selected print type - using iframe for Electron compatibility
  const executePrint = () => {


    const printType = selectedPrintType || {
      _id: 'default',
      typeName: 'Default',
      typeCode: 'DEFAULT',
      paperSize: 'A4',
      orientation: 'portrait'
    };

    const printHtml = generatePrintHtml(printType);

    // Use iframe for Electron compatibility (window.open is blocked)
    const printFrame = document.createElement('iframe');
    printFrame.style.position = 'fixed';
    printFrame.style.right = '0';
    printFrame.style.bottom = '0';
    printFrame.style.width = '0';
    printFrame.style.height = '0';
    printFrame.style.border = 'none';
    printFrame.style.visibility = 'hidden';
    document.body.appendChild(printFrame);

    const frameDoc = printFrame.contentDocument || printFrame.contentWindow?.document;
    if (frameDoc) {
      frameDoc.open();
      frameDoc.write(printHtml);
      frameDoc.close();

      // Wait for content to load then print
      setTimeout(() => {
        try {
          printFrame.contentWindow?.focus();
          printFrame.contentWindow?.print();
        } catch (e) {

        }
        // Remove iframe after printing
        setTimeout(() => {
          document.body.removeChild(printFrame);
        }, 1000);
      }, 250);
    }

    setShowPrintTypeSelector(false);
  };

  // Close print type selector
  const closePrintTypeSelector = () => {
    setShowPrintTypeSelector(false);
  };

  return (
    <>
      {/* Save/Update Button with CRUD System */}
      <ActionButton
        type={isEditMode ? "update" : "save"}
        state={buttonState}
        onClick={handleSaveOrder}>

        {isEditMode ? "Update Order" : "Save Order"}
      </ActionButton>

      {/* Success Popup (Custom for Order ID display and Print) */}
      {showSuccessPopup &&
      <div style={overlayStyle}>
          <div style={successPopupStyle}>
            <div style={successIconStyle}>✓</div>
            <h2 style={successTitleStyle}>
              {successType === 'update' ?
            'Order Updated Successfully!' :
            'Order Saved Successfully!'}
            </h2>
            <p style={successMessageStyle}>
              {successType === 'update' ?
            'Your order has been updated and saved to the system.' :
            'Your order has been created and saved to the system.'}
            </p>

            {savedOrderData?.orderId &&
          <div style={orderIdStyle}>
                <strong>Order ID:</strong> {savedOrderData.orderId}
              </div>
          }

            <div style={successButtonsStyle}>
              <button
              onClick={handlePrint}
              style={printButtonStyle}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E55A2B'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FF6B35'}>

                🖨️ Print Order
              </button>

              <button
              onClick={handleCloseSuccess}
              style={closeButtonStyle}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4b5563'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6b7280'}>

                ✓ Done
              </button>
            </div>
          </div>
        </div>
      }

      {/* Print Type Selector Popup */}
      {showPrintTypeSelector &&
      <div style={overlayStyle}>
          <div style={printTypeSelectorStyle}>
            <div style={printTypeSelectorHeaderStyle}>
              <h3 style={{ margin: 0, color: '#1f2937' }}>Select Print Type</h3>
              <button
              onClick={closePrintTypeSelector}
              style={closeIconStyle}>

                ✕
              </button>
            </div>

            {loadingPrintTypes ?
          <div style={{ textAlign: 'center', padding: '30px' }}>
                <div style={spinnerStyle}></div>
                <p style={{ color: '#6b7280', marginTop: '10px' }}>Loading print types...</p>
              </div> :
          printTypes.length === 0 ?
          <div style={{ textAlign: 'center', padding: '20px' }}>
                <p style={{ color: '#6b7280' }}>No print types configured.</p>
                <button
              onClick={executePrint}
              style={printButtonStyle}>

                  Print with Default Settings
                </button>
              </div> :

          <>
                <div style={printTypeListStyle}>
                  {printTypes.map((pt) =>
              <div
                key={pt._id}
                onClick={() => setSelectedPrintType(pt)}
                style={{
                  ...printTypeItemStyle,
                  backgroundColor: selectedPrintType?._id === pt._id ? '#FFF5F2' : '#fff',
                  borderColor: selectedPrintType?._id === pt._id ? '#FF6B35' : '#e5e7eb'
                }}>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    border: `2px solid ${selectedPrintType?._id === pt._id ? '#FF6B35' : '#d1d5db'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                          {selectedPrintType?._id === pt._id &&
                    <div style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      backgroundColor: '#FF6B35'
                    }} />
                    }
                        </div>
                        <div>
                          <div style={{ fontWeight: '600', color: '#1f2937' }}>
                            {pt.typeName}
                            {pt.isDefault &&
                      <span style={defaultBadgeStyle}>Default</span>
                      }
                          </div>
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>
                            {pt.paperSize} • {pt.orientation}
                            {pt.description && ` • ${pt.description}`}
                          </div>
                        </div>
                      </div>
                    </div>
              )}
                </div>

                <div style={printTypeSelectorFooterStyle}>
                  <button
                onClick={closePrintTypeSelector}
                style={cancelButtonStyle}>

                    Cancel
                  </button>
                  <button
                onClick={executePrint}
                style={printButtonStyle}
                disabled={!selectedPrintType && printTypes.length > 0}>

                    🖨️ Print
                  </button>
                </div>
              </>
          }
          </div>
        </div>
      }

      {/* Toast notifications from CRUD system */}
      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
    </>);

};

// Styles
const overlayStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0,0,0,0.6)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999,
  animation: "fadeIn 0.2s ease"
};

const successPopupStyle: React.CSSProperties = {
  backgroundColor: "#fff",
  padding: "40px",
  borderRadius: "16px",
  textAlign: "center",
  maxWidth: "500px",
  width: "90%",
  boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
  animation: "slideIn 0.3s ease"
};

const successIconStyle: React.CSSProperties = {
  width: "80px",
  height: "80px",
  backgroundColor: "#10b981",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: "0 auto 20px",
  fontSize: "48px",
  color: "white",
  animation: "scaleIn 0.5s ease"
};

const successTitleStyle: React.CSSProperties = {
  color: "#1f2937",
  marginBottom: "12px",
  fontSize: "24px",
  fontWeight: "700"
};

const successMessageStyle: React.CSSProperties = {
  color: "#6b7280",
  marginBottom: "20px",
  fontSize: "16px",
  lineHeight: "1.5"
};

const orderIdStyle: React.CSSProperties = {
  backgroundColor: "#f3f4f6",
  padding: "12px 16px",
  borderRadius: "8px",
  marginBottom: "25px",
  fontSize: "14px",
  color: "#374151"
};

const successButtonsStyle: React.CSSProperties = {
  display: "flex",
  gap: "12px",
  justifyContent: "center",
  flexWrap: "wrap"
};

const printButtonStyle: React.CSSProperties = {
  padding: "12px 24px",
  backgroundColor: "#FF6B35",
  color: "white",
  border: "none",
  borderRadius: "8px",
  fontSize: "16px",
  cursor: "pointer",
  transition: "all 0.3s ease",
  fontWeight: "500"
};

const closeButtonStyle: React.CSSProperties = {
  padding: "12px 24px",
  backgroundColor: "#6b7280",
  color: "white",
  border: "none",
  borderRadius: "8px",
  fontSize: "16px",
  cursor: "pointer",
  transition: "all 0.3s ease",
  fontWeight: "500"
};

// Print Type Selector Styles
const printTypeSelectorStyle: React.CSSProperties = {
  backgroundColor: "#fff",
  borderRadius: "16px",
  width: "90%",
  maxWidth: "500px",
  maxHeight: "80vh",
  overflow: "hidden",
  boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
  animation: "slideIn 0.3s ease"
};

const printTypeSelectorHeaderStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "20px",
  borderBottom: "1px solid #e5e7eb"
};

const closeIconStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  fontSize: "20px",
  cursor: "pointer",
  color: "#6b7280",
  padding: "5px"
};

const printTypeListStyle: React.CSSProperties = {
  padding: "15px",
  maxHeight: "400px",
  overflowY: "auto"
};

const printTypeItemStyle: React.CSSProperties = {
  padding: "15px",
  border: "2px solid #e5e7eb",
  borderRadius: "10px",
  marginBottom: "10px",
  cursor: "pointer",
  transition: "all 0.2s ease"
};

const defaultBadgeStyle: React.CSSProperties = {
  backgroundColor: "#10b981",
  color: "white",
  fontSize: "10px",
  padding: "2px 6px",
  borderRadius: "4px",
  marginLeft: "8px",
  fontWeight: "500"
};

const printTypeSelectorFooterStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "10px",
  padding: "15px 20px",
  borderTop: "1px solid #e5e7eb",
  backgroundColor: "#f9fafb"
};

const cancelButtonStyle: React.CSSProperties = {
  padding: "10px 20px",
  backgroundColor: "#fff",
  color: "#374151",
  border: "1px solid #d1d5db",
  borderRadius: "8px",
  fontSize: "14px",
  cursor: "pointer",
  fontWeight: "500"
};

const spinnerStyle: React.CSSProperties = {
  width: "30px",
  height: "30px",
  border: "3px solid #e5e7eb",
  borderTop: "3px solid #FF6B35",
  borderRadius: "50%",
  animation: "spin 1s linear infinite",
  margin: "0 auto"
};

// Add CSS animations
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes scaleIn {
      from {
        transform: scale(0);
      }
      to {
        transform: scale(1);
      }
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;

  if (!document.head.querySelector('style[data-save-orders]')) {
    styleSheet.setAttribute('data-save-orders', 'true');
    document.head.appendChild(styleSheet);
  }
}

export default SaveOrders;