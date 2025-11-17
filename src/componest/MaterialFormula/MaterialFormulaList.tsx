import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MaterialFormulaForm from './MaterialFormulaForm';

interface MaterialFormula {
  _id: string;
  formulaName: string;
  productType: string;
  materials: Array<{
    materialId: string;
    materialName: string;
    percentage: number;
    weightPerUnit: number;
  }>;
  mixingTimeMinutes: number;
  mixingTemperature: number;
  mixingSpeed: string;
  expectedOutput: number;
  expectedWastage: number;
  totalPercentage: number;
  isActive: boolean;
  version: number;
  createdAt: string;
}

const MaterialFormulaList: React.FC = () => {
  const [formulas, setFormulas] = useState<MaterialFormula[]>([]);
  const [filteredFormulas, setFilteredFormulas] = useState<MaterialFormula[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingFormula, setEditingFormula] = useState<MaterialFormula | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProductType, setFilterProductType] = useState('');
  const [filterActive, setFilterActive] = useState('all');

  const API_BASE_URL = import.meta.env.VITE_API_27INFINITY_IN;
  const API_KEY = import.meta.env.VITE_API_KEY;

  useEffect(() => {
    fetchFormulas();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, filterProductType, filterActive, formulas]);

  const fetchFormulas = async () => {
    setLoading(true);
    try {
      const branchId = localStorage.getItem('selectedBranch');
      const response = await axios.get(`${API_BASE_URL}/api/material-formula`, {
        params: { branchId },
        headers: {
          'x-api-key': API_KEY,
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      setFormulas(response.data.formulas || []);
    } catch (error) {
      console.error('Error fetching formulas:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...formulas];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(f =>
        f.formulaName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.productType.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Product type filter
    if (filterProductType) {
      filtered = filtered.filter(f => f.productType === filterProductType);
    }

    // Active status filter
    if (filterActive !== 'all') {
      filtered = filtered.filter(f => f.isActive === (filterActive === 'active'));
    }

    setFilteredFormulas(filtered);
  };

  const handleEdit = (formula: MaterialFormula) => {
    setEditingFormula(formula);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to deactivate this formula?')) return;

    try {
      await axios.delete(`${API_BASE_URL}/api/material-formula/${id}`, {
        headers: {
          'x-api-key': API_KEY,
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      alert('Formula deactivated successfully');
      fetchFormulas();
    } catch (error: any) {
      console.error('Error deleting formula:', error);
      alert(error.response?.data?.message || 'Failed to deactivate formula');
    }
  };

  const handleClone = async (id: string) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/material-formula/${id}/clone`,
        {},
        {
          headers: {
            'x-api-key': API_KEY,
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        }
      );
      alert('Formula cloned successfully');
      fetchFormulas();
    } catch (error: any) {
      console.error('Error cloning formula:', error);
      alert(error.response?.data?.message || 'Failed to clone formula');
    }
  };

  const handleSaveFormula = () => {
    setShowForm(false);
    setEditingFormula(undefined);
    fetchFormulas();
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingFormula(undefined);
  };

  const uniqueProductTypes = Array.from(new Set(formulas.map(f => f.productType)));

  if (showForm) {
    return (
      <MaterialFormulaForm
        onSave={handleSaveFormula}
        onCancel={handleCancelForm}
        editFormula={editingFormula}
      />
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Material Formulas</h1>
        <button
          onClick={() => setShowForm(true)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          + Create New Formula
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Search</label>
            <input
              type="text"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search by name or product type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Product Type</label>
            <select
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filterProductType}
              onChange={(e) => setFilterProductType(e.target.value)}
            >
              <option value="">All Product Types</option>
              {uniqueProductTypes.map(pt => (
                <option key={pt} value={pt}>{pt}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Status</label>
            <select
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filterActive}
              onChange={(e) => setFilterActive(e.target.value)}
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Formulas List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="text-gray-500">Loading formulas...</div>
        </div>
      ) : filteredFormulas.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <p className="text-gray-500 mb-4">No formulas found</p>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Create Your First Formula
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredFormulas.map((formula) => (
            <div
              key={formula._id}
              className={`bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow ${
                !formula.isActive ? 'opacity-60' : ''
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold">{formula.formulaName}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      formula.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {formula.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <span className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                      v{formula.version}
                    </span>
                  </div>
                  <p className="text-gray-600">Product Type: {formula.productType}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(formula)}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleClone(formula._id)}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Clone
                  </button>
                  {formula.isActive && (
                    <button
                      onClick={() => handleDelete(formula._id)}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Deactivate
                    </button>
                  )}
                </div>
              </div>

              {/* Mixing Specifications */}
              <div className="grid grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 rounded">
                <div>
                  <div className="text-sm text-gray-600">Mixing Time</div>
                  <div className="font-medium">{formula.mixingTimeMinutes} min</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Temperature</div>
                  <div className="font-medium">{formula.mixingTemperature}°C</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Expected Output</div>
                  <div className="font-medium">{formula.expectedOutput}%</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Expected Wastage</div>
                  <div className="font-medium">{formula.expectedWastage}%</div>
                </div>
              </div>

              {/* Materials */}
              <div>
                <h4 className="font-medium mb-2">Materials ({formula.materials.length}):</h4>
                <div className="space-y-2">
                  {formula.materials.map((material, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center p-3 bg-blue-50 rounded"
                    >
                      <span className="font-medium">{material.materialName}</span>
                      <div className="flex gap-4 text-sm">
                        <span className="text-gray-600">
                          {material.percentage}%
                        </span>
                        <span className="text-gray-600">
                          {material.weightPerUnit}g/unit
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 text-sm text-gray-500">
                Created: {new Date(formula.createdAt).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MaterialFormulaList;
