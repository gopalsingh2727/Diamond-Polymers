import { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import StepSuggestions from "./SuggestionInput/step";
import './materialAndProduct/materialAndProduct.css';

type StepItem = {
  _Id?: string;
  MachineId: string;
  MachineType: string;
  MachineName: string;
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
    
    // New states for table view
    const [showTableView, setShowTableView] = useState(false);
    const [selectedMachineForTable, setSelectedMachineForTable] = useState<{
      machineId: string;
      machineName: string;
      index: number;
    } | null>(null);
    const [tableData, setTableData] = useState<any>(null);
    const [loadingTable, setLoadingTable] = useState(false);

    // Auto-initialize machine statuses
    const initializeMachineStatuses = (steps: StepItem[]) => {
      return steps.map((step, index) => ({
        ...step,
        status: index === 0 ? 'pending' : 'none'
      }));
    };

    // Auto-update status based on operator assignment and times
    const autoUpdateMachineStatus = (step: StepItem): string => {
      // If operator is assigned and no start time, set to pending
      if (step.OptereName && !step.StartTime) {
        return 'pending';
      }
      
      // If start time is set but no end time, set to in-progress
      if (step.StartTime && !step.EndTime) {
        return 'in-progress';
      }
      
      // If both start and end times are set, mark as completed
      if (step.StartTime && step.EndTime) {
        return 'completed';
      }
      
      // If no operator assigned, keep as none
      if (!step.OptereName) {
        return step.status || 'none';
      }
      
      return step.status || 'none';
    };

    // Update next machine status when current completes
    const updateNextMachineStatus = (steps: StepItem[], currentIndex: number) => {
      const updatedSteps = [...steps];
      
      // If current machine is completed, activate next machine
      if (updatedSteps[currentIndex]?.status === 'completed') {
        if (currentIndex + 1 < updatedSteps.length) {
          // Set next machine to pending if it's still in 'none' status
          if (updatedSteps[currentIndex + 1].status === 'none') {
            updatedSteps[currentIndex + 1].status = 'pending';
          }
        }
      }
      
      return updatedSteps;
    };

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

          if (firstStep.machines && Array.isArray(firstStep.machines)) {
            stepData.steps = firstStep.machines.map((machine: any, index: number) => {
              const mappedMachine = {
                _Id: machine._id || '',
                MachineId: machine.machineId || machine.MachineId || '',
                MachineType: machine.machineTypeName || machine.MachineType || '',
                MachineName: machine.machineName || machine.MachineName || '',
                OptereName: machine.operatorName || machine.OptereName || '',
                StartTime: machine.startTime || machine.StartTime || machine.startedAt || '',
                EndTime: machine.endTime || machine.EndTime || machine.completedAt || '',

                note: machine.note || '',
                operatorId: machine.operatorId,
                status: machine.status || (index === 0 ? 'pending' : 'none'),
                startedAt: machine.startedAt,
                completedAt: machine.completedAt,
                reason: machine.reason
              };

              // Auto-update status based on current data
              mappedMachine.status = autoUpdateMachineStatus(mappedMachine);

              return mappedMachine;
            });
          }

          console.log('✅ Converted step data with auto statuses:', stepData);
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

    // Fetch machine table data from order
    const handleViewTable = async (machineId: string, machineName: string, index: number) => {
      try {
        setLoadingTable(true);
        setSelectedMachineForTable({ machineId, machineName, index });
        
        const token = localStorage.getItem('authToken');
        const baseUrl = import.meta.env.VITE_API_27INFINITY_IN || '';
        const orderId = initialData?._id || initialData?.orderId;
        
        if (!token) {
          throw new Error('Authentication token not found');
        }
        
        if (!orderId) {
          throw new Error('Order ID not found. Table data can only be viewed from existing orders.');
        }
        
        const response = await fetch(`${baseUrl}/orders/${orderId}/machines/${machineId}/table-data`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch machine table data');
        }
        
        const result = await response.json();
        
        if (result.success && result.data) {
          setTableData(result.data);
          setShowTableView(true);
        } else {
          throw new Error('Invalid response format from server');
        }
        
        setLoadingTable(false);
      } catch (error) {
        console.error('Error fetching machine table data:', error);
        setError(error instanceof Error ? error.message : 'Failed to load machine table data');
        setLoadingTable(false);
        setShowTableView(false);
      }
    };

    const closeTableView = () => {
      setShowTableView(false);
      setSelectedMachineForTable(null);
      setTableData(null);
    };

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
        // Initialize statuses for new steps
        const stepsWithStatus = initializeMachineStatuses(step.steps);
        setSelectedStep({ ...step, steps: stepsWithStatus });
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

          // Auto-update all machine statuses before saving
          const updatedSteps = selectedStep.steps.map(step => ({
            ...step,
            status: autoUpdateMachineStatus(step)
          }));

          setSavedStep({ ...selectedStep, steps: updatedSteps });
          setShowStepPopup(false);
          setError(null);
          console.log('✅ Step saved successfully with auto statuses:', { ...selectedStep, steps: updatedSteps });
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
        
        // Auto-update status when operator, start time, or end time changes
        if (field === 'OptereName' || field === 'StartTime' || field === 'EndTime') {
          updated.steps[index].status = autoUpdateMachineStatus(updated.steps[index]);
          
          // Update next machine status if current is completed
          const updatedWithNext = updateNextMachineStatus(updated.steps, index);
          updated.steps = updatedWithNext;
        }
        
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
          OptereName: "",
          StartTime: "",
          EndTime: "",
          note: "",
          status: "none" // New machines start with 'none' status
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
        
        // Re-initialize statuses after removal
        updated.steps = initializeMachineStatuses(updated.steps);
        
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

        if (selectedStepData.machines && Array.isArray(selectedStepData.machines)) {
          console.log('🔍 DEBUG - Raw machines data:', selectedStepData.machines);

          formattedStep.steps = selectedStepData.machines.map((m: any, index: number) => {
            console.log(`🔍 DEBUG - Machine ${index}:`, {
              raw: m,
              machineId: m.machineId,
              machineIdType: typeof m.machineId,
              machineName: m.machineId?.machineName,
              machineType: m.machineId?.machineType
            });

            const machine = {
              _Id: m._id || '',
              MachineId: m.machineId?._id || m._id || m.MachineId || '',
              MachineType: m.machineId?.machineType?.type || m.machineType || m.MachineType || '',
              MachineName: m.machineId?.machineName || m.machineName || m.MachineName || '',
              OptereName: m.operatorName || m.OptereName || '',
              StartTime: m.startTime || m.StartTime || '',
              EndTime: m.endTime || m.EndTime || '',
              note: m.note || '',
              status: m.status || (index === 0 ? 'pending' : 'none')
            };

            console.log(`🔍 DEBUG - Formatted machine ${index}:`, machine);

            // Auto-update status
            machine.status = autoUpdateMachineStatus(machine);

            return machine;
          });
        }

        console.log("Formatted step with auto statuses:", formattedStep);
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

    // Helper function to get status badge color
    const getStatusColor = (status?: string) => {
      switch (status) {
        case 'none': return '#9e9e9e';
        case 'pending': return '#ff9800';
        case 'in-progress': return '#2196f3';
        case 'completed': return '#4caf50';
        case 'paused': return '#ffc107';
        case 'error': return '#f44336';
        default: return '#9e9e9e';
      }
    };

    const getStatusLabel = (status?: string) => {
      switch (status) {
        case 'none': return 'Not Started';
        case 'pending': return 'Pending';
        case 'in-progress': return 'In Progress';
        case 'completed': return 'Completed';
        case 'paused': return 'Paused';
        case 'error': return 'Error';
        default: return 'Unknown';
      }
    };

    if (error) {
      return (
        <div className="container12">
          <h3 className="ManufacturingStepsTitel">Manufacturing Steps:</h3>
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
        <h3 className="ManufacturingStepsTitel">Manufacturing Steps:</h3>
        
        {isLoading && (
          <div style={{ padding: '10px', textAlign: 'center', color: '#666' }}>
            Loading step data...
          </div>
        )}

        {savedStep?.stepId && (
          <input 
            type="hidden" 
            name="stepId" 
            value={savedStep.stepId} 
          />
        )}

        {!savedStep && !isLoading && (
          <div className="section search">
            <label htmlFor="searchInput" className="ManufacturingStepsTitel">Step Name:</label>
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
                    No machines found for this step. Click "Add Machine" to add machines manually.
                  </div>
                )}
                
                <div className="headerRow">
                  <span>Status</span>
                  <span>Machine Type</span>
                  <span>Machine Name</span>
                  <span>Operator Name</span>
                  <span>Start Time</span>
                  <span>End Time</span>
                  <span>Note</span>
                  <span>Table</span>
                  <span>Action</span>
                </div>

                {selectedStep.steps && selectedStep.steps.map((step, index) => (
                  <div key={index} className="popupitemallStep popupitemall">
                    
                    <input type="hidden" name={`machineId_${index}`} value={step.MachineId || ''} />
                    <input type="hidden" name={`machine_${index}_id`} value={step.MachineId || ''} />
                    <input type="hidden" name={`machine_${index}_status`} value={step.status || 'none'} />
                    
                    {/* Status Badge */}
                    <div style={{
                      padding: '4px 8px',
                      borderRadius: '12px',
                      backgroundColor: getStatusColor(step.status),
                      color: 'white',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      textAlign: 'center',
                      whiteSpace: 'nowrap'
                    }}>
                      {getStatusLabel(step.status)}
                    </div>
                    
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
                      onClick={() => handleViewTable(step.MachineId, step.MachineName, index)}
                      type="button"
                      style={{
                        background: "none",
                        border: "none",
                        fontSize: "18px",
                        cursor: "pointer",
                        color: "#2196F3",
                        padding: "5px",
                      }}
                      title="View Machine Table"
                      disabled={!step.MachineId}
                    >
                      📊
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
                <strong>Status</strong>
                <strong>Machine Type</strong>
                <strong>Machine Name</strong>
                <strong>Operator</strong>
                <strong>Start Time</strong>
                <strong>End Time</strong>
                <strong>Note</strong>
                <strong>Table</strong>
              </div>

              {savedStep.steps && savedStep.steps.map((step, index) => (
                <div key={index} className="stepRow">
                  <input type="hidden" name={`machineId_${index}`} value={step.MachineId || ''} />
                  <input type="hidden" name={`machine_${index}_id`} value={step.MachineId || ''} />
                  <input type="hidden" name={`machine_${index}_status`} value={step.status || 'none'} />
                  
                  <span>{index + 1}</span>
                  <span>
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: '10px',
                      backgroundColor: getStatusColor(step.status),
                      color: 'white',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      display: 'inline-block'
                    }}>
                      {getStatusLabel(step.status)}
                    </span>
                  </span>
                  <span>{step.MachineType || 'N/A'}</span>
                  <span>{step.MachineName || 'N/A'}</span>
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
                  <span>
                    <button
                      onClick={() => handleViewTable(step.MachineId, step.MachineName, index)}
                      type="button"
                      style={{
                        background: "none",
                        border: "none",
                        fontSize: "18px",
                        cursor: step.MachineId ? "pointer" : "not-allowed",
                        color: step.MachineId ? "#2196F3" : "#ccc",
                        padding: "5px",
                      }}
                      title="View Machine Table"
                      disabled={!step.MachineId}
                    >
                      📊
                    </button>
                  </span>
                </div>
              ))}
            </div>

            <div className="Configured-Step">
            </div>
          </div>
        )}

        {/* Table View Popup */}
        {showTableView && selectedMachineForTable && (
          <div className="popup-overlay Machine-Table">
            <div className="popup  Machine-Table "  >
      
              <div className="popup-content Machine-Table ">
                <h3>Machine Table: {selectedMachineForTable.machineName}</h3>
                
                {loadingTable && (
                  <div style={{ padding: '20px', textAlign: 'center' }}>
                    Loading machine table data...
                  </div>
                )}
                
                {!loadingTable && tableData && (
                  <div style={{ overflowX: 'auto', maxHeight: '500px' }}>
                    {/* Order and Machine Info */}
                    <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                      <h4>Order & Machine Details</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                        {tableData.order && (
                          <>
                            <div><strong>Order ID:</strong> {tableData.order.orderId}</div>
                            <div><strong>Customer:</strong> {tableData.order.customer}</div>
                            <div><strong>Order Status:</strong> {tableData.order.status}</div>
                          </>
                        )}
                        {tableData.machine && (
                          <>
                            <div><strong>Machine Status:</strong> {tableData.machine.status}</div>
                            <div><strong>Operator:</strong> {tableData.machine.operatorName || 'Not assigned'}</div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Table Structure */}
                    <h4>Table Configuration</h4>
                    <div style={{ marginBottom: '20px' }}>
                      <p><strong>Auto Calculate:</strong> {tableData.tableStructure?.settings?.autoCalculate ? 'Yes' : 'No'}</p>
                      <p><strong>Max Rows:</strong> {tableData.tableStructure?.settings?.maxRows}</p>
                    </div>

                    <h4>Columns</h4>
                    <table style={{ 
                      width: '100%', 
                      borderCollapse: 'collapse',
                      marginBottom: '20px'
                    }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f0f0f0' }}>
                          <th style={{ padding: '8px', border: '1px solid #ddd' }}>Order</th>
                          <th style={{ padding: '8px', border: '1px solid #ddd' }}>Column Name</th>
                          <th style={{ padding: '8px', border: '1px solid #ddd' }}>Data Type</th>
                          <th style={{ padding: '8px', border: '1px solid #ddd' }}>Required</th>
                          <th style={{ padding: '8px', border: '1px solid #ddd' }}>Placeholder</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tableData.tableStructure?.columns?.map((col: any, idx: number) => (
                          <tr key={idx}>
                            <td style={{ padding: '8px', border: '1px solid #ddd' }}>{col.order}</td>
                            <td style={{ padding: '8px', border: '1px solid #ddd' }}>{col.name}</td>
                            <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                              <span style={{
                                padding: '2px 8px',
                                borderRadius: '4px',
                                backgroundColor: col.dataType === 'formula' ? '#e3f2fd' : '#f5f5f5',
                                color: col.dataType === 'formula' ? '#1976d2' : '#666'
                              }}>
                                {col.dataType}
                              </span>
                            </td>
                            <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                              {col.isRequired ? '✓' : '-'}
                            </td>
                            <td style={{ padding: '8px', border: '1px solid #ddd', fontSize: '12px', color: '#666' }}>
                              {col.placeholder}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Formulas */}
                    {tableData.tableStructure?.formulas && Object.keys(tableData.tableStructure.formulas).length > 0 && (
                      <>
                        <h4>Formulas</h4>
                        <div style={{ 
                          backgroundColor: '#f9f9f9', 
                          padding: '15px', 
                          borderRadius: '4px',
                          border: '1px solid #ddd',
                          marginBottom: '20px'
                        }}>
                          {Object.entries(tableData.tableStructure.formulas).map(([key, formula]: [string, any]) => (
                            <div key={key} style={{ marginBottom: '15px' }}>
                              <div style={{ fontWeight: 'bold', color: '#1976d2' }}>{key}</div>
                              <div style={{ marginLeft: '15px', marginTop: '5px' }}>
                                <div><strong>Expression:</strong> <code>{formula.expression}</code></div>
                                <div><strong>Dependencies:</strong> {formula.dependencies?.join(', ') || 'None'}</div>
                                {formula.description && (
                                  <div style={{ fontSize: '12px', color: '#666', marginTop: '3px' }}>
                                    {formula.description}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                    {/* Actual Table Data */}
                    {tableData.tableData && tableData.tableData.rowData && tableData.tableData.rowData.length > 0 ? (
                      <>
                        <h4>Entered Data ({tableData.tableData.rowData.length} rows)</h4>
                        <div style={{ overflowX: 'auto', marginBottom: '20px' }}>
                          <table style={{ 
                            width: '100%', 
                            borderCollapse: 'collapse',
                            fontSize: '14px'
                          }}>
                            <thead>
                              <tr style={{ backgroundColor: '#2196F3', color: 'white' }}>
                                <th style={{ padding: '8px', border: '1px solid #ddd' }}>#</th>
                                {tableData.tableStructure?.columns?.map((col: any, idx: number) => (
                                  <th key={idx} style={{ padding: '8px', border: '1px solid #ddd' }}>
                                    {col.name}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {tableData.tableData.rowData.map((row: any, rowIdx: number) => (
                                <tr key={rowIdx} style={{ backgroundColor: rowIdx % 2 === 0 ? 'white' : '#f9f9f9' }}>
                                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{rowIdx + 1}</td>
                                  {tableData.tableStructure?.columns?.map((col: any, colIdx: number) => (
                                    <td key={colIdx} style={{ padding: '8px', border: '1px solid #ddd' }}>
                                      {row[col.name] !== undefined ? row[col.name] : '-'}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Total Calculations */}
                        {tableData.tableData.totalCalculations && (
                          <div style={{ 
                            backgroundColor: '#e8f5e9', 
                            padding: '15px', 
                            borderRadius: '4px',
                            marginBottom: '20px'
                          }}>
                            <h4>Summary Calculations</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                              {Object.entries(tableData.tableData.totalCalculations).map(([key, value]: [string, any]) => (
                                <div key={key}>
                                  <strong>{key.replace(/([A-Z])/g, ' $1').trim()}:</strong> {value}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div style={{ 
                        padding: '20px', 
                        textAlign: 'center', 
                        backgroundColor: '#fff3cd',
                        borderRadius: '4px',
                        border: '1px solid #ffeaa7'
                      }}>
                        <p>No data has been entered for this machine yet.</p>
                        <p style={{ fontSize: '12px', color: '#666' }}>
                          Data will appear here once operators start entering information.
                        </p>
                      </div>
                    )}

                    {/* Calculated Output from Order */}
                    {tableData.calculatedOutput && (
                      <div style={{ 
                        backgroundColor: '#e1f5fe', 
                        padding: '15px', 
                        borderRadius: '4px',
                        marginTop: '20px'
                      }}>
                        <h4>Real-time Order Calculations</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                          <div><strong>Net Weight:</strong> {tableData.calculatedOutput.netWeight} kg</div>
                          <div><strong>Wastage:</strong> {tableData.calculatedOutput.wastageWeight} kg</div>
                          <div><strong>Efficiency:</strong> {tableData.calculatedOutput.efficiency}%</div>
                          <div><strong>Total Cost:</strong> ₹{tableData.calculatedOutput.totalCost}</div>
                          <div><strong>Rows Processed:</strong> {tableData.calculatedOutput.rowsProcessed}</div>
                          <div><strong>Last Updated:</strong> {new Date(tableData.calculatedOutput.lastUpdated).toLocaleString()}</div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="popupButtons" style={{ marginTop: '20px' }}>
                  <button
                    onClick={closeTableView}
                    className="cancelButton"
                    type="button"
                  >
                    Close
                  </button>
                </div>
              </div>
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
                  style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc", background:'#fff', color:"#000" }}
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