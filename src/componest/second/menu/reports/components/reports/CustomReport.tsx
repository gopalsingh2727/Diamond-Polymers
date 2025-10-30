import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { useState, useRef } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { DateRangeFilter, DateRange } from "../DateRangeFilter";
import { ExportButtons } from "../ExportButtons";
import * as XLSX from "xlsx";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { 
  Filter, 
  Download, 
  TrendingUp, 
  TrendingDown, 
  Activity,
  Zap,
  Package,
  DollarSign,
  Percent,
  Clock,
  AlertTriangle,
  CheckCircle,
  Settings,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  List
} from "lucide-react";
import { mockOrders, mockMachines, mockMaterials } from "../../lib/mockData";

// Report Type Options
type ReportType = 
  | 'machine-performance'
  | 'material-usage'
  | 'step-progress'
  | 'quality-analysis'
  | 'cost-analysis'
  | 'efficiency-trends'
  | 'wastage-analysis'
  | 'time-analysis';

// Visualization Type Options
type VisualizationType = 'table' | 'bar' | 'line' | 'pie';

export function CustomReport() {
  const reportRef = useRef<HTMLDivElement>(null);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date()
  });
  
  const [reportType, setReportType] = useState<ReportType>('machine-performance');
  const [visualizationType, setVisualizationType] = useState<VisualizationType>('table');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [machineTypeFilter, setMachineTypeFilter] = useState<string>('all');
  const [materialTypeFilter, setMaterialTypeFilter] = useState<string>('all');

  // Filter orders based on date range and filters
  const filteredOrders = mockOrders.filter(order => {
    const orderDate = new Date(order.createdAt);
    const matchesDate = orderDate >= dateRange.from && orderDate <= dateRange.to;
    const matchesStatus = statusFilter === 'all' || order.overallStatus === statusFilter;
    return matchesDate && matchesStatus;
  });

  // Generate report data based on selected report type
  const getReportData = () => {
    switch (reportType) {
      case 'machine-performance':
        return generateMachinePerformanceData();
      case 'material-usage':
        return generateMaterialUsageData();
      case 'step-progress':
        return generateStepProgressData();
      case 'quality-analysis':
        return generateQualityAnalysisData();
      case 'cost-analysis':
        return generateCostAnalysisData();
      case 'efficiency-trends':
        return generateEfficiencyTrendsData();
      case 'wastage-analysis':
        return generateWastageAnalysisData();
      case 'time-analysis':
        return generateTimeAnalysisData();
      default:
        return [];
    }
  };

  // Machine Performance Report Data
  const generateMachinePerformanceData = () => {
    const machineMap = new Map<string, any>();
    
    filteredOrders.forEach(order => {
      order.steps.forEach(step => {
        step.machines.forEach(machine => {
          const key = machine.machineName;
          if (!machineMap.has(key)) {
            machineMap.set(key, {
              machineName: machine.machineName,
              machineType: machine.machineType,
              totalOrders: 0,
              totalNetWeight: 0,
              totalWastage: 0,
              avgEfficiency: 0,
              totalCost: 0,
              completedCount: 0,
              efficiencySum: 0
            });
          }
          
          const data = machineMap.get(key);
          data.totalOrders += 1;
          data.totalNetWeight += machine.calculatedOutput.netWeight;
          data.totalWastage += machine.calculatedOutput.wastageWeight;
          data.totalCost += machine.calculatedOutput.totalCost;
          
          if (machine.status === 'completed') {
            data.completedCount += 1;
          }
          
          if (machine.calculatedOutput.efficiency > 0) {
            data.efficiencySum += machine.calculatedOutput.efficiency;
          }
        });
      });
    });

    return Array.from(machineMap.values()).map(data => ({
      ...data,
      avgEfficiency: data.efficiencySum > 0 ? (data.efficiencySum / data.totalOrders).toFixed(1) : 0,
      completionRate: ((data.completedCount / data.totalOrders) * 100).toFixed(1)
    }));
  };

  // Material Usage Report Data
  const generateMaterialUsageData = () => {
    const materialMap = new Map<string, any>();
    
    filteredOrders.forEach(order => {
      order.mixMaterial.forEach(material => {
        const key = material.name;
        if (!materialMap.has(key)) {
          materialMap.set(key, {
            materialName: material.name,
            materialType: material.type,
            totalPlanned: 0,
            totalUsed: 0,
            totalWastage: 0,
            avgEfficiency: 0,
            totalCost: 0,
            orderCount: 0,
            efficiencySum: 0
          });
        }
        
        const data = materialMap.get(key);
        data.totalPlanned += material.weight;
        data.totalUsed += material.weight;
        data.totalWastage += material.weight * 0.03; // Sample wastage
        data.totalCost += material.weight * 50; // Sample cost
        data.orderCount += 1;
        data.efficiencySum += 97; // Sample efficiency
      });
    });

    return Array.from(materialMap.values()).map(data => ({
      ...data,
      avgEfficiency: (data.efficiencySum / data.orderCount).toFixed(1)
    }));
  };

  // Step Progress Report Data
  const generateStepProgressData = () => {
    const stepMap = new Map<string, any>();
    
    filteredOrders.forEach(order => {
      order.steps.forEach((step, index) => {
        const key = `Step ${index + 1}`;
        if (!stepMap.has(key)) {
          stepMap.set(key, {
            stepName: key,
            totalOrders: 0,
            completed: 0,
            inProgress: 0,
            pending: 0,
            avgMachines: 0,
            totalMachines: 0
          });
        }
        
        const data = stepMap.get(key);
        data.totalOrders += 1;
        data.totalMachines += step.machines.length;
        
        if (step.stepStatus === 'completed') data.completed += 1;
        else if (step.stepStatus === 'in-progress') data.inProgress += 1;
        else data.pending += 1;
      });
    });

    return Array.from(stepMap.values()).map(data => ({
      ...data,
      avgMachines: (data.totalMachines / data.totalOrders).toFixed(1),
      completionRate: ((data.completed / data.totalOrders) * 100).toFixed(1)
    }));
  };

  // Quality Analysis Report Data
  const generateQualityAnalysisData = () => {
    const qualityData = filteredOrders.map(order => ({
      orderId: order.orderId,
      customerName: order.customerName,
      qualityScore: order.qualityScore || 0,
      defectsCount: 0,
      inspectionStatus: order.overallStatus === 'completed' ? 'passed' : 'pending',
      efficiency: order.realTimeData.overallEfficiency
    }));

    return qualityData;
  };

  // Cost Analysis Report Data
  const generateCostAnalysisData = () => {
    return filteredOrders.map(order => ({
      orderId: order.orderId,
      customerName: order.customerName,
      materialCost: order.realTimeData.totalNetWeight * 50,
      laborCost: order.steps.length * 100,
      overheadCost: 200,
      totalCost: (order.realTimeData.totalNetWeight * 50) + (order.steps.length * 100) + 200,
      netWeight: order.realTimeData.totalNetWeight,
      costPerKg: ((order.realTimeData.totalNetWeight * 50) + (order.steps.length * 100) + 200) / (order.realTimeData.totalNetWeight || 1)
    }));
  };

  // Efficiency Trends Report Data
  const generateEfficiencyTrendsData = () => {
    const dateMap = new Map<string, any>();
    
    filteredOrders.forEach(order => {
      const date = new Date(order.createdAt).toLocaleDateString();
      if (!dateMap.has(date)) {
        dateMap.set(date, {
          date,
          totalEfficiency: 0,
          orderCount: 0,
          totalWastage: 0,
          totalProduction: 0
        });
      }
      
      const data = dateMap.get(date);
      data.totalEfficiency += order.realTimeData.overallEfficiency;
      data.orderCount += 1;
      data.totalWastage += order.realTimeData.totalWastage;
      data.totalProduction += order.realTimeData.totalNetWeight;
    });

    return Array.from(dateMap.values()).map(data => ({
      ...data,
      avgEfficiency: (data.totalEfficiency / data.orderCount).toFixed(1)
    })).slice(-14); // Last 14 days
  };

  // Wastage Analysis Report Data
  const generateWastageAnalysisData = () => {
    return filteredOrders.map(order => ({
      orderId: order.orderId,
      customerName: order.customerName,
      totalNetWeight: order.realTimeData.totalNetWeight,
      totalWastage: order.realTimeData.totalWastage,
      wastagePercentage: order.realTimeData.totalNetWeight > 0 
        ? ((order.realTimeData.totalWastage / (order.realTimeData.totalNetWeight + order.realTimeData.totalWastage)) * 100).toFixed(2)
        : 0,
      efficiency: order.realTimeData.overallEfficiency,
      priority: order.priority
    }));
  };

  // Time Analysis Report Data
  const generateTimeAnalysisData = () => {
    return filteredOrders.map(order => {
      const created = new Date(order.createdAt);
      const started = order.actualStartDate ? new Date(order.actualStartDate) : null;
      const completed = order.actualEndDate ? new Date(order.actualEndDate) : null;
      
      const daysToStart = started ? Math.ceil((started.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)) : 0;
      const daysToComplete = completed && started 
        ? Math.ceil((completed.getTime() - started.getTime()) / (1000 * 60 * 60 * 24)) 
        : 0;

      return {
        orderId: order.orderId,
        customerName: order.customerName,
        createdDate: created.toLocaleDateString(),
        startDate: started?.toLocaleDateString() || 'Not started',
        completedDate: completed?.toLocaleDateString() || 'Not completed',
        daysToStart,
        daysToComplete,
        totalDays: daysToStart + daysToComplete,
        status: order.overallStatus
      };
    });
  };

  const reportData = getReportData();

  // Get report title and description
  const getReportInfo = () => {
    const info: Record<ReportType, { title: string; description: string; icon: any }> = {
      'machine-performance': {
        title: 'Machine Performance Report',
        description: 'Analyze machine efficiency, production output, and utilization',
        icon: Settings
      },
      'material-usage': {
        title: 'Material Usage Report',
        description: 'Track material consumption, wastage, and costs',
        icon: Package
      },
      'step-progress': {
        title: 'Step Progress Report',
        description: 'Monitor production step completion and bottlenecks',
        icon: Activity
      },
      'quality-analysis': {
        title: 'Quality Analysis Report',
        description: 'Quality scores, defects, and inspection status',
        icon: CheckCircle
      },
      'cost-analysis': {
        title: 'Cost Analysis Report',
        description: 'Detailed cost breakdown and profitability analysis',
        icon: DollarSign
      },
      'efficiency-trends': {
        title: 'Efficiency Trends Report',
        description: 'Production efficiency patterns over time',
        icon: TrendingUp
      },
      'wastage-analysis': {
        title: 'Wastage Analysis Report',
        description: 'Material wastage tracking and reduction opportunities',
        icon: AlertTriangle
      },
      'time-analysis': {
        title: 'Time Analysis Report',
        description: 'Production timeline and duration analysis',
        icon: Clock
      }
    };

    return info[reportType];
  };

  const reportInfo = getReportInfo();
  const ReportIcon = reportInfo.icon;

  // Calculate summary metrics
  const calculateSummaryMetrics = () => {
    if (reportType === 'machine-performance') {
      const data = reportData as any[];
      return {
        totalMachines: data.length,
        avgEfficiency: data.length > 0 
          ? (data.reduce((sum, m) => sum + parseFloat(m.avgEfficiency || 0), 0) / data.length).toFixed(1)
          : 0,
        totalProduction: data.reduce((sum, m) => sum + m.totalNetWeight, 0).toFixed(0),
        totalWastage: data.reduce((sum, m) => sum + m.totalWastage, 0).toFixed(0)
      };
    } else if (reportType === 'material-usage') {
      const data = reportData as any[];
      return {
        totalMaterials: data.length,
        totalUsed: data.reduce((sum, m) => sum + m.totalUsed, 0).toFixed(0),
        totalWastage: data.reduce((sum, m) => sum + m.totalWastage, 0).toFixed(0),
        avgEfficiency: data.length > 0 
          ? (data.reduce((sum, m) => sum + parseFloat(m.avgEfficiency || 0), 0) / data.length).toFixed(1)
          : 0
      };
    } else if (reportType === 'cost-analysis') {
      const data = reportData as any[];
      return {
        totalOrders: data.length,
        totalCost: data.reduce((sum, o) => sum + o.totalCost, 0).toFixed(0),
        avgCostPerOrder: data.length > 0 
          ? (data.reduce((sum, o) => sum + o.totalCost, 0) / data.length).toFixed(0)
          : 0,
        avgCostPerKg: data.length > 0 
          ? (data.reduce((sum, o) => sum + o.costPerKg, 0) / data.length).toFixed(2)
          : 0
      };
    }
    return null;
  };

  const summaryMetrics = calculateSummaryMetrics();

  // Export to Excel
  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(reportData);
    XLSX.utils.book_append_sheet(wb, ws, reportInfo.title.substring(0, 30));
    XLSX.writeFile(wb, `${reportInfo.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Print
  const handlePrint = () => {
    window.print();
  };

  // Render visualization
  const renderVisualization = () => {
    if (visualizationType === 'table') {
      return renderTable();
    } else if (visualizationType === 'bar') {
      return renderBarChart();
    } else if (visualizationType === 'line') {
      return renderLineChart();
    } else if (visualizationType === 'pie') {
      return renderPieChart();
    }
  };

  // Render Table
  const renderTable = () => {
    if (reportData.length === 0) {
      return (
        <div className="text-center py-12 text-slate-500">
          No data available for the selected filters
        </div>
      );
    }

    const columns = Object.keys(reportData[0]);

    return (
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col}>
                  {col.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {reportData.map((row: any, idx) => (
              <TableRow key={idx}>
                {columns.map((col) => (
                  <TableCell key={col}>
                    {typeof row[col] === 'number' && col.includes('efficiency')
                      ? `${row[col]}%`
                      : typeof row[col] === 'number'
                      ? row[col].toLocaleString()
                      : row[col]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  // Render Bar Chart
  const renderBarChart = () => {
    if (reportData.length === 0) return null;

    const data = reportData.slice(0, 10); // Top 10 items
    const keys = Object.keys(data[0]);
    const labelKey = keys[0];
    const valueKey = keys.find(k => typeof data[0][k] === 'number' && !k.includes('Count')) || keys[1];

    return (
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey={labelKey} stroke="#64748b" />
          <YAxis stroke="#64748b" />
          <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0' }} />
          <Legend />
          <Bar dataKey={valueKey} fill="#3b82f6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  // Render Line Chart
  const renderLineChart = () => {
    if (reportData.length === 0) return null;

    const data = reportData;
    const keys = Object.keys(data[0]);
    const labelKey = keys[0];
    const valueKey = keys.find(k => typeof data[0][k] === 'number') || keys[1];

    return (
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey={labelKey} stroke="#64748b" />
          <YAxis stroke="#64748b" />
          <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0' }} />
          <Legend />
          <Line type="monotone" dataKey={valueKey} stroke="#3b82f6" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  // Render Pie Chart
  const renderPieChart = () => {
    if (reportData.length === 0) return null;

    const data = reportData.slice(0, 6); // Top 6 items
    const keys = Object.keys(data[0]);
    const labelKey = keys[0];
    const valueKey = keys.find(k => typeof data[0][k] === 'number') || keys[1];

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

    const pieData = data.map((item: any, index) => ({
      name: item[labelKey],
      value: parseFloat(item[valueKey]) || 0,
      color: COLORS[index % COLORS.length]
    }));

    return (
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={120}
            fill="#8884d8"
            dataKey="value"
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="space-y-6" ref={reportRef}>
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ReportIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-slate-900">{reportInfo.title}</h2>
              <p className="text-slate-600">{reportInfo.description}</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <ExportButtons onExportExcel={handleExportExcel} onPrint={handlePrint} />
            <DateRangeFilter onDateRangeChange={setDateRange} />
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <Select value={reportType} onValueChange={(value) => setReportType(value as ReportType)}>
            <SelectTrigger>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                <SelectValue placeholder="Select Report Type" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="machine-performance">Machine Performance</SelectItem>
              <SelectItem value="material-usage">Material Usage</SelectItem>
              <SelectItem value="step-progress">Step Progress</SelectItem>
              <SelectItem value="quality-analysis">Quality Analysis</SelectItem>
              <SelectItem value="cost-analysis">Cost Analysis</SelectItem>
              <SelectItem value="efficiency-trends">Efficiency Trends</SelectItem>
              <SelectItem value="wastage-analysis">Wastage Analysis</SelectItem>
              <SelectItem value="time-analysis">Time Analysis</SelectItem>
            </SelectContent>
          </Select>

          <Select value={visualizationType} onValueChange={(value) => setVisualizationType(value as VisualizationType)}>
            <SelectTrigger>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                <SelectValue placeholder="Visualization" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="table">
                <div className="flex items-center gap-2">
                  <List className="w-4 h-4" />
                  Table
                </div>
              </SelectItem>
              <SelectItem value="bar">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Bar Chart
                </div>
              </SelectItem>
              <SelectItem value="line">
                <div className="flex items-center gap-2">
                  <LineChartIcon className="w-4 h-4" />
                  Line Chart
                </div>
              </SelectItem>
              <SelectItem value="pie">
                <div className="flex items-center gap-2">
                  <PieChartIcon className="w-4 h-4" />
                  Pie Chart
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                <SelectValue placeholder="Filter by Status" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={() => {
            setStatusFilter('all');
            setMachineTypeFilter('all');
            setMaterialTypeFilter('all');
          }}>
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Summary Metrics */}
      {summaryMetrics && (
        <div className="grid gap-4 md:grid-cols-4">
          {Object.entries(summaryMetrics).map(([key, value]) => (
            <Card key={key}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </CardTitle>
                <Activity className="h-4 w-4 text-slate-600" />
              </CardHeader>
              <CardContent>
                <div className="text-slate-900">{value}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>Report Data</CardTitle>
          <CardDescription>
            Showing {reportData.length} record{reportData.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderVisualization()}
        </CardContent>
      </Card>
    </div>
  );
}
