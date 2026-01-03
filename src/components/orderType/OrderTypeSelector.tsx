import { forwardRef } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../componest/redux/rootReducer";
import SearchableSelect, { SearchableSelectHandle } from "../shared/SearchableSelect";

interface OrderTypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  showDescription?: boolean;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  onSelectionComplete?: () => void;
  onFocus?: () => void;
  onSpaceBack?: () => void;
}

const OrderTypeSelector = forwardRef<SearchableSelectHandle, OrderTypeSelectorProps>(({
  value,
  onChange,
  label = "Order Type",
  showDescription = false,
  required = false,
  disabled = false,
  className = "",
  onSelectionComplete,
  onFocus,
  onSpaceBack
}, ref) => {
  // Get order types from cached form data
  const { data: formData, loading } = useSelector(
    (state: RootState) => state.orderFormData || {}
  );
  const orderTypes = formData?.orderTypes || [];

  // Transform order types to SearchableSelect options format
  const options = orderTypes.map((type: any) => ({
    value: type._id,
    label: type.typeName || type.name,
    description: showDescription ? type.description : undefined,
    isDefault: type.isDefault
  }));

  return (
    <SearchableSelect
      ref={ref}
      options={options}
      value={value}
      onChange={onChange}
      label={label}
      placeholder="Select order type"
      required={required}
      disabled={disabled}
      loading={loading}
      className={className}
      showHint={true}
      onSelectionComplete={onSelectionComplete}
      onFocus={onFocus}
      onSpaceBack={onSpaceBack}
    />
  );
});

OrderTypeSelector.displayName = 'OrderTypeSelector';

export default OrderTypeSelector;
