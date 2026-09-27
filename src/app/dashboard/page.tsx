'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { ShieldCheck, Plus, FolderGit2, Cpu, Trash2, LogOut, ArrowRight, Settings, FileCode2, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import { useTheme } from '@/context/ThemeContext';

interface ReviewIssue {
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status?: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
}

interface Review {
  id: string;
  score: number;
  createdAt: string;
  issues: ReviewIssue[];
}

interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  _count: { files: number; reviews: number };
  reviews?: Review[];
  files?: { path: string }[];
}

interface AiProvider {
  id: string;
  name: string;
  baseUrl: string;
  apiKey: string;
  modelName: string;
  isDefault: boolean;
}

export default function DashboardPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [projects, setProjects] = useState<Project[]>([]);
  const [providers, setProviders] = useState<AiProvider[]>([]);
  const [user, setUser] = useState<{ id: string; email: string; name: string } | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectDesc, setProjectDesc] = useState('');

  const [showProvidersModal, setShowProvidersModal] = useState(false);
  const [newProvName, setNewProvName] = useState('');
  const [newProvBaseUrl, setNewProvBaseUrl] = useState('http://localhost:1234/v1');
  const [newProvApiKey, setNewProvApiKey] = useState('');
  const [newProvModel, setNewProvModel] = useState('qwen2.5-coder-7b-instruct');

  useEffect(() => {
    const uStr = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    if (uStr) {
      setUser(JSON.parse(uStr));
    }
    fetchData();
  }, [router]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [projRes, provRes] = await Promise.all([
        api.get('/projects'),
        api.get('/ai/providers'),
      ]);
      setProjects(projRes.data);
      setProviders(provRes.data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        localStorage.clear();
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/projects', { name: projectName, description: projectDesc });
      setShowCreateProject(false);
      setProjectName('');
      setProjectDesc('');
      router.push(`/dashboard/projects/${res.data.id}`);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create project');
    }
  };

  const handleDeleteProject = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      await api.delete(`/projects/${id}`);
      fetchData();
    } catch (err: any) {
      alert('Failed to delete project');
    }
  };

  const handleAddProvider = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/ai/providers', {
        name: newProvName,
        baseUrl: newProvBaseUrl,
        apiKey: newProvApiKey,
        modelName: newProvModel,
        isDefault: providers.length === 0,
      });
      setNewProvName('');
      setNewProvApiKey('');
      const res = await api.get('/ai/providers');
      setProviders(res.data);
    } catch (err: any) {
      alert('Failed to add provider');
    }
  };

  const handleSetDefaultProvider = async (id: string) => {
    try {
      await api.patch(`/ai/providers/${id}`, { isDefault: true });
      const res = await api.get('/ai/providers');
      setProviders(res.data);
    } catch (err: any) {
      alert('Failed to update provider');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
      isDark ? 'bg-[#070B14] text-slate-100' : 'bg-[#F4F5F7] text-slate-900'
    }`}>
      {/* Header Navbar */}
      <header className={`border-b sticky top-0 z-40 px-8 py-4 flex items-center justify-between backdrop-blur-md transition-colors ${
        isDark ? 'border-slate-800 bg-[#0D1321]/90' : 'border-slate-200/80 bg-white/90'
      }`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-xl shadow-md text-white">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <span className={`text-xl font-extrabold tracking-tight uppercase ${isDark ? 'text-white' : 'text-slate-900'}`}>
            ReviewPulse Dashboard
          </span>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />

          <button
            onClick={() => setShowProvidersModal(true)}
            className={`px-4 py-2 border rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition ${
              isDark ? 'bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800' : 'bg-slate-100 border-slate-200 text-slate-800 hover:bg-slate-200'
            }`}
          >
            <Cpu className="w-4 h-4 text-blue-500" />
            AI Config ({providers.length})
          </button>

          <div className="text-right text-xs">
            <p className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{user?.name || 'Developer'}</p>
            <p className="text-slate-400 text-[11px] font-mono">{user?.email}</p>
          </div>

          <button
            onClick={handleLogout}
            className={`p-2 rounded-xl transition ${
              isDark ? 'text-slate-400 hover:text-rose-400 hover:bg-slate-800' : 'text-slate-500 hover:text-rose-600 hover:bg-slate-100'
            }`}
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto w-full px-8 py-10 flex-1">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase font-bold block mb-1">
              REPOSITORY PORTFOLIO
            </span>
            <h1 className={`text-3xl font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>Project Code Health</h1>
          </div>
          <button
            onClick={() => setShowCreateProject(true)}
            className={`px-6 py-3 font-bold text-xs uppercase tracking-wider rounded-full shadow-lg flex items-center gap-2 transition ${
              isDark ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-slate-900 hover:bg-slate-800 text-white'
            }`}
          >
            <Plus className="w-4 h-4" /> Import Repository
          </button>
        </div>

        {loading ? (
          <div className="py-20 text-center text-slate-400 text-xs font-mono">Loading developer projects...</div>
        ) : projects.length === 0 ? (
          <div className={`border rounded-3xl p-16 text-center shadow-sm ${
            isDark ? 'bg-[#0D1321] border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center mx-auto mb-4 font-mono text-xl font-bold ${
              isDark ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-blue-50 border-blue-100 text-blue-600'
            }`}>
              ◇
            </div>
            <h3 className={`text-xl font-extrabold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>No projects yet</h3>
            <p className="text-slate-400 text-xs max-w-md mx-auto mb-6 leading-relaxed">
              Import your first repository and let ReviewPulse analyze your code structure, security, and performance.
            </p>
            <button
              onClick={() => setShowCreateProject(true)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider rounded-full shadow-md inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Import Repository
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((p) => {
              const latestReview = p.reviews && p.reviews.length > 0 ? p.reviews[0] : null;
              const healthScore = latestReview?.score ?? 85;

              return (
                <div
                  key={p.id}
                  onClick={() => router.push(`/dashboard/projects/${p.id}`)}
                  className={`border rounded-3xl p-6 transition cursor-pointer flex flex-col justify-between group shadow-sm hover:shadow-md ${
                    isDark ? 'bg-[#0D1321] border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200/90'
                  }`}
                >
                  <div>
                    {/* Header: Title & Stack Tag */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <span className={`text-[10px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full font-bold border ${
                          isDark ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-blue-50 border-blue-100 text-blue-600'
                        }`}>
                          TypeScript &bull; Node
                        </span>
                        <h3 className={`text-lg font-extrabold transition mt-2 ${
                          isDark ? 'text-white group-hover:text-blue-400' : 'text-slate-900 group-hover:text-blue-600'
                        }`}>{p.name}</h3>
                      </div>
                      <button
                        onClick={(e) => handleDeleteProject(p.id, e)}
                        className={`p-1.5 rounded-xl transition ${
                          isDark ? 'text-slate-500 hover:text-rose-400 hover:bg-slate-800' : 'text-slate-400 hover:text-rose-600 hover:bg-slate-100'
                        }`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <p className={`text-xs line-clamp-2 mb-6 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {p.description || 'Repository codebase auditor container.'}
                    </p>

                    {/* Developer Health Score & Summary Badge */}
                    <div className={`p-4 rounded-2xl border mb-4 flex items-center justify-between ${
                      isDark ? 'bg-[#111827] border-slate-800' : 'bg-slate-50 border-slate-200/80'
                    }`}>
                      <div>
                        <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">Health Score</span>
                        <span className={`text-2xl font-extrabold font-mono ${healthScore >= 80 ? (isDark ? 'text-emerald-400' : 'text-emerald-600') : healthScore >= 60 ? (isDark ? 'text-amber-400' : 'text-amber-600') : (isDark ? 'text-rose-400' : 'text-rose-600')}`}>
                          {healthScore} <span className="text-xs text-slate-400 font-normal">/ 100</span>
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">Last Review</span>
                        <span className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          {latestReview ? new Date(latestReview.createdAt).toLocaleDateString() : 'Pending'}
                        </span>
                      </div>
                    </div>

                    {/* Findings Severity Breakdown */}
                    <div className="flex items-center gap-2 mb-4 text-[11px]">
                      <span className={`px-2.5 py-0.5 rounded-full font-mono font-bold border ${
                        isDark ? 'bg-rose-500/20 border-rose-500/30 text-rose-400' : 'bg-rose-50 border-rose-200 text-rose-700'
                      }`}>
                        2 Critical
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full font-mono font-bold border ${
                        isDark ? 'bg-amber-500/20 border-amber-500/30 text-amber-400' : 'bg-amber-50 border-amber-200 text-amber-700'
                      }`}>
                        4 High
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full font-mono font-bold border ${
                        isDark ? 'bg-blue-500/20 border-blue-500/30 text-blue-400' : 'bg-blue-50 border-blue-200 text-blue-700'
                      }`}>
                        {p._count.files} Files
                      </span>
                    </div>
                  </div>

                  {/* Footer CTA */}
                  <div className={`border-t pt-4 flex items-center justify-between text-xs font-bold ${
                    isDark ? 'border-slate-800 text-blue-400 group-hover:text-blue-300' : 'border-slate-100 text-slate-900 group-hover:text-blue-600'
                  }`}>
                    <span className="uppercase tracking-wider">Open Workspace</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Modal: Create Project */}
      {showCreateProject && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className={`border rounded-3xl p-6 w-full max-w-md shadow-2xl ${
            isDark ? 'bg-[#0D1321] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <h2 className="text-lg font-extrabold mb-4">Import New Repository Project</h2>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono font-bold tracking-widest text-slate-400 uppercase mb-1">Project Name</label>
                <input
                  type="text"
                  required
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="e.g. Portfolio API, Payment Service"
                  className={`w-full border rounded-2xl px-4 py-2.5 text-xs focus:outline-none focus:border-blue-600 font-mono ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono font-bold tracking-widest text-slate-400 uppercase mb-1">Description</label>
                <textarea
                  rows={3}
                  value={projectDesc}
                  onChange={(e) => setProjectDesc(e.target.value)}
                  placeholder="Brief summary of code scope and tech stack..."
                  className={`w-full border rounded-2xl px-4 py-2.5 text-xs focus:outline-none focus:border-blue-600 ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateProject(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase rounded-full shadow-md"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: AI Provider Management */}
      {showProvidersModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className={`border rounded-3xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto ${
            isDark ? 'bg-[#0D1321] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-extrabold">AI Provider Configuration</h2>
                <p className="text-xs text-slate-400">Runtime selection of OpenAI, LM Studio, Ollama, or OpenRouter endpoints</p>
              </div>
              <button onClick={() => setShowProvidersModal(false)} className="text-slate-400 hover:text-white text-xs font-bold">Close</button>
            </div>

            <div className="space-y-3 mb-8">
              {providers.map((prov) => (
                <div key={prov.id} className={`p-4 border rounded-2xl flex items-center justify-between ${
                  isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs">{prov.name}</span>
                      {prov.isDefault && (
                        <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold rounded-full">Default</span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 font-mono">
                      URL: <code className="text-blue-500">{prov.baseUrl}</code> | Model: <code className="text-purple-500">{prov.modelName}</code>
                    </p>
                  </div>
                  {!prov.isDefault && (
                    <button
                      onClick={() => handleSetDefaultProvider(prov.id)}
                      className={`px-3 py-1.5 border text-xs font-bold rounded-full transition ${
                        isDark ? 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      Set Default
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="border-t border-slate-800 pt-6">
              <h3 className="text-xs font-bold mb-3 uppercase tracking-wider">Add Custom Provider</h3>
              <form onSubmit={handleAddProvider} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase mb-1">Provider Label</label>
                  <input
                    type="text"
                    required
                    placeholder="LM Studio Local"
                    value={newProvName}
                    onChange={(e) => setNewProvName(e.target.value)}
                    className={`w-full border rounded-2xl px-3 py-2 text-xs ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase mb-1">Base URL</label>
                  <input
                    type="text"
                    required
                    placeholder="http://localhost:1234/v1"
                    value={newProvBaseUrl}
                    onChange={(e) => setNewProvBaseUrl(e.target.value)}
                    className={`w-full border rounded-2xl px-3 py-2 text-xs font-mono ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase mb-1">API Key</label>
                  <input
                    type="password"
                    placeholder="sk-..."
                    value={newProvApiKey}
                    onChange={(e) => setNewProvApiKey(e.target.value)}
                    className={`w-full border rounded-2xl px-3 py-2 text-xs font-mono ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase mb-1">Model Name</label>
                  <input
                    type="text"
                    required
                    placeholder="qwen2.5-coder, gpt-4o-mini"
                    value={newProvModel}
                    onChange={(e) => setNewProvModel(e.target.value)}
                    className={`w-full border rounded-2xl px-3 py-2 text-xs font-mono ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
                <div className="md:col-span-2 pt-2">
                  <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full text-xs font-bold uppercase tracking-wider shadow-md">
                    Save AI Provider Configuration
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
