import React, { useState } from 'react';
import AgentList from './components/AgentList';
import ChatInterface from './components/ChatInterface';
import { AGENTS } from './constants';

const App: React.FC = () => {
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null);

  const activeAgent = AGENTS.find(a => a.id === activeAgentId);

  return (
    <div className="h-screen w-full bg-gray-100 flex justify-center">
      <div className="w-full max-w-md bg-white shadow-2xl h-full relative overflow-hidden flex flex-col">
        {activeAgent ? (
          <ChatInterface 
            agent={activeAgent} 
            onBack={() => setActiveAgentId(null)} 
          />
        ) : (
          <AgentList onSelectAgent={setActiveAgentId} />
        )}
      </div>
    </div>
  );
};

export default App;