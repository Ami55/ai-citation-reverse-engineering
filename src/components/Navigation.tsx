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
  const tabs: { id: ActiveTab; label: string; icon: React.ElementType; badge?: string | number }[] = [
    { id: 'overview', label: '1. Overview', icon: LayoutDashboard },
    { id: 'prompts', label: '2. Test Prompts', icon: FileQuestion, badge: totalPrompts },
    { id: 'runs', label: '3. Live Test Runs', icon: PlayCircle, badge: totalRuns },
    { id: 'pathways', label: '4. Search Pathways', icon: GitFork },
    { id: 'sources', label: '5. Sources & Citations', icon: BookOpen },
    { id: 'brand-visibility', label: '6. Brand Visibility', icon: Eye },
    { id: 'competitor-comparison', label: '7. Competitor Comparison', icon: Scale },
    { id: 'citation-opportunities', label: '8. Citation Opportunities', icon: Sparkles },
    { id: 'changes-over-time', label: '9. Changes Over Time', icon: TrendingUp },
    { id: 'saved-projects', label: '10. Saved Projects', icon: FolderArchive },
  ];

  return (
    <div className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between gap-4 py-2">
          {/* Main 10 tabs */}
          <nav className="flex items-center space-x-1 overflow-x-auto no-scrollbar py-1">
            {tabs.map((tab) => {
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

          {/* Right Action: Platform Settings */}
          <div className="flex items-center gap-2 flex-shrink-0">
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
