import React, { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Target, Zap, Calendar, CheckCircle2 } from 'lucide-react';
import { projectsAPI, tasksAPI } from '../../utils/api';
import { PRIORITY_CONFIG, STATUS_CONFIG } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function AnalyticsPage() {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [pRes, tRes] = await Promise.all([projectsAPI.getAll(), tasksAPI.getAll()]);
        setProjects(pRes.data.projects || []);
        setTasks(tRes.data.tasks || []);
      } catch { toast.error('Failed to load analytics'); }
      finally { setLoading(false); }
    })();
  }, []);

  const totalTasks = tasks.length;
  const doneTasks = tasks.filter(t => t.status === 'done').length;
  const completionRate = totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const byStatus = {
    todo: tasks.filter(t => t.status === 'todo').length,
    'in-progress': tasks.filter(t => t.status === 'in-progress').length,
    review: tasks.filter(t => t.status === 'review').length,
    done: doneTasks,
  };

  const byPriority = {
    critical: tasks.filter(t => t.priority === 'critical').length,
    high: tasks.filter(t => t.priority === 'high').length,
    medium: tasks.filter(t => t.priority === 'medium').length,
    low: tasks.filter(t => t.priority === 'low').length,
  };

  const maxStatus = Math.max(...Object.values(byStatus), 1);
  const maxPriority = Math.max(...Object.values(byPriority), 1);

  if (loading) return (
    <div className="p-8 space-y-6">
      {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-40 rounded-2xl" />)}
    </div>
  );

  return (
    <div className="p-6 lg:p-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-white flex items-center gap-3">
          <BarChart3 size={28} className="text-brand-400" />Analytics
        </h1>
        <p className="text-[#8b9cc8] mt-1">Overview of your productivity and project health</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { icon: Target, label: 'Completion Rate', value: `${completionRate}%`, sub: 'overall', color: 'text-brand-400', bg: 'bg-brand-500/10' },
          { icon: CheckCircle2, label: 'Tasks Completed', value: doneTasks, sub: `of ${totalTasks}`, color: 'text-green-400', bg: 'bg-green-500/10' },
          { icon: Zap, label: 'Active Projects', value: projects.filter(p => p.status === 'active').length, sub: 'running now', color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { icon: Calendar, label: 'Overdue Tasks', value: tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done').length, sub: 'need action', color: 'text-red-400', bg: 'bg-red-500/10' },
        ].map((kpi, i) => (
          <div key={i} className="stat-card animate-slide-up" style={{ animationDelay: `${i * 0.07}s` }}>
            <div className={`w-11 h-11 rounded-xl ${kpi.bg} flex items-center justify-center`}>
              <kpi.icon size={22} className={kpi.color} />
            </div>
            <p className="text-3xl font-bold text-white font-mono">{kpi.value}</p>
            <div>
              <p className="text-sm font-medium text-white">{kpi.label}</p>
              <p className="text-xs text-[#4a5480]">{kpi.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Tasks by Status Bar Chart */}
        <div className="glass-card p-6">
          <h2 className="font-display text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <TrendingUp size={18} className="text-brand-400" />Tasks by Status
          </h2>
          <div className="space-y-4">
            {Object.entries(byStatus).map(([status, count]) => {
              const s = STATUS_CONFIG[status];
              const pct = totalTasks ? (count / maxStatus) * 100 : 0;
              return (
                <div key={status}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className={`text-sm font-medium flex items-center gap-1.5 ${s.color}`}>
                      <span className={`w-2 h-2 rounded-full ${s.dot}`} />{s.label}
                    </span>
                    <span className="text-sm font-mono text-white">{count}</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-surface-900">
                    <div className={`h-full rounded-full bar-animate ${s.dot}`}
                      style={{ width: `${pct}%`, transitionDelay: '0.2s' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tasks by Priority */}
        <div className="glass-card p-6">
          <h2 className="font-display text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <Zap size={18} className="text-brand-400" />Tasks by Priority
          </h2>
          <div className="space-y-4">
            {Object.entries(byPriority).map(([priority, count]) => {
              const p = PRIORITY_CONFIG[priority];
              const pct = (count / maxPriority) * 100;
              return (
                <div key={priority}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className={`text-sm font-medium ${p.color}`}>{p.icon} {p.label}</span>
                    <span className="text-sm font-mono text-white">{count}</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-surface-900">
                    <div className={`h-full rounded-full bar-animate ${p.dot}`}
                      style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Project Health */}
      <div className="glass-card p-6">
        <h2 className="font-display text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <Target size={18} className="text-brand-400" />Project Health
        </h2>
        {projects.length === 0 ? (
          <p className="text-[#4a5480] text-center py-8">No projects yet</p>
        ) : (
          <div className="space-y-4">
            {projects.map((proj, i) => (
              <div key={proj._id} className="flex items-center gap-4 animate-slide-up" style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                  style={{ background: `${proj.color}20` }}>
                  {proj.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-sm font-medium text-white truncate">{proj.title}</p>
                    <span className="text-xs font-mono text-white ml-2 flex-shrink-0">{proj.progress}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${proj.progress}%` }} />
                  </div>
                </div>
                <div className="flex-shrink-0 text-right">
                  <p className="text-xs text-[#4a5480]">{proj.completedTasks}/{proj.taskCount}</p>
                  <p className="text-xs text-[#4a5480]">tasks</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Donut-style completion visualizer */}
      <div className="grid sm:grid-cols-3 gap-4 mt-6">
        {[
          { label: 'To Do', value: byStatus.todo, total: totalTasks, color: '#94a3b8' },
          { label: 'In Progress', value: byStatus['in-progress'], total: totalTasks, color: '#60a5fa' },
          { label: 'Completed', value: byStatus.done, total: totalTasks, color: '#4ade80' },
        ].map((item, i) => {
          const pct = item.total ? Math.round((item.value / item.total) * 100) : 0;
          const circumference = 2 * Math.PI * 36;
          const dashOffset = circumference - (pct / 100) * circumference;
          return (
            <div key={i} className="glass-card p-6 flex flex-col items-center gap-3 animate-slide-up"
              style={{ animationDelay: `${i * 0.08}s` }}>
              <svg width="96" height="96" viewBox="0 0 96 96" className="-rotate-90">
                <circle cx="48" cy="48" r="36" fill="none" stroke="rgba(99,102,241,0.1)" strokeWidth="8" />
                <circle cx="48" cy="48" r="36" fill="none" stroke={item.color} strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 1s ease', filter: `drop-shadow(0 0 6px ${item.color}60)` }} />
                <text x="48" y="48" textAnchor="middle" dominantBaseline="central"
                  className="rotate-90" fill="white" fontSize="18" fontWeight="bold"
                  transform="rotate(90, 48, 48)" fontFamily="JetBrains Mono">
                  {pct}%
                </text>
              </svg>
              <div className="text-center">
                <p className="font-semibold text-white">{item.label}</p>
                <p className="text-sm text-[#4a5480]">{item.value} tasks</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
