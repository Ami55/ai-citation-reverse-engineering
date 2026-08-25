import React, { useState } from 'react';
import { ProjectState, BrandVisibilityMetric } from '../../types';
import { calculateBrandMetrics } from '../../utils/metrics';
import { EvidenceBadge } from '../EvidenceBadge';
import {
  Eye,
  Target,
  Building,
  BarChart2,
  HelpCircle,
  Percent,
  CheckCircle2,
  Globe,
  Sliders,
} from 'lucide-react';

interface BrandVisibilityViewProps {
  project: ProjectState;
}

export const BrandVisibilityView: React.FC<BrandVisibilityViewProps> = ({ project }) => {
  const [selectedBrand, setSelectedBrand] = useState<BrandVisibilityMetric | null>(null);

  const brandMetrics = calculateBrandMetrics(
    project.runs || [],
    project.targetDomain,
    project.competitorDomains
  );

  const totalRuns = project.runs.filter((r) => r.status === 'success').length;

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-sky-600" />
            <h2 className="text-base font-bold text-slate-900">Brand Visibility & Citation Share</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Diagnostic calculation of brand mention frequency, citation stability, and cross-platform conversion rates.
          </p>
        </div>
        <EvidenceBadge label="Observed API Data" size="sm" />
      </div>

      {/* Main Metrics Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Brand Citation Matrix (N = {totalRuns} valid runs)</h3>
          <span className="text-[11px] text-slate-500 font-mono">Sample sizes displayed per metric</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100/80 text-slate-700 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Brand / Domain</th>
                <th className="py-3 px-3">Classification</th>
                <th className="py-3 px-3">Citation Freq (n={totalRuns})</th>
                <th className="py-3 px-3">Retrieval Freq (n={totalRuns})</th>
                <th className="py-3 px-3">Mention Freq (n={totalRuns})</th>
                <th className="py-3 px-3">Conversion Rate</th>
                <th className="py-3 px-3">Avg Position</th>
                <th className="py-3 px-3">Cross-Platform</th>
                <th className="py-3 px-3">Stability</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {brandMetrics.map((brand) => {
                const isTarget = brand.isTargetBrand;
                return (
                  <tr
                    key={brand.domain}
                    className={`hover:bg-slate-50 transition-colors ${
                      isTarget ? 'bg-emerald-50/40 font-medium' : ''
                    }`}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {isTarget ? (
                          <Target className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        ) : (
                          <Building className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        )}
                        <div>
                          <div className={`font-bold ${isTarget ? 'text-emerald-950' : 'text-slate-900'}`}>
                            {brand.brandName}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">{brand.domain}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      {isTarget ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          Target Brand
                        </span>
                      ) : brand.isDirectCompetitor ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
                          Direct Competitor
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600">
                          Indirect / Publisher
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 font-mono font-bold text-emerald-700">
                      {brand.citationFrequency}%
                    </td>

                    <td className="py-3 px-3 font-mono text-slate-700">
                      {brand.retrievalFrequency}%
                    </td>

                    <td className="py-3 px-3 font-mono text-indigo-700 font-semibold">
                      {brand.mentionFrequency}%
                    </td>

                    <td className="py-3 px-3 font-mono text-slate-800">
                      {brand.citationConversionRate}%
                    </td>

                    <td className="py-3 px-3 font-mono text-slate-600">
                      {brand.averageAnswerPosition > 0 ? `#${brand.averageAnswerPosition}` : 'N/A'}
                    </td>

                    <td className="py-3 px-3 font-mono text-slate-700">
                      {brand.crossPlatformPresence}%
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5 font-mono text-xs">
                        <span className="font-semibold text-slate-800">{brand.citationStability}</span>
                        <span className="text-[10px] text-slate-400">/100</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedBrand(brand)}
                        className="px-2.5 py-1 text-[11px] font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded border border-slate-300 transition-colors"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Brand Drilldown Modal */}
      {selectedBrand && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full border border-slate-200 p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                  {selectedBrand.isTargetBrand ? <Target className="w-4 h-4 text-emerald-600" /> : <Building className="w-4 h-4 text-slate-500" />}
                  {selectedBrand.brandName} Detailed Analytics
                </h3>
                <span className="text-xs text-slate-500 font-mono">{selectedBrand.domain}</span>
              </div>
              <button
                onClick={() => setSelectedBrand(null)}
                className="text-xs text-slate-500 hover:text-slate-700 px-2.5 py-1 bg-slate-100 rounded"
              >
                Close
              </button>
            </div>

            {/* Platform Presence Breakdown */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">Platform Breakdown</span>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-lg bg-sky-50 border border-sky-200">
                  <span className="text-[10px] text-sky-700 font-bold block">Gemini</span>
                  <span className="font-mono text-sm font-bold text-sky-900">{selectedBrand.platformPresence.gemini}%</span>
                </div>
                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200">
                  <span className="text-[10px] text-emerald-700 font-bold block">OpenAI</span>
                  <span className="font-mono text-sm font-bold text-emerald-900">{selectedBrand.platformPresence.openai}%</span>
                </div>
                <div className="p-2.5 rounded-lg bg-indigo-50 border border-indigo-200">
                  <span className="text-[10px] text-indigo-700 font-bold block">Claude</span>
                  <span className="font-mono text-sm font-bold text-indigo-900">{selectedBrand.platformPresence.claude}%</span>
                </div>
              </div>
            </div>

            {/* Triggering Queries */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">Observed Associated Queries</span>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {selectedBrand.associatedQueries.length === 0 ? (
                  <span className="text-xs text-slate-400 italic">No queries associated</span>
                ) : (
                  selectedBrand.associatedQueries.map((q, idx) => (
                    <div key={idx} className="p-2 bg-slate-50 rounded border border-slate-200 font-mono text-[11px] text-slate-800">
                      {q}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Associated Claims */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">Associated AI Answer Claims</span>
              <div className="space-y-1 max-h-36 overflow-y-auto">
                {selectedBrand.associatedClaims.length === 0 ? (
                  <span className="text-xs text-slate-400 italic">No claims recorded</span>
                ) : (
                  selectedBrand.associatedClaims.map((claim, idx) => (
                    <p key={idx} className="p-2 bg-slate-50 rounded border border-slate-200 text-xs text-slate-700 italic">
                      "{claim}"
                    </p>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
