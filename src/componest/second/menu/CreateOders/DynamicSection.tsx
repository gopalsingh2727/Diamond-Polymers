import React, { useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import OptimizedSuggestions from './SuggestionInput/OptimizedSuggestions';
import './DynamicForm.css';

// Type definitions
export type FieldConfig = {
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'suggestions';
  required: boolean;
  enabled: boolean;
};

export type SectionConfig = {
  id: string;
  name: string;
  enabled: boolean;
  order: number;
  fields: FieldConfig[];
};

export type FieldValue = string | number | boolean | null;

export interface DynamicSectionRef {
  getData: () => Record<string, FieldValue>;
  setData: (data: Record<string, FieldValue>) => void;
  validate: () => { valid: boolean; errors: string[] };
  reset: () => void;
}

interface DynamicSectionProps {
  config: SectionConfig;
  initialData?: Record<string, FieldValue>;
  isEditMode?: boolean;
  onDataChange?: (data: Record<string, FieldValue>) => void;
  suggestionTypeMap?: Record<string, string>;
  selectOptionsMap?: Record<string, { value: string; label: string }[]>;
}

const DynamicSection = forwardRef<DynamicSectionRef, DynamicSectionProps>(
  ({ config, initialData, isEditMode, onDataChange, suggestionTypeMap = {}, selectOptionsMap = {} }, ref) => {
    const [formData, setFormData] = useState<Record<string, FieldValue>>({});
    const [showSuggestions, setShowSuggestions] = useState<Record<string, boolean>>({});

    // Initialize form data from initialData or defaults
    useEffect(() => {
      if (initialData) {
        setFormData(initialData);
      } else {
        const defaultData: Record<string, FieldValue> = {};
        config.fields.forEach(field => {
          if (field.enabled) {
            defaultData[field.name] = field.type === 'number' ? 0 : '';
          }
        });
        setFormData(defaultData);
      }
    }, [initialData, config.fields]);

    // Notify parent of data changes
    useEffect(() => {
      if (onDataChange) {
        onDataChange(formData);
      }
    }, [formData, onDataChange]);

    // Handle field value change
    const handleFieldChange = (fieldName: string, value: FieldValue) => {
      setFormData(prev => ({
        ...prev,
        [fieldName]: value
      }));
    };

    // Handle suggestion selection
    const handleSuggestionSelect = (fieldName: string, selectedData: any) => {
      // Extract the relevant value based on field type
      let value = '';
      if (fieldName.includes('Type')) {
        value = selectedData.materialTypeName || selectedData.typeName || selectedData.name || '';
      } else {
        value = selectedData.materialName || selectedData.productName || selectedData.name || '';
      }

      handleFieldChange(fieldName, value);

      // Also set any related ID fields
      if (selectedData._id) {
        handleFieldChange(`${fieldName}Id`, selectedData._id);
      }

      setShowSuggestions(prev => ({ ...prev, [fieldName]: false }));
    };

    // Validate form data
    const validate = (): { valid: boolean; errors: string[] } => {
      const errors: string[] = [];

      config.fields.forEach(field => {
        if (field.enabled && field.required) {
          const value = formData[field.name];
          if (value === undefined || value === null || value === '') {
            errors.push(`${field.label} is required`);
          }
        }
      });

      return {
        valid: errors.length === 0,
        errors
      };
    };

    // Reset form data
    const reset = () => {
      const defaultData: Record<string, FieldValue> = {};
      config.fields.forEach(field => {
        if (field.enabled) {
          defaultData[field.name] = field.type === 'number' ? 0 : '';
        }
      });
      setFormData(defaultData);
    };

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      getData: () => formData,
      setData: (data: Record<string, FieldValue>) => setFormData(data),
      validate,
      reset
    }));

    // Render a single field
    const renderField = (field: FieldConfig) => {
      if (!field.enabled) return null;

      const value = formData[field.name] ?? '';

      switch (field.type) {
        case 'suggestions':
          const suggestionType = suggestionTypeMap[field.name] || 'materialType';
          return (
            <div key={field.name} className="dynamicField">
              <label>
                {field.label}
                {field.required && <span style={{ color: '#f44336' }}> *</span>}
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={String(value)}
                  onChange={(e) => handleFieldChange(field.name, e.target.value)}
                  placeholder={field.label}
                  onFocus={() => !isEditMode && setShowSuggestions(prev => ({ ...prev, [field.name]: true }))}
                  onBlur={() => setTimeout(() => setShowSuggestions(prev => ({ ...prev, [field.name]: false })), 200)}
                  readOnly={isEditMode}
                />
                {!isEditMode && (
                  <OptimizedSuggestions
                    searchTerm={String(value)}
                    onSelect={(data) => handleSuggestionSelect(field.name, data)}
                    suggestionType={suggestionType}
                    showSuggestions={showSuggestions[field.name] && String(value).length > 0}
                  />
                )}
              </div>
            </div>
          );

        case 'select':
          const options = selectOptionsMap[field.name] || [
            { value: '', label: 'Select' },
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' }
          ];
          return (
            <div key={field.name} className="dynamicField">
              <label>
                {field.label}
                {field.required && <span style={{ color: '#f44336' }}> *</span>}
              </label>
              <select
                value={String(value)}
                onChange={(e) => handleFieldChange(field.name, e.target.value)}
              >
                {options.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          );

        case 'number':
          return (
            <div key={field.name} className="dynamicField">
              <label>
                {field.label}
                {field.required && <span style={{ color: '#f44336' }}> *</span>}
              </label>
              <input
                type="number"
                value={value === '' ? '' : Number(value)}
                onChange={(e) => handleFieldChange(field.name, e.target.value ? parseFloat(e.target.value) : '')}
                placeholder={field.label}
              />
            </div>
          );

        case 'text':
        default:
          return (
            <div key={field.name} className="dynamicField">
              <label>
                {field.label}
                {field.required && <span style={{ color: '#f44336' }}> *</span>}
              </label>
              <input
                type="text"
                value={String(value)}
                onChange={(e) => handleFieldChange(field.name, e.target.value)}
                placeholder={field.label}
              />
            </div>
          );
      }
    };

    // Get enabled fields
    const enabledFields = config.fields.filter(f => f.enabled);

    // Calculate grid class based on number of fields
    const getGridClass = () => {
      const count = enabledFields.length;
      if (count <= 2) return 'dynamicFormRow-2';
      if (count <= 3) return 'dynamicFormRow-3';
      if (count <= 4) return 'dynamicFormRow-4';
      if (count <= 5) return 'dynamicFormRow-5';
      return 'dynamicFormRow-6';
    };

    if (!config.enabled) return null;

    return (
      <div className="dynamicSection with-border">
        <div className="dynamicSection-title">{config.name}</div>
        <div className={`dynamicFormRow ${getGridClass()}`}>
          {enabledFields.map(field => renderField(field))}
        </div>
      </div>
    );
  }
);

DynamicSection.displayName = 'DynamicSection';

export default DynamicSection;
