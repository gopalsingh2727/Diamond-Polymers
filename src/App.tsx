import './App.css';
import { useState } from 'react';
import { HashRouter } from "react-router-dom"; // ✅ Use HashRouter
import { useSelector } from 'react-redux';
import MainRount from './componest/MainRounts/MainRount';
import { InfinityLoader } from './components/InfinityLoader';
import ChatWidget from './components/chat/ChatWidget';

// Chat widget wrapper to show only when authenticated
const AuthenticatedChatWidget = () => {
  const isAuthenticated = useSelector((state: any) => state.auth?.isAuthenticated);

  if (!isAuthenticated) return null;
  return <ChatWidget />;
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
      <MainRount />
      <AuthenticatedChatWidget />
    </HashRouter>
  );
}

export default App;