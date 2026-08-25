import {
  BrandVisibilityMetric,
  ChangesOverTimeComparison,
  EvidenceLabel,
  ExtractedSourceItem,
  PlatformType,
  ProjectState,
  QueryFanOutImportSchema,
  SearchPathwayRow,
  TestRunItem,
} from '../types';

/**
 * Calculates Brand Visibility and Citation Frequency metrics across runs
 */
export function calculateBrandMetrics(
  runs: TestRunItem[],
  targetDomain: string,
  competitorDomains: string[] = []
): BrandVisibilityMetric[] {
  const validRuns = runs.filter((r) => r.status === 'success');
  const totalValid = validRuns.length;

  if (totalValid === 0) return [];

  // Group all unique brands detected or tracked
  const brandMap = new Map<string, {
    brandName: string;
    domain: string;
    isTarget: boolean;
    isDirect: boolean;
    isIndirect: boolean;
    runsMentioned: Set<string>;
    runsRetrieved: Set<string>;
    runsCited: Set<string>;
    positions: number[];
    platformsAppeared: Set<PlatformType>;
    queries: Set<string>;
    claims: Set<string>;
    prompts: Set<string>;
    platformRuns: Record<PlatformType, { total: number; appeared: number }>;
  }>();

  // Initialize tracked brands
  const cleanTarget = targetDomain.replace(/^www\./, '').toLowerCase();
  brandMap.set(cleanTarget, {
    brandName: 'ToursByLocals',
    domain: cleanTarget,
    isTarget: true,
    isDirect: false,
    isIndirect: false,
    runsMentioned: new Set(),
    runsRetrieved: new Set(),
    runsCited: new Set(),
    positions: [],
    platformsAppeared: new Set(),
    queries: new Set(),
    claims: new Set(),
    prompts: new Set(),
    platformRuns: { gemini: { total: 0, appeared: 0 }, openai: { total: 0, appeared: 0 }, claude: { total: 0, appeared: 0 }, perplexity: { total: 0, appeared: 0 }, copilot: { total: 0, appeared: 0 } },
  });

  competitorDomains.forEach((comp) => {
    const cleanComp = comp.replace(/^www\./, '').toLowerCase();
    if (!brandMap.has(cleanComp)) {
      const name = cleanComp.split('.')[0];
      const capitalized = name.charAt(0).toUpperCase() + name.slice(1);
      brandMap.set(cleanComp, {
        brandName: capitalized,
        domain: cleanComp,
        isTarget: false,
        isDirect: true,
        isIndirect: false,
        runsMentioned: new Set(),
        runsRetrieved: new Set(),
        runsCited: new Set(),
        positions: [],
        platformsAppeared: new Set(),
        queries: new Set(),
        claims: new Set(),
        prompts: new Set(),
        platformRuns: { gemini: { total: 0, appeared: 0 }, openai: { total: 0, appeared: 0 }, claude: { total: 0, appeared: 0 }, perplexity: { total: 0, appeared: 0 }, copilot: { total: 0, appeared: 0 } },
      });
    }
  });

  // Track platforms tested
  const testedPlatforms = new Set<PlatformType>();

  validRuns.forEach((run) => {
    testedPlatforms.add(run.platform);

    // Update total runs per platform
    brandMap.forEach((entry) => {
      if (entry.platformRuns[run.platform]) {
        entry.platformRuns[run.platform].total++;
      }
    });

    // Check retrieval
    const retrievedDomains = run.retrievedSources.map((s) => s.domain.toLowerCase().replace(/^www\./, ''));
    // Check citations
    const citedDomains = run.citedSources.map((s) => s.domain.toLowerCase().replace(/^www\./, ''));

    // Check mentions
    run.mentionedBrands.forEach((mb) => {
      const cleanBrandDomain = mb.domain.toLowerCase().replace(/^www\./, '');
      if (!brandMap.has(cleanBrandDomain)) {
        brandMap.set(cleanBrandDomain, {
          brandName: mb.brandName,
          domain: cleanBrandDomain,
          isTarget: mb.isTargetBrand,
          isDirect: mb.isDirectCompetitor,
          isIndirect: mb.isIndirectCompetitor,
          runsMentioned: new Set(),
          runsRetrieved: new Set(),
          runsCited: new Set(),
          positions: [],
          platformsAppeared: new Set(),
          queries: new Set(),
          claims: new Set(),
          prompts: new Set(),
          platformRuns: { gemini: { total: 0, appeared: 0 }, openai: { total: 0, appeared: 0 }, claude: { total: 0, appeared: 0 }, perplexity: { total: 0, appeared: 0 }, copilot: { total: 0, appeared: 0 } },
        });
      }

      const item = brandMap.get(cleanBrandDomain)!;
      item.runsMentioned.add(run.id);
      item.platformsAppeared.add(run.platform);
      item.positions.push(typeof mb.positionInAnswer === 'number' ? mb.positionInAnswer : 0);
      if (mb.contextClaim) item.claims.add(mb.contextClaim);
      item.prompts.add(run.promptText);
      run.searchQueries.forEach((q) => item.queries.add(q));
      if (item.platformRuns[run.platform]) item.platformRuns[run.platform].appeared++;
    });

    // Match retrieved
    brandMap.forEach((item, d) => {
      if (retrievedDomains.some((rd) => rd.includes(d) || d.includes(rd))) {
        item.runsRetrieved.add(run.id);
        item.platformsAppeared.add(run.platform);
        item.prompts.add(run.promptText);
        run.searchQueries.forEach((q) => item.queries.add(q));
      }
      if (citedDomains.some((cd) => cd.includes(d) || d.includes(cd))) {
        item.runsCited.add(run.id);
        item.platformsAppeared.add(run.platform);
        item.prompts.add(run.promptText);
        run.searchQueries.forEach((q) => item.queries.add(q));
      }
    });
  });

  const totalTestedPlatformsCount = Math.max(1, testedPlatforms.size);

  const results: BrandVisibilityMetric[] = [];

  brandMap.forEach((item) => {
    const mentionCount = item.runsMentioned.size;
    const retrieveCount = item.runsRetrieved.size;
    const citeCount = item.runsCited.size;

    // Formulas as specified:
    // Retrieval Frequency: Valid runs retrieving domain / Total valid runs
    const retrievalFrequency = totalValid > 0 ? (retrieveCount / totalValid) * 100 : 0;
    // Citation Frequency: Valid runs citing domain / Total valid runs
    const citationFrequency = totalValid > 0 ? (citeCount / totalValid) * 100 : 0;
    // Mention Frequency: Valid runs mentioning brand / Total valid runs
    const mentionFrequency = totalValid > 0 ? (mentionCount / totalValid) * 100 : 0;
    // Citation Conversion Rate: Runs citing domain / Runs retrieving domain
    const citationConversionRate = retrieveCount > 0 ? (citeCount / retrieveCount) * 100 : citeCount > 0 ? 100 : 0;
    // Cross-platform presence: Platforms where brand appeared / Platforms tested
    const crossPlatformPresence = (item.platformsAppeared.size / totalTestedPlatformsCount) * 100;

    const avgPos =
      item.positions.length > 0
        ? Math.round(item.positions.reduce((a, b) => a + b, 0) / item.positions.length)
        : 0;

    // Stability: Variance across runs (100 = perfectly identical appearance rate)
    const stabilityScore = totalValid > 0 ? Math.min(100, Math.round((mentionCount / totalValid) * 100)) : 0;

    // Prompt Sensitivity: percentage change across prompt variations
    const promptSensitivity = item.prompts.size > 0 ? Math.round((item.prompts.size / Math.max(1, new Set(runs.map(r => r.promptId)).size)) * 100) : 0;

    const platformPresenceRecord: Record<PlatformType, number> = {
      gemini: item.platformRuns.gemini.total > 0 ? (item.platformRuns.gemini.appeared / item.platformRuns.gemini.total) * 100 : 0,
      openai: item.platformRuns.openai.total > 0 ? (item.platformRuns.openai.appeared / item.platformRuns.openai.total) * 100 : 0,
      claude: item.platformRuns.claude.total > 0 ? (item.platformRuns.claude.appeared / item.platformRuns.claude.total) * 100 : 0,
      perplexity: 0,
      copilot: 0,
    };

    results.push({
      brandName: item.brandName,
      domain: item.domain,
      isTargetBrand: item.isTarget,
      isDirectCompetitor: item.isDirect,
      isIndirectCompetitor: item.isIndirect,
      totalValidRuns: totalValid,
      mentionFrequency: Math.round(mentionFrequency * 10) / 10,
      retrievalFrequency: Math.round(retrievalFrequency * 10) / 10,
      citationFrequency: Math.round(citationFrequency * 10) / 10,
      citationConversionRate: Math.round(citationConversionRate * 10) / 10,
      averageAnswerPosition: avgPos,
      crossPlatformPresence: Math.round(crossPlatformPresence * 10) / 10,
      citationStability: stabilityScore,
      promptSensitivity,
      associatedQueries: Array.from(item.queries),
      associatedClaims: Array.from(item.claims),
      triggeringPrompts: Array.from(item.prompts),
      platformPresence: platformPresenceRecord,
    });
  });

  // Sort: Target first, then by Citation Frequency descending
  return results.sort((a, b) => {
    if (a.isTargetBrand) return -1;
    if (b.isTargetBrand) return 1;
    return b.citationFrequency - a.citationFrequency;
  });
}

/**
 * Builds the complete auditable Search Pathway table rows
 * Pathway: Prompt -> Search query -> Retrieved source -> Cited passage -> Final claim -> Mentioned brand
 */
export function buildSearchPathways(runs: TestRunItem[]): SearchPathwayRow[] {
  const rows: SearchPathwayRow[] = [];

  runs.forEach((run) => {
    const queries = run.searchQueries.length > 0 ? run.searchQueries : ['Not exposed by this platform or run'];
    const retrieved = run.retrievedSources;
    const cited = run.citedSources;
    const brands = run.mentionedBrands;

    // Build comprehensive combination rows
    const primaryQuery = queries[0];

    if (cited.length > 0) {
      cited.forEach((c, idx) => {
        const brandMatch = brands.find((b) => b.domain === c.domain || c.url.includes(b.domain));
        rows.push({
          id: `${run.id}-pathway-cite-${idx}`,
          platform: run.platform,
          model: run.model,
          prompt: run.promptText,
          promptVariation: run.promptVariation || 'Direct Intent',
          run: run.runIndex,
          searchQuery: queries[idx % queries.length] || primaryQuery,
          retrievedUrl: c.url,
          retrievedDomain: c.domain,
          sourceTitle: c.title,
          retrievalStatus: 'Retrieved',
          citationStatus: 'Cited',
          citedClaim: c.supportedClaims?.[0] || 'Direct support for answer proposition',
          citedText: c.citedText || c.snippet || 'Extracted answer passage',
          mentionedBrand: brandMatch?.brandName || c.domain,
          brandPosition: brandMatch?.positionInAnswer ?? 'N/A',
          timestamp: run.timestamp,
        });
      });
    }

    // Include retrieved but uncited sources
    retrieved.forEach((r, idx) => {
      const isAlreadyCited = cited.some((c) => c.url === r.url);
      if (!isAlreadyCited) {
        const brandMatch = brands.find((b) => b.domain === r.domain || r.url.includes(b.domain));
        rows.push({
          id: `${run.id}-pathway-ret-${idx}`,
          platform: run.platform,
          model: run.model,
          prompt: run.promptText,
          promptVariation: run.promptVariation || 'Direct Intent',
          run: run.runIndex,
          searchQuery: queries[idx % queries.length] || primaryQuery,
          retrievedUrl: r.url,
          retrievedDomain: r.domain,
          sourceTitle: r.title,
          retrievalStatus: 'Retrieved',
          citationStatus: 'Not cited',
          citedClaim: 'None (source consulted but not directly cited)',
          citedText: r.snippet || 'Source snippet retrieved by grounding engine',
          mentionedBrand: brandMatch?.brandName || r.domain,
          brandPosition: brandMatch?.positionInAnswer ?? 'Unmentioned',
          timestamp: run.timestamp,
        });
      }
    });

    // If neither sources were exposed, preserve prompt-to-brand row
    if (retrieved.length === 0 && cited.length === 0 && brands.length > 0) {
      brands.forEach((b, idx) => {
        rows.push({
          id: `${run.id}-pathway-brand-${idx}`,
          platform: run.platform,
          model: run.model,
          prompt: run.promptText,
          promptVariation: run.promptVariation || 'Direct Intent',
          run: run.runIndex,
          searchQuery: primaryQuery,
          retrievedUrl: `https://${b.domain}`,
          retrievedDomain: b.domain,
          sourceTitle: `${b.brandName} Official Entity`,
          retrievalStatus: 'Not exposed',
          citationStatus: 'Not cited',
          citedClaim: b.contextClaim,
          citedText: b.contextClaim,
          mentionedBrand: b.brandName,
          brandPosition: b.positionInAnswer,
          timestamp: run.timestamp,
        });
      });
    }
  });

  return rows;
}

/**
 * Extracts and classifies all unique sources across test runs
 */
export function extractSourcesDirectory(runs: TestRunItem[], targetDomain: string, competitorDomains: string[]): ExtractedSourceItem[] {
  const sourceMap = new Map<string, ExtractedSourceItem>();
  const cleanTarget = targetDomain.replace(/^www\./, '').toLowerCase();

  runs.forEach((run) => {
    // Process retrieved sources
    run.retrievedSources.forEach((rs) => {
      const url = rs.url || `https://${rs.domain}`;
      const domain = rs.domain.toLowerCase().replace(/^www\./, '');
      const existing = sourceMap.get(url);

      let classification = determineClassification(domain, cleanTarget, competitorDomains);

      if (!existing) {
        sourceMap.set(url, {
          id: `source-${sourceMap.size + 1}`,
          url,
          domain,
          title: rs.title || domain,
          snippet: rs.snippet,
          pageAge: rs.pageAge,
          classification,
          retrievalStatus: 'Retrieved',
          citationStatus: 'Not cited',
          supportedClaims: [],
          firstObserved: run.timestamp,
          mostRecentObservation: run.timestamp,
          retrievalCount: 1,
          citationCount: 0,
          mentionCount: 0,
          associatedQueries: run.searchQueries,
          associatedPrompts: [run.promptText],
        });
      } else {
        existing.retrievalCount++;
        existing.mostRecentObservation = run.timestamp;
        run.searchQueries.forEach((q) => {
          if (!existing.associatedQueries.includes(q)) existing.associatedQueries.push(q);
        });
        if (!existing.associatedPrompts.includes(run.promptText)) existing.associatedPrompts.push(run.promptText);
      }
    });

    // Process cited sources
    run.citedSources.forEach((cs) => {
      const url = cs.url || `https://${cs.domain}`;
      const domain = cs.domain.toLowerCase().replace(/^www\./, '');
      const existing = sourceMap.get(url);
      const classification = determineClassification(domain, cleanTarget, competitorDomains);

      if (!existing) {
        sourceMap.set(url, {
          id: `source-${sourceMap.size + 1}`,
          url,
          domain,
          title: cs.title || domain,
          snippet: cs.snippet,
          classification: classification === 'Target domain' ? 'Target domain' : 'Retrieved and cited',
          retrievalStatus: 'Retrieved',
          citationStatus: 'Cited',
          supportedClaims: cs.supportedClaims || [],
          citedPassages: cs.citedText ? [cs.citedText] : [],
          firstObserved: run.timestamp,
          mostRecentObservation: run.timestamp,
          retrievalCount: 1,
          citationCount: 1,
          mentionCount: 0,
          associatedQueries: run.searchQueries,
          associatedPrompts: [run.promptText],
        });
      } else {
        existing.citationCount++;
        existing.citationStatus = 'Cited';
        if (existing.classification === 'Retrieved but not cited') {
          existing.classification = 'Retrieved and cited';
        }
        (cs.supportedClaims || []).forEach((sc) => {
          if (!existing.supportedClaims.includes(sc)) existing.supportedClaims.push(sc);
        });
        if (cs.citedText && (!existing.citedPassages || !existing.citedPassages.includes(cs.citedText))) {
          existing.citedPassages = existing.citedPassages ? [...existing.citedPassages, cs.citedText] : [cs.citedText];
        }
      }
    });

    // Process mentions
    run.mentionedBrands.forEach((mb) => {
      const domain = mb.domain.toLowerCase().replace(/^www\./, '');
      sourceMap.forEach((src) => {
        if (src.domain.includes(domain) || domain.includes(src.domain)) {
          src.mentionCount++;
        }
      });
    });
  });

  return Array.from(sourceMap.values()).sort((a, b) => b.citationCount - a.citationCount);
}

function determineClassification(domain: string, targetDomain: string, competitorDomains: string[]): any {
  if (domain.includes(targetDomain) || targetDomain.includes(domain)) return 'Target domain';
  if (competitorDomains.some((c) => domain.includes(c.toLowerCase()) || c.toLowerCase().includes(domain))) {
    return 'Direct competitor';
  }
  if (['tripadvisor.com', 'trustpilot.com', 'yelp.com'].some((r) => domain.includes(r))) return 'Review platform';
  if (['reddit.com', 'quora.com', 'tripadvisor.com/ShowTopic'].some((f) => domain.includes(f))) return 'Forum or user-generated content';
  if (['lonelyplanet.com', 'ricksteves.com', 'fpmagazine.com', 'thepointsguy.com'].some((e) => domain.includes(e))) return 'Editorial publisher';
  if (['turismoroma.it', 'italia.it', 'vatican.va', 'beniculturali.it'].some((g) => domain.includes(g))) return 'Official or government';
  if (['viator.com', 'getyourguide.com', 'expedia.com', 'klook.com'].some((m) => domain.includes(m))) return 'Marketplace';
  return 'Retrieved but not cited';
}

/**
 * Validates and imports Query Fan-out Explorer JSON schema
 */
export function validateAndImportJson(jsonText: string): { success: boolean; data?: QueryFanOutImportSchema[]; error?: string } {
  try {
    const parsed = JSON.parse(jsonText);
    const items: QueryFanOutImportSchema[] = Array.isArray(parsed) ? parsed : [parsed];

    const validated: QueryFanOutImportSchema[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.test_prompt && !item.seed_prompt) {
        return {
          success: false,
          error: `Item at index ${i} is missing required 'test_prompt' or 'seed_prompt'`,
        };
      }

      validated.push({
        project_id: item.project_id || '',
        project_name: item.project_name || '',
        prompt_id: item.prompt_id || `prompt-import-${i + 1}`,
        seed_prompt: item.seed_prompt || item.test_prompt,
        test_prompt: item.test_prompt || item.seed_prompt,
        prompt_variation_type: item.prompt_variation_type || 'Imported Fan-out Variation',
        query_cluster: item.query_cluster || 'General Exploration',
        search_intent: item.search_intent || 'Commercial',
        journey_stage: item.journey_stage || 'Consideration',
        subject: item.subject || 'Imported Topic',
        audience: item.audience || 'Target Audience',
        country: item.country || 'CA',
        language: item.language || 'en',
        target_domain: item.target_domain || '',
        target_url: item.target_url || '',
        competitor_domains: item.competitor_domains || [],
        business_objective: item.business_objective || '',
        business_priority: item.business_priority || 'Medium',
        reason_for_testing: item.reason_for_testing || '',
        source_classification: item.source_classification || '',
        approval_status: item.approval_status || 'Approved',
      });
    }

    return { success: true, data: validated };
  } catch (err: any) {
    return { success: false, error: `Invalid JSON format: ${err.message}` };
  }
}

/**
 * Parses CSV and maps columns to QueryFanOutImportSchema
 */
export function parseCsv(csvText: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return { headers: [], rows: [] };

  const parseLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const headers = parseLine(lines[0]);
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseLine(lines[i]);
    const rowObj: Record<string, string> = {};
    headers.forEach((h, idx) => {
      rowObj[h] = values[idx] || '';
    });
    rows.push(rowObj);
  }

  return { headers, rows };
}

/**
 * Converts dataset to clean downloadable CSV
 */
export function exportToCsv(filename: string, headers: string[], rows: (string | number)[][]) {
  const escapeCsv = (val: string | number) => {
    const str = String(val ?? '');
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const content = [
    headers.map(escapeCsv).join(','),
    ...rows.map((row) => row.map(escapeCsv).join(',')),
  ].join('\n');

  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports data object to JSON file
 */
export function exportToJson(filename: string, data: any) {
  // Strip any accidental sensitive keys
  const safeData = JSON.parse(JSON.stringify(data, (key, value) => {
    if (key.toLowerCase().includes('apikey') || key.toLowerCase().includes('secret')) {
      return undefined;
    }
    return value;
  }));

  const content = JSON.stringify(safeData, null, 2);
  const blob = new Blob([content], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.json') ? filename : `${filename}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
