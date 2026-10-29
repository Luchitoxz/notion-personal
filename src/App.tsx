import React from 'react';
import { WorkspaceProvider } from './store/useWorkspace';
import { Sidebar } from './components/Sidebar/Sidebar';
import { Editor } from './components/Editor/Editor';

export const App: React.FC = () => {
  return (
    <WorkspaceProvider>
      <div className="flex h-screen w-screen overflow-hidden bg-white dark:bg-[#191919] text-[#37352f] dark:text-[#e6e6e5]">
        <Sidebar />
        <Editor />
      </div>
    </WorkspaceProvider>
  );
};

export default App;
