/**
 * EditReportTypeList - LIST ONLY
 * Click → Goes to CreateReportType for editing
 */
import React, { useState, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getReportTypesV2 } from "../../../../redux/unifiedV2/reportTypeActions";
import { RootState } from "../../../../redux/rootReducer";
import { AppDispatch } from "../../../../../store";
import { useCRUD } from "../../../../../hooks/useCRUD";
import { ToastContainer } from "../../../../../components/shared/Toast";

interface ReportType {
  _id: string;
  typeName: string;
  typeCode: string;
  description?: string;
  reportCategory: string;
  calculations: { name: string }[];
  graphs: { name: string; type: string }[];
  columns: { key: string; visible: boolean }[];
  isActive?: boolean;
  isDefault?: boolean;
  isGlobal?: boolean;
}

interface Props {
  onEdit: (data: ReportType) => void;
}

// Category colors
const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  customer: { bg: '#dbeafe', text: '#1d4ed8' },
  order: { bg: '#dcfce7', text: '#166534' },
  sales: { bg: '#fef3c7', text: '#92400e' },
  production: { bg: '#f3e8ff', text: '#7c3aed' },
  inventory: { bg: '#ffedd5', text: '#c2410c' },
  financial: { bg: '#cffafe', text: '#0e7490' },
  custom: { bg: '#f1f5f9', text: '#475569' }
};

const EditReportTypeList: React.FC<Props> = ({ onEdit }) => {
  const dispatch = useDispatch<AppDispatch>();
  const reportTypeState = useSelector((state: RootState) => state.v2.reportType);
  const rawReportTypes = reportTypeState?.list;
  const reportTypes = Array.isArray(rawReportTypes) ? rawReportTypes : [];
  const loading = reportTypeState?.loading;
  const error = reportTypeState?.error;
  const { handleSave, handleUpdate, handleDelete: crudDelete, saveState, updateState, deleteState, confirmDialog, closeConfirmDialog, toast } = useCRUD();

  const [selectedRow, setSelectedRow] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  // Get selected branch to refetch when it changes
  const selectedBranch = useSelector((state: any) => state.auth?.userData?.selectedBranch);

  // Fetch report types on mount and when branch changes
  useEffect(() => {
    dispatch(getReportTypesV2());
  }, [dispatch, selectedBranch]);

  const filteredItems = reportTypes.filter((item: ReportType) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      item.typeName?.toLowerCase().includes(search) ||
      item.typeCode?.toLowerCase().includes(search) ||
      item.description?.toLowerCase().includes(search) ||
      item.reportCategory?.toLowerCase().includes(search)
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
              placeholder="Search report types..."
              className="editsectionsTable-searchInput"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="editsectionsTable-searchIcon">?</span>
            {searchTerm && <button onClick={() => setSearchTerm("")} className="editsectionsTable-clearButton">X</button>}
          </div>
          <div className="editsectionsTable-countBadge">{filteredItems.length} report types</div>
        </div>

        {filteredItems.length > 0 ? (
          <div className="editsectionsTable-wrapper">
            <table className="editsectionsTable-table">
              <thead className="editsectionsTable-thead">
                <tr>
                  <th className="editsectionsTable-th">No</th>
                  <th className="editsectionsTable-th">Code</th>
                  <th className="editsectionsTable-th">Name</th>
                  <th className="editsectionsTable-th">Category</th>
                  <th className="editsectionsTable-th">Calculations</th>
                  <th className="editsectionsTable-th">Graphs</th>
                  <th className="editsectionsTable-th">Status</th>
                </tr>
              </thead>
              <tbody className="editsectionsTable-tbody">
                {filteredItems.map((item: ReportType, index: number) => {
                  const categoryStyle = CATEGORY_COLORS[item.reportCategory] || CATEGORY_COLORS.custom;
                  return (
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
                          {item.typeCode}
                        </span>
                      </td>
                      <td className="editsectionsTable-td">{item.typeName}</td>
                      <td className="editsectionsTable-td">
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          backgroundColor: categoryStyle.bg,
                          color: categoryStyle.text,
                          textTransform: 'capitalize'
                        }}>
                          {item.reportCategory}
                        </span>
                      </td>
                      <td className="editsectionsTable-td">
                        {item.calculations?.length || 0} formulas
                      </td>
                      <td className="editsectionsTable-td">
                        {item.graphs?.length || 0} charts
                      </td>
                      <td className="editsectionsTable-td">
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          <span style={{
                            padding: '2px 6px',
                            borderRadius: '8px',
                            fontSize: '0.7rem',
                            backgroundColor: item.isActive !== false ? '#dcfce7' : '#fee2e2',
                            color: item.isActive !== false ? '#166534' : '#991b1b'
                          }}>
                            {item.isActive !== false ? 'Active' : 'Inactive'}
                          </span>
                          {item.isDefault && (
                            <span style={{
                              padding: '2px 6px',
                              borderRadius: '8px',
                              fontSize: '0.7rem',
                              backgroundColor: '#fef3c7',
                              color: '#92400e'
                            }}>
                              Default
                            </span>
                          )}
                          {item.isGlobal && (
                            <span style={{
                              padding: '2px 6px',
                              borderRadius: '8px',
                              fontSize: '0.7rem',
                              backgroundColor: '#dbeafe',
                              color: '#1d4ed8'
                            }}>
                              Global
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="editsectionsTable-empty">No report types found</div>
        )}
      </div>
      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
    </div>
  );
};

export default EditReportTypeList;
