import React from 'react';
import { ProjectState } from '../types';
import { Compass, Target, Globe, Layers, HelpCircle, Plus } from 'lucide-react';

interface HeaderProps {
  project: ProjectState;
  onOpenProjectManager: () => void;
  onCreateNewResearch: () => void;
  onOpenHowItWorks?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  project,
  onOpenProjectManager,
  onCreateNewResearch,
  onOpenHowItWorks,
}) => {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:py-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-xs">
                <Compass className="w-5 h-5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                AI Citation Reverse Engineering
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Trace how AI search systems move from a user prompt to searches, sources, citations and brand recommendations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
            <button
              onClick={onCreateNewResearch}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-md transition-colors shadow-xs"
              title="Start a clean citation research project"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Research</span>
            </button>

            <div className="h-6 w-px bg-slate-700 mx-0.5 hidden sm:block"></div>

            {onOpenHowItWorks && (
              <>
                <button
                  onClick={onOpenHowItWorks}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-sky-200 bg-sky-950/70 hover:bg-sky-900 border border-sky-700/60 rounded-md transition-colors shadow-xs"
                  title="Learn how AI Citation Reverse Engineering works"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-sky-400" />
                  <span>How It Works</span>
                </button>
                <div className="h-6 w-px bg-slate-700 mx-0.5 hidden sm:block"></div>
              </>
            )}

            <div className="text-xs">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold tracking-wider">Active Project</span>
              <button
                onClick={onOpenProjectManager}
                className="font-medium text-sky-300 hover:text-sky-200 underline decoration-sky-500/50 flex items-center gap-1 text-left"
              >
                <Layers className="w-3.5 h-3.5" />
                <span className="truncate max-w-[180px]">{project.name}</span>
              </button>
            </div>

            <div className="h-6 w-px bg-slate-700 mx-0.5 hidden sm:block"></div>

            <div className="text-xs">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold tracking-wider">Target Domain</span>
              <div className="flex items-center gap-1 text-emerald-400 font-mono font-medium">
                <Target className="w-3.5 h-3.5" />
                <span>{project.targetDomain || 'your-domain.com'}</span>
              </div>
            </div>

            <div className="h-6 w-px bg-slate-700 mx-0.5 hidden sm:block"></div>

            <div className="text-xs">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold tracking-wider">Market & Geo</span>
              <div className="flex items-center gap-1 text-slate-200 font-medium">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                <span>{project.country || 'CA'} • {project.language || 'en'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
