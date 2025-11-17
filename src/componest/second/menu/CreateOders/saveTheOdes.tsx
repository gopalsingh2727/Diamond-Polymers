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
import { ActionButton } from "../../../../components/shared/ActionButton";
import { ToastContainer } from "../../../../components/shared/Toast";
import { useCRUD } from "../../../../hooks/useCRUD";

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

  // 🚀 CRUD System Integration
  const { saveState, updateState, handleSave, handleUpdate, toast } = useCRUD();

  // Local state management for success popup
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successType, setSuccessType] = useState<'save' | 'update'>('save');
  const [savedOrderData, setSavedOrderData] = useState<any>(null);

  // Redux state
  const orderState = useSelector((state: RootState) => {
    return (
      (state as any).orders ||
      (state as any).orderCreate ||
      (state as any).createOrder ||
      (state as any).order ||
      {}
    );
  });

  const { successMessage, order } = orderState;

  // Determine which state to use (save for create, update for edit)
  const buttonState = isEditMode ? updateState : saveState;

  // Main save handler with CRUD system
  const handleSaveOrder = () => {
    console.log("🔵 Save button clicked");

    const saveFunction = async () => {
      let result;

      if (isEditMode && orderId) {
        const actualOrderId = orderData?.orderId || orderId;
        console.log('🔄 Updating order:', actualOrderId);
        setSuccessType('update');
        result = await dispatch(updateOrder(actualOrderId, orderData || {}));
      } else {
        console.log('💾 Saving new order');
        setSuccessType('save');
        result = await dispatch(saveOrder(orderData));
      }

      console.log('✅ Dispatch completed, result:', result);

      // Check if successful
      const isSuccess =
        result?.orderId ||
        result?.data?.orderId ||
        result?._id ||
        (result && !result.error);

      if (isSuccess) {
        setSavedOrderData(result);
        return result;
      } else {
        throw new Error(result?.error || result?.message || 'Failed to save order');
      }
    };

    // Use appropriate CRUD handler
    if (isEditMode) {
      handleUpdate(saveFunction, {
        successMessage: 'Order updated successfully!',
        onSuccess: (data) => {
          console.log('✅ Order updated:', data);
          setShowSuccessPopup(true);
        }
      });
    } else {
      handleSave(saveFunction, {
        successMessage: 'Order saved successfully!',
        onSuccess: (data) => {
          console.log('✅ Order saved:', data);
          setShowSuccessPopup(true);
        }
      });
    }
  };

  // Watch for Redux success message
  useEffect(() => {
    if (successMessage) {
      console.log('✅ Redux success message received:', successMessage);
      toast.success('Success', successMessage);
    }
  }, [successMessage, toast]);

  // Watch for Redux order state changes
  useEffect(() => {
    if (order && !savedOrderData) {
      console.log('✅ Order detected in Redux state:', order);
      setSavedOrderData(order);
    }
  }, [order, savedOrderData]);

  // Handle success popup close
  const handleCloseSuccess = () => {
    console.log('🔵 Closing success popup');
    setShowSuccessPopup(false);
    setSavedOrderData(null);

    if (successMessage) {
      dispatch(clearSuccessMessage());
    }

    // Navigate back
    setTimeout(() => {
      if (window.history.length > 1) {
        navigate(-1);
      } else {
        navigate('/');
      }
    }, 300);
  };

  // Handle print
  const handlePrint = () => {
    console.log('🖨️ Printing order');
    window.print();
  };

  return (
    <div className="CreateOrdersFooter">
      {/* Save/Update Button with CRUD System */}
      <ActionButton
        type={isEditMode ? "update" : "save"}
        state={buttonState}
        onClick={handleSaveOrder}
        className="CreateOrdersButton"
      >
        {isEditMode ? "Update Order" : "Save Order"}
      </ActionButton>

      {/* Success Popup (Custom for Order ID display and Print) */}
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

      {/* Toast notifications from CRUD system */}
      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
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
