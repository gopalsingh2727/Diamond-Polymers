import { useEffect, useCallback } from "react";

/**
 * Hook to handle ESC key for internal back navigation
 * Use this when you want ESC to go back within a component (e.g., from detail view to list view)
 * 
 * @param condition - When true, ESC will trigger the callback
 * @param onBack - Function to call when ESC is pressed
 * 
 * @example
 * // In your component
 * useInternalBackNavigation(showDetail, () => {
 *   setShowDetail(false);
 *   setForm({});
 * });
 */
export function useInternalBackNavigation(
  condition: boolean,
  onBack: () => void
) {
  const handleEscKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && condition) {
        e.preventDefault();
        e.stopPropagation();
        onBack();
      }
    },
    [condition, onBack]
  );

  useEffect(() => {
    // Use capture phase (true) to catch the event before other handlers
    window.addEventListener("keydown", handleEscKey, true);
    return () => window.removeEventListener("keydown", handleEscKey, true);
  }, [handleEscKey]);
}

/**
 * Hook to handle keyboard navigation for lists (ArrowUp, ArrowDown, Enter)
 * 
 * @param enabled - When true, keyboard navigation is active
 * @param listLength - Total number of items in the list
 * @param selectedIndex - Currently selected index
 * @param setSelectedIndex - Function to update selected index
 * @param onEnter - Optional callback when Enter is pressed
 * 
 * @example
 * useListNavigation(
 *   !showDetail,
 *   filteredAccounts.length,
 *   selectedRow,
 *   setSelectedRow,
 *   () => {
 *     const selected = filteredAccounts[selectedRow];
 *     setForm(selected);
 *     setShowDetail(true);
 *   }
 * );
 */
export function useListNavigation(
  enabled: boolean,
  listLength: number,
  selectedIndex: number,
  setSelectedIndex: (index: number) => void,
  onEnter?: () => void
) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled || listLength === 0) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex(Math.min(selectedIndex + 1, listLength - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(Math.max(selectedIndex - 1, 0));
      } else if (e.key === "Enter" && onEnter) {
        e.preventDefault();
        onEnter();
      }
    },
    [enabled, listLength, selectedIndex, setSelectedIndex, onEnter]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}

/**
 * Simple BackButton component with ESC key support
 * Use this for browser history navigation (going back to previous page)
 */
export function BackButton() {
  const handleBack = () => {
    window.history.back();
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleBack();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <button
      onClick={handleBack}
      style={{
        backgroundColor: "transparent",
        color: "#000",
        border: "1px solid #ddd",
        outline: "none",
        padding: "8px 16px",
        borderRadius: "5px",
        cursor: "pointer",
        fontSize: "14px",
      }}
    >
      Back (ESC)
    </button>
  );
}

/**
 * Reusable back button for internal navigation (not browser history)
 * 
 * @param onClick - Function to call when clicked
 * @param label - Button label text
 * 
 * @example
 * <InternalBackButton 
 *   onClick={() => setShowDetail(false)} 
 *   label="Back to List"
 * />
 */
export function InternalBackButton({
  onClick,
  label = "Back (ESC)",
}: {
  onClick: () => void;
  label?: string;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        backgroundColor: "transparent",
        color: "#000",
        border: "1px solid #ddd",
        outline: "none",
        padding: "8px 16px",
        borderRadius: "5px",
        cursor: "pointer",
        fontSize: "14px",
      }}
    >
      {label}
    </button>
  );
}

/**
 * Search box component with clear functionality
 * 
 * @param value - Current search value
 * @param onChange - Function to call when search changes
 * @param onClear - Function to call when clear button is clicked
 * @param placeholder - Placeholder text
 * 
 * @example
 * <SearchBox
 *   value={searchTerm}
 *   onChange={(e) => setSearchTerm(e.target.value)}
 *   onClear={() => setSearchTerm("")}
 *   placeholder="Search accounts..."
 * />
 */
export function SearchBox({
  value,
  onChange,
  onClear,
  placeholder = "Search...",
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
  placeholder?: string;
}) {
  return (
    <div style={{ position: "relative", flex: 1 }}>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        style={{
          width: "100%",
          padding: "12px 40px 12px 40px",
          fontSize: "15px",
          border: "2px solid #ddd",
          borderRadius: "8px",
          outline: "none",
          transition: "border-color 0.3s ease",
        }}
        onFocus={(e) => (e.target.style.borderColor = "#2d89ef")}
        onBlur={(e) => (e.target.style.borderColor = "#ddd")}
      />
      <span
        style={{
          position: "absolute",
          left: "14px",
          top: "50%",
          transform: "translateY(-50%)",
          fontSize: "18px",
          color: "#666",
        }}
      >
        🔍
      </span>
      {value && (
        <button
          onClick={onClear}
          style={{
            position: "absolute",
            right: "10px",
            top: "50%",
            transform: "translateY(-50%)",
            background: "none",
            border: "none",
            fontSize: "20px",
            cursor: "pointer",
            color: "#999",
            padding: "4px 8px",
          }}
          title="Clear search"
        >
          ✕
        </button>
      )}
    </div>
  );
}

/**
 * Results counter component
 * 
 * @param filtered - Number of filtered results
 * @param total - Total number of items
 * @param itemName - Name of the items (e.g., "accounts", "machines")
 * 
 * @example
 * <ResultsCounter 
 *   filtered={filteredAccounts.length} 
 *   total={accounts.length} 
 *   itemName="accounts"
 * />
 */
export function ResultsCounter({
  filtered,
  total,
  itemName = "items",
}: {
  filtered: number;
  total: number;
  itemName?: string;
}) {
  return (
    <div
      style={{
        padding: "12px 16px",
        background: "#f5f5f5",
        borderRadius: "8px",
        fontSize: "14px",
        color: "#666",
        whiteSpace: "nowrap",
      }}
    >
      {filtered} of {total} {itemName}
    </div>
  );
}