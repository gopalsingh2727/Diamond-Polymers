import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getPrintTypes } from '../../../../redux/create/printType/printTypeActions';
import { AppDispatch } from '../../../../../store';
import CreatePrintType from '../../create/printType/CreatePrintType';
import '../EditMachineType/EditMachineyType.css';

interface PrintType {
  _id: string;
  typeName: string;
  typeCode: string;
  description?: string;
  paperSize?: string;
  orientation?: string;
  isActive?: boolean;
  branchId?: { _id: string; name: string };
}

const EditPrintTypeList = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { printTypes, loading, error } = useSelector((state: any) => state.printTypeList);
  const [selectedPrintType, setSelectedPrintType] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRow, setSelectedRow] = useState(0);

  useEffect(() => {
    dispatch(getPrintTypes());
  }, [dispatch]);

  const handleEdit = (printType: any) => {
    setSelectedPrintType(printType);
  };

  const handleBackToList = () => {
    setSelectedPrintType(null);
    dispatch(getPrintTypes());
  };

  const filteredItems = printTypes?.filter((pt: PrintType) =>
    pt.typeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pt.typeCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pt.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

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

  useEffect(() => { setSelectedRow(0); }, [searchTerm]);

  // If editing a print type, show the edit form
  if (selectedPrintType) {
    return (
      <CreatePrintType
        initialData={selectedPrintType}
        onCancel={handleBackToList}
        onSaveSuccess={handleBackToList}
      />
    );
  }

  if (loading) return <p className="loadingAndError">Loading...</p>;
  if (error) return <p className="loadingAndError" style={{ color: "red" }}>{error}</p>;

  return (
    <div className="EditMachineType">
      <div className="editsectionsTable-container">
        <div className="editsectionsTable-searchWrapper">
          <div className="editsectionsTable-searchBox">
            <input
              type="text"
              placeholder="Search print types..."
              className="editsectionsTable-searchInput"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="editsectionsTable-searchIcon">🔍</span>
            {searchTerm && <button onClick={() => setSearchTerm("")} className="editsectionsTable-clearButton">✕</button>}
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
                  <th className="editsectionsTable-th">Paper Size</th>
                  <th className="editsectionsTable-th">Orientation</th>
                  <th className="editsectionsTable-th">Branch</th>
                  <th className="editsectionsTable-th">Status</th>
                </tr>
              </thead>
              <tbody className="editsectionsTable-tbody">
                {filteredItems.map((item: PrintType, index: number) => (
                  <tr
                    key={item._id}
                    className={`editsectionsTable-tr ${selectedRow === index ? "editsectionsTable-trSelected" : ""}`}
                    onClick={() => { setSelectedRow(index); handleEdit(item); }}
                  >
                    <td className="editsectionsTable-td">{index + 1}</td>
                    <td className="editsectionsTable-td">{item.typeName}</td>
                    <td className="editsectionsTable-td">{item.typeCode || "N/A"}</td>
                    <td className="editsectionsTable-td">{item.paperSize || "N/A"}</td>
                    <td className="editsectionsTable-td">{item.orientation || "N/A"}</td>
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
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="editsectionsTable-empty">No print types found</div>
        )}
      </div>
    </div>
  );
};

export default EditPrintTypeList;
