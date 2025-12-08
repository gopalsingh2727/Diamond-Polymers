import React, { useEffect, useState } from "react";
import { useFormDataCache } from "../hooks/useFormDataCache";
import { useListNavigation } from "../../../../allCompones/BackButton";

interface Account {
  _id: string;
  companyName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone1?: string;
  phone2?: string;
  whatsapp?: string;
  telephone?: string;
  address1?: string;
  address2?: string;
  state?: string;
  pinCode?: string;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface EditAccountProps {
  onEdit?: (data: Account) => void;
}

const EditAccount: React.FC<EditAccountProps> = ({ onEdit }) => {

  // 🚀 OPTIMIZED: Get data from cached form data (no API calls!)
  const { customers: accounts, loading, error } = useFormDataCache();

  const [selectedRow, setSelectedRow] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  // Filter accounts based on search term
  const filteredAccounts = accounts.filter((account: Account) => {
    if (!searchTerm) return true;

    const search = searchTerm.toLowerCase();
    return (
      account.companyName?.toLowerCase().includes(search) ||
      account.firstName?.toLowerCase().includes(search) ||
      account.lastName?.toLowerCase().includes(search) ||
      account.email?.toLowerCase().includes(search) ||
      account.phone1?.toLowerCase().includes(search) ||
      account.state?.toLowerCase().includes(search) ||
      account.pinCode?.toLowerCase().includes(search)
    );
  });

  // Handle keyboard navigation for list view
  useListNavigation(
    true,
    filteredAccounts.length,
    selectedRow,
    setSelectedRow,
    () => {
      const selected = filteredAccounts[selectedRow];
      if (selected) {
        handleRowClick(selectedRow, selected);
      }
    }
  );

  useEffect(() => {
    setSelectedRow(0);
  }, [searchTerm]);

  // Trigger edit mode via callback (stays in Edit section with sidebar)
  const handleRowClick = (index: number, item: Account) => {
    setSelectedRow(index);
    if (onEdit) {
      onEdit(item);
    }
  };

  return (
    <div className="EditMachineType">
      {loading && <p className="loadingAndError">Loading...</p>}
      {error && <p className="loadingAndError" style={{ color: "red" }}>{error}</p>}

      {!loading && accounts.length > 0 ? (
        <div className="editsectionsTable-container">
          {/* Search Bar */}
          <div className="editsectionsTable-searchWrapper">
            <div className="editsectionsTable-searchBox">
              <input
                type="text"
                placeholder="Search by company, name, phone, email, state, or pincode..."
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
              {filteredAccounts.length} of {accounts.length} accounts
            </div>
          </div>

          {/* Table */}
          {filteredAccounts.length > 0 ? (
            <div className="editsectionsTable-wrapper">
              <table className="editsectionsTable-table">
                <thead className="editsectionsTable-thead">
                  <tr>
                    <th className="editsectionsTable-th">No</th>
                    <th className="editsectionsTable-th">Company</th>
                    <th className="editsectionsTable-th">Name</th>
                    <th className="editsectionsTable-th">Phone</th>
                    <th className="editsectionsTable-th">State</th>
                  </tr>
                </thead>
                <tbody className="editsectionsTable-tbody">
                  {filteredAccounts.map((item: Account, index: number) => (
                    <tr
                      key={item._id}
                      className={`editsectionsTable-tr ${selectedRow === index ? "editsectionsTable-trSelected" : ""}`}
                      onClick={() => handleRowClick(index, item)}
                    >
                      <td className="editsectionsTable-td">{index + 1}</td>
                      <td className="editsectionsTable-td">{item.companyName || "N/A"}</td>
                      <td className="editsectionsTable-td">
                        {[item.firstName, item.lastName].filter(Boolean).join(" ") ||
                          "N/A"}
                      </td>
                      <td className="editsectionsTable-td">{item.phone1 || "N/A"}</td>
                      <td className="editsectionsTable-td">{item.state || "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="editsectionsTable-empty">
              No accounts found matching "<span>{searchTerm}</span>"
            </div>
          )}
        </div>
      ) : (
        !loading && <p>No accounts available.</p>
      )}
    </div>
  );
};

export default EditAccount;
