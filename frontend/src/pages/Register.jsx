import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, KeyRound, Building, ArrowRight, Shield, Loader2, AlertCircle } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import { ROLES } from '../utils/constants';

const Register = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    password_confirmation: '',
    department: '',
    role: ROLES.STAFF,
  });
  const [validationError, setValidationError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, error: authError } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (validationError) setValidationError('');
  };

  const validateForm = () => {
    if (!formData.first_name.trim()) {
      setValidationError('First name is required.');
      return false;
    }
    if (!formData.last_name.trim()) {
      setValidationError('Last name is required.');
      return false;
    }
    if (!formData.email.trim()) {
      setValidationError('Email address is required.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setValidationError('Please enter a valid email address.');
      return false;
    }
    if (!formData.password) {
      setValidationError('Password is required.');
      return false;
    }
    if (formData.password.length < 8) {
      setValidationError('Password must be at least 8 characters long.');
      return false;
    }
    if (formData.password !== formData.password_confirmation) {
      setValidationError('Password and Confirmation Password do not match.');
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
      await register({
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        name: `${formData.first_name.trim()} ${formData.last_name.trim()}`,
        email: formData.email.trim(),
        password: formData.password,
        password_confirmation: formData.password_confirmation,
        department: formData.department.trim() || 'General Trainee',
        role: formData.role,
      });
      navigate('/dashboard');
    } catch (err) {
      console.error('Registration attempt failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeError = validationError || authError;

  return (
    <div className="w-full max-w-md my-4 animate-in fade-in duration-200">
      <div className="glass-panel p-8 rounded-3xl shadow-2xl border border-slate-800 relative">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mx-auto mb-3 shadow-lg shadow-indigo-500/10">
            <User size={22} />
          </div>
          <h2 className="text-2xl font-bold text-slate-100 tracking-tight">Create Access Account</h2>
          <p className="text-slate-400 text-xs mt-1">Register for SSGI Digital Library System</p>
        </div>

        {activeError && (
          <div className="mb-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
            <AlertCircle size={16} className="text-rose-400 flex-shrink-0" />
            <span>{activeError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* First Name & Last Name Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">First Name</label>
              <input
                type="text"
                name="first_name"
                disabled={isSubmitting}
                placeholder="Samuel"
                value={formData.first_name}
                onChange={handleChange}
                className="w-full bg-slate-900/90 text-slate-100 placeholder-slate-500 text-xs rounded-xl px-3.5 py-2.5 border border-slate-800 focus:outline-none focus:border-sky-500/60 disabled:opacity-60"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Last Name</label>
              <input
                type="text"
                name="last_name"
                disabled={isSubmitting}
                placeholder="Bekele"
                value={formData.last_name}
                onChange={handleChange}
                className="w-full bg-slate-900/90 text-slate-100 placeholder-slate-500 text-xs rounded-xl px-3.5 py-2.5 border border-slate-800 focus:outline-none focus:border-sky-500/60 disabled:opacity-60"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                name="email"
                disabled={isSubmitting}
                placeholder="samuel.bekele@ssgi.gov.et"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-slate-900/90 text-slate-100 placeholder-slate-500 text-xs rounded-xl pl-10 pr-4 py-2.5 border border-slate-800 focus:outline-none focus:border-sky-500/60 disabled:opacity-60"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Department / Division</label>
            <div className="relative">
              <Building size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                name="department"
                disabled={isSubmitting}
                placeholder="Geodesy & Geodynamics Division"
                value={formData.department}
                onChange={handleChange}
                className="w-full bg-slate-900/90 text-slate-100 placeholder-slate-500 text-xs rounded-xl pl-10 pr-4 py-2.5 border border-slate-800 focus:outline-none focus:border-sky-500/60 disabled:opacity-60"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Requested Access Role</label>
            <div className="relative">
              <Shield size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                name="role"
                disabled={isSubmitting}
                value={formData.role}
                onChange={handleChange}
                className="w-full bg-slate-900/90 text-slate-100 text-xs rounded-xl pl-10 pr-4 py-2.5 border border-slate-800 focus:outline-none focus:border-sky-500/60 cursor-pointer disabled:opacity-60"
              >
                <option value={ROLES.STAFF}>SSGI Staff Researcher</option>
                <option value={ROLES.GUEST}>Guest / Trainee</option>
                <option value={ROLES.LIBRARIAN}>Librarian</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
            <div className="relative">
              <KeyRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                name="password"
                disabled={isSubmitting}
                placeholder="Minimum 8 characters"
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-slate-900/90 text-slate-100 placeholder-slate-500 text-xs rounded-xl pl-10 pr-4 py-2.5 border border-slate-800 focus:outline-none focus:border-sky-500/60 disabled:opacity-60"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Confirmation Password</label>
            <div className="relative">
              <KeyRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                name="password_confirmation"
                disabled={isSubmitting}
                placeholder="Re-enter password"
                value={formData.password_confirmation}
                onChange={handleChange}
                className="w-full bg-slate-900/90 text-slate-100 placeholder-slate-500 text-xs rounded-xl pl-10 pr-4 py-2.5 border border-slate-800 focus:outline-none focus:border-sky-500/60 disabled:opacity-60"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl ssgi-gradient-bg text-white font-semibold text-xs shadow-lg shadow-sky-500/25 hover:brightness-110 transition-all flex items-center justify-center gap-2 cursor-pointer mt-3 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Registering Account...</span>
              </>
            ) : (
              <>
                <span>Register Account</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="mt-5 pt-5 border-t border-slate-800/80 text-center">
          <p className="text-xs text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-sky-400 hover:underline font-medium">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
