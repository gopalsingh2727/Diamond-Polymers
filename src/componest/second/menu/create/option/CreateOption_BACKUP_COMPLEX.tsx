import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createOption } from '../../../../redux/option/optionActions';
import { getOptionTypes } from '../../../../redux/option/optionTypeActions';
import { getOptionSpecs } from '../../../../redux/create/optionSpec/optionSpecActions';
import { RootState } from '../../../../redux/rootReducer';
import { AppDispatch } from '../../../../../store';
import OptimizedSuggestions from '../../CreateOders/SuggestionInput/OptimizedSuggestions';
import './createOption.css';
import '../../CreateOders/materialAndProduct/materialAndProduct.css';

interface FileUpload {
  fileName: string;
  originalFileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  description?: string;
}

interface Link {
  url: string;
  title: string;
  type?: string;
  description?: string;
}

interface MixComponent {
  optionId: string;
  optionName: string;
  optionTypeId: string;
  optionTypeName: string;
  percentage: number;
  weight: number;
}

interface OptionItem {
  id: string;
  name: string;
  code: string;
  optionTypeId: string;
  optionTypeName: string;
  optionSpecId: string;
  optionSpecName: string;
  files: FileUpload[];
  links: Link[];
  mixing: 'yes' | 'no';
  mixingData: MixComponent[];
}

// Generate unique ID
const generateId = () => `option_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Create empty option
const createEmptyOption = (): OptionItem => ({
  id: generateId(),
  name: '',
  code: '',
  optionTypeId: '',
  optionTypeName: '',
  optionSpecId: '',
  optionSpecName: '',
  files: [],
  links: [],
  mixing: 'no',
  mixingData: []
});

// Mixing Row Component
interface MixingRowProps {
  mix: MixComponent;
  index: number;
  onMixChange: (index: number, key: keyof MixComponent, value: string | number) => void;
  onRemove: (index: number) => void;
  isFirst: boolean;
}

const MixingRow: React.FC<MixingRowProps> = ({ mix, index, onMixChange, onRemove, isFirst }) => {
  const [showTypeSuggestions, setShowTypeSuggestions] = useState(false);
  const [showNameSuggestions, setShowNameSuggestions] = useState(false);

  const handleTypeSuggestionSelect = (data: any) => {
    const typeId = data._id || data.optionTypeId || '';
    const typeName = data.name || data.optionTypeName || '';

    if (typeId) onMixChange(index, 'optionTypeId', typeId);
    if (typeName) onMixChange(index, 'optionTypeName', typeName);
    setShowTypeSuggestions(false);
  };

  const handleNameSuggestionSelect = (data: any) => {
    const optId = data._id || data.optionId || '';
    const optName = data.name || data.optionName || '';
    const typeId = data.optionTypeId || mix.optionTypeId || '';
    const typeName = data.optionTypeName || mix.optionTypeName || '';

    if (optId) onMixChange(index, 'optionId', optId);
    if (optName) onMixChange(index, 'optionName', optName);
    if (typeId) onMixChange(index, 'optionTypeId', typeId);
    if (typeName) onMixChange(index, 'optionTypeName', typeName);
    setShowNameSuggestions(false);
  };

  return (
    <div className="popupitemall">
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          value={mix.optionTypeName}
          onChange={(e) => onMixChange(index, 'optionTypeName', e.target.value)}
          placeholder="Option Type"
          readOnly={isFirst}
          onFocus={() => !isFirst && setShowTypeSuggestions(true)}
          onBlur={() => setTimeout(() => setShowTypeSuggestions(false), 200)}
          style={isFirst ? { backgroundColor: '#f5f5f5', cursor: 'not-allowed' } : {}}
        />
        {!isFirst && (
          <OptimizedSuggestions
            searchTerm={mix.optionTypeName}
            onSelect={handleTypeSuggestionSelect}
            suggestionType="optionType"
            showSuggestions={showTypeSuggestions && mix.optionTypeName.length > 0}
          />
        )}
      </div>

      <div style={{ position: 'relative' }}>
        <input
          type="text"
          value={mix.optionName}
          onChange={(e) => onMixChange(index, 'optionName', e.target.value)}
          placeholder="Option Name"
          readOnly={isFirst}
          onFocus={() => !isFirst && setShowNameSuggestions(true)}
          onBlur={() => setTimeout(() => setShowNameSuggestions(false), 200)}
          style={isFirst ? { backgroundColor: '#f5f5f5', cursor: 'not-allowed' } : {}}
        />
        {!isFirst && (
          <OptimizedSuggestions
            searchTerm={mix.optionName}
            onSelect={handleNameSuggestionSelect}
            suggestionType="optionName"
            filterBy={mix.optionTypeId}
            showSuggestions={showNameSuggestions && mix.optionName.length > 0 && mix.optionTypeId.length > 0}
          />
        )}
      </div>

      <input
        type="number"
        value={mix.weight}
        onChange={(e) => onMixChange(index, 'weight', parseFloat(e.target.value) || 0)}
        placeholder="Weight"
      />

      <input
        type="number"
        value={mix.percentage}
        onChange={(e) => onMixChange(index, 'percentage', parseFloat(e.target.value) || 0)}
        placeholder="Percentage"
      />

      {!isFirst && (
        <button
          onClick={() => onRemove(index)}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '18px',
            cursor: 'pointer',
            color: '#ff4444',
            padding: '5px'
          }}
          title="Remove Row"
        >
          ✕
        </button>
      )}
    </div>
  );
};

const CreateOptionNew: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  // Redux selectors
  const { optionTypes } = useSelector((state: RootState) => state.optionType);
  const { optionSpecs } = useSelector((state: RootState) => state.optionSpec);

  // Saved options list
  const [options, setOptions] = useState<OptionItem[]>([]);

  // Popup state
  const [showPopup, setShowPopup] = useState(false);

  // Current option being edited in popup
  const [currentOption, setCurrentOption] = useState<OptionItem>(createEmptyOption());

  // Suggestions state
  const [showOptionTypeSuggestions, setShowOptionTypeSuggestions] = useState(false);
  const [showOptionSpecSuggestions, setShowOptionSpecSuggestions] = useState(false);

  // Mixing popup
  const [showMixingPopup, setShowMixingPopup] = useState(false);
  const [mixComponents, setMixComponents] = useState<MixComponent[]>([]);

  // File/Link management
  const [currentLink, setCurrentLink] = useState<Link>({ url: '', title: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Refs for Enter key navigation
  const nameRef = useRef<HTMLInputElement>(null);
  const codeRef = useRef<HTMLInputElement>(null);
  const optionTypeRef = useRef<HTMLInputElement>(null);
  const optionSpecRef = useRef<HTMLInputElement>(null);

  // Load option types and specs on mount
  useEffect(() => {
    dispatch(getOptionTypes({}));
    dispatch(getOptionSpecs({}));
  }, [dispatch]);

  // Update mix components when main option changes
  useEffect(() => {
    if (currentOption.mixing === 'yes' && currentOption.optionTypeId && currentOption.name) {
      setMixComponents(prev => {
        const updated = [...prev];
        if (updated.length > 0) {
          updated[0] = {
            optionId: currentOption.id,
            optionName: currentOption.name,
            optionTypeId: currentOption.optionTypeId,
            optionTypeName: currentOption.optionTypeName,
            weight: updated[0].weight,
            percentage: updated[0].percentage
          };
        }
        return updated;
      });
    }
  }, [currentOption.optionTypeId, currentOption.name, currentOption.optionTypeName, currentOption.id, currentOption.mixing]);

  // Open popup
  const openPopup = () => {
    setCurrentOption(createEmptyOption());
    setShowPopup(true);
    setTimeout(() => nameRef.current?.focus(), 100);
  };

  // Handle Enter key navigation
  const handleKeyDown = (e: React.KeyboardEvent, field: 'name' | 'code' | 'type' | 'spec') => {
    if (e.key === 'Enter') {
      e.preventDefault();

      if (field === 'name') {
        codeRef.current?.focus();
      } else if (field === 'code') {
        optionTypeRef.current?.focus();
      } else if (field === 'type') {
        optionSpecRef.current?.focus();
      } else if (field === 'spec') {
        // Check if ready to save
        if (!currentOption.name && !currentOption.code && !currentOption.optionTypeName) {
          // Empty row - close popup
          setShowPopup(false);
        } else if (currentOption.name && currentOption.code && currentOption.optionTypeName) {
          // Save current option and start new row
          saveCurrentOption();
          setCurrentOption(createEmptyOption());
          nameRef.current?.focus();
        } else {
          // Missing required fields
          if (!currentOption.name) {
            nameRef.current?.focus();
          } else if (!currentOption.code) {
            codeRef.current?.focus();
          } else if (!currentOption.optionTypeName) {
            optionTypeRef.current?.focus();
          }
        }
      }
    }
  };

  // Update current option field
  const updateCurrentOption = (field: keyof OptionItem, value: any) => {
    setCurrentOption(prev => ({ ...prev, [field]: value }));
  };

  // Option Type Selection Handler
  const handleOptionTypeSelect = (selectedType: any) => {
    const typeId = selectedType._id || selectedType.optionTypeId || '';
    const typeName = selectedType.name || selectedType.optionTypeName || '';

    setCurrentOption(prev => ({
      ...prev,
      optionTypeId: typeId,
      optionTypeName: typeName,
      optionSpecId: '',
      optionSpecName: ''
    }));
    setShowOptionTypeSuggestions(false);
  };

  // Option Spec Selection Handler
  const handleOptionSpecSelect = (selectedSpec: any) => {
    const specId = selectedSpec._id || selectedSpec.optionSpecId || '';
    const specName = selectedSpec.name || selectedSpec.specName || '';

    setCurrentOption(prev => ({
      ...prev,
      optionSpecId: specId,
      optionSpecName: specName
    }));
    setShowOptionSpecSuggestions(false);
  };

  // Handle mixing change
  const handleMixingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as 'yes' | 'no';
    setCurrentOption(prev => ({ ...prev, mixing: value }));

    if (value === 'yes') {
      if (currentOption.optionTypeId && currentOption.name) {
        setMixComponents([
          {
            optionId: currentOption.id,
            optionName: currentOption.name,
            optionTypeId: currentOption.optionTypeId,
            optionTypeName: currentOption.optionTypeName,
            weight: 0,
            percentage: 0
          }
        ]);
        setShowMixingPopup(true);
      } else {
        alert('Please fill option name and type first');
        setCurrentOption(prev => ({ ...prev, mixing: 'no' }));
      }
    } else {
      setMixComponents([]);
      setCurrentOption(prev => ({ ...prev, mixingData: [] }));
    }
  };

  // Mixing component handlers
  const handleMixChange = (index: number, key: keyof MixComponent, value: string | number) => {
    setMixComponents(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [key]: value };
      return updated;
    });
  };

  const handleAddMixRow = () => {
    setMixComponents(prev => [...prev, {
      optionId: '',
      optionName: '',
      optionTypeId: '',
      optionTypeName: '',
      weight: 0,
      percentage: 0
    }]);
  };

  const handleRemoveMixRow = (index: number) => {
    setMixComponents(prev => prev.filter((_, i) => i !== index));
  };

  const saveMixing = () => {
    setCurrentOption(prev => ({ ...prev, mixingData: mixComponents }));
    setShowMixingPopup(false);
  };

  // File upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files;
    if (!uploadedFiles) return;

    const newFiles: FileUpload[] = Array.from(uploadedFiles).map(file => ({
      fileName: file.name,
      originalFileName: file.name,
      fileUrl: URL.createObjectURL(file),
      fileType: file.type,
      fileSize: file.size,
      description: ''
    }));

    setCurrentOption(prev => ({
      ...prev,
      files: [...prev.files, ...newFiles]
    }));
  };

  const removeFile = (index: number) => {
    setCurrentOption(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }));
  };

  // Link handlers
  const addLink = () => {
    if (!currentLink.url || !currentLink.title) {
      alert('Please provide both URL and title');
      return;
    }

    setCurrentOption(prev => ({
      ...prev,
      links: [...prev.links, { ...currentLink }]
    }));
    setCurrentLink({ url: '', title: '' });
  };

  const removeLink = (index: number) => {
    setCurrentOption(prev => ({
      ...prev,
      links: prev.links.filter((_, i) => i !== index)
    }));
  };

  // Save current option to list
  const saveCurrentOption = () => {
    setOptions(prev => [...prev, { ...currentOption, id: generateId() }]);
  };

  // Remove option from list
  const handleRemoveOption = (index: number) => {
    setOptions(prev => prev.filter((_, i) => i !== index));
  };

  // Submit all options
  const handleSubmit = async () => {
    if (options.length === 0) {
      alert('Please add at least one option');
      return;
    }

    try {
      const branchId = localStorage.getItem('branchId') || '';

      for (const option of options) {
        await dispatch(createOption({
          name: option.name,
          code: option.code,
          optionTypeId: option.optionTypeId,
          optionSpecId: option.optionSpecId || undefined,
          files: option.files,
          links: option.links,
          mixingConfig: {
            enabled: option.mixing === 'yes',
            mixComponents: option.mixingData
          },
          branchId
        }));
      }

      alert('All options created successfully!');
      setOptions([]);
      setCurrentOption(createEmptyOption());
    } catch (error: any) {
      alert(error.message || 'Failed to create options');
    }
  };

  // Filter optionSpecs by selected optionTypeId
  const filteredOptionSpecs = currentOption.optionTypeId
    ? optionSpecs.filter((spec: any) => spec.optionTypeId === currentOption.optionTypeId)
    : [];

  return (
    <div className="createProductCss">
      <h2>Create Options</h2>

      {/* Show trigger only when no options */}
      {options.length === 0 && (
        <div className="materialForm">
          <div>
            <label>Option Name</label>
            <input
              type="text"
              value=""
              placeholder="Click to add options"
              className="inputBox"
              onClick={openPopup}
              readOnly
              style={{ cursor: 'pointer' }}
            />
          </div>
        </div>
      )}

      {/* Options list display */}
      {options.length > 0 && (
        <div className="SaveMixing" onDoubleClick={openPopup} style={{ cursor: 'pointer' }}>
          <div className="SaveMixingDisplay">
            <div className="SaveMixingHeaderRow">
              <strong>#</strong>
              <strong>Name</strong>
              <strong>Code</strong>
              <strong>Type</strong>
              <strong>Spec</strong>
              <strong>Files</strong>
              <strong>Links</strong>
              <strong>Mixing</strong>
              <strong></strong>
            </div>

            {options.map((option, index) => (
              <div key={option.id} className="SaveMixingstepRow">
                <span>{index + 1}</span>
                <span>{option.name}</span>
                <span>{option.code}</span>
                <span>{option.optionTypeName}</span>
                <span>{option.optionSpecName || '-'}</span>
                <span>{option.files.length}</span>
                <span>{option.links.length}</span>
                <span>{option.mixing}</span>
                <span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveOption(index);
                    }}
                    className="buttonStepRowNote"
                    style={{ color: '#dc2626', fontSize: '14px', fontWeight: 'bold' }}
                  >
                    ✕
                  </button>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Popup for adding options */}
      {showPopup && (
        <div className="popup-overlay Machine-Table">
          <div className="popup Machine-Table" style={{ maxHeight: '80vh', overflowY: 'auto', minWidth: '800px', background: 'white' }}>
            <h3 style={{ marginBottom: '10px', color: '#1e293b' }}>Add Options</h3>
            <p style={{ fontSize: '11px', color: '#6b7280', marginBottom: '15px' }}>
              Press Enter to move to next field. Enter on empty row to finish.
            </p>

            {/* Main Fields - Horizontal Scroll */}
            <div style={{
              display: 'flex',
              flexDirection: 'row',
              gap: '12px',
              overflowX: 'auto',
              overflowY: 'hidden',
              paddingBottom: '10px',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              marginBottom: '20px'
            }}>
              {/* Name */}
              <div style={{ position: 'relative', minWidth: '200px', flexShrink: 0 }}>
                <label style={{ display: 'block' }}>Name *</label>
                <input
                  ref={nameRef}
                  type="text"
                  value={currentOption.name}
                  onChange={(e) => updateCurrentOption('name', e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, 'name')}
                  placeholder="Name & Enter"
                  className="createDivInput createDivInputwidth"
                />
              </div>

              {/* Code */}
              <div style={{ minWidth: '150px', flexShrink: 0 }}>
                <label style={{ display: 'block' }}>Code *</label>
                <input
                  ref={codeRef}
                  type="text"
                  value={currentOption.code}
                  onChange={(e) => updateCurrentOption('code', e.target.value.toUpperCase())}
                  onKeyDown={(e) => handleKeyDown(e, 'code')}
                  placeholder="Code & Enter"
                  className="createDivInput createDivInputwidth"
                />
              </div>

              {/* Option Type */}
              <div style={{ position: 'relative', minWidth: '200px', flexShrink: 0 }}>
                <label style={{ display: 'block' }}>Option Type *</label>
                <input
                  ref={optionTypeRef}
                  type="text"
                  value={currentOption.optionTypeName}
                  onChange={(e) => updateCurrentOption('optionTypeName', e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, 'type')}
                  placeholder="Type & Enter"
                  onFocus={() => setShowOptionTypeSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowOptionTypeSuggestions(false), 200)}
                  className="createDivInput createDivInputwidth"
                />
                <OptimizedSuggestions
                  searchTerm={currentOption.optionTypeName}
                  onSelect={handleOptionTypeSelect}
                  suggestionType="optionType"
                  showSuggestions={showOptionTypeSuggestions && currentOption.optionTypeName.length > 0}
                />
              </div>

              {/* Option Spec */}
              <div style={{ position: 'relative', minWidth: '200px', flexShrink: 0 }}>
                <label style={{ display: 'block' }}>Option Spec</label>
                <input
                  ref={optionSpecRef}
                  type="text"
                  value={currentOption.optionSpecName}
                  onChange={(e) => {
                    const searchTerm = e.target.value;
                    updateCurrentOption('optionSpecName', searchTerm);
                    setShowOptionSpecSuggestions(true);
                  }}
                  onKeyDown={(e) => handleKeyDown(e, 'spec')}
                  placeholder="Select spec (optional)"
                  onFocus={() => setShowOptionSpecSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowOptionSpecSuggestions(false), 200)}
                  className="createDivInput createDivInputwidth"
                  disabled={!currentOption.optionTypeId}
                />
                {showOptionSpecSuggestions && currentOption.optionTypeId && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    background: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '4px',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    zIndex: 1000,
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                  }}>
                    {filteredOptionSpecs.map((spec: any) => (
                      <div
                        key={spec._id}
                        onClick={() => handleOptionSpecSelect(spec)}
                        style={{
                          padding: '8px 12px',
                          cursor: 'pointer',
                          borderBottom: '1px solid #f1f5f9'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                      >
                        <div style={{ fontWeight: 500 }}>{spec.name}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>{spec.code}</div>
                      </div>
                    ))}
                    {filteredOptionSpecs.length === 0 && (
                      <div style={{ padding: '12px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                        No specs found for this type
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Mixing */}
              <div style={{ minWidth: '150px', flexShrink: 0 }}>
                <label style={{ display: 'block' }}>Mixing</label>
                <select
                  value={currentOption.mixing}
                  onChange={handleMixingChange}
                  className="createDivInput createDivInputwidth"
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </div>
            </div>

            {/* File Upload Section */}
            <div style={{ marginBottom: '20px', padding: '12px', background: '#f8fafc', borderRadius: '6px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Files</label>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                style={{
                  padding: '8px 16px',
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '13px'
                }}
              >
                + Upload Files
              </button>
              {currentOption.files.length > 0 && (
                <div style={{ marginTop: '10px' }}>
                  {currentOption.files.map((file, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px', background: 'white', borderRadius: '4px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '12px' }}>{file.originalFileName}</span>
                      <button onClick={() => removeFile(idx)} style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Links Section */}
            <div style={{ marginBottom: '20px', padding: '12px', background: '#f8fafc', borderRadius: '6px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Links</label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <input
                  type="text"
                  placeholder="Title"
                  value={currentLink.title}
                  onChange={(e) => setCurrentLink(prev => ({ ...prev, title: e.target.value }))}
                  style={{ flex: 1, padding: '8px', border: '1px solid #e2e8f0', borderRadius: '4px', fontSize: '13px' }}
                />
                <input
                  type="url"
                  placeholder="URL"
                  value={currentLink.url}
                  onChange={(e) => setCurrentLink(prev => ({ ...prev, url: e.target.value }))}
                  style={{ flex: 2, padding: '8px', border: '1px solid #e2e8f0', borderRadius: '4px', fontSize: '13px' }}
                />
                <button
                  onClick={addLink}
                  style={{
                    padding: '8px 16px',
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '13px'
                  }}
                >
                  + Add
                </button>
              </div>
              {currentOption.links.length > 0 && (
                <div>
                  {currentOption.links.map((link, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px', background: 'white', borderRadius: '4px', marginBottom: '4px' }}>
                      <div style={{ fontSize: '12px' }}>
                        <strong>{link.title}</strong> - {link.url}
                      </div>
                      <button onClick={() => removeLink(idx)} style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Options added so far */}
            {options.length > 0 && (
              <div style={{ marginTop: '15px', padding: '10px', background: '#f9fafb', borderRadius: '6px', maxHeight: '120px', overflowY: 'auto' }}>
                <div style={{ fontSize: '11px', fontWeight: '600', color: '#6b7280', marginBottom: '8px' }}>
                  Options added: {options.length}
                </div>
                {options.map((opt, i) => (
                  <div key={opt.id} style={{ fontSize: '12px', padding: '2px 0', color: '#374151' }}>
                    {i + 1}. {opt.name} ({opt.code}) - {opt.optionTypeName}
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => setShowPopup(false)}
              style={{
                marginTop: '15px',
                padding: '10px 20px',
                background: '#64748b',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Mixing Popup */}
      {showMixingPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <div className="popup-content">
              <h3>Mixing Components</h3>
              <div className="headerRowmaterialMixpop">
                <span>Type</span>
                <span>Name</span>
                <span>Weight (kg)</span>
                <span>%</span>
              </div>
              {mixComponents.map((mix, i) => (
                <MixingRow
                  key={i}
                  mix={mix}
                  index={i}
                  onMixChange={handleMixChange}
                  onRemove={handleRemoveMixRow}
                  isFirst={i === 0}
                />
              ))}
              <button
                onClick={handleAddMixRow}
                style={{
                  marginTop: '10px',
                  padding: '8px 16px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                + Add Row
              </button>
              <div className="popupButtons">
                <button onClick={saveMixing} className="saveButton">
                  Save
                </button>
                <button onClick={() => setShowMixingPopup(false)} className="cancelButton">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Saved Mixing Display */}
      {currentOption.mixingData.length > 0 && (
        <div className="SaveMixing" style={{ marginTop: '20px' }}>
          <div className="SaveMixingDisplay">
            <div className="SaveMixingHeaderRow">
              <strong>#</strong>
              <strong>Option Name</strong>
              <strong>Option Type</strong>
              <strong>Weight (kg)</strong>
              <strong>Percentage (%)</strong>
            </div>
            {currentOption.mixingData.map((mix, index) => (
              <div key={index} className="SaveMixingstepRow">
                <span>{index + 1}</span>
                <span>{mix.optionName}</span>
                <span>{mix.optionTypeName}</span>
                <span>{mix.weight.toFixed(2)}</span>
                <span>{mix.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Submit Button */}
      {options.length > 0 && (
        <button
          onClick={handleSubmit}
          style={{
            marginTop: '20px',
            width: '100%',
            padding: '14px',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 600
          }}
        >
          💾 Save All Options ({options.length})
        </button>
      )}
    </div>
  );
};

export default CreateOptionNew;
