import React, { useEffect, useState } from 'react';
import { CheckSquare, Filter, Search, Trash2, Edit2, Plus, SlidersHorizontal } from 'lucide-react';
import { tasksAPI, projectsAPI } from '../../utils/api';
import { PRIORITY_CONFIG, STATUS_CONFIG, formatDate, isOverdue } from '../../utils/helpers';
import toast from 'react-hot-toast';
import TaskModal from '../components/tasks/TaskModal';

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [selectedProject, setSelectedProject] = useState('');

  const fetchData = async () => {
    try {
      const [tRes, pRes] = await Promise.all([tasksAPI.getAll(), projectsAPI.getAll()]);
      setTasks(tRes.data.tasks || []);
      setProjects(pRes.data.projects || []);
    } catch { toast.error('Failed to load tasks'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSaved = (task, isEdit) => {
    if (isEdit) setTasks(prev => prev.map(t => t._id === task._id ? task : t));
    else setTasks(prev => [task, ...prev]);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await tasksAPI.delete(id);
      setTasks(prev => prev.filter(t => t._id !== id));
      toast.success('Task deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const handleStatusChange = async (taskId, status) => {
    setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status } : t));
    try { await tasksAPI.updateStatus(taskId, status); }
    catch { toast.error('Failed to update status'); fetchData(); }
  };

  const filtered = tasks.filter(t => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !filterStatus || t.status === filterStatus;
    const matchPriority = !filterPriority || t.priority === filterPriority;
    const matchProject = !selectedProject || t.project?._id === selectedProject;
    return matchSearch && matchStatus && matchPriority && matchProject;
  });

  const defaultProjectId = projects[0]?._id;

  return (
    <div className="p-6 lg:p-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-white flex items-center gap-3">
            <CheckSquare size={28} className="text-brand-400" />My Tasks
          </h1>
          <p className="text-[#8b9cc8] mt-1">{filtered.length} of {tasks.length} tasks</p>
        </div>
        {defaultProjectId && (
          <button onClick={() => { setEditTask(null); setShowModal(true); }}
            className="btn-primary flex items-center gap-2 text-sm self-start sm:self-auto">
            <Plus size={16} />Add Task
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="glass-card p-4 mb-6 flex flex-wrap gap-3 items-center">
        <SlidersHorizontal size={16} className="text-brand-400 flex-shrink-0" />

        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4a5480]" />
          <input className="input-field pl-9 py-2 text-sm h-9" placeholder="Search tasks..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <select className="input-field py-2 text-sm h-9 w-36"
          value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Status</option>
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="review">Review</option>
          <option value="done">Done</option>
        </select>

        <select className="input-field py-2 text-sm h-9 w-36"
          value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
          <option value="">All Priority</option>
          <option value="critical">🔥 Critical</option>
          <option value="high">⚡ High</option>
          <option value="medium">📌 Medium</option>
          <option value="low">🌿 Low</option>
        </select>

        <select className="input-field py-2 text-sm h-9 w-40"
          value={selectedProject} onChange={e => setSelectedProject(e.target.value)}>
          <option value="">All Projects</option>
          {projects.map(p => <option key={p._id} value={p._id}>{p.icon} {p.title}</option>)}
        </select>

        {(filterStatus || filterPriority || search || selectedProject) && (
          <button onClick={() => { setFilterStatus(''); setFilterPriority(''); setSearch(''); setSelectedProject(''); }}
            className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded-lg hover:bg-red-500/10 transition-all">
            Clear filters ✕
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <div className="text-6xl mb-4 animate-float">✅</div>
          <p className="font-display text-2xl font-bold text-white">
            {tasks.length === 0 ? 'No tasks yet' : 'No tasks match filters'}
          </p>
          <p className="text-[#8b9cc8] mt-2">
            {tasks.length === 0
              ? 'Create a project first, then add tasks!'
              : 'Try clearing the filters to see all tasks'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((task, i) => {
            const p = PRIORITY_CONFIG[task.priority];
            const s = STATUS_CONFIG[task.status];
            const overdue = isOverdue(task.dueDate, task.status);
            return (
              <div key={task._id}
                className="glass-card px-4 py-3.5 flex items-center gap-4 group animate-slide-up"
                style={{ animationDelay: `${i * 0.03}s` }}>

                {/* Status dot / checkbox */}
                <button onClick={() => handleStatusChange(task._id,
                  task.status === 'done' ? 'todo' : task.status === 'todo' ? 'in-progress' : task.status === 'in-progress' ? 'review' : 'done')}
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all
                    ${task.status === 'done' ? 'bg-green-500 border-green-500' : `border-current ${s.color}`}`}>
                  {task.status === 'done' && <span className="text-white text-xs">✓</span>}
                </button>

                {/* Title + meta */}
                <div className="flex-1 min-w-0">
                  <p className={`font-medium text-sm ${task.status === 'done' ? 'line-through text-[#4a5480]' : 'text-white'}`}>
                    {task.title}
                  </p>
                  <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                    {task.project && (
                      <span className="text-xs text-[#4a5480] flex items-center gap-1">
                        {task.project.icon} {task.project.title}
                      </span>
                    )}
                    {task.tags?.map(tag => <span key={tag} className="tag-chip">{tag}</span>)}
                  </div>
                </div>

                {/* Badges */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`priority-badge ${p.bg} ${p.color} border ${p.border} hidden sm:inline-flex`}>
                    {p.icon} {p.label}
                  </span>
                  <span className={`status-badge ${s.bg} ${s.color} border ${s.border} hidden md:inline-flex`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />{s.label}
                  </span>
                  {task.dueDate && (
                    <span className={`text-xs hidden lg:block ${overdue ? 'text-red-400 font-semibold' : 'text-[#4a5480]'}`}>
                      {overdue ? '⚠️ ' : '📅 '}{formatDate(task.dueDate)}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button onClick={() => { setEditTask(task); setShowModal(true); }}
                    className="p-1.5 rounded-lg hover:bg-brand-500/20 text-[#4a5480] hover:text-brand-400 transition-all">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => handleDelete(task._id)}
                    className="p-1.5 rounded-lg hover:bg-red-500/20 text-[#4a5480] hover:text-red-400 transition-all">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && defaultProjectId && (
        <TaskModal
          task={editTask}
          projectId={editTask?.project?._id || defaultProjectId}
          onClose={() => { setShowModal(false); setEditTask(null); }}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
