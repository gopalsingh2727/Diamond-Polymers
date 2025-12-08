/**
 * WebSocket Event Handlers for Machines
 * Add these cases to your machine reducer
 *
 * Usage:
 * import { handleMachineWebSocketEvent } from './websocketHandlers';
 *
 * In your reducer:
 * case 'machines/machineStatusChangedViaWS':
 *   return handleMachineWebSocketEvent.statusChanged(state, action);
 */

export interface Machine {
  _id: string;
  name?: string;
  machineNumber?: string;
  status?: 'idle' | 'running' | 'maintenance' | 'offline';
  currentOrder?: any;
  operatorId?: string;
  branchId?: string;
  [key: string]: any;
}

export interface MachineState {
  allMachines: Machine[];
  loading: boolean;
  error: string | null;
  selectedMachine?: Machine | null;
  [key: string]: any;
}

/**
 * WebSocket Event Handlers
 */
export const handleMachineWebSocketEvent = {
  /**
   * Handle machine status changed via WebSocket
   */
  statusChanged: (state: MachineState, action: { payload: { _id: string; status: string; updatedAt?: string } }): MachineState => {
    const { _id, status, updatedAt } = action.payload;

    console.log('🏭 Machine status changed via WebSocket:', _id, '→', status);

    return {
      ...state,
      allMachines: state.allMachines.map(machine =>
        machine._id === _id
          ? {
              ...machine,
              status: status as Machine['status'],
              ...(updatedAt && { updatedAt })
            }
          : machine
      ),
      ...(state.selectedMachine?._id === _id && {
        selectedMachine: {
          ...state.selectedMachine,
          status: status as Machine['status'],
          ...(updatedAt && { updatedAt })
        }
      })
    };
  },

  /**
   * Handle machine order started via WebSocket
   */
  orderStarted: (state: MachineState, action: { payload: { machineId: string; order: any; updatedAt?: string } }): MachineState => {
    const { machineId, order, updatedAt } = action.payload;

    console.log('🏭 Machine order started via WebSocket:', machineId, order._id || order.orderNumber);

    return {
      ...state,
      allMachines: state.allMachines.map(machine =>
        machine._id === machineId
          ? {
              ...machine,
              status: 'running',
              currentOrder: order,
              ...(updatedAt && { updatedAt })
            }
          : machine
      ),
      ...(state.selectedMachine?._id === machineId && {
        selectedMachine: {
          ...state.selectedMachine,
          status: 'running',
          currentOrder: order,
          ...(updatedAt && { updatedAt })
        }
      })
    };
  },

  /**
   * Handle machine order completed via WebSocket
   */
  orderCompleted: (state: MachineState, action: { payload: { machineId: string; orderId: string; updatedAt?: string } }): MachineState => {
    const { machineId, orderId, updatedAt } = action.payload;

    console.log('🏭 Machine order completed via WebSocket:', machineId, orderId);

    return {
      ...state,
      allMachines: state.allMachines.map(machine =>
        machine._id === machineId
          ? {
              ...machine,
              status: 'idle',
              currentOrder: null,
              ...(updatedAt && { updatedAt })
            }
          : machine
      ),
      ...(state.selectedMachine?._id === machineId && {
        selectedMachine: {
          ...state.selectedMachine,
          status: 'idle',
          currentOrder: null,
          ...(updatedAt && { updatedAt })
        }
      })
    };
  },

  /**
   * Handle machine created via WebSocket
   */
  machineCreated: (state: MachineState, action: { payload: Machine }): MachineState => {
    const newMachine = action.payload;

    // Check if machine already exists (prevent duplicates)
    const exists = state.allMachines.some(machine => machine._id === newMachine._id);

    if (exists) {
      console.warn('Machine already exists, skipping duplicate:', newMachine._id);
      return state;
    }

    console.log('🏭 Machine created via WebSocket:', newMachine.name || newMachine._id);

    return {
      ...state,
      allMachines: [newMachine, ...state.allMachines],
    };
  },

  /**
   * Handle machine updated via WebSocket
   */
  machineUpdated: (state: MachineState, action: { payload: Machine }): MachineState => {
    const updatedMachine = action.payload;

    console.log('🏭 Machine updated via WebSocket:', updatedMachine._id);

    return {
      ...state,
      allMachines: state.allMachines.map(machine =>
        machine._id === updatedMachine._id
          ? { ...machine, ...updatedMachine }
          : machine
      ),
      ...(state.selectedMachine?._id === updatedMachine._id && {
        selectedMachine: { ...state.selectedMachine, ...updatedMachine }
      })
    };
  },

  /**
   * Handle machine deleted via WebSocket
   */
  machineDeleted: (state: MachineState, action: { payload: { _id: string } }): MachineState => {
    const { _id } = action.payload;

    console.log('🏭 Machine deleted via WebSocket:', _id);

    return {
      ...state,
      allMachines: state.allMachines.filter(machine => machine._id !== _id),
      ...(state.selectedMachine?._id === _id && {
        selectedMachine: null
      })
    };
  },

  /**
   * Handle machine operator assigned via WebSocket
   */
  operatorAssigned: (state: MachineState, action: { payload: { machineId: string; operatorId: string; operator?: any; updatedAt?: string } }): MachineState => {
    const { machineId, operatorId, operator, updatedAt } = action.payload;

    console.log('🏭 Machine operator assigned via WebSocket:', machineId, operatorId);

    return {
      ...state,
      allMachines: state.allMachines.map(machine =>
        machine._id === machineId
          ? {
              ...machine,
              operatorId,
              ...(operator && { operator }),
              ...(updatedAt && { updatedAt })
            }
          : machine
      ),
      ...(state.selectedMachine?._id === machineId && {
        selectedMachine: {
          ...state.selectedMachine,
          operatorId,
          ...(operator && { operator }),
          ...(updatedAt && { updatedAt })
        }
      })
    };
  },

  /**
   * Handle machine maintenance status via WebSocket
   */
  maintenanceStatusChanged: (state: MachineState, action: { payload: { machineId: string; isUnderMaintenance: boolean; maintenanceNote?: string; updatedAt?: string } }): MachineState => {
    const { machineId, isUnderMaintenance, maintenanceNote, updatedAt } = action.payload;

    console.log('🏭 Machine maintenance status changed via WebSocket:', machineId, isUnderMaintenance);

    return {
      ...state,
      allMachines: state.allMachines.map(machine =>
        machine._id === machineId
          ? {
              ...machine,
              status: isUnderMaintenance ? 'maintenance' : 'idle',
              isUnderMaintenance,
              ...(maintenanceNote && { maintenanceNote }),
              ...(updatedAt && { updatedAt })
            }
          : machine
      ),
      ...(state.selectedMachine?._id === machineId && {
        selectedMachine: {
          ...state.selectedMachine,
          status: isUnderMaintenance ? 'maintenance' : 'idle',
          isUnderMaintenance,
          ...(maintenanceNote && { maintenanceNote }),
          ...(updatedAt && { updatedAt })
        }
      })
    };
  }
};

/**
 * Example usage in your reducer:
 *
 * const machineReducer = (state = initialState, action: any) => {
 *   switch (action.type) {
 *     // ... existing cases ...
 *
 *     // WebSocket events
 *     case 'machines/machineStatusChangedViaWS':
 *       return handleMachineWebSocketEvent.statusChanged(state, action);
 *
 *     case 'machines/machineOrderStartedViaWS':
 *       return handleMachineWebSocketEvent.orderStarted(state, action);
 *
 *     case 'machines/machineOrderCompletedViaWS':
 *       return handleMachineWebSocketEvent.orderCompleted(state, action);
 *
 *     case 'machines/machineCreatedViaWS':
 *       return handleMachineWebSocketEvent.machineCreated(state, action);
 *
 *     case 'machines/machineUpdatedViaWS':
 *       return handleMachineWebSocketEvent.machineUpdated(state, action);
 *
 *     case 'machines/machineDeletedViaWS':
 *       return handleMachineWebSocketEvent.machineDeleted(state, action);
 *
 *     case 'machines/operatorAssignedViaWS':
 *       return handleMachineWebSocketEvent.operatorAssigned(state, action);
 *
 *     case 'machines/maintenanceStatusChangedViaWS':
 *       return handleMachineWebSocketEvent.maintenanceStatusChanged(state, action);
 *
 *     default:
 *       return state;
 *   }
 * };
 */
