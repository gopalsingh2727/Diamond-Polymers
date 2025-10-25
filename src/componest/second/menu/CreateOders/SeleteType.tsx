import React, { useEffect } from "react";

interface SeleteTypeProps {
  selectedOption: string;
  onChange: (type: string) => void;
  showBottomGusset: boolean;
  setShowBottomGusset: (show: boolean) => void;
  showFlap: boolean;
  setShowFlap: (show: boolean) => void;
  showAirHole: boolean;
  setShowAirHole: (show: boolean) => void;
  initialType?: string;
}

const SeleteType: React.FC<SeleteTypeProps> = ({
  selectedOption,
  onChange,
  showBottomGusset,
  setShowBottomGusset,
  showFlap,
  setShowFlap,
  showAirHole,
  setShowAirHole,
  initialType
}) => {
  
  // Set initial type in edit mode
  useEffect(() => {
    if (initialType && !selectedOption) {
      const lower = initialType.toLowerCase();
      if (lower.includes('material')) {
        onChange('material');
      } else if (lower.includes('product')) {
        onChange('product');
      }
    }
  }, [initialType, selectedOption, onChange]);

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  };

  const handleCheckboxChange = (type: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    switch (type) {
      case 'bottomGusset':
        setShowBottomGusset(checked);
        break;
      case 'flap':
        setShowFlap(checked);
        break;
      case 'airHole':
        setShowAirHole(checked);
        break;
    }
  };

  return (
    <div className="SeleteType">
      <label htmlFor="myDropdown">Choose a type:</label>
      <select id="myDropdown" value={selectedOption} onChange={handleTypeChange}>
        <option value="">-- Select --</option>
        <option value="product">Product</option>
        <option value="material">Material</option>
      </select>

      {selectedOption === "material" && (
        <div className="bottomGussetSelectandflapandAriHole">
          <h6>Additional Options:</h6>
          <div className="checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={showBottomGusset}
                onChange={handleCheckboxChange('bottomGusset')}
              />
              <span>Bottom Gusset</span>
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={showFlap}
                onChange={handleCheckboxChange('flap')}
              />
              <span>Flap</span>
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={showAirHole}
                onChange={handleCheckboxChange('airHole')}
              />
              <span>Air Hole</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeleteType;