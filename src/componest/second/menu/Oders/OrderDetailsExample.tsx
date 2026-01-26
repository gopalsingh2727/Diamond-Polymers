/**
 * Example Component: How to use fetchOrderDetails Redux action
 *
 * This shows how to fetch complete order details when clicking on an order
 */

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrderDetails, clearOrderDetails } from '../../../redux/oders/OdersActions';
import { AppDispatch } from '../../../../store';
import { RootState } from '../../../redux/rootReducer';

interface OrderDetailsExampleProps {
  orderId: string; // Can be MongoDB _id or custom orderId like "MRK-2026-1860"
}

const OrderDetailsExample: React.FC<OrderDetailsExampleProps> = ({ orderId }) => {
  const dispatch = useDispatch<AppDispatch>();

  // Get order details from Redux store
  const orderDetails = useSelector((state: RootState) => state.orderForm?.currentOrder);
  const loading = useSelector((state: RootState) => state.orderForm?.loading);
  const error = useSelector((state: RootState) => state.orderForm?.error);

  // Fetch order details when component mounts or orderId changes
  useEffect(() => {
    if (orderId) {
      console.log('Fetching details for order:', orderId);
      dispatch(fetchOrderDetails(orderId));
    }

    // Cleanup: Clear order details when component unmounts
    return () => {
      dispatch(clearOrderDetails());
    };
  }, [dispatch, orderId]);

  // Handle loading state
  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Loading order details...</p>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <p>Error: {error}</p>
        <button onClick={() => dispatch(fetchOrderDetails(orderId))}>
          Retry
        </button>
      </div>
    );
  }

  // Handle no data state
  if (!orderDetails) {
    return (
      <div style={{ padding: '20px' }}>
        <p>No order details available</p>
      </div>
    );
  }

  // Render order details
  return (
    <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h2>Order Details</h2>

      {/* Basic Info */}
      <div style={{ marginBottom: '20px' }}>
        <h3>Basic Information</h3>
        <p><strong>Order ID:</strong> {orderDetails.orderId}</p>
        <p><strong>Customer:</strong> {orderDetails.customerId?.companyName || 'N/A'}</p>
        <p><strong>Status:</strong> {orderDetails.overallStatus}</p>
        <p><strong>Priority:</strong> {orderDetails.priority}</p>
        <p><strong>Created:</strong> {new Date(orderDetails.createdAt).toLocaleString()}</p>
      </div>

      {/* Customer Details */}
      {orderDetails.customerId && (
        <div style={{ marginBottom: '20px' }}>
          <h3>Customer Details</h3>
          <p><strong>Company:</strong> {orderDetails.customerId.companyName}</p>
          <p><strong>Phone:</strong> {orderDetails.customerId.phone1}</p>
          <p><strong>Email:</strong> {orderDetails.customerId.email}</p>
          <p><strong>Address:</strong> {orderDetails.customerId.address1}</p>
        </div>
      )}

      {/* Order Type */}
      {orderDetails.orderTypeId && (
        <div style={{ marginBottom: '20px' }}>
          <h3>Order Type</h3>
          <p><strong>Type:</strong> {orderDetails.orderTypeId.typeName}</p>
          <p><strong>Code:</strong> {orderDetails.orderTypeId.typeCode}</p>
        </div>
      )}

      {/* Steps & Machines */}
      {orderDetails.steps && orderDetails.steps.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h3>Production Steps ({orderDetails.steps.length})</h3>
          {orderDetails.steps.map((step: any, index: number) => (
            <div key={index} style={{
              marginLeft: '20px',
              marginBottom: '15px',
              padding: '10px',
              backgroundColor: '#f9f9f9',
              borderRadius: '4px'
            }}>
              <p><strong>Step {index + 1}:</strong> {step.stepName || step.stepId?.stepName || 'Unnamed Step'}</p>
              <p><strong>Status:</strong> {step.stepStatus || 'pending'}</p>

              {step.machines && step.machines.length > 0 && (
                <div style={{ marginTop: '10px' }}>
                  <p><strong>Machines ({step.machines.length}):</strong></p>
                  <ul>
                    {step.machines.map((machine: any, mIndex: number) => (
                      <li key={mIndex}>
                        {machine.machineName} - {machine.status}
                        {machine.operatorName && ` (Operator: ${machine.operatorName})`}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Options */}
      {orderDetails.options && orderDetails.options.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h3>Options ({orderDetails.options.length})</h3>
          {orderDetails.options.map((option: any, index: number) => (
            <div key={index} style={{ marginLeft: '20px', marginBottom: '10px' }}>
              <p><strong>{option.optionName || option.optionTypeName}:</strong></p>
              {option.specificationValues && (
                <ul>
                  {option.specificationValues.map((spec: any, sIndex: number) => (
                    <li key={sIndex}>
                      {spec.name}: {spec.value} {spec.unit}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Notes */}
      {orderDetails.Notes && (
        <div style={{ marginBottom: '20px' }}>
          <h3>Notes</h3>
          <p>{orderDetails.Notes}</p>
        </div>
      )}
    </div>
  );
};

export default OrderDetailsExample;


// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/*

Example 1: Use in onClick handler
--------------------------------

import { fetchOrderDetails } from '../../../redux/oders/OdersActions';
import { AppDispatch } from '../../../../store';

const YourComponent = () => {
  const dispatch = useDispatch<AppDispatch>();

  const handleOrderClick = (orderId: string) => {
    // Fetch order details
    dispatch(fetchOrderDetails(orderId)).then((orderData) => {
      if (orderData) {
        console.log('Order details:', orderData);
        // Do something with the data
        // For example: open a modal, navigate to details page, etc.
      }
    });
  };

  return (
    <button onClick={() => handleOrderClick('MRK-2026-1860')}>
      View Order Details
    </button>
  );
};


Example 2: Get data from Redux state
------------------------------------

import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/rootReducer';

const YourComponent = () => {
  // Get order details from Redux store
  const orderDetails = useSelector((state: RootState) => state.orderForm?.currentOrder);
  const loading = useSelector((state: RootState) => state.orderForm?.loading);
  const error = useSelector((state: RootState) => state.orderForm?.error);

  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {orderDetails && (
        <div>
          <h2>{orderDetails.orderId}</h2>
          <p>{orderDetails.customerId?.companyName}</p>
          <p>Status: {orderDetails.overallStatus}</p>
        </div>
      )}
    </div>
  );
};


Example 3: Modify IndexAllOders to show details on click
---------------------------------------------------------

import { fetchOrderDetails } from '../../../redux/oders/OdersActions';

const IndexAllOders = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const orderDetails = useSelector((state: RootState) => state.orderForm?.currentOrder);

  const handleOrderClick = (orderId: string) => {
    setSelectedOrderId(orderId);
    dispatch(fetchOrderDetails(orderId));
  };

  return (
    <div>
      {/* Orders Table */}
      <table>
        <tbody>
          {orders.map((order) => (
            <tr
              key={order._id}
              onClick={() => handleOrderClick(order._id)}
              style={{ cursor: 'pointer' }}
            >
              <td>{order.orderId}</td>
              <td>{order.customer?.companyName}</td>
              <td>{order.overallStatus}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Order Details Panel */}
      {selectedOrderId && orderDetails && (
        <div className="order-details-panel">
          <h2>Order Details: {orderDetails.orderId}</h2>
          <p>Customer: {orderDetails.customerId?.companyName}</p>
          <p>Status: {orderDetails.overallStatus}</p>
          <p>Created: {new Date(orderDetails.createdAt).toLocaleString()}</p>

          {/* Show all order details here */}
          <button onClick={() => setSelectedOrderId(null)}>Close</button>
        </div>
      )}
    </div>
  );
};


Example 4: Clear order details when done
----------------------------------------

import { clearOrderDetails } from '../../../redux/oders/OdersActions';

const YourComponent = () => {
  const dispatch = useDispatch();

  const handleClose = () => {
    // Clear order details from Redux store
    dispatch(clearOrderDetails());
  };

  return (
    <button onClick={handleClose}>Close Details</button>
  );
};

*/
