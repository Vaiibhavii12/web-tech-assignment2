import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Zap } from 'lucide-react';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="page-bg min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 animate-fade-in">
          <div className="w-14 h-14 rounded-2xl bg-brand-500 flex items-center justify-center shadow-glow animate-pulse-slow">
            <Zap size={26} className="text-white" />
          </div>
          <div className="space-y-2 flex flex-col items-center">
            <div className="w-5 h-5 border-2 border-brand-500/30 border-t-brand-400 rounded-full animate-spin" />
            <p className="text-[#8b9cc8] text-sm font-medium">Loading TaskFlow...</p>
          </div>
        </div>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
}
