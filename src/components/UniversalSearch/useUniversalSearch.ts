import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../componest/redux/rootReducer';
import { searchData } from '../../componest/Utils/searchUtils';
import { SEARCH_CONFIG, MAX_SEARCH_RESULTS } from './searchConfig';

/**
 * Search result interface with type and original data
 */
export interface SearchResult {
  id: string;
  type: 'order' | 'machine' | 'machineType' | 'operator' | 'customer' | 'product' | 'material';
  title: string;
  subtitle?: string;
  description?: string;
  route: string;
  data: any; // Original data object
}

/**
 * Custom hook for universal search across all entities
 * Searches Redux state for orders, machines, machine types, operators, and cached data
 */
export const useUniversalSearch = (searchTerm: string): SearchResult[] => {
  // Get Redux state slices
  // FIX: Orders are stored at state.orders.list.orders (orderListReducer is nested in combineReducers)
  const orders = useSelector((state: RootState) => state.orders?.list?.orders || []);
  const machines = useSelector((state: RootState) => state.machineList?.items || []);
  const machineTypes = useSelector((state: RootState) => state.machineTypeList?.items || []);
  const operators = useSelector((state: RootState) => state.operatorList?.items || []);

  // Get cached data
  const dataCache = useSelector((state: RootState) => state.dataCache);
  const customers = dataCache?.customers?.data || [];
  const products = dataCache?.products?.data || [];
  const materials = dataCache?.materials?.data || [];

  // Memoize search results to avoid recalculating on every render
  const results = useMemo(() => {






    if (!searchTerm || searchTerm.trim().length < 2) {

      return [];
    }

    const allResults: SearchResult[] = [];
    const term = searchTerm.trim();

    // Search Orders
    const orderConfig = SEARCH_CONFIG.find((c) => c.type === 'order');
    if (orderConfig && orders.length > 0) {



      const foundOrders = searchData(orders, term, orderConfig.searchFields);


      foundOrders.forEach((order: any) => {
        allResults.push({
          id: order._id || order.orderId,
          type: 'order',
          title: `Order ${order.orderId || order._id}`,
          subtitle: order.customer?.name || order.customerId,
          description: `Status: ${order.status || 'N/A'} | Qty: ${order.quantity || 'N/A'}`,
          route: orderConfig.route,
          data: order
        });
      });
    } else {

    }

    // Search Machines
    const machineConfig = SEARCH_CONFIG.find((c) => c.type === 'machine');
    if (machineConfig && machines.length > 0) {
      const foundMachines = searchData(machines, term, machineConfig.searchFields);
      foundMachines.forEach((machine: any) => {
        allResults.push({
          id: machine._id,
          type: 'machine',
          title: machine.machineName,
          subtitle: machine.machineType,
          description: machine.sizeX && machine.sizeY ?
          `Size: ${machine.sizeX} × ${machine.sizeY}` :
          undefined,
          route: machineConfig.route,
          data: machine
        });
      });
    }

    // Search Machine Types
    const machineTypeConfig = SEARCH_CONFIG.find((c) => c.type === 'machineType');
    if (machineTypeConfig && machineTypes.length > 0) {
      const foundMachineTypes = searchData(machineTypes, term, machineTypeConfig.searchFields);
      foundMachineTypes.forEach((machineType: any) => {
        allResults.push({
          id: machineType._id,
          type: 'machineType',
          title: machineType.type,
          subtitle: 'Machine Type',
          description: machineType.description,
          route: machineTypeConfig.route,
          data: machineType
        });
      });
    }

    // Search Operators
    const operatorConfig = SEARCH_CONFIG.find((c) => c.type === 'operator');
    if (operatorConfig && operators.length > 0) {
      const foundOperators = searchData(operators, term, operatorConfig.searchFields);
      foundOperators.forEach((operator: any) => {
        allResults.push({
          id: operator._id,
          type: 'operator',
          title: operator.name,
          subtitle: 'Operator',
          description: operator.PIN ? `PIN: ${operator.PIN}` : undefined,
          route: operatorConfig.route,
          data: operator
        });
      });
    }

    // Search Customers (from cache)
    const customerConfig = SEARCH_CONFIG.find((c) => c.type === 'customer');
    if (customerConfig && customers.length > 0) {
      const foundCustomers = searchData(customers, term, customerConfig.searchFields);
      foundCustomers.forEach((customer: any) => {
        allResults.push({
          id: customer._id,
          type: 'customer',
          title: customer.name,
          subtitle: 'Customer',
          description: customer.email || customer.phone,
          route: customerConfig.route,
          data: customer
        });
      });
    }

    // Search Products (from cache)
    const productConfig = SEARCH_CONFIG.find((c) => c.type === 'product');
    if (productConfig && products.length > 0) {
      const foundProducts = searchData(products, term, productConfig.searchFields);
      foundProducts.forEach((product: any) => {
        allResults.push({
          id: product._id,
          type: 'product',
          title: product.name,
          subtitle: 'Product',
          description: product.code || product.description,
          route: productConfig.route,
          data: product
        });
      });
    }

    // Search Materials (from cache)
    const materialConfig = SEARCH_CONFIG.find((c) => c.type === 'material');
    if (materialConfig && materials.length > 0) {
      const foundMaterials = searchData(materials, term, materialConfig.searchFields);
      foundMaterials.forEach((material: any) => {
        allResults.push({
          id: material._id,
          type: 'material',
          title: material.name,
          subtitle: 'Material',
          description: material.type || material.code,
          route: materialConfig.route,
          data: material
        });
      });
    }

    // Limit results and return



    const limitedResults = allResults.slice(0, MAX_SEARCH_RESULTS);


    return limitedResults;
  }, [searchTerm, orders, machines, machineTypes, operators, customers, products, materials]);

  return results;
};

/**
 * Group search results by type for better organization
 */
export const useGroupedSearchResults = (searchTerm: string) => {
  const results = useUniversalSearch(searchTerm);

  const grouped = useMemo(() => {
    const groups: Record<string, SearchResult[]> = {};

    results.forEach((result) => {
      if (!groups[result.type]) {
        groups[result.type] = [];
      }
      groups[result.type].push(result);
    });

    return groups;
  }, [results]);

  return { results, grouped };
};