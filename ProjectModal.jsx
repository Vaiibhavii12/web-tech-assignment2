import React, { useState, useEffect } from 'react';
import { X, FolderKanban } from 'lucide-react';
import { projectsAPI } from '../../../utils/api';
import { PROJECT_COLORS, PROJECT_ICONS } from '../../../utils/helpers';
import toast from 'react-hot-toast';

export default function ProjectModal({ project, onClose, onSaved }) {
  const isEdit = !!project;
  const [form, setForm] = useState({
    title: '',
    description: '',
    color: '#6366f1',
    icon: '🚀',
    status: 'active',
    priority: 'medium',
    deadline: '',
    tags: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (project) {
      setForm({
        title: project.title || '',
        description: project.description || '',
        color: project.color || '#6366f1',
        icon: project.icon || '🚀',
        status: project.status || 'active',
        priority: project.priority || 'medium',
        deadline: project.deadline ? project.deadline.split('T')[0] : '',
        tags: project.tags?.join(', ') || '',
      });
    }
  }, [project]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Project title is required');
    setLoading(true);
    try {
      const payload = {
        ...form,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        deadline: form.deadline || undefined,
      };
      let res;
      if (isEdit) {
        res = await projectsAPI.update(project._id, payload);
      } else {
        res = await projectsAPI.create(payload);
      }
      toast.success(isEdit ? 'Project updated!' : 'Project created! 🎉');
      onSaved(res.data.project, isEdit);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save project');
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
              <FolderKanban size={20} className="text-brand-400" />
            </div>
            <h2 className="font-display text-xl font-bold text-white">
              {isEdit ? 'Edit Project' : 'New Project'}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-brand-500/10 text-[#4a5480] hover:text-white transition-all">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#8b9cc8]">Project Title *</label>
            <input className="input-field" placeholder="e.g. Marketing Campaign Q4"
              value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#8b9cc8]">Description</label>
            <textarea className="input-field resize-none" rows={2}
              placeholder="What is this project about?"
              value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>

          {/* Icon + Color Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#8b9cc8]">Icon</label>
              <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-surface-900 border border-[rgba(99,102,241,0.15)] max-h-24 overflow-y-auto">
                {PROJECT_ICONS.map(icon => (
                  <button key={icon} type="button"
                    onClick={() => setForm({ ...form, icon })}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-base transition-all hover:bg-brand-500/20
                      ${form.icon === icon ? 'bg-brand-500/30 ring-1 ring-brand-500' : ''}`}>
                    {icon}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#8b9cc8]">Color</label>
              <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-surface-900 border border-[rgba(99,102,241,0.15)]">
                {PROJECT_COLORS.map(color => (
                  <button key={color} type="button"
                    onClick={() => setForm({ ...form, color })}
                    className={`w-6 h-6 rounded-full transition-all hover:scale-110 ${form.color === color ? 'ring-2 ring-white ring-offset-1 ring-offset-surface-900 scale-110' : ''}`}
                    style={{ background: color }} />
                ))}
              </div>
            </div>
          </div>

          {/* Status + Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#8b9cc8]">Status</label>
              <select className="input-field" value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value })}>
                <option value="active">🟢 Active</option>
                <option value="on-hold">🟡 On Hold</option>
                <option value="completed">🔵 Completed</option>
                <option value="archived">⚫ Archived</option>
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

          {/* Deadline */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#8b9cc8]">Deadline (optional)</label>
            <input type="date" className="input-field" value={form.deadline}
              onChange={e => setForm({ ...form, deadline: e.target.value })} />
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#8b9cc8]">Tags (comma-separated)</label>
            <input className="input-field" placeholder="e.g. design, frontend, urgent"
              value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} />
          </div>

          {/* Preview */}
          <div className="p-4 rounded-xl border border-[rgba(99,102,241,0.15)] bg-surface-900">
            <p className="text-xs text-[#4a5480] mb-2">Preview</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                style={{ background: `${form.color}20`, border: `1px solid ${form.color}40` }}>
                {form.icon}
              </div>
              <div>
                <p className="font-semibold text-white">{form.title || 'Project Name'}</p>
                <p className="text-xs text-[#4a5480]">{form.description || 'Description...'}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost flex-1 py-2.5">Cancel</button>
            <button type="submit" disabled={loading}
              className="btn-primary flex-1 py-2.5 flex items-center justify-center gap-2">
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
              {isEdit ? 'Update Project' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
