'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import {
  ArrowLeft, Upload, FileText, Code2, ShieldCheck, Zap, Sparkles,
  MessageSquare, Terminal, ChevronRight, Folder, FileCode, CheckCircle2,
  AlertTriangle, RefreshCw, Send, BookOpen, Layers, FolderGit2, Copy, Check, Eye, X, Filter
} from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import { useTheme } from '@/context/ThemeContext';

interface FileRecord {
  id: string;
  path: string;
  name: string;
  content: string;
  size: number;
  language: string;
}

interface ReviewIssue {
  id?: string;
  file: string;
  line?: number;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status?: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  title: string;
  description: string;
  recommendation: string;
  originalCode?: string;
  fixedCode?: string;
}

interface Review {
  id: string;
  type: string;
  summary: string;
  score: number;
  issues: ReviewIssue[];
  createdAt: string;
}

interface ProjectDetail {
  id: string;
  name: string;
  description: string;
  files: FileRecord[];
  reviews: Review[];
}

export default function ProjectWorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [selectedFile, setSelectedFile] = useState<FileRecord | null>(null);
  const [loading, setLoading] = useState(true);

  // Search/Filter for Files
  const [fileFilter, setFileFilter] = useState('');

  // Review & Findings States
  const [reviewType, setReviewType] = useState<'SECURITY' | 'PERFORMANCE' | 'CODE_QUALITY' | 'TECH_DEBT'>('SECURITY');
  const [runningReview, setRunningReview] = useState(false);
  const [reviewStep, setReviewStep] = useState(0); // 0: Idle, 1: Struct, 2: Security, 3: Perf, 4: Done
  const [activeReview, setActiveReview] = useState<Review | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<ReviewIssue | null>(null);

  // Panel 3 Right Mode: 'findings' | 'chat' | 'docs' | 'upload'
  const [rightPanelTab, setRightPanelTab] = useState<'findings' | 'chat' | 'docs' | 'upload'>('findings');
  const [issueFilterStatus, setIssueFilterStatus] = useState<'ALL' | 'OPEN' | 'RESOLVED'>('ALL');

  // Interactive Fix Diff Modal / Card Toggle
  const [expandedFixId, setExpandedFixId] = useState<string | null>(null);
  const [copiedFixId, setCopiedFixId] = useState<string | null>(null);

  // Upload States
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [githubUrl, setGithubUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState('');

  // Chat States
  const [chatSessionId, setChatSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [sendingChat, setSendingChat] = useState(false);

  // Docs Generator State
  const [generatedDocs, setGeneratedDocs] = useState<string>('');
  const [generatingDocs, setGeneratingDocs] = useState(false);

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const fetchProject = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/projects/${projectId}`);
      setProject(res.data);
      if (res.data.files?.length > 0) {
        setSelectedFile(res.data.files[0]);
      }
      if (res.data.reviews?.length > 0) {
        const rev = res.data.reviews[0];
        const parsedIssues = typeof rev.issues === 'string' ? JSON.parse(rev.issues) : rev.issues;
        const normRev = { ...rev, issues: parsedIssues };
        setActiveReview(normRev);
        if (parsedIssues?.length > 0) {
          setSelectedIssue(parsedIssues[0]);
        }
      }
    } catch (err: any) {
      if (err.response?.status === 401) router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleRunReview = async () => {
    if (!project || project.files.length === 0) {
      alert('Please import code files first before running an AI audit.');
      setRightPanelTab('upload');
      return;
    }
    setRunningReview(true);
    setReviewStep(1);

    setTimeout(() => setReviewStep(2), 600);
    setTimeout(() => setReviewStep(3), 1200);

    try {
      const res = await api.post('/reviews', {
        projectId,
        type: reviewType,
      });
      setReviewStep(4);
      const parsedIssues = typeof res.data.issues === 'string' ? JSON.parse(res.data.issues) : res.data.issues;
      const newReview = { ...res.data, issues: parsedIssues };
      setActiveReview(newReview);
      if (parsedIssues?.length > 0) {
        setSelectedIssue(parsedIssues[0]);
      }
      fetchProject();
      setRightPanelTab('findings');
    } catch (err: any) {
      alert('Review Generation Error: ' + (err.response?.data?.message || err.message));
    } finally {
      setRunningReview(false);
      setReviewStep(0);
    }
  };

  const handleUpdateIssueStatus = async (issue: ReviewIssue, newStatus: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED') => {
    if (!activeReview) return;
    const issueId = issue.id || issue.title;
    try {
      const res = await api.patch(`/reviews/${activeReview.id}/issues/${encodeURIComponent(issueId)}/status`, {
        status: newStatus,
      });
      const parsedIssues = typeof res.data.issues === 'string' ? JSON.parse(res.data.issues) : res.data.issues;
      setActiveReview((prev) => prev ? { ...prev, issues: parsedIssues } : null);
    } catch (err) {
      setActiveReview((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          issues: prev.issues.map((i) => (i.id === issue.id || i.title === issue.title ? { ...i, status: newStatus } : i)),
        };
      });
    }
  };

  const handleSelectIssue = (issue: ReviewIssue) => {
    setSelectedIssue(issue);
    if (project?.files) {
      const target = project.files.find((f) => f.path.includes(issue.file) || issue.file.includes(f.path));
      if (target) {
        setSelectedFile(target);
      }
    }
  };

  const handleExplainWithAI = (issue: ReviewIssue) => {
    setSelectedIssue(issue);
    setRightPanelTab('chat');
    initChatSession();
    const promptMsg = `Explain security issue in '${issue.file}' at line ${issue.line || 1}: ${issue.title}. Why is this vulnerable and what is the best practice fix?`;
    setChatInput(promptMsg);
  };

  const handleCopyFix = (issueId: string, codeStr: string) => {
    navigator.clipboard.writeText(codeStr);
    setCopiedFixId(issueId);
    setTimeout(() => setCopiedFixId(null), 2000);
  };

  const handleZipUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!zipFile) return;
    setUploading(true);
    setUploadMsg('');
    const formData = new FormData();
    formData.append('file', zipFile);

    try {
      const res = await api.post(`/projects/${projectId}/upload-zip`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploadMsg(res.data.message);
      fetchProject();
      setRightPanelTab('findings');
    } catch (err: any) {
      setUploadMsg('ZIP Upload Failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setUploading(false);
    }
  };

  const handleGithubImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubUrl) return;
    setUploading(true);
    setUploadMsg('');

    try {
      const res = await api.post(`/projects/${projectId}/import-github`, { repoUrl: githubUrl });
      setUploadMsg(res.data.message);
      fetchProject();
      setRightPanelTab('findings');
    } catch (err: any) {
      setUploadMsg('GitHub Import Failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setUploading(false);
    }
  };

  const initChatSession = async () => {
    if (chatSessionId) return;
    try {
      const res = await api.post('/chat/sessions', { projectId, title: 'Workspace Chat' });
      setChatSessionId(res.data.id);
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleSendChat = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim()) return;
    if (!chatSessionId) await initChatSession();

    const q = chatInput;
    setChatInput('');
    setMessages((prev) => [...prev, { role: 'user', content: q }]);
    setSendingChat(true);

    try {
      const sId = chatSessionId || (await api.post('/chat/sessions', { projectId })).data.id;
      if (!chatSessionId) setChatSessionId(sId);

      const res = await api.post('/chat/send', { sessionId: sId, question: q });
      setMessages((prev) => [...prev, { role: 'assistant', content: res.data.content }]);
    } catch (err: any) {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Error retrieving AI explanation.' }]);
    } finally {
      setSendingChat(false);
    }
  };

  const handleGenerateDocs = async () => {
    if (!project || project.files.length === 0) {
      alert('Import code files first to generate documentation.');
      return;
    }
    setGeneratingDocs(true);
    try {
      const res = await api.post('/ai/generate-docs', {
        files: project.files.map((f) => ({ path: f.path, content: f.content })),
      });
      setGeneratedDocs(res.data);
    } catch (err: any) {
      setGeneratedDocs('Failed to generate documentation.');
    } finally {
      setGeneratingDocs(false);
    }
  };

  const filteredFiles = project?.files?.filter((f) => f.path.toLowerCase().includes(fileFilter.toLowerCase())) || [];

  const issuesList = activeReview?.issues || [];
  const filteredIssues = issuesList.filter((i) => {
    if (issueFilterStatus === 'ALL') return true;
    if (issueFilterStatus === 'OPEN') return i.status !== 'RESOLVED';
    if (issueFilterStatus === 'RESOLVED') return i.status === 'RESOLVED';
    return true;
  });

  const criticalCount = issuesList.filter((i) => i.severity === 'CRITICAL' && i.status !== 'RESOLVED').length;
  const highCount = issuesList.filter((i) => i.severity === 'HIGH' && i.status !== 'RESOLVED').length;

  if (loading) {
    return <div className="py-20 text-center text-slate-400 font-mono text-xs">Loading developer workspace...</div>;
  }

  if (!project) {
    return <div className="py-20 text-center text-rose-600 font-mono text-xs">Project not found</div>;
  }

  return (
    <div className={`min-h-screen flex flex-col font-sans select-none overflow-hidden transition-colors duration-200 ${
      isDark ? 'bg-[#070B14] text-slate-100' : 'bg-[#F4F5F7] text-slate-900'
    }`}>
      {/* Workspace Header Bar */}
      <header className={`border-b px-6 py-3 flex items-center justify-between z-30 shadow-sm backdrop-blur-md transition-colors ${
        isDark ? 'border-slate-800 bg-[#0D1321]' : 'border-slate-200 bg-white'
      }`}>
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className={`p-2 rounded-xl transition ${
            isDark ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
          }`}>
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className={`font-extrabold text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>{project.name}</h1>
              <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold uppercase border ${
                isDark ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-blue-50 border-blue-200 text-blue-700'
              }`}>
                TypeScript &bull; Node &bull; {project.files.length} files
              </span>
            </div>
          </div>
        </div>

        {/* Health Score & Audit Trigger */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          {activeReview && (
            <div className={`flex items-center gap-3 px-3.5 py-1.5 rounded-2xl border ${
              isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">Health Score</span>
              <span className={`text-sm font-extrabold font-mono ${
                activeReview.score >= 80 ? (isDark ? 'text-emerald-400' : 'text-emerald-600') : activeReview.score >= 60 ? (isDark ? 'text-amber-400' : 'text-amber-600') : (isDark ? 'text-rose-400' : 'text-rose-600')
              }`}>
                {activeReview.score} / 100
              </span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <select
              value={reviewType}
              onChange={(e: any) => setReviewType(e.target.value)}
              className={`border text-xs font-bold rounded-2xl px-3 py-2 focus:outline-none ${
                isDark ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            >
              <option value="SECURITY">🛡️ Security</option>
              <option value="PERFORMANCE">⚡ Performance</option>
              <option value="CODE_QUALITY">🧹 Code Quality</option>
              <option value="TECH_DEBT">🛠️ Tech Debt</option>
            </select>

            <button
              onClick={handleRunReview}
              disabled={runningReview}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-md transition"
            >
              <Sparkles className="w-4 h-4 text-blue-100" />
              {runningReview ? 'Auditing...' : 'Run AI Review'}
            </button>
          </div>
        </div>
      </header>

      {/* Main 3-Panel IDE Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* PANEL 1: IDE FILE TREE (Width 22%) */}
        <div className={`w-[22%] border-r flex flex-col ${
          isDark ? 'bg-[#0D1321] border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className={`p-3 border-b flex items-center justify-between ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
            <span className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              <Folder className="w-3.5 h-3.5 text-blue-500" /> Files ({project.files.length})
            </span>
            <button
              onClick={() => setRightPanelTab('upload')}
              className="text-[11px] font-bold text-blue-500 hover:underline uppercase"
            >
              + Import
            </button>
          </div>

          <div className={`p-2 border-b ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            <input
              type="text"
              placeholder="Filter files..."
              value={fileFilter}
              onChange={(e) => setFileFilter(e.target.value)}
              className={`w-full border rounded-xl px-2.5 py-1.5 text-xs placeholder-slate-400 focus:outline-none focus:border-blue-500 font-mono ${
                isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
              }`}
            />
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
            {filteredFiles.length === 0 ? (
              <div className="text-[11px] text-slate-400 p-4 text-center font-mono">
                No files found. Import repository files via top button.
              </div>
            ) : (
              filteredFiles.map((f) => {
                const isSelected = selectedFile?.id === f.id;
                const hasIssue = selectedIssue && (selectedIssue.file.includes(f.path) || f.path.includes(selectedIssue.file));

                return (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFile(f)}
                    className={`w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center justify-between truncate transition ${
                      isSelected
                        ? isDark ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 font-bold' : 'bg-blue-50 text-blue-700 border border-blue-200 font-bold'
                        : isDark ? 'hover:bg-slate-800/60 text-slate-300' : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileCode className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? 'text-blue-500' : 'text-slate-400'}`} />
                      <span className="truncate font-mono text-[11px]">{f.path}</span>
                    </div>
                    {hasIssue && (
                      <div className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0" title="Contains active security finding" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* PANEL 2: CODE VIEWER (Width 50%) */}
        <div className={`w-[50%] flex flex-col border-r overflow-hidden ${
          isDark ? 'bg-[#070B14] border-slate-800' : 'bg-white border-slate-200'
        }`}>
          {selectedFile ? (
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              {/* File Header Tab */}
              <div className={`px-4 py-2 border-b flex justify-between items-center text-xs font-mono ${
                isDark ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'
              }`}>
                <span className={`font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  <FileCode className="w-3.5 h-3.5 text-blue-500" /> {selectedFile.path}
                </span>
                <span className={`uppercase text-[10px] border px-2 py-0.5 rounded-full font-bold ${
                  isDark ? 'bg-slate-950 border-slate-800 text-blue-400' : 'bg-white border-slate-200 text-blue-600'
                }`}>
                  {selectedFile.language}
                </span>
              </div>

              {/* Active Finding Banner (If issue relates to open file) */}
              {selectedIssue && (selectedIssue.file.includes(selectedFile.path) || selectedFile.path.includes(selectedIssue.file)) && (
                <div className={`p-3 border-b px-4 flex items-center justify-between text-xs ${
                  isDark ? 'bg-rose-500/15 border-rose-500/30' : 'bg-rose-50 border-rose-200'
                }`}>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-rose-500/20 border border-rose-500/40 text-rose-400 text-[10px] font-bold rounded-full">
                      {selectedIssue.severity}
                    </span>
                    <span className={`font-bold ${isDark ? 'text-white' : 'text-rose-900'}`}>Line {selectedIssue.line || 1}: {selectedIssue.title}</span>
                  </div>
                  <button
                    onClick={() => handleExplainWithAI(selectedIssue)}
                    className="text-[11px] text-purple-500 hover:underline flex items-center gap-1 font-bold"
                  >
                    <Sparkles className="w-3 h-3 text-purple-500" /> Explain with AI
                  </button>
                </div>
              )}

              {/* Code Editor Preview with Line Numbers */}
              <div className={`flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed ${
                isDark ? 'text-slate-200 selection:bg-blue-600/30' : 'text-slate-800 selection:bg-blue-100'
              }`}>
                <table className="w-full border-collapse">
                  <tbody>
                    {selectedFile.content.split('\n').map((lineText, idx) => {
                      const lineNum = idx + 1;
                      const isHighlightedLine = selectedIssue && (selectedIssue.file.includes(selectedFile.path) || selectedFile.path.includes(selectedIssue.file)) && selectedIssue.line === lineNum;

                      return (
                        <tr key={idx} className={isHighlightedLine ? (isDark ? 'bg-rose-500/20 border-l-4 border-rose-500' : 'bg-rose-100/70 border-l-4 border-rose-600') : (isDark ? 'hover:bg-slate-900/40' : 'hover:bg-slate-50')}>
                          <td className={`w-10 text-right pr-4 select-none font-mono text-[11px] border-r ${
                            isDark ? 'text-slate-600 border-slate-800/60' : 'text-slate-400 border-slate-200'
                          }`}>
                            {lineNum}
                          </td>
                          <td className="pl-4 whitespace-pre font-mono text-[11px]">
                            {lineText || ' '}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-xs font-mono p-6 text-center">
              <Code2 className="w-10 h-10 text-slate-400 mb-3" />
              <span>Select a file from Panel 1 to inspect syntax and review findings inline</span>
            </div>
          )}
        </div>

        {/* PANEL 3: FINDINGS, ACTIONABLE FIXES & CONTEXTUAL AI (Width 28%) */}
        <div className={`w-[28%] flex flex-col h-full overflow-hidden ${
          isDark ? 'bg-[#0D1321]/60' : 'bg-slate-50/60'
        }`}>
          {/* Panel 3 Navigation */}
          <div className={`border-b px-3 flex items-center gap-1 text-xs font-bold ${
            isDark ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-600'
          }`}>
            <button
              onClick={() => setRightPanelTab('findings')}
              className={`py-3 px-3 flex items-center gap-1.5 border-b-2 transition ${rightPanelTab === 'findings' ? 'border-blue-500 text-blue-500 font-extrabold' : 'border-transparent hover:text-slate-300'}`}
            >
              <ShieldCheck className="w-3.5 h-3.5" /> Findings ({filteredIssues.length})
            </button>
            <button
              onClick={() => { setRightPanelTab('chat'); initChatSession(); }}
              className={`py-3 px-3 flex items-center gap-1.5 border-b-2 transition ${rightPanelTab === 'chat' ? 'border-purple-500 text-purple-500 font-extrabold' : 'border-transparent hover:text-slate-300'}`}
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-500" /> AI Assistant
            </button>
            <button
              onClick={() => setRightPanelTab('docs')}
              className={`py-3 px-3 flex items-center gap-1.5 border-b-2 transition ${rightPanelTab === 'docs' ? 'border-emerald-500 text-emerald-500 font-extrabold' : 'border-transparent hover:text-slate-300'}`}
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-500" /> Docs
            </button>
          </div>

          {/* TAB: FINDINGS & ACTIONABLE FIXES */}
          {rightPanelTab === 'findings' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Findings Summary Pills */}
              <div className={`flex items-center justify-between p-3 rounded-2xl border text-[11px] shadow-sm ${
                isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <div className="flex items-center gap-2 font-mono">
                  <span className="text-rose-500 font-bold">{criticalCount} Critical</span>
                  <span className="text-amber-500 font-bold">{highCount} High</span>
                </div>
                <div className="flex gap-1 font-bold">
                  <button
                    onClick={() => setIssueFilterStatus('ALL')}
                    className={`px-2 py-0.5 rounded-full text-[10px] ${issueFilterStatus === 'ALL' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setIssueFilterStatus('OPEN')}
                    className={`px-2 py-0.5 rounded-full text-[10px] ${issueFilterStatus === 'OPEN' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    Open
                  </button>
                  <button
                    onClick={() => setIssueFilterStatus('RESOLVED')}
                    className={`px-2 py-0.5 rounded-full text-[10px] ${issueFilterStatus === 'RESOLVED' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    Resolved
                  </button>
                </div>
              </div>

              {filteredIssues.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs font-mono">
                  No issues found matching current filter status.
                </div>
              ) : (
                filteredIssues.map((issue, idx) => {
                  const issueKey = issue.id || `iss-${idx}`;
                  const isExpanded = expandedFixId === issueKey;
                  const isResolved = issue.status === 'RESOLVED';

                  return (
                    <div
                      key={issueKey}
                      onClick={() => handleSelectIssue(issue)}
                      className={`p-4 border rounded-3xl transition cursor-pointer shadow-sm hover:shadow-md ${
                        isDark ? 'bg-[#0D1321] border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200'
                      } ${selectedIssue?.title === issue.title ? 'border-blue-500 ring-2 ring-blue-500/20' : ''}`}
                    >
                      {/* Issue Header */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 text-[9px] font-extrabold rounded-full uppercase ${
                            issue.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                            issue.severity === 'HIGH' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                            'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          }`}>
                            {issue.severity}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 truncate max-w-[140px]">
                            {issue.file}:{issue.line || 1}
                          </span>
                        </div>

                        {/* Status Badge */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateIssueStatus(issue, isResolved ? 'OPEN' : 'RESOLVED');
                          }}
                          className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${
                            isResolved
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                              : isDark ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'
                          }`}
                        >
                          {isResolved ? '🟢 Resolved' : '🔴 Open'}
                        </button>
                      </div>

                      <h4 className={`text-xs font-extrabold mb-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>{issue.title}</h4>
                      <p className={`text-[11px] mb-3 leading-relaxed line-clamp-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{issue.description}</p>

                      {/* Developer Action Buttons */}
                      <div className={`flex items-center gap-2 pt-2 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleExplainWithAI(issue); }}
                          className={`px-3 py-1 border text-purple-400 rounded-full text-[10px] font-bold hover:bg-purple-500/20 flex items-center gap-1 ${
                            isDark ? 'bg-purple-500/10 border-purple-500/30' : 'bg-purple-50 border-purple-200 text-purple-700'
                          }`}
                        >
                          <Sparkles className="w-3 h-3 text-purple-400" /> Explain AI
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedFixId(isExpanded ? null : issueKey);
                          }}
                          className={`px-3 py-1 border text-blue-400 rounded-full text-[10px] font-bold hover:bg-blue-500/20 flex items-center gap-1 ${
                            isDark ? 'bg-blue-500/10 border-blue-500/30' : 'bg-blue-50 border-blue-200 text-blue-700'
                          }`}
                        >
                          <Zap className="w-3 h-3 text-blue-400" /> {isExpanded ? 'Hide Fix' : 'Show Fix'}
                        </button>
                      </div>

                      {/* Interactive Code Patch Diff Expander */}
                      {isExpanded && (
                        <div className={`mt-3 p-3 border rounded-2xl text-[10px] font-mono space-y-2 ${
                          isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                        }`}>
                          <div className="flex items-center justify-between text-slate-400">
                            <span className="font-bold uppercase tracking-wider text-[9px]">Suggested Fix Diff</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopyFix(issueKey, issue.fixedCode || issue.recommendation);
                              }}
                              className="text-blue-500 font-bold hover:underline flex items-center gap-1 text-[10px]"
                            >
                              {copiedFixId === issueKey ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                              {copiedFixId === issueKey ? 'Copied!' : 'Copy Fix'}
                            </button>
                          </div>

                          {issue.originalCode && (
                            <div className="p-2 diff-removed rounded-xl text-rose-400 font-mono text-[10px]">
                              - {issue.originalCode}
                            </div>
                          )}

                          <div className="p-2 diff-added rounded-xl text-emerald-400 font-mono text-[10px]">
                            + {issue.fixedCode || issue.recommendation}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB: CONTEXTUAL AI CHAT */}
          {rightPanelTab === 'chat' && (
            <div className="flex-1 flex flex-col h-full overflow-hidden p-4">
              {/* Context Banner */}
              <div className={`p-2.5 border rounded-2xl mb-3 text-[11px] font-mono flex items-center justify-between shadow-sm ${
                isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700'
              }`}>
                <span className="flex items-center gap-1.5 text-purple-400 font-bold">
                  <Sparkles className="w-3.5 h-3.5" /> Context: {selectedFile?.path || 'Project Root'}
                </span>
                {selectedIssue && <span className="text-rose-400 font-bold">Line {selectedIssue.line || 1}</span>}
              </div>

              {/* Chat Log */}
              <div className={`flex-1 overflow-y-auto space-y-3 p-3 border rounded-2xl mb-3 ${
                isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
              }`}>
                {messages.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-[11px] leading-relaxed font-mono">
                    Ask any question about selected file <code className="text-blue-500">{selectedFile?.path}</code> or active vulnerability finding.
                  </div>
                ) : (
                  messages.map((m, idx) => (
                    <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] p-3 rounded-2xl text-[11px] leading-relaxed ${
                        m.role === 'user' ? 'bg-blue-600 text-white rounded-br-none font-sans font-medium' : isDark ? 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none font-mono' : 'bg-slate-100 border border-slate-200 text-slate-800 rounded-bl-none font-mono'
                      }`}>
                        {m.content}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Input Form */}
              <form onSubmit={handleSendChat} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ask about this code..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className={`flex-1 border rounded-full px-4 py-2.5 text-xs placeholder-slate-400 focus:outline-none focus:border-purple-500 font-mono ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
                  }`}
                />
                <button
                  type="submit"
                  disabled={sendingChat || !chatInput.trim()}
                  className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-full text-xs font-bold shadow-md"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          )}

          {/* TAB: UPLOAD REPOSITORY */}
          {rightPanelTab === 'upload' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              <h3 className={`font-extrabold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>Import Code Files</h3>

              {uploadMsg && (
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-blue-400 text-xs font-semibold">
                  {uploadMsg}
                </div>
              )}

              {/* ZIP Upload Form */}
              <div className={`p-4 border rounded-3xl shadow-sm ${
                isDark ? 'bg-[#0D1321] border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <h4 className={`font-bold text-xs mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Option A: ZIP Archive Upload</h4>
                <form onSubmit={handleZipUpload} className="space-y-3">
                  <input
                    type="file"
                    accept=".zip"
                    onChange={(e) => setZipFile(e.target.files?.[0] || null)}
                    className="w-full text-xs text-slate-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-[11px] file:font-bold file:bg-blue-600 file:text-white"
                  />
                  <button
                    type="submit"
                    disabled={uploading || !zipFile}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full text-xs font-bold uppercase tracking-wider shadow-sm"
                  >
                    {uploading ? 'Extracting...' : 'Extract ZIP'}
                  </button>
                </form>
              </div>

              {/* GitHub Repo Import Form */}
              <div className={`p-4 border rounded-3xl shadow-sm ${
                isDark ? 'bg-[#0D1321] border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <h4 className={`font-bold text-xs mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Option C: GitHub Repository URL</h4>
                <form onSubmit={handleGithubImport} className="space-y-3">
                  <input
                    type="url"
                    placeholder="https://github.com/owner/repo"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    className={`w-full border rounded-2xl px-3 py-2 text-xs font-mono ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                  <button
                    type="submit"
                    disabled={uploading || !githubUrl}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full text-xs font-bold uppercase tracking-wider shadow-sm"
                  >
                    {uploading ? 'Cloning...' : 'Import Repository'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB: AUTO DOCS GENERATOR */}
          {rightPanelTab === 'docs' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className={`font-extrabold text-xs ${isDark ? 'text-white' : 'text-slate-900'}`}>Auto Documentation</h3>
                <button
                  onClick={handleGenerateDocs}
                  disabled={generatingDocs}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-sm"
                >
                  {generatingDocs ? 'Generating...' : 'Generate README'}
                </button>
              </div>

              {generatedDocs ? (
                <div className={`p-3 border rounded-2xl font-mono text-[11px] leading-relaxed overflow-x-auto shadow-sm ${
                  isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-800'
                }`}>
                  <pre>{generatedDocs}</pre>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400 text-xs font-mono">
                  Click "Generate README" to produce repository architecture documentation.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Loading Progress Modal During Review Run */}
      {runningReview && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className={`border rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center space-y-4 ${
            isDark ? 'bg-[#0D1321] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto text-blue-500">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <h3 className="font-extrabold text-base">Running AI Code Audit</h3>

            <div className={`space-y-2 text-left font-mono text-xs p-4 rounded-2xl border ${
              isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}>
              <div className={reviewStep >= 1 ? 'text-emerald-500 font-bold' : 'text-slate-400'}>
                {reviewStep >= 1 ? '✓' : '○'} Checking project files
              </div>
              <div className={reviewStep >= 2 ? 'text-emerald-500 font-bold' : reviewStep === 1 ? 'text-blue-500 font-bold' : 'text-slate-400'}>
                {reviewStep >= 2 ? '✓' : reviewStep === 1 ? '→' : '○'} Auditing security vulnerabilities
              </div>
              <div className={reviewStep >= 3 ? 'text-emerald-500 font-bold' : reviewStep === 2 ? 'text-blue-500 font-bold' : 'text-slate-400'}>
                {reviewStep >= 3 ? '✓' : reviewStep === 2 ? '→' : '○'} Evaluating performance bottlenecks
              </div>
              <div className={reviewStep >= 4 ? 'text-emerald-500 font-bold' : reviewStep === 3 ? 'text-blue-500 font-bold' : 'text-slate-400'}>
                {reviewStep >= 4 ? '✓' : reviewStep === 3 ? '→' : '○'} Scoring code quality & health
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
