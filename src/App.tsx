import './App.css';
import { useState } from 'react';
import { HashRouter } from "react-router-dom";
import { useSelector } from 'react-redux';
import MainRount from './componest/MainRounts/MainRount';
import { InfinityLoader } from './components/InfinityLoader';

// Direct imports for Electron app
import ChatWidget from './components/chat/ChatWidget';
import UniversalSearchModal from './components/UniversalSearch/UniversalSearchModal';
import WebSocketManager from './components/WebSocketManager';
import BranchSwitchingLoader from './componest/BranchSwitchingLoader';

// Chat widget wrapper to show only when authenticated
const AuthenticatedChatWidget = () => {
  const isAuthenticated = useSelector((state: any) => state.auth?.isAuthenticated);

  if (!isAuthenticated) return null;
  return <ChatWidget />;
};

function App() {
  const [isLoading, setIsLoading] = useState(true);

  if (isLoading) {
    return (
      <InfinityLoader
        onLoadComplete={() => setIsLoading(false)}
        minDuration={100}
      />
    );
  }

  return (
    <HashRouter>
      <WebSocketManager />
      <BranchSwitchingLoader />
      <MainRount />
      <AuthenticatedChatWidget />
      <UniversalSearchModal />
    </HashRouter>
  );
}

export default App;
