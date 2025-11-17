import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../redux/rootReducer';
import { AppDispatch } from '../../../../../store';
import MachineOperatorView from '../../../../operator/MachineOperatorView';
import { Eye, Settings } from 'lucide-react';
import './viewMachineOperatorDemo.css';

/**
 * Demo/Test Component for MachineOperatorView
 * Allows selecting a machine and order to preview the operator view
 */
const ViewMachineOperatorDemo: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const [selectedMachineId, setSelectedMachineId] = useState<string>('');
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const [showView, setShowView] = useState(false);

  // TODO: Replace with actual Redux selectors
  // const { machines } = useSelector((state: RootState) => state.machineList);
  // const { orders } = useSelector((state: RootState) => state.orderList);

  // Mock data for testing - replace with actual Redux data
  const machines = [
    { _id: '1', machineName: 'Extruder-01' },
    { _id: '2', machineName: 'Injection Mold-02' },
    { _id: '3', machineName: 'Press-03' },
  ];

  const orders = [
    { _id: '1', orderNumber: 'ORD-2025-0001' },
    { _id: '2', orderNumber: 'ORD-2025-0002' },
    { _id: '3', orderNumber: 'ORD-2025-0003' },
  ];

  // Fetch machines and orders on mount
  useEffect(() => {
    // TODO: Dispatch actions to fetch machines and orders
    // dispatch(getMachines());
    // dispatch(getOrders());
  }, [dispatch]);

  const handlePreview = () => {
    if (selectedMachineId && selectedOrderId) {
      setShowView(true);
    }
  };

  const handleReset = () => {
    setShowView(false);
    setSelectedMachineId('');
    setSelectedOrderId('');
  };

  return (
    <div className="view-operator-demo-container">
      {!showView ? (
        // Selection Form
        <div className="demo-selection-form">
          <div className="demo-header">
            <Settings size={32} />
            <h2>Machine Operator View - Demo/Test</h2>
            <p>Select a machine and order to preview the operator view</p>
          </div>

          <div className="demo-form-content">
            <div className="demo-form-section">
              <h3>Step 1: Select Machine</h3>
              <p className="section-description">
                Choose a machine that has operator view configured
              </p>
              <select
                value={selectedMachineId}
                onChange={(e) => setSelectedMachineId(e.target.value)}
                className="demo-select"
              >
                <option value="">-- Select Machine --</option>
                {machines.map((machine) => (
                  <option key={machine._id} value={machine._id}>
                    {machine.machineName}
                  </option>
                ))}
              </select>
            </div>

            <div className="demo-form-section">
              <h3>Step 2: Select Order</h3>
              <p className="section-description">
                Choose an order with product and material specifications
              </p>
              <select
                value={selectedOrderId}
                onChange={(e) => setSelectedOrderId(e.target.value)}
                className="demo-select"
              >
                <option value="">-- Select Order --</option>
                {orders.map((order) => (
                  <option key={order._id} value={order._id}>
                    {order.orderNumber}
                  </option>
                ))}
              </select>
            </div>

            <div className="demo-info-box">
              <h4>ℹ️ How to Use This Demo:</h4>
              <ol>
                <li>First, create a machine with operator view configuration in "Create Machine"</li>
                <li>Create product and material specifications with dimensions</li>
                <li>Create an order and assign the specs to it</li>
                <li>Select the machine and order here to preview the operator view</li>
              </ol>
            </div>

            <div className="demo-actions">
              <button
                onClick={handlePreview}
                disabled={!selectedMachineId || !selectedOrderId}
                className="demo-preview-button"
              >
                <Eye size={20} />
                Preview Operator View
              </button>
            </div>

            {(!selectedMachineId || !selectedOrderId) && (
              <div className="demo-warning">
                ⚠️ Please select both a machine and an order to preview
              </div>
            )}
          </div>
        </div>
      ) : (
        // Operator View Display
        <div className="demo-view-container">
          <div className="demo-view-header">
            <button onClick={handleReset} className="demo-back-button">
              ← Back to Selection
            </button>
            <div className="demo-view-info">
              <strong>Machine:</strong> {machines.find(m => m._id === selectedMachineId)?.machineName}
              {' | '}
              <strong>Order:</strong> {orders.find(o => o._id === selectedOrderId)?.orderNumber}
            </div>
          </div>

          <MachineOperatorView
            machineId={selectedMachineId}
            orderId={selectedOrderId}
          />

          <div className="demo-view-footer">
            <button onClick={handleReset} className="demo-reset-button">
              Select Different Machine/Order
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewMachineOperatorDemo;
