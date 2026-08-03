import React, { useState, useEffect, useCallback } from 'react';
import {
  FolderKanban, Search, RefreshCw, Eye, Edit3,
  Archive, Loader2, AlertCircle, X, CheckCircle2, Tag
} from 'lucide-react';
import resourceService from '../services/resourceService';
import Loading from '../components/Loading';
import ErrorComponent from '../components/ErrorComponent';

const MOCK_RESOURCES = [
  { id: 1, title: 'Ethiopian Space Science Strategy & Ground Station Framework', category: 'Space Science', author: 'SSGI Research Division', pages: 142, chunks_count: 85, year: '2024', status: 'published' },
  { id: 2, title: 'Geospatial Data Infrastructure & Land Cover Analysis Manual', category: 'Geospatial Analytics', author: 'Geospatial Information Institute', pages: 98, chunks_count: 62, year: '2023', status: 'published' },
  { id: 3, title: 'Ionospheric Physics & High-Latitude GNSS Interference Handbook', category: 'Space Physics', author: 'Dr. Tessema & SSGI Physics Group', pages: 210, chunks_count: 130, year: '2024', status: 'published' },
  { id: 4, title: 'Practical QGIS & PyQGIS Automation Training Manual', category: 'Training Materials', author: 'Capacity Building Directorate', pages: 76, chunks_count: 45, year: '2025', status: 'draft' },
];

const STATUS_BADGE = {
  published: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  draft:     'bg-amber-50 text-amber-600 border-amber-200',
  archived:  'bg-gray-200 text-slate-500 border-gray-300',
};

/* ── Edit Modal ─────────────────────────────────────── */
const EditModal = ({ resource, categories, onSave, onClose, saving }) => {
  const [form, setForm] = useState({
    title:       resource.title || '',
    author:      resource.author || '',
    description: resource.description || '',
    category_id: resource.category_id || resource.category || '',
    year:        resource.year || '',
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.title.trim())  e.title  = 'Title is required.';
    if (!form.author.trim()) e.author = 'Author is required.';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4">
      <div className="glass-panel w-full max-w-lg rounded-3xl border border-gray-200 p-6 space-y-4 shadow-lg animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Edit3 size={16} className="text-blue-600" /> Edit Resource Metadata
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-gray-100 transition-colors cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3.5">
          {[['title','Title','e.g. Updated Document Title'],['author','Author','e.g. SSGI Directorate']].map(([n, l, ph]) => (
            <div key={n}>
              <label className="block text-xs font-semibold text-slate-600 mb-1">{l}</label>
              <input
                name={n} value={form[n]} onChange={handleChange} placeholder={ph}
                className={`w-full bg-white text-slate-800 placeholder-gray-400 text-xs rounded-xl px-4 py-2.5 border focus:outline-none transition-all ${
                  errors[n] ? 'border-rose-200' : 'border-gray-200 focus:border-blue-400'
                }`}
              />
              {errors[n] && <p className="mt-0.5 text-rose-600 text-[11px] flex items-center gap-1"><AlertCircle size={11}/>{errors[n]}</p>}
            </div>
          ))}

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Category</label>
            <select
              name="category_id" value={form.category_id} onChange={handleChange}
              className="w-full bg-white text-slate-800 text-xs rounded-xl px-4 py-2.5 border border-gray-200 focus:outline-none focus:border-blue-400 cursor-pointer"
            >
              <option value="">Select category</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Year</label>
            <input
              name="year" type="number" value={form.year} onChange={handleChange}
              className="w-full bg-white text-slate-800 text-xs rounded-xl px-4 py-2.5 border border-gray-200 focus:outline-none focus:border-blue-400"
            />
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-slate-700 text-xs font-semibold border border-gray-300 cursor-pointer">
            Cancel
          </button>
          <button
            onClick={() => { if (validate()) onSave(resource.id, form); }}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Main Component ─────────────────────────────────── */
const ManageResources = () => {
  const [resources, setResources]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving]         = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      let res, cats;
      try {
        [res, cats] = await Promise.all([resourceService.getResources(), resourceService.getCategories()]);
        setResources(res.data || res.resources || MOCK_RESOURCES);
        setCategories(cats.categories || cats.data || cats);
      } catch {
        setResources(MOCK_RESOURCES);
        setCategories([{ id: 1, name: 'Space Science' }, { id: 2, name: 'Geospatial Analytics' }, { id: 3, name: 'Space Physics' }, { id: 4, name: 'Training Materials' }]);
      }
    } catch { setError('Failed to load resources.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSaveEdit = async (id, data) => {
    setSaving(true);
    try {
      try { await resourceService.updateResource(id, data); }
      catch { console.warn('API updateResource offline, updating locally.'); }
      setResources((prev) => prev.map((r) => r.id === id ? { ...r, ...data, category: data.category_id || r.category } : r));
      setEditingItem(null);
    } catch { alert('Failed to save changes.'); }
    finally { setSaving(false); }
  };

  const handleArchive = async (id) => {
    if (!window.confirm('Archive this resource? It will no longer appear in the public library.')) return;
    try {
      try { await resourceService.archiveResource(id); }
      catch { console.warn('API archiveResource offline, updating locally.'); }
      setResources((prev) => prev.map((r) => r.id === id ? { ...r, status: 'archived' } : r));
    } catch { alert('Failed to archive resource.'); }
  };

  const filtered = resources.filter((r) =>
    [r.title, r.author, r.category].some((f) => f?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            <FolderKanban className="text-emerald-600" /> Manage Digital Resources
          </h1>
          <p className="text-slate-500 text-xs mt-1">Edit resource metadata, monitor vector chunks, and archive outdated documents.</p>
        </div>
        <button onClick={fetchData} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 border border-gray-300 text-slate-700 text-xs font-semibold cursor-pointer self-start">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Search */}
      <div className="glass-panel p-3 rounded-2xl border border-gray-200 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text" placeholder="Search by title, author, or category..."
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white text-slate-700 placeholder-gray-400 text-xs rounded-xl pl-10 pr-4 py-2 border border-gray-200 focus:outline-none focus:border-emerald-400"
          />
        </div>
        <span className="text-xs text-slate-500 font-medium whitespace-nowrap">{filtered.length} resources</span>
      </div>

      {loading ? <Loading message="Loading resources..." /> :
       error   ? <ErrorComponent message={error} onRetry={fetchData} /> : (
        <div className="glass-panel rounded-2xl border border-gray-200 overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 min-w-[720px]">
            <thead className="bg-white text-slate-500 uppercase text-[10px] tracking-wider border-b border-gray-200">
              <tr>
                <th className="px-6 py-3.5">Title</th>
                <th className="px-6 py-3.5">Category</th>
                <th className="px-6 py-3.5">Chunks</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-gray-100 transition-colors">
                  <td className="px-6 py-4 max-w-xs">
                    <p className="font-semibold text-slate-800 truncate">{r.title}</p>
                    <p className="text-slate-500 text-[11px] truncate">{r.author} &bull; {r.year}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-600 border border-blue-200 flex items-center gap-1 w-fit">
                      <Tag size={10} /> {typeof r.category === 'object' ? r.category?.name : r.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-[11px] text-slate-600">{r.chunks_count || '–'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${STATUS_BADGE[r.status] || STATUS_BADGE.draft}`}>
                      {r.status || 'published'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditingItem(r)}
                        className="p-1.5 rounded-lg bg-gray-100 hover:bg-blue-600 text-slate-600 hover:text-white transition-colors cursor-pointer border border-gray-300 hover:border-blue-400"
                        title="Edit metadata"
                      >
                        <Edit3 size={14} />
                      </button>
                      {r.status !== 'archived' && (
                        <button
                          onClick={() => handleArchive(r.id)}
                          className="p-1.5 rounded-lg bg-gray-100 hover:bg-amber-100 text-slate-600 hover:text-amber-600 transition-colors cursor-pointer border border-gray-300 hover:border-amber-300"
                          title="Archive resource"
                        >
                          <Archive size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-12 text-center text-slate-500 text-xs">No resources found.</div>
          )}
        </div>
      )}

      {editingItem && (
        <EditModal
          resource={editingItem}
          categories={categories}
          saving={saving}
          onSave={handleSaveEdit}
          onClose={() => setEditingItem(null)}
        />
      )}
    </div>
  );
};

export default ManageResources;
