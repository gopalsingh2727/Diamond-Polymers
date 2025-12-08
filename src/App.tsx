import './App.css';
import { useState, useEffect } from 'react';
import { HashRouter } from "react-router-dom"; // ✅ Use HashRouter
import { useSelector, useDispatch } from 'react-redux';
import MainRount from './componest/MainRounts/MainRount';
import { InfinityLoader } from './components/InfinityLoader';
import ChatWidget from './components/chat/ChatWidget';
import UniversalSearchModal from './components/UniversalSearch/UniversalSearchModal';

// Chat widget wrapper to show only when authenticated
const AuthenticatedChatWidget = () => {
  const isAuthenticated = useSelector((state: any) => state.auth?.isAuthenticated);

  if (!isAuthenticated) return null;
  return <ChatWidget />;
};

// WebSocket auto-connect component
const WebSocketManager = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state: any) => state.auth?.isAuthenticated);
  const token = useSelector((state: any) => state.auth?.token);
  const { isConnected } = useSelector((state: any) => state.websocket || {});

  useEffect(() => {
    if (isAuthenticated && token && !isConnected) {
      const wsUrl = import.meta.env.VITE_WEBSOCKET_URL || 'wss://zg3qlhwg88.execute-api.ap-south-1.amazonaws.com/dev';

      console.log('🔌 Connecting to WebSocket:', wsUrl);

      dispatch({
        type: 'websocket/connect',
        payload: {
          url: wsUrl,
          token,
          platform: 'electron'
        }
      });
    }
  }, [isAuthenticated, token, isConnected, dispatch]);

  return null;
};

// this last project
function App() {
  const [isLoading, setIsLoading] = useState(true);

  if (isLoading) {
    return (
      <InfinityLoader
        onLoadComplete={() => setIsLoading(false)}
        minDuration={2500}
      />
    );
  }

  return (
    <HashRouter>
      <WebSocketManager />
      <MainRount />
      <AuthenticatedChatWidget />
      <UniversalSearchModal />
    </HashRouter>
  );
}

export default App;