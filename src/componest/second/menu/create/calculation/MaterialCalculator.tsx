import { useState, useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import "./materialCalculator.css";
import { RootState } from "../../../../redux/rootReducer";
import { AppDispatch } from "../../../../../store";
import { getProductSpecs } from "../../../../redux/create/productSpec/productSpecActions";
import { getMaterialSpecs, calculateCombined, calculateFromMaterialSpec } from "../../../../redux/create/materialSpec/materialSpecActions";

const MaterialCalculator = () => {
  const dispatch = useDispatch<AppDispatch>();

  // Redux State
  const productSpecsState = useSelector((state: RootState) => state.productSpecList);
  const materialSpecsState = useSelector((state: RootState) => state.materialSpecList);

  const productSpecs = productSpecsState?.productSpecs || [];
  const materialSpecs = materialSpecsState?.materialSpecs || [];

  const [calculationType, setCalculationType] = useState<"combined" | "materialOnly">("combined");
  const [productSpecId, setProductSpecId] = useState("");
  const [materialSpecId, setMaterialSpecId] = useState("");
  const [quantity, setQuantity] = useState<number>(1);
  const [formulaType, setFormulaType] = useState<"auto" | "volume" | "weight">("auto");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    dispatch(getProductSpecs());
    dispatch(getMaterialSpecs());
  }, [dispatch]);

  const handleCalculate = async () => {
    if (calculationType === "combined" && (!productSpecId || !materialSpecId)) {
      alert('Please select both product spec and material spec');
      return;
    }

    if (calculationType === "materialOnly" && !materialSpecId) {
      alert('Please select a material spec');
      return;
    }

    if (quantity <= 0) {
      alert('Quantity must be greater than 0');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      let calcResult;

      if (calculationType === "combined") {
        calcResult = await dispatch(calculateCombined({
          productSpecId,
          materialSpecId,
          quantity,
          formulaType
        }));
      } else {
        calcResult = await dispatch(calculateFromMaterialSpec({
          materialSpecId,
          quantity
        }));
      }

      setResult(calcResult.calculation);
    } catch (err: any) {
      alert(err.message || "Calculation failed");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setProductSpecId("");
    setMaterialSpecId("");
    setQuantity(1);
    setFormulaType("auto");
    setResult(null);
  };

  return (
    <div className="material-calculator-container">
      <h2 className="calculator-title">Material Requirements Calculator</h2>
      <p className="calculator-subtitle">
        Calculate material requirements based on product specifications and material properties
      </p>

      <div className="calculator-grid">
        {/* Calculation Type Selection */}
        <div className="calc-section">
          <label className="section-label">Calculation Type</label>
          <div className="type-buttons">
            <button
              className={`type-btn ${calculationType === "combined" ? "active" : ""}`}
              onClick={() => setCalculationType("combined")}
            >
              <span className="btn-icon">🔄</span>
              <span>Product + Material</span>
            </button>
            <button
              className={`type-btn ${calculationType === "materialOnly" ? "active" : ""}`}
              onClick={() => setCalculationType("materialOnly")}
            >
              <span className="btn-icon">🧪</span>
              <span>Material Only</span>
            </button>
          </div>
        </div>

        {/* Product Spec Selection (only for combined) */}
        {calculationType === "combined" && (
          <div className="calc-section">
            <label className="section-label">Product Specification *</label>
            <select
              value={productSpecId}
              onChange={(e) => setProductSpecId(e.target.value)}
              className="calc-input"
            >
              <option value="">Select product spec</option>
              {productSpecs.map((spec: any) => (
                <option key={spec._id} value={spec._id}>
                  {spec.specName} ({spec.productTypeId?.productTypeName})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Material Spec Selection */}
        <div className="calc-section">
          <label className="section-label">Material Specification *</label>
          <select
            value={materialSpecId}
            onChange={(e) => setMaterialSpecId(e.target.value)}
            className="calc-input"
          >
            <option value="">Select material spec</option>
            {materialSpecs.map((spec: any) => (
              <option key={spec._id} value={spec._id}>
                {spec.specName} ({spec.materialTypeId?.materialTypeName}) -
                MOL: {spec.mol}, Density: {spec.density} g/cm³
              </option>
            ))}
          </select>
        </div>

        {/* Quantity Input */}
        <div className="calc-section">
          <label className="section-label">Quantity (Pieces) *</label>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
            className="calc-input"
            placeholder="Enter quantity"
          />
        </div>

        {/* Formula Type (only for combined) */}
        {calculationType === "combined" && (
          <div className="calc-section">
            <label className="section-label">Calculation Method</label>
            <select
              value={formulaType}
              onChange={(e) => setFormulaType(e.target.value as any)}
              className="calc-input"
            >
              <option value="auto">Auto (Best Method)</option>
              <option value="volume">Volume × Density</option>
              <option value="weight">Weight Per Piece</option>
            </select>
          </div>
        )}

        {/* Action Buttons */}
        <div className="calc-actions">
          <button
            onClick={handleCalculate}
            disabled={loading}
            className="btn-calculate"
          >
            {loading ? "Calculating..." : "🧮 Calculate"}
          </button>
          <button
            onClick={resetForm}
            className="btn-reset"
          >
            🔄 Reset
          </button>
        </div>

        {/* Results Display */}
        {result && (
          <div className="results-container">
            <h3 className="results-title">📊 Calculation Results</h3>

            {calculationType === "combined" && result.productSpec && (
              <div className="result-section product-section">
                <h4 className="result-subtitle">Product Details</h4>
                <div className="result-grid">
                  <div className="result-item">
                    <span className="result-label">Product:</span>
                    <span className="result-value">{result.productSpec.name}</span>
                  </div>
                  <div className="result-item">
                    <span className="result-label">Type:</span>
                    <span className="result-value">{result.productSpec.productType}</span>
                  </div>
                  <div className="result-item">
                    <span className="result-label">Volume:</span>
                    <span className="result-value highlight">{result.results.productVolume.toFixed(2)} cm³</span>
                  </div>
                </div>
              </div>
            )}

            <div className="result-section material-section">
              <h4 className="result-subtitle">Material Details</h4>
              <div className="result-grid">
                <div className="result-item">
                  <span className="result-label">Material:</span>
                  <span className="result-value">{result.materialSpec.name}</span>
                </div>
                <div className="result-item">
                  <span className="result-label">Type:</span>
                  <span className="result-value">{result.materialSpec.materialType}</span>
                </div>
                <div className="result-item">
                  <span className="result-label">MOL:</span>
                  <span className="result-value">{result.materialSpec.mol}</span>
                </div>
                <div className="result-item">
                  <span className="result-label">Density:</span>
                  <span className="result-value">{result.materialSpec.density} g/cm³</span>
                </div>
              </div>
            </div>

            <div className="result-section summary-section">
              <h4 className="result-subtitle">📦 Material Requirements</h4>
              <div className="summary-grid">
                <div className="summary-card">
                  <div className="summary-label">Total Material Weight</div>
                  <div className="summary-value primary">{result.results.totalMaterialWeight?.toFixed(2) || result.results.totalWeight?.toFixed(2)} g</div>
                </div>
                <div className="summary-card">
                  <div className="summary-label">Weight in Kilograms</div>
                  <div className="summary-value secondary">{result.results.totalMaterialWeightKg?.toFixed(3) || (result.results.totalWeight / 1000).toFixed(3)} kg</div>
                </div>
                {result.results.estimatedPieces && (
                  <div className="summary-card">
                    <div className="summary-label">Estimated Pieces</div>
                    <div className="summary-value tertiary">{Math.floor(result.results.estimatedPieces)}</div>
                  </div>
                )}
                {calculationType === "combined" && result.results.materialWeightPerUnit && (
                  <div className="summary-card">
                    <div className="summary-label">Weight Per Unit</div>
                    <div className="summary-value">{result.results.materialWeightPerUnit.toFixed(2)} g</div>
                  </div>
                )}
              </div>
            </div>

            <div className="result-metadata">
              <div className="metadata-item">
                <span className="meta-icon">📏</span>
                <span>Quantity: {result.inputs.quantity} pieces</span>
              </div>
              {calculationType === "combined" && (
                <div className="metadata-item">
                  <span className="meta-icon">⚙️</span>
                  <span>Method: {result.inputs.formulaType}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MaterialCalculator;
