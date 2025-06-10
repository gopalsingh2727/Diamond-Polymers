import { useState } from "react";
import { BackButton } from "../../../allCompones/BackButton";
import "./indexAllOders.css";

// Define the types for side and sidebar
interface SideItem {
  side: string;
  allSide: string;
}

interface SidebarDataItem {
  name: string;
  sides: SideItem[];
}

// Define order data structure
interface OrderData {
  orderID: string;
  date: string;
  companyName: string;
  status: "Complete" | "Pending" | "Cancel" | "Stop" | "Dispatch";
  machineName: string;
  machineType: string;
  machineStatus: "Start" | "Stop" | "Pending";
}

const sidebarData: SidebarDataItem[] = [
  {
    name: "sideBar1A",
    sides: [
      { side: "1", allSide: "12" },
      { side: "2", allSide: "2" },
    ]
  },
  {
    name: "sideBar2B",
    sides: [
      { side: "1", allSide: "12" },
    ]
  }
];

// Sample order data
const orderData: OrderData[] = [
  {
    orderID: "ORD001",
    date: "2025-06-01",
    companyName: "ABC Manufacturing",
    status: "Complete",
    machineName: "Machine A1",
    machineType: "CNC Mill",
    machineStatus: "Stop"
  },
  {
    orderID: "ORD002",
    date: "2025-06-01",
    companyName: "XYZ Industries",
    status: "Pending",
    machineName: "Machine B2",
    machineType: "Lathe",
    machineStatus: "Start"
  },
  {
    orderID: "ORD003",
    date: "2025-05-31",
    companyName: "DEF Corp",
    status: "Dispatch",
    machineName: "Machine C3",
    machineType: "Drill Press",
    machineStatus: "Start"
  },
  {
    orderID: "ORD004",
    date: "2025-05-30",
    companyName: "GHI Solutions",
    status: "Cancel",
    machineName: "Machine D4",
    machineType: "Grinder",
    machineStatus: "Stop"
  },
  {
    orderID: "ORD005",
    date: "2025-05-29",
    companyName: "JKL Tech",
    status: "Stop",
    machineName: "Machine E5",
    machineType: "Press",
    machineStatus: "Pending"
  }
];

const IndexAllOders = () => {
  const [selectedSidebar, setSelectedSidebar] = useState<string | null>(null);
  const [selectedSide, setSelectedSide] = useState<SideItem | null>(null);
  const [showGlobalAll, setShowGlobalAll] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [machineTypeFilter, setMachineTypeFilter] = useState<string[]>([]);
  const [machineNameFilter, setMachineNameFilter] = useState<string[]>([]);

  // Get unique machine types and names for filter options
  const uniqueMachineTypes = [...new Set(orderData.map(order => order.machineType))];
  const uniqueMachineNames = [...new Set(orderData.map(order => order.machineName))];

  const handleSidebarSelect = (sidebarName: string) => {
    if (selectedSidebar === sidebarName) {
      setSelectedSidebar(null); // Toggle off
    } else {
      setSelectedSidebar(sidebarName);
    }
    setSelectedSide(null); // Reset selected side
  };

  const handleSideSelect = (sideItem: SideItem) => {
    setSelectedSide(sideItem);
    setShowGlobalAll(false);
  };

  const handleNoneSelect = () => {
    setSelectedSide(null);
    setShowGlobalAll(false);
  };

  const handleGlobalAllSelect = () => {
    setSelectedSide(null);
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
    setSelectedSide(null);
    setSelectedSidebar(null);
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
    setSelectedSide(null);
    setSelectedSidebar(null);
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
    setSelectedSide(null);
    setSelectedSidebar(null);
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
    let filtered = orderData;

    // Filter by search text
    if (searchText) {
      filtered = filtered.filter(order =>
        order.orderID.toLowerCase().includes(searchText.toLowerCase()) ||
        order.companyName.toLowerCase().includes(searchText.toLowerCase()) ||
        order.machineName.toLowerCase().includes(searchText.toLowerCase()) ||
        order.machineType.toLowerCase().includes(searchText.toLowerCase())
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

  const renderOrderCard = (order: OrderData) => (
    <div key={order.orderID} className="order-card" style={{
      border: "1px solid #ddd",
      borderRadius: "8px",
      padding: "15px",
      margin: "10px 0",
      backgroundColor: "#f9f9f9"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
        <h4 style={{ margin: 0, color: "#2c3e50" }}>Order ID: {order.orderID}</h4>
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
            order.status === "Cancel" ? "#e74c3c" : "#95a5a6"
        }}>
          {order.status}
        </span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "14px" }}>
        <div><strong>Date:</strong> {order.date}</div>
        <div><strong>Company:</strong> {order.companyName}</div>
        <div><strong>Machine:</strong> {order.machineName}</div>
        <div><strong>Type:</strong> {order.machineType}</div>
        <div style={{ gridColumn: "1 / -1" }}>
          <strong>Machine Status:</strong> 
          <span style={{
            marginLeft: "5px",
            padding: "2px 6px",
            borderRadius: "3px",
            fontSize: "12px",
            backgroundColor: 
              order.machineStatus === "Start" ? "#27ae60" :
              order.machineStatus === "Stop" ? "#e74c3c" : "#f39c12",
            color: "white"
          }}>
            {order.machineStatus}
          </span>
        </div>
      </div>
    </div>
  );

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
            {["Complete", "Pending", "Cancel", "Stop", "Dispatch"].map((status) => (
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
            {uniqueMachineTypes.map((machineType) => (
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
            {uniqueMachineNames.map((machineName) => (
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

        {sidebarData.map((sidebar, index) => (
          <div key={index} className="sidebarGroup">
            <h3 onClick={() => handleSidebarSelect(sidebar.name)}>{sidebar.name}</h3>
            {selectedSidebar === sidebar.name && (
              <ul>
                {sidebar.sides.map((sideItem, idx) => (
                  <li key={idx} onClick={() => handleSideSelect(sideItem)}>
                    Side: {sideItem.side}
                  </li>
                ))}
                <li onClick={handleNoneSelect} style={{ fontWeight: "bold", color: "red" }}>
                  None
                </li>
              </ul>
            )}
          </div>
        ))}
      </div>

      <div className="item">
        <div className="inputBoxAllodersSrearchbox">
          <input 
            type="text" 
            placeholder="Search orders, company, machine name, or machine type..." 
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
          {selectedSidebar && !selectedSide && !showGlobalAll && (
            <div>
              <h2>{selectedSidebar}</h2>
              <p>Select a specific side or view all orders above.</p>
            </div>
          )}

          {selectedSide && (
            <div>
              <h4>Selected AllSide: {selectedSide.allSide}</h4>
              <p>Showing orders for side {selectedSide.side}</p>
              {getFilteredOrders().slice(0, 2).map(renderOrderCard)}
            </div>
          )}

          {showGlobalAll && (
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

          {selectedSidebar && !selectedSide && !showGlobalAll && (
            <div>
              {sidebarData
                .filter((sidebar) => sidebar.name === selectedSidebar)
                .flatMap((sidebar, idx1) =>
                  sidebar.sides.map((sideItem, idx2) => (
                    <div key={`${idx1}-${idx2}`}>
                      <h4>AllSide: {sideItem.allSide}</h4>
                      {getFilteredOrders().slice(0, 1).map(renderOrderCard)}
                    </div>
                  ))
                )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IndexAllOders;