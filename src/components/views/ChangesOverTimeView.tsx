import React from 'react';
import { ProjectState } from '../../types';
import { ResearchStepGuide } from '../ResearchStepGuide';
import { AlertTriangle, CheckCircle2, Clock, TrendingUp } from 'lucide-react';

interface ChangesOverTimeViewProps { project: ProjectState; }

export const ChangesOverTimeView: React.FC<ChangesOverTimeViewProps> = ({ project }) => {
  const successfulRuns = project.runs.filter((run) => run.status === 'success');
  const citedRuns = successfulRuns.filter((run) => run.citedSources.length > 0);
  const target = project.targetDomain.replace(/^www\./, '');
  const targetCitedRuns = successfulRuns.filter((run) => run.citedSources.some((source) => source.domain.replace(/^www\./, '').includes(target)));
  const mentionedRuns = successfulRuns.filter((run) => run.mentionedBrands.some((brand) => brand.isTargetBrand));
  const citationRate = successfulRuns.length ? Math.round((targetCitedRuns.length / successfulRuns.length) * 100) : 0;
  const mentionRate = successfulRuns.length ? Math.round((mentionedRuns.length / successfulRuns.length) * 100) : 0;
  const hasExperiment = project.experiments.length > 0;
  const hasComparison = project.experiments.some((experiment) => ['Validated', 'Inconclusive', 'Archived'].includes(experiment.status));

  return <div className="space-y-6">
    <ResearchStepGuide
      step="Step 4"
      title="Retest the same prompts and report the change"
      purpose="Measure whether the implemented page change improved retrieval, citation, brand mention, or recommendation frequency without changing the test questions."
      inputs={[`${project.runs.length} recorded runs`, `${project.experiments.length} documented experiments`, 'The unchanged baseline prompts and platforms']}
      actions={['Create and implement an experiment in Step 3.', 'Wait until the changed page can be recrawled.', 'Run the same prompts, platforms, and run count.', 'Compare baseline and post-change rates.', 'Mark the experiment Validated, Inconclusive, or Archived.']}
      output="A before-and-after result showing whether AI visibility improved, declined, or remained inconclusive."
      interpretation="A repeated improvement across identical tests is evidence. A single changed answer is noise."
      doneWhen="the experiment has a documented result and a decision: keep, revise, or replace the change."
    />

    <section className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center gap-2"><TrendingUp className="w-5 h-5 text-indigo-600" /><h2 className="font-bold text-slate-900">Current measurement status</h2></div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
        {[['Successful baseline runs', successfulRuns.length], ['Runs exposing citations', citedRuns.length], ['Target citation rate', `${citationRate}%`], ['Target mention rate', `${mentionRate}%`]].map(([label, value]) => <div key={label} className="rounded-lg bg-slate-50 border border-slate-200 p-4"><span className="text-[10px] uppercase tracking-wide text-slate-500">{label}</span><strong className="block text-2xl text-slate-900 mt-1">{value}</strong></div>)}
      </div>
    </section>

    {!hasExperiment ? <section className="rounded-xl border-2 border-amber-200 bg-amber-50 p-5 flex gap-3"><AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" /><div><h3 className="font-bold text-amber-950">No comparison is available yet</h3><p className="text-sm text-amber-900 mt-1">These runs are your baseline. Go to <strong>3. Fix Citation Gaps</strong>, create one experiment, implement the website change, and then rerun the same prompts. Measurement requires both a before and an after.</p></div></section>
    : !hasComparison ? <section className="rounded-xl border-2 border-sky-200 bg-sky-50 p-5 flex gap-3"><Clock className="w-5 h-5 text-sky-600 shrink-0" /><div><h3 className="font-bold text-sky-950">Experiment created; post-change evidence is still needed</h3><p className="text-sm text-sky-900 mt-1">After the page change is live and crawlable, repeat the baseline prompts and record the experiment result.</p></div></section>
    : <section className="rounded-xl border-2 border-emerald-200 bg-emerald-50 p-5 flex gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" /><div><h3 className="font-bold text-emerald-950">A completed experiment is available</h3><p className="text-sm text-emerald-900 mt-1">Review the documented experiment result alongside the baseline rates above before reporting the outcome.</p></div></section>}
  </div>;
};
