# Custom Report Builder CSS Guide

## Overview

All CSS classes for the Custom Report Builder are prefixed with `report-` to maintain clear separation from other components and avoid naming conflicts.

---

## 📦 CSS Class Categories

### 1. **Container Classes**

#### `.report-container`
- **Purpose**: Main wrapper for report components
- **Styling**: Vertical spacing, full width
- **Usage**: Wrap entire report content

```tsx
<div className="report-container">
  {/* Report content */}
</div>
```

---

### 2. **Configuration Panel Classes**

#### `.report-config-panel`
- **Purpose**: Main configuration card container
- **Styling**: White background, rounded corners, shadow, border

#### `.report-config-header`
- **Purpose**: Configuration panel header
- **Styling**: Bottom border, padding

#### `.report-config-title`
- **Purpose**: Configuration panel title
- **Styling**: Flex layout with icon, dark text

#### `.report-config-description`
- **Purpose**: Configuration panel subtitle
- **Styling**: Small text, muted color

#### `.report-config-body`
- **Purpose**: Configuration panel content area
- **Styling**: Padding, vertical spacing

**Example:**
```tsx
<div className="report-config-panel">
  <div className="report-config-header">
    <h2 className="report-config-title">
      <Filter className="w-5 h-5" />
      Report Configuration
    </h2>
    <p className="report-config-description">
      Configure your custom report
    </p>
  </div>
  <div className="report-config-body">
    {/* Configuration content */}
  </div>
</div>
```

---

### 3. **Report Type Selection Classes**

#### `.report-type-section`
- **Purpose**: Report type selection container
- **Styling**: Vertical spacing

#### `.report-type-label`
- **Purpose**: Label for report type selector
- **Styling**: Small text, dark color, bottom margin

#### `.report-type-select`
- **Purpose**: Select dropdown wrapper
- **Styling**: Full width

#### `.report-type-option`
- **Purpose**: Individual report type option
- **Styling**: Flex layout, hover effect, rounded

#### `.report-type-icon`
- **Purpose**: Icon within report type option
- **Styling**: Small size, muted color

---

### 4. **Metrics Selection Classes**

#### `.report-metrics-section`
- **Purpose**: Metrics selection container
- **Styling**: Vertical spacing

#### `.report-metrics-label`
- **Purpose**: Label for metrics section
- **Styling**: Small text, dark color

#### `.report-metrics-grid`
- **Purpose**: Grid layout for metric checkboxes
- **Styling**: Responsive grid (1/2/3 columns), light background, border, padding

#### `.report-metric-item`
- **Purpose**: Individual metric checkbox wrapper
- **Styling**: Flex layout, horizontal spacing

#### `.report-metric-checkbox`
- **Purpose**: Checkbox input styling
- **Styling**: Small size, blue accent, focus ring

#### `.report-metric-label`
- **Purpose**: Label for metric checkbox
- **Styling**: Small text, dark color, cursor pointer

**Example:**
```tsx
<div className="report-metrics-section">
  <label className="report-metrics-label">Metrics to Display</label>
  <div className="report-metrics-grid">
    <div className="report-metric-item">
      <input type="checkbox" className="report-metric-checkbox" />
      <label className="report-metric-label">Total Orders</label>
    </div>
    {/* More metrics */}
  </div>
</div>
```

---

### 5. **Filter Classes**

#### `.report-filters-section`
- **Purpose**: Grid layout for all filters
- **Styling**: Responsive grid (1/2/4 columns), gap spacing

#### `.report-filter-group`
- **Purpose**: Individual filter container
- **Styling**: Vertical spacing

#### `.report-filter-label`
- **Purpose**: Label for filter
- **Styling**: Small text, dark color

#### `.report-filter-select`
- **Purpose**: Filter select dropdown
- **Styling**: Full width

---

### 6. **Visualization Classes**

#### `.report-viz-section`
- **Purpose**: Visualization options container
- **Styling**: Responsive grid (1/2 columns)

#### `.report-viz-group`
- **Purpose**: Individual visualization option
- **Styling**: Vertical spacing

---

### 7. **Button Classes**

#### `.report-button` ⭐
- **Purpose**: Primary action button
- **Styling**: Blue background, white text, rounded, hover effect
- **Usage**: Generate report, submit actions

#### `.report-button-icon`
- **Purpose**: Icon inside button
- **Styling**: Small size

#### `.report-button-secondary`
- **Purpose**: Secondary action button
- **Styling**: Light gray background, dark text, hover effect

#### `.report-button-export`
- **Purpose**: Export action button
- **Styling**: Green background, white text, hover effect

#### `.report-button-print`
- **Purpose**: Print action button
- **Styling**: Dark gray background, white text, hover effect

#### `.report-actions`
- **Purpose**: Container for action buttons
- **Styling**: Flex layout, wrapping, gap spacing

**Example:**
```tsx
<div className="report-actions">
  <button className="report-button">
    <Eye className="report-button-icon" />
    Generate Report
  </button>
  <button className="report-button-export">
    <Download className="report-button-icon" />
    Export Excel
  </button>
  <button className="report-button-print">
    <Printer className="report-button-icon" />
    Print
  </button>
</div>
```

---

### 8. **Metric Card Classes**

#### `.report-metrics-summary`
- **Purpose**: Grid container for metric cards
- **Styling**: Responsive grid (2/4 columns), gap spacing

#### `.report-metric-card`
- **Purpose**: Individual metric card
- **Styling**: White background, shadow, border, padding, hover effect

#### `.report-metric-card-header`
- **Purpose**: Card header section
- **Styling**: Flex layout, space between, bottom padding

#### `.report-metric-card-title`
- **Purpose**: Metric card title
- **Styling**: Small text, muted color

#### `.report-metric-card-icon`
- **Purpose**: Icon in card header
- **Styling**: Small size, muted color

#### `.report-metric-card-body`
- **Purpose**: Card content area
- **Styling**: Top margin

#### `.report-metric-value`
- **Purpose**: Main metric value display
- **Styling**: Dark text, large size

#### `.report-metric-context`
- **Purpose**: Context/description text
- **Styling**: Extra small text, muted color, top margin

**Example:**
```tsx
<div className="report-metrics-summary">
  <div className="report-metric-card">
    <div className="report-metric-card-header">
      <div className="report-metric-card-title">Total Orders</div>
      <Database className="report-metric-card-icon" />
    </div>
    <div className="report-metric-card-body">
      <div className="report-metric-value">1,245</div>
      <p className="report-metric-context">Based on 30 days</p>
    </div>
  </div>
</div>
```

---

### 9. **Chart Classes**

#### `.report-chart-container`
- **Purpose**: Chart card wrapper
- **Styling**: White background, shadow, border, rounded

#### `.report-chart-header`
- **Purpose**: Chart header section
- **Styling**: Bottom border, padding

#### `.report-chart-title`
- **Purpose**: Chart title
- **Styling**: Dark text

#### `.report-chart-description`
- **Purpose**: Chart subtitle
- **Styling**: Small text, muted color

#### `.report-chart-body`
- **Purpose**: Chart content area
- **Styling**: Padding

#### `.report-chart-wrapper`
- **Purpose**: Recharts responsive container
- **Styling**: Full width, fixed height (96 = 384px)

#### Chart Element Classes:
- `.report-chart-bar` - Bar chart styling
- `.report-chart-line` - Line chart styling
- `.report-chart-pie-cell` - Pie chart cell styling
- `.report-chart-tooltip` - Custom tooltip styling
- `.report-chart-legend` - Legend styling

---

### 10. **Table Classes**

#### `.report-table-container`
- **Purpose**: Table card wrapper
- **Styling**: White background, shadow, border

#### `.report-table-header`
- **Purpose**: Table header section
- **Styling**: Bottom border, padding

#### `.report-table-title`
- **Purpose**: Table title
- **Styling**: Dark text

#### `.report-table-description`
- **Purpose**: Table subtitle
- **Styling**: Small text, muted color

#### `.report-table-body`
- **Purpose**: Table content area
- **Styling**: Padding

#### `.report-table-wrapper`
- **Purpose**: Scrollable table wrapper
- **Styling**: Horizontal overflow auto

#### `.report-table`
- **Purpose**: Table element
- **Styling**: Full width, collapsed borders

#### `.report-table-head`
- **Purpose**: Table header row container
- **Styling**: Light background, bottom border

#### `.report-table-header-cell`
- **Purpose**: Table header cell
- **Styling**: Left aligned, uppercase, small text, padding

#### `.report-table-header-cell-right`
- **Purpose**: Right-aligned header cell
- **Styling**: Same as above but right aligned

#### `.report-table-row`
- **Purpose**: Table data row
- **Styling**: Bottom border, hover effect

#### `.report-table-cell`
- **Purpose**: Standard table cell
- **Styling**: Padding, small text, dark color

#### `.report-table-cell-right`
- **Purpose**: Right-aligned table cell
- **Styling**: Same as above but right aligned

#### `.report-table-cell-mono`
- **Purpose**: Monospace table cell (for IDs)
- **Styling**: Monospace font, padding

**Example:**
```tsx
<div className="report-table-container">
  <div className="report-table-header">
    <h3 className="report-table-title">Detailed Data</h3>
    <p className="report-table-description">Showing 50 orders</p>
  </div>
  <div className="report-table-body">
    <div className="report-table-wrapper">
      <table className="report-table">
        <thead className="report-table-head">
          <tr>
            <th className="report-table-header-cell">Order ID</th>
            <th className="report-table-header-cell-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr className="report-table-row">
            <td className="report-table-cell-mono">ORD-001</td>
            <td className="report-table-cell-right">$1,250</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</div>
```

---

### 11. **Badge Classes**

#### `.report-badge`
- **Purpose**: Base badge styling
- **Styling**: Inline flex, padding, rounded, small text

#### `.report-badge-status`
- **Purpose**: Status badge (blue)
- **Styling**: Blue background, blue text, blue border

#### `.report-badge-priority`
- **Purpose**: Priority badge (purple)
- **Styling**: Purple background, purple text, purple border

#### `.report-badge-efficiency`
- **Purpose**: Efficiency badge (green)
- **Styling**: Green background, green text, green border

#### `.report-badge-warning`
- **Purpose**: Warning badge (amber)
- **Styling**: Amber background, amber text, amber border

#### `.report-badge-error`
- **Purpose**: Error badge (red)
- **Styling**: Red background, red text, red border

**Example:**
```tsx
<span className="report-badge report-badge-status">In Progress</span>
<span className="report-badge report-badge-priority">High</span>
<span className="report-badge report-badge-efficiency">94%</span>
```

---

### 12. **Loading State Classes**

#### `.report-loading`
- **Purpose**: Loading container
- **Styling**: Centered flex, vertical padding

#### `.report-loading-spinner`
- **Purpose**: Animated spinner
- **Styling**: Circular border animation, blue accent

#### `.report-loading-text`
- **Purpose**: Loading message text
- **Styling**: Small text, muted color, left margin

**Example:**
```tsx
<div className="report-loading">
  <div className="report-loading-spinner"></div>
  <span className="report-loading-text">Loading report...</span>
</div>
```

---

### 13. **Empty State Classes**

#### `.report-empty`
- **Purpose**: Empty state container
- **Styling**: Centered flex column, vertical padding, center text

#### `.report-empty-icon`
- **Purpose**: Large icon for empty state
- **Styling**: Large size, light color, bottom margin

#### `.report-empty-title`
- **Purpose**: Empty state title
- **Styling**: Dark text, bottom margin

#### `.report-empty-description`
- **Purpose**: Empty state description
- **Styling**: Small text, muted color, max width

**Example:**
```tsx
<div className="report-empty">
  <FileX className="report-empty-icon" />
  <h3 className="report-empty-title">No Data Available</h3>
  <p className="report-empty-description">
    Try adjusting your filters to see results
  </p>
</div>
```

---

### 14. **Status Indicator Classes**

#### `.report-status-dot`
- **Purpose**: Small colored dot indicator
- **Styling**: Small circle, inline block, right margin

#### `.report-status-dot-success` - Green dot
#### `.report-status-dot-warning` - Amber dot
#### `.report-status-dot-error` - Red dot
#### `.report-status-dot-info` - Blue dot

**Example:**
```tsx
<div>
  <span className="report-status-dot report-status-dot-success"></span>
  Active
</div>
```

---

### 15. **Highlight Classes**

#### `.report-highlight`
- **Purpose**: Yellow highlight with left border
- **Styling**: Yellow background, yellow left border, left padding

#### `.report-highlight-success`
- **Purpose**: Green highlight
- **Styling**: Green background, green left border

#### `.report-highlight-error`
- **Purpose**: Red highlight
- **Styling**: Red background, red left border

#### `.report-highlight-info`
- **Purpose**: Blue highlight
- **Styling**: Blue background, blue left border

**Example:**
```tsx
<div className="report-highlight-success">
  <p>Report generated successfully!</p>
</div>
```

---

### 16. **Utility Classes**

#### Grid Layouts:
- `.report-grid-2` - 2-column grid (responsive)
- `.report-grid-3` - 3-column grid (responsive)
- `.report-grid-4` - 4-column grid (responsive)

#### Responsive:
- `.report-mobile-only` - Show only on mobile
- `.report-desktop-only` - Show only on desktop

#### Animations:
- `.report-fade-in` - Fade in animation
- `.report-slide-in` - Slide from bottom animation
- `.report-scale-in` - Scale/zoom in animation

#### Dividers:
- `.report-divider` - Thin horizontal divider
- `.report-divider-thick` - Thick horizontal divider

---

### 17. **Print-Specific Classes**

#### `.report-print-header`
- **Purpose**: Header shown only when printing
- **Styling**: Hidden by default, shown when printing, centered

#### `.report-print-footer`
- **Purpose**: Footer shown only when printing
- **Styling**: Hidden by default, shown when printing, centered

**Example:**
```tsx
<div className="report-print-header">
  <h1>Manufacturing Report - October 2025</h1>
  <p>Generated: {new Date().toLocaleDateString()}</p>
</div>

{/* Report content */}

<div className="report-print-footer">
  <p>© 2025 Your Company | Confidential</p>
</div>
```

---

## 🎨 Color Scheme

### Primary Colors:
- **Blue**: `#3b82f6` - Primary actions, charts
- **Green**: `#10b981` - Success, efficiency
- **Red**: `#ef4444` - Errors, warnings
- **Amber**: `#f59e0b` - Warnings, caution
- **Purple**: `#8b5cf6` - Priority, special

### Neutral Colors:
- **Slate 50**: `#f8fafc` - Light backgrounds
- **Slate 100**: `#f1f5f9` - Subtle backgrounds
- **Slate 200**: `#e2e8f0` - Borders
- **Slate 600**: `#475569` - Muted text
- **Slate 700**: `#334155` - Dark text
- **Slate 900**: `#0f172a` - Primary text

---

## 📱 Responsive Breakpoints

- **Mobile**: Default (< 768px)
- **Tablet**: `md:` (>= 768px)
- **Desktop**: `lg:` (>= 1024px)

Most report classes adapt automatically using these breakpoints.

---

## 🌙 Dark Mode Support

All report classes have dark mode variants that activate when `.dark` class is present on a parent element:

```css
.dark .report-config-panel {
  /* Dark background */
}

.dark .report-metric-value {
  /* Light text for dark background */
}
```

---

## 🖨️ Print Optimization

When printing (triggered by `window.print()`):

1. **Hidden Elements**:
   - `.report-config-panel` - Configuration panel
   - `.report-actions` - Action buttons
   - `[role="tablist"]` - Navigation tabs

2. **Shown Elements**:
   - `.report-print-header` - Print header
   - `.report-print-footer` - Print footer

3. **Optimizations**:
   - Page breaks avoided inside cards/charts
   - Shadows removed for cleaner print
   - Font sizes optimized
   - 1cm margins on all sides

---

## 💡 Best Practices

### 1. **Consistent Naming**
Always use the `report-` prefix for all custom classes

### 2. **Semantic HTML**
Use appropriate HTML elements with report classes:
```tsx
<div className="report-container">
  <section className="report-metrics-summary">
    <article className="report-metric-card">
      {/* Content */}
    </article>
  </section>
</div>
```

### 3. **Composition**
Combine classes for specific effects:
```tsx
<button className="report-button report-fade-in">
  Generate Report
</button>
```

### 4. **Accessibility**
Report classes maintain accessibility:
- Proper color contrast ratios
- Focus states on interactive elements
- Screen reader friendly structure

### 5. **Performance**
- All classes use Tailwind's `@apply` directive
- No duplicate CSS
- Optimized for production builds

---

## 🔧 Customization

To customize report styles, edit `/styles/globals.css`:

```css
/* Example: Change primary button color */
.report-button {
  @apply bg-purple-600 hover:bg-purple-700;
}

/* Example: Add new badge variant */
.report-badge-custom {
  @apply bg-teal-100 text-teal-800 border border-teal-200;
}
```

---

## 📚 Quick Reference

### Most Commonly Used Classes:

| Class | Purpose |
|-------|---------|
| `.report-container` | Main wrapper |
| `.report-button` | Primary button |
| `.report-metric-card` | Metric display card |
| `.report-chart-container` | Chart wrapper |
| `.report-table-container` | Table wrapper |
| `.report-badge-status` | Status badge |
| `.report-loading` | Loading state |
| `.report-empty` | Empty state |

---

## 🎯 Usage Examples

### Complete Metric Card:
```tsx
<div className="report-metric-card report-fade-in">
  <div className="report-metric-card-header">
    <div className="report-metric-card-title">Total Efficiency</div>
    <TrendingUp className="report-metric-card-icon" />
  </div>
  <div className="report-metric-card-body">
    <div className="report-metric-value">94.2%</div>
    <p className="report-metric-context">
      <span className="report-status-dot report-status-dot-success"></span>
      Up 2.1% from last week
    </p>
  </div>
</div>
```

### Action Button Group:
```tsx
<div className="report-actions">
  <button className="report-button">
    <Eye className="report-button-icon" />
    Generate
  </button>
  <button className="report-button-export">
    <Download className="report-button-icon" />
    Excel
  </button>
  <button className="report-button-print">
    <Printer className="report-button-icon" />
    Print
  </button>
</div>
```

---

**All report CSS classes are production-ready and optimized for manufacturing dashboard use! 🎨**
