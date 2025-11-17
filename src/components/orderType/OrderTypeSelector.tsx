import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../componest/redux/rootReducer";
import { AppDispatch } from "../../store";
import { getOrderTypes } from "../../componest/redux/create/orderType/orderTypeActions";

interface OrderTypeSelectorProps {
  value: string;
  onChange: (orderTypeId: string) => void;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  label?: string;
  showDescription?: boolean;
}

const OrderTypeSelector: React.FC<OrderTypeSelectorProps> = ({
  value,
  onChange,
  required = false,
  disabled = false,
  className = "",
  label = "Order Type",
  showDescription = false
}) => {
  const dispatch = useDispatch<AppDispatch>();

  // Get order types from Redux store
  const { orderTypes, loading, error } = useSelector(
    (state: RootState) => state.orderTypeList
  );

  // Fetch order types on mount
  useEffect(() => {
    if (!orderTypes || orderTypes.length === 0) {
      dispatch(getOrderTypes());
    }
  }, [dispatch, orderTypes]);

  // Get active order types only
  const activeOrderTypes = orderTypes?.filter((type: any) => type.isActive) || [];

  // Sort: default first, then by name
  const sortedOrderTypes = [...activeOrderTypes].sort((a: any, b: any) => {
    if (a.isDefault && !b.isDefault) return -1;
    if (!a.isDefault && b.isDefault) return 1;
    return a.typeName.localeCompare(b.typeName);
  });

  // Find selected order type for description
  const selectedOrderType = sortedOrderTypes.find((type: any) => type._id === value);

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        disabled={disabled || loading}
        className={`
          w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          disabled:bg-gray-100 disabled:cursor-not-allowed
          ${className}
        `}
      >
        <option value="">
          {loading ? "Loading order types..." : "Select order type"}
        </option>

        {sortedOrderTypes.map((type: any) => (
          <option key={type._id} value={type._id}>
            {type.typeName} ({type.typeCode})
            {type.isDefault && " - Default"}
          </option>
        ))}
      </select>

      {error && (
        <p className="mt-1 text-sm text-red-600">
          Failed to load order types: {error}
        </p>
      )}

      {showDescription && selectedOrderType && selectedOrderType.description && (
        <p className="mt-1 text-sm text-gray-600">
          {selectedOrderType.description}
        </p>
      )}

      {selectedOrderType && (
        <div className="mt-2 text-xs text-gray-500">
          {selectedOrderType.requiresProductSpec && (
            <span className="mr-3">
              Requires Product Spec
            </span>
          )}
          {selectedOrderType.requiresMaterialSpec && (
            <span className="mr-3">
              Requires Material Spec
            </span>
          )}
          {selectedOrderType.enablePrinting && (
            <span className="mr-3">
              Printing enabled
            </span>
          )}
          {selectedOrderType.enableMixing && (
            <span>
              Mixing enabled
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default OrderTypeSelector;
