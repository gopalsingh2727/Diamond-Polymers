import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { getMachineOrders, getOrderTableData, setSelectedOrder, clearOrderTableData } from "../../../redux/operatorView/operatorViewActions";
import { AppDispatch } from "../../../../store";
import { RootState } from "../../../redux/rootReducer";
import OrderCard from "./OrderCard";
import DataTable from "./DataTable";
import OrderDetailSection from "./OrderDetailSection";
import "./operatorView.css";

interface MachineOperatorViewProps {
  machineIdProp?: string;  // Can receive machineId from parent (Dashboard) or URL
}

const MachineOperatorView: React.FC<MachineOperatorViewProps> = ({ machineIdProp }) => {
  const { machineId: machineIdFromUrl } = useParams<{ machineId: string }>();
  const machineId = machineIdProp || machineIdFromUrl;

  const dispatch = useDispatch<AppDispatch>();

  const { orders, selectedOrder, tableData, templates, loading, error } = useSelector((state: RootState) => state.operatorView);
  const machines = useSelector((state: any) => state.machineList?.machines || []);

  const [selectedOrderTypeId, setSelectedOrderTypeId] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("in-progress");
  const [viewMode, setViewMode] = useState<'operator' | 'table'>('operator');

  const currentMachine = machines.find((m: any) => m._id === machineId);

  // Fetch orders when filter changes or on mount
  useEffect(() => {
    if (machineId) {
      dispatch(getMachineOrders(machineId, {
        status: statusFilter,
        orderTypeId: selectedOrderTypeId || undefined
      }));
    }
  }, [dispatch, machineId, statusFilter, selectedOrderTypeId]);

  // Load table data when order is selected
  useEffect(() => {
    if (machineId && selectedOrder) {
      dispatch(getOrderTableData(machineId, selectedOrder._id));
    } else {
      dispatch(clearOrderTableData());
    }
  }, [dispatch, machineId, selectedOrder]);

  const handleOrderSelect = (order: any) => {
    dispatch(setSelectedOrder(order));
  };

  const handleBackToList = () => {
    dispatch(setSelectedOrder(null));
    dispatch(clearOrderTableData());
    setViewMode('operator');  // Reset view mode when going back
  };

  // Get template from tableData (loaded from backend)
  const currentTemplate = tableData?.template;

  if (error) {
    return (
      <div className="operatorViewContainer">
        <div className="operatorViewError">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="operatorViewContainer">
      {/* Header */}
      <div className="operatorViewHeader">
        <div className="operatorViewHeaderLeft">
          {selectedOrder && (
            <button className="operatorViewBackBtn" onClick={handleBackToList}>
              &#8592; Back
            </button>
          )}
          <h2 className="operatorViewTitle">
            {currentMachine?.machineName || "Machine"} - Operator View
          </h2>
        </div>

        {!selectedOrder && (
          <div className="operatorViewFilters">
            <select
              value={selectedOrderTypeId}
              onChange={(e) => setSelectedOrderTypeId(e.target.value)}
              className="operatorViewSelect"
            >
              <option value="">All Order Types</option>
              {templates.map((template: any) => (
                <option key={template._id} value={template.orderTypeId}>
                  {template.orderTypeName || template.templateName}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="operatorViewSelect"
            >
              <option value="in-progress">In Progress</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="">All</option>
            </select>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="operatorViewContent">
        {loading && !selectedOrder ? (
          <div className="operatorViewLoading">Loading orders...</div>
        ) : selectedOrder ? (
          // Order Detail View with Data Table
          <div className="operatorViewDetail">
            {/* Customer Info Card */}
            <OrderCard
              order={selectedOrder}
              template={currentTemplate}
              isSelected={true}
              showCustomerInfo={true}
            />

            {/* Options & Previous Machines Data */}
            {tableData && (
              <OrderDetailSection
                tableData={tableData}
                order={selectedOrder}
                template={currentTemplate}
              />
            )}

            {/* View Mode Tabs */}
            {currentTemplate && (
              <div className="viewModeTabs">
                <button
                  className={viewMode === 'operator' ? 'active' : ''}
                  onClick={() => setViewMode('operator')}
                >
                  Operator View
                </button>
                <button
                  className={viewMode === 'table' ? 'active' : ''}
                  onClick={() => setViewMode('table')}
                >
                  Order Table View
                </button>
              </div>
            )}

            {/* Data Entry Table */}
            {currentTemplate ? (
              <DataTable
                machineId={machineId!}
                orderId={selectedOrder._id}
                template={currentTemplate}
                tableData={tableData}
                order={selectedOrder}
                editable={viewMode === 'operator'}
              />
            ) : loading ? (
              <div className="operatorViewLoading">Loading template...</div>
            ) : (
              <div className="operatorViewNoTemplate">
                <p>No template configured for this order type.</p>
                <p>Please create a template in Machine Template settings.</p>
              </div>
            )}
          </div>
        ) : (
          // Orders List View
          <div className="operatorViewOrders">
            {orders.length === 0 ? (
              <div className="operatorViewEmpty">
                <p>No orders found for this machine.</p>
              </div>
            ) : (
              <div className="operatorViewOrdersGrid">
                {orders.map((order: any) => (
                  <OrderCard
                    key={order._id}
                    order={order}
                    onClick={() => handleOrderSelect(order)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MachineOperatorView;
