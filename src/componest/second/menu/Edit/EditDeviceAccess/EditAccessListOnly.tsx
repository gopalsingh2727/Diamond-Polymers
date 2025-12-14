/**
 * EditAccessListOnly - LIST ONLY
 * Click → Goes to DeviceAccessCreate for editing
 */
import React, { useState, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getDeviceAccessList } from "../../../../redux/deviceAccess/deviceAccessActions";
import { RootState } from "../../../../redux/rootReducer";
import { AppDispatch } from "../../../../../store";

interface DeviceAccess {
  _id: string;
  deviceName?: string;
  location?: string;
  deviceId?: string;
  branchId?: { _id: string; branchName: string };
  machines?: any[];
  createdAt?: string;
  updatedAt?: string;
}

interface Props {
  onEdit: (data: DeviceAccess) => void;
}

const EditAccessListOnly: React.FC<Props> = ({ onEdit }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { devices = [], loading, error } = useSelector(
    (state: RootState) => state.deviceAccess || {}
  );

  // Fetch devices on mount
  useEffect(() => {
    dispatch(getDeviceAccessList());
  }, [dispatch]);

  const [selectedRow, setSelectedRow] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredItems = devices.filter((item: DeviceAccess) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      item.deviceName?.toLowerCase().includes(search) ||
      item.location?.toLowerCase().includes(search)
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
              placeholder="Search devices..."
              className="editsectionsTable-searchInput"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="editsectionsTable-searchIcon">🔍</span>
            {searchTerm && <button onClick={() => setSearchTerm("")} className="editsectionsTable-clearButton">✕</button>}
          </div>
          <div className="editsectionsTable-countBadge">{filteredItems.length} devices</div>
        </div>

        {filteredItems.length > 0 ? (
          <div className="editsectionsTable-wrapper">
            <table className="editsectionsTable-table">
              <thead className="editsectionsTable-thead">
                <tr>
                  <th className="editsectionsTable-th">No</th>
                  <th className="editsectionsTable-th">Device ID</th>
                  <th className="editsectionsTable-th">Device Name</th>
                  <th className="editsectionsTable-th">Branch</th>
                  <th className="editsectionsTable-th">Location</th>
                  <th className="editsectionsTable-th">Machines</th>
                </tr>
              </thead>
              <tbody className="editsectionsTable-tbody">
                {filteredItems.map((item: DeviceAccess, index: number) => (
                  <tr
                    key={item._id}
                    className={`editsectionsTable-tr ${selectedRow === index ? "editsectionsTable-trSelected" : ""}`}
                    onClick={() => { setSelectedRow(index); onEdit(item); }}
                  >
                    <td className="editsectionsTable-td">{index + 1}</td>
                    <td className="editsectionsTable-td" style={{ fontFamily: 'monospace', fontWeight: '600' }}>{item.deviceId || "N/A"}</td>
                    <td className="editsectionsTable-td">{item.deviceName || "N/A"}</td>
                    <td className="editsectionsTable-td">{item.branchId?.branchName || "N/A"}</td>
                    <td className="editsectionsTable-td">{item.location || "N/A"}</td>
                    <td className="editsectionsTable-td">{item.machines?.length || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="editsectionsTable-empty">No devices found</div>
        )}
      </div>
    </div>
  );
};

export default EditAccessListOnly;
