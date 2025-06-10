import React, { useState, useEffect, useRef } from "react";
import "./materialAndProduct.css";

type Material = {
  name: string;
  totalWeight: string;
  totalPieces: string;
  onePiecesWeight: string;
};

const materialSuggestions: string[] = [
  "Cotton", "Silk", "Wool", "Polyester", "Denim",
  "Linen", "Rayon", "Georgette", "Velvet", "Satin",
];

const MaterialAndProduct = () => {
  const [materialName, setMaterialName] = useState('');
  const [showMaterialInput, setShowMaterialInput] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [currentMaterial, setCurrentMaterial] = useState<Omit<Material, 'name'>>({
    totalWeight: '',
    totalPieces: '',
    onePiecesWeight: '',
  });
  const [materials, setMaterials] = useState<Material[]>([]);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [activeInput, setActiveInput] = useState<'main' | 'popup'>('main');

  const mainMaterialInputRef = useRef<HTMLInputElement>(null);
  const popupMaterialInputRef = useRef<HTMLInputElement>(null);
  const totalWeightRef = useRef<HTMLInputElement>(null);
  const totalPiecesRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLUListElement>(null);

  // Autofocus
  useEffect(() => {
    if (showPopup && popupMaterialInputRef.current) {
      popupMaterialInputRef.current.focus();
    } else if (showMaterialInput && mainMaterialInputRef.current) {
      mainMaterialInputRef.current.focus();
    }
  }, [showPopup, showMaterialInput]);


  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const isInputFocused = document.activeElement === mainMaterialInputRef.current;
      if (showMaterialInput && e.key === "Backspace" && isInputFocused && materialName.trim() === "") {
        e.preventDefault();
        if (materials.length === 0) {
          setShowMaterialInput(false);
        } else {
          const lastIndex = materials.length - 1;
          const lastMaterial = materials[lastIndex];
          setMaterialName(lastMaterial.name);
          setCurrentMaterial({
            totalWeight: lastMaterial.totalWeight,
            totalPieces: lastMaterial.totalPieces,
            onePiecesWeight: lastMaterial.onePiecesWeight || '',
          });
          setEditIndex(lastIndex);
          setShowPopup(true);
          setActiveInput('popup');
        }
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [showMaterialInput, materialName, materials]);

  useEffect(() => {
    if (highlightedIndex !== -1 && suggestionsRef.current) {
      const items = suggestionsRef.current.querySelectorAll('li');
      if (items[highlightedIndex]) {
        items[highlightedIndex].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [highlightedIndex]);

  useEffect(() => setHighlightedIndex(-1), [filteredSuggestions]);

  const isValidMaterial = () =>
    materialName.trim() !== '' &&
    currentMaterial.totalWeight.trim() !== '' &&
    currentMaterial.totalPieces.trim() !== '';

  const handleSave = () => {
    if (!isValidMaterial()) {
      alert("Please fill in all required fields.");
      return;
    }

    const newMaterial: Material = {
      name: materialName.trim(),
      ...currentMaterial,
    };

    if (editIndex !== null) {
      const updated = [...materials];
      updated[editIndex] = newMaterial;
      setMaterials(updated);
      setEditIndex(null);
    } else {
      setMaterials((prev) => [...prev, newMaterial]);
    }

    setMaterialName('');
    setCurrentMaterial({ totalWeight: '', totalPieces: '', onePiecesWeight: '' });
    setShowPopup(false);
    setShowSuggestions(false);
    setShowMaterialInput(false);
    setActiveInput('main');
  };

  const handleMaterialInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setMaterialName(inputValue);

    if (inputValue.length > 0) {
      const filtered = materialSuggestions.filter((mat) =>
        mat.toLowerCase().includes(inputValue.toLowerCase())
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleMaterialInputKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    inputType: 'main' | 'popup'
  ) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < filteredSuggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : filteredSuggestions.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex !== -1 && filteredSuggestions[highlightedIndex]) {
        const selected = filteredSuggestions[highlightedIndex];
        setMaterialName(selected);
        setShowSuggestions(false);
        setHighlightedIndex(-1);
        if (inputType === 'popup' && totalWeightRef.current) {
          totalWeightRef.current.focus();
        }
      } else {
        const match = materialSuggestions.some(
          (mat) => mat.toLowerCase() === materialName.trim().toLowerCase()
        );
        if (match) {
          if (inputType === 'main') {
            setShowPopup(true);
            setActiveInput('popup');
          } else if (totalWeightRef.current) {
            totalWeightRef.current.focus();
          }
          setShowSuggestions(false);
        } else {
          alert("Please select a material from the suggestions.");
        }
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  const handlePopupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentMaterial((prev) => ({ ...prev, [name]: value }));
  };

  const handlePopupKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    nextRef?: React.RefObject<HTMLInputElement>
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (nextRef) {
        nextRef.current?.focus();
      } else {
        handleSave();
      }
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setMaterialName(suggestion);
    setShowSuggestions(false);
    setHighlightedIndex(-1);
    if (activeInput === 'main') {
      setShowPopup(true);
      setActiveInput('popup');
    } else if (totalWeightRef.current) {
      totalWeightRef.current.focus();
    }
  };

  const handleInputFocus = (inputType: 'main' | 'popup') => {
    setActiveInput(inputType);
    if (materialName.length > 0) {
      const filtered = materialSuggestions.filter((mat) =>
        mat.toLowerCase().includes(materialName.toLowerCase())
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(true);
    }
  };

  return (
    <div className="CreateMaterialandProduct">
      <div className="Totalweightandpieces">
        <div className="CreateMaterialandProductTitle">
          <span>Material</span>
          <span>Weight (KG)</span>
          <span>Total Pieces</span>
        </div>
      </div>

      <div>
        {materials.map((mat, index) => (
          <div
            key={index}
            className="CreateMaterialinput"
            onDoubleClick={() => {
              setMaterialName(mat.name);
              setCurrentMaterial({
                totalWeight: mat.totalWeight,
                totalPieces: mat.totalPieces,
                onePiecesWeight: mat.onePiecesWeight || '',
              });
              setEditIndex(index);
              setShowPopup(true);
              setActiveInput('popup');
            }}
            style={{ cursor: "pointer" }}
          >
            <span>{mat.name}</span>
            <span>{mat.totalWeight}</span>
            <span>{mat.totalPieces}</span>
          </div>
        ))}
      </div>

      {showMaterialInput && !showPopup && (
        <div className="suggestion-wrapper">
          <input
            ref={mainMaterialInputRef}
            className="CreateMaterialInput"
            type="text"
            placeholder="Enter Material Name"
            value={materialName}
            onChange={handleMaterialInputChange}
            onKeyDown={(e) => handleMaterialInputKeyDown(e, 'main')}
            onFocus={() => handleInputFocus('main')}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            autoComplete="off"
          />
          {showSuggestions && activeInput === 'main' && filteredSuggestions.length > 0 && (
            <ul ref={suggestionsRef} className="suggestion-list">
              {filteredSuggestions.map((suggestion, idx) => (
                <li
                  key={idx}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={highlightedIndex === idx ? 'highlighted' : ''}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {showPopup && (
        <div className="popup">
          <div className="popup-content">
            <h3 className="PopMaterialTitel">
              {editIndex !== null ? 'Edit' : 'Enter'} Material Details
            </h3>
            <div className="suggestion-wrapper">
              <input
                ref={popupMaterialInputRef}
                className="CreateMaterialInput"
                type="text"
                placeholder="Enter Material Name"
                value={materialName}
                onChange={handleMaterialInputChange}
                onKeyDown={(e) => handleMaterialInputKeyDown(e, 'popup')}
                onFocus={() => handleInputFocus('popup')}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                autoComplete="off"
              />
              {showSuggestions && activeInput === 'popup' && filteredSuggestions.length > 0 && (
                <ul ref={suggestionsRef} className="suggestion-list">
                  {filteredSuggestions.map((suggestion, idx) => (
                    <li
                      key={idx}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className={highlightedIndex === idx ? 'highlighted' : ''}
                      onMouseEnter={() => setHighlightedIndex(idx)}
                    >
                      {suggestion}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <input
              ref={totalWeightRef}
              type="text"
              name="totalWeight"
              placeholder="Total Weight"
              value={currentMaterial.totalWeight}
              onChange={handlePopupChange}
              onKeyDown={(e) => handlePopupKeyDown(e, totalPiecesRef)}
            />
            <input
              type="text"
              name="onePiecesWeight"
              placeholder="Weight per Piece"
              value={currentMaterial.onePiecesWeight}
              onChange={handlePopupChange}
              onKeyDown={(e) => handlePopupKeyDown(e, totalPiecesRef)}
            />
            <input
              ref={totalPiecesRef}
              type="text"
              name="totalPieces"
              placeholder="Total Pieces"
              value={currentMaterial.totalPieces}
              onChange={handlePopupChange}
              onKeyDown={(e) => handlePopupKeyDown(e)}
            />
            <button onClick={handleSave}>Save</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaterialAndProduct;