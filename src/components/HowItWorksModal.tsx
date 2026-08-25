import React, { useState } from 'react';
import {
  X,
  Compass,
  ArrowRight,
  Search,
  BookOpen,
  Eye,
  Sparkles,
  HelpCircle,
  ShieldCheck,
  CheckCircle2,
  GitFork,
  FileQuestion,
  Layers,
  FlaskConical,
  Target,
  ExternalLink,
} from 'lucide-react';

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExploreTab?: (tab: string) => void;
}

export const HowItWorksModal: React.FC<HowItWorksModalProps> = ({
  isOpen,
  onClose,
  onExploreTab,
}) => {
  const [activeStep, setActiveStep] = useState<number>(1);

  if (!isOpen) return null;

  const steps = [
    {
      step: 1,
      title: 'Prompt Formulation & Query Fan-Out',
      icon: Search,
      badge: 'Stage 1: Intent Translation',
      color: 'from-sky-500 to-blue-600',
      summary:
        'When a user enters a research prompt, modern AI search models (like Google Gemini with Search Grounding, ChatGPT Search, or Claude) decompose the natural language into multiple discrete search queries.',
      details: [
        'AI engines generate 1 to 5 search queries behind the scenes rather than searching the raw prompt verbatim.',
        'Queries cover multiple angles: entity lookups, reviews, pricing comparisons, and competitor brand names.',
        'Our tool captures these hidden model-generated queries and logs their search intent and journey stage.',
      ],
      actionLink: { tab: 'pathways', label: 'View Search Pathways' },
    },
    {
      step: 2,
      title: 'Grounding Retrieval & Source Crawling',
      icon: BookOpen,
      badge: 'Stage 2: Candidate Selection',
      color: 'from-indigo-500 to-purple-600',
      summary:
        'The search engine executes the fan-out queries and returns a candidate set of web pages, blog posts, directories, and marketplace listings.',
      details: [
        'Pages are evaluated for informational depth, schema markup, entity authority, and factual clarity.',
        'Not all retrieved pages end up cited in the final answer; many are discarded during synthesis.',
        'Our tool categorizes retrieved domains by type (Marketplace, Specialist, Editorial Review, UGC/Forum) to highlight source diversity.',
      ],
      actionLink: { tab: 'sources', label: 'View Sources & Citations' },
    },
    {
      step: 3,
      title: 'Synthesis, Inline Citations & Brand Mentions',
      icon: Eye,
      badge: 'Stage 3: Answer Formulation',
      color: 'from-amber-500 to-rose-600',
      summary:
        'The generative model drafts its answer, attributing specific factual claims to cited URLs via grounding chunks and inline reference numbers.',
      details: [
        'We measure exact Brand Citation Share (% of queries citing your domain) vs Competitor Citation Share.',
        'We extract brand sentiment, top-3 recommendation placement, and primary value propositions mentioned.',
        'Audit logs record the exact sentence and claim that justified each citation.',
      ],
      actionLink: { tab: 'brand-visibility', label: 'View Brand Visibility' },
    },
    {
      step: 4,
      title: 'Funnel Drop-Off & Controlled Experiments',
      icon: FlaskConical,
      badge: 'Stage 4: Optimization & Testing',
      color: 'from-emerald-500 to-teal-600',
      summary:
        'By comparing cited competitor pages with your non-cited target URLs, the diagnostic engine pinpoints the exact barrier and formulates testable hypotheses.',
      details: [
        'Identifies drop-offs: Did the model search for the wrong query, did search miss your page, or did synthesis favor a competitor?',
        'Recommends page updates (e.g., adding structured schedules, pricing transparency, or author credentials).',
        'Tracks re-test schedules to verify whether citation frequency increases after publishing changes.',
      ],
      actionLink: { tab: 'citation-opportunities', label: 'View Opportunities & Hypotheses' },
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-sky-400">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                How AI Citation Reverse Engineering Works
              </h2>
              <p className="text-xs text-slate-300">
                A 4-stage methodology for decoding AI search retrieval, citation share, and brand visibility.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps Navigation Bar */}
        <div className="grid grid-cols-4 bg-slate-50 border-b border-slate-200">
          {steps.map((s) => {
            const Icon = s.icon;
            const isSelected = activeStep === s.step;
            return (
              <button
                key={s.step}
                onClick={() => setActiveStep(s.step)}
                className={`py-3 px-3 text-left transition-all border-b-2 ${
                  isSelected
                    ? 'border-indigo-600 bg-white shadow-xs'
                    : 'border-transparent hover:bg-slate-100/70 text-slate-600'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isSelected
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {s.step}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-800 truncate">
                    {s.badge.split(':')[0]}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 truncate hidden sm:block">
                  {s.title}
                </div>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
          {steps
            .filter((s) => s.step === activeStep)
            .map((curr) => {
              const Icon = curr.icon;
              return (
                <div key={curr.step} className="space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 uppercase tracking-wider">
                      {curr.badge}
                    </span>
                    <span className="text-slate-400 text-xs">• Step {curr.step} of 4</span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Icon className="w-5 h-5 text-indigo-600" />
                    {curr.title}
                  </h3>

                  <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                    {curr.summary}
                  </p>

                  <div>
                    <h4 className="font-bold text-slate-900 mb-2 uppercase text-[10px] tracking-wider text-slate-500">
                      Observable Diagnostics & Mechanism:
                    </h4>
                    <ul className="space-y-2">
                      {curr.details.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-slate-700">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Evidence Level Badge Note */}
                  <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5 flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-amber-900 space-y-1">
                      <strong className="font-semibold block">Auditable Evidence Standards:</strong>
                      <p className="leading-relaxed text-[11px] text-amber-800">
                        This system uses empirical API telemetry from live grounded search responses. Every metric displays an audit badge differentiating <strong>Direct Observable Grounding</strong> from <strong>Observed Statistical Correlation</strong> and <strong>Diagnostic Hypotheses</strong>.
                      </p>
                    </div>
                  </div>

                  {curr.actionLink && (
                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => {
                          onClose();
                          if (onExploreTab) onExploreTab(curr.actionLink.tab);
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                      >
                        <span>{curr.actionLink.label}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs">
          <div className="text-[11px] text-slate-500">
            Tip: You can dispatch real queries via the <strong>Live Test Runs</strong> tab.
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold rounded-lg transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
