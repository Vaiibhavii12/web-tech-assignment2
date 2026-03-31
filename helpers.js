import { format, formatDistanceToNow, isPast, isToday, isTomorrow } from 'date-fns';

export const PRIORITY_CONFIG = {
  critical: {
    label: 'Critical', color: 'text-red-400', bg: 'bg-red-500/15', border: 'border-red-500/30',
    dot: 'bg-red-500', icon: '🔥'
  },
  high: {
    label: 'High', color: 'text-orange-400', bg: 'bg-orange-500/15', border: 'border-orange-500/30',
    dot: 'bg-orange-500', icon: '⚡'
  },
  medium: {
    label: 'Medium', color: 'text-yellow-400', bg: 'bg-yellow-500/15', border: 'border-yellow-500/30',
    dot: 'bg-yellow-500', icon: '📌'
  },
  low: {
    label: 'Low', color: 'text-green-400', bg: 'bg-green-500/15', border: 'border-green-500/30',
    dot: 'bg-green-500', icon: '🌿'
  }
};

export const STATUS_CONFIG = {
  'todo': {
    label: 'To Do', color: 'text-slate-400', bg: 'bg-slate-500/15', border: 'border-slate-500/30',
    dot: 'bg-slate-400', icon: '○'
  },
  'in-progress': {
    label: 'In Progress', color: 'text-blue-400', bg: 'bg-blue-500/15', border: 'border-blue-500/30',
    dot: 'bg-blue-400', icon: '◑'
  },
  'review': {
    label: 'Review', color: 'text-purple-400', bg: 'bg-purple-500/15', border: 'border-purple-500/30',
    dot: 'bg-purple-400', icon: '◕'
  },
  'done': {
    label: 'Done', color: 'text-green-400', bg: 'bg-green-500/15', border: 'border-green-500/30',
    dot: 'bg-green-400', icon: '●'
  }
};

export const PROJECT_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
  '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#06b6d4', '#3b82f6', '#a855f7', '#10b981'
];

export const PROJECT_ICONS = [
  '🚀', '💼', '🎯', '🔥', '⚡', '🌟', '💡', '🎨',
  '📱', '🛠️', '🏆', '🌈', '🔮', '📊', '🎬', '🌙'
];

export const formatDate = (date) => {
  if (!date) return null;
  const d = new Date(date);
  if (isToday(d)) return 'Today';
  if (isTomorrow(d)) return 'Tomorrow';
  return format(d, 'MMM dd, yyyy');
};

export const formatRelative = (date) => {
  if (!date) return '';
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

export const isOverdue = (date, status) => {
  if (!date || status === 'done') return false;
  return isPast(new Date(date));
};

export const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

export const getAvatarColor = (name) => {
  const colors = [
    'from-violet-500 to-purple-600',
    'from-blue-500 to-cyan-600',
    'from-emerald-500 to-teal-600',
    'from-rose-500 to-pink-600',
    'from-orange-500 to-amber-600',
  ];
  if (!name) return colors[0];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};
