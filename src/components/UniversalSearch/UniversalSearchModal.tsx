import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Command } from 'cmdk';
import {
  Search,
  ShoppingCart,
  Factory,
  Cog,
  User,
  Users,
  Package,
  Boxes,
  ArrowRight,
  Command as CommandIcon
} from 'lucide-react';
import { useGroupedSearchResults } from './useUniversalSearch';
import { SEARCH_CONFIG, SEARCH_SHORTCUT } from './searchConfig';
import { debounce } from '../../componest/Utils/searchUtils';
import './UniversalSearchModal.css';

// Icon mapping for entity types
const ICON_MAP: Record<string, React.ReactNode> = {
  order: <ShoppingCart size={18} />,
  machine: <Factory size={18} />,
  machineType: <Cog size={18} />,
  operator: <User size={18} />,
  customer: <Users size={18} />,
  product: <Package size={18} />,
  material: <Boxes size={18} />
};

/**
 * Universal Search Modal Component
 * Provides a command palette-style search interface with Cmd+K / Ctrl+K shortcut
 */
export const UniversalSearchModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  const navigate = useNavigate();
  const { results, grouped } = useGroupedSearchResults(debouncedSearchTerm);

  // Debounce search input for performance
  const debouncedSetSearch = useCallback(
    debounce((value: string) => {
      setDebouncedSearchTerm(value);
    }, 300),
    []
  );

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    debouncedSetSearch(value);
  };

  // Handle result selection
  const handleSelect = (route: string) => {
    navigate(route);
    setIsOpen(false);
    setSearchTerm('');
    setDebouncedSearchTerm('');
  };

  // Handle modal close
  const handleClose = () => {
    setIsOpen(false);
    setSearchTerm('');
    setDebouncedSearchTerm('');
  };

  // Global keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K (Mac) or Ctrl+K (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && e.key === SEARCH_SHORTCUT.key) {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }

      // Escape to close
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="universal-search-backdrop" onClick={handleClose}>
      <div className="universal-search-container" onClick={(e) => e.stopPropagation()}>
        <Command className="universal-search-command" shouldFilter={false}>
          {/* Search Input */}
          <div className="universal-search-input-wrapper">
            <Search className="universal-search-icon" size={20} />
            <Command.Input
              value={searchTerm}
              onValueChange={handleSearchChange}
              placeholder="Search orders, machines, operators, and more..."
              className="universal-search-input"
              autoFocus
            />
            <div className="universal-search-shortcut-hint">
              <kbd className="universal-search-kbd">ESC</kbd>
            </div>
          </div>

          {/* Results List */}
          <Command.List className="universal-search-list">
            {/* Empty State */}
            {searchTerm.trim().length === 0 && (
              <div className="universal-search-empty">
                <CommandIcon size={48} className="universal-search-empty-icon" />
                <p className="universal-search-empty-title">Universal Search</p>
                <p className="universal-search-empty-subtitle">
                  Search across orders, machines, operators, and more
                </p>
                <div className="universal-search-shortcut-badge">
                  <kbd>{SEARCH_SHORTCUT.mac}</kbd> to toggle
                </div>
              </div>
            )}

            {/* No Results State */}
            {searchTerm.trim().length > 0 && results.length === 0 && (
              <Command.Empty className="universal-search-empty">
                <Search size={48} className="universal-search-empty-icon" />
                <p className="universal-search-empty-title">No results found</p>
                <p className="universal-search-empty-subtitle">
                  Try searching with different keywords
                </p>
              </Command.Empty>
            )}

            {/* Results Grouped by Type */}
            {Object.entries(grouped).map(([type, items]) => {
              const config = SEARCH_CONFIG.find(c => c.type === type);
              if (!config || items.length === 0) return null;

              return (
                <Command.Group key={type} heading={config.label} className="universal-search-group">
                  {items.map((result) => (
                    <Command.Item
                      key={result.id}
                      value={`${result.type}-${result.id}-${result.title}`}
                      onSelect={() => handleSelect(result.route)}
                      className="universal-search-item"
                    >
                      <div className="universal-search-item-icon">
                        {ICON_MAP[result.type]}
                      </div>
                      <div className="universal-search-item-content">
                        <div className="universal-search-item-title">
                          {result.title}
                        </div>
                        {result.subtitle && (
                          <div className="universal-search-item-subtitle">
                            {result.subtitle}
                          </div>
                        )}
                        {result.description && (
                          <div className="universal-search-item-description">
                            {result.description}
                          </div>
                        )}
                      </div>
                      <div className="universal-search-item-arrow">
                        <ArrowRight size={16} />
                      </div>
                    </Command.Item>
                  ))}
                </Command.Group>
              );
            })}
          </Command.List>

          {/* Footer */}
          {results.length > 0 && (
            <div className="universal-search-footer">
              <div className="universal-search-footer-hint">
                <kbd className="universal-search-kbd">↑↓</kbd> to navigate
                <kbd className="universal-search-kbd">↵</kbd> to select
                <kbd className="universal-search-kbd">ESC</kbd> to close
              </div>
              <div className="universal-search-footer-count">
                {results.length} result{results.length !== 1 ? 's' : ''}
              </div>
            </div>
          )}
        </Command>
      </div>
    </div>
  );
};

export default UniversalSearchModal;
