import React from 'react';
import { ArrowRight, CheckCircle2, ClipboardList, Lightbulb, PackageOpen } from 'lucide-react';

interface ResearchStepGuideProps {
  step: string;
  title: string;
  purpose: string;
  inputs: string[];
  actions: string[];
  output: string;
  interpretation: string;
  doneWhen: string;
  nextLabel?: string;
  onNext?: () => void;
}

export const ResearchStepGuide: React.FC<ResearchStepGuideProps> = ({ step, title, purpose, inputs, actions, output, interpretation, doneWhen, nextLabel, onNext }) => (
  <section className="rounded-xl border-2 border-sky-200 bg-sky-50/40 p-5 space-y-4">
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
      <div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-sky-700">{step} · Instructions</span>
        <h2 className="text-lg font-bold text-slate-900 mt-1">{title}</h2>
        <p className="text-sm text-slate-600 mt-1">{purpose}</p>
      </div>
      {onNext && nextLabel && <button onClick={onNext} className="shrink-0 inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800">{nextLabel}<ArrowRight className="w-3.5 h-3.5" /></button>}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 text-xs">
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <h3 className="font-bold text-slate-900 flex items-center gap-1.5"><PackageOpen className="w-4 h-4 text-sky-600" /> What goes in</h3>
        <ul className="mt-2 space-y-1.5 text-slate-600">{inputs.map((item) => <li key={item}>• {item}</li>)}</ul>
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <h3 className="font-bold text-slate-900 flex items-center gap-1.5"><ClipboardList className="w-4 h-4 text-indigo-600" /> What you do</h3>
        <ol className="mt-2 space-y-1.5 text-slate-600">{actions.map((item, index) => <li key={item}><strong>{index + 1}.</strong> {item}</li>)}</ol>
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-3">
        <div><h3 className="font-bold text-slate-900 flex items-center gap-1.5"><Lightbulb className="w-4 h-4 text-amber-500" /> Output and meaning</h3><p className="mt-1.5 text-slate-600"><strong>Output:</strong> {output}</p><p className="mt-1 text-slate-600"><strong>Interpret:</strong> {interpretation}</p></div>
        <p className="border-t border-slate-100 pt-2 text-emerald-800 flex items-start gap-1.5"><CheckCircle2 className="w-4 h-4 shrink-0" /><span><strong>Move on when:</strong> {doneWhen}</span></p>
      </div>
    </div>
  </section>
);
