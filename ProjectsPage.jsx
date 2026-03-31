import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, MoreVertical, Trash2, Edit2, FolderOpen, ArrowRight } from 'lucide-react';
import { projectsAPI } from '../../utils/api';
import { PROJECT_COLORS, PROJECT_ICONS, formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';
import ProjectModal from '../components/projects/ProjectModal';

export default function ProjectsPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [menuOpen, setMenuOpen] = useState(null);

  const fetchProjects = async () => {
    try {
      const res = await projectsAPI.getAll();
      setProjects(res.data.projects || []);
    } catch { toast.error('Failed to load projects'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this project and all its tasks? This cannot be undone.')) return;
    try {
      await projectsAPI.delete(id);
      setProjects(prev => prev.filter(p => p._id !== id));
      toast.success('Project deleted');
    } catch { toast.error('Failed to delete project'); }
    setMenuOpen(null);
  };

  const handleSaved = (project, isEdit) => {
    if (isEdit) {
      setProjects(prev => prev.map(p => p._id === project._id ? { ...p, ...project } : p));
    } else {
      setProjects(prev => [project, ...prev]);
    }
  };

  const filtered = projects.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  const statusGroups = {
    active: filtered.filter(p => p.status === 'active'),
    'on-hold': filtered.filter(p => p.status === 'on-hold'),
    completed: filtered.filter(p => p.status === 'completed'),
  };

  return (
    <div className="p-6 lg:p-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">Projects</h1>
          <p className="text-[#8b9cc8] mt-1">{projects.length} project{projects.length !== 1 ? 's' : ''} total</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4a5480]" />
            <input className="input-field pl-9 py-2 text-sm h-10 w-52"
              placeholder="Search projects..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button onClick={() => { setEditProject(null); setShowModal(true); }}
            className="btn-primary flex items-center gap-2 py-2 text-sm">
            <Plus size={16} />New Project
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-48 rounded-2xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <div className="text-6xl mb-4 animate-float">🗂️</div>
          <p className="font-display text-2xl font-bold text-white">No projects found</p>
          <p className="text-[#8b9cc8] mt-2 mb-6">
            {search ? 'Try a different search term' : 'Create your first project to get started'}
          </p>
          {!search && (
            <button onClick={() => setShowModal(true)} className="btn-primary inline-flex items-center gap-2">
              <Plus size={16} />Create Project
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(statusGroups).map(([status, group]) => {
            if (group.length === 0) return null;
            return (
              <div key={status}>
                <div className="flex items-center gap-3 mb-4">
                  <span className={`w-2 h-2 rounded-full ${status === 'active' ? 'bg-green-400' : status === 'on-hold' ? 'bg-yellow-400' : 'bg-blue-400'}`} />
                  <h2 className="text-sm font-semibold text-[#8b9cc8] uppercase tracking-wider">
                    {status === 'on-hold' ? 'On Hold' : status.charAt(0).toUpperCase() + status.slice(1)} ({group.length})
                  </h2>
                </div>
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {group.map((proj, i) => (
                    <div key={proj._id} className="glass-card p-5 cursor-pointer group animate-slide-up relative"
                      style={{ animationDelay: `${i * 0.06}s` }}
                      onClick={() => navigate(`/projects/${proj._id}`)}>
                      {/* Menu */}
                      <div className="absolute top-4 right-4 z-10" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setMenuOpen(menuOpen === proj._id ? null : proj._id)}
                          className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-brand-500/20 text-[#8b9cc8] hover:text-white transition-all">
                          <MoreVertical size={15} />
                        </button>
                        {menuOpen === proj._id && (
                          <div className="absolute right-0 top-8 w-40 glass-card py-1 shadow-card z-20">
                            <button onClick={(e) => { e.stopPropagation(); setEditProject(proj); setShowModal(true); setMenuOpen(null); }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#8b9cc8] hover:text-white hover:bg-brand-500/10 transition-all">
                              <Edit2 size={14} />Edit Project
                            </button>
                            <button onClick={(e) => handleDelete(proj._id, e)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-all">
                              <Trash2 size={14} />Delete
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Icon */}
                      <div className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl mb-4"
                        style={{ background: `${proj.color}18`, border: `1px solid ${proj.color}35` }}>
                        {proj.icon}
                      </div>

                      <h3 className="font-display text-lg font-semibold text-white group-hover:text-brand-300 transition-colors pr-8">
                        {proj.title}
                      </h3>
                      {proj.description && (
                        <p className="text-sm text-[#4a5480] mt-1 line-clamp-2">{proj.description}</p>
                      )}

                      {/* Tags */}
                      {proj.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {proj.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="tag-chip">{tag}</span>
                          ))}
                        </div>
                      )}

                      {/* Progress */}
                      <div className="mt-4">
                        <div className="flex justify-between text-xs text-[#4a5480] mb-1.5">
                          <span>{proj.completedTasks || 0}/{proj.taskCount || 0} tasks</span>
                          <span className="font-mono text-white">{proj.progress}%</span>
                        </div>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${proj.progress}%` }} />
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-[rgba(99,102,241,0.1)]">
                        {proj.deadline && (
                          <span className="text-xs text-[#4a5480]">📅 {formatDate(proj.deadline)}</span>
                        )}
                        <span className="text-xs text-brand-400 flex items-center gap-1 ml-auto
                          opacity-0 group-hover:opacity-100 transition-all">
                          Open <ArrowRight size={12} />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Click outside to close menu */}
      {menuOpen && <div className="fixed inset-0 z-0" onClick={() => setMenuOpen(null)} />}

      {showModal && (
        <ProjectModal
          project={editProject}
          onClose={() => { setShowModal(false); setEditProject(null); }}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
