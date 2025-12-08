/**
 * EditMachineTypeList - LIST ONLY component
 * Click → Goes to CreateMachineType for editing
 */
import React, { useState, useCallback, useEffect, useMemo } from "react";
import { useFormDataCache } from "../hooks/useFormDataCache";
import { formatDate } from "../../../../../utils/dateUtils";
import "./EditMachineyType.css";

interface MachineType {
  _id: string;
  type: string;
  description: string;
  machines?: any[];
  createdAt: string;
  updatedAt: string;
  branchId?: { _id: string; name: string };
}

interface EditMachineTypeListProps {
  onEdit: (data: MachineType) => void;
}

const EditMachineTypeList: React.FC<EditMachineTypeListProps> = ({ onEdit }) => {
  const { machineTypes: cachedMachineTypes, machines: cachedMachines, loading, error } = useFormDataCache();

  const [selectedRow, setSelectedRow] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  // Group machines by machine type
  const machineTypes = useMemo(() => {
    return cachedMachineTypes.map((type: any) => ({
      ...type,
      machines: cachedMachines.filter((machine: any) =>
        machine.machineType?._id === type._id || machine.machineTypeId === type._id
      )
    }));
  }, [cachedMachineTypes, cachedMachines]);

  // Filter
  const filteredItems = machineTypes.filter((item: MachineType) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      item.type?.toLowerCase().includes(search) ||
      item.description?.toLowerCase().includes(search) ||
      item.branchId?.name?.toLowerCase().includes(search)
    );
  });

  // Keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (filteredItems.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedRow((prev) => Math.min(prev + 1, filteredItems.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedRow((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const selected = filteredItems[selectedRow];
      if (selected) onEdit(selected);
    }
  }, [filteredItems, selectedRow, onEdit]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    setSelectedRow(0);
  }, [searchTerm]);

  if (loading) return <p className="loadingAndError">Loading...</p>;
  if (error) return <p className="loadingAndError" style={{ color: "red" }}>{error}</p>;

  return (
    <div className="EditMachineType">
      <div className="editsectionsTable-container">
        {/* Search */}
        <div className="editsectionsTable-searchWrapper">
          <div className="editsectionsTable-searchBox">
            <input
              type="text"
              placeholder="Search machine types..."
              className="editsectionsTable-searchInput"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="editsectionsTable-searchIcon">🔍</span>
            {searchTerm && (
              <button onClick={() => setSearchTerm("")} className="editsectionsTable-clearButton">✕</button>
            )}
          </div>
          <div className="editsectionsTable-countBadge">
            {filteredItems.length} of {machineTypes.length} types
          </div>
        </div>

        {/* Table */}
        {filteredItems.length > 0 ? (
          <div className="editsectionsTable-wrapper">
            <table className="editsectionsTable-table">
              <thead className="editsectionsTable-thead">
                <tr>
                  <th className="editsectionsTable-th">No</th>
                  <th className="editsectionsTable-th">Machine Type</th>
                  <th className="editsectionsTable-th">Description</th>
                  <th className="editsectionsTable-th">Machines</th>
                  <th className="editsectionsTable-th">Branch</th>
                  <th className="editsectionsTable-th">Created</th>
                </tr>
              </thead>
              <tbody className="editsectionsTable-tbody">
                {filteredItems.map((item: MachineType, index: number) => (
                  <tr
                    key={item._id}
                    className={`editsectionsTable-tr ${selectedRow === index ? "editsectionsTable-trSelected" : ""}`}
                    onClick={() => { setSelectedRow(index); onEdit(item); }}
                  >
                    <td className="editsectionsTable-td">{index + 1}</td>
                    <td className="editsectionsTable-td">{item.type}</td>
                    <td className="editsectionsTable-td">{item.description}</td>
                    <td className="editsectionsTable-td">{item.machines?.length || 0}</td>
                    <td className="editsectionsTable-td">{item.branchId?.name || "N/A"}</td>
                    <td className="editsectionsTable-td">{formatDate(item.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="editsectionsTable-empty">No machine types found</div>
        )}
      </div>
    </div>
  );
};

export default EditMachineTypeList;
