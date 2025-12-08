import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getOptions } from '../../../../redux/option/optionActions';
import './optionsSection.css';

interface OptionItem {
  _id: string;
  optionId: string;
  optionName: string;
  optionCode: string;
  category: string;
  quantity: number;
  specificationValues: Array<{
    name: string;
    value: string | number;
    unit: string;
  }>;
  mixingData?: {
    enabled: boolean;
    components: Array<{
      optionId: string;
      optionName: string;
      percentage: number;
      weight: number;
    }>;
    totalWeight: number;
  };
}

interface OptionsSectionProps {
  category: 'product' | 'material' | 'printing' | 'packaging';
  title: string;
  onDataChange: (data: OptionItem[]) => void;
  initialData?: OptionItem[];
}

const OptionsSection: React.FC<OptionsSectionProps> = ({
  category,
  title,
  onDataChange,
  initialData = [],
}) => {
  const dispatch = useDispatch();
  const { options } = useSelector((state: any) => state.option || { options: [] });

  const [selectedOptions, setSelectedOptions] = useState<OptionItem[]>(initialData);
  const [showPopup, setShowPopup] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOptionId, setSelectedOptionId] = useState('');
  const [quantity, setQuantity] = useState<number>(1);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingField, setEditingField] = useState<'name' | 'code' | null>(null);
  const [editValue, setEditValue] = useState('');

  // Fetch options for this category
  useEffect(() => {
    const branchId = localStorage.getItem('branchId') || '';
    dispatch(getOptions({ category, branchId }) as any);
  }, [dispatch, category]);

  // Filter options by search term
  const filteredOptions = options.filter((opt: any) =>
    opt.optionTypeId?.category === category &&
    (opt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opt.code.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAddOption = () => {
    if (!selectedOptionId || !quantity || quantity <= 0) {
      alert('Please select an option and enter a valid quantity');
      return;
    }

    const option = options.find((o: any) => o._id === selectedOptionId);
    if (!option) {
      alert('Option not found');
      return;
    }

    // Create option item for order
    const optionItem: OptionItem = {
      _id: Date.now().toString(), // Temporary ID
      optionId: option._id,
      optionName: option.name,
      optionCode: option.code,
      category: option.optionTypeId?.category || category,
      quantity,
      specificationValues: option.specifications.map((spec: any) => ({
        name: spec.name,
        value: spec.value,
        unit: spec.unit || '',
      })),
      mixingData: option.mixingConfig?.enabled
        ? {
            enabled: true,
            components: option.mixingConfig.mixComponents.map((comp: any) => ({
              optionId: comp.optionId,
              optionName: comp.optionName,
              percentage: comp.percentage,
              weight: comp.weight,
            })),
            totalWeight: option.mixingConfig.mixComponents.reduce(
              (sum: number, comp: any) => sum + comp.weight,
              0
            ),
          }
        : undefined,
    };

    const updated = [...selectedOptions, optionItem];
    setSelectedOptions(updated);
    onDataChange(updated);

    // Reset form
    setSelectedOptionId('');
    setQuantity(1);
    setShowPopup(false);
    setSearchTerm('');
  };

  const handleRemoveOption = (index: number) => {
    const updated = selectedOptions.filter((_, i) => i !== index);
    setSelectedOptions(updated);
    onDataChange(updated);
  };

  const handleQuantityChange = (index: number, newQuantity: number) => {
    if (newQuantity <= 0) return;

    const updated = [...selectedOptions];
    updated[index].quantity = newQuantity;
    setSelectedOptions(updated);
    onDataChange(updated);
  };

  const handleStartEdit = (index: number, field: 'name' | 'code', currentValue: string) => {
    setEditingIndex(index);
    setEditingField(field);
    setEditValue(currentValue);
  };

  const handleSaveEdit = () => {
    if (editingIndex !== null && editingField && editValue.trim()) {
      const updated = [...selectedOptions];
      if (editingField === 'name') {
        updated[editingIndex].optionName = editValue.trim();
      } else if (editingField === 'code') {
        updated[editingIndex].optionCode = editValue.trim();
      }
      setSelectedOptions(updated);
      onDataChange(updated);
    }
    setEditingIndex(null);
    setEditingField(null);
    setEditValue('');
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditingField(null);
    setEditValue('');
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  return (
    <div className="optionsSectionContainer">
      <div className="optionsSectionHeader">
        <h3>{title}</h3>
        <button type="button" onClick={() => setShowPopup(true)} className="addOptionButton">
          + Add {category.charAt(0).toUpperCase() + category.slice(1)}
        </button>
      </div>

      {/* Selected Options List */}
      {selectedOptions.length > 0 && (
        <div className="selectedOptionsList">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Option</th>
                <th>Code</th>
                <th>Quantity</th>
                <th>Specifications</th>
                <th>Mixing</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {selectedOptions.map((item, index) => (
                <tr key={item._id}>
                  <td>{index + 1}</td>
                  <td>
                    {editingIndex === index && editingField === 'name' ? (
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={handleSaveEdit}
                        onKeyDown={handleEditKeyDown}
                        className="editableInput"
                        autoFocus
                      />
                    ) : (
                      <div className="editableCell">
                        <span
                          className="editableText"
                          onClick={() => handleStartEdit(index, 'name', item.optionName)}
                          onDoubleClick={() => handleStartEdit(index, 'name', item.optionName)}
                          title="Click to edit"
                        >
                          {item.optionName}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleStartEdit(index, 'name', item.optionName)}
                          className="editIconButton"
                          title="Edit"
                        >
                          ✏️
                        </button>
                      </div>
                    )}
                  </td>
                  <td>
                    {editingIndex === index && editingField === 'code' ? (
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={handleSaveEdit}
                        onKeyDown={handleEditKeyDown}
                        className="editableInput"
                        autoFocus
                      />
                    ) : (
                      <div className="editableCell">
                        <span
                          className="editableText"
                          onClick={() => handleStartEdit(index, 'code', item.optionCode)}
                          onDoubleClick={() => handleStartEdit(index, 'code', item.optionCode)}
                          title="Click to edit"
                        >
                          {item.optionCode}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleStartEdit(index, 'code', item.optionCode)}
                          className="editIconButton"
                          title="Edit"
                        >
                          ✏️
                        </button>
                      </div>
                    )}
                  </td>
                  <td>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(index, parseInt(e.target.value) || 1)}
                      min="1"
                      className="quantityInput"
                    />
                  </td>
                  <td>
                    <div className="specificationsList">
                      {item.specificationValues.slice(0, 3).map((spec, i) => (
                        <span key={i} className="specChip">
                          {spec.name}: {spec.value} {spec.unit}
                        </span>
                      ))}
                      {item.specificationValues.length > 3 && (
                        <span className="specMore">+{item.specificationValues.length - 3} more</span>
                      )}
                    </div>
                  </td>
                  <td>
                    {item.mixingData?.enabled ? (
                      <span className="mixingBadge">
                        {item.mixingData.components.length} components
                      </span>
                    ) : (
                      <span className="noMixing">-</span>
                    )}
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(index)}
                      className="removeButton"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Option Popup */}
      {showPopup && (
        <div className="popupOverlay" onClick={() => setShowPopup(false)}>
          <div className="popupContent" onClick={(e) => e.stopPropagation()}>
            <div className="popupHeader">
              <h3>Select {title}</h3>
              <button onClick={() => setShowPopup(false)} className="closeButton">
                ✕
              </button>
            </div>

            <div className="popupBody">
              {/* Search */}
              <div className="searchBox">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name or code..."
                  className="searchInput"
                />
              </div>

              {/* Option Selection */}
              <div className="optionSelection">
                <label>Select Option</label>
                <select
                  value={selectedOptionId}
                  onChange={(e) => setSelectedOptionId(e.target.value)}
                  className="optionSelect"
                >
                  <option value="">-- Select an option --</option>
                  {filteredOptions.map((opt: any) => (
                    <option key={opt._id} value={opt._id}>
                      {opt.name} ({opt.code})
                      {opt.optionTypeId?.name ? ` - ${opt.optionTypeId.name}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Option Preview */}
              {selectedOptionId && (
                <div className="optionPreview">
                  {(() => {
                    const selectedOption = options.find((o: any) => o._id === selectedOptionId);
                    if (!selectedOption) return null;

                    return (
                      <div className="previewCard">
                        <h4>{selectedOption.name}</h4>
                        <p className="optionCode">Code: {selectedOption.code}</p>

                        {/* Specifications */}
                        {selectedOption.specifications && selectedOption.specifications.length > 0 && (
                          <div className="previewSection">
                            <strong>Specifications:</strong>
                            <div className="specGrid">
                              {selectedOption.specifications.map((spec: any, i: number) => (
                                <div key={i} className="specItem">
                                  <span className="specName">{spec.name}:</span>
                                  <span className="specValue">
                                    {spec.value} {spec.unit}
                                    {spec.isCalculated && <span className="calcBadge">🧮</span>}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Mixing Info */}
                        {selectedOption.mixingConfig?.enabled && (
                          <div className="previewSection">
                            <strong>Mixing Components:</strong>
                            <ul className="mixComponentsList">
                              {selectedOption.mixingConfig.mixComponents.map((comp: any, i: number) => (
                                <li key={i}>
                                  {comp.optionName} - {comp.percentage}% ({comp.weight} units)
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Files */}
                        {selectedOption.files && selectedOption.files.length > 0 && (
                          <div className="previewSection">
                            <strong>Files:</strong>
                            <ul className="filesList">
                              {selectedOption.files.map((file: any, i: number) => (
                                <li key={i}>{file.originalFileName}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Links */}
                        {selectedOption.links && selectedOption.links.length > 0 && (
                          <div className="previewSection">
                            <strong>Links:</strong>
                            <ul className="linksList">
                              {selectedOption.links.map((link: any, i: number) => (
                                <li key={i}>
                                  <a href={link.url} target="_blank" rel="noopener noreferrer">
                                    {link.title}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Quantity */}
              <div className="quantitySection">
                <label>Quantity</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  min="1"
                  className="quantityInput"
                />
              </div>

              {/* Actions */}
              <div className="popupActions">
                <button type="button" onClick={handleAddOption} className="addButton">
                  Add to Order
                </button>
                <button type="button" onClick={() => setShowPopup(false)} className="cancelButton">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OptionsSection;
