import { useEffect } from "react";

// BackButton Component
export function BackButton ()  {
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
    <button  onClick={handleBack}>
      Back(esc)
    </button>
  );
};

// const style = { 
//   backgroundColor: "transparent",
//   color: "#000",
//   border: "none",
//   outline: "none",
//   textAlign: "center",
//   margin: "10px",
//   padding: "10px 20px",
//   borderRadius: "5px",
//   cursor: "pointer",
//   fontSize: "16px",
// };

// ✅ Named export for reusable navigation handler
export function handleKeyNavigation(
  e: KeyboardEvent,
  data: any[],
  selectedIndex: number,
  setSelectedIndex: (index: number) => void,
  setExpandedIndex: (index: number | null) => void
) {
  if (e.key === "ArrowDown") {
    e.preventDefault();
    if (selectedIndex < data.length - 1) {
      setSelectedIndex(selectedIndex + 1);
      setExpandedIndex(null);
    }
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    if (selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
      setExpandedIndex(null);
    }
  } else if (e.key === "Enter") {
    // e.preventDefault();
    // setExpandedIndex((prev) =>
    //   prev === selectedIndex ? null : selectedIndex
    // );
  }
}
export function SearchBox() {
  return (
    <div className="inputBoxAllodersSrearchbox">
      <input type="text" placeholder="Search..." className="input" />
    </div>
  );
}

