import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAccounts,
  updateAccount,
} from "../../../../redux/create/createNewAccount/NewAccountActions";
import { RootState } from "../../../../redux/rootReducer";
import { AppDispatch } from "../../../../../store";
import { indianStates } from "../../create/createNewAccount/indianStates";
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

const EditAccount: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { accounts = [], loading, error } = useSelector(
    (state: RootState) => state.getAccounts || {}
  );

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

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (showDetail || filteredAccounts.length === 0) return;

      if (e.key === "ArrowDown") {
        setSelectedRow((prev) => Math.min(prev + 1, filteredAccounts.length - 1));
      } else if (e.key === "ArrowUp") {
        setSelectedRow((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter") {
        const selected = filteredAccounts[selectedRow];
        if (selected) {
          setForm(selected);
          setShowDetail(true);
        }
      }
    },
    [filteredAccounts, selectedRow, showDetail]
  );

  useEffect(() => {
    dispatch(getAccounts());
  }, [dispatch]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    // Reset selected row when search changes
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
      dispatch(getAccounts());
    } catch (err) {
      alert("Failed to update account.");
    }
  };

  const handleRowClick = (index: number, item: Account) => {
    setSelectedRow(index);
    setForm(item);
    setShowDetail(true);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  return (
    <div className="EditAccount EditMachineType">
       {loading && <p className="loadingAndError">Loading...</p>}
      {error && <p className="loadingAndError"  style={{ color: "red" }}>{error}</p>}

      {!showDetail && !loading && accounts.length > 0 ? (
        <>
          {/* Search Bar */}
          <div style={{
            marginBottom: '20px',
            display: 'flex',
            gap: '10px',
            alignItems: 'center'
          }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                type="text"
                placeholder="Search by company, name, phone, email, state, or pincode..."
                value={searchTerm}
                onChange={handleSearchChange}
                style={{
                  width: '100%',
                  padding: '12px 40px 12px 40px',
                  fontSize: '15px',
                  border: '2px solid #ddd',
                  borderRadius: '8px',
                  outline: 'none',
                  transition: 'border-color 0.3s ease',
                }}
                onFocus={(e) => e.target.style.borderColor = '#2d89ef'}
                onBlur={(e) => e.target.style.borderColor = '#ddd'}
              />
              <span style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '18px',
                color: '#666',
              }}>
                🔍
              </span>
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    fontSize: '20px',
                    cursor: 'pointer',
                    color: '#999',
                    padding: '4px 8px',
                  }}
                  title="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
            <div style={{
              padding: '12px 16px',
              background: '#f5f5f5',
              borderRadius: '8px',
              fontSize: '14px',
              color: '#666',
              whiteSpace: 'nowrap',
            }}>
              {filteredAccounts.length} of {accounts.length} accounts
            </div>
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
                    className={selectedRow === index ? "bg-blue-100" : ""}
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
          <div className="CreateAccountTitelCss">
            <h6>Edit Account</h6>
          </div>
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

              <div className="form-row">
                
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
                <button type="button" onClick={() => setShowDetail(false)} style={{ marginLeft: '10px' }}>
                  Back
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