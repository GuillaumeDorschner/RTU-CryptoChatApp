import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { ChatContextProvider } from './ChatContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ChatContextProvider>
      <App />
    </ChatContextProvider>
  </StrictMode>,
);
