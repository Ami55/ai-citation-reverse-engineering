import React, { useState } from 'react';
import { ProjectState } from '../../types';
import {
  FolderArchive,
  Plus,
  Download,
  Upload,
  Trash2,
  CheckCircle,
  ExternalLink,
  Target,
  Globe,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface SavedProjectsViewProps {
  currentProject: ProjectState;
  savedProjects: ProjectState[];
  onSelectProject: (project: ProjectState) => void;
  onCreateNewProject: () => void;
  onResetDemo: () => void;
  onDeleteProject: (projectId: string) => void;
}

export const SavedProjectsView: React.FC<SavedProjectsViewProps> = ({
  currentProject,
  savedProjects,
  onSelectProject,
  onCreateNewProject,
  onResetDemo,
  onDeleteProject,
}) => {
  const [importError, setImportError] = useState<string | null>(null);

  const handleExportProject = (project: ProjectState) => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(project, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${project.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-export.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target?.result as string);
        if (parsed.id && parsed.name && Array.isArray(parsed.prompts)) {
          onSelectProject(parsed);
        } else {
          setImportError('Invalid project JSON file format.');
        }
      } catch (err: any) {
        setImportError(`Failed to parse JSON file: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FolderArchive className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">
              Saved Citation Diagnostic Projects
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Switch between research projects, export auditable data packs, or create a new domain investigation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onResetDemo}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Demo Data
          </button>

          <button
            onClick={onCreateNewProject}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            New Project
          </button>
        </div>
      </div>

      {importError && (
        <div className="p-3 bg-rose-50 text-rose-800 border border-rose-200 rounded-lg text-xs">
          {importError}
        </div>
      )}

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {savedProjects.map((proj) => {
          const isActive = proj.id === currentProject.id;
          return (
            <div
              key={proj.id}
              className={`bg-white rounded-xl border p-5 transition-all ${
                isActive
                  ? 'border-indigo-500 shadow-md ring-2 ring-indigo-100'
                  : 'border-slate-200 hover:border-slate-300 shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 line-clamp-1">{proj.name}</span>
                    {isActive && (
                      <span className="text-[10px] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full font-semibold">
                        Active
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono block mt-0.5">
                    Updated: {new Date(proj.updatedAt || proj.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleExportProject(proj)}
                    title="Export JSON"
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  {!proj.isDemo && (
                    <button
                      onClick={() => onDeleteProject(proj.id)}
                      title="Delete Project"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-100 mb-4">
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase">Target Domain</span>
                  <span className="font-mono text-slate-700 font-medium text-[11px] truncate block">
                    {proj.targetDomain}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase">Geo & Language</span>
                  <span className="text-slate-700 font-medium text-[11px]">
                    {proj.country || 'Global'} • {proj.language || 'en'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase">Prompts</span>
                  <span className="text-slate-700 font-medium">{proj.prompts?.length || 0} variations</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase">Diagnostic Runs</span>
                  <span className="text-slate-700 font-medium">{proj.runs?.length || 0} recorded</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-[11px] text-slate-500">
                  {proj.isDemo ? 'Pre-loaded verified research pack' : 'Custom user study'}
                </span>
                {!isActive ? (
                  <button
                    onClick={() => onSelectProject(proj)}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                  >
                    Open Project →
                  </button>
                ) : (
                  <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Currently Loaded
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Import Box */}
      <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-6 text-center text-xs text-slate-600 space-y-2">
        <Upload className="w-6 h-6 text-slate-400 mx-auto" />
        <p className="font-semibold text-slate-700">Import an existing Citation Diagnostic Project</p>
        <p className="text-slate-400 max-w-md mx-auto">
          Upload a previously exported JSON dataset to inspect historical search pathways and citation share.
        </p>
        <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-100 cursor-pointer shadow-xs transition-colors">
          Browse File
          <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
        </label>
      </div>
    </div>
  );
};
