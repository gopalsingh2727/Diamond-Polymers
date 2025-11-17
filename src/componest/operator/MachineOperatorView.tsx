import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/rootReducer';
import { AppDispatch } from '../../store';
import { Eye, Package, Layers, Calculator, AlertCircle, CheckCircle } from 'lucide-react';
import {
  buildDimensionContext,
  evaluateAllCalculations,
  getDimensionInfo,
  formatDimensionValue,
  ProductSpec,
  MaterialSpec,
  MachineCalculation
} from '../../utils/dimensionContextBuilder';
import './MachineOperatorView.css';

interface MachineOperatorViewProps {
  machineId: string;
  orderId: string;
}

interface Machine {
  _id: string;
  machineName: string;
  operatorView?: {
    productDimensions: string[];
    materialDimensions: string[];
    calculations: MachineCalculation[];
  };
}

interface Order {
  _id: string;
  orderNumber: string;
  productSpecId?: string;
  materialSpecId?: string;
}

const MachineOperatorView: React.FC<MachineOperatorViewProps> = ({ machineId, orderId }) => {
  const dispatch = useDispatch<AppDispatch>();

  const [machine, setMachine] = useState<Machine | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [productSpec, setProductSpec] = useState<ProductSpec | null>(null);
  const [materialSpec, setMaterialSpec] = useState<MaterialSpec | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch machine, order, and specs
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // TODO: Replace with actual Redux actions
        // For now, using placeholder data structure

        // Fetch machine
        // const machineData = await dispatch(getMachineById(machineId));
        // setMachine(machineData);

        // Fetch order
        // const orderData = await dispatch(getOrderById(orderId));
        // setOrder(orderData);

        // Fetch product spec if order has one
        // if (orderData.productSpecId) {
        //   const productSpecData = await dispatch(getProductSpecById(orderData.productSpecId));
        //   setProductSpec(productSpecData);
        // }

        // Fetch material spec if order has one
        // if (orderData.materialSpecId) {
        //   const materialSpecData = await dispatch(getMaterialSpecById(orderData.materialSpecId));
        //   setMaterialSpec(materialSpecData);
        // }

        setLoading(false);
      } catch (err: any) {
        setError(err.message || 'Failed to load operator view data');
        setLoading(false);
      }
    };

    fetchData();
  }, [machineId, orderId, dispatch]);

  if (loading) {
    return (
      <div className="machine-operator-view-loading">
        <div className="loading-spinner"></div>
        <p>Loading operator view...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="machine-operator-view-error">
        <AlertCircle size={48} color="#ef4444" />
        <h3>Error Loading View</h3>
        <p>{error}</p>
      </div>
    );
  }

  if (!machine || !machine.operatorView) {
    return (
      <div className="machine-operator-view-error">
        <AlertCircle size={48} color="#f59e0b" />
        <h3>No Operator View Configured</h3>
        <p>This machine does not have an operator view configuration.</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="machine-operator-view-error">
        <AlertCircle size={48} color="#f59e0b" />
        <h3>Order Not Found</h3>
        <p>Could not load order information.</p>
      </div>
    );
  }

  // Build dimension context
  const dimensionContext = buildDimensionContext(
    productSpec,
    materialSpec,
    machine.operatorView.productDimensions,
    machine.operatorView.materialDimensions
  );

  // Evaluate calculations
  const calculationResults = evaluateAllCalculations(
    machine.operatorView.calculations,
    dimensionContext
  );

  return (
    <div className="machine-operator-view">
      {/* Header */}
      <div className="operator-view-header">
        <div className="operator-view-title">
          <Eye size={28} />
          <div>
            <h2>{machine.machineName}</h2>
            <p>Order: {order.orderNumber}</p>
          </div>
        </div>
        <div className="operator-view-status">
          <CheckCircle size={20} color="#10b981" />
          <span>View Active</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="operator-view-content">
        {/* Product Spec Dimensions */}
        {machine.operatorView.productDimensions.length > 0 && (
          <div className="operator-view-section product-dimensions">
            <div className="section-header">
              <Package size={20} />
              <h3>Product Specifications</h3>
            </div>
            {productSpec ? (
              <div className="dimension-grid">
                {machine.operatorView.productDimensions.map(dimName => {
                  const dimInfo = getDimensionInfo(dimName, productSpec, null);
                  return (
                    <div key={dimName} className="dimension-item">
                      <div className="dimension-label">{dimName}</div>
                      <div className="dimension-value">
                        {formatDimensionValue(dimInfo.value, dimInfo.unit)}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="no-data-message">
                <AlertCircle size={16} />
                <span>No product specification assigned to this order</span>
              </div>
            )}
            {productSpec && (
              <div className="spec-name-label">Spec: {productSpec.specName}</div>
            )}
          </div>
        )}

        {/* Material Spec Dimensions */}
        {machine.operatorView.materialDimensions.length > 0 && (
          <div className="operator-view-section material-dimensions">
            <div className="section-header">
              <Layers size={20} />
              <h3>Material Specifications</h3>
            </div>
            {materialSpec ? (
              <div className="dimension-grid">
                {machine.operatorView.materialDimensions.map(dimName => {
                  const dimInfo = getDimensionInfo(dimName, null, materialSpec);
                  return (
                    <div key={dimName} className="dimension-item">
                      <div className="dimension-label">{dimName}</div>
                      <div className="dimension-value">
                        {formatDimensionValue(dimInfo.value, dimInfo.unit)}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="no-data-message">
                <AlertCircle size={16} />
                <span>No material specification assigned to this order</span>
              </div>
            )}
            {materialSpec && (
              <div className="spec-name-label">Spec: {materialSpec.specName}</div>
            )}
          </div>
        )}

        {/* Machine Calculations */}
        {machine.operatorView.calculations.length > 0 && (
          <div className="operator-view-section machine-calculations">
            <div className="section-header">
              <Calculator size={20} />
              <h3>Machine Calculations</h3>
            </div>
            <div className="calculation-grid">
              {machine.operatorView.calculations.map(calc => {
                const result = calculationResults[calc.name];
                return (
                  <div key={calc.name} className="calculation-item">
                    <div className="calculation-header">
                      <div className="calculation-name">{result.displayName}</div>
                      {calc.description && (
                        <div className="calculation-description">{calc.description}</div>
                      )}
                    </div>
                    <div className="calculation-value">
                      {result.error ? (
                        <div className="calculation-error">
                          <AlertCircle size={16} />
                          <span>{result.error}</span>
                        </div>
                      ) : (
                        formatDimensionValue(result.value, result.unit)
                      )}
                    </div>
                    <div className="calculation-formula">
                      Formula: {calc.formula}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {machine.operatorView.productDimensions.length === 0 &&
          machine.operatorView.materialDimensions.length === 0 &&
          machine.operatorView.calculations.length === 0 && (
          <div className="operator-view-empty">
            <Eye size={64} color="#9ca3af" />
            <h3>No Dimensions Configured</h3>
            <p>This machine's operator view has no dimensions or calculations configured.</p>
            <p>Contact your administrator to set up the operator view.</p>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="operator-view-footer">
        <div className="footer-info">
          <strong>Available Context:</strong>{' '}
          {Object.keys(dimensionContext).length} dimensions from specs
        </div>
        <div className="footer-info">
          <strong>Calculations:</strong>{' '}
          {machine.operatorView.calculations.length} formulas active
        </div>
      </div>
    </div>
  );
};

export default MachineOperatorView;
