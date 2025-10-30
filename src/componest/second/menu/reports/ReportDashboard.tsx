import { Provider } from 'react-redux';
import store from './redux/store';
import { ReportDashboards } from "./components/ReportDashboard";
import './styles/IsolatedWrapper.css';
import './styles/index.css';


export default function App() {
  return (
    <Provider store={store}>
      <div id="report-dashboard-root" className="isolated-wrapper">
  
        <ReportDashboards />
      </div>
    </Provider>
  );
}