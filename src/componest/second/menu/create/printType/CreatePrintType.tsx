import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { createPrintType, updatePrintType, deletePrintType } from "../../../../redux/create/printType/printTypeActions";
import { getOrderTypes } from "../../../../redux/create/orderType/orderTypeActions";
import { getOptionTypes } from "../../../../redux/option/optionTypeActions";
import { getOptionSpecs } from "../../../../redux/create/optionSpec/optionSpecActions";
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

  // Fetch order types, option types, and option specs on mount
  useEffect(() => {
    dispatch(getOrderTypes());
    dispatch(getOptionTypes());
    dispatch(getOptionSpecs());
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
      linkedOrderTypes,
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
          <h3 className="orderTypeSectionTitle">
            Template Configuration
            <FieldTooltip
              content="Define HTML templates for header, body, and footer sections of the print output"
              position="right"
            />
          </h3>

          <div className="orderTypeFormColumn">
            <label className="orderTypeInputLabel">Header Template</label>
            <textarea
              value={headerTemplate}
              onChange={(e) => setHeaderTemplate(e.target.value)}
              className="orderTypeFormTextarea"
              placeholder="Enter HTML template for header..."
              rows={4}
              style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}
            />
          </div>

          <div className="orderTypeFormColumn">
            <label className="orderTypeInputLabel">Body Template</label>
            <textarea
              value={bodyTemplate}
              onChange={(e) => setBodyTemplate(e.target.value)}
              className="orderTypeFormTextarea"
              placeholder="Enter HTML template for body..."
              rows={6}
              style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}
            />
          </div>

          <div className="orderTypeFormColumn">
            <label className="orderTypeInputLabel">Footer Template</label>
            <textarea
              value={footerTemplate}
              onChange={(e) => setFooterTemplate(e.target.value)}
              className="orderTypeFormTextarea"
              placeholder="Enter HTML template for footer..."
              rows={4}
              style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}
            />
          </div>
        </div>

        {/* Linked Order Types Section */}
        <div className="orderTypeSection">
          <h3 className="orderTypeSectionTitle">
            Linked Order Types
            <FieldTooltip
              content="Select which order types can use this print type. Leave empty to allow all order types."
              position="right"
            />
          </h3>

          <div className="orderTypeFormRow">
            <div style={{ width: '100%' }}>
              {orderTypes.length === 0 ? (
                <p style={{ color: '#666', fontStyle: 'italic' }}>Loading order types...</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '0.5rem' }}>
                  {orderTypes.map((orderType: any) => (
                    <label
                      key={orderType._id}
                      className="orderTypeCheckboxLabel"
                      style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', padding: '0.5rem', border: '1px solid #e0e0e0', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      <input
                        type="checkbox"
                        checked={linkedOrderTypes.includes(orderType._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setLinkedOrderTypes([...linkedOrderTypes, orderType._id]);
                          } else {
                            setLinkedOrderTypes(linkedOrderTypes.filter(id => id !== orderType._id));
                          }
                        }}
                        style={{ marginTop: '0.25rem', flexShrink: 0 }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 500 }}>{orderType.typeName}</div>
                        <div style={{ fontSize: '0.75rem', color: '#666' }}>
                          Code: {orderType.typeCode}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
              {orderTypes.length > 0 && (
                <div style={{ marginTop: '0.75rem', fontSize: '0.875rem', color: '#666' }}>
                  {linkedOrderTypes.length === 0
                    ? "No order types selected (all order types will be allowed)"
                    : `${linkedOrderTypes.length} order type(s) selected`
                  }
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Available Specifications from Linked Order Types */}
        {linkedOrderTypes.length > 0 && (
          <div className="orderTypeSection">
            <h3 className="orderTypeSectionTitle">
              Available Specifications
              <FieldTooltip
                content="These are the specifications available from the linked order types' option types. Use these in your print template."
                position="right"
              />
            </h3>

            {getLinkedOptionTypesSpecs().length === 0 ? (
              <p style={{ color: '#6b7280', fontSize: '13px', textAlign: 'center', padding: '24px', background: '#fef3c7', borderRadius: '8px', border: '1px solid #fbbf24' }}>
                No specifications found in the linked order types.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {getLinkedOptionTypesSpecs().map((typeGroup, groupIndex) => {
                  const numberSpecs = typeGroup.specs.filter((s: any) => s.dataType === 'number');
                  const otherSpecs = typeGroup.specs.filter((s: any) => s.dataType !== 'number');
                  return (
                    <div key={groupIndex} style={{ background: '#f0f9ff', padding: '12px', borderRadius: '8px', border: '1px solid #0ea5e9' }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#0369a1', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ background: '#0ea5e9', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '11px' }}>
                          {typeGroup.optionTypeName}
                        </span>
                        <span style={{ fontSize: '11px', color: '#64748b' }}>
                          ({typeGroup.specs.length} specs)
                        </span>
                      </div>

                      {/* Number specifications */}
                      {numberSpecs.length > 0 && (
                        <div style={{ marginBottom: '8px' }}>
                          <div style={{ fontSize: '11px', color: '#059669', marginBottom: '4px', fontWeight: 500 }}>
                            Number Specifications:
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {numberSpecs.map((spec: any, specIndex: number) => (
                              <span
                                key={specIndex}
                                style={{
                                  padding: '4px 10px',
                                  background: '#d1fae5',
                                  border: '1px solid #10b981',
                                  borderRadius: '4px',
                                  fontSize: '11px',
                                  color: '#065f46'
                                }}
                              >
                                {spec.name} {spec.unit && <span style={{ opacity: 0.7 }}>({spec.unit})</span>}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Other specifications */}
                      {otherSpecs.length > 0 && (
                        <div>
                          <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>
                            Other Specifications:
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {otherSpecs.map((spec: any, specIndex: number) => (
                              <span
                                key={specIndex}
                                style={{
                                  padding: '4px 8px',
                                  background: '#f3f4f6',
                                  border: '1px solid #d1d5db',
                                  borderRadius: '4px',
                                  fontSize: '11px',
                                  color: '#6b7280'
                                }}
                              >
                                {spec.name} <span style={{ opacity: 0.6 }}>({spec.dataType})</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div style={{ marginTop: '12px', fontSize: '12px', color: '#0369a1', background: '#bae6fd', padding: '8px 12px', borderRadius: '6px' }}>
              <strong>Tip:</strong> Use these specification names in your templates with the format: <code style={{ background: '#e0f2fe', padding: '2px 6px', borderRadius: '4px' }}>{'{{specName}}'}</code>
            </div>
          </div>
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
