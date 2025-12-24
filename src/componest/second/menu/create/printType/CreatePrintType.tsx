import { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { createPrintType, updatePrintType, deletePrintType } from "../../../../redux/create/printType/printTypeActions";
import { getOrderTypes } from "../../../../redux/create/orderType/orderTypeActions";
import { getOptionTypes } from "../../../../redux/option/optionTypeActions";
import { getOptionSpecs } from "../../../../redux/create/optionSpec/optionSpecActions";
import { getOptions } from "../../../../redux/option/optionActions";
import { AppDispatch } from "../../../../../store";
import { ActionButton } from "../../../../../components/shared/ActionButton";
import { ToastContainer } from "../../../../../components/shared/Toast";
import { useCRUD } from "../../../../../hooks/useCRUD";
import FieldTooltip from "../../../../../components/shared/FieldTooltip";
import { useInternalBackNavigation } from "../../../../allCompones/BackButton";
import "../orderType/orderType.css";

interface CreatePrintTypeProps {
  initialData?: any;
  onCancel?: () => void;
  onSaveSuccess?: () => void;
}

const CreatePrintType: React.FC<CreatePrintTypeProps> = ({ initialData: propInitialData, onCancel, onSaveSuccess }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Edit mode detection - support both props and location.state
  const { printTypeData: locationData, isEdit } = location.state || {};
  const printTypeData = propInitialData || locationData;
  const editMode = Boolean(propInitialData || isEdit || (printTypeData && printTypeData._id));
  const printTypeId = printTypeData?._id;

  // Basic Information
  const [typeName, setTypeName] = useState("");
  const [typeCode, setTypeCode] = useState("");
  const [description, setDescription] = useState("");

  // Print Configuration
  const [paperSize, setPaperSize] = useState("A4");
  const [orientation, setOrientation] = useState("portrait");
  const [margins, setMargins] = useState({ top: 10, right: 10, bottom: 10, left: 10 });

  // Template Configuration
  const [headerTemplate, setHeaderTemplate] = useState("");
  const [bodyTemplate, setBodyTemplate] = useState("");
  const [footerTemplate, setFooterTemplate] = useState("");
  const [cssTemplate, setCssTemplate] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  // Linked Order Types
  const [linkedOrderTypes, setLinkedOrderTypes] = useState<string[]>([]);

  // Global/Default Settings
  const [isGlobal, setIsGlobal] = useState(false);
  const [isDefault, setIsDefault] = useState(false);
  const [isActive, setIsActive] = useState(true);

  // Delete confirmation modal
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const { saveState, handleSave, toast } = useCRUD();

  // Get user role for conditional rendering
  const userRole = useSelector((state: any) => state.auth?.userData?.role);

  // Get order types from Redux store
  const orderTypes = useSelector((state: any) => state.orderTypeList?.orderTypes || []);

  // Get option types from Redux store
  const optionTypes = useSelector((state: any) => state.optionType?.optionTypes || []);

  // Get option specs from Redux store (contains actual specifications with values)
  const optionSpecs = useSelector((state: any) => state.optionSpec?.optionSpecs || []);

  // Get options from Redux store (contains options with dimensions like mc/gram, calculation, wastage)
  const options = useSelector((state: any) => state.option?.options || []);

  // Fetch order types, option types, option specs, and options on mount
  useEffect(() => {
    dispatch(getOrderTypes());
    dispatch(getOptionTypes({}));
    dispatch(getOptionSpecs({}));
    const branchId = localStorage.getItem('branchId') || '';
    dispatch(getOptions({ branchId }));
  }, [dispatch]);

  // Get all option type IDs from linked order types
  const getLinkedOptionTypeIds = () => {
    const optionTypeIds: string[] = [];
    linkedOrderTypes.forEach((orderTypeId) => {
      const orderType = orderTypes.find((ot: any) => ot._id === orderTypeId);
      if (orderType && orderType.allowedOptionTypes) {
        orderType.allowedOptionTypes.forEach((optionTypeId: any) => {
          const id = typeof optionTypeId === 'string' ? optionTypeId : optionTypeId._id;
          if (id && !optionTypeIds.includes(id)) {
            optionTypeIds.push(id);
          }
        });
      }
    });
    return optionTypeIds;
  };

  // Get all specifications from linked order types' option types (from OptionSpecs)
  const getLinkedOptionTypesSpecs = () => {
    const allSpecs: { optionTypeName: string; optionTypeId: string; specs: any[] }[] = [];
    const linkedOptionTypeIds = getLinkedOptionTypeIds();

    linkedOptionTypeIds.forEach((optionTypeId) => {
      const optionType = optionTypes.find((ot: any) => ot._id === optionTypeId);
      if (optionType) {
        // Get all OptionSpecs that belong to this OptionType
        const relatedSpecs = optionSpecs.filter((spec: any) =>
          spec.optionTypeId === optionTypeId ||
          (spec.optionTypeId && spec.optionTypeId._id === optionTypeId)
        );

        // Collect all unique specifications from these OptionSpecs
        const allSpecsFromOptionSpecs: any[] = [];
        relatedSpecs.forEach((optionSpec: any) => {
          if (optionSpec.specifications && Array.isArray(optionSpec.specifications)) {
            optionSpec.specifications.forEach((spec: any) => {
              // Check if we already have this spec name (avoid duplicates)
              if (!allSpecsFromOptionSpecs.some(existing => existing.name === spec.name)) {
                allSpecsFromOptionSpecs.push({
                  ...spec,
                  fromOptionSpec: optionSpec.name,
                  fromOptionSpecCode: optionSpec.code
                });
              }
            });
          }
        });

        if (allSpecsFromOptionSpecs.length > 0) {
          allSpecs.push({
            optionTypeName: optionType.name,
            optionTypeId: optionType._id,
            specs: allSpecsFromOptionSpecs,
          });
        }
      }
    });

    return allSpecs;
  };

  // Handle ESC key to go back to list in edit mode
  const handleBackToList = () => {
    if (onSaveSuccess) {
      onSaveSuccess();
    } else if (onCancel) {
      onCancel();
    } else {
      navigate(-1);
    }
  };

  useInternalBackNavigation(editMode && !showDeleteConfirm, handleBackToList);

  // Load existing data when editing
  useEffect(() => {
    if (editMode && printTypeData) {
      console.log('Edit mode - Loading print type data:', printTypeData);

      // Basic Information
      setTypeName(printTypeData.typeName || "");
      setTypeCode(printTypeData.typeCode || "");
      setDescription(printTypeData.description || "");

      // Print Configuration
      setPaperSize(printTypeData.paperSize || "A4");
      setOrientation(printTypeData.orientation || "portrait");
      if (printTypeData.margins) {
        setMargins(printTypeData.margins);
      }

      // Template Configuration
      setHeaderTemplate(printTypeData.headerTemplate || "");
      setBodyTemplate(printTypeData.bodyTemplate || "");
      setFooterTemplate(printTypeData.footerTemplate || "");
      setCssTemplate(printTypeData.cssTemplate || "");

      // Linked Order Types
      if (printTypeData.linkedOrderTypes && Array.isArray(printTypeData.linkedOrderTypes)) {
        const orderTypeIds = printTypeData.linkedOrderTypes.map((ot: any) =>
          typeof ot === 'string' ? ot : ot._id
        );
        setLinkedOrderTypes(orderTypeIds);
      }

      // Global/Default Settings
      setIsGlobal(printTypeData.isGlobal || false);
      setIsDefault(printTypeData.isDefault || false);
      setIsActive(printTypeData.isActive !== false);
    }
  }, [editMode, printTypeData]);

  const handleSubmit = () => {
    // Validation
    if (!typeName.trim() || !typeCode.trim()) {
      toast.error("Validation Error", "Please fill all required fields: Type Name and Type Code");
      return;
    }

    // Build print type data
    const branchId = localStorage.getItem('branchId') || localStorage.getItem('selectedBranch') || '';
    const dataToSave = {
      typeName,
      typeCode: typeCode.toUpperCase(),
      description,
      paperSize,
      orientation,
      margins,
      headerTemplate,
      bodyTemplate,
      footerTemplate,
      cssTemplate,
      linkedOrderTypes,
      branchId,
      isGlobal,
      isDefault,
      isActive
    };

    if (editMode && printTypeId) {
      // Update existing print type
      handleSave(
        () => dispatch(updatePrintType(printTypeId, dataToSave)),
        {
          successMessage: "Print type updated successfully!",
          onSuccess: () => {
            if (onSaveSuccess) {
              onSaveSuccess();
            } else {
              navigate(-1);
            }
          }
        }
      );
    } else {
      // Create new print type
      handleSave(
        () => dispatch(createPrintType(dataToSave)),
        {
          successMessage: "Print type created successfully!",
          onSuccess: () => {
            // Reset form
            setTypeName("");
            setTypeCode("");
            setDescription("");
            setPaperSize("A4");
            setOrientation("portrait");
            setMargins({ top: 10, right: 10, bottom: 10, left: 10 });
            setHeaderTemplate("");
            setBodyTemplate("");
            setFooterTemplate("");
            setCssTemplate("");
            setLinkedOrderTypes([]);
            setIsGlobal(false);
            setIsDefault(false);
          }
        }
      );
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!printTypeId) return;

    setDeleting(true);
    try {
      await dispatch(deletePrintType(printTypeId));
      toast.success('Deleted', 'Print type deleted successfully');
      setShowDeleteConfirm(false);
      setTimeout(() => {
        if (onSaveSuccess) {
          onSaveSuccess();
        } else {
          navigate(-1);
        }
      }, 1000);
    } catch (err) {
      toast.error('Error', 'Failed to delete print type');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="orderTypeContainer CreateForm">
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
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>Warning</div>
            <h3 style={{ margin: '0 0 8px 0', color: '#1f2937' }}>Delete Print Type?</h3>
            <p style={{ color: '#6b7280', marginBottom: '24px' }}>
              Are you sure you want to delete this print type? This action cannot be undone.
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

      <div className="orderTypeHeader">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'space-between', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {editMode && onCancel && (
              <button
                type="button"
                onClick={onCancel}
                style={{ padding: '8px 16px', background: '#6b7280', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
              >
                Back to List
              </button>
            )}
            <div>
              <h2 className="orderTypeTitle">
                {editMode ? 'Edit Print Type' : 'Create Print Type'}
              </h2>
              <p className="orderTypeSubtitle">
                {editMode
                  ? `Editing: ${printTypeData?.typeName || 'Print Type'}`
                  : 'Configure a new print type for your system'
                }
              </p>
            </div>
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
                gap: '6px'
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

      <div className="orderTypeFormGrid">
        {/* Basic Information Section */}
        <div className="orderTypeSection">
          <h3 className="orderTypeSectionTitle">Basic Information</h3>

          <div className="orderTypeFormRow">
            <div className="orderTypeFormColumn">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <label className="orderTypeInputLabel">Type Name *</label>
                <FieldTooltip
                  content="Enter a descriptive name for this print type (e.g., Invoice Print, Label Print, Report Print)"
                  position="right"
                />
              </div>
              <input
                type="text"
                value={typeName}
                onChange={(e) => setTypeName(e.target.value)}
                className="orderTypeFormInput"
                placeholder="e.g., Invoice Print"
                required
              />
            </div>

            <div className="orderTypeFormColumn">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <label className="orderTypeInputLabel">Type Code *</label>
                <FieldTooltip
                  content="Short code for this print type (e.g., INV, LBL, RPT). Will be converted to uppercase."
                  position="right"
                />
              </div>
              <input
                type="text"
                value={typeCode}
                onChange={(e) => setTypeCode(e.target.value.toUpperCase())}
                className="orderTypeFormInput"
                placeholder="e.g., INV"
                maxLength={10}
                required
              />
            </div>
          </div>

          <div className="orderTypeFormColumn">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <label className="orderTypeInputLabel">Description</label>
              <FieldTooltip
                content="Optional description explaining when to use this print type"
                position="right"
              />
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="orderTypeFormTextarea"
              placeholder="Describe when to use this print type..."
              rows={3}
            />
          </div>
        </div>

        {/* Print Configuration Section */}
        <div className="orderTypeSection">
          <h3 className="orderTypeSectionTitle">Print Configuration</h3>

          <div className="orderTypeFormRow">
            <div className="orderTypeFormColumn">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <label className="orderTypeInputLabel">Paper Size</label>
                <FieldTooltip
                  content="Select the paper size for printing"
                  position="right"
                />
              </div>
              <select
                value={paperSize}
                onChange={(e) => setPaperSize(e.target.value)}
                className="orderTypeFormInput"
              >
                <option value="A4">A4</option>
                <option value="A5">A5</option>
                <option value="Letter">Letter</option>
                <option value="Legal">Legal</option>
                <option value="Custom">Custom</option>
              </select>
            </div>

            <div className="orderTypeFormColumn">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <label className="orderTypeInputLabel">Orientation</label>
                <FieldTooltip
                  content="Select page orientation"
                  position="right"
                />
              </div>
              <select
                value={orientation}
                onChange={(e) => setOrientation(e.target.value)}
                className="orderTypeFormInput"
              >
                <option value="portrait">Portrait</option>
                <option value="landscape">Landscape</option>
              </select>
            </div>
          </div>

          <div className="orderTypeFormRow">
            <div className="orderTypeFormColumn">
              <label className="orderTypeInputLabel">Margins (mm)</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#666' }}>Top</label>
                  <input
                    type="number"
                    value={margins.top}
                    onChange={(e) => setMargins({ ...margins, top: Number(e.target.value) })}
                    className="orderTypeFormInput"
                    min={0}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#666' }}>Right</label>
                  <input
                    type="number"
                    value={margins.right}
                    onChange={(e) => setMargins({ ...margins, right: Number(e.target.value) })}
                    className="orderTypeFormInput"
                    min={0}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#666' }}>Bottom</label>
                  <input
                    type="number"
                    value={margins.bottom}
                    onChange={(e) => setMargins({ ...margins, bottom: Number(e.target.value) })}
                    className="orderTypeFormInput"
                    min={0}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#666' }}>Left</label>
                  <input
                    type="number"
                    value={margins.left}
                    onChange={(e) => setMargins({ ...margins, left: Number(e.target.value) })}
                    className="orderTypeFormInput"
                    min={0}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Template Configuration Section */}
        <div className="orderTypeSection">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 className="orderTypeSectionTitle" style={{ marginBottom: 0, borderBottom: 'none', paddingBottom: 0 }}>
              Template Configuration
              <FieldTooltip
                content="Define HTML and CSS templates for header, body, and footer sections of the print output"
                position="right"
              />
            </h3>
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              style={{
                padding: '8px 16px',
                background: showPreview ? '#ef4444' : '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 500
              }}
            >
              {showPreview ? '✕ Close Preview' : '👁 Live Preview'}
            </button>
          </div>

          {/* CSS Template */}
          <div className="orderTypeFormColumn">
            <label className="orderTypeInputLabel" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ background: '#8b5cf6', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '11px' }}>CSS</span>
              CSS Styles
            </label>
            <textarea
              value={cssTemplate}
              onChange={(e) => setCssTemplate(e.target.value)}
              className="orderTypeFormTextarea"
              placeholder={`/* Example CSS */
.print-header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; }
.print-body { padding: 20px 0; }
.print-footer { text-align: center; border-top: 1px solid #ccc; padding-top: 10px; font-size: 12px; }
table { width: 100%; border-collapse: collapse; }
th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
th { background-color: #f5f5f5; }`}
              rows={8}
              style={{ fontFamily: 'monospace', fontSize: '0.8rem', background: '#1e1e1e', color: '#d4d4d4', border: '1px solid #333' }}
            />
          </div>

          <div className="orderTypeFormColumn">
            <label className="orderTypeInputLabel" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ background: '#22c55e', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '11px' }}>HTML</span>
              Header Template
            </label>
            <textarea
              value={headerTemplate}
              onChange={(e) => setHeaderTemplate(e.target.value)}
              className="orderTypeFormTextarea"
              placeholder={`<div class="print-header">
  <h1>Company Name</h1>
  <p>Address Line 1, City, State - PIN</p>
  <p>Phone: +91-XXXXXXXXXX | Email: info@company.com</p>
</div>`}
              rows={5}
              style={{ fontFamily: 'monospace', fontSize: '0.8rem', background: '#fefce8', border: '1px solid #eab308' }}
            />
          </div>

          <div className="orderTypeFormColumn">
            <label className="orderTypeInputLabel" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ background: '#3b82f6', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '11px' }}>HTML</span>
              Body Template
            </label>
            <textarea
              value={bodyTemplate}
              onChange={(e) => setBodyTemplate(e.target.value)}
              className="orderTypeFormTextarea"
              placeholder={`<div class="print-body">
  <h2>Invoice / Bill</h2>
  <table>
    <thead>
      <tr>
        <th>Item</th>
        <th>Qty</th>
        <th>Rate</th>
        <th>Amount</th>
      </tr>
    </thead>
    <tbody>
      {{#items}}
      <tr>
        <td>{{name}}</td>
        <td>{{qty}}</td>
        <td>{{rate}}</td>
        <td>{{amount}}</td>
      </tr>
      {{/items}}
    </tbody>
  </table>
  <p><strong>Total: {{total}}</strong></p>
</div>`}
              rows={10}
              style={{ fontFamily: 'monospace', fontSize: '0.8rem', background: '#eff6ff', border: '1px solid #3b82f6' }}
            />
          </div>

          <div className="orderTypeFormColumn">
            <label className="orderTypeInputLabel" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ background: '#f97316', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '11px' }}>HTML</span>
              Footer Template
            </label>
            <textarea
              value={footerTemplate}
              onChange={(e) => setFooterTemplate(e.target.value)}
              className="orderTypeFormTextarea"
              placeholder={`<div class="print-footer">
  <p>Thank you for your business!</p>
  <p>Terms & Conditions Apply</p>
</div>`}
              rows={4}
              style={{ fontFamily: 'monospace', fontSize: '0.8rem', background: '#fff7ed', border: '1px solid #f97316' }}
            />
          </div>

          {/* Variable Reference */}
          <div style={{ marginTop: '12px', padding: '12px', background: '#f0f9ff', borderRadius: '8px', border: '1px solid #0ea5e9' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#0369a1', marginBottom: '8px' }}>
              📝 Available Variables (use with {'{{variableName}}'})
            </div>

            {/* Order Variables */}
            <div style={{ marginBottom: '10px' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>Order Info:</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', fontSize: '11px' }}>
                {['orderNumber', 'orderDate', 'orderType', 'orderStatus', 'customerName', 'customerAddress', 'customerPhone'].map((v) => (
                  <code key={v} style={{ background: '#dbeafe', padding: '2px 8px', borderRadius: '4px', color: '#1e40af' }}>
                    {`{{${v}}}`}
                  </code>
                ))}
              </div>
            </div>

            {/* Option Variables */}
            <div style={{ marginBottom: '10px' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>Option Info (per item):</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', fontSize: '11px' }}>
                {['optionName', 'optionType', 'optionCode', 'optionDimensions'].map((v) => (
                  <code key={v} style={{ background: '#d1fae5', padding: '2px 8px', borderRadius: '4px', color: '#065f46' }}>
                    {`{{${v}}}`}
                  </code>
                ))}
              </div>
            </div>

            {/* Dimension Variables - Dynamic based on Option Type */}
            <div style={{ marginBottom: '10px' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>Dimension Variables (from Option):</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', fontSize: '11px' }}>
                {['dim.mc_gram', 'dim.calculation', 'dim.wastage', 'dim.purity', 'dim.weight', 'dim.rate'].map((v) => (
                  <code key={v} style={{ background: '#fef3c7', padding: '2px 8px', borderRadius: '4px', color: '#92400e' }}>
                    {`{{${v}}}`}
                  </code>
                ))}
              </div>
              <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '4px' }}>
                Use <code style={{ background: '#fef3c7', padding: '1px 4px', borderRadius: '2px' }}>{'{{dim.YOUR_DIMENSION_NAME}}'}</code> for any dimension
              </div>
            </div>

            {/* Calculation Variables */}
            <div style={{ marginBottom: '10px' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>Totals & Calculations:</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', fontSize: '11px' }}>
                {['subtotal', 'tax', 'discount', 'grandTotal', 'totalItems', 'totalQuantity'].map((v) => (
                  <code key={v} style={{ background: '#fce7f3', padding: '2px 8px', borderRadius: '4px', color: '#9d174d' }}>
                    {`{{${v}}}`}
                  </code>
                ))}
              </div>
            </div>

            {/* Loop Variables */}
            <div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>Loop through items:</div>
              <div style={{ fontSize: '10px', color: '#6b7280', fontFamily: 'monospace', background: '#f3f4f6', padding: '8px', borderRadius: '4px' }}>
                {'{{#items}}'}<br />
                {'  <tr><td>{{optionName}}</td><td>{{optionType}}</td><td>{{dim.weight}}</td></tr>'}<br />
                {'{{/items}}'}
              </div>
            </div>
          </div>
        </div>

        {/* Live Preview Popup Modal - Using Portal for Electron */}
        {showPreview && ReactDOM.createPortal(
          <div
            className="print-preview-modal-overlay"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              background: 'rgba(0, 0, 0, 0.9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 999999,
              padding: '20px',
              boxSizing: 'border-box',
            }}
            onClick={() => setShowPreview(false)}
          >
            <div
              style={{
                background: '#f3f4f6',
                borderRadius: '12px',
                width: '85vw',
                maxWidth: '850px',
                height: '85vh',
                maxHeight: '85vh',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
                overflow: 'hidden',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Popup Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '14px 20px',
                background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
                color: 'white',
                flexShrink: 0,
              }}>
                <h2 style={{ fontSize: '16px', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  Print Preview
                </h2>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    style={{
                      padding: '6px 14px',
                      background: '#22c55e',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 500,
                      cursor: 'pointer',
                    }}
                  >
                    Print
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPreview(false)}
                    style={{
                      padding: '6px 14px',
                      background: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 500,
                      cursor: 'pointer',
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>

              {/* Popup Body - Scrollable Paper */}
              <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '20px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-start',
                background: '#374151',
              }}>
                <div style={{
                  background: 'white',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
                  borderRadius: '2px',
                  width: '100%',
                  maxWidth: '700px',
                  minHeight: '500px',
                  padding: '30px',
                  fontFamily: 'Arial, sans-serif',
                  fontSize: '12px',
                  lineHeight: 1.5,
                  color: '#333',
                }}>
                  <style dangerouslySetInnerHTML={{ __html: cssTemplate }} />
                  <div dangerouslySetInnerHTML={{ __html: headerTemplate }} />
                  <div dangerouslySetInnerHTML={{ __html: bodyTemplate }} />
                  <div dangerouslySetInnerHTML={{ __html: footerTemplate }} />
                </div>
              </div>

              {/* Popup Footer - Info */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 20px',
                background: '#e5e7eb',
                borderTop: '1px solid #d1d5db',
                fontSize: '11px',
                color: '#6b7280',
                flexShrink: 0,
              }}>
                <div>
                  Paper: <strong>{paperSize}</strong> | Orientation: <strong>{orientation}</strong>
                </div>
                <div>
                  Margins: {margins.top}mm / {margins.right}mm / {margins.bottom}mm / {margins.left}mm
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

        {/* Global/Default Settings Section */}
        <div className="orderTypeSection">
          <h3 className="orderTypeSectionTitle">Advanced Settings</h3>

          <div className="orderTypeCheckboxGrid">
            {userRole === 'admin' && (
              <label className="orderTypeCheckboxLabel">
                <input
                  type="checkbox"
                  checked={isGlobal}
                  onChange={(e) => setIsGlobal(e.target.checked)}
                />
                <span>Global Print Type</span>
                <FieldTooltip
                  content="Make this print type available across all branches"
                  position="right"
                />
              </label>
            )}

            <label className="orderTypeCheckboxLabel">
              <input
                type="checkbox"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
              />
              <span>Set as Default</span>
              <FieldTooltip
                content="Make this the default print type when printing"
                position="right"
              />
            </label>
          </div>

          {/* Active/Inactive Status */}
          <div style={{ marginTop: '1rem' }}>
            <label className="orderTypeInputLabel" style={{ marginBottom: '0.5rem', display: 'block' }}>Status</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setIsActive(true)}
                style={{
                  padding: '8px 16px',
                  background: isActive ? '#22c55e' : '#e5e7eb',
                  color: isActive ? 'white' : '#666',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: isActive ? '600' : '400'
                }}
              >
                Active
              </button>
              <button
                type="button"
                onClick={() => setIsActive(false)}
                style={{
                  padding: '8px 16px',
                  background: !isActive ? '#ef4444' : '#e5e7eb',
                  color: !isActive ? 'white' : '#666',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: !isActive ? '600' : '400'
                }}
              >
                Inactive
              </button>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="orderTypeFormActions">
          <ActionButton
            type="save"
            state={saveState}
            onClick={handleSubmit}
            className="orderTypeSaveButton"
            disabled={!typeName.trim() || !typeCode.trim()}
          >
            {editMode ? 'Update Print Type' : 'Create Print Type'}
          </ActionButton>
        </div>
      </div>

      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
    </div>
  );
};

export default CreatePrintType;
