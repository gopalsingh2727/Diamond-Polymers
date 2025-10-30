# Report CSS Cheatsheet 📋

Quick reference for all report- prefixed CSS classes.

---

## 🎯 Most Used Classes

```css
.report-container              /* Main wrapper */
.report-button                 /* Primary button */
.report-button-export          /* Export button (green) */
.report-button-print           /* Print button (gray) */
.report-metric-card            /* Metric display card */
.report-chart-container        /* Chart wrapper */
.report-table-container        /* Table wrapper */
.report-badge-status           /* Status badge (blue) */
.report-loading                /* Loading state */
.report-empty                  /* Empty state */
```

---

## 📦 Container Classes

| Class | Purpose |
|-------|---------|
| `.report-container` | Main report wrapper |
| `.report-config-panel` | Configuration card |
| `.report-chart-container` | Chart card wrapper |
| `.report-table-container` | Table card wrapper |
| `.report-metric-card` | Individual metric card |

---

## 🎨 Layout Classes

| Class | Columns | Breakpoints |
|-------|---------|-------------|
| `.report-grid-2` | 2 | 1 mobile, 2 desktop |
| `.report-grid-3` | 3 | 1 mobile, 3 desktop |
| `.report-grid-4` | 4 | 1 mobile, 2 tablet, 4 desktop |
| `.report-metrics-summary` | 4 | Auto responsive grid |
| `.report-filters-section` | 4 | 1/2/4 responsive |

---

## 🔘 Button Classes

| Class | Color | Use Case |
|-------|-------|----------|
| `.report-button` | Blue | Primary actions |
| `.report-button-secondary` | Gray | Secondary actions |
| `.report-button-export` | Green | Export/Download |
| `.report-button-print` | Dark Gray | Print actions |
| `.report-actions` | - | Button container |

**Example:**
```tsx
<div className="report-actions">
  <button className="report-button">Generate</button>
  <button className="report-button-export">Export</button>
</div>
```

---

## 🏷️ Badge Classes

| Class | Color | Use Case |
|-------|-------|----------|
| `.report-badge-status` | Blue | Order status |
| `.report-badge-priority` | Purple | Priority levels |
| `.report-badge-efficiency` | Green | Efficiency scores |
| `.report-badge-warning` | Amber | Warnings |
| `.report-badge-error` | Red | Errors |

**Example:**
```tsx
<span className="report-badge report-badge-status">In Progress</span>
<span className="report-badge report-badge-priority">High</span>
```

---

## 📊 Metric Card Structure

```tsx
<div className="report-metric-card">
  <div className="report-metric-card-header">
    <div className="report-metric-card-title">Title</div>
    <Icon className="report-metric-card-icon" />
  </div>
  <div className="report-metric-card-body">
    <div className="report-metric-value">1,245</div>
    <p className="report-metric-context">Context text</p>
  </div>
</div>
```

---

## 📈 Chart Structure

```tsx
<div className="report-chart-container">
  <div className="report-chart-header">
    <h3 className="report-chart-title">Title</h3>
    <p className="report-chart-description">Description</p>
  </div>
  <div className="report-chart-body">
    <div className="report-chart-wrapper">
      {/* Recharts component */}
    </div>
  </div>
</div>
```

---

## 📋 Table Structure

```tsx
<div className="report-table-container">
  <div className="report-table-header">
    <h3 className="report-table-title">Title</h3>
    <p className="report-table-description">Description</p>
  </div>
  <div className="report-table-body">
    <div className="report-table-wrapper">
      <table className="report-table">
        <thead className="report-table-head">
          <tr>
            <th className="report-table-header-cell">Header</th>
            <th className="report-table-header-cell-right">Right</th>
          </tr>
        </thead>
        <tbody>
          <tr className="report-table-row">
            <td className="report-table-cell">Data</td>
            <td className="report-table-cell-right">123</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</div>
```

---

## 🎭 State Classes

### Loading
```tsx
<div className="report-loading">
  <div className="report-loading-spinner"></div>
  <span className="report-loading-text">Loading...</span>
</div>
```

### Empty
```tsx
<div className="report-empty">
  <Icon className="report-empty-icon" />
  <h3 className="report-empty-title">No Data</h3>
  <p className="report-empty-description">Description</p>
</div>
```

---

## 🎨 Highlight Classes

| Class | Color | Use Case |
|-------|-------|----------|
| `.report-highlight` | Yellow | General highlight |
| `.report-highlight-success` | Green | Success messages |
| `.report-highlight-error` | Red | Error messages |
| `.report-highlight-info` | Blue | Info messages |

**Example:**
```tsx
<div className="report-highlight-success">
  <p>Report generated successfully!</p>
</div>
```

---

## 🔴 Status Dots

| Class | Color |
|-------|-------|
| `.report-status-dot-success` | Green |
| `.report-status-dot-warning` | Amber |
| `.report-status-dot-error` | Red |
| `.report-status-dot-info` | Blue |

**Example:**
```tsx
<span className="report-status-dot report-status-dot-success"></span> Active
```

---

## 📱 Responsive Classes

| Class | Visibility |
|-------|-----------|
| `.report-mobile-only` | Mobile only |
| `.report-desktop-only` | Desktop only |

---

## ✨ Animation Classes

| Class | Animation |
|-------|-----------|
| `.report-fade-in` | Fade in |
| `.report-slide-in` | Slide from bottom |
| `.report-scale-in` | Scale/zoom in |

**Example:**
```tsx
<div className="report-metric-card report-fade-in">
  Content with fade-in animation
</div>
```

---

## 🖨️ Print Classes

| Class | Visibility |
|-------|-----------|
| `.report-print-header` | Print only (header) |
| `.report-print-footer` | Print only (footer) |

**Example:**
```tsx
<div className="report-print-header">
  <h1>Report Title</h1>
  <p>Date: {date}</p>
</div>
```

**Hidden when printing:**
- `.report-config-panel`
- `.report-actions`
- `[role="tablist"]`

---

## 🔧 Configuration Panel Structure

```tsx
<div className="report-config-panel">
  <div className="report-config-header">
    <h2 className="report-config-title">
      <Icon /> Title
    </h2>
    <p className="report-config-description">Description</p>
  </div>
  <div className="report-config-body">
    
    {/* Report Type */}
    <div className="report-type-section">
      <label className="report-type-label">Report Type</label>
      {/* Select */}
    </div>

    {/* Metrics */}
    <div className="report-metrics-section">
      <label className="report-metrics-label">Metrics</label>
      <div className="report-metrics-grid">
        <div className="report-metric-item">
          <input className="report-metric-checkbox" />
          <label className="report-metric-label">Metric</label>
        </div>
      </div>
    </div>

    {/* Filters */}
    <div className="report-filters-section">
      <div className="report-filter-group">
        <label className="report-filter-label">Filter</label>
        {/* Select */}
      </div>
    </div>

    {/* Actions */}
    <div className="report-actions">
      <button className="report-button">Generate</button>
    </div>
  </div>
</div>
```

---

## 📐 Dividers

| Class | Thickness |
|-------|-----------|
| `.report-divider` | Thin (1px) |
| `.report-divider-thick` | Thick (2px) |

---

## 🎨 Color Reference

### Primary Colors
- **Blue**: `#3b82f6` - Primary actions, charts
- **Green**: `#10b981` - Success, efficiency, export
- **Red**: `#ef4444` - Errors, critical
- **Amber**: `#f59e0b` - Warnings
- **Purple**: `#8b5cf6` - Priority

### Neutral Colors
- **Slate 50-900**: Backgrounds, text, borders

---

## 💡 Common Patterns

### Metric Card with Status
```tsx
<div className="report-metric-card">
  <div className="report-metric-card-header">
    <div className="report-metric-card-title">Efficiency</div>
    <TrendingUp className="report-metric-card-icon" />
  </div>
  <div className="report-metric-card-body">
    <div className="report-metric-value">94.2%</div>
    <p className="report-metric-context">
      <span className="report-status-dot report-status-dot-success"></span>
      Up 2.1%
    </p>
  </div>
</div>
```

### Action Button Group
```tsx
<div className="report-actions">
  <button className="report-button">
    <Eye className="report-button-icon" />
    Generate
  </button>
  <button className="report-button-export">
    <Download className="report-button-icon" />
    Export
  </button>
  <button className="report-button-print">
    <Printer className="report-button-icon" />
    Print
  </button>
</div>
```

### Table with Badges
```tsx
<table className="report-table">
  <thead className="report-table-head">
    <tr>
      <th className="report-table-header-cell">Order</th>
      <th className="report-table-header-cell">Status</th>
      <th className="report-table-header-cell-right">Amount</th>
    </tr>
  </thead>
  <tbody>
    <tr className="report-table-row">
      <td className="report-table-cell-mono">ORD-001</td>
      <td className="report-table-cell">
        <span className="report-badge report-badge-status">
          In Progress
        </span>
      </td>
      <td className="report-table-cell-right">$1,250</td>
    </tr>
  </tbody>
</table>
```

---

## 🔍 Quick Search

**Need a button?** → `.report-button`, `.report-button-export`, `.report-button-print`

**Need a card?** → `.report-metric-card`, `.report-chart-container`, `.report-table-container`

**Need a badge?** → `.report-badge-status`, `.report-badge-priority`, `.report-badge-efficiency`

**Need a grid?** → `.report-grid-2`, `.report-grid-3`, `.report-grid-4`, `.report-metrics-summary`

**Need state?** → `.report-loading`, `.report-empty`

**Need highlight?** → `.report-highlight-success`, `.report-highlight-error`, `.report-highlight-info`

**Need animation?** → `.report-fade-in`, `.report-slide-in`, `.report-scale-in`

**Need print?** → `.report-print-header`, `.report-print-footer`

---

## 🌙 Dark Mode

All report classes automatically support dark mode when `.dark` class is on parent:

```tsx
<div className="dark">
  <div className="report-metric-card">
    {/* Automatically styled for dark mode */}
  </div>
</div>
```

---

## ⚡ Performance Tips

1. **Use appropriate grids**: `.report-grid-2/3/4` for responsive layouts
2. **Combine classes**: Mix report classes with Tailwind utilities
3. **Animate wisely**: Use `.report-fade-in` for important elements only
4. **Print optimize**: Hidden config panels save ink

---

## 📖 Full Documentation

- **Complete Guide**: `/styles/REPORT_CSS_GUIDE.md`
- **Examples**: `/styles/REPORT_CSS_EXAMPLES.tsx`
- **Main CSS**: `/styles/globals.css`

---

**All classes use Tailwind's `@apply` directive for consistent, optimized output! 🚀**
