import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../componest/redux/rootReducer';
import { AppDispatch } from '../../../store';
import {
  getReportGroups,
  createReportGroup,
  deleteReportGroup,
  getReportGroupStats,
  selectReportGroup } from
'../../../componest/redux/reportGroups/reportGroupActions';

interface GroupsTabProps {
  dateRange: {
    fromDate: string;
    toDate: string;
  };
}

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  optionTypes: any[];
}

const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  optionTypes
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#3b82f6');
  const [selectedItems, setSelectedItems] = useState<any[]>([]);

  const handleAddOptionType = (optionType: any) => {
    if (!selectedItems.find((item) => item.optionTypeId === optionType._id)) {
      setSelectedItems([
      ...selectedItems,
      {
        optionTypeId: optionType._id,
        optionTypeName: optionType.name,
        options: []
      }]
      );
    }
  };

  const handleRemoveOptionType = (optionTypeId: string) => {
    setSelectedItems(selectedItems.filter((item) => item.optionTypeId !== optionTypeId));
  };

  const handleToggleOption = (optionTypeId: string, option: any) => {
    setSelectedItems(
      selectedItems.map((item) => {
        if (item.optionTypeId === optionTypeId) {
          const hasOption = item.options.find((o: any) => o.optionId === option._id);
          if (hasOption) {
            return {
              ...item,
              options: item.options.filter((o: any) => o.optionId !== option._id)
            };
          } else {
            return {
              ...item,
              options: [...item.options, { optionId: option._id, optionName: option.name }]
            };
          }
        }
        return item;
      })
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSubmit({
      name,
      description,
      color,
      selectedItems
    });

    // Reset form
    setName('');
    setDescription('');
    setColor('#3b82f6');
    setSelectedItems([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '600px' }}>
        <div className="modal-header">
          <h2>Create Report Group</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Group Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Premium Group, KX Group"
              required />

          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe this report group..."
              rows={3} />

          </div>

          <div className="form-group">
            <label>Color</label>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              style={{ width: '60px', height: '36px' }} />

          </div>

          <div className="form-group">
            <label>Select Option Types</label>
            <div className="option-type-selector">
              {optionTypes.map((ot: any) =>
              <div key={ot._id} className="option-type-item">
                  <div className="option-type-header">
                    <label className="checkbox-label">
                      <input
                      type="checkbox"
                      checked={selectedItems.some((item) => item.optionTypeId === ot._id)}
                      onChange={() => {
                        if (selectedItems.some((item) => item.optionTypeId === ot._id)) {
                          handleRemoveOptionType(ot._id);
                        } else {
                          handleAddOptionType(ot);
                        }
                      }} />

                      <span>{ot.name}</span>
                    </label>
                  </div>
                  {selectedItems.some((item) => item.optionTypeId === ot._id) && ot.options &&
                <div className="option-list">
                      {ot.options.map((opt: any) =>
                  <label key={opt._id} className="checkbox-label option-item">
                          <input
                      type="checkbox"
                      checked={selectedItems.
                      find((item) => item.optionTypeId === ot._id)?.
                      options.some((o: any) => o.optionId === opt._id)}
                      onChange={() => handleToggleOption(ot._id, opt)} />

                          <span>{opt.name}</span>
                        </label>
                  )}
                    </div>
                }
                </div>
              )}
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Create Group
            </button>
          </div>
        </form>
      </div>
    </div>);

};

const GroupsTab: React.FC<GroupsTabProps> = ({ dateRange }) => {
  const dispatch = useDispatch<AppDispatch>();
  const branchId = localStorage.getItem('selectedBranch') || localStorage.getItem('branchId') || localStorage.getItem('selectedBranchId') || '';

  const { groups, selectedGroup, groupStats, loading, statsLoading } = useSelector(
    (state: RootState) => state.reportGroups
  );

  const optionTypes = useSelector((state: RootState) =>
  (state.dataCache as any)?.optionTypes?.data || []
  );

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    if (branchId) {
      dispatch(getReportGroups({ branchId }));
    }
  }, [dispatch, branchId]);

  useEffect(() => {
    if (selectedGroup?._id) {
      dispatch(getReportGroupStats(selectedGroup._id, dateRange));
    }
  }, [dispatch, selectedGroup, dateRange.fromDate, dateRange.toDate]);

  const handleCreateGroup = async (data: any) => {
    try {
      await dispatch(createReportGroup({
        ...data,
        branchId,
        createdBy: localStorage.getItem('userId') || ''
      }));
      dispatch(getReportGroups({ branchId }));
    } catch (error) {

    }
  };

  const handleDeleteGroup = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this group?')) {
      try {
        await dispatch(deleteReportGroup(id));
        dispatch(getReportGroups({ branchId }));
        if (selectedGroup?._id === id) {
          dispatch(selectReportGroup(null));
        }
      } catch (error) {

      }
    }
  };

  const handleSelectGroup = (group: any) => {
    dispatch(selectReportGroup(group));
  };

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      'completed': '#22c55e',
      'pending': '#eab308',
      'inProgress': '#3b82f6',
      'issues': '#ef4444'
    };
    return colors[status] || '#94a3b8';
  };

  return (
    <div className="groups-tab">
      <div className="groups-header">
        <h2>Report Groups</h2>
        <button
          className="btn-primary"
          onClick={() => setIsCreateModalOpen(true)}>

          + Create Group
        </button>
      </div>

      <div className="groups-container">
        {/* Groups List */}
        <div className="groups-list">
          {loading && groups.length === 0 ?
          <div className="loading">Loading groups...</div> :
          groups.length === 0 ?
          <div className="report-empty">
              No report groups created yet. Create your first group to get started.
            </div> :

          groups.map((group: any) =>
          <div
            key={group._id}
            className={`group-card ${selectedGroup?._id === group._id ? 'group-card--selected' : ''}`}
            onClick={() => handleSelectGroup(group)}>

                <div
              className="group-card__color-bar"
              style={{ backgroundColor: group.color || '#3b82f6' }} />

                <div className="group-card__content">
                  <h3 className="group-card__name">{group.name}</h3>
                  {group.description &&
              <p className="group-card__description">{group.description}</p>
              }
                  <div className="group-card__meta">
                    <span>{group.selectedItems?.length || 0} option types</span>
                    <span>
                      {group.selectedItems?.reduce(
                    (acc: number, item: any) => acc + (item.options?.length || 0),
                    0
                  )}{' '}
                      options
                    </span>
                  </div>
                </div>
                <button
              className="group-card__delete"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteGroup(group._id);
              }}>

                  &times;
                </button>
              </div>
          )
          }
        </div>

        {/* Group Stats */}
        {selectedGroup &&
        <div className="group-stats">
            <div className="group-stats__header">
              <h3>{selectedGroup.name} Statistics</h3>
            </div>

            {statsLoading ?
          <div className="loading">Loading statistics...</div> :
          groupStats ?
          <>
                {/* Summary Cards */}
                <div className="report-summary-cards">
                  <div className="report-summary-card">
                    <div className="report-summary-card__value">
                      {groupStats.summary?.totalOrders || 0}
                    </div>
                    <div className="report-summary-card__label">Total Orders</div>
                  </div>
                  <div className="report-summary-card report-summary-card--completed">
                    <div className="report-summary-card__value">
                      {groupStats.summary?.completed || 0}
                    </div>
                    <div className="report-summary-card__label">Completed</div>
                  </div>
                  <div className="report-summary-card report-summary-card--pending">
                    <div className="report-summary-card__value">
                      {groupStats.summary?.pending || 0}
                    </div>
                    <div className="report-summary-card__label">Pending</div>
                  </div>
                  <div className="report-summary-card report-summary-card--issues">
                    <div className="report-summary-card__value">
                      {groupStats.summary?.issues || 0}
                    </div>
                    <div className="report-summary-card__label">Issues</div>
                  </div>
                </div>

                {/* By Option Type */}
                {groupStats.byOptionType && groupStats.byOptionType.length > 0 &&
            <div className="report-table-container">
                    <h4>By Option Type</h4>
                    <table className="report-table">
                      <thead>
                        <tr>
                          <th>Option Type</th>
                          <th>Orders</th>
                          <th>Quantity</th>
                        </tr>
                      </thead>
                      <tbody>
                        {groupStats.byOptionType.map((item: any, index: number) =>
                  <tr key={index}>
                            <td>{item.optionTypeName}</td>
                            <td>{item.orderCount}</td>
                            <td>{item.totalQuantity}</td>
                          </tr>
                  )}
                      </tbody>
                    </table>
                  </div>
            }

                {/* By Option */}
                {groupStats.byOption && groupStats.byOption.length > 0 &&
            <div className="report-table-container">
                    <h4>By Option</h4>
                    <table className="report-table">
                      <thead>
                        <tr>
                          <th>Option</th>
                          <th>Type</th>
                          <th>Orders</th>
                          <th>Quantity</th>
                        </tr>
                      </thead>
                      <tbody>
                        {groupStats.byOption.map((item: any, index: number) =>
                  <tr key={index}>
                            <td>{item.optionName}</td>
                            <td>{item.optionTypeName}</td>
                            <td>{item.orderCount}</td>
                            <td>{item.totalQuantity}</td>
                          </tr>
                  )}
                      </tbody>
                    </table>
                  </div>
            }

                {/* Formulas */}
                {groupStats.formulas &&
            <div className="formulas-section">
                    <h4>Calculations</h4>
                    <div className="formulas-grid">
                      <div className="formula-card">
                        <div className="formula-card__label">SUM</div>
                        <div className="formula-card__value">{groupStats.formulas.sum}</div>
                      </div>
                      <div className="formula-card">
                        <div className="formula-card__label">AVERAGE</div>
                        <div className="formula-card__value">
                          {groupStats.formulas.average?.toFixed(2)}
                        </div>
                      </div>
                      <div className="formula-card">
                        <div className="formula-card__label">COUNT</div>
                        <div className="formula-card__value">{groupStats.formulas.count}</div>
                      </div>
                      <div className="formula-card">
                        <div className="formula-card__label">MIN</div>
                        <div className="formula-card__value">{groupStats.formulas.min}</div>
                      </div>
                      <div className="formula-card">
                        <div className="formula-card__label">MAX</div>
                        <div className="formula-card__value">{groupStats.formulas.max}</div>
                      </div>
                      <div className="formula-card">
                        <div className="formula-card__label">SQRT</div>
                        <div className="formula-card__value">
                          {groupStats.formulas.sqrt?.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
            }
              </> :

          <div className="report-empty">Select a group to view statistics</div>
          }
          </div>
        }
      </div>

      <CreateGroupModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateGroup}
        optionTypes={optionTypes} />

    </div>);

};

export default GroupsTab;