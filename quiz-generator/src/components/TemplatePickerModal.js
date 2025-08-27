'use client';
import { useEffect, useMemo, useState } from 'react';

export default function TemplatePickerModal({ isOpen, onClose, onSelect, apiBase }) {
  const [activeTab, setActiveTab] = useState('my'); // 'my' | 'templates' | 'public'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [myQuizzes, setMyQuizzes] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [publicQuizzes, setPublicQuizzes] = useState([]);
  const [search, setSearch] = useState('');

  // Fetch data when modal opens
  useEffect(() => {
    if (!isOpen) return;
    setError('');

    const fetchMy = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('quizToken') : null;
        if (!token) { setMyQuizzes([]); return; }
        const r = await fetch(`${apiBase}/editor/my-quizzes`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (!r.ok) throw new Error('Failed to load your quizzes');
        const data = await r.json();
        setMyQuizzes(Array.isArray(data) ? data : []);
      } catch (e) { setError(e.message); }
    };

    const fetchTemplates = async () => {
      try {
        const r = await fetch(`${apiBase}/editor/templates`);
        if (!r.ok) throw new Error('Failed to load templates');
        const data = await r.json();
        setTemplates(Array.isArray(data) ? data : []);
      } catch (e) { setError(e.message); }
    };

    const fetchPublic = async () => {
      try {
        const r = await fetch(`${apiBase}/quizzes/browse/public`);
        if (!r.ok) throw new Error('Failed to load public quizzes');
        const data = await r.json();
        setPublicQuizzes(Array.isArray(data) ? data : []);
      } catch (e) { /* non-fatal */ }
    };

    setLoading(true);
    Promise.all([fetchMy(), fetchTemplates(), fetchPublic()]).finally(() => setLoading(false));
  }, [isOpen, apiBase]);

  const list = useMemo(() => {
    const q = search.trim().toLowerCase();
    const src = activeTab === 'my' ? myQuizzes : activeTab === 'templates' ? templates : publicQuizzes;
    if (!q) return src;
    return (src || []).filter(item => (item.title || '').toLowerCase().includes(q));
  }, [activeTab, myQuizzes, templates, publicQuizzes, search]);

  if (!isOpen) return null;

  const handleUse = async (item) => {
    try {
      // Built-in templates and my quizzes already contain full questions
      if (activeTab === 'templates' || activeTab === 'my') {
        const normalized = {
          title: item.title,
          description: item.description || '',
          language: item.language || 'English',
          difficulty: item.difficulty || 'easy',
          questions: item.questions || [],
          id: item.id
        };
        onSelect(normalized);
        return;
      }
      // Public list needs a fetch for full content
      if (activeTab === 'public' && item?.id) {
        setLoading(true);
        try {
          const r = await fetch(`${apiBase}/quizzes/${item.id}`);
          if (!r.ok) throw new Error('Failed to load quiz');
          const full = await r.json();
          const normalized = {
            title: full.title,
            description: full.description || '',
            language: full.language || 'English',
            difficulty: full.difficulty || 'easy',
            questions: full.questions || [],
            id: full.id
          };
          onSelect(normalized);
        } finally { setLoading(false); }
      }
    } catch (e) {
      setError(e.message || 'Failed to use template');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white w-full max-w-3xl mx-4 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">Choose a template</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl leading-none">×</button>
        </div>

        {/* Tabs */}
        <div className="px-6 pt-4 flex gap-2">
          <button onClick={() => setActiveTab('my')} className={`px-3 py-2 rounded-lg text-sm border ${activeTab==='my' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300'}`}>My Quizzes</button>
          <button onClick={() => setActiveTab('templates')} className={`px-3 py-2 rounded-lg text-sm border ${activeTab==='templates' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300'}`}>Built-in Templates</button>
          <button onClick={() => setActiveTab('public')} className={`px-3 py-2 rounded-lg text-sm border ${activeTab==='public' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300'}`}>Public</button>
          <div className="flex-1" />
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search..." className="form-input max-w-xs" />
        </div>

        {/* Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16"><div className="loading-spinner"></div></div>
          ) : error ? (
            <div className="text-red-600 text-sm">{error}</div>
          ) : list?.length === 0 ? (
            <div className="text-gray-600 text-sm">No items found.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {list.map((item) => (
                <div key={`${activeTab}-${item.id || item.title}`} className="glass-card p-4 rounded-xl">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-gray-900">{item.title}</div>
                      <div className="text-xs text-gray-600 mt-1">
                        <span className="mr-2">{item.language || 'English'}</span>
                        <span className="mr-2">{item.difficulty || 'easy'}</span>
                        {Array.isArray(item.questions) && <span>{item.questions.length} questions</span>}
                        {!Array.isArray(item.questions) && typeof item.questionsCount === 'number' && <span>{item.questionsCount} questions</span>}
                      </div>
                    </div>
                    <button onClick={() => handleUse(item)} className="btn-primary px-3 py-2 text-sm">Use</button>
                  </div>
                  {item.description && <p className="text-sm text-gray-700 mt-2 line-clamp-2">{item.description}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
