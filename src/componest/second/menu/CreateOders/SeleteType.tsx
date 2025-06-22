import React from "react";

interface Props {
  selectedOption: string;
  onChange: (value: string) => void;
  showBottomGusset: boolean;
  setShowBottomGusset: (val: boolean) => void;
  showFlap: boolean;
  setShowFlap: (val: boolean) => void;
  showAirHole: boolean;
  setShowAirHole: (val: boolean) => void;
}

const SeleteType: React.FC<Props> = ({
  selectedOption,
  onChange,
  showBottomGusset,
  setShowBottomGusset,
  showFlap,
  setShowFlap,
  showAirHole,
  setShowAirHole,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="SeleteType">
      <label htmlFor="myDropdown">Choose a type:</label>
      <select id="myDropdown" value={selectedOption} onChange={handleChange}>
        <option value="">-- Select --</option>
        <option value="product">Product</option>
        <option value="material">Material</option>
      </select>

      {selectedOption === "material" && (
        <div className="bottomGussetSelectandflapandAriHole">
          <div>
            <label>
              <input
                type="checkbox"
                checked={showBottomGusset}
                onChange={(e) => setShowBottomGusset(e.target.checked)}
              />
              Bottom Gusset
            </label>
          </div>
          <div>
            <label>
              <input
                type="checkbox"
                checked={showFlap}
                onChange={(e) => setShowFlap(e.target.checked)}
              />
              Flap
            </label>
          </div>
          <div>
            <label>
              <input
                type="checkbox"
                checked={showAirHole}
                onChange={(e) => setShowAirHole(e.target.checked)}
              />
              Air Hole
            </label>
          </div>
        </div>
      )}
    </div>
  );
};


export default SeleteType;