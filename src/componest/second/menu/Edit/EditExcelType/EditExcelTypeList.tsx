import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getExcelTypesV2 as getExcelTypes } from '../../../../redux/unifiedV2/excelTypeActions';
import { AppDispatch } from '../../../../../store';
import { CreateExcelType } from '../../create/excelType';
import '../EditMachineType/EditMachineyType.css';

interface ExcelType {
  _id: string;
  typeName: string;
  typeCode: string;
  description?: string;
  category?: 'account' | 'manufacturing';
  subCategory?: string;
  exportFormat?: string;
  isActive?: boolean;
  branchId?: { _id: string; name: string };
}

const EditExcelTypeList = () => {
  const dispatch = useDispatch<AppDispatch>();
  const excelTypeState = useSelector((state: any) => state.v2?.excelType);
  const excelTypes = excelTypeState?.list || [];
  const loading = excelTypeState?.loading || false;
  const error = excelTypeState?.error || null;
  const [selectedExcelType, setSelectedExcelType] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRow, setSelectedRow] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'account' | 'manufacturing'>('all');

  // Get selected branch to refetch when it changes
  const selectedBranch = useSelector((state: any) => state.auth?.userData?.selectedBranch);

  useEffect(() => {
    dispatch(getExcelTypes());
  }, [dispatch, selectedBranch]);

  const handleEdit = (excelType: any) => {
    setSelectedExcelType(excelType);
  };

  const handleBackToList = () => {
    setSelectedExcelType(null);
    dispatch(getExcelTypes());
  };

  const filteredItems = excelTypes?.filter((et: ExcelType) => {
    const matchesSearch =
      et.typeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      et.typeCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      et.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || et.category === categoryFilter;
    return matchesSearch && matchesCategory;
  }) || [];

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

  useEffect(() => { setSelectedRow(0); }, [searchTerm, categoryFilter]);

  // If editing an excel type, show the edit form
  if (selectedExcelType) {
    return (
      <CreateExcelType
        initialData={selectedExcelType}
        onCancel={handleBackToList}
        onSaveSuccess={handleBackToList}
      />
    );
  }

  if (loading) return <p className="loadingAndError">Loading...</p>;
  if (error) return <p className="loadingAndError" style={{ color: "red" }}>{error}</p>;

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'account': return { bg: '#dbeafe', color: '#1d4ed8' };
      case 'manufacturing': return { bg: '#fef3c7', color: '#d97706' };
      default: return { bg: '#f3f4f6', color: '#6b7280' };
    }
  };

  const formatSubCategory = (subCategory?: string) => {
    if (!subCategory) return 'N/A';
    return subCategory.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="EditMachineType">
      <div className="editsectionsTable-container">
        <div className="editsectionsTable-searchWrapper">
          <div className="editsectionsTable-searchBox">
            <input
              type="text"
              placeholder="Search excel types..."
              className="editsectionsTable-searchInput"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="editsectionsTable-searchIcon">&#128269;</span>
            {searchTerm && <button onClick={() => setSearchTerm("")} className="editsectionsTable-clearButton">&#10005;</button>}
          </div>

          {/* Category Filter */}
          <div style={{ display: 'flex', gap: '8px', marginLeft: '16px' }}>
            {(['all', 'account', 'manufacturing'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '4px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: categoryFilter === cat ? 'bold' : 'normal',
                  background: categoryFilter === cat ? '#3b82f6' : '#e5e7eb',
                  color: categoryFilter === cat ? '#fff' : '#374151'
                }}
              >
                {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>

          <div className="editsectionsTable-countBadge">{filteredItems.length} types</div>
        </div>

        {filteredItems.length > 0 ? (
          <div className="editsectionsTable-wrapper">
            <table className="editsectionsTable-table">
              <thead className="editsectionsTable-thead">
                <tr>
                  <th className="editsectionsTable-th">No</th>
                  <th className="editsectionsTable-th">Type Name</th>
                  <th className="editsectionsTable-th">Code</th>
                  <th className="editsectionsTable-th">Category</th>
                  <th className="editsectionsTable-th">Sub-Category</th>
                  <th className="editsectionsTable-th">Format</th>
                  <th className="editsectionsTable-th">Branch</th>
                  <th className="editsectionsTable-th">Status</th>
                </tr>
              </thead>
              <tbody className="editsectionsTable-tbody">
                {filteredItems.map((item: ExcelType, index: number) => {
                  const catColor = getCategoryColor(item.category);
                  return (
                    <tr
                      key={item._id}
                      className={`editsectionsTable-tr ${selectedRow === index ? "editsectionsTable-trSelected" : ""}`}
                      onClick={() => { setSelectedRow(index); handleEdit(item); }}
                    >
                      <td className="editsectionsTable-td">{index + 1}</td>
                      <td className="editsectionsTable-td">{item.typeName}</td>
                      <td className="editsectionsTable-td">{item.typeCode || "N/A"}</td>
                      <td className="editsectionsTable-td">
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          background: catColor.bg,
                          color: catColor.color
                        }}>
                          {item.category || 'N/A'}
                        </span>
                      </td>
                      <td className="editsectionsTable-td">{formatSubCategory(item.subCategory)}</td>
                      <td className="editsectionsTable-td">{item.exportFormat?.toUpperCase() || "XLSX"}</td>
                      <td className="editsectionsTable-td">{item.branchId?.name || "N/A"}</td>
                      <td className="editsectionsTable-td">
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          background: item.isActive ? '#dcfce7' : '#fee2e2',
                          color: item.isActive ? '#16a34a' : '#dc2626'
                        }}>
                          {item.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="editsectionsTable-empty">No excel types found</div>
        )}
      </div>
    </div>
  );
};

export default EditExcelTypeList;
