import React, { useState, useEffect, useCallback } from 'react';
import { BookOpen, AlertCircle, RefreshCw } from 'lucide-react';
import resourceService from '../services/resourceService';
import ResourceCard from '../components/ResourceCard';
import SearchBar from '../components/SearchBar';
import CategoryFilter from '../components/CategoryFilter';
import Pagination from '../components/Pagination';
import Loading from '../components/Loading';
import ErrorComponent from '../components/ErrorComponent';

// Fallback dataset if REST API server is offline during development preview
const MOCK_RESOURCES = [
  {
    id: 1,
    title: 'Ethiopian Space Science Strategy & Ground Station Framework',
    author: 'SSGI Research Division',
    category: 'Space Science',
    type: 'Research Paper',
    cover_image: null,
    pages: 142,
    year: '2024',
    description: 'Comprehensive policy and technical guidelines for space science research and ground station operations.',
  },
  {
    id: 2,
    title: 'Geospatial Data Infrastructure & Land Cover Analysis Manual',
    author: 'Geospatial Information Institute',
    category: 'Geospatial Analytics',
    type: 'Training Material',
    cover_image: null,
    pages: 98,
    year: '2023',
    description: 'Standard operating procedures for remote sensing satellite imagery processing and land use mapping.',
  },
  {
    id: 3,
    title: 'Ionospheric Physics & High-Latitude GNSS Interference Handbook',
    author: 'Dr. Tessema & SSGI Physics Group',
    category: 'Space Physics',
    type: 'Technical Document',
    cover_image: null,
    pages: 210,
    year: '2024',
    description: 'Analysis of equatorial ionospheric irregularities affecting satellite navigation systems in East Africa.',
  },
  {
    id: 4,
    title: 'Practical QGIS & PyQGIS Automation Training Manual',
    author: 'Capacity Building Directorate',
    category: 'Training Materials',
    type: 'Book',
    cover_image: null,
    pages: 76,
    year: '2025',
    description: 'Hands-on training tutorial covering PyQGIS plugin development and batch spatial analytics.',
  },
];

const MOCK_CATEGORIES = [
  { id: 1, name: 'Space Science' },
  { id: 2, name: 'Geospatial Analytics' },
  { id: 3, name: 'Space Physics' },
  { id: 4, name: 'Training Materials' },
];

const Resources = () => {
  const [resources, setResources] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch categories
      let catData;
      try {
        catData = await resourceService.getCategories();
        setCategories(catData.categories || catData.data || catData);
      } catch (err) {
        console.warn('API /categories endpoint offline, using local mock categories:', err);
        setCategories(MOCK_CATEGORIES);
      }

      // 2. Fetch paginated resources
      let resData;
      try {
        resData = await resourceService.getResources({
          q: searchQuery,
          category_id: selectedCategory,
          page: currentPage,
        });
        const items = resData.data || resData.resources || resData;
        setResources(Array.isArray(items) ? items : MOCK_RESOURCES);
        setTotalPages(resData.last_page || resData.total_pages || 1);
      } catch (err) {
        console.warn('API /resources endpoint offline, using filtered mock resources:', err);
        let items = MOCK_RESOURCES;
        if (searchQuery.trim()) {
          items = items.filter(
            (r) =>
              r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              r.author.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }
        if (selectedCategory) {
          items = items.filter(
            (r) => r.category === selectedCategory || r.category?.id === selectedCategory
          );
        }
        setResources(items);
        setTotalPages(1);
      }
    } catch (err) {
      setError('Failed to load digital resources. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory, currentPage]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
          <BookOpen className="text-sky-400" />
          SSGI Digital Library Resources
        </h1>
        <p className="text-slate-400 text-xs mt-1">
          Explore books, research papers, training materials, and technical documents online in read-only mode.
        </p>
      </div>

      {/* Search & Filter Section */}
      <div className="glass-panel p-4 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <SearchBar
            value={searchQuery}
            onChange={(val) => {
              setSearchQuery(val);
              setCurrentPage(1);
            }}
            onClear={() => setSearchQuery('')}
          />
        </div>

        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={(catId) => {
            setSelectedCategory(catId);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* Main Content Area */}
      {loading ? (
        <Loading message="Loading digital library resources..." />
      ) : error ? (
        <ErrorComponent message={error} onRetry={fetchData} />
      ) : resources.length === 0 ? (
        /* Empty State */
        <div className="glass-card p-12 rounded-3xl border border-slate-800 text-center max-w-md mx-auto my-8 space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 mx-auto">
            <BookOpen size={28} />
          </div>
          <h3 className="text-base font-bold text-slate-100">No Resources Found</h3>
          <p className="text-slate-400 text-xs leading-relaxed">
            No digital library documents matched your search query or selected category filter.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory(null);
            }}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        /* Resource Grid */
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((item) => (
              <ResourceCard key={item.id} resource={item} />
            ))}
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      )}
    </div>
  );
};

export default Resources;
