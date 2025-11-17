import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createOrderType } from "../../../../redux/create/orderType/orderTypeActions";
import { RootState } from "../../../../redux/rootReducer";
import { AppDispatch } from "../../../../../store";
import { ActionButton } from "../../../../../components/shared/ActionButton";
import { ToastContainer } from "../../../../../components/shared/Toast";
import { useCRUD } from "../../../../../hooks/useCRUD";
import FieldTooltip from "../../../../../components/shared/FieldTooltip";
import "./createOrderType.css";

const CreateOrderType = () => {
  // Basic Information
  const [typeName, setTypeName] = useState("");
  const [typeCode, setTypeCode] = useState("");
  const [description, setDescription] = useState("");

  // Numbering Configuration
  const [numberPrefix, setNumberPrefix] = useState("");
  const [numberFormat, setNumberFormat] = useState("PREFIX-{YYYY}-{SEQ}");
  const [sequencePadding, setSequencePadding] = useState(4);

  // Specification Requirements
  const [requiresProductSpec, setRequiresProductSpec] = useState(false);
  const [requiresMaterialSpec, setRequiresMaterialSpec] = useState(false);
  const [allowsProductSpec, setAllowsProductSpec] = useState(true);
  const [allowsMaterialSpec, setAllowsMaterialSpec] = useState(true);

  // Features
  const [enablePrinting, setEnablePrinting] = useState(true);
  const [enableMixing, setEnableMixing] = useState(false);
  const [autoAssignMachine, setAutoAssignMachine] = useState(false);

  // Priority Settings
  const [defaultPriority, setDefaultPriority] = useState("medium");
  const [allowPriorityChange, setAllowPriorityChange] = useState(true);

  // Approval Settings
  const [requiresApproval, setRequiresApproval] = useState(false);
  const [autoApproveBelow, setAutoApproveBelow] = useState("");

  // Validation Rules
  const [minQuantity, setMinQuantity] = useState("");
  const [maxQuantity, setMaxQuantity] = useState("");

  // Global/Default Settings
  const [isGlobal, setIsGlobal] = useState(false);
  const [isDefault, setIsDefault] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const { saveState, handleSave, toast } = useCRUD();

  const { loading } = useSelector(
    (state: RootState) => state.orderTypeCreate || {}
  );

  const handleCreateOrderType = () => {
    // Validation
    if (!typeName.trim() || !typeCode.trim() || !numberPrefix.trim()) {
      toast.error("Validation Error", "Please fill all required fields: Type Name, Type Code, and Number Prefix");
      return;
    }

    // Build validation rules
    const validationRules: any = {};
    if (minQuantity) validationRules.minQuantity = Number(minQuantity);
    if (maxQuantity) validationRules.maxQuantity = Number(maxQuantity);

    // Build order type data
    const orderTypeData = {
      typeName,
      typeCode: typeCode.toUpperCase(),
      description,
      numberPrefix,
      numberFormat,
      sequencePadding: Number(sequencePadding),
      requiresProductSpec,
      requiresMaterialSpec,
      allowsProductSpec,
      allowsMaterialSpec,
      enablePrinting,
      enableMixing,
      autoAssignMachine,
      defaultPriority,
      allowPriorityChange,
      requiresApproval,
      autoApproveBelow: autoApproveBelow ? Number(autoApproveBelow) : undefined,
      validationRules: Object.keys(validationRules).length > 0 ? validationRules : undefined,
      isGlobal,
      isDefault
    };

    handleSave(
      () => dispatch(createOrderType(orderTypeData)),
      {
        successMessage: "Order type created successfully!",
        onSuccess: () => {
          // Reset form
          setTypeName("");
          setTypeCode("");
          setDescription("");
          setNumberPrefix("");
          setNumberFormat("PREFIX-{YYYY}-{SEQ}");
          setSequencePadding(4);
          setRequiresProductSpec(false);
          setRequiresMaterialSpec(false);
          setAllowsProductSpec(true);
          setAllowsMaterialSpec(true);
          setEnablePrinting(true);
          setEnableMixing(false);
          setAutoAssignMachine(false);
          setDefaultPriority("medium");
          setAllowPriorityChange(true);
          setRequiresApproval(false);
          setAutoApproveBelow("");
          setMinQuantity("");
          setMaxQuantity("");
          setIsGlobal(false);
          setIsDefault(false);
        }
      }
    );
  };

  return (
    <div className="create-order-type-container">
      <div className="form-header">
        <h2 className="form-title">Create Order Type</h2>
        <p className="form-subtitle">Configure a new order type for your manufacturing system</p>
      </div>

      <div className="form-grid">
        {/* Basic Information Section */}
        <div className="form-section">
          <h3 className="section-title">Basic Information</h3>

          <div className="form-row">
            <div className="form-column">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <label className="input-label">Type Name *</label>
                <FieldTooltip
                  content="Enter a descriptive name for this order type (e.g., Sample Order, Production Order, Trial Order)"
                  position="right"
                />
              </div>
              <input
                type="text"
                value={typeName}
                onChange={(e) => setTypeName(e.target.value)}
                className="form-input"
                placeholder="e.g., Sample Order"
                required
              />
            </div>

            <div className="form-column">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <label className="input-label">Type Code *</label>
                <FieldTooltip
                  content="Short code for this order type (e.g., SAMPLE, PROD, TRIAL). Will be converted to uppercase."
                  position="right"
                />
              </div>
              <input
                type="text"
                value={typeCode}
                onChange={(e) => setTypeCode(e.target.value.toUpperCase())}
                className="form-input"
                placeholder="e.g., SAMPLE"
                maxLength={10}
                required
              />
            </div>
          </div>

          <div className="form-column">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <label className="input-label">Description</label>
              <FieldTooltip
                content="Optional description explaining when to use this order type"
                position="right"
              />
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-textarea"
              placeholder="Describe when to use this order type..."
              rows={3}
            />
          </div>
        </div>

        {/* Numbering Configuration Section */}
        <div className="form-section">
          <h3 className="section-title">Order Numbering</h3>

          <div className="form-row">
            <div className="form-column">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <label className="input-label">Number Prefix *</label>
                <FieldTooltip
                  content="Prefix for order numbers (e.g., SAM for Sample orders, PROD for Production)"
                  position="right"
                />
              </div>
              <input
                type="text"
                value={numberPrefix}
                onChange={(e) => setNumberPrefix(e.target.value.toUpperCase())}
                className="form-input"
                placeholder="e.g., SAM"
                maxLength={10}
                required
              />
            </div>

            <div className="form-column">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <label className="input-label">Number Format</label>
                <FieldTooltip
                  title="Format Variables"
                  content="{YYYY} = Year, {MM} = Month, {DD} = Day, {SEQ} = Sequence number"
                  position="right"
                />
              </div>
              <input
                type="text"
                value={numberFormat}
                onChange={(e) => setNumberFormat(e.target.value)}
                className="form-input"
                placeholder="PREFIX-{YYYY}-{SEQ}"
              />
            </div>

            <div className="form-column">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <label className="input-label">Sequence Padding</label>
                <FieldTooltip
                  content="Number of digits for sequence (e.g., 4 = 0001, 0002, etc.)"
                  position="right"
                />
              </div>
              <input
                type="number"
                value={sequencePadding}
                onChange={(e) => setSequencePadding(Number(e.target.value))}
                className="form-input"
                min={1}
                max={10}
              />
            </div>
          </div>

          <div className="format-preview">
            <strong>Preview:</strong> {numberPrefix}-{new Date().getFullYear()}-{String(1).padStart(sequencePadding, '0')}
          </div>
        </div>

        {/* Specification Requirements Section */}
        <div className="form-section">
          <h3 className="section-title">Specification Requirements</h3>

          <div className="checkbox-grid">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={requiresProductSpec}
                onChange={(e) => setRequiresProductSpec(e.target.checked)}
              />
              <span>Requires Product Specification</span>
              <FieldTooltip
                content="Check if this order type MUST have a product specification"
                position="right"
              />
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={requiresMaterialSpec}
                onChange={(e) => setRequiresMaterialSpec(e.target.checked)}
              />
              <span>Requires Material Specification</span>
              <FieldTooltip
                content="Check if this order type MUST have a material specification"
                position="right"
              />
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={allowsProductSpec}
                onChange={(e) => setAllowsProductSpec(e.target.checked)}
              />
              <span>Allows Product Specification</span>
              <FieldTooltip
                content="Check if this order type CAN have a product specification (optional)"
                position="right"
              />
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={allowsMaterialSpec}
                onChange={(e) => setAllowsMaterialSpec(e.target.checked)}
              />
              <span>Allows Material Specification</span>
              <FieldTooltip
                content="Check if this order type CAN have a material specification (optional)"
                position="right"
              />
            </label>
          </div>
        </div>

        {/* Features Section */}
        <div className="form-section">
          <h3 className="section-title">Features</h3>

          <div className="checkbox-grid">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={enablePrinting}
                onChange={(e) => setEnablePrinting(e.target.checked)}
              />
              <span>Enable Printing</span>
              <FieldTooltip
                content="Allow printing options for this order type"
                position="right"
              />
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={enableMixing}
                onChange={(e) => setEnableMixing(e.target.checked)}
              />
              <span>Enable Mixing</span>
              <FieldTooltip
                content="Allow material mixing for this order type"
                position="right"
              />
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={autoAssignMachine}
                onChange={(e) => setAutoAssignMachine(e.target.checked)}
              />
              <span>Auto-Assign Machine</span>
              <FieldTooltip
                content="Automatically assign available machines to orders of this type"
                position="right"
              />
            </label>
          </div>
        </div>

        {/* Priority Settings Section */}
        <div className="form-section">
          <h3 className="section-title">Priority Settings</h3>

          <div className="form-row">
            <div className="form-column">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <label className="input-label">Default Priority</label>
                <FieldTooltip
                  content="Default priority level for new orders of this type"
                  position="right"
                />
              </div>
              <select
                value={defaultPriority}
                onChange={(e) => setDefaultPriority(e.target.value)}
                className="form-select"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div className="form-column">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={allowPriorityChange}
                  onChange={(e) => setAllowPriorityChange(e.target.checked)}
                />
                <span>Allow Priority Change</span>
                <FieldTooltip
                  content="Allow users to change the priority after order creation"
                  position="right"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Approval Settings Section */}
        <div className="form-section">
          <h3 className="section-title">Approval Settings</h3>

          <div className="form-row">
            <div className="form-column">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={requiresApproval}
                  onChange={(e) => setRequiresApproval(e.target.checked)}
                />
                <span>Requires Approval</span>
                <FieldTooltip
                  content="Orders of this type need approval before processing"
                  position="right"
                />
              </label>
            </div>

            {requiresApproval && (
              <div className="form-column">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <label className="input-label">Auto-Approve Below Quantity</label>
                  <FieldTooltip
                    content="Automatically approve orders below this quantity (optional)"
                    position="right"
                  />
                </div>
                <input
                  type="number"
                  value={autoApproveBelow}
                  onChange={(e) => setAutoApproveBelow(e.target.value)}
                  className="form-input"
                  placeholder="e.g., 100"
                  min={1}
                />
              </div>
            )}
          </div>
        </div>

        {/* Validation Rules Section */}
        <div className="form-section">
          <h3 className="section-title">Quantity Validation</h3>

          <div className="form-row">
            <div className="form-column">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <label className="input-label">Minimum Quantity</label>
                <FieldTooltip
                  content="Minimum allowed quantity for orders of this type (optional)"
                  position="right"
                />
              </div>
              <input
                type="number"
                value={minQuantity}
                onChange={(e) => setMinQuantity(e.target.value)}
                className="form-input"
                placeholder="e.g., 100"
                min={1}
              />
            </div>

            <div className="form-column">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <label className="input-label">Maximum Quantity</label>
                <FieldTooltip
                  content="Maximum allowed quantity for orders of this type (optional)"
                  position="right"
                />
              </div>
              <input
                type="number"
                value={maxQuantity}
                onChange={(e) => setMaxQuantity(e.target.value)}
                className="form-input"
                placeholder="e.g., 10000"
                min={1}
              />
            </div>
          </div>
        </div>

        {/* Global/Default Settings Section */}
        <div className="form-section">
          <h3 className="section-title">Advanced Settings</h3>

          <div className="checkbox-grid">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={isGlobal}
                onChange={(e) => setIsGlobal(e.target.checked)}
              />
              <span>Global Order Type</span>
              <FieldTooltip
                content="Make this order type available across all branches"
                position="right"
              />
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
              />
              <span>Set as Default</span>
              <FieldTooltip
                content="Make this the default order type when creating new orders"
                position="right"
              />
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <div className="form-actions">
          <ActionButton
            type="save"
            state={saveState}
            onClick={handleCreateOrderType}
            className="create-button"
            disabled={!typeName.trim() || !typeCode.trim() || !numberPrefix.trim()}
          >
            Create Order Type
          </ActionButton>
        </div>
      </div>

      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
    </div>
  );
};

export default CreateOrderType;
