import React, { useState } from 'react';
import { ProjectState, CitationOpportunityItem, RecommendedExperimentItem } from '../../types';
import { EvidenceBadge } from '../EvidenceBadge';
import { ResearchStepGuide } from '../ResearchStepGuide';
import {
  Sparkles,
  ExternalLink,
  Target,
  Building,
  CheckCircle2,
  AlertTriangle,
  Plus,
  ArrowRight,
  Filter,
  Layers,
  FlaskConical,
} from 'lucide-react';

interface CitationOpportunitiesViewProps {
  project: ProjectState;
  onUpdateExperiments?: (experiments: RecommendedExperimentItem[]) => void;
  onUpdateOpportunities?: (opportunities: CitationOpportunityItem[]) => void;
}

export const CitationOpportunitiesView: React.FC<CitationOpportunitiesViewProps> = ({
  project,
  onUpdateExperiments,
  onUpdateOpportunities,
}) => {
  const opportunities = project.opportunities || [];
  const experiments = project.experiments || [];

  const [activeTab, setActiveTab] = useState<'opportunities' | 'experiments'>('opportunities');
  const [filterPriority, setFilterPriority] = useState<string>('All');
  const [filterStage, setFilterStage] = useState<string>('All');
  const [selectedOpp, setSelectedOpp] = useState<CitationOpportunityItem | null>(opportunities[0] || null);

  const filteredOpps = opportunities.filter((opp) => {
    const matchPriority = filterPriority === 'All' || opp.priority === filterPriority;
    const matchStage = filterStage === 'All' || opp.funnelStage.includes(filterStage);
    return matchPriority && matchStage;
  });

  const handleStatusChange = (oppId: string, newStatus: CitationOpportunityItem['humanReviewStatus']) => {
    if (!onUpdateOpportunities) return;
    const updated = opportunities.map((o) => (o.id === oppId ? { ...o, humanReviewStatus: newStatus } : o));
    onUpdateOpportunities(updated);
    if (selectedOpp?.id === oppId) {
      setSelectedOpp({ ...selectedOpp, humanReviewStatus: newStatus });
    }
  };

  const handleCreateExperimentFromOpp = (opp: CitationOpportunityItem) => {
    if (!onUpdateExperiments) return;
    const newExp: RecommendedExperimentItem = {
      id: `exp-${Date.now()}`,
      pageUrl: opp.closestTargetUrl || project.relevantTargetUrls[0] || `https://${project.targetDomain}`,
      proposedChange: opp.recommendedExperiment,
      evidence: `Based on competitor citation of ${opp.citedCompetitor}: ${opp.observedDifference}`,
      hypothesis: `Closing the gap on "${opp.searchQuery}" will increase direct brand citation and improve search alignment.`,
      successMetric: 'Citation rate on re-test runs',
      baseline: '0% brand citation in current cluster',
      retestPrompts: [opp.triggeringPrompt],
      retestPlatforms: [opp.platform],
      retestDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      status: 'Active Testing',
      evidenceLabel: 'Likely Citation Factor',
    };
    onUpdateExperiments([...experiments, newExp]);
    setActiveTab('experiments');
  };

  return (
    <div className="space-y-6">
      <ResearchStepGuide
        step="Step 3"
        title="Turn a citation gap into one controlled website change"
        purpose="Find where your page lost—retrieval, citation, brand mention, or recommendation—then change the page for that specific reason."
        inputs={[`${opportunities.length} diagnosed opportunities`, `${experiments.length} experiments tracked`, 'Observed competitor citations and your closest target URL']}
        actions={['Start with High priority and High confidence.', 'Read the funnel stage and observed difference.', 'Open supporting reports only if you need to verify the evidence.', 'Approve one experiment and implement its proposed change on the named URL.', 'Record the baseline and do not combine unrelated changes in one test.']}
        output="A page-level experiment with a proposed change, hypothesis, success metric, retest prompts, and retest date."
        interpretation="The recommendation is a testable hypothesis, not proof of a ranking factor. Implement it because the observed cited page has a useful difference your page lacks."
        doneWhen="the change is live, indexable, documented, and connected to the exact prompts used in the baseline."
      />
      {/* Header Info */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">
              Citation Opportunities & Content Gap Hypotheses
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Identify specific reasons why competitors were cited instead of your target pages, and track controlled experiments.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            onClick={() => setActiveTab('opportunities')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'opportunities'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Opportunities ({opportunities.length})
          </button>
          <button
            onClick={() => setActiveTab('experiments')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'experiments'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Experiments ({experiments.length})
          </button>
        </div>
      </div>

      {activeTab === 'opportunities' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Opportunities List */}
          <div className="lg:col-span-7 space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-lg border border-slate-200 text-xs">
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-500 font-medium">Priority:</span>
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-slate-700 text-xs"
                >
                  <option value="All">All Priorities</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-medium">Funnel Stage:</span>
                <select
                  value={filterStage}
                  onChange={(e) => setFilterStage(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-slate-700 text-xs"
                >
                  <option value="All">All Stages</option>
                  <option value="Stage 1">Stage 1 (Query alignment)</option>
                  <option value="Stage 2">Stage 2 (Not retrieved)</option>
                  <option value="Stage 3">Stage 3 (Retrieved not cited)</option>
                </select>
              </div>
            </div>

            {filteredOpps.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">
                No citation opportunities match the selected filters.
              </div>
            ) : (
              filteredOpps.map((opp) => {
                const isSelected = selectedOpp?.id === opp.id;
                return (
                  <div
                    key={opp.id}
                    onClick={() => setSelectedOpp(opp)}
                    className={`bg-white rounded-xl border p-4 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-indigo-500 shadow-md ring-2 ring-indigo-100'
                        : 'border-slate-200 hover:border-slate-300 shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            opp.priority === 'High'
                              ? 'bg-rose-100 text-rose-700 border border-rose-200'
                              : opp.priority === 'Medium'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {opp.priority} Priority
                        </span>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono uppercase">
                          {opp.platform}
                        </span>
                        <EvidenceBadge label={opp.evidenceLabel} size="sm" />
                      </div>

                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                          opp.humanReviewStatus === 'Approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : opp.humanReviewStatus === 'In Experiment'
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {opp.humanReviewStatus}
                      </span>
                    </div>

                    <h3 className="text-sm font-semibold text-slate-900 mb-1">
                      {opp.triggeringPrompt}
                    </h3>

                    <div className="text-xs text-slate-600 space-y-1 mt-2">
                      <p>
                        <strong className="text-slate-700">Cited Competitor:</strong>{' '}
                        <span className="font-semibold text-indigo-700">{opp.citedCompetitor}</span>
                      </p>
                      <p className="text-slate-500 line-clamp-2">
                        <strong>Observed Difference:</strong> {opp.observedDifference}
                      </p>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <span className="text-[11px] truncate max-w-[280px]">{opp.funnelStage}</span>
                      <span className="text-indigo-600 font-medium flex items-center gap-1">
                        View Details <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Selected Opportunity Detailed Panel */}
          <div className="lg:col-span-5">
            {selectedOpp ? (
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs sticky top-20 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Target className="w-4 h-4 text-indigo-600" />
                    Opportunity Deep Dive
                  </h3>
                  <EvidenceBadge label={selectedOpp.evidenceLabel} size="sm" />
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Triggering Prompt</span>
                    <p className="text-slate-800 font-medium mt-0.5 bg-slate-50 p-2 rounded border border-slate-100">
                      "{selectedOpp.triggeringPrompt}"
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Extracted Model Query</span>
                    <p className="font-mono text-slate-700 bg-slate-50 p-2 rounded border border-slate-100 text-[11px]">
                      {selectedOpp.searchQuery}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Cited Competitor & URL</span>
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <span className="font-semibold text-slate-900">{selectedOpp.citedCompetitor}</span>
                      {selectedOpp.competitorUrl && (
                        <a
                          href={selectedOpp.competitorUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sky-600 hover:underline flex items-center gap-1 font-mono text-[10px]"
                        >
                          Visit Source <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Supported Claim by Competitor</span>
                    <p className="text-slate-700 bg-amber-50/50 p-2 rounded border border-amber-100/60 mt-0.5">
                      {selectedOpp.supportedClaim}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Closest Target Page</span>
                    <p className="font-mono text-slate-600 text-[11px] truncate mt-0.5">
                      {selectedOpp.closestTargetUrl}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Observed Difference & Barrier</span>
                    <p className="text-slate-700 mt-0.5 leading-relaxed">
                      {selectedOpp.observedDifference}
                    </p>
                  </div>

                  <div className="bg-indigo-50/70 border border-indigo-100 rounded-lg p-3">
                    <span className="text-[10px] text-indigo-700 font-bold uppercase tracking-wider block mb-1">
                      Recommended Action / Experiment
                    </span>
                    <p className="text-indigo-950 font-medium leading-relaxed">
                      {selectedOpp.recommendedExperiment}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                    <button
                      onClick={() => handleCreateExperimentFromOpp(selectedOpp)}
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                    >
                      <FlaskConical className="w-3.5 h-3.5" />
                      Create Controlled Experiment
                    </button>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-500">Status:</span>
                      <select
                        value={selectedOpp.humanReviewStatus}
                        onChange={(e) => handleStatusChange(selectedOpp.id, e.target.value as any)}
                        className="flex-1 bg-slate-50 border border-slate-200 rounded px-2 py-1 text-slate-700 text-xs"
                      >
                        <option value="Pending Review">Pending Review</option>
                        <option value="Approved">Approved</option>
                        <option value="In Experiment">In Experiment</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400">
                Select an opportunity on the left to view complete diagnostics.
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Experiments Tracker Tab */
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FlaskConical className="w-4 h-4 text-indigo-600" />
                  Controlled Citation Optimization Experiments
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Track page updates, scheduled re-testing dates, and observed citation outcome shifts.
                </p>
              </div>
            </div>

            {experiments.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs border border-dashed border-slate-200 rounded-lg">
                No active experiments tracked. Generate one from the Opportunities tab.
              </div>
            ) : (
              <div className="space-y-4">
                {experiments.map((exp) => (
                  <div
                    key={exp.id}
                    className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 hover:bg-white transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            exp.status === 'Active Testing'
                              ? 'bg-sky-100 text-sky-800'
                              : exp.status === 'Validated'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {exp.status}
                        </span>
                        <EvidenceBadge label={exp.evidenceLabel} size="sm" />
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        Target Retest: {exp.retestDate}
                      </span>
                    </div>

                    <h4 className="text-sm font-semibold text-slate-900 mb-1">
                      {exp.proposedChange}
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs mt-3 bg-white p-3 rounded-lg border border-slate-100">
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold block uppercase">Target Page</span>
                        <span className="font-mono text-slate-700 text-[11px] truncate block">{exp.pageUrl}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold block uppercase">Success Metric</span>
                        <span className="text-slate-700">{exp.successMetric}</span>
                      </div>
                      <div className="md:col-span-2">
                        <span className="text-[10px] text-slate-400 font-semibold block uppercase">Hypothesis</span>
                        <span className="text-slate-600 leading-relaxed">{exp.hypothesis}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
