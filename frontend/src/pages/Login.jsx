import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, ShieldCheck, KeyRound, Loader2, AlertCircle } from 'lucide-react';
import useAuth from '../hooks/useAuth';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, error: authError } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    if (!email.trim()) {
      setValidationError('Email address is required.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setValidationError('Please enter a valid email address.');
      return false;
    }
    if (!password) {
      setValidationError('Password is required.');
      return false;
    }
    setValidationError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await login(email.trim(), password);
      navigate('/dashboard');
    } catch (err) {
      // Error is handled and exposed by AuthContext / caught here
      console.error('Login attempt failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeError = validationError || authError;

  return (
    <div className="w-full max-w-md my-4 animate-in fade-in duration-200">
      <div className="glass-panel p-8 rounded-3xl shadow-lg border border-gray-200 relative">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mx-auto mb-3 shadow-lg shadow-blue-500/10">
            <Lock size={22} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Portal Authentication</h2>
          <p className="text-slate-500 text-xs mt-1">Sign in with your SSGI organizational credentials</p>
        </div>

        {activeError && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs flex items-center gap-2.5">
            <AlertCircle size={16} className="text-rose-600 flex-shrink-0" />
            <span>{activeError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                disabled={isSubmitting}
                placeholder="name@ssgi.gov.et"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (validationError) setValidationError('');
                }}
                className="w-full bg-white text-slate-800 placeholder-gray-400 text-xs rounded-xl pl-10 pr-4 py-3 border border-gray-200 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Password</label>
            <div className="relative">
              <KeyRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                disabled={isSubmitting}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (validationError) setValidationError('');
                }}
                className="w-full bg-white text-slate-800 placeholder-gray-400 text-xs rounded-xl pl-10 pr-4 py-3 border border-gray-200 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl ssgi-gradient-bg text-white font-semibold text-xs shadow-lg shadow-blue-500/20 hover:brightness-110 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Authenticating with REST API...</span>
              </>
            ) : (
              <>
                <span>Sign In to System</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
          <p className="text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 hover:underline font-medium">
              Create account here
            </Link>
          </p>
        </div>

        <div className="mt-4 p-3 rounded-xl bg-gray-50 border border-gray-200 text-[11px] text-slate-500 flex items-center gap-2">
          <ShieldCheck size={16} className="text-emerald-600 flex-shrink-0" />
          <span>Read-only system: PDF downloads and raw printing are strictly disabled.</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
