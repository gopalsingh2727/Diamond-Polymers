// GlobalSearch.tsx
import React from 'react';
import { Search, X } from 'lucide-react';


interface GlobalSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({
  searchTerm,
  onSearchChange,
  placeholder = "Search...",
  disabled = false
}) => {
  const handleClear = () => {
    onSearchChange('');
  };

  return (
    <div className="global-search-container">
      <div className="global-search-wrapper">
        <Search className="global-search-icon" size={20} />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className="global-search-input"
          disabled={disabled}
        />
        {searchTerm && (
          <button
            type="button"
            onClick={handleClear}
            className="global-search-clear"
            aria-label="Clear search"
          >
            <X size={18} />
          </button>
        )}
      </div>
      {searchTerm && (
        <div className="global-search-results-count">
          Searching for: "{searchTerm}"
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;