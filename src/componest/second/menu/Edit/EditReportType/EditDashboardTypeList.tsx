import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getDashboardTypesV2 as getDashboardTypes } from '../../../../redux/dashbroadtype/dashboardTypeActions';
import { AppDispatch } from '../../../../../store';
import CreateDashboardType from '../../create/DashboardType/CreateDashboardType';
import '../EditMachineType/EditMachineyType.css';


// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface DashboardType {
  _id:         string;
  typeName:    string;
  typeCode:    string;
  description?: string;
  category?:   string;
  htmlHeader?: string;
  htmlBody?:   string;
  htmlFooter?: string;
  css?:        string;
  js?:         string;
  branchId?:   { _id: string; name: string };
}

// ─────────────────────────────────────────────
// CATEGORY BADGE colors
// ─────────────────────────────────────────────
const CATEGORY_COLORS: Record<string, { bg: string; color: string }> = {
  analytics:   { bg: "#dbeafe", color: "#1d4ed8" },
  operations:  { bg: "#dcfce7", color: "#15803d" },
  finance:     { bg: "#fef9c3", color: "#a16207" },
  customer:    { bg: "#fce7f3", color: "#be185d" },
  production:  { bg: "#ede9fe", color: "#7c3aed" },
  management:  { bg: "#ffedd5", color: "#c2410c" },
  inventory:   { bg: "#e0f2fe", color: "#0369a1" },
  other:       { bg: "#f3f4f6", color: "#4b5563" },
};

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
const EditDashboardTypeList = () => {
  const dispatch = useDispatch<AppDispatch>();

  // ── Redux state ──────────────────────────────────────────────
  // Supports both state.v2.dashboardType and state.dashboardType key paths
  const dashboardTypeState = useSelector((state: any) =>
    state.v2?.dashboardType ?? state.dashboardType ?? {}
  );
  const rawList = dashboardTypeState?.list;
  // Unwrap in case the reducer stored an API envelope instead of a plain array
  const dashboardTypes: DashboardType[] =
    Array.isArray(rawList)             ? rawList           :
    Array.isArray(rawList?.data)       ? rawList.data      :
    Array.isArray(rawList?.data?.data) ? rawList.data.data :
    [];
  const loading = dashboardTypeState?.loading || false;
  const error   = dashboardTypeState?.error   || null;

  // ── Local state ──────────────────────────────────────────────
  const [selectedDashboardType, setSelectedDashboardType] = useState<any>(null);
  const [searchTerm,            setSearchTerm]            = useState('');
  const [selectedRow,           setSelectedRow]           = useState(0);

  // ── Debug: log what Redux actually has (remove in production) ──
  useEffect(() => {
    console.log('[DashboardTypeList] Redux state:', dashboardTypeState);
    console.log('[DashboardTypeList] Resolved list:', dashboardTypes);
  }, [dashboardTypeState]);

  // Re-fetch when selected branch changes
  const selectedBranch = useSelector((state: any) => state.auth?.userData?.selectedBranch);

  // ── Initial fetch ────────────────────────────────────────────
  useEffect(() => {
    dispatch(getDashboardTypes());
  }, [dispatch, selectedBranch]);

  // ── Handlers ─────────────────────────────────────────────────
  const handleEdit = (dashboardType: any) => {
    setSelectedDashboardType(dashboardType);
  };

  const handleBackToList = () => {
    setSelectedDashboardType(null);
    dispatch(getDashboardTypes()); // refresh list after create / update / delete
  };

  // ── Filtered list ─────────────────────────────────────────────
  const filteredItems: DashboardType[] = dashboardTypes?.filter((dt: DashboardType) =>
    dt.typeName?.toLowerCase().includes(searchTerm.toLowerCase())    ||
    dt.typeCode?.toLowerCase().includes(searchTerm.toLowerCase())    ||
    dt.category?.toLowerCase().includes(searchTerm.toLowerCase())    ||
    dt.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // ── Keyboard navigation ───────────────────────────────────────
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
      if (filteredItems[selectedRow]) handleEdit(filteredItems[selectedRow]);
    }
  }, [filteredItems, selectedRow]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Reset selected row when search changes
  useEffect(() => { setSelectedRow(0); }, [searchTerm]);

  // ── Show edit / create form ───────────────────────────────────
  if (selectedDashboardType) {
    // __new flag means Create mode — pass no initialData so editMode = false
    const isNew = selectedDashboardType.__new === true;
    return (
      <CreateDashboardType
        initialData={isNew ? undefined : selectedDashboardType}
        onCancel={handleBackToList}
        onSaveSuccess={handleBackToList}
      />
    );
  }

  // ── Loading / error states ────────────────────────────────────
  if (loading) return <p className="loadingAndError">Loading...</p>;
  if (error)   return <p className="loadingAndError" style={{ color: "red" }}>{error}</p>;

  // ── LIST VIEW ─────────────────────────────────────────────────
  return (
    <div className="EditMachineType">
      <div className="editsectionsTable-container">

        {/* Search + count + Create button */}
        <div className="editsectionsTable-searchWrapper">
          <div className="editsectionsTable-searchBox">
            <input
              type="text"
              placeholder="Search dashboard types..."
              className="editsectionsTable-searchInput"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="editsectionsTable-searchIcon">🔍</span>
            {searchTerm && (
              <button onClick={() => setSearchTerm("")} className="editsectionsTable-clearButton">✕</button>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div className="editsectionsTable-countBadge">{filteredItems.length} types</div>
            {/* ── Create new button ── */}
            <button
              onClick={() => setSelectedDashboardType({ __new: true })}
              style={{
                padding: "6px 14px",
                background: "#3b82f6",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              ➕ Create New
            </button>
          </div>
        </div>

        {/* Table */}
        {filteredItems.length > 0 ? (
          <div className="editsectionsTable-wrapper">
            <table className="editsectionsTable-table">
              <thead className="editsectionsTable-thead">
                <tr>
                  <th className="editsectionsTable-th">No</th>
                  <th className="editsectionsTable-th">Dashboard Name</th>
                  <th className="editsectionsTable-th">Code</th>
                  <th className="editsectionsTable-th">Category</th>
                  <th className="editsectionsTable-th">Description</th>
                  <th className="editsectionsTable-th">Branch</th>
                  <th className="editsectionsTable-th">Template</th>
                </tr>
              </thead>
              <tbody className="editsectionsTable-tbody">
                {filteredItems.map((item: DashboardType, index: number) => {
                  const catStyle = CATEGORY_COLORS[item.category || "other"] || CATEGORY_COLORS.other;
                  const hasTemplate = !!(item.htmlHeader || item.htmlBody || item.htmlFooter);
                  return (
                    <tr
                      key={item._id}
                      className={`editsectionsTable-tr ${selectedRow === index ? "editsectionsTable-trSelected" : ""}`}
                      onClick={() => { setSelectedRow(index); handleEdit(item); }}
                    >
                      <td className="editsectionsTable-td">{index + 1}</td>
                      <td className="editsectionsTable-td" style={{ fontWeight: 500 }}>{item.typeName}</td>
                      <td className="editsectionsTable-td">
                        <span style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 600, color: "#374151" }}>
                          {item.typeCode || "N/A"}
                        </span>
                      </td>
                      <td className="editsectionsTable-td">
                        {item.category ? (
                          <span style={{
                            padding: "3px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600,
                            background: catStyle.bg, color: catStyle.color,
                          }}>
                            {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                          </span>
                        ) : "—"}
                      </td>
                      <td className="editsectionsTable-td" style={{ maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#6b7280", fontSize: 12 }}>
                        {item.description || "—"}
                      </td>
                      <td className="editsectionsTable-td">{item.branchId?.name || "N/A"}</td>
                      <td className="editsectionsTable-td">
                        <span style={{
                          padding: "3px 8px", borderRadius: 4, fontSize: 11,
                          background: hasTemplate ? "#dcfce7" : "#f3f4f6",
                          color:      hasTemplate ? "#15803d" : "#9ca3af",
                        }}>
                          {hasTemplate ? "✓ Has Template" : "No Template"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="editsectionsTable-empty">
            {searchTerm
              ? `No dashboard types match "${searchTerm}"`
              : (
                <div style={{ textAlign: "center", padding: "32px 0" }}>
                  <div style={{ fontSize: 40, marginBottom: 10 }}>📊</div>
                  <div style={{ fontWeight: 600, marginBottom: 6, color: "#374151" }}>No dashboard types yet</div>
                  <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 16 }}>
                    Check your browser console for Redux state details
                  </div>
                  <button
                    onClick={() => setSelectedDashboardType({ __new: true })}
                    style={{
                      padding: "8px 20px", background: "#3b82f6", color: "#fff",
                      border: "none", borderRadius: 6, cursor: "pointer",
                      fontSize: 13, fontWeight: 600,
                    }}
                  >
                    ➕ Create First Dashboard Type
                  </button>
                </div>
              )
            }
          </div>
        )}
      </div>
    </div>
  );
};

export default EditDashboardTypeList;