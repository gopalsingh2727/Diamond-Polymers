import React, { useEffect, useState, useContext, createContext } from "react";
import { useDispatch } from "react-redux";
import {
  updateAccount,
} from "../../../../redux/create/createNewAccount/NewAccountActions";
import { useFormDataCache } from "../hooks/useFormDataCache";
import { AppDispatch } from "../../../../../store";
import { indianStates } from "../../create/createNewAccount/indianStates";
import {
  useInternalBackNavigation,
  useListNavigation,
  SearchBox,
  ResultsCounter,
} from "../../../../allCompones/BackButton";
import "./EditAccount.css";

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

// Create context for back navigation
interface BackNavigationContextType {
  registerBackHandler: (handler: () => void) => void;
  unregisterBackHandler: () => void;
}

export const BackNavigationContext = createContext<BackNavigationContextType | null>(null);

const EditAccount: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const backNavContext = useContext(BackNavigationContext);

  // 🚀 OPTIMIZED: Get data from cached form data (no API calls!)
  const { customers: accounts, loading, error } = useFormDataCache();

  const [selectedRow, setSelectedRow] = useState(0);
  const [showDetail, setShowDetail] = useState(false);
  const [form, setForm] = useState<Partial<Account>>({});
  const [searchTerm, setSearchTerm] = useState("");

  // Filter accounts based on search term
  const filteredAccounts = accounts.filter((account) => {
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

  // Back handler function
  const handleBackClick = () => {
    if (showDetail) {
      // If in detail view, go back to list
      setShowDetail(false);
      setForm({});
    }
  };

  // Register back handler with parent when component mounts or showDetail changes
  useEffect(() => {
    if (backNavContext) {
      backNavContext.registerBackHandler(handleBackClick);
      return () => backNavContext.unregisterBackHandler();
    }
  }, [showDetail, backNavContext]);

  // Handle ESC key for internal back navigation
  useInternalBackNavigation(showDetail, handleBackClick);

  // Handle keyboard navigation for list view
  useListNavigation(
    !showDetail,
    filteredAccounts.length,
    selectedRow,
    setSelectedRow,
    () => {
      const selected = filteredAccounts[selectedRow];
      if (selected) {
        setForm(selected);
        setShowDetail(true);
      }
    }
  );

  // ✅ No useEffect dispatch needed - data already loaded from cache!

  useEffect(() => {
    setSelectedRow(0);
  }, [searchTerm]);

  const handleFormChange = (key: keyof Account, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!form._id) return;
    try {
      await dispatch(updateAccount(form._id, form));
      alert("Account updated successfully!");
      setShowDetail(false);
      // ✅ OPTIMIZED: Cache will auto-refresh on next page load
    } catch (err) {
      alert("Failed to update account.");
    }
  };

  const handleRowClick = (index: number, item: Account) => {
    setSelectedRow(index);
    setForm(item);
    setShowDetail(true);
  };

  return (
    <div className="EditAccount EditMachineType">
      {loading && <p className="loadingAndError">Loading...</p>}
      {error && <p className="loadingAndError" style={{ color: "red" }}>{error}</p>}

      {!showDetail && !loading && accounts.length > 0 ? (
        <>
          {/* Search Bar */}
          <div style={{
            marginBottom: '20px',
            display: 'flex',
            gap: '10px',
            alignItems: 'center'
          }}>
            <SearchBox
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClear={() => setSearchTerm("")}
              placeholder="Search by company, name, phone, email, state, or pincode..."
            />
            <ResultsCounter
              filtered={filteredAccounts.length}
              total={accounts.length}
              itemName="accounts"
            />
          </div>

          {/* Table */}
          {filteredAccounts.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>No</th>
                  <th>Company</th>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>State</th>
                </tr>
              </thead>
              <tbody>
                {filteredAccounts.map((item, index) => (
                  <tr
                    key={item._id}
                    className={selectedRow === index ? "bg-orange-100" : ""}
                    onClick={() => handleRowClick(index, item)}
                    style={{ cursor: "pointer" }}
                  >
                    <td>{index + 1}</td>
                    <td>{item.companyName || "N/A"}</td>
                    <td>
                      {[item.firstName, item.lastName].filter(Boolean).join(" ") ||
                        "N/A"}
                    </td>
                    <td>{item.phone1 || "N/A"}</td>
                    <td>{item.state || "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{
              padding: '40px',
              textAlign: 'center',
              color: '#999',
              fontSize: '16px',
            }}>
              No accounts found matching "{searchTerm}"
            </div>
          )}
        </>
      ) : showDetail && form ? (
        <div id="CreateAccountCss">
          <div className="create-account-container">
            <form className="form-container">
              <div className="form-group">
                <label>Company Name</label>
                <input
                  className="CurstomerAddressInput"
                  name="companyName"
                  value={form.companyName || ""}
                  onChange={(e) => handleFormChange("companyName", e.target.value)}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>First Name *</label>
                  <input
                    className="CurstomerInput"
                    name="firstName"
                    value={form.firstName || ""}
                    onChange={(e) => handleFormChange("firstName", e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Last Name *</label>
                  <input
                    className="CurstomerInput"
                    name="lastName"
                    value={form.lastName || ""}
                    onChange={(e) => handleFormChange("lastName", e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  className="CurstomerAddressInput"
                  type="email"
                  name="email"
                  value={form.email || ""}
                  onChange={(e) => handleFormChange("email", e.target.value)}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Phone 1 *</label>
                  <input
                    className="CurstomerInput"
                    name="phone1"
                    value={form.phone1 || ""}
                    onChange={(e) => handleFormChange("phone1", e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Phone 2</label>
                  <input
                    className="CurstomerInput"
                    name="phone2"
                    value={form.phone2 || ""}
                    onChange={(e) => handleFormChange("phone2", e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>WhatsApp</label>
                  <input
                    className="CurstomerInput"
                    name="whatsapp"
                    value={form.whatsapp || ""}
                    onChange={(e) => handleFormChange("whatsapp", e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Telephone</label>
                  <input
                    className="CurstomerInput"
                    name="telephone"
                    value={form.telephone || ""}
                    onChange={(e) => handleFormChange("telephone", e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Address Line 1 *</label>
                <input
                  name="address1"
                  className="CurstomerAddressInput"
                  value={form.address1 || ""}
                  onChange={(e) => handleFormChange("address1", e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Address Line 2</label>
                <input
                  name="address2"
                  className="CurstomerAddressInput"
                  value={form.address2 || ""}
                  onChange={(e) => handleFormChange("address2", e.target.value)}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>State *</label>
                  <select
                    name="state"
                    value={form.state || ""}
                    onChange={(e) => handleFormChange("state", e.target.value)}
                  >
                    <option value="">Select State</option>
                    {indianStates.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Pin Code *</label>
                  <input
                    name="pinCode"
                    className="CurstomerInput"
                    value={form.pinCode || ""}
                    onChange={(e) => handleFormChange("pinCode", e.target.value)}
                  />
                </div>
              </div>

              {form.imageUrl && (
                <div className="form-group">
                  <label>Profile Image</label>
                  <div className="image-preview">
                    <img
                      src={form.imageUrl}
                      alt="Account"
                      style={{ maxWidth: '200px', maxHeight: '200px' }}
                    />
                  </div>
                </div>
              )}

              <div className="form-group">
                <button type="button" onClick={handleSave}>
                  Update Account
                </button>
              </div>

              <div className="info-section">
                <p>
                  <strong>Created:</strong>{" "}
                  {form.createdAt && new Date(form.createdAt).toLocaleString()}
                </p>
                <p>
                  <strong>Updated:</strong>{" "}
                  {form.updatedAt && new Date(form.updatedAt).toLocaleString()}
                </p>
              </div>
            </form>
          </div>
        </div>
      ) : (
        !loading && <p>No accounts available.</p>
      )}
    </div>
  );
};

export default EditAccount;