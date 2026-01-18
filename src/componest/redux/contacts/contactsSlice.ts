import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { ContactsState, Contact, ContactRequest, Person } from './types';

const initialState: ContactsState = {
  contacts: [],
  contactsLoading: false,
  contactsError: null,

  pendingRequests: [],
  pendingLoading: false,
  pendingError: null,

  sentRequests: [],
  sentLoading: false,
  sentError: null,

  allPeople: [],
  peopleLoading: false,
  peopleError: null,

  actionLoading: false,
  actionError: null,
  actionSuccess: null,
};

const contactsSlice = createSlice({
  name: 'contacts',
  initialState,
  reducers: {
    // ==========================================
    // Fetch Contacts
    // ==========================================
    fetchContactsStart: (state) => {
      state.contactsLoading = true;
      state.contactsError = null;
    },
    fetchContactsSuccess: (state, action: PayloadAction<Contact[]>) => {
      state.contactsLoading = false;
      state.contacts = action.payload;
    },
    fetchContactsFailure: (state, action: PayloadAction<string>) => {
      state.contactsLoading = false;
      state.contactsError = action.payload;
    },

    // ==========================================
    // Fetch Pending Requests
    // ==========================================
    fetchPendingStart: (state) => {
      state.pendingLoading = true;
      state.pendingError = null;
    },
    fetchPendingSuccess: (state, action: PayloadAction<ContactRequest[]>) => {
      state.pendingLoading = false;
      state.pendingRequests = action.payload;
    },
    fetchPendingFailure: (state, action: PayloadAction<string>) => {
      state.pendingLoading = false;
      state.pendingError = action.payload;
    },

    // ==========================================
    // Fetch Sent Requests
    // ==========================================
    fetchSentStart: (state) => {
      state.sentLoading = true;
      state.sentError = null;
    },
    fetchSentSuccess: (state, action: PayloadAction<ContactRequest[]>) => {
      state.sentLoading = false;
      state.sentRequests = action.payload;
    },
    fetchSentFailure: (state, action: PayloadAction<string>) => {
      state.sentLoading = false;
      state.sentError = action.payload;
    },

    // ==========================================
    // Fetch All People
    // ==========================================
    fetchPeopleStart: (state) => {
      state.peopleLoading = true;
      state.peopleError = null;
    },
    fetchPeopleSuccess: (state, action: PayloadAction<Person[]>) => {
      state.peopleLoading = false;
      state.allPeople = action.payload;
    },
    fetchPeopleFailure: (state, action: PayloadAction<string>) => {
      state.peopleLoading = false;
      state.peopleError = action.payload;
    },

    // ==========================================
    // Action States (send, accept, deny, remove)
    // ==========================================
    actionStart: (state) => {
      state.actionLoading = true;
      state.actionError = null;
      state.actionSuccess = null;
    },
    actionSuccess: (state, action: PayloadAction<string>) => {
      state.actionLoading = false;
      state.actionSuccess = action.payload;
    },
    actionFailure: (state, action: PayloadAction<string>) => {
      state.actionLoading = false;
      state.actionError = action.payload;
    },

    // ==========================================
    // Clear Messages
    // ==========================================
    clearMessages: (state) => {
      state.actionError = null;
      state.actionSuccess = null;
    },

    // ==========================================
    // Clear State (on logout)
    // ==========================================
    clearContactsState: () => initialState,
  },
});

export const {
  fetchContactsStart,
  fetchContactsSuccess,
  fetchContactsFailure,
  fetchPendingStart,
  fetchPendingSuccess,
  fetchPendingFailure,
  fetchSentStart,
  fetchSentSuccess,
  fetchSentFailure,
  fetchPeopleStart,
  fetchPeopleSuccess,
  fetchPeopleFailure,
  actionStart,
  actionSuccess,
  actionFailure,
  clearMessages,
  clearContactsState,
} = contactsSlice.actions;

export default contactsSlice.reducer;
