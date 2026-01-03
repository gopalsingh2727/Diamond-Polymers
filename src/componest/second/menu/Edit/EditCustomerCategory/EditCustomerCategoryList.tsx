import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getCustomerCategoriesV2 } from "../../../../redux/unifiedV2";
import { RootState, AppDispatch } from "../../../../../store";
import CustomerCategory from "../../create/customerCategory/CustomerCategory";
import { useListNavigation } from "../../../../allCompones/BackButton";
import "../EditMachineType/EditMachineyType.css";

interface Props {
  onEdit?: (data: any) => void;
}

const EditCustomerCategoryList: React.FC<Props> = ({ onEdit }) => {
  const dispatch = useDispatch<AppDispatch>();

  const customerCategoryState = useSelector(
    (state: RootState) => state.v2.customerCategory
  );
  const rawCategories = customerCategoryState?.list;
  const categories = Array.isArray(rawCategories) ? rawCategories : [];
  const loading = customerCategoryState?.loading;
  const error = customerCategoryState?.error;

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRow, setSelectedRow] = useState(0);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // Get selected branch to refetch when it changes
  const selectedBranch = useSelector((state: any) => state.auth?.userData?.selectedBranch);

  useEffect(() => {
    dispatch(getCustomerCategoriesV2());
  }, [dispatch, selectedBranch]);

  const handleBackToList = () => {
    setSelectedItem(null);
    dispatch(getCustomerCategoriesV2());
  };

  if (selectedItem) {
    return (
      <CustomerCategory
        initialData={selectedItem}
        onCancel={handleBackToList}
        onSaveSuccess={handleBackToList}
      />
    );
  }

  const filteredItems = categories.filter((item: any) => {
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

      {!loading && categories.length > 0 ? (
        <div className="editsectionsTable-container">
          {/* Search Bar */}
          <div className="editsectionsTable-searchWrapper">
            <div className="editsectionsTable-searchBox">
              <input
                type="text"
                placeholder="Search by name or description..."
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
              {filteredItems.length} of {categories.length} categories
            </div>
          </div>

          {/* Table */}
          {filteredItems.length > 0 ? (
            <div className="editsectionsTable-wrapper">
              <table className="editsectionsTable-table">
                <thead className="editsectionsTable-thead">
                  <tr>
                    <th className="editsectionsTable-th">No</th>
                    <th className="editsectionsTable-th">Category Name</th>
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
              No categories found matching "<span>{searchTerm}</span>"
            </div>
          )}
        </div>
      ) : (
        !loading && (
          <div className="editsectionsTable-empty">
            No customer categories available. Create one from the Create section.
          </div>
        )
      )}
    </div>
  );
};

export default EditCustomerCategoryList;
