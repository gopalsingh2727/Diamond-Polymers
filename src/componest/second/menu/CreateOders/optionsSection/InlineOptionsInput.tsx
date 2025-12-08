import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getOptions } from '../../../../redux/option/optionActions';
import { Eye } from 'lucide-react';
import '../materialAndProduct/materialAndProduct.css';
import './optionsSection.css';

// OptionType specification template from backend
type SpecificationTemplate = {
  name: string;
  unit?: string;
  dataType: 'string' | 'number' | 'boolean' | 'date' | 'file' | 'link' | 'refer' | 'dropdown';
  defaultValue?: any;
  required?: boolean;
  allowFormula?: boolean;
  dropdownOptions?: string[];
  referenceTo?: string;
};

// Single option item type
export type OptionItem = {
  id: string;
  optionTypeId: string;
  optionTypeName: string;
  optionId: string;
  optionName: string;
  specificationValues: { [key: string]: any };
};

// Export type for backward compatibility - now returns array
export type OptionData = OptionItem[];

// OptionType data structure from allowedOptionTypes
interface AllowedOptionType {
  _id: string;
  name: string;
  code?: string;
  category?: string;
  specifications?: SpecificationTemplate[];
}

interface InlineOptionsInputProps {
  orderTypeId?: string;
  title: string;
  onDataChange: (data: OptionItem[]) => void;
  initialData?: OptionItem[];
  isEditMode?: boolean;
  allowedOptionTypes?: AllowedOptionType[];
}

// Generate unique ID for option items
const generateId = () => `option_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

// Create empty option item
const createEmptyOption = (): OptionItem => ({
  id: generateId(),
  optionTypeId: '',
  optionTypeName: '',
  optionId: '',
  optionName: '',
  specificationValues: {}
});

// Helper function to check if a value is a file object
const isFileValue = (value: any): boolean => {
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    return !!(value.fileName || value.name || value.fileSize || value.fileType || value.file);
  }
  return false;
};

// Helper function to get file URL for preview
const getFilePreviewUrl = (value: any): string | null => {
  console.log('📍 getFilePreviewUrl called with:', {
    value,
    hasFileUrl: !!value?.fileUrl,
    hasUrl: !!value?.url,
    hasFile: value?.file instanceof File,
    fileType: value?.fileType,
    fileName: value?.fileName
  });

  if (!value) {
    console.log('❌ No value provided');
    return null;
  }

  // Priority 1: If it has a fileUrl (Base64 or server URL)
  if (value.fileUrl) {
    console.log('✅ Found fileUrl:', value.fileUrl.substring(0, 50) + '...');
    return value.fileUrl;
  }

  // Priority 2: If it has a url property
  if (value.url) {
    console.log('✅ Found url:', value.url.substring(0, 50) + '...');
    return value.url;
  }

  // Priority 3: If it's a File object, create object URL
  if (value.file instanceof File) {
    const objectUrl = URL.createObjectURL(value.file);
    console.log('✅ Created object URL from File:', objectUrl);
    return objectUrl;
  }

  // Priority 4: If value itself is a File object
  if (value instanceof File) {
    const objectUrl = URL.createObjectURL(value);
    console.log('✅ Created object URL from direct File:', objectUrl);
    return objectUrl;
  }

  console.log('❌ No valid URL source found in value');
  return null;
};

// Helper function to get filename
const getFileName = (value: any): string => {
  if (value.fileName) return value.fileName;
  if (value.name) return value.name;
  if (value.filename) return value.filename;
  return 'file';
};

// Helper function to get file type
const getFileType = (value: any): string => {
  if (value.fileType) return value.fileType;
  if (value.type) return value.type;

  // Fallback: guess from filename extension
  const filename = getFileName(value);
  const ext = filename.split('.').pop()?.toLowerCase();

  if (ext === 'pdf') return 'application/pdf';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '')) return 'image/*';
  if (['doc', 'docx'].includes(ext || '')) return 'application/msword';
  if (['xls', 'xlsx'].includes(ext || '')) return 'application/vnd.ms-excel';

  return 'application/octet-stream';
};

// Helper function to check if file is an image
const isImageFile = (fileType: string): boolean => {
  return fileType.startsWith('image/');
};

// Helper function to check if file is a PDF
const isPdfFile = (fileType: string): boolean => {
  return fileType === 'application/pdf' || fileType.includes('pdf');
};

// Helper function to safely render specification values
const renderSpecValue = (value: any): string => {
  if (value === undefined || value === null || value === '') {
    return '-';
  }

  // Handle boolean first (before object check)
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  // Handle file objects - return empty string (will be handled by renderSpecCell)
  if (isFileValue(value)) {
    return '';
  }

  // Handle other objects
  if (typeof value === 'object' && !Array.isArray(value)) {
    try {
      return JSON.stringify(value);
    } catch (e) {
      return '[Object]';
    }
  }

  // Handle arrays
  if (Array.isArray(value)) {
    return value.join(', ');
  }

  // Handle everything else
  return String(value);
};

const InlineOptionsInput: React.FC<InlineOptionsInputProps> = ({
  orderTypeId,
  title,
  onDataChange,
  initialData = [],
  isEditMode = false,
  allowedOptionTypes = [],
}) => {
  const dispatch = useDispatch();
  const { options } = useSelector((state: any) => state.option || { options: [] });

  // Saved options list
  const [selectedOptions, setSelectedOptions] = useState<OptionItem[]>([]);

  // Popup state
  const [showPopup, setShowPopup] = useState(false);

  // Current option being edited in popup
  const [currentOption, setCurrentOption] = useState<OptionItem>(createEmptyOption());

  // Suggestions state
  const [showTypeSuggestions, setShowTypeSuggestions] = useState(false);
  const [showNameSuggestions, setShowNameSuggestions] = useState(false);

  // Selected backend option for loading specs
  const [selectedBackendOption, setSelectedBackendOption] = useState<any>(null);

  // File preview modal state
  const [filePreview, setFilePreview] = useState<{ url: string; name: string; type: string } | null>(null);

  // Refs for Enter key navigation
  const typeRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  // ✅ FIXED: Track if this is the initial mount to prevent infinite loops
  const isInitialMount = useRef(true);
  const hasLoadedInitialData = useRef(false);

  // Fetch options for this order type
  useEffect(() => {
    const branchId = localStorage.getItem('branchId') || '';
    dispatch(getOptions({ orderTypeId, branchId }) as any);
  }, [dispatch, orderTypeId]);

  // Debug: Log options data
  useEffect(() => {
    console.log('📦 Options data received:', options);
    if (options.length > 0) {
      console.log('📦 First option structure:', options[0]);
      console.log('📦 First option optionTypeId:', options[0]?.optionTypeId);
      console.log('📦 First option specifications:', options[0]?.optionTypeId?.specifications);
    }
  }, [options]);

  // Load initial data for edit mode (only once)
  useEffect(() => {
    console.log('🔍 InlineOptionsInput - Edit mode check:', {
      isEditMode,
      initialDataLength: initialData?.length || 0,
      initialData: initialData,
      hasLoadedInitialData: hasLoadedInitialData.current
    });

    // Only load initial data once in edit mode
    if (isEditMode && initialData && initialData.length > 0 && !hasLoadedInitialData.current) {
      console.log('✅ Loading options in edit mode (ONCE):', initialData);
      setSelectedOptions(initialData);
      hasLoadedInitialData.current = true;
    } else {
      console.log('❌ Not loading options:', {
        isEditMode,
        hasInitialData: !!initialData,
        initialDataLength: initialData?.length || 0,
        alreadyLoaded: hasLoadedInitialData.current
      });
    }
  }, [isEditMode, initialData]);

  // Notify parent of data changes (skip on initial mount in edit mode)
  useEffect(() => {
    // Skip on initial mount to prevent loop
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    console.log('📤 Notifying parent of data change:', selectedOptions.length, 'options');
    onDataChange(selectedOptions);
  }, [selectedOptions, onDataChange]);

  // Get unique option types - prioritize allowedOptionTypes from order type config
  console.log('🎯 allowedOptionTypes received:', allowedOptionTypes);
  console.log('🎯 allowedOptionTypes length:', allowedOptionTypes.length);

  const optionTypes = allowedOptionTypes.length > 0
    ? allowedOptionTypes.map((ot) => ot.name).filter(Boolean) as string[]
    : Array.from(
        new Set(
          options.map((opt: any) => opt.optionTypeId?.name || '')
        )
      ).filter(Boolean) as string[];

  console.log('🎯 Final optionTypes:', optionTypes);

  // Get option type data by name (for specs from allowedOptionTypes)
  const getOptionTypeByName = (typeName: string): AllowedOptionType | undefined => {
    return allowedOptionTypes.find((ot) => ot.name === typeName);
  };

  // Filter options by type name
  const getOptionsByType = (typeName: string) => {
    return options.filter(
      (opt: any) => opt.optionTypeId?.name === typeName
    );
  };

  // Open popup
  const openPopup = () => {
    setCurrentOption(createEmptyOption());
    setShowPopup(true);
    // Focus first field after popup opens
    setTimeout(() => typeRef.current?.focus(), 100);
  };

  // Handle Enter key navigation
  const handleKeyDown = (e: React.KeyboardEvent, field: 'type' | 'name' | 'spec') => {
    if (e.key === 'Enter') {
      e.preventDefault();

      if (field === 'type') {
        // Move to option name
        nameRef.current?.focus();
      } else if (field === 'name' || field === 'spec') {
        // Check if row is empty (end list)
        if (!currentOption.optionTypeName && !currentOption.optionName) {
          // Empty row - close popup
          setShowPopup(false);
        } else if (currentOption.optionTypeName && currentOption.optionName) {
          // Save current option and start new row
          setSelectedOptions(prev => {
            const updated = [...prev, { ...currentOption, id: generateId() }];
            // onDataChange will be called by useEffect
            return updated;
          });
          setCurrentOption(createEmptyOption());
          setSelectedBackendOption(null);
          // Focus back to first field
          typeRef.current?.focus();
        } else {
          // Missing required fields - move to first empty field
          if (!currentOption.optionTypeName) {
            typeRef.current?.focus();
          } else if (!currentOption.optionName) {
            nameRef.current?.focus();
          }
        }
      }
    }
  };

  // Update current option field
  const updateCurrentOption = (field: keyof OptionItem, value: any) => {
    setCurrentOption(prev => ({ ...prev, [field]: value }));
  };

  // Update specification value
  const updateSpecificationValue = (dimensionName: string, value: any) => {
    setCurrentOption(prev => ({
      ...prev,
      specificationValues: {
        ...prev.specificationValues,
        [dimensionName]: value
      }
    }));
  };

  // Option Type Selection Handler
  const handleTypeSelect = (selectedType: any) => {
    const typeName = selectedType.name || selectedType.optionTypeName || selectedType;

    setCurrentOption(prev => ({
      ...prev,
      optionTypeName: typeName,
      optionId: '',
      optionName: '',
      specificationValues: {}
    }));
    setSelectedBackendOption(null);
    setShowTypeSuggestions(false);
    // Focus on name field
    setTimeout(() => nameRef.current?.focus(), 100);
  };

  // Option Name Selection Handler
  const handleNameSelect = (selectedOption: any) => {
    console.log('🎯 Option selected:', selectedOption);
    console.log('🎯 Option name:', selectedOption.name);
    console.log('🎯 Option optionTypeId:', selectedOption.optionTypeId);
    console.log('🎯 Option optionSpecId:', selectedOption.optionSpecId);

    const optName = selectedOption.name || selectedOption.optionName || '';
    const optId = selectedOption._id || selectedOption.optionId || '';
    const typeId = selectedOption.optionTypeId?._id || selectedOption.optionTypeId || currentOption.optionTypeId || '';
    const typeName = selectedOption.optionTypeId?.name || currentOption.optionTypeName || '';

    // PRIORITY: Load specifications template from OptionSpec if exists, otherwise fall back to OptionType
    // This allows each Option to have its own specific template via OptionSpec
    let specs = [];
    if (selectedOption.optionSpecId?.specifications && selectedOption.optionSpecId.specifications.length > 0) {
      // Use OptionSpec template (specific to this Option)
      specs = selectedOption.optionSpecId.specifications;
      console.log('🎯 Using OptionSpec template:', specs);
    } else if (selectedOption.optionTypeId?.specifications && selectedOption.optionTypeId.specifications.length > 0) {
      // Fallback to OptionType template (generic for all options of this type)
      specs = selectedOption.optionTypeId.specifications;
      console.log('🎯 Using OptionType template (fallback):', specs);
    } else {
      console.log('⚠️ No specifications template found');
    }
    console.log('🎯 Specs length:', specs.length);

    // Initialize spec values from template (use defaultValue from template, or value from OptionSpec)
    const specValues = specs.reduce((acc: any, spec: any) => {
      // Use 'value' field if it exists (from OptionSpec), otherwise use 'defaultValue' (from template)
      acc[spec.name] = spec.value !== undefined ? spec.value : (spec.defaultValue || '');
      return acc;
    }, {});

    console.log('🎯 Spec values created:', specValues);
    console.log('🎯 Setting selectedBackendOption to:', selectedOption);

    setCurrentOption(prev => ({
      ...prev,
      optionId: optId,
      optionName: optName,
      optionTypeId: typeId || prev.optionTypeId,
      optionTypeName: typeName || prev.optionTypeName,
      specificationValues: specValues
    }));

    setSelectedBackendOption(selectedOption);
    setShowNameSuggestions(false);
  };

  // Remove option from list
  const handleRemoveOption = (index: number) => {
    const updated = selectedOptions.filter((_, i) => i !== index);
    setSelectedOptions(updated);
    // onDataChange will be called by useEffect
  };

  // Double-click to reopen popup
  const handleListDoubleClick = () => {
    if (!isEditMode) {
      openPopup();
    }
  };

  // Handle file preview
  const handleViewFile = (value: any) => {
    console.log('🔍 handleViewFile called with:', value);
    const url = getFilePreviewUrl(value);
    console.log('🔍 Generated URL:', url);
    const name = getFileName(value);
    console.log('🔍 File name:', name);
    const type = getFileType(value);
    console.log('🔍 File type:', type);
    if (url) {
      setFilePreview({ url, name, type });
    } else {
      console.error('❌ No URL available for file:', value);
      const errorDetails = `
File Preview Error:
- Has fileUrl: ${!!value?.fileUrl}
- Has url: ${!!value?.url}
- Has file: ${value?.file instanceof File}
- File name: ${name}
- File type: ${type}

This file was likely saved without a preview URL.
For files uploaded in this session, they should work.
For old files, you need to re-upload them.
      `.trim();
      alert(errorDetails);
      console.table({
        'Has fileUrl': !!value?.fileUrl,
        'Has url': !!value?.url,
        'Has File object': value?.file instanceof File,
        'File name': name,
        'File type': type,
        'fileName property': value?.fileName,
        'fileSize property': value?.fileSize
      });
    }
  };

  const getOptionData = (): OptionData => {
    return selectedOptions.map(option => ({
      id: option.id,
      optionTypeId: option.optionTypeId,
      optionTypeName: option.optionTypeName,
      optionId: option.optionId,
      optionName: option.optionName,
      specificationValues: option.specificationValues
    }));
  };

  return (
    <div>
      {/* Show trigger only when no options */}
      {selectedOptions.length === 0 && (
        <div
          onClick={() => !isEditMode && openPopup()}
          style={{
            cursor: isEditMode ? 'default' : 'pointer',
            padding: '10px 15px',
            color: '#666',
            fontSize: '14px'
          }}
        >
          Click to add options
        </div>
      )}

      {/* Options list display - grouped by Option Type */}
      {selectedOptions.length > 0 && (() => {
        // Group options by optionTypeId
        const groupedOptions: Record<string, OptionItem[]> = {};
        selectedOptions.forEach(option => {
          const typeKey = option.optionTypeId;
          if (!groupedOptions[typeKey]) {
            groupedOptions[typeKey] = [];
          }
          groupedOptions[typeKey].push(option);
        });

        return (
          <div onDoubleClick={handleListDoubleClick} style={{ cursor: isEditMode ? 'default' : 'pointer' }}>
            {Object.entries(groupedOptions).map(([typeId, optionsInGroup], groupIndex) => {
              // Get unique specification keys for THIS group only
              const groupSpecKeys = Array.from(
                new Set(
                  optionsInGroup.flatMap(opt => Object.keys(opt.specificationValues || {}))
                )
              );

              // Get option type name from first option in group
              const optionTypeName = optionsInGroup[0]?.optionTypeName || 'Unknown Type';

              return (
                <div
                  key={typeId}
                  className="SaveMixing"
                  style={{
                    marginBottom: groupIndex < Object.keys(groupedOptions).length - 1 ? '20px' : '0',
                    overflowX: 'auto'
                  }}
                >
                  {/* Option Type Header */}
                  <div style={{
                    color: '#000',
                    fontWeight: '600',
                    fontSize: '14px',
                    padding: '5px 0'
                  }}>
                    {optionTypeName}
                  </div>

                  <div className="SaveMixingDisplay">
                    {/* Table Header */}
                    <div className="SaveMixingHeaderRow" style={{
                      display: 'grid',
                      gridTemplateColumns: `50px 150px 150px ${groupSpecKeys.map(() => '120px').join(' ')} ${!isEditMode ? '50px' : ''}`,
                      gap: '8px'
                    }}>
                      <strong>#</strong>
                      <strong>Type</strong>
                      <strong>Name</strong>
                      {groupSpecKeys.map(key => (
                        <strong key={key}>{key}</strong>
                      ))}
                      {!isEditMode && <strong></strong>}
                    </div>

                    {optionsInGroup.map((option, groupRowIndex) => {
                      // Find original index for delete functionality
                      const originalIndex = selectedOptions.findIndex(o => o.id === option.id);

                      return (
                        <div key={option.id} className="SaveMixingstepRow" style={{
                          display: 'grid',
                          gridTemplateColumns: `50px 150px 150px ${groupSpecKeys.map(() => '120px').join(' ')} ${!isEditMode ? '50px' : ''}`,
                          gap: '8px'
                        }}>
                          <span>{groupRowIndex + 1}</span>
                          <span>{option.optionTypeName}</span>
                          <span>{option.optionName}</span>
                          {groupSpecKeys.map(key => {
                            const value = option.specificationValues?.[key];
                            const isFile = isFileValue(value);

                            // Debug: Log the value structure
                            if (isFile) {
                              console.log('🔍 File cell for key:', key, 'Value:', value);
                            }

                            return (
                              <span key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {isFile ? (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      console.log('👁️ Eye icon clicked for:', key, 'Value:', value);
                                      handleViewFile(value);
                                    }}
                                    style={{
                                      background: 'transparent',
                                      border: 'none',
                                      cursor: 'pointer',
                                      color: '#3b82f6',
                                      display: 'flex',
                                      alignItems: 'center',
                                      padding: '4px'
                                    }}
                                    title="View file"
                                  >
                                    <Eye size={18} />
                                  </button>
                                ) : (
                                  renderSpecValue(value)
                                )}
                              </span>
                            );
                          })}
                          {!isEditMode && (
                            <span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveOption(originalIndex);
                                }}
                                className="buttonStepRowNote"
                                style={{ color: '#dc2626', fontSize: '14px', fontWeight: 'bold' }}
                              >
                                ×
                              </button>
                            </span>
                          )}
                        </div>
                      );
                    })}

                  </div>
                </div>
              );
            })}
          </div>
        );
      })()}

      {/* Popup for adding options */}
      {showPopup && (
        <div
          className="createorderstartsections-popup-overlay"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999
          }}
          onClick={() => setShowPopup(false)}
        >
          <div
            className="createorderstartsections-popup"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'white',
              borderRadius: '10px',
              padding: '25px',
              minWidth: '800px',
              width: '95vw',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
              position: 'relative'
            }}
          >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setShowPopup(false)}
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  background: 'white',
                  border: '1px solid #ddd',
                  borderRadius: '50%',
                  width: '30px',
                  height: '30px',
                  fontSize: '20px',
                  cursor: 'pointer',
                  color: '#666',
                  lineHeight: 1,
                  zIndex: 1001,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ×
              </button>
              <h3 style={{ marginBottom: '10px', color: '#1e293b', textAlign: 'center', fontSize: '18px', fontWeight: '600' }}>
                Add Options
              </h3>

              {/* Info Box */}
              <div style={{
                padding: '10px 15px',
                backgroundColor: '#e3f2fd',
                border: '1px solid #90caf9',
                borderRadius: '4px',
                marginBottom: '15px',
                fontSize: '12px',
                color: '#1565c0'
              }}>
                Press Enter to move to next field. Enter on empty row to finish.
              </div>

              {/* Saved Options Rows */}
              <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '10px' }}>
                {selectedOptions.map((option, index) => (
                  <div key={option.id} className="createorderstartsections-popupitemall" style={{
                    gridTemplateColumns: '150px 150px auto 40px',
                    padding: '8px 0',
                    borderBottom: '1px solid #e5e7eb',
                    alignItems: 'center'
                  }}>
                    <span style={{ fontSize: '13px' }}>{option.optionTypeName}</span>
                    <span style={{ fontSize: '13px' }}>{option.optionName}</span>
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>
                      {Object.entries(option.specificationValues || {}).map(([key, value]) => (
                        <span key={key} style={{ marginRight: '10px' }}>
                          {key}: <strong>{renderSpecValue(value)}</strong>
                        </span>
                      ))}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(index)}
                      className="createorderstartsections-btn-remove"
                      title="Remove"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              {/* Current Input Row */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '150px 150px auto',
                gap: '10px',
                padding: '15px',
                backgroundColor: '#f9fafb',
                borderRadius: '6px',
                marginBottom: '15px'
              }}>
                {/* Option Type */}
                <div style={{ position: 'relative' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px', color: '#374151' }}>Type</label>
                  <input
                    ref={typeRef}
                    type="text"
                    value={currentOption.optionTypeName}
                    onChange={(e) => updateCurrentOption('optionTypeName', e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, 'type')}
                    placeholder="Select type"
                    onFocus={() => setShowTypeSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowTypeSuggestions(false), 200)}
                    className="createorderstartsections-tableInput"
                  />
                  {showTypeSuggestions && (
                    <div className="createorderstartsections-suggestion-list">
                      {optionTypes.length === 0 ? (
                        <div className="createorderstartsections-suggestionItem" style={{ color: '#999', fontStyle: 'italic' }}>
                          No option types available
                        </div>
                      ) : (
                        optionTypes
                          .filter(type =>
                            !currentOption.optionTypeName ||
                            type.toLowerCase().includes(currentOption.optionTypeName.toLowerCase())
                          )
                          .map((type, i) => (
                            <div
                              key={i}
                              className="createorderstartsections-suggestionItem"
                              onMouseDown={() => handleTypeSelect({ name: type })}
                            >
                              {type}
                            </div>
                          ))
                      )}
                    </div>
                  )}
                </div>

                {/* Option Name */}
                <div style={{ position: 'relative' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px', color: '#374151' }}>Name</label>
                  <input
                    ref={nameRef}
                    type="text"
                    value={currentOption.optionName}
                    onChange={(e) => updateCurrentOption('optionName', e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, 'name')}
                    placeholder="Select option"
                    onFocus={() => setShowNameSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowNameSuggestions(false), 200)}
                    className="createorderstartsections-tableInput"
                  />
                  {showNameSuggestions && currentOption.optionTypeName && (
                    <div className="createorderstartsections-suggestion-list">
                      {getOptionsByType(currentOption.optionTypeName).length === 0 ? (
                        <div className="createorderstartsections-suggestionItem" style={{ color: '#999', fontStyle: 'italic' }}>
                          No options available for this type
                        </div>
                      ) : (
                        getOptionsByType(currentOption.optionTypeName)
                          .filter((opt: any) =>
                            !currentOption.optionName ||
                            opt.name.toLowerCase().includes(currentOption.optionName.toLowerCase())
                          )
                          .slice(0, 10)
                          .map((opt: any, i: number) => (
                            <div
                              key={i}
                              className="createorderstartsections-suggestionItem"
                              onMouseDown={() => handleNameSelect(opt)}
                            >
                              <div style={{ fontWeight: 500 }}>{opt.name}</div>
                              {opt.code && (
                                <div style={{ fontSize: '11px', color: '#666' }}>Code: {opt.code}</div>
                              )}
                            </div>
                          ))
                      )}
                    </div>
                  )}
                </div>

                {/* Specifications Section - dynamically loaded */}
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                  {selectedBackendOption && (() => {
                    const specs = selectedBackendOption.optionSpecId?.specifications || selectedBackendOption.optionTypeId?.specifications;
                    return specs && Array.isArray(specs) && specs.length > 0;
                  })() && (
                    <>
                      {(() => {
                        const specs = selectedBackendOption.optionSpecId?.specifications || selectedBackendOption.optionTypeId?.specifications;
                        return specs || [];
                      })().map((spec: SpecificationTemplate, index: number) => (
                        <div key={index} style={{ minWidth: '120px', flex: '1' }}>
                          <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px', color: '#374151' }}>
                            {spec.name} {spec.unit ? `(${spec.unit})` : ''}
                          </label>
                          {spec.dataType === 'number' ? (
                            <input
                              type="number"
                              value={currentOption.specificationValues[spec.name] || ''}
                              onChange={(e) => {
                                const value = e.target.value;
                                if (value === '' || value === '-' || !isNaN(parseFloat(value))) {
                                  updateSpecificationValue(spec.name, value === '' ? '' : parseFloat(value) || value);
                                }
                              }}
                              onKeyDown={(e) => handleKeyDown(e, 'spec')}
                              placeholder={spec.name}
                              className="createorderstartsections-tableInput"
                            />
                          ) : spec.dataType === 'boolean' ? (
                            <select
                              value={currentOption.specificationValues[spec.name]?.toString() || 'false'}
                              onChange={(e) => updateSpecificationValue(spec.name, e.target.value === 'true')}
                              onKeyDown={(e) => handleKeyDown(e, 'spec')}
                              className="createorderstartsections-tableInput"
                            >
                              <option value="false">No</option>
                              <option value="true">Yes</option>
                            </select>
                          ) : spec.dataType === 'date' ? (
                            <input
                              type="date"
                              value={currentOption.specificationValues[spec.name] || ''}
                              onChange={(e) => updateSpecificationValue(spec.name, e.target.value)}
                              onKeyDown={(e) => handleKeyDown(e, 'spec')}
                              className="createorderstartsections-tableInput"
                            />
                          ) : spec.dataType === 'file' ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <input
                                type="file"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  const maxSizeInBytes = 50 * 1024 * 1024;
                                  if (file.size > maxSizeInBytes) {
                                    alert(`File too large! Max 50MB.`);
                                    e.target.value = '';
                                    return;
                                  }
                                  updateSpecificationValue(spec.name, file);
                                }}
                                style={{ display: 'none' }}
                                id={`file-${spec.name}-${index}`}
                              />
                              <label
                                htmlFor={`file-${spec.name}-${index}`}
                                className="createorderstartsections-addProductBtn"
                                style={{ cursor: 'pointer' }}
                              >
                                Choose
                              </label>
                              {currentOption.specificationValues[spec.name]?.name && (
                                <span style={{ fontSize: '11px', color: '#64748b' }}>
                                  {currentOption.specificationValues[spec.name].name.substring(0, 15)}...
                                </span>
                              )}
                            </div>
                          ) : spec.dataType === 'link' ? (
                            <input
                              type="url"
                              value={currentOption.specificationValues[spec.name] || ''}
                              onChange={(e) => updateSpecificationValue(spec.name, e.target.value)}
                              onKeyDown={(e) => handleKeyDown(e, 'spec')}
                              placeholder="https://..."
                              className="createorderstartsections-tableInput"
                            />
                          ) : spec.dataType === 'dropdown' ? (
                            <select
                              value={currentOption.specificationValues[spec.name] || ''}
                              onChange={(e) => updateSpecificationValue(spec.name, e.target.value)}
                              onKeyDown={(e) => handleKeyDown(e, 'spec')}
                              className="createorderstartsections-tableInput"
                            >
                              <option value="">Select</option>
                              {spec.dropdownOptions?.map((option, idx) => (
                                <option key={idx} value={option}>{option}</option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type="text"
                              value={currentOption.specificationValues[spec.name] || ''}
                              onChange={(e) => updateSpecificationValue(spec.name, e.target.value)}
                              onKeyDown={(e) => handleKeyDown(e, 'spec')}
                              placeholder={spec.name}
                              className="createorderstartsections-tableInput"
                            />
                          )}
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>

              {/* Add Option Button */}
              <button
                type="button"
                onClick={() => {
                  if (currentOption.optionTypeName && currentOption.optionName) {
                    setSelectedOptions(prev => [...prev, { ...currentOption, id: generateId() }]);
                    setCurrentOption(createEmptyOption());
                    setSelectedBackendOption(null);
                    typeRef.current?.focus();
                  }
                }}
                className="createorderstartsections-addProductBtn"
                style={{ alignSelf: 'center', padding: '8px 20px', fontSize: '13px', marginBottom: '15px' }}
              >
                + Add Option
              </button>

          </div>
        </div>
      )}

      {/* File Preview Modal */}
      {filePreview && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '20px'
          }}
          onClick={() => setFilePreview(null)}
        >
          <div
            style={{
              position: 'relative',
              width: isPdfFile(filePreview.type) ? '90vw' : 'auto',
              maxWidth: '90vw',
              height: isPdfFile(filePreview.type) ? '90vh' : 'auto',
              maxHeight: '90vh',
              backgroundColor: 'white',
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              display: 'flex',
              flexDirection: 'column'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid #e5e7eb',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#f9fafb',
                flexShrink: 0
              }}
            >
              <h3 style={{ margin: 0, fontSize: '16px', color: '#1f2937' }}>
                {filePreview.name}
              </h3>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {/* Download button */}
                <a
                  href={filePreview.url}
                  download={filePreview.name}
                  style={{
                    padding: '6px 12px',
                    background: '#10b981',
                    color: 'white',
                    borderRadius: '4px',
                    textDecoration: 'none',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                  title="Download file"
                >
                  Download
                </a>
                <button
                  onClick={() => setFilePreview(null)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    fontSize: '24px',
                    cursor: 'pointer',
                    color: '#6b7280',
                    padding: '4px 8px',
                    lineHeight: 1
                  }}
                  title="Close"
                >
                  ×
                </button>
              </div>
            </div>

            {/* File content */}
            <div
              style={{
                padding: isImageFile(filePreview.type) ? '20px' : '0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flex: 1,
                overflow: 'auto',
                minHeight: 0
              }}
            >
              {isImageFile(filePreview.type) ? (
                // Image preview
                <img
                  src={filePreview.url}
                  alt={filePreview.name}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain'
                  }}
                />
              ) : isPdfFile(filePreview.type) ? (
                // PDF preview using iframe
                <iframe
                  src={filePreview.url}
                  title={filePreview.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none'
                  }}
                />
              ) : (
                // Other file types - show message and download option
                <div style={{
                  padding: '40px',
                  textAlign: 'center',
                  color: '#6b7280'
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>📄</div>
                  <p style={{ fontSize: '16px', marginBottom: '8px', color: '#1f2937' }}>
                    {filePreview.name}
                  </p>
                  <p style={{ fontSize: '14px', marginBottom: '20px' }}>
                    Preview not available for this file type
                  </p>
                  <a
                    href={filePreview.url}
                    download={filePreview.name}
                    style={{
                      padding: '10px 20px',
                      background: '#3b82f6',
                      color: 'white',
                      borderRadius: '6px',
                      textDecoration: 'none',
                      fontSize: '14px',
                      display: 'inline-block'
                    }}
                  >
                    Download File
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InlineOptionsInput;
