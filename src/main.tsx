import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { PostProvider } from './context/PostContext';
import { ChatProvider } from './context/ChatContext';
import { CallProvider } from './context/CallContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <PostProvider>
            <ChatProvider>
              <CallProvider>
                <App />
              </CallProvider>
            </ChatProvider>
          </PostProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  </StrictMode>,
);

