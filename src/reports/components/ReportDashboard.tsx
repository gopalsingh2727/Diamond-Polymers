

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./pure";
import { ProductionReport } from "./reports/ProductionReport";
import { MachineReport } from "./reports/MachineReport";
import { CustomerReport } from "./reports/CustomerReport";
import { OverviewReport } from "./reports/OverviewReport";
import { OrdersReport } from "./reports/OrdersReport";
import { CustomReportBuilder } from "./reports/CustomReportBuilder";
import { SimpleBranchSelector } from "./SimpleBranchSelector";
import '../styles/report-builder.css'
import { 
  BarChart3, 
  Settings, 
  Users,
  LayoutDashboard,
  ClipboardList,
  Filter
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../../../../store";
import { fetchBranches } from "../../../../redux/Branch/BranchActions";
import '../styles/index.css';
import { BackButton } from "../../../../allCompones/BackButton";
export function ReportDashboards() {
  const [activeTab, setActiveTab] = useState("overview");
  const dispatch = useDispatch<AppDispatch>();

  // Get selected branch from main app state
  const { userData } = useSelector((state: RootState) => state.auth);
  const { branches } = useSelector((state: RootState) => state.branches);

  // Check user role
  const isAdmin = userData?.role === 'admin';
  const isManager = userData?.role === 'manager';

  // Find the selected branch
  const selectedBranchId = userData?.selectedBranch?._id || userData?.selectedBranch || localStorage.getItem("selectedBranch");
  const selectedBranch = selectedBranchId && selectedBranchId !== "all"
    ? branches?.find((b: any) => b._id === selectedBranchId || b.id === selectedBranchId)
    : null;

  useEffect(() => {
    dispatch(fetchBranches());
  }, [dispatch]);

  return (
    <div className="dashboard-container isolated-wrapper">
      <div className="containe-reports">
        {/* Header */}
        <div className="dashboard-header">
                     <BackButton/>
          <div className="flex flex-col gap-4">
       
            <div className="flex flex-col gap-2">
        
              <h1 className="text-slate-900">Manufacturing Reports & Analytics</h1> 
              <p className="text-slate-600">
                {selectedBranch
                  ? `${(selectedBranch as any).code || ''} - ${(selectedBranch as any).name} ${(selectedBranch as any).location ? `(${(selectedBranch as any).location})` : ''}`
                  : isAdmin ? 'Viewing all branches' : 'Branch not selected'
                }
              </p>
            </div>
            <div style={{ maxWidth: '400px' }}>
              <SimpleBranchSelector
                showAllOption={isAdmin}
              />
            </div>
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">
              <LayoutDashboard style={{ width: '1rem', height: '1rem' }} />
              <span className="hidden">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="orders">
              <ClipboardList style={{ width: '1rem', height: '1rem' }} />
              <span className="hidden">Orders</span>
            </TabsTrigger>
            <TabsTrigger value="production">
              <BarChart3 style={{ width: '1rem', height: '1rem' }} />
              <span className="hidden">Production</span>
            </TabsTrigger>
            <TabsTrigger value="machines">
              <Settings style={{ width: '1rem', height: '1rem' }} />
              <span className="hidden">Machines</span>
            </TabsTrigger>
            <TabsTrigger value="customers">
              <Users style={{ width: '1rem', height: '1rem' }} />
              <span className="hidden">Customers</span>
            </TabsTrigger>
            <TabsTrigger value="custom">
              <Filter style={{ width: '1rem', height: '1rem' }} />
              <span className="hidden">Custom</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OverviewReport />
          </TabsContent>

          <TabsContent value="orders">
            <OrdersReport />
          </TabsContent>

          <TabsContent value="production">
            <ProductionReport />
          </TabsContent>

          <TabsContent value="machines">
            <MachineReport />
          </TabsContent>

          <TabsContent value="customers">
            <CustomerReport />
          </TabsContent>

          <TabsContent value="custom">
            <CustomReportBuilder />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
