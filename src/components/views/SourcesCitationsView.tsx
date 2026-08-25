import React, { useState, useMemo } from 'react';
import { ProjectState, ExtractedSourceItem, SourceClassification } from '../../types';
import { extractSourcesDirectory } from '../../utils/metrics';
import { EvidenceBadge } from '../EvidenceBadge';
import {
  BookOpen,
  Search,
  ExternalLink,
  Target,
  Building,
  CheckCircle,
  XCircle,
  Layers,
  FileText,
  Filter,
} from 'lucide-react';

interface SourcesCitationsViewProps {
  project: ProjectState;
}

export const SourcesCitationsView: React.FC<SourcesCitationsViewProps> = ({ project }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'cited' | 'retrieved_only' | 'target'>('all');
  const [classificationFilter, setClassificationFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const sources: ExtractedSourceItem[] = useMemo(() => {
    return extractSourcesDirectory(
      project.runs || [],
      project.targetDomain,
      project.competitorDomains
    );
  }, [project.runs, project.targetDomain, project.competitorDomains]);

  const filteredSources = useMemo(() => {
    return sources.filter((s) => {
      // Tab filter
      if (activeTab === 'cited' && s.citationCount === 0) return false;
      if (activeTab === 'retrieved_only' && (s.citationCount > 0 || s.retrievalCount === 0)) return false;
      if (activeTab === 'target' && !s.domain.includes(project.targetDomain)) return false;

      // Classification filter
      if (classificationFilter !== 'All' && s.classification !== classificationFilter) return false;

      // Search filter
      if (
        searchQuery &&
        !s.url.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !s.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !s.domain.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      return true;
    });
  }, [sources, activeTab, classificationFilter, searchQuery, project.targetDomain]);

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-sky-600" />
            <h2 className="text-base font-bold text-slate-900">
              Source & Citation Intelligence Directory
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Classify and compare consulted sources, cited passages, and un-cited retrieved URLs across test runs.
          </p>
        </div>
        <EvidenceBadge label="Observed API Data" size="sm" />
      </div>

      {/* Tabs & Controls */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                activeTab === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              All Sources ({sources.length})
            </button>
            <button
              onClick={() => setActiveTab('cited')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                activeTab === 'cited'
                  ? 'bg-emerald-700 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Cited Sources ({sources.filter((s) => s.citationCount > 0).length})
            </button>
            <button
              onClick={() => setActiveTab('retrieved_only')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                activeTab === 'retrieved_only'
                  ? 'bg-amber-700 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Consulted but Not Cited ({sources.filter((s) => s.citationCount === 0 && s.retrievalCount > 0).length})
            </button>
            <button
              onClick={() => setActiveTab('target')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                activeTab === 'target'
                  ? 'bg-sky-800 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Target Domain Pages ({sources.filter((s) => s.domain.includes(project.targetDomain)).length})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search domain or title..."
                className="pl-8 pr-2 py-1.5 text-xs border border-slate-300 rounded-md w-52"
              />
            </div>

            <select
              value={classificationFilter}
              onChange={(e) => setClassificationFilter(e.target.value)}
              className="text-xs border border-slate-300 rounded-md p-1.5 bg-white"
            >
              <option value="All">All Classifications</option>
              <option value="Target domain">Target domain</option>
              <option value="Direct competitor">Direct competitor</option>
              <option value="Marketplace">Marketplace</option>
              <option value="Review platform">Review platform</option>
              <option value="Editorial publisher">Editorial publisher</option>
              <option value="Official or government">Official or government</option>
              <option value="Retrieved but not cited">Retrieved but not cited</option>
            </select>
          </div>
        </div>

        {/* Source Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSources.length === 0 ? (
            <div className="col-span-2 py-10 text-center text-xs text-slate-400">
              No sources found matching current filters.
            </div>
          ) : (
            filteredSources.map((source) => {
              const isTarget = source.domain.includes(project.targetDomain);
              return (
                <div
                  key={source.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isTarget
                      ? 'bg-emerald-50/40 border-emerald-300 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        {isTarget ? (
                          <Target className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        ) : (
                          <Building className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        )}
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noreferrer"
                          className="font-bold text-xs text-slate-900 hover:text-sky-600 flex items-center gap-1 line-clamp-1"
                        >
                          <span>{source.title || source.domain}</span>
                          <ExternalLink className="w-3 h-3 text-slate-400 flex-shrink-0" />
                        </a>
                      </div>

                      <div className="text-[11px] font-mono text-slate-500 truncate">
                        {source.url}
                      </div>
                    </div>

                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-slate-100 text-slate-700 whitespace-nowrap border border-slate-200">
                      {source.classification}
                    </span>
                  </div>

                  {/* Retrieval & Citation Stats */}
                  <div className="grid grid-cols-3 gap-2 my-3 p-2 bg-slate-50 rounded-lg text-center text-xs border border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-medium">Retrievals</span>
                      <strong className="text-slate-800 font-mono">{source.retrievalCount}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-medium">Citations</span>
                      <strong className="text-emerald-700 font-mono">{source.citationCount}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-medium">Brand Mentions</span>
                      <strong className="text-indigo-700 font-mono">{source.mentionCount}</strong>
                    </div>
                  </div>

                  {/* Supported Claims or Passages */}
                  {source.supportedClaims.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                        Supported Claims in AI Answers:
                      </span>
                      <div className="space-y-1">
                        {source.supportedClaims.slice(0, 2).map((claim, cIdx) => (
                          <p
                            key={cIdx}
                            className="text-[11px] text-slate-700 italic bg-white p-2 rounded border border-slate-200 line-clamp-2 leading-relaxed"
                          >
                            "{claim}"
                          </p>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Queries triggering source */}
                  {source.associatedQueries.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-slate-100 text-[10px] text-slate-500">
                      <span className="font-semibold text-slate-600">Triggering Queries: </span>
                      <span className="font-mono text-slate-700">
                        {source.associatedQueries.slice(0, 2).join(' • ')}
                      </span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
