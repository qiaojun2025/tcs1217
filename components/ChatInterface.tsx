import React, { useState, useEffect, useRef } from 'react';
import { Agent, Message, MessageType, TaskType, TaskState, UserStats } from '../types';
import { QUICK_TASKS_DATA, COLLECTION_TARGETS, TARGET_TRANSLATIONS } from '../constants';
import { ChevronLeft, ArrowUp, ImageIcon, PieChart, CheckCircle2 } from 'lucide-react';
import { loadModel, detectObjects } from '../services/aiService';

interface ChatInterfaceProps {
  agent: Agent;
  onBack: () => void;
}

const USER_ID = 'user_' + Math.floor(Math.random() * 10000);
const USER_NAME = 'Guest';

const ChatInterface: React.FC<ChatInterfaceProps> = ({ agent, onBack }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [taskState, setTaskState] = useState<TaskState>({
    isActive: false,
    type: TaskType.NONE,
    currentRound: 0,
    score: 0,
    totalRounds: 10,
    history: []
  });
  
  // Persist stats in memory for this session
  const [stats, setStats] = useState<UserStats>({
    userId: USER_ID,
    username: USER_NAME,
    quickTasksCompleted: 0,
    collectionTasksCompleted: 0,
    quickScoreTotal: 0,
    collectionScoreTotal: 0
  });

  const [isModelLoading, setIsModelLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initial Welcome Message
  useEffect(() => {
    if (messages.length === 0) {
      if (agent.id === 'task_center') {
        addMessage('agent', MessageType.TEXT, `欢迎来到${agent.name}！\n我是你的任务助手。完成任务可以获取贡献度。\n\n请选择任务类型：`);
      } else {
        addMessage('agent', MessageType.TEXT, `欢迎来到${agent.name}！\n有什么可以帮您的吗？`);
      }
    }
  }, [agent]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addMessage = (sender: 'user' | 'agent', type: MessageType, content: string, taskData?: Message['taskData'], isLoading?: boolean) => {
    const id = Date.now().toString() + Math.random();
    const newMessage: Message = {
      id,
      sender,
      type,
      content,
      timestamp: Date.now(),
      taskData,
      isLoading
    };
    setMessages(prev => [...prev, newMessage]);
    return id;
  };

  const updateMessage = (id: string, updates: Partial<Message>) => {
    setMessages(prev => prev.map(msg => msg.id === id ? { ...msg, ...updates } : msg));
  };

  // --- Task Logic ---

  const startTask = async (type: TaskType) => {
    if (taskState.isActive) {
      addMessage('agent', MessageType.TEXT, '当前已有任务正在进行中，请先完成或放弃。');
      return;
    }

    if (type === TaskType.COLLECTION) {
      setIsModelLoading(true);
      const loadingMsgId = addMessage('agent', MessageType.SYSTEM, '正在加载AI视觉模型，请稍候...', undefined, true);
      try {
        await loadModel();
        setIsModelLoading(false);
        updateMessage(loadingMsgId, { isLoading: false });
        addMessage('agent', MessageType.SYSTEM, '模型加载完成！');
      } catch (e) {
        setIsModelLoading(false);
        updateMessage(loadingMsgId, { isLoading: false });
        addMessage('agent', MessageType.TEXT, '模型加载失败，请检查网络连接。');
        return;
      }
    }

    setTaskState({
      isActive: true,
      type: type,
      currentRound: 1,
      score: 0,
      totalRounds: 10,
      history: []
    });

    addMessage('user', MessageType.TEXT, type === TaskType.QUICK_JUDGMENT ? '开始快判任务' : '开始采集任务');
    
    // Trigger first round
    setTimeout(() => {
      if (type === TaskType.QUICK_JUDGMENT) {
        nextQuickTaskRound(1);
      } else {
        nextCollectionTaskRound(1);
      }
    }, 500);
  };

  const endTask = (finalScoreOverride?: number) => {
    const finalScore = finalScoreOverride !== undefined ? finalScoreOverride : taskState.score;
    const isQuick = taskState.type === TaskType.QUICK_JUDGMENT;
    
    // Update Stats
    setStats(prev => ({
      ...prev,
      quickTasksCompleted: prev.quickTasksCompleted + (isQuick ? 1 : 0),
      collectionTasksCompleted: prev.collectionTasksCompleted + (!isQuick ? 1 : 0),
      quickScoreTotal: prev.quickScoreTotal + (isQuick ? finalScore : 0),
      collectionScoreTotal: prev.collectionScoreTotal + (!isQuick ? finalScore : 0),
    }));

    // Generate Report
    const report = JSON.stringify({
      username: USER_NAME,
      timestamp: new Date().toLocaleString(),
      taskType: isQuick ? '快判任务' : '采集任务',
      score: finalScore,
      totalRounds: 10
    });

    addMessage('agent', MessageType.REPORT, report);
    
    setTaskState(prev => ({ ...prev, isActive: false, type: TaskType.NONE }));
  };

  // --- Quick Judgment Logic ---

  const nextQuickTaskRound = (round: number) => {
    if (round > 10) {
      endTask();
      return;
    }

    // Pick a random question deterministically based on round index for variety in this demo
    const questionIndex = (round - 1) % QUICK_TASKS_DATA.length;
    const question = QUICK_TASKS_DATA[questionIndex];

    addMessage('agent', MessageType.IMAGE_CHOICE, `第 ${round}/10 题：请判断图中的内容`, {
      imageUrl: question.imageUrl,
      options: question.options,
      correctOption: question.correct
    });
  };

  const handleQuickJudgment = (selectedOption: string, correctOption: string) => {
    const isCorrect = selectedOption === correctOption;
    const newScore = taskState.score + (isCorrect ? 10 : 0);
    const nextRound = taskState.currentRound + 1;
    
    setTaskState(prev => ({
      ...prev,
      score: newScore,
      currentRound: nextRound
    }));

    addMessage('user', MessageType.TEXT, `我选择：${selectedOption}`);
    addMessage('agent', MessageType.TEXT, isCorrect ? `✅ 回答正确！贡献度 +10` : `❌ 回答错误。`);

    setTimeout(() => {
      if (nextRound > 10) {
        endTask(newScore);
      } else {
        nextQuickTaskRound(nextRound);
      }
    }, 800);
  };

  // --- Collection Task Logic ---

  const nextCollectionTaskRound = (round: number) => {
    if (round > 10) {
      endTask();
      return;
    }
    
    // Random target
    const target = COLLECTION_TARGETS[Math.floor(Math.random() * COLLECTION_TARGETS.length)];
    const translatedTarget = TARGET_TRANSLATIONS[target] || target;

    addMessage('agent', MessageType.IMAGE_REQUEST, `第 ${round}/10 题：请拍摄或上传一张包含【${translatedTarget}】的照片`, {
      targetObject: target
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: string) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      
      addMessage('user', MessageType.TEXT, '已上传图片', { userImage: imageUrl }); // Placeholder text, actual image rendered below

      // Verify with AI
      const img = document.createElement('img');
      img.src = imageUrl;
      img.onload = async () => {
        const loadingMsgId = addMessage('agent', MessageType.SYSTEM, 'AI正在审核图片...', undefined, true);
        const predictions = await detectObjects(img);
        updateMessage(loadingMsgId, { isLoading: false });

        const isCorrect = predictions.includes(target);
        
        const newScore = taskState.score + (isCorrect ? 10 : 0);
        const nextRound = taskState.currentRound + 1;
        
        setTaskState(prev => ({
          ...prev,
          score: newScore,
          currentRound: nextRound
        }));

        const feedback = isCorrect 
          ? `✅ 审核通过！识别到了 ${TARGET_TRANSLATIONS[target] || target}。贡献度 +10` 
          : `❌ 审核未通过。AI识别到了: [${predictions.map(p => TARGET_TRANSLATIONS[p] || p).join(', ')}]，未发现 ${TARGET_TRANSLATIONS[target] || target}。`;
        
        addMessage('agent', MessageType.TEXT, feedback);

        setTimeout(() => {
          if (nextRound > 10) {
            endTask(newScore);
          } else {
            nextCollectionTaskRound(nextRound);
          }
        }, 1500);
      };
    }
  };

  const showStats = () => {
    addMessage('user', MessageType.TEXT, '查看我的统计');
    const totalScore = stats.quickScoreTotal + stats.collectionScoreTotal;
    const report = JSON.stringify({
      ...stats,
      totalScore
    });
    addMessage('agent', MessageType.REPORT, report);
  };

  // --- Render Helpers ---

  const renderBubble = (msg: Message) => {
    const isUser = msg.sender === 'user';
    return (
      <div key={msg.id} className={`flex w-full mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
        {!isUser && (
          <div className={`w-8 h-8 rounded-full flex-shrink-0 mr-2 flex items-center justify-center text-white text-xs ${agent.iconColor}`}>
             {agent.name[0]}
          </div>
        )}
        
        <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser 
            ? 'bg-blue-500 text-white rounded-br-none' 
            : 'bg-white text-gray-800 shadow-sm rounded-bl-none border border-gray-100'
        }`}>
          {/* Text Content */}
          {msg.type === MessageType.SYSTEM && (
             <div className="flex items-center text-sm text-gray-500 italic">
               {msg.isLoading ? (
                 <div className="animate-spin w-3 h-3 border-2 border-gray-500 border-t-transparent rounded-full mr-2"></div>
               ) : (
                 <div className="w-3 h-3 border-2 border-gray-300 rounded-full mr-2"></div>
               )}
               {msg.content}
             </div>
          )}

          {/* Render text for standard messages AND Task prompts */}
          {(msg.type === MessageType.TEXT || msg.type === MessageType.IMAGE_CHOICE || msg.type === MessageType.IMAGE_REQUEST) && (
            <p className="whitespace-pre-wrap">{msg.content}</p>
          )}

          {/* Quick Judgment Interface */}
          {msg.type === MessageType.IMAGE_CHOICE && msg.taskData && !taskState.history.find(h => h.round === taskState.currentRound && taskState.isActive) && (
            <div className="flex flex-col mt-2 space-y-3">
              <img src={msg.taskData.imageUrl} alt="Task" className="rounded-lg w-full h-48 object-cover bg-gray-200" />
              <div className="flex space-x-2">
                {msg.taskData.options?.map(opt => (
                  <button 
                    key={opt}
                    disabled={msg.id !== messages[messages.length - 1].id} // Only active for latest message
                    onClick={() => handleQuickJudgment(opt, msg.taskData?.correctOption || '')}
                    className="flex-1 bg-white border border-blue-500 text-blue-500 py-2 rounded-lg hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Collection Interface */}
          {msg.type === MessageType.IMAGE_REQUEST && msg.taskData && (
             <div className="mt-2">
                <input 
                  type="file" 
                  accept="image/*" 
                  capture="environment"
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={(e) => handleFileUpload(e, msg.taskData?.targetObject || '')}
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={msg.id !== messages[messages.length - 1].id || isModelLoading}
                  className="flex items-center justify-center w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
                >
                  <ImageIcon size={18} className="mr-2" />
                  {isModelLoading ? '模型加载中...' : '拍摄/上传照片'}
                </button>
             </div>
          )}

          {/* Report Card */}
          {msg.type === MessageType.REPORT && (
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-sm font-mono mt-1">
              {(() => {
                const data = JSON.parse(msg.content);
                return Object.entries(data).map(([k, v]) => (
                  <div key={k} className="flex justify-between border-b border-gray-200 last:border-0 py-1">
                    <span className="text-gray-500 capitalize">{k.replace(/([A-Z])/g, ' $1')}:</span>
                    <span className="font-bold text-gray-800">{String(v)}</span>
                  </div>
                ));
              })()}
            </div>
          )}
          
          {/* User Upload Preview */}
          {msg.taskData?.userImage && (
             <img src={msg.taskData.userImage} alt="Uploaded" className="mt-2 rounded-lg w-full max-h-48 object-cover" />
          )}

        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-[#f5f5f5]">
      {/* Header */}
      <div className="h-14 bg-white border-b border-gray-200 flex items-center px-4 justify-between sticky top-0 z-10">
        <button onClick={onBack} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full">
          <ChevronLeft size={24} />
        </button>
        <div className="font-semibold text-lg flex items-center">
           <div className={`w-3 h-3 rounded-full ${agent.iconColor} mr-2`}></div>
           {agent.name}
        </div>
        <div className="w-8"></div> {/* Spacer */}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map(renderBubble)}
        <div ref={messagesEndRef} />
      </div>

      {/* Task Controls (Sticky Bottom) */}
      <div className="bg-white border-t border-gray-200 p-4 safe-area-bottom">
        {!taskState.isActive && agent.id === 'task_center' ? (
          <div className="grid grid-cols-3 gap-3">
            <button 
              onClick={() => startTask(TaskType.QUICK_JUDGMENT)}
              className="flex flex-col items-center justify-center p-3 bg-blue-50 text-blue-600 rounded-xl active:scale-95 transition"
            >
              <CheckCircle2 className="mb-1" />
              <span className="text-xs font-medium">快判任务</span>
            </button>
            <button 
              onClick={() => startTask(TaskType.COLLECTION)}
              className="flex flex-col items-center justify-center p-3 bg-blue-50 text-blue-600 rounded-xl active:scale-95 transition"
            >
              <ImageIcon className="mb-1" />
              <span className="text-xs font-medium">采集任务</span>
            </button>
            <button 
              onClick={showStats}
              className="flex flex-col items-center justify-center p-3 bg-orange-50 text-orange-600 rounded-xl active:scale-95 transition"
            >
              <PieChart className="mb-1" />
              <span className="text-xs font-medium">我的统计</span>
            </button>
          </div>
        ) : taskState.isActive ? (
          <div className="flex items-center justify-between bg-blue-50 px-4 py-3 rounded-xl border border-blue-100">
            <div>
              <div className="text-xs text-blue-600 font-bold uppercase tracking-wider">
                {taskState.type === TaskType.QUICK_JUDGMENT ? '快判进行中' : '采集进行中'}
              </div>
              <div className="text-sm font-semibold text-gray-800">
                Round: {taskState.currentRound}/{taskState.totalRounds} | Score: {taskState.score}
              </div>
            </div>
            <button 
              onClick={() => {
                addMessage('user', MessageType.TEXT, '放弃任务');
                setTaskState(prev => ({ ...prev, isActive: false, type: TaskType.NONE }));
              }}
              className="px-3 py-1 bg-white text-red-500 text-xs font-medium border border-red-200 rounded-lg"
            >
              退出
            </button>
          </div>
        ) : null}
        
        {/* Mock Input (Visual Only) */}
        {!taskState.isActive && (
          <div className={`${agent.id === 'task_center' ? 'mt-4' : ''} relative`}>
             <input disabled type="text" placeholder={agent.id === 'task_center' ? "有什么可以帮你?" : "仅供演示，无法输入"} className="w-full bg-gray-100 text-gray-500 rounded-full py-2 px-4 focus:outline-none" />
             <div className="absolute right-2 top-1.5 p-1 bg-gray-300 rounded-full text-white">
               <ArrowUp size={16} />
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;