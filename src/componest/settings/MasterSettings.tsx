import { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "../redux/rootReducer";
import { InfinitySpinner } from "../../components/InfinitySpinner";
import { setSelectedBranchInAuth } from "../redux/login/authActions";
import {
  branchSettingsAPI,
  externalAPIKeyAPI,
  mcpKeyAPI,
  emailTemplateAPI,
  whatsappTemplateAPI } from
"../../utils/crudHelpers";
import { fetchBranchesIfNeeded } from "../redux/Branch/BranchActions";

type TabType = "email" | "whatsapp" | "emailTemplates" | "whatsappTemplates" | "api" | "mcp";
type SettingsScope = "global" | "per_branch";

interface Branch {
  _id: string;
  name: string;
  code: string;
}

interface EmailConfig {
  provider: string;
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  fromEmail?: string;
  fromName?: string;
  replyTo?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  region?: string;
  apiKey?: string;
  domain?: string;
  isEnabled: boolean;
}

interface WhatsAppConfig {
  provider: string;
  phoneNumberId?: string;
  businessAccountId?: string;
  accessToken?: string;
  orderTemplateName?: string;
  accountSid?: string;
  authToken?: string;
  phoneNumber?: string;
  appName?: string;
  sourcePhoneNumber?: string;
  apiEndpoint?: string;
  apiKey?: string;
  defaultCountryCode?: string;
  isEnabled: boolean;
}

interface APIKey {
  _id: string;
  name: string;
  description?: string;
  apiKey: string;
  branchId: {_id: string;name: string;code: string;};
  permissions: string[];
  isActive: boolean;
  rateLimit: {requestsPerMinute: number;requestsPerDay: number;};
  createdAt: string;
  lastUsedAt?: string;
  totalRequests?: number;
}

interface EmailTemplate {
  _id?: string;
  branchId?: string;
  isGlobal?: boolean;
  name: string;
  eventType?: string;
  subject: string;
  body: string;
  variables: string[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface WhatsAppTemplate {
  _id?: string;
  branchId?: string;
  isGlobal?: boolean;
  name: string;
  eventType?: string;
  body: string;
  variables: string[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Available permissions for API keys
const AVAILABLE_PERMISSIONS = [
{ id: "orders:read", label: "Read Orders", group: "Orders" },
{ id: "orders:create", label: "Create Orders", group: "Orders" },
{ id: "orders:update", label: "Update Orders", group: "Orders" },
{ id: "orders:delete", label: "Delete Orders", group: "Orders" },
{ id: "customers:read", label: "Read Customers", group: "Customers" },
{ id: "customers:create", label: "Create Customers", group: "Customers" },
{ id: "customers:update", label: "Update Customers", group: "Customers" },
{ id: "products:read", label: "Read Products", group: "Products" },
{ id: "products:create", label: "Create Products", group: "Products" },
{ id: "reports:read", label: "Read Reports", group: "Reports" },
{ id: "webhooks:manage", label: "Manage Webhooks", group: "Webhooks" }];

// Email template variables
const EMAIL_VARIABLES = [
{ key: "customerName", description: "Customer full name" },
{ key: "companyName", description: "Company/Business name" },
{ key: "orderNumber", description: "Order reference number" },
{ key: "orderDate", description: "Order creation date" },
{ key: "orderTotal", description: "Order total amount" },
{ key: "deliveryDate", description: "Expected delivery date" },
{ key: "branchName", description: "Branch name" },
{ key: "branchPhone", description: "Branch phone number" },
{ key: "trackingLink", description: "Order tracking link" }];

// Event types for templates
const EVENT_TYPES = [
{ value: "custom", label: "Custom" },
{ value: "orderCreated", label: "Order Created" },
{ value: "orderStatusChanged", label: "Order Status Changed" },
{ value: "orderCompleted", label: "Order Completed" },
{ value: "orderDispatched", label: "Order Dispatched" },
{ value: "orderCancelled", label: "Order Cancelled" },
{ value: "customerWelcome", label: "Customer Welcome" },
{ value: "paymentReceived", label: "Payment Received" }];


const MasterSettings = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userData } = useSelector((state: RootState) => state.auth);
  const reduxBranches = useSelector((state: RootState) => (state as any).branches?.branches || []);

  const defaultTab: TabType = userData?.role === "admin" ? "emailTemplates" : "email";
  const [activeTab, setActiveTab] = useState<TabType>(defaultTab);

  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [testingEmail, setTestingEmail] = useState(false);
  const [testEmailStatus, setTestEmailStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [testingWhatsApp, setTestingWhatsApp] = useState(false);
  const [testWhatsAppStatus, setTestWhatsAppStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [showTestEmailModal, setShowTestEmailModal] = useState(false);
  const [showTestWhatsAppModal, setShowTestWhatsAppModal] = useState(false);
  const [testEmailAddress, setTestEmailAddress] = useState("");
  const [testPhoneNumber, setTestPhoneNumber] = useState("");

  const [allBranchConfigs, setAllBranchConfigs] = useState<Record<string, {email: EmailConfig;whatsapp: WhatsAppConfig;}>>({});

  const [emailScope, setEmailScope] = useState<SettingsScope>("per_branch");
  const [whatsappScope, setWhatsappScope] = useState<SettingsScope>("global");

  const [emailForm, setEmailForm] = useState<EmailConfig>({
    provider: "smtp", host: "", port: 587, username: "", password: "",
    fromEmail: "", fromName: "", replyTo: "", accessKeyId: "",
    secretAccessKey: "", region: "us-east-1", apiKey: "", domain: "", isEnabled: false
  });

  const [whatsappForm, setWhatsappForm] = useState<WhatsAppConfig>({
    provider: "meta", phoneNumberId: "", businessAccountId: "", accessToken: "",
    orderTemplateName: "",
    accountSid: "", authToken: "", phoneNumber: "", appName: "",
    sourcePhoneNumber: "", apiEndpoint: "", defaultCountryCode: "+91", isEnabled: false
  });

  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [showApiModal, setShowApiModal] = useState(false);
  const [editingApiKey, setEditingApiKey] = useState<APIKey | null>(null);
  const [apiForm, setApiForm] = useState({
    name: "", description: "", branchId: "",
    permissions: ["orders:read", "orders:create"] as string[],
    requestsPerMinute: 60, requestsPerDay: 10000, isActive: true
  });
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // ── MCP API Keys state ────────────────────────────────────────────────────
  interface MCPKey {
    _id: string; name: string; description?: string; keyPrefix: string;
    permissions: string[]; isActive: boolean;
    rateLimit: { requestsPerMinute: number; requestsPerDay: number };
    createdAt: string; lastUsedAt?: string; totalRequests?: number;
    userRole: string; isGlobal: boolean;
    branches: { _id: string; name: string; code: string }[];
  }
  const [mcpKeys, setMcpKeys] = useState<MCPKey[]>([]);
  const [mcpLoading, setMcpLoading] = useState(false);
  const [showMcpModal, setShowMcpModal] = useState(false);
  const [newMcpPlainKey, setNewMcpPlainKey] = useState<string | null>(null);
  const [mcpForm, setMcpForm] = useState({
    name: '', description: '',
    permissions: ['orders:read', 'reports:generate'] as string[],
    isGlobal: false,
    selectedBranchIds: [] as string[],
    requestsPerMinute: 30, requestsPerDay: 1000,
  });
  const isMasterAdmin = userData?.role === 'master_admin';
  const MCP_PERMS = [
    { id: 'orders:read',      label: 'Read Orders' },
    { id: 'orders:write',     label: 'Write Orders' },
    { id: 'machines:read',    label: 'Read Machines' },
    { id: 'customers:read',   label: 'Read Customers' },
    { id: 'reports:generate', label: 'Generate Reports' },
    { id: 'whatsapp:send',    label: 'Send WhatsApp' },
    { id: 'email:send',       label: 'Send Email' },
  ];
  const fetchMcpKeys = async () => {
    setMcpLoading(true);
    try { const res = await mcpKeyAPI.getAll(); setMcpKeys(res.data?.keys || []); } catch { /* ignore */ }
    setMcpLoading(false);
  };
  const createMcpKey = async () => {
    if (!mcpForm.name.trim()) return;
    if (!mcpForm.isGlobal && mcpForm.selectedBranchIds.length === 0) {
      setError('Select at least one branch, or enable Global access.'); return;
    }
    setMcpLoading(true);
    try {
      const res = await mcpKeyAPI.create({
        name: mcpForm.name, description: mcpForm.description,
        permissions: mcpForm.permissions,
        isGlobal: mcpForm.isGlobal,
        branchIds: mcpForm.isGlobal ? [] : mcpForm.selectedBranchIds,
        rateLimit: { requestsPerMinute: mcpForm.requestsPerMinute, requestsPerDay: mcpForm.requestsPerDay },
      });
      setNewMcpPlainKey(res.data?.plainKey || null);
      setShowMcpModal(false);
      await fetchMcpKeys();
      setMcpForm({ name: '', description: '', permissions: ['orders:read', 'reports:generate'], isGlobal: false, selectedBranchIds: [], requestsPerMinute: 30, requestsPerDay: 1000 });
    } catch { setError('Failed to create MCP key'); }
    setMcpLoading(false);
  };
  const rotateMcpKey = async (id: string) => {
    if (!window.confirm('Rotate this key? The old key will stop working immediately.')) return;
    try { const res = await mcpKeyAPI.rotate(id); setNewMcpPlainKey(res.data?.plainKey || null); await fetchMcpKeys(); } catch { setError('Failed to rotate key'); }
  };
  const deleteMcpKey = async (id: string) => {
    if (!window.confirm('Deactivate this MCP key?')) return;
    try { await mcpKeyAPI.delete(id); await fetchMcpKeys(); } catch { setError('Failed to deactivate key'); }
  };
  const toggleMcpBranch = (branchId: string) => {
    setMcpForm(f => ({
      ...f,
      selectedBranchIds: f.selectedBranchIds.includes(branchId)
        ? f.selectedBranchIds.filter(id => id !== branchId)
        : [...f.selectedBranchIds, branchId],
    }));
  };
  // ─────────────────────────────────────────────────────────────────────────

  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);
  const [showEmailTemplateModal, setShowEmailTemplateModal] = useState(false);
  const [editingEmailTemplate, setEditingEmailTemplate] = useState<EmailTemplate | null>(null);
  const [emailTemplateForm, setEmailTemplateForm] = useState({
    name: "", eventType: "custom", subject: "", body: "",
    variables: [] as string[], isActive: true, isGlobal: false
  });

  const [whatsappTemplates, setWhatsappTemplates] = useState<WhatsAppTemplate[]>([]);
  const [showWhatsappTemplateModal, setShowWhatsappTemplateModal] = useState(false);
  const [editingWhatsappTemplate, setEditingWhatsappTemplate] = useState<WhatsAppTemplate | null>(null);
  const [whatsappTemplateForm, setWhatsappTemplateForm] = useState({
    name: "", eventType: "custom", body: "",
    variables: [] as string[], isActive: true, isGlobal: false
  });

  const handleBranchChange = (branchId: string) => {
    setSelectedBranch(branchId);
    dispatch(setSelectedBranchInAuth(branchId) as any);
    // Clear forms immediately so stale data from previous branch is not shown while loading
    setEmailForm({
      provider: "smtp", host: "", port: 587, username: "", password: "",
      fromEmail: "", fromName: "", replyTo: "", accessKeyId: "", secretAccessKey: "",
      region: "us-east-1", apiKey: "", domain: "", isEnabled: false
    });
    setWhatsappForm({
      provider: "meta", phoneNumberId: "", businessAccountId: "", accessToken: "",
      orderTemplateName: "",
      accountSid: "", authToken: "", phoneNumber: "", appName: "",
      sourcePhoneNumber: "", apiEndpoint: "", defaultCountryCode: "+91", isEnabled: false
    });
  };

  // Sync branches from Redux (already fetched by the rest of the app)
  useEffect(() => {
    if (reduxBranches.length > 0) {
      setBranches(reduxBranches);
      if (!selectedBranch) {
        const storedBranch = userData?.selectedBranch || localStorage.getItem("selectedBranch");
        if (storedBranch && reduxBranches.find((b: any) => b._id === storedBranch)) {
          setSelectedBranch(storedBranch);
        } else {
          handleBranchChange(reduxBranches[0]._id);
        }
      }
    } else {
      // Redux branches not loaded yet — dispatch fetch
      dispatch(fetchBranchesIfNeeded() as any);
    }
  }, [reduxBranches]);

  const fetchSettings = useCallback(async () => {
    if (!selectedBranch && (emailScope === "per_branch" || whatsappScope === "per_branch")) return;
    setLoading(true);
    setError("");
    try {
      let response;
      if (selectedBranch) {
        try { response = await branchSettingsAPI.getByBranch(selectedBranch); }
        catch (err: any) { response = {}; }
      } else if (emailScope === "global" || whatsappScope === "global") {
        try { response = await branchSettingsAPI.getGlobal(); }
        catch (err: any) { response = {}; }
      }
      const settings = response?.data?.settings || response?.settings || {};
      if (settings?.email) {
        // Backend sends '' (empty string) for masked secrets — 'key exists' means credential is saved
        const hasSmtpPassword = settings.email.smtp !== undefined && 'password' in (settings.email.smtp || {});
        const hasSesSecret = settings.email.ses !== undefined && 'secretAccessKey' in (settings.email.ses || {});
        const hasSendgridKey = settings.email.sendgrid !== undefined && 'apiKey' in (settings.email.sendgrid || {});
        setEmailForm({
          provider: settings.email.provider || "smtp",
          host: settings.email.smtp?.host || settings.email.host || "",
          port: settings.email.smtp?.port || settings.email.port || 587,
          username: settings.email.smtp?.username || settings.email.username || "",
          password: hasSmtpPassword ? "••••••••" : "",
          fromEmail: settings.email.fromEmail || "",
          fromName: settings.email.fromName || "",
          replyTo: settings.email.replyTo || "",
          accessKeyId: settings.email.ses?.accessKeyId || settings.email.accessKeyId || "",
          secretAccessKey: hasSesSecret ? "••••••••" : "",
          region: settings.email.ses?.region || settings.email.region || "us-east-1",
          apiKey: hasSendgridKey ? "••••••••" : "",
          domain: settings.email.domain || "",
          isEnabled: settings.email.enabled || settings.email.isEnabled || false
        });
      } else {
        // Branch has no email settings saved — clear the form
        setEmailForm({
          provider: "smtp", host: "", port: 587, username: "", password: "",
          fromEmail: "", fromName: "", replyTo: "", accessKeyId: "", secretAccessKey: "",
          region: "us-east-1", apiKey: "", domain: "", isEnabled: false
        });
      }
      if (settings?.whatsapp) {
        // Backend sends '' (empty string) for masked tokens — 'key exists in object' means token is saved
        const hasMetaToken = settings.whatsapp.meta !== undefined && 'accessToken' in (settings.whatsapp.meta || {});
        const hasTwilioSid = settings.whatsapp.twilio !== undefined && 'accountSid' in (settings.whatsapp.twilio || {});
        const hasTwilioToken = settings.whatsapp.twilio !== undefined && 'authToken' in (settings.whatsapp.twilio || {});
        const hasGupshupKey = settings.whatsapp.gupshup !== undefined && 'apiKey' in (settings.whatsapp.gupshup || {});
        const hasWatiToken = settings.whatsapp.wati !== undefined && 'accessToken' in (settings.whatsapp.wati || {});
        setWhatsappForm({
          provider: settings.whatsapp.provider || "meta",
          phoneNumberId: settings.whatsapp.meta?.phoneNumberId || settings.whatsapp.phoneNumberId || "",
          businessAccountId: settings.whatsapp.meta?.businessAccountId || settings.whatsapp.businessAccountId || "",
          accessToken: (hasMetaToken || hasWatiToken) ? "••••••••" : "",
          orderTemplateName: settings.whatsapp.meta?.orderTemplateName || "",
          accountSid: hasTwilioSid ? "••••••••" : "",
          authToken: hasTwilioToken ? "••••••••" : "",
          phoneNumber: settings.whatsapp.twilio?.phoneNumber || settings.whatsapp.phoneNumber || "",
          appName: settings.whatsapp.gupshup?.appName || settings.whatsapp.appName || "",
          sourcePhoneNumber: settings.whatsapp.gupshup?.sourcePhoneNumber || settings.whatsapp.sourcePhoneNumber || "",
          apiEndpoint: settings.whatsapp.wati?.apiEndpoint || settings.whatsapp.apiEndpoint || "",
          apiKey: hasGupshupKey ? "••••••••" : "",
          defaultCountryCode: settings.whatsapp.defaultCountryCode || "+91",
          isEnabled: settings.whatsapp.enabled || settings.whatsapp.isEnabled || false
        });
      } else {
        setWhatsappForm({
          provider: "meta", phoneNumberId: "", businessAccountId: "", accessToken: "",
          orderTemplateName: "",
          accountSid: "", authToken: "", phoneNumber: "", appName: "",
          sourcePhoneNumber: "", apiEndpoint: "", defaultCountryCode: "+91", isEnabled: false
        });
      }
      if (settings?.emailScope) setEmailScope(settings.emailScope);
      if (settings?.whatsappScope) setWhatsappScope(settings.whatsappScope);
      if (selectedBranch && settings) {
        setAllBranchConfigs((prev) => ({
          ...prev,
          [selectedBranch]: { email: settings.email || {}, whatsapp: settings.whatsapp || {} }
        }));
      }
    } catch (err: any) {
      setError(err.message || "Failed to load settings");
    } finally {
      setLoading(false);
    }
  }, [selectedBranch, emailScope, whatsappScope]);

  const fetchAllBranchConfigs = useCallback(async () => {
    if (branches.length === 0) return;
    try {
      // Single API call returns all branches with their settings
      const response = await branchSettingsAPI.getAll();
      const branchList: any[] = response?.data?.branches || response?.branches || [];
      const configs: Record<string, {email: EmailConfig; whatsapp: WhatsAppConfig;}> = {};

      branchList.forEach(({ branch, settings }: any) => {
        if (!branch?._id) return;
        const s = settings || {};
        const hasMetaToken = s.whatsapp?.meta != null && 'accessToken' in (s.whatsapp.meta || {});
        const hasTwilioSid = s.whatsapp?.twilio != null && 'accountSid' in (s.whatsapp.twilio || {});
        const hasTwilioToken = s.whatsapp?.twilio != null && 'authToken' in (s.whatsapp.twilio || {});
        const hasGupshupKey = s.whatsapp?.gupshup != null && 'apiKey' in (s.whatsapp.gupshup || {});
        const hasWatiToken = s.whatsapp?.wati != null && 'accessToken' in (s.whatsapp.wati || {});
        const hasSmtpPw = s.email?.smtp != null && 'password' in (s.email.smtp || {});
        const hasSesSecret = s.email?.ses != null && 'secretAccessKey' in (s.email.ses || {});

        configs[branch._id] = {
          email: {
            provider: s.email?.provider || "smtp",
            isEnabled: s.email?.enabled || s.email?.isEnabled || false,
            host: s.email?.smtp?.host || s.email?.host || "",
            port: s.email?.smtp?.port || s.email?.port || 587,
            username: s.email?.smtp?.username || s.email?.username || "",
            password: hasSmtpPw ? "••••••••" : "",
            fromEmail: s.email?.fromEmail || "",
            fromName: s.email?.fromName || "",
            replyTo: s.email?.replyTo || "",
            accessKeyId: s.email?.ses?.accessKeyId || s.email?.accessKeyId || "",
            secretAccessKey: hasSesSecret ? "••••••••" : "",
            region: s.email?.ses?.region || s.email?.region || "us-east-1",
            apiKey: s.email?.sendgrid?.apiKey != null ? "••••••••" : "",
            domain: s.email?.domain || "",
          } as EmailConfig,
          whatsapp: {
            provider: s.whatsapp?.provider || "meta",
            isEnabled: s.whatsapp?.enabled || s.whatsapp?.isEnabled || false,
            phoneNumberId: s.whatsapp?.meta?.phoneNumberId || "",
            businessAccountId: s.whatsapp?.meta?.businessAccountId || "",
            accessToken: (hasMetaToken || hasWatiToken) ? "••••••••" : "",
            accountSid: hasTwilioSid ? "••••••••" : "",
            authToken: hasTwilioToken ? "••••••••" : "",
            phoneNumber: s.whatsapp?.twilio?.phoneNumber || s.whatsapp?.phoneNumber || "",
            appName: s.whatsapp?.gupshup?.appName || "",
            sourcePhoneNumber: s.whatsapp?.gupshup?.sourcePhoneNumber || "",
            apiEndpoint: s.whatsapp?.wati?.apiEndpoint || "",
            apiKey: hasGupshupKey ? "••••••••" : "",
            defaultCountryCode: s.whatsapp?.defaultCountryCode || "+91",
          } as WhatsAppConfig
        };
      });
      setAllBranchConfigs(configs);
    } catch (err) {
      // fallback: leave configs empty rather than crashing
    }
  }, [branches]);

  useEffect(() => {
    if (branches.length > 0) fetchAllBranchConfigs();
  }, [branches, fetchAllBranchConfigs]);

  const fetchApiKeys = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await externalAPIKeyAPI.getAll();
      setApiKeys(response.apiKeys || response.data || []);
    } catch (err: any) {
      setApiKeys([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchEmailTemplates = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = emailScope === "global" ?
        await emailTemplateAPI.getGlobal() :
        selectedBranch ? await emailTemplateAPI.getByBranch(selectedBranch) : { templates: [] };
      const templates = response?.data?.templates || response?.templates || response?.data || [];
      setEmailTemplates(Array.isArray(templates) ? templates : []);
    } catch (err: any) {
      setEmailTemplates([]);
    } finally {
      setLoading(false);
    }
  }, [selectedBranch, emailScope]);

  const fetchWhatsappTemplates = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = whatsappScope === "global" ?
        await whatsappTemplateAPI.getGlobal() :
        selectedBranch ? await whatsappTemplateAPI.getByBranch(selectedBranch) : { templates: [] };
      const templates = response?.data?.templates || response?.templates || response?.data || [];
      setWhatsappTemplates(Array.isArray(templates) ? templates : []);
    } catch (err: any) {
      setWhatsappTemplates([]);
    } finally {
      setLoading(false);
    }
  }, [selectedBranch, whatsappScope]);


  useEffect(() => {
    if (activeTab === "email" || activeTab === "whatsapp") {
      fetchSettings();
    } else if (activeTab === "api") {
      fetchApiKeys();
    } else if (activeTab === "mcp") {
      fetchMcpKeys();
    } else if (activeTab === "emailTemplates") {
      fetchEmailTemplates();
    } else if (activeTab === "whatsappTemplates") {
      fetchWhatsappTemplates();
    }
  }, [activeTab, selectedBranch, emailScope, whatsappScope, fetchSettings, fetchApiKeys, fetchEmailTemplates, fetchWhatsappTemplates]);

  const saveEmailSettings = async () => {
    setSaving(true);
    setError("");
    try {
      if (emailScope === "per_branch" && !selectedBranch) {
        setError("Please select a branch before saving per-branch email settings.");
        setSaving(false);
        return;
      }
      if (emailForm.provider === "smtp") {
        if (!emailForm.password || emailForm.password.trim() === "") {
          setError("Password is required for SMTP configuration. Please enter the password.");
          setSaving(false);
          return;
        }
        if (!emailForm.host || emailForm.host.trim() === "") {
          setError("SMTP Host is required.");
          setSaving(false);
          return;
        }
        if (!emailForm.username || emailForm.username.trim() === "") {
          setError("Username is required for SMTP configuration.");
          setSaving(false);
          return;
        }
      }
      const encryptedEmail: any = {
        enabled: emailForm.isEnabled,
        provider: emailForm.provider,
        fromEmail: emailForm.fromEmail,
        fromName: emailForm.fromName,
        replyTo: emailForm.replyTo
      };
      if (emailForm.provider === "smtp") {
        encryptedEmail.smtp = {
          host: emailForm.host, port: emailForm.port, secure: false,
          username: emailForm.username, password: emailForm.password
        };
      } else if (emailForm.provider === "ses") {
        encryptedEmail.ses = {
          region: emailForm.region, accessKeyId: emailForm.accessKeyId,
          secretAccessKey: emailForm.secretAccessKey || undefined
        };
      } else if (emailForm.provider === "sendgrid") {
        encryptedEmail.sendgrid = { apiKey: emailForm.apiKey || undefined };
      }
      if (emailScope === "global") {
        await branchSettingsAPI.updateGlobal({ email: encryptedEmail, emailScope });
      } else if (selectedBranch) {
        await branchSettingsAPI.update(selectedBranch, { email: encryptedEmail, emailScope });
      } else {
        throw new Error("Cannot save per-branch settings without a selected branch");
      }
      setSuccess("Email settings saved successfully!");
      setTimeout(() => setSuccess(""), 3000);
      fetchAllBranchConfigs();
    } catch (err: any) {
      setError(err.message || err.response?.data?.message || "Failed to save email settings");
    } finally {
      setSaving(false);
    }
  };

  const saveWhatsappSettings = async () => {
    setSaving(true);
    setError("");
    try {
      if (whatsappScope === "per_branch" && !selectedBranch) {
        setError("Please select a branch before saving per-branch WhatsApp settings.");
        setSaving(false);
        return;
      }
      const encryptedWhatsapp: any = {
        enabled: whatsappForm.isEnabled,
        provider: whatsappForm.provider
      };
      if (whatsappForm.provider === "meta") {
        encryptedWhatsapp.meta = {
          phoneNumberId: whatsappForm.phoneNumberId,
          businessAccountId: whatsappForm.businessAccountId,
          accessToken: whatsappForm.accessToken || undefined,
          orderTemplateName: whatsappForm.orderTemplateName || ""
        };
        encryptedWhatsapp.phoneNumber = whatsappForm.phoneNumber;
      } else if (whatsappForm.provider === "twilio") {
        encryptedWhatsapp.twilio = {
          accountSid: whatsappForm.accountSid,
          authToken: whatsappForm.authToken || undefined,
          phoneNumber: whatsappForm.phoneNumber
        };
      } else if (whatsappForm.provider === "gupshup") {
        encryptedWhatsapp.gupshup = {
          apiKey: whatsappForm.apiKey || undefined,
          appName: whatsappForm.appName,
          sourcePhoneNumber: whatsappForm.sourcePhoneNumber
        };
      } else if (whatsappForm.provider === "wati") {
        encryptedWhatsapp.wati = {
          apiEndpoint: whatsappForm.apiEndpoint,
          accessToken: whatsappForm.accessToken || undefined
        };
      }
      if (whatsappScope === "global") {
        await branchSettingsAPI.updateGlobal({ whatsapp: encryptedWhatsapp, whatsappScope });
      } else if (selectedBranch) {
        await branchSettingsAPI.update(selectedBranch, { whatsapp: encryptedWhatsapp, whatsappScope });
      } else {
        throw new Error("Cannot save per-branch settings without a selected branch");
      }
      setSuccess("WhatsApp settings saved successfully!");
      setTimeout(() => setSuccess(""), 3000);
      fetchAllBranchConfigs();
    } catch (err: any) {
      setError(err.message || err.response?.data?.message || "Failed to save WhatsApp settings");
    } finally {
      setSaving(false);
    }
  };

  const resetEmailConfigForBranch = async (branchId: string, branchName: string) => {
    if (!confirm(`Reset email configuration for ${branchName}? This will clear all email settings.`)) return;
    setSaving(true);
    setError("");
    try {
      await branchSettingsAPI.update(branchId, {
        email: { provider: "smtp", host: "", port: 587, username: "", password: "", fromEmail: "", fromName: "", replyTo: "", isEnabled: false }
      });
      setSuccess(`Email configuration reset for ${branchName}`);
      setTimeout(() => setSuccess(""), 3000);
      if (selectedBranch === branchId) {
        setEmailForm({ provider: "smtp", host: "", port: 587, username: "", password: "", fromEmail: "", fromName: "", replyTo: "", accessKeyId: "", secretAccessKey: "", region: "us-east-1", apiKey: "", domain: "", isEnabled: false });
      }
      fetchAllBranchConfigs();
    } catch (err: any) {
      setError(err.message || "Failed to reset email configuration");
    } finally {
      setSaving(false);
    }
  };

  const resetWhatsappConfigForBranch = async (branchId: string, branchName: string) => {
    if (!confirm(`Reset WhatsApp configuration for ${branchName}? This will clear all WhatsApp settings.`)) return;
    setSaving(true);
    setError("");
    try {
      await branchSettingsAPI.update(branchId, {
        whatsapp: { provider: "meta", phoneNumberId: "", businessAccountId: "", accessToken: "", phoneNumber: "", defaultCountryCode: "+91", isEnabled: false }
      });
      setSuccess(`WhatsApp configuration reset for ${branchName}`);
      setTimeout(() => setSuccess(""), 3000);
      if (selectedBranch === branchId) {
        setWhatsappForm({ provider: "meta", phoneNumberId: "", businessAccountId: "", accessToken: "", accountSid: "", authToken: "", phoneNumber: "", appName: "", sourcePhoneNumber: "", apiEndpoint: "", defaultCountryCode: "+91", isEnabled: false });
      }
      fetchAllBranchConfigs();
    } catch (err: any) {
      setError(err.message || "Failed to reset WhatsApp configuration");
    } finally {
      setSaving(false);
    }
  };

  const scrollToEmailForm = () => {
    document.getElementById('email-config-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const scrollToWhatsappForm = () => {
    document.getElementById('whatsapp-config-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const openTestEmailModal = () => {
    setTestEmailAddress(emailForm.fromEmail || "");
    setTestEmailStatus('idle');
    setShowTestEmailModal(true);
  };

  const testEmail = async () => {
    if (!testEmailAddress) { setError("Please enter an email address"); return; }
    setTestingEmail(true);
    setTestEmailStatus('sending');
    setError("");
    try {
      const branchId = emailScope === "global" ? "global" : selectedBranch;
      if (!branchId) {
        setTestEmailStatus('error');
        setError("Please select a branch first");
        setTestingEmail(false);
        return;
      }
      await branchSettingsAPI.testEmail(branchId, testEmailAddress);
      setTestEmailStatus('success');
      setSuccess("Test email sent successfully!");
      setTimeout(() => { setShowTestEmailModal(false); setSuccess(""); setTestEmailStatus('idle'); }, 2000);
    } catch (err: any) {
      setTestEmailStatus('error');
      setError(err.message || "Failed to send test email");
    } finally {
      setTestingEmail(false);
    }
  };

  const openTestWhatsAppModal = () => {
    setTestPhoneNumber("");
    setTestWhatsAppStatus('idle');
    setShowTestWhatsAppModal(true);
  };

  const testWhatsapp = async () => {
    if (!testPhoneNumber) { setError("Please enter a phone number"); return; }
    setTestingWhatsApp(true);
    setTestWhatsAppStatus('sending');
    setError("");
    try {
      const branchId = whatsappScope === "global" ? "global" : selectedBranch;
      if (branchId) {
        await branchSettingsAPI.testWhatsApp(branchId, testPhoneNumber);
        setTestWhatsAppStatus('success');
        setSuccess("Test WhatsApp message sent successfully!");
        setTimeout(() => { setShowTestWhatsAppModal(false); setSuccess(""); setTestWhatsAppStatus('idle'); }, 2000);
      }
    } catch (err: any) {
      setTestWhatsAppStatus('error');
      const status = err.response?.status;
      const msg = err.response?.data?.message || err.message || "Failed to send test message";
      if (status === 401) {
        setError("Session expired — please log out and log back in, then try again.");
      } else if (status === 403) {
        setError("Permission denied — only admins can send test messages.");
      } else {
        setError(msg);
      }
    } finally {
      setTestingWhatsApp(false);
    }
  };

  const openCreateApiModal = () => {
    setEditingApiKey(null);
    setApiForm({ name: "", description: "", branchId: branches[0]?._id || "", permissions: ["orders:read", "orders:create"], requestsPerMinute: 60, requestsPerDay: 10000, isActive: true });
    setShowApiModal(true);
  };

  const openEditApiModal = (apiKey: APIKey) => {
    setEditingApiKey(apiKey);
    setApiForm({ name: apiKey.name, description: apiKey.description || "", branchId: apiKey.branchId._id, permissions: apiKey.permissions, requestsPerMinute: apiKey.rateLimit.requestsPerMinute, requestsPerDay: apiKey.rateLimit.requestsPerDay, isActive: apiKey.isActive });
    setShowApiModal(true);
  };

  const saveApiKey = async () => {
    if (!apiForm.name.trim()) { setError("API key name is required"); return; }
    if (!apiForm.branchId) { setError("Please select a branch"); return; }
    setSaving(true);
    setError("");
    try {
      const data = { name: apiForm.name, description: apiForm.description, branchId: apiForm.branchId, permissions: apiForm.permissions, rateLimit: { requestsPerMinute: apiForm.requestsPerMinute, requestsPerDay: apiForm.requestsPerDay }, isActive: apiForm.isActive };
      if (editingApiKey) { await externalAPIKeyAPI.update(editingApiKey._id, data); }
      else { await externalAPIKeyAPI.create(data); }
      setShowApiModal(false);
      setEditingApiKey(null);
      fetchApiKeys();
      setSuccess(`API key ${editingApiKey ? "updated" : "created"} successfully!`);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to save API key");
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
      setError(err.message || "Failed to delete API key");
    }
  };

  const regenerateApiKey = async (id: string) => {
    if (!confirm("Are you sure you want to regenerate this API key?")) return;
    try {
      await externalAPIKeyAPI.regenerateSecret(id);
      fetchApiKeys();
      setSuccess("API key regenerated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to regenerate API key");
    }
  };

  const copyToClipboard = (text: string, keyId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyId);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const togglePermission = (permissionId: string) => {
    setApiForm((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId) ?
        prev.permissions.filter((p) => p !== permissionId) :
        [...prev.permissions, permissionId]
    }));
  };

  const openCreateEmailTemplateModal = () => {
    setEditingEmailTemplate(null);
    setEmailTemplateForm({ name: "", eventType: "custom", subject: "", body: "", variables: [], isActive: true, isGlobal: emailScope === "global" });
    setShowEmailTemplateModal(true);
  };

  const openEditEmailTemplateModal = (template: EmailTemplate) => {
    setEditingEmailTemplate(template);
    setEmailTemplateForm({ name: template.name, eventType: template.eventType || "custom", subject: template.subject, body: template.body, variables: template.variables, isActive: template.isActive, isGlobal: template.isGlobal || false });
    setShowEmailTemplateModal(true);
  };

  const saveEmailTemplate = async () => {
    if (!emailTemplateForm.name.trim()) { setError("Template name is required"); return; }
    if (!emailTemplateForm.subject.trim()) { setError("Subject is required"); return; }
    if (!emailTemplateForm.body.trim()) { setError("Email body is required"); return; }
    setSaving(true);
    setError("");
    const isEditing = !!editingEmailTemplate?._id;
    try {
      const templateData = {
        name: emailTemplateForm.name, eventType: emailTemplateForm.eventType,
        subject: emailTemplateForm.subject, body: emailTemplateForm.body,
        variables: emailTemplateForm.variables, isActive: emailTemplateForm.isActive,
        ...(emailScope === "global" ? { isGlobal: true } : { branchId: selectedBranch })
      };
      if (isEditing) { await emailTemplateAPI.update(editingEmailTemplate._id, templateData); }
      else { await emailTemplateAPI.create(templateData); }
      setShowEmailTemplateModal(false);
      setEditingEmailTemplate(null);
      fetchEmailTemplates();
      setSuccess(`Email template ${isEditing ? "updated" : "created"} successfully!`);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to save email template");
    } finally {
      setSaving(false);
    }
  };

  const deleteEmailTemplate = async (id: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;
    try {
      await emailTemplateAPI.delete(id);
      fetchEmailTemplates();
      setSuccess("Email template deleted successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to delete template");
    }
  };

  const openCreateWhatsappTemplateModal = () => {
    setEditingWhatsappTemplate(null);
    setWhatsappTemplateForm({ name: "", eventType: "custom", body: "", variables: [], isActive: true, isGlobal: whatsappScope === "global" });
    setShowWhatsappTemplateModal(true);
  };

  const openEditWhatsappTemplateModal = (template: WhatsAppTemplate) => {
    setEditingWhatsappTemplate(template);
    setWhatsappTemplateForm({ name: template.name, eventType: template.eventType || "custom", body: template.body, variables: template.variables, isActive: template.isActive, isGlobal: template.isGlobal || false });
    setShowWhatsappTemplateModal(true);
  };

  const saveWhatsappTemplate = async () => {
    if (!whatsappTemplateForm.name.trim()) { setError("Template name is required"); return; }
    if (!whatsappTemplateForm.body.trim()) { setError("Message body is required"); return; }
    setSaving(true);
    setError("");
    const isEditing = !!editingWhatsappTemplate?._id;
    try {
      const templateData = {
        name: whatsappTemplateForm.name, eventType: whatsappTemplateForm.eventType,
        body: whatsappTemplateForm.body, variables: whatsappTemplateForm.variables,
        isActive: whatsappTemplateForm.isActive,
        ...(whatsappScope === "global" ? { isGlobal: true } : { branchId: selectedBranch })
      };
      if (isEditing) { await whatsappTemplateAPI.update(editingWhatsappTemplate._id, templateData); }
      else { await whatsappTemplateAPI.create(templateData); }
      setShowWhatsappTemplateModal(false);
      setEditingWhatsappTemplate(null);
      fetchWhatsappTemplates();
      setSuccess(`WhatsApp template ${isEditing ? "updated" : "created"} successfully!`);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to save WhatsApp template");
    } finally {
      setSaving(false);
    }
  };

  const deleteWhatsappTemplate = async (id: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;
    try {
      await whatsappTemplateAPI.delete(id);
      fetchWhatsappTemplates();
      setSuccess("WhatsApp template deleted successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to delete template");
    }
  };

  const extractVariables = (text: string): string[] => {
    const regex = /\{\{(\w+)\}\}/g;
    const matches = text.matchAll(regex);
    return Array.from(new Set(Array.from(matches, (m) => m[1])));
  };

  const insertVariable = (variable: string, type: "email" | "whatsapp") => {
    const variableText = `{{${variable}}}`;
    if (type === "email") {
      setEmailTemplateForm((prev) => ({ ...prev, body: prev.body + variableText, variables: extractVariables(prev.body + variableText) }));
    } else {
      setWhatsappTemplateForm((prev) => ({ ...prev, body: prev.body + variableText, variables: extractVariables(prev.body + variableText) }));
    }
  };

  const userRole = userData?.role;
  const isAdmin = userRole === "admin";

  if (!isMasterAdmin && !isAdmin) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', padding: '32px', width: '100%', maxWidth: '400px', textAlign: 'center', border: '1px solid #e5e7eb' }}>
          <div style={{ width: '64px', height: '64px', backgroundColor: '#fef2f2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <svg style={{ width: '32px', height: '32px', color: '#dc2626' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>Access Denied</h2>
          <p style={{ color: '#6b7280', marginBottom: '16px' }}>Only Master Admin or Admin can access settings.</p>
          <button onClick={() => navigate("/")} style={{ backgroundColor: '#FF6B35', color: 'white', fontWeight: '500', padding: '8px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>Go Back</button>
        </div>
      </div>
    );
  }

  const allTabs = [
    { id: "email" as TabType, name: "Email Config", icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z", masterAdminOnly: true },
    { id: "emailTemplates" as TabType, name: "Email Templates", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", masterAdminOnly: false },
    { id: "whatsapp" as TabType, name: "WhatsApp Config", icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z", masterAdminOnly: true },
    { id: "whatsappTemplates" as TabType, name: "WhatsApp Templates", icon: "M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z", masterAdminOnly: false },
    { id: "api" as TabType, name: "API Keys", icon: "M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z", masterAdminOnly: true },
    { id: "mcp" as TabType, name: "MCP AI Keys", icon: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z", masterAdminOnly: true }
  ];

  const tabs = isMasterAdmin ? allTabs : allTabs.filter(tab => !tab.masterAdminOnly);

  useEffect(() => {
    if (isAdmin) {
      if (emailScope === "global") setEmailScope("per_branch");
      if (whatsappScope === "global") setWhatsappScope("per_branch");
    }
  }, [isAdmin, emailScope, whatsappScope]);

  return (
    <>
      <style>{`
        .tabs-scrollbar::-webkit-scrollbar { height: 8px; }
        .tabs-scrollbar::-webkit-scrollbar-track { background: #f3f4f6; border-radius: 4px; }
        .tabs-scrollbar::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 4px; }
        .tabs-scrollbar::-webkit-scrollbar-thumb:hover { background: #9ca3af; }
        .table-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
        .table-scrollbar::-webkit-scrollbar-track { background: #f3f4f6; border-radius: 4px; }
        .table-scrollbar::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 4px; }
        .table-scrollbar::-webkit-scrollbar-thumb:hover { background: #9ca3af; }
        .table-scrollbar::-webkit-scrollbar-corner { background: #f3f4f6; }
      `}</style>
      <div style={{ height: '100vh', backgroundColor: '#f9fafb', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <div style={{ backgroundColor: 'white', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', borderBottom: '1px solid #e5e7eb', flexShrink: 0 }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button onClick={() => navigate(-1)} style={{ padding: '8px', borderRadius: '8px', border: 'none', background: 'none', cursor: 'pointer' }}>
                  <svg style={{ width: '24px', height: '24px', color: '#6b7280' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div>
                  <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: 0 }}>Master Settings</h1>
                  <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Email, WhatsApp & API Configuration</p>
                </div>
              </div>
              <span style={{ padding: '4px 12px', backgroundColor: '#FF6B35', color: 'white', fontSize: '14px', fontWeight: '500', borderRadius: '9999px' }}>
                {isMasterAdmin ? 'Master Admin' : 'Admin'}
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ backgroundColor: 'white', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', borderBottom: '1px solid #e5e7eb', flexShrink: 0 }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px' }}>
            <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', paddingBottom: '8px', scrollbarWidth: 'auto', WebkitOverflowScrolling: 'touch' } as React.CSSProperties} className="tabs-scrollbar">
              {tabs.map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', fontWeight: '500', fontSize: '14px', color: activeTab === tab.id ? '#FF6B35' : '#6b7280', backgroundColor: activeTab === tab.id ? '#fff7ed' : 'transparent', border: 'none', borderBottom: activeTab === tab.id ? '2px solid #FF6B35' : '2px solid transparent', cursor: 'pointer', whiteSpace: 'nowrap', borderRadius: '8px 8px 0 0', transition: 'all 0.2s' }}>
                  <svg style={{ width: '16px', height: '16px', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                  </svg>
                  <span>{tab.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Messages */}
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '16px 16px 0', width: '100%', boxSizing: 'border-box' }}>
          {error && (
            <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg style={{ width: '20px', height: '20px', color: '#dc2626' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span style={{ color: '#b91c1c' }}>{error}</span>
              </div>
              <button onClick={() => setError("")} style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer' }}>
                <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
          {success && (
            <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg style={{ width: '20px', height: '20px', color: '#16a34a' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span style={{ color: '#15803d' }}>{success}</span>
              </div>
              <button onClick={() => setSuccess("")} style={{ color: '#22c55e', border: 'none', background: 'none', cursor: 'pointer' }}>
                <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }} className="table-scrollbar">
          <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 16px' }}>
            {loading && (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
                <InfinitySpinner />
              </div>
            )}

            {/* ==================== EMAIL SETTINGS TAB ==================== */}
            {activeTab === "email" && !loading && (
              <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' }}>
                <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                    <div>
                      <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF6B35" strokeWidth="2">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                          <polyline points="22,6 12,13 2,6" />
                        </svg>
                        Email Configuration
                      </h2>
                      <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>Configure email settings for sending order notifications</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#f3f4f6', borderRadius: '8px', padding: '4px' }}>
                        {isMasterAdmin && (
                          <button onClick={() => setEmailScope("global")} style={{ padding: '6px 12px', fontSize: '14px', fontWeight: '500', borderRadius: '6px', border: 'none', cursor: 'pointer', backgroundColor: emailScope === "global" ? 'white' : 'transparent', color: emailScope === "global" ? '#FF6B35' : '#6b7280', boxShadow: emailScope === "global" ? '0 1px 2px rgba(0,0,0,0.1)' : 'none' }}>
                            Global
                          </button>
                        )}
                        <button onClick={() => setEmailScope("per_branch")} style={{ padding: '6px 12px', fontSize: '14px', fontWeight: '500', borderRadius: '6px', border: 'none', cursor: 'pointer', backgroundColor: emailScope === "per_branch" ? 'white' : 'transparent', color: emailScope === "per_branch" ? '#FF6B35' : '#6b7280', boxShadow: emailScope === "per_branch" ? '0 1px 2px rgba(0,0,0,0.1)' : 'none' }}>
                          Per Branch
                        </button>
                      </div>
                      {emailScope === "per_branch" && (
                        branches.length > 0 ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <label style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>Branch:</label>
                            <select value={selectedBranch} onChange={(e) => handleBranchChange(e.target.value)} style={{ padding: '10px 16px', border: '2px solid #FF6B35', borderRadius: '8px', backgroundColor: '#fff7ed', color: '#111827', fontSize: '14px', fontWeight: '500', minWidth: '200px', cursor: 'pointer', outline: 'none' }}>
                              {branches.map((b) => <option key={b._id} value={b._id}>{b.name} {b.code ? `(${b.code})` : ''}</option>)}
                            </select>
                          </div>
                        ) : (
                          <span style={{ padding: '8px 16px', backgroundColor: '#fef3c7', color: '#92400e', fontSize: '13px', borderRadius: '8px' }}>No branches found. Create a branch first.</span>
                        )
                      )}
                    </div>
                  </div>
                </div>

                {/* Branch configs table */}
                {branches.length > 0 && (
                  <div style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <div style={{ padding: '16px 24px', backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                      <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#374151', margin: 0 }}>All Branch Email Configurations</h3>
                    </div>
                    <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: '400px' }} className="table-scrollbar">
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                        <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                          <tr style={{ backgroundColor: '#f9fafb' }}>
                            {['Branch','Status','Provider','Host','Port','User','From Email','Actions'].map(h => (
                              <th key={h} style={{ padding: '12px 16px', textAlign: h === 'Actions' ? 'center' : 'left', fontWeight: '600', color: '#374151', borderBottom: '2px solid #e5e7eb', backgroundColor: '#f9fafb' }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {branches.map((branch, index) => {
                            const branchCfg = allBranchConfigs[branch._id];
                            const config = branchCfg?.email || {} as Partial<EmailConfig>;
                            const isConfigured = !!branchCfg;
                            const isSelected = selectedBranch === branch._id;
                            // When scope is global, all branches inherit the global config
                            const effectiveEnabled = emailScope === 'global' ? emailForm.isEnabled : config.isEnabled;
                            return (
                              <tr key={branch._id} onClick={() => handleBranchChange(branch._id)}
                                style={{ backgroundColor: isSelected ? '#fff7ed' : index % 2 === 0 ? 'white' : '#fafafa', cursor: 'pointer', transition: 'background-color 0.2s', borderLeft: isSelected ? '3px solid #FF6B35' : '3px solid transparent' }}
                                onMouseOver={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = '#f5f5f5'; }}
                                onMouseOut={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'white' : '#fafafa'; }}>
                                <td style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontWeight: '600', color: '#1f2937' }}>{branch.name}</span>
                                    {branch.code && <span style={{ padding: '2px 6px', fontSize: '10px', backgroundColor: '#e0e7ff', color: '#4338ca', borderRadius: '4px' }}>{branch.code}</span>}
                                    {isSelected && <span style={{ padding: '2px 6px', fontSize: '10px', backgroundColor: '#ffedd5', color: '#9a3412', borderRadius: '4px', fontWeight: '600' }}>Selected</span>}
                                  </div>
                                </td>
                                <td style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb' }}>
                                  {emailScope === 'global' ? (
                                    <span style={{ padding: '4px 10px', fontSize: '11px', fontWeight: '600', borderRadius: '12px', backgroundColor: effectiveEnabled ? '#dcfce7' : '#fee2e2', color: effectiveEnabled ? '#166534' : '#dc2626' }}>
                                      {effectiveEnabled ? 'Global ✓' : 'Global (off)'}
                                    </span>
                                  ) : !isConfigured ? (
                                    <span style={{ padding: '4px 10px', fontSize: '11px', fontWeight: '600', borderRadius: '12px', backgroundColor: '#f3f4f6', color: '#6b7280' }}>Not configured</span>
                                  ) : (
                                    <span style={{ padding: '4px 10px', fontSize: '11px', fontWeight: '600', borderRadius: '12px', backgroundColor: effectiveEnabled ? '#dcfce7' : '#fee2e2', color: effectiveEnabled ? '#166534' : '#dc2626' }}>
                                      {effectiveEnabled ? 'Enabled' : 'Disabled'}
                                    </span>
                                  )}
                                </td>
                                <td style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb', fontFamily: 'monospace', color: '#6b7280' }}>{emailScope === 'global' ? (emailForm.provider || 'smtp').toUpperCase() : isConfigured ? (config.provider || 'smtp').toUpperCase() : '—'}</td>
                                <td style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb', fontFamily: 'monospace', color: config.host ? '#1f2937' : '#9ca3af' }}>{emailScope === 'global' ? (emailForm.host || '—') : (config.host || '—')}</td>
                                <td style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb', fontFamily: 'monospace', color: config.port ? '#1f2937' : '#9ca3af' }}>{config.port || '—'}</td>
                                <td style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb', fontFamily: 'monospace', color: config.username ? '#1f2937' : '#9ca3af', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{config.username || '—'}</td>
                                <td style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb', fontFamily: 'monospace', color: config.fromEmail ? '#1f2937' : '#9ca3af', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{config.fromEmail || '—'}</td>
                                <td style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb', textAlign: 'center' }}>
                                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                                    <button onClick={(e) => { e.stopPropagation(); handleBranchChange(branch._id); setTimeout(scrollToEmailForm, 100); }} style={{ padding: '6px 12px', border: 'none', borderRadius: '6px', background: '#FF6B35', color: 'white', fontSize: '12px', cursor: 'pointer', fontWeight: '500' }}>Edit</button>
                                    <button onClick={(e) => { e.stopPropagation(); resetEmailConfigForBranch(branch._id, branch.name); }} style={{ padding: '6px 12px', border: '1px solid #fecaca', borderRadius: '6px', background: '#fef2f2', color: '#dc2626', fontSize: '12px', cursor: 'pointer', fontWeight: '500' }}>Reset</button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div id="email-config-form" style={{ padding: '24px' }}>
                  {/* Enable Toggle */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px', marginBottom: '24px' }}>
                    <div>
                      <label style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>Enable Email Notifications</label>
                      <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>Allow sending emails from this configuration</p>
                    </div>
                    <button onClick={() => setEmailForm({ ...emailForm, isEnabled: !emailForm.isEnabled })} style={{ position: 'relative', width: '44px', height: '24px', borderRadius: '9999px', border: 'none', cursor: 'pointer', backgroundColor: emailForm.isEnabled ? '#FF6B35' : '#d1d5db', transition: 'background-color 0.2s' }}>
                      <span style={{ position: 'absolute', top: '2px', left: emailForm.isEnabled ? '22px' : '2px', width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'white', transition: 'left 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.2)' }} />
                    </button>
                  </div>

                  {/* Provider Selection */}
                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Email Provider</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
                      {[{ id: "smtp", name: "SMTP Server" }, { id: "ses", name: "Amazon SES" }, { id: "sendgrid", name: "SendGrid" }, { id: "mailgun", name: "Mailgun" }].map((provider) => (
                        <button key={provider.id} onClick={() => setEmailForm({ ...emailForm, provider: provider.id })} style={{ padding: '16px', border: `2px solid ${emailForm.provider === provider.id ? '#FF6B35' : '#e5e7eb'}`, borderRadius: '8px', textAlign: 'center', cursor: 'pointer', backgroundColor: emailForm.provider === provider.id ? '#fff7ed' : 'white', color: emailForm.provider === provider.id ? '#FF6B35' : '#374151', fontWeight: '500', fontSize: '14px', transition: 'all 0.2s' }}>
                          {provider.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {emailForm.provider === "smtp" && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                      {[
                        { label: 'SMTP Host *', key: 'host', type: 'text', placeholder: 'smtp.gmail.com' },
                        { label: 'Port *', key: 'port', type: 'number', placeholder: '' },
                        { label: 'Username *', key: 'username', type: 'text', placeholder: 'your-email@gmail.com' },
                        { label: 'Password *', key: 'password', type: 'password', placeholder: 'Enter to update' },
                      ].map(field => (
                        <div key={field.key}>
                          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>{field.label}</label>
                          <input type={field.type} value={(emailForm as any)[field.key]} onChange={(e) => setEmailForm({ ...emailForm, [field.key]: field.type === 'number' ? (parseInt(e.target.value) || 587) : e.target.value })} style={{ width: '100%', padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }} placeholder={field.placeholder} />
                        </div>
                      ))}
                    </div>
                  )}

                  {emailForm.provider === "ses" && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>AWS Region *</label>
                        <input type="text" value={emailForm.region} onChange={(e) => setEmailForm({ ...emailForm, region: e.target.value })} style={{ width: '100%', padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }} placeholder="us-east-1" />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Access Key ID *</label>
                        <input type="text" value={emailForm.accessKeyId} onChange={(e) => setEmailForm({ ...emailForm, accessKeyId: e.target.value })} style={{ width: '100%', padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }} placeholder="AKIAIOSFODNN7EXAMPLE" />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Secret Access Key *</label>
                        <input type="password" value={emailForm.secretAccessKey} onChange={(e) => setEmailForm({ ...emailForm, secretAccessKey: e.target.value })} style={{ width: '100%', padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }} placeholder="Enter to update" />
                      </div>
                    </div>
                  )}

                  {emailForm.provider === "sendgrid" && (
                    <div style={{ marginBottom: '24px' }}>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>SendGrid API Key *</label>
                      <input type="password" value={emailForm.apiKey} onChange={(e) => setEmailForm({ ...emailForm, apiKey: e.target.value })} style={{ width: '100%', padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }} placeholder="SG.xxxxx" />
                    </div>
                  )}

                  {emailForm.provider === "mailgun" && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Mailgun API Key *</label>
                        <input type="password" value={emailForm.apiKey} onChange={(e) => setEmailForm({ ...emailForm, apiKey: e.target.value })} style={{ width: '100%', padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }} placeholder="key-xxxxx" />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Domain *</label>
                        <input type="text" value={emailForm.domain} onChange={(e) => setEmailForm({ ...emailForm, domain: e.target.value })} style={{ width: '100%', padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }} placeholder="mg.yourdomain.com" />
                      </div>
                    </div>
                  )}

                  {/* Sender Info */}
                  <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '24px', marginTop: '24px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>Sender Information</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>From Email *</label>
                        <input type="email" value={emailForm.fromEmail} onChange={(e) => setEmailForm({ ...emailForm, fromEmail: e.target.value })} style={{ width: '100%', padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }} placeholder="noreply@company.com" />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>From Name *</label>
                        <input type="text" value={emailForm.fromName} onChange={(e) => setEmailForm({ ...emailForm, fromName: e.target.value })} style={{ width: '100%', padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }} placeholder="Company Name" />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Reply-To</label>
                        <input type="email" value={emailForm.replyTo} onChange={(e) => setEmailForm({ ...emailForm, replyTo: e.target.value })} style={{ width: '100%', padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }} placeholder="reply@company.com" />
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', padding: '24px', marginTop: '24px', borderTop: '1px solid #e5e7eb' }}>
                    <button onClick={saveEmailSettings} disabled={saving} style={{ backgroundColor: '#FF6B35', color: 'white', padding: '10px 24px', borderRadius: '8px', fontWeight: '500', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.5 : 1 }}>
                      {saving ? "Saving..." : "Save Settings"}
                    </button>
                    <button onClick={openTestEmailModal} disabled={saving || !emailForm.isEnabled} style={{ border: '2px solid #FF6B35', color: '#FF6B35', padding: '10px 24px', borderRadius: '8px', fontWeight: '600', backgroundColor: 'white', cursor: saving || !emailForm.isEnabled ? 'not-allowed' : 'pointer', opacity: saving || !emailForm.isEnabled ? 0.5 : 1 }}>
                      Send Test Email
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ==================== WHATSAPP SETTINGS TAB ==================== */}
            {activeTab === "whatsapp" && !loading && (
              <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' }}>
                <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                    <div>
                      <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#25D366" strokeWidth="2">
                          <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
                        </svg>
                        WhatsApp Configuration
                      </h2>
                      <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>Configure WhatsApp settings for sending order notifications</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#f3f4f6', borderRadius: '8px', padding: '4px' }}>
                        {isMasterAdmin && (
                          <button onClick={() => setWhatsappScope("global")} style={{ padding: '6px 12px', fontSize: '14px', fontWeight: '500', borderRadius: '6px', border: 'none', cursor: 'pointer', backgroundColor: whatsappScope === "global" ? 'white' : 'transparent', color: whatsappScope === "global" ? '#25D366' : '#6b7280', boxShadow: whatsappScope === "global" ? '0 1px 2px rgba(0,0,0,0.1)' : 'none' }}>
                            Global
                          </button>
                        )}
                        <button onClick={() => setWhatsappScope("per_branch")} style={{ padding: '6px 12px', fontSize: '14px', fontWeight: '500', borderRadius: '6px', border: 'none', cursor: 'pointer', backgroundColor: whatsappScope === "per_branch" ? 'white' : 'transparent', color: whatsappScope === "per_branch" ? '#25D366' : '#6b7280', boxShadow: whatsappScope === "per_branch" ? '0 1px 2px rgba(0,0,0,0.1)' : 'none' }}>
                          Per Branch
                        </button>
                      </div>
                      {whatsappScope === "per_branch" && (
                        branches.length > 0 ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <label style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>Branch:</label>
                            <select value={selectedBranch} onChange={(e) => handleBranchChange(e.target.value)} style={{ padding: '10px 16px', border: '2px solid #25D366', borderRadius: '8px', backgroundColor: '#f0fdf4', color: '#111827', fontSize: '14px', fontWeight: '500', minWidth: '200px', cursor: 'pointer', outline: 'none' }}>
                              {branches.map((b) => <option key={b._id} value={b._id}>{b.name} {b.code ? `(${b.code})` : ''}</option>)}
                            </select>
                          </div>
                        ) : (
                          <span style={{ padding: '8px 16px', backgroundColor: '#fef3c7', color: '#92400e', fontSize: '13px', borderRadius: '8px' }}>No branches found.</span>
                        )
                      )}
                    </div>
                  </div>
                </div>

                {/* WhatsApp branch configs table */}
                {whatsappScope === "per_branch" && branches.length > 0 && (
                  <div style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <div style={{ padding: '16px 24px', backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                      <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#374151', margin: 0 }}>All Branch WhatsApp Configurations</h3>
                    </div>
                    <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: '400px' }} className="table-scrollbar">
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                        <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                          <tr style={{ backgroundColor: '#f9fafb' }}>
                            {['Branch','Status','Provider','Phone Number','Actions'].map(h => (
                              <th key={h} style={{ padding: '12px 16px', textAlign: h === 'Actions' ? 'center' : 'left', fontWeight: '600', color: '#374151', borderBottom: '2px solid #e5e7eb', backgroundColor: '#f9fafb' }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {branches.map((branch, index) => {
                            const branchCfg = allBranchConfigs[branch._id];
                            const config = branchCfg?.whatsapp || {} as Partial<WhatsAppConfig>;
                            const isConfigured = !!branchCfg;
                            const isSelected = selectedBranch === branch._id;
                            return (
                              <tr key={branch._id} onClick={() => handleBranchChange(branch._id)}
                                style={{ backgroundColor: isSelected ? '#f0fdf4' : index % 2 === 0 ? 'white' : '#fafafa', cursor: 'pointer', transition: 'background-color 0.2s', borderLeft: isSelected ? '3px solid #25D366' : '3px solid transparent' }}
                                onMouseOver={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = '#f5f5f5'; }}
                                onMouseOut={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'white' : '#fafafa'; }}>
                                <td style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontWeight: '600', color: '#1f2937' }}>{branch.name}</span>
                                    {branch.code && <span style={{ padding: '2px 6px', fontSize: '10px', backgroundColor: '#e0e7ff', color: '#4338ca', borderRadius: '4px' }}>{branch.code}</span>}
                                    {isSelected && <span style={{ padding: '2px 6px', fontSize: '10px', backgroundColor: '#d1fae5', color: '#065f46', borderRadius: '4px', fontWeight: '600' }}>Selected</span>}
                                  </div>
                                </td>
                                <td style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb' }}>
                                  {!isConfigured ? (
                                    <span style={{ padding: '4px 10px', fontSize: '11px', fontWeight: '600', borderRadius: '12px', backgroundColor: '#f3f4f6', color: '#6b7280' }}>Not configured</span>
                                  ) : (
                                    <span style={{ padding: '4px 10px', fontSize: '11px', fontWeight: '600', borderRadius: '12px', backgroundColor: config.isEnabled ? '#dcfce7' : '#fee2e2', color: config.isEnabled ? '#166534' : '#dc2626' }}>
                                      {config.isEnabled ? 'Enabled' : 'Disabled'}
                                    </span>
                                  )}
                                </td>
                                <td style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb', fontFamily: 'monospace', color: '#6b7280' }}>{isConfigured ? (config.provider || 'meta').toUpperCase() : '—'}</td>
                                <td style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb', fontFamily: 'monospace', color: '#1f2937' }}>
                                  {!isConfigured ? <span style={{ color: '#9ca3af' }}>—</span> :
                                   config.provider === 'meta' ? (config.phoneNumberId || '—') :
                                   config.provider === 'twilio' ? (config.phoneNumber || '—') :
                                   config.provider === 'gupshup' ? (config.sourcePhoneNumber || config.appName || '—') :
                                   config.provider === 'wati' ? (config.apiEndpoint || '—') : '—'}
                                </td>
                                <td style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb', textAlign: 'center' }}>
                                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                                    <button onClick={(e) => { e.stopPropagation(); handleBranchChange(branch._id); setTimeout(scrollToWhatsappForm, 100); }} style={{ padding: '6px 12px', border: 'none', borderRadius: '6px', background: '#25D366', color: 'white', fontSize: '12px', cursor: 'pointer', fontWeight: '500' }}>Edit</button>
                                    <button onClick={(e) => { e.stopPropagation(); resetWhatsappConfigForBranch(branch._id, branch.name); }} style={{ padding: '6px 12px', border: '1px solid #fecaca', borderRadius: '6px', background: '#fef2f2', color: '#dc2626', fontSize: '12px', cursor: 'pointer', fontWeight: '500' }}>Reset</button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div id="whatsapp-config-form" style={{ padding: '24px' }}>
                  {/* Enable Toggle */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px', marginBottom: '24px' }}>
                    <div>
                      <label style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>Enable WhatsApp Notifications</label>
                      <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>Allow sending WhatsApp messages from this configuration</p>
                    </div>
                    <button onClick={() => setWhatsappForm({ ...whatsappForm, isEnabled: !whatsappForm.isEnabled })} style={{ position: 'relative', width: '44px', height: '24px', borderRadius: '9999px', border: 'none', cursor: 'pointer', backgroundColor: whatsappForm.isEnabled ? '#25D366' : '#d1d5db', transition: 'background-color 0.2s' }}>
                      <span style={{ position: 'absolute', top: '2px', left: whatsappForm.isEnabled ? '22px' : '2px', width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'white', transition: 'left 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.2)' }} />
                    </button>
                  </div>

                  {/* Provider Selection */}
                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>WhatsApp Provider</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
                      {[{ id: "meta", name: "Meta (Official)" }, { id: "twilio", name: "Twilio" }, { id: "gupshup", name: "Gupshup" }, { id: "wati", name: "WATI" }].map((provider) => (
                        <button key={provider.id} onClick={() => setWhatsappForm({ ...whatsappForm, provider: provider.id })} style={{ padding: '16px', border: `2px solid ${whatsappForm.provider === provider.id ? '#25D366' : '#e5e7eb'}`, borderRadius: '8px', textAlign: 'center', cursor: 'pointer', backgroundColor: whatsappForm.provider === provider.id ? '#f0fdf4' : 'white', color: whatsappForm.provider === provider.id ? '#15803d' : '#374151', fontWeight: '500', fontSize: '14px', transition: 'all 0.2s' }}>
                          {provider.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Meta Fields */}
                  {whatsappForm.provider === "meta" && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Phone Number ID *</label>
                        <input type="text" value={whatsappForm.phoneNumberId} onChange={(e) => setWhatsappForm({ ...whatsappForm, phoneNumberId: e.target.value })} style={{ width: '100%', padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }} placeholder="123456789" />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Business Account ID *</label>
                        <input type="text" value={whatsappForm.businessAccountId} onChange={(e) => setWhatsappForm({ ...whatsappForm, businessAccountId: e.target.value })} style={{ width: '100%', padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }} placeholder="987654321" />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Access Token *</label>
                        <input type="password" value={whatsappForm.accessToken} onChange={(e) => setWhatsappForm({ ...whatsappForm, accessToken: e.target.value })} style={{ width: '100%', padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }} placeholder="Enter to update" />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Phone Number</label>
                        <input type="text" value={whatsappForm.phoneNumber} onChange={(e) => setWhatsappForm({ ...whatsappForm, phoneNumber: e.target.value })} style={{ width: '100%', padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }} placeholder="+91XXXXXXXXXX" />
                      </div>
                      <div style={{ gridColumn: '1 / -1' }}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                          Order Template Name
                          <span style={{ fontWeight: 400, color: '#6b7280', marginLeft: '8px', fontSize: '13px' }}>
                            (Meta-approved template for sending order messages)
                          </span>
                        </label>
                        <input
                          type="text"
                          value={whatsappForm.orderTemplateName || ""}
                          onChange={(e) => setWhatsappForm({ ...whatsappForm, orderTemplateName: e.target.value })}
                          style={{ width: '100%', padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                          placeholder="e.g. order_confirmation"
                        />
                        <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                          Leave blank to send free-text (only works when customer has messaged you in last 24h).
                          Set this to send order notifications anytime using your approved Meta template.
                          The template must have one body variable <code style={{ background: '#f3f4f6', padding: '1px 4px', borderRadius: '3px' }}>{"{{1}}"}</code> which will be filled with the order message.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Twilio Fields */}
                  {whatsappForm.provider === "twilio" && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Account SID *</label>
                        <input type="text" value={whatsappForm.accountSid} onChange={(e) => setWhatsappForm({ ...whatsappForm, accountSid: e.target.value })} style={{ width: '100%', padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }} placeholder="ACxxxxxxxx" />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Auth Token *</label>
                        <input type="password" value={whatsappForm.authToken} onChange={(e) => setWhatsappForm({ ...whatsappForm, authToken: e.target.value })} style={{ width: '100%', padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }} placeholder="Enter to update" />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Phone Number *</label>
                        <input type="text" value={whatsappForm.phoneNumber} onChange={(e) => setWhatsappForm({ ...whatsappForm, phoneNumber: e.target.value })} style={{ width: '100%', padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }} placeholder="whatsapp:+14155238886" />
                      </div>
                    </div>
                  )}

                  {/* Gupshup Fields */}
                  {whatsappForm.provider === "gupshup" && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>API Key *</label>
                        <input type="password" value={whatsappForm.apiKey} onChange={(e) => setWhatsappForm({ ...whatsappForm, apiKey: e.target.value })} style={{ width: '100%', padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }} placeholder="Enter to update" />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>App Name *</label>
                        <input type="text" value={whatsappForm.appName} onChange={(e) => setWhatsappForm({ ...whatsappForm, appName: e.target.value })} style={{ width: '100%', padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }} placeholder="MyApp" />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Source Phone Number *</label>
                        <input type="text" value={whatsappForm.sourcePhoneNumber} onChange={(e) => setWhatsappForm({ ...whatsappForm, sourcePhoneNumber: e.target.value })} style={{ width: '100%', padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }} placeholder="+91XXXXXXXXXX" />
                      </div>
                    </div>
                  )}

                  {/* WATI Fields */}
                  {whatsappForm.provider === "wati" && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>API Endpoint *</label>
                        <input type="text" value={whatsappForm.apiEndpoint} onChange={(e) => setWhatsappForm({ ...whatsappForm, apiEndpoint: e.target.value })} style={{ width: '100%', padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }} placeholder="https://live-server-xxx.wati.io" />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Access Token *</label>
                        <input type="password" value={whatsappForm.accessToken} onChange={(e) => setWhatsappForm({ ...whatsappForm, accessToken: e.target.value })} style={{ width: '100%', padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }} placeholder="Enter to update" />
                      </div>
                    </div>
                  )}

                  {/* Default Country Code */}
                  <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '24px', marginTop: '8px', marginBottom: '24px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Default Country Code</label>
                    <input type="text" value={whatsappForm.defaultCountryCode} onChange={(e) => setWhatsappForm({ ...whatsappForm, defaultCountryCode: e.target.value })} style={{ width: '120px', padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }} placeholder="+91" />
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', padding: '24px', marginTop: '8px', borderTop: '1px solid #e5e7eb' }}>
                    <button onClick={saveWhatsappSettings} disabled={saving} style={{ backgroundColor: '#25D366', color: 'white', padding: '10px 24px', borderRadius: '8px', fontWeight: '500', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.5 : 1 }}>
                      {saving ? "Saving..." : "Save Settings"}
                    </button>
                    <button onClick={openTestWhatsAppModal} disabled={saving || !whatsappForm.isEnabled} style={{ border: '2px solid #25D366', color: '#25D366', padding: '10px 24px', borderRadius: '8px', fontWeight: '600', backgroundColor: 'white', cursor: saving || !whatsappForm.isEnabled ? 'not-allowed' : 'pointer', opacity: saving || !whatsappForm.isEnabled ? 0.5 : 1 }}>
                      Send Test Message
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ==================== MCP AI KEYS TAB ==================== */}
            {activeTab === "mcp" && (
              <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' }}>
                {/* Header */}
                <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                  <div>
                    <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0 }}>MCP AI Keys</h2>
                    <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>Connect Claude, GPT, or any AI model to your manufacturing data</p>
                  </div>
                  <button onClick={() => setShowMcpModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#7c3aed', color: 'white', padding: '8px 16px', borderRadius: '8px', fontWeight: '500', border: 'none', cursor: 'pointer' }}>
                    <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    New MCP Key
                  </button>
                </div>

                {/* How to use info box */}
                <div style={{ margin: '20px 24px', padding: '16px', backgroundColor: '#f5f3ff', borderRadius: '8px', border: '1px solid #ddd6fe' }}>
                  <p style={{ fontWeight: '600', color: '#5b21b6', margin: '0 0 8px 0', fontSize: '14px' }}>How to use MCP AI Keys</p>
                  <ol style={{ margin: 0, paddingLeft: '20px', color: '#6b7280', fontSize: '13px', lineHeight: '1.8' }}>
                    <li>Create a key below and copy it (shown only once)</li>
                    <li>In Claude Desktop → Settings → MCP Servers, add your server URL and paste the key as Bearer token</li>
                    <li>Ask the AI: <em>"Show me pending orders this week"</em> or <em>"Send Ramesh's order report to WhatsApp"</em></li>
                  </ol>
                  <p style={{ margin: '10px 0 0 0', fontSize: '12px', color: '#7c3aed', fontWeight: '500' }}>
                    MCP Server URL: <code style={{ backgroundColor: '#ede9fe', padding: '2px 6px', borderRadius: '4px' }}>{import.meta.env.VITE_API_27INFINITY_IN || 'https://api.27infinity.in'}/mcp/call</code>
                  </p>
                </div>

                {/* Revealed plain key (after create/rotate) */}
                {newMcpPlainKey && (
                  <div style={{ margin: '0 24px 20px', padding: '16px', backgroundColor: '#fef3c7', borderRadius: '8px', border: '1px solid #f59e0b' }}>
                    <p style={{ fontWeight: '600', color: '#92400e', margin: '0 0 8px 0', fontSize: '14px' }}>⚠️ Copy this key now — it will NOT be shown again</p>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <code style={{ flex: 1, backgroundColor: 'white', padding: '8px 12px', borderRadius: '6px', fontSize: '13px', border: '1px solid #f59e0b', wordBreak: 'break-all' }}>{newMcpPlainKey}</code>
                      <button onClick={() => { navigator.clipboard.writeText(newMcpPlainKey); setNewMcpPlainKey(null); }} style={{ backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '6px', padding: '8px 14px', cursor: 'pointer', fontWeight: '500', whiteSpace: 'nowrap' }}>
                        Copy & Close
                      </button>
                    </div>
                  </div>
                )}

                {/* Keys list */}
                <div style={{ padding: '0 24px 24px' }}>
                  {mcpLoading ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>Loading...</div>
                  ) : mcpKeys.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '48px', color: '#6b7280' }}>
                      <p style={{ fontSize: '15px', margin: 0 }}>No MCP keys yet. Create one to connect an AI model.</p>
                    </div>
                  ) : mcpKeys.map(k => (
                    <div key={k._id} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px', marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: '600', color: '#111827', fontSize: '15px' }}>{k.name}</span>
                          <span style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '600', backgroundColor: k.isActive ? '#d1fae5' : '#fee2e2', color: k.isActive ? '#065f46' : '#991b1b' }}>{k.isActive ? 'Active' : 'Inactive'}</span>
                        </div>
                        {k.description && <p style={{ fontSize: '13px', color: '#6b7280', margin: '4px 0 0' }}>{k.description}</p>}
                        <p style={{ fontSize: '12px', color: '#9ca3af', margin: '6px 0 0' }}>
                          Key: <code style={{ backgroundColor: '#f3f4f6', padding: '1px 6px', borderRadius: '4px' }}>{k.keyPrefix}...</code>
                          {' · '}Role: {k.userRole}
                          {' · '}Created: {new Date(k.createdAt).toLocaleDateString()}
                          {k.lastUsedAt && ` · Last used: ${new Date(k.lastUsedAt).toLocaleDateString()}`}
                          {k.totalRequests ? ` · ${k.totalRequests} requests` : ''}
                        </p>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
                          {k.permissions.map(p => (
                            <span key={p} style={{ padding: '2px 8px', backgroundColor: '#ede9fe', color: '#5b21b6', borderRadius: '10px', fontSize: '11px', fontWeight: '500' }}>{p}</span>
                          ))}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => rotateMcpKey(k._id)} style={{ padding: '6px 12px', border: '1px solid #7c3aed', borderRadius: '6px', color: '#7c3aed', backgroundColor: 'white', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>Rotate</button>
                        <button onClick={() => deleteMcpKey(k._id)} style={{ padding: '6px 12px', border: '1px solid #e5e7eb', borderRadius: '6px', color: '#ef4444', backgroundColor: 'white', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>Deactivate</button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Create Key Modal */}
                {showMcpModal && (
                  <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'stretch', justifyContent: 'flex-end', zIndex: 1000 }}>
                    <div style={{ backgroundColor: 'white', borderRadius: '12px 0 0 12px', padding: '28px', width: '50vw', minWidth: '400px', maxWidth: '700px', height: '100vh', overflowY: 'auto', boxShadow: '-4px 0 24px rgba(0,0,0,0.15)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <h3 style={{ margin: 0, fontWeight: '600', fontSize: '17px' }}>Create MCP AI Key</h3>
                        <button onClick={() => setShowMcpModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', borderRadius: '6px', display: 'flex', alignItems: 'center', color: '#6b7280' }}>
                          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>

                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Key Name *</label>
                      <input value={mcpForm.name} onChange={e => setMcpForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Claude Desktop — Gopal" style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box', marginBottom: '14px' }} />

                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Description</label>
                      <input value={mcpForm.description} onChange={e => setMcpForm(f => ({ ...f, description: e.target.value }))} placeholder="What is this key for?" style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box', marginBottom: '14px' }} />

                      {/* ── Branch Scope ── */}
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Branch Access</label>
                      {isMasterAdmin && (
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', cursor: 'pointer', padding: '10px 14px', border: `1px solid ${mcpForm.isGlobal ? '#7c3aed' : '#d1d5db'}`, borderRadius: '8px', backgroundColor: mcpForm.isGlobal ? '#f5f3ff' : 'white' }}>
                          <input type="checkbox" checked={mcpForm.isGlobal} onChange={e => setMcpForm(f => ({ ...f, isGlobal: e.target.checked, selectedBranchIds: [] }))} style={{ margin: 0, width: '16px', height: '16px' }} />
                          <div>
                            <div style={{ fontWeight: '600', fontSize: '13px', color: mcpForm.isGlobal ? '#5b21b6' : '#111827' }}>Global — All Branches</div>
                            <div style={{ fontSize: '12px', color: '#6b7280' }}>This key can access data from all branches</div>
                          </div>
                        </label>
                      )}
                      {!mcpForm.isGlobal && (
                        <div style={{ marginBottom: '14px' }}>
                          <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 8px' }}>Select branches this key can access:</p>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '160px', overflowY: 'auto', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '8px' }}>
                            {branches.length === 0 && <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0, padding: '8px' }}>No branches found</p>}
                            {branches.map(b => (
                              <label key={b._id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '6px 8px', borderRadius: '6px', backgroundColor: mcpForm.selectedBranchIds.includes(b._id) ? '#f5f3ff' : 'transparent' }}>
                                <input type="checkbox" checked={mcpForm.selectedBranchIds.includes(b._id)} onChange={() => toggleMcpBranch(b._id)} style={{ margin: 0 }} />
                                <span style={{ fontSize: '13px', fontWeight: mcpForm.selectedBranchIds.includes(b._id) ? '600' : '400', color: mcpForm.selectedBranchIds.includes(b._id) ? '#5b21b6' : '#374151' }}>{b.name}</span>
                                <span style={{ fontSize: '11px', color: '#9ca3af' }}>{b.code}</span>
                              </label>
                            ))}
                          </div>
                          {!mcpForm.isGlobal && mcpForm.selectedBranchIds.length === 0 && (
                            <p style={{ fontSize: '12px', color: '#ef4444', margin: '6px 0 0' }}>Select at least one branch</p>
                          )}
                        </div>
                      )}

                      {/* ── Permissions ── */}
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Permissions</label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                        {MCP_PERMS.map(p => (
                          <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', padding: '6px 10px', border: `1px solid ${mcpForm.permissions.includes(p.id) ? '#7c3aed' : '#d1d5db'}`, borderRadius: '6px', backgroundColor: mcpForm.permissions.includes(p.id) ? '#f5f3ff' : 'white', fontSize: '13px' }}>
                            <input type="checkbox" checked={mcpForm.permissions.includes(p.id)} onChange={e => setMcpForm(f => ({ ...f, permissions: e.target.checked ? [...f.permissions, p.id] : f.permissions.filter(x => x !== p.id) }))} style={{ margin: 0 }} />
                            {p.label}
                          </label>
                        ))}
                      </div>

                      {/* ── Rate limits ── */}
                      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                        <div style={{ flex: 1 }}>
                          <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Requests / min</label>
                          <input type="number" value={mcpForm.requestsPerMinute} onChange={e => setMcpForm(f => ({ ...f, requestsPerMinute: Number(e.target.value) }))} style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Requests / day</label>
                          <input type="number" value={mcpForm.requestsPerDay} onChange={e => setMcpForm(f => ({ ...f, requestsPerDay: Number(e.target.value) }))} style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }} />
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                        <button onClick={() => setShowMcpModal(false)} style={{ padding: '8px 18px', border: '1px solid #d1d5db', borderRadius: '6px', backgroundColor: 'white', cursor: 'pointer', fontSize: '14px' }}>Cancel</button>
                        <button onClick={createMcpKey} disabled={!mcpForm.name.trim() || mcpLoading || (!mcpForm.isGlobal && mcpForm.selectedBranchIds.length === 0)} style={{ padding: '8px 18px', backgroundColor: '#7c3aed', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', opacity: (!mcpForm.name.trim() || mcpLoading || (!mcpForm.isGlobal && mcpForm.selectedBranchIds.length === 0)) ? 0.5 : 1 }}>
                          {mcpLoading ? 'Creating...' : 'Create Key'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ==================== API KEYS TAB ==================== */}
            {activeTab === "api" && !loading && (
              <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' }}>
                <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                  <div>
                    <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0 }}>External API Keys</h2>
                    <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>Manage API keys for external integrations</p>
                  </div>
                  <button onClick={openCreateApiModal} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#FF6B35', color: 'white', padding: '8px 16px', borderRadius: '8px', fontWeight: '500', border: 'none', cursor: 'pointer' }}>
                    <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create API Key
                  </button>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ backgroundColor: '#f9fafb' }}>
                      <tr>
                        {['Name','API Key','Branch','Rate Limit','Status','Actions'].map((h, i) => (
                          <th key={h} style={{ padding: '12px 24px', textAlign: i === 5 ? 'right' : 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {apiKeys.length === 0 ? (
                        <tr>
                          <td colSpan={6} style={{ padding: '48px 24px', textAlign: 'center' }}>
                            <svg style={{ width: '48px', height: '48px', margin: '0 auto 16px', color: '#9ca3af' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                            </svg>
                            <p style={{ color: '#6b7280' }}>No API keys found. Create one to get started.</p>
                          </td>
                        </tr>
                      ) : apiKeys.map((key) => (
                        <tr key={key._id} style={{ borderTop: '1px solid #e5e7eb' }}>
                          <td style={{ padding: '16px 24px' }}>
                            <div style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>{key.name}</div>
                            {key.description && <div style={{ fontSize: '12px', color: '#6b7280' }}>{key.description}</div>}
                          </td>
                          <td style={{ padding: '16px 24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <code style={{ fontSize: '14px', color: '#6b7280', fontFamily: 'monospace', backgroundColor: '#f3f4f6', padding: '4px 8px', borderRadius: '4px' }}>
                                {key.apiKey ? key.apiKey.substring(0, 12) + '...' : 'N/A'}
                              </code>
                              <button onClick={() => key.apiKey && copyToClipboard(key.apiKey, key._id)} style={{ color: '#9ca3af', border: 'none', background: 'none', cursor: 'pointer', padding: '4px' }}>
                                {copiedKey === key._id ? "✓" : "📋"}
                              </button>
                            </div>
                          </td>
                          <td style={{ padding: '16px 24px', fontSize: '14px', color: '#6b7280' }}>{key.branchId?.name || "-"}</td>
                          <td style={{ padding: '16px 24px', fontSize: '14px', color: '#6b7280' }}>{key.rateLimit.requestsPerMinute}/min</td>
                          <td style={{ padding: '16px 24px' }}>
                            <span style={{ padding: '4px 8px', fontSize: '12px', fontWeight: '500', borderRadius: '9999px', backgroundColor: key.isActive ? '#dcfce7' : '#fef2f2', color: key.isActive ? '#166534' : '#991b1b' }}>
                              {key.isActive ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                              <button onClick={() => openEditApiModal(key)} style={{ color: '#3b82f6', border: 'none', background: 'none', cursor: 'pointer', padding: '4px' }}>✏️</button>
                              <button onClick={() => deleteApiKey(key._id)} style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer', padding: '4px' }}>🗑️</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ==================== EMAIL TEMPLATES TAB ==================== */}
            {activeTab === "emailTemplates" && !loading && (
              <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' }}>
                <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '20px' }}>
                    <div>
                      <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0 }}>Email Templates</h2>
                      <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>Manage email templates for order notifications</p>
                    </div>
                    <button onClick={openCreateEmailTemplateModal} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #FF6B35, #FF8C35)', color: 'white', padding: '10px 20px', borderRadius: '8px', fontWeight: '600', border: 'none', cursor: 'pointer', boxShadow: '0 2px 8px rgba(255, 107, 53, 0.3)' }}>
                      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Create Template
                    </button>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>Filter by:</span>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button onClick={() => handleBranchChange("")} style={{ padding: '6px 14px', borderRadius: '20px', border: 'none', fontSize: '13px', fontWeight: '500', cursor: 'pointer', backgroundColor: selectedBranch === "" ? '#FF6B35' : '#f3f4f6', color: selectedBranch === "" ? 'white' : '#6b7280' }}>All Templates</button>
                      {isMasterAdmin && <button onClick={() => handleBranchChange("global")} style={{ padding: '6px 14px', borderRadius: '20px', border: 'none', fontSize: '13px', fontWeight: '500', cursor: 'pointer', backgroundColor: selectedBranch === "global" ? '#8b5cf6' : '#f3f4f6', color: selectedBranch === "global" ? 'white' : '#6b7280' }}>Global</button>}
                      {branches.map((branch) => (
                        <button key={branch._id} onClick={() => handleBranchChange(branch._id)} style={{ padding: '6px 14px', borderRadius: '20px', border: 'none', fontSize: '13px', fontWeight: '500', cursor: 'pointer', backgroundColor: selectedBranch === branch._id ? '#3b82f6' : '#f3f4f6', color: selectedBranch === branch._id ? 'white' : '#6b7280' }}>{branch.name}</button>
                      ))}
                    </div>
                  </div>
                </div>
                <div style={{ padding: '24px' }}>
                  {emailTemplates.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                      <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                        <svg width="40" height="40" fill="none" stroke="#FF6B35" strokeWidth="1.5" viewBox="0 0 24 24">
                          <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <h3 style={{ color: '#1f2937', fontSize: '16px', fontWeight: '600', margin: '0 0 8px' }}>No email templates found</h3>
                      <p style={{ color: '#6b7280', marginBottom: '20px', fontSize: '14px' }}>Create templates for order confirmations, status updates, and more.</p>
                      <button onClick={openCreateEmailTemplateModal} style={{ padding: '10px 24px', background: 'linear-gradient(135deg, #FF6B35, #FF8C35)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Create Your First Template</button>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gap: '16px' }}>
                      {emailTemplates
                        .filter((t) => !selectedBranch || selectedBranch === "" || (selectedBranch === "global" && t.isGlobal) || t.branchId === selectedBranch)
                        .map((template) => (
                          <div key={template._id} style={{ border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px', background: 'white', transition: 'all 0.2s' }}
                            onMouseOver={(e) => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'; e.currentTarget.style.borderColor = '#FF6B35'; }}
                            onMouseOut={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = '#e5e7eb'; }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                              <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                                  <h3 style={{ fontWeight: '600', color: '#111827', margin: 0, fontSize: '16px' }}>{template.name}</h3>
                                  <span style={{ padding: '3px 10px', fontSize: '11px', fontWeight: '600', borderRadius: '12px', backgroundColor: template.isActive ? '#dcfce7' : '#f3f4f6', color: template.isActive ? '#166534' : '#6b7280' }}>{template.isActive ? "Active" : "Inactive"}</span>
                                  <span style={{ padding: '3px 10px', fontSize: '11px', fontWeight: '500', borderRadius: '12px', backgroundColor: template.isGlobal ? '#f3e8ff' : '#dbeafe', color: template.isGlobal ? '#7c3aed' : '#2563eb' }}>{template.isGlobal ? "Global" : branches.find((b) => b._id === template.branchId)?.name || "Branch"}</span>
                                  {template.eventType && template.eventType !== 'custom' && <span style={{ padding: '3px 10px', fontSize: '11px', fontWeight: '500', borderRadius: '12px', backgroundColor: '#fef3c7', color: '#92400e' }}>{template.eventType}</span>}
                                </div>
                                <p style={{ fontSize: '14px', color: '#4b5563', margin: 0 }}><strong style={{ color: '#6b7280' }}>Subject:</strong> {template.subject}</p>
                              </div>
                              <div style={{ display: 'flex', gap: '4px' }}>
                                <button onClick={() => openEditEmailTemplateModal(template)} style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: '6px', background: 'white', color: '#3b82f6', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>Edit</button>
                                <button onClick={() => template._id && deleteEmailTemplate(template._id)} style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: '6px', background: 'white', color: '#ef4444', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>Delete</button>
                              </div>
                            </div>
                            <div style={{ padding: '12px 16px', backgroundColor: '#f9fafb', borderRadius: '8px', fontSize: '13px', color: '#6b7280', maxHeight: '60px', overflow: 'hidden', position: 'relative' }}>
                              <div>{template.body.substring(0, 200) + (template.body.length > 200 ? '...' : '')}</div>
                              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '24px', background: 'linear-gradient(transparent, #f9fafb)' }} />
                            </div>
                            {template.variables && template.variables.length > 0 && (
                              <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                <span style={{ fontSize: '12px', color: '#6b7280' }}>Variables:</span>
                                {template.variables.slice(0, 5).map((v) => <span key={v} style={{ padding: '2px 8px', backgroundColor: '#fff7ed', color: '#c2410c', fontSize: '11px', borderRadius: '4px', fontFamily: 'monospace' }}>{`{{${v}}}`}</span>)}
                                {template.variables.length > 5 && <span style={{ fontSize: '11px', color: '#9ca3af' }}>+{template.variables.length - 5} more</span>}
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ==================== WHATSAPP TEMPLATES TAB ==================== */}
            {activeTab === "whatsappTemplates" && !loading && (
              <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' }}>
                <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '20px' }}>
                    <div>
                      <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0 }}>WhatsApp Templates</h2>
                      <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>Manage WhatsApp message templates for order notifications</p>
                    </div>
                    <button onClick={openCreateWhatsappTemplateModal} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #25D366, #128C7E)', color: 'white', padding: '10px 20px', borderRadius: '8px', fontWeight: '600', border: 'none', cursor: 'pointer', boxShadow: '0 2px 8px rgba(37, 211, 102, 0.3)' }}>
                      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Create Template
                    </button>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>Filter by:</span>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button onClick={() => handleBranchChange("")} style={{ padding: '6px 14px', borderRadius: '20px', border: 'none', fontSize: '13px', fontWeight: '500', cursor: 'pointer', backgroundColor: selectedBranch === "" ? '#25D366' : '#f3f4f6', color: selectedBranch === "" ? 'white' : '#6b7280' }}>All Templates</button>
                      {isMasterAdmin && <button onClick={() => handleBranchChange("global")} style={{ padding: '6px 14px', borderRadius: '20px', border: 'none', fontSize: '13px', fontWeight: '500', cursor: 'pointer', backgroundColor: selectedBranch === "global" ? '#8b5cf6' : '#f3f4f6', color: selectedBranch === "global" ? 'white' : '#6b7280' }}>Global</button>}
                      {branches.map((branch) => (
                        <button key={branch._id} onClick={() => handleBranchChange(branch._id)} style={{ padding: '6px 14px', borderRadius: '20px', border: 'none', fontSize: '13px', fontWeight: '500', cursor: 'pointer', backgroundColor: selectedBranch === branch._id ? '#3b82f6' : '#f3f4f6', color: selectedBranch === branch._id ? 'white' : '#6b7280' }}>{branch.name}</button>
                      ))}
                    </div>
                  </div>
                </div>
                <div style={{ padding: '24px' }}>
                  {whatsappTemplates.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                      <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                        <svg width="40" height="40" fill="none" stroke="#25D366" strokeWidth="1.5" viewBox="0 0 24 24">
                          <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
                        </svg>
                      </div>
                      <h3 style={{ color: '#1f2937', fontSize: '16px', fontWeight: '600', margin: '0 0 8px' }}>No WhatsApp templates found</h3>
                      <p style={{ color: '#6b7280', marginBottom: '20px', fontSize: '14px' }}>Create templates for order confirmations, status updates, and more.</p>
                      <button onClick={openCreateWhatsappTemplateModal} style={{ padding: '10px 24px', background: 'linear-gradient(135deg, #25D366, #128C7E)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Create Your First Template</button>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gap: '16px' }}>
                      {whatsappTemplates
                        .filter((t) => !selectedBranch || selectedBranch === "" || (selectedBranch === "global" && t.isGlobal) || t.branchId === selectedBranch)
                        .map((template) => (
                          <div key={template._id} style={{ border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px', background: 'white', transition: 'all 0.2s' }}
                            onMouseOver={(e) => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'; e.currentTarget.style.borderColor = '#25D366'; }}
                            onMouseOut={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = '#e5e7eb'; }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                              <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                                  <h3 style={{ fontWeight: '600', color: '#111827', margin: 0, fontSize: '16px' }}>{template.name}</h3>
                                  <span style={{ padding: '3px 10px', fontSize: '11px', fontWeight: '600', borderRadius: '12px', backgroundColor: template.isActive ? '#dcfce7' : '#f3f4f6', color: template.isActive ? '#166534' : '#6b7280' }}>{template.isActive ? "Active" : "Inactive"}</span>
                                  <span style={{ padding: '3px 10px', fontSize: '11px', fontWeight: '500', borderRadius: '12px', backgroundColor: template.isGlobal ? '#f3e8ff' : '#dbeafe', color: template.isGlobal ? '#7c3aed' : '#2563eb' }}>{template.isGlobal ? "Global" : branches.find((b) => b._id === template.branchId)?.name || "Branch"}</span>
                                  {template.eventType && template.eventType !== 'custom' && <span style={{ padding: '3px 10px', fontSize: '11px', fontWeight: '500', borderRadius: '12px', backgroundColor: '#fef3c7', color: '#92400e' }}>{template.eventType}</span>}
                                </div>
                              </div>
                              <div style={{ display: 'flex', gap: '4px' }}>
                                <button onClick={() => openEditWhatsappTemplateModal(template)} style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: '6px', background: 'white', color: '#3b82f6', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>Edit</button>
                                <button onClick={() => template._id && deleteWhatsappTemplate(template._id)} style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: '6px', background: 'white', color: '#ef4444', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>Delete</button>
                              </div>
                            </div>
                            <div style={{ padding: '12px 16px', backgroundColor: '#f0fdf4', borderRadius: '8px', fontSize: '13px', color: '#374151', maxHeight: '80px', overflow: 'hidden', position: 'relative', whiteSpace: 'pre-line' }}>
                              <div>{template.body.substring(0, 200) + (template.body.length > 200 ? '...' : '')}</div>
                              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '24px', background: 'linear-gradient(transparent, #f0fdf4)' }} />
                            </div>
                            {template.variables && template.variables.length > 0 && (
                              <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                <span style={{ fontSize: '12px', color: '#6b7280' }}>Variables:</span>
                                {template.variables.slice(0, 5).map((v) => <span key={v} style={{ padding: '2px 8px', backgroundColor: '#f0fdf4', color: '#166534', fontSize: '11px', borderRadius: '4px', fontFamily: 'monospace' }}>{`{{${v}}}`}</span>)}
                                {template.variables.length > 5 && <span style={{ fontSize: '11px', color: '#9ca3af' }}>+{template.variables.length - 5} more</span>}
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ==================== API KEY MODAL ==================== */}
        {showApiModal && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '16px' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 25px 50px rgba(0,0,0,0.25)', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflow: 'auto' }}>
              <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0 }}>{editingApiKey ? "Edit API Key" : "Create API Key"}</h3>
              </div>
              <div style={{ padding: '24px' }}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Name *</label>
                  <input type="text" value={apiForm.name} onChange={(e) => setApiForm({ ...apiForm, name: e.target.value })} style={{ width: '100%', padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }} placeholder="My Integration Key" />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Description</label>
                  <input type="text" value={apiForm.description} onChange={(e) => setApiForm({ ...apiForm, description: e.target.value })} style={{ width: '100%', padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }} placeholder="Optional description" />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Branch *</label>
                  <select value={apiForm.branchId} onChange={(e) => setApiForm({ ...apiForm, branchId: e.target.value })} style={{ width: '100%', padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}>
                    <option value="">Select branch</option>
                    {branches.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
                  </select>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Permissions</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '8px' }}>
                    {AVAILABLE_PERMISSIONS.map((perm) => (
                      <label key={perm.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#374151' }}>
                        <input type="checkbox" checked={apiForm.permissions.includes(perm.id)} onChange={() => togglePermission(perm.id)} style={{ cursor: 'pointer' }} />
                        {perm.label}
                      </label>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Requests/Minute</label>
                    <input type="number" value={apiForm.requestsPerMinute} onChange={(e) => setApiForm({ ...apiForm, requestsPerMinute: parseInt(e.target.value) || 60 })} style={{ width: '100%', padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Requests/Day</label>
                    <input type="number" value={apiForm.requestsPerDay} onChange={(e) => setApiForm({ ...apiForm, requestsPerDay: parseInt(e.target.value) || 10000 })} style={{ width: '100%', padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }} />
                  </div>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: '#374151' }}>
                  <input type="checkbox" checked={apiForm.isActive} onChange={(e) => setApiForm({ ...apiForm, isActive: e.target.checked })} />
                  Active
                </label>
              </div>
              <div style={{ padding: '24px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button onClick={() => { setShowApiModal(false); setEditingApiKey(null); }} style={{ padding: '8px 16px', color: '#6b7280', border: 'none', background: 'none', cursor: 'pointer', fontWeight: '500' }}>Cancel</button>
                <button onClick={saveApiKey} disabled={saving} style={{ padding: '8px 16px', backgroundColor: '#FF6B35', color: 'white', borderRadius: '8px', fontWeight: '500', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.5 : 1 }}>
                  {saving ? "Saving..." : editingApiKey ? "Update" : "Create"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==================== EMAIL TEMPLATE MODAL ==================== */}
        {showEmailTemplateModal && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '16px' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 25px 50px rgba(0,0,0,0.25)', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflow: 'auto' }}>
              <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0 }}>{editingEmailTemplate ? "Edit Email Template" : "Create Email Template"}</h3>
              </div>
              <div style={{ padding: '24px' }}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Template Name *</label>
                  <input type="text" value={emailTemplateForm.name} onChange={(e) => setEmailTemplateForm({ ...emailTemplateForm, name: e.target.value })} style={{ width: '100%', padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }} placeholder="Order Confirmation" />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Event Type</label>
                  <select value={emailTemplateForm.eventType} onChange={(e) => setEmailTemplateForm({ ...emailTemplateForm, eventType: e.target.value })} style={{ width: '100%', padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}>
                    {EVENT_TYPES.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
                  </select>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Subject *</label>
                  <input type="text" value={emailTemplateForm.subject} onChange={(e) => setEmailTemplateForm({ ...emailTemplateForm, subject: e.target.value })} style={{ width: '100%', padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }} placeholder="Order #{{orderNumber}} Confirmed" />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Body * (HTML Supported)</label>
                  <textarea id="email-body-textarea" value={emailTemplateForm.body} onChange={(e) => { const newBody = e.target.value; setEmailTemplateForm({ ...emailTemplateForm, body: newBody, variables: extractVariables(newBody) }); }} rows={10} style={{ width: '100%', padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '13px', fontFamily: 'monospace', boxSizing: 'border-box', resize: 'vertical' }} placeholder="<p>Dear {{customerName}},</p>" />
                </div>
                {emailTemplateForm.body && (
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Preview</label>
                    <div style={{ padding: '16px', border: '1px solid #e5e7eb', borderRadius: '8px', backgroundColor: '#ffffff', maxHeight: '200px', overflow: 'auto' }}>
                      <div dangerouslySetInnerHTML={{ __html: emailTemplateForm.body.replace(/\{\{customerName\}\}/g, '<span style="background:#fef3c7;padding:2px 4px;border-radius:2px;">John Doe</span>').replace(/\{\{orderNumber\}\}/g, '<span style="background:#fef3c7;padding:2px 4px;border-radius:2px;">ORD-12345</span>').replace(/\{\{orderDate\}\}/g, '<span style="background:#fef3c7;padding:2px 4px;border-radius:2px;">' + new Date().toLocaleDateString() + '</span>').replace(/\n/g, '<br>') }} style={{ fontSize: '14px', lineHeight: '1.6' }} />
                    </div>
                  </div>
                )}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Quick Insert Variables</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {EMAIL_VARIABLES.map((v) => (
                      <button key={v.key} onClick={() => insertVariable(v.key, "email")} style={{ padding: '4px 8px', backgroundColor: '#fff7ed', color: '#FF6B35', fontSize: '12px', fontFamily: 'monospace', borderRadius: '4px', border: '1px solid #fed7aa', cursor: 'pointer' }}>{`{{${v.key}}}`}</button>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ padding: '24px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button onClick={() => setShowEmailTemplateModal(false)} style={{ padding: '8px 16px', color: '#6b7280', border: 'none', background: 'none', cursor: 'pointer', fontWeight: '500' }}>Cancel</button>
                <button onClick={saveEmailTemplate} disabled={saving || !emailTemplateForm.name || !emailTemplateForm.subject || !emailTemplateForm.body} style={{ padding: '8px 16px', backgroundColor: '#FF6B35', color: 'white', borderRadius: '8px', fontWeight: '500', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving || !emailTemplateForm.name || !emailTemplateForm.subject || !emailTemplateForm.body ? 0.5 : 1 }}>
                  {saving ? "Saving..." : editingEmailTemplate ? "Update" : "Create"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==================== WHATSAPP TEMPLATE MODAL ==================== */}
        {showWhatsappTemplateModal && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '16px' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 25px 50px rgba(0,0,0,0.25)', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflow: 'auto' }}>
              <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0 }}>{editingWhatsappTemplate ? "Edit WhatsApp Template" : "Create WhatsApp Template"}</h3>
              </div>
              <div style={{ padding: '24px' }}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Template Name *</label>
                  <input type="text" value={whatsappTemplateForm.name} onChange={(e) => setWhatsappTemplateForm({ ...whatsappTemplateForm, name: e.target.value })} style={{ width: '100%', padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }} placeholder="Order Confirmation" />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Event Type</label>
                  <select value={whatsappTemplateForm.eventType} onChange={(e) => setWhatsappTemplateForm({ ...whatsappTemplateForm, eventType: e.target.value })} style={{ width: '100%', padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}>
                    {EVENT_TYPES.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
                  </select>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Message Body *</label>
                  <textarea value={whatsappTemplateForm.body} onChange={(e) => { const newBody = e.target.value; setWhatsappTemplateForm({ ...whatsappTemplateForm, body: newBody, variables: extractVariables(newBody) }); }} rows={8} style={{ width: '100%', padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', fontFamily: 'monospace', boxSizing: 'border-box', resize: 'vertical' }} placeholder="Hello {{customerName}}!" />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Quick Insert Variables</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {EMAIL_VARIABLES.map((v) => (
                      <button key={v.key} onClick={() => insertVariable(v.key, "whatsapp")} style={{ padding: '4px 8px', backgroundColor: '#f0fdf4', color: '#166534', fontSize: '12px', fontFamily: 'monospace', borderRadius: '4px', border: 'none', cursor: 'pointer' }}>{`{{${v.key}}}`}</button>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ padding: '24px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button onClick={() => setShowWhatsappTemplateModal(false)} style={{ padding: '8px 16px', color: '#6b7280', border: 'none', background: 'none', cursor: 'pointer', fontWeight: '500' }}>Cancel</button>
                <button onClick={saveWhatsappTemplate} disabled={saving || !whatsappTemplateForm.name || !whatsappTemplateForm.body} style={{ padding: '8px 16px', backgroundColor: '#25D366', color: 'white', borderRadius: '8px', fontWeight: '500', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving || !whatsappTemplateForm.name || !whatsappTemplateForm.body ? 0.5 : 1 }}>
                  {saving ? "Saving..." : editingWhatsappTemplate ? "Update" : "Create"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TEST EMAIL MODAL ==================== */}
        {showTestEmailModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
            <div style={{ backgroundColor: 'white', borderRadius: '16px', width: '90%', maxWidth: '450px', overflow: 'hidden', boxShadow: '0 25px 50px rgba(0,0,0,0.25)' }}>
              <div style={{ background: 'linear-gradient(135deg, #FF6B35, #FF8C35)', padding: '24px', textAlign: 'center' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  {testEmailStatus === 'idle' && <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>}
                  {testEmailStatus === 'sending' && <div style={{ width: '32px', height: '32px', border: '3px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />}
                  {testEmailStatus === 'success' && <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>}
                  {testEmailStatus === 'error' && <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>}
                </div>
                <h2 style={{ color: 'white', margin: 0, fontSize: '20px', fontWeight: '600' }}>
                  {testEmailStatus === 'idle' && 'Send Test Email'}
                  {testEmailStatus === 'sending' && 'Sending Email...'}
                  {testEmailStatus === 'success' && 'Email Sent!'}
                  {testEmailStatus === 'error' && 'Send Failed'}
                </h2>
              </div>
              <div style={{ padding: '24px' }}>
                {testEmailStatus !== 'success' && (
                  <>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Send test email to:</label>
                    <input type="email" value={testEmailAddress} onChange={(e) => setTestEmailAddress(e.target.value)} placeholder="Enter email address" disabled={testingEmail} style={{ width: '100%', padding: '12px 16px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box', outline: 'none' }} onKeyDown={(e) => e.key === 'Enter' && testEmail()} />
                  </>
                )}
                {testEmailStatus === 'success' && (
                  <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                    </div>
                    <p style={{ color: '#166534', fontSize: '15px', fontWeight: '500' }}>Test email sent to {testEmailAddress}</p>
                  </div>
                )}
              </div>
              <div style={{ padding: '16px 24px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: '12px', backgroundColor: '#f9fafb' }}>
                <button onClick={() => { setShowTestEmailModal(false); setTestEmailStatus('idle'); setError(""); }} style={{ padding: '10px 20px', borderRadius: '8px', backgroundColor: 'white', color: '#6b7280', fontWeight: '500', cursor: 'pointer', border: '1px solid #e5e7eb' }}>
                  {testEmailStatus === 'success' ? 'Close' : 'Cancel'}
                </button>
                {testEmailStatus !== 'success' && (
                  <button onClick={testEmail} disabled={testingEmail || !testEmailAddress} style={{ padding: '10px 24px', border: 'none', borderRadius: '8px', background: 'linear-gradient(135deg, #FF6B35, #FF8C35)', color: 'white', fontWeight: '600', cursor: testingEmail || !testEmailAddress ? 'not-allowed' : 'pointer', opacity: !testEmailAddress ? 0.5 : 1 }}>
                    {testingEmail ? 'Sending...' : 'Send Test'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ==================== TEST WHATSAPP MODAL ==================== */}
        {showTestWhatsAppModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
            <div style={{ backgroundColor: 'white', borderRadius: '16px', width: '90%', maxWidth: '450px', overflow: 'hidden', boxShadow: '0 25px 50px rgba(0,0,0,0.25)' }}>
              <div style={{ background: 'linear-gradient(135deg, #25D366, #128C7E)', padding: '24px', textAlign: 'center' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  {testWhatsAppStatus === 'idle' && <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" /></svg>}
                  {testWhatsAppStatus === 'sending' && <div style={{ width: '32px', height: '32px', border: '3px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />}
                  {testWhatsAppStatus === 'success' && <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>}
                  {testWhatsAppStatus === 'error' && <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>}
                </div>
                <h2 style={{ color: 'white', margin: 0, fontSize: '20px', fontWeight: '600' }}>
                  {testWhatsAppStatus === 'idle' && 'Send Test Message'}
                  {testWhatsAppStatus === 'sending' && 'Sending Message...'}
                  {testWhatsAppStatus === 'success' && 'Message Sent!'}
                  {testWhatsAppStatus === 'error' && 'Send Failed'}
                </h2>
              </div>
              <div style={{ padding: '24px' }}>
                {testWhatsAppStatus !== 'success' && (
                  <>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Send test message to:</label>
                    <input type="tel" value={testPhoneNumber} onChange={(e) => setTestPhoneNumber(e.target.value)} placeholder="+91XXXXXXXXXX" disabled={testingWhatsApp} style={{ width: '100%', padding: '12px 16px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box', outline: 'none' }} onKeyDown={(e) => e.key === 'Enter' && testWhatsapp()} />
                    <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>Include country code (e.g. +91 for India)</p>
                    {error && <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', fontSize: '13px' }}>{error}</div>}
                  </>
                )}
                {testWhatsAppStatus === 'success' && (
                  <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                    </div>
                    <p style={{ color: '#166534', fontSize: '15px', fontWeight: '500' }}>Test message sent to {testPhoneNumber}</p>
                  </div>
                )}
              </div>
              <div style={{ padding: '16px 24px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: '12px', backgroundColor: '#f9fafb' }}>
                <button onClick={() => { setShowTestWhatsAppModal(false); setTestWhatsAppStatus('idle'); setError(""); }} style={{ padding: '10px 20px', borderRadius: '8px', backgroundColor: 'white', color: '#6b7280', fontWeight: '500', cursor: 'pointer', border: '1px solid #e5e7eb' }}>
                  {testWhatsAppStatus === 'success' ? 'Close' : 'Cancel'}
                </button>
                {testWhatsAppStatus !== 'success' && (
                  <button onClick={testWhatsapp} disabled={testingWhatsApp || !testPhoneNumber} style={{ padding: '10px 24px', border: 'none', borderRadius: '8px', background: 'linear-gradient(135deg, #25D366, #128C7E)', color: 'white', fontWeight: '600', cursor: testingWhatsApp || !testPhoneNumber ? 'not-allowed' : 'pointer', opacity: !testPhoneNumber ? 0.5 : 1 }}>
                    {testingWhatsApp ? 'Sending...' : 'Send Test'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* CSS Animations */}
        <style>{`
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          @keyframes pulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.1); opacity: 0.8; } }
          @keyframes bounce { 0% { transform: scale(0.5); } 50% { transform: scale(1.1); } 100% { transform: scale(1); } }
        `}</style>
      </div>
    </>
  );
};

export default MasterSettings;