import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "../redux/rootReducer";
import { InfinitySpinner } from "../../components/InfinitySpinner";
import { branchAPI, branchSettingsAPI, externalAPIKeyAPI } from "../../utils/crudHelpers";

type TabType = "email" | "whatsapp" | "api";

interface Branch {
  _id: string;
  name: string;
  code: string;
}

interface BranchSetting {
  branchId: string;
  email?: {
    provider: string;
    host?: string;
    port?: number;
    username?: string;
    fromEmail?: string;
    fromName?: string;
    isEnabled: boolean;
  };
  whatsapp?: {
    provider: string;
    phoneNumberId?: string;
    businessAccountId?: string;
    isEnabled: boolean;
  };
}

interface APIKey {
  _id: string;
  name: string;
  apiKey: string;
  branchId: { _id: string; name: string; code: string };
  permissions: string[];
  isActive: boolean;
  rateLimit: { requestsPerMinute: number; requestsPerDay: number };
  createdAt: string;
  lastUsedAt?: string;
}

const MasterSettings = () => {
  const navigate = useNavigate();
  const { userData } = useSelector((state: RootState) => state.auth);
  const [activeTab, setActiveTab] = useState<TabType>("email");

  // Data states
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const [branchSettings, setBranchSettings] = useState<BranchSetting | null>(null);
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Email form state
  const [emailForm, setEmailForm] = useState({
    provider: "smtp",
    host: "",
    port: 587,
    username: "",
    password: "",
    fromEmail: "",
    fromName: "",
    isEnabled: false
  });

  // WhatsApp form state
  const [whatsappForm, setWhatsappForm] = useState({
    provider: "meta",
    phoneNumberId: "",
    businessAccountId: "",
    accessToken: "",
    isEnabled: false
  });

  // API Key form state
  const [showApiModal, setShowApiModal] = useState(false);
  const [editingApiKey, setEditingApiKey] = useState<APIKey | null>(null);
  const [apiForm, setApiForm] = useState({
    name: "",
    branchId: "",
    permissions: ["orders:read", "orders:create"],
    requestsPerMinute: 60,
    requestsPerDay: 10000
  });

  // Fetch branches on mount
  useEffect(() => {
    fetchBranches();
    if (activeTab === "api") fetchApiKeys();
  }, [activeTab]);

  // Fetch branch settings when branch is selected
  useEffect(() => {
    if (selectedBranch && (activeTab === "email" || activeTab === "whatsapp")) {
      fetchBranchSettings(selectedBranch);
    }
  }, [selectedBranch, activeTab]);

  const fetchBranches = async () => {
    try {
      const response = await branchAPI.getAll();
      const branchList = response.branches || response.data || [];
      setBranches(branchList);
      if (branchList.length > 0 && !selectedBranch) {
        setSelectedBranch(branchList[0]._id);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const fetchBranchSettings = async (branchId: string) => {
    setLoading(true);
    try {
      const response = await branchSettingsAPI.getByBranch(branchId);
      const settings = response.settings || response;
      setBranchSettings(settings);

      if (settings?.email) {
        setEmailForm({
          provider: settings.email.provider || "smtp",
          host: settings.email.host || "",
          port: settings.email.port || 587,
          username: settings.email.username || "",
          password: "",
          fromEmail: settings.email.fromEmail || "",
          fromName: settings.email.fromName || "",
          isEnabled: settings.email.isEnabled || false
        });
      }

      if (settings?.whatsapp) {
        setWhatsappForm({
          provider: settings.whatsapp.provider || "meta",
          phoneNumberId: settings.whatsapp.phoneNumberId || "",
          businessAccountId: settings.whatsapp.businessAccountId || "",
          accessToken: "",
          isEnabled: settings.whatsapp.isEnabled || false
        });
      }
    } catch (err: any) {
      // Settings might not exist yet, that's OK
      setBranchSettings(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchApiKeys = async () => {
    setLoading(true);
    try {
      const response = await externalAPIKeyAPI.getAll();
      setApiKeys(response.apiKeys || response.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const saveEmailSettings = async () => {
    if (!selectedBranch) return;
    setSaving(true);
    setError("");
    try {
      await branchSettingsAPI.update(selectedBranch, { email: emailForm });
      setSuccess("Email settings saved successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const saveWhatsappSettings = async () => {
    if (!selectedBranch) return;
    setSaving(true);
    setError("");
    try {
      await branchSettingsAPI.update(selectedBranch, { whatsapp: whatsappForm });
      setSuccess("WhatsApp settings saved successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const testEmail = async () => {
    if (!selectedBranch) return;
    const testEmailAddr = prompt("Enter email address to send test:");
    if (!testEmailAddr) return;

    try {
      await branchSettingsAPI.testEmail(selectedBranch, testEmailAddr);
      setSuccess("Test email sent successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const testWhatsapp = async () => {
    if (!selectedBranch) return;
    const testPhone = prompt("Enter phone number to send test (with country code):");
    if (!testPhone) return;

    try {
      await branchSettingsAPI.testWhatsApp(selectedBranch, testPhone);
      setSuccess("Test WhatsApp message sent successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const saveApiKey = async () => {
    setSaving(true);
    setError("");
    try {
      if (editingApiKey) {
        await externalAPIKeyAPI.update(editingApiKey._id, apiForm);
      } else {
        await externalAPIKeyAPI.create(apiForm);
      }
      setShowApiModal(false);
      setEditingApiKey(null);
      fetchApiKeys();
      setSuccess("API key saved successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteApiKey = async (id: string) => {
    if (!confirm("Are you sure you want to delete this API key?")) return;
    try {
      await externalAPIKeyAPI.delete(id);
      fetchApiKeys();
      setSuccess("API key deleted successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const openCreateApiModal = () => {
    setEditingApiKey(null);
    setApiForm({
      name: "",
      branchId: branches[0]?._id || "",
      permissions: ["orders:read", "orders:create"],
      requestsPerMinute: 60,
      requestsPerDay: 10000
    });
    setShowApiModal(true);
  };

  const openEditApiModal = (apiKey: APIKey) => {
    setEditingApiKey(apiKey);
    setApiForm({
      name: apiKey.name,
      branchId: apiKey.branchId._id,
      permissions: apiKey.permissions,
      requestsPerMinute: apiKey.rateLimit.requestsPerMinute,
      requestsPerDay: apiKey.rateLimit.requestsPerDay
    });
    setShowApiModal(true);
  };

  // Only master_admin can access
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
          <p className="text-gray-600 dark:text-gray-400 mb-4">Only Master Admin can access settings.</p>
          <button onClick={() => navigate("/")} className="bg-[#FF6B35] hover:bg-[#E55A2B] text-white font-medium py-2 px-6 rounded-lg transition">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "email" as TabType, name: "Email Settings", icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
    { id: "whatsapp" as TabType, name: "WhatsApp Settings", icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" },
    { id: "api" as TabType, name: "API Keys", icon: "M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate("/")} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">
                <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-800 dark:text-white">Master Settings</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Email, WhatsApp & API Configuration</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-[#FF6B35] text-white text-sm font-medium rounded-full">Master Admin</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto py-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${
                  activeTab === tab.id ? "bg-[#FF6B35] text-white" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                </svg>
                {tab.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 space-y-2">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center justify-between">
            <span className="text-red-700 dark:text-red-400">{error}</span>
            <button onClick={() => setError("")} className="text-red-500 hover:text-red-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        {success && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center justify-between">
            <span className="text-green-700 dark:text-green-400">{success}</span>
            <button onClick={() => setSuccess("")} className="text-green-500 hover:text-green-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading && <div className="flex justify-center py-12"><InfinitySpinner /></div>}

        {/* Email Settings Tab */}
        {activeTab === "email" && !loading && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow">
            <div className="p-6 border-b dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Email Configuration</h2>
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                >
                  {branches.map((b) => (
                    <option key={b._id} value={b._id}>{b.name} ({b.code})</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Enable Email</label>
                <button
                  onClick={() => setEmailForm({ ...emailForm, isEnabled: !emailForm.isEnabled })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${emailForm.isEnabled ? "bg-[#FF6B35]" : "bg-gray-300 dark:bg-gray-600"}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${emailForm.isEnabled ? "translate-x-6" : "translate-x-1"}`} />
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Provider</label>
                <select value={emailForm.provider} onChange={(e) => setEmailForm({ ...emailForm, provider: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white">
                  <option value="smtp">SMTP</option>
                  <option value="ses">Amazon SES</option>
                  <option value="sendgrid">SendGrid</option>
                </select>
              </div>

              {emailForm.provider === "smtp" && (
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">SMTP Host</label>
                    <input type="text" value={emailForm.host} onChange={(e) => setEmailForm({ ...emailForm, host: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white" placeholder="smtp.gmail.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Port</label>
                    <input type="number" value={emailForm.port} onChange={(e) => setEmailForm({ ...emailForm, port: parseInt(e.target.value) })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username</label>
                    <input type="text" value={emailForm.username} onChange={(e) => setEmailForm({ ...emailForm, username: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                    <input type="password" value={emailForm.password} onChange={(e) => setEmailForm({ ...emailForm, password: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white" placeholder="Enter to update" />
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">From Email</label>
                  <input type="email" value={emailForm.fromEmail} onChange={(e) => setEmailForm({ ...emailForm, fromEmail: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white" placeholder="noreply@company.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">From Name</label>
                  <input type="text" value={emailForm.fromName} onChange={(e) => setEmailForm({ ...emailForm, fromName: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white" placeholder="Company Name" />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button onClick={saveEmailSettings} disabled={saving} className="bg-[#FF6B35] hover:bg-[#E55A2B] text-white px-6 py-2 rounded-lg transition disabled:opacity-50">
                  {saving ? "Saving..." : "Save Settings"}
                </button>
                <button onClick={testEmail} className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-6 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                  Send Test Email
                </button>
              </div>
            </div>
          </div>
        )}

        {/* WhatsApp Settings Tab */}
        {activeTab === "whatsapp" && !loading && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow">
            <div className="p-6 border-b dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">WhatsApp Configuration</h2>
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                >
                  {branches.map((b) => (
                    <option key={b._id} value={b._id}>{b.name} ({b.code})</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Enable WhatsApp</label>
                <button
                  onClick={() => setWhatsappForm({ ...whatsappForm, isEnabled: !whatsappForm.isEnabled })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${whatsappForm.isEnabled ? "bg-[#25D366]" : "bg-gray-300 dark:bg-gray-600"}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${whatsappForm.isEnabled ? "translate-x-6" : "translate-x-1"}`} />
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Provider</label>
                <select value={whatsappForm.provider} onChange={(e) => setWhatsappForm({ ...whatsappForm, provider: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white">
                  <option value="meta">Meta Business API</option>
                  <option value="twilio">Twilio</option>
                  <option value="gupshup">Gupshup</option>
                </select>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number ID</label>
                  <input type="text" value={whatsappForm.phoneNumberId} onChange={(e) => setWhatsappForm({ ...whatsappForm, phoneNumberId: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Business Account ID</label>
                  <input type="text" value={whatsappForm.businessAccountId} onChange={(e) => setWhatsappForm({ ...whatsappForm, businessAccountId: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Access Token</label>
                <input type="password" value={whatsappForm.accessToken} onChange={(e) => setWhatsappForm({ ...whatsappForm, accessToken: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white" placeholder="Enter to update" />
              </div>

              <div className="flex gap-3 pt-4">
                <button onClick={saveWhatsappSettings} disabled={saving} className="bg-[#25D366] hover:bg-[#20bd5a] text-white px-6 py-2 rounded-lg transition disabled:opacity-50">
                  {saving ? "Saving..." : "Save Settings"}
                </button>
                <button onClick={testWhatsapp} className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-6 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                  Send Test Message
                </button>
              </div>
            </div>
          </div>
        )}

        {/* API Keys Tab */}
        {activeTab === "api" && !loading && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow">
            <div className="p-6 border-b dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">External API Keys</h2>
              <button onClick={openCreateApiModal} className="bg-[#FF6B35] hover:bg-[#E55A2B] text-white px-4 py-2 rounded-lg flex items-center gap-2 transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create API Key
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">API Key</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Branch</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {apiKeys.map((key) => (
                    <tr key={key._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 text-sm font-medium text-gray-800 dark:text-white">{key.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 font-mono">{key.apiKey.substring(0, 20)}...</td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{key.branchId?.name || "-"}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${key.isActive ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"}`}>
                          {key.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button onClick={() => openEditApiModal(key)} className="text-blue-600 hover:text-blue-800 dark:text-blue-400">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button onClick={() => deleteApiKey(key._id)} className="text-red-600 hover:text-red-800 dark:text-red-400">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {apiKeys.length === 0 && (
                    <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">No API keys found. Create one to get started.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* API Key Modal */}
      {showApiModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                {editingApiKey ? "Edit API Key" : "Create API Key"}
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                <input type="text" value={apiForm.name} onChange={(e) => setApiForm({ ...apiForm, name: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white" placeholder="My Website API" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Branch</label>
                <select value={apiForm.branchId} onChange={(e) => setApiForm({ ...apiForm, branchId: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white">
                  {branches.map((b) => (
                    <option key={b._id} value={b._id}>{b.name} ({b.code})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Requests/Min</label>
                  <input type="number" value={apiForm.requestsPerMinute} onChange={(e) => setApiForm({ ...apiForm, requestsPerMinute: parseInt(e.target.value) })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Requests/Day</label>
                  <input type="number" value={apiForm.requestsPerDay} onChange={(e) => setApiForm({ ...apiForm, requestsPerDay: parseInt(e.target.value) })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white" />
                </div>
              </div>
            </div>
            <div className="p-6 border-t dark:border-gray-700 flex justify-end gap-3">
              <button onClick={() => setShowApiModal(false)} className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">
                Cancel
              </button>
              <button onClick={saveApiKey} disabled={saving} className="bg-[#FF6B35] hover:bg-[#E55A2B] text-white px-4 py-2 rounded-lg transition disabled:opacity-50">
                {saving ? "Saving..." : (editingApiKey ? "Update" : "Create")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterSettings;
