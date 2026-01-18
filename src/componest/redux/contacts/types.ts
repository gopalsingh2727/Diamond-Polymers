/**
 * Contacts Redux Type Definitions
 */

export interface Contact {
  _id: string;
  userId: string;
  userRole: string;
  userName: string;
  userEmail: string;
  connectedAt: string;
  branchId?: string;
  branchName?: string;
  companyId?: string;
  companyName?: string;
}

export interface ContactRequest {
  _id: string;
  fromUserId: string;
  fromUserRole: string;
  fromUserName: string;
  fromUserEmail: string;
  toUserId: string;
  toUserName?: string;
  message?: string;
  status: 'pending' | 'accepted' | 'denied';
  requestedAt: string;
}

export interface Person {
  _id: string;
  role: 'master_admin' | 'admin' | 'manager' | 'employee';
  roleName: string;
  username: string;
  email: string;
  fullName?: string;
  designation?: string;
  branchName: string;
  companyName?: string;
  isSameCompany?: boolean;
  isConnected?: boolean;
  hasPendingRequest?: boolean;
  pendingRequestDirection?: 'sent' | 'received' | null;
}

export interface ContactsState {
  // My contacts (connected people)
  contacts: Contact[];
  contactsLoading: boolean;
  contactsError: string | null;

  // Pending requests (received)
  pendingRequests: ContactRequest[];
  pendingLoading: boolean;
  pendingError: string | null;

  // Sent requests
  sentRequests: ContactRequest[];
  sentLoading: boolean;
  sentError: string | null;

  // All people (for searching/sending requests)
  allPeople: Person[];
  peopleLoading: boolean;
  peopleError: string | null;

  // UI state
  actionLoading: boolean;
  actionError: string | null;
  actionSuccess: string | null;
}
