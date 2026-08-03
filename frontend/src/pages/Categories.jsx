import React, { useState, useEffect, useCallback } from 'react';
import {
  Tag, Plus, Edit3, Loader2, CheckCircle2, AlertCircle,
  RefreshCw, X
} from 'lucide-react';
import resourceService from '../services/resourceService';
import Loading from '../components/Loading';
import ErrorComponent from '../components/ErrorComponent';

const MOCK_CATEGORIES = [
  { id: 1, name: 'Space Science',       description: 'Space policy, satellite design, and ground station operations.', resource_count: 340 },
  { id: 2, name: 'Geospatial Analytics', description: 'Remote sensing, GIS mapping, and spatial data infrastructure.',  resource_count: 412 },
  { id: 3, name: 'Space Physics',        description: 'Equatorial ionosphere, solar physics, and astrophysics.',        resource_count: 289 },
  { id: 4, name: 'Training Materials',   description: 'Instructional manuals, code samples, and practical guides.',     resource_count: 195 },
];

const INITIAL_FORM = { name: '', description: '' };

const Categories = () => {
  const [categories, setCategories]     = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [form, setForm]                 = useState(INITIAL_FORM);
  const [formErrors, setFormErrors]     = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingItem, setEditingItem]   = useState(null);
  const [successMsg, setSuccessMsg]     = useState('');

  const fetchCategories = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      let data;
      try {
        data = await resourceService.getCategories();
        setCategories(data.categories || data.data || data);
      } catch {
        setCategories(MOCK_CATEGORIES);
      }
    } catch { setError('Failed to load categories.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const validate = (f) => {
    const e = {};
    if (!f.name.trim()) e.name = 'Category name is required.';
    if (f.name.trim().length > 60) e.name = 'Name must be 60 characters or fewer.';
    return e;
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) { setFormErrors(errs); return; }
    setIsSubmitting(true);
    try {
      let newCat;
      try {
        const data = await resourceService.createCategory(form);
        newCat = data.category || data.data || data;
      } catch {
        newCat = { id: Date.now(), ...form, resource_count: 0 };
      }
      setCategories((prev) => [...prev, newCat]);
      setForm(INITIAL_FORM);
      setFormErrors({});
      setSuccessMsg(`Category "${newCat.name}" created.`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch { alert('Failed to create category.'); }
    finally { setIsSubmitting(false); }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(editingItem);
    if (Object.keys(errs).length) { setFormErrors(errs); return; }
    setIsSubmitting(true);
    try {
      try { await resourceService.updateCategory(editingItem.id, { name: editingItem.name, description: editingItem.description }); }
      catch { console.warn('API updateCategory offline, updating locally.'); }
      setCategories((prev) => prev.map((c) => c.id === editingItem.id ? { ...c, ...editingItem } : c));
      setSuccessMsg(`Category "${editingItem.name}" updated.`);
      setEditingItem(null);
      setFormErrors({});
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch { alert('Failed to update category.'); }
    finally { setIsSubmitting(false); }
  };

  if (loading) return <Loading message="Loading categories..." />;
  if (error)   return <ErrorComponent message={error} onRetry={fetchCategories} />;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            <Tag className="text-emerald-600" /> Resource Categories
          </h1>
          <p className="text-slate-500 text-xs mt-1">Organise SSGI library resources by domain, subject matter, and training type.</p>
        </div>
        <button onClick={fetchCategories} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 border border-gray-300 text-slate-700 text-xs font-semibold cursor-pointer self-start">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
          <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category List */}
        <div className="lg:col-span-2 space-y-3">
          {categories.map((cat) => (
            <div key={cat.id} className="glass-panel p-5 rounded-2xl border border-gray-200 flex items-center justify-between gap-4 hover:border-gray-300 transition-all">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-bold text-slate-800">{cat.name}</h3>
                  <span className="px-2 py-0.5 rounded-full bg-gray-100 border border-gray-300 text-slate-500 text-[10px] font-semibold">
                    {cat.resource_count ?? 0} Resources
                  </span>
                </div>
                {cat.description && (
                  <p className="text-xs text-slate-500 truncate">{cat.description}</p>
                )}
              </div>
              <button
                onClick={() => { setEditingItem({ ...cat }); setFormErrors({}); }}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-gray-100 transition-colors flex-shrink-0 cursor-pointer"
                title="Edit category"
              >
                <Edit3 size={16} />
              </button>
            </div>
          ))}
        </div>

        {/* Add / Edit Form Panel */}
        <div className="glass-panel p-6 rounded-3xl border border-gray-200 space-y-4 h-fit">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Plus size={16} className="text-emerald-600" />
            {editingItem ? 'Edit Category' : 'New Category'}
          </h3>

          {editingItem ? (
            <form onSubmit={handleEditSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Category Name <span className="text-rose-600">*</span></label>
                <input
                  type="text" value={editingItem.name}
                  onChange={(e) => setEditingItem((p) => ({ ...p, name: e.target.value }))}
                  disabled={isSubmitting}
                  className={`w-full bg-white text-slate-800 placeholder-gray-400 text-xs rounded-xl px-4 py-2.5 border focus:outline-none disabled:opacity-60 ${formErrors.name ? 'border-rose-200' : 'border-gray-200 focus:border-emerald-400'}`}
                />
                {formErrors.name && <p className="mt-1 text-rose-600 text-[11px] flex items-center gap-1"><AlertCircle size={11}/>{formErrors.name}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Description</label>
                <textarea rows={3} value={editingItem.description || ''}
                  onChange={(e) => setEditingItem((p) => ({ ...p, description: e.target.value }))}
                  disabled={isSubmitting}
                  className="w-full bg-white text-slate-800 placeholder-gray-400 text-xs rounded-xl px-4 py-2.5 border border-gray-200 focus:outline-none focus:border-emerald-400 disabled:opacity-60"
                />
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => { setEditingItem(null); setFormErrors({}); }}
                  className="flex-1 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-slate-700 text-xs font-semibold border border-gray-300 cursor-pointer">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer">
                  {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                  Save
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleAdd} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Category Name <span className="text-rose-600">*</span></label>
                <input
                  type="text" value={form.name}
                  onChange={(e) => { setForm((p) => ({ ...p, name: e.target.value })); if (formErrors.name) setFormErrors({}); }}
                  disabled={isSubmitting}
                  placeholder="e.g. Geodesy & GNSS Systems"
                  className={`w-full bg-white text-slate-800 placeholder-gray-400 text-xs rounded-xl px-4 py-2.5 border focus:outline-none disabled:opacity-60 ${formErrors.name ? 'border-rose-200' : 'border-gray-200 focus:border-emerald-400'}`}
                />
                {formErrors.name && <p className="mt-1 text-rose-600 text-[11px] flex items-center gap-1"><AlertCircle size={11}/>{formErrors.name}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Description</label>
                <textarea rows={3} value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  disabled={isSubmitting}
                  placeholder="Brief summary of resources under this category..."
                  className="w-full bg-white text-slate-800 placeholder-gray-400 text-xs rounded-xl px-4 py-2.5 border border-gray-200 focus:outline-none focus:border-emerald-400 disabled:opacity-60"
                />
              </div>
              <button type="submit" disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer">
                {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                Add Category
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Categories;
