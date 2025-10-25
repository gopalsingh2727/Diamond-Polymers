import { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import StepSuggestions from "./SuggestionInput/step";
import './materialAndProduct/materialAndProduct.css';

type StepItem = {
  _Id?: string;
  MachineId: string;
  MachineType: string;
  MachineName: string;
  SizeX: string;
  SizeY: string;
  SizeZ: string;
  OptereName: string;
  StartTime: string;
  EndTime: string;
  note?: string;

  machineId?: string;
  operatorId?: string | null;
  status?: string;
  startedAt?: string | null;
  completedAt?: string | null;
  reason?: string | null;
};

type StepData = {
  stepname: string;
  stepId?: string;
  steps: StepItem[];
};

interface StepContainerProps {
  onStepsChange?: (steps: StepItem[]) => void;
  initialData?: any;
  isEditMode?: boolean;
}

export interface StepContainerRef {
  getStepData: () => StepData | null;
  getMachineIds: () => string[];
  setStepData: (stepData: StepData) => void;
  clearSteps: () => void;
}

const StepContainer = forwardRef<StepContainerRef, StepContainerProps>(
  ({ onStepsChange, initialData, isEditMode }, ref) => {
    const [savedStep, setSavedStep] = useState<StepData | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [showStepPopup, setShowStepPopup] = useState(false);
    const [selectedStep, setSelectedStep] = useState<StepData | null>(null);
    const [noteIndex, setNoteIndex] = useState<number | null>(null);
    const [noteText, setNoteText] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // FIXED: Enhanced initial data loading for edit mode
    useEffect(() => {
      if (isEditMode && initialData && initialData.steps && initialData.steps.length > 0) {
        console.log('🔄 Loading initial step data for edit mode:', initialData.steps);
        
        try {
          const firstStep = initialData.steps[0];
          const stepData: StepData = {
            stepname: firstStep.stepname || 'Manufacturing Step',
            stepId: firstStep.stepId || firstStep._id,
            steps: []
          };


          // Convert API step data to component format
          if (firstStep.machines && Array.isArray(firstStep.machines)) {
            stepData.steps = firstStep.machines.map((machine: any) => ({
              _Id: machine._id || '',
              MachineId: machine.machineId || machine.MachineId || '',
              MachineType: machine.machineTypeName || machine.MachineType || '',
              MachineName: machine.machineName || machine.MachineName || '',
              SizeX: machine.sizeX || machine.SizeX || '',
              SizeY: machine.sizeY || machine.SizeY || '',
              SizeZ: machine.sizeZ || machine.SizeZ || '',
              OptereName: machine.operatorName || machine.OptereName || '',
              StartTime: machine.startTime || machine.StartTime || machine.startedAt || '',
              EndTime: machine.endTime || machine.EndTime || machine.completedAt || '',
              note: machine.note || '',
              // Keep API fields for reference
              operatorId: machine.operatorId,
              status: machine.status,
              startedAt: machine.startedAt,
              completedAt: machine.completedAt,
              reason: machine.reason
            }));
          }

          console.log('✅ Converted step data:', stepData);
          setSavedStep(stepData);
        } catch (error) {
          console.error('❌ Error loading initial step data:', error);
          handleError(error, 'loading initial step data');
        }
      }
    }, [isEditMode, initialData]);

    const handleError = (error: any, context: string) => {
      console.error(`Error in ${context}:`, error);
      setError(`Error in ${context}: ${error?.message || 'Unknown error'}`);
      setIsLoading(false);
    };

    // Expose methods to parent components via ref
    useImperativeHandle(ref, () => ({
      getStepData: () => {
        try {
          return savedStep;
        } catch (error) {
          handleError(error, 'getStepData');
          return null;
        }
      },
      getMachineIds: () => {
        try {
          return savedStep?.steps?.map(step => step.MachineId).filter(Boolean) || [];
        } catch (error) {
          handleError(error, 'getMachineIds');
          return [];
        }
      },
      setStepData: (stepData: StepData) => {
        try {
          setSavedStep(stepData);
          setError(null);
        } catch (error) {
          handleError(error, 'setStepData');
        }
      },
      clearSteps: () => {
        try {
          setSavedStep(null);
          setSelectedStep(null);
          setSearchTerm('');
          setError(null);
        } catch (error) {
          handleError(error, 'clearSteps');
        }
      }
    }));

    // Store reference globally for order actions to access
    useEffect(() => {
      try {
        if (typeof window !== 'undefined') {
          (window as any).stepContainerRef = {
            getStepData: () => savedStep,
            getMachineIds: () => savedStep?.steps?.map(step => step.MachineId).filter(Boolean) || []
          };
        }
      } catch (error) {
        handleError(error, 'window reference setup');
      }
    }, [savedStep]);
    
    // Notify parent whenever steps change
    useEffect(() => {
      try {
        if (onStepsChange && savedStep) {
          onStepsChange(savedStep.steps);
        }
      } catch (error) {
        handleError(error, 'onStepsChange callback');
      }
    }, [savedStep, onStepsChange]);

    const handleSelect = (step: StepData) => {
      try {
        setError(null);
        setSelectedStep(step);
        setShowStepPopup(true);
        setSearchTerm("");
      } catch (error) {
        handleError(error, 'handleSelect');
      }
    };

    const handleSaveStep = () => {
      try {
        if (selectedStep) {
          if (!selectedStep.steps || selectedStep.steps.length === 0) {
            setError('Please add at least one machine to the step');
            return;
          }

          const incompleteSteps = selectedStep.steps.filter(step => 
            !step.MachineId || !step.MachineName || !step.MachineType
          );

          if (incompleteSteps.length > 0) {
            setError(`Please complete all required fields (Machine ID, Name, Type) for ${incompleteSteps.length} machine(s)`);
            return;
          }

          setSavedStep(selectedStep);
          setShowStepPopup(false);
          setError(null);
          console.log('✅ Step saved successfully:', selectedStep);
        }
      } catch (error) {
        handleError(error, 'handleSaveStep');
      }
    };

    const handleEditStep = () => {
      try {
        if (savedStep) {
          setSelectedStep(savedStep);
          setShowStepPopup(true);
          setError(null);
        }
      } catch (error) {
        handleError(error, 'handleEditStep');
      }
    };

    const handleStepUpdate = (index: number, field: keyof StepItem, value: string) => {
      try {
        if (!selectedStep || !selectedStep.steps[index]) return;
        
        const updated = { ...selectedStep };
        updated.steps[index] = { ...updated.steps[index], [field]: value };
        setSelectedStep(updated);
      } catch (error) {
        handleError(error, 'handleStepUpdate');
      }
    };

    const handleAddRow = () => {
      try {
        if (!selectedStep) return;
        
        const updated = { ...selectedStep };
        updated.steps.push({
          _Id: "",
          MachineId: "",
          MachineType: "",
          MachineName: "",
          SizeX: "",
          SizeY: "",
          SizeZ: "",
          OptereName: "",
          StartTime: "",
          EndTime: "",
          note: "",
        });
        setSelectedStep(updated);
      } catch (error) {
        handleError(error, 'handleAddRow');
      }
    };

    const handleRemoveRow = (index: number) => {
      try {
        if (!selectedStep) return;
        
        const updated = { ...selectedStep };
        updated.steps.splice(index, 1);
        setSelectedStep(updated);
      } catch (error) {
        handleError(error, 'handleRemoveRow');
      }
    };

    const handleNoteEdit = (index: number) => {
      try {
        setNoteIndex(index);
        const noteValue = savedStep?.steps[index]?.note || selectedStep?.steps[index]?.note || "";
        setNoteText(noteValue);
      } catch (error) {
        handleError(error, 'handleNoteEdit');
      }
    };

    const handleNoteSave = () => {
      try {
        if (noteIndex === null) return;
        
        const updated = savedStep ? { ...savedStep } : selectedStep ? { ...selectedStep } : null;
        if (updated && updated.steps[noteIndex]) {
          updated.steps[noteIndex].note = noteText;
          if (savedStep) setSavedStep(updated);
          else setSelectedStep(updated);
        }
        setNoteIndex(null);
        setNoteText("");
      } catch (error) {
        handleError(error, 'handleNoteSave');
      }
    };

    const handleSuggestionSelect = (selectedStepData: any) => {
      try {
        console.log("Selected step data:", selectedStepData);
        setIsLoading(true);
        
        if (!selectedStepData) {
          setError("Invalid step data received");
          setIsLoading(false);
          return;
        }

        const formattedStep: StepData = {
          stepname: selectedStepData.stepName || selectedStepData.stepname || '',
          stepId: selectedStepData._id || selectedStepData.stepId || '',
          steps: []
        };

        // Safely process machines
        if (selectedStepData.machines && Array.isArray(selectedStepData.machines)) {
          formattedStep.steps = selectedStepData.machines.map((m: any) => ({
            _Id: m._id || '',
            MachineId: m.machineId?._id || m._id || m.MachineId || '',
            MachineType: m.machineId?.machineType?.type || m.machineType || m.MachineType || '',
            MachineName: m.machineId?.machineName || m.machineName || m.MachineName || '',
            SizeX: m.machineId?.sizeX?.toString() || m.sizeX?.toString() || m.SizeX || '',
            SizeY: m.machineId?.sizeY?.toString() || m.sizeY?.toString() || m.SizeY || '',
            SizeZ: m.machineId?.sizeZ?.toString() || m.sizeZ?.toString() || m.SizeZ || '',
            OptereName: m.operatorName || m.OptereName || '',
            StartTime: m.startTime || m.StartTime || '',
            EndTime: m.endTime || m.EndTime || '',
            note: m.note || '',
          }));
        }

        console.log("Formatted step with machine IDs:", formattedStep);
        setIsLoading(false);
        handleSelect(formattedStep);
      } catch (error) {
        handleError(error, 'handleSuggestionSelect');
      }
    };

    const handleCancelEdit = () => {
      try {
        setShowStepPopup(false);
        setSelectedStep(null);
        setError(null);
      } catch (error) {
        handleError(error, 'handleCancelEdit');
      }
    };

    if (error) {
      return (
        <div className="container12">
          <h3>Manufacturing Steps:</h3>
          <div style={{ 
            color: '#ff4444', 
            padding: '10px', 
            backgroundColor: '#ffe6e6', 
            borderRadius: '4px',
            marginBottom: '10px'
          }}>
            {error}
            <button 
              onClick={() => setError(null)}
              style={{ marginLeft: '10px', padding: '2px 8px' }}
            >
              Clear
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="container12">
        <h3>Manufacturing Steps:</h3>
        
        {isLoading && (
          <div style={{ padding: '10px', textAlign: 'center', color: '#666' }}>
            Loading step data...
          </div>
        )}

        {/* Hidden input to store step ID for DOM collection */}
        {savedStep?.stepId && (
          <input 
            type="hidden" 
            name="stepId" 
            value={savedStep.stepId} 
          />
        )}

        {!savedStep && !isLoading && (
          <div className="section search">
            <label htmlFor="searchInput">Step Name:</label>
            <input
              id="searchInput"
              type="text"
              placeholder="Enter step name to search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="inputBox"
            />
            <StepSuggestions
              stepName={searchTerm}
              onSelect={handleSuggestionSelect}
            />
          </div>
        )}

        {showStepPopup && selectedStep && (
          <div className="popup-overlay">
            <div className="popup">
              <div className="popup-content">
                <h3>Configure Step: {selectedStep.stepname}</h3>
                
                {selectedStep.steps.length === 0 && (
                  <div style={{ 
                    padding: '10px', 
                    backgroundColor: '#fff3cd', 
                    border: '1px solid #ffeaa7',
                    borderRadius: '4px',
                    marginBottom: '10px'
                  }}>
                    No machines found for this step. Click "Add Row" to add machines manually.
                  </div>
                )}
                
                <div className="headerRow">
                  <span>Machine Type</span>
                  <span>Machine Name</span>
                  <span>Size X</span>
                  <span>Size Y</span>
                  <span>Size Z</span>
                  <span>Operator Name</span>
                  <span>Start Time</span>
                  <span>End Time</span>
                  <span>Note</span>
                  <span>Action</span>
                </div>

                {selectedStep.steps && selectedStep.steps.map((step, index) => (
                  <div key={index} className="popupitemallStep popupitemall">
                    {/* Hidden inputs for machine data */}
                    <input
                      type="hidden"
                      name={`machineId_${index}`}
                      value={step.MachineId || ''}
                    />
                    <input
                      type="hidden"
                      name={`machine_${index}_id`}
                      value={step.MachineId || ''}
                    />
                    
                    <input
                      type="text"
                      value={step.MachineType || ''}
                      onChange={(e) => handleStepUpdate(index, 'MachineType', e.target.value)}
                      placeholder="Machine Type"
                      required
                    />
                    <input
                      type="text"
                      value={step.MachineName || ''}
                      onChange={(e) => handleStepUpdate(index, 'MachineName', e.target.value)}
                      placeholder="Machine Name"
                      required
                    />
                    <input
                      type="text"
                      value={step.SizeX || ''}
                      onChange={(e) => handleStepUpdate(index, 'SizeX', e.target.value)}
                      placeholder="Size X"
                    />
                    <input
                      type="text"
                      value={step.SizeY || ''}
                      onChange={(e) => handleStepUpdate(index, 'SizeY', e.target.value)}
                      placeholder="Size Y"
                    />
                    <input
                      type="text"
                      value={step.SizeZ || ''}
                      onChange={(e) => handleStepUpdate(index, 'SizeZ', e.target.value)}
                      placeholder="Size Z"
                    />
                    <input
                      type="text"
                      value={step.OptereName || ''}
                      onChange={(e) => handleStepUpdate(index, 'OptereName', e.target.value)}
                      placeholder="Operator Name"
                    />
                    <input
                      type="datetime-local"
                      value={step.StartTime || ''}
                      onChange={(e) => handleStepUpdate(index, 'StartTime', e.target.value)}
                      placeholder="Start Time"
                    />
                    <input
                      type="datetime-local"
                      value={step.EndTime || ''}
                      onChange={(e) => handleStepUpdate(index, 'EndTime', e.target.value)}
                      placeholder="End Time"
                    />

                    <button
                      onClick={() => handleNoteEdit(index)}
                      className="buttonStepRowNote"
                      type="button"
                      title={step.note ? `Note: ${step.note}` : 'Add note'}
                    >
                      {step.note ? '📝' : '✎'} Note
                    </button>

                    <button
                      onClick={() => handleRemoveRow(index)}
                      type="button"
                      style={{
                        background: "none",
                        border: "none",
                        fontSize: "18px",
                        cursor: "pointer",
                        color: "#ff4444",
                        padding: "5px",
                      }}
                      title="Remove Row"
                    >
                      ✕
                    </button>
                  </div>
                ))}

                <button
                  onClick={handleAddRow}
                  type="button"
                  style={{
                    marginTop: "10px",
                    padding: "8px 16px",
                    backgroundColor: "#4CAF50",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  + Add Machine
                </button>

                <div className="popupButtons">
                  <button onClick={handleSaveStep} className="saveButton" type="button">
                    Save Step
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="cancelButton"
                    type="button"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {savedStep && (
          <div className="section-result" onDoubleClick={handleEditStep}>
            <div className="savedStepDisplay">
              <div className="stepHeaderRow">
                <strong>#</strong>
                <strong>Machine Type</strong>
                <strong>Machine Name</strong>
                <strong>Size X</strong>
                <strong>Size Y</strong>
                <strong>Size Z</strong>
                <strong>Operator</strong>
                <strong>Start Time</strong>
                <strong>End Time</strong>
                <strong>Note</strong>
              </div>

              {savedStep.steps && savedStep.steps.map((step, index) => (
                <div key={index} className="stepRow"> {/* Hidden inputs for each row to store machine IDs */}
                  <input 
                    type="hidden" 
                    name={`machineId_${index}`} 
                    value={step.MachineId || ''} 
                  />
                  <input 
                    type="hidden" 
                    name={`machine_${index}_id`} 
                    value={step.MachineId || ''} 
                  />
                  
                  <span>{index + 1}</span>
                  <span>{step.MachineType || 'N/A'}</span>
                  <span>{step.MachineName || 'N/A'}</span>
                  <span>{step.SizeX || 'N/A'}</span>
                  <span>{step.SizeY || 'N/A'}</span>
                  <span>{step.SizeZ || 'N/A'}</span>
                  <span>{step.OptereName || 'N/A'}</span>
                  <span>{step.StartTime ? new Date(step.StartTime).toLocaleString() : 'N/A'}</span>
                  <span>{step.EndTime ? new Date(step.EndTime).toLocaleString() : 'N/A'}</span>
                  <span>
                    <button
                      onClick={() => handleNoteEdit(index)}
                      className="buttonStepRowNote"
                      type="button"
                      title={step.note || 'Add note'}
                    >
                      {step.note ? '📝' : '✎'} {step.note ? 'View' : 'Add'}
                    </button>
                  </span>
                </div>
              ))}
            </div>

            <div className="Configured-Step">
              <h4>✓ Configured Step: {savedStep.stepname}</h4>
              <p style={{ fontSize: '14px', color: '#666' }}>
                {savedStep.steps.length} machine(s) configured. Double-click to edit.
              </p>
              
              {/* Debug info - remove in production */}
              {process.env.NODE_ENV === 'development' && (
                <div style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
                  Machine IDs: {savedStep.steps?.map(s => s.MachineId || 'missing').join(', ') || 'none'}
                </div>
              )}
            </div>
          </div>
        )}

        {noteIndex !== null && (
          <div className="popup-overlay">
            <div className="popup">
              <div className="popup-content">
                <h3>Edit Note for Machine #{noteIndex + 1}</h3>
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  rows={5}
                  placeholder="Add notes for the operator regarding this machine..."
                  style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
                />

                <div className="popupButtons">
                  <button
                    onClick={handleNoteSave}
                    className="saveButton"
                    type="button"
                  >
                    Save Note
                  </button>
                  <button
                    onClick={() => {
                      setNoteIndex(null);
                      setNoteText("");
                    }}
                    className="cancelButton"
                    type="button"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
);

StepContainer.displayName = 'StepContainer';

export default StepContainer;