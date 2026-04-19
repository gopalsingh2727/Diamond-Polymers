import { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BackButton } from '../../../../allCompones/BackButton';
import { AppDispatch } from '../../../../../store';
import {
  getDashboardTypesV2 as getDashboardTypes,
  createDashboardTypeV2 as createDashboardType,
} from '../../../../redux/dashbroadtype/dashboardTypeActions';
import { useFormDataCache } from '../../Edit/hooks/useFormDataCache';
import { AccountData } from '../Account';
import AccountTemplatePreview from './AccountTemplatePreview';
import './AccountTemplates.css';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface DashboardType {
  _id: string;
  typeName: string;
  typeCode: string;
  description?: string;
  category?: string;
  htmlHeader?: string;
  htmlBody?: string;
  htmlFooter?: string;
  css?: string;
  js?: string;
}

type Step = 'list' | 'create' | 'preview';

// ─────────────────────────────────────────────────────────────────────────────
// Category colors
// ─────────────────────────────────────────────────────────────────────────────
const CATEGORY_COLORS: Record<string, { bg: string; color: string; dot: string }> = {
  customer:   { bg: '#fce7f3', color: '#be185d', dot: '#ec4899' },
  account:    { bg: '#ffedd5', color: '#c2410c', dot: '#f97316' },
  analytics:  { bg: '#dbeafe', color: '#1d4ed8', dot: '#3b82f6' },
  finance:    { bg: '#fef9c3', color: '#a16207', dot: '#eab308' },
  operations: { bg: '#dcfce7', color: '#15803d', dot: '#22c55e' },
  production: { bg: '#ede9fe', color: '#7c3aed', dot: '#a855f7' },
  management: { bg: '#ffedd5', color: '#c2410c', dot: '#f97316' },
  other:      { bg: '#f3f4f6', color: '#4b5563', dot: '#6b7280' },
};

// ─────────────────────────────────────────────────────────────────────────────
// Default template for new account templates
// ─────────────────────────────────────────────────────────────────────────────
const DEFAULT_HTML_HEADER = `<div class="report-header">
  <h1>{{companyName}}</h1>
  <p class="subtitle">Account Report</p>
  <p class="date">Generated: {{generatedAt}} at {{generatedTime}}</p>
</div>`;

const DEFAULT_HTML_BODY = `<div class="report-body">
  <div class="summary-cards">
    <div class="card">
      <div class="card-value">{{totalAccounts}}</div>
      <div class="card-label">Total Accounts</div>
    </div>
    <div class="card">
      <div class="card-value">{{totalStates}}</div>
      <div class="card-label">States</div>
    </div>
  </div>

  <h2>Accounts Directory</h2>
  <table class="accounts-table">
    <thead>
      <tr>
        <th>#</th>
        <th>Company</th>
        <th>Contact</th>
        <th>Phone</th>
        <th>Email</th>
        <th>State</th>
        <th>Pin Code</th>
      </tr>
    </thead>
    <tbody>
      {{#accounts}}
      <tr>
        <td>{{@index}}</td>
        <td><strong>{{companyName}}</strong></td>
        <td>{{firstName}} {{lastName}}</td>
        <td>{{phone1}}</td>
        <td>{{email}}</td>
        <td>{{state}}</td>
        <td>{{pinCode}}</td>
      </tr>
      {{/accounts}}
    </tbody>
  </table>
</div>`;

const DEFAULT_HTML_FOOTER = `<div class="report-footer">
  <p>{{companyName}} - Confidential</p>
</div>`;

const DEFAULT_CSS = `* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Segoe UI', system-ui, sans-serif; color: #1e293b; padding: 24px; }

.report-header { text-align: center; padding: 24px 0 16px; border-bottom: 3px solid #FF6B35; margin-bottom: 24px; }
.report-header h1 { font-size: 28px; font-weight: 800; color: #0f172a; }
.report-header .subtitle { font-size: 16px; color: #FF6B35; font-weight: 600; margin-top: 4px; }
.report-header .date { font-size: 12px; color: #94a3b8; margin-top: 8px; }

.summary-cards { display: flex; gap: 16px; margin-bottom: 24px; }
.card { flex: 1; background: linear-gradient(135deg, #FF6B35 0%, #E55A2B 100%); color: white; padding: 20px; border-radius: 12px; text-align: center; }
.card-value { font-size: 32px; font-weight: 800; }
.card-label { font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; opacity: 0.9; margin-top: 4px; }

h2 { font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 12px; }

.accounts-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.accounts-table th { background: #f8fafc; padding: 10px 12px; text-align: left; font-weight: 600; color: #475569; border-bottom: 2px solid #e2e8f0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
.accounts-table td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; color: #334155; }
.accounts-table tr:hover { background: #fff7ed; }
.accounts-table strong { color: #0f172a; }

.report-footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 11px; color: #94a3b8; }

@media print {
  body { padding: 12px; }
  .card { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
}`;

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
const AccountTemplates = () => {
  const dispatch = useDispatch<AppDispatch>();

  const [step, setStep] = useState<Step>('list');
  const [selected, setSelected] = useState<DashboardType | null>(null);
  const [search, setSearch] = useState('');
  const [creating, setCreating] = useState(false);

  // Create form state
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formCategory, setFormCategory] = useState('account');
  const [formHeader, setFormHeader] = useState(DEFAULT_HTML_HEADER);
  const [formBody, setFormBody] = useState(DEFAULT_HTML_BODY);
  const [formFooter, setFormFooter] = useState(DEFAULT_HTML_FOOTER);
  const [formCss, setFormCss] = useState(DEFAULT_CSS);
  const [formJs, setFormJs] = useState('');
  const [formError, setFormError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Upload HTML file handler
  const handleUploadHtml = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      if (!content) return;

      // Try to extract <style> into CSS
      const styleMatch = content.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
      if (styleMatch?.[1]) setFormCss(styleMatch[1].trim());

      // Try to extract <script> into JS
      const scriptMatch = content.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
      if (scriptMatch?.[1]) setFormJs(scriptMatch[1].trim());

      // Extract body content (between <body> and </body>, or full content)
      const bodyMatch = content.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      if (bodyMatch?.[1]) {
        // Remove style and script tags from body
        let bodyContent = bodyMatch[1]
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
          .trim();
        setFormBody(bodyContent);
        setFormHeader('');
        setFormFooter('');
      } else {
        // No body tag — put entire content in body
        let cleaned = content
          .replace(/<\/?html[^>]*>/gi, '')
          .replace(/<\/?head[^>]*>/gi, '')
          .replace(/<\/?body[^>]*>/gi, '')
          .replace(/<meta[^>]*\/?>/gi, '')
          .replace(/<title[^>]*>[\s\S]*?<\/title>/gi, '')
          .replace(/<!DOCTYPE[^>]*>/gi, '')
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
          .trim();
        setFormBody(cleaned);
        setFormHeader('');
        setFormFooter('');
      }

      // Auto-fill name from filename if empty
      if (!formName) {
        const name = file.name.replace(/\.html?$/i, '').replace(/[_-]/g, ' ');
        setFormName(name);
        setFormCode(name.toUpperCase().replace(/\s+/g, '_').slice(0, 30));
      }
    };
    reader.readAsText(file);
    // Reset input so same file can be re-uploaded
    e.target.value = '';
  };

  // Get accounts from cache
  const { customers: rawAccounts } = useFormDataCache();
  const accounts: AccountData[] = rawAccounts.map((c: any) => ({
    _id: c._id,
    companyName: c.companyName || '',
    firstName: c.firstName || '',
    lastName: c.lastName || '',
    phone1: c.phone1 || '',
    phone2: c.phone2 || '',
    whatsapp: c.whatsapp || '',
    telephone: c.telephone || '',
    address1: c.address1 || '',
    address2: c.address2 || '',
    state: c.state || '',
    pinCode: c.pinCode || '',
    email: c.email || '',
  }));

  // Get templates from Redux
  const dashboardTypeState = useSelector(
    (state: any) => state.v2?.dashboardType ?? state.dashboardType ?? {},
  );
  const rawList = dashboardTypeState?.list;
  const allTemplates: DashboardType[] = Array.isArray(rawList)
    ? rawList
    : Array.isArray(rawList?.data)
    ? rawList.data
    : Array.isArray(rawList?.data?.data)
    ? rawList.data.data
    : [];

  const loading = dashboardTypeState?.loading || false;
  const error = dashboardTypeState?.error || null;

  useEffect(() => {
    if (allTemplates.length === 0 && !loading) {
      dispatch(getDashboardTypes());
    }
  }, [dispatch, allTemplates.length, loading]);

  // Filter templates by search
  const filtered = allTemplates.filter(dt =>
    (dt.typeName || '').toLowerCase().includes(search.toLowerCase()) ||
    (dt.typeCode || '').toLowerCase().includes(search.toLowerCase()) ||
    (dt.category || '').toLowerCase().includes(search.toLowerCase()),
  );

  // ── Create template handler ───────────────────────────────────────────────
  const handleCreate = useCallback(async () => {
    if (!formName.trim()) { setFormError('Template name is required'); return; }
    if (!formCode.trim()) { setFormError('Template code is required'); return; }

    setCreating(true);
    setFormError('');
    try {
      await dispatch(createDashboardType({
        typeName: formName.trim(),
        typeCode: formCode.trim(),
        description: formDesc.trim(),
        category: formCategory,
        htmlHeader: formHeader,
        htmlBody: formBody,
        htmlFooter: formFooter,
        css: formCss,
        js: formJs,
      }));
      // Refresh list
      dispatch(getDashboardTypes());
      // Reset form and go back to list
      resetForm();
      setStep('list');
    } catch (e: any) {
      setFormError(e?.response?.data?.message || e?.message || 'Failed to create template');
    } finally {
      setCreating(false);
    }
  }, [dispatch, formName, formCode, formDesc, formCategory, formHeader, formBody, formFooter, formCss, formJs]);

  const resetForm = () => {
    setFormName('');
    setFormCode('');
    setFormDesc('');
    setFormCategory('account');
    setFormHeader(DEFAULT_HTML_HEADER);
    setFormBody(DEFAULT_HTML_BODY);
    setFormFooter(DEFAULT_HTML_FOOTER);
    setFormCss(DEFAULT_CSS);
    setFormJs('');
    setFormError('');
  };

  // ── Preview from create form (unsaved template) ────────────────────────
  const handlePreviewFromCreate = () => {
    setSelected({
      _id: 'preview-draft',
      typeName: formName || 'Untitled Template',
      typeCode: formCode || 'DRAFT',
      description: formDesc,
      category: formCategory,
      htmlHeader: formHeader,
      htmlBody: formBody,
      htmlFooter: formFooter,
      css: formCss,
      js: formJs,
    });
    setStep('preview');
  };

  // ── Preview ───────────────────────────────────────────────────────────────
  if (step === 'preview' && selected) {
    return (
      <AccountTemplatePreview
        template={selected}
        accounts={accounts}
        onBack={() => {
          const wasDraft = selected._id === 'preview-draft';
          setSelected(null);
          setStep(wasDraft ? 'create' : 'list');
        }}
      />
    );
  }

  // ── Create Form ───────────────────────────────────────────────────────────
  if (step === 'create') {
    return (
      <div className="act-page">
        <div className="act-header">
          <div className="act-header__left">
            <button className="act-back-btn" onClick={() => setStep('list')}>← Back</button>
            <h1 className="act-title">Create Account Template</h1>
          </div>
          <div className="act-header__right">
            <input
              ref={fileInputRef}
              type="file"
              accept=".html,.htm"
              style={{ display: 'none' }}
              onChange={handleUploadHtml}
            />
            <button
              className="act-btn act-btn--secondary"
              onClick={() => fileInputRef.current?.click()}
            >
              Upload HTML
            </button>
            <button
              className="act-btn act-btn--secondary"
              onClick={handlePreviewFromCreate}
            >
              Preview
            </button>
            <button
              className="act-btn act-btn--primary"
              onClick={handleCreate}
              disabled={creating}
            >
              {creating ? 'Creating...' : 'Create Template'}
            </button>
          </div>
        </div>

        {formError && <div className="act-error">{formError}</div>}

        <div className="act-create-form">
          {/* Basic Info */}
          <div className="act-form-section">
            <h3>Basic Information</h3>
            <div className="act-form-row">
              <div className="act-form-group">
                <label>Template Name *</label>
                <input
                  type="text"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="e.g. Customer Directory"
                />
              </div>
              <div className="act-form-group">
                <label>Template Code *</label>
                <input
                  type="text"
                  value={formCode}
                  onChange={e => setFormCode(e.target.value.toUpperCase().replace(/\s/g, '_'))}
                  placeholder="e.g. CUST_DIR"
                />
              </div>
              <div className="act-form-group">
                <label>Category</label>
                <select value={formCategory} onChange={e => setFormCategory(e.target.value)}>
                  <option value="account">Account</option>
                  <option value="customer">Customer</option>
                  <option value="analytics">Analytics</option>
                  <option value="finance">Finance</option>
                  <option value="operations">Operations</option>
                  <option value="management">Management</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div className="act-form-group">
              <label>Description</label>
              <input
                type="text"
                value={formDesc}
                onChange={e => setFormDesc(e.target.value)}
                placeholder="Brief description of this template"
              />
            </div>
          </div>

          {/* HTML Sections */}
          <div className="act-form-section">
            <h3>Template HTML</h3>
            <div className="act-form-group">
              <label>
                Header HTML
                <span className="act-hint">Variables: {'{{companyName}}'}, {'{{generatedAt}}'}, {'{{generatedTime}}'}, {'{{totalAccounts}}'}</span>
              </label>
              <textarea
                value={formHeader}
                onChange={e => setFormHeader(e.target.value)}
                rows={6}
                spellCheck={false}
              />
            </div>
            <div className="act-form-group">
              <label>
                Body HTML
                <span className="act-hint">Loop: {'{{#accounts}}...{{/accounts}}'} | Row: {'{{@index}}'}, {'{{companyName}}'}, {'{{firstName}}'}, {'{{lastName}}'}, {'{{phone1}}'}, {'{{email}}'}, {'{{state}}'}, {'{{pinCode}}'}, {'{{address1}}'}</span>
              </label>
              <textarea
                value={formBody}
                onChange={e => setFormBody(e.target.value)}
                rows={14}
                spellCheck={false}
              />
            </div>
            <div className="act-form-group">
              <label>Footer HTML</label>
              <textarea
                value={formFooter}
                onChange={e => setFormFooter(e.target.value)}
                rows={4}
                spellCheck={false}
              />
            </div>
          </div>

          {/* CSS & JS */}
          <div className="act-form-section">
            <h3>Styling & Scripts</h3>
            <div className="act-form-group">
              <label>CSS</label>
              <textarea
                value={formCss}
                onChange={e => setFormCss(e.target.value)}
                rows={10}
                spellCheck={false}
                className="act-code"
              />
            </div>
            <div className="act-form-group">
              <label>JavaScript (optional)</label>
              <textarea
                value={formJs}
                onChange={e => setFormJs(e.target.value)}
                rows={4}
                spellCheck={false}
                className="act-code"
              />
            </div>
          </div>

          {/* Available Variables Reference */}
          <div className="act-form-section act-form-section--ref">
            <h3>Available Template Variables</h3>
            <div className="act-var-grid">
              <div className="act-var-group">
                <h4>Global</h4>
                <code>{'{{companyName}}'}</code>
                <code>{'{{generatedAt}}'}</code>
                <code>{'{{generatedTime}}'}</code>
                <code>{'{{totalAccounts}}'}</code>
                <code>{'{{totalStates}}'}</code>
              </div>
              <div className="act-var-group">
                <h4>Account Loop {'{{#accounts}}...{{/accounts}}'}</h4>
                <code>{'{{@index}}'}</code>
                <code>{'{{companyName}}'}</code>
                <code>{'{{firstName}}'}</code>
                <code>{'{{lastName}}'}</code>
                <code>{'{{phone1}}'}</code>
                <code>{'{{phone2}}'}</code>
                <code>{'{{whatsapp}}'}</code>
                <code>{'{{telephone}}'}</code>
                <code>{'{{email}}'}</code>
                <code>{'{{address1}}'}</code>
                <code>{'{{address2}}'}</code>
                <code>{'{{state}}'}</code>
                <code>{'{{pinCode}}'}</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Template List ─────────────────────────────────────────────────────────
  return (
    <div className="act-page">
      <div className="act-header">
        <div className="act-header__left">
          <BackButton />
          <h1 className="act-title">Account Templates</h1>
          <span className="act-count-badge">{accounts.length} accounts</span>
        </div>
        <div className="act-header__right">
          <button
            className="act-btn act-btn--secondary"
            onClick={() => dispatch(getDashboardTypes())}
          >
            ↻ Refresh
          </button>
          <button
            className="act-btn act-btn--primary"
            onClick={() => { resetForm(); setStep('create'); }}
          >
            + Create Template
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="act-search-wrap">
        <input
          className="act-search"
          placeholder="Search templates..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && (
          <button className="act-clear-btn" onClick={() => setSearch('')}>x</button>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="act-state-box">
          <div className="act-spinner" />
          <div>Loading templates...</div>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="act-state-box">
          <div style={{ fontSize: 40 }}>!</div>
          <div style={{ color: '#ef4444' }}>Failed to load templates</div>
          <div style={{ color: '#64748b', fontSize: 13 }}>{error}</div>
          <button className="act-btn act-btn--primary" onClick={() => dispatch(getDashboardTypes())}>
            Retry
          </button>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && filtered.length === 0 && (
        <div className="act-state-box">
          <div style={{ fontSize: 48 }}>&#128196;</div>
          <div style={{ fontWeight: 600, color: '#64748b' }}>
            {search ? 'No templates match your search' : 'No templates yet'}
          </div>
          {!search && (
            <button
              className="act-btn act-btn--primary"
              onClick={() => { resetForm(); setStep('create'); }}
            >
              Create Your First Template
            </button>
          )}
          {search && (
            <button className="act-btn act-btn--secondary" onClick={() => setSearch('')}>
              Clear Search
            </button>
          )}
        </div>
      )}

      {/* Template Grid */}
      {!loading && !error && filtered.length > 0 && (
        <div className="act-grid">
          {filtered.map(dt => {
            const cat = CATEGORY_COLORS[dt.category || ''] || CATEGORY_COLORS.other;
            const parts = [
              dt.htmlHeader ? 'H' : '',
              dt.htmlBody ? 'B' : '',
              dt.htmlFooter ? 'F' : '',
              dt.css ? 'CSS' : '',
              dt.js ? 'JS' : '',
            ].filter(Boolean).join(' · ');

            return (
              <div
                key={dt._id ?? dt.typeCode}
                className="act-card"
                onClick={() => { setSelected(dt); setStep('preview'); }}
              >
                <div className="act-card__top">
                  <div className="act-card__name">{dt.typeName || dt.typeCode}</div>
                  {dt.category && (
                    <span
                      className="act-cat-badge"
                      style={{ background: cat.bg, color: cat.color }}
                    >
                      <span className="act-cat-dot" style={{ background: cat.dot }} />
                      {dt.category}
                    </span>
                  )}
                </div>
                <div className="act-card__code">{dt.typeCode}</div>
                {dt.description && (
                  <div className="act-card__desc">{dt.description}</div>
                )}
                <div className="act-card__footer">
                  <span className="act-card__parts">{parts || 'Empty'}</span>
                  <span className="act-card__open">Open Preview →</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AccountTemplates;
