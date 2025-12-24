/**
 * Universal Search Configuration
 * Defines searchable entities, their display properties, and navigation routes
 */

export interface SearchableEntity {
  type: 'order' | 'machine' | 'machineType' | 'operator' | 'customer' | 'product' | 'material';
  label: string;
  icon: string; // Lucide icon name
  route: string;
  searchFields: string[]; // Fields to search within
}

export const SEARCH_CONFIG: SearchableEntity[] = [
  {
    type: 'order',
    label: 'Orders',
    icon: 'ShoppingCart',
    route: '/menu/IndexAllOders',
    searchFields: ['orderId', '_id', 'customer.name', 'customerId', 'status', 'quantity']
  },
  {
    type: 'machine',
    label: 'Machines',
    icon: 'Factory',
    route: '/menu/edit',
    searchFields: ['machineName', 'machineType', '_id']
  },
  {
    type: 'machineType',
    label: 'Machine Types',
    icon: 'Cog',
    route: '/menu/edit',
    searchFields: ['type', 'description']
  },
  {
    type: 'operator',
    label: 'Operators',
    icon: 'User',
    route: '/menu/edit',
    searchFields: ['name', 'PIN']
  },
  {
    type: 'customer',
    label: 'Customers',
    icon: 'Users',
    route: '/menu/IndexAllOders', // Can be customized later
    searchFields: ['name', 'email', 'phone']
  },
  {
    type: 'product',
    label: 'Products',
    icon: 'Package',
    route: '/menu/IndexAllOders', // Can be customized later
    searchFields: ['name', 'code', 'description']
  },
  {
    type: 'material',
    label: 'Materials',
    icon: 'Boxes',
    route: '/menu/IndexAllOders', // Can be customized later
    searchFields: ['name', 'type', 'code']
  }
];

// Maximum number of results to display
export const MAX_SEARCH_RESULTS = 50;

// Debounce delay in milliseconds
export const SEARCH_DEBOUNCE_DELAY = 300;

// Keyboard shortcuts
export const SEARCH_SHORTCUT = {
  key: 'k',
  mac: 'Cmd+K',
  windows: 'Ctrl+K'
};
