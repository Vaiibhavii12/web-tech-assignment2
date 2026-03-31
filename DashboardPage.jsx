import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderKanban, CheckCircle2, Clock, AlertTriangle,
  TrendingUp, Plus, ArrowRight, Flame, Target, Zap
} from 'lucide-react';
import { projectsAPI, tasksAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { formatDate, isOverdue, PRIORITY_CONFIG, STATUS_CONFIG } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [pRes, tRes] = await Promise.all([
          projectsAPI.getAll(),
          tasksAPI.getAll()
        ]);
        setProjects(pRes.data.projects || []);
        setTasks(tRes.data.tasks || []);
      } catch {
        toast.error('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const stats = {
    totalProjects: projects.length,
    activeProjects: projects.filter(p => p.status === 'active').length,
    totalTasks: tasks.length,
    doneTasks: tasks.filter(t => t.status === 'done').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    overdue: tasks.filter(t => isOverdue(t.dueDate, t.status)).length,
  };

  const recentTasks = tasks.slice(0, 6);
  const upcomingDeadlines = tasks
    .filter(t => t.dueDate && t.status !== 'done')
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 4);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const getFirstName = (name) => name?.split(' ')[0] || 'there';

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="p-6 lg:p-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-[#8b9cc8] text-sm font-medium">
            {greeting}, <span className="text-brand-400">{getFirstName(user?.name)}</span> 👋
          </p>
          <h1 className="font-display text-3xl font-bold text-white mt-1">
            Your Workspace
          </h1>
        </div>
        <Link to="/projects/new" className="btn-primary flex items-center gap-2 self-start sm:self-auto">
          <Plus size={18} />New Project
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: FolderKanban, label: 'Total Projects', value: stats.totalProjects, sub: `${stats.activeProjects} active`, color: 'text-brand-400', bg: 'bg-brand-500/10', glow: 'shadow-glow-sm' },
          { icon: CheckCircle2, label: 'Tasks Done', value: stats.doneTasks, sub: `of ${stats.totalTasks} total`, color: 'text-green-400', bg: 'bg-green-500/10', glow: '' },
          { icon: Zap, label: 'In Progress', value: stats.inProgress, sub: 'tasks running', color: 'text-blue-400', bg: 'bg-blue-500/10', glow: '' },
          { icon: AlertTriangle, label: 'Overdue', value: stats.overdue, sub: 'need attention', color: 'text-red-400', bg: 'bg-red-500/10', glow: '' },
        ].map((s, i) => (
          <div key={i} className={`stat-card animate-slide-up`} style={{ animationDelay: `${i * 0.08}s` }}>
            <div className={`w-11 h-11 rounded-xl ${s.bg} flex items-center justify-center ${s.glow}`}>
              <s.icon size={22} className={s.color} />
            </div>
            <div>
              <p className="text-3xl font-bold text-white font-mono">{s.value}</p>
              <p className="text-sm font-medium text-white">{s.label}</p>
              <p className="text-xs text-[#4a5480]">{s.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Projects overview */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold text-white flex items-center gap-2">
              <Target size={20} className="text-brand-400" /> Projects
            </h2>
            <Link to="/projects" className="text-sm text-brand-400 hover:text-brand-300 flex items-center gap-1 transition-colors">
              View all <ArrowRight size={14} />
            </Link>
          </div>

          {projects.length === 0 ? (
            <div className="glass-card p-10 text-center">
              <div className="text-5xl mb-4">🚀</div>
              <p className="text-white font-semibold text-lg">No projects yet</p>
              <p className="text-[#8b9cc8] text-sm mt-1 mb-4">Create your first project to get started</p>
              <Link to="/projects/new" className="btn-primary inline-flex items-center gap-2">
                <Plus size={16} /> Create Project
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {projects.slice(0, 4).map((proj, i) => (
                <Link key={proj._id} to={`/projects/${proj._id}`}
                  className="glass-card p-4 flex items-center gap-4 cursor-pointer block animate-slide-up"
                  style={{ animationDelay: `${i * 0.06}s` }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ background: `${proj.color}20`, border: `1px solid ${proj.color}40` }}>
                    {proj.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-white truncate">{proj.title}</p>
                      <span className="text-xs text-[#8b9cc8] flex-shrink-0 font-mono">{proj.completedTasks}/{proj.taskCount}</span>
                    </div>
                    <div className="mt-2 progress-bar">
                      <div className="progress-fill" style={{ width: `${proj.progress}%` }} />
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-[#4a5480]">{proj.progress}% complete</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                        ${proj.status === 'active' ? 'text-green-400 bg-green-500/10' :
                          proj.status === 'completed' ? 'text-blue-400 bg-blue-500/10' :
                          'text-[#8b9cc8] bg-surface-800'}`}>
                        {proj.status}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Upcoming deadlines */}
          <div>
            <h2 className="font-display text-xl font-semibold text-white flex items-center gap-2 mb-4">
              <Clock size={20} className="text-orange-400" /> Upcoming
            </h2>
            {upcomingDeadlines.length === 0 ? (
              <div className="glass-card p-6 text-center">
                <p className="text-4xl mb-2">✅</p>
                <p className="text-[#8b9cc8] text-sm">No upcoming deadlines</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingDeadlines.map((task, i) => {
                  const overdue = isOverdue(task.dueDate, task.status);
                  const p = PRIORITY_CONFIG[task.priority];
                  return (
                    <div key={task._id} className="glass-card p-3 animate-slide-up"
                      style={{ animationDelay: `${i * 0.07}s` }}>
                      <div className="flex items-start gap-2">
                        <span className="text-base">{p.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{task.title}</p>
                          <p className={`text-xs mt-0.5 ${overdue ? 'text-red-400 font-semibold' : 'text-[#8b9cc8]'}`}>
                            {overdue ? '⚠️ Overdue: ' : '📅 '}{formatDate(task.dueDate)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Activity / Quick stats */}
          <div>
            <h2 className="font-display text-xl font-semibold text-white flex items-center gap-2 mb-4">
              <Flame size={20} className="text-brand-400" /> Progress
            </h2>
            <div className="glass-card p-5 space-y-4">
              {stats.totalTasks === 0 ? (
                <p className="text-[#8b9cc8] text-sm text-center py-2">No tasks yet</p>
              ) : (
                <>
                  {[
                    { label: 'To Do', value: tasks.filter(t => t.status === 'todo').length, color: 'bg-slate-400' },
                    { label: 'In Progress', value: tasks.filter(t => t.status === 'in-progress').length, color: 'bg-blue-400' },
                    { label: 'Review', value: tasks.filter(t => t.status === 'review').length, color: 'bg-purple-400' },
                    { label: 'Done', value: stats.doneTasks, color: 'bg-green-400' },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-[#8b9cc8]">{item.label}</span>
                        <span className="text-xs font-mono text-white">{item.value}</span>
                      </div>
                      <div className="progress-bar">
                        <div className={`h-full rounded-full transition-all duration-700 ${item.color}`}
                          style={{ width: stats.totalTasks ? `${(item.value / stats.totalTasks) * 100}%` : '0%' }} />
                      </div>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-[rgba(99,102,241,0.1)]">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[#8b9cc8]">Overall completion</span>
                      <span className="font-bold text-white font-mono">
                        {stats.totalTasks ? Math.round((stats.doneTasks / stats.totalTasks) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Tasks */}
      {recentTasks.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-semibold text-white flex items-center gap-2">
              <TrendingUp size={20} className="text-brand-400" /> Recent Tasks
            </h2>
            <Link to="/tasks" className="text-sm text-brand-400 hover:text-brand-300 flex items-center gap-1 transition-colors">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {recentTasks.map((task, i) => {
              const p = PRIORITY_CONFIG[task.priority];
              const s = STATUS_CONFIG[task.status];
              return (
                <div key={task._id} className="task-card animate-slide-up" style={{ animationDelay: `${i * 0.05}s` }}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="font-medium text-white text-sm leading-snug line-clamp-2">{task.title}</p>
                    <span className={`priority-badge ${p.bg} ${p.color} border ${p.border} flex-shrink-0`}>
                      {p.icon}
                    </span>
                  </div>
                  {task.project && (
                    <p className="text-xs text-[#4a5480] mb-2 flex items-center gap-1">
                      <span>{task.project.icon}</span>{task.project.title}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className={`status-badge ${s.bg} ${s.color} border ${s.border}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />{s.label}
                    </span>
                    {task.dueDate && (
                      <span className={`text-xs ${isOverdue(task.dueDate, task.status) ? 'text-red-400' : 'text-[#4a5480]'}`}>
                        {formatDate(task.dueDate)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="p-6 lg:p-8 space-y-8 animate-fade-in">
      <div className="skeleton h-10 w-64 rounded-xl" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 skeleton h-80 rounded-2xl" />
        <div className="skeleton h-80 rounded-2xl" />
      </div>
    </div>
  );
}
