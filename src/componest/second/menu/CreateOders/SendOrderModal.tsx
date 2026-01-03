import React, { useState, useEffect } from 'react';
import { emailTemplateAPI, whatsappTemplateAPI, crudAPI } from '../../../../utils/crudHelpers';

interface CustomerInfo {
  companyName?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  phone1?: string;
  whatsapp?: string;
}

interface EmailTemplate {
  _id: string;
  name: string;
  subject: string;
  body: string;
  eventType?: string;
  isGlobal?: boolean;
}

interface WhatsAppTemplate {
  _id: string;
  name: string;
  body: string;
  eventType?: string;
  isGlobal?: boolean;
}

interface SendOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId?: string;
  orderData?: any;
  customer?: CustomerInfo;
  mode: 'email' | 'whatsapp' | 'both';
  branchId?: string;
}

const SendOrderModal: React.FC<SendOrderModalProps> = ({
  isOpen,
  onClose,
  orderId,
  orderData,
  customer,
  mode,
  branchId
}) => {
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Template states
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);
  const [whatsappTemplates, setWhatsappTemplates] = useState<WhatsAppTemplate[]>([]);
  const [selectedEmailTemplate, setSelectedEmailTemplate] = useState<string>('custom');
  const [selectedWhatsAppTemplate, setSelectedWhatsAppTemplate] = useState<string>('custom');
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  // Email fields
  const [emailTo, setEmailTo] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');

  // WhatsApp fields
  const [whatsappTo, setWhatsappTo] = useState('');
  const [whatsappMessage, setWhatsappMessage] = useState('');

  // Active tab for 'both' mode
  const [activeTab, setActiveTab] = useState<'email' | 'whatsapp'>(mode === 'whatsapp' ? 'whatsapp' : 'email');

  // Fetch templates based on branch
  useEffect(() => {
    if (isOpen) {
      fetchTemplates();
    }
  }, [isOpen, branchId]);

  const fetchTemplates = async () => {
    setLoadingTemplates(true);
    try {
      // Get templates - if branchId provided, get branch-specific + global templates
      const [emailRes, whatsappRes] = await Promise.all([
        branchId
          ? emailTemplateAPI.getByBranch(branchId).catch(() => ({ data: { templates: [] } }))
          : emailTemplateAPI.getAll().catch(() => ({ data: { templates: [] } })),
        branchId
          ? whatsappTemplateAPI.getByBranch(branchId).catch(() => ({ data: { templates: [] } }))
          : whatsappTemplateAPI.getAll().catch(() => ({ data: { templates: [] } }))
      ]);

      const emailTpls = emailRes?.data?.templates || emailRes?.templates || [];
      const whatsappTpls = whatsappRes?.data?.templates || whatsappRes?.templates || [];

      setEmailTemplates(emailTpls);
      setWhatsappTemplates(whatsappTpls);
    } catch (err) {
      console.error('Error fetching templates:', err);
    } finally {
      setLoadingTemplates(false);
    }
  };

  // Replace template variables with actual values
  const replaceVariables = (text: string): string => {
    const customerName = customer?.companyName || customer?.name ||
      `${customer?.firstName || ''} ${customer?.lastName || ''}`.trim() || 'Customer';
    const orderIdStr = orderId || orderData?.orderId || 'New Order';
    const orderDate = orderData?.createdAt
      ? new Date(orderData.createdAt).toLocaleDateString()
      : new Date().toLocaleDateString();

    return text
      .replace(/\{\{customerName\}\}/g, customerName)
      .replace(/\{\{companyName\}\}/g, customer?.companyName || customerName)
      .replace(/\{\{orderNumber\}\}/g, orderIdStr)
      .replace(/\{\{orderId\}\}/g, orderIdStr)
      .replace(/\{\{orderDate\}\}/g, orderDate)
      .replace(/\{\{phone\}\}/g, customer?.phone || customer?.phone1 || '')
      .replace(/\{\{email\}\}/g, customer?.email || '')
      .replace(/\{\{status\}\}/g, orderData?.overallStatus || orderData?.status || 'Pending');
  };

  // Handle email template selection
  const handleEmailTemplateChange = (templateId: string) => {
    setSelectedEmailTemplate(templateId);
    if (templateId === 'custom') {
      // Reset to default custom message
      const customerName = customer?.companyName || customer?.name ||
        `${customer?.firstName || ''} ${customer?.lastName || ''}`.trim() || 'Customer';
      const orderIdStr = orderId || orderData?.orderId || 'New Order';
      setEmailSubject(`Order ${orderIdStr} - ${customerName}`);
      setEmailBody(`Dear ${customerName},\n\nPlease find your order details below:\n\nOrder ID: ${orderIdStr}\n\nThank you for your business!\n\nBest regards,\n27 Infinity`);
    } else {
      const template = emailTemplates.find(t => t._id === templateId);
      if (template) {
        setEmailSubject(replaceVariables(template.subject));
        setEmailBody(replaceVariables(template.body));
      }
    }
  };

  // Handle WhatsApp template selection
  const handleWhatsAppTemplateChange = (templateId: string) => {
    setSelectedWhatsAppTemplate(templateId);
    if (templateId === 'custom') {
      const customerName = customer?.companyName || customer?.name ||
        `${customer?.firstName || ''} ${customer?.lastName || ''}`.trim() || 'Customer';
      const orderIdStr = orderId || orderData?.orderId || 'New Order';
      setWhatsappMessage(`Hello ${customerName}!\n\nYour order ${orderIdStr} has been processed.\n\nThank you for choosing 27 Infinity!`);
    } else {
      const template = whatsappTemplates.find(t => t._id === templateId);
      if (template) {
        setWhatsappMessage(replaceVariables(template.body));
      }
    }
  };

  // Initialize with customer data
  useEffect(() => {
    if (customer) {
      setEmailTo(customer.email || '');
      setWhatsappTo(customer.whatsapp || customer.phone || customer.phone1 || '');
    }

    // Set default subject and message
    const customerName = customer?.companyName || customer?.name ||
      `${customer?.firstName || ''} ${customer?.lastName || ''}`.trim() || 'Customer';
    const orderIdStr = orderId || orderData?.orderId || 'New Order';

    setEmailSubject(`Order ${orderIdStr} - ${customerName}`);
    setEmailBody(`Dear ${customerName},\n\nPlease find your order details below:\n\nOrder ID: ${orderIdStr}\n\nThank you for your business!\n\nBest regards,\n27 Infinity`);
    setWhatsappMessage(`Hello ${customerName}!\n\nYour order ${orderIdStr} has been processed.\n\nThank you for choosing 27 Infinity!`);
  }, [customer, orderId, orderData]);

  const handleSendEmail = async () => {
    if (!emailTo) {
      setError('Please enter email address');
      return;
    }

    setSending(true);
    setError(null);

    try {
      // Send email via backend API
      const htmlBody = emailBody.replace(/\n/g, '<br>');
      await crudAPI.create('/send-email', {
        to: emailTo,
        subject: emailSubject,
        html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #FF6B35 0%, #FF8C35 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0;">27 Infinity Manufacturing</h1>
          </div>
          <div style="padding: 30px; background: #ffffff; border: 1px solid #e5e7eb; border-top: none;">
            ${htmlBody}
          </div>
          <div style="text-align: center; padding: 20px; background: #1f2937; border-radius: 0 0 8px 8px;">
            <p style="color: #9ca3af; margin: 0; font-size: 12px;">&copy; ${new Date().getFullYear()} 27 Infinity Manufacturing</p>
          </div>
        </div>`,
        text: emailBody,
        fromName: '27 Infinity'
      });

      setSuccess('Email sent successfully!');
      setTimeout(() => {
        setSuccess(null);
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to send email');
    } finally {
      setSending(false);
    }
  };

  const handleSendWhatsApp = async () => {
    if (!whatsappTo) {
      setError('Please enter WhatsApp number');
      return;
    }

    setSending(true);
    setError(null);

    try {
      // Format phone number
      let phone = whatsappTo.replace(/\D/g, '');
      if (!phone.startsWith('91') && phone.length === 10) {
        phone = '91' + phone;
      }

      // Send WhatsApp via backend API (same as email)
      await crudAPI.create('/send-whatsapp', {
        to: phone,
        message: whatsappMessage,
        branchId: branchId
      });

      setSuccess('WhatsApp sent successfully!');
      setTimeout(() => {
        setSuccess(null);
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to open WhatsApp');
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  const hasEmail = customer?.email;
  const hasWhatsApp = customer?.whatsapp || customer?.phone || customer?.phone1;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '500px',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#111827' }}>
            Send Order
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '8px',
              color: '#6b7280'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Customer Summary */}
        <div style={{
          padding: '16px 24px',
          backgroundColor: '#f9fafb',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: '#FF6B35',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 600,
              fontSize: '18px'
            }}>
              {(customer?.companyName || customer?.name || 'C')[0].toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 600, color: '#111827' }}>
                {customer?.companyName || customer?.name || `${customer?.firstName || ''} ${customer?.lastName || ''}`.trim() || 'Customer'}
              </div>
              <div style={{ fontSize: '13px', color: '#6b7280', display: 'flex', gap: '12px', marginTop: '4px' }}>
                {hasEmail && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                    Email
                  </span>
                )}
                {hasWhatsApp && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#25D366">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                    </svg>
                    WhatsApp
                  </span>
                )}
                {!hasEmail && !hasWhatsApp && (
                  <span style={{ color: '#6b7280', fontStyle: 'italic' }}>Enter email/phone below to send</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs for 'both' mode */}
        {mode === 'both' && (
          <div style={{
            display: 'flex',
            borderBottom: '1px solid #e5e7eb'
          }}>
            <button
              onClick={() => setActiveTab('email')}
              style={{
                flex: 1,
                padding: '12px',
                background: activeTab === 'email' ? '#fff7ed' : 'transparent',
                border: 'none',
                borderBottom: activeTab === 'email' ? '2px solid #FF6B35' : '2px solid transparent',
                cursor: 'pointer',
                color: activeTab === 'email' ? '#FF6B35' : '#6b7280',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              Email
            </button>
            <button
              onClick={() => setActiveTab('whatsapp')}
              style={{
                flex: 1,
                padding: '12px',
                background: activeTab === 'whatsapp' ? '#f0fdf4' : 'transparent',
                border: 'none',
                borderBottom: activeTab === 'whatsapp' ? '2px solid #25D366' : '2px solid transparent',
                cursor: 'pointer',
                color: activeTab === 'whatsapp' ? '#25D366' : '#6b7280',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              </svg>
              WhatsApp
            </button>
          </div>
        )}

        {/* Content */}
        <div style={{ padding: '24px' }}>
          {/* Success/Error Messages */}
          {success && (
            <div style={{
              padding: '12px 16px',
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '8px',
              color: '#15803d',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              {success}
            </div>
          )}

          {error && (
            <div style={{
              padding: '12px 16px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              color: '#b91c1c',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          {/* Email Form */}
          {(mode === 'email' || (mode === 'both' && activeTab === 'email')) && (
            <div>
              {/* Template Selection */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                  Select Template
                </label>
                <select
                  value={selectedEmailTemplate}
                  onChange={(e) => handleEmailTemplateChange(e.target.value)}
                  disabled={loadingTemplates}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    backgroundColor: 'white'
                  }}
                >
                  <option value="custom">Custom Message</option>
                  {emailTemplates.map((template) => (
                    <option key={template._id} value={template._id}>
                      {template.name} {template.isGlobal ? '(Global)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ fontSize: '14px', fontWeight: 500, color: '#374151' }}>
                    To Email *
                  </label>
                  {!hasEmail && (
                    <span style={{ fontSize: '12px', color: '#f59e0b', backgroundColor: '#fef3c7', padding: '2px 8px', borderRadius: '4px' }}>
                      No customer email - enter manually
                    </span>
                  )}
                </div>
                <input
                  type="email"
                  value={emailTo}
                  onChange={(e) => setEmailTo(e.target.value)}
                  placeholder="Enter email address to send"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    border: !emailTo && !hasEmail ? '2px solid #f59e0b' : '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    backgroundColor: !emailTo && !hasEmail ? '#fffbeb' : 'white'
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                  Subject
                </label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Order confirmation"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                  Message
                </label>
                <textarea
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  placeholder="Enter email message..."
                  rows={5}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    resize: 'vertical',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <button
                onClick={handleSendEmail}
                disabled={sending || !emailTo}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: sending ? '#fed7aa' : '#FF6B35',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: sending ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {sending ? (
                  <>
                    <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="32" />
                    </svg>
                    Sending...
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                    Send Email
                  </>
                )}
              </button>
            </div>
          )}

          {/* WhatsApp Form */}
          {(mode === 'whatsapp' || (mode === 'both' && activeTab === 'whatsapp')) && (
            <div>
              {/* Template Selection */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                  Select Template
                </label>
                <select
                  value={selectedWhatsAppTemplate}
                  onChange={(e) => handleWhatsAppTemplateChange(e.target.value)}
                  disabled={loadingTemplates}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    backgroundColor: 'white'
                  }}
                >
                  <option value="custom">Custom Message</option>
                  {whatsappTemplates.map((template) => (
                    <option key={template._id} value={template._id}>
                      {template.name} {template.isGlobal ? '(Global)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ fontSize: '14px', fontWeight: 500, color: '#374151' }}>
                    WhatsApp Number *
                  </label>
                  {!hasWhatsApp && (
                    <span style={{ fontSize: '12px', color: '#f59e0b', backgroundColor: '#fef3c7', padding: '2px 8px', borderRadius: '4px' }}>
                      No customer phone - enter manually
                    </span>
                  )}
                </div>
                <input
                  type="tel"
                  value={whatsappTo}
                  onChange={(e) => setWhatsappTo(e.target.value)}
                  placeholder="Enter WhatsApp number to send"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    border: !whatsappTo && !hasWhatsApp ? '2px solid #f59e0b' : '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    backgroundColor: !whatsappTo && !hasWhatsApp ? '#fffbeb' : 'white'
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                  Message
                </label>
                <textarea
                  value={whatsappMessage}
                  onChange={(e) => setWhatsappMessage(e.target.value)}
                  placeholder="Enter WhatsApp message..."
                  rows={5}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    resize: 'vertical',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <button
                onClick={handleSendWhatsApp}
                disabled={sending || !whatsappTo}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: sending ? '#bbf7d0' : '#25D366',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: sending ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {sending ? (
                  <>Sending...</>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                    </svg>
                    Open WhatsApp
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SendOrderModal;
