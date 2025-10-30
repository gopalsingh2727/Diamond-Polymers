# Custom Report Builder

## Overview

The Custom Report Builder is a powerful, flexible reporting tool that allows users to create dynamic reports based on your MongoDB data models (Machine, Order, MaterialType).

## Features

### 📊 **7 Report Types**

1. **Machine Performance**
   - Machine utilization rates
   - Efficiency tracking
   - Wastage analysis
   - Production totals
   - Downtime monitoring
   - Quality pass rates

2. **Order Analysis**
   - Total orders count
   - Completion rate
   - Average efficiency
   - Total weight produced
   - Total wastage
   - On-time delivery percentage

3. **Material Usage**
   - Total material consumption
   - Wastage rate percentage
   - Material efficiency
   - Cost per KG analysis
   - Planned vs actual variance

4. **Efficiency Trends**
   - Daily efficiency tracking
   - Weekly efficiency trends
   - Machine-to-machine comparison
   - Operator performance metrics

5. **Quality Control**
   - Inspection status distribution
   - Average quality scores
   - Defect rate tracking
   - Quality pass rate

6. **Step Progress**
   - Step completion rates
   - Average step duration
   - Bottleneck identification
   - Machines per step analysis

7. **Custom Formula Report**
   - Build your own formulas
   - Custom calculations
   - Dynamic metrics

### 🎯 **Flexible Metric Selection**

Each report type has specific metrics you can select:
- Choose multiple metrics to display
- Metrics update dynamically based on filters
- Summary cards show key values

### 🔍 **Advanced Filtering**

**Date Range Filter**
- Select custom date ranges
- Quick presets (last 7/30/90 days)
- Filter all data by date

**Status Filter**
- All statuses
- Pending
- In Progress
- Dispatched
- Completed
- Cancelled
- Wait for Approval

**Priority Filter**
- All priorities
- Low
- Normal
- High
- Urgent

**Machine Type Filter**
- All types
- Printing Machine
- Cutting Machine
- Extruder
- Mixer
- Sealing Machine

### 📈 **Visualization Options**

**Chart Types**
1. **Bar Chart** - Best for comparing values across categories
2. **Pie Chart** - Best for showing proportions
3. **Line Chart** - Best for trends over time

**Group By Options**
1. **Status** - Group data by order status
2. **Priority** - Group by priority level
3. **Material** - Group by material type
4. **Efficiency** - Group by efficiency ranges

### 📤 **Export Capabilities**

**Excel Export**
- Two sheets: Metrics & Data
- Metrics sheet contains selected metrics with values
- Data sheet contains detailed order data
- Filename includes report type and date

**Print**
- Print-friendly layout
- All charts and tables included
- Clean formatting

## Usage Guide

### Step 1: Select Report Type
Choose from 7 different report types based on what you want to analyze.

### Step 2: Choose Metrics
Select the specific metrics you want to see in your report. Each report type has different available metrics.

### Step 3: Apply Filters
Filter your data by:
- Date range
- Order status
- Priority level
- Machine type

### Step 4: Configure Visualization
Choose:
- How to group your data (status, priority, material, efficiency)
- Chart type (bar, pie, line)

### Step 5: Generate Report
Click "Generate Report" to see:
- Summary metric cards
- Interactive charts
- Detailed data table

### Step 6: Export (Optional)
Export to Excel or print the report for offline use.

## Use Cases

### **Production Manager**
**Goal**: Track overall production efficiency

1. Select "Efficiency Trends" report
2. Choose metrics: Daily Efficiency, Weekly Efficiency, Machine Comparison
3. Set date range to last 30 days
4. Group by: Efficiency
5. Chart type: Line Chart
6. Generate and analyze trends

### **Quality Control Team**
**Goal**: Monitor quality metrics

1. Select "Quality Control" report
2. Choose metrics: Quality Score, Defect Rate, Pass Rate
3. Filter by: All statuses
4. Group by: Status
5. Chart type: Bar Chart
6. Identify areas needing improvement

### **Operations Director**
**Goal**: Identify production bottlenecks

1. Select "Step Progress" report
2. Choose metrics: Completion Rate, Avg Duration, Bottlenecks
3. Set date range to last 7 days
4. Group by: Status
5. Chart type: Bar Chart
6. Find and address delays

### **Material Manager**
**Goal**: Optimize material usage

1. Select "Material Usage" report
2. Choose metrics: Total Consumption, Wastage Rate, Efficiency
3. Filter by material type
4. Group by: Material
5. Chart type: Pie Chart
6. Reduce wastage in problematic materials

## Data Structure

### Metrics Summary Cards
Each selected metric displays:
- Metric label
- Calculated value
- Context (based on X orders)

### Visualization Chart
Displays data grouped by your selection:
- Interactive tooltips
- Color-coded for clarity
- Responsive design

### Data Table
Shows detailed order information:
- Order ID
- Customer name
- Status and priority
- Material type
- Net weight, wastage, efficiency
- Creation date

Maximum 20 orders displayed (top results)

## Future Enhancements

### Planned Features
1. **Save Custom Reports** - Save report configurations for reuse
2. **Scheduled Reports** - Auto-generate and email reports
3. **More Chart Types** - Heatmaps, scatter plots, gauges
4. **Custom Formulas** - User-defined calculations
5. **Drill-Down** - Click charts to see detailed data
6. **Comparison Mode** - Compare multiple time periods
7. **Alerts** - Set thresholds and get notifications
8. **Dashboard Widgets** - Add reports to main dashboard

### Integration Plans
1. **Redux Integration** - Connect to real API data
2. **Real-time Updates** - Auto-refresh data
3. **Machine Table Data** - Pull from dynamic table configs
4. **Formula Support** - Use machine-defined formulas
5. **Multi-branch** - Compare across branches

## Technical Details

### Component Location
`/components/reports/CustomReportBuilder.tsx`

### Dependencies
- Recharts (charts)
- XLSX (Excel export)
- Shadcn UI components
- Lucide icons

### Data Source
Currently uses mock data from `/lib/mockData.ts`
Ready to integrate with Redux store

### State Management
Local state for:
- Report configuration
- Filters
- Selected metrics
- Visualization options

## Customization

### Adding New Report Types
1. Add to `REPORT_TYPES` array
2. Define metrics in `AVAILABLE_METRICS`
3. Add calculation logic in `calculateMetrics()`
4. Update export data mapping

### Adding New Metrics
1. Add to appropriate report type in `AVAILABLE_METRICS`
2. Add calculation in `calculateMetrics()`
3. Format display value as needed

### Adding New Filters
1. Add filter options array
2. Add Select component in filters section
3. Apply filter in `filteredOrders` logic
4. Update export to include filter

## Best Practices

1. **Start Simple** - Choose 2-3 metrics for clarity
2. **Use Appropriate Charts** - Bar for comparisons, Pie for proportions, Line for trends
3. **Filter Data** - Don't analyze everything at once
4. **Export Regularly** - Keep historical records
5. **Group Meaningfully** - Choose grouping that answers your questions
6. **Review Trends** - Look at data over time, not just snapshots

## Troubleshooting

**No data showing?**
- Check date range filters
- Verify status/priority filters aren't too restrictive
- Ensure orders exist in selected time period

**Chart not displaying?**
- Verify data exists for selected grouping
- Try different chart type
- Check if groupBy has valid data

**Export not working?**
- Ensure you've generated the report first
- Check browser allows downloads
- Try different export format

## Support

For questions or issues with the Custom Report Builder:
1. Check this documentation
2. Review the main Reports README
3. Check component code comments
4. Test with different configurations

---

**The Custom Report Builder gives you complete flexibility to analyze your manufacturing data exactly how you need it! 🎯**
