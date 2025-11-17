import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface MaterialFormulaItem {
  materialId: string;
  materialName: string;
  percentage: number;
  weightPerUnit: number;
  isOptional: boolean;
}

interface Material {
  _id: string;
  materialName: string;
  materialType: {
    _id: string;
    typeName: string;
  };
}

interface MaterialFormulaFormProps {
  productType?: string;
  productSpecId?: string;
  onSave: (formula: any) => void;
  onCancel: () => void;
  editFormula?: any;
}

const MaterialFormulaForm: React.FC<MaterialFormulaFormProps> = ({
  productType = '',
  productSpecId,
  onSave,
  onCancel,
  editFormula
}) => {
  const [formulaName, setFormulaName] = useState(editFormula?.formulaName || '');
  const [selectedProductType, setSelectedProductType] = useState(productType || editFormula?.productType || '');
  const [materials, setMaterials] = useState<MaterialFormulaItem[]>(editFormula?.materials || []);
  const [mixingTime, setMixingTime] = useState(editFormula?.mixingTimeMinutes || 15);
  const [mixingTemperature, setMixingTemperature] = useState(editFormula?.mixingTemperature || 180);
  const [mixingSpeed, setMixingSpeed] = useState(editFormula?.mixingSpeed || 'medium');
  const [expectedOutput, setExpectedOutput] = useState(editFormula?.expectedOutput || 95);
  const [expectedWastage, setExpectedWastage] = useState(editFormula?.expectedWastage || 5);
  const [notes, setNotes] = useState(editFormula?.notes || '');

  const [availableMaterials, setAvailableMaterials] = useState<Material[]>([]);
  const [productTypes, setProductTypes] = useState<any[]>([]);
  const [totalPercentage, setTotalPercentage] = useState(0);
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_27INFINITY_IN;
  const API_KEY = import.meta.env.VITE_API_KEY;

  useEffect(() => {
    fetchAvailableMaterials();
    fetchProductTypes();
  }, []);

  useEffect(() => {
    const total = materials.reduce((sum, m) => sum + m.percentage, 0);
    setTotalPercentage(total);
  }, [materials]);

  const fetchAvailableMaterials = async () => {
    try {
      const branchId = localStorage.getItem('selectedBranch');
      const response = await axios.get(`${API_BASE_URL}/material`, {
        params: { branchId },
        headers: {
          'x-api-key': API_KEY,
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      setAvailableMaterials(response.data.materials || []);
    } catch (error) {
      console.error('Error fetching materials:', error);
    }
  };

  const fetchProductTypes = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/producttype`, {
        headers: {
          'x-api-key': API_KEY
        }
      });
      setProductTypes(response.data.productTypes || []);
    } catch (error) {
      console.error('Error fetching product types:', error);
    }
  };

  const addMaterial = () => {
    setMaterials([
      ...materials,
      {
        materialId: '',
        materialName: '',
        percentage: 0,
        weightPerUnit: 0,
        isOptional: false
      }
    ]);
  };

  const updateMaterial = (index: number, field: string, value: any) => {
    const updated = [...materials];
    updated[index][field] = value;

    if (field === 'materialId') {
      const selected = availableMaterials.find(m => m._id === value);
      if (selected) {
        updated[index].materialName = selected.materialName;
      }
    }

    setMaterials(updated);
  };

  const removeMaterial = (index: number) => {
    setMaterials(materials.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (totalPercentage !== 100) {
      alert('Total percentage must equal 100%');
      return;
    }

    if (!formulaName || !selectedProductType || materials.length === 0) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const branchId = localStorage.getItem('selectedBranch');
      const payload = {
        formulaName,
        productType: selectedProductType,
        productSpecId: productSpecId || undefined,
        materials,
        mixingTimeMinutes: mixingTime,
        mixingTemperature,
        mixingSpeed,
        expectedOutput,
        expectedWastage,
        notes,
        branchId
      };

      let response;
      if (editFormula) {
        response = await axios.put(
          `${API_BASE_URL}/api/material-formula/${editFormula._id}`,
          payload,
          {
            headers: {
              'x-api-key': API_KEY,
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
          }
        );
      } else {
        response = await axios.post(
          `${API_BASE_URL}/api/material-formula`,
          payload,
          {
            headers: {
              'x-api-key': API_KEY,
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
          }
        );
      }

      alert(editFormula ? 'Material formula updated successfully' : 'Material formula created successfully');
      onSave(response.data.formula);
    } catch (error: any) {
      console.error('Error saving formula:', error);
      alert(error.response?.data?.message || 'Failed to save formula');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">
          {editFormula ? 'Edit Material Formula' : 'Create Material Formula'}
        </h2>
        <button
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          Cancel
        </button>
      </div>

      {/* Formula Name */}
      <div className="mb-4">
        <label className="block text-gray-700 mb-2 font-medium">
          Formula Name <span className="text-red-600">*</span>
        </label>
        <input
          type="text"
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={formulaName}
          onChange={(e) => setFormulaName(e.target.value)}
          placeholder="e.g., Standard Blue Bag Mix"
        />
      </div>

      {/* Product Type */}
      <div className="mb-4">
        <label className="block text-gray-700 mb-2 font-medium">
          Product Type <span className="text-red-600">*</span>
        </label>
        <select
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={selectedProductType}
          onChange={(e) => setSelectedProductType(e.target.value)}
        >
          <option value="">Select Product Type</option>
          {productTypes.map(pt => (
            <option key={pt._id} value={pt.productTypeName}>{pt.productTypeName}</option>
          ))}
        </select>
      </div>

      {/* Mixing Specifications */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-gray-700 mb-2 font-medium">Mixing Time (min)</label>
          <input
            type="number"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={mixingTime}
            onChange={(e) => setMixingTime(Number(e.target.value))}
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-2 font-medium">Temperature (°C)</label>
          <input
            type="number"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={mixingTemperature}
            onChange={(e) => setMixingTemperature(Number(e.target.value))}
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-2 font-medium">Mixing Speed</label>
          <select
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={mixingSpeed}
            onChange={(e) => setMixingSpeed(e.target.value)}
          >
            <option value="slow">Slow</option>
            <option value="medium">Medium</option>
            <option value="fast">Fast</option>
          </select>
        </div>
      </div>

      {/* Expected Output & Wastage */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-gray-700 mb-2 font-medium">Expected Output (%)</label>
          <input
            type="number"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={expectedOutput}
            onChange={(e) => setExpectedOutput(Number(e.target.value))}
            min="0"
            max="100"
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-2 font-medium">Expected Wastage (%)</label>
          <input
            type="number"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={expectedWastage}
            onChange={(e) => setExpectedWastage(Number(e.target.value))}
            min="0"
            max="100"
          />
        </div>
      </div>

      {/* Materials Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <label className="block text-gray-700 font-medium">
            Materials <span className="text-red-600">*</span>
          </label>
          <button
            onClick={addMaterial}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <span>+</span> Add Material
          </button>
        </div>

        {materials.length === 0 && (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No materials added yet. Click "Add Material" to start.</p>
          </div>
        )}

        {materials.map((material, index) => (
          <div key={index} className="p-4 border rounded-lg mb-3 bg-gray-50">
            <div className="grid grid-cols-12 gap-3 items-end">
              <div className="col-span-4">
                <label className="block text-sm text-gray-600 mb-1">Material</label>
                <select
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={material.materialId}
                  onChange={(e) => updateMaterial(index, 'materialId', e.target.value)}
                >
                  <option value="">Select Material</option>
                  {availableMaterials.map(m => (
                    <option key={m._id} value={m._id}>
                      {m.materialName} ({m.materialType?.typeName || 'N/A'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-sm text-gray-600 mb-1">Percentage (%)</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="%"
                  value={material.percentage}
                  onChange={(e) => updateMaterial(index, 'percentage', Number(e.target.value))}
                  min="0"
                  max="100"
                  step="0.01"
                />
              </div>

              <div className="col-span-3">
                <label className="block text-sm text-gray-600 mb-1">Weight per Unit (g/1000)</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="grams"
                  value={material.weightPerUnit}
                  onChange={(e) => updateMaterial(index, 'weightPerUnit', Number(e.target.value))}
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="col-span-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={material.isOptional}
                    onChange={(e) => updateMaterial(index, 'isOptional', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-600">Optional</span>
                </label>
              </div>

              <div className="col-span-1">
                <button
                  onClick={() => removeMaterial(index)}
                  className="w-full px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  title="Remove material"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Total Percentage Display */}
        {materials.length > 0 && (
          <div className={`mt-3 p-3 rounded ${totalPercentage === 100 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            <div className="flex justify-between items-center font-medium">
              <span>Total Percentage:</span>
              <span className="text-lg">{totalPercentage.toFixed(2)}%</span>
            </div>
            {totalPercentage !== 100 && (
              <p className="text-sm mt-1">Must equal 100% to save formula</p>
            )}
          </div>
        )}
      </div>

      {/* Notes */}
      <div className="mb-6">
        <label className="block text-gray-700 mb-2 font-medium">Notes</label>
        <textarea
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any additional notes about this formula..."
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={handleSave}
          disabled={totalPercentage !== 100 || loading || !formulaName || !selectedProductType || materials.length === 0}
          className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
        >
          {loading ? 'Saving...' : editFormula ? 'Update Formula' : 'Create Formula'}
        </button>
        <button
          onClick={onCancel}
          className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-medium"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default MaterialFormulaForm;
