import React, { useState, useEffect } from 'react';
import { ProjectState, PromptItem, TestRunItem, RecommendedExperimentItem, CitationOpportunityItem } from './types';
import { DEMO_PROJECT } from './data/demoProject';
import { Header } from './components/Header';
import { Navigation, ActiveTab } from './components/Navigation';
import { DisclaimerBanner } from './components/DisclaimerBanner';
import { Footer } from './components/Footer';
import { PlatformSettingsModal } from './components/PlatformSettingsModal';
import { ProjectManagerModal } from './components/ProjectManagerModal';
import { HowItWorksModal } from './components/HowItWorksModal';

// Views
import { OverviewView } from './components/views/OverviewView';
import { TestPromptsView } from './components/views/TestPromptsView';
import { LiveTestRunsView } from './components/views/LiveTestRunsView';
import { SearchPathwaysView } from './components/views/SearchPathwaysView';
import { SourcesCitationsView } from './components/views/SourcesCitationsView';
import { BrandVisibilityView } from './components/views/BrandVisibilityView';
import { CompetitorComparisonView } from './components/views/CompetitorComparisonView';
import { CitationOpportunitiesView } from './components/views/CitationOpportunitiesView';
import { ChangesOverTimeView } from './components/views/ChangesOverTimeView';
import { SavedProjectsView } from './components/views/SavedProjectsView';

const STORAGE_KEY = 'aicite_active_project_v2';
const SAVED_PROJECTS_KEY = 'aicite_saved_projects_v2';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProjectManagerOpen, setIsProjectManagerOpen] = useState(false);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);

  // Initialize project state from localStorage or DEMO_PROJECT
  const [project, setProject] = useState<ProjectState>(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (e) {
      console.warn('Failed to load project from cache', e);
    }
    return DEMO_PROJECT;
  });

  const [savedProjects, setSavedProjects] = useState<ProjectState[]>(() => {
    try {
      const cached = localStorage.getItem(SAVED_PROJECTS_KEY);
      if (cached) {
        const list = JSON.parse(cached);
        if (Array.isArray(list) && list.length > 0) return list;
      }
    } catch (e) {
      console.warn('Failed to load saved projects', e);
    }
    return [DEMO_PROJECT];
  });

  // Sync active project to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
    } catch (e) {
      console.warn('Failed to save active project', e);
    }
  }, [project]);

  // Sync saved projects list
  useEffect(() => {
    try {
      localStorage.setItem(SAVED_PROJECTS_KEY, JSON.stringify(savedProjects));
    } catch (e) {
      console.warn('Failed to save projects list', e);
    }
  }, [savedProjects]);

  const handleUpdatePrompts = (prompts: PromptItem[]) => {
    setProject((prev) => ({
      ...prev,
      prompts,
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleAddRuns = (newRuns: TestRunItem[]) => {
    setProject((prev) => {
      const generatedOpportunities: CitationOpportunityItem[] = newRuns
        .filter((run) => run.status === 'success')
        .flatMap((run) => {
          const cleanTarget = prev.targetDomain.replace(/^www\./, '');
          const targetRetrieved = run.retrievedSources.some((item) => item.domain.replace(/^www\./, '').includes(cleanTarget));
          const targetCited = run.citedSources.some((item) => item.domain.replace(/^www\./, '').includes(cleanTarget));
          if (targetCited) return [];
          const competitor = run.citedSources.find((item) => prev.competitorDomains.some((domain) => item.domain.includes(domain.replace(/^www\./, '')))) || run.citedSources[0];
          const funnelStage = targetRetrieved ? 'Stage 3: Target page retrieved but not cited' as const : 'Stage 2: Target page not retrieved' as const;
          const hasCitationEvidence = Boolean(competitor);
          return [{
            id: `opp-${run.id}`,
            triggeringPrompt: run.promptText,
            searchQuery: run.searchQueries[0] || run.promptText,
            platform: run.platform,
            citedCompetitor: competitor?.domain || 'No cited source observed',
            competitorUrl: competitor?.url || '',
            supportedClaim: competitor?.supportedClaims?.[0] || competitor?.title || 'No source-supported claim was exposed by this run.',
            citedEvidence: competitor?.citedText || competitor?.snippet || 'The run succeeded, but the provider exposed no retrieved or cited source evidence.',
            closestTargetUrl: prev.relevantTargetUrls[0] || `https://${prev.targetDomain}`,
            targetPageCoverage: targetRetrieved ? 'Target page was retrieved but not selected as a citation.' : 'Target page was not observed in retrieved sources.',
            observedDifference: hasCitationEvidence ? `${competitor.domain} was cited; ${prev.targetDomain} was ${targetRetrieved ? 'retrieved but not cited' : 'not retrieved'}.` : `The answer completed, but no source citations were exposed and ${prev.targetDomain} was not cited.`,
            likelyCitationBarrier: hasCitationEvidence ? (targetRetrieved ? 'The target page may lack a sufficiently direct, extractable answer or supporting evidence for this question.' : 'The target page may not align clearly enough with the query, or may lack retrievability and authority signals.') : 'Unable to diagnose a page-level citation barrier without source evidence. The first action is to collect grounded runs with exposed citations.',
            recommendedExperiment: hasCitationEvidence ? `On ${prev.relevantTargetUrls[0] || prev.targetDomain}, add a self-contained answer section for “${run.searchQueries[0] || run.promptText}” with specific facts, relevant entities, clear headings, and first-hand expertise. Keep the rest of the test conditions unchanged.` : 'Do not change the website from this run alone. Repeat the prompt 3–5 times with grounded search enabled, and add a more specific research prompt that requires current factual sources.',
            confidence: hasCitationEvidence ? 'Medium' as const : 'Low' as const,
            evidenceLabel: hasCitationEvidence ? 'Likely Citation Factor' as const : 'Unable to Determine' as const,
            priority: hasCitationEvidence ? 'High' as const : 'Medium' as const,
            humanReviewStatus: 'Pending Review' as const,
            funnelStage,
          }];
        });
      const opportunityMap = new Map([...(prev.opportunities || []), ...generatedOpportunities].map((item) => [`${item.platform}|${item.triggeringPrompt}|${item.competitorUrl}`, item]));
      return {
        ...prev,
        runs: [...newRuns, ...(prev.runs || [])],
        opportunities: Array.from(opportunityMap.values()),
        isDemo: false,
        updatedAt: new Date().toISOString(),
      };
    });
  };

  const handleRemoveFailedRuns = () => {
    setProject((prev) => ({
      ...prev,
      runs: (prev.runs || []).filter((run) => run.status !== 'failed'),
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleUpdateExperiments = (experiments: RecommendedExperimentItem[]) => {
    setProject((prev) => ({
      ...prev,
      experiments,
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleUpdateOpportunities = (opportunities: CitationOpportunityItem[]) => {
    setProject((prev) => ({
      ...prev,
      opportunities,
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleSelectProject = (newProj: ProjectState) => {
    setProject(newProj);
    // Ensure it is in savedProjects
    if (!savedProjects.some((p) => p.id === newProj.id)) {
      setSavedProjects((prev) => [newProj, ...prev]);
    }
  };

  const handleSaveProjectConfig = (updated: ProjectState) => {
    setProject(updated);
    setSavedProjects((prev) =>
      prev.map((p) => (p.id === updated.id ? updated : p))
    );
    setActiveTab('overview');
    setTimeout(() => document.getElementById('workspace-step-1')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  };

  const handleCreateNewProject = () => {
    const newId = `project-${Date.now()}`;
    const newProj: ProjectState = {
      id: newId,
      name: 'Untitled Research',
      seedPrompt: '',
      subject: '',
      audience: '',
      country: 'CA',
      language: 'en',
      targetDomain: '',
      relevantTargetUrls: [],
      competitorDomains: [],
      selectedPlatforms: ['gemini'],
      runsPerPrompt: 1,
      testingDate: new Date().toISOString().split('T')[0],
      notes: '',
      isDemo: false,
      prompts: [],
      runs: [],
      experiments: [],
      opportunities: [],
      competitorComparisons: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProject(newProj);
    setSavedProjects((prev) => [newProj, ...prev]);
    setActiveTab('overview');
    setIsProjectManagerOpen(true);
  };

  const handleResetDemo = () => {
    setProject(DEMO_PROJECT);
    setSavedProjects([DEMO_PROJECT]);
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(SAVED_PROJECTS_KEY);
    } catch (e) {
      console.warn(e);
    }
    setActiveTab('overview');
  };

  const handleDeleteProject = (projId: string) => {
    const nextList = savedProjects.filter((p) => p.id !== projId);
    setSavedProjects(nextList);
    if (project.id === projId) {
      setProject(nextList[0] || DEMO_PROJECT);
    }
  };

  const navigateWorkspace = (tab: string) => {
    const sectionMap: Record<string, string> = {
      overview: 'workspace-top',
      prompts: 'workspace-step-1',
      runs: 'workspace-step-2',
      'citation-opportunities': 'workspace-step-3',
      'changes-over-time': 'workspace-step-4',
    };
    if (!sectionMap[tab]) {
      setActiveTab(tab as ActiveTab);
      return;
    }
    setActiveTab('overview');
    setTimeout(() => document.getElementById(sectionMap[tab])?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased">
      {/* Top Diagnostic Disclaimer */}
      <DisclaimerBanner />

      {/* Main App Header */}
      <Header
        project={project}
        onOpenProjectManager={() => setIsProjectManagerOpen(true)}
        onCreateNewResearch={handleCreateNewProject}
        onOpenHowItWorks={() => setIsHowItWorksOpen(true)}
      />

      {/* Navigation Tabs */}
      <Navigation
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isDemo={project.isDemo}
        totalPrompts={project.prompts?.length || 0}
        totalRuns={project.runs?.length || 0}
      />

      {/* Active Tab View Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {activeTab === 'overview' && <div className="space-y-12" id="workspace-top">
          <section className="rounded-2xl border-2 border-indigo-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div><span className="text-[10px] font-bold uppercase tracking-widest text-indigo-700">First: research inputs</span><h1 className="text-2xl font-bold text-slate-900 mt-1">{project.name}</h1><p className="text-sm text-slate-600 mt-1">Question: “{project.seedPrompt || 'Add the customer question you want to investigate'}”</p></div>
              <button onClick={() => setIsProjectManagerOpen(true)} className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-indigo-700">Enter or edit research inputs</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-5 text-xs"><div className="rounded-lg bg-slate-50 p-3"><strong className="block text-slate-900">Target website</strong>{project.targetDomain || 'Not entered'}</div><div className="rounded-lg bg-slate-50 p-3"><strong className="block text-slate-900">Audience and market</strong>{project.audience || 'Not entered'} · {project.country}/{project.language}</div><div className="rounded-lg bg-slate-50 p-3"><strong className="block text-slate-900">Pages and competitors</strong>{project.relevantTargetUrls.length} target URLs · {project.competitorDomains.length} competitors</div></div>
          </section>
          <OverviewView project={project} onNavigateTab={navigateWorkspace} onOpenHowItWorks={() => setIsHowItWorksOpen(true)} />
          <section id="workspace-step-1" className="scroll-mt-24 border-t-4 border-sky-500 pt-8"><TestPromptsView project={project} onUpdatePrompts={handleUpdatePrompts} onExecutePrompt={() => navigateWorkspace('runs')} /></section>
          <section id="workspace-step-2" className="scroll-mt-24 border-t-4 border-indigo-500 pt-8"><LiveTestRunsView project={project} onAddRuns={handleAddRuns} onRemoveFailedRuns={handleRemoveFailedRuns} onOpenSettings={() => setIsSettingsOpen(true)} /></section>
          <section id="workspace-step-3" className="scroll-mt-24 border-t-4 border-amber-500 pt-8"><CitationOpportunitiesView project={project} onUpdateExperiments={handleUpdateExperiments} onUpdateOpportunities={handleUpdateOpportunities} /></section>
          <section id="workspace-step-4" className="scroll-mt-24 border-t-4 border-emerald-500 pt-8"><ChangesOverTimeView project={project} /></section>
        </div>}

        {activeTab === 'prompts' && (
          <TestPromptsView
            project={project}
            onUpdatePrompts={handleUpdatePrompts}
            onExecutePrompt={() => setActiveTab('runs')}
          />
        )}

        {activeTab === 'runs' && (
          <LiveTestRunsView
            project={project}
            onAddRuns={handleAddRuns}
            onRemoveFailedRuns={handleRemoveFailedRuns}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        )}

        {activeTab === 'pathways' && (
          <SearchPathwaysView project={project} />
        )}

        {activeTab === 'sources' && (
          <SourcesCitationsView project={project} />
        )}

        {activeTab === 'brand-visibility' && (
          <BrandVisibilityView project={project} />
        )}

        {activeTab === 'competitor-comparison' && (
          <CompetitorComparisonView project={project} />
        )}

        {activeTab === 'citation-opportunities' && (
          <CitationOpportunitiesView
            project={project}
            onUpdateExperiments={handleUpdateExperiments}
            onUpdateOpportunities={handleUpdateOpportunities}
          />
        )}

        {activeTab === 'changes-over-time' && (
          <ChangesOverTimeView project={project} />
        )}

        {activeTab === 'saved-projects' && (
          <SavedProjectsView
            currentProject={project}
            savedProjects={savedProjects}
            onSelectProject={handleSelectProject}
            onCreateNewProject={handleCreateNewProject}
            onResetDemo={handleResetDemo}
            onDeleteProject={handleDeleteProject}
          />
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* API Connections & Settings Modal */}
      <PlatformSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Project Configuration Modal */}
      <ProjectManagerModal
        isOpen={isProjectManagerOpen}
        onClose={() => setIsProjectManagerOpen(false)}
        currentProject={project}
        onSaveProject={handleSaveProjectConfig}
      />

      {/* How It Works Educational Guide Modal */}
      <HowItWorksModal
        isOpen={isHowItWorksOpen}
        onClose={() => setIsHowItWorksOpen(false)}
        onExploreTab={(tab) => setActiveTab(tab as any)}
      />
    </div>
  );
}
