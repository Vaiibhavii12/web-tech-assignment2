import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Plus, LayoutGrid, List, Settings2, Trash2,
  Calendar, Target, BarChart3, Edit2
} from 'lucide-react';
import { projectsAPI, tasksAPI } from '../../utils/api';
import { STATUS_CONFIG, PRIORITY_CONFIG, formatDate, isOverdue } from '../../utils/helpers';
import toast from 'react-hot-toast';
import TaskModal from '../components/tasks/TaskModal';
import ProjectModal from '../components/projects/ProjectModal';

const COLUMNS = [
  { key: 'todo', label: 'To Do', icon: '○', color: 'border-slate-500/30' },
  { key: 'in-progress', label: 'In Progress', icon: '◑', color: 'border-blue-500/30' },
  { key: 'review', label: 'Review', icon: '◕', color: 'border-purple-500/30' },
  { key: 'done', label: 'Done', icon: '●', color: 'border-green-500/30' },
];

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('kanban');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [dragOver, setDragOver] = useState(null);
  const [dragging, setDragging] = useState(null);
  const [defaultStatus, setDefaultStatus] = useState('todo');

  const fetchProject = useCallback(async () => {
    try {
      const res = await projectsAPI.getOne(id);
      setProject(res.data.project);
      setTasks(res.data.tasks || []);
    } catch {
      toast.error('Project not found');
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => { fetchProject(); }, [fetchProject]);

  const handleTaskSaved = (task, isEdit) => {
    if (isEdit) {
      setTasks(prev => prev.map(t => t._id === task._id ? task : t));
    } else {
      setTasks(prev => [task, ...prev]);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await tasksAPI.delete(taskId);
      setTasks(prev => prev.filter(t => t._id !== taskId));
      toast.success('Task deleted');
    } catch { toast.error('Failed to delete task'); }
  };

  const handleDeleteProject = async () => {
    if (!window.confirm('Delete project and ALL tasks? This is permanent.')) return;
    try {
      await projectsAPI.delete(id);
      toast.success('Project deleted');
      navigate('/projects');
    } catch { toast.error('Failed to delete project'); }
  };

  // Drag & Drop
  const handleDragStart = (e, taskId) => {
    setDragging(taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = async (e, status) => {
    e.preventDefault();
    if (!dragging) return;
    const task = tasks.find(t => t._id === dragging);
    if (task?.status === status) { setDragOver(null); setDragging(null); return; }
    setTasks(prev => prev.map(t => t._id === dragging ? { ...t, status } : t));
    try {
      await tasksAPI.updateStatus(dragging, status);
      toast.success(`Moved to ${STATUS_CONFIG[status].label}`);
    } catch {
      toast.error('Failed to update status');
      fetchProject();
    }
    setDragOver(null);
    setDragging(null);
  };

  if (loading) return (
    <div className="p-8 space-y-6 animate-fade-in">
      <div className="skeleton h-10 w-48 rounded-xl" />
      <div className="skeleton h-24 rounded-2xl" />
      <div className="flex gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-64 rounded-2xl flex-1" />)}
      </div>
    </div>
  );

  const tasksByStatus = (status) => tasks.filter(t => t.status === status);

  return (
    <div className="p-6 lg:p-8 animate-fade-in">
      {/* Back + Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-start gap-4">
          <Link to="/projects" className="btn-ghost flex items-center gap-1.5 text-sm py-2 mt-1 flex-shrink-0">
            <ArrowLeft size={15} />Back
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <span className="text-3xl">{project?.icon}</span>
              <h1 className="font-display text-2xl lg:text-3xl font-bold text-white">{project?.title}</h1>
            </div>
            {project?.description && (
              <p className="text-[#8b9cc8] mt-1 ml-12">{project.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* View toggle */}
          <div className="flex p-1 rounded-xl bg-surface-900 border border-[rgba(99,102,241,0.12)]">
            {[{ icon: LayoutGrid, val: 'kanban' }, { icon: List, val: 'list' }].map(({ icon: Icon, val }) => (
              <button key={val} onClick={() => setView(val)}
                className={`p-2 rounded-lg transition-all ${view === val ? 'bg-brand-500/20 text-brand-400' : 'text-[#4a5480] hover:text-white'}`}>
                <Icon size={16} />
              </button>
            ))}
          </div>

          <button onClick={() => setShowProjectModal(true)} className="btn-ghost py-2 px-3">
            <Edit2 size={15} />
          </button>
          <button onClick={handleDeleteProject}
            className="p-2 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-all">
            <Trash2 size={15} />
          </button>
          <button onClick={() => { setEditTask(null); setDefaultStatus('todo'); setShowTaskModal(true); }}
            className="btn-primary flex items-center gap-2 text-sm py-2">
            <Plus size={16} />Add Task
          </button>
        </div>
      </div>

      {/* Project stats bar */}
      <div className="glass-card p-4 flex flex-wrap gap-6 mb-6">
        <div className="flex items-center gap-2">
          <Target size={16} className="text-brand-400" />
          <span className="text-sm text-[#8b9cc8]">Progress</span>
          <span className="font-bold font-mono text-white">{project?.progress}%</span>
          <div className="w-24 progress-bar">
            <div className="progress-fill" style={{ width: `${project?.progress}%` }} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <BarChart3 size={16} className="text-blue-400" />
          <span className="text-sm text-[#8b9cc8]">Tasks</span>
          <span className="font-bold font-mono text-white">{tasks.length}</span>
        </div>
        {project?.deadline && (
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-orange-400" />
            <span className="text-sm text-[#8b9cc8]">Deadline</span>
            <span className="font-bold text-white">{formatDate(project.deadline)}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold
            ${project?.priority === 'critical' ? 'bg-red-500/15 text-red-400' :
              project?.priority === 'high' ? 'bg-orange-500/15 text-orange-400' :
              project?.priority === 'medium' ? 'bg-yellow-500/15 text-yellow-400' :
              'bg-green-500/15 text-green-400'}`}>
            {PRIORITY_CONFIG[project?.priority]?.icon} {project?.priority}
          </span>
        </div>
        {project?.tags?.map(tag => (
          <span key={tag} className="tag-chip">{tag}</span>
        ))}
      </div>

      {/* Kanban Board */}
      {view === 'kanban' && (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLUMNS.map(col => {
            const colTasks = tasksByStatus(col.key);
            return (
              <div key={col.key}
                className={`kanban-column transition-all duration-200 ${dragOver === col.key ? 'drag-over' : ''}`}
                onDragOver={e => { e.preventDefault(); setDragOver(col.key); }}
                onDragLeave={() => setDragOver(null)}
                onDrop={e => handleDrop(e, col.key)}>

                {/* Column header */}
                <div className={`flex items-center justify-between pb-3 mb-1 border-b ${col.color}`}>
                  <div className="flex items-center gap-2">
                    <span className="text-base">{col.icon}</span>
                    <span className="font-semibold text-white text-sm">{col.label}</span>
                    <span className="w-5 h-5 rounded-full bg-surface-800 flex items-center justify-center text-xs font-mono text-[#8b9cc8]">
                      {colTasks.length}
                    </span>
                  </div>
                  <button
                    onClick={() => { setEditTask(null); setDefaultStatus(col.key); setShowTaskModal(true); }}
                    className="p-1 rounded-lg hover:bg-brand-500/20 text-[#4a5480] hover:text-brand-400 transition-all">
                    <Plus size={14} />
                  </button>
                </div>

                {/* Tasks */}
                <div className="space-y-2 flex-1">
                  {colTasks.map(task => (
                    <TaskCard
                      key={task._id}
                      task={task}
                      onEdit={() => { setEditTask(task); setShowTaskModal(true); }}
                      onDelete={() => handleDeleteTask(task._id)}
                      onDragStart={handleDragStart}
                      dragging={dragging === task._id}
                    />
                  ))}
                  {colTasks.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-8 text-[#2a2d40]">
                      <div className="text-2xl mb-1">
                        {col.key === 'todo' ? '📋' : col.key === 'in-progress' ? '⚡' : col.key === 'review' ? '🔍' : '✅'}
                      </div>
                      <p className="text-xs">Drop tasks here</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List View */}
      {view === 'list' && (
        <div className="glass-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[rgba(99,102,241,0.1)]">
                {['Task', 'Priority', 'Status', 'Due Date', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[#4a5480] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(99,102,241,0.06)]">
              {tasks.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-[#4a5480]">No tasks yet. Add your first task!</td></tr>
              ) : tasks.map(task => {
                const p = PRIORITY_CONFIG[task.priority];
                const s = STATUS_CONFIG[task.status];
                return (
                  <tr key={task._id} className="hover:bg-brand-500/5 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-white text-sm">{task.title}</p>
                      {task.description && <p className="text-xs text-[#4a5480] mt-0.5 line-clamp-1">{task.description}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`priority-badge ${p.bg} ${p.color} border ${p.border}`}>{p.icon} {p.label}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`status-badge ${s.bg} ${s.color} border ${s.border}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />{s.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs ${isOverdue(task.dueDate, task.status) ? 'text-red-400 font-semibold' : 'text-[#4a5480]'}`}>
                        {task.dueDate ? formatDate(task.dueDate) : '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => { setEditTask(task); setShowTaskModal(true); }}
                          className="p-1.5 rounded-lg hover:bg-brand-500/20 text-[#4a5480] hover:text-brand-400 transition-all">
                          <Edit2 size={13} />
                        </button>
                        <button onClick={() => handleDeleteTask(task._id)}
                          className="p-1.5 rounded-lg hover:bg-red-500/20 text-[#4a5480] hover:text-red-400 transition-all">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showTaskModal && (
        <TaskModal
          task={editTask}
          projectId={id}
          defaultStatus={defaultStatus}
          onClose={() => { setShowTaskModal(false); setEditTask(null); }}
          onSaved={handleTaskSaved}
        />
      )}

      {showProjectModal && (
        <ProjectModal
          project={project}
          onClose={() => setShowProjectModal(false)}
          onSaved={(updated) => setProject(prev => ({ ...prev, ...updated }))}
        />
      )}
    </div>
  );
}

function TaskCard({ task, onEdit, onDelete, onDragStart, dragging }) {
  const p = PRIORITY_CONFIG[task.priority];
  const overdue = isOverdue(task.dueDate, task.status);

  return (
    <div
      className={`task-card ${dragging ? 'dragging' : ''}`}
      draggable
      onDragStart={(e) => onDragStart(e, task._id)}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-sm font-medium text-white leading-snug line-clamp-2 flex-1">{task.title}</p>
        <div className="flex items-center gap-1 flex-shrink-0">
          <span className={`priority-badge ${p.bg} ${p.color} border ${p.border} text-xs py-0.5 px-1.5`}>
            {p.icon}
          </span>
        </div>
      </div>

      {task.description && (
        <p className="text-xs text-[#4a5480] line-clamp-1 mb-2">{task.description}</p>
      )}

      {task.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {task.tags.slice(0, 2).map(tag => <span key={tag} className="tag-chip text-xs">{tag}</span>)}
        </div>
      )}

      <div className="flex items-center justify-between mt-2 pt-2 border-t border-[rgba(99,102,241,0.1)]">
        {task.dueDate ? (
          <span className={`text-xs ${overdue ? 'text-red-400 font-semibold' : 'text-[#4a5480]'}`}>
            {overdue ? '⚠️ ' : '📅 '}{formatDate(task.dueDate)}
          </span>
        ) : <span />}

        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onEdit}
            className="p-1 rounded hover:bg-brand-500/20 text-[#4a5480] hover:text-brand-400 transition-all">
            <Edit2 size={12} />
          </button>
          <button onClick={onDelete}
            className="p-1 rounded hover:bg-red-500/20 text-[#4a5480] hover:text-red-400 transition-all">
            <Trash2 size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}
