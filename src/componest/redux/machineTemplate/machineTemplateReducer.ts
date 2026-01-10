import {
  CREATE_MACHINE_TEMPLATE_REQUEST,
  CREATE_MACHINE_TEMPLATE_SUCCESS,
  CREATE_MACHINE_TEMPLATE_FAIL,
  GET_MACHINE_TEMPLATES_REQUEST,
  GET_MACHINE_TEMPLATES_SUCCESS,
  GET_MACHINE_TEMPLATES_FAIL,
  GET_MACHINE_TEMPLATE_BY_ID_REQUEST,
  GET_MACHINE_TEMPLATE_BY_ID_SUCCESS,
  GET_MACHINE_TEMPLATE_BY_ID_FAIL,
  GET_TEMPLATES_BY_MACHINE_REQUEST,
  GET_TEMPLATES_BY_MACHINE_SUCCESS,
  GET_TEMPLATES_BY_MACHINE_FAIL,
  UPDATE_MACHINE_TEMPLATE_REQUEST,
  UPDATE_MACHINE_TEMPLATE_SUCCESS,
  UPDATE_MACHINE_TEMPLATE_FAIL,
  DELETE_MACHINE_TEMPLATE_REQUEST,
  DELETE_MACHINE_TEMPLATE_SUCCESS,
  DELETE_MACHINE_TEMPLATE_FAIL,
  ACTIVATE_MACHINE_TEMPLATE_REQUEST,
  ACTIVATE_MACHINE_TEMPLATE_SUCCESS,
  ACTIVATE_MACHINE_TEMPLATE_FAIL,
  DEACTIVATE_MACHINE_TEMPLATE_REQUEST,
  DEACTIVATE_MACHINE_TEMPLATE_SUCCESS,
  DEACTIVATE_MACHINE_TEMPLATE_FAIL,
  DUPLICATE_MACHINE_TEMPLATE_REQUEST,
  DUPLICATE_MACHINE_TEMPLATE_SUCCESS,
  DUPLICATE_MACHINE_TEMPLATE_FAIL,
  WS_MACHINE_TEMPLATE_CREATED,
  WS_MACHINE_TEMPLATE_UPDATED,
  WS_MACHINE_TEMPLATE_DELETED,
  WS_MACHINE_TEMPLATE_ACTIVATED,
  WS_MACHINE_TEMPLATE_DEACTIVATED,
  WS_MACHINE_TEMPLATE_DUPLICATED,
  CLEAR_MACHINE_TEMPLATE_ERROR
} from "./machineTemplateConstants";

// Import V2 action types from unified API
import {
  TEMPLATE_V2_CREATE_REQUEST,
  TEMPLATE_V2_CREATE_SUCCESS,
  TEMPLATE_V2_CREATE_FAILURE,
  TEMPLATE_V2_LIST_REQUEST,
  TEMPLATE_V2_LIST_SUCCESS,
  TEMPLATE_V2_LIST_FAILURE,
  TEMPLATE_V2_GET_REQUEST,
  TEMPLATE_V2_GET_SUCCESS,
  TEMPLATE_V2_GET_FAILURE,
  TEMPLATE_V2_UPDATE_REQUEST,
  TEMPLATE_V2_UPDATE_SUCCESS,
  TEMPLATE_V2_UPDATE_FAILURE,
  TEMPLATE_V2_DELETE_REQUEST,
  TEMPLATE_V2_DELETE_SUCCESS,
  TEMPLATE_V2_DELETE_FAILURE
} from "../unifiedV2/templateActions";

// Types
export interface MachineTemplate {
  _id: string;
  machineId: string;
  orderTypeId: string;
  templateName: string;
  description?: string;
  columns: any[];
  customerFields?: any;
  totalsConfig?: any[];
  completionConfig?: any;
  isActive: boolean;
  branchId: string;
  createdAt?: string;
  updatedAt?: string;
  machine?: any;
  orderType?: any;
}

interface MachineTemplateState {
  loading: boolean;
  error: string | null;
  templates: MachineTemplate[];
  template: MachineTemplate | null;
  machineTemplates: MachineTemplate[];
  success: boolean;
}

// Initial State
const initialState: MachineTemplateState = {
  loading: false,
  error: null,
  templates: [],
  template: null,
  machineTemplates: [],
  success: false
};

// Main Reducer
const machineTemplateReducer = (
  state = initialState,
  action: any
): MachineTemplateState => {
  switch (action.type) {
    // Create (old and V2)
    case CREATE_MACHINE_TEMPLATE_REQUEST:
    case TEMPLATE_V2_CREATE_REQUEST:
      return { ...state, loading: true, error: null, success: false };
    case CREATE_MACHINE_TEMPLATE_SUCCESS:
    case TEMPLATE_V2_CREATE_SUCCESS:
      return {
        ...state,
        loading: false,
        template: action.payload.template || action.payload,
        templates: [...state.templates, action.payload.template || action.payload],
        success: true,
        error: null
      };
    case CREATE_MACHINE_TEMPLATE_FAIL:
    case TEMPLATE_V2_CREATE_FAILURE:
      return { ...state, loading: false, error: action.payload, success: false };

    // Get All (old and V2)
    case GET_MACHINE_TEMPLATES_REQUEST:
    case TEMPLATE_V2_LIST_REQUEST:
      return { ...state, loading: true, error: null };
    case GET_MACHINE_TEMPLATES_SUCCESS:
    case TEMPLATE_V2_LIST_SUCCESS:
      return {
        ...state,
        loading: false,
        templates: action.payload.templates || action.payload,
        error: null
      };
    case GET_MACHINE_TEMPLATES_FAIL:
    case TEMPLATE_V2_LIST_FAILURE:
      return { ...state, loading: false, error: action.payload, templates: [] };

    // Get by ID (old and V2)
    case GET_MACHINE_TEMPLATE_BY_ID_REQUEST:
    case TEMPLATE_V2_GET_REQUEST:
      return { ...state, loading: true, error: null };
    case GET_MACHINE_TEMPLATE_BY_ID_SUCCESS:
    case TEMPLATE_V2_GET_SUCCESS:
      return {
        ...state,
        loading: false,
        template: action.payload.template || action.payload,
        error: null
      };
    case GET_MACHINE_TEMPLATE_BY_ID_FAIL:
    case TEMPLATE_V2_GET_FAILURE:
      return { ...state, loading: false, error: action.payload };

    // Get by Machine
    case GET_TEMPLATES_BY_MACHINE_REQUEST:
      return { ...state, loading: true, error: null };
    case GET_TEMPLATES_BY_MACHINE_SUCCESS:
      return {
        ...state,
        loading: false,
        machineTemplates: action.payload.templates || action.payload,
        error: null
      };
    case GET_TEMPLATES_BY_MACHINE_FAIL:
      return { ...state, loading: false, error: action.payload, machineTemplates: [] };

    // Update (old and V2)
    case UPDATE_MACHINE_TEMPLATE_REQUEST:
    case TEMPLATE_V2_UPDATE_REQUEST:
      return { ...state, loading: true, error: null, success: false };
    case UPDATE_MACHINE_TEMPLATE_SUCCESS:
    case TEMPLATE_V2_UPDATE_SUCCESS:
      const updatedTemplate = action.payload.template || action.payload;
      return {
        ...state,
        loading: false,
        template: updatedTemplate,
        templates: state.templates.map(t =>
          t._id === updatedTemplate._id ? updatedTemplate : t
        ),
        machineTemplates: state.machineTemplates.map(t =>
          t._id === updatedTemplate._id ? updatedTemplate : t
        ),
        success: true,
        error: null
      };
    case UPDATE_MACHINE_TEMPLATE_FAIL:
    case TEMPLATE_V2_UPDATE_FAILURE:
      return { ...state, loading: false, error: action.payload, success: false };

    // Delete (old and V2)
    case DELETE_MACHINE_TEMPLATE_REQUEST:
    case TEMPLATE_V2_DELETE_REQUEST:
      return { ...state, loading: true, error: null, success: false };
    case DELETE_MACHINE_TEMPLATE_SUCCESS:
    case TEMPLATE_V2_DELETE_SUCCESS:
      const deletedId = action.payload.id || action.payload._id || action.payload;
      return {
        ...state,
        loading: false,
        templates: state.templates.filter(t => t._id !== deletedId),
        machineTemplates: state.machineTemplates.filter(t => t._id !== deletedId),
        success: true,
        error: null
      };
    case DELETE_MACHINE_TEMPLATE_FAIL:
    case TEMPLATE_V2_DELETE_FAILURE:
      return { ...state, loading: false, error: action.payload, success: false };

    // Activate
    case ACTIVATE_MACHINE_TEMPLATE_REQUEST:
      return { ...state, loading: true, error: null };
    case ACTIVATE_MACHINE_TEMPLATE_SUCCESS:
      const activatedTemplate = action.payload.template || action.payload;
      return {
        ...state,
        loading: false,
        template: activatedTemplate,
        templates: state.templates.map(t =>
          t._id === activatedTemplate._id ? { ...t, isActive: true } : t
        ),
        machineTemplates: state.machineTemplates.map(t =>
          t._id === activatedTemplate._id ? { ...t, isActive: true } : t
        ),
        error: null
      };
    case ACTIVATE_MACHINE_TEMPLATE_FAIL:
      return { ...state, loading: false, error: action.payload };

    // Deactivate
    case DEACTIVATE_MACHINE_TEMPLATE_REQUEST:
      return { ...state, loading: true, error: null };
    case DEACTIVATE_MACHINE_TEMPLATE_SUCCESS:
      const deactivatedTemplate = action.payload.template || action.payload;
      return {
        ...state,
        loading: false,
        template: deactivatedTemplate,
        templates: state.templates.map(t =>
          t._id === deactivatedTemplate._id ? { ...t, isActive: false } : t
        ),
        machineTemplates: state.machineTemplates.map(t =>
          t._id === deactivatedTemplate._id ? { ...t, isActive: false } : t
        ),
        error: null
      };
    case DEACTIVATE_MACHINE_TEMPLATE_FAIL:
      return { ...state, loading: false, error: action.payload };

    // Duplicate
    case DUPLICATE_MACHINE_TEMPLATE_REQUEST:
      return { ...state, loading: true, error: null, success: false };
    case DUPLICATE_MACHINE_TEMPLATE_SUCCESS:
      const duplicatedTemplate = action.payload.template || action.payload;
      return {
        ...state,
        loading: false,
        template: duplicatedTemplate,
        templates: [...state.templates, duplicatedTemplate],
        success: true,
        error: null
      };
    case DUPLICATE_MACHINE_TEMPLATE_FAIL:
      return { ...state, loading: false, error: action.payload, success: false };

    // WebSocket Events - real-time updates
    case WS_MACHINE_TEMPLATE_CREATED:
      const wsCreatedTemplate = action.payload;
      // Avoid duplicates
      if (state.templates.find(t => t._id === wsCreatedTemplate._id)) {
        return state;
      }
      return {
        ...state,
        templates: [...state.templates, wsCreatedTemplate]
      };

    case WS_MACHINE_TEMPLATE_UPDATED:
    case WS_MACHINE_TEMPLATE_ACTIVATED:
    case WS_MACHINE_TEMPLATE_DEACTIVATED:
      const wsUpdatedTemplate = action.payload;
      return {
        ...state,
        templates: state.templates.map(t =>
          t._id === wsUpdatedTemplate._id ? wsUpdatedTemplate : t
        ),
        machineTemplates: state.machineTemplates.map(t =>
          t._id === wsUpdatedTemplate._id ? wsUpdatedTemplate : t
        ),
        template: state.template?._id === wsUpdatedTemplate._id
          ? wsUpdatedTemplate
          : state.template
      };

    case WS_MACHINE_TEMPLATE_DELETED:
      const wsDeletedId = action.payload._id || action.payload.id;
      return {
        ...state,
        templates: state.templates.filter(t => t._id !== wsDeletedId),
        machineTemplates: state.machineTemplates.filter(t => t._id !== wsDeletedId),
        template: state.template?._id === wsDeletedId ? null : state.template
      };

    case WS_MACHINE_TEMPLATE_DUPLICATED:
      const wsDuplicatedTemplate = action.payload;
      if (state.templates.find(t => t._id === wsDuplicatedTemplate._id)) {
        return state;
      }
      return {
        ...state,
        templates: [...state.templates, wsDuplicatedTemplate]
      };

    // Clear Error
    case CLEAR_MACHINE_TEMPLATE_ERROR:
      return { ...state, error: null, success: false };

    default:
      return state;
  }
};

export default machineTemplateReducer;
