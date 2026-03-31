import React, { useState, useEffect } from 'react';
import { X, CheckSquare } from 'lucide-react';
import { tasksAPI } from '../../../utils/api';
import toast from 'react-hot-toast';

export default function TaskModal({ task, projectId, defaultStatus = 'todo', onClose, onSaved }) {
  const isEdit = !!task;
  const [form, setForm] = useState({
    title: '',
    description: '',
    status: defaultStatus,
    priority: 'medium',
    dueDate: '',
    estimatedHours: '',
    tags: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'todo',
        priority: task.priority || 'medium',
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
        estimatedHours: task.estimatedHours || '',
        tags: task.tags?.join(', ') || '',
      });
    }
  }, [task]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Task title is required');
    setLoading(true);
    try {
      const payload = {
        ...form,
        project: projectId,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        dueDate: form.dueDate || undefined,
        estimatedHours: form.estimatedHours ? Number(form.estimatedHours) : undefined,
      };
      let res;
      if (isEdit) {
        res = await tasksAPI.update(task._id, payload);
      } else {
        res = await tasksAPI.create(payload);
      }
      toast.success(isEdit ? 'Task updated!' : 'Task created! ✅');
      onSaved(res.data.task, isEdit);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-content">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center">
              <CheckSquare size={20} className="text-brand-400" />
            </div>
            <h2 className="font-display text-xl font-bold text-white">
              {isEdit ? 'Edit Task' : 'New Task'}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-brand-500/10 text-[#4a5480] hover:text-white transition-all">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#8b9cc8]">Task Title *</label>
            <input className="input-field" placeholder="What needs to be done?"
              value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} autoFocus />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#8b9cc8]">Description</label>
            <textarea className="input-field resize-none" rows={3}
              placeholder="Add more details about this task..."
              value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#8b9cc8]">Status</label>
              <select className="input-field" value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value })}>
                <option value="todo">○ To Do</option>
                <option value="in-progress">◑ In Progress</option>
                <option value="review">◕ Review</option>
                <option value="done">● Done</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#8b9cc8]">Priority</label>
              <select className="input-field" value={form.priority}
                onChange={e => setForm({ ...form, priority: e.target.value })}>
                <option value="low">🌿 Low</option>
                <option value="medium">📌 Medium</option>
                <option value="high">⚡ High</option>
                <option value="critical">🔥 Critical</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#8b9cc8]">Due Date</label>
              <input type="date" className="input-field"
                value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#8b9cc8]">Est. Hours</label>
              <input type="number" className="input-field" placeholder="e.g. 4"
                min="0" step="0.5" value={form.estimatedHours}
                onChange={e => setForm({ ...form, estimatedHours: e.target.value })} />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#8b9cc8]">Tags (comma-separated)</label>
            <input className="input-field" placeholder="e.g. bug, frontend, api"
              value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost flex-1 py-2.5">Cancel</button>
            <button type="submit" disabled={loading}
              className="btn-primary flex-1 py-2.5 flex items-center justify-center gap-2">
              {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {isEdit ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
