import { Routes, Route } from "react-router-dom";
import Menu from "./menu";

// Direct imports for Electron app
import IndexCreateRoute from '../../second/menu/create/routes/CreateRount';
import DayBook from "../../second/menu/Daybook/Daybook";
import OrderForm from "../../second/menu/CreateOders/CreateOders";
import IndexAllOders from "../../second/menu/Oders/indexAllOders";
import IndexEdit from "../../second/menu/Edit/EditRount/indexEdit";
import SystemSetting from "../../second/menu/SystemSetting/SystemSetting";
import Dispatch from "../../second/menu/Dispatch/Dispatch";
import Marketing from "../../second/menu/marketing/Marketing";
import Account from "../../second/menu/Account/Account";
import AccountInfo from "../../second/menu/Account/AccountInfo/AccountInfo";
import ReportDashboard from "../../../reports/ReportDashboard";
import ReportViewer from "../../second/menu/Reports/ReportViewer";
import InventoryDashboard from "../../second/menu/Inventory/InventoryDashboard";
import InventoryTransactions from "../../second/menu/Inventory/InventoryTransactions";
import CreateEmployee from "../../second/menu/SystemSetting/create/createEmployee/CreateEmployee";
import EditEmployeeList from "../../second/menu/Edit/EditEmployee/EditEmployeeList";
import PayrollDashboard from "../../second/menu/SystemSetting/Payroll/PayrollDashboard";
import PayrollSettings from "../../second/menu/SystemSetting/Payroll/PayrollSettings";
import { OrdersForward } from "../../second/menu/OrderForward";

function IndexMenuRoute() {
  return (
    <Routes>
      <Route path="/" element={<Menu />} />
      <Route path="indexcreateroute/*" element={<IndexCreateRoute />} />
      <Route path="daybook" element={<DayBook/>} />
      <Route path="inventory">
        <Route index element={<InventoryDashboard/>} />
        <Route path="transactions" element={<InventoryTransactions/>} />
      </Route>
      <Route path="orderform" element={<OrderForm/>} />
      <Route path="IndexAllOders" element={<IndexAllOders />} />
      <Route path="order-forward">
        <Route index element={<OrdersForward />} />
        <Route path="connections" element={<OrdersForward initialView="connections" />} />
        <Route path="myorders" element={<OrdersForward initialView="myorders" />} />
        <Route path="forwarded" element={<OrdersForward initialView="forwarded" />} />
        <Route path="received" element={<OrdersForward initialView="received" />} />
      </Route>
      <Route path="edit" element={<IndexEdit/>} />
      <Route path="SystemSetting" element={<SystemSetting/>} />
      <Route path="dispatch" element={<Dispatch/>} />
      <Route path="marketing" element={<Marketing/>} />
      <Route path="Account" element={<Account/>} />
      <Route path="AccountInfo" element={<AccountInfo/>} />
      <Route path="reports">
        <Route index element={<ReportDashboard/>} />
        <Route path="viewer" element={<ReportViewer/>} />
      </Route>
      <Route path="create-employee" element={<CreateEmployee/>} />
      <Route path="edit-employee" element={<EditEmployeeList/>} />
      <Route path="payroll" element={<PayrollDashboard/>} />
      <Route path="payroll-settings" element={<PayrollSettings/>} />
    </Routes>
  );
}

export default IndexMenuRoute;
