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
    setProject((prev) => ({
      ...prev,
      runs: [...newRuns, ...(prev.runs || [])],
      isDemo: false,
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
        {activeTab === 'overview' && (
          <OverviewView
            project={project}
            onNavigateTab={setActiveTab}
            onOpenHowItWorks={() => setIsHowItWorksOpen(true)}
          />
        )}

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
