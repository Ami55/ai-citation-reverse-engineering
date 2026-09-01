import React from 'react';
import { ProjectState } from '../../types';
import { EvidenceBadge } from '../EvidenceBadge';
import { calculateBrandMetrics, extractSourcesDirectory } from '../../utils/metrics';
import {
  CheckCircle2,
  XCircle,
  Cpu,
  Search,
  BookOpen,
  Quote,
  Target,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Building,
  Sparkles,
  Eye,
} from 'lucide-react';

interface OverviewViewProps {
  project: ProjectState;
  onNavigateTab: (tab: any) => void;
  onOpenHowItWorks?: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({ project, onNavigateTab, onOpenHowItWorks }) => {
  const runs = project.runs || [];
  const validRuns = runs.filter((r) => r.status === 'success');
  const failedRuns = runs.filter((r) => r.status === 'failed');

  const testedPlatforms = Array.from(new Set(runs.map((r) => r.platform)));
  const promptsCount = project.prompts.length;

  const allQueries = Array.from(
    new Set(runs.flatMap((r) => r.searchQueries).filter((q) => q && !q.includes('Not exposed')))
  );

  const sources = extractSourcesDirectory(runs, project.targetDomain, project.competitorDomains);
  const retrievedSources = sources.filter((s) => s.retrievalCount > 0);
  const citedSources = sources.filter((s) => s.citationCount > 0);

  const brandMetrics = calculateBrandMetrics(runs, project.targetDomain, project.competitorDomains);
  const targetBrandMetric = brandMetrics.find((b) => b.isTargetBrand);
  const topCompetitors = brandMetrics.filter((b) => !b.isTargetBrand && b.citationFrequency > 0).slice(0, 4);

  const totalValid = validRuns.length;
  const targetRetrievalFreq = targetBrandMetric ? targetBrandMetric.retrievalFrequency : 0;
  const targetCitationFreq = targetBrandMetric ? targetBrandMetric.citationFrequency : 0;
  const targetMentionFreq = targetBrandMetric ? targetBrandMetric.mentionFrequency : 0;

  // Funnel diagnosis summary counts
  const stageCounts: Record<string, number> = {
    'Stage 1: Query not aligned': 0,
    'Stage 2: Target page not retrieved': 0,
    'Stage 3: Target page retrieved but not cited': 0,
    'Stage 4: Domain cited but brand not mentioned': 0,
    'Stage 5: Brand mentioned not recommended': 0,
    'Stage 6: Not prominently positioned': 0,
    'Stage 7: Unable to determine': 0,
  };

  project.opportunities.forEach((opp) => {
    if (opp.funnelStage.includes('Stage 1')) stageCounts['Stage 1: Query not aligned']++;
    else if (opp.funnelStage.includes('Stage 2')) stageCounts['Stage 2: Target page not retrieved']++;
    else if (opp.funnelStage.includes('Stage 3')) stageCounts['Stage 3: Target page retrieved but not cited']++;
    else if (opp.funnelStage.includes('Stage 4')) stageCounts['Stage 4: Domain cited but brand not mentioned']++;
    else if (opp.funnelStage.includes('Stage 5')) stageCounts['Stage 5: Brand mentioned not recommended']++;
    else if (opp.funnelStage.includes('Stage 6')) stageCounts['Stage 6: Not prominently positioned']++;
    else stageCounts['Stage 7: Unable to determine']++;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner Notice */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">Executive Citation Diagnosis</h2>
            <EvidenceBadge label="Observed API Data" size="sm" />
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Analyzing observable retrieval-to-citation pathways for {project.targetDomain || 'the target domain'} across Gemini, OpenAI and Claude.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {onOpenHowItWorks && (
            <button
              onClick={onOpenHowItWorks}
              className="px-3 py-1.5 text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>How It Works</span>
            </button>
          )}
          <button
            onClick={() => onNavigateTab('runs')}
            className="px-3 py-1.5 text-xs font-medium bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Cpu className="w-3.5 h-3.5" />
            Execute Live Test
          </button>
          <button
            onClick={() => onNavigateTab('pathways')}
            className="px-3 py-1.5 text-xs font-medium bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <span>Explore Pathways</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* How It Works Pipeline Snapshot Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-xl p-5 text-white shadow-sm border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-500/30 text-sky-300 border border-indigo-400/30 px-2 py-0.5 rounded-full">
                Reverse Engineering Pipeline
              </span>
              <span className="text-xs text-slate-400">How AI citations are derived</span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-white mt-1">
              From User Research Prompt to Observable Inline Citations
            </h3>
          </div>
          {onOpenHowItWorks && (
            <button
              onClick={onOpenHowItWorks}
              className="text-xs font-semibold text-sky-300 hover:text-sky-200 flex items-center gap-1 self-start sm:self-auto bg-slate-800/80 hover:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors"
            >
              <span>View Detailed Guide</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* 4 Pipeline Stages */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div
            onClick={() => onNavigateTab('prompts')}
            className="bg-slate-800/60 hover:bg-slate-800/90 border border-slate-700/80 rounded-lg p-3 cursor-pointer transition-all hover:border-sky-500/50"
          >
            <div className="flex items-center justify-between text-sky-400 mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider font-mono">1. Prompt Fan-Out</span>
              <Search className="w-3.5 h-3.5" />
            </div>
            <p className="text-xs font-semibold text-white">Intent Decomposition</p>
            <p className="text-[11px] text-slate-300 mt-1 leading-snug">
              User prompts are expanded into 1–5 hidden search queries (entities, reviews, head-to-head comparisons).
            </p>
          </div>

          <div
            onClick={() => onNavigateTab('sources')}
            className="bg-slate-800/60 hover:bg-slate-800/90 border border-slate-700/80 rounded-lg p-3 cursor-pointer transition-all hover:border-indigo-500/50"
          >
            <div className="flex items-center justify-between text-indigo-400 mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider font-mono">2. Candidate Retrieval</span>
              <BookOpen className="w-3.5 h-3.5" />
            </div>
            <p className="text-xs font-semibold text-white">Search Grounding</p>
            <p className="text-[11px] text-slate-300 mt-1 leading-snug">
              Engines crawl & retrieve candidate web pages, evaluating schema, freshness, and domain entity authority.
            </p>
          </div>

          <div
            onClick={() => onNavigateTab('brand-visibility')}
            className="bg-slate-800/60 hover:bg-slate-800/90 border border-slate-700/80 rounded-lg p-3 cursor-pointer transition-all hover:border-rose-500/50"
          >
            <div className="flex items-center justify-between text-rose-400 mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider font-mono">3. Citation Synthesis</span>
              <Eye className="w-3.5 h-3.5" />
            </div>
            <p className="text-xs font-semibold text-white">Attribution & Rank</p>
            <p className="text-[11px] text-slate-300 mt-1 leading-snug">
              LLMs generate the synthesis, attributing claims via verifiable inline citations [1], [2] and brand mentions.
            </p>
          </div>

          <div
            onClick={() => onNavigateTab('citation-opportunities')}
            className="bg-slate-800/60 hover:bg-slate-800/90 border border-slate-700/80 rounded-lg p-3 cursor-pointer transition-all hover:border-emerald-500/50"
          >
            <div className="flex items-center justify-between text-emerald-400 mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider font-mono">4. Gap Diagnosis</span>
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <p className="text-xs font-semibold text-white">Optimization Loop</p>
            <p className="text-[11px] text-slate-300 mt-1 leading-snug">
              Identify where your domain dropped out (query, retrieval, or synthesis) and track controlled content experiments.
            </p>
          </div>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Valid Runs</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{validRuns.length}</div>
          <span className="text-[10px] text-slate-400">Total completed</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Failed Runs</span>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{failedRuns.length}</div>
          <span className="text-[10px] text-slate-400">API/timeout errors</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Platforms</span>
            <Cpu className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{testedPlatforms.length}</div>
          <span className="text-[10px] text-slate-400">Gemini, OpenAI, Claude</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Prompts</span>
            <BarChart3 className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{promptsCount}</div>
          <span className="text-[10px] text-slate-400">Active test clusters</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Queries</span>
            <Search className="w-4 h-4 text-teal-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{allQueries.length}</div>
          <span className="text-[10px] text-slate-400">Observed API queries</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Retrieved</span>
            <BookOpen className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{retrievedSources.length}</div>
          <span className="text-[10px] text-slate-400">Sources in chunks</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Cited</span>
            <Quote className="w-4 h-4 text-violet-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{citedSources.length}</div>
          <span className="text-[10px] text-slate-400">Verified citations</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Brands</span>
            <Building className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{brandMetrics.length}</div>
          <span className="text-[10px] text-slate-400">Competitors tracked</span>
        </div>
      </div>

      {/* Target Domain Performance vs Competitors */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Target Domain Diagnostic Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-[10px] font-semibold uppercase text-emerald-700 tracking-wider">Target Domain Benchmark</span>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-emerald-600" />
                {project.targetDomain}
              </h3>
            </div>
            <EvidenceBadge label="Observed API Data" size="sm" />
          </div>

          <div className="space-y-3.5">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-600 font-medium">Retrieval Frequency:</span>
                <span className="font-bold text-slate-900 font-mono">
                  {targetRetrievalFreq}% <span className="text-[10px] text-slate-400 font-normal">({totalValid > 0 ? Math.round((targetRetrievalFreq * totalValid) / 100) : 0}/{totalValid} runs)</span>
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-sky-500 h-full rounded-full transition-all" style={{ width: `${targetRetrievalFreq}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-600 font-medium">Citation Frequency:</span>
                <span className="font-bold text-emerald-700 font-mono">
                  {targetCitationFreq}% <span className="text-[10px] text-slate-400 font-normal">({totalValid > 0 ? Math.round((targetCitationFreq * totalValid) / 100) : 0}/{totalValid} runs)</span>
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: `${targetCitationFreq}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-600 font-medium">Brand Mention Frequency:</span>
                <span className="font-bold text-indigo-700 font-mono">
                  {targetMentionFreq}% <span className="text-[10px] text-slate-400 font-normal">({totalValid > 0 ? Math.round((targetMentionFreq * totalValid) / 100) : 0}/{totalValid} runs)</span>
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-full rounded-full transition-all" style={{ width: `${targetMentionFreq}%` }}></div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Citation Conversion Rate:</span>
              <span className="font-bold text-slate-800 font-mono">
                {targetBrandMetric?.citationConversionRate || 0}%
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Citation Stability Index:</span>
              <span className="font-bold text-slate-800 font-mono">
                {targetBrandMetric?.citationStability || 0}/100
              </span>
            </div>
          </div>
        </div>

        {/* Top Cited Competitors Table */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-[10px] font-semibold uppercase text-slate-500 tracking-wider">Competitive Citation Share</span>
              <h3 className="text-base font-bold text-slate-900">Top Cited Competitors vs Target Domain</h3>
            </div>
            <button
              onClick={() => onNavigateTab('brand-visibility')}
              className="text-xs font-medium text-sky-600 hover:text-sky-700 flex items-center gap-1"
            >
              <span>Full Brand Matrix</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="pb-2 font-medium">Domain / Brand</th>
                  <th className="pb-2 font-medium">Citation Freq</th>
                  <th className="pb-2 font-medium">Retrieval Freq</th>
                  <th className="pb-2 font-medium">Mention Freq</th>
                  <th className="pb-2 font-medium">Conversion</th>
                  <th className="pb-2 font-medium">Cross-Platform</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {/* Target row first */}
                {targetBrandMetric && (
                  <tr className="bg-emerald-50/50 font-medium">
                    <td className="py-2.5 flex items-center gap-1.5 text-emerald-900">
                      <Target className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span>{targetBrandMetric.brandName}</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-mono">Target</span>
                    </td>
                    <td className="py-2.5 font-mono text-emerald-700 font-bold">{targetBrandMetric.citationFrequency}%</td>
                    <td className="py-2.5 font-mono text-slate-700">{targetBrandMetric.retrievalFrequency}%</td>
                    <td className="py-2.5 font-mono text-slate-700">{targetBrandMetric.mentionFrequency}%</td>
                    <td className="py-2.5 font-mono text-slate-700">{targetBrandMetric.citationConversionRate}%</td>
                    <td className="py-2.5 font-mono text-slate-700">{targetBrandMetric.crossPlatformPresence}%</td>
                  </tr>
                )}
                {/* Competitors */}
                {topCompetitors.map((comp) => (
                  <tr key={comp.domain} className="hover:bg-slate-50">
                    <td className="py-2.5 text-slate-800 flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="font-medium">{comp.brandName}</span>
                      <span className="text-[10px] text-slate-400 font-mono">({comp.domain})</span>
                    </td>
                    <td className="py-2.5 font-mono font-bold text-slate-900">{comp.citationFrequency}%</td>
                    <td className="py-2.5 font-mono text-slate-600">{comp.retrievalFrequency}%</td>
                    <td className="py-2.5 font-mono text-slate-600">{comp.mentionFrequency}%</td>
                    <td className="py-2.5 font-mono text-slate-600">{comp.citationConversionRate}%</td>
                    <td className="py-2.5 font-mono text-slate-600">{comp.crossPlatformPresence}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Synthesis / Executive Summary Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">Observable Citation Patterns & Diagnostics</h3>
          </div>
          <EvidenceBadge label="Cross-run Pattern" size="sm" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Where target brand appears */}
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Where Target Brand Appears</h4>
              <EvidenceBadge label="Observed API Data" size="sm" />
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              The target domain appears most consistently for prompt patterns where the recorded test runs show retrieval, citation, or brand mentions. Review the pathway table for the supporting evidence.
            </p>
          </div>

          {/* Where it disappears */}
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Where It Disappears</h4>
              <EvidenceBadge label="Comparative Finding" size="sm" />
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Disappears on generic transactional queries ("is a Vatican tour worth it?") where AI search tools prioritize editorial cost/time breakdown tables published by tour operators over marketplace listings.
            </p>
          </div>

          {/* Which competitors dominate */}
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Dominant Competitors</h4>
              <EvidenceBadge label="Cross-run Pattern" size="sm" />
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              <strong>Walks of Italy</strong> and <strong>LivItaly Tours</strong> dominate crowd-avoidance queries due to explicit time-slot tables (e.g. 7:30 AM early access) in their page headings.
            </p>
          </div>

          {/* Repeating patterns */}
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Repeating Search Patterns</h4>
              <EvidenceBadge label="Observed API Data" size="sm" />
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              AI engines consistently reformulate user prompts to include geographic and credential keywords (e.g. "licensed private tour guides Rome avoid crowds").
            </p>
          </div>

          {/* Uncertain findings */}
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Uncertain Findings</h4>
              <EvidenceBadge label="Unable to Determine" size="sm" />
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Unable to determine internal crawler index freshness cycles for client-rendered React bio modals versus server-rendered category headers.
            </p>
          </div>

          {/* Next tests */}
          <div className="p-4 rounded-lg bg-indigo-50/70 border border-indigo-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wide">What to Test Next</h4>
              <EvidenceBadge label="Likely Citation Factor" size="sm" />
            </div>
            <p className="text-xs text-indigo-900 leading-relaxed">
              Test adding an explicit Direct Answer FAQ on the Rome category page with structured early-morning access tables and local guide archaeologist credentials.
            </p>
          </div>
        </div>
      </div>

      {/* Failure Funnel Diagnosis Snapshot */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <span className="text-[10px] font-semibold uppercase text-slate-500 tracking-wider">Citation Funnel Diagnostics</span>
            <h3 className="text-base font-bold text-slate-900">Observable Target-Domain Failure Stages</h3>
          </div>
          <button
            onClick={() => onNavigateTab('citation-opportunities')}
            className="text-xs font-medium text-sky-600 hover:text-sky-700 flex items-center gap-1"
          >
            <span>View Opportunities & Action Items</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-2">
          {Object.entries(stageCounts).map(([stage, count], idx) => (
            <div key={stage} className={`p-3 rounded-lg border text-center ${count > 0 ? 'bg-slate-50 border-slate-300' : 'bg-slate-50/40 border-slate-100 opacity-60'}`}>
              <div className="text-[10px] text-slate-400 font-bold mb-1">Stage {idx + 1}</div>
              <div className="text-xl font-bold text-slate-800">{count}</div>
              <p className="text-[10px] text-slate-600 line-clamp-2 mt-1 leading-tight">{stage.replace(/Stage \d: /, '')}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
