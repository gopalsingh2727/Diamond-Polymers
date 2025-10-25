import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {  fetchOrders } from './OdersActions'; 


export interface MixMaterial {
  name: string;
  type: string;
  weight: number;
  percentage: number;
  matter_id?: string;
}

export interface StepItem {
  MachineType: string;
  MachineName: string;
  SizeX: string;
  SizeY: string;
  SizeZ: string;
  OptereName: string;
  StartTime: string;
  EndTime: string;
  note?: string;
}

export interface StepData {
  stepname: string;
  steps: StepItem[];
}

export interface OrderData {
  orderId: string;
  timestamp: string;
  orderType: string;
  customer: {
    customer_id?: string;
    name: string;
    phone?: string;
    email?: string;
    address?: string;
    companyName?: string;
    imageUrl?: string;
  };
  material?: {
    matter_id?: string;
    materialType: string;
    materialName: string;
    width: string;
    height: string;
    gauge: string;
    totalWeight: string;
    onePieceWeight: string;
    totalPieces: string;
    dimensionUnit: string;
    gaugeUnit: string;
    bottomGusset: string;
    flap: string;
    airHole: string;
    mixing: string;
    mixingData: MixMaterial[];
  };
  product?: {
    productType: string;
    specifications: any;
  };
  notes: string;
  features: {
    bottomGusset: boolean;
    flap: boolean;
    airHole: boolean;
  };
  printData?: {
    printWork: string;
    selectedFile: File | null;
  };
  stepData?: StepData;
  status: string;
  createdAt: string;
}

interface OrderState {
  currentOrder: OrderData | null;
  orders: OrderData[];
  loading: boolean;
  error: string | null;
  saveSuccess: boolean;
}

const initialState: OrderState = {
  currentOrder: null,
  orders: [],
  loading: false,
  error: null,
  saveSuccess: false,
};

// --- SLICE ---
const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    setCurrentOrder: (state, action: PayloadAction<OrderData>) => {
      state.currentOrder = action.payload;
    },
    updateOrderCustomer: (state, action: PayloadAction<OrderData['customer']>) => {
      if (state.currentOrder) state.currentOrder.customer = action.payload;
    },
    updateOrderMaterial: (state, action: PayloadAction<OrderData['material']>) => {
      if (state.currentOrder) state.currentOrder.material = action.payload;
    },
    updateOrderProduct: (state, action: PayloadAction<OrderData['product']>) => {
      if (state.currentOrder) state.currentOrder.product = action.payload;
    },
    updateOrderNotes: (state, action: PayloadAction<string>) => {
      if (state.currentOrder) state.currentOrder.notes = action.payload;
    },
    updateOrderFeatures: (state, action: PayloadAction<OrderData['features']>) => {
      if (state.currentOrder) state.currentOrder.features = action.payload;
    },
    updateOrderPrintData: (state, action: PayloadAction<OrderData['printData']>) => {
      if (state.currentOrder) state.currentOrder.printData = action.payload;
    },
    updateOrderStepData: (state, action: PayloadAction<StepData>) => {
      if (state.currentOrder) state.currentOrder.stepData = action.payload;
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
      state.saveSuccess = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearSaveSuccess: (state) => {
      state.saveSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(saveOrderToAPI.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.saveSuccess = false;
      })
      .addCase(saveOrderToAPI.fulfilled, (state, action) => {
        state.loading = false;
        state.saveSuccess = true;
        state.orders.push(action.payload);
        state.currentOrder = action.payload;
      })
      .addCase(saveOrderToAPI.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.saveSuccess = false;
      })
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});


export const {
  setCurrentOrder,
  updateOrderCustomer,
  updateOrderMaterial,
  updateOrderProduct,
  updateOrderNotes,
  updateOrderFeatures,
  updateOrderPrintData,
  updateOrderStepData,
  clearCurrentOrder,
  clearError,
  clearSaveSuccess,
} = orderSlice.actions;

export default orderSlice.reducer;