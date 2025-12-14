/**
 * EditMachineList - LIST ONLY component
 *
 * This component only shows the list of machines.
 * When user clicks an item, it calls onEdit callback to navigate to CreateMachine component.
 *
 * Pattern: Edit section = List only → Click → Create section (handles both create & edit)
 */

import React, { useState, useCallback, useEffect } from "react";
import { useFormDataCache } from "../hooks/useFormDataCache";
import "./editMachines.css";

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
  tableConfig?: any;
}

interface EditMachineListProps {
  onEdit: (machine: Machine) => void;
}

const EditMachineList: React.FC<EditMachineListProps> = ({ onEdit }) => {
  const { machines, loading, error } = useFormDataCache();

  const [selectedRow, setSelectedRow] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  // Filter machines
  const filteredMachines = machines.filter((machine: Machine) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      machine.machineName?.toLowerCase().includes(search) ||
      machine.machineType?.type?.toLowerCase().includes(search) ||
      machine.branchId?.name?.toLowerCase().includes(search)
    );
  });

  // Keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (filteredMachines.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedRow((prev) => Math.min(prev + 1, filteredMachines.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedRow((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const selected = filteredMachines[selectedRow];
      if (selected) onEdit(selected);
    }
  }, [filteredMachines, selectedRow, onEdit]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    setSelectedRow(0);
  }, [searchTerm]);

  if (loading) {
    return <p className="loadingAndError">Loading...</p>;
  }

  if (error) {
    return <p className="loadingAndError" style={{ color: "red" }}>{error}</p>;
  }

  return (
    <div className="EditMachineType">
      <div className="editsectionsTable-container">
        {/* Search Bar */}
        <div className="editsectionsTable-searchWrapper">
          <div className="editsectionsTable-searchBox">
            <input
              type="text"
              placeholder="Search machines..."
              className="editsectionsTable-searchInput"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="editsectionsTable-searchIcon">🔍</span>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="editsectionsTable-clearButton"
              >
                ✕
              </button>
            )}
          </div>
          <div className="editsectionsTable-countBadge">
            {filteredMachines.length} of {machines.length} machines
          </div>
        </div>

        {/* Table - LIST ONLY */}
        {filteredMachines.length > 0 ? (
          <div className="editsectionsTable-wrapper">
            <table className="editsectionsTable-table">
              <thead className="editsectionsTable-thead">
                <tr>
                  <th className="editsectionsTable-th">No</th>
                  <th className="editsectionsTable-th">Machine Name</th>
                  <th className="editsectionsTable-th">Type</th>
                  <th className="editsectionsTable-th">Branch</th>
                </tr>
              </thead>
              <tbody className="editsectionsTable-tbody">
                {filteredMachines.map((machine: Machine, index: number) => (
                  <tr
                    key={machine._id}
                    className={`editsectionsTable-tr ${selectedRow === index ? "editsectionsTable-trSelected" : ""}`}
                    onClick={() => {
                      setSelectedRow(index);
                      onEdit(machine); // Navigate to CreateMachine with edit data
                    }}
                  >
                    <td className="editsectionsTable-td">{index + 1}</td>
                    <td className="editsectionsTable-td">{machine.machineName}</td>
                    <td className="editsectionsTable-td">{machine.machineType?.type || "N/A"}</td>
                    <td className="editsectionsTable-td">{machine.branchId?.name || "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="editsectionsTable-empty">
            No machines found matching "<span>{searchTerm}</span>"
          </div>
        )}
      </div>
    </div>
  );
};

export default EditMachineList;
