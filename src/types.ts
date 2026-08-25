export type EvidenceLabel =
  | 'Observed API Data'
  | 'Extracted Page Evidence'
  | 'Cross-run Pattern'
  | 'Comparative Finding'
  | 'Likely Citation Factor'
  | 'Unverified Hypothesis'
  | 'Unable to Determine';

export type PlatformType = 'gemini' | 'openai' | 'claude' | 'perplexity' | 'copilot';

export type FailureFunnelStage =
  | 'Stage 1: Query not aligned with target content'
  | 'Stage 2: Target page not retrieved'
  | 'Stage 3: Target page retrieved but not cited'
  | 'Stage 4: Target domain cited but brand not mentioned'
  | 'Stage 5: Brand mentioned but not recommended'
  | 'Stage 6: Brand recommended but not prominently positioned'
  | 'Stage 7: Unable to determine';

export type SourceClassification =
  | 'Retrieved but not cited'
  | 'Retrieved and cited'
  | 'Cited but complete retrieval details unavailable'
  | 'Mentioned without citation'
  | 'Target domain'
  | 'Direct competitor'
  | 'Indirect competitor'
  | 'Official or government'
  | 'Tourism board'
  | 'Editorial publisher'
  | 'Marketplace'
  | 'Review platform'
  | 'Forum or user-generated content'
  | 'Local business'
  | 'Other';

export interface QueryFanOutImportSchema {
  project_id?: string;
  project_name?: string;
  prompt_id?: string;
  seed_prompt?: string;
  test_prompt: string;
  prompt_variation_type?: string;
  query_cluster?: string;
  search_intent?: string;
  journey_stage?: string;
  subject?: string;
  audience?: string;
  country?: string;
  language?: string;
  target_domain?: string;
  target_url?: string;
  competitor_domains?: string[] | string;
  business_objective?: string;
  business_priority?: string;
  reason_for_testing?: string;
  source_classification?: string;
  approval_status?: string;
}

export interface PromptItem {
  id: string;
  prompt: string;
  seedPrompt?: string;
  variationType: string;
  queryCluster: string;
  searchIntent: string;
  journeyStage: string;
  subject: string;
  audience: string;
  country: string;
  language: string;
  businessPriority: 'High' | 'Medium' | 'Low';
  businessObjective?: string;
  reasonForTesting?: string;
  platforms: PlatformType[];
  runsRequested: number;
  runsCompleted: number;
  status: 'Ready' | 'In Progress' | 'Completed' | 'Paused' | 'Archived' | 'Failed';
  createdAt: string;
}

export interface GroundingSupportSegment {
  segment?: {
    startIndex?: number;
    endIndex?: number;
    text?: string;
  };
  groundingChunkIndices?: number[];
  confidenceScores?: number[];
}

export interface ExtractedSourceItem {
  id: string;
  url: string;
  domain: string;
  title: string;
  snippet?: string;
  pageAge?: string;
  classification: SourceClassification;
  retrievalStatus: 'Retrieved' | 'Not retrieved' | 'Unable to Determine';
  citationStatus: 'Cited' | 'Not cited' | 'Citation unlinked';
  supportedClaims: string[];
  citedPassages?: string[];
  firstObserved: string;
  mostRecentObservation: string;
  retrievalCount: number;
  citationCount: number;
  mentionCount: number;
  associatedQueries: string[];
  associatedPrompts: string[];
}

export interface ExtractedBrandMentionItem {
  brandName: string;
  domain: string;
  isTargetBrand: boolean;
  isDirectCompetitor: boolean;
  isIndirectCompetitor: boolean;
  positionInAnswer: number;
  contextClaim: string;
  recommended: boolean;
}

export interface TestRunItem {
  id: string;
  promptId: string;
  promptText: string;
  promptVariation: string;
  platform: PlatformType;
  model: string;
  runIndex: number;
  status: 'success' | 'failed' | 'partial';
  timestamp: string;
  country: string;
  language: string;
  searchQueries: string[];
  retrievedSources: {
    id?: string;
    url: string;
    domain: string;
    title: string;
    snippet?: string;
    pageAge?: string;
  }[];
  citedSources: {
    id?: string;
    url: string;
    domain: string;
    title: string;
    snippet?: string;
    citedText?: string;
    supportedClaims?: string[];
  }[];
  mentionedBrands: ExtractedBrandMentionItem[];
  answerText: string;
  groundingSupports?: GroundingSupportSegment[];
  errorDetails?: string;
  rawApiData?: any;
}

export interface SearchPathwayRow {
  id: string;
  platform: PlatformType;
  model: string;
  prompt: string;
  promptVariation: string;
  run: number;
  searchQuery: string;
  retrievedUrl: string;
  retrievedDomain: string;
  sourceTitle: string;
  retrievalStatus: 'Retrieved' | 'Not retrieved' | 'Not exposed';
  citationStatus: 'Cited' | 'Not cited' | 'Partial citation';
  citedClaim: string;
  citedText: string;
  mentionedBrand: string;
  brandPosition: number | string;
  timestamp: string;
}

export interface BrandVisibilityMetric {
  brandName: string;
  domain: string;
  isTargetBrand: boolean;
  isDirectCompetitor: boolean;
  isIndirectCompetitor: boolean;
  totalValidRuns: number;
  mentionFrequency: number;
  retrievalFrequency: number;
  citationFrequency: number;
  citationConversionRate: number;
  averageAnswerPosition: number;
  crossPlatformPresence: number;
  citationStability: number;
  promptSensitivity: number;
  associatedQueries: string[];
  associatedClaims: string[];
  triggeringPrompts: string[];
  platformPresence: Record<PlatformType, number>;
}

export interface CompetitorComparisonReport {
  id: string;
  competitorDomain: string;
  competitorUrl: string;
  closestTargetUrl: string;
  pageTypeCompetitor: string;
  pageTypeTarget: string;
  titleCompetitor: string;
  titleTarget: string;
  headingStructureCompetitor: string[];
  headingStructureTarget: string[];
  mainIntent: string;
  entitiesIdentified: string[];
  questionsAnsweredCompetitor: string[];
  questionsAnsweredTarget: string[];
  contentDepth: 'High' | 'Medium' | 'Basic';
  answerClarityCompetitor: string;
  answerClarityTarget: string;
  informationPlacement: string;
  firstHandExperienceCompetitor: string;
  firstHandExperienceTarget: string;
  authorOrExpertAttributionCompetitor: string;
  authorOrExpertAttributionTarget: string;
  reviewsOrUgcCompetitor: string;
  reviewsOrUgcTarget: string;
  uniqueInformation: string;
  evidenceAndReferences: string;
  freshnessCompetitor: string;
  freshnessTarget: string;
  structuredData: string;
  internalLinkContext: string;
  commercialRelevance: string;
  extractableAnswerPassages: string[];
  sharedCoverage: string[];
  competitorOnlyCoverage: string[];
  targetOnlyCoverage: string[];
  missingInformation: string[];
  differencesInClarity: string;
  differencesInPageType: string;
  differencesInExpertContribution: string;
  differencesInEvidence: string;
  differencesInEntityRelationships: string;
  possibleTechnicalBarriers: string[];
  informationGainOpportunities: string[];
  evidenceLabel: EvidenceLabel;
}

export interface CitationOpportunityItem {
  id: string;
  triggeringPrompt: string;
  searchQuery: string;
  platform: PlatformType;
  citedCompetitor: string;
  competitorUrl: string;
  supportedClaim: string;
  citedEvidence: string;
  closestTargetUrl: string;
  targetPageCoverage: string;
  observedDifference: string;
  likelyCitationBarrier: string;
  recommendedExperiment: string;
  confidence: 'High' | 'Medium' | 'Low';
  evidenceLabel: EvidenceLabel;
  priority: 'High' | 'Medium' | 'Low';
  humanReviewStatus: 'Pending Review' | 'Approved' | 'Rejected' | 'In Experiment';
  funnelStage: FailureFunnelStage;
}

export interface RecommendedExperimentItem {
  id: string;
  pageUrl: string;
  proposedChange: string;
  evidence: string;
  hypothesis: string;
  successMetric: string;
  baseline: string;
  retestPrompts: string[];
  retestPlatforms: PlatformType[];
  retestDate: string;
  status: 'Draft' | 'Active Testing' | 'Validated' | 'Inconclusive' | 'Archived';
  result?: string;
  evidenceLabel: EvidenceLabel;
}

export interface ChangesOverTimeComparison {
  baselineDate: string;
  currentDate: string;
  newSearchQueries: string[];
  lostSearchQueries: string[];
  newlyRetrievedDomains: string[];
  lostRetrievalDomains: string[];
  newCitations: string[];
  lostCitations: string[];
  newBrandMentions: string[];
  lostBrandMentions: string[];
  targetDomainImprovements: string[];
  competitorChanges: string[];
  citationStabilityDelta: number;
  evidenceLabel: EvidenceLabel;
}

export interface ProjectState {
  id: string;
  name: string;
  seedPrompt: string;
  subject: string;
  audience: string;
  country: string;
  language: string;
  targetDomain: string;
  relevantTargetUrls: string[];
  competitorDomains: string[];
  selectedPlatforms: PlatformType[];
  runsPerPrompt: number;
  testingDate: string;
  notes: string;
  isDemo: boolean;
  prompts: PromptItem[];
  runs: TestRunItem[];
  experiments: RecommendedExperimentItem[];
  opportunities: CitationOpportunityItem[];
  competitorComparisons: CompetitorComparisonReport[];
  createdAt: string;
  updatedAt: string;
}
