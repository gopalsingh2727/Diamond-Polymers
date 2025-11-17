import { useState, useEffect, useRef } from "react";
import "./SearchableSelect.css";

interface Option {
  value: string;
  label: string;
  description?: string;
  isDefault?: boolean;
}

interface SearchableSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  showHint?: boolean;
  error?: string;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  label,
  required = false,
  disabled = false,
  loading = false,
  className = "",
  showHint = true,
  error
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get selected option
  const selectedOption = options.find(opt => opt.value === value);

  // Filter options based on search term
  const filteredOptions = searchTerm === "*" || searchTerm.trim() === ""
    ? options
    : options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        option.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reset highlighted index when filtered options change
  useEffect(() => {
    setHighlightedIndex(0);
  }, [filteredOptions]);

  const handleInputClick = () => {
    if (!disabled && !loading) {
      setIsOpen(true);
      setSearchTerm("");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setIsOpen(true);
  };

  const handleOptionClick = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled || loading) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex(prev => (prev > 0 ? prev - 1 : prev));
        break;
      case "Enter":
        e.preventDefault();
        if (isOpen && filteredOptions[highlightedIndex]) {
          handleOptionClick(filteredOptions[highlightedIndex].value);
        } else {
          setIsOpen(true);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        setSearchTerm("");
        break;
    }
  };

  const displayValue = isOpen
    ? searchTerm
    : selectedOption
    ? selectedOption.label
    : "";

  return (
    <div className={`searchable-select-container ${className}`} ref={containerRef}>
      {label && (
        <label className="searchable-select-label">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="searchable-select-input-wrapper">
        <input
          ref={inputRef}
          type="text"
          className={`searchable-select-input ${isOpen ? "open" : ""} ${error ? "error" : ""}`}
          value={displayValue}
          onChange={handleInputChange}
          onClick={handleInputClick}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || loading}
          autoComplete="off"
        />

        <div className="searchable-select-icons">
          {loading && (
            <span className="searchable-select-loader">⏳</span>
          )}
          <span className={`searchable-select-arrow ${isOpen ? "open" : ""}`}>
            ▼
          </span>
        </div>
      </div>

      {showHint && isOpen && !loading && (
        <div className="searchable-select-hint">
          💡 Type * to see all items
        </div>
      )}

      {error && (
        <div className="searchable-select-error">
          {error}
        </div>
      )}

      {isOpen && !loading && (
        <div className="searchable-select-dropdown">
          {filteredOptions.length === 0 ? (
            <div className="searchable-select-no-results">
              No results found
            </div>
          ) : (
            filteredOptions.map((option, index) => (
              <div
                key={option.value}
                className={`searchable-select-option ${
                  index === highlightedIndex ? "highlighted" : ""
                } ${option.value === value ? "selected" : ""}`}
                onClick={() => handleOptionClick(option.value)}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                <div className="searchable-select-option-label">
                  {option.label}
                  {option.isDefault && (
                    <span className="searchable-select-badge default">Default</span>
                  )}
                </div>
                {option.description && (
                  <div className="searchable-select-option-description">
                    {option.description}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
