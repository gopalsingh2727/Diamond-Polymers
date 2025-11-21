import { useEffect } from "react";

interface OrderTypeSelectProps {
  value: string;
  onChange: (value: string) => void;
  initialValue?: string;
  orderTypes?: any[];
  loading?: boolean;
}

const OrderTypeSelect: React.FC<OrderTypeSelectProps> = ({
  value,
  onChange,
  initialValue,
  orderTypes = [],
  loading = false
}) => {

  // Set initial value in edit mode
  useEffect(() => {
    if (initialValue && !value) {
      onChange(initialValue);
    }
  }, [initialValue, value, onChange]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="SeleteType">
      <label htmlFor="orderTypeDropdown">Order Type:</label>
      <select
        id="orderTypeDropdown"
        value={value}
        onChange={handleChange}
        disabled={loading}
      >
        <option value="">-- Select Order Type --</option>
        {orderTypes.map((type: any) => (
          <option key={type._id} value={type._id}>
            {type.typeName} {type.typeCode ? `(${type.typeCode})` : ''}
          </option>
        ))}
      </select>
      {/* Hidden input for DOM collection */}
      <input type="hidden" name="orderTypeId" value={value} />
      {loading && <p style={{ fontSize: '12px', color: '#666' }}>Loading order types...</p>}
    </div>
  );
};

export default OrderTypeSelect;
