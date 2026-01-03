import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
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
  onSelectionComplete?: () => void; // Called after selection is made (for Tab/Enter to next field)
  onFocus?: () => void; // Called when field receives focus
  onSpaceBack?: () => void; // Called when Space is pressed on empty field
}

export interface SearchableSelectHandle {
  focus: () => void;
  blur: () => void;
  open: () => void;
  close: () => void;
}

const SearchableSelect = forwardRef<SearchableSelectHandle, SearchableSelectProps>(({
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
  error,
  onSelectionComplete,
  onFocus,
  onSpaceBack
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current?.focus();
    },
    blur: () => {
      inputRef.current?.blur();
    },
    open: () => {
      if (!disabled && !loading) {
        setIsOpen(true);
        setSearchTerm("");
      }
    },
    close: () => {
      setIsOpen(false);
      setSearchTerm("");
    }
  }));

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
      onFocus?.();
    }
  };

  const handleInputFocus = () => {
    onFocus?.();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setIsOpen(true);
  };

  const handleOptionClick = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm("");

    // Notify parent that selection is complete (for auto-progression)
    setTimeout(() => {
      onSelectionComplete?.();
    }, 100);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled || loading) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setHighlightedIndex(prev =>
            prev < filteredOptions.length - 1 ? prev + 1 : prev
          );
        }
        break;

      case "ArrowUp":
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setHighlightedIndex(prev => (prev > 0 ? prev - 1 : prev));
        }
        break;

      case "ArrowRight":
        // Move to next field
        if (!isOpen && value) {
          e.preventDefault();
          onSelectionComplete?.();
        }
        break;

      case "ArrowLeft":
        // Move to previous field
        if (!isOpen && value) {
          e.preventDefault();
          onSpaceBack?.();
        }
        break;

      case "Enter":
        e.preventDefault();
        if (isOpen && filteredOptions[highlightedIndex]) {
          // Select highlighted option
          handleOptionClick(filteredOptions[highlightedIndex].value);
        } else if (isOpen && filteredOptions.length === 0) {
          // No options - close popup
          setIsOpen(false);
          setSearchTerm("");
        } else if (!isOpen && value) {
          // Already has value - move to next field
          onSelectionComplete?.();
        } else {
          // Open dropdown
          setIsOpen(true);
        }
        break;

      case "Tab":
        // Allow default Tab behavior, but close dropdown and trigger completion
        if (isOpen) {
          // If dropdown is open and there's a highlighted option, select it
          if (filteredOptions[highlightedIndex]) {
            e.preventDefault();
            handleOptionClick(filteredOptions[highlightedIndex].value);
          } else {
            setIsOpen(false);
            setSearchTerm("");
          }
        } else if (value) {
          // If has value and dropdown closed, let Tab move to next field
          // Don't prevent default - let browser handle Tab
          onSelectionComplete?.();
        }
        break;

      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        setSearchTerm("");
        break;

      case " ": // Space key
        // If field is empty or showing placeholder, go back
        if (!isOpen && !value) {
          e.preventDefault();
          onSpaceBack?.();
        } else if (isOpen && searchTerm === "") {
          // If dropdown is open but search is empty, close and go back
          e.preventDefault();
          setIsOpen(false);
          onSpaceBack?.();
        }
        // Otherwise, let space work normally for typing
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
          onFocus={handleInputFocus}
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
});

SearchableSelect.displayName = 'SearchableSelect';

export default SearchableSelect;
