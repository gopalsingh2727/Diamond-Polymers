/**
 * EditCategoryListOnly - LIST ONLY
 * Click -> Goes to CreateCategory for editing
 */
import React, { useState, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getCategories } from "../../../../redux/category/categoryActions";
import { RootState } from "../../../../redux/rootReducer";
import { AppDispatch } from "../../../../../store";
import { useCRUD } from "../../../../../hooks/useCRUD";
import { ToastContainer } from "../../../../../components/shared/Toast";

interface Category {
  _id: string;
  name: string;
  description?: string;
  branchId?: { _id: string; name: string };
}

interface Props {
  onEdit: (data: Category) => void;
}

const EditCategoryListOnly: React.FC<Props> = ({ onEdit }) => {
  const dispatch = useDispatch<AppDispatch>();
  const categoryState = useSelector((state: RootState) => state.v2.category);
  const rawCategories = categoryState?.list;
  const categories = Array.isArray(rawCategories) ? rawCategories : [];
  const loading = categoryState?.loading;
  const error = categoryState?.error;
  const { toast } = useCRUD();

  // Fetch categories on mount
  useEffect(() => {
    dispatch(getCategories({}));
  }, [dispatch]);

  const [selectedRow, setSelectedRow] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredItems = categories.filter((item: Category) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return item.name?.toLowerCase().includes(search) || item.description?.toLowerCase().includes(search);
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

  // Show error via toast if any
  useEffect(() => {
    if (error) {
      toast.error('Error', error);
    }
  }, [error, toast]);

  if (loading) return <p className="loadingAndError">Loading...</p>;
  if (error) return <p className="loadingAndError" style={{ color: "red" }}>{error}</p>;

  return (
    <div className="EditMachineType">
      <div className="editsectionsTable-container">
        <div className="editsectionsTable-searchWrapper">
          <div className="editsectionsTable-searchBox">
            <input
              type="text"
              placeholder="Search categories..."
              className="editsectionsTable-searchInput"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="editsectionsTable-searchIcon">&#128269;</span>
            {searchTerm && <button onClick={() => setSearchTerm("")} className="editsectionsTable-clearButton">&#10005;</button>}
          </div>
          <div className="editsectionsTable-countBadge">{filteredItems.length} categories</div>
        </div>

        {filteredItems.length > 0 ? (
          <div className="editsectionsTable-wrapper">
            <table className="editsectionsTable-table">
              <thead className="editsectionsTable-thead">
                <tr>
                  <th className="editsectionsTable-th">No</th>
                  <th className="editsectionsTable-th">Name</th>
                  <th className="editsectionsTable-th">Description</th>
                  <th className="editsectionsTable-th">Branch</th>
                </tr>
              </thead>
              <tbody className="editsectionsTable-tbody">
                {filteredItems.map((item: Category, index: number) => (
                  <tr
                    key={item._id}
                    className={`editsectionsTable-tr ${selectedRow === index ? "editsectionsTable-trSelected" : ""}`}
                    onClick={() => { setSelectedRow(index); onEdit(item); }}
                  >
                    <td className="editsectionsTable-td">{index + 1}</td>
                    <td className="editsectionsTable-td">{item.name}</td>
                    <td className="editsectionsTable-td">{item.description || "N/A"}</td>
                    <td className="editsectionsTable-td">{item.branchId?.name || "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="editsectionsTable-empty">No categories found</div>
        )}
      </div>
      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
    </div>
  );
};

export default EditCategoryListOnly;
