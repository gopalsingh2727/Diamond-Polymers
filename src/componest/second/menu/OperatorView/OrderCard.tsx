import React from "react";

interface OrderCardProps {
  order: any;
  template?: any;
  onClick?: () => void;
  isSelected?: boolean;
  showCustomerInfo?: boolean;
}

const OrderCard: React.FC<OrderCardProps> = ({
  order,
  template,
  onClick,
  isSelected = false,
  showCustomerInfo = false
}) => {
  // Customer fields from template or defaults (show most by default)
  const customerFields = template?.customerFields || {
    showName: true,
    showAddress: true,
    showOrderId: true,
    showImage: true,
    showPhone: false,
    showEmail: false
  };

  // Get progress - handle both formats from API
  const progress = order.progress ?? order.machineTableData?.[0]?.progress ?? 0;
  const isComplete = order.isComplete ?? order.machineTableData?.[0]?.isComplete ?? false;

  // Get customer info - handle both direct props and nested customer object
  const customerName = order.customerName || order.customer?.name;
  const customerAddress = order.customerAddress || order.customer?.address;
  const customerPhone = order.customerPhone || order.customer?.phone;
  const customerEmail = order.customerEmail || order.customer?.email;
  const orderImage = order.orderImage || order.customer?.image;

  // Get order type name - handle multiple formats
  const orderTypeName = order.orderType?.typeName || order.orderTypeId?.typeName;

  return (
    <div
      className={`orderCard ${isSelected ? 'orderCardSelected' : ''} ${onClick ? 'orderCardClickable' : ''}`}
      onClick={onClick}
    >
      {/* Order Image */}
      {customerFields.showImage !== false && orderImage && (
        <div className="orderCardImage">
          <img src={orderImage} alt="Order" />
        </div>
      )}

      <div className="orderCardContent">
        {/* Order ID */}
        {customerFields.showOrderId !== false && (
          <div className="orderCardId">
            <span className="orderCardLabel">Order ID:</span>
            <span className="orderCardValue">{order.orderId || order._id?.slice(-8)}</span>
          </div>
        )}

        {/* Customer Name */}
        {customerFields.showName !== false && customerName && (
          <div className="orderCardInfo">
            <span className="orderCardLabel">Customer:</span>
            <span className="orderCardValue">{customerName}</span>
          </div>
        )}

        {/* Customer Address - Always show in detail view */}
        {(showCustomerInfo || customerFields.showAddress !== false) && customerAddress && (
          <div className="orderCardInfo">
            <span className="orderCardLabel">Address:</span>
            <span className="orderCardValue orderCardAddress">{customerAddress}</span>
          </div>
        )}

        {/* Phone - Only show if explicitly enabled */}
        {showCustomerInfo && customerFields.showPhone === true && customerPhone && (
          <div className="orderCardInfo">
            <span className="orderCardLabel">Phone:</span>
            <span className="orderCardValue">{customerPhone}</span>
          </div>
        )}

        {/* Email - Only show if explicitly enabled */}
        {showCustomerInfo && customerFields.showEmail === true && customerEmail && (
          <div className="orderCardInfo">
            <span className="orderCardLabel">Email:</span>
            <span className="orderCardValue">{customerEmail}</span>
          </div>
        )}

        {/* Order Type */}
        {orderTypeName && (
          <div className="orderCardInfo">
            <span className="orderCardLabel">Type:</span>
            <span className="orderCardBadge">{orderTypeName}</span>
          </div>
        )}

        {/* Options Summary (for card view) - show first 3 options */}
        {!showCustomerInfo && order.options?.length > 0 && (
          <div className="orderCardOptions">
            {order.options.slice(0, 3).map((opt: any, idx: number) => (
              <div key={idx} className="orderCardInfo">
                <span className="orderCardLabel">{opt.optionName}:</span>
                <span className="orderCardValue">
                  {opt.quantity ? `Qty: ${opt.quantity}` : '-'}
                </span>
              </div>
            ))}
            {order.options.length > 3 && (
              <div className="orderCardInfo">
                <span className="orderCardLabel">+{order.options.length - 3} more options</span>
              </div>
            )}
          </div>
        )}

        {/* Progress Bar */}
        <div className="orderCardProgress">
          <div className="orderCardProgressLabel">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="orderCardProgressBar">
            <div
              className={`orderCardProgressFill ${isComplete ? 'complete' : ''}`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>

        {/* Status Badge */}
        <div className="orderCardStatus">
          <span className={`orderCardStatusBadge ${isComplete ? 'complete' : order.status || 'pending'}`}>
            {isComplete ? 'Complete' : (order.status === 'in_progress' ? 'In Progress' : order.status || 'Pending')}
          </span>
        </div>
      </div>
    </div>
  );
};

export default OrderCard;
