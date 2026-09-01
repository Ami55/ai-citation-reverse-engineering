import React, { useState, useEffect } from 'react';
import { X, Key, CheckCircle, AlertTriangle, ExternalLink, RefreshCw } from 'lucide-react';
import { AI_CITATION_PROXY_URL } from '../config';

interface PlatformSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export const PlatformSettingsModal: React.FC<PlatformSettingsModalProps> = ({
  isOpen,
  onClose,
  onSaved,
}) => {
  const [openAiKey, setOpenAiKey] = useState('');
  const [claudeKey, setClaudeKey] = useState('');
  const [customGeminiKey, setCustomGeminiKey] = useState('');
  const [status, setStatus] = useState<any>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setOpenAiKey(localStorage.getItem('aicite_openai_key') || '');
      setClaudeKey(localStorage.getItem('aicite_claude_key') || '');
      setCustomGeminiKey(localStorage.getItem('aicite_gemini_key') || '');
      checkPlatformStatus();
    }
  }, [isOpen]);

  const checkPlatformStatus = async () => {
    setIsChecking(true);
    try {
      const res = await fetch(AI_CITATION_PROXY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'status' }),
      });
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      }
    } catch (e) {
      console.error('Error fetching platform status:', e);
    } finally {
      setIsChecking(false);
    }
  };

  const handleSave = () => {
    localStorage.removeItem('aicite_openai_key');
    localStorage.removeItem('aicite_claude_key');
    localStorage.removeItem('aicite_gemini_key');

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onSaved();
      onClose();
    }, 600);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <Key className="w-5 h-5 text-slate-700" />
            <h3 className="font-semibold text-slate-900 text-base">Platform Connections & API Credentials</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          <div className="p-3 bg-sky-50 rounded-lg border border-sky-200 text-xs text-sky-900 leading-relaxed">
            <strong>Server-side security:</strong> API credentials are stored in this Vercel project's Environment Variables. The browser never receives the keys.
          </div>

          {/* Gemini Status */}
          <div className="p-4 rounded-lg border border-slate-200 bg-white space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${status?.gemini?.available ? 'bg-emerald-500' : 'bg-amber-400'}`}></span>
                <span className="font-semibold text-slate-900 text-sm">Google Gemini API</span>
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">Native Google Search Grounding</span>
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded border ${status?.gemini?.available ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-amber-700 bg-amber-50 border-amber-200'}`}>
                {status?.gemini?.available ? 'Configured' : 'Key required in Vercel'}
              </span>
            </div>
            <p className="text-xs text-slate-600">
              Primary model: <code className="text-slate-800 font-mono">gemini-3.6-flash</code>. Set <code className="font-mono">GEMINI_API_KEY</code> in Vercel.
            </p>
            <div className="hidden">
              <label className="text-xs text-slate-500 block mb-1">Custom Gemini API Key (Optional override):</label>
              <input
                type="password"
                value={customGeminiKey}
                onChange={(e) => setCustomGeminiKey(e.target.value)}
                placeholder="Leave blank to use default workspace key"
                className="w-full text-xs font-mono px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>
          </div>

          {/* OpenAI Integration */}
          <div className="p-4 rounded-lg border border-slate-200 bg-white space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${openAiKey || status?.openai?.available ? 'bg-emerald-500' : 'bg-amber-400'}`}></span>
                <span className="font-semibold text-slate-900 text-sm">OpenAI Responses / Search API</span>
              </div>
              <span className="text-xs text-slate-500 font-mono">gpt-4o</span>
            </div>
            <p className="text-xs text-slate-600">
              Enables testing search queries, retrieved source URLs in <code className="font-mono text-slate-800">web_search_call</code>, and <code className="font-mono text-slate-800">url_citation</code> annotations.
            </p>
            <div className="hidden">
              <label className="text-xs text-slate-500 block mb-1">OpenAI API Key:</label>
              <input
                type="password"
                value={openAiKey}
                onChange={(e) => setOpenAiKey(e.target.value)}
                placeholder="sk-proj-..."
                className="w-full text-xs font-mono px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>
          </div>

          {/* Anthropic Claude Integration */}
          <div className="p-4 rounded-lg border border-slate-200 bg-white space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${claudeKey || status?.claude?.available ? 'bg-emerald-500' : 'bg-amber-400'}`}></span>
                <span className="font-semibold text-slate-900 text-sm">Anthropic Claude API</span>
              </div>
              <span className="text-xs text-slate-500 font-mono">claude-3-7-sonnet-20250219</span>
            </div>
            <p className="text-xs text-slate-600">
              Enables testing with Claude web search tool calls, <code className="font-mono text-slate-800">web_search_tool_result</code>, and cited text passages.
            </p>
            <div className="hidden">
              <label className="text-xs text-slate-500 block mb-1">Anthropic API Key:</label>
              <input
                type="password"
                value={claudeKey}
                onChange={(e) => setClaudeKey(e.target.value)}
                placeholder="sk-ant-..."
                className="w-full text-xs font-mono px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={checkPlatformStatus}
            disabled={isChecking}
            className="text-xs text-slate-600 hover:text-slate-800 flex items-center gap-1.5 font-medium"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
            Refresh Connectivity
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs text-slate-700 hover:bg-slate-200 rounded-md font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 text-xs bg-slate-900 text-white hover:bg-slate-800 rounded-md font-medium transition-colors shadow-xs"
            >
              {saveSuccess ? 'Done!' : 'Close Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
