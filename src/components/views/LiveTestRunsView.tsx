import React, { useState } from 'react';
import { ProjectState, TestRunItem, PlatformType } from '../../types';
import { EvidenceBadge } from '../EvidenceBadge';
import { AI_CITATION_PROXY_URL } from '../../config';
import {
  Play,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Code,
  Globe,
  FileText,
  Search,
  ExternalLink,
  RefreshCw,
  Sliders,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  Building,
  Quote,
} from 'lucide-react';

interface LiveTestRunsViewProps {
  project: ProjectState;
  onAddRuns: (runs: TestRunItem[]) => void;
  onOpenSettings: () => void;
}

export const LiveTestRunsView: React.FC<LiveTestRunsViewProps> = ({
  project,
  onAddRuns,
  onOpenSettings,
}) => {
  const [selectedPromptId, setSelectedPromptId] = useState<string>(
    project.prompts[0]?.id || ''
  );
  const [selectedPlatforms, setSelectedPlatforms] = useState<PlatformType[]>([
    'gemini',
  ]);
  const [runsPerPlatform, setRunsPerPlatform] = useState<number>(1);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionLog, setExecutionLog] = useState<string[]>([]);
  const [activeRawModal, setActiveRawModal] = useState<TestRunItem | null>(null);
  const [expandedRunId, setExpandedRunId] = useState<string | null>(null);

  const runs = project.runs || [];

  const handleTogglePlatform = (p: PlatformType) => {
    if (selectedPlatforms.includes(p)) {
      if (selectedPlatforms.length > 1) {
        setSelectedPlatforms(selectedPlatforms.filter((item) => item !== p));
      }
    } else {
      setSelectedPlatforms([...selectedPlatforms, p]);
    }
  };

  const handleExecute = async () => {
    const promptItem = project.prompts.find((p) => p.id === selectedPromptId);
    if (!promptItem) {
      alert('Please select a valid test prompt first.');
      return;
    }

    setIsExecuting(true);
    setExecutionLog([`Starting test execution for prompt: "${promptItem.prompt.slice(0, 60)}..."`]);

    const newRuns: TestRunItem[] = [];
    for (const platform of selectedPlatforms) {
      for (let runIdx = 1; runIdx <= runsPerPlatform; runIdx++) {
        const logMsg = `Executing ${platform.toUpperCase()} (Run ${runIdx}/${runsPerPlatform})...`;
        setExecutionLog((prev) => [...prev, logMsg]);

        try {
          const res = await fetch(AI_CITATION_PROXY_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'execute',
              platform,
              prompt: promptItem.prompt,
              country: project.country,
              language: project.language,
              targetDomain: project.targetDomain,
              competitorDomains: project.competitorDomains,
            }),
          });

          const data = await res.json();

          if (res.ok && data.status === 'success') {
            const runItem: TestRunItem = {
              id: `run-${platform}-${Date.now()}-${runIdx}`,
              promptId: promptItem.id,
              promptText: promptItem.prompt,
              promptVariation: promptItem.variationType,
              platform,
              model: data.model || `${platform}-default`,
              runIndex: runIdx,
              status: 'success',
              timestamp: data.timestamp || new Date().toISOString(),
              country: project.country,
              language: project.language,
              searchQueries: data.searchQueries || ['Not exposed by this platform or run'],
              retrievedSources: data.retrievedSources || [],
              citedSources: data.citedSources || [],
              mentionedBrands: data.mentionedBrands || [],
              answerText: data.answerText || '',
              groundingSupports: data.groundingSupports,
              rawApiData: data.rawApiData,
            };
            newRuns.push(runItem);
            setExecutionLog((prev) => [
              ...prev,
              `✓ ${platform.toUpperCase()} Run ${runIdx} completed. Citations: ${data.citedSources?.length || 0}, Queries: ${data.searchQueries?.length || 0}`,
            ]);
          } else {
            const failItem: TestRunItem = {
              id: `run-${platform}-failed-${Date.now()}-${runIdx}`,
              promptId: promptItem.id,
              promptText: promptItem.prompt,
              promptVariation: promptItem.variationType,
              platform,
              model: `${platform}-unavailable`,
              runIndex: runIdx,
              status: 'failed',
              timestamp: new Date().toISOString(),
              country: project.country,
              language: project.language,
              searchQueries: [],
              retrievedSources: [],
              citedSources: [],
              mentionedBrands: [],
              answerText: '',
              errorDetails: data.error || 'Execution failed or credentials missing.',
            };
            newRuns.push(failItem);
            setExecutionLog((prev) => [
              ...prev,
              `✗ ${platform.toUpperCase()} Run ${runIdx} failed: ${data.error || 'API Error'}`,
            ]);
          }
        } catch (err: any) {
          const failItem: TestRunItem = {
            id: `run-${platform}-error-${Date.now()}-${runIdx}`,
            promptId: promptItem.id,
            promptText: promptItem.prompt,
            promptVariation: promptItem.variationType,
            platform,
            model: `${platform}-error`,
            runIndex: runIdx,
            status: 'failed',
            timestamp: new Date().toISOString(),
            country: project.country,
            language: project.language,
            searchQueries: [],
            retrievedSources: [],
            citedSources: [],
            mentionedBrands: [],
            answerText: '',
            errorDetails: err.message || 'Network / server communication error',
          };
          newRuns.push(failItem);
          setExecutionLog((prev) => [...prev, `✗ Network Error on ${platform}: ${err.message}`]);
        }
      }
    }

    onAddRuns(newRuns);
    setExecutionLog((prev) => [...prev, 'All requested test runs completed.']);
    setIsExecuting(false);
  };

  return (
    <div className="space-y-6">
      {/* Execution Control Panel */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Multi-Platform Live Test Runner</h2>
            <p className="text-xs text-slate-500">
              Dispatch identical prompts to native search-grounded models and extract queries, sources, and citations.
            </p>
          </div>
          <button
            onClick={onOpenSettings}
            className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 font-medium bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200"
          >
            Configure API Keys
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Prompt Selector */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="font-semibold text-slate-700 block">Select Prompt to Test:</label>
            <select
              value={selectedPromptId}
              onChange={(e) => setSelectedPromptId(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
              {project.prompts.map((p) => (
                <option key={p.id} value={p.id}>
                  [{p.variationType}] {p.prompt}
                </option>
              ))}
            </select>
          </div>

          {/* Runs Per Platform */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 block">Runs per Platform:</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={10}
                value={runsPerPlatform}
                onChange={(e) => setRunsPerPlatform(Math.max(1, Number(e.target.value)))}
                className="w-20 p-2 border border-slate-300 rounded-lg text-xs font-mono"
              />
              <span className="text-[11px] text-slate-400">Default 5 for stability</span>
            </div>
          </div>
        </div>

        {/* Platform Checkboxes */}
        <div className="pt-2">
          <label className="text-xs font-semibold text-slate-700 block mb-2">Target Platforms:</label>
          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => handleTogglePlatform('gemini')}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors flex items-center gap-1.5 ${
                selectedPlatforms.includes('gemini')
                  ? 'bg-sky-50 text-sky-900 border-sky-300 font-semibold'
                  : 'bg-white text-slate-500 border-slate-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-sky-500"></span>
              Google Gemini (Search Grounding)
            </button>

            <button
              onClick={() => handleTogglePlatform('openai')}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors flex items-center gap-1.5 ${
                selectedPlatforms.includes('openai')
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-300 font-semibold'
                  : 'bg-white text-slate-500 border-slate-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              OpenAI (Responses / Search API)
            </button>

            <button
              onClick={() => handleTogglePlatform('claude')}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors flex items-center gap-1.5 ${
                selectedPlatforms.includes('claude')
                  ? 'bg-indigo-50 text-indigo-900 border-indigo-300 font-semibold'
                  : 'bg-white text-slate-500 border-slate-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              Anthropic Claude (Web Search Tool)
            </button>
          </div>
        </div>

        {/* Execution trigger */}
        <div className="pt-2 flex items-center justify-between border-t border-slate-100">
          <div className="text-[11px] text-slate-500">
            Total calls to execute: <strong className="font-mono text-slate-800">{selectedPlatforms.length * runsPerPlatform}</strong>
          </div>
          <button
            onClick={handleExecute}
            disabled={isExecuting}
            className={`px-5 py-2 rounded-lg text-xs font-semibold text-white transition-colors flex items-center gap-2 shadow-xs ${
              isExecuting ? 'bg-slate-400 cursor-not-allowed' : 'bg-slate-900 hover:bg-slate-800'
            }`}
          >
            <Play className={`w-3.5 h-3.5 ${isExecuting ? 'animate-spin' : ''}`} />
            {isExecuting ? 'Executing Search Grounding...' : 'Run Test Suite'}
          </button>
        </div>

        {/* Live Execution Logs */}
        {executionLog.length > 0 && (
          <div className="mt-3 bg-slate-900 rounded-lg p-3 text-[11px] font-mono text-slate-200 max-h-36 overflow-y-auto space-y-1">
            {executionLog.map((log, idx) => (
              <div key={idx} className={log.startsWith('✓') ? 'text-emerald-400' : log.startsWith('✗') ? 'text-rose-400' : 'text-slate-300'}>
                {log}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* History of Live Test Runs */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Recorded Live Test Runs ({runs.length})</h3>
            <p className="text-[11px] text-slate-500">Auditable log of model queries, cited segments, and raw API responses.</p>
          </div>
        </div>

        <div className="divide-y divide-slate-200">
          {runs.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No runs recorded yet. Use the runner above to execute diagnostic tests.
            </div>
          ) : (
            runs.map((run) => {
              const isExpanded = expandedRunId === run.id;
              return (
                <div key={run.id} className="p-4 hover:bg-slate-50/60 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <button
                        onClick={() => setExpandedRunId(isExpanded ? null : run.id)}
                        className="p-1 hover:bg-slate-200 rounded text-slate-500"
                      >
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>

                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                          run.platform === 'gemini'
                            ? 'bg-sky-100 text-sky-800'
                            : run.platform === 'openai'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-indigo-100 text-indigo-800'
                        }`}
                      >
                        {run.platform}
                      </span>

                      <span className="text-xs font-semibold text-slate-900">
                        Run #{run.runIndex}
                      </span>

                      <span className="text-[11px] text-slate-500 font-mono">
                        ({run.model})
                      </span>

                      {run.status === 'success' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          Success
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] text-rose-700 bg-rose-50 px-2 py-0.5 rounded font-medium border border-rose-200">
                          <XCircle className="w-3 h-3" />
                          Failed
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span>{new Date(run.timestamp).toLocaleTimeString()}</span>
                      <button
                        onClick={() => setActiveRawModal(run)}
                        className="px-2 py-1 text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded flex items-center gap-1 border border-slate-300"
                      >
                        <Code className="w-3 h-3" />
                        Inspect Raw API Data
                      </button>
                    </div>
                  </div>

                  {/* Prompt Text Preview */}
                  <div className="mt-2 text-xs text-slate-700 font-medium pl-6">
                    <span className="text-slate-400 font-normal">Prompt: </span>
                    "{run.promptText}"
                  </div>

                  {/* Summary Badges */}
                  <div className="mt-2.5 flex flex-wrap items-center gap-3 pl-6 text-[11px]">
                    <div className="flex items-center gap-1 text-slate-600">
                      <Search className="w-3 h-3 text-slate-400" />
                      <span>{run.searchQueries.length} search queries observed</span>
                    </div>

                    <div className="flex items-center gap-1 text-slate-600">
                      <Globe className="w-3 h-3 text-slate-400" />
                      <span>{run.retrievedSources.length} retrieved sources</span>
                    </div>

                    <div className="flex items-center gap-1 text-emerald-700 font-medium">
                      <Quote className="w-3 h-3 text-emerald-500" />
                      <span>{run.citedSources.length} cited sources</span>
                    </div>

                    <div className="flex items-center gap-1 text-indigo-700">
                      <Building className="w-3 h-3 text-indigo-500" />
                      <span>{run.mentionedBrands.length} brands mentioned</span>
                    </div>
                  </div>

                  {/* Error if failed */}
                  {run.status === 'failed' && run.errorDetails && (
                    <div className="mt-3 ml-6 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800">
                      <strong>Failure cause: </strong> {run.errorDetails}
                    </div>
                  )}

                  {/* Expanded Breakdown */}
                  {isExpanded && run.status === 'success' && (
                    <div className="mt-4 ml-6 space-y-4 pt-3 border-t border-slate-100 text-xs">
                      {/* Search Queries */}
                      <div>
                        <span className="font-semibold text-slate-700 block mb-1">
                          Observed Search Queries:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {run.searchQueries.map((q, idx) => (
                            <span
                              key={idx}
                              className="px-2.5 py-1 bg-slate-100 rounded text-slate-800 font-mono text-[11px] border border-slate-200"
                            >
                              {q}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Cited Sources */}
                      <div>
                        <span className="font-semibold text-slate-700 block mb-1">
                          Cited Sources & Supported Claims:
                        </span>
                        {run.citedSources.length === 0 ? (
                          <span className="text-slate-400 italic">No direct citations linked in this run</span>
                        ) : (
                          <div className="space-y-2">
                            {run.citedSources.map((cs, idx) => (
                              <div key={idx} className="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-200">
                                <div className="flex items-center justify-between">
                                  <a
                                    href={cs.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="font-semibold text-emerald-900 hover:underline flex items-center gap-1"
                                  >
                                    <span>{cs.title || cs.domain}</span>
                                    <ExternalLink className="w-3 h-3 text-emerald-600" />
                                  </a>
                                  <span className="text-[10px] text-slate-500 font-mono">{cs.domain}</span>
                                </div>
                                {cs.citedText && (
                                  <p className="mt-1 text-[11px] text-slate-600 italic">
                                    "{cs.citedText}"
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Full Answer Text */}
                      <div>
                        <span className="font-semibold text-slate-700 block mb-1">
                          Full Generated Answer:
                        </span>
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-800 whitespace-pre-wrap leading-relaxed">
                          {run.answerText}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Raw Data Inspection Modal */}
      {activeRawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 p-6 space-y-4 max-h-[85vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Raw Structured API Response Data
                </h3>
                <p className="text-xs text-slate-500">
                  Platform: {activeRawModal.platform.toUpperCase()} • Model: {activeRawModal.model}
                </p>
              </div>
              <button
                onClick={() => setActiveRawModal(null)}
                className="text-xs text-slate-500 hover:text-slate-700 px-2 py-1 bg-slate-100 rounded"
              >
                Close
              </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-slate-900 rounded-lg p-4 font-mono text-xs text-sky-300">
              <pre>{JSON.stringify(activeRawModal.rawApiData || { status: activeRawModal.status }, null, 2)}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
