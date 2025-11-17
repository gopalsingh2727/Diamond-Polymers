import { useState, useEffect } from "react";
import "./calculationTool.css";

interface ProductType {
  _id: string;
  productTypeName: string;
}

interface Formula {
  name: string;
  metadata: {
    description?: string;
    requiredParams?: string[];
    unit?: string;
  };
}

const CalculationTool = () => {
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [formulas, setFormulas] = useState<Formula[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Link formula tab
  const [selectedProductType, setSelectedProductType] = useState("");
  const [selectedFormula, setSelectedFormula] = useState("");

  // Calculate tab
  const [calcProductType, setCalcProductType] = useState("");
  const [calcParams, setCalcParams] = useState<{[key: string]: any}>({});
  const [calcResult, setCalcResult] = useState<any>(null);

  // View links tab
  const [linkedFormulas, setLinkedFormulas] = useState<any[]>([]);

  const [activeTab, setActiveTab] = useState<"link" | "calculate" | "view">("link");

  useEffect(() => {
    fetchProductTypes();
    fetchFormulas();
    if (activeTab === "view") {
      fetchLinkedFormulas();
    }
  }, [activeTab]);

  const fetchProductTypes = async () => {
    try {
      const token = localStorage.getItem("token");
      const apiKey = import.meta.env.VITE_API_KEY;

      const response = await fetch(
        `${import.meta.env.VITE_API_27INFINITY_IN}/producttype`,
        {
          headers: {
            "x-api-key": apiKey || "",
            "Authorization": `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (response.ok) {
        setProductTypes(Array.isArray(data) ? data : data.productTypes || []);
      }
    } catch (err) {
      console.error("Failed to fetch product types");
    }
  };

  const fetchFormulas = async () => {
    try {
      const token = localStorage.getItem("token");
      const apiKey = import.meta.env.VITE_API_KEY;

      const response = await fetch(
        `${import.meta.env.VITE_API_27INFINITY_IN}/formula`,
        {
          headers: {
            "x-api-key": apiKey || "",
            "Authorization": `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (response.ok) {
        setFormulas(data.formulas || []);
      }
    } catch (err) {
      console.error("Failed to fetch formulas");
    }
  };

  const fetchLinkedFormulas = async () => {
    try {
      const token = localStorage.getItem("token");
      const apiKey = import.meta.env.VITE_API_KEY;

      const response = await fetch(
        `${import.meta.env.VITE_API_27INFINITY_IN}/calculation/producttype/formulas`,
        {
          headers: {
            "x-api-key": apiKey || "",
            "Authorization": `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (response.ok) {
        setLinkedFormulas(data.formulas || []);
      }
    } catch (err) {
      console.error("Failed to fetch linked formulas");
    }
  };

  const handleLinkFormula = async () => {
    if (!selectedProductType || !selectedFormula) {
      alert("Please select both product type and formula");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const apiKey = import.meta.env.VITE_API_KEY;

      const response = await fetch(
        `${import.meta.env.VITE_API_27INFINITY_IN}/calculation/link/producttype`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey || "",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({
            productTypeId: selectedProductType,
            formulaName: selectedFormula,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to link formula");
      }

      alert("Formula linked successfully!");
      setSelectedProductType("");
      setSelectedFormula("");
    } catch (err: any) {
      setError(err.message || "Failed to link formula");
    } finally {
      setLoading(false);
    }
  };

  const handleCalculate = async () => {
    if (!calcProductType) {
      alert("Please select a product type");
      return;
    }

    setLoading(true);
    setError("");
    setCalcResult(null);

    try {
      const token = localStorage.getItem("token");
      const apiKey = import.meta.env.VITE_API_KEY;

      // Convert param values to numbers where possible
      const processedParams: {[key: string]: any} = {};
      Object.entries(calcParams).forEach(([key, value]) => {
        processedParams[key] = isNaN(Number(value)) ? value : Number(value);
      });

      const response = await fetch(
        `${import.meta.env.VITE_API_27INFINITY_IN}/calculation/order`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey || "",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({
            productTypeId: calcProductType,
            parameters: processedParams,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Calculation failed");
      }

      setCalcResult(data.calculation);
      setSuccess("Calculation completed!");
    } catch (err: any) {
      setError(err.message || "Calculation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleUnlink = async (productTypeId: string) => {
    if (!window.confirm("Are you sure you want to unlink this formula?")) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const apiKey = import.meta.env.VITE_API_KEY;

      const response = await fetch(
        `${import.meta.env.VITE_API_27INFINITY_IN}/calculation/producttype/${productTypeId}/unlink`,
        {
          method: "DELETE",
          headers: {
            "x-api-key": apiKey || "",
            "Authorization": `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to unlink formula");
      }

      alert("Formula unlinked successfully!");
      fetchLinkedFormulas();
    } catch (err: any) {
      setError(err.message || "Failed to unlink formula");
    } finally {
      setLoading(false);
    }
  };

  const addCalcParam = () => {
    const paramName = window.prompt("Enter parameter name:");
    if (paramName && !calcParams[paramName]) {
      setCalcParams({ ...calcParams, [paramName]: "" });
    }
  };

  const updateCalcParam = (key: string, value: string) => {
    setCalcParams({ ...calcParams, [key]: value });
  };

  const removeCalcParam = (key: string) => {
    const newParams = { ...calcParams };
    delete newParams[key];
    setCalcParams(newParams);
  };

  return (
    <div className="calculation-tool-container">
      <h2 className="text-2xl font-bold mb-4">Calculation Tool</h2>

      {/* Tabs */}
      <div className="tabs mb-4">
        <button
          className={`tab-button ${activeTab === "link" ? "active" : ""}`}
          onClick={() => setActiveTab("link")}
        >
          🔗 Link Formula
        </button>
        <button
          className={`tab-button ${activeTab === "calculate" ? "active" : ""}`}
          onClick={() => setActiveTab("calculate")}
        >
          🧮 Calculate
        </button>
        <button
          className={`tab-button ${activeTab === "view" ? "active" : ""}`}
          onClick={() => setActiveTab("view")}
        >
          📋 View Links
        </button>
      </div>

      {/* Link Formula Tab */}
      {activeTab === "link" && (
        <div className="tab-content">
          <h3 className="text-lg font-semibold mb-3">Link Product Type to Formula</h3>

          <div className="form-grid">
            <div className="form-column">
              <label className="input-label">Select Product Type</label>
              <select
                value={selectedProductType}
                onChange={(e) => setSelectedProductType(e.target.value)}
                className="form-input"
              >
                <option value="">Choose product type</option>
                {productTypes.map((type) => (
                  <option key={type._id} value={type._id}>
                    {type.productTypeName}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-column">
              <label className="input-label">Select Formula</label>
              <select
                value={selectedFormula}
                onChange={(e) => setSelectedFormula(e.target.value)}
                className="form-input"
              >
                <option value="">Choose formula</option>
                {formulas.map((formula) => (
                  <option key={formula.name} value={formula.name}>
                    {formula.name} - {formula.metadata.description}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleLinkFormula}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              🔗 Link Formula
            </button>
          </div>
        </div>
      )}

      {/* Calculate Tab */}
      {activeTab === "calculate" && (
        <div className="tab-content">
          <h3 className="text-lg font-semibold mb-3">Calculate Using Linked Formula</h3>

          <div className="form-grid">
            <div className="form-column">
              <label className="input-label">Select Product Type</label>
              <select
                value={calcProductType}
                onChange={(e) => setCalcProductType(e.target.value)}
                className="form-input"
              >
                <option value="">Choose product type</option>
                {productTypes.map((type) => (
                  <option key={type._id} value={type._id}>
                    {type.productTypeName}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-column bg-gray-50 p-4 rounded border">
              <div className="flex justify-between items-center mb-2">
                <label className="font-semibold">Parameters</label>
                <button
                  onClick={addCalcParam}
                  className="text-sm bg-blue-500 text-white px-3 py-1 rounded"
                >
                  + Add Parameter
                </button>
              </div>

              {Object.entries(calcParams).map(([key, value]) => (
                <div key={key} className="flex gap-2 mb-2">
                  <label className="w-32 font-mono text-sm pt-2">{key}:</label>
                  <input
                    value={value}
                    onChange={(e) => updateCalcParam(key, e.target.value)}
                    className="flex-1 border p-1 rounded"
                  />
                  <button
                    onClick={() => removeCalcParam(key)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={handleCalculate}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              🧮 Calculate
            </button>

            {calcResult && (
              <div className="result-box bg-green-50 border border-green-400 p-4 rounded">
                <h4 className="font-semibold mb-2">✅ Calculation Result</h4>
                <div className="text-2xl font-bold text-green-700">
                  {calcResult.result}
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  Formula used: <span className="font-mono">{calcResult.formulaUsed}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* View Links Tab */}
      {activeTab === "view" && (
        <div className="tab-content">
          <h3 className="text-lg font-semibold mb-3">Linked Formulas</h3>

          {linkedFormulas.length === 0 ? (
            <p className="text-gray-500">No formula links found</p>
          ) : (
            <table className="w-full border border-collapse">
              <thead className="bg-gray-200">
                <tr>
                  <th className="p-2 border">Product Type</th>
                  <th className="p-2 border">Formula Name</th>
                  <th className="p-2 border">Linked At</th>
                  <th className="p-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {linkedFormulas.map((link) => (
                  <tr key={link.productTypeId}>
                    <td className="p-2 border">{link.productTypeName}</td>
                    <td className="p-2 border font-mono text-sm">
                      {link.formulaName}
                    </td>
                    <td className="p-2 border">
                      {link.linkedAt
                        ? new Date(link.linkedAt).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="p-2 border">
                      <button
                        onClick={() => handleUnlink(link.productTypeId)}
                        className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                      >
                        Unlink
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {error && <div className="error-msg mt-4">{error}</div>}
      {success && <div className="success-msg mt-4">{success}</div>}
    </div>
  );
};

export default CalculationTool;
