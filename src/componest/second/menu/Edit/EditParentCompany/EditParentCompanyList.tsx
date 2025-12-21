import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getCustomerParentCompanies } from "../../../../redux/create/customerParentCompany/CustomerParentCompanyActions";
import { RootState, AppDispatch } from "../../../../../store";
import CustomerParentCompany from "../../create/customerParentCompany/CustomerParentCompany";
import { useListNavigation } from "../../../../allCompones/BackButton";
import "../EditMachineType/EditMachineyType.css";

interface Props {
  onEdit?: (data: any) => void;
}

const EditParentCompanyList: React.FC<Props> = ({ onEdit }) => {
  const dispatch = useDispatch<AppDispatch>();

  const { parentCompanies, loading, error } = useSelector(
    (state: RootState) => state.getCustomerParentCompanies || { parentCompanies: [], loading: false, error: null }
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRow, setSelectedRow] = useState(0);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  useEffect(() => {
    dispatch(getCustomerParentCompanies());
  }, [dispatch]);

  const handleBackToList = () => {
    setSelectedItem(null);
    dispatch(getCustomerParentCompanies());
  };

  if (selectedItem) {
    return (
      <CustomerParentCompany
        initialData={selectedItem}
        onCancel={handleBackToList}
        onSaveSuccess={handleBackToList}
      />
    );
  }

  const filteredItems = parentCompanies.filter((item: any) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      item.name?.toLowerCase().includes(search) ||
      item.description?.toLowerCase().includes(search)
    );
  });

  // Handle keyboard navigation
  useListNavigation(
    true,
    filteredItems.length,
    selectedRow,
    setSelectedRow,
    () => {
      const selected = filteredItems[selectedRow];
      if (selected) {
        handleRowClick(selectedRow, selected);
      }
    }
  );

  useEffect(() => {
    setSelectedRow(0);
  }, [searchTerm]);

  const handleRowClick = (index: number, item: any) => {
    setSelectedRow(index);
    if (onEdit) {
      onEdit(item);
    }
  };

  return (
    <div className="EditMachineType">
      {loading && <p className="loadingAndError">Loading...</p>}
      {error && <p className="loadingAndError" style={{ color: "red" }}>{error}</p>}

      {!loading && parentCompanies.length > 0 ? (
        <div className="editsectionsTable-container">
          {/* Search Bar */}
          <div className="editsectionsTable-searchWrapper">
            <div className="editsectionsTable-searchBox">
              <input
                type="text"
                placeholder="Search by company name or description..."
                value={searchTerm}
                className="editsectionsTable-searchInput"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span className="editsectionsTable-searchIcon">🔍</span>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="editsectionsTable-clearButton"
                  title="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
            <div className="editsectionsTable-countBadge">
              {filteredItems.length} of {parentCompanies.length} companies
            </div>
          </div>

          {/* Table */}
          {filteredItems.length > 0 ? (
            <div className="editsectionsTable-wrapper">
              <table className="editsectionsTable-table">
                <thead className="editsectionsTable-thead">
                  <tr>
                    <th className="editsectionsTable-th">No</th>
                    <th className="editsectionsTable-th">Company Name</th>
                    <th className="editsectionsTable-th">Description</th>
                    <th className="editsectionsTable-th">Created</th>
                  </tr>
                </thead>
                <tbody className="editsectionsTable-tbody">
                  {filteredItems.map((item: any, index: number) => (
                    <tr
                      key={item._id}
                      className={`editsectionsTable-tr ${selectedRow === index ? "editsectionsTable-trSelected" : ""}`}
                      onClick={() => handleRowClick(index, item)}
                    >
                      <td className="editsectionsTable-td">{index + 1}</td>
                      <td className="editsectionsTable-td">{item.name || "N/A"}</td>
                      <td className="editsectionsTable-td">{item.description || "N/A"}</td>
                      <td className="editsectionsTable-td">
                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="editsectionsTable-empty">
              No parent companies found matching "<span>{searchTerm}</span>"
            </div>
          )}
        </div>
      ) : (
        !loading && (
          <div className="editsectionsTable-empty">
            No parent companies available. Create one from the Create section.
          </div>
        )
      )}
    </div>
  );
};

export default EditParentCompanyList;
