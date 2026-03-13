import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getExcelTypesV2 as getExcelTypes, deleteExcelTypeV2 as deleteExcelType } from "../../../../redux/unifiedV2/excelTypeActions";
import { AppDispatch } from "../../../../../store";
import CreateExcelType from "./CreateExcelType";
import { ToastContainer, } from "../../../../../components/shared/Toast";
import "../orderType/orderType.css";

interface ExcelType {
  _id: string;
  typeName: string;
  typeCode: string;
  description?: string;
  category: 'account' | 'manufacturing';
  subCategory?: string;
  exportFormat: string;
  sheets: Array<{ sheetName: string; columns: any[] }>;
  isActive: boolean;
  isDefault: boolean;
  isGlobal: boolean;
  createdAt: string;
  updatedAt: string;
}

const ExcelTypeList: React.FC = () => {
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
  const [selectedExcelType, setSelectedExcelType] = useState<ExcelType | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'account' | 'manufacturing'>('all');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ExcelType | null>(null);
  const [deleting, setDeleting] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const toast = useToast();

  // Get excel types from Redux store
  const { list: excelTypes, loading } = useSelector((state: any) => state.v2.excelType || { list: [], loading: false });

  // Fetch excel types on mount
  useEffect(() => {
    dispatch(getExcelTypes());
  }, [dispatch]);

  // Filter excel types
  const filteredExcelTypes = (Array.isArray(excelTypes) ? excelTypes : []).filter((et: ExcelType) => {
    const matchesSearch = et.typeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          et.typeCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || et.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Group by category
  const accountTypes = filteredExcelTypes.filter((et: ExcelType) => et.category === 'account');
  const manufacturingTypes = filteredExcelTypes.filter((et: ExcelType) => et.category === 'manufacturing');

  const handleEdit = (excelType: ExcelType) => {
    setSelectedExcelType(excelType);
    setView('edit');
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    try {
      await dispatch(deleteExcelType(deleteTarget._id));
      toast.success('Deleted', 'Excel type deleted successfully');
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
    } catch (err) {
      toast.error('Error', 'Failed to delete excel type');
    } finally {
      setDeleting(false);
    }
  };

  const handleBackToList = () => {
    setView('list');
    setSelectedExcelType(null);
    dispatch(getExcelTypes());
  };

  const getCategoryColor = (category: string) => {
    return category === 'account' ? '#1e40af' : '#059669';
  };

  const getCategoryBgColor = (category: string) => {
    return category === 'account' ? '#dbeafe' : '#d1fae5';
  };

  const getSubCategoryLabel = (subCategory: string) => {
    const labels: Record<string, string> = {
      billing: 'Billing',
      invoice: 'Invoice',
      financial_report: 'Financial Report',
      tax_report: 'Tax Report',
      payment_report: 'Payment Report',
      production: 'Production',
      orders: 'Orders',
      machine_report: 'Machine Report',
      operator_report: 'Operator Report',
      inventory: 'Inventory',
      bill: 'Bill',
      quality_report: 'Quality Report'
    };
    return labels[subCategory] || subCategory;
  };

  if (view === 'create') {
    return (
      <CreateExcelType
        onCancel={handleBackToList}
        onSaveSuccess={handleBackToList}
      />
    );
  }

  if (view === 'edit' && selectedExcelType) {
    return (
      <CreateExcelType
        initialData={selectedExcelType}
        onCancel={handleBackToList}
        onSaveSuccess={handleBackToList}
      />
    );
  }

  return (
    <div className="orderTypeContainer">
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && deleteTarget && (
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
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>Warning</div>
            <h3 style={{ margin: '0 0 8px 0', color: '#1f2937' }}>Delete Excel Type?</h3>
            <p style={{ color: '#6b7280', marginBottom: '8px' }}>
              Are you sure you want to delete <strong>{deleteTarget.typeName}</strong>?
            </p>
            <p style={{ color: '#ef4444', fontSize: '13px', marginBottom: '24px' }}>
              This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => { setShowDeleteConfirm(false); setDeleteTarget(null); }}
                style={{ padding: '10px 24px', background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                style={{ padding: '10px 24px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="orderTypeHeader">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'space-between', width: '100%' }}>
          <div>
            <h2 className="orderTypeTitle">Excel Types</h2>
            <p className="orderTypeSubtitle">
              Manage excel export configurations for Account and Manufacturing
            </p>
          </div>
          <button
            type="button"
            onClick={() => setView('create')}
            style={{
              padding: '10px 20px',
              background: '#059669',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Create Excel Type
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search by name or code..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: 1,
            minWidth: '200px',
            padding: '10px 16px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '14px'
          }}
        />
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={() => setCategoryFilter('all')}
            style={{
              padding: '10px 16px',
              background: categoryFilter === 'all' ? '#374151' : '#e5e7eb',
              color: categoryFilter === 'all' ? 'white' : '#374151',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 500
            }}
          >
            All ({excelTypes.length})
          </button>
          <button
            type="button"
            onClick={() => setCategoryFilter('account')}
            style={{
              padding: '10px 16px',
              background: categoryFilter === 'account' ? '#1e40af' : '#dbeafe',
              color: categoryFilter === 'account' ? 'white' : '#1e40af',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 500
            }}
          >
            Account ({accountTypes.length})
          </button>
          <button
            type="button"
            onClick={() => setCategoryFilter('manufacturing')}
            style={{
              padding: '10px 16px',
              background: categoryFilter === 'manufacturing' ? '#059669' : '#d1fae5',
              color: categoryFilter === 'manufacturing' ? 'white' : '#059669',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 500
            }}
          >
            Manufacturing ({manufacturingTypes.length})
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
          Loading excel types...
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredExcelTypes.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#f9fafb', borderRadius: '12px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>Empty</div>
          <h3 style={{ margin: '0 0 8px 0', color: '#1f2937' }}>No Excel Types Found</h3>
          <p style={{ color: '#6b7280', marginBottom: '24px' }}>
            {searchTerm || categoryFilter !== 'all'
              ? 'No excel types match your search criteria.'
              : 'Create your first excel type to get started.'
            }
          </p>
          {!searchTerm && categoryFilter === 'all' && (
            <button
              type="button"
              onClick={() => setView('create')}
              style={{
                padding: '12px 24px',
                background: '#059669',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500
              }}
            >
              Create Excel Type
            </button>
          )}
        </div>
      )}

      {/* Excel Types Grid */}
      {!loading && filteredExcelTypes.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {filteredExcelTypes.map((excelType: ExcelType) => (
            <div
              key={excelType._id}
              style={{
                background: 'white',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                overflow: 'hidden',
                transition: 'box-shadow 0.2s',
                cursor: 'pointer'
              }}
              onClick={() => handleEdit(excelType)}
            >
              {/* Header */}
              <div style={{
                padding: '16px',
                background: getCategoryBgColor(excelType.category),
                borderBottom: '1px solid #e5e7eb'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 600, color: '#1f2937' }}>
                      {excelType.typeName}
                    </h3>
                    <code style={{
                      fontSize: '12px',
                      background: 'rgba(0,0,0,0.1)',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      color: getCategoryColor(excelType.category)
                    }}>
                      {excelType.typeCode}
                    </code>
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {excelType.isDefault && (
                      <span style={{
                        padding: '2px 8px',
                        background: '#fef3c7',
                        color: '#92400e',
                        borderRadius: '4px',
                        fontSize: '10px',
                        fontWeight: 600
                      }}>
                        DEFAULT
                      </span>
                    )}
                    {excelType.isGlobal && (
                      <span style={{
                        padding: '2px 8px',
                        background: '#e0e7ff',
                        color: '#4338ca',
                        borderRadius: '4px',
                        fontSize: '10px',
                        fontWeight: 600
                      }}>
                        GLOBAL
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Body */}
              <div style={{ padding: '16px' }}>
                {excelType.description && (
                  <p style={{
                    margin: '0 0 12px 0',
                    fontSize: '13px',
                    color: '#6b7280',
                    lineHeight: 1.4,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical'
                  }}>
                    {excelType.description}
                  </p>
                )}

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                  <span style={{
                    padding: '4px 10px',
                    background: getCategoryBgColor(excelType.category),
                    color: getCategoryColor(excelType.category),
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 500
                  }}>
                    {excelType.category === 'account' ? 'Account' : 'Manufacturing'}
                  </span>
                  {excelType.subCategory && (
                    <span style={{
                      padding: '4px 10px',
                      background: '#f3f4f6',
                      color: '#6b7280',
                      borderRadius: '6px',
                      fontSize: '11px'
                    }}>
                      {getSubCategoryLabel(excelType.subCategory)}
                    </span>
                  )}
                  <span style={{
                    padding: '4px 10px',
                    background: '#f3f4f6',
                    color: '#6b7280',
                    borderRadius: '6px',
                    fontSize: '11px'
                  }}>
                    {excelType.exportFormat.toUpperCase()}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#9ca3af' }}>
                  <span>
                    {excelType.sheets?.length || 0} sheet(s) |{' '}
                    {excelType.sheets?.reduce((acc, s) => acc + (s.columns?.length || 0), 0) || 0} columns
                  </span>
                  <span style={{
                    padding: '2px 8px',
                    background: excelType.isActive ? '#d1fae5' : '#fee2e2',
                    color: excelType.isActive ? '#059669' : '#dc2626',
                    borderRadius: '4px',
                    fontSize: '10px',
                    fontWeight: 500
                  }}>
                    {excelType.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div style={{
                padding: '12px 16px',
                background: '#f9fafb',
                borderTop: '1px solid #e5e7eb',
                display: 'flex',
                gap: '8px'
              }}>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleEdit(excelType); }}
                  style={{
                    flex: 1,
                    padding: '8px',
                    background: '#1e40af',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 500
                  }}
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteTarget(excelType);
                    setShowDeleteConfirm(true);
                  }}
                  style={{
                    padding: '8px 12px',
                    background: '#fee2e2',
                    color: '#dc2626',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 500
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
    </div>
  );
};

export default ExcelTypeList;
