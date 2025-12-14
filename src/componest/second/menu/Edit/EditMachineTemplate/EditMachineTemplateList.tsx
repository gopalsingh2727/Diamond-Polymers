/**
 * EditMachineTemplateList - LIST ONLY
 * Click → Goes to ViewTemplateWizard for editing
 */
import React, { useState, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getMachineTemplates, activateMachineTemplate, deactivateMachineTemplate, deleteMachineTemplate } from "../../../../redux/machineTemplate/machineTemplateActions";
import { RootState } from "../../../../redux/rootReducer";
import { AppDispatch } from "../../../../../store";

interface CalculationRule {
  id: string;
  name: string;
  optionTypeId: string;
  optionTypeName?: string;
  specField: string;
  calculationType: string;
  multipleOccurrence: string;
  resultLabel?: string;
  resultUnit?: string;
  showInSummary: boolean;
  isActive: boolean;
}

interface SelectedSpecification {
  optionSpecId: string;
  fields: string[];
  showYesNo: boolean;
}

interface MachineTemplate {
  _id: string;
  templateName: string;
  description?: string;
  machineId: string | { _id: string; machineName: string };
  orderTypeId: string | { _id: string; typeName: string };
  isActive: boolean;
  columns?: any[];
  displayItems?: any[];
  totalsConfig?: any[];
  optionTypeIds?: string[];
  optionSpecIds?: string[];
  selectedSpecifications?: SelectedSpecification[];
  calculationRules?: CalculationRule[];
  machine?: { _id: string; machineName: string };
  orderType?: { _id: string; typeName: string };
  branchId?: { _id: string; name: string };
}

interface Props {
  onEdit: (data: MachineTemplate) => void;
}

const EditMachineTemplateList: React.FC<Props> = ({ onEdit }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { templates = [], loading, error } = useSelector((state: RootState) => state.machineTemplate || {});

  // Fetch templates on mount
  useEffect(() => {
    dispatch(getMachineTemplates());
  }, [dispatch]);

  const [selectedRow, setSelectedRow] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const filteredItems = templates.filter((item: MachineTemplate) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    const machineName = typeof item.machineId === 'object' ? item.machineId.machineName : (item.machine?.machineName || '');
    const orderTypeName = typeof item.orderTypeId === 'object' ? item.orderTypeId.typeName : (item.orderType?.typeName || '');
    return (
      item.templateName?.toLowerCase().includes(search) ||
      item.description?.toLowerCase().includes(search) ||
      machineName.toLowerCase().includes(search) ||
      orderTypeName.toLowerCase().includes(search)
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

  const handleToggleActive = async (e: React.MouseEvent, template: MachineTemplate) => {
    e.stopPropagation();
    setActionLoading(template._id);
    try {
      if (template.isActive) {
        await dispatch(deactivateMachineTemplate(template._id));
      } else {
        await dispatch(activateMachineTemplate(template._id));
      }
    } catch (err) {
      console.error('Failed to toggle template status:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (templateId: string) => {
    setActionLoading(templateId);
    try {
      await dispatch(deleteMachineTemplate(templateId));
      setShowDeleteConfirm(null);
    } catch (err) {
      console.error('Failed to delete template:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const getMachineName = (item: MachineTemplate): string => {
    if (typeof item.machineId === 'object') return item.machineId.machineName;
    if (item.machine) return item.machine.machineName;
    return 'N/A';
  };

  const getOrderTypeName = (item: MachineTemplate): string => {
    if (typeof item.orderTypeId === 'object') return item.orderTypeId.typeName;
    if (item.orderType) return item.orderType.typeName;
    return 'N/A';
  };

  if (loading && templates.length === 0) return <p className="loadingAndError">Loading...</p>;
  if (error) return <p className="loadingAndError" style={{ color: "red" }}>{error}</p>;

  return (
    <div className="EditMachineType">
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '12px',
            maxWidth: '400px',
            width: '90%',
            textAlign: 'center'
          }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#1f2937' }}>Delete Template?</h3>
            <p style={{ color: '#6b7280', marginBottom: '24px' }}>
              Are you sure you want to delete this template? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(null)}
                style={{ padding: '10px 24px', background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(showDeleteConfirm)}
                disabled={actionLoading === showDeleteConfirm}
                style={{ padding: '10px 24px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
              >
                {actionLoading === showDeleteConfirm ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="editsectionsTable-container">
        <div className="editsectionsTable-searchWrapper">
          <div className="editsectionsTable-searchBox">
            <input
              type="text"
              placeholder="Search templates..."
              className="editsectionsTable-searchInput"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="editsectionsTable-searchIcon">&#x1F50D;</span>
            {searchTerm && <button onClick={() => setSearchTerm("")} className="editsectionsTable-clearButton">&#x2715;</button>}
          </div>
          <div className="editsectionsTable-countBadge">{filteredItems.length} templates</div>
        </div>

        {filteredItems.length > 0 ? (
          <div className="editsectionsTable-wrapper">
            <table className="editsectionsTable-table">
              <thead className="editsectionsTable-thead">
                <tr>
                  <th className="editsectionsTable-th">No</th>
                  <th className="editsectionsTable-th">Template Name</th>
                  <th className="editsectionsTable-th">Machine</th>
                  <th className="editsectionsTable-th">Order Type</th>
                  <th className="editsectionsTable-th">Branch</th>
                  <th className="editsectionsTable-th">Columns</th>
                  <th className="editsectionsTable-th">Display</th>
                  <th className="editsectionsTable-th">Totals</th>
                  <th className="editsectionsTable-th">Calc Rules</th>
                  <th className="editsectionsTable-th">Status</th>
                  <th className="editsectionsTable-th">Actions</th>
                </tr>
              </thead>
              <tbody className="editsectionsTable-tbody">
                {filteredItems.map((item: MachineTemplate, index: number) => (
                  <tr
                    key={item._id}
                    className={`editsectionsTable-tr ${selectedRow === index ? "editsectionsTable-trSelected" : ""}`}
                    onClick={() => { setSelectedRow(index); onEdit(item); }}
                  >
                    <td className="editsectionsTable-td">{index + 1}</td>
                    <td className="editsectionsTable-td">{item.templateName || "N/A"}</td>
                    <td className="editsectionsTable-td">{getMachineName(item)}</td>
                    <td className="editsectionsTable-td">{getOrderTypeName(item)}</td>
                    <td className="editsectionsTable-td">{item.branchId?.name || "N/A"}</td>
                    <td className="editsectionsTable-td">
                      <span style={{
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        background: '#e0f2fe',
                        color: '#0369a1'
                      }}>
                        {item.columns?.length || 0}
                      </span>
                    </td>
                    <td className="editsectionsTable-td">
                      <span style={{
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        background: '#fef3c7',
                        color: '#92400e'
                      }}>
                        {item.displayItems?.length || 0}
                      </span>
                    </td>
                    <td className="editsectionsTable-td">
                      <span style={{
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        background: '#dcfce7',
                        color: '#166534'
                      }}>
                        {item.totalsConfig?.length || 0}
                      </span>
                    </td>
                    <td className="editsectionsTable-td">
                      <span style={{
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        background: item.calculationRules?.length ? '#d1fae5' : '#f3f4f6',
                        color: item.calculationRules?.length ? '#065f46' : '#6b7280'
                      }}>
                        {item.calculationRules?.length || 0}
                      </span>
                    </td>
                    <td className="editsectionsTable-td">
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '500',
                        background: item.isActive ? '#dcfce7' : '#fee2e2',
                        color: item.isActive ? '#166534' : '#991b1b'
                      }}>
                        {item.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="editsectionsTable-td" onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={(e) => handleToggleActive(e, item)}
                          disabled={actionLoading === item._id}
                          style={{
                            padding: '4px 8px',
                            fontSize: '12px',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            background: item.isActive ? '#fef3c7' : '#d1fae5',
                            color: item.isActive ? '#92400e' : '#065f46'
                          }}
                        >
                          {actionLoading === item._id ? '...' : (item.isActive ? 'Deactivate' : 'Activate')}
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(item._id); }}
                          style={{
                            padding: '4px 8px',
                            fontSize: '12px',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            background: '#fee2e2',
                            color: '#991b1b'
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="editsectionsTable-empty">No machine templates found</div>
        )}
      </div>
    </div>
  );
};

export default EditMachineTemplateList;
