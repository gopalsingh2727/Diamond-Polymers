import React from "react";
import { Image as ImageIcon, Check, X } from 'lucide-react';

interface OrderOption {
  optionId?: string;
  optionTypeId?: string;
  optionType?: string | { _id: string; name: string };
  optionSpecId?: string;
  optionSpec?: string | { _id: string; name: string };
  optionName: string;
  optionCode?: string;
  category?: string;
  quantity?: number;
  specificationValues?: any[];
}

interface MachineTableSummary {
  machineId: string;
  machineName?: string;
  totals?: Record<string, number>;
  progress?: number;
  isComplete?: boolean;
}

// Display Item from template config
interface DisplayItemConfig {
  id: string;
  label: string;
  displayType: 'text' | 'number' | 'formula' | 'boolean' | 'image';
  sourceType: 'optionSpec' | 'order' | 'customer' | 'formula';
  optionTypeId?: string;
  optionTypeName?: string;
  optionSpecId?: string;
  optionSpecName?: string;
  specField?: string;
  unit?: string;
  formula?: {
    expression: string;
    dependencies: string[];
  };
  sourceField?: string;
  order: number;
  isVisible: boolean;
}

interface OrderDetailSectionProps {
  tableData: any;
  order: any;
  template?: {
    displayItems?: DisplayItemConfig[];
    customerFields?: {
      showName?: boolean;
      showAlias?: boolean;
      showAddress?: boolean;
      showOrderId?: boolean;
      showOrderDate?: boolean;
      showImage?: boolean;
      showPhone?: boolean;
      showEmail?: boolean;
      showQuantity?: boolean;
      showInstructions?: boolean;
    };
  };
}

const OrderDetailSection: React.FC<OrderDetailSectionProps> = ({ tableData, order, template }) => {
  // Get options from tableData or order
  const options: OrderOption[] = tableData?.options || order?.options || [];

  // Get previous machines data for step-to-step flow
  const previousMachines: MachineTableSummary[] = tableData?.previousMachines || [];

  // Get display items from template
  const displayItems: DisplayItemConfig[] = template?.displayItems?.filter(item => item.isVisible) || [];

  // Format spec value for display
  const formatSpecValue = (spec: any): string => {
    if (!spec) return '-';

    const value = typeof spec === 'object' ? spec.value : spec;
    const unit = typeof spec === 'object' ? spec.unit : '';

    if (value === null || value === undefined || value === '') return '-';

    if (typeof value === 'number') {
      return unit ? `${value.toLocaleString()} ${unit}` : value.toLocaleString();
    }

    return unit ? `${value} ${unit}` : String(value);
  };

  // Get display item value from order data
  const getDisplayItemValue = (item: DisplayItemConfig): any => {
    if (item.sourceType === 'optionSpec') {
      // Find matching option in order
      const matchingOption = options.find((opt: OrderOption) => {
        const optTypeId = typeof opt.optionType === 'object' ? opt.optionType._id : opt.optionType;
        const optSpecId = typeof opt.optionSpec === 'object' ? opt.optionSpec._id : opt.optionSpec;
        return optTypeId === item.optionTypeId ||
               opt.optionTypeId === item.optionTypeId ||
               optSpecId === item.optionSpecId ||
               opt.optionSpecId === item.optionSpecId;
      });

      if (!matchingOption) return null;

      // If specField is specified, find that specific value
      if (item.specField && matchingOption.specificationValues) {
        const specValue = matchingOption.specificationValues.find(
          (sv: any) => sv.name === item.specField || sv.specName === item.specField
        );
        return specValue?.value ?? specValue ?? null;
      }

      return matchingOption.optionName;
    }

    if (item.sourceType === 'order') {
      const field = item.sourceField?.replace('order.', '');
      if (!field) return null;
      return order?.[field] ?? null;
    }

    if (item.sourceType === 'customer') {
      const field = item.sourceField?.replace('customer.', '');
      if (!field) return null;
      const customer = order?.customerId || order?.customer;
      return customer?.[field] ?? null;
    }

    if (item.sourceType === 'formula' && item.formula) {
      // Simple formula evaluation (for display purposes)
      // In production, you'd want a proper formula evaluator
      return `[Formula: ${item.formula.expression}]`;
    }

    return null;
  };

  // Render display item value based on type
  const renderDisplayItemValue = (item: DisplayItemConfig, value: any) => {
    if (value === null || value === undefined) {
      return <span className="orderDetailDisplayValue empty">-</span>;
    }

    switch (item.displayType) {
      case 'boolean':
        return (
          <span className={`orderDetailDisplayValue boolean ${value ? 'yes' : 'no'}`}>
            {value ? <Check size={16} /> : <X size={16} />}
            {value ? 'Yes' : 'No'}
          </span>
        );

      case 'image':
        return value ? (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="orderDetailDisplayValue image"
          >
            <ImageIcon size={16} />
            View Image
          </a>
        ) : (
          <span className="orderDetailDisplayValue empty">No Image</span>
        );

      case 'number':
        const numValue = typeof value === 'number' ? value.toLocaleString() : value;
        return (
          <span className="orderDetailDisplayValue number">
            {numValue}
            {item.unit && <span className="unit">{item.unit}</span>}
          </span>
        );

      case 'formula':
        return (
          <span className="orderDetailDisplayValue formula">
            {value}
            {item.unit && <span className="unit">{item.unit}</span>}
          </span>
        );

      default:
        return (
          <span className="orderDetailDisplayValue text">
            {String(value)}
            {item.unit && <span className="unit">{item.unit}</span>}
          </span>
        );
    }
  };

  // Check if there's anything to display
  const hasOptions = options.length > 0;
  const hasPreviousMachines = previousMachines.length > 0;
  const hasDisplayItems = displayItems.length > 0;

  if (!hasOptions && !hasPreviousMachines && !hasDisplayItems) {
    return null;
  }

  return (
    <div className="orderDetailSection">
      {/* Dynamic Display Items from Template */}
      {hasDisplayItems && (
        <div className="orderDetailCard orderDetailDisplayItems">
          <h4 className="orderDetailCardTitle">Specifications</h4>
          <div className="orderDetailDisplayGrid">
            {displayItems.map((item) => {
              const value = getDisplayItemValue(item);
              return (
                <div key={item.id} className="orderDetailDisplayItem">
                  <span className="orderDetailDisplayLabel">{item.label}:</span>
                  {renderDisplayItemValue(item, value)}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Order Options - Display all options directly (only if no custom display items) */}
      {hasOptions && !hasDisplayItems && (
        <div className="orderDetailCard">
          <h4 className="orderDetailCardTitle">Order Options</h4>
          {options.map((opt, idx) => (
            <div key={idx} className="orderDetailSpecGroup">
              <div className="orderDetailSpecHeader">
                <span className="orderDetailSpecName">{opt.optionName}</span>
                {opt.optionCode && (
                  <span className="orderDetailSpecCode">{opt.optionCode}</span>
                )}
                {opt.quantity && (
                  <span className="orderDetailSpecQty">Qty: {opt.quantity}</span>
                )}
              </div>
              {opt.specificationValues && opt.specificationValues.length > 0 && (
                <div className="orderDetailSpecValues">
                  {opt.specificationValues.map((spec: any, specIdx: number) => (
                    <div key={specIdx} className="orderDetailSpecItem">
                      <span className="orderDetailSpecLabel">{spec.name}:</span>
                      <span className="orderDetailSpecValue">
                        {formatSpecValue(spec)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Previous Machines Data - Step-to-Step Flow */}
      {hasPreviousMachines && (
        <div className="orderDetailCard orderDetailPreviousMachines">
          <h4 className="orderDetailCardTitle">Previous Machines Data</h4>
          {previousMachines.map((machine, idx) => (
            <div key={idx} className="orderDetailMachineItem">
              <div className="orderDetailMachineHeader">
                <span className="orderDetailMachineName">
                  {machine.machineName || `Machine ${idx + 1}`}
                </span>
                <span className={`orderDetailMachineStatus ${machine.isComplete ? 'complete' : ''}`}>
                  {machine.isComplete ? 'Complete' : `${machine.progress || 0}%`}
                </span>
              </div>
              {machine.totals && Object.keys(machine.totals).length > 0 && (
                <div className="orderDetailMachineTotals">
                  {Object.entries(machine.totals).map(([key, value]) => (
                    <div key={key} className="orderDetailTotalItem">
                      <span className="orderDetailTotalLabel">{key}:</span>
                      <span className="orderDetailTotalValue">
                        {typeof value === 'number' ? value.toLocaleString() : value}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderDetailSection;
