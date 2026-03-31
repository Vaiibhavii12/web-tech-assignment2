import React, { useState } from 'react';
import { Settings, User, Lock, Bell, LogOut, Save, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../utils/api';
import { getInitials, getAvatarColor } from '../../utils/helpers';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '' });
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [loading, setLoading] = useState(false);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Name is required');
    setLoading(true);
    try {
      const res = await authAPI.updateProfile({ name: form.name });
      updateUser(res.data.user);
      toast.success('Profile updated!');
    } catch { toast.error('Failed to update profile'); }
    finally { setLoading(false); }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Logged out');
  };

  const tabs = [
    { key: 'profile', label: 'Profile', icon: User },
    { key: 'security', label: 'Security', icon: Shield },
    { key: 'notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <div className="p-6 lg:p-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-white flex items-center gap-3">
          <Settings size={28} className="text-brand-400" />Settings
        </h1>
        <p className="text-[#8b9cc8] mt-1">Manage your account and preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar tabs */}
        <div className="lg:w-56 flex-shrink-0">
          <div className="glass-card p-3 space-y-1">
            {tabs.map(({ key, label, icon: Icon }) => (
              <button key={key} onClick={() => setActiveTab(key)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                  ${activeTab === key
                    ? 'bg-brand-500/20 text-white border border-brand-500/25'
                    : 'text-[#8b9cc8] hover:text-white hover:bg-brand-500/10'}`}>
                <Icon size={16} />{label}
              </button>
            ))}
            <div className="pt-2 border-t border-[rgba(99,102,241,0.1)]">
              <button onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all">
                <LogOut size={16} />Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'profile' && (
            <div className="glass-card p-6 animate-fade-in">
              <h2 className="font-display text-xl font-semibold text-white mb-6">Profile Settings</h2>

              {/* Avatar */}
              <div className="flex items-center gap-4 mb-8 p-4 rounded-xl bg-surface-900 border border-[rgba(99,102,241,0.1)]">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold text-white bg-gradient-to-br ${getAvatarColor(user?.name)}`}>
                  {getInitials(user?.name)}
                </div>
                <div>
                  <p className="font-semibold text-white text-lg">{user?.name}</p>
                  <p className="text-sm text-[#4a5480]">{user?.email}</p>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 font-mono mt-1 inline-block">
                    {user?.role}
                  </span>
                </div>
              </div>

              <form onSubmit={handleProfileSave} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[#8b9cc8]">Full Name</label>
                  <input className="input-field" value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[#8b9cc8]">Email Address</label>
                  <input className="input-field" value={form.email} disabled
                    style={{ opacity: 0.6, cursor: 'not-allowed' }} />
                  <p className="text-xs text-[#4a5480]">Email cannot be changed</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[#8b9cc8]">Member Since</label>
                  <p className="text-white text-sm">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
                  </p>
                </div>

                <button type="submit" disabled={loading}
                  className="btn-primary flex items-center gap-2 py-2.5">
                  {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={16} />}
                  Save Changes
                </button>
              </form>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="glass-card p-6 animate-fade-in">
              <h2 className="font-display text-xl font-semibold text-white mb-6">Security</h2>
              <div className="space-y-5">
                <div className="p-4 rounded-xl bg-surface-900 border border-[rgba(99,102,241,0.1)]">
                  <div className="flex items-center gap-3 mb-3">
                    <Lock size={18} className="text-brand-400" />
                    <p className="font-semibold text-white">Change Password</p>
                  </div>
                  <p className="text-sm text-[#4a5480] mb-4">Password changes are available via the API. Contact support or re-register for a new account.</p>
                  <div className="flex items-center gap-2 text-xs text-green-400 bg-green-500/10 px-3 py-2 rounded-lg">
                    <Shield size={13} />
                    Your password is hashed with bcrypt (12 rounds)
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-surface-900 border border-[rgba(99,102,241,0.1)]">
                  <div className="flex items-center gap-3 mb-2">
                    <Shield size={18} className="text-green-400" />
                    <p className="font-semibold text-white">JWT Authentication</p>
                  </div>
                  <p className="text-sm text-[#4a5480]">Signed in with a secure 7-day JWT token stored locally.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="glass-card p-6 animate-fade-in">
              <h2 className="font-display text-xl font-semibold text-white mb-6">Notification Preferences</h2>
              <div className="space-y-4">
                {[
                  { label: 'Task due reminders', sub: 'Notify when tasks are approaching deadline', enabled: true },
                  { label: 'Project updates', sub: 'Get notified on project status changes', enabled: true },
                  { label: 'Weekly summary', sub: 'Receive a weekly productivity report', enabled: false },
                  { label: 'Overdue alerts', sub: 'Alert when tasks become overdue', enabled: true },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-surface-900 border border-[rgba(99,102,241,0.1)]">
                    <div>
                      <p className="text-sm font-medium text-white">{item.label}</p>
                      <p className="text-xs text-[#4a5480] mt-0.5">{item.sub}</p>
                    </div>
                    <div className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors
                      ${item.enabled ? 'bg-brand-500' : 'bg-surface-800 border border-[rgba(99,102,241,0.2)]'}`}
                      onClick={() => toast('Notification settings coming soon!')}>
                      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all
                        ${item.enabled ? 'left-5' : 'left-0.5'}`} />
                    </div>
                  </div>
                ))}
                <p className="text-xs text-[#4a5480] pt-2">
                  🔔 Full notification system can be extended with email integration (NodeMailer).
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
