import React from 'react';
import {
  LayoutDashboard,
  FileQuestion,
  PlayCircle,
  GitFork,
  BookOpen,
  Eye,
  Scale,
  Sparkles,
  TrendingUp,
  FolderArchive,
  Settings,
  Database,
} from 'lucide-react';

export type ActiveTab =
  | 'overview'
  | 'prompts'
  | 'runs'
  | 'pathways'
  | 'sources'
  | 'brand-visibility'
  | 'competitor-comparison'
  | 'citation-opportunities'
  | 'changes-over-time'
  | 'saved-projects';

interface NavigationProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenSettings: () => void;
  isDemo: boolean;
  totalPrompts: number;
  totalRuns: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  onOpenSettings,
  isDemo,
  totalPrompts,
  totalRuns,
}) => {
  const workflowTabs: { id: ActiveTab; label: string; icon: React.ElementType; badge?: string | number }[] = [
    { id: 'overview', label: 'Start Here', icon: LayoutDashboard },
    { id: 'prompts', label: '1. Choose Tests', icon: FileQuestion, badge: totalPrompts },
    { id: 'runs', label: '2. Run Tests', icon: PlayCircle, badge: totalRuns },
    { id: 'citation-opportunities', label: '3. Fix Citation Gaps', icon: Sparkles },
    { id: 'changes-over-time', label: '4. Measure Progress', icon: TrendingUp },
  ];

  const supportingTabs: { id: ActiveTab; label: string; purpose: string; icon: React.ElementType }[] = [
    { id: 'pathways', label: 'Search Pathways', purpose: 'See where your domain dropped out.', icon: GitFork },
    { id: 'sources', label: 'Sources & Citations', purpose: 'See which pages AI retrieved and cited.', icon: BookOpen },
    { id: 'brand-visibility', label: 'Brand Visibility', purpose: 'Compare mentions and citation frequency.', icon: Eye },
    { id: 'competitor-comparison', label: 'Competitor Comparison', purpose: 'Investigate why another page was cited.', icon: Scale },
    { id: 'saved-projects', label: 'Saved Projects', purpose: 'Open or compare previous investigations.', icon: FolderArchive },
  ];

  return (
    <div className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between gap-4 py-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="hidden xl:inline text-[10px] font-bold uppercase tracking-widest text-slate-400">Workflow</span>
          <nav className="flex items-center space-x-1 overflow-x-auto no-scrollbar py-1">
            {workflowTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`nav-tab-${tab.id}`}
                  onClick={() => onSelectTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-sky-300' : 'text-slate-500'}`} />
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                        isActive
                          ? 'bg-slate-800 text-sky-200'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
          </div>

          {/* Right Action: Platform Settings */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <details className="relative">
              <summary className={`list-none flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg cursor-pointer ${supportingTabs.some((tab) => tab.id === activeTab) ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'}`}>
                <BookOpen className="w-3.5 h-3.5" /> Supporting reports
              </summary>
              <div className="absolute right-0 z-50 mt-2 w-80 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                <p className="px-3 py-2 text-[11px] text-slate-500 border-b border-slate-100">Open these only when you need evidence behind an action.</p>
                {supportingTabs.map((tab) => {
                  const Icon = tab.icon;
                  return <button key={tab.id} onClick={(event) => { onSelectTab(tab.id); event.currentTarget.closest('details')?.removeAttribute('open'); }} className="w-full flex items-start gap-2 rounded-lg px-3 py-2.5 text-left hover:bg-slate-50">
                    <Icon className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                    <span><strong className="block text-xs text-slate-900">{tab.label}</strong><span className="text-[11px] text-slate-500">{tab.purpose}</span></span>
                  </button>;
                })}
              </div>
            </details>
            {isDemo && (
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-900 border border-amber-300">
                <Database className="w-3 h-3 text-amber-600" />
                Demo data — not a live platform test
              </span>
            )}
            <button
              onClick={onOpenSettings}
              id="platform-settings-btn"
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors"
              title="Platform API Credentials & Connection Status"
            >
              <Settings className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden md:inline">API Connections</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
