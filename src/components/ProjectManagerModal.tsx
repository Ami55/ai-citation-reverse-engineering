import React, { useEffect, useState } from 'react';
import { ProjectState, PlatformType } from '../types';
import { X, Plus, Layers, Target, Globe, HelpCircle } from 'lucide-react';

interface ProjectManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProject: ProjectState;
  onSaveProject: (project: ProjectState) => void;
}

export const ProjectManagerModal: React.FC<ProjectManagerModalProps> = ({
  isOpen,
  onClose,
  currentProject,
  onSaveProject,
}) => {
  const [name, setName] = useState(currentProject.name);
  const [targetDomain, setTargetDomain] = useState(currentProject.targetDomain);
  const [seedPrompt, setSeedPrompt] = useState(currentProject.seedPrompt);
  const [subject, setSubject] = useState(currentProject.subject);
  const [audience, setAudience] = useState(currentProject.audience);
  const [country, setCountry] = useState(currentProject.country || 'CA');
  const [language, setLanguage] = useState(currentProject.language || 'en');
  const [targetUrls, setTargetUrls] = useState(currentProject.relevantTargetUrls?.join('\n') || '');
  const [competitorDomains, setCompetitorDomains] = useState(currentProject.competitorDomains?.join('\n') || '');

  useEffect(() => {
    if (!isOpen) return;
    setName(currentProject.name);
    setTargetDomain(currentProject.targetDomain);
    setSeedPrompt(currentProject.seedPrompt);
    setSubject(currentProject.subject);
    setAudience(currentProject.audience);
    setCountry(currentProject.country || 'CA');
    setLanguage(currentProject.language || 'en');
    setTargetUrls(currentProject.relevantTargetUrls?.join('\n') || '');
    setCompetitorDomains(currentProject.competitorDomains?.join('\n') || '');
  }, [currentProject, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: ProjectState = {
      ...currentProject,
      name: name || 'Untitled Citation Audit',
      targetDomain: targetDomain.replace(/^https?:\/\//, '').replace(/\/.*$/, '').trim(),
      seedPrompt,
      subject,
      audience,
      country,
      language,
      relevantTargetUrls: targetUrls
        .split('\n')
        .map((u) => u.trim())
        .filter(Boolean),
      competitorDomains: competitorDomains
        .split('\n')
        .map((d) => d.replace(/^https?:\/\//, '').replace(/\/.*$/, '').trim())
        .filter(Boolean),
      updatedAt: new Date().toISOString(),
    };
    onSaveProject(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">Project Configuration</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          <div className="rounded-lg border border-sky-200 bg-sky-50 p-4 text-sky-950 leading-relaxed">
            <strong className="block mb-1">What this research will answer</strong>
            For a defined traveller question, the app tests whether AI systems retrieve your pages, cite them, mention your brand, or prefer a competitor. Add the real domain and the pages you may improve. Saving takes you directly to Step 1 to build the repeatable test prompts.
          </div>
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Project Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              placeholder="e.g. Rome Private Tours & Vatican Guides"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Target Brand Domain</label>
              <input
                type="text"
                required
                value={targetDomain}
                onChange={(e) => setTargetDomain(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                placeholder="e.g. your-domain.com"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Seed Search / Research Prompt</label>
              <input
                type="text"
                required
                value={seedPrompt}
                onChange={(e) => setSeedPrompt(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                placeholder="e.g. best private tour guides in Rome..."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Target Subject / Topic Entity</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Target Audience</label>
              <input
                type="text"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Country (ISO code)</label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Language Code</label>
              <input
                type="text"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Relevant Target Landing Page URLs (One per line)
            </label>
            <textarea
              rows={3}
              value={targetUrls}
              onChange={(e) => setTargetUrls(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-800 text-[11px]"
              placeholder="https://your-domain.com/rome-tours"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Competitor Domains (One per line)
            </label>
            <textarea
              rows={3}
              value={competitorDomains}
              onChange={(e) => setCompetitorDomains(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-800 text-[11px]"
              placeholder="viator.com&#10;livitaly.com&#10;walksofitaly.com"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-900 font-semibold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-xs shadow-xs transition-colors"
            >
              Save & Choose Test Prompts
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
