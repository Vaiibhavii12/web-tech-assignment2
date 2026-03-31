import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, Zap, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('Please fill all fields');
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back! 🎉');
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Check your credentials.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-bg min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-64 h-64 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #6366f1, transparent)' }} />
          <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full opacity-8"
            style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }} />
          {/* Floating grid dots */}
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i}
              className="absolute w-1 h-1 rounded-full bg-brand-400 opacity-20"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`
              }} />
          ))}
        </div>

        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center shadow-glow">
              <Zap size={20} className="text-white" />
            </div>
            <span className="font-display text-2xl font-bold text-white">TaskFlow</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 font-mono">PRO</span>
          </div>
        </div>

        <div className="relative space-y-8 animate-slide-up">
          <div>
            <h1 className="font-display text-5xl font-bold text-white leading-tight">
              Organize work.<br />
              <span className="text-brand-400">Ship faster.</span>
            </h1>
            <p className="mt-4 text-lg text-[#8b9cc8] leading-relaxed">
              Your team's command center for projects, tasks, and momentum.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { icon: '🎯', text: 'Visual Kanban boards for every project' },
              { icon: '⚡', text: 'Real-time progress tracking & analytics' },
              { icon: '🔔', text: 'Priority management with smart deadlines' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 group">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center text-base flex-shrink-0
                  bg-brand-500/10 border border-brand-500/20 group-hover:bg-brand-500/20 transition-all">
                  {item.icon}
                </div>
                <span className="text-[#8b9cc8] group-hover:text-white transition-colors">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <p className="text-xs text-[#4a5480]">© 2025 TaskFlow Pro. Built with MERN Stack.</p>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md animate-slide-up">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden justify-center">
            <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center shadow-glow">
              <Zap size={20} className="text-white" />
            </div>
            <span className="font-display text-2xl font-bold text-white">TaskFlow Pro</span>
          </div>

          <div className="glass-card p-8">
            <div className="mb-8">
              <h2 className="font-display text-3xl font-bold text-white">Welcome back</h2>
              <p className="mt-2 text-[#8b9cc8]">Sign in to continue to your workspace</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#8b9cc8]">Email address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4a5480]" />
                  <input
                    type="email"
                    className="input-field pl-10"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#8b9cc8]">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4a5480]" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    className="input-field pl-10 pr-12"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#4a5480] hover:text-white transition-colors">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2 text-base">
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 size={18} />
                    Sign In
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-[rgba(99,102,241,0.15)] text-center">
              <p className="text-[#8b9cc8] text-sm">
                Don't have an account?{' '}
                <Link to="/register" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
                  Create one free →
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
