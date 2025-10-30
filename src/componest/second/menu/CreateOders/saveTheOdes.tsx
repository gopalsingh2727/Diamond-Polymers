import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  saveOrder,
  updateOrder,
  clearError,
  clearSuccessMessage
} from "../../../redux/oders/OdersActions";
import { RootState } from "../../../redux/rootReducer";

interface SaveOrdersProps {
  isEditMode?: boolean;
  orderId?: string;
  orderData?: any;
}

const SaveOrders: React.FC<SaveOrdersProps> = ({
  isEditMode = false,
  orderId,
  orderData
}) => {
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();
  
  // Local state management
  const [isLocalLoading, setIsLocalLoading] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successType, setSuccessType] = useState<'save' | 'update'>('save');
  const [localError, setLocalError] = useState<string | null>(null);
  const [savedOrderData, setSavedOrderData] = useState<any>(null);

  // Redux state - try multiple possible state paths
  const orderState = useSelector((state: RootState) => {
    // Try different possible paths in your Redux store
    return (
      (state as any).orders ||
      (state as any).orderCreate ||
      (state as any).createOrder ||
      (state as any).order ||
      {}
    );
  });

  const { loading: reduxLoading, error: reduxError, successMessage, order } = orderState;

  // Combined loading state
  const loading = isLocalLoading || reduxLoading;
  const error = localError || reduxError;

  // Main save handler
  const handleSaveOrder = async () => {
    console.log("🔵 Save button clicked");
    
    // Clear previous states
    if (reduxError) dispatch(clearError());
    setLocalError(null);
    setIsLocalLoading(true);

    try {
      let result;
      
      if (isEditMode && orderId) {
        console.log('🔄 Updating order:', orderId);
        setSuccessType('update');
        result = await dispatch(updateOrder(orderId, orderData || {}));
      } else {
        console.log('💾 Saving new order');
        setSuccessType('save');
        
        // Call saveOrder - it will collect data from DOM if orderData not provided
        result = await dispatch(saveOrder(orderData));
      }
      
      console.log('✅ Dispatch completed, result:', result);
      
      // Check multiple ways the result might indicate success
      const isSuccess = 
        result?.orderId || // Has order ID
        result?.data?.orderId || // Nested data
        result?._id || // Has MongoDB ID
        (result && !result.error); // No error property
      
      if (isSuccess) {
        console.log('✅ Order saved successfully!');
        setSavedOrderData(result);
        setShowSuccessPopup(true);
        setLocalError(null);
      } else if (result?.error || result?.message) {
        console.error('❌ Save failed:', result.error || result.message);
        setLocalError(result.error || result.message || 'Failed to save order');
      } else {
        console.log('⚠️ Unexpected result format:', result);
        // Still show success if we got here without errors
        setSavedOrderData(result);
        setShowSuccessPopup(true);
      }
      
    } catch (err: any) {
      console.error('❌ Error in handleSaveOrder:', err);
      const errorMsg = err.message || err.response?.data?.message || 'An unexpected error occurred';
      setLocalError(errorMsg);
    } finally {
      setIsLocalLoading(false);
    }
  };

  // Also watch for Redux success message
  useEffect(() => {
    if (successMessage) {
      console.log('✅ Redux success message received:', successMessage);
      setShowSuccessPopup(true);
      setLocalError(null);
    }
  }, [successMessage]);

  // Watch for Redux order state changes (alternative success detection)
  useEffect(() => {
    if (order && !error && !loading && isLocalLoading === false) {
      console.log('✅ Order detected in Redux state:', order);
      setSavedOrderData(order);
      // Don't auto-show popup here to avoid duplicates
    }
  }, [order, error, loading, isLocalLoading]);

  // Handle success popup close
  const handleCloseSuccess = () => {
    console.log('🔵 Closing success popup');
    setShowSuccessPopup(false);
    setSavedOrderData(null);
    
    if (successMessage) {
      dispatch(clearSuccessMessage());
    }
    
    // Navigate back to previous page or dashboard
    setTimeout(() => {
      // Try to go back in history, or fallback to dashboard/home
      if (window.history.length > 1) {
        navigate(-1); // Go back to previous page
      } else {
        navigate('/'); // Fallback to home/dashboard
      }
    }, 300);
  };

  // Handle print action
  const handlePrint = () => {
    console.log('🖨️ Printing order');
    window.print();
    // Keep popup open after printing, let user close it
  };

  // Handle view order details
  const handleViewOrder = () => {
    console.log('👁️ Viewing order:', savedOrderData);
    
    // Stay on current page and just close popup
    setShowSuccessPopup(false);
    setSavedOrderData(null);
    
    if (successMessage) {
      dispatch(clearSuccessMessage());
    }
    
    // Optionally scroll to top to see the saved order
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Auto-clear error after 7 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        if (reduxError) dispatch(clearError());
        setLocalError(null);
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [error, reduxError, dispatch]);

  return (
    <div className="CreateOrdersFooter">
      {/* Error Display */}
      {error && (
        <div style={errorStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '20px' }}>❌</span>
            <div style={{ flex: 1 }}>
              <strong>Error</strong>
              <p style={{ margin: '5px 0 0 0', fontSize: '14px' }}>{String(error)}</p>
            </div>
          </div>
          <button 
            onClick={() => {
              if (reduxError) dispatch(clearError());
              setLocalError(null);
            }}
            style={closeErrorButtonStyle}
            title="Close error"
          >
            ×
          </button>
        </div>
      )}

      {/* Save/Update Button */}
      <button
        className="CreateOrdersButton"
        onClick={handleSaveOrder}
        disabled={loading}
        style={{
          backgroundColor: loading 
            ? "#9ca3af" 
            : isEditMode 
              ? "#f59e0b" 
              : "#10b981",
          color: "white",
          padding: "12px 24px",
          border: "none",
          borderRadius: "8px",
          cursor: loading ? "not-allowed" : "pointer",
          fontSize: "16px",
          fontWeight: "600",
          opacity: loading ? 0.7 : 1,
          transition: "all 0.3s ease",
          boxShadow: loading ? "none" : "0 2px 4px rgba(0,0,0,0.1)"
        }}
      >
        {loading
          ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={spinnerSmallStyle}></span>
              {isEditMode ? "Updating..." : "Saving..."}
            </span>
          )
          : isEditMode
          ? "Update Order"
          : "Save Order"}
      </button>

      {/* Loading Popup */}
      {loading && (
        <div style={overlayStyle}>
          <div style={popupContentStyle}>
            <div style={spinnerStyle}></div>
            <h3 style={{ margin: '20px 0 10px', color: '#1f2937' }}>
              {isEditMode ? "Updating Order..." : "Saving Order..."}
            </h3>
            <p style={{ margin: 0, color: '#6b7280' }}>
              Please wait while we process your request
            </p>
          </div>
        </div>
      )}

      {/* Success Popup */}
      {showSuccessPopup && (
        <div style={overlayStyle}>
          <div style={successPopupStyle}>
            <div style={successIconStyle}>✓</div>
            <h2 style={successTitleStyle}>
              {successType === 'update' 
                ? 'Order Updated Successfully!' 
                : 'Order Saved Successfully!'}
            </h2>
            <p style={successMessageStyle}>
              {successType === 'update'
                ? 'Your order has been updated and saved to the system.'
                : 'Your order has been created and saved to the system.'}
            </p>
            
            {savedOrderData?.orderId && (
              <div style={orderIdStyle}>
                <strong>Order ID:</strong> {savedOrderData.orderId}
              </div>
            )}
            
            <div style={successButtonsStyle}>
              <button 
                onClick={handlePrint}
                style={printButtonStyle}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
              >
                🖨️ Print Order
              </button>
              
              <button 
                onClick={handleCloseSuccess}
                style={closeButtonStyle}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4b5563'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6b7280'}
              >
                ✓ Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Styles
const overlayStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0,0,0,0.6)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999,
  animation: "fadeIn 0.2s ease"
};

const popupContentStyle: React.CSSProperties = {
  backgroundColor: "#fff",
  padding: "40px",
  borderRadius: "12px",
  textAlign: "center",
  boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
  animation: "slideIn 0.3s ease",
  minWidth: "300px"
};

const successPopupStyle: React.CSSProperties = {
  backgroundColor: "#fff",
  padding: "40px",
  borderRadius: "16px",
  textAlign: "center",
  maxWidth: "500px",
  width: "90%",
  boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
  animation: "slideIn 0.3s ease"
};

const successIconStyle: React.CSSProperties = {
  width: "80px",
  height: "80px",
  backgroundColor: "#10b981",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: "0 auto 20px",
  fontSize: "48px",
  color: "white",
  animation: "scaleIn 0.5s ease"
};

const successTitleStyle: React.CSSProperties = {
  color: "#1f2937",
  marginBottom: "12px",
  fontSize: "24px",
  fontWeight: "700"
};

const successMessageStyle: React.CSSProperties = {
  color: "#6b7280",
  marginBottom: "20px",
  fontSize: "16px",
  lineHeight: "1.5"
};

const orderIdStyle: React.CSSProperties = {
  backgroundColor: "#f3f4f6",
  padding: "12px 16px",
  borderRadius: "8px",
  marginBottom: "25px",
  fontSize: "14px",
  color: "#374151"
};

const successButtonsStyle: React.CSSProperties = {
  display: "flex",
  gap: "12px",
  justifyContent: "center",
  flexWrap: "wrap"
};

const printButtonStyle: React.CSSProperties = {
  padding: "12px 24px",
  backgroundColor: "#3b82f6",
  color: "white",
  border: "none",
  borderRadius: "8px",
  fontSize: "16px",
  cursor: "pointer",
  transition: "all 0.3s ease",
  fontWeight: "500"
};

const viewButtonStyle: React.CSSProperties = {
  padding: "12px 24px",
  backgroundColor: "#10b981",
  color: "white",
  border: "none",
  borderRadius: "8px",
  fontSize: "16px",
  cursor: "pointer",
  transition: "all 0.3s ease",
  fontWeight: "500"
};

const closeButtonStyle: React.CSSProperties = {
  padding: "12px 24px",
  backgroundColor: "#6b7280",
  color: "white",
  border: "none",
  borderRadius: "8px",
  fontSize: "16px",
  cursor: "pointer",
  transition: "all 0.3s ease",
  fontWeight: "500"
};

const spinnerStyle: React.CSSProperties = {
  width: "50px",
  height: "50px",
  border: "5px solid #f3f3f3",
  borderTop: "5px solid #3b82f6",
  borderRadius: "50%",
  margin: "0 auto",
  animation: "spin 1s linear infinite"
};

const spinnerSmallStyle: React.CSSProperties = {
  width: "16px",
  height: "16px",
  border: "2px solid #ffffff",
  borderTop: "2px solid transparent",
  borderRadius: "50%",
  display: "inline-block",
  animation: "spin 0.8s linear infinite"
};

const errorStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: "12px",
  color: "#dc2626",
  backgroundColor: "#fee2e2",
  padding: "16px",
  borderRadius: "8px",
  border: "1px solid #fecaca",
  marginBottom: "12px",
  position: "fixed",
  bottom: "80px",
  right: "20px",
  maxWidth: "400px",
  boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
  animation: "slideIn 0.3s ease",
  zIndex: 9998
};

const closeErrorButtonStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  fontSize: "24px",
  color: "#dc2626",
  cursor: "pointer",
  padding: "0",
  lineHeight: "1",
  fontWeight: "bold",
  flexShrink: 0
};

// Add CSS animations
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @keyframes scaleIn {
      from {
        transform: scale(0);
      }
      to {
        transform: scale(1);
      }
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  
  if (!document.head.querySelector('style[data-save-orders]')) {
    styleSheet.setAttribute('data-save-orders', 'true');
    document.head.appendChild(styleSheet);
  }
}

export default SaveOrders;