import { useState } from "react";
import { useDispatch } from 'react-redux';
import { AppDispatch } from "../../../../../store";
import { createFormula } from "../../../../redux/create/formula/formulaActions";
import "./createFormula.css";

const CreateFormula = () => {
  const dispatch = useDispatch<AppDispatch>();

  const [formulaName, setFormulaName] = useState("");
  const [functionBody, setFunctionBody] = useState("");
  const [description, setDescription] = useState("");
  const [requiredParams, setRequiredParams] = useState("");
  const [optionalParams, setOptionalParams] = useState("");
  const [unit, setUnit] = useState("");
  const [category, setCategory] = useState("");
  const [version, setVersion] = useState("1.0");
  const [loading, setLoading] = useState(false);

  // Test formula states
  const [testParams, setTestParams] = useState<{[key: string]: any}>({});
  const [testResult, setTestResult] = useState<any>(null);
  const [testError, setTestError] = useState("");

  const handleTestFormula = () => {
    setTestError("");
    setTestResult(null);

    try {
      // Create function from body
      const testFunc = new Function('params', functionBody);

      // Parse test parameters
      const parsedParams: {[key: string]: any} = {};
      Object.entries(testParams).forEach(([key, value]) => {
        // Try to parse as number, otherwise keep as string
        parsedParams[key] = isNaN(Number(value)) ? value : Number(value);
      });

      // Execute
      const result = testFunc(parsedParams);
      setTestResult(result);
    } catch (err: any) {
      setTestError(err.message || "Test failed");
    }
  };

  const handleSubmit = async () => {
    if (!formulaName || !functionBody) {
      alert('Formula name and function body are required');
      return;
    }

    setLoading(true);

    try {
      const reqParams = requiredParams
        .split(",")
        .map(p => p.trim())
        .filter(p => p);

      const optParams = optionalParams
        .split(",")
        .map(p => p.trim())
        .filter(p => p);

      await dispatch(createFormula({
        name: formulaName,
        functionBody,
        metadata: {
          description,
          requiredParams: reqParams,
          optionalParams: optParams,
          unit,
          category,
          version,
        },
      }));

      alert('Formula created successfully!');

      // Reset form
      setFormulaName("");
      setFunctionBody("");
      setDescription("");
      setRequiredParams("");
      setOptionalParams("");
      setUnit("");
      setCategory("");
      setVersion("1.0");
      setTestParams({});
      setTestResult(null);
    } catch (err: any) {
      alert(err.message || "Failed to create formula");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTestParam = () => {
    const paramName = prompt("Enter parameter name:");
    if (paramName && !testParams[paramName]) {
      setTestParams({ ...testParams, [paramName]: "" });
    }
  };

  const handleRemoveTestParam = (key: string) => {
    const newParams = { ...testParams };
    delete newParams[key];
    setTestParams(newParams);
  };

  const updateTestParam = (key: string, value: string) => {
    setTestParams({ ...testParams, [key]: value });
  };

  // Example formulas
  const loadExample = (example: string) => {
    switch (example) {
      case "rectangularBag":
        setFormulaName("rectangularBagWeight");
        setFunctionBody("const area = params.length * params.width * 2;\nconst volume = area * params.thickness;\nconst wasteFactor = params.wasteFactor || 1.05;\nreturn volume * params.density * wasteFactor;");
        setDescription("Calculate weight of rectangular plastic bag");
        setRequiredParams("length, width, thickness, density");
        setOptionalParams("wasteFactor");
        setUnit("grams");
        setCategory("plastic-bags");
        setTestParams({ length: "30", width: "20", thickness: "0.05", density: "0.92" });
        break;
      case "cylindrical":
        setFormulaName("cylindricalContainerVolume");
        setFunctionBody("const radius = params.diameter / 2;\nconst wallArea = Math.PI * params.diameter * params.height;\nconst bottomArea = Math.PI * radius * radius;\nreturn (wallArea + bottomArea) * params.thickness * params.density;");
        setDescription("Calculate cylindrical container weight");
        setRequiredParams("diameter, height, thickness, density");
        setUnit("grams");
        setCategory("containers");
        setTestParams({ diameter: "10", height: "15", thickness: "0.1", density: "0.92" });
        break;
      case "simpleMultiply":
        setFormulaName("simpleMultiplication");
        setFunctionBody("return params.value1 * params.value2;");
        setDescription("Multiply two numbers together");
        setRequiredParams("value1, value2");
        setOptionalParams("");
        setUnit("units");
        setCategory("basic-math");
        setTestParams({ value1: "10", value2: "5" });
        break;
      case "percentage":
        setFormulaName("calculatePercentage");
        setFunctionBody("return (params.value * params.percentage) / 100;");
        setDescription("Calculate percentage of a value");
        setRequiredParams("value, percentage");
        setOptionalParams("");
        setUnit("units");
        setCategory("basic-math");
        setTestParams({ value: "1000", percentage: "15" });
        break;
    }
  };

  return (
    <div className="create-formula-container">
      <h2 className="text-2xl font-bold mb-4">Create Formula</h2>

      {/* Help Section for Non-Coders */}
      <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded">
        <h3 className="font-semibold text-orange-900 mb-2">📚 How to Create Formulas (No Coding Required!)</h3>
        <div className="text-sm text-orange-800 space-y-2">
          <p><strong>Step 1:</strong> Click an example below to load a pre-built formula</p>
          <p><strong>Step 2:</strong> Modify the formula name and parameters to match your needs</p>
          <p><strong>Step 3:</strong> Test the formula with sample values</p>
          <p><strong>Step 4:</strong> Save when results are correct</p>
          <p className="mt-2"><strong>💡 Tip:</strong> Use the examples as templates - just change the parameter names and values!</p>
        </div>
      </div>

      {/* Example Buttons */}
      <div className="mb-4">
        <h3 className="font-semibold mb-2">🎯 Quick Start - Load an Example:</h3>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => loadExample("rectangularBag")}
            className="text-sm bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            📄 Plastic Bag Weight Calculator
          </button>
          <button
            onClick={() => loadExample("cylindrical")}
            className="text-sm bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            🥫 Container Weight Calculator
          </button>
          <button
            onClick={() => loadExample("simpleMultiply")}
            className="text-sm bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            ✖️ Simple Multiplication
          </button>
          <button
            onClick={() => loadExample("percentage")}
            className="text-sm bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            📊 Percentage Calculator
          </button>
        </div>
      </div>

      <div className="form-grid">
        {/* Formula Name */}
        <div className="form-column">
          <label className="input-label">Formula Name *</label>
          <input
            value={formulaName}
            onChange={(e) => setFormulaName(e.target.value)}
            className="form-input"
            placeholder="e.g., rectangularBagWeight"
          />
        </div>

        {/* Description */}
        <div className="form-column">
          <label className="input-label">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="form-input"
            rows={2}
            placeholder="Describe what this formula calculates"
          />
        </div>

        {/* Function Body */}
        <div className="form-column">
          <label className="input-label">Formula Calculation *</label>
          <div className="mb-2 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
            <p className="font-semibold text-yellow-900 mb-1">📝 Basic Formula Guide:</p>
            <ul className="text-yellow-800 space-y-1 ml-4">
              <li>• Use <code className="bg-yellow-100 px-1">params.parameterName</code> to access values</li>
              <li>• Math operations: + (add), - (subtract), * (multiply), / (divide)</li>
              <li>• Must start with <code className="bg-yellow-100 px-1">return</code> keyword</li>
              <li>• Example: <code className="bg-yellow-100 px-1">return params.length * params.width</code></li>
            </ul>
          </div>
          <textarea
            value={functionBody}
            onChange={(e) => setFunctionBody(e.target.value)}
            className="form-input font-mono text-sm"
            rows={8}
            placeholder="return params.length * params.width * params.thickness * params.density;"
          />
          <p className="text-xs text-gray-600 mt-1">
            💡 Tip: Load an example above to see how formulas work, then modify it!
          </p>
        </div>

        {/* Parameters */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="input-label">Required Parameters</label>
            <input
              value={requiredParams}
              onChange={(e) => setRequiredParams(e.target.value)}
              className="form-input"
              placeholder="length, width, thickness"
            />
            <p className="text-xs text-gray-600">Comma-separated</p>
          </div>
          <div>
            <label className="input-label">Optional Parameters</label>
            <input
              value={optionalParams}
              onChange={(e) => setOptionalParams(e.target.value)}
              className="form-input"
              placeholder="wasteFactor, markup"
            />
            <p className="text-xs text-gray-600">Comma-separated</p>
          </div>
        </div>

        {/* Metadata */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="input-label">Unit</label>
            <input
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="form-input"
              placeholder="grams"
            />
          </div>
          <div>
            <label className="input-label">Category</label>
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="form-input"
              placeholder="plastic-bags"
            />
          </div>
          <div>
            <label className="input-label">Version</label>
            <input
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              className="form-input"
              placeholder="1.0"
            />
          </div>
        </div>

        {/* Test Section */}
        <div className="form-column bg-gray-50 p-4 rounded border">
          <h3 className="font-semibold mb-2">🧪 Test Formula</h3>

          <div className="mb-3">
            <button
              onClick={handleAddTestParam}
              className="text-sm bg-[#FF6B35] text-white px-3 py-1 rounded hover:bg-[#E55A2B]"
            >
              + Add Parameter
            </button>
          </div>

          {Object.entries(testParams).map(([key, value]) => (
            <div key={key} className="flex gap-2 mb-2">
              <label className="w-32 font-mono text-sm pt-2">{key}:</label>
              <input
                value={value}
                onChange={(e) => updateTestParam(key, e.target.value)}
                className="flex-1 border p-1 rounded"
                placeholder="value"
              />
              <button
                onClick={() => handleRemoveTestParam(key)}
                className="text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </div>
          ))}

          <button
            onClick={handleTestFormula}
            className="mt-3 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            disabled={!functionBody}
          >
            Run Test
          </button>

          {testResult !== null && (
            <div className="mt-3 p-3 bg-green-100 border border-green-400 rounded">
              <strong>Result:</strong> {testResult} {unit}
            </div>
          )}

          {testError && (
            <div className="mt-3 p-3 bg-red-100 border border-red-400 rounded text-red-700">
              <strong>Error:</strong> {testError}
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="form-column">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-[#FF6B35] text-white px-6 py-3 rounded hover:bg-[#E55A2B] disabled:bg-gray-400 disabled:cursor-not-allowed w-full"
          >
            {loading ? "Saving..." : "💾 Save Formula"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateFormula;
