/**
 * EditOptionTypeListOnly - LIST ONLY
 * Click → Goes to CreateOptionType for editing
 */
import React, { useState, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getOptionTypes } from "../../../../redux/option/optionTypeActions";
import { RootState } from "../../../../redux/rootReducer";
import { AppDispatch } from "../../../../../store";

interface OptionType {
  _id: string;
  name: string;
  description?: string;
  category?: { _id: string; name: string };
}

interface Props {
  onEdit: (data: OptionType) => void;
}

const EditOptionTypeListOnly: React.FC<Props> = ({ onEdit }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { optionTypes = [], loading, error } = useSelector((state: RootState) => state.optionType || {});

  // Fetch option types on mount
  useEffect(() => {
    dispatch(getOptionTypes());
  }, [dispatch]);

  const [selectedRow, setSelectedRow] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredItems = optionTypes.filter((item: OptionType) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      item.name?.toLowerCase().includes(search) ||
      item.category?.name?.toLowerCase().includes(search)
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
              placeholder="Search option types..."
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
                  <th className="editsectionsTable-th">Name</th>
                  <th className="editsectionsTable-th">Category</th>
                </tr>
              </thead>
              <tbody className="editsectionsTable-tbody">
                {filteredItems.map((item: OptionType, index: number) => (
                  <tr
                    key={item._id}
                    className={`editsectionsTable-tr ${selectedRow === index ? "editsectionsTable-trSelected" : ""}`}
                    onClick={() => { setSelectedRow(index); onEdit(item); }}
                  >
                    <td className="editsectionsTable-td">{index + 1}</td>
                    <td className="editsectionsTable-td">{item.name}</td>
                    <td className="editsectionsTable-td">{item.category?.name || "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="editsectionsTable-empty">No option types found</div>
        )}
      </div>
    </div>
  );
};

export default EditOptionTypeListOnly;
