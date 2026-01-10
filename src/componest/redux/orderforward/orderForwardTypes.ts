/**
 * Order Forward Redux Types
 * TypeScript interfaces for order forwarding state and actions
 */

// ============= COMPANY CONNECTION TYPES =============

export interface CompanyConnection {
  _id: string;
  fromCompanyId: string;
  fromCompanyName: string;
  toCompanyId: string;
  toCompanyName: string;
  status: 'pending' | 'accepted' | 'rejected' | 'blocked' | 'cancelled';
  requestedBy: string;
  requestedByRole: string;
  requestedByName: string;
  requestedAt: string;
  requestMessage?: string;
  respondedBy?: string;
  respondedByRole?: string;
  respondedByName?: string;
  respondedAt?: string;
  responseMessage?: string;
  settings: {
    allowOrderForwarding: boolean;
    autoAcceptOrders: boolean;
    notifyOnNewOrders: boolean;
  };
  stats: {
    ordersForwarded: number;
    ordersReceived: number;
    lastOrderAt?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ConnectionRequest {
  _id: string;
  fromCompanyId?: string;
  fromCompanyName?: string;
  toCompanyId?: string;
  toCompanyName?: string;
  status: 'pending';
  requestedByName?: string;
  requestedAt: string;
  requestMessage?: string;
}

// ============= FORWARDED ORDER TYPES =============

export interface ForwardedOrder {
  _id: string;
  originalOrderId: string;
  orderNumber: string;

  // Branch context
  branchId: string;
  branchName: string;
  product27InfinityId: string;

  // Forwarding state (Branch-to-Branch)
  isForwarded: boolean;
  forwardedTo?: string;
  forwardedToName?: string;
  forwardedAt?: string;
  forwardedBy?: string;
  forwardedByRole?: string;
  forwardedByName?: string;

  // Person-to-Person forwarding
  forwardedToPerson?: string;
  forwardedToPersonName?: string;
  forwardedToPersonRole?: string;

  // Receiving state (Branch-to-Branch)
  isReceived: boolean;
  receivedFrom?: string;
  receivedFromName?: string;
  receivedAt?: string;

  // Person-to-Person receiving
  receivedFromPerson?: string;
  receivedFromPersonName?: string;
  receivedFromPersonRole?: string;

  // Original creator tracking
  originalBranchId?: string;
  originalBranchName?: string;

  // Forwarding status for person-to-person
  forwardingStatus?: 'pending' | 'accepted' | 'denied';
  acceptedAt?: string;
  deniedAt?: string;
  denialReason?: string;
  responseNote?: string;

  // Forwarding chain
  forwardingChain?: Array<{
    from?: {
      branchId?: string;
      branchName?: string;
      personId?: string;
      personName?: string;
      role?: string;
    };
    to?: {
      branchId?: string;
      branchName?: string;
      personId?: string;
      personName?: string;
      role?: string;
    };
    status?: 'pending' | 'accepted' | 'denied';
    forwardedAt?: string;
    acceptedAt?: string;
    deniedAt?: string;
    denialReason?: string;
    notes?: string;
  }>;

  // Order data snapshot
  customerInfo?: {
    name: string;
    email?: string;
    phone?: string;
    customerId?: string;
  };
  items?: Array<{
    name: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  options?: Array<any>;
  dynamicValues?: any;
  orderTypeId?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  overallStatus?: string;
  totalAmount?: number;

  // Notes
  notes?: Array<{
    note: string;
    createdAt: string;
    createdByName?: string;
    noteType?: string;
  }>;

  createdAt: string;
  updatedAt: string;
}

export interface ForwardingChainItem {
  branchId: string;
  branchName: string;
  role: 'creator' | 'intermediate' | 'current' | 'forwarded_to';
  receivedAt?: string;
  forwardedAt?: string;
}

export interface ForwardingChain {
  order: {
    _id: string;
    orderNumber: string;
    isReceived: boolean;
    isForwarded: boolean;
  };
  chain: ForwardingChainItem[];
}

// ============= PAGINATION =============

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// ============= API RESPONSES =============

export interface ConnectionsResponse {
  success: boolean;
  data: {
    connections: CompanyConnection[];
    total: number;
  };
}

export interface PendingRequestsResponse {
  success: boolean;
  data: {
    requests: ConnectionRequest[];
    total: number;
  };
}

export interface ReceivedOrdersResponse {
  success: boolean;
  data: {
    orders: ForwardedOrder[];
    pagination: Pagination;
  };
}

export interface ForwardedOrdersResponse {
  success: boolean;
  data: {
    orders: ForwardedOrder[];
    pagination: Pagination;
  };
}

export interface ForwardingChainResponse {
  success: boolean;
  data: ForwardingChain;
}

// ============= REDUX STATE =============

export interface OrderForwardState {
  // Connection management
  connections: CompanyConnection[];
  pendingRequests: CompanyConnection[];
  sentRequests: CompanyConnection[];
  connectionsLoading: boolean;

  // Received orders
  receivedOrders: ForwardedOrder[];
  receivedOrdersPagination: Pagination | null;
  receivedOrdersLoading: boolean;

  // Forwarded orders
  forwardedOrders: ForwardedOrder[];
  forwardedOrdersPagination: Pagination | null;
  forwardedOrdersLoading: boolean;

  // Pending orders (awaiting acceptance)
  pendingOrders: ForwardedOrder[];
  pendingOrdersPagination: Pagination | null;
  pendingOrdersLoading: boolean;

  // Accepted orders (orders I've accepted)
  acceptedOrders: ForwardedOrder[];
  acceptedOrdersPagination: Pagination | null;
  acceptedOrdersLoading: boolean;

  // Denied orders (orders I've denied)
  deniedOrders: ForwardedOrder[];
  deniedOrdersPagination: Pagination | null;
  deniedOrdersLoading: boolean;

  // Forwarding chain
  forwardingChain: ForwardingChain | null;
  forwardingChainLoading: boolean;

  // UI state
  forwardModalOpen: boolean;
  connectionModalOpen: boolean;

  // Async state
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

// ============= ACTION TYPES =============

export type OrderForwardActionTypes =
  // Connection actions
  | { type: 'SEND_CONNECTION_REQUEST' }
  | { type: 'SEND_CONNECTION_SUCCESS'; payload: CompanyConnection }
  | { type: 'SEND_CONNECTION_FAILURE'; payload: string }
  | { type: 'RESPOND_TO_CONNECTION_REQUEST' }
  | { type: 'RESPOND_TO_CONNECTION_SUCCESS'; payload: CompanyConnection }
  | { type: 'RESPOND_TO_CONNECTION_FAILURE'; payload: string }
  | { type: 'FETCH_CONNECTIONS_REQUEST' }
  | { type: 'FETCH_CONNECTIONS_SUCCESS'; payload: CompanyConnection[] }
  | { type: 'FETCH_CONNECTIONS_FAILURE'; payload: string }
  | { type: 'FETCH_PENDING_REQUESTS_REQUEST' }
  | { type: 'FETCH_PENDING_REQUESTS_SUCCESS'; payload: CompanyConnection[] }
  | { type: 'FETCH_PENDING_REQUESTS_FAILURE'; payload: string }
  | { type: 'FETCH_SENT_REQUESTS_REQUEST' }
  | { type: 'FETCH_SENT_REQUESTS_SUCCESS'; payload: CompanyConnection[] }
  | { type: 'FETCH_SENT_REQUESTS_FAILURE'; payload: string }
  | { type: 'REMOVE_CONNECTION_REQUEST' }
  | { type: 'REMOVE_CONNECTION_SUCCESS'; payload: string }
  | { type: 'REMOVE_CONNECTION_FAILURE'; payload: string }
  // Order forwarding actions
  | { type: 'FORWARD_ORDER_REQUEST' }
  | { type: 'FORWARD_ORDER_SUCCESS'; payload: any }
  | { type: 'FORWARD_ORDER_FAILURE'; payload: string }
  | { type: 'FETCH_RECEIVED_ORDERS_REQUEST' }
  | { type: 'FETCH_RECEIVED_ORDERS_SUCCESS'; payload: { orders: ForwardedOrder[]; pagination: Pagination } }
  | { type: 'FETCH_RECEIVED_ORDERS_FAILURE'; payload: string }
  | { type: 'FETCH_FORWARDED_ORDERS_REQUEST' }
  | { type: 'FETCH_FORWARDED_ORDERS_SUCCESS'; payload: { orders: ForwardedOrder[]; pagination: Pagination } }
  | { type: 'FETCH_FORWARDED_ORDERS_FAILURE'; payload: string }
  | { type: 'FETCH_FORWARDING_CHAIN_REQUEST' }
  | { type: 'FETCH_FORWARDING_CHAIN_SUCCESS'; payload: ForwardingChain }
  | { type: 'FETCH_FORWARDING_CHAIN_FAILURE'; payload: string }
  // Pending/Accepted order actions
  | { type: 'FETCH_PENDING_ORDERS_REQUEST' }
  | { type: 'FETCH_PENDING_ORDERS_SUCCESS'; payload: { orders: ForwardedOrder[]; pagination: Pagination } }
  | { type: 'FETCH_PENDING_ORDERS_FAILURE'; payload: string }
  | { type: 'FETCH_ACCEPTED_ORDERS_REQUEST' }
  | { type: 'FETCH_ACCEPTED_ORDERS_SUCCESS'; payload: { orders: ForwardedOrder[]; pagination: Pagination } }
  | { type: 'FETCH_ACCEPTED_ORDERS_FAILURE'; payload: string }
  | { type: 'FETCH_DENIED_ORDERS_REQUEST' }
  | { type: 'FETCH_DENIED_ORDERS_SUCCESS'; payload: { orders: ForwardedOrder[]; pagination: Pagination } }
  | { type: 'FETCH_DENIED_ORDERS_FAILURE'; payload: string }
  | { type: 'ACCEPT_ORDER_REQUEST' }
  | { type: 'ACCEPT_ORDER_SUCCESS'; payload: any }
  | { type: 'ACCEPT_ORDER_FAILURE'; payload: string }
  | { type: 'DENY_ORDER_REQUEST' }
  | { type: 'DENY_ORDER_SUCCESS'; payload: any }
  | { type: 'DENY_ORDER_FAILURE'; payload: string }
  // Status sync actions
  | { type: 'SYNC_STATUS_REQUEST' }
  | { type: 'SYNC_STATUS_SUCCESS'; payload: { orderNumber: string; newStatus: string; modifiedCount: number } }
  | { type: 'SYNC_STATUS_FAILURE'; payload: string }
  // UI actions
  | { type: 'SET_FORWARD_MODAL_OPEN'; payload: boolean }
  | { type: 'SET_CONNECTION_MODAL_OPEN'; payload: boolean }
  | { type: 'CLEAR_ORDER_FORWARD_ERROR' }
  | { type: 'CLEAR_ORDER_FORWARD_SUCCESS' };
