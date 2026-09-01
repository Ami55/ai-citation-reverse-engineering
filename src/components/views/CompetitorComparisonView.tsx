import React, { useState } from 'react';
import { ProjectState, CompetitorComparisonReport } from '../../types';
import { EvidenceBadge } from '../EvidenceBadge';
import {
  Scale,
  ExternalLink,
  Target,
  Building,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Layers,
  FileText,
  Lightbulb,
} from 'lucide-react';

interface CompetitorComparisonViewProps {
  project: ProjectState;
}

export const CompetitorComparisonView: React.FC<CompetitorComparisonViewProps> = ({ project }) => {
  const comparisons = project.competitorComparisons || [];
  const [selectedCompId, setSelectedCompId] = useState<string>(comparisons[0]?.id || '');

  const activeReport = comparisons.find((c) => c.id === selectedCompId) || comparisons[0];

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-sky-600" />
            <h2 className="text-base font-bold text-slate-900">
              Competitor vs Target Page Deep Architecture Audit
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Side-by-side diagnosis of observable structural factors influencing AI grounding and snippet extraction.
          </p>
        </div>
        <EvidenceBadge label="Comparative Finding" size="sm" />
      </div>

      {/* Selector if multiple */}
      {comparisons.length > 1 && (
        <div className="flex items-center gap-2 bg-white p-3 rounded-lg border border-slate-200 text-xs">
          <span className="font-semibold text-slate-700">Select Comparison Audit:</span>
          <select
            value={selectedCompId}
            onChange={(e) => setSelectedCompId(e.target.value)}
            className="p-1.5 border border-slate-300 rounded-md bg-white text-xs"
          >
            {comparisons.map((c) => (
              <option key={c.id} value={c.id}>
                {c.competitorDomain} vs {project.targetDomain}
              </option>
            ))}
          </select>
        </div>
      )}

      {activeReport ? (
        <div className="space-y-6">
          {/* Top URLs Header */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Competitor URL Card */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                  Repeatedly Cited Competitor Page
                </span>
                <EvidenceBadge label="Observed API Data" size="sm" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 line-clamp-1">{activeReport.titleCompetitor}</h3>
              <a
                href={activeReport.competitorUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-mono text-sky-700 hover:underline flex items-center gap-1 truncate"
              >
                <span>{activeReport.competitorUrl}</span>
                <ExternalLink className="w-3 h-3 flex-shrink-0" />
              </a>
              <div className="text-xs text-slate-600 pt-1">
                <strong>Page Architecture: </strong> {activeReport.pageTypeCompetitor}
              </div>
            </div>

            {/* Target URL Card */}
            <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-300 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                  Closest Relevant Target Page
                </span>
                <EvidenceBadge label="Comparative Finding" size="sm" />
              </div>
              <h3 className="font-bold text-sm text-emerald-950 line-clamp-1">{activeReport.titleTarget}</h3>
              <a
                href={activeReport.closestTargetUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-mono text-emerald-700 hover:underline flex items-center gap-1 truncate"
              >
                <span>{activeReport.closestTargetUrl}</span>
                <ExternalLink className="w-3 h-3 flex-shrink-0" />
              </a>
              <div className="text-xs text-emerald-900 pt-1">
                <strong>Page Architecture: </strong> {activeReport.pageTypeTarget}
              </div>
            </div>
          </div>

          {/* Core Comparative Matrix */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="p-4 border-b border-slate-200 bg-slate-50 font-bold text-xs text-slate-900">
              Structural & Qualitative Attribute Analysis
            </div>
            <div className="divide-y divide-slate-100 text-xs">
              {/* Headings */}
              <div className="grid grid-cols-1 md:grid-cols-3 p-3.5 gap-3">
                <div className="font-semibold text-slate-700">Heading Hierarchy Structure</div>
                <div className="text-slate-700 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Competitor</span>
                  {activeReport.headingStructureCompetitor.map((h, i) => (
                    <div key={i} className="font-mono text-[11px] bg-slate-50 p-1 rounded border border-slate-200">
                      {h}
                    </div>
                  ))}
                </div>
                <div className="text-slate-700 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-emerald-700 block">Target Domain</span>
                  {activeReport.headingStructureTarget.map((h, i) => (
                    <div key={i} className="font-mono text-[11px] bg-emerald-50/50 p-1 rounded border border-emerald-200">
                      {h}
                    </div>
                  ))}
                </div>
              </div>

              {/* Answer Clarity & Placement */}
              <div className="grid grid-cols-1 md:grid-cols-3 p-3.5 gap-3">
                <div className="font-semibold text-slate-700">Answer Clarity & Information Placement</div>
                <div className="text-slate-700">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Competitor</span>
                  <p>{activeReport.answerClarityCompetitor}</p>
                  <p className="mt-1 text-[11px] text-slate-500">Placement: {activeReport.informationPlacement}</p>
                </div>
                <div className="text-slate-700">
                  <span className="text-[10px] uppercase font-bold text-emerald-700 block mb-1">Target Domain</span>
                  <p>{activeReport.answerClarityTarget}</p>
                </div>
              </div>

              {/* First-hand experience & Guide attribution */}
              <div className="grid grid-cols-1 md:grid-cols-3 p-3.5 gap-3">
                <div className="font-semibold text-slate-700">First-Hand Insight & Guide Credentials</div>
                <div className="text-slate-700">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Competitor</span>
                  <p>{activeReport.firstHandExperienceCompetitor}</p>
                  <p className="mt-1 text-[11px] text-slate-500">{activeReport.authorOrExpertAttributionCompetitor}</p>
                </div>
                <div className="text-slate-700">
                  <span className="text-[10px] uppercase font-bold text-emerald-700 block mb-1">Target Domain</span>
                  <p>{activeReport.firstHandExperienceTarget}</p>
                  <p className="mt-1 text-[11px] text-emerald-800 font-medium">{activeReport.authorOrExpertAttributionTarget}</p>
                </div>
              </div>

              {/* Structured Data & Extractable passages */}
              <div className="grid grid-cols-1 md:grid-cols-3 p-3.5 gap-3">
                <div className="font-semibold text-slate-700">Structured Data & Extractable Snippets</div>
                <div className="text-slate-700 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Competitor Snippets</span>
                  {activeReport.extractableAnswerPassages.map((p, idx) => (
                    <p key={idx} className="p-2 bg-amber-50 rounded border border-amber-200 text-[11px] italic text-amber-950">
                      "{p}"
                    </p>
                  ))}
                  <div className="text-[11px] font-mono text-slate-500 pt-1">
                    Schema: {activeReport.structuredData}
                  </div>
                </div>
                <div className="text-slate-700">
                  <span className="text-[10px] uppercase font-bold text-emerald-700 block mb-1">Target Domain Coverage</span>
                  <p className="text-[11px] leading-relaxed">
                    Bio modals and dynamic listing cards present rich reviews, but lack FAQ schema markup for immediate LLM snippet grounding.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Coverage Gap & Information Gain Opportunities */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Coverage Comparison */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Coverage Gap Breakdown</h4>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="font-bold text-slate-800 block text-[11px]">Shared Topic Coverage:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {activeReport.sharedCoverage.map((sc, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px]">
                        {sc}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="font-bold text-amber-800 block text-[11px]">Competitor-Only Coverage (Missing on Target):</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {activeReport.competitorOnlyCoverage.map((coc, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200 text-[10px]">
                        {coc}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="font-bold text-emerald-800 block text-[11px]">Target-Only Differentiators:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {activeReport.targetOnlyCoverage.map((toc, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-900 border border-emerald-200 text-[10px]">
                        {toc}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Information Gain Opportunities */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-600" />
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Information Gain Opportunities</h4>
                </div>
                <EvidenceBadge label="Likely Citation Factor" size="sm" />
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Do not copy competitor content. Add unique first-hand value from the target brand's own experts and contributors:
              </p>

              <div className="space-y-2 text-xs">
                {activeReport.informationGainOpportunities.map((opp, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-start gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-800">{opp}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-xl border border-slate-200">
          No competitor comparison reports configured.
        </div>
      )}
    </div>
  );
};
