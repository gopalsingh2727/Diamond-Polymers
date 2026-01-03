import { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "../redux/rootReducer";
import { InfinitySpinner } from "../../components/InfinitySpinner";
import { setSelectedBranchInAuth } from "../redux/login/authActions";
import {
  branchAPI,
  branchSettingsAPI,
  externalAPIKeyAPI,
  emailTemplateAPI,
  whatsappTemplateAPI } from
"../../utils/crudHelpers";

type TabType = "email" | "whatsapp" | "emailTemplates" | "whatsappTemplates" | "api";
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

// WARNING: This is NOT real encryption - it's just Base64 encoding which is easily reversible!
// SECURITY ISSUE: Sensitive data (passwords, tokens) should be encrypted on the backend
// TODO: Remove this frontend "encryption" and handle sensitive data properly on the server
const encryptData = (data: string): string => {
  if (!data) return "";
  // This is just Base64 encoding - NOT secure encryption!
  return btoa(unescape(encodeURIComponent(data)));
};

const decryptData = (data: string): string => {
  if (!data) return "";
  try {
    // This is just Base64 decoding - NOT secure decryption!
    return decodeURIComponent(escape(atob(data)));
  } catch {
    return data;
  }
};

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

  // Set default tab based on role - admins start with Email Templates
  const defaultTab: TabType = userData?.role === "admin" ? "emailTemplates" : "email";
  const [activeTab, setActiveTab] = useState<TabType>(defaultTab);

  // Data states
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Test states
  const [testingEmail, setTestingEmail] = useState(false);
  const [testEmailStatus, setTestEmailStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [testingWhatsApp, setTestingWhatsApp] = useState(false);
  const [testWhatsAppStatus, setTestWhatsAppStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [showTestEmailModal, setShowTestEmailModal] = useState(false);
  const [showTestWhatsAppModal, setShowTestWhatsAppModal] = useState(false);
  const [testEmailAddress, setTestEmailAddress] = useState("");
  const [testPhoneNumber, setTestPhoneNumber] = useState("");

  // All branch configurations cache
  const [allBranchConfigs, setAllBranchConfigs] = useState<Record<string, {email: EmailConfig;whatsapp: WhatsAppConfig;}>>({});

  // Scope settings (global vs per-branch)
  const [emailScope, setEmailScope] = useState<SettingsScope>("per_branch");
  const [whatsappScope, setWhatsappScope] = useState<SettingsScope>("global");

  // Email form state
  const [emailForm, setEmailForm] = useState<EmailConfig>({
    provider: "smtp",
    host: "",
    port: 587,
    username: "",
    password: "",
    fromEmail: "",
    fromName: "",
    replyTo: "",
    accessKeyId: "",
    secretAccessKey: "",
    region: "us-east-1",
    apiKey: "",
    domain: "",
    isEnabled: false
  });

  // WhatsApp form state
  const [whatsappForm, setWhatsappForm] = useState<WhatsAppConfig>({
    provider: "meta",
    phoneNumberId: "",
    businessAccountId: "",
    accessToken: "",
    accountSid: "",
    authToken: "",
    phoneNumber: "",
    appName: "",
    sourcePhoneNumber: "",
    apiEndpoint: "",
    defaultCountryCode: "+91",
    isEnabled: false
  });

  // API Key states
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [showApiModal, setShowApiModal] = useState(false);
  const [editingApiKey, setEditingApiKey] = useState<APIKey | null>(null);
  const [apiForm, setApiForm] = useState({
    name: "",
    description: "",
    branchId: "",
    permissions: ["orders:read", "orders:create"] as string[],
    requestsPerMinute: 60,
    requestsPerDay: 10000,
    isActive: true
  });
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Email Template states
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);
  const [showEmailTemplateModal, setShowEmailTemplateModal] = useState(false);
  const [editingEmailTemplate, setEditingEmailTemplate] = useState<EmailTemplate | null>(null);
  const [emailTemplateForm, setEmailTemplateForm] = useState({
    name: "",
    eventType: "custom",
    subject: "",
    body: "",
    variables: [] as string[],
    isActive: true,
    isGlobal: false
  });

  // WhatsApp Template states
  const [whatsappTemplates, setWhatsappTemplates] = useState<WhatsAppTemplate[]>([]);
  const [showWhatsappTemplateModal, setShowWhatsappTemplateModal] = useState(false);
  const [editingWhatsappTemplate, setEditingWhatsappTemplate] = useState<WhatsAppTemplate | null>(null);
  const [whatsappTemplateForm, setWhatsappTemplateForm] = useState({
    name: "",
    eventType: "custom",
    body: "",
    variables: [] as string[],
    isActive: true,
    isGlobal: false
  });

  // Handler to properly update branch selection in both local state and Redux/localStorage
  const handleBranchChange = (branchId: string) => {
    setSelectedBranch(branchId);
    // Also update in Redux and localStorage for persistence across app
    dispatch(setSelectedBranchInAuth(branchId) as any);
  };

  // Fetch branches on mount
  const fetchBranches = useCallback(async () => {
    try {
      const response = await branchAPI.getAll();
      // Handle different response formats
      let branchList: Branch[] = [];
      if (Array.isArray(response)) {
        branchList = response;
      } else if (response?.branches) {
        branchList = response.branches;
      } else if (response?.data) {
        branchList = Array.isArray(response.data) ? response.data : [];
      }


      setBranches(branchList);

      // Initialize selected branch from Redux/localStorage if available
      if (branchList.length > 0 && !selectedBranch) {
        const storedBranch = userData?.selectedBranch || localStorage.getItem("selectedBranch");
        if (storedBranch && branchList.find(b => b._id === storedBranch)) {
          setSelectedBranch(storedBranch);
        } else {
          handleBranchChange(branchList[0]._id);
        }
      }
    } catch (err: any) {

      // Don't show error for branch fetch - might not have branches yet
      setBranches([]);
    }
  }, []);

  // Fetch settings based on scope
  const fetchSettings = useCallback(async () => {
    // Only proceed if we have a branch OR if both scopes are global
    if (!selectedBranch && (emailScope === "per_branch" || whatsappScope === "per_branch")) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      let response;
      // Priority: If a branch is selected, fetch branch settings
      // Otherwise, fetch global settings if scope is global
      if (selectedBranch) {
        try {
          response = await branchSettingsAPI.getByBranch(selectedBranch);
        } catch (err: any) {
          console.error(`Error fetching settings for branch ${selectedBranch}:`, err);
          response = {};
        }
      } else if (emailScope === "global" || whatsappScope === "global") {
        try {
          response = await branchSettingsAPI.getGlobal();
        } catch (err: any) {
          console.error("Error fetching global settings:", err);
          response = {};
        }
      }

      // Extract settings from response.data.settings
      const settings = response?.data?.settings || response?.settings || {};

      // Update email form (backend returns decrypted config with masked passwords)
      if (settings?.email) {
        setEmailForm({
          provider: settings.email.provider || "smtp",
          // Handle both nested structure (smtp.host) and flat structure (host)
          host: settings.email.smtp?.host || settings.email.host || "",
          port: settings.email.smtp?.port || settings.email.port || 587,
          username: settings.email.smtp?.username || settings.email.username || "",
          password: "", // Always empty - backend masks this
          fromEmail: settings.email.fromEmail || "",
          fromName: settings.email.fromName || "",
          replyTo: settings.email.replyTo || "",
          accessKeyId: settings.email.ses?.accessKeyId || settings.email.accessKeyId || "",
          secretAccessKey: "", // Always empty - backend masks this
          region: settings.email.ses?.region || settings.email.region || "us-east-1",
          apiKey: "", // Always empty - backend masks this
          domain: settings.email.domain || "",
          isEnabled: settings.email.enabled || settings.email.isEnabled || false
        });
      }

      // Update whatsapp form (handle both nested and flat structures)
      if (settings?.whatsapp) {
        setWhatsappForm({
          provider: settings.whatsapp.provider || "meta",
          phoneNumberId: settings.whatsapp.meta?.phoneNumberId || settings.whatsapp.phoneNumberId || "",
          businessAccountId: settings.whatsapp.meta?.businessAccountId || settings.whatsapp.businessAccountId || "",
          accessToken: "",
          accountSid: settings.whatsapp.twilio?.accountSid || settings.whatsapp.accountSid || "",
          authToken: "",
          phoneNumber: settings.whatsapp.phoneNumber || settings.whatsapp.twilio?.phoneNumber || "",
          appName: settings.whatsapp.gupshup?.appName || settings.whatsapp.appName || "",
          sourcePhoneNumber: settings.whatsapp.gupshup?.sourcePhoneNumber || settings.whatsapp.sourcePhoneNumber || "",
          apiEndpoint: settings.whatsapp.wati?.apiEndpoint || settings.whatsapp.apiEndpoint || "",
          apiKey: "",
          defaultCountryCode: settings.whatsapp.defaultCountryCode || "+91",
          isEnabled: settings.whatsapp.enabled || settings.whatsapp.isEnabled || false
        });
      } else {
        // Set default form values
        setWhatsappForm({
          provider: "meta",
          phoneNumberId: "",
          businessAccountId: "",
          accessToken: "",
          accountSid: "",
          authToken: "",
          phoneNumber: "",
          appName: "",
          sourcePhoneNumber: "",
          apiEndpoint: "",
          defaultCountryCode: "+91",
          isEnabled: false
        });
      }

      if (settings?.emailScope) setEmailScope(settings.emailScope);
      if (settings?.whatsappScope) setWhatsappScope(settings.whatsappScope);

      // Also cache this branch config
      if (selectedBranch && settings) {
        setAllBranchConfigs((prev) => ({
          ...prev,
          [selectedBranch]: {
            email: settings.email || {},
            whatsapp: settings.whatsapp || {}
          }
        }));
      }

    } catch (err: any) {
      console.error("Error in fetchSettings:", err);
      setError(err.message || "Failed to load settings");
    } finally {
      setLoading(false);
    }
  }, [selectedBranch, emailScope, whatsappScope]);

  // Fetch all branch configurations for display
  const fetchAllBranchConfigs = useCallback(async () => {
    if (branches.length === 0) return;

    const configs: Record<string, {email: EmailConfig;whatsapp: WhatsAppConfig;}> = {};

    for (const branch of branches) {
      try {
        const response = await branchSettingsAPI.getByBranch(branch._id);
        // Extract settings from response.data.settings
        const settings = response?.data?.settings || response?.settings || {};

        console.log(`=== FETCHING CONFIG FOR BRANCH: ${branch.name} (${branch._id}) ===`);
        console.log('Full settings.whatsapp:', JSON.stringify(settings.whatsapp, null, 2));

        // Map the backend structure to frontend structure
        const emailConfig: Partial<EmailConfig> = {
          provider: settings.email?.provider || "smtp",
          isEnabled: settings.email?.enabled || false,
          host: settings.email?.smtp?.host || settings.email?.host || "",
          port: settings.email?.smtp?.port || settings.email?.port || 587,
          username: settings.email?.smtp?.username || settings.email?.username || "",
          password: "",
          fromEmail: settings.email?.fromEmail || "",
          fromName: settings.email?.fromName || "",
          replyTo: settings.email?.replyTo || "",
          accessKeyId: settings.email?.ses?.accessKeyId || settings.email?.accessKeyId || "",
          secretAccessKey: "",
          region: settings.email?.ses?.region || settings.email?.region || "us-east-1",
          apiKey: ""
        };

        // Check if tokens exist (they're masked as empty strings in response, but we can check the nested objects)
        const hasMetaToken = settings.whatsapp?.meta?.accessToken !== undefined ||
                            (settings.whatsapp?.meta && Object.keys(settings.whatsapp.meta).includes('accessToken'));
        const hasTwilioToken = settings.whatsapp?.twilio?.authToken !== undefined ||
                              (settings.whatsapp?.twilio && Object.keys(settings.whatsapp.twilio).includes('authToken'));

        const whatsappConfig: Partial<WhatsAppConfig> = {
          provider: settings.whatsapp?.provider || "meta",
          isEnabled: settings.whatsapp?.enabled || false,
          phoneNumberId: settings.whatsapp?.meta?.phoneNumberId || settings.whatsapp?.phoneNumberId || "",
          businessAccountId: settings.whatsapp?.meta?.businessAccountId || settings.whatsapp?.businessAccountId || "",
          accessToken: hasMetaToken ? "••••••••" : "", // Show masked if exists
          accountSid: settings.whatsapp?.twilio?.accountSid || settings.whatsapp?.accountSid || "",
          authToken: hasTwilioToken ? "••••••••" : "", // Show masked if exists
          phoneNumber: settings.whatsapp?.twilio?.phoneNumber || settings.whatsapp?.phoneNumber || "",
          appName: settings.whatsapp?.gupshup?.appName || settings.whatsapp?.appName || "",
          sourcePhoneNumber: settings.whatsapp?.gupshup?.sourcePhoneNumber || settings.whatsapp?.sourcePhoneNumber || "",
          apiEndpoint: settings.whatsapp?.wati?.apiEndpoint || settings.whatsapp?.apiEndpoint || "",
          defaultCountryCode: settings.whatsapp?.defaultCountryCode || "+91"
        };

        console.log(`Branch ${branch.name} WhatsApp config:`, whatsappConfig);

        configs[branch._id] = {
          email: emailConfig as EmailConfig,
          whatsapp: whatsappConfig as WhatsAppConfig
        };
      } catch (err) {
        console.error(`Error fetching config for branch ${branch.name}:`, err);
        configs[branch._id] = {
          email: { provider: "smtp", isEnabled: false } as EmailConfig,
          whatsapp: { provider: "meta", isEnabled: false } as WhatsAppConfig
        };
      }
    }

    setAllBranchConfigs(configs);
  }, [branches]);

  // Fetch all configs when branches change
  useEffect(() => {
    if (branches.length > 0) {
      fetchAllBranchConfigs();
    }
  }, [branches, fetchAllBranchConfigs]);

  // Fetch API keys
  const fetchApiKeys = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await externalAPIKeyAPI.getAll();
      setApiKeys(response.apiKeys || response.data || []);
    } catch (err: any) {
      // API keys endpoint might not exist yet

      setApiKeys([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch email templates
  const fetchEmailTemplates = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = emailScope === "global" ?
      await emailTemplateAPI.getGlobal() :
      selectedBranch ? await emailTemplateAPI.getByBranch(selectedBranch) : { templates: [] };
      // Extract templates array from response (handles various response formats)
      const templates = response?.data?.templates || response?.templates || response?.data || [];
      setEmailTemplates(Array.isArray(templates) ? templates : []);
    } catch (err: any) {
      console.error('Error fetching email templates:', err);
      setEmailTemplates([]);
    } finally {
      setLoading(false);
    }
  }, [selectedBranch, emailScope]);

  // Fetch whatsapp templates
  const fetchWhatsappTemplates = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = whatsappScope === "global" ?
      await whatsappTemplateAPI.getGlobal() :
      selectedBranch ? await whatsappTemplateAPI.getByBranch(selectedBranch) : { templates: [] };
      // Extract templates array from response (handles various response formats)
      const templates = response?.data?.templates || response?.templates || response?.data || [];
      setWhatsappTemplates(Array.isArray(templates) ? templates : []);
    } catch (err: any) {
      console.error('Error fetching whatsapp templates:', err);
      setWhatsappTemplates([]);
    } finally {
      setLoading(false);
    }
  }, [selectedBranch, whatsappScope]);

  // Effects
  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  useEffect(() => {
    if (activeTab === "email" || activeTab === "whatsapp") {
      fetchSettings();
    } else if (activeTab === "api") {
      fetchApiKeys();
    } else if (activeTab === "emailTemplates") {
      fetchEmailTemplates();
    } else if (activeTab === "whatsappTemplates") {
      fetchWhatsappTemplates();
    }
  }, [activeTab, selectedBranch, emailScope, whatsappScope, fetchSettings, fetchApiKeys, fetchEmailTemplates, fetchWhatsappTemplates]);

  // Save email settings
  const saveEmailSettings = async () => {
    setSaving(true);
    setError("");
    try {
      // Validate branch selection for per-branch scope
      if (emailScope === "per_branch" && !selectedBranch) {
        setError("Please select a branch before saving per-branch email settings.");
        setSaving(false);
        return;
      }

      // Frontend validation for SMTP
      if (emailForm.provider === "smtp") {
        console.log('=== FRONTEND VALIDATION ===');
        console.log('Password value:', emailForm.password);
        console.log('Password length:', emailForm.password?.length || 0);

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

      // Build nested structure that backend expects
      const encryptedEmail: any = {
        enabled: emailForm.isEnabled,
        provider: emailForm.provider,
        fromEmail: emailForm.fromEmail,
        fromName: emailForm.fromName,
        replyTo: emailForm.replyTo
      };

      if (emailForm.provider === "smtp") {
        encryptedEmail.smtp = {
          host: emailForm.host,
          port: emailForm.port,
          secure: false,
          username: emailForm.username,
          password: emailForm.password // Always include for SMTP
        };
      } else if (emailForm.provider === "ses") {
        encryptedEmail.ses = {
          region: emailForm.region,
          accessKeyId: emailForm.accessKeyId,
          secretAccessKey: emailForm.secretAccessKey || undefined // Only include if provided
        };
      } else if (emailForm.provider === "sendgrid") {
        encryptedEmail.sendgrid = {
          apiKey: emailForm.apiKey || undefined // Only include if provided
        };
      }

      if (emailScope === "global") {
        const response = await branchSettingsAPI.updateGlobal({ email: encryptedEmail, emailScope });
        // Update form with decrypted response (passwords will be empty for security)
        if (response?.data?.settings?.email) {
          const savedEmail = response.data.settings.email;
          setEmailForm({
            ...emailForm,
            host: savedEmail.host || emailForm.host,
            port: savedEmail.port || emailForm.port,
            username: savedEmail.username || emailForm.username,
            password: '', // Always empty after save
            accessKeyId: savedEmail.accessKeyId || emailForm.accessKeyId,
            secretAccessKey: '', // Always empty after save
            apiKey: '' // Always empty after save
          });
        }
      } else if (selectedBranch) {
        await branchSettingsAPI.update(selectedBranch, { email: encryptedEmail, emailScope });
      } else {
        // This should never happen due to validation above, but just in case
        throw new Error("Cannot save per-branch settings without a selected branch");
      }

      setSuccess("Email settings saved successfully!");
      setTimeout(() => setSuccess(""), 3000);
      // Refresh all branch configs
      fetchAllBranchConfigs();
    } catch (err: any) {
      console.error("Error saving email settings:", err);
      setError(err.message || err.response?.data?.message || "Failed to save email settings");
    } finally {
      setSaving(false);
    }
  };

  // Save WhatsApp settings
  const saveWhatsappSettings = async () => {
    setSaving(true);
    setError("");
    try {
      // Validate branch selection for per-branch scope
      if (whatsappScope === "per_branch" && !selectedBranch) {
        setError("Please select a branch before saving per-branch WhatsApp settings.");
        setSaving(false);
        return;
      }

      // Build nested structure that backend expects
      const encryptedWhatsapp: any = {
        enabled: whatsappForm.isEnabled,
        provider: whatsappForm.provider
      };

      if (whatsappForm.provider === "meta") {
        encryptedWhatsapp.meta = {
          phoneNumberId: whatsappForm.phoneNumberId,
          businessAccountId: whatsappForm.businessAccountId,
          accessToken: whatsappForm.accessToken || undefined // Only include if provided
        };
        encryptedWhatsapp.phoneNumber = whatsappForm.phoneNumber; // Store phone number at root level for display
      } else if (whatsappForm.provider === "twilio") {
        encryptedWhatsapp.twilio = {
          accountSid: whatsappForm.accountSid,
          authToken: whatsappForm.authToken || undefined, // Only include if provided
          phoneNumber: whatsappForm.phoneNumber
        };
      } else if (whatsappForm.provider === "gupshup") {
        encryptedWhatsapp.gupshup = {
          apiKey: whatsappForm.apiKey || undefined, // Only include if provided
          appName: whatsappForm.appName,
          sourcePhoneNumber: whatsappForm.sourcePhoneNumber
        };
      } else if (whatsappForm.provider === "wati") {
        encryptedWhatsapp.wati = {
          apiEndpoint: whatsappForm.apiEndpoint,
          accessToken: whatsappForm.accessToken || undefined // Only include if provided
        };
      }

      if (whatsappScope === "global") {
        await branchSettingsAPI.updateGlobal({ whatsapp: encryptedWhatsapp, whatsappScope });
      } else if (selectedBranch) {
        await branchSettingsAPI.update(selectedBranch, { whatsapp: encryptedWhatsapp, whatsappScope });
      } else {
        // This should never happen due to validation above, but just in case
        throw new Error("Cannot save per-branch settings without a selected branch");
      }

      setSuccess("WhatsApp settings saved successfully!");
      setTimeout(() => setSuccess(""), 3000);
      // Refresh all branch configs
      fetchAllBranchConfigs();
    } catch (err: any) {
      console.error("Error saving WhatsApp settings:", err);
      setError(err.message || err.response?.data?.message || "Failed to save WhatsApp settings");
    } finally {
      setSaving(false);
    }
  };

  // Reset Email Config for a branch
  const resetEmailConfigForBranch = async (branchId: string, branchName: string) => {
    if (!confirm(`Reset email configuration for ${branchName}? This will clear all email settings.`)) {
      return;
    }

    setSaving(true);
    setError("");
    try {
      const emptyEmailConfig = {
        provider: "smtp",
        host: "",
        port: 587,
        username: "",
        password: "",
        fromEmail: "",
        fromName: "",
        replyTo: "",
        isEnabled: false
      };

      await branchSettingsAPI.update(branchId, { email: emptyEmailConfig });
      setSuccess(`Email configuration reset for ${branchName}`);
      setTimeout(() => setSuccess(""), 3000);

      // Update local state if this is the selected branch
      if (selectedBranch === branchId) {
        setEmailForm({
          provider: "smtp", host: "", port: 587, username: "", password: "",
          fromEmail: "", fromName: "", replyTo: "", accessKeyId: "",
          secretAccessKey: "", region: "us-east-1", apiKey: "", domain: "", isEnabled: false
        });
      }

      // Refresh all branch configs
      fetchAllBranchConfigs();
    } catch (err: any) {
      setError(err.message || "Failed to reset email configuration");
    } finally {
      setSaving(false);
    }
  };

  // Reset WhatsApp Config for a branch
  const resetWhatsappConfigForBranch = async (branchId: string, branchName: string) => {
    if (!confirm(`Reset WhatsApp configuration for ${branchName}? This will clear all WhatsApp settings.`)) {
      return;
    }

    setSaving(true);
    setError("");
    try {
      const emptyWhatsappConfig = {
        provider: "meta",
        phoneNumberId: "",
        businessAccountId: "",
        accessToken: "",
        phoneNumber: "",
        defaultCountryCode: "+91",
        isEnabled: false
      };

      await branchSettingsAPI.update(branchId, { whatsapp: emptyWhatsappConfig });
      setSuccess(`WhatsApp configuration reset for ${branchName}`);
      setTimeout(() => setSuccess(""), 3000);

      // Update local state if this is the selected branch
      if (selectedBranch === branchId) {
        setWhatsappForm({
          provider: "meta",
          phoneNumberId: "",
          businessAccountId: "",
          accessToken: "",
          accountSid: "",
          authToken: "",
          phoneNumber: "",
          appName: "",
          sourcePhoneNumber: "",
          apiEndpoint: "",
          defaultCountryCode: "+91",
          isEnabled: false
        });
      }

      // Refresh all branch configs
      fetchAllBranchConfigs();
    } catch (err: any) {
      setError(err.message || "Failed to reset WhatsApp configuration");
    } finally {
      setSaving(false);
    }
  };

  // Scroll to form section
  const scrollToEmailForm = () => {
    const formElement = document.getElementById('email-config-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollToWhatsappForm = () => {
    const formElement = document.getElementById('whatsapp-config-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Open test email modal
  const openTestEmailModal = () => {
    setTestEmailAddress(emailForm.fromEmail || "");
    setTestEmailStatus('idle');
    setShowTestEmailModal(true);
  };

  // Test email with animation
  const testEmail = async () => {
    if (!testEmailAddress) {
      setError("Please enter an email address");
      return;
    }

    setTestingEmail(true);
    setTestEmailStatus('sending');
    setError("");

    try {
      const branchId = emailScope === "global" ? "global" : selectedBranch;
      if (branchId) {
        await branchSettingsAPI.testEmail(branchId, testEmailAddress);
        setTestEmailStatus('success');
        setSuccess("Test email sent successfully!");
        setTimeout(() => {
          setShowTestEmailModal(false);
          setSuccess("");
          setTestEmailStatus('idle');
        }, 2000);
      }
    } catch (err: any) {
      setTestEmailStatus('error');
      setError(err.message || "Failed to send test email");
    } finally {
      setTestingEmail(false);
    }
  };

  // Open test WhatsApp modal
  const openTestWhatsAppModal = () => {
    setTestPhoneNumber("");
    setTestWhatsAppStatus('idle');
    setShowTestWhatsAppModal(true);
  };

  // Test WhatsApp with animation
  const testWhatsapp = async () => {
    if (!testPhoneNumber) {
      setError("Please enter a phone number");
      return;
    }

    setTestingWhatsApp(true);
    setTestWhatsAppStatus('sending');
    setError("");

    try {
      const branchId = whatsappScope === "global" ? "global" : selectedBranch;
      if (branchId) {
        await branchSettingsAPI.testWhatsApp(branchId, testPhoneNumber);
        setTestWhatsAppStatus('success');
        setSuccess("Test WhatsApp message sent successfully!");
        setTimeout(() => {
          setShowTestWhatsAppModal(false);
          setSuccess("");
          setTestWhatsAppStatus('idle');
        }, 2000);
      }
    } catch (err: any) {
      setTestWhatsAppStatus('error');
      setError(err.message || "Failed to send test message");
    } finally {
      setTestingWhatsApp(false);
    }
  };

  // API Key functions
  const openCreateApiModal = () => {
    setEditingApiKey(null);
    setApiForm({
      name: "",
      description: "",
      branchId: branches[0]?._id || "",
      permissions: ["orders:read", "orders:create"],
      requestsPerMinute: 60,
      requestsPerDay: 10000,
      isActive: true
    });
    setShowApiModal(true);
  };

  const openEditApiModal = (apiKey: APIKey) => {
    setEditingApiKey(apiKey);
    setApiForm({
      name: apiKey.name,
      description: apiKey.description || "",
      branchId: apiKey.branchId._id,
      permissions: apiKey.permissions,
      requestsPerMinute: apiKey.rateLimit.requestsPerMinute,
      requestsPerDay: apiKey.rateLimit.requestsPerDay,
      isActive: apiKey.isActive
    });
    setShowApiModal(true);
  };

  const saveApiKey = async () => {
    if (!apiForm.name.trim()) {
      setError("API key name is required");
      return;
    }
    if (!apiForm.branchId) {
      setError("Please select a branch");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const data = {
        name: apiForm.name,
        description: apiForm.description,
        branchId: apiForm.branchId,
        permissions: apiForm.permissions,
        rateLimit: {
          requestsPerMinute: apiForm.requestsPerMinute,
          requestsPerDay: apiForm.requestsPerDay
        },
        isActive: apiForm.isActive
      };

      if (editingApiKey) {
        await externalAPIKeyAPI.update(editingApiKey._id, data);
      } else {
        await externalAPIKeyAPI.create(data);
      }

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

  // Email Template functions
  const openCreateEmailTemplateModal = () => {
    setEditingEmailTemplate(null);
    setEmailTemplateForm({
      name: "",
      eventType: "custom",
      subject: "",
      body: "",
      variables: [],
      isActive: true,
      isGlobal: emailScope === "global"
    });
    setShowEmailTemplateModal(true);
  };

  const openEditEmailTemplateModal = (template: EmailTemplate) => {
    setEditingEmailTemplate(template);
    setEmailTemplateForm({
      name: template.name,
      eventType: template.eventType || "custom",
      subject: template.subject,
      body: template.body,
      variables: template.variables,
      isActive: template.isActive,
      isGlobal: template.isGlobal || false
    });
    setShowEmailTemplateModal(true);
  };

  const saveEmailTemplate = async () => {
    if (!emailTemplateForm.name.trim()) {
      setError("Template name is required");
      return;
    }
    if (!emailTemplateForm.subject.trim()) {
      setError("Subject is required");
      return;
    }
    if (!emailTemplateForm.body.trim()) {
      setError("Email body is required");
      return;
    }

    setSaving(true);
    setError("");
    const isEditing = !!editingEmailTemplate?._id;
    try {
      const templateData = {
        name: emailTemplateForm.name,
        eventType: emailTemplateForm.eventType,
        subject: emailTemplateForm.subject,
        body: emailTemplateForm.body,
        variables: emailTemplateForm.variables,
        isActive: emailTemplateForm.isActive,
        ...(emailScope === "global" ? { isGlobal: true } : { branchId: selectedBranch })
      };

      if (isEditing) {
        await emailTemplateAPI.update(editingEmailTemplate._id, templateData);
      } else {
        await emailTemplateAPI.create(templateData);
      }

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

  // WhatsApp Template functions
  const openCreateWhatsappTemplateModal = () => {
    setEditingWhatsappTemplate(null);
    setWhatsappTemplateForm({
      name: "",
      eventType: "custom",
      body: "",
      variables: [],
      isActive: true,
      isGlobal: whatsappScope === "global"
    });
    setShowWhatsappTemplateModal(true);
  };

  const openEditWhatsappTemplateModal = (template: WhatsAppTemplate) => {
    setEditingWhatsappTemplate(template);
    setWhatsappTemplateForm({
      name: template.name,
      eventType: template.eventType || "custom",
      body: template.body,
      variables: template.variables,
      isActive: template.isActive,
      isGlobal: template.isGlobal || false
    });
    setShowWhatsappTemplateModal(true);
  };

  const saveWhatsappTemplate = async () => {
    if (!whatsappTemplateForm.name.trim()) {
      setError("Template name is required");
      return;
    }
    if (!whatsappTemplateForm.body.trim()) {
      setError("Message body is required");
      return;
    }

    setSaving(true);
    setError("");
    const isEditing = !!editingWhatsappTemplate?._id;
    try {
      const templateData = {
        name: whatsappTemplateForm.name,
        eventType: whatsappTemplateForm.eventType,
        body: whatsappTemplateForm.body,
        variables: whatsappTemplateForm.variables,
        isActive: whatsappTemplateForm.isActive,
        ...(whatsappScope === "global" ? { isGlobal: true } : { branchId: selectedBranch })
      };

      if (isEditing) {
        await whatsappTemplateAPI.update(editingWhatsappTemplate._id, templateData);
      } else {
        await whatsappTemplateAPI.create(templateData);
      }

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

  // Extract variables from template body
  const extractVariables = (text: string): string[] => {
    const regex = /\{\{(\w+)\}\}/g;
    const matches = text.matchAll(regex);
    return Array.from(new Set(Array.from(matches, (m) => m[1])));
  };

  // Insert variable into template
  const insertVariable = (variable: string, type: "email" | "whatsapp") => {
    const variableText = `{{${variable}}}`;
    if (type === "email") {
      setEmailTemplateForm((prev) => ({
        ...prev,
        body: prev.body + variableText,
        variables: extractVariables(prev.body + variableText)
      }));
    } else {
      setWhatsappTemplateForm((prev) => ({
        ...prev,
        body: prev.body + variableText,
        variables: extractVariables(prev.body + variableText)
      }));
    }
  };

  // Check user role access - master_admin and admin can access
  const userRole = userData?.role;
  const isMasterAdmin = userRole === "master_admin";
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
          <button onClick={() => navigate("/")} style={{ backgroundColor: '#FF6B35', color: 'white', fontWeight: '500', padding: '8px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>
            Go Back
          </button>
        </div>
      </div>);

  }

  // Define all tabs
  const allTabs = [
    { id: "email" as TabType, name: "Email Config", icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z", masterAdminOnly: true },
    { id: "emailTemplates" as TabType, name: "Email Templates", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", masterAdminOnly: false },
    { id: "whatsapp" as TabType, name: "WhatsApp Config", icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z", masterAdminOnly: true },
    { id: "whatsappTemplates" as TabType, name: "WhatsApp Templates", icon: "M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z", masterAdminOnly: false },
    { id: "api" as TabType, name: "API Keys", icon: "M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z", masterAdminOnly: true }
  ];

  // Filter tabs based on role - admins only see template tabs
  const tabs = isMasterAdmin ? allTabs : allTabs.filter(tab => !tab.masterAdminOnly);

  // Force admins to use per_branch scope (they cannot create global templates)
  useEffect(() => {
    if (isAdmin) {
      if (emailScope === "global") setEmailScope("per_branch");
      if (whatsappScope === "global") setWhatsappScope("per_branch");
    }
  }, [isAdmin, emailScope, whatsappScope]);

  return (
    <>
      <style>{`
        .tabs-scrollbar::-webkit-scrollbar {
          height: 8px;
        }
        .tabs-scrollbar::-webkit-scrollbar-track {
          background: #f3f4f6;
          border-radius: 4px;
        }
        .tabs-scrollbar::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 4px;
        }
        .tabs-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }

        .table-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .table-scrollbar::-webkit-scrollbar-track {
          background: #f3f4f6;
          border-radius: 4px;
        }
        .table-scrollbar::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 4px;
        }
        .table-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
        .table-scrollbar::-webkit-scrollbar-corner {
          background: #f3f4f6;
        }
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
            <span style={{ padding: '4px 12px', backgroundColor: '#FF6B35', color: 'white', fontSize: '14px', fontWeight: '500', borderRadius: '9999px' }}>Master Admin</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ backgroundColor: 'white', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', borderBottom: '1px solid #e5e7eb', flexShrink: 0 }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px' }}>
          <div
            style={{
              display: 'flex',
              gap: '4px',
              overflowX: 'auto',
              paddingBottom: '8px',
              scrollbarWidth: 'auto',
              WebkitOverflowScrolling: 'touch'
            } as React.CSSProperties}
            className="tabs-scrollbar"
          >
            {tabs.map((tab) =>
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 16px',
                fontWeight: '500',
                fontSize: '14px',
                color: activeTab === tab.id ? '#FF6B35' : '#6b7280',
                backgroundColor: activeTab === tab.id ? '#fff7ed' : 'transparent',
                border: 'none',
                borderBottom: activeTab === tab.id ? '2px solid #FF6B35' : '2px solid transparent',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                borderRadius: '8px 8px 0 0',
                transition: 'all 0.2s'
              }}>

                <svg style={{ width: '16px', height: '16px', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                </svg>
                <span>{tab.name}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '16px 16px 0' }}>
        {error &&
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
        }
        {success &&
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
        }
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }} className="table-scrollbar">
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 16px' }}>
        {loading &&
        <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
            <InfinitySpinner />
          </div>
        }

        {/* Email Settings Tab */}
        {activeTab === "email" && !loading &&
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
                      <button
                      onClick={() => setEmailScope("global")}
                      style={{
                        padding: '6px 12px',
                        fontSize: '14px',
                        fontWeight: '500',
                        borderRadius: '6px',
                        border: 'none',
                        cursor: 'pointer',
                        backgroundColor: emailScope === "global" ? 'white' : 'transparent',
                        color: emailScope === "global" ? '#FF6B35' : '#6b7280',
                        boxShadow: emailScope === "global" ? '0 1px 2px rgba(0,0,0,0.1)' : 'none'
                      }}>
                        Global
                      </button>
                    )}
                    <button
                    onClick={() => setEmailScope("per_branch")}
                    style={{
                      padding: '6px 12px',
                      fontSize: '14px',
                      fontWeight: '500',
                      borderRadius: '6px',
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: emailScope === "per_branch" ? 'white' : 'transparent',
                      color: emailScope === "per_branch" ? '#FF6B35' : '#6b7280',
                      boxShadow: emailScope === "per_branch" ? '0 1px 2px rgba(0,0,0,0.1)' : 'none'
                    }}>
                      Per Branch
                    </button>
                  </div>
                  {emailScope === "per_branch" && (
                branches.length > 0 ?
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <label style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>Branch:</label>
                        <select
                    value={selectedBranch}
                    onChange={(e) => handleBranchChange(e.target.value)}
                    style={{
                      padding: '10px 16px',
                      border: '2px solid #FF6B35',
                      borderRadius: '8px',
                      backgroundColor: '#fff7ed',
                      color: '#111827',
                      fontSize: '14px',
                      fontWeight: '500',
                      minWidth: '200px',
                      cursor: 'pointer',
                      outline: 'none'
                    }}>

                          {branches.map((b) =>
                    <option key={b._id} value={b._id}>{b.name} {b.code ? `(${b.code})` : ''}</option>
                    )}
                        </select>
                      </div> :

                <span style={{ padding: '8px 16px', backgroundColor: '#fef3c7', color: '#92400e', fontSize: '13px', borderRadius: '8px' }}>
                        No branches found. Create a branch first.
                      </span>)

                }
                </div>
              </div>
            </div>

            {/* Configuration List - Table Format */}
            {emailScope === "per_branch" && branches.length > 0 &&
          <div style={{ borderBottom: '1px solid #e5e7eb' }}>
                <div style={{ padding: '16px 24px', backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#374151', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF6B35" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                    All Branch Email Configurations
                  </h3>
                </div>
                <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: '400px' }} className="table-scrollbar">
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                      <tr style={{ backgroundColor: '#f9fafb' }}>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '2px solid #e5e7eb', backgroundColor: '#f9fafb' }}>Branch</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '2px solid #e5e7eb', backgroundColor: '#f9fafb' }}>Status</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '2px solid #e5e7eb', backgroundColor: '#f9fafb' }}>Provider</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '2px solid #e5e7eb', backgroundColor: '#f9fafb' }}>Host</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '2px solid #e5e7eb', backgroundColor: '#f9fafb' }}>Port</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '2px solid #e5e7eb', backgroundColor: '#f9fafb' }}>User</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '2px solid #e5e7eb', backgroundColor: '#f9fafb' }}>From Email</th>
                        <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '600', color: '#374151', borderBottom: '2px solid #e5e7eb', backgroundColor: '#f9fafb' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {branches.map((branch, index) => {
                    const config = allBranchConfigs[branch._id]?.email || {} as Partial<EmailConfig>;
                    const isSelected = selectedBranch === branch._id;
                    return (
                      <tr
                        key={branch._id}
                        onClick={() => handleBranchChange(branch._id)}
                        style={{
                          backgroundColor: isSelected ? '#fff7ed' : index % 2 === 0 ? 'white' : '#fafafa',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s',
                          borderLeft: isSelected ? '3px solid #FF6B35' : '3px solid transparent'
                        }}
                        onMouseOver={(e) => {if (!isSelected) e.currentTarget.style.backgroundColor = '#f5f5f5';}}
                        onMouseOut={(e) => {if (!isSelected) e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'white' : '#fafafa';}}>

                            <td style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontWeight: '600', color: '#1f2937' }}>{branch.name}</span>
                                {branch.code &&
                            <span style={{ padding: '2px 6px', fontSize: '10px', backgroundColor: '#e0e7ff', color: '#4338ca', borderRadius: '4px' }}>
                                    {branch.code}
                                  </span>
                            }
                              </div>
                            </td>
                            <td style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb' }}>
                              <span style={{
                            padding: '4px 10px',
                            fontSize: '11px',
                            fontWeight: '600',
                            borderRadius: '12px',
                            backgroundColor: config.isEnabled ? '#dcfce7' : '#fee2e2',
                            color: config.isEnabled ? '#166534' : '#dc2626'
                          }}>
                                {config.isEnabled ? 'Enabled' : 'Disabled'}
                              </span>
                            </td>
                            <td style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb', fontFamily: 'monospace', color: '#6b7280' }}>
                              {(config.provider || 'smtp').toUpperCase()}
                            </td>
                            <td style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb', fontFamily: 'monospace', color: config.host ? '#1f2937' : '#9ca3af' }}>
                              {config.host || '—'}
                            </td>
                            <td style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb', fontFamily: 'monospace', color: config.port ? '#1f2937' : '#9ca3af' }}>
                              {config.port || '—'}
                            </td>
                            <td style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb', fontFamily: 'monospace', color: config.username ? '#1f2937' : '#9ca3af', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {config.username || '—'}
                            </td>
                            <td style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb', fontFamily: 'monospace', color: config.fromEmail ? '#1f2937' : '#9ca3af', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {config.fromEmail || '—'}
                            </td>
                            <td style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb', textAlign: 'center' }}>
                              <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                                <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleBranchChange(branch._id);
                                setTimeout(() => scrollToEmailForm(), 100);
                              }}
                              style={{
                                padding: '6px 12px',
                                border: 'none',
                                borderRadius: '6px',
                                background: '#FF6B35',
                                color: 'white',
                                fontSize: '12px',
                                cursor: 'pointer',
                                fontWeight: '500',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}>

                                  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                                  </svg>
                                  Edit
                                </button>
                                <button
                              onClick={(e) => {
                                e.stopPropagation();
                                resetEmailConfigForBranch(branch._id, branch.name);
                              }}
                              style={{
                                padding: '6px 12px',
                                border: '1px solid #fecaca',
                                borderRadius: '6px',
                                background: '#fef2f2',
                                color: '#dc2626',
                                fontSize: '12px',
                                cursor: 'pointer',
                                fontWeight: '500'
                              }}>

                                  Reset
                                </button>
                              </div>
                            </td>
                          </tr>);

                  })}
                    </tbody>
                  </table>
                </div>
              </div>
          }

            <div id="email-config-form" style={{ padding: '24px' }}>
              {/* Enable Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px', marginBottom: '24px' }}>
                <div>
                  <label style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>Enable Email Notifications</label>
                  <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>Allow sending emails from this configuration</p>
                </div>
                <button
                onClick={() => setEmailForm({ ...emailForm, isEnabled: !emailForm.isEnabled })}
                style={{
                  position: 'relative',
                  width: '44px',
                  height: '24px',
                  borderRadius: '9999px',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: emailForm.isEnabled ? '#FF6B35' : '#d1d5db',
                  transition: 'background-color 0.2s'
                }}>

                  <span style={{
                  position: 'absolute',
                  top: '2px',
                  left: emailForm.isEnabled ? '22px' : '2px',
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  backgroundColor: 'white',
                  transition: 'left 0.2s',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
                }} />
                </button>
              </div>

              {/* Provider Selection */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Email Provider</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
                  {[
                { id: "smtp", name: "SMTP Server" },
                { id: "ses", name: "Amazon SES" },
                { id: "sendgrid", name: "SendGrid" },
                { id: "mailgun", name: "Mailgun" }].
                map((provider) =>
                <button
                  key={provider.id}
                  onClick={() => setEmailForm({ ...emailForm, provider: provider.id })}
                  style={{
                    padding: '16px',
                    border: `2px solid ${emailForm.provider === provider.id ? '#FF6B35' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    backgroundColor: emailForm.provider === provider.id ? '#fff7ed' : 'white',
                    color: emailForm.provider === provider.id ? '#FF6B35' : '#374151',
                    fontWeight: '500',
                    fontSize: '14px',
                    transition: 'all 0.2s'
                  }}>

                      {provider.name}
                    </button>
                )}
                </div>
              </div>

              {/* SMTP Fields */}
              {emailForm.provider === "smtp" &&
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>SMTP Host *</label>
                    <input
                  type="text"
                  value={emailForm.host}
                  onChange={(e) => setEmailForm({ ...emailForm, host: e.target.value })}
                  style={{ width: '100%', padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                  placeholder="smtp.gmail.com" />

                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Port *</label>
                    <input
                  type="number"
                  value={emailForm.port}
                  onChange={(e) => setEmailForm({ ...emailForm, port: parseInt(e.target.value) || 587 })}
                  style={{ width: '100%', padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }} />

                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Username *</label>
                    <input
                  type="text"
                  value={emailForm.username}
                  onChange={(e) => setEmailForm({ ...emailForm, username: e.target.value })}
                  style={{ width: '100%', padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                  placeholder="your-email@gmail.com" />

                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Password *</label>
                    <input
                  type="password"
                  value={emailForm.password}
                  onChange={(e) => setEmailForm({ ...emailForm, password: e.target.value })}
                  style={{ width: '100%', padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                  placeholder="Enter to update" />

                  </div>
                </div>
            }

              {/* SendGrid Fields */}
              {emailForm.provider === "sendgrid" &&
            <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>SendGrid API Key *</label>
                  <input
                type="password"
                value={emailForm.apiKey}
                onChange={(e) => setEmailForm({ ...emailForm, apiKey: e.target.value })}
                style={{ width: '100%', padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                placeholder="SG.xxxxx" />

                </div>
            }

              {/* Common Fields */}
              <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '24px', marginTop: '24px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>Sender Information</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>From Email *</label>
                    <input
                    type="email"
                    value={emailForm.fromEmail}
                    onChange={(e) => setEmailForm({ ...emailForm, fromEmail: e.target.value })}
                    style={{ width: '100%', padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                    placeholder="noreply@company.com" />

                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>From Name *</label>
                    <input
                    type="text"
                    value={emailForm.fromName}
                    onChange={(e) => setEmailForm({ ...emailForm, fromName: e.target.value })}
                    style={{ width: '100%', padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                    placeholder="Company Name" />

                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '12px',
                padding: '24px',
                marginTop: '24px',
                borderTop: '1px solid #e5e7eb',
                backgroundColor: 'white'
              }}>
                <button
                onClick={saveEmailSettings}
                disabled={saving}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#FF6B35',
                  color: 'white',
                  padding: '10px 24px',
                  borderRadius: '8px',
                  fontWeight: '500',
                  border: 'none',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  opacity: saving ? 0.5 : 1
                }}>

                  {saving ? "Saving..." : "Save Settings"}
                </button>
                <button
                onClick={openTestEmailModal}
                disabled={saving || !emailForm.isEnabled}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  border: '2px solid #FF6B35',
                  color: '#FF6B35',
                  padding: '10px 24px',
                  borderRadius: '8px',
                  fontWeight: '600',
                  backgroundColor: 'white',
                  cursor: saving || !emailForm.isEnabled ? 'not-allowed' : 'pointer',
                  opacity: saving || !emailForm.isEnabled ? 0.5 : 1,
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  if (!saving && emailForm.isEnabled) {
                    e.currentTarget.style.backgroundColor = '#FF6B35';
                    e.currentTarget.style.color = 'white';
                    e.currentTarget.style.transform = 'scale(1.02)';
                  }
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.color = '#FF6B35';
                  e.currentTarget.style.transform = 'scale(1)';
                }}>

                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  Send Test Email
                </button>
              </div>
            </div>
          </div>
        }

        {/* WhatsApp Settings Tab */}
        {activeTab === "whatsapp" && !loading &&
        <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#25D366">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                    </svg>
                    WhatsApp Configuration
                  </h2>
                  <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>Configure WhatsApp Business API for notifications</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#f3f4f6', borderRadius: '8px', padding: '4px' }}>
                    {isMasterAdmin && (
                      <button
                      onClick={() => setWhatsappScope("global")}
                      style={{
                        padding: '6px 12px',
                        fontSize: '14px',
                        fontWeight: '500',
                        borderRadius: '6px',
                        border: 'none',
                        cursor: 'pointer',
                        backgroundColor: whatsappScope === "global" ? 'white' : 'transparent',
                        color: whatsappScope === "global" ? '#25D366' : '#6b7280',
                        boxShadow: whatsappScope === "global" ? '0 1px 2px rgba(0,0,0,0.1)' : 'none'
                      }}>
                        Global
                      </button>
                    )}
                    <button
                    onClick={() => setWhatsappScope("per_branch")}
                    style={{
                      padding: '6px 12px',
                      fontSize: '14px',
                      fontWeight: '500',
                      borderRadius: '6px',
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: whatsappScope === "per_branch" ? 'white' : 'transparent',
                      color: whatsappScope === "per_branch" ? '#25D366' : '#6b7280',
                      boxShadow: whatsappScope === "per_branch" ? '0 1px 2px rgba(0,0,0,0.1)' : 'none'
                    }}>
                      Per Branch
                    </button>
                  </div>
                  {whatsappScope === "per_branch" && (
                branches.length > 0 ?
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <label style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>Branch:</label>
                        <select
                    value={selectedBranch}
                    onChange={(e) => handleBranchChange(e.target.value)}
                    style={{
                      padding: '10px 16px',
                      border: '2px solid #25D366',
                      borderRadius: '8px',
                      backgroundColor: '#f0fdf4',
                      color: '#111827',
                      fontSize: '14px',
                      fontWeight: '500',
                      minWidth: '200px',
                      cursor: 'pointer',
                      outline: 'none'
                    }}>

                          {branches.map((b) =>
                    <option key={b._id} value={b._id}>{b.name} {b.code ? `(${b.code})` : ''}</option>
                    )}
                        </select>
                      </div> :

                <span style={{ padding: '8px 16px', backgroundColor: '#fef3c7', color: '#92400e', fontSize: '13px', borderRadius: '8px' }}>
                        No branches found. Create a branch first.
                      </span>)

                }
                </div>
              </div>
            </div>

            {/* Configuration List - Table Format */}
            {whatsappScope === "per_branch" && branches.length > 0 &&
          <div style={{ borderBottom: '1px solid #e5e7eb' }}>
                <div style={{ padding: '16px 24px', backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#374151', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#25D366" strokeWidth="2">
                      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                    </svg>
                    All Branch WhatsApp Configurations
                  </h3>
                </div>
                <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: '400px' }} className="table-scrollbar">
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                      <tr style={{ backgroundColor: '#f9fafb' }}>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '2px solid #e5e7eb', backgroundColor: '#f9fafb' }}>Branch</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '2px solid #e5e7eb', backgroundColor: '#f9fafb' }}>Status</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '2px solid #e5e7eb', backgroundColor: '#f9fafb' }}>Provider</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '2px solid #e5e7eb', backgroundColor: '#f9fafb' }}>Phone ID</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '2px solid #e5e7eb', backgroundColor: '#f9fafb' }}>Business ID</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '2px solid #e5e7eb', backgroundColor: '#f9fafb' }}>Phone Number</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '2px solid #e5e7eb', backgroundColor: '#f9fafb' }}>Access Token</th>
                        <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '600', color: '#374151', borderBottom: '2px solid #e5e7eb', backgroundColor: '#f9fafb' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {branches.map((branch, index) => {
                    const config = allBranchConfigs[branch._id]?.whatsapp || {} as Partial<WhatsAppConfig>;
                    const isSelected = selectedBranch === branch._id;
                    return (
                      <tr
                        key={branch._id}
                        onClick={() => handleBranchChange(branch._id)}
                        style={{
                          backgroundColor: isSelected ? '#f0fdf4' : index % 2 === 0 ? 'white' : '#fafafa',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s',
                          borderLeft: isSelected ? '3px solid #25D366' : '3px solid transparent'
                        }}
                        onMouseOver={(e) => {if (!isSelected) e.currentTarget.style.backgroundColor = '#f5f5f5';}}
                        onMouseOut={(e) => {if (!isSelected) e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'white' : '#fafafa';}}>

                            <td style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontWeight: '600', color: '#1f2937' }}>{branch.name}</span>
                                {branch.code &&
                            <span style={{ padding: '2px 6px', fontSize: '10px', backgroundColor: '#e0e7ff', color: '#4338ca', borderRadius: '4px' }}>
                                    {branch.code}
                                  </span>
                            }
                              </div>
                            </td>
                            <td style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb' }}>
                              <span style={{
                            padding: '4px 10px',
                            fontSize: '11px',
                            fontWeight: '600',
                            borderRadius: '12px',
                            backgroundColor: config.isEnabled ? '#dcfce7' : '#fee2e2',
                            color: config.isEnabled ? '#166534' : '#dc2626'
                          }}>
                                {config.isEnabled ? 'Enabled' : 'Disabled'}
                              </span>
                            </td>
                            <td style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb', fontFamily: 'monospace', color: '#6b7280' }}>
                              {(config.provider || 'meta').toUpperCase()}
                            </td>
                            <td style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb', fontFamily: 'monospace', color: config.phoneNumberId ? '#1f2937' : '#9ca3af', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {config.phoneNumberId || '—'}
                            </td>
                            <td style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb', fontFamily: 'monospace', color: config.businessAccountId ? '#1f2937' : '#9ca3af', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {config.businessAccountId || '—'}
                            </td>
                            <td style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb', fontFamily: 'monospace', color: config.phoneNumber ? '#1f2937' : '#9ca3af' }}>
                              {config.phoneNumber || '—'}
                            </td>
                            <td style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb', fontFamily: 'monospace', color: config.accessToken ? '#1f2937' : '#9ca3af' }}>
                              {config.accessToken ? '••••••••' : '—'}
                            </td>
                            <td style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb', textAlign: 'center' }}>
                              <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                                <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleBranchChange(branch._id);
                                setTimeout(() => scrollToWhatsappForm(), 100);
                              }}
                              style={{
                                padding: '6px 12px',
                                border: 'none',
                                borderRadius: '6px',
                                background: '#25D366',
                                color: 'white',
                                fontSize: '12px',
                                cursor: 'pointer',
                                fontWeight: '500',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}>

                                  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                                  </svg>
                                  Edit
                                </button>
                                <button
                              onClick={(e) => {
                                e.stopPropagation();
                                resetWhatsappConfigForBranch(branch._id, branch.name);
                              }}
                              style={{
                                padding: '6px 12px',
                                border: '1px solid #fecaca',
                                borderRadius: '6px',
                                background: '#fef2f2',
                                color: '#dc2626',
                                fontSize: '12px',
                                cursor: 'pointer',
                                fontWeight: '500'
                              }}>

                                  Reset
                                </button>
                              </div>
                            </td>
                          </tr>);

                  })}
                    </tbody>
                  </table>
                </div>
              </div>
          }

            <div id="whatsapp-config-form" style={{ padding: '24px' }}>
              {/* Enable Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px', marginBottom: '24px' }}>
                <div>
                  <label style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>Enable WhatsApp Notifications</label>
                  <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>Allow sending WhatsApp messages</p>
                </div>
                <button
                onClick={() => setWhatsappForm({ ...whatsappForm, isEnabled: !whatsappForm.isEnabled })}
                style={{
                  position: 'relative',
                  width: '44px',
                  height: '24px',
                  borderRadius: '9999px',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: whatsappForm.isEnabled ? '#25D366' : '#d1d5db',
                  transition: 'background-color 0.2s'
                }}>

                  <span style={{
                  position: 'absolute',
                  top: '2px',
                  left: whatsappForm.isEnabled ? '22px' : '2px',
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  backgroundColor: 'white',
                  transition: 'left 0.2s',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
                }} />
                </button>
              </div>

              {/* Provider Selection */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>WhatsApp Provider</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
                  {[
                { id: "meta", name: "Meta Business API" },
                { id: "twilio", name: "Twilio" },
                { id: "gupshup", name: "Gupshup" },
                { id: "wati", name: "WATI" }].
                map((provider) =>
                <button
                  key={provider.id}
                  onClick={() => setWhatsappForm({ ...whatsappForm, provider: provider.id })}
                  style={{
                    padding: '16px',
                    border: `2px solid ${whatsappForm.provider === provider.id ? '#25D366' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    backgroundColor: whatsappForm.provider === provider.id ? '#f0fdf4' : 'white',
                    color: whatsappForm.provider === provider.id ? '#25D366' : '#374151',
                    fontWeight: '500',
                    fontSize: '14px',
                    transition: 'all 0.2s'
                  }}>

                      {provider.name}
                    </button>
                )}
                </div>
              </div>

              {/* Meta Fields */}
              {whatsappForm.provider === "meta" &&
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Phone Number ID *</label>
                    <input
                  type="text"
                  value={whatsappForm.phoneNumberId}
                  onChange={(e) => setWhatsappForm({ ...whatsappForm, phoneNumberId: e.target.value })}
                  style={{ width: '100%', padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                  placeholder="1234567890" />

                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Business Account ID *</label>
                    <input
                  type="text"
                  value={whatsappForm.businessAccountId}
                  onChange={(e) => setWhatsappForm({ ...whatsappForm, businessAccountId: e.target.value })}
                  style={{ width: '100%', padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                  placeholder="9876543210" />

                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>WhatsApp Phone Number</label>
                    <input
                  type="text"
                  value={whatsappForm.phoneNumber}
                  onChange={(e) => setWhatsappForm({ ...whatsappForm, phoneNumber: e.target.value })}
                  style={{ width: '100%', padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                  placeholder="+919876543210" />
                    <p style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>For display purposes (e.g., +919876543210)</p>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Access Token *</label>
                    <input
                  type="password"
                  value={whatsappForm.accessToken}
                  onChange={(e) => setWhatsappForm({ ...whatsappForm, accessToken: e.target.value })}
                  style={{ width: '100%', padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                  placeholder="Enter to update" />

                  </div>
                </div>
            }

              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '12px',
                padding: '24px',
                marginTop: '24px',
                borderTop: '1px solid #e5e7eb',
                backgroundColor: 'white'
              }}>
                <button
                onClick={saveWhatsappSettings}
                disabled={saving}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#25D366',
                  color: 'white',
                  padding: '10px 24px',
                  borderRadius: '8px',
                  fontWeight: '500',
                  border: 'none',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  opacity: saving ? 0.5 : 1
                }}>

                  {saving ? "Saving..." : "Save Settings"}
                </button>
                <button
                onClick={testWhatsapp}
                disabled={saving || !whatsappForm.isEnabled}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  border: '1px solid #d1d5db',
                  color: '#374151',
                  padding: '10px 24px',
                  borderRadius: '8px',
                  fontWeight: '500',
                  backgroundColor: 'white',
                  cursor: saving || !whatsappForm.isEnabled ? 'not-allowed' : 'pointer',
                  opacity: saving || !whatsappForm.isEnabled ? 0.5 : 1
                }}>

                  Send Test Message
                </button>
              </div>
            </div>
          </div>
        }

        {/* API Keys Tab */}
        {activeTab === "api" && !loading &&
        <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0 }}>External API Keys</h2>
                <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>Manage API keys for external integrations</p>
              </div>
              <button
              onClick={openCreateApiModal}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#FF6B35',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '8px',
                fontWeight: '500',
                border: 'none',
                cursor: 'pointer'
              }}>

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
                    <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Name</th>
                    <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>API Key</th>
                    <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Branch</th>
                    <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rate Limit</th>
                    <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                    <th style={{ padding: '12px 24px', textAlign: 'right', fontSize: '12px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {apiKeys.length === 0 ?
                <tr>
                      <td colSpan={6} style={{ padding: '48px 24px', textAlign: 'center' }}>
                        <svg style={{ width: '48px', height: '48px', margin: '0 auto 16px', color: '#9ca3af' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                        <p style={{ color: '#6b7280' }}>No API keys found. Create one to get started.</p>
                      </td>
                    </tr> :

                apiKeys.map((key) =>
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
                            <button
                        onClick={() => key.apiKey && copyToClipboard(key.apiKey, key._id)}
                        style={{ color: '#9ca3af', border: 'none', background: 'none', cursor: 'pointer', padding: '4px' }}
                        title="Copy">

                              {copiedKey === key._id ? "✓" : "📋"}
                            </button>
                          </div>
                        </td>
                        <td style={{ padding: '16px 24px', fontSize: '14px', color: '#6b7280' }}>{key.branchId?.name || "-"}</td>
                        <td style={{ padding: '16px 24px', fontSize: '14px', color: '#6b7280' }}>{key.rateLimit.requestsPerMinute}/min</td>
                        <td style={{ padding: '16px 24px' }}>
                          <span style={{
                      padding: '4px 8px',
                      fontSize: '12px',
                      fontWeight: '500',
                      borderRadius: '9999px',
                      backgroundColor: key.isActive ? '#dcfce7' : '#fef2f2',
                      color: key.isActive ? '#166534' : '#991b1b'
                    }}>
                            {key.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                            <button onClick={() => openEditApiModal(key)} style={{ color: '#3b82f6', border: 'none', background: 'none', cursor: 'pointer', padding: '4px' }} title="Edit">✏️</button>
                            <button onClick={() => deleteApiKey(key._id)} style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer', padding: '4px' }} title="Delete">🗑️</button>
                          </div>
                        </td>
                      </tr>
                )
                }
                </tbody>
              </table>
            </div>
          </div>
        }

        {/* Email Templates Tab */}
        {activeTab === "emailTemplates" && !loading &&
        <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' }}>
            {/* Header */}
            <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF6B35" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                    Email Templates
                  </h2>
                  <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>Manage email templates for order notifications</p>
                </div>
                <button
                onClick={openCreateEmailTemplateModal}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'linear-gradient(135deg, #FF6B35, #FF8C35)',
                  color: 'white',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  fontWeight: '600',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(255, 107, 53, 0.3)',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>

                  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create Template
                </button>
              </div>

              {/* Branch Filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>Filter by:</span>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                  onClick={() => handleBranchChange("")}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '20px',
                    border: 'none',
                    fontSize: '13px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    backgroundColor: selectedBranch === "" ? '#FF6B35' : '#f3f4f6',
                    color: selectedBranch === "" ? 'white' : '#6b7280',
                    transition: 'all 0.2s'
                  }}>

                    All Templates
                  </button>
                  <button
                  onClick={() => handleBranchChange("global")}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '20px',
                    border: 'none',
                    fontSize: '13px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    backgroundColor: selectedBranch === "global" ? '#8b5cf6' : '#f3f4f6',
                    color: selectedBranch === "global" ? 'white' : '#6b7280',
                    transition: 'all 0.2s'
                  }}>

                    Global
                  </button>
                  {branches.map((branch) =>
                <button
                  key={branch._id}
                  onClick={() => handleBranchChange(branch._id)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '20px',
                    border: 'none',
                    fontSize: '13px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    backgroundColor: selectedBranch === branch._id ? '#3b82f6' : '#f3f4f6',
                    color: selectedBranch === branch._id ? 'white' : '#6b7280',
                    transition: 'all 0.2s'
                  }}>

                      {branch.name}
                    </button>
                )}
                </div>
              </div>
            </div>

            {/* Template List */}
            <div style={{ padding: '24px' }}>
              {emailTemplates.length === 0 ?
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                  <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: '#fff7ed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px'
              }}>
                    <svg width="40" height="40" fill="none" stroke="#FF6B35" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 style={{ color: '#1f2937', fontSize: '16px', fontWeight: '600', margin: '0 0 8px' }}>No email templates found</h3>
                  <p style={{ color: '#6b7280', marginBottom: '20px', fontSize: '14px' }}>Create templates for order confirmations, status updates, and more.</p>
                  <button
                onClick={openCreateEmailTemplateModal}
                style={{
                  padding: '10px 24px',
                  background: 'linear-gradient(135deg, #FF6B35, #FF8C35)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}>

                    Create Your First Template
                  </button>
                </div> :

            <div style={{ display: 'grid', gap: '16px' }}>
                  {emailTemplates.
              filter((t) => !selectedBranch || selectedBranch === "" ||
              selectedBranch === "global" && t.isGlobal ||
              t.branchId === selectedBranch).
              map((template) =>
              <div
                key={template._id}
                style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  padding: '20px',
                  background: 'white',
                  transition: 'all 0.2s',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                  e.currentTarget.style.borderColor = '#FF6B35';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = '#e5e7eb';
                }}>

                      {/* Template Header */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                            <h3 style={{ fontWeight: '600', color: '#111827', margin: 0, fontSize: '16px' }}>{template.name}</h3>
                            <span style={{
                        padding: '3px 10px',
                        fontSize: '11px',
                        fontWeight: '600',
                        borderRadius: '12px',
                        backgroundColor: template.isActive ? '#dcfce7' : '#f3f4f6',
                        color: template.isActive ? '#166534' : '#6b7280'
                      }}>
                              {template.isActive ? "Active" : "Inactive"}
                            </span>
                            <span style={{
                        padding: '3px 10px',
                        fontSize: '11px',
                        fontWeight: '500',
                        borderRadius: '12px',
                        backgroundColor: template.isGlobal ? '#f3e8ff' : '#dbeafe',
                        color: template.isGlobal ? '#7c3aed' : '#2563eb'
                      }}>
                              {template.isGlobal ? "Global" : branches.find((b) => b._id === template.branchId)?.name || "Branch"}
                            </span>
                          </div>
                          <p style={{ fontSize: '14px', color: '#4b5563', margin: 0 }}>
                            <strong style={{ color: '#6b7280' }}>Subject:</strong> {template.subject}
                          </p>
                        </div>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                      onClick={() => openEditEmailTemplateModal(template)}
                      style={{
                        padding: '8px 12px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        background: 'white',
                        color: '#3b82f6',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '13px',
                        fontWeight: '500',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = '#eff6ff';
                        e.currentTarget.style.borderColor = '#3b82f6';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = 'white';
                        e.currentTarget.style.borderColor = '#e5e7eb';
                      }}>

                            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                            Edit
                          </button>
                          <button
                      onClick={() => template._id && deleteEmailTemplate(template._id)}
                      style={{
                        padding: '8px 12px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        background: 'white',
                        color: '#ef4444',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '13px',
                        fontWeight: '500',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = '#fef2f2';
                        e.currentTarget.style.borderColor = '#ef4444';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = 'white';
                        e.currentTarget.style.borderColor = '#e5e7eb';
                      }}>

                            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" />
                            </svg>
                            Delete
                          </button>
                        </div>
                      </div>

                      {/* Template Preview */}
                      <div style={{
                  padding: '12px 16px',
                  backgroundColor: '#f9fafb',
                  borderRadius: '8px',
                  fontSize: '13px',
                  color: '#6b7280',
                  maxHeight: '60px',
                  overflow: 'hidden',
                  position: 'relative'
                }}>
                        <div>{template.body.substring(0, 200) + (template.body.length > 200 ? '...' : '')}</div>
                        <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '24px',
                    background: 'linear-gradient(transparent, #f9fafb)'
                  }} />
                      </div>

                      {/* Variables */}
                      {template.variables && template.variables.length > 0 &&
                <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '12px', color: '#6b7280' }}>Variables:</span>
                          {template.variables.slice(0, 5).map((v) =>
                  <span key={v} style={{
                    padding: '2px 8px',
                    backgroundColor: '#fff7ed',
                    color: '#c2410c',
                    fontSize: '11px',
                    borderRadius: '4px',
                    fontFamily: 'monospace'
                  }}>
                              {`{{${v}}}`}
                            </span>
                  )}
                          {template.variables.length > 5 &&
                  <span style={{ fontSize: '11px', color: '#9ca3af' }}>+{template.variables.length - 5} more</span>
                  }
                        </div>
                }
                    </div>
              )}
                </div>
            }
            </div>
          </div>
        }

        {/* WhatsApp Templates Tab */}
        {activeTab === "whatsappTemplates" && !loading &&
        <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' }}>
            {/* Header */}
            <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#25D366">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                    </svg>
                    WhatsApp Templates
                  </h2>
                  <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>Manage WhatsApp message templates for notifications</p>
                </div>
                <button
                onClick={openCreateWhatsappTemplateModal}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'linear-gradient(135deg, #25D366, #128C7E)',
                  color: 'white',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  fontWeight: '600',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(37, 211, 102, 0.3)',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>

                  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create Template
                </button>
              </div>

              {/* Branch Filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>Filter by:</span>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                  onClick={() => handleBranchChange("")}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '20px',
                    border: 'none',
                    fontSize: '13px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    backgroundColor: selectedBranch === "" ? '#25D366' : '#f3f4f6',
                    color: selectedBranch === "" ? 'white' : '#6b7280',
                    transition: 'all 0.2s'
                  }}>

                    All Templates
                  </button>
                  <button
                  onClick={() => handleBranchChange("global")}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '20px',
                    border: 'none',
                    fontSize: '13px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    backgroundColor: selectedBranch === "global" ? '#8b5cf6' : '#f3f4f6',
                    color: selectedBranch === "global" ? 'white' : '#6b7280',
                    transition: 'all 0.2s'
                  }}>

                    Global
                  </button>
                  {branches.map((branch) =>
                <button
                  key={branch._id}
                  onClick={() => handleBranchChange(branch._id)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '20px',
                    border: 'none',
                    fontSize: '13px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    backgroundColor: selectedBranch === branch._id ? '#3b82f6' : '#f3f4f6',
                    color: selectedBranch === branch._id ? 'white' : '#6b7280',
                    transition: 'all 0.2s'
                  }}>

                      {branch.name}
                    </button>
                )}
                </div>
              </div>
            </div>

            {/* Template List */}
            <div style={{ padding: '24px' }}>
              {whatsappTemplates.length === 0 ?
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                  <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: '#ecfdf5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px'
              }}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="#25D366">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                    </svg>
                  </div>
                  <h3 style={{ color: '#1f2937', fontSize: '16px', fontWeight: '600', margin: '0 0 8px' }}>No WhatsApp templates found</h3>
                  <p style={{ color: '#6b7280', marginBottom: '20px', fontSize: '14px' }}>Create templates for order updates, notifications, and more.</p>
                  <button
                onClick={openCreateWhatsappTemplateModal}
                style={{
                  padding: '10px 24px',
                  background: 'linear-gradient(135deg, #25D366, #128C7E)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}>

                    Create Your First Template
                  </button>
                </div> :

            <div style={{ display: 'grid', gap: '16px' }}>
                  {whatsappTemplates.
              filter((t) => !selectedBranch || selectedBranch === "" ||
              selectedBranch === "global" && t.isGlobal ||
              t.branchId === selectedBranch).
              map((template) =>
              <div
                key={template._id}
                style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  padding: '20px',
                  background: 'white',
                  transition: 'all 0.2s',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                  e.currentTarget.style.borderColor = '#25D366';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = '#e5e7eb';
                }}>

                      {/* Template Header */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                            <h3 style={{ fontWeight: '600', color: '#111827', margin: 0, fontSize: '16px' }}>{template.name}</h3>
                            <span style={{
                        padding: '3px 10px',
                        fontSize: '11px',
                        fontWeight: '600',
                        borderRadius: '12px',
                        backgroundColor: template.isActive ? '#dcfce7' : '#f3f4f6',
                        color: template.isActive ? '#166534' : '#6b7280'
                      }}>
                              {template.isActive ? "Active" : "Inactive"}
                            </span>
                            <span style={{
                        padding: '3px 10px',
                        fontSize: '11px',
                        fontWeight: '500',
                        borderRadius: '12px',
                        backgroundColor: template.isGlobal ? '#f3e8ff' : '#dbeafe',
                        color: template.isGlobal ? '#7c3aed' : '#2563eb'
                      }}>
                              {template.isGlobal ? "Global" : branches.find((b) => b._id === template.branchId)?.name || "Branch"}
                            </span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                      onClick={() => openEditWhatsappTemplateModal(template)}
                      style={{
                        padding: '8px 12px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        background: 'white',
                        color: '#3b82f6',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '13px',
                        fontWeight: '500',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = '#eff6ff';
                        e.currentTarget.style.borderColor = '#3b82f6';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = 'white';
                        e.currentTarget.style.borderColor = '#e5e7eb';
                      }}>

                            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                            Edit
                          </button>
                          <button
                      onClick={() => template._id && deleteWhatsappTemplate(template._id)}
                      style={{
                        padding: '8px 12px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        background: 'white',
                        color: '#ef4444',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '13px',
                        fontWeight: '500',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = '#fef2f2';
                        e.currentTarget.style.borderColor = '#ef4444';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = 'white';
                        e.currentTarget.style.borderColor = '#e5e7eb';
                      }}>

                            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" />
                            </svg>
                            Delete
                          </button>
                        </div>
                      </div>

                      {/* Message Preview */}
                      <div style={{
                  padding: '12px 16px',
                  backgroundColor: '#dcfce7',
                  borderRadius: '8px',
                  borderLeft: '4px solid #25D366',
                  fontSize: '13px',
                  color: '#166534',
                  maxHeight: '80px',
                  overflow: 'hidden',
                  position: 'relative',
                  whiteSpace: 'pre-wrap'
                }}>
                        {template.body.substring(0, 200)}{template.body.length > 200 ? '...' : ''}
                        {template.body.length > 150 &&
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '24px',
                    background: 'linear-gradient(transparent, #dcfce7)'
                  }} />
                  }
                      </div>

                      {/* Variables */}
                      {template.variables && template.variables.length > 0 &&
                <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '12px', color: '#6b7280' }}>Variables:</span>
                          {template.variables.slice(0, 5).map((v) =>
                  <span key={v} style={{
                    padding: '2px 8px',
                    backgroundColor: '#ecfdf5',
                    color: '#059669',
                    fontSize: '11px',
                    borderRadius: '4px',
                    fontFamily: 'monospace'
                  }}>
                              {`{{${v}}}`}
                            </span>
                  )}
                          {template.variables.length > 5 &&
                  <span style={{ fontSize: '11px', color: '#9ca3af' }}>+{template.variables.length - 5} more</span>
                  }
                        </div>
                }
                    </div>
              )}
                </div>
            }
            </div>
          </div>
        }
        </div>
      </div>

      {/* API Key Modal */}
      {showApiModal &&
      <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '16px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 25px 50px rgba(0,0,0,0.25)', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflow: 'auto' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0 }}>
                {editingApiKey ? "Edit API Key" : "Create API Key"}
              </h3>
            </div>
            <div style={{ padding: '24px' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Name *</label>
                <input
                type="text"
                value={apiForm.name}
                onChange={(e) => setApiForm({ ...apiForm, name: e.target.value })}
                style={{ width: '100%', padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                placeholder="My API Key" />

              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Branch *</label>
                <select
                value={apiForm.branchId}
                onChange={(e) => setApiForm({ ...apiForm, branchId: e.target.value })}
                style={{ width: '100%', padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}>

                  <option value="">Select a branch</option>
                  {branches.map((b) =>
                <option key={b._id} value={b._id}>{b.name}</option>
                )}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Requests/Min</label>
                  <input
                  type="number"
                  value={apiForm.requestsPerMinute}
                  onChange={(e) => setApiForm({ ...apiForm, requestsPerMinute: parseInt(e.target.value) || 60 })}
                  style={{ width: '100%', padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }} />

                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Requests/Day</label>
                  <input
                  type="number"
                  value={apiForm.requestsPerDay}
                  onChange={(e) => setApiForm({ ...apiForm, requestsPerDay: parseInt(e.target.value) || 10000 })}
                  style={{ width: '100%', padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }} />

                </div>
              </div>
            </div>
            <div style={{ padding: '24px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setShowApiModal(false)} style={{ padding: '8px 16px', color: '#6b7280', border: 'none', background: 'none', cursor: 'pointer', fontWeight: '500' }}>
                Cancel
              </button>
              <button
              onClick={saveApiKey}
              disabled={saving}
              style={{
                padding: '8px 16px',
                backgroundColor: '#FF6B35',
                color: 'white',
                borderRadius: '8px',
                fontWeight: '500',
                border: 'none',
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.5 : 1
              }}>

                {saving ? "Saving..." : editingApiKey ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      }

      {/* Email Template Modal */}
      {showEmailTemplateModal &&
      <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '16px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 25px 50px rgba(0,0,0,0.25)', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflow: 'auto' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0 }}>
                {editingEmailTemplate ? "Edit Email Template" : "Create Email Template"}
              </h3>
            </div>
            <div style={{ padding: '24px' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Template Name *</label>
                <input
                type="text"
                value={emailTemplateForm.name}
                onChange={(e) => setEmailTemplateForm({ ...emailTemplateForm, name: e.target.value })}
                style={{ width: '100%', padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                placeholder="Order Confirmation" />

              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Event Type</label>
                <select
                value={emailTemplateForm.eventType}
                onChange={(e) => setEmailTemplateForm({ ...emailTemplateForm, eventType: e.target.value })}
                style={{ width: '100%', padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}>
                  {EVENT_TYPES.map((type) =>
                  <option key={type.value} value={type.value}>{type.label}</option>
                  )}
                </select>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Subject *</label>
                <input
                type="text"
                value={emailTemplateForm.subject}
                onChange={(e) => setEmailTemplateForm({ ...emailTemplateForm, subject: e.target.value })}
                style={{ width: '100%', padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                placeholder="Order #{{orderNumber}} Confirmed" />

              </div>
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>Body * (HTML Supported)</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        const textarea = document.getElementById('email-body-textarea') as HTMLTextAreaElement;
                        if (textarea) {
                          const start = textarea.selectionStart;
                          const end = textarea.selectionEnd;
                          const text = textarea.value;
                          const selectedText = text.substring(start, end) || 'text';
                          const newText = text.substring(0, start) + `<strong>${selectedText}</strong>` + text.substring(end);
                          setEmailTemplateForm({ ...emailTemplateForm, body: newText, variables: extractVariables(newText) });
                        }
                      }}
                      style={{ padding: '4px 8px', backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
                      title="Bold"
                    >B</button>
                    <button
                      type="button"
                      onClick={() => {
                        const textarea = document.getElementById('email-body-textarea') as HTMLTextAreaElement;
                        if (textarea) {
                          const start = textarea.selectionStart;
                          const end = textarea.selectionEnd;
                          const text = textarea.value;
                          const selectedText = text.substring(start, end) || 'text';
                          const newText = text.substring(0, start) + `<em>${selectedText}</em>` + text.substring(end);
                          setEmailTemplateForm({ ...emailTemplateForm, body: newText, variables: extractVariables(newText) });
                        }
                      }}
                      style={{ padding: '4px 8px', backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer', fontStyle: 'italic', fontSize: '12px' }}
                      title="Italic"
                    >I</button>
                    <button
                      type="button"
                      onClick={() => {
                        const textarea = document.getElementById('email-body-textarea') as HTMLTextAreaElement;
                        if (textarea) {
                          const start = textarea.selectionStart;
                          const text = textarea.value;
                          const newText = text.substring(0, start) + `<a href="https://">Link</a>` + text.substring(start);
                          setEmailTemplateForm({ ...emailTemplateForm, body: newText, variables: extractVariables(newText) });
                        }
                      }}
                      style={{ padding: '4px 8px', backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', textDecoration: 'underline', color: '#2563eb' }}
                      title="Link"
                    >Link</button>
                    <button
                      type="button"
                      onClick={() => {
                        const textarea = document.getElementById('email-body-textarea') as HTMLTextAreaElement;
                        if (textarea) {
                          const start = textarea.selectionStart;
                          const text = textarea.value;
                          const newText = text.substring(0, start) + `<br>` + text.substring(start);
                          setEmailTemplateForm({ ...emailTemplateForm, body: newText, variables: extractVariables(newText) });
                        }
                      }}
                      style={{ padding: '4px 8px', backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                      title="Line Break"
                    >BR</button>
                    <button
                      type="button"
                      onClick={() => {
                        const textarea = document.getElementById('email-body-textarea') as HTMLTextAreaElement;
                        if (textarea) {
                          const start = textarea.selectionStart;
                          const text = textarea.value;
                          const newText = text.substring(0, start) + `<div style="padding: 15px; background-color: #f9fafb; border-radius: 8px; margin: 10px 0;">Content here</div>` + text.substring(start);
                          setEmailTemplateForm({ ...emailTemplateForm, body: newText, variables: extractVariables(newText) });
                        }
                      }}
                      style={{ padding: '4px 8px', backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                      title="Box"
                    >Box</button>
                    <button
                      type="button"
                      onClick={() => {
                        const textarea = document.getElementById('email-body-textarea') as HTMLTextAreaElement;
                        if (textarea) {
                          const start = textarea.selectionStart;
                          const text = textarea.value;
                          const tableHtml = `<table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
  <tr style="background-color: #f3f4f6;">
    <th style="padding: 10px; border: 1px solid #e5e7eb; text-align: left;">Header 1</th>
    <th style="padding: 10px; border: 1px solid #e5e7eb; text-align: left;">Header 2</th>
  </tr>
  <tr>
    <td style="padding: 10px; border: 1px solid #e5e7eb;">Data 1</td>
    <td style="padding: 10px; border: 1px solid #e5e7eb;">Data 2</td>
  </tr>
</table>`;
                          const newText = text.substring(0, start) + tableHtml + text.substring(start);
                          setEmailTemplateForm({ ...emailTemplateForm, body: newText, variables: extractVariables(newText) });
                        }
                      }}
                      style={{ padding: '4px 8px', backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                      title="Table"
                    >Table</button>
                  </div>
                </div>
                <textarea
                id="email-body-textarea"
                value={emailTemplateForm.body}
                onChange={(e) => {
                  const newBody = e.target.value;
                  setEmailTemplateForm({
                    ...emailTemplateForm,
                    body: newBody,
                    variables: extractVariables(newBody)
                  });
                }}
                rows={10}
                style={{ width: '100%', padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '13px', fontFamily: 'monospace', boxSizing: 'border-box', resize: 'vertical' }}
                placeholder="<p>Dear {{customerName}},</p>&#10;&#10;<p>Your order <strong>#{{orderNumber}}</strong> has been confirmed.</p>&#10;&#10;<p>Thank you!</p>" />
              </div>

              {/* HTML Preview */}
              {emailTemplateForm.body && (
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                    Preview
                  </label>
                  <div style={{
                    padding: '16px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    backgroundColor: '#ffffff',
                    maxHeight: '200px',
                    overflow: 'auto'
                  }}>
                    <div
                      dangerouslySetInnerHTML={{
                        __html: emailTemplateForm.body
                          .replace(/\{\{customerName\}\}/g, '<span style="background:#fef3c7;padding:2px 4px;border-radius:2px;">John Doe</span>')
                          .replace(/\{\{companyName\}\}/g, '<span style="background:#fef3c7;padding:2px 4px;border-radius:2px;">ABC Company</span>')
                          .replace(/\{\{orderNumber\}\}/g, '<span style="background:#fef3c7;padding:2px 4px;border-radius:2px;">ORD-12345</span>')
                          .replace(/\{\{orderDate\}\}/g, '<span style="background:#fef3c7;padding:2px 4px;border-radius:2px;">' + new Date().toLocaleDateString() + '</span>')
                          .replace(/\{\{status\}\}/g, '<span style="background:#fef3c7;padding:2px 4px;border-radius:2px;">Confirmed</span>')
                          .replace(/\{\{phone\}\}/g, '<span style="background:#fef3c7;padding:2px 4px;border-radius:2px;">+91 9876543210</span>')
                          .replace(/\{\{email\}\}/g, '<span style="background:#fef3c7;padding:2px 4px;border-radius:2px;">customer@example.com</span>')
                          .replace(/\n/g, '<br>')
                      }}
                      style={{ fontSize: '14px', lineHeight: '1.6' }}
                    />
                  </div>
                </div>
              )}

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Quick Insert Variables</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {EMAIL_VARIABLES.map((v) =>
                <button
                  key={v.key}
                  onClick={() => insertVariable(v.key, "email")}
                  style={{ padding: '4px 8px', backgroundColor: '#fff7ed', color: '#FF6B35', fontSize: '12px', fontFamily: 'monospace', borderRadius: '4px', border: '1px solid #fed7aa', cursor: 'pointer' }}>

                      {`{{${v.key}}}`}
                    </button>
                )}
                </div>
              </div>

              {/* Quick HTML Templates */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Quick HTML Templates</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      const template = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: linear-gradient(135deg, #FF6B35, #FF8C35); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0;">Order Confirmation</h1>
  </div>
  <div style="padding: 30px; background: #ffffff; border: 1px solid #e5e7eb;">
    <p>Dear {{customerName}},</p>
    <p>Thank you for your order! Your order <strong>#{{orderNumber}}</strong> has been confirmed.</p>
    <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 5px 0;"><strong>Order ID:</strong> {{orderNumber}}</p>
      <p style="margin: 5px 0;"><strong>Date:</strong> {{orderDate}}</p>
      <p style="margin: 5px 0;"><strong>Status:</strong> {{status}}</p>
    </div>
    <p>We will notify you once your order is shipped.</p>
    <p>Best regards,<br><strong>27 Infinity Team</strong></p>
  </div>
  <div style="text-align: center; padding: 20px; background: #1f2937; border-radius: 0 0 8px 8px;">
    <p style="color: #9ca3af; margin: 0; font-size: 12px;">© 2024 27 Infinity Manufacturing</p>
  </div>
</div>`;
                      setEmailTemplateForm({ ...emailTemplateForm, body: template, variables: extractVariables(template) });
                    }}
                    style={{ padding: '6px 12px', backgroundColor: '#dbeafe', color: '#2563eb', fontSize: '12px', borderRadius: '4px', border: '1px solid #93c5fd', cursor: 'pointer' }}
                  >
                    Order Confirmation
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const template = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: #22c55e; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0;">Order Shipped!</h1>
  </div>
  <div style="padding: 30px; background: #ffffff; border: 1px solid #e5e7eb;">
    <p>Dear {{customerName}},</p>
    <p>Great news! Your order <strong>#{{orderNumber}}</strong> has been shipped.</p>
    <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #22c55e;">
      <p style="margin: 0; color: #166534;">Your order is on its way!</p>
    </div>
    <p>You will receive your order soon.</p>
    <p>Best regards,<br><strong>27 Infinity Team</strong></p>
  </div>
</div>`;
                      setEmailTemplateForm({ ...emailTemplateForm, body: template, variables: extractVariables(template) });
                    }}
                    style={{ padding: '6px 12px', backgroundColor: '#dcfce7', color: '#166534', fontSize: '12px', borderRadius: '4px', border: '1px solid #86efac', cursor: 'pointer' }}
                  >
                    Order Shipped
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const template = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: #3b82f6; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0;">Order Update</h1>
  </div>
  <div style="padding: 30px; background: #ffffff; border: 1px solid #e5e7eb;">
    <p>Dear {{customerName}},</p>
    <p>Your order <strong>#{{orderNumber}}</strong> status has been updated.</p>
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
      <tr style="background: #f9fafb;">
        <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">Order ID</td>
        <td style="padding: 12px; border: 1px solid #e5e7eb;">{{orderNumber}}</td>
      </tr>
      <tr>
        <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">Status</td>
        <td style="padding: 12px; border: 1px solid #e5e7eb;">{{status}}</td>
      </tr>
      <tr style="background: #f9fafb;">
        <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">Date</td>
        <td style="padding: 12px; border: 1px solid #e5e7eb;">{{orderDate}}</td>
      </tr>
    </table>
    <p>Best regards,<br><strong>27 Infinity Team</strong></p>
  </div>
</div>`;
                      setEmailTemplateForm({ ...emailTemplateForm, body: template, variables: extractVariables(template) });
                    }}
                    style={{ padding: '6px 12px', backgroundColor: '#dbeafe', color: '#2563eb', fontSize: '12px', borderRadius: '4px', border: '1px solid #93c5fd', cursor: 'pointer' }}
                  >
                    Order Status Update
                  </button>
                </div>
              </div>
            </div>
            <div style={{ padding: '24px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setShowEmailTemplateModal(false)} style={{ padding: '8px 16px', color: '#6b7280', border: 'none', background: 'none', cursor: 'pointer', fontWeight: '500' }}>
                Cancel
              </button>
              <button
              onClick={saveEmailTemplate}
              disabled={saving || !emailTemplateForm.name || !emailTemplateForm.subject || !emailTemplateForm.body}
              style={{
                padding: '8px 16px',
                backgroundColor: '#FF6B35',
                color: 'white',
                borderRadius: '8px',
                fontWeight: '500',
                border: 'none',
                cursor: saving || !emailTemplateForm.name || !emailTemplateForm.subject || !emailTemplateForm.body ? 'not-allowed' : 'pointer',
                opacity: saving || !emailTemplateForm.name || !emailTemplateForm.subject || !emailTemplateForm.body ? 0.5 : 1
              }}>

                {saving ? "Saving..." : editingEmailTemplate ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      }

      {/* WhatsApp Template Modal */}
      {showWhatsappTemplateModal &&
      <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '16px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 25px 50px rgba(0,0,0,0.25)', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflow: 'auto' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0 }}>
                {editingWhatsappTemplate ? "Edit WhatsApp Template" : "Create WhatsApp Template"}
              </h3>
            </div>
            <div style={{ padding: '24px' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Template Name *</label>
                <input
                type="text"
                value={whatsappTemplateForm.name}
                onChange={(e) => setWhatsappTemplateForm({ ...whatsappTemplateForm, name: e.target.value })}
                style={{ width: '100%', padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                placeholder="Order Confirmation" />

              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Event Type</label>
                <select
                value={whatsappTemplateForm.eventType}
                onChange={(e) => setWhatsappTemplateForm({ ...whatsappTemplateForm, eventType: e.target.value })}
                style={{ width: '100%', padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}>
                  {EVENT_TYPES.map((type) =>
                  <option key={type.value} value={type.value}>{type.label}</option>
                  )}
                </select>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Message Body *</label>
                <textarea
                value={whatsappTemplateForm.body}
                onChange={(e) => {
                  const newBody = e.target.value;
                  setWhatsappTemplateForm({
                    ...whatsappTemplateForm,
                    body: newBody,
                    variables: extractVariables(newBody)
                  });
                }}
                rows={8}
                style={{ width: '100%', padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', fontFamily: 'monospace', boxSizing: 'border-box', resize: 'vertical' }}
                placeholder="Hello {{customerName}}!&#10;&#10;Your order is confirmed." />

              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Quick Insert Variables</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {EMAIL_VARIABLES.map((v) =>
                <button
                  key={v.key}
                  onClick={() => insertVariable(v.key, "whatsapp")}
                  style={{ padding: '4px 8px', backgroundColor: '#f0fdf4', color: '#166534', fontSize: '12px', fontFamily: 'monospace', borderRadius: '4px', border: 'none', cursor: 'pointer' }}>

                      {`{{${v.key}}}`}
                    </button>
                )}
                </div>
              </div>
            </div>
            <div style={{ padding: '24px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setShowWhatsappTemplateModal(false)} style={{ padding: '8px 16px', color: '#6b7280', border: 'none', background: 'none', cursor: 'pointer', fontWeight: '500' }}>
                Cancel
              </button>
              <button
              onClick={saveWhatsappTemplate}
              disabled={saving || !whatsappTemplateForm.name || !whatsappTemplateForm.body}
              style={{
                padding: '8px 16px',
                backgroundColor: '#25D366',
                color: 'white',
                borderRadius: '8px',
                fontWeight: '500',
                border: 'none',
                cursor: saving || !whatsappTemplateForm.name || !whatsappTemplateForm.body ? 'not-allowed' : 'pointer',
                opacity: saving || !whatsappTemplateForm.name || !whatsappTemplateForm.body ? 0.5 : 1
              }}>

                {saving ? "Saving..." : editingWhatsappTemplate ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      }

      {/* Test Email Modal */}
      {showTestEmailModal &&
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        animation: 'fadeIn 0.2s ease-out'
      }}>
          <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          width: '90%',
          maxWidth: '450px',
          overflow: 'hidden',
          boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
          animation: 'slideUp 0.3s ease-out'
        }}>
            {/* Modal Header */}
            <div style={{
            background: 'linear-gradient(135deg, #FF6B35, #FF8C35)',
            padding: '24px',
            textAlign: 'center'
          }}>
              <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              animation: testEmailStatus === 'sending' ? 'pulse 1.5s infinite' : 'none'
            }}>
                {testEmailStatus === 'idle' &&
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
              }
                {testEmailStatus === 'sending' &&
              <div style={{
                width: '32px',
                height: '32px',
                border: '3px solid rgba(255,255,255,0.3)',
                borderTopColor: 'white',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              }
                {testEmailStatus === 'success' &&
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" style={{ animation: 'checkmark 0.4s ease-out forwards' }} />
                  </svg>
              }
                {testEmailStatus === 'error' &&
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
              }
              </div>
              <h2 style={{ color: 'white', margin: 0, fontSize: '20px', fontWeight: '600' }}>
                {testEmailStatus === 'idle' && 'Send Test Email'}
                {testEmailStatus === 'sending' && 'Sending Email...'}
                {testEmailStatus === 'success' && 'Email Sent!'}
                {testEmailStatus === 'error' && 'Send Failed'}
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.9)', margin: '8px 0 0', fontSize: '14px' }}>
                {testEmailStatus === 'idle' && 'Test your email configuration'}
                {testEmailStatus === 'sending' && 'Please wait while we send your email'}
                {testEmailStatus === 'success' && 'Check your inbox for the test email'}
                {testEmailStatus === 'error' && 'Please check your settings and try again'}
              </p>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px' }}>
              {testEmailStatus !== 'success' &&
            <>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                    Send test email to:
                  </label>
                  <input
                type="email"
                value={testEmailAddress}
                onChange={(e) => setTestEmailAddress(e.target.value)}
                placeholder="Enter email address"
                disabled={testingEmail}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '16px',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#FF6B35'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                onKeyDown={(e) => e.key === 'Enter' && testEmail()} />


                  {/* Configuration Preview */}
                  <div style={{
                marginTop: '16px',
                padding: '12px 16px',
                backgroundColor: '#f9fafb',
                borderRadius: '8px',
                fontSize: '13px'
              }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ color: '#6b7280' }}>Provider:</span>
                      <span style={{ color: '#1f2937', fontWeight: '500' }}>{emailForm.provider.toUpperCase()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ color: '#6b7280' }}>Host:</span>
                      <span style={{ color: '#1f2937', fontWeight: '500' }}>{emailForm.host || 'Not configured'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#6b7280' }}>From:</span>
                      <span style={{ color: '#1f2937', fontWeight: '500' }}>{emailForm.fromEmail || 'Not configured'}</span>
                    </div>
                  </div>

                  {error &&
              <div style={{
                marginTop: '12px',
                padding: '12px',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                color: '#dc2626',
                fontSize: '13px'
              }}>
                      {error}
                    </div>
              }
                </>
            }

              {testEmailStatus === 'success' &&
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: '#dcfce7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                animation: 'bounce 0.5s ease-out'
              }}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <p style={{ color: '#166534', fontSize: '15px', fontWeight: '500' }}>
                    Test email sent to {testEmailAddress}
                  </p>
                </div>
            }
            </div>

            {/* Modal Footer */}
            <div style={{
            padding: '16px 24px',
            borderTop: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            backgroundColor: '#f9fafb'
          }}>
              <button
              onClick={() => {
                setShowTestEmailModal(false);
                setTestEmailStatus('idle');
                setError("");
              }}
              disabled={testingEmail}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                backgroundColor: 'white',
                color: '#6b7280',
                fontWeight: '500',
                cursor: testingEmail ? 'not-allowed' : 'pointer',
                border: '1px solid #e5e7eb'
              }}>

                {testEmailStatus === 'success' ? 'Close' : 'Cancel'}
              </button>
              {testEmailStatus !== 'success' &&
            <button
              onClick={testEmail}
              disabled={testingEmail || !testEmailAddress}
              style={{
                padding: '10px 24px',
                border: 'none',
                borderRadius: '8px',
                background: testingEmail ? '#fda98c' : 'linear-gradient(135deg, #FF6B35, #FF8C35)',
                color: 'white',
                fontWeight: '600',
                cursor: testingEmail || !testEmailAddress ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 2px 8px rgba(255, 107, 53, 0.3)',
                transition: 'all 0.2s'
              }}>

                  {testingEmail ?
              <>
                      <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: 'white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                      Sending...
                    </> :

              <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                      </svg>
                      Send Test
                    </>
              }
                </button>
            }
            </div>
          </div>
        </div>
      }

      {/* Test WhatsApp Modal */}
      {showTestWhatsAppModal &&
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        animation: 'fadeIn 0.2s ease-out'
      }}>
          <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          width: '90%',
          maxWidth: '450px',
          overflow: 'hidden',
          boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
          animation: 'slideUp 0.3s ease-out'
        }}>
            {/* Modal Header */}
            <div style={{
            background: 'linear-gradient(135deg, #25D366, #128C7E)',
            padding: '24px',
            textAlign: 'center'
          }}>
              <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              animation: testWhatsAppStatus === 'sending' ? 'pulse 1.5s infinite' : 'none'
            }}>
                {testWhatsAppStatus === 'idle' &&
              <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  </svg>
              }
                {testWhatsAppStatus === 'sending' &&
              <div style={{
                width: '32px',
                height: '32px',
                border: '3px solid rgba(255,255,255,0.3)',
                borderTopColor: 'white',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              }
                {testWhatsAppStatus === 'success' &&
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
              }
                {testWhatsAppStatus === 'error' &&
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
              }
              </div>
              <h2 style={{ color: 'white', margin: 0, fontSize: '20px', fontWeight: '600' }}>
                {testWhatsAppStatus === 'idle' && 'Send Test WhatsApp'}
                {testWhatsAppStatus === 'sending' && 'Sending Message...'}
                {testWhatsAppStatus === 'success' && 'Message Sent!'}
                {testWhatsAppStatus === 'error' && 'Send Failed'}
              </h2>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px' }}>
              {testWhatsAppStatus !== 'success' &&
            <>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                    Phone number (with country code):
                  </label>
                  <input
                type="tel"
                value={testPhoneNumber}
                onChange={(e) => setTestPhoneNumber(e.target.value)}
                placeholder="+919876543210"
                disabled={testingWhatsApp}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
                onKeyDown={(e) => e.key === 'Enter' && testWhatsapp()} />

                </>
            }
            </div>

            {/* Modal Footer */}
            <div style={{
            padding: '16px 24px',
            borderTop: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            backgroundColor: '#f9fafb'
          }}>
              <button
              onClick={() => {
                setShowTestWhatsAppModal(false);
                setTestWhatsAppStatus('idle');
              }}
              style={{
                padding: '10px 20px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                backgroundColor: 'white',
                color: '#6b7280',
                cursor: 'pointer'
              }}>

                Cancel
              </button>
              {testWhatsAppStatus !== 'success' &&
            <button
              onClick={testWhatsapp}
              disabled={testingWhatsApp || !testPhoneNumber}
              style={{
                padding: '10px 24px',
                border: 'none',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #25D366, #128C7E)',
                color: 'white',
                fontWeight: '600',
                cursor: testingWhatsApp || !testPhoneNumber ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>

                  {testingWhatsApp ? 'Sending...' : 'Send Test'}
                </button>
            }
            </div>
          </div>
        </div>
      }

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
        @keyframes bounce {
          0% { transform: scale(0.5); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        @keyframes checkmark {
          0% { stroke-dasharray: 100; stroke-dashoffset: 100; }
          100% { stroke-dashoffset: 0; }
        }
      `}</style>
      </div>
    </>
  );
};

export default MasterSettings;