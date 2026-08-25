import React, { useState } from 'react';
import { PromptItem, ProjectState, PlatformType } from '../../types';
import {
  Plus,
  Copy,
  Edit2,
  Trash2,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Archive,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface TestPromptsViewProps {
  project: ProjectState;
  onUpdatePrompts: (prompts: PromptItem[]) => void;
  onExecutePrompt: (promptId: string) => void;
}

export const TestPromptsView: React.FC<TestPromptsViewProps> = ({
  project,
  onUpdatePrompts,
  onExecutePrompt,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<PromptItem | null>(null);

  // Form states for Add / Edit
  const [formPrompt, setFormPrompt] = useState('');
  const [formSeed, setFormSeed] = useState('');
  const [formVariation, setFormVariation] = useState('Direct Intent (Seed)');
  const [formCluster, setFormCluster] = useState('Private Guide Discovery');
  const [formIntent, setFormIntent] = useState('Commercial / Advisory');
  const [formJourneyStage, setFormJourneyStage] = useState('Consideration');
  const [formAudience, setFormAudience] = useState('First-time travelers');
  const [formPriority, setFormPriority] = useState<'High' | 'Medium' | 'Low'>('High');
  const [formRunsRequested, setFormRunsRequested] = useState(5);
  const [formObjective, setFormObjective] = useState('');
  const [formReason, setFormReason] = useState('');

  const filteredPrompts = project.prompts.filter((p) => {
    const matchesSearch =
      p.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.queryCluster.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.variationType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenAddModal = (seed?: string) => {
    setEditingPrompt(null);
    setFormPrompt(seed ? `Variation: ${seed}` : '');
    setFormSeed(seed || project.seedPrompt);
    setFormVariation('Direct Intent (Seed)');
    setFormCluster('Private Guide Discovery');
    setFormIntent('Commercial / Advisory');
    setFormJourneyStage('Consideration');
    setFormAudience(project.audience);
    setFormPriority('High');
    setFormRunsRequested(project.runsPerPrompt || 5);
    setFormObjective('');
    setFormReason('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p: PromptItem) => {
    setEditingPrompt(p);
    setFormPrompt(p.prompt);
    setFormSeed(p.seedPrompt || '');
    setFormVariation(p.variationType);
    setFormCluster(p.queryCluster);
    setFormIntent(p.searchIntent);
    setFormJourneyStage(p.journeyStage);
    setFormAudience(p.audience);
    setFormPriority(p.businessPriority);
    setFormRunsRequested(p.runsRequested);
    setFormObjective(p.businessObjective || '');
    setFormReason(p.reasonForTesting || '');
    setIsModalOpen(true);
  };

  const handleSavePrompt = () => {
    if (!formPrompt.trim()) return;

    if (editingPrompt) {
      const updated = project.prompts.map((p) =>
        p.id === editingPrompt.id
          ? {
              ...p,
              prompt: formPrompt,
              seedPrompt: formSeed,
              variationType: formVariation,
              queryCluster: formCluster,
              searchIntent: formIntent,
              journeyStage: formJourneyStage,
              audience: formAudience,
              businessPriority: formPriority,
              runsRequested: formRunsRequested,
              businessObjective: formObjective,
              reasonForTesting: formReason,
            }
          : p
      );
      onUpdatePrompts(updated);
    } else {
      const newPrompt: PromptItem = {
        id: `prompt-${Date.now()}`,
        prompt: formPrompt,
        seedPrompt: formSeed || project.seedPrompt,
        variationType: formVariation,
        queryCluster: formCluster,
        searchIntent: formIntent,
        journeyStage: formJourneyStage,
        subject: project.subject,
        audience: formAudience,
        country: project.country,
        language: project.language,
        businessPriority: formPriority,
        businessObjective: formObjective,
        reasonForTesting: formReason,
        platforms: project.selectedPlatforms,
        runsRequested: formRunsRequested,
        runsCompleted: 0,
        status: 'Ready',
        createdAt: new Date().toISOString(),
      };
      onUpdatePrompts([...project.prompts, newPrompt]);
    }
    setIsModalOpen(false);
  };

  const handleDuplicate = (p: PromptItem) => {
    const copy: PromptItem = {
      ...p,
      id: `prompt-${Date.now()}`,
      prompt: `${p.prompt} (Copy)`,
      runsCompleted: 0,
      status: 'Ready',
      createdAt: new Date().toISOString(),
    };
    onUpdatePrompts([...project.prompts, copy]);
  };

  const handleCreateVariation = (p: PromptItem, variationType: string, template: string) => {
    const newPrompt: PromptItem = {
      ...p,
      id: `prompt-${Date.now()}`,
      prompt: template,
      seedPrompt: p.prompt,
      variationType,
      runsCompleted: 0,
      status: 'Ready',
      createdAt: new Date().toISOString(),
    };
    onUpdatePrompts([...project.prompts, newPrompt]);
  };

  const handleTogglePause = (id: string) => {
    const updated = project.prompts.map((p) => {
      if (p.id === id) {
        return {
          ...p,
          status: p.status === 'Paused' ? 'Ready' : ('Paused' as any),
        };
      }
      return p;
    });
    onUpdatePrompts(updated);
  };

  const handleArchive = (id: string) => {
    const updated = project.prompts.map((p) => (p.id === id ? { ...p, status: 'Archived' as const } : p));
    onUpdatePrompts(updated);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this test prompt?')) {
      onUpdatePrompts(project.prompts.filter((p) => p.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-slate-900">Test Prompts Management</h2>
          <p className="text-xs text-slate-500">
            Define, categorize, and execute prompt variations across target clusters.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenAddModal()}
            className="px-3.5 py-2 text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Add Test Prompt
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3 rounded-lg border border-slate-200">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by prompt text, query cluster, or variation type..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-600">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span>Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-slate-300 rounded-md px-2 py-1 text-xs bg-white focus:outline-none"
          >
            <option value="All">All ({project.prompts.length})</option>
            <option value="Ready">Ready</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Paused">Paused</option>
            <option value="Archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Prompts Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Prompt & Variations</th>
                <th className="py-3 px-3">Cluster & Intent</th>
                <th className="py-3 px-3">Journey Stage</th>
                <th className="py-3 px-3">Priority</th>
                <th className="py-3 px-3">Platforms</th>
                <th className="py-3 px-3">Runs (Req/Done)</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPrompts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 text-xs">
                    No matching prompts found. Click "Add Test Prompt" or import from Query Fan-out Explorer.
                  </td>
                </tr>
              ) : (
                filteredPrompts.map((p) => {
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 max-w-sm">
                        <div className="font-medium text-slate-900 leading-snug">{p.prompt}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-sky-700 bg-sky-50 px-1.5 py-0.2 rounded border border-sky-200 font-mono">
                            {p.variationType}
                          </span>
                          {p.audience && (
                            <span className="text-[10px] text-slate-500 truncate max-w-[150px]">
                              Audience: {p.audience}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-medium text-slate-800">{p.queryCluster}</div>
                        <div className="text-[10px] text-slate-500">{p.searchIntent}</div>
                      </td>

                      <td className="py-3 px-3">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 font-medium">
                          {p.journeyStage}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                            p.businessPriority === 'High'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : p.businessPriority === 'Medium'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {p.businessPriority}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1 font-mono text-[10px] text-slate-600">
                          {p.platforms.map((plat) => (
                            <span key={plat} className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 uppercase">
                              {plat.slice(0, 3)}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="py-3 px-3 font-mono text-xs">
                        <span className="font-semibold text-slate-800">{p.runsCompleted}</span>
                        <span className="text-slate-400"> / {p.runsRequested}</span>
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                            p.status === 'Completed'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : p.status === 'In Progress'
                              ? 'bg-sky-50 text-sky-700 border border-sky-200 animate-pulse'
                              : p.status === 'Paused'
                              ? 'bg-slate-100 text-slate-500'
                              : p.status === 'Archived'
                              ? 'bg-slate-100 text-slate-400 line-through'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {p.status === 'Completed' && <CheckCircle className="w-2.5 h-2.5" />}
                          {p.status === 'In Progress' && <Clock className="w-2.5 h-2.5" />}
                          {p.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onExecutePrompt(p.id)}
                            title="Execute Live Diagnostic Run"
                            className="p-1 text-sky-600 hover:bg-sky-50 rounded"
                          >
                            <Play className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(p)}
                            title="Edit Prompt Details"
                            className="p-1 text-slate-600 hover:bg-slate-100 rounded"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDuplicate(p)}
                            title="Duplicate Prompt"
                            className="p-1 text-slate-600 hover:bg-slate-100 rounded"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleTogglePause(p.id)}
                            title={p.status === 'Paused' ? 'Resume Testing' : 'Pause Testing'}
                            className="p-1 text-slate-600 hover:bg-slate-100 rounded"
                          >
                            <Pause className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleArchive(p.id)}
                            title="Archive Prompt"
                            className="p-1 text-slate-400 hover:bg-slate-100 rounded"
                          >
                            <Archive className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            title="Delete Prompt"
                            className="p-1 text-rose-500 hover:bg-rose-50 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Variation Generator Presets */}
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Quick Variation Templates</h3>
        </div>
        <p className="text-xs text-slate-600">
          Create structured prompt variations from the seed prompt to test sensitivity and entity parsing.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <button
            onClick={() =>
              handleCreateVariation(
                project.prompts[0] || { prompt: project.seedPrompt } as any,
                'Value & ROI Intent',
                'Is hiring a private local guide worth the cost in Rome for Vatican and Colosseum?'
              )
            }
            className="p-3 bg-white hover:bg-slate-100 text-left border border-slate-200 rounded-lg text-xs transition-colors"
          >
            <div className="font-semibold text-slate-800">Value & ROI Comparison</div>
            <div className="text-[11px] text-slate-500 mt-1">Tests cost-benefit analysis citations</div>
          </button>

          <button
            onClick={() =>
              handleCreateVariation(
                project.prompts[0] || { prompt: project.seedPrompt } as any,
                'Specialist Credential Intent',
                'How to find licensed archaeologist tour guides in Rome for private ancient ruins tour?'
              )
            }
            className="p-3 bg-white hover:bg-slate-100 text-left border border-slate-200 rounded-lg text-xs transition-colors"
          >
            <div className="font-semibold text-slate-800">Specialist Credential Intent</div>
            <div className="text-[11px] text-slate-500 mt-1">Tests academic qualification parsing</div>
          </button>

          <button
            onClick={() =>
              handleCreateVariation(
                project.prompts[0] || { prompt: project.seedPrompt } as any,
                'Head-to-Head Brand Comparison',
                'Compare ToursByLocals, LivItaly and Walks of Italy for private family tours in Rome.'
              )
            }
            className="p-3 bg-white hover:bg-slate-100 text-left border border-slate-200 rounded-lg text-xs transition-colors"
          >
            <div className="font-semibold text-slate-800">Head-to-Head Brand Comparison</div>
            <div className="text-[11px] text-slate-500 mt-1">Tests multi-brand sentiment positioning</div>
          </button>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900">
              {editingPrompt ? 'Edit Test Prompt' : 'Add New Test Prompt'}
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Test Prompt Text *</label>
                <textarea
                  value={formPrompt}
                  onChange={(e) => setFormPrompt(e.target.value)}
                  rows={3}
                  className="w-full p-2.5 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500 text-slate-900"
                  placeholder="Enter complete prompt as typed by real user..."
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Seed Prompt / Baseline</label>
                <input
                  type="text"
                  value={formSeed}
                  onChange={(e) => setFormSeed(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-md"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Variation Type</label>
                  <input
                    type="text"
                    value={formVariation}
                    onChange={(e) => setFormVariation(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Query Cluster</label>
                  <input
                    type="text"
                    value={formCluster}
                    onChange={(e) => setFormCluster(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-md"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Search Intent</label>
                  <input
                    type="text"
                    value={formIntent}
                    onChange={(e) => setFormIntent(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Journey Stage</label>
                  <select
                    value={formJourneyStage}
                    onChange={(e) => setFormJourneyStage(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-md"
                  >
                    <option value="Awareness">Awareness</option>
                    <option value="Consideration">Consideration</option>
                    <option value="Decision">Decision</option>
                    <option value="Comparative">Comparative</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Priority</label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as any)}
                    className="w-full p-2 border border-slate-300 rounded-md"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Runs Requested</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={formRunsRequested}
                    onChange={(e) => setFormRunsRequested(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded-md"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Business Objective</label>
                <input
                  type="text"
                  value={formObjective}
                  onChange={(e) => setFormObjective(e.target.value)}
                  placeholder="e.g. Ensure local guides on ToursByLocals are cited..."
                  className="w-full p-2 border border-slate-300 rounded-md"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-md font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePrompt}
                className="px-4 py-1.5 text-xs bg-slate-900 text-white hover:bg-slate-800 rounded-md font-medium"
              >
                Save Prompt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
