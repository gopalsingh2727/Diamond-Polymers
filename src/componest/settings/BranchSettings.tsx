import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "../redux/rootReducer";
import { InfinitySpinner } from "../../components/InfinitySpinner";
import { branchSettingsAPI, branchAPI } from "../../utils/crudHelpers";

interface Branch {
  _id: string;
  name: string;
  code: string;
}

interface BranchSettingsData {
  _id?: string;
  branchId: string;
  email: {
    enabled: boolean;
    provider: "smtp" | "ses" | "sendgrid";
    smtp?: {
      host: string;
      port: number;
      secure: boolean;
      username: string;
      password: string;
    };
    ses?: {
      accessKeyId: string;
      secretAccessKey: string;
      region: string;
    };
    sendgrid?: {
      apiKey: string;
    };
    fromEmail: string;
    fromName: string;
  };
  whatsapp: {
    enabled: boolean;
    provider: "meta" | "twilio" | "gupshup";
    meta?: {
      accessToken: string;
      phoneNumberId: string;
      businessAccountId: string;
    };
    twilio?: {
      accountSid: string;
      authToken: string;
      phoneNumber: string;
    };
    gupshup?: {
      apiKey: string;
      appName: string;
      sourcePhoneNumber: string;
    };
  };
  notifications: {
    orderCreated: { email: boolean; whatsapp: boolean };
    orderStatusChanged: { email: boolean; whatsapp: boolean };
    orderDispatched: { email: boolean; whatsapp: boolean };
  };
}

const defaultSettings: Omit<BranchSettingsData, "branchId"> = {
  email: {
    enabled: false,
    provider: "smtp",
    smtp: {
      host: "",
      port: 587,
      secure: false,
      username: "",
      password: "",
    },
    fromEmail: "",
    fromName: "",
  },
  whatsapp: {
    enabled: false,
    provider: "meta",
    meta: {
      accessToken: "",
      phoneNumberId: "",
      businessAccountId: "",
    },
  },
  notifications: {
    orderCreated: { email: false, whatsapp: false },
    orderStatusChanged: { email: false, whatsapp: false },
    orderDispatched: { email: false, whatsapp: false },
  },
};

const BranchSettings = () => {
  const navigate = useNavigate();
  const { userData } = useSelector((state: RootState) => state.auth);

  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const [settings, setSettings] = useState<BranchSettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState<"email" | "whatsapp" | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState<"email" | "whatsapp" | "notifications">("email");
  const [testEmail, setTestEmail] = useState("");
  const [testPhone, setTestPhone] = useState("");

  useEffect(() => {
    fetchBranches();
  }, []);

  useEffect(() => {
    if (selectedBranch) {
      fetchSettings(selectedBranch);
    }
  }, [selectedBranch]);

  const fetchBranches = async () => {
    try {
      const result = await branchAPI.getAll();
      const branchList = result.data?.branches || result.branches || [];
      setBranches(branchList);
      if (branchList.length > 0) {
        setSelectedBranch(branchList[0]._id);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load branches");
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async (branchId: string) => {
    setLoading(true);
    try {
      const result = await branchSettingsAPI.getByBranch(branchId);
      if (result.success && result.data?.settings) {
        setSettings({ ...defaultSettings, ...result.data.settings, branchId });
      } else {
        // No settings exist, use defaults
        setSettings({ ...defaultSettings, branchId });
      }
    } catch (err: any) {
      // If 404, use default settings
      setSettings({ ...defaultSettings, branchId });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await branchSettingsAPI.update(selectedBranch, settings);
      setSuccess("Settings saved successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmail = async () => {
    if (!testEmail) {
      setError("Please enter a test email address");
      return;
    }

    setTesting("email");
    setError("");
    setSuccess("");

    try {
      const result = await branchSettingsAPI.testEmail(selectedBranch, testEmail);
      if (result.success) {
        setSuccess("Test email sent successfully! Check your inbox.");
      } else {
        setError(result.message || "Failed to send test email");
      }
    } catch (err: any) {
      setError(err.message || "Failed to send test email");
    } finally {
      setTesting(null);
    }
  };

  const handleTestWhatsApp = async () => {
    if (!testPhone) {
      setError("Please enter a test phone number");
      return;
    }

    setTesting("whatsapp");
    setError("");
    setSuccess("");

    try {
      const result = await branchSettingsAPI.testWhatsApp(selectedBranch, testPhone);
      if (result.success) {
        setSuccess("Test WhatsApp message sent successfully!");
      } else {
        setError(result.message || "Failed to send test message");
      }
    } catch (err: any) {
      setError(err.message || "Failed to send test message");
    } finally {
      setTesting(null);
    }
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
          <p className="text-gray-600 dark:text-gray-400 mb-4">Only Master Admin can manage Branch Settings.</p>
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
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition"
          >
            <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Branch Settings</h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Configure email and WhatsApp for each branch</p>
          </div>
        </div>

        {/* Branch Selector */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select Branch
          </label>
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#FF6B35] dark:bg-gray-700 dark:text-white"
          >
            {branches.map((branch) => (
              <option key={branch._id} value={branch._id}>
                {branch.name} ({branch.code})
              </option>
            ))}
          </select>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg mb-6">
            {success}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <InfinitySpinner size="lg" />
            <p className="text-gray-500 dark:text-gray-400 mt-4">Loading settings...</p>
          </div>
        ) : settings ? (
          <>
            {/* Tabs */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setActiveTab("email")}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  activeTab === "email"
                    ? "bg-[#FF6B35] text-white"
                    : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                Email Configuration
              </button>
              <button
                onClick={() => setActiveTab("whatsapp")}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  activeTab === "whatsapp"
                    ? "bg-[#FF6B35] text-white"
                    : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                WhatsApp Configuration
              </button>
              <button
                onClick={() => setActiveTab("notifications")}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  activeTab === "notifications"
                    ? "bg-[#FF6B35] text-white"
                    : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                Notifications
              </button>
            </div>

            {/* Email Tab */}
            {activeTab === "email" && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Email Configuration</h2>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.email.enabled}
                      onChange={(e) => setSettings({
                        ...settings,
                        email: { ...settings.email, enabled: e.target.checked }
                      })}
                      className="rounded text-[#FF6B35] focus:ring-[#FF6B35]"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Enable Email</span>
                  </label>
                </div>

                {settings.email.enabled && (
                  <div className="space-y-4">
                    {/* Provider Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Provider
                      </label>
                      <select
                        value={settings.email.provider}
                        onChange={(e) => setSettings({
                          ...settings,
                          email: { ...settings.email, provider: e.target.value as any }
                        })}
                        className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                      >
                        <option value="smtp">SMTP</option>
                        <option value="ses">AWS SES</option>
                        <option value="sendgrid">SendGrid</option>
                      </select>
                    </div>

                    {/* SMTP Settings */}
                    {settings.email.provider === "smtp" && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Host
                          </label>
                          <input
                            type="text"
                            value={settings.email.smtp?.host || ""}
                            onChange={(e) => setSettings({
                              ...settings,
                              email: { ...settings.email, smtp: { ...settings.email.smtp!, host: e.target.value } }
                            })}
                            className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                            placeholder="smtp.gmail.com"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Port
                          </label>
                          <input
                            type="number"
                            value={settings.email.smtp?.port || 587}
                            onChange={(e) => setSettings({
                              ...settings,
                              email: { ...settings.email, smtp: { ...settings.email.smtp!, port: parseInt(e.target.value) } }
                            })}
                            className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Username
                          </label>
                          <input
                            type="text"
                            value={settings.email.smtp?.username || ""}
                            onChange={(e) => setSettings({
                              ...settings,
                              email: { ...settings.email, smtp: { ...settings.email.smtp!, username: e.target.value } }
                            })}
                            className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Password
                          </label>
                          <input
                            type="password"
                            value={settings.email.smtp?.password || ""}
                            onChange={(e) => setSettings({
                              ...settings,
                              email: { ...settings.email, smtp: { ...settings.email.smtp!, password: e.target.value } }
                            })}
                            className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                      </div>
                    )}

                    {/* From Settings */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          From Email
                        </label>
                        <input
                          type="email"
                          value={settings.email.fromEmail || ""}
                          onChange={(e) => setSettings({
                            ...settings,
                            email: { ...settings.email, fromEmail: e.target.value }
                          })}
                          className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                          placeholder="orders@yourcompany.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          From Name
                        </label>
                        <input
                          type="text"
                          value={settings.email.fromName || ""}
                          onChange={(e) => setSettings({
                            ...settings,
                            email: { ...settings.email, fromName: e.target.value }
                          })}
                          className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                          placeholder="Your Company"
                        />
                      </div>
                    </div>

                    {/* Test Email */}
                    <div className="pt-4 border-t dark:border-gray-700">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Test Email
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="email"
                          value={testEmail}
                          onChange={(e) => setTestEmail(e.target.value)}
                          className="flex-1 px-3 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                          placeholder="Enter email to test"
                        />
                        <button
                          onClick={handleTestEmail}
                          disabled={testing === "email"}
                          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition disabled:opacity-50"
                        >
                          {testing === "email" ? "Sending..." : "Send Test"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* WhatsApp Tab */}
            {activeTab === "whatsapp" && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-white">WhatsApp Configuration</h2>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.whatsapp.enabled}
                      onChange={(e) => setSettings({
                        ...settings,
                        whatsapp: { ...settings.whatsapp, enabled: e.target.checked }
                      })}
                      className="rounded text-[#FF6B35] focus:ring-[#FF6B35]"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Enable WhatsApp</span>
                  </label>
                </div>

                {settings.whatsapp.enabled && (
                  <div className="space-y-4">
                    {/* Provider Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Provider
                      </label>
                      <select
                        value={settings.whatsapp.provider}
                        onChange={(e) => setSettings({
                          ...settings,
                          whatsapp: { ...settings.whatsapp, provider: e.target.value as any }
                        })}
                        className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                      >
                        <option value="meta">Meta Business API</option>
                        <option value="twilio">Twilio</option>
                        <option value="gupshup">Gupshup</option>
                      </select>
                    </div>

                    {/* Meta Settings */}
                    {settings.whatsapp.provider === "meta" && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Access Token
                          </label>
                          <input
                            type="password"
                            value={settings.whatsapp.meta?.accessToken || ""}
                            onChange={(e) => setSettings({
                              ...settings,
                              whatsapp: { ...settings.whatsapp, meta: { ...settings.whatsapp.meta!, accessToken: e.target.value } }
                            })}
                            className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Phone Number ID
                          </label>
                          <input
                            type="text"
                            value={settings.whatsapp.meta?.phoneNumberId || ""}
                            onChange={(e) => setSettings({
                              ...settings,
                              whatsapp: { ...settings.whatsapp, meta: { ...settings.whatsapp.meta!, phoneNumberId: e.target.value } }
                            })}
                            className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Business Account ID
                          </label>
                          <input
                            type="text"
                            value={settings.whatsapp.meta?.businessAccountId || ""}
                            onChange={(e) => setSettings({
                              ...settings,
                              whatsapp: { ...settings.whatsapp, meta: { ...settings.whatsapp.meta!, businessAccountId: e.target.value } }
                            })}
                            className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                      </div>
                    )}

                    {/* Test WhatsApp */}
                    <div className="pt-4 border-t dark:border-gray-700">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Test WhatsApp
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="tel"
                          value={testPhone}
                          onChange={(e) => setTestPhone(e.target.value)}
                          className="flex-1 px-3 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                          placeholder="Enter phone number to test"
                        />
                        <button
                          onClick={handleTestWhatsApp}
                          disabled={testing === "whatsapp"}
                          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition disabled:opacity-50"
                        >
                          {testing === "whatsapp" ? "Sending..." : "Send Test"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">Notification Settings</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white">Order Created</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Send notification when a new order is created</p>
                    </div>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={settings.notifications.orderCreated.email}
                          onChange={(e) => setSettings({
                            ...settings,
                            notifications: {
                              ...settings.notifications,
                              orderCreated: { ...settings.notifications.orderCreated, email: e.target.checked }
                            }
                          })}
                          className="rounded text-[#FF6B35] focus:ring-[#FF6B35]"
                        />
                        <span className="text-sm">Email</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={settings.notifications.orderCreated.whatsapp}
                          onChange={(e) => setSettings({
                            ...settings,
                            notifications: {
                              ...settings.notifications,
                              orderCreated: { ...settings.notifications.orderCreated, whatsapp: e.target.checked }
                            }
                          })}
                          className="rounded text-[#FF6B35] focus:ring-[#FF6B35]"
                        />
                        <span className="text-sm">WhatsApp</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white">Order Status Changed</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Send notification when order status changes</p>
                    </div>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={settings.notifications.orderStatusChanged.email}
                          onChange={(e) => setSettings({
                            ...settings,
                            notifications: {
                              ...settings.notifications,
                              orderStatusChanged: { ...settings.notifications.orderStatusChanged, email: e.target.checked }
                            }
                          })}
                          className="rounded text-[#FF6B35] focus:ring-[#FF6B35]"
                        />
                        <span className="text-sm">Email</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={settings.notifications.orderStatusChanged.whatsapp}
                          onChange={(e) => setSettings({
                            ...settings,
                            notifications: {
                              ...settings.notifications,
                              orderStatusChanged: { ...settings.notifications.orderStatusChanged, whatsapp: e.target.checked }
                            }
                          })}
                          className="rounded text-[#FF6B35] focus:ring-[#FF6B35]"
                        />
                        <span className="text-sm">WhatsApp</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white">Order Dispatched</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Send notification when order is dispatched</p>
                    </div>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={settings.notifications.orderDispatched.email}
                          onChange={(e) => setSettings({
                            ...settings,
                            notifications: {
                              ...settings.notifications,
                              orderDispatched: { ...settings.notifications.orderDispatched, email: e.target.checked }
                            }
                          })}
                          className="rounded text-[#FF6B35] focus:ring-[#FF6B35]"
                        />
                        <span className="text-sm">Email</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={settings.notifications.orderDispatched.whatsapp}
                          onChange={(e) => setSettings({
                            ...settings,
                            notifications: {
                              ...settings.notifications,
                              orderDispatched: { ...settings.notifications.orderDispatched, whatsapp: e.target.checked }
                            }
                          })}
                          className="rounded text-[#FF6B35] focus:ring-[#FF6B35]"
                        />
                        <span className="text-sm">WhatsApp</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-[#FF6B35] hover:bg-[#E55A2B] text-white font-medium rounded-lg transition disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Settings"}
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default BranchSettings;
