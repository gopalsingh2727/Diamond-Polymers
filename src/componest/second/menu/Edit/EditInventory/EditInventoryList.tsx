/**
 * EditInventoryList - LIST ONLY
 * Click → Goes to CreateInventory for editing
 */
import React, { useState, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getInventoryV2 } from "../../../../redux/unifiedV2/inventoryActions";
import { RootState } from "../../../../redux/rootReducer";
import { AppDispatch } from "../../../../../store";
import { useCRUD } from "../../../../../hooks/useCRUD";
import { ToastContainer } from "../../../../../components/shared/Toast";

interface Inventory {
  _id: string;
  name: string;
  code: string;
  description?: string;
  allowedOptionTypes: { _id: string; name: string }[];
  inventoryUnits: { inventoryTypeId: { _id: string; symbol: string }; isPrimary: boolean }[];
  dynamicCalculations: { name: string }[];
  isActive?: boolean;
}

interface Props {
  onEdit: (data: Inventory) => void;
}

const EditInventoryList: React.FC<Props> = ({ onEdit }) => {
  const dispatch = useDispatch<AppDispatch>();
  const inventoryState = useSelector((state: RootState) => state.v2.inventory);
  const rawInventories = inventoryState?.list;
  const inventories = Array.isArray(rawInventories) ? rawInventories : [];
  const loading = inventoryState?.loading;
  const error = inventoryState?.error;
  const { handleSave, handleUpdate, handleDelete: crudDelete, saveState, updateState, deleteState, confirmDialog, closeConfirmDialog, toast } = useCRUD();

  const [selectedRow, setSelectedRow] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  // Get selected branch to refetch when it changes
  const selectedBranch = useSelector((state: any) => state.auth?.userData?.selectedBranch);

  // Fetch inventories on mount and when branch changes
  useEffect(() => {
    dispatch(getInventoryV2());
  }, [dispatch, selectedBranch]);

  const filteredItems = inventories.filter((item: Inventory) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      item.name?.toLowerCase().includes(search) ||
      item.code?.toLowerCase().includes(search) ||
      item.description?.toLowerCase().includes(search)
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
              placeholder="Search inventories..."
              className="editsectionsTable-searchInput"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="editsectionsTable-searchIcon">🔍</span>
            {searchTerm && <button onClick={() => setSearchTerm("")} className="editsectionsTable-clearButton">✕</button>}
          </div>
          <div className="editsectionsTable-countBadge">{filteredItems.length} inventories</div>
        </div>

        {filteredItems.length > 0 ? (
          <div className="editsectionsTable-wrapper">
            <table className="editsectionsTable-table">
              <thead className="editsectionsTable-thead">
                <tr>
                  <th className="editsectionsTable-th">No</th>
                  <th className="editsectionsTable-th">Code</th>
                  <th className="editsectionsTable-th">Name</th>
                  <th className="editsectionsTable-th">Option Types</th>
                  <th className="editsectionsTable-th">Units</th>
                  <th className="editsectionsTable-th">Formulas</th>
                  <th className="editsectionsTable-th">Status</th>
                </tr>
              </thead>
              <tbody className="editsectionsTable-tbody">
                {filteredItems.map((item: Inventory, index: number) => (
                  <tr
                    key={item._id}
                    className={`editsectionsTable-tr ${selectedRow === index ? "editsectionsTable-trSelected" : ""}`}
                    onClick={() => { setSelectedRow(index); onEdit(item); }}
                  >
                    <td className="editsectionsTable-td">{index + 1}</td>
                    <td className="editsectionsTable-td">
                      <span style={{
                        fontWeight: 'bold',
                        color: '#3b82f6',
                        backgroundColor: '#eff6ff',
                        padding: '2px 8px',
                        borderRadius: '4px'
                      }}>
                        {item.code}
                      </span>
                    </td>
                    <td className="editsectionsTable-td">{item.name}</td>
                    <td className="editsectionsTable-td">
                      {item.allowedOptionTypes?.length || 0} types
                    </td>
                    <td className="editsectionsTable-td">
                      {item.inventoryUnits?.map((u: any) => u.inventoryTypeId?.symbol).filter(Boolean).join(', ') || '-'}
                    </td>
                    <td className="editsectionsTable-td">
                      {item.dynamicCalculations?.length || 0}
                    </td>
                    <td className="editsectionsTable-td">
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        backgroundColor: item.isActive !== false ? '#dcfce7' : '#fee2e2',
                        color: item.isActive !== false ? '#166534' : '#991b1b'
                      }}>
                        {item.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="editsectionsTable-empty">No inventories found</div>
        )}
      </div>
      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
    </div>
  );
};

export default EditInventoryList;
