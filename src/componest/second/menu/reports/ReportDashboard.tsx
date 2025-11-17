// import { ReportDashboards } from "./components/ReportDashboard";
// import './styles/IsolatedWrapper.css';
// import './styles/index.css';

import { BackButton } from "../../../allCompones/BackButton"
import AnalyticsDashboard from "../../../Analytics/AnalyticsDashboard";


export default function App() {
  return (
    <div id="report-dashboard-root" className="isolated-wrapper">
      <BackButton/>
      <AnalyticsDashboard />
    </div>
  );
}