import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BackButton } from "../../../allCompones/BackButton";
import "./indexAllOders.css";

// Import Redux actions
import { getAllMachineTypes } from "../../../redux/create/machineType/machineTypeActions";
import { getMachines } from "../../../redux/create/machine/MachineActions";
import { fetchOrders } from "../../../redux/oders/OdersActions";
import { RootState } from "../../../redux/rootReducer";
import { AppDispatch } from "../../../../store";

// Define interfaces
interface MachineType {
  _id: string;
  type: string;
  description?: string;
  machines?: Machine[];
  branchId?: {
    _id: string;
    name: string;
  };
}

interface Machine {
  _id: string;
  machineName: string;
  sizeX: string;
  sizeY: string;
  sizeZ: string;
  machineType: {
    _id: string;
    type: string;
    description?: string;
  };
  branchId: {
    _id: string;
    name: string;
  };
}

interface Order {
  _id: string;
  orderId: string;
  customer?: {
    _id?: string;
    companyName?: string;
    name?: string;
  };
  createdAt: string;
  updatedAt: string;
  overallStatus: string;
  materialWeight?: number;
  Width?: number;
  Height?: number;
  Thickness?: number;
  Notes?: string;
  branch?: {
    _id?: string;
    name: string;
    code: string;
  };
  material?: {
    _id?: string;
    name?: string;
    type?: string;
  };
  steps?: any[];
  stepsCount?: number;
  totalMachines?: number;
  completedSteps?: number;
  currentStepIndex?: number;
  
  // For machine assignment (if available)
  assignedMachine?: string; // Machine ID or name
  assignedMachineType?: string; // Machine Type ID or name
}

// Define order data structure for display
interface DisplayOrder {
  orderID: string;
  date: string;
  companyName: string;
  status: "Complete" | "Pending" | "Cancel" | "Stop" | "Dispatch" | "In-Progress" | "Ready" | "Unknown";
  machineName: string;
  machineType: string;
  machineStatus: "Start" | "Stop" | "Pending" | "Unknown";
  materialWeight?: number;
  dimensions?: string;
  branch?: string;
  completionProgress?: string;
  notes?: string;
}

const IndexAllOders = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  // Redux selectors
  const machineTypesState = useSelector((state: RootState) => state.machineTypeList as any);
  const machinesState = useSelector((state: RootState) => state.machineList as any);
  const ordersState = useSelector((state: RootState) => state.orderList as any);

  const { items: machineTypes = [], loading: machineTypesLoading } = machineTypesState || {};
  const { machines = [], loading: machinesLoading } = machinesState || {};
  const { orders = [], loading: ordersLoading } = ordersState || {};

  // Component state
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [machineTypeFilter, setMachineTypeFilter] = useState<string[]>([]);
  const [machineNameFilter, setMachineNameFilter] = useState<string[]>([]);
  const [showGlobalAll, setShowGlobalAll] = useState(true);

  // Load data on component mount
  useEffect(() => {
    dispatch(getAllMachineTypes());
    dispatch(getMachines());
    dispatch(fetchOrders({}));
  }, [dispatch]);

  // Get unique machine types and names from Redux data
  const uniqueMachineTypes = machineTypes.map((mt: MachineType) => mt.type);
  const uniqueMachineNames = machines.map((m: Machine) => m.machineName);

  // Helper function to map order status to display status
  const mapOrderStatus = (status: string): DisplayOrder['status'] => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower.includes('complete') || statusLower === 'completed') return 'Complete';
    if (statusLower.includes('pending') || statusLower === 'wait for approval') return 'Pending';
    if (statusLower.includes('cancel')) return 'Cancel';
    if (statusLower.includes('stop') || statusLower.includes('hold')) return 'Stop';
    if (statusLower.includes('dispatch')) return 'Dispatch';
    if (statusLower.includes('progress')) return 'In-Progress';
    if (statusLower.includes('ready')) return 'Ready';
    return 'Unknown';
  };

  // Helper function to determine machine status based on order progress
  const getMachineStatus = (order: Order): DisplayOrder['machineStatus'] => {
    if (!order.stepsCount || order.stepsCount === 0) return 'Unknown';
    
    const progress = (order.completedSteps || 0) / order.stepsCount;
    
    if (progress === 1) return 'Stop'; // Completed
    if (progress > 0) return 'Start'; // In progress
    return 'Pending'; // Not started
  };

  // Helper function to find assigned machine info
  const getAssignedMachineInfo = (order: Order) => {
    // Try to find machine assignment from order data
    // This depends on how machine assignment is stored in your orders
    
    // Option 1: If machine ID is stored in order
    if (order.assignedMachine) {
      const machine = machines.find((m: Machine) => 
        m._id === order.assignedMachine || m.machineName === order.assignedMachine
      );
      if (machine) {
        return {
          machineName: machine.machineName,
          machineType: machine.machineType.type
        };
      }
    }

    // Option 2: If machine type is stored in order
    if (order.assignedMachineType) {
      const machineType = machineTypes.find((mt: MachineType) => 
        mt._id === order.assignedMachineType || mt.type === order.assignedMachineType
      );
      if (machineType) {
        // Get first available machine of this type
        const machine = machines.find((m: Machine) => m.machineType._id === machineType._id);
        return {
          machineName: machine?.machineName || 'Unassigned',
          machineType: machineType.type
        };
      }
    }

    // Option 3: Assign based on material type or other criteria
    // This is a fallback - you might want to implement specific logic here
    if (order.material?.type) {
      // Simple mapping example - customize based on your business logic
      const suggestedMachineType = machineTypes.find((mt: MachineType) => 
        mt.type.toLowerCase().includes(order.material?.type?.toLowerCase() || '')
      );
      
      if (suggestedMachineType) {
        const machine = machines.find((m: Machine) => m.machineType._id === suggestedMachineType._id);
        return {
          machineName: machine?.machineName || 'Auto-assigned',
          machineType: suggestedMachineType.type
        };
      }
    }

    // Default fallback
    return {
      machineName: 'Unassigned',
      machineType: 'Not specified'
    };
  };

  // Transform orders to display format
  const transformOrdersToDisplay = (): DisplayOrder[] => {
    return orders.map((order: Order) => {
      const machineInfo = getAssignedMachineInfo(order);
      
      return {
        orderID: order.orderId || order._id,
        date: new Date(order.createdAt).toISOString().split('T')[0],
        companyName: order.customer?.companyName || order.customer?.name || 'Unknown Customer',
        status: mapOrderStatus(order.overallStatus),
        machineName: machineInfo.machineName,
        machineType: machineInfo.machineType,
        machineStatus: getMachineStatus(order),
        materialWeight: order.materialWeight,
        dimensions: order.Width && order.Height && order.Thickness 
          ? `${order.Width}×${order.Height}×${order.Thickness}`
          : undefined,
        branch: order.branch?.name,
        completionProgress: order.stepsCount 
          ? `${order.completedSteps || 0}/${order.stepsCount}`
          : undefined,
        notes: order.Notes
      };
    });
  };

  const displayOrders = transformOrdersToDisplay();

  // Event handlers
  const handleGlobalAllSelect = () => {
    setShowGlobalAll(true);
    setStatusFilter([]);
    setMachineTypeFilter([]);
    setMachineNameFilter([]);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(prev => {
      if (prev.includes(status)) {
        return prev.filter(s => s !== status);
      } else {
        return [...prev, status];
      }
    });
    setShowGlobalAll(true);
  };

  const handleMachineTypeFilter = (machineType: string) => {
    setMachineTypeFilter(prev => {
      if (prev.includes(machineType)) {
        return prev.filter(t => t !== machineType);
      } else {
        return [...prev, machineType];
      }
    });
    setShowGlobalAll(true);
  };

  const handleMachineNameFilter = (machineName: string) => {
    setMachineNameFilter(prev => {
      if (prev.includes(machineName)) {
        return prev.filter(m => m !== machineName);
      } else {
        return [...prev, machineName];
      }
    });
    setShowGlobalAll(true);
  };

  const resetAllFilters = () => {
    setStatusFilter([]);
    setMachineTypeFilter([]);
    setMachineNameFilter([]);
    setSearchText("");
    setShowGlobalAll(true);
  };

  // Filter orders based on search and all filters
  const getFilteredOrders = () => {
    let filtered = displayOrders;

    // Filter by search text
    if (searchText) {
      filtered = filtered.filter(order =>
        order.orderID.toLowerCase().includes(searchText.toLowerCase()) ||
        order.companyName.toLowerCase().includes(searchText.toLowerCase()) ||
        order.machineName.toLowerCase().includes(searchText.toLowerCase()) ||
        order.machineType.toLowerCase().includes(searchText.toLowerCase()) ||
        (order.notes && order.notes.toLowerCase().includes(searchText.toLowerCase()))
      );
    }

    // Filter by status (multiple selection)
    if (statusFilter.length > 0) {
      filtered = filtered.filter(order => statusFilter.includes(order.status));
    }

    // Filter by machine type (multiple selection)
    if (machineTypeFilter.length > 0) {
      filtered = filtered.filter(order => machineTypeFilter.includes(order.machineType));
    }

    // Filter by machine name (multiple selection)
    if (machineNameFilter.length > 0) {
      filtered = filtered.filter(order => machineNameFilter.includes(order.machineName));
    }

    return filtered;
  };

const renderOrderCard = (order: DisplayOrder) => (
  <div
    key={order.orderID}
    className="order-card"
    style={{
      border: "1px solid #ddd",
      borderRadius: "8px",
      padding: "15px",
      margin: "10px 0",
      backgroundColor: "#f9f9f9",
    }}
  >
    <table style={{ width: "100%", fontSize: "14px", borderCollapse: "collapse" }}>
      <thead>
        <tr style={{ backgroundColor: "#ecf0f1", textAlign: "left" }}>
          <th style={{ padding: "8px" }}>Order ID</th>
          <th style={{ padding: "8px" }}>Date</th>
          <th style={{ padding: "8px" }}>Machine</th>
          <th style={{ padding: "8px" }}>Type</th>
          <th style={{ padding: "8px" }}>Machine Status</th>
          <th style={{ padding: "8px" }}>Status</th>
          <th style={{ padding: "8px" }}>Weight</th>
          <th style={{ padding: "8px" }}>Dimensions</th>
        </tr>
      </thead>
      <tbody>
        <tr style={{ backgroundColor: "#f9f9f9", borderBottom: "1px solid #ddd" }}>
          <td style={{ padding: "8px" }}>{order.orderID}</td>
          <td style={{ padding: "8px" }}>{order.date}</td>
          <td style={{ padding: "8px" }}>{order.machineName}</td>
          <td style={{ padding: "8px" }}>{order.machineType}</td>
          <td style={{ padding: "8px" }}>
            <span style={{
              padding: "2px 6px",
              borderRadius: "3px",
              fontSize: "12px",
              color: "white",
              backgroundColor:
                order.machineStatus === "Start" ? "#27ae60" :
                order.machineStatus === "Stop" ? "#e74c3c" :
                order.machineStatus === "Pending" ? "#f39c12" :
                "#95a5a6"
            }}>
              {order.machineStatus}
            </span>
          </td>
          <td style={{ padding: "8px" }}>
            <span style={{
              padding: "4px 8px",
              borderRadius: "4px",
              fontSize: "12px",
              fontWeight: "bold",
              color: "white",
              backgroundColor:
                order.status === "Complete" ? "#27ae60" :
                order.status === "Pending" ? "#f39c12" :
                order.status === "Dispatch" ? "#3498db" :
                order.status === "In-Progress" ? "#9b59b6" :
                order.status === "Ready" ? "#1abc9c" :
                order.status === "Cancel" ? "#e74c3c" :
                "#95a5a6"
            }}>
              {order.status}
            </span>
          </td>
          <td style={{ padding: "8px" }}>{order.materialWeight || "-"}</td>
          <td style={{ padding: "8px" }}>{order.dimensions || "-"}</td>
        </tr>
      </tbody>
    </table>

    {/* Optional fields below the table */}
    <div style={{ marginTop: "10px" }}>
      {order.completionProgress && (
        <div>
          <strong>Progress:</strong> {order.completionProgress}
        </div>
      )}
      {order.notes && (
        <div style={{ marginTop: "5px" }}>
          <strong>Notes:</strong>{" "}
          <span style={{ fontSize: "12px", color: "#666" }}>{order.notes}</span>
        </div>
      )}
    </div>
  </div>
);

  const isLoading = machineTypesLoading || machinesLoading || ordersLoading;

  return (
    <div className="container">
      <div className="item">
        <BackButton />
      </div>
      
      <div className="item">
        <div className="sidebarGroup">
          <h3 onClick={handleGlobalAllSelect}>Show All Orders</h3>
        </div>
        
        {/* Status Filter Buttons */}
        <div className="sidebarGroup">
          <h3>Filter by Status <span style={{fontSize: "12px", color: "#666"}}>({statusFilter.length} selected)</span></h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginTop: "10px" }}>
            {["Complete", "Pending", "Cancel", "Stop", "Dispatch", "In-Progress", "Ready"].map((status) => (
              <button
                key={status}
                onClick={() => handleStatusFilter(status)}
                style={{
                  padding: "5px 10px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  backgroundColor: statusFilter.includes(status) ? "#007bff" : "white",
                  color: statusFilter.includes(status) ? "white" : "black",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: statusFilter.includes(status) ? "bold" : "normal"
                }}
              >
                {statusFilter.includes(status) ? "✓ " : ""}{status}
              </button>
            ))}
            <button
              onClick={() => setStatusFilter([])}
              style={{
                padding: "5px 10px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                backgroundColor: statusFilter.length === 0 ? "#007bff" : "white",
                color: statusFilter.length === 0 ? "white" : "black",
                cursor: "pointer",
                fontSize: "12px"
              }}
            >
              Clear Status
            </button>
          </div>
        </div>

        {/* Machine Type Filter */}
        <div className="sidebarGroup">
          <h3>Filter by Machine Type <span style={{fontSize: "12px", color: "#666"}}>({machineTypeFilter.length} selected)</span></h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginTop: "10px" }}>
            {uniqueMachineTypes.map((machineType: string) => (
              <button
                key={machineType}
                onClick={() => handleMachineTypeFilter(machineType)}
                style={{
                  padding: "5px 10px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  backgroundColor: machineTypeFilter.includes(machineType) ? "#28a745" : "white",
                  color: machineTypeFilter.includes(machineType) ? "white" : "black",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: machineTypeFilter.includes(machineType) ? "bold" : "normal"
                }}
              >
                {machineTypeFilter.includes(machineType) ? "✓ " : ""}{machineType}
              </button>
            ))}
            <button
              onClick={() => setMachineTypeFilter([])}
              style={{
                padding: "5px 10px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                backgroundColor: machineTypeFilter.length === 0 ? "#28a745" : "white",
                color: machineTypeFilter.length === 0 ? "white" : "black",
                cursor: "pointer",
                fontSize: "12px"
              }}
            >
              Clear Types
            </button>
          </div>
        </div>

        {/* Machine Name Filter */}
        <div className="sidebarGroup">
          <h3>Filter by Machine Name <span style={{fontSize: "12px", color: "#666"}}>({machineNameFilter.length} selected)</span></h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginTop: "10px" }}>
            {uniqueMachineNames.map((machineName: string) => (
              <button
                key={machineName}
                onClick={() => handleMachineNameFilter(machineName)}
                style={{
                  padding: "5px 10px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  backgroundColor: machineNameFilter.includes(machineName) ? "#dc3545" : "white",
                  color: machineNameFilter.includes(machineName) ? "white" : "black",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: machineNameFilter.includes(machineName) ? "bold" : "normal"
                }}
              >
                {machineNameFilter.includes(machineName) ? "✓ " : ""}{machineName}
              </button>
            ))}
            <button
              onClick={() => setMachineNameFilter([])}
              style={{
                padding: "5px 10px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                backgroundColor: machineNameFilter.length === 0 ? "#dc3545" : "white",
                color: machineNameFilter.length === 0 ? "white" : "black",
                cursor: "pointer",
                fontSize: "12px"
              }}
            >
              Clear Machines
            </button>
          </div>
        </div>

        {/* Reset All Filters Button */}
        <div className="sidebarGroup">
          <button
            onClick={resetAllFilters}
            style={{
              padding: "8px 15px",
              border: "2px solid #6c757d",
              borderRadius: "6px",
              backgroundColor: "#6c757d",
              color: "white",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "bold",
              width: "100%"
            }}
          >
            🔄 Reset All Filters
          </button>
        </div>

        {/* Loading and Data Summary */}
        <div className="sidebarGroup" style={{ fontSize: "12px", color: "#666" }}>
          <div>📊 Data Summary:</div>
          <div>• Machine Types: {machineTypes.length}</div>
          <div>• Machines: {machines.length}</div>
          <div>• Orders: {orders.length}</div>
          {isLoading && <div style={{ color: "#f39c12" }}>⏳ Loading...</div>}
        </div>
      </div>

      <div className="item">
        <div className="inputBoxAllodersSrearchbox">
          <input 
            type="text" 
            placeholder="Search orders, company, machine name, machine type, or notes..." 
            className="input"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
        
        {/* Active Filters Display */}
        {(statusFilter.length > 0 || machineTypeFilter.length > 0 || machineNameFilter.length > 0 || searchText) && (
          <div style={{ 
            backgroundColor: "#f8f9fa", 
            padding: "10px", 
            borderRadius: "6px", 
            margin: "10px 0",
            border: "1px solid #dee2e6"
          }}>
            <strong>Active Filters:</strong>
            <div style={{ marginTop: "5px", display: "flex", flexWrap: "wrap", gap: "5px" }}>
              {statusFilter.length > 0 && (
                <span style={{ 
                  backgroundColor: "#007bff", 
                  color: "white", 
                  padding: "2px 6px", 
                  borderRadius: "3px", 
                  fontSize: "12px" 
                }}>
                  Status: {statusFilter.join(", ")}
                </span>
              )}
              {machineTypeFilter.length > 0 && (
                <span style={{ 
                  backgroundColor: "#28a745", 
                  color: "white", 
                  padding: "2px 6px", 
                  borderRadius: "3px", 
                  fontSize: "12px" 
                }}>
                  Types: {machineTypeFilter.join(", ")}
                </span>
              )}
              {machineNameFilter.length > 0 && (
                <span style={{ 
                  backgroundColor: "#dc3545", 
                  color: "white", 
                  padding: "2px 6px", 
                  borderRadius: "3px", 
                  fontSize: "12px" 
                }}>
                  Machines: {machineNameFilter.join(", ")}
                </span>
              )}
              {searchText && (
                <span style={{ 
                  backgroundColor: "#6c757d", 
                  color: "white", 
                  padding: "2px 6px", 
                  borderRadius: "3px", 
                  fontSize: "12px" 
                }}>
                  Search: "{searchText}"
                </span>
              )}
            </div>
          </div>
        )}
        
        <div className="AllInputOders">
          {isLoading && (
            <div style={{ textAlign: "center", padding: "20px" }}>
              <p>Loading machine types, machines, and orders...</p>
            </div>
          )}

          {!isLoading && showGlobalAll && (
            <div>
              <h3>
                {statusFilter.length === 0 && machineTypeFilter.length === 0 && machineNameFilter.length === 0 
                  ? "All Orders" 
                  : "Filtered Orders"
                }
                <span style={{ fontSize: "14px", marginLeft: "10px", color: "#666" }}>
                  ({getFilteredOrders().length} orders)
                </span>
              </h3>
              {getFilteredOrders().length > 0 ? (
                getFilteredOrders().map(renderOrderCard)
              ) : (
                <div style={{ textAlign: "center", color: "#666", padding: "20px" }}>
                  <p>No orders found matching your criteria.</p>
                  <button
                    onClick={resetAllFilters}
                    style={{
                      padding: "8px 15px",
                      border: "1px solid #007bff",
                      borderRadius: "4px",
                      backgroundColor: "#007bff",
                      color: "white",
                      cursor: "pointer",
                      marginTop: "10px"
                    }}
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IndexAllOders;