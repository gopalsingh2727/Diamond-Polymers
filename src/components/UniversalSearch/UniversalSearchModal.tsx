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

  // Log component mount
  useEffect(() => {
    console.log('🔍 Universal Search: Component mounted');
    return () => console.log('🔍 Universal Search: Component unmounted');
  }, []);

  // Log search results changes
  useEffect(() => {
    console.log('🔍 Universal Search: Results updated:', results.length, 'items');
    console.log('🔍 Universal Search: Grouped results:', grouped);
  }, [results, grouped]);

  // Debounce search input for performance
  const debouncedSetSearch = useCallback(
    debounce((value: string) => {
      setDebouncedSearchTerm(value);
    }, 300),
    []
  );

  // Handle search input change
  const handleSearchChange = (value: string) => {
    console.log('🔍 Universal Search: Input changed:', value);
    setSearchTerm(value);
    debouncedSetSearch(value);
  };

  // Handle result selection
  const handleSelect = (result: any) => {
    console.log('🔍 Universal Search: Opening result:', result.type, result.title);

    // For orders, navigate to the order form with the order data
    if (result.type === 'order') {
      console.log('🔍 Universal Search: Navigating to order form with order data:', result.data);
      navigate('/menu/orderform', {
        state: {
          isEdit: true,
          orderData: result.data,
          isEditMode: true,
          editMode: true,
          mode: 'edit',
          orderId: result.data.orderId || result.data._id,
          customerName: result.data.customer?.companyName || result.data.customerId?.companyName
        }
      });
    } else {
      // For other entities, just navigate to the route
      console.log('🔍 Universal Search: Navigating to route:', result.route);
      navigate(result.route);
    }

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
        console.log('🔍 Universal Search: Toggling modal via keyboard shortcut');
        setIsOpen(prev => {
          console.log('🔍 Universal Search: Modal state changing from', prev, 'to', !prev);
          return !prev;
        });
      }

      // Escape to close
      if (e.key === 'Escape' && isOpen) {
        console.log('🔍 Universal Search: Closing modal via ESC key');
        handleClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    console.log('🔍 Universal Search: Keyboard listener attached');
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      console.log('🔍 Universal Search: Keyboard listener removed');
    };
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
                      onSelect={() => handleSelect(result)}
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

/**
 * Universal Search Trigger Button
 * Can be placed in navbar or toolbar to open search modal
 */
export const UniversalSearchTrigger: React.FC<{ className?: string }> = ({ className = '' }) => {
  const handleClick = () => {
    console.log('🔍 Universal Search: Trigger button clicked');
    // Dispatch a keyboard event to trigger the modal
    const event = new KeyboardEvent('keydown', {
      key: 'k',
      ctrlKey: true,
      bubbles: true,
      cancelable: true
    });
    document.dispatchEvent(event);
  };

  return (
    <button
      onClick={handleClick}
      className={`universal-search-trigger ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 16px',
        background: 'linear-gradient(135deg, #FF6B35 0%, #E55A2B 100%)',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: 600,
        transition: 'all 0.2s ease',
        boxShadow: '0 2px 8px rgba(255, 107, 53, 0.25)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(255, 107, 53, 0.35)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(255, 107, 53, 0.25)';
      }}
    >
      <Search size={16} />
      <span>Search</span>
      <kbd style={{
        padding: '2px 6px',
        background: 'rgba(255, 255, 255, 0.2)',
        borderRadius: '4px',
        fontSize: '11px',
        fontFamily: 'monospace'
      }}>
        Ctrl+K
      </kbd>
    </button>
  );
};

export default UniversalSearchModal;
