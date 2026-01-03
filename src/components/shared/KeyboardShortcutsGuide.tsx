import { useState, useEffect } from 'react';
import './KeyboardShortcutsGuide.css';

interface KeyboardShortcutsGuideProps {
  context?: 'create-order' | 'edit-order' | 'general';
}

const KeyboardShortcutsGuide: React.FC<KeyboardShortcutsGuideProps> = ({ context = 'general' }) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Press ? or Ctrl+/ to toggle shortcuts guide
      if ((e.key === '?' && !e.shiftKey) || (e.ctrlKey && e.key === '/')) {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isOpen) {
    return (
      <button
        className="keyboard-shortcuts-trigger"
        onClick={() => setIsOpen(true)}
        title="Keyboard Shortcuts (Press ? to open)"
      >
        ⌨️
      </button>
    );
  }

  const globalShortcuts = [
    { keys: ['Ctrl', 'S'], description: 'Save/Submit form', mac: ['⌘', 'S'] },
    { keys: ['Ctrl', 'P'], description: 'Print current page', mac: ['⌘', 'P'] },
    { keys: ['Esc'], description: 'Go back to dashboard', mac: ['Esc'] },
    { keys: ['?'], description: 'Show/hide this shortcuts guide', mac: ['?'] },
  ];

  const navigationShortcuts = [
    { keys: ['Tab'], description: 'Move to next field', mac: ['Tab'] },
    { keys: ['Shift', 'Tab'], description: 'Move to previous field', mac: ['⇧', 'Tab'] },
    { keys: ['Enter'], description: 'Select option and move to next field', mac: ['Enter'] },
    { keys: ['↑', '↓'], description: 'Navigate options in dropdown', mac: ['↑', '↓'] },
    { keys: ['→'], description: 'Move to next field (when field has value)', mac: ['→'] },
    { keys: ['←'], description: 'Move to previous field (when field has value)', mac: ['←'] },
    { keys: ['Space'], description: 'Go back to previous field (when empty)', mac: ['Space'] },
  ];

  const dropdownShortcuts = [
    { keys: ['*'], description: 'Show all options in searchable dropdown', mac: ['*'] },
    { keys: ['↑', '↓'], description: 'Highlight previous/next option', mac: ['↑', '↓'] },
    { keys: ['Enter'], description: 'Select highlighted option', mac: ['Enter'] },
    { keys: ['Esc'], description: 'Close dropdown without selecting', mac: ['Esc'] },
  ];

  const formShortcuts = context === 'create-order' || context === 'edit-order' ? [
    { keys: ['Ctrl', 'Enter'], description: 'Submit from textarea (Notes field)', mac: ['⌘', 'Enter'] },
  ] : [];

  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

  const renderShortcut = (shortcut: { keys: string[], description: string, mac: string[] }) => (
    <div className="shortcut-item" key={shortcut.description}>
      <div className="shortcut-keys">
        {(isMac ? shortcut.mac : shortcut.keys).map((key, index) => (
          <span key={index}>
            <kbd className="shortcut-key">{key}</kbd>
            {index < (isMac ? shortcut.mac : shortcut.keys).length - 1 && (
              <span className="shortcut-plus">+</span>
            )}
          </span>
        ))}
      </div>
      <div className="shortcut-description">{shortcut.description}</div>
    </div>
  );

  return (
    <div className="keyboard-shortcuts-overlay" onClick={() => setIsOpen(false)}>
      <div className="keyboard-shortcuts-modal" onClick={(e) => e.stopPropagation()}>
        <div className="keyboard-shortcuts-header">
          <h2>⌨️ Keyboard Shortcuts</h2>
          <button className="close-button" onClick={() => setIsOpen(false)}>
            ×
          </button>
        </div>

        <div className="keyboard-shortcuts-content">
          <div className="shortcuts-section">
            <h3>🌐 Global Shortcuts</h3>
            {globalShortcuts.map(renderShortcut)}
          </div>

          <div className="shortcuts-section">
            <h3>🧭 Navigation</h3>
            {navigationShortcuts.map(renderShortcut)}
          </div>

          <div className="shortcuts-section">
            <h3>📋 Dropdown Fields</h3>
            {dropdownShortcuts.map(renderShortcut)}
          </div>

          {formShortcuts.length > 0 && (
            <div className="shortcuts-section">
              <h3>📝 Form Shortcuts</h3>
              {formShortcuts.map(renderShortcut)}
            </div>
          )}
        </div>

        <div className="keyboard-shortcuts-footer">
          <p className="shortcuts-tip">
            💡 <strong>Tip:</strong> The form fields follow a logical flow from top to bottom.
            Use Tab or Enter to move forward, and Space (on empty fields) to go back.
          </p>
          <p className="shortcuts-hint">
            Press <kbd>?</kbd> or <kbd>Esc</kbd> to close this guide
          </p>
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcutsGuide;
