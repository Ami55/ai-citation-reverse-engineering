import React from 'react';
import { EvidenceLabel } from '../types';
import { ShieldCheck, FileSearch, Layers, GitCompare, Sparkles, HelpCircle, AlertCircle } from 'lucide-react';

interface EvidenceBadgeProps {
  label: EvidenceLabel;
  size?: 'sm' | 'md';
  showTooltip?: boolean;
}

export const EvidenceBadge: React.FC<EvidenceBadgeProps> = ({
  label,
  size = 'md',
}) => {
  const getBadgeConfig = () => {
    switch (label) {
      case 'Observed API Data':
        return {
          icon: ShieldCheck,
          bg: 'bg-sky-50 text-sky-800 border-sky-200',
          dot: 'bg-sky-500',
          desc: 'Directly returned by platform search or grounding metadata',
        };
      case 'Extracted Page Evidence':
        return {
          icon: FileSearch,
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          dot: 'bg-emerald-500',
          desc: 'Directly verified from the source HTML or page text',
        };
      case 'Cross-run Pattern':
        return {
          icon: Layers,
          bg: 'bg-indigo-50 text-indigo-800 border-indigo-200',
          dot: 'bg-indigo-500',
          desc: 'Observed consistently across multiple test iterations',
        };
      case 'Comparative Finding':
        return {
          icon: GitCompare,
          bg: 'bg-teal-50 text-teal-800 border-teal-200',
          dot: 'bg-teal-500',
          desc: 'Direct observable delta between competitor and target page',
        };
      case 'Likely Citation Factor':
        return {
          icon: Sparkles,
          bg: 'bg-amber-50 text-amber-900 border-amber-300',
          dot: 'bg-amber-500',
          desc: 'High correlation with observable citation, not confirmed ranking weight',
        };
      case 'Unverified Hypothesis':
        return {
          icon: HelpCircle,
          bg: 'bg-rose-50 text-rose-800 border-rose-200',
          dot: 'bg-rose-500',
          desc: 'Logical assumption requiring further controlled experimentation',
        };
      case 'Unable to Determine':
      default:
        return {
          icon: AlertCircle,
          bg: 'bg-slate-100 text-slate-700 border-slate-300',
          dot: 'bg-slate-400',
          desc: 'Data not exposed by platform or insufficient sample size',
        };
    }
  };

  const config = getBadgeConfig();
  const IconComponent = config.icon;

  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-xs gap-1.5'
      : 'px-2.5 py-1 text-xs gap-1.5 font-medium';

  return (
    <span
      className={`inline-flex items-center rounded-md border ${config.bg} ${sizeClasses} transition-colors select-none`}
      title={`${label}: ${config.desc}`}
    >
      <IconComponent className="w-3.5 h-3.5 flex-shrink-0" />
      <span className="whitespace-nowrap">{label}</span>
    </span>
  );
};
