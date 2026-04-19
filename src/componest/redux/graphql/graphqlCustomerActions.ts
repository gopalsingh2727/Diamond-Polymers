// ─────────────────────────────────────────────────────────────────────────────
//  graphqlCustomerActions.ts
//  GraphQL queries for customers (with category + parentCompany),
//  orders with full machine table data, and supporting catalog lookups.
// ─────────────────────────────────────────────────────────────────────────────

const BASE_URL       = import.meta.env.VITE_API_27INFINITY_IN || import.meta.env.VITE_API_URL || 'http://localhost:4000';
const API_KEY        = import.meta.env.VITE_API_KEY as string;
const GQL_ENDPOINT   = '/graphql';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CustomerCategory {
  _id:         string;
  name:        string;
  description: string | null;
  branchId:    string;
}

export interface CustomerParentCompany {
  _id:         string;
  name:        string;
  description: string | null;
  branchId:    string;
}

export interface CustomerFull {
  _id:             string;
  companyName:     string;
  firstName:       string | null;
  lastName:        string | null;
  phone1:          string | null;
  phone2:          string | null;
  whatsapp:        string | null;
  telephone:       string | null;
  email:           string | null;
  state:           string | null;
  pinCode:         string | null;
  address1:        string | null;
  address2:        string | null;
  gstNumber:       string | null;
  imageUrl:        string | null;
  branchId:        string;
  categoryId:      string | null;
  parentCompanyId: string | null;
  createdAt:       string | null;
  updatedAt:       string | null;
  category:        CustomerCategory | null;
  parentCompany:   CustomerParentCompany | null;
}

export interface MachineTableCellValue {
  columnName: string;
  value:      string | null;
  unit:       string | null;
}

export interface MachineTableRow {
  rowNumber:     number;
  values:        MachineTableCellValue[];
  createdAt:     string | null;
  createdByName: string | null;
}

export interface MachineTableEntry {
  machineId:           string;
  templateId:          string | null;
  rows:                MachineTableRow[];
  targetValue:         number | null;
  currentValue:        number | null;
  progress:            number | null;
  isComplete:          boolean | null;
  completedAt:         string | null;
  completedByName:     string | null;
  totalProductionTime: number | null;
  machine: {
    _id:         string;
    machineName: string;
    machineType: { _id: string; type: string } | null;
  } | null;
}

export interface OrderWithDetails {
  _id:                    string;
  orderId:                string;
  overallStatus:          string;
  priority:               string | null;
  createdByName:          string | null;
  createdAt:              string | null;
  updatedAt:              string | null;
  Notes:                  string | null;
  customerCategoryId:     string | null;
  customerParentCompanyId: string | null;
  customer: CustomerFull | null;
  machineTableData:       MachineTableEntry[];
  options: {
    optionName:    string | null;
    optionTypeName: string | null;
    quantity:      number | null;
    specificationValues: { name: string; value: string | null; unit: string | null; dataType: string | null }[];
  }[];
}

// ─── GraphQL query strings ────────────────────────────────────────────────────

const CUSTOMER_FIELDS = `
  _id
  companyName
  firstName
  lastName
  phone1
  phone2
  whatsapp
  telephone
  email
  state
  pinCode
  address1
  address2
  gstNumber
  imageUrl
  branchId
  categoryId
  parentCompanyId
  createdAt
  updatedAt
  category {
    _id
    name
    description
    branchId
  }
  parentCompany {
    _id
    name
    description
    branchId
  }
`;

const GQL_GET_CUSTOMERS = `
  query GetCustomers($search: String, $categoryId: ID, $parentCompanyId: ID) {
    getCustomers(search: $search, categoryId: $categoryId, parentCompanyId: $parentCompanyId) {
      ${CUSTOMER_FIELDS}
    }
  }
`;

const GQL_GET_CUSTOMER = `
  query GetCustomer($id: ID!) {
    getCustomer(id: $id) {
      ${CUSTOMER_FIELDS}
    }
  }
`;

const GQL_GET_CUSTOMER_CATEGORIES = `
  query GetCustomerCategories {
    getCustomerCategories {
      _id
      name
      description
      branchId
    }
  }
`;

const GQL_GET_CUSTOMER_PARENT_COMPANIES = `
  query GetCustomerParentCompanies {
    getCustomerParentCompanies {
      _id
      name
      description
      branchId
    }
  }
`;

const GQL_GET_ORDERS_FULL = `
  query GetOrdersFull($filter: OrderFilter!, $sortBy: String, $sortDir: String) {
    orders(filter: $filter, sortBy: $sortBy, sortDir: $sortDir) {
      total
      orders {
        _id
        orderId
        overallStatus
        priority
        createdByName
        createdAt
        updatedAt
        Notes
        customerCategoryId
        customerParentCompanyId
        customer {
          ${CUSTOMER_FIELDS}
        }
        options {
          optionName
          optionTypeName
          quantity
          specificationValues {
            name
            value
            unit
            dataType
          }
        }
        machineTableData {
          machineId
          templateId
          targetValue
          currentValue
          progress
          isComplete
          completedAt
          completedByName
          totalProductionTime
          machine {
            _id
            machineName
            machineType {
              _id
              type
            }
          }
          rows {
            rowNumber
            createdAt
            createdByName
            values {
              columnName
              value
              unit
            }
          }
        }
      }
    }
  }
`;

const GQL_GET_ORDER_FULL = `
  query GetOrderFull($id: ID!) {
    getOrder(id: $id) {
      _id
      orderId
      overallStatus
      priority
      createdByName
      createdAt
      updatedAt
      Notes
      customerCategoryId
      customerParentCompanyId
      customer {
        ${CUSTOMER_FIELDS}
      }
      options {
        optionName
        optionTypeName
        quantity
        specificationValues {
          name
          value
          unit
          dataType
        }
      }
      machineTableData {
        machineId
        templateId
        targetValue
        currentValue
        progress
        isComplete
        completedAt
        completedByName
        totalProductionTime
        machine {
          _id
          machineName
          machineType {
            _id
            type
          }
        }
        rows {
          rowNumber
          createdAt
          createdByName
          values {
            columnName
            value
            unit
          }
        }
      }
    }
  }
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function resolveToken(): string {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('[graphqlCustomerActions] authToken not found');
  return token;
}

function resolveBranchId(): string {
  try {
    const token = localStorage.getItem('authToken');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.branchId) return payload.branchId;
    }
  } catch { /* ignore */ }
  return (
    localStorage.getItem('selectedBranch')  ||
    localStorage.getItem('branchId')        ||
    localStorage.getItem('currentBranchId') ||
    ''
  );
}

function buildHeaders(): Record<string, string> {
  const token    = resolveToken();
  const branchId = resolveBranchId();
  const headers: Record<string, string> = {
    'Content-Type':  'application/json',
    'Authorization': `Bearer ${token}`,
  };
  if (API_KEY)   headers['x-api-key']          = API_KEY;
  if (branchId)  headers['x-selected-branch']  = branchId;
  return headers;
}

async function gqlPost<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  const url = `${BASE_URL}${GQL_ENDPOINT}`;
  const res = await fetch(url, {
    method:  'POST',
    headers: buildHeaders(),
    body:    JSON.stringify({ query, variables }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as any)?.message ?? `HTTP ${res.status}`);
  }
  const json = await res.json();
  if (json.errors?.length) {
    throw new Error(json.errors.map((e: any) => e.message).join('; '));
  }
  return json;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Fetch all customers for the current branch.
 * Includes resolved category + parentCompany objects.
 *
 * @example
 * const customers = await fetchCustomers();
 * const filtered  = await fetchCustomers({ search: 'Acme' });
 * const byCategory = await fetchCustomers({ categoryId: '...' });
 */
export async function fetchCustomers(params: {
  search?:          string;
  categoryId?:      string;
  parentCompanyId?: string;
} = {}): Promise<CustomerFull[]> {
  const res = await gqlPost<any>(GQL_GET_CUSTOMERS, params);
  return res?.data?.getCustomers ?? [];
}

/**
 * Fetch a single customer by ID with full details.
 */
export async function fetchCustomer(id: string): Promise<CustomerFull | null> {
  const res = await gqlPost<any>(GQL_GET_CUSTOMER, { id });
  return res?.data?.getCustomer ?? null;
}

/**
 * Fetch all customer categories for the current branch.
 */
export async function fetchCustomerCategories(): Promise<CustomerCategory[]> {
  const res = await gqlPost<any>(GQL_GET_CUSTOMER_CATEGORIES);
  return res?.data?.getCustomerCategories ?? [];
}

/**
 * Fetch all customer parent companies for the current branch.
 */
export async function fetchCustomerParentCompanies(): Promise<CustomerParentCompany[]> {
  const res = await gqlPost<any>(GQL_GET_CUSTOMER_PARENT_COMPANIES);
  return res?.data?.getCustomerParentCompanies ?? [];
}

/**
 * Fetch all orders with full details:
 * - customer (with category + parentCompany)
 * - options with specificationValues
 * - machineTableData with rows and machine info
 *
 * @example
 * const result = await fetchOrdersFull({ branchId: '...', overallStatus: ['completed'] });
 * result.orders  // OrderWithDetails[]
 * result.total   // number
 */
export async function fetchOrdersFull(filter: {
  branchId?:       string;
  overallStatus?:  string[];
  priority?:       string[];
  customerId?:     string;
  orderTypeId?:    string;
  fromDate?:       string;
  toDate?:         string;
  search?:         string;
  sameDayDispatch?: boolean;
  includeDeleted?: boolean;
} = {}, options: {
  sortBy?:  string;
  sortDir?: 'asc' | 'desc';
} = {}): Promise<{ orders: OrderWithDetails[]; total: number }> {
  const branchId = filter.branchId || resolveBranchId();
  const res = await gqlPost<any>(GQL_GET_ORDERS_FULL, {
    filter:  { ...filter, branchId },
    sortBy:  options.sortBy  ?? 'createdAt',
    sortDir: options.sortDir ?? 'desc',
  });
  const data = res?.data?.orders;
  return {
    orders: data?.orders ?? [],
    total:  data?.total  ?? 0,
  };
}

/**
 * Fetch a single order by its _id or orderId, with full details.
 */
export async function fetchOrderFull(id: string): Promise<OrderWithDetails | null> {
  const res = await gqlPost<any>(GQL_GET_ORDER_FULL, { id });
  return res?.data?.getOrder ?? null;
}
