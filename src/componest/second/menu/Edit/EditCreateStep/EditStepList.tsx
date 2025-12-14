/**
 * EditStepList - LIST ONLY
 * Click → Goes to CreateStep for editing
 */
import React, { useState, useCallback, useEffect } from "react";
import { useFormDataCache } from "../hooks/useFormDataCache";

interface Step {
  _id: string;
  stepName: string;
  stepOrder: number;
  description?: string;
  machineType?: { _id: string; type: string };
  branchId?: { _id: string; name: string };
}

interface Props {
  onEdit: (data: Step) => void;
}

const EditStepList: React.FC<Props> = ({ onEdit }) => {
  const { steps = [], machines = [], loading, error } = useFormDataCache();

  // Count machines by machine type
  const getMachineCount = (machineTypeId?: string) => {
    if (!machineTypeId) return 0;
    return machines.filter((m: any) =>
      m.machineType?._id === machineTypeId || m.machineTypeId === machineTypeId
    ).length;
  };

  const [selectedRow, setSelectedRow] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredItems = steps.filter((item: Step) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      item.stepName?.toLowerCase().includes(search) ||
      item.machineType?.type?.toLowerCase().includes(search)
    );
  });

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
      if (filteredItems[selectedRow]) onEdit(filteredItems[selectedRow]);
    }
  }, [filteredItems, selectedRow, onEdit]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => { setSelectedRow(0); }, [searchTerm]);

  if (loading) return <p className="loadingAndError">Loading...</p>;
  if (error) return <p className="loadingAndError" style={{ color: "red" }}>{error}</p>;

  return (
    <div className="EditMachineType">
      <div className="editsectionsTable-container">
        <div className="editsectionsTable-searchWrapper">
          <div className="editsectionsTable-searchBox">
            <input
              type="text"
              placeholder="Search steps..."
              className="editsectionsTable-searchInput"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="editsectionsTable-searchIcon">🔍</span>
            {searchTerm && <button onClick={() => setSearchTerm("")} className="editsectionsTable-clearButton">✕</button>}
          </div>
          <div className="editsectionsTable-countBadge">{filteredItems.length} steps</div>
        </div>

        {filteredItems.length > 0 ? (
          <div className="editsectionsTable-wrapper">
            <table className="editsectionsTable-table">
              <thead className="editsectionsTable-thead">
                <tr>
                  <th className="editsectionsTable-th">No</th>
                  <th className="editsectionsTable-th">Step Name</th>
                  <th className="editsectionsTable-th">Total Machines</th>
                  <th className="editsectionsTable-th">Branch</th>
                </tr>
              </thead>
              <tbody className="editsectionsTable-tbody">
                {filteredItems.map((item: Step, index: number) => (
                  <tr
                    key={item._id}
                    className={`editsectionsTable-tr ${selectedRow === index ? "editsectionsTable-trSelected" : ""}`}
                    onClick={() => { setSelectedRow(index); onEdit(item); }}
                  >
                    <td className="editsectionsTable-td">{index + 1}</td>
                    <td className="editsectionsTable-td">{item.stepName}</td>
                    <td className="editsectionsTable-td">{getMachineCount(item.machineType?._id)}</td>
                    <td className="editsectionsTable-td">{item.branchId?.name || "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="editsectionsTable-empty">No steps found</div>
        )}
      </div>
    </div>
  );
};

export default EditStepList;
