import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from "../../../../../store";
import { RootState } from "../../../../redux/rootReducer";
import {
  getFormulas,
  updateFormula,
  deleteFormula
} from "../../../../redux/create/formula/formulaActions";
import "./editFormula.css";

interface Formula {
  name: string;
  metadata: {
    description?: string;
    requiredParams?: string[];
    optionalParams?: string[];
    unit?: string;
    category?: string;
    version?: string;
    functionBody?: string;
    createdBy?: string;
    createdAt?: string;
  };
}

const EditFormula: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  // Redux state
  const formulaListState = useSelector((state: RootState) => state.formulaList);
  const formulas = formulaListState?.formulas || [];
  const loading = formulaListState?.loading || false;
  const error = formulaListState?.error || "";

  const [selectedFormula, setSelectedFormula] = useState<Formula | null>(null);
  const [editForm, setEditForm] = useState({
    functionBody: "",
    description: "",
    requiredParams: "",
    optionalParams: "",
    unit: "",
    category: "",
    version: "",
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");

  // Test formula
  const [testParams, setTestParams] = useState<{[key: string]: any}>({});
  const [testResult, setTestResult] = useState<any>(null);
  const [testError, setTestError] = useState("");

  useEffect(() => {
    dispatch(getFormulas());
  }, [dispatch]);

  const openEditor = (formula: Formula) => {
    setSelectedFormula(formula);
    setEditForm({
      functionBody: formula.metadata.functionBody || "",
      description: formula.metadata.description || "",
      requiredParams: formula.metadata.requiredParams?.join(", ") || "",
      optionalParams: formula.metadata.optionalParams?.join(", ") || "",
      unit: formula.metadata.unit || "",
      category: formula.metadata.category || "",
      version: formula.metadata.version || "",
    });

    // Initialize test params
    const params: {[key: string]: any} = {};
    formula.metadata.requiredParams?.forEach(param => {
      params[param] = "";
    });
    setTestParams(params);
    setTestResult(null);
    setTestError("");
  };

  const handleEditChange = (field: keyof typeof editForm, value: string) => {
    setEditForm({ ...editForm, [field]: value });
  };

  const handleTestFormula = () => {
    setTestError("");
    setTestResult(null);

    if (!editForm.functionBody) {
      setTestError("No function body");
      return;
    }

    try {
      const testFunc = new Function('params', editForm.functionBody);

      const parsedParams: {[key: string]: any} = {};
      Object.entries(testParams).forEach(([key, value]) => {
        parsedParams[key] = isNaN(Number(value)) ? value : Number(value);
      });

      const result = testFunc(parsedParams);
      setTestResult(result);
    } catch (err: any) {
      setTestError(err.message || "Test failed");
    }
  };

  const handleUpdate = async () => {
    if (!selectedFormula) return;

    try {
      const reqParams = editForm.requiredParams
        .split(",")
        .map(p => p.trim())
        .filter(p => p);

      const optParams = editForm.optionalParams
        .split(",")
        .map(p => p.trim())
        .filter(p => p);

      await dispatch(updateFormula(selectedFormula.name, {
        functionBody: editForm.functionBody || undefined,
        metadata: {
          description: editForm.description,
          requiredParams: reqParams,
          optionalParams: optParams,
          unit: editForm.unit,
          category: editForm.category,
          version: editForm.version,
        },
      }));

      alert("Formula updated successfully!");
      setSelectedFormula(null);
      // ✅ OPTIMIZED: Removed redundant refetch - user can refresh page if needed
    } catch (err: any) {
      alert(err.message || "Failed to update formula");
    }
  };

  const handleDeleteClick = () => {
    setDeleteInput("");
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (deleteInput !== "DELETE" || !selectedFormula) {
      alert("❌ Type DELETE to confirm deletion");
      return;
    }

    try {
      await dispatch(deleteFormula(selectedFormula.name));

      alert("Formula deleted successfully!");
      setShowDeleteConfirm(false);
      setSelectedFormula(null);
      // ✅ OPTIMIZED: Removed redundant refetch - user can refresh page if needed
    } catch (err: any) {
      alert(err.message || "Failed to delete formula");
    }
  };

  const updateTestParam = (key: string, value: string) => {
    setTestParams({ ...testParams, [key]: value });
  };

  return (
    <div className="edit-formula-container p-4">
      <h2 className="text-xl font-semibold mb-4">Formula List</h2>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!selectedFormula ? (
        <table className="w-full border border-collapse">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2 border">Formula Name</th>
              <th className="p-2 border">Description</th>
              <th className="p-2 border">Category</th>
              <th className="p-2 border">Unit</th>
              <th className="p-2 border">Version</th>
              <th className="p-2 border">Created By</th>
            </tr>
          </thead>
          <tbody>
            {formulas.map((formula: Formula) => (
              <tr
                key={formula.name}
                onClick={() => openEditor(formula)}
                className="cursor-pointer hover:bg-blue-50"
              >
                <td className="p-2 border font-mono text-sm">{formula.name}</td>
                <td className="p-2 border">{formula.metadata.description || "—"}</td>
                <td className="p-2 border">{formula.metadata.category || "—"}</td>
                <td className="p-2 border">{formula.metadata.unit || "—"}</td>
                <td className="p-2 border">{formula.metadata.version || "—"}</td>
                <td className="p-2 border">{formula.metadata.createdBy || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="bg-white p-4 shadow-md rounded max-w-3xl">
          <h3 className="text-lg font-bold mb-4">Edit Formula: {selectedFormula.name}</h3>

          <div className="space-y-4">
            <div>
              <label className="block mb-1 font-semibold">Description</label>
              <textarea
                value={editForm.description}
                onChange={(e) => handleEditChange("description", e.target.value)}
                className="border p-2 w-full rounded"
                rows={2}
              />
            </div>

            <div>
              <label className="block mb-1 font-semibold">Function Body</label>
              <textarea
                value={editForm.functionBody}
                onChange={(e) => handleEditChange("functionBody", e.target.value)}
                className="border p-2 w-full rounded font-mono text-sm"
                rows={8}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 font-semibold">Required Parameters</label>
                <input
                  value={editForm.requiredParams}
                  onChange={(e) => handleEditChange("requiredParams", e.target.value)}
                  className="border p-2 w-full rounded"
                  placeholder="param1, param2"
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold">Optional Parameters</label>
                <input
                  value={editForm.optionalParams}
                  onChange={(e) => handleEditChange("optionalParams", e.target.value)}
                  className="border p-2 w-full rounded"
                  placeholder="param3, param4"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block mb-1 font-semibold">Unit</label>
                <input
                  value={editForm.unit}
                  onChange={(e) => handleEditChange("unit", e.target.value)}
                  className="border p-2 w-full rounded"
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold">Category</label>
                <input
                  value={editForm.category}
                  onChange={(e) => handleEditChange("category", e.target.value)}
                  className="border p-2 w-full rounded"
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold">Version</label>
                <input
                  value={editForm.version}
                  onChange={(e) => handleEditChange("version", e.target.value)}
                  className="border p-2 w-full rounded"
                />
              </div>
            </div>

            {/* Test Section */}
            <div className="bg-gray-50 p-4 rounded border">
              <h4 className="font-semibold mb-2">🧪 Test Formula</h4>

              {Object.entries(testParams).map(([key, value]) => (
                <div key={key} className="flex gap-2 mb-2">
                  <label className="w-32 font-mono text-sm pt-2">{key}:</label>
                  <input
                    value={value}
                    onChange={(e) => updateTestParam(key, e.target.value)}
                    className="flex-1 border p-1 rounded"
                  />
                </div>
              ))}

              <button
                onClick={handleTestFormula}
                className="mt-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Run Test
              </button>

              {testResult !== null && (
                <div className="mt-3 p-2 bg-green-100 border border-green-400 rounded">
                  <strong>Result:</strong> {testResult} {editForm.unit}
                </div>
              )}

              {testError && (
                <div className="mt-3 p-2 bg-red-100 border border-red-400 rounded text-red-700">
                  <strong>Error:</strong> {testError}
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-4">
              <button
                onClick={handleUpdate}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                💾 Save Changes
              </button>
              <button
                onClick={handleDeleteClick}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                🗑️ Delete
              </button>
              <button
                onClick={() => setSelectedFormula(null)}
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full text-center">
            <h3 className="text-lg font-bold mb-4">
              Type <span className="text-red-600 font-mono">DELETE</span> to confirm
            </h3>
            <input
              type="text"
              value={deleteInput}
              onChange={(e) => setDeleteInput(e.target.value)}
              className="border p-2 w-full mb-4"
              placeholder="Type DELETE"
            />
            <div className="flex justify-center gap-4">
              <button
                onClick={confirmDelete}
                className="bg-red-600 text-white px-4 py-2 rounded"
              >
                Confirm
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="bg-gray-400 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditFormula;
