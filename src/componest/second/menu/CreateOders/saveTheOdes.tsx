import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
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

  // ✅ Pick the correct reducer slice
  const { loading, error, successMessage } = useSelector((state: RootState) => {
    return (
      (state as any).orders ||
      (state as any).orderCreate ||
      (state as any).createOrder ||
      {}
    );
  });

  const handleSaveOrder = async () => {
    if (error) dispatch(clearError());

    if (isEditMode && orderId) {
      await dispatch(updateOrder(orderId, orderData || {}));
    } else {
      await dispatch(
        saveOrder(
          orderData && Object.keys(orderData).length > 0 ? orderData : undefined
        )
      );
    }
  };

  // ✅ Auto-clear success after printing
  useEffect(() => {
    if (successMessage) {
      setTimeout(() => {
        window.print();
        dispatch(clearSuccessMessage());
      }, 2000);
    }
  }, [successMessage, dispatch]);

  // ✅ Auto-clear error after 5s
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  return (
    <div className="CreateOrdersFooter">
      {error && (
        <div style={errorStyle}>
          ❌ Error: {String(error)}
        </div>
      )}

      <button
        className="CreateOrdersButton"
        onClick={handleSaveOrder}
        disabled={loading}
        style={{
          backgroundColor: isEditMode ? "#f59e0b" : "#10b981",
          color: "white",
          padding: "10px 20px",
          border: "none",
          borderRadius: "4px",
          cursor: loading ? "not-allowed" : "pointer",
          fontSize: "14px",
          opacity: loading ? 0.6 : 1
        }}
      >
        {loading
          ? isEditMode
            ? "Updating..."
            : "Saving..."
          : isEditMode
          ? "Update Order"
          : "Save Order"}
      </button>

      {/* ✅ Tie popup visibility directly to Redux state */}
      {loading && (
        <div style={popupStyle}>
          <div style={popupContentStyle}>
            <h3>Saving Order...</h3>
          </div>
        </div>
      )}

      {successMessage && (
        <div style={popupStyle}>
          <div style={popupContentStyle}>
            <h3>✅ Order Saved Successfully!</h3>
            <p>Preparing to print...</p>
          </div>
        </div>
      )}
    </div>
  );
};

const popupStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999
};

const popupContentStyle: React.CSSProperties = {
  backgroundColor: "#fff",
  padding: "20px 30px",
  borderRadius: "8px",
  textAlign: "center"
};

const errorStyle: React.CSSProperties = {
  color: "red",
  marginBottom: "10px",
  padding: "8px",
  backgroundColor: "#fee",
  border: "1px solid #fcc",
  borderRadius: "4px"
};

export default SaveOrders;