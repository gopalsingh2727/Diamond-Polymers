import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BackButton } from "../../../allCompones/BackButton";
import "./indexAllOders.css";
import { Download, Printer } from "lucide-react";

// Import Redux actions
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
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  materialWeight?: number;
  Width?: number;
  Height?: number;
  Thickness?: number;
  Notes?: string;
  notes?: Array<{
    message: string;
    createdBy: string;
    createdAt: Date;
    noteType: 'general' | 'production' | 'quality' | 'delivery' | 'customer';
  }>;
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
  operator?: string;
  assignedOperator?: string;
}

// Define order data structure for display
interface DisplayOrder {
  orderID: string;
  date: string;
  time: string;
  datetime: Date;
  companyName: string;
  operator: string;
  status: "Complete" | "Pending" | "Cancelled" | "Dispatched" | "In-Progress" | "Approved" | "Wait for Approval" | "Unknown";
  priority: 'low' | 'normal' | 'high' | 'urgent';
  machineName: string;
  machineType: string;
  machineStatus: "Start" | "Stop" | "Pending" | "Unknown";
  materialWeight?: number;
  dimensions?: string;
  branch?: string;
  completionProgress?: string;
  notes?: string;
  allNotes?: Array<{
    message: string;
    createdBy: string;
    createdAt: Date;
    noteType: 'general' | 'production' | 'quality' | 'delivery' | 'customer';
  }>;
}

const IndexAllOders = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  // ✅ OPTIMIZED: Use cached data from orderFormData
  const orderFormData = useSelector((state: RootState) => state.orderFormData);
  const machineTypes = orderFormData?.data?.machineTypes || [];
  const machines = orderFormData?.data?.machines || [];
  const machineTypesLoading = orderFormData?.loading || false;
  const machinesLoading = orderFormData?.loading || false;

  // Redux selectors for orders (still needed)
  const ordersState = useSelector((state: RootState) => state.orders as any);
  const { orders = [], loading: ordersLoading } = ordersState || {};

  // Component state
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [priorityFilter, setPriorityFilter] = useState<string[]>([]);
  const [machineTypeFilter, setMachineTypeFilter] = useState<string[]>([]);
  const [machineNameFilter, setMachineNameFilter] = useState<string[]>([]);
  const [operatorFilter, setOperatorFilter] = useState<string[]>([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [sortBy, setSortBy] = useState("date-desc");
  const [showGlobalAll, setShowGlobalAll] = useState(true);

  // Load orders on component mount (machines/types already cached!)
  useEffect(() => {
    // Get accountId from localStorage, Redux state, or your auth provider
    const accountId = localStorage.getItem('accountId') || '';
    if (accountId) {
      dispatch(fetchOrders({ accountId }));
    }
  }, [dispatch]);

  // Get unique values from cached data
  const uniqueMachineTypes = Array.from(new Set((machineTypes as any[]).map((mt: any) => mt.type || '')));
  const uniqueMachineNames = Array.from(new Set((machines as any[]).map((m: any) => m.machineName || '')));
  const uniqueOperators = Array.from(new Set((orders as any[]).map((o: any) => o.operator || o.assignedOperator || "Unassigned")));

  // Helper function to map order status to display status
  const mapOrderStatus = (status: string): DisplayOrder['status'] => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower === 'completed') return 'Complete';
    if (statusLower === 'pending') return 'Pending';
    if (statusLower === 'cancelled') return 'Cancelled';
    if (statusLower === 'dispatched') return 'Dispatched';
    if (statusLower === 'in_progress') return 'In-Progress';
    if (statusLower === 'approved') return 'Approved';
    if (statusLower === 'wait for approval') return 'Wait for Approval';
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
      const createdDate = new Date(order.createdAt);

      return {
        orderID: order.orderId || order._id,
        date: createdDate.toLocaleDateString(),
        time: createdDate.toLocaleTimeString(),
        datetime: createdDate,
        companyName: order.customer?.companyName || order.customer?.name || 'Unknown Customer',
        operator: order.operator || order.assignedOperator || 'Unassigned',
        status: mapOrderStatus(order.overallStatus),
        priority: order.priority || 'normal',
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
        notes: order.Notes,
        allNotes: order.notes
      };
    });
  };

  const displayOrders = transformOrdersToDisplay();

  // Event handlers
  const handleGlobalAllSelect = () => {
    setShowGlobalAll(true);
    setStatusFilter([]);
    setPriorityFilter([]);
    setMachineTypeFilter([]);
    setMachineNameFilter([]);
    setOperatorFilter([]);
    setFromDate("");
    setToDate("");
    setSearchText("");
    setSortBy("date-desc");
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

  const handleOperatorFilter = (operator: string) => {
    setOperatorFilter(prev => {
      if (prev.includes(operator)) {
        return prev.filter(o => o !== operator);
      } else {
        return [...prev, operator];
      }
    });
    setShowGlobalAll(true);
  };

  const handlePriorityFilter = (priority: string) => {
    setPriorityFilter(prev => {
      if (prev.includes(priority)) {
        return prev.filter(p => p !== priority);
      } else {
        return [...prev, priority];
      }
    });
    setShowGlobalAll(true);
  };

  const resetAllFilters = () => {
    setStatusFilter([]);
    setPriorityFilter([]);
    setMachineTypeFilter([]);
    setMachineNameFilter([]);
    setOperatorFilter([]);
    setFromDate("");
    setToDate("");
    setSearchText("");
    setSortBy("date-desc");
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
        order.operator.toLowerCase().includes(searchText.toLowerCase()) ||
        (order.notes && order.notes.toLowerCase().includes(searchText.toLowerCase()))
      );
    }

    // Filter by status (multiple selection)
    if (statusFilter.length > 0) {
      filtered = filtered.filter(order => statusFilter.includes(order.status));
    }

    // Filter by priority (multiple selection)
    if (priorityFilter.length > 0) {
      filtered = filtered.filter(order => priorityFilter.includes(order.priority));
    }

    // Filter by machine type (multiple selection)
    if (machineTypeFilter.length > 0) {
      filtered = filtered.filter(order => machineTypeFilter.includes(order.machineType));
    }

    // Filter by machine name (multiple selection)
    if (machineNameFilter.length > 0) {
      filtered = filtered.filter(order => machineNameFilter.includes(order.machineName));
    }

    // Filter by operator (multiple selection)
    if (operatorFilter.length > 0) {
      filtered = filtered.filter(order => operatorFilter.includes(order.operator));
    }

    // Filter by date range
    if (fromDate) {
      filtered = filtered.filter(order => order.date >= fromDate);
    }
    if (toDate) {
      filtered = filtered.filter(order => order.date <= toDate);
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return b.datetime.getTime() - a.datetime.getTime();
        case "date-asc":
          return a.datetime.getTime() - b.datetime.getTime();
        case "order-asc":
          return a.orderID.localeCompare(b.orderID);
        case "order-desc":
          return b.orderID.localeCompare(a.orderID);
        default:
          return 0;
      }
    });

    return filtered;
  };

  // Export to Excel
  const exportToExcel = () => {
    const data = getFilteredOrders();
    const csv = [
      ["Order ID", "Date", "Time", "Company", "Operator", "Machine", "Type", "Status", "Priority", "Machine Status", "Weight", "Dimensions", "Progress", "Notes"],
      ...data.map((o) => [
        o.orderID,
        o.date,
        o.time,
        o.companyName,
        o.operator,
        o.machineName,
        o.machineType,
        o.status,
        o.priority.toUpperCase(),
        o.machineStatus,
        o.materialWeight || "-",
        o.dimensions || "-",
        o.completionProgress || "-",
        o.notes || "-",
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `orders_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print
  const handlePrint = () => {
    window.print();
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
            <th style={{ padding: "8px" }}>Date & Time</th>
            <th style={{ padding: "8px" }}>Operator</th>
            <th style={{ padding: "8px" }}>Machine</th>
            <th style={{ padding: "8px" }}>Type</th>
            <th style={{ padding: "8px" }}>Machine Status</th>
            <th style={{ padding: "8px" }}>Status</th>
            <th style={{ padding: "8px" }}>Priority</th>
            <th style={{ padding: "8px" }}>Weight</th>
            <th style={{ padding: "8px" }}>Dimensions</th>
          </tr>
        </thead>
        <tbody>
          <tr style={{ backgroundColor: "#f9f9f9", borderBottom: "1px solid #ddd" }}>
            <td style={{ padding: "8px" }}>{order.orderID}</td>
            <td style={{ padding: "8px" }}>{order.date} {order.time}</td>
            <td style={{ padding: "8px" }}>{order.operator}</td>
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
                  order.status === "Dispatched" ? "#3498db" :
                  order.status === "In-Progress" ? "#9b59b6" :
                  order.status === "Approved" ? "#1abc9c" :
                  order.status === "Wait for Approval" ? "#ffc107" :
                  order.status === "Cancelled" ? "#e74c3c" :
                  "#95a5a6"
              }}>
                {order.status}
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
                  order.priority === "urgent" ? "#dc3545" :
                  order.priority === "high" ? "#fd7e14" :
                  order.priority === "normal" ? "#ffc107" :
                  order.priority === "low" ? "#28a745" :
                  "#6c757d"
              }}>
                {order.priority === "urgent" ? "🔴 " : order.priority === "high" ? "🟠 " : order.priority === "normal" ? "🟡 " : "🟢 "}
                {order.priority.toUpperCase()}
              </span>
            </td>
            <td style={{ padding: "8px" }}>{order.materialWeight || "-"}</td>
            <td style={{ padding: "8px" }}>{order.dimensions || "-"}</td>
          </tr>
        </tbody>
      </table>

      {/* Optional fields below the table */}
      <div style={{ marginTop: "10px" }}>
        {order.branch && (
          <div>
            <strong>Branch:</strong> {order.branch}
          </div>
        )}
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
  const filteredOrders = getFilteredOrders();

  return (
    <div className="container">
      <div className="item">
        <BackButton />
        {/* Export/Print Buttons */}
        <div style={{ 
          display: "flex", 
          justifyContent: "flex-end", 
          gap: "10px",
          marginTop: "10px"
        }}>
          <button
            onClick={exportToExcel}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              padding: "8px 15px",
              backgroundColor: "#27ae60",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: "500"
            }}
            title="Download as CSV"
          >
            <Download size={16} /> Excel
          </button>
          <button
            onClick={handlePrint}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              padding: "8px 15px",
              backgroundColor: "#3498db",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: "500"
            }}
            title="Print orders"
          >
            <Printer size={16} /> Print
          </button>
        </div>
      </div>
      
      <div className="item">
        <div className="sidebarGroup">
          <h3 onClick={handleGlobalAllSelect} style={{ cursor: "pointer" }}>Show All Orders</h3>
        </div>
        
        {/* Status Filter Buttons */}
        <div className="sidebarGroup">
          <h3>Filter by Status <span style={{fontSize: "12px", color: "#666"}}>({statusFilter.length} selected)</span></h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginTop: "10px" }}>
            {["Complete", "Pending", "Cancelled", "Dispatched", "In-Progress", "Approved", "Wait for Approval"].map((status) => (
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

        {/* Priority Filter Buttons */}
        <div className="sidebarGroup">
          <h3>Filter by Priority <span style={{fontSize: "12px", color: "#666"}}>({priorityFilter.length} selected)</span></h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginTop: "10px" }}>
            {[
              { value: "urgent", label: "🔴 Urgent", color: "#dc3545" },
              { value: "high", label: "🟠 High", color: "#fd7e14" },
              { value: "normal", label: "🟡 Normal", color: "#ffc107" },
              { value: "low", label: "🟢 Low", color: "#28a745" }
            ].map(({ value, label, color }) => (
              <button
                key={value}
                onClick={() => handlePriorityFilter(value)}
                style={{
                  padding: "5px 10px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  backgroundColor: priorityFilter.includes(value) ? color : "white",
                  color: priorityFilter.includes(value) ? "white" : "black",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: priorityFilter.includes(value) ? "bold" : "normal"
                }}
              >
                {priorityFilter.includes(value) ? "✓ " : ""}{label}
              </button>
            ))}
            <button
              onClick={() => setPriorityFilter([])}
              style={{
                padding: "5px 10px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                backgroundColor: priorityFilter.length === 0 ? "#6c757d" : "white",
                color: priorityFilter.length === 0 ? "white" : "black",
                cursor: "pointer",
                fontSize: "12px"
              }}
            >
              Clear Priority
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

        {/* Operator Filter */}
        <div className="sidebarGroup">
          <h3>Filter by Operator <span style={{fontSize: "12px", color: "#666"}}>({operatorFilter.length} selected)</span></h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginTop: "10px" }}>
            {uniqueOperators.map((operator: string) => (
              <button
                key={operator}
                onClick={() => handleOperatorFilter(operator)}
                style={{
                  padding: "5px 10px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  backgroundColor: operatorFilter.includes(operator) ? "#9b59b6" : "white",
                  color: operatorFilter.includes(operator) ? "white" : "black",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: operatorFilter.includes(operator) ? "bold" : "normal"
                }}
              >
                {operatorFilter.includes(operator) ? "✓ " : ""}{operator}
              </button>
            ))}
          </div>
        </div>

        {/* Date Range Filter */}
        <div className="sidebarGroup">
          <h3>Filter by Date Range</h3>
          <div style={{ marginBottom: "10px" }}>
            <label style={{ fontSize: "12px", color: "#666", display: "block", marginBottom: "5px" }}>From Date:</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "12px",
                boxSizing: "border-box"
              }}
            />
          </div>
          <div>
            <label style={{ fontSize: "12px", color: "#666", display: "block", marginBottom: "5px" }}>To Date:</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "12px",
                boxSizing: "border-box"
              }}
            />
          </div>
        </div>

        {/* Sort By */}
        <div className="sidebarGroup">
          <h3>Sort By</h3>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              fontSize: "12px",
              boxSizing: "border-box"
            }}
          >
            <option value="date-desc">Latest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="order-asc">Order ID (A-Z)</option>
            <option value="order-desc">Order ID (Z-A)</option>
          </select>
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
          <div>• Filtered: {filteredOrders.length}</div>
          {isLoading && <div style={{ color: "#f39c12", marginTop: "5px" }}>⏳ Loading...</div>}
        </div>
      </div>

      <div className="item">
        <div className="inputBoxAllodersSrearchbox">
          <input 
            type="text" 
            placeholder="Search orders, company, machine name, machine type, operator, or notes..." 
            className="input"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
        
        {/* Active Filters Display */}
        {(statusFilter.length > 0 || priorityFilter.length > 0 || machineTypeFilter.length > 0 || machineNameFilter.length > 0 || operatorFilter.length > 0 || fromDate || toDate || searchText) && (
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
              {priorityFilter.length > 0 && (
                <span style={{
                  backgroundColor: "#fd7e14",
                  color: "white",
                  padding: "2px 6px",
                  borderRadius: "3px",
                  fontSize: "12px"
                }}>
                  Priority: {priorityFilter.map(p => p.toUpperCase()).join(", ")}
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
              {operatorFilter.length > 0 && (
                <span style={{ 
                  backgroundColor: "#9b59b6", 
                  color: "white", 
                  padding: "2px 6px", 
                  borderRadius: "3px", 
                  fontSize: "12px" 
                }}>
                  Operators: {operatorFilter.join(", ")}
                </span>
              )}
              {(fromDate || toDate) && (
                <span style={{ 
                  backgroundColor: "#16a085", 
                  color: "white", 
                  padding: "2px 6px", 
                  borderRadius: "3px", 
                  fontSize: "12px" 
                }}>
                  {fromDate && toDate ? `Date: ${fromDate} to ${toDate}` : fromDate ? `From: ${fromDate}` : `To: ${toDate}`}
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
                {statusFilter.length === 0 && machineTypeFilter.length === 0 && machineNameFilter.length === 0 && operatorFilter.length === 0 && !fromDate && !toDate
                  ? "All Orders" 
                  : "Filtered Orders"
                }
                <span style={{ fontSize: "14px", marginLeft: "10px", color: "#666" }}>
                  ({filteredOrders.length} orders)
                </span>
              </h3>
              {filteredOrders.length > 0 ? (
                filteredOrders.map(renderOrderCard)
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

      {/* Print Styles */}
      <style>{`
        @media print {
          button, input[type="text"], input[type="date"], select { display: none !important; }
          .sidebarGroup { display: none !important; }
          .item:first-child { display: none !important; }
          [style*="display: flex"] { display: none !important; }
          table { border: 1px solid #000; width: 100%; }
          th, td { border: 1px solid #000 !important; padding: 8px; }
          th { background-color: #ecf0f1 !important; }
          .order-card { page-break-inside: avoid; }
        }
      `}</style>
    </div>
  );
};

export default IndexAllOders;