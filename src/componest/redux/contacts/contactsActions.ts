import { Dispatch } from 'redux';
import {
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
} from './contactsSlice';

// API Base URL
const API_BASE = import.meta.env.VITE_API_27INFINITY_IN || 'http://localhost:4000/dev';
const API_KEY = import.meta.env.VITE_API_KEY || '';

// Helper functions
const getToken = (): string => {
  const token = localStorage.getItem('authToken') || '';
  return token;
};

const getBranchId = (): string => {
  return localStorage.getItem('selectedBranchId') || localStorage.getItem('selectedBranch') || '';
};

const getAuthHeaders = () => {
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${getToken()}`,
    'x-api-key': API_KEY,
    'Content-Type': 'application/json',
  };

  const branchId = getBranchId();
  if (branchId) {
    headers['x-selected-branch'] = branchId;
  }

  return headers;
};

/**
 * 1. Fetch My Contacts
 * GET /v2/contacts
 */
export const fetchContacts = () => async (dispatch: Dispatch) => {
  try {
    dispatch(fetchContactsStart());

    console.log('[Contacts Actions] Fetching contacts...');

    const response = await fetch(`${API_BASE}/v2/contacts`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    console.log('[Contacts Actions] Contacts response:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Contacts Actions] Failed to fetch contacts:', errorText);
      throw new Error(`Failed to fetch contacts: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('[Contacts Actions] Contacts data:', data);

    dispatch(fetchContactsSuccess(data.data || []));
  } catch (error: any) {
    console.error('[Contacts Actions] Error fetching contacts:', error);
    dispatch(fetchContactsFailure(error.message || 'Failed to fetch contacts'));
  }
};

/**
 * 2. Fetch Pending Requests (Received)
 * GET /v2/contacts/pending
 */
export const fetchPendingRequests = () => async (dispatch: Dispatch) => {
  try {
    dispatch(fetchPendingStart());

    console.log('[Contacts Actions] Fetching pending requests...');

    const response = await fetch(`${API_BASE}/v2/contacts/pending`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch pending requests: ${response.statusText}`);
    }

    const data = await response.json();
    dispatch(fetchPendingSuccess(data.data || []));
  } catch (error: any) {
    console.error('[Contacts Actions] Error fetching pending requests:', error);
    dispatch(fetchPendingFailure(error.message || 'Failed to fetch pending requests'));
  }
};

/**
 * 3. Fetch Sent Requests
 * GET /v2/contacts/sent
 */
export const fetchSentRequests = () => async (dispatch: Dispatch) => {
  try {
    dispatch(fetchSentStart());

    console.log('[Contacts Actions] Fetching sent requests...');

    const response = await fetch(`${API_BASE}/v2/contacts/sent`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch sent requests: ${response.statusText}`);
    }

    const data = await response.json();
    dispatch(fetchSentSuccess(data.data || []));
  } catch (error: any) {
    console.error('[Contacts Actions] Error fetching sent requests:', error);
    dispatch(fetchSentFailure(error.message || 'Failed to fetch sent requests'));
  }
};

/**
 * 4. Search Users (for sending requests)
 * GET /v2/contacts/search?search=term
 * Requires minimum 3 characters
 */
export const fetchAllPeople = (searchTerm: string = '') => async (dispatch: Dispatch) => {
  try {
    dispatch(fetchPeopleStart());

    console.log('[Contacts Actions] Searching users with term:', searchTerm);

    // If search term is less than 3 characters, return empty
    if (searchTerm.trim().length < 3) {
      console.log('[Contacts Actions] Search term too short, returning empty');
      dispatch(fetchPeopleSuccess([]));
      return;
    }

    const response = await fetch(`${API_BASE}/v2/contacts/search?search=${encodeURIComponent(searchTerm)}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    console.log('[Contacts Actions] Search response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Contacts Actions] Error response:', errorText);
      throw new Error(`Failed to search users: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('[Contacts Actions] Search data:', data);
    console.log('[Contacts Actions] Users found:', data.data?.length || 0);

    if (data.data && data.data.length > 0) {
      console.log('[Contacts Actions] First user:', data.data[0]);
    }

    dispatch(fetchPeopleSuccess(data.data || []));
  } catch (error: any) {
    console.error('[Contacts Actions] Error searching users:', error);
    dispatch(fetchPeopleFailure(error.message || 'Failed to search users'));
  }
};

/**
 * 5. Send Connection Request
 * POST /v2/contacts/request
 */
export const sendConnectionRequest = (
  toUserId: string,
  toUserRole: string,
  message?: string
) => async (dispatch: Dispatch) => {
  try {
    dispatch(actionStart());

    console.log('[Contacts Actions] Sending connection request to:', toUserId);

    const response = await fetch(`${API_BASE}/v2/contacts/request`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        toUserId,
        toUserRole,
        message: message?.trim() || ''
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to send request: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('[Contacts Actions] Request sent successfully:', data);

    dispatch(actionSuccess(data.message || 'Connection request sent!'));

    // Refresh sent requests
    dispatch(fetchSentRequests() as any);
  } catch (error: any) {
    console.error('[Contacts Actions] Error sending request:', error);
    dispatch(actionFailure(error.message || 'Failed to send request'));
  }
};

/**
 * 6. Accept Connection Request
 * POST /v2/contacts/respond
 */
export const acceptConnectionRequest = (requestId: string) => async (dispatch: Dispatch) => {
  try {
    dispatch(actionStart());

    console.log('[Contacts Actions] Accepting request:', requestId);

    const response = await fetch(`${API_BASE}/v2/contacts/respond`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        requestId,
        action: 'accept'
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to accept request: ${response.statusText}`);
    }

    const data = await response.json();
    dispatch(actionSuccess(data.message || 'Connection accepted!'));

    // Refresh all tabs: pending, contacts, and sent
    dispatch(fetchPendingRequests() as any);
    dispatch(fetchContacts() as any);
    dispatch(fetchSentRequests() as any);
  } catch (error: any) {
    console.error('[Contacts Actions] Error accepting request:', error);
    dispatch(actionFailure(error.message || 'Failed to accept request'));
  }
};

/**
 * 7. Deny Connection Request
 * POST /v2/contacts/respond
 */
export const denyConnectionRequest = (requestId: string) => async (dispatch: Dispatch) => {
  try {
    dispatch(actionStart());

    console.log('[Contacts Actions] Denying request:', requestId);

    const response = await fetch(`${API_BASE}/v2/contacts/respond`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        requestId,
        action: 'deny'
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to deny request: ${response.statusText}`);
    }

    const data = await response.json();
    dispatch(actionSuccess(data.message || 'Request denied'));

    // Refresh pending and sent requests
    dispatch(fetchPendingRequests() as any);
    dispatch(fetchSentRequests() as any);
  } catch (error: any) {
    console.error('[Contacts Actions] Error denying request:', error);
    dispatch(actionFailure(error.message || 'Failed to deny request'));
  }
};

/**
 * 8. Remove Connection
 * DELETE /v2/contacts/:contactId
 */
export const removeConnection = (contactId: string, contactName: string) => async (dispatch: Dispatch) => {
  try {
    dispatch(actionStart());

    console.log('[Contacts Actions] Removing connection:', contactId);

    const response = await fetch(`${API_BASE}/v2/contacts/${contactId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to remove connection: ${response.statusText}`);
    }

    const data = await response.json();
    dispatch(actionSuccess(data.message || `Removed ${contactName} from connections`));

    // Refresh contacts
    dispatch(fetchContacts() as any);
  } catch (error: any) {
    console.error('[Contacts Actions] Error removing connection:', error);
    dispatch(actionFailure(error.message || 'Failed to remove connection'));
  }
};
