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
    <div className="h-screen w-full flex overflow-hidden bg-bgGlobal">
      <div className="flex-shrink-0 w-1/5 bg-focus m-6 text-white">
        <Sidebar />
      </div>

      <div className="flex flex-col m-6 flex-grow bg-focus">
        <ChatHeader />
        <div className="flex-grow overflow-y-auto">
          <ChatMessages />
        </div>
        <ChatInput />
      </div>

      {showSetting && (
        <div className="flex-shrink-0 w-1/4 m-6 bg-focus">
          <ChatSettingsDrawer />
        </div>
      )}
    </div>
  );
}

export default App;
