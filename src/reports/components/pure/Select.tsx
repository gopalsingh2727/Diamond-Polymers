/**
 * Pure CSS Select Component - No Tailwind, No ShadCN
 */

import { ReactNode, useState, useRef, useEffect } from 'react';

interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  children: ReactNode;
  disabled?: boolean;
}

export function Select({ value, onValueChange, children, disabled = false }: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSelect = (selectedValue: string) => {
    onValueChange(selectedValue);
    setIsOpen(false);
  };

  return (
    <SelectContext.Provider value={{ value, onValueChange: handleSelect, isOpen, setIsOpen, disabled }}>
      <div className="select-container" ref={containerRef}>
        {children}
      </div>
    </SelectContext.Provider>
  );
}

// Context for sharing state
import { createContext, useContext } from 'react';

interface SelectContextType {
  value: string;
  onValueChange: (value: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  disabled: boolean;
}

const SelectContext = createContext<SelectContextType | null>(null);

const useSelectContext = () => {
  const context = useContext(SelectContext);
  if (!context) {
    throw new Error('Select components must be used within Select');
  }
  return context;
};

interface SelectTriggerProps {
  children: ReactNode;
  className?: string;
}

export function SelectTrigger({ children, className = '' }: SelectTriggerProps) {
  const { isOpen, setIsOpen, disabled } = useSelectContext();

  return (
    <button
      className={`form-select ${className}`}
      onClick={() => !disabled && setIsOpen(!isOpen)}
      disabled={disabled}
      type="button"
    >
      {children}
      <span className="select-arrow">{isOpen ? '▲' : '▼'}</span>
    </button>
  );
}

interface SelectValueProps {
  children?: ReactNode;
  placeholder?: string;
}

export function SelectValue({ children, placeholder }: SelectValueProps) {
  return <span className="select-value">{children || placeholder || 'Select...'}</span>;
}

interface SelectContentProps {
  children: ReactNode;
}

export function SelectContent({ children }: SelectContentProps) {
  const { isOpen } = useSelectContext();
  
  if (!isOpen) return null;

  return (
    <div className="select-dropdown">
      {children}
    </div>
  );
}

interface SelectItemProps {
  value: string;
  children: ReactNode;
}

export function SelectItem({ value, children }: SelectItemProps) {
  const { value: selectedValue, onValueChange } = useSelectContext();
  const isSelected = selectedValue === value;

  return (
    <div
      className={`select-item ${isSelected ? 'selected' : ''}`}
      onClick={() => onValueChange(value)}
    >
      {children}
    </div>
  );
}
