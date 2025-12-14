import { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import StepSuggestions from "./SuggestionInput/step";
import { Printer, FileSpreadsheet, Eye } from "lucide-react";

import { useOrderUpdates } from "../../../../hooks/useWebSocket";

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

interface CustomerInfo {
  name?: string;
  address?: string;
  phone?: string;
  whatsapp?: string;
  companyName?: string;
}

interface StepContainerProps {
  onStepsChange?: (steps: StepItem[]) => void;
  initialData?: any;
  isEditMode?: boolean;
  orderId?: string;
  customerInfo?: CustomerInfo;
}

export interface StepContainerRef {
  getStepData: () => StepData | null;
  getMachineIds: () => string[];
  setStepData: (stepData: StepData) => void;
  clearSteps: () => void;
}

const StepContainer = forwardRef<StepContainerRef, StepContainerProps>(
  ({ onStepsChange, initialData, isEditMode, orderId, customerInfo }, ref) => {
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
    const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

    // View All Steps popup state
    const [showAllStepsPopup, setShowAllStepsPopup] = useState(false);

    // WebSocket live updates for order data
    const wsOrderId = initialData?._id || initialData?.orderId;

    // Subscribe to order updates via WebSocket
    useOrderUpdates(wsOrderId);

    // Listen for WebSocket events to refresh table data
    useEffect(() => {
      const handleWebSocketMessage = (event: CustomEvent) => {
        const { type } = event.detail || {};
        // Listen for table data and order update events
        if (type === 'table:data_saved' || type === 'table:row_added' ||
            type === 'operator:session_started' || type === 'operator:session_ended' ||
            type === 'operator:session_paused' || type === 'order:updated') {
          console.log('📡 WebSocket: Table/Order update received:', type);
          setLastUpdate(new Date());
        }
      };

      window.addEventListener('websocket:message' as any, handleWebSocketMessage);
      return () => {
        window.removeEventListener('websocket:message' as any, handleWebSocketMessage);
      };
    }, []);

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

    // Helper function to format date for datetime-local input (YYYY-MM-DDTHH:mm)
    const formatDateForInput = (dateValue: string | Date | null | undefined): string => {
      if (!dateValue) return '';
      try {
        const date = new Date(dateValue);
        if (isNaN(date.getTime())) return '';
        // Format: YYYY-MM-DDTHH:mm (required by datetime-local)
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
      } catch {
        return '';
      }
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
            // Get machineTableData for operator info
            const machineTableData = initialData.machineTableData || [];

            stepData.steps = firstStep.machines.map((machine: any, index: number) => {
              // Get raw date values
              const rawStartTime = machine.startTime || machine.StartTime || machine.startedAt;
              const rawEndTime = machine.endTime || machine.EndTime || machine.completedAt;

              // Try to get operator name from machineTableData if not in steps.machines
              const machineId = machine.machineId || machine.MachineId || '';
              const tableDataEntry = machineTableData.find(
                (m: any) => m.machineId?.toString() === machineId?.toString()
              );

              // Get operator name from various sources
              let operatorName = machine.operatorName || machine.OptereName || '';
              if (!operatorName && tableDataEntry) {
                // Try to get from current session or last completed session
                if (tableDataEntry.currentSession?.operatorName) {
                  operatorName = tableDataEntry.currentSession.operatorName;
                } else if (tableDataEntry.operatorSessions?.length > 0) {
                  // Get from the most recent session
                  const lastSession = tableDataEntry.operatorSessions[tableDataEntry.operatorSessions.length - 1];
                  operatorName = lastSession.operatorName || '';
                }
              }

              console.log(`📅 Machine ${index} data:`, {
                machineId,
                operatorName,
                rawStartTime,
                rawEndTime,
                formattedStart: formatDateForInput(rawStartTime),
                formattedEnd: formatDateForInput(rawEndTime),
                tableDataFound: !!tableDataEntry
              });

              const mappedMachine = {
                _Id: machine._id || '',
                MachineId: machineId,
                MachineType: machine.machineTypeName || machine.MachineType || '',
                MachineName: machine.machineName || machine.MachineName || '',
                OptereName: operatorName,
                StartTime: formatDateForInput(rawStartTime),
                EndTime: formatDateForInput(rawEndTime),

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
        const tableOrderId = initialData?._id || initialData?.orderId;

        console.log('📊 Fetching table data:', { orderId: tableOrderId, machineId, machineName, baseUrl });

        if (!token) {
          throw new Error('Authentication token not found');
        }

        if (!tableOrderId) {
          throw new Error('Order ID not found. Table data can only be viewed from existing orders.');
        }

        const url = `${baseUrl}/orders/${tableOrderId}/machines/${machineId}/table-data`;
        console.log('📊 API URL:', url);

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('📊 Response status:', response.status);

        if (!response.ok) {
          const errorData = await response.json();
          console.error('📊 Error response:', errorData);
          throw new Error(errorData.message || 'Failed to fetch machine table data');
        }

        const result = await response.json();
        console.log('📊 API Response:', result);
        console.log('📊 Operator Session Data:', result.data?.operatorSessionData);
        console.log('📊 Table Data:', result.data?.tableData);

        if (result.success && result.data) {
          setTableData(result.data);
          setShowTableView(true);
        } else {
          throw new Error('Invalid response format from server');
        }

        setLoadingTable(false);
      } catch (error) {
        console.error('❌ Error fetching machine table data:', error);
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
          // Format dates for datetime-local input when editing
          const formattedStep = {
            ...savedStep,
            steps: savedStep.steps.map(step => ({
              ...step,
              StartTime: formatDateForInput(step.StartTime || step.startedAt),
              EndTime: formatDateForInput(step.EndTime || step.completedAt)
            }))
          };
          console.log('📝 Editing step with formatted dates:', formattedStep);
          setSelectedStep(formattedStep);
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
      if (!status) return '#9e9e9e';

      // Normalize status to lowercase for comparison
      const normalizedStatus = status.toLowerCase().replace(/[_\s]+/g, '-');

      switch (normalizedStatus) {
        // Machine statuses
        case 'none': return '#9e9e9e';
        case 'pending': return '#ff9800';
        case 'in-progress': return '#2196f3';
        case 'completed': return '#4caf50';
        case 'paused': return '#ffc107';
        case 'error': return '#f44336';

        // Order statuses
        case 'wait-for-approval': return '#f59e0b';  // Amber/Orange
        case 'approved': return '#10b981';           // Green
        case 'book': return '#8b5cf6';               // Purple
        case 'booked': return '#8b5cf6';             // Purple
        case 'dispatch': return '#3b82f6';           // Blue
        case 'dispatched': return '#3b82f6';         // Blue
        case 'delivered': return '#22c55e';          // Green
        case 'cancelled': return '#ef4444';          // Red
        case 'rejected': return '#dc2626';           // Red
        case 'on-hold': return '#f97316';            // Orange
        case 'processing': return '#0ea5e9';         // Sky Blue
        case 'ready': return '#14b8a6';              // Teal
        case 'shipped': return '#6366f1';            // Indigo

        default: return '#6b7280';  // Gray for unknown statuses
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

    // Print Manufacturing Steps
    const handlePrintSteps = () => {
      if (!savedStep) return;

      const currentDate = new Date().toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Manufacturing Steps - Print</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              font-size: 12px;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              margin-bottom: 20px;
              padding-bottom: 15px;
              border-bottom: 2px solid #333;
            }
            .header-left h1 {
              font-size: 18px;
              margin-bottom: 5px;
              color: #1e293b;
            }
            .header-left .date {
              font-size: 11px;
              color: #666;
            }
            .customer-info {
              text-align: right;
              font-size: 11px;
              line-height: 1.5;
            }
            .customer-info strong {
              color: #1e293b;
            }
            .order-badge {
              display: inline-block;
              background: #fef3c7;
              color: #d97706;
              padding: 4px 10px;
              border-radius: 4px;
              font-weight: 600;
              font-size: 12px;
              margin-bottom: 10px;
              border: 1px solid #f59e0b;
            }
            .step-name {
              background: #e0f2fe;
              color: #0369a1;
              padding: 6px 12px;
              border-radius: 4px;
              font-weight: 600;
              font-size: 13px;
              margin-bottom: 15px;
              display: inline-block;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px 10px;
              text-align: left;
              font-size: 11px;
            }
            th {
              background: #f8fafc;
              font-weight: 600;
              color: #475569;
            }
            tr:nth-child(even) {
              background: #fafafa;
            }
            .status-badge {
              padding: 3px 8px;
              border-radius: 10px;
              color: white;
              font-size: 10px;
              font-weight: bold;
              display: inline-block;
            }
            @media print {
              body { padding: 10px; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="header-left">
              ${orderId ? `<div class="order-badge">${orderId}</div>` : ''}
              <h1>Manufacturing Steps</h1>
              <div class="date">${currentDate}</div>
            </div>
            ${customerInfo ? `
              <div class="customer-info">
                ${customerInfo.name ? `<div><strong>${customerInfo.name}</strong></div>` : ''}
                ${customerInfo.companyName ? `<div>${customerInfo.companyName}</div>` : ''}
                ${customerInfo.address ? `<div>${customerInfo.address}</div>` : ''}
                ${customerInfo.phone || customerInfo.whatsapp ? `<div>Ph: ${customerInfo.phone || customerInfo.whatsapp}</div>` : ''}
              </div>
            ` : ''}
          </div>

          <div class="step-name">Step: ${savedStep.stepname}</div>

          <table>
            <thead>
              <tr>
                <th style="width: 30px">#</th>
                <th>Status</th>
                <th>Machine Type</th>
                <th>Machine Name</th>
                <th>Operator</th>
                <th>Start Time</th>
                <th>End Time</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              ${savedStep.steps.map((step, idx) => `
                <tr>
                  <td>${idx + 1}</td>
                  <td>
                    <span class="status-badge" style="background-color: ${getStatusColor(step.status)}">
                      ${getStatusLabel(step.status)}
                    </span>
                  </td>
                  <td>${step.MachineType || '-'}</td>
                  <td><strong>${step.MachineName || '-'}</strong></td>
                  <td>${step.OptereName || '-'}</td>
                  <td>${step.StartTime && step.status !== 'none' && step.status !== 'pending' ? new Date(step.StartTime).toLocaleString() : '-'}</td>
                  <td>${step.EndTime && step.status === 'completed' ? new Date(step.EndTime).toLocaleString() : '-'}</td>
                  <td>${step.note || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
        </html>
      `;

      // Create hidden iframe for printing (Electron compatible)
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.style.border = 'none';
      iframe.style.left = '-9999px';
      iframe.style.top = '0';
      iframe.style.zIndex = '-1';
      document.body.appendChild(iframe);

      const iframeDoc = iframe.contentWindow?.document;
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(printContent);
        iframeDoc.close();

        setTimeout(() => {
          try {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
          } catch (e) {
            console.error('Print error:', e);
            const printWin = window.open('', '_blank');
            if (printWin) {
              printWin.document.write(printContent);
              printWin.document.close();
              printWin.focus();
              printWin.print();
            }
          }
          setTimeout(() => {
            if (iframe.parentNode) {
              document.body.removeChild(iframe);
            }
          }, 1000);
        }, 500);
      }
    };

    // Export Manufacturing Steps to Excel
    const handleExportExcel = () => {
      if (!savedStep) return;

      // Create CSV content
      const headers = ['#', 'Status', 'Machine Type', 'Machine Name', 'Operator', 'Start Time', 'End Time', 'Note'];
      const rows = savedStep.steps.map((step, idx) => [
        idx + 1,
        getStatusLabel(step.status),
        step.MachineType || '',
        step.MachineName || '',
        step.OptereName || '',
        step.StartTime && step.status !== 'none' && step.status !== 'pending' ? new Date(step.StartTime).toLocaleString() : '',
        step.EndTime && step.status === 'completed' ? new Date(step.EndTime).toLocaleString() : '',
        step.note || ''
      ]);

      // Add header info
      const headerInfo = [
        ['Manufacturing Steps Report'],
        [''],
        orderId ? ['Order ID:', orderId] : [],
        customerInfo?.name ? ['Customer:', customerInfo.name] : [],
        customerInfo?.companyName ? ['Company:', customerInfo.companyName] : [],
        customerInfo?.address ? ['Address:', customerInfo.address] : [],
        ['Step Name:', savedStep.stepname],
        ['Generated:', new Date().toLocaleString()],
        [''],
        headers,
        ...rows
      ].filter(row => row.length > 0);

      // Convert to CSV
      const csvContent = headerInfo.map(row =>
        row.map(cell => {
          // Escape quotes and wrap in quotes if contains comma
          const cellStr = String(cell);
          if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
            return `"${cellStr.replace(/"/g, '""')}"`;
          }
          return cellStr;
        }).join(',')
      ).join('\n');

      // Create and download file
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const filename = `Manufacturing_Steps_${savedStep.stepname}_${orderId || 'new'}_${new Date().toISOString().slice(0, 10)}.csv`;

      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    };

    // Print Machine Table Data
    const handlePrintMachineTable = () => {
      if (!tableData || !selectedMachineForTable) return;

      const currentDate = new Date().toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Machine Table - ${selectedMachineForTable.machineName}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              font-size: 12px;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              margin-bottom: 20px;
              padding-bottom: 15px;
              border-bottom: 2px solid #333;
            }
            .header-left h1 {
              font-size: 18px;
              margin-bottom: 5px;
              color: #1e293b;
            }
            .header-left .date {
              font-size: 11px;
              color: #666;
            }
            .customer-info {
              text-align: right;
              font-size: 11px;
              line-height: 1.5;
            }
            .order-badge {
              display: inline-block;
              background: #fef3c7;
              color: #d97706;
              padding: 4px 10px;
              border-radius: 4px;
              font-weight: 600;
              font-size: 12px;
              margin-bottom: 10px;
              border: 1px solid #f59e0b;
            }
            .info-section {
              background: #f5f5f5;
              padding: 12px;
              border-radius: 4px;
              margin-bottom: 15px;
            }
            .info-section h4 {
              margin-bottom: 8px;
              color: #1e293b;
            }
            .info-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 8px;
            }
            .status-badge {
              padding: 3px 8px;
              border-radius: 10px;
              color: white;
              font-size: 10px;
              font-weight: bold;
              display: inline-block;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px 10px;
              text-align: left;
              font-size: 11px;
            }
            th {
              background: #f8fafc;
              font-weight: 600;
              color: #475569;
            }
            tr:nth-child(even) {
              background: #fafafa;
            }
            .section-title {
              background: #e0f2fe;
              color: #0369a1;
              padding: 8px 12px;
              border-radius: 4px;
              font-weight: 600;
              font-size: 13px;
              margin: 15px 0 10px 0;
            }
            @media print {
              body { padding: 10px; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="header-left">
              ${orderId ? `<div class="order-badge">${orderId}</div>` : ''}
              <h1>Machine Table: ${selectedMachineForTable.machineName}</h1>
              <div class="date">${currentDate}</div>
            </div>
            ${customerInfo ? `
              <div class="customer-info">
                ${customerInfo.name ? `<div><strong>${customerInfo.name}</strong></div>` : ''}
                ${customerInfo.companyName ? `<div>${customerInfo.companyName}</div>` : ''}
                ${customerInfo.address ? `<div>${customerInfo.address}</div>` : ''}
                ${customerInfo.phone || customerInfo.whatsapp ? `<div>Ph: ${customerInfo.phone || customerInfo.whatsapp}</div>` : ''}
              </div>
            ` : ''}
          </div>

          ${tableData.order || tableData.machine ? `
            <div class="info-section">
              <h4>Order & Machine Details</h4>
              <div class="info-grid">
                ${tableData.order ? `
                  <div><strong>Order ID:</strong> ${tableData.order.orderId}</div>
                  <div><strong>Customer:</strong> ${tableData.order.customer}</div>
                  <div><strong>Order Status:</strong> ${tableData.order.status}</div>
                ` : ''}
                ${tableData.machine ? `
                  <div><strong>Machine Status:</strong> ${getStatusLabel(tableData.machine.status)}</div>
                  <div><strong>Operator:</strong> ${tableData.machine.operatorName || 'Not assigned'}</div>
                  ${tableData.machine.startedAt ? `<div><strong>Started:</strong> ${new Date(tableData.machine.startedAt).toLocaleString()}</div>` : ''}
                  ${tableData.machine.completedAt ? `<div><strong>Completed:</strong> ${new Date(tableData.machine.completedAt).toLocaleString()}</div>` : ''}
                ` : ''}
              </div>
            </div>
          ` : ''}

          ${tableData.operatorSessionData?.operatorSessions?.length > 0 ? `
            <div class="section-title">Operator Sessions (${tableData.operatorSessionData.sessionCount} sessions)</div>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Operator</th>
                  <th>Start Time</th>
                  <th>End Time</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                ${tableData.operatorSessionData.operatorSessions.map((session: any, idx: number) => `
                  <tr>
                    <td>${idx + 1}</td>
                    <td>${session.operatorName}</td>
                    <td>${session.startTime ? new Date(session.startTime).toLocaleString() : '-'}</td>
                    <td>${session.endTime ? new Date(session.endTime).toLocaleString() : '-'}</td>
                    <td>${session.duration ? `${Math.floor(session.duration / 60)}h ${session.duration % 60}m` : '-'}</td>
                    <td>${session.status}</td>
                    <td>${session.notes || session.pauseReason || '-'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <div style="margin-top: 10px; font-weight: bold;">
              Total Production Time: ${tableData.operatorSessionData.totalProductionTimeFormatted}
            </div>
          ` : ''}

          ${tableData.tableData?.rowData?.length > 0 ? `
            <div class="section-title">Production Data (${tableData.tableData.rowData.length} rows)</div>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  ${tableData.tableStructure?.columns?.map((col: any) => `<th>${col.name}</th>`).join('') || ''}
                </tr>
              </thead>
              <tbody>
                ${tableData.tableData.rowData.map((row: any, idx: number) => `
                  <tr>
                    <td>${idx + 1}</td>
                    ${tableData.tableStructure?.columns?.map((col: any) => `<td>${row[col.name] !== undefined ? row[col.name] : '-'}</td>`).join('') || ''}
                  </tr>
                `).join('')}
              </tbody>
            </table>
          ` : ''}

          ${tableData.tableData?.totalCalculations ? `
            <div class="info-section" style="margin-top: 15px; background: #e8f5e9;">
              <h4>Summary Calculations</h4>
              <div class="info-grid">
                ${Object.entries(tableData.tableData.totalCalculations).map(([key, value]: [string, any]) => `
                  <div><strong>${key.replace(/([A-Z])/g, ' $1').trim()}:</strong> ${value}</div>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </body>
        </html>
      `;

      // Create hidden iframe for printing
      const iframe = document.createElement('iframe');
      iframe.style.cssText = 'position:fixed;width:100%;height:100%;border:none;left:-9999px;top:0;z-index:-1';
      document.body.appendChild(iframe);

      const iframeDoc = iframe.contentWindow?.document;
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(printContent);
        iframeDoc.close();

        setTimeout(() => {
          try {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
          } catch (e) {
            console.error('Print error:', e);
            const printWin = window.open('', '_blank');
            if (printWin) {
              printWin.document.write(printContent);
              printWin.document.close();
              printWin.focus();
              printWin.print();
            }
          }
          setTimeout(() => {
            if (iframe.parentNode) {
              document.body.removeChild(iframe);
            }
          }, 1000);
        }, 500);
      }
    };

    // Export Machine Table Data to Excel
    const handleExportMachineTableExcel = () => {
      if (!tableData || !selectedMachineForTable) return;

      const csvRows: string[][] = [
        [`Machine Table Export - ${selectedMachineForTable.machineName}`],
        [''],
        orderId ? ['Order ID:', orderId] : [],
        customerInfo?.name ? ['Customer:', customerInfo.name] : [],
        customerInfo?.companyName ? ['Company:', customerInfo.companyName] : [],
        ['Generated:', new Date().toLocaleString()],
        ['']
      ].filter(r => r.length > 0);

      // Order & Machine Info
      if (tableData.order || tableData.machine) {
        csvRows.push(['--- Order & Machine Details ---']);
        if (tableData.order) {
          csvRows.push(['Order ID:', tableData.order.orderId]);
          csvRows.push(['Customer:', tableData.order.customer]);
          csvRows.push(['Order Status:', tableData.order.status]);
        }
        if (tableData.machine) {
          csvRows.push(['Machine Status:', getStatusLabel(tableData.machine.status)]);
          csvRows.push(['Operator:', tableData.machine.operatorName || 'Not assigned']);
          if (tableData.machine.startedAt) {
            csvRows.push(['Started At:', new Date(tableData.machine.startedAt).toLocaleString()]);
          }
          if (tableData.machine.completedAt) {
            csvRows.push(['Completed At:', new Date(tableData.machine.completedAt).toLocaleString()]);
          }
        }
        csvRows.push(['']);
      }

      // Operator Sessions
      if (tableData.operatorSessionData?.operatorSessions?.length > 0) {
        csvRows.push([`--- Operator Sessions (${tableData.operatorSessionData.sessionCount} sessions) ---`]);
        csvRows.push(['#', 'Operator', 'Start Time', 'End Time', 'Duration', 'Status', 'Notes']);

        tableData.operatorSessionData.operatorSessions.forEach((session: any, idx: number) => {
          csvRows.push([
            String(idx + 1),
            session.operatorName,
            session.startTime ? new Date(session.startTime).toLocaleString() : '-',
            session.endTime ? new Date(session.endTime).toLocaleString() : '-',
            session.duration ? `${Math.floor(session.duration / 60)}h ${session.duration % 60}m` : '-',
            session.status,
            session.notes || session.pauseReason || '-'
          ]);
        });

        csvRows.push(['Total Production Time:', tableData.operatorSessionData.totalProductionTimeFormatted]);
        csvRows.push(['']);
      }

      // Production Data
      if (tableData.tableData?.rowData?.length > 0) {
        csvRows.push([`--- Production Data (${tableData.tableData.rowData.length} rows) ---`]);

        const columnHeaders = ['#', ...(tableData.tableStructure?.columns?.map((col: any) => col.name) || [])];
        csvRows.push(columnHeaders);

        tableData.tableData.rowData.forEach((row: any, idx: number) => {
          const rowData = [
            String(idx + 1),
            ...(tableData.tableStructure?.columns?.map((col: any) => String(row[col.name] !== undefined ? row[col.name] : '-')) || [])
          ];
          csvRows.push(rowData);
        });
        csvRows.push(['']);
      }

      // Summary Calculations
      if (tableData.tableData?.totalCalculations) {
        csvRows.push(['--- Summary Calculations ---']);
        Object.entries(tableData.tableData.totalCalculations).forEach(([key, value]: [string, any]) => {
          csvRows.push([key.replace(/([A-Z])/g, ' $1').trim(), String(value)]);
        });
      }

      // Convert to CSV
      const csvContent = csvRows.map(row =>
        row.map(cell => {
          const s = String(cell);
          return s.includes(',') || s.includes('"') || s.includes('\n')
            ? `"${s.replace(/"/g, '""')}"`
            : s;
        }).join(',')
      ).join('\n');

      // Create and download file
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const filename = `Machine_Table_${selectedMachineForTable.machineName}_${orderId || 'new'}_${new Date().toISOString().slice(0, 10)}.csv`;

      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
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
          <div className="section search" style={{ position: 'relative', marginBottom: '10px' }}>
            <label htmlFor="searchInput" className="ManufacturingStepsTitel">Step Name:</label>
            <div style={{ position: 'relative' }}>
              <input
                id="searchInput"
                type="text"
                placeholder="Enter step name to search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="inputBox"
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '13px' }}
              />
              <StepSuggestions
                stepName={searchTerm}
                onSelect={handleSuggestionSelect}
              />
            </div>
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
                    No machines found for this step.
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
                  </div>
                ))}

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
              {/* Step Header with Print and Excel buttons */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 10px',
                background: '#f0f9ff',
                borderRadius: '6px 6px 0 0',
                borderBottom: '1px solid #e0e7ff'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{
                    background: '#0ea5e9',
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    {savedStep.stepname}
                  </span>
                  <span style={{
                    background: '#dbeafe',
                    color: '#1d4ed8',
                    padding: '3px 10px',
                    borderRadius: '10px',
                    fontSize: '11px',
                    fontWeight: '500'
                  }}>
                    {savedStep.steps.length} machine{savedStep.steps.length > 1 ? 's' : ''}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrintSteps();
                    }}
                    style={{
                      background: '#f59e0b',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '5px 10px',
                      fontSize: '11px',
                      fontWeight: '500'
                    }}
                    title="Print Manufacturing Steps"
                  >
                    <Printer size={14} />
                    Print
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleExportExcel();
                    }}
                    style={{
                      background: '#10b981',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '5px 10px',
                      fontSize: '11px',
                      fontWeight: '500'
                    }}
                    title="Export to Excel (CSV)"
                  >
                    <FileSpreadsheet size={14} />
                    Excel
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAllStepsPopup(true);
                    }}
                    style={{
                      background: '#8b5cf6',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '5px 10px',
                      fontSize: '11px',
                      fontWeight: '500'
                    }}
                    title="View all step details"
                  >
                    <Eye size={14} />
                    View All
                  </button>
                </div>
              </div>

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
                  <span>{step.StartTime && step.status !== 'none' && step.status !== 'pending' ? new Date(step.StartTime).toLocaleString() : 'N/A'}</span>
                  <span>{step.EndTime && step.status === 'completed' ? new Date(step.EndTime).toLocaleString() : 'N/A'}</span>
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', padding: '10px 15px', backgroundColor: '#f8fafc', borderRadius: '8px', borderBottom: '1px solid #e5e7eb' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {orderId && (
                      <span style={{
                        background: '#fef3c7',
                        color: '#d97706',
                        padding: '4px 10px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '600',
                        border: '1px solid #fcd34d'
                      }}>
                        {orderId}
                      </span>
                    )}
                    <h3 style={{ margin: 0, fontSize: '16px', color: '#1e293b' }}>Machine Table: {selectedMachineForTable.machineName}</h3>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {lastUpdate && (
                      <span style={{ fontSize: '11px', color: '#4caf50' }}>
                        🟢 Live • {lastUpdate.toLocaleTimeString()}
                      </span>
                    )}
                    <button
                      onClick={handlePrintMachineTable}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#f59e0b',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                      disabled={loadingTable || !tableData}
                      title="Print Machine Table"
                    >
                      <Printer size={14} />
                      Print
                    </button>
                    <button
                      onClick={handleExportMachineTableExcel}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                      disabled={loadingTable || !tableData}
                      title="Export to Excel (CSV)"
                    >
                      <FileSpreadsheet size={14} />
                      Excel
                    </button>
                    <button
                      onClick={() => handleViewTable(selectedMachineForTable.machineId, selectedMachineForTable.machineName, selectedMachineForTable.index)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#2196F3',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                      disabled={loadingTable}
                    >
                      {loadingTable ? '🔄 Refreshing...' : '🔄 Refresh'}
                    </button>
                  </div>
                </div>

                {loadingTable && (
                  <div style={{ padding: '20px', textAlign: 'center' }}>
                    Loading machine table data...
                  </div>
                )}
                
                {!loadingTable && tableData && (
                  <div style={{ overflowX: 'auto', maxHeight: '600px' }}>
                    {/* Order and Machine Info */}
                    <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                      <h4>Order & Machine Details</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                        {tableData.order && (
                          <>
                            <div><strong>Order ID:</strong> {tableData.order.orderId}</div>
                            <div><strong>Customer:</strong> {tableData.order.customer}</div>
                            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
                              <strong>Order Status:</strong>
                              <span style={{
                                padding: '4px 12px',
                                borderRadius: '12px',
                                backgroundColor: getStatusColor(tableData.order.status),
                                color: 'white',
                                fontSize: '11px',
                                fontWeight: '600',
                                whiteSpace: 'nowrap',
                                display: 'inline-block',
                                lineHeight: '1.2'
                              }}>
                                {tableData.order.status}
                              </span>
                            </div>
                          </>
                        )}
                        {tableData.machine && (
                          <>
                            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
                              <strong>Machine Status:</strong>
                              <span style={{
                                padding: '4px 12px',
                                borderRadius: '12px',
                                backgroundColor: getStatusColor(tableData.machine.status),
                                color: 'white',
                                fontSize: '11px',
                                fontWeight: '600',
                                whiteSpace: 'nowrap',
                                display: 'inline-block',
                                lineHeight: '1.2'
                              }}>
                                {getStatusLabel(tableData.machine.status)}
                              </span>
                            </div>
                            <div><strong>Operator:</strong> {tableData.machine.operatorName || 'Not assigned'}</div>
                            {tableData.machine.startedAt && (
                              <div><strong>Started At:</strong> {new Date(tableData.machine.startedAt).toLocaleString()}</div>
                            )}
                            {tableData.machine.completedAt && (
                              <div><strong>Completed At:</strong> {new Date(tableData.machine.completedAt).toLocaleString()}</div>
                            )}
                            {tableData.machine.note && (
                              <div style={{ gridColumn: '1 / -1' }}>
                                <strong>Note:</strong> {tableData.machine.note}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    {/* Operator Production Sessions */}
                    <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#e8f5e9', borderRadius: '4px' }}>
                      <h4 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        👷 Operator Production Sessions
                        {tableData.operatorSessionData ? (
                          <span style={{
                            padding: '2px 10px',
                            borderRadius: '15px',
                            backgroundColor: '#4caf50',
                            color: 'white',
                            fontSize: '12px'
                          }}>
                            Total: {tableData.operatorSessionData.totalProductionTimeFormatted}
                          </span>
                        ) : (
                          <span style={{
                            padding: '2px 10px',
                            borderRadius: '15px',
                            backgroundColor: '#9e9e9e',
                            color: 'white',
                            fontSize: '12px'
                          }}>
                            No data saved yet
                          </span>
                        )}
                      </h4>

                      {tableData.operatorSessionData ? (
                        <>
                          {/* Current Active Session */}
                          {tableData.operatorSessionData.currentSession?.isActive && (
                            <div style={{
                              marginBottom: '15px',
                              padding: '10px',
                              backgroundColor: '#fff3e0',
                              borderRadius: '4px',
                              border: '2px solid #ff9800'
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <span style={{ fontSize: '18px' }}>▶️</span>
                                <strong>Active Session</strong>
                                <span style={{
                                  padding: '2px 8px',
                                  borderRadius: '10px',
                                  backgroundColor: '#ff9800',
                                  color: 'white',
                                  fontSize: '11px',
                                  animation: 'pulse 1.5s infinite'
                                }}>LIVE</span>
                              </div>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                                <div><strong>Operator:</strong> {tableData.operatorSessionData.currentSession.operatorName}</div>
                                <div><strong>Started:</strong> {new Date(tableData.operatorSessionData.currentSession.startTime).toLocaleString()}</div>
                              </div>
                            </div>
                          )}

                          {/* Session History */}
                          {tableData.operatorSessionData.operatorSessions?.length > 0 ? (
                            <div>
                              <strong style={{ marginBottom: '10px', display: 'block' }}>
                                Session History ({tableData.operatorSessionData.sessionCount} sessions, {tableData.operatorSessionData.completedSessions} completed)
                              </strong>
                              <table style={{
                                width: '100%',
                                borderCollapse: 'collapse',
                                fontSize: '13px'
                              }}>
                                <thead>
                                  <tr style={{ backgroundColor: '#4caf50', color: 'white' }}>
                                    <th style={{ padding: '8px', border: '1px solid #ddd' }}>#</th>
                                    <th style={{ padding: '8px', border: '1px solid #ddd' }}>Operator</th>
                                    <th style={{ padding: '8px', border: '1px solid #ddd' }}>Start Time</th>
                                    <th style={{ padding: '8px', border: '1px solid #ddd' }}>End Time</th>
                                    <th style={{ padding: '8px', border: '1px solid #ddd' }}>Duration</th>
                                    <th style={{ padding: '8px', border: '1px solid #ddd' }}>Status</th>
                                    <th style={{ padding: '8px', border: '1px solid #ddd' }}>Notes</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {tableData.operatorSessionData.operatorSessions.map((session: any, idx: number) => (
                                    <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? 'white' : '#f9f9f9' }}>
                                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>{idx + 1}</td>
                                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>{session.operatorName}</td>
                                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                                        {session.startTime ? new Date(session.startTime).toLocaleString() : '-'}
                                      </td>
                                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                                        {session.endTime ? new Date(session.endTime).toLocaleString() : '-'}
                                      </td>
                                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                                        {session.duration ? `${Math.floor(session.duration / 60)}h ${session.duration % 60}m` : '-'}
                                      </td>
                                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                                        <span style={{
                                          padding: '2px 8px',
                                          borderRadius: '10px',
                                          backgroundColor:
                                            session.status === 'completed' ? '#4caf50' :
                                            session.status === 'paused' ? '#ff9800' :
                                            session.status === 'active' ? '#2196f3' : '#9e9e9e',
                                          color: 'white',
                                          fontSize: '11px'
                                        }}>
                                          {session.status}
                                        </span>
                                      </td>
                                      <td style={{ padding: '8px', border: '1px solid #ddd', maxWidth: '150px' }}>
                                        {session.notes || session.pauseReason || '-'}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <div style={{
                              padding: '15px',
                              textAlign: 'center',
                              color: '#666',
                              backgroundColor: '#f5f5f5',
                              borderRadius: '4px'
                            }}>
                              No production sessions recorded yet.
                            </div>
                          )}

                          {/* Saved Row Data from Operator Panel */}
                          {tableData.operatorSessionData.rows && tableData.operatorSessionData.rows.length > 0 && (
                            <div style={{ marginTop: '15px' }}>
                              <strong style={{ marginBottom: '10px', display: 'block' }}>
                                📋 Saved Production Data ({tableData.operatorSessionData.rows.length} entries)
                              </strong>
                              <div style={{ overflowX: 'auto' }}>
                                <table style={{
                                  width: '100%',
                                  borderCollapse: 'collapse',
                                  fontSize: '12px'
                                }}>
                                  <thead>
                                    <tr style={{ backgroundColor: '#2196F3', color: 'white' }}>
                                      <th style={{ padding: '8px', border: '1px solid #ddd' }}>#</th>
                                      {/* Dynamic columns from row data */}
                                      {tableData.operatorSessionData.rows[0]?.data &&
                                        Object.keys(tableData.operatorSessionData.rows[0].data).map((key, idx) => (
                                          <th key={idx} style={{ padding: '8px', border: '1px solid #ddd' }}>{key}</th>
                                        ))
                                      }
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {tableData.operatorSessionData.rows.map((row: any, rowIdx: number) => (
                                      <tr key={rowIdx} style={{ backgroundColor: rowIdx % 2 === 0 ? 'white' : '#f9f9f9' }}>
                                        <td style={{ padding: '8px', border: '1px solid #ddd' }}>{row.rowId || rowIdx + 1}</td>
                                        {row.data && Object.values(row.data).map((value: any, valIdx: number) => (
                                          <td key={valIdx} style={{ padding: '8px', border: '1px solid #ddd' }}>
                                            {value || '-'}
                                          </td>
                                        ))}
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <div style={{
                          padding: '20px',
                          textAlign: 'center',
                          color: '#666',
                          backgroundColor: '#f5f5f5',
                          borderRadius: '4px',
                          marginTop: '10px'
                        }}>
                          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>No operator data saved for this machine yet.</p>
                          <p style={{ margin: 0, fontSize: '13px' }}>
                            Data will appear here when operators use the MachineAccessAndManagement app to:
                          </p>
                          <ul style={{ textAlign: 'left', marginTop: '10px', fontSize: '13px' }}>
                            <li>Start a production session</li>
                            <li>Enter production data in the table</li>
                            <li>Save or complete the session</li>
                          </ul>
                        </div>
                      )}
                    </div>


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
                                {/* Use columns if available, otherwise extract keys from first row */}
                                {tableData.tableStructure?.columns?.length > 0 ? (
                                  tableData.tableStructure.columns.map((col: any, idx: number) => (
                                    <th key={idx} style={{ padding: '8px', border: '1px solid #ddd' }}>
                                      {col.name || col.label || `Col ${col.order || idx + 1}`}
                                    </th>
                                  ))
                                ) : (
                                  Object.keys(tableData.tableData.rowData[0] || {})
                                    .filter(key => key !== 'rowId')
                                    .map((key, idx) => (
                                      <th key={idx} style={{ padding: '8px', border: '1px solid #ddd' }}>
                                        {key}
                                      </th>
                                    ))
                                )}
                              </tr>
                            </thead>
                            <tbody>
                              {tableData.tableData.rowData.map((row: any, rowIdx: number) => (
                                <tr key={rowIdx} style={{ backgroundColor: rowIdx % 2 === 0 ? 'white' : '#f9f9f9' }}>
                                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{rowIdx + 1}</td>
                                  {/* Use columns if available, otherwise render all row values */}
                                  {tableData.tableStructure?.columns?.length > 0 ? (
                                    tableData.tableStructure.columns.map((col: any, colIdx: number) => (
                                      <td key={colIdx} style={{ padding: '8px', border: '1px solid #ddd' }}>
                                        {row[String(col.order)] !== undefined ? row[String(col.order)] : (row[col.order] !== undefined ? row[col.order] : (row[col.name] !== undefined ? row[col.name] : '-'))}
                                      </td>
                                    ))
                                  ) : (
                                    Object.keys(row)
                                      .filter(key => key !== 'rowId')
                                      .map((key, idx) => (
                                        <td key={idx} style={{ padding: '8px', border: '1px solid #ddd' }}>
                                          {row[key] !== undefined ? row[key] : '-'}
                                        </td>
                                      ))
                                  )}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

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

        {/* View All Steps Popup */}
        {showAllStepsPopup && savedStep && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10000,
              padding: '20px'
            }}
            onClick={() => setShowAllStepsPopup(false)}
          >
            <div
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                maxWidth: '95vw',
                maxHeight: '90vh',
                overflow: 'hidden',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                display: 'flex',
                flexDirection: 'column',
                minWidth: '800px'
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
                  backgroundColor: '#f0f9ff'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {orderId && (
                    <span style={{
                      background: '#0ea5e9',
                      color: 'white',
                      padding: '4px 10px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      {orderId}
                    </span>
                  )}
                  <h3 style={{ margin: 0, fontSize: '16px', color: '#0369a1', fontWeight: '600' }}>
                    Manufacturing Steps - {savedStep.stepname}
                  </h3>
                  <span style={{
                    background: '#0ea5e9',
                    color: 'white',
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}>
                    {savedStep.steps.length} machine{savedStep.steps.length > 1 ? 's' : ''}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={handlePrintSteps}
                    style={{
                      background: '#f59e0b',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      padding: '6px 12px',
                      fontSize: '13px',
                      color: 'white',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Printer size={14} />
                    Print
                  </button>
                  <button
                    onClick={handleExportExcel}
                    style={{
                      background: '#10b981',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      padding: '6px 12px',
                      fontSize: '13px',
                      color: 'white',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <FileSpreadsheet size={14} />
                    Excel
                  </button>
                  <button
                    onClick={() => setShowAllStepsPopup(false)}
                    style={{
                      background: '#f1f5f9',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      padding: '6px 12px',
                      fontSize: '13px',
                      color: '#64748b',
                      fontWeight: '500'
                    }}
                  >
                    ✕ Close
                  </button>
                </div>
              </div>

              {/* Content */}
              <div style={{ padding: '16px', overflowY: 'auto', maxHeight: 'calc(90vh - 80px)' }}>
                {/* Customer Info Card */}
                {customerInfo && (
                  <div style={{
                    background: '#fef3c7',
                    border: '1px solid #fcd34d',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    marginBottom: '16px'
                  }}>
                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                      {customerInfo.name && (
                        <div>
                          <div style={{ fontSize: '10px', color: '#92400e', fontWeight: '600', textTransform: 'uppercase' }}>Customer</div>
                          <div style={{ fontSize: '13px', color: '#78350f', fontWeight: '500' }}>{customerInfo.name}</div>
                        </div>
                      )}
                      {customerInfo.companyName && (
                        <div>
                          <div style={{ fontSize: '10px', color: '#92400e', fontWeight: '600', textTransform: 'uppercase' }}>Company</div>
                          <div style={{ fontSize: '13px', color: '#78350f' }}>{customerInfo.companyName}</div>
                        </div>
                      )}
                      {customerInfo.address && (
                        <div>
                          <div style={{ fontSize: '10px', color: '#92400e', fontWeight: '600', textTransform: 'uppercase' }}>Address</div>
                          <div style={{ fontSize: '13px', color: '#78350f' }}>{customerInfo.address}</div>
                        </div>
                      )}
                      {(customerInfo.phone || customerInfo.whatsapp) && (
                        <div>
                          <div style={{ fontSize: '10px', color: '#92400e', fontWeight: '600', textTransform: 'uppercase' }}>Phone</div>
                          <div style={{ fontSize: '13px', color: '#78350f' }}>{customerInfo.phone || customerInfo.whatsapp}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Steps Table */}
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8fafc' }}>
                        <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '600', color: '#475569', borderBottom: '2px solid #e2e8f0' }}>#</th>
                        <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '600', color: '#475569', borderBottom: '2px solid #e2e8f0' }}>Status</th>
                        <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '600', color: '#475569', borderBottom: '2px solid #e2e8f0' }}>Machine Type</th>
                        <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '600', color: '#475569', borderBottom: '2px solid #e2e8f0' }}>Machine Name</th>
                        <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '600', color: '#475569', borderBottom: '2px solid #e2e8f0' }}>Operator</th>
                        <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '600', color: '#475569', borderBottom: '2px solid #e2e8f0' }}>Start Time</th>
                        <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '600', color: '#475569', borderBottom: '2px solid #e2e8f0' }}>End Time</th>
                        <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '600', color: '#475569', borderBottom: '2px solid #e2e8f0' }}>Note</th>
                      </tr>
                    </thead>
                    <tbody>
                      {savedStep.steps.map((step, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '10px 12px', color: '#64748b' }}>{idx + 1}</td>
                          <td style={{ padding: '10px 12px' }}>
                            <span style={{
                              padding: '4px 10px',
                              borderRadius: '12px',
                              backgroundColor: getStatusColor(step.status),
                              color: 'white',
                              fontSize: '11px',
                              fontWeight: 'bold',
                              display: 'inline-block'
                            }}>
                              {getStatusLabel(step.status)}
                            </span>
                          </td>
                          <td style={{ padding: '10px 12px', color: '#334155' }}>{step.MachineType || '-'}</td>
                          <td style={{ padding: '10px 12px', fontWeight: '500', color: '#1e293b' }}>{step.MachineName || '-'}</td>
                          <td style={{ padding: '10px 12px', color: '#334155' }}>{step.OptereName || '-'}</td>
                          <td style={{ padding: '10px 12px', color: '#334155' }}>
                            {step.StartTime && step.status !== 'none' && step.status !== 'pending' ? new Date(step.StartTime).toLocaleString() : '-'}
                          </td>
                          <td style={{ padding: '10px 12px', color: '#334155' }}>
                            {step.EndTime && step.status === 'completed' ? new Date(step.EndTime).toLocaleString() : '-'}
                          </td>
                          <td style={{ padding: '10px 12px', color: '#334155', maxWidth: '200px' }}>
                            {step.note || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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