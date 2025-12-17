import React from 'react';
import { Agent } from '../types';
import { Shield, Radio, Coins, LayoutGrid, User, Smile, Clock } from 'lucide-react';
import { AGENTS } from '../constants';

interface AgentListProps {
  onSelectAgent: (agentId: string) => void;
}

const AgentList: React.FC<AgentListProps> = ({ onSelectAgent }) => {
  
  const getIcon = (iconName: string, className: string) => {
    const props = { className: "w-8 h-8 text-white" };
    switch (iconName) {
      case 'shield': return <Shield {...props} />;
      case 'radar': return <Radio {...props} />;
      case 'coin': return <Coins {...props} />;
      case 'grid': return <LayoutGrid {...props} />;
      default: return <Shield {...props} />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#f2f2f6]">
      {/* Header */}
      <div className="pt-6 pb-4 px-6 bg-white border-b border-gray-200">
        <div className="flex justify-between items-center mb-2">
          <div className="text-sm text-blue-500 font-medium">智能体</div>
          <div className="text-gray-400"><Clock size={20} /></div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Web3 中心</h1>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {AGENTS.map((agent) => (
          <div 
            key={agent.id}
            onClick={() => onSelectAgent(agent.id)}
            className="flex items-start p-4 bg-white rounded-2xl active:bg-gray-50 transition-colors cursor-pointer"
          >
            <div className={`flex-shrink-0 w-14 h-14 rounded-2xl ${agent.iconColor} flex items-center justify-center mr-4 shadow-sm`}>
              {getIcon(agent.icon, "")}
            </div>
            <div className="flex-1 pt-1">
              <h2 className="text-xl font-semibold text-gray-900 mb-1">{agent.name}</h2>
              <p className="text-gray-500 text-sm leading-relaxed">{agent.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Nav Mock */}
      <div className="h-16 bg-white border-t border-gray-200 flex justify-around items-center px-6 pb-2">
        <div className="flex flex-col items-center justify-center text-blue-500">
          <LayoutGrid size={24} />
        </div>
        <div className="flex flex-col items-center justify-center text-gray-300">
           <Smile size={24} />
        </div>
        <div className="flex flex-col items-center justify-center text-gray-300">
           <User size={24} />
        </div>
      </div>
    </div>
  );
};

export default AgentList;