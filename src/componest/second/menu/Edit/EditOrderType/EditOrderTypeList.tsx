/**
 * EditOrderTypeList - LIST ONLY
 * Click → Goes to CreateOrderType for editing
 */
import React, { useState, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getOrderTypes } from "../../../../redux/create/orderType/orderTypeActions";
import { RootState } from "../../../../redux/rootReducer";
import { AppDispatch } from "../../../../../store";

interface OrderType {
  _id: string;
  typeName?: string;
  name?: string;
  typeCode?: string;
  description?: string;
  category?: { _id: string; name: string };
  branchId?: { _id: string; name: string };
}

interface Props {
  onEdit: (data: OrderType) => void;
}

const EditOrderTypeList: React.FC<Props> = ({ onEdit }) => {
  const dispatch = useDispatch<AppDispatch>();
  const orderTypeState = useSelector((state: RootState) => state.v2.orderType);
  const rawOrderTypes = orderTypeState?.list;
  const orderTypes = Array.isArray(rawOrderTypes) ? rawOrderTypes : [];
  const loading = orderTypeState?.loading;
  const error = orderTypeState?.error;

  const [selectedRow, setSelectedRow] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  // Get selected branch to refetch when it changes
  const selectedBranch = useSelector((state: any) => state.auth?.userData?.selectedBranch);

  // Fetch order types on mount and when branch changes
  useEffect(() => {
    dispatch(getOrderTypes());
  }, [dispatch, selectedBranch]);

  const filteredItems = orderTypes.filter((item: OrderType) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      item.typeName?.toLowerCase().includes(search) ||
      item.typeCode?.toLowerCase().includes(search) ||
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
              placeholder="Search order types..."
              className="editsectionsTable-searchInput"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="editsectionsTable-searchIcon">🔍</span>
            {searchTerm && <button onClick={() => setSearchTerm("")} className="editsectionsTable-clearButton">✕</button>}
          </div>
          <div className="editsectionsTable-countBadge">{filteredItems.length} types</div>
        </div>

        {filteredItems.length > 0 ? (
          <div className="editsectionsTable-wrapper">
            <table className="editsectionsTable-table">
              <thead className="editsectionsTable-thead">
                <tr>
                  <th className="editsectionsTable-th">No</th>
                  <th className="editsectionsTable-th">Type Name</th>
                  <th className="editsectionsTable-th">Code</th>
                  <th className="editsectionsTable-th">Description</th>
                  <th className="editsectionsTable-th">Branch</th>
                </tr>
              </thead>
              <tbody className="editsectionsTable-tbody">
                {filteredItems.map((item: OrderType, index: number) => (
                  <tr
                    key={item._id}
                    className={`editsectionsTable-tr ${selectedRow === index ? "editsectionsTable-trSelected" : ""}`}
                    onClick={() => { setSelectedRow(index); onEdit(item); }}
                  >
                    <td className="editsectionsTable-td">{index + 1}</td>
                    <td className="editsectionsTable-td">{item.typeName || item.name || "N/A"}</td>
                    <td className="editsectionsTable-td">{item.typeCode || "N/A"}</td>
                    <td className="editsectionsTable-td">{item.description || "N/A"}</td>
                    <td className="editsectionsTable-td">{item.branchId?.name || "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="editsectionsTable-empty">No order types found</div>
        )}
      </div>
    </div>
  );
};

export default EditOrderTypeList;
