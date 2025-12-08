import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getExcelExportTypes } from '../../../../redux/create/excelExportType/excelExportTypeActions';
import { AppDispatch } from '../../../../../store';
import CreateExcelExportType from '../../create/excelExportType/CreateExcelExportType';

const EditExcelExportTypeList = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { excelExportTypes, loading, error } = useSelector((state: any) => state.excelExportTypeList);
  const [selectedExportType, setSelectedExportType] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(getExcelExportTypes());
  }, [dispatch]);

  const handleEdit = (exportType: any) => {
    setSelectedExportType(exportType);
  };

  const handleBackToList = () => {
    setSelectedExportType(null);
    dispatch(getExcelExportTypes());
  };

  const filteredExportTypes = excelExportTypes?.filter((et: any) =>
    et.typeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    et.typeCode?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // If editing an export type, show the edit form
  if (selectedExportType) {
    return (
      <CreateExcelExportType
        initialData={selectedExportType}
        onCancel={handleBackToList}
        onSaveSuccess={handleBackToList}
      />
    );
  }

  return (
    <div className="p-4">
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-2">Excel Export Types</h2>
        <p className="text-gray-600 text-sm">Manage your excel export type configurations</p>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search excel export types..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border rounded-lg"
        />
      </div>

      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">
          {error}
        </div>
      )}

      {!loading && filteredExportTypes.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No excel export types found. Create one to get started.
        </div>
      )}

      <div className="grid gap-4">
        {filteredExportTypes.map((exportType: any) => {
          const selectedColumns = exportType.columns?.filter((c: any) => c.selected)?.length || 0;

          return (
            <div
              key={exportType._id}
              className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleEdit(exportType)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-lg">{exportType.typeName}</h3>
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                      {exportType.typeCode}
                    </span>
                    {exportType.isDefault && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded">
                        Default
                      </span>
                    )}
                    {exportType.isGlobal && (
                      <span className="px-2 py-0.5 bg-purple-100 text-purple-600 text-xs rounded">
                        Global
                      </span>
                    )}
                  </div>
                  {exportType.description && (
                    <p className="text-gray-600 text-sm mb-2">{exportType.description}</p>
                  )}
                  <div className="flex gap-4 text-sm text-gray-500">
                    <span>{selectedColumns} columns selected</span>
                    <span>Sheet: {exportType.sheetName || 'Orders'}</span>
                    <span>Prefix: {exportType.fileNamePrefix || 'Export'}</span>
                    {exportType.linkedOrderTypes?.length > 0 && (
                      <span>{exportType.linkedOrderTypes.length} linked order type(s)</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    exportType.isActive
                      ? 'bg-green-100 text-green-600'
                      : 'bg-red-100 text-red-600'
                  }`}>
                    {exportType.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(exportType);
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EditExcelExportTypeList;
