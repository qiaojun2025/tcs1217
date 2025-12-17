import { Agent } from './types';

export const AGENTS: Agent[] = [
  {
    id: 'safety',
    name: '安全意识教练',
    description: '在Web3中保持安全：发现欺诈并避免风险',
    iconColor: 'bg-blue-500',
    icon: 'shield',
  },
  {
    id: 'web3',
    name: 'Web3 趋势雷达',
    description: '实时发现Web3趋势',
    iconColor: 'bg-cyan-400',
    icon: 'radar',
  },
  {
    id: 'token',
    name: '代币经济学设计师',
    description: '轻松设计完整的代币模型',
    iconColor: 'bg-orange-400',
    icon: 'coin',
  },
  {
    id: 'task_center',
    name: '任务中心',
    description: '为您的 Web3 社区增长设计和优化任务',
    iconColor: 'bg-green-400',
    icon: 'grid',
  },
];

// Predefined quick judgment questions to ensure stability
// In a real app, these could be fetched from a server.
export const QUICK_TASKS_DATA = [
  {
    imageUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&q=80',
    options: ['狗', '猫'],
    correct: '狗'
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=400&q=80',
    options: ['狗', '猫'],
    correct: '猫'
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1503376763036-066120622c74?w=400&q=80',
    options: ['汽车', '自行车'],
    correct: '汽车'
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1485965120184-e224f723d621?w=400&q=80',
    options: ['电脑', '手机'],
    correct: '电脑'
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=400&q=80',
    options: ['人', '雕塑'],
    correct: '人'
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=400&q=80',
    options: ['衬衫', '裤子'],
    correct: '衬衫'
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&q=80',
    options: ['猫', '老虎'],
    correct: '猫'
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=400&q=80',
    options: ['飞机', '汽车'],
    correct: '汽车'
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80',
    options: ['耳机', '音响'],
    correct: '耳机'
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400&q=80',
    options: ['狗', '狼'],
    correct: '狗'
  }
];

export const COLLECTION_TARGETS = [
  'person', 'cup', 'cell phone', 'keyboard', 'bottle', 
  'laptop', 'mouse', 'book', 'chair', 'potted plant'
];

export const TARGET_TRANSLATIONS: Record<string, string> = {
  'person': '人',
  'cup': '杯子',
  'cell phone': '手机',
  'keyboard': '键盘',
  'bottle': '瓶子',
  'laptop': '笔记本电脑',
  'mouse': '鼠标',
  'book': '书',
  'chair': '椅子',
  'potted plant': '盆栽'
};