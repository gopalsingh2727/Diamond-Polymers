// ─────────────────────────────────────────────────────────────────────────────
// redux/graphqlOrders/graphqlOrderReducer.ts
// Handles state for all GraphQL order queries (POST /graphql)
// ─────────────────────────────────────────────────────────────────────────────

import {
  GRAPHQL_ORDERS_REQUEST,
  GRAPHQL_ORDERS_SUCCESS,
  GRAPHQL_ORDERS_FAILURE,
  GRAPHQL_ORDER_REQUEST,
  GRAPHQL_ORDER_SUCCESS,
  GRAPHQL_ORDER_FAILURE,
  GRAPHQL_ORDERS_RESET,
} from "./graphqlOrderConstants";

interface GraphqlOrdersState {
  // Orders list
  loading:    boolean;
  orders:     any[];
  total:      number;
  page:       number;
  limit:      number;
  totalPages: number;
  error:      string | null;

  // Single order
  orderLoading: boolean;
  order:        any | null;
  orderError:   string | null;
}

const initialState: GraphqlOrdersState = {
  loading:    false,
  orders:     [],
  total:      0,
  page:       1,
  limit:      20,
  totalPages: 0,
  error:      null,

  orderLoading: false,
  order:        null,
  orderError:   null,
};

const graphqlOrdersReducer = (
  state: GraphqlOrdersState = initialState,
  action: any,
): GraphqlOrdersState => {
  switch (action.type) {

    // ── Orders list ──────────────────────────────────────────────────────────
    case GRAPHQL_ORDERS_REQUEST:
      return { ...state, loading: true, error: null };

    case GRAPHQL_ORDERS_SUCCESS:
      return {
        ...state,
        loading:    false,
        error:      null,
        orders:     action.payload?.orders     ?? (Array.isArray(action.payload) ? action.payload : state.orders),
        total:      action.payload?.total      ?? state.total,
        page:       action.payload?.page       ?? state.page,
        limit:      action.payload?.limit      ?? state.limit,
        totalPages: action.payload?.totalPages ?? state.totalPages,
      };

    case GRAPHQL_ORDERS_FAILURE:
      return { ...state, loading: false, error: action.payload };

    // ── Single order ─────────────────────────────────────────────────────────
    case GRAPHQL_ORDER_REQUEST:
      return { ...state, orderLoading: true, orderError: null };

    case GRAPHQL_ORDER_SUCCESS:
      return { ...state, orderLoading: false, orderError: null, order: action.payload };

    case GRAPHQL_ORDER_FAILURE:
      return { ...state, orderLoading: false, orderError: action.payload };

    // ── Reset ─────────────────────────────────────────────────────────────────
    case GRAPHQL_ORDERS_RESET:
      return initialState;

    default:
      return state;
  }
};

export default graphqlOrdersReducer;