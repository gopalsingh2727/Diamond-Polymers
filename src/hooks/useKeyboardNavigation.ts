import { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export interface KeyboardNavigationField {
  id: string;
  ref: React.RefObject<any>;
  onEnter?: () => void;
  onSpace?: () => void;
  isEnabled?: boolean;
  nextFieldId?: string; // Explicit next field override
}

interface UseKeyboardNavigationOptions {
  onSave?: () => void;
  onPrint?: () => void;
  onBack?: () => void;
  enableGlobalShortcuts?: boolean;
  fields?: KeyboardNavigationField[];
}

export const useKeyboardNavigation = ({
  onSave,
  onPrint,
  onBack,
  enableGlobalShortcuts = true,
  fields = []
}: UseKeyboardNavigationOptions = {}) => {
  const fieldsRef = useRef<KeyboardNavigationField[]>(fields);
  const currentFieldIndexRef = useRef<number>(-1);
  const navigate = useNavigate();

  // Update fields ref when fields change
  useEffect(() => {
    fieldsRef.current = fields.filter(f => f.isEnabled !== false);
  }, [fields]);

  // Focus next field
  const focusNextField = useCallback(() => {
    const enabledFields = fieldsRef.current.filter(f => f.isEnabled !== false);
    if (enabledFields.length === 0) return;

    const currentIndex = currentFieldIndexRef.current;
    const currentField = enabledFields[currentIndex];

    // Check if current field has explicit next field
    if (currentField?.nextFieldId) {
      const nextField = enabledFields.find(f => f.id === currentField.nextFieldId);
      if (nextField?.ref.current) {
        const nextIndex = enabledFields.indexOf(nextField);
        currentFieldIndexRef.current = nextIndex;

        // Focus the next field
        if (nextField.ref.current.focus) {
          nextField.ref.current.focus();
        } else if (nextField.ref.current.click) {
          nextField.ref.current.click();
        }
        return;
      }
    }

    // Default: go to next in sequence
    const nextIndex = currentIndex + 1;
    if (nextIndex < enabledFields.length) {
      currentFieldIndexRef.current = nextIndex;
      const nextField = enabledFields[nextIndex];

      if (nextField.ref.current) {
        if (nextField.ref.current.focus) {
          nextField.ref.current.focus();
        } else if (nextField.ref.current.click) {
          nextField.ref.current.click();
        }
      }
    }
  }, []);

  // Focus previous field
  const focusPreviousField = useCallback(() => {
    const enabledFields = fieldsRef.current.filter(f => f.isEnabled !== false);
    if (enabledFields.length === 0) return;

    const currentIndex = currentFieldIndexRef.current;
    const prevIndex = currentIndex - 1;

    if (prevIndex >= 0) {
      currentFieldIndexRef.current = prevIndex;
      const prevField = enabledFields[prevIndex];

      if (prevField.ref.current) {
        if (prevField.ref.current.focus) {
          prevField.ref.current.focus();
        } else if (prevField.ref.current.click) {
          prevField.ref.current.click();
        }
      }
    }
  }, []);

  // Focus specific field by ID
  const focusField = useCallback((fieldId: string) => {
    const enabledFields = fieldsRef.current.filter(f => f.isEnabled !== false);
    const fieldIndex = enabledFields.findIndex(f => f.id === fieldId);

    if (fieldIndex >= 0) {
      currentFieldIndexRef.current = fieldIndex;
      const field = enabledFields[fieldIndex];

      if (field.ref.current) {
        if (field.ref.current.focus) {
          field.ref.current.focus();
        } else if (field.ref.current.click) {
          field.ref.current.click();
        }
      }
    }
  }, []);

  // Get current field ID
  const getCurrentFieldId = useCallback(() => {
    const enabledFields = fieldsRef.current.filter(f => f.isEnabled !== false);
    const currentIndex = currentFieldIndexRef.current;
    return currentIndex >= 0 && currentIndex < enabledFields.length
      ? enabledFields[currentIndex].id
      : null;
  }, []);

  // Set current field by ID (useful when user clicks on a field)
  const setCurrentField = useCallback((fieldId: string) => {
    const enabledFields = fieldsRef.current.filter(f => f.isEnabled !== false);
    const fieldIndex = enabledFields.findIndex(f => f.id === fieldId);
    if (fieldIndex >= 0) {
      currentFieldIndexRef.current = fieldIndex;
    }
  }, []);

  // Global keyboard shortcuts
  useEffect(() => {
    if (!enableGlobalShortcuts) return;

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Ctrl+S or Cmd+S - Save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (onSave) {
          onSave();
        }
      }

      // Ctrl+P or Cmd+P - Print
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        if (onPrint) {
          onPrint();
        }
      }

      // ESC - Back
      if (e.key === 'Escape') {
        if (onBack) {
          onBack();
        } else {
          // Default: go to dashboard
          navigate('/dashboard');
        }
      }

      // Space - Go to previous field (only if not in input/textarea)
      if (e.key === ' ') {
        const target = e.target as HTMLElement;
        const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';
        const isSearchable = target.classList.contains('searchable-select-input');

        // Only trigger if not typing in an input field
        if (!isInput || isSearchable) {
          // If in searchable select and it's empty, go back
          if (isSearchable) {
            const inputElement = target as HTMLInputElement;
            if (!inputElement.value || inputElement.value.trim() === '') {
              e.preventDefault();
              focusPreviousField();
            }
          }
        }
      }

      // Tab - Override default tab behavior for custom navigation
      if (e.key === 'Tab' && !e.shiftKey) {
        // Let default Tab work, but we can enhance it
        // e.preventDefault();
        // focusNextField();
      }

      // Shift+Tab - Previous field
      if (e.key === 'Tab' && e.shiftKey) {
        // e.preventDefault();
        // focusPreviousField();
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [enableGlobalShortcuts, onSave, onPrint, onBack, navigate, focusNextField, focusPreviousField]);

  return {
    focusNextField,
    focusPreviousField,
    focusField,
    getCurrentFieldId,
    setCurrentField,
    currentFieldIndex: currentFieldIndexRef.current
  };
};
