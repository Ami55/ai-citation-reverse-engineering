import React, { useState, useMemo } from 'react';
import { ProjectState, SearchPathwayRow, PlatformType } from '../../types';
import { buildSearchPathways } from '../../utils/metrics';
import { EvidenceBadge } from '../EvidenceBadge';
import {
  GitFork,
  Search,
  Filter,
  ArrowRight,
  ExternalLink,
  Target,
  Building,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  FileSpreadsheet,
} from 'lucide-react';

interface SearchPathwaysViewProps {
  project: ProjectState;
}

export const SearchPathwaysView: React.FC<SearchPathwaysViewProps> = ({ project }) => {
  const [selectedPlatform, setSelectedPlatform] = useState<string>('All');
  const [selectedPrompt, setSelectedPrompt] = useState<string>('All');
  const [selectedBrandFilter, setSelectedBrandFilter] = useState<string>('All');
  const [citationStatusFilter, setCitationStatusFilter] = useState<string>('All');
  const [searchFilter, setSearchFilter] = useState<string>('');

  const pathways: SearchPathwayRow[] = useMemo(() => {
    return buildSearchPathways(project.runs || []);
  }, [project.runs]);

  const filteredPathways = useMemo(() => {
    const targetBrandSlug = project.targetDomain.replace(/^www\./, '').split('.')[0].toLowerCase();
    return pathways.filter((row) => {
      const matchPlatform = selectedPlatform === 'All' || row.platform === selectedPlatform;
      const matchPrompt = selectedPrompt === 'All' || row.prompt === selectedPrompt;
      const matchBrand =
        selectedBrandFilter === 'All' ||
        (selectedBrandFilter === 'target' && (row.retrievedDomain.includes(project.targetDomain) || row.mentionedBrand.toLowerCase().includes(targetBrandSlug))) ||
        (selectedBrandFilter === 'competitors' && !row.retrievedDomain.includes(project.targetDomain) && !row.mentionedBrand.toLowerCase().includes(targetBrandSlug));
      const matchCitation =
        citationStatusFilter === 'All' || row.citationStatus === citationStatusFilter;
      const matchSearch =
        searchFilter === '' ||
        row.searchQuery.toLowerCase().includes(searchFilter.toLowerCase()) ||
        row.retrievedDomain.toLowerCase().includes(searchFilter.toLowerCase()) ||
        row.citedClaim.toLowerCase().includes(searchFilter.toLowerCase()) ||
        row.mentionedBrand.toLowerCase().includes(searchFilter.toLowerCase());

      return matchPlatform && matchPrompt && matchBrand && matchCitation && matchSearch;
    });
  }, [pathways, selectedPlatform, selectedPrompt, selectedBrandFilter, citationStatusFilter, searchFilter, project.targetDomain]);

  // Unique list of prompts for filter dropdown
  const uniquePrompts = Array.from(new Set(pathways.map((p) => p.prompt)));

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <GitFork className="w-5 h-5 text-sky-600" />
              <h2 className="text-base font-bold text-slate-900">
                Observable Search & Retrieval Pathways
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Trace linear causal flow: Prompt → Search Query → Retrieved Source → Cited Passage → Final Claim → Mentioned Brand.
            </p>
          </div>
          <EvidenceBadge label="Observed API Data" size="sm" />
        </div>

        {/* Visual Step Indicator */}
        <div className="pt-2 overflow-x-auto pb-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 min-w-[700px]">
            <div className="flex-1 bg-slate-100 p-2.5 rounded-lg border border-slate-200 text-center">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Step 1</span>
              1. User Prompt
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <div className="flex-1 bg-sky-50 p-2.5 rounded-lg border border-sky-200 text-center text-sky-950">
              <span className="text-[10px] text-sky-600 block uppercase font-bold">Step 2</span>
              2. Search Query
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <div className="flex-1 bg-amber-50 p-2.5 rounded-lg border border-amber-200 text-center text-amber-950">
              <span className="text-[10px] text-amber-600 block uppercase font-bold">Step 3</span>
              3. Retrieved Source
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <div className="flex-1 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200 text-center text-emerald-950">
              <span className="text-[10px] text-emerald-600 block uppercase font-bold">Step 4</span>
              4. Cited Passage
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <div className="flex-1 bg-indigo-50 p-2.5 rounded-lg border border-indigo-200 text-center text-indigo-950">
              <span className="text-[10px] text-indigo-600 block uppercase font-bold">Step 5</span>
              5. Final Brand Claim
            </div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="font-semibold text-slate-600 block mb-1">Platform:</label>
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-md bg-white text-xs"
            >
              <option value="All">All Platforms</option>
              <option value="gemini">Google Gemini</option>
              <option value="openai">OpenAI</option>
              <option value="claude">Anthropic Claude</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-600 block mb-1">Target vs Competitors:</label>
            <select
              value={selectedBrandFilter}
              onChange={(e) => setSelectedBrandFilter(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-md bg-white text-xs"
            >
              <option value="All">All Entities</option>
              <option value="target">Target Brand Only ({project.targetDomain})</option>
              <option value="competitors">Competitors Only</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-600 block mb-1">Citation Status:</label>
            <select
              value={citationStatusFilter}
              onChange={(e) => setCitationStatusFilter(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-md bg-white text-xs"
            >
              <option value="All">All Statuses</option>
              <option value="Cited">Cited Only</option>
              <option value="Not cited">Retrieved But Not Cited</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-600 block mb-1">Search Keywords:</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Query, claim or URL..."
                className="w-full pl-8 pr-2 py-1.5 border border-slate-300 rounded-md text-xs"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="font-semibold text-slate-600 block mb-1 text-xs">Filter by Specific Prompt:</label>
          <select
            value={selectedPrompt}
            onChange={(e) => setSelectedPrompt(e.target.value)}
            className="w-full p-2 border border-slate-300 rounded-md bg-white text-xs"
          >
            <option value="All">All Test Prompts ({uniquePrompts.length})</option>
            {uniquePrompts.map((p, idx) => (
              <option key={idx} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Auditable Search Pathway Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Auditable Pathway Records ({filteredPathways.length})
            </h3>
            <p className="text-[11px] text-slate-500">
              Every row documents the discrete linkage from model query to source citation.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 bg-slate-100 z-10 text-slate-700 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Platform & Run</th>
                <th className="py-2.5 px-3 max-w-[200px]">Prompt & Variation</th>
                <th className="py-2.5 px-3">Observed Search Query</th>
                <th className="py-2.5 px-3">Retrieved Source & Domain</th>
                <th className="py-2.5 px-3">Citation Status</th>
                <th className="py-2.5 px-3 max-w-[220px]">Cited Claim / Extract</th>
                <th className="py-2.5 px-3">Brand & Position</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPathways.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No pathways matching the selected filter criteria.
                  </td>
                </tr>
              ) : (
                filteredPathways.map((row) => {
                  const targetBrandSlug = project.targetDomain.replace(/^www\./, '').split('.')[0].toLowerCase();
                  const isTarget = row.retrievedDomain.includes(project.targetDomain) || row.mentionedBrand.toLowerCase().includes(targetBrandSlug);
                  return (
                    <tr
                      key={row.id}
                      className={`hover:bg-slate-50 transition-colors ${
                        isTarget ? 'bg-emerald-50/30' : ''
                      }`}
                    >
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                              row.platform === 'gemini'
                                ? 'bg-sky-100 text-sky-800'
                                : row.platform === 'openai'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-indigo-100 text-indigo-800'
                            }`}
                          >
                            {row.platform}
                          </span>
                          <span className="text-[11px] text-slate-600 font-mono">r#{row.run}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">{row.model}</div>
                      </td>

                      <td className="py-3 px-3 max-w-[200px]">
                        <div className="font-medium text-slate-900 line-clamp-2" title={row.prompt}>
                          {row.prompt}
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">{row.promptVariation}</span>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-mono text-[11px] text-sky-900 bg-sky-50 px-2 py-1 rounded border border-sky-200 inline-block">
                          {row.searchQuery}
                        </div>
                      </td>

                      <td className="py-3 px-3 max-w-[200px]">
                        <a
                          href={row.retrievedUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="font-medium text-slate-800 hover:text-sky-600 flex items-center gap-1 line-clamp-1"
                        >
                          <span>{row.sourceTitle || row.retrievedDomain}</span>
                          <ExternalLink className="w-2.5 h-2.5 text-slate-400 flex-shrink-0" />
                        </a>
                        <span className="text-[10px] text-slate-500 font-mono">{row.retrievedDomain}</span>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        {row.citationStatus === 'Cited' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                            <CheckCircle className="w-3 h-3" />
                            Cited
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600">
                            Uncited
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 max-w-[220px]">
                        <p className="text-[11px] text-slate-700 line-clamp-3 leading-snug" title={row.citedClaim}>
                          "{row.citedClaim}"
                        </p>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          {isTarget ? (
                            <Target className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                          ) : (
                            <Building className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          )}
                          <span className={`font-medium ${isTarget ? 'text-emerald-900 font-semibold' : 'text-slate-800'}`}>
                            {row.mentionedBrand}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Pos in answer: <strong className="font-mono text-slate-700">{row.brandPosition}</strong>
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
    </div>
  );
};
