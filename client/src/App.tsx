import './App.css';
import Sidebar from './components/Sidebar';
import ChatHeader from './components/ChatHeader';
import ChatMessages from './components/ChatMessages';
import ChatInput from './components/ChatInput';
import ChatSettingsDrawer from './components/ChatSettingsDrawer';

import { useState } from 'react';

function App() {
  const [showSetting, setShowSetting] = useState(true);

  return (
    <div className="h-screen w-full flex overflow-hidden bg-bgGlobal p-4 text-text">
      <div className="flex-shrink-0 w-1/5 ">
        <Sidebar />
      </div>

      <div className="flex flex-col mx-6 flex-grow p-4 rounded-lg bg-bgCard">
        <ChatHeader />
        <div className="flex-grow overflow-y-auto">
          <ChatMessages />
        </div>
        <ChatInput />
      </div>

      {showSetting && (
        <div className="flex-shrink-0 w-1/4 p-4 mb-4 rounded-lg bg-bgCard">
          <ChatSettingsDrawer />
        </div>
      )}
    </div>
  );
}

export default App;
