import React from 'react';
import { Info } from 'lucide-react';

export const DisclaimerBanner: React.FC = () => {
  return (
    <div className="bg-slate-900 text-slate-200 border-b border-slate-800 px-4 py-2.5 text-xs font-normal">
      <div className="max-w-7xl mx-auto flex items-center gap-2.5">
        <Info className="w-4 h-4 text-sky-400 flex-shrink-0" />
        <p className="leading-relaxed">
          <strong className="text-white font-medium">Diagnostic Disclaimer:</strong> This application reverse-engineers observable search, retrieval, citation and brand-mention patterns. It does not reveal the private reasoning, ranking weights or complete internal search process of ChatGPT, Claude, Gemini, Google AI Mode or Google AI Overviews.
        </p>
      </div>
    </div>
  );
};
