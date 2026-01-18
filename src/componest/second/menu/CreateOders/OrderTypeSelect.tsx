import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";

interface OrderTypeSelectProps {
  value: string;
  onChange: (value: string) => void;
  initialValue?: string;
  orderTypes?: any[];
  loading?: boolean;
  disabled?: boolean;
  onOrderTypeSelect?: () => void;
  onBackspace?: () => void;
}

export interface OrderTypeSelectRef {
  focus: () => void;
  isDropdownOpen: () => boolean;
  closeDropdown: () => void;
}

const OrderTypeSelect = forwardRef<OrderTypeSelectRef, OrderTypeSelectProps>(({
  value,
  onChange,
  initialValue,
  orderTypes = [],
  loading = false,
  disabled = false,
  onOrderTypeSelect,
  onBackspace
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  useImperativeHandle(ref, () => ({
    focus: () => {
      containerRef.current?.focus();
    },
    isDropdownOpen: () => isOpen,
    closeDropdown: () => {
      setIsOpen(false);
      setSelectedIndex(-1);
    }
  }));

  useEffect(() => {
    if (initialValue && !value) {
      onChange(initialValue);
    }
  }, [initialValue, value, onChange]);

  // Set selected index when dropdown opens
  useEffect(() => {
    if (isOpen) {
      const currentIndex = orderTypes.findIndex(t => t._id === value);
      setSelectedIndex(currentIndex >= 0 ? currentIndex : 0);
    }
  }, [isOpen, orderTypes, value]);

  // Scroll selected item into view within dropdown only (not page scroll)
  useEffect(() => {
    if (isOpen && listRef.current && selectedIndex >= 0) {
      const items = listRef.current.querySelectorAll('li');
      const selectedItem = items[selectedIndex];
      if (selectedItem && listRef.current) {
        // Scroll within the dropdown container only, not the page
        const container = listRef.current;
        const itemTop = selectedItem.offsetTop;
        const itemBottom = itemTop + selectedItem.offsetHeight;
        const containerTop = container.scrollTop;
        const containerBottom = containerTop + container.offsetHeight;

        if (itemTop < containerTop) {
          container.scrollTop = itemTop;
        } else if (itemBottom > containerBottom) {
          container.scrollTop = itemBottom - container.offsetHeight;
        }
      }
    }
  }, [selectedIndex, isOpen]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (loading) return;

    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          if (selectedIndex >= 0 && selectedIndex < orderTypes.length) {
            onChange(orderTypes[selectedIndex]._id);
            setIsOpen(false);
            if (onOrderTypeSelect) {
              onOrderTypeSelect();
            }
          }
        }
        break;

      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setSelectedIndex(prev => prev < orderTypes.length - 1 ? prev + 1 : 0);
        }
        break;

      case 'ArrowUp':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setSelectedIndex(prev => prev > 0 ? prev - 1 : orderTypes.length - 1);
        }
        break;

      case 'Escape':
        e.preventDefault();
        if (isOpen) {
          e.stopPropagation();
          setIsOpen(false);
        }
        break;

      case 'Backspace':
      case 'Delete':
        e.preventDefault();
        if (onBackspace) {
          onBackspace();
        }
        break;
    }
  };

  const handleItemClick = (typeId: string, index: number) => {
    onChange(typeId);
    setIsOpen(false);
    setSelectedIndex(index);
    if (onOrderTypeSelect) {
      onOrderTypeSelect();
    }
  };

  const getDisplayText = () => {
    if (!value) return '-- Select Order Type --';
    const selected = orderTypes.find(t => t._id === value);
    return selected ? `${selected.typeName}${selected.typeCode ? ` (${selected.typeCode})` : ''}` : '-- Select Order Type --';
  };

  return (
    <div className="SeleteType">
      <label htmlFor="orderTypeDropdown">Order Type:</label>

      <div
        ref={containerRef}
        tabIndex={disabled ? -1 : 0}
        className={`order-type-select ${disabled ? 'disabled' : ''}`}
        onKeyDown={disabled ? undefined : handleKeyDown}
        onClick={() => !loading && !disabled && setIsOpen(!isOpen)}
        onBlur={() => setTimeout(() => setIsOpen(false), 150)}
        style={disabled ? { opacity: 0.7, cursor: 'not-allowed', pointerEvents: 'none' } : undefined}
      >
        <span style={{ flex: 1, color: value ? '#333' : '#999' }}>{getDisplayText()}</span>
        <span className={`arrow ${isOpen ? 'open' : ''}`}>▼</span>
      </div>

      {isOpen && orderTypes.length > 0 && (
        <ul ref={listRef} className="order-type-dropdown">
          {orderTypes.map((type, index) => (
            <li
              key={type._id}
              className={index === selectedIndex ? 'selected' : ''}
              onMouseDown={(e) => {
                e.preventDefault(); // Prevent blur from firing
                handleItemClick(type._id, index);
              }}
            >
              {type.typeName} {type.typeCode ? `(${type.typeCode})` : ''}
            </li>
          ))}
        </ul>
      )}

      <input type="hidden" name="orderTypeId" value={value} />
      {loading && <p style={{ fontSize: '12px', color: '#666' }}>Loading...</p>}
    </div>
  );
});

OrderTypeSelect.displayName = 'OrderTypeSelect';

export default OrderTypeSelect;
