import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Parser } from 'expr-eval';
import { createOption } from '../../../../redux/option/optionActions';
import { getOptionTypes } from '../../../../redux/option/optionTypeActions';
import './createOption.css';

interface Specification {
  name: string;
  value: string | number;
  unit: string;
  dataType: 'string' | 'number' | 'boolean';
  formula: string;
  isCalculated: boolean;
}

interface MixComponent {
  optionId: string;
  optionName: string;
  percentage: number;
  weight: number;
  order: number;
}

interface FileUpload {
  fileName: string;
  originalFileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  description: string;
}

interface Link {
  url: string;
  title: string;
  type: string;
  description: string;
}

const CreateOption: React.FC = () => {
  const dispatch = useDispatch();
  const { optionTypes } = useSelector((state: any) => state.optionType || { optionTypes: [] });
  const { options } = useSelector((state: any) => state.option || { options: [] });

  // Basic Info
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [selectedOptionTypeId, setSelectedOptionTypeId] = useState('');
  const [selectedOptionType, setSelectedOptionType] = useState<any>(null);

  // Specifications
  const [specifications, setSpecifications] = useState<Specification[]>([]);

  // Files
  const [files, setFiles] = useState<FileUpload[]>([]);

  // Links
  const [links, setLinks] = useState<Link[]>([]);
  const [currentLink, setCurrentLink] = useState<Link>({
    url: '',
    title: '',
    type: 'documentation',
    description: ''
  });

  // Mixing
  const [mixingEnabled, setMixingEnabled] = useState(false);
  const [mixComponents, setMixComponents] = useState<MixComponent[]>([]);

  useEffect(() => {
    dispatch(getOptionTypes() as any);
  }, [dispatch]);

  useEffect(() => {
    if (selectedOptionTypeId && optionTypes.length > 0) {
      const optionType = optionTypes.find((ot: any) => ot._id === selectedOptionTypeId);
      setSelectedOptionType(optionType);

      // Initialize specifications from template
      if (optionType?.specificationTemplate) {
        const initialSpecs = optionType.specificationTemplate.map((template: any) => ({
          name: template.name,
          value: template.defaultValue || '',
          unit: template.unit || '',
          dataType: template.dataType,
          formula: '',
          isCalculated: false
        }));
        setSpecifications(initialSpecs);
      }
    }
  }, [selectedOptionTypeId, optionTypes]);

  // Formula evaluation using expr-eval
  const evaluateDimensionFormulas = (specs: Specification[]): Specification[] => {
    const parser = new Parser();
    const context: Record<string, number> = {};

    return specs.map((spec) => {
      const updatedSpec = { ...spec };

      if (spec.formula && spec.formula.trim() !== '' && spec.dataType === 'number') {
        try {
          const expression = parser.parse(spec.formula);
          const result = expression.evaluate(context);
          updatedSpec.value = result;
          updatedSpec.isCalculated = true;
        } catch (error) {

          updatedSpec.isCalculated = false;
        }
      } else {
        updatedSpec.isCalculated = false;
      }

      // Add to context for subsequent formulas
      if (spec.dataType === 'number' && updatedSpec.value !== null && updatedSpec.value !== '') {
        context[spec.name] = Number(updatedSpec.value);
      }

      return updatedSpec;
    });
  };

  const updateSpecification = (index: number, field: keyof Specification, value: any) => {
    const updated = [...specifications];
    updated[index] = { ...updated[index], [field]: value };

    // If updating formula, mark as calculated
    if (field === 'formula') {
      updated[index].isCalculated = value && value.trim() !== '';
    }

    // Re-evaluate all formulas
    const evaluated = evaluateDimensionFormulas(updated);
    setSpecifications(evaluated);
  };

  // Calculate totals for numeric specifications
  const calculateTotal = (specName: string): number => {
    const spec = specifications.find((s) => s.name === specName);
    if (!spec || spec.dataType !== 'number') return 0;

    return specifications.
    filter((s) => s.name === specName && s.dataType === 'number').
    reduce((sum, s) => sum + (Number(s.value) || 0), 0);
  };

  // File upload handler (simplified - in production, upload to S3 first)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files;
    if (!uploadedFiles) return;

    Array.from(uploadedFiles).forEach((file) => {
      // In production, upload to S3 and get URL
      // For now, using base64 as placeholder
      const reader = new FileReader();
      reader.onload = () => {
        const fileData: FileUpload = {
          fileName: `${Date.now()}_${file.name}`,
          originalFileName: file.name,
          fileUrl: reader.result as string, // In production: S3 URL
          fileType: file.type,
          fileSize: file.size,
          description: ''
        };
        setFiles([...files, fileData]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveFile = (index: number) => {
    const updated = [...files];
    updated.splice(index, 1);
    setFiles(updated);
  };

  const handleAddLink = () => {
    if (!currentLink.url || !currentLink.title) {
      alert('URL and Title are required');
      return;
    }

    setLinks([...links, currentLink]);
    setCurrentLink({
      url: '',
      title: '',
      type: 'documentation',
      description: ''
    });
  };

  const handleRemoveLink = (index: number) => {
    const updated = [...links];
    updated.splice(index, 1);
    setLinks(updated);
  };

  const handleAddMixComponent = () => {
    setMixComponents([
    ...mixComponents,
    {
      optionId: '',
      optionName: '',
      percentage: 0,
      weight: 0,
      order: mixComponents.length
    }]
    );
  };

  const handleRemoveMixComponent = (index: number) => {
    const updated = [...mixComponents];
    updated.splice(index, 1);
    setMixComponents(updated);
  };

  const updateMixComponent = (index: number, field: keyof MixComponent, value: any) => {
    const updated = [...mixComponents];
    updated[index] = { ...updated[index], [field]: value };

    // If option selected, update name
    if (field === 'optionId' && value) {
      const option = options.find((o: any) => o._id === value);
      if (option) {
        updated[index].optionName = option.name;
      }
    }

    setMixComponents(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !code || !selectedOptionTypeId) {
      alert('Name, Code, and Option Type are required');
      return;
    }

    const branchId = localStorage.getItem('branchId') || '';

    const optionData = {
      name,
      code: code.toUpperCase(),
      optionTypeId: selectedOptionTypeId,
      specifications,
      files,
      links,
      mixingConfig: {
        enabled: mixingEnabled,
        mixComponents: mixingEnabled ? mixComponents : []
      },
      branchId,
      isActive: true
    };

    try {
      await dispatch(createOption(optionData) as any);
      alert('Option created successfully!');
      handleReset();
    } catch (error) {

      alert('Failed to create Option');
    }
  };

  const handleReset = () => {
    setName('');
    setCode('');
    setSelectedOptionTypeId('');
    setSelectedOptionType(null);
    setSpecifications([]);
    setFiles([]);
    setLinks([]);
    setCurrentLink({ url: '', title: '', type: 'documentation', description: '' });
    setMixingEnabled(false);
    setMixComponents([]);
  };

  return (
    <div className="createOptionContainer">
      <h2>Create Option</h2>

      <form onSubmit={handleSubmit} className="optionForm">
        {/* Basic Info */}
        <div className="formSection">
          <h3>Basic Information</h3>

          <div className="formGroup">
            <label>Option Type *</label>
            <select
              value={selectedOptionTypeId}
              onChange={(e) => setSelectedOptionTypeId(e.target.value)}
              required>

              <option value="">Select Option Type</option>
              {optionTypes.map((ot: any) =>
              <option key={ot._id} value={ot._id}>
                  {ot.name} ({ot.category})
                </option>
              )}
            </select>
          </div>

          <div className="formGroup">
            <label>Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., 500x300 LDPE Bag"
              required />

          </div>

          <div className="formGroup">
            <label>Code *</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g., LDPE-500-300"
              required />

          </div>
        </div>

        {/* Specifications */}
        {specifications.length > 0 &&
        <div className="formSection">
            <h3>Specifications</h3>
            <p className="sectionDescription">Enter values or formulas for auto-calculation</p>

            <div className="specificationsGrid">
              {specifications.map((spec, index) =>
            <div key={index} className="specificationItem">
                  <div className="specHeader">
                    <strong>{spec.name}</strong>
                    {spec.unit && <span className="specUnit">({spec.unit})</span>}
                    {spec.isCalculated && <span className="autoBadge">🧮 Auto</span>}
                  </div>

                  <div className="specInputs">
                    <div className="formGroup">
                      <label>Value</label>
                      <input
                    type={spec.dataType === 'number' ? 'number' : 'text'}
                    value={spec.value}
                    onChange={(e) => updateSpecification(index, 'value', e.target.value)}
                    disabled={spec.isCalculated}
                    className={spec.isCalculated ? 'calculatedField' : ''} />

                    </div>

                    {spec.dataType === 'number' &&
                <div className="formGroup">
                        <label>Formula (optional)</label>
                        <input
                    type="text"
                    value={spec.formula}
                    onChange={(e) => updateSpecification(index, 'formula', e.target.value)}
                    placeholder="e.g., width * height" />

                      </div>
                }
                  </div>
                </div>
            )}
            </div>

            {/* Total Row */}
            {specifications.some((s) => s.dataType === 'number') &&
          <div className="totalRow">
                <strong>Total:</strong>
                {specifications.
            filter((s) => s.dataType === 'number').
            map((spec) =>
            <span key={spec.name} className="totalItem">
                      {spec.name}: {calculateTotal(spec.name).toFixed(2)} {spec.unit}
                    </span>
            )}
              </div>
          }
          </div>
        }

        {/* File Upload */}
        <div className="formSection">
          <h3>Files</h3>
          <p className="sectionDescription">Upload images, PDFs, Excel files, CAD files, etc.</p>

          <div className="formGroup">
            <label>Upload Files</label>
            <input type="file" onChange={handleFileUpload} multiple />
          </div>

          {files.length > 0 &&
          <div className="filesList">
              {files.map((file, index) =>
            <div key={index} className="fileItem">
                  <div className="fileInfo">
                    <strong>{file.originalFileName}</strong>
                    <span className="fileSize">({(file.fileSize / 1024).toFixed(2)} KB)</span>
                  </div>
                  <button type="button" onClick={() => handleRemoveFile(index)} className="removeButton">
                    Remove
                  </button>
                </div>
            )}
            </div>
          }
        </div>

        {/* Links */}
        <div className="formSection">
          <h3>Links</h3>
          <p className="sectionDescription">Add reference URLs, documentation links, supplier links</p>

          <div className="linkForm">
            <div className="formRow">
              <div className="formGroup">
                <label>URL</label>
                <input
                  type="url"
                  value={currentLink.url}
                  onChange={(e) => setCurrentLink({ ...currentLink, url: e.target.value })}
                  placeholder="https://example.com" />

              </div>

              <div className="formGroup">
                <label>Title</label>
                <input
                  type="text"
                  value={currentLink.title}
                  onChange={(e) => setCurrentLink({ ...currentLink, title: e.target.value })}
                  placeholder="Link title" />

              </div>

              <div className="formGroup">
                <label>Type</label>
                <select
                  value={currentLink.type}
                  onChange={(e) => setCurrentLink({ ...currentLink, type: e.target.value })}>

                  <option value="documentation">Documentation</option>
                  <option value="reference">Reference</option>
                  <option value="supplier">Supplier</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <button type="button" onClick={handleAddLink} className="addButton">
                + Add Link
              </button>
            </div>
          </div>

          {links.length > 0 &&
          <div className="linksList">
              {links.map((link, index) =>
            <div key={index} className="linkItem">
                  <div className="linkInfo">
                    <strong>{link.title}</strong>
                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="linkUrl">
                      {link.url}
                    </a>
                    <span className="linkType">[{link.type}]</span>
                  </div>
                  <button type="button" onClick={() => handleRemoveLink(index)} className="removeButton">
                    Remove
                  </button>
                </div>
            )}
            </div>
          }
        </div>

        {/* Mixing Section */}
        {selectedOptionType?.allowMixing &&
        <div className="formSection">
            <h3>Mixing Configuration</h3>

            <div className="formGroup checkboxGroup">
              <label>
                <input
                type="checkbox"
                checked={mixingEnabled}
                onChange={(e) => setMixingEnabled(e.target.checked)} />

                Enable Mixing
              </label>
            </div>

            {mixingEnabled &&
          <div className="mixingSection">
                <button type="button" onClick={handleAddMixComponent} className="addButton">
                  + Add Component
                </button>

                {mixComponents.length > 0 &&
            <table className="mixTable">
                    <thead>
                      <tr>
                        <th>Option</th>
                        <th>Percentage (%)</th>
                        <th>Weight</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mixComponents.map((comp, index) =>
                <tr key={index}>
                          <td>
                            <select
                      value={comp.optionId}
                      onChange={(e) => updateMixComponent(index, 'optionId', e.target.value)}>

                              <option value="">Select Option</option>
                              {options.
                      filter(
                        (o: any) =>
                        o.optionTypeId?._id === selectedOptionTypeId ||
                        o.optionTypeId === selectedOptionTypeId
                      ).
                      map((o: any) =>
                      <option key={o._id} value={o._id}>
                                    {o.name}
                                  </option>
                      )}
                            </select>
                          </td>
                          <td>
                            <input
                      type="number"
                      value={comp.percentage}
                      onChange={(e) =>
                      updateMixComponent(index, 'percentage', parseFloat(e.target.value) || 0)
                      }
                      min="0"
                      max="100" />

                          </td>
                          <td>
                            <input
                      type="number"
                      value={comp.weight}
                      onChange={(e) => updateMixComponent(index, 'weight', parseFloat(e.target.value) || 0)}
                      min="0" />

                          </td>
                          <td>
                            <button
                      type="button"
                      onClick={() => handleRemoveMixComponent(index)}
                      className="removeButton">

                              Remove
                            </button>
                          </td>
                        </tr>
                )}
                    </tbody>
                  </table>
            }
              </div>
          }
          </div>
        }

        {/* Submit */}
        <div className="formActions">
          <button type="submit" className="submitButton">
            Create Option
          </button>
          <button type="button" onClick={handleReset} className="resetButton">
            Reset
          </button>
        </div>
      </form>
    </div>);

};

export default CreateOption;