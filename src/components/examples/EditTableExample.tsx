import React, { useState } from 'react';
import { EditTable, EditTableColumn } from '../shared/EditTable';
import { useOrderFormData } from '../../hooks/useOrderFormData';
import { machineAPI } from '../../utils/crudHelpers';
import { BackButton } from '../../componest/allCompones/BackButton';

interface Machine {
  _id: string;
  machineName: string;
  sizeX: string;
  sizeY: string;
  sizeZ: string;
  machineType: {
    _id: string;
    type: string;
  };
  branchId: {
    _id: string;
    name: string;
  };
}

/**
 * Example: Using EditTable for Machine Management
 * This shows how to use the unified EditTable component in an edit section
 */
export const EditTableExample: React.FC = () => {
  const { machines, isLoading } = useOrderFormData();
  const [editingMachine, setEditingMachine] = useState<Machine | null>(null);

  // Define table columns
  const columns: EditTableColumn<Machine>[] = [
    {
      key: 'machineName',
      header: 'Machine Name',
      sortable: true,
      render: (value, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <strong>{value}</strong>
          <span
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '0.25rem 0.5rem',
              borderRadius: '0.25rem',
              fontSize: '0.75rem'
            }}
          >
            {row.machineType.type}
          </span>
        </div>
      )
    },
    {
      key: 'branchId',
      header: 'Branch',
      sortable: true,
      render: (value) => value.name
    },
    {
      key: 'sizeX',
      header: 'Size X',
      align: 'center',
      render: (value) => <span style={{ fontFamily: 'monospace' }}>{value}</span>
    },
    {
      key: 'sizeY',
      header: 'Size Y',
      align: 'center',
      render: (value) => <span style={{ fontFamily: 'monospace' }}>{value}</span>
    },
    {
      key: 'sizeZ',
      header: 'Size Z',
      align: 'center',
      render: (value) => <span style={{ fontFamily: 'monospace' }}>{value}</span>
    }
  ];

  // Handle edit
  const handleEdit = (machine: Machine) => {
    setEditingMachine(machine);
    console.log('Editing machine:', machine);
  };

  // Handle delete
  const handleDelete = async (machine: Machine) => {
    await machineAPI.delete(machine._id);
    // Data will auto-refresh via cache invalidation
  };

  // Handle view
  const handleView = (machine: Machine) => {
    console.log('Viewing machine:', machine);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <BackButton/>
      <EditTable
        // Data
        data={machines}
        columns={columns}
        keyField="_id"

        // Header
        title="Machine Management"
        description="View and manage all machines in the system"

        // Search & Filter
        searchable
        searchPlaceholder="Search machines..."
        searchFields={['machineName', 'machineType.type', 'branchId.name']}

        // Actions
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}

        // Pagination
        paginated
        pageSize={10}

        // Styling
        striped
        stickyHeader

        // Loading
        loading={isLoading}
        emptyMessage="No machines found. Create a new machine to get started."
      />

      {/* Edit Form Modal (example) */}
      {editingMachine && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={() => setEditingMachine(null)}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '0.5rem',
              maxWidth: '600px',
              width: '90%'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Edit Machine: {editingMachine.machineName}</h2>
            <p>Machine ID: {editingMachine._id}</p>
            <button
              onClick={() => setEditingMachine(null)}
              style={{
                marginTop: '1rem',
                padding: '0.5rem 1rem',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditTableExample;
