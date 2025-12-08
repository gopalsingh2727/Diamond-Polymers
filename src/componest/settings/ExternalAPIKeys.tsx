import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "../redux/rootReducer";
import { InfinitySpinner } from "../../components/InfinitySpinner";
import { externalAPIKeyAPI, branchAPI } from "../../utils/crudHelpers";

interface Branch {
  _id: string;
  name: string;
  code: string;
}

interface APIKey {
  _id: string;
  name: string;
  description?: string;
  apiKey: string;
  branchId: Branch;
  permissions: {
    createOrder: boolean;
    getOrderStatus: boolean;
    getOrderDetails: boolean;
    updateOrder: boolean;
    cancelOrder: boolean;
    listOrders: boolean;
    webhookAccess: boolean;
  };
  rateLimit: {
    requestsPerMinute: number;
    requestsPerDay: number;
  };
  webhook: {
    enabled: boolean;
    url?: string;
    events?: string[];
  };
  ipWhitelist: string[];
  isActive: boolean;
  totalRequests: number;
  todayRequests: number;
  lastUsedAt?: string;
  createdAt: string;
}

interface CreateAPIKeyData {
  name: string;
  description?: string;
  branchId: string;
  permissions?: Record<string, boolean>;
  rateLimit?: {
    requestsPerMinute?: number;
    requestsPerDay?: number;
  };
  webhook?: {
    enabled: boolean;
    url?: string;
    events?: string[];
  };
  ipWhitelist?: string[];
}

const ExternalAPIKeys = () => {
  const navigate = useNavigate();
  const { userData } = useSelector((state: RootState) => state.auth);

  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSecretModal, setShowSecretModal] = useState(false);
  const [newCredentials, setNewCredentials] = useState<{
    apiKey: string;
    apiSecret: string;
    webhookSecret?: string;
  } | null>(null);
  const [creating, setCreating] = useState(false);
  const [selectedKey, setSelectedKey] = useState<APIKey | null>(null);

  // Form state
  const [formData, setFormData] = useState<CreateAPIKeyData>({
    name: "",
    description: "",
    branchId: "",
    permissions: {
      createOrder: true,
      getOrderStatus: true,
      getOrderDetails: false,
      updateOrder: false,
      cancelOrder: false,
      listOrders: false,
      webhookAccess: true,
    },
    rateLimit: {
      requestsPerMinute: 60,
      requestsPerDay: 10000,
    },
    webhook: {
      enabled: false,
      url: "",
      events: [],
    },
    ipWhitelist: [],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError("");

    try {
      const [keysRes, branchesRes] = await Promise.all([
        externalAPIKeyAPI.getAll(),
        branchAPI.getAll(),
      ]);

      setApiKeys(keysRes.data?.apiKeys || []);
      setBranches(branchesRes.data?.branches || branchesRes.branches || []);
    } catch (err: any) {
      console.error("Failed to fetch data:", err);
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.name || !formData.branchId) {
      setError("Name and Branch are required");
      return;
    }

    setCreating(true);
    setError("");

    try {
      const result = await externalAPIKeyAPI.create(formData);
      if (result.success) {
        setNewCredentials({
          apiKey: result.data.apiKey,
          apiSecret: result.data.apiSecret,
          webhookSecret: result.data.webhookSecret,
        });
        setShowCreateModal(false);
        setShowSecretModal(true);
        fetchData();
        // Reset form
        setFormData({
          name: "",
          description: "",
          branchId: "",
          permissions: {
            createOrder: true,
            getOrderStatus: true,
            getOrderDetails: false,
            updateOrder: false,
            cancelOrder: false,
            listOrders: false,
            webhookAccess: true,
          },
          rateLimit: {
            requestsPerMinute: 60,
            requestsPerDay: 10000,
          },
          webhook: {
            enabled: false,
            url: "",
            events: [],
          },
          ipWhitelist: [],
        });
      }
    } catch (err: any) {
      setError(err.message || "Failed to create API key");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this API key? This action cannot be undone.")) {
      return;
    }

    try {
      await externalAPIKeyAPI.delete(id);
      fetchData();
    } catch (err: any) {
      setError(err.message || "Failed to delete API key");
    }
  };

  const handleRegenerateSecret = async (id: string) => {
    if (!confirm("Are you sure you want to regenerate the API secret? The old secret will stop working immediately.")) {
      return;
    }

    try {
      const result = await externalAPIKeyAPI.regenerateSecret(id);
      if (result.success) {
        setNewCredentials({
          apiKey: "",
          apiSecret: result.data.apiSecret,
        });
        setShowSecretModal(true);
      }
    } catch (err: any) {
      setError(err.message || "Failed to regenerate secret");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  // Only master_admin can access this page
  if (userData?.role !== "master_admin") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Access Denied</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Only Master Admin can manage External API Keys.</p>
          <button
            onClick={() => navigate("/")}
            className="bg-[#FF6B35] hover:bg-[#E55A2B] text-white font-medium py-2 px-6 rounded-lg transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition"
            >
              <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">External API Keys</h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Manage API keys for website integrations</p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-[#FF6B35] hover:bg-[#E55A2B] text-white font-medium py-2 px-4 rounded-lg transition flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create API Key
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <InfinitySpinner size="lg" />
            <p className="text-gray-500 dark:text-gray-400 mt-4">Loading API keys...</p>
          </div>
        ) : apiKeys.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">No API Keys Yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Create your first API key to enable external integrations.</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-[#FF6B35] hover:bg-[#E55A2B] text-white font-medium py-2 px-4 rounded-lg transition"
            >
              Create API Key
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {apiKeys.map((key) => (
              <div
                key={key._id}
                className={`bg-white dark:bg-gray-800 rounded-xl shadow p-6 ${!key.isActive ? "opacity-60" : ""}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{key.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        key.isActive
                          ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-400"
                          : "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-400"
                      }`}>
                        {key.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    {key.description && (
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">{key.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <span>Branch: {key.branchId?.name || "Unknown"}</span>
                      <span>|</span>
                      <span>Created: {new Date(key.createdAt).toLocaleDateString()}</span>
                      {key.lastUsedAt && (
                        <>
                          <span>|</span>
                          <span>Last used: {new Date(key.lastUsedAt).toLocaleDateString()}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRegenerateSecret(key._id)}
                      className="p-2 text-gray-500 hover:text-[#FF6B35] hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                      title="Regenerate Secret"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(key._id)}
                      className="p-2 text-gray-500 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                      title="Delete"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* API Key Display */}
                <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">API Key</p>
                      <code className="text-sm font-mono text-gray-800 dark:text-gray-200">{key.apiKey}</code>
                    </div>
                    <button
                      onClick={() => copyToClipboard(key.apiKey)}
                      className="p-2 text-gray-500 hover:text-[#FF6B35] rounded transition"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Usage Stats */}
                <div className="mt-4 grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-2xl font-bold text-gray-800 dark:text-white">{key.totalRequests || 0}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Total Requests</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-2xl font-bold text-gray-800 dark:text-white">{key.todayRequests || 0}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Today</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-2xl font-bold text-gray-800 dark:text-white">{key.rateLimit?.requestsPerDay || 10000}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Daily Limit</p>
                  </div>
                </div>

                {/* Permissions */}
                <div className="mt-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Permissions</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(key.permissions || {}).map(([perm, enabled]) => (
                      enabled && (
                        <span key={perm} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-400 text-xs rounded-full">
                          {perm.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                      )
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">Create External API Key</h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Create a new API key for website integration</p>
            </div>

            <div className="p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#FF6B35] dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., Main Website API"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#FF6B35] dark:bg-gray-700 dark:text-white"
                  rows={2}
                  placeholder="Optional description"
                />
              </div>

              {/* Branch */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Branch *
                </label>
                <select
                  value={formData.branchId}
                  onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                  className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#FF6B35] dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select a branch</option>
                  {branches.map((branch) => (
                    <option key={branch._id} value={branch._id}>
                      {branch.name} ({branch.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Permissions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Permissions
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(formData.permissions || {}).map(([perm, enabled]) => (
                    <label key={perm} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={enabled}
                        onChange={(e) => setFormData({
                          ...formData,
                          permissions: { ...formData.permissions, [perm]: e.target.checked }
                        })}
                        className="rounded text-[#FF6B35] focus:ring-[#FF6B35]"
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {perm.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Rate Limits */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Requests/Minute
                  </label>
                  <input
                    type="number"
                    value={formData.rateLimit?.requestsPerMinute || 60}
                    onChange={(e) => setFormData({
                      ...formData,
                      rateLimit: { ...formData.rateLimit!, requestsPerMinute: parseInt(e.target.value) }
                    })}
                    className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#FF6B35] dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Requests/Day
                  </label>
                  <input
                    type="number"
                    value={formData.rateLimit?.requestsPerDay || 10000}
                    onChange={(e) => setFormData({
                      ...formData,
                      rateLimit: { ...formData.rateLimit!, requestsPerDay: parseInt(e.target.value) }
                    })}
                    className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#FF6B35] dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              {/* Webhook */}
              <div>
                <label className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    checked={formData.webhook?.enabled || false}
                    onChange={(e) => setFormData({
                      ...formData,
                      webhook: { ...formData.webhook!, enabled: e.target.checked }
                    })}
                    className="rounded text-[#FF6B35] focus:ring-[#FF6B35]"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Enable Webhook</span>
                </label>
                {formData.webhook?.enabled && (
                  <input
                    type="url"
                    value={formData.webhook?.url || ""}
                    onChange={(e) => setFormData({
                      ...formData,
                      webhook: { ...formData.webhook!, url: e.target.value }
                    })}
                    className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#FF6B35] dark:bg-gray-700 dark:text-white"
                    placeholder="https://your-website.com/webhook"
                  />
                )}
              </div>
            </div>

            <div className="p-6 border-t dark:border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={creating}
                className="px-4 py-2 bg-[#FF6B35] hover:bg-[#E55A2B] text-white rounded-lg transition disabled:opacity-50"
              >
                {creating ? "Creating..." : "Create API Key"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Secret Modal */}
      {showSecretModal && newCredentials && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg">
            <div className="p-6 border-b dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white">Save Your Credentials</h2>
                  <p className="text-yellow-600 dark:text-yellow-400 text-sm">These secrets will only be shown once!</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {newCredentials.apiKey && (
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">API Key</p>
                    <button
                      onClick={() => copyToClipboard(newCredentials.apiKey)}
                      className="text-[#FF6B35] hover:text-[#E55A2B] text-sm"
                    >
                      Copy
                    </button>
                  </div>
                  <code className="block text-sm font-mono text-gray-800 dark:text-gray-200 break-all">
                    {newCredentials.apiKey}
                  </code>
                </div>
              )}

              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">API Secret</p>
                  <button
                    onClick={() => copyToClipboard(newCredentials.apiSecret)}
                    className="text-[#FF6B35] hover:text-[#E55A2B] text-sm"
                  >
                    Copy
                  </button>
                </div>
                <code className="block text-sm font-mono text-gray-800 dark:text-gray-200 break-all">
                  {newCredentials.apiSecret}
                </code>
              </div>

              {newCredentials.webhookSecret && (
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Webhook Secret</p>
                    <button
                      onClick={() => copyToClipboard(newCredentials.webhookSecret!)}
                      className="text-[#FF6B35] hover:text-[#E55A2B] text-sm"
                    >
                      Copy
                    </button>
                  </div>
                  <code className="block text-sm font-mono text-gray-800 dark:text-gray-200 break-all">
                    {newCredentials.webhookSecret}
                  </code>
                </div>
              )}

              <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-700 dark:text-red-400 text-sm">
                  <strong>Important:</strong> Save these credentials securely. The API Secret will never be shown again. If lost, you'll need to regenerate a new one.
                </p>
              </div>
            </div>

            <div className="p-6 border-t dark:border-gray-700">
              <button
                onClick={() => {
                  setShowSecretModal(false);
                  setNewCredentials(null);
                }}
                className="w-full px-4 py-2 bg-[#FF6B35] hover:bg-[#E55A2B] text-white rounded-lg transition"
              >
                I've Saved My Credentials
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExternalAPIKeys;
