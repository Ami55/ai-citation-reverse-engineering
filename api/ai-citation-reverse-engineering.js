const json = (res, status, body) => res.status(status).json(body);

const domainOf = (url) => {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return ''; }
};

const source = (url, title = '', snippet = '') => ({
  url,
  domain: domainOf(url),
  title: title || domainOf(url) || url,
  snippet,
});

const uniqueSources = (items) => Array.from(new Map(items.filter((item) => item?.url).map((item) => [item.url, item])).values());

const safePublicUrl = (value) => {
  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol)) return false;
    const host = url.hostname.toLowerCase();
    if (host === 'localhost' || host.endsWith('.local') || /^127\.|^10\.|^192\.168\.|^169\.254\./.test(host)) return false;
    return true;
  } catch { return false; }
};

const textFromHtml = (html) => html
  .replace(/<script[\s\S]*?<\/script>/gi, ' ')
  .replace(/<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<svg[\s\S]*?<\/svg>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"')
  .replace(/\s+/g, ' ').trim().slice(0, 18000);

async function fetchPageText(url) {
  if (!safePublicUrl(url)) return { url, fetched: false, text: '' };
  try {
    const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 CitationResearchBot/1.0', Accept: 'text/html,application/xhtml+xml' }, signal: AbortSignal.timeout(12000), redirect: 'follow' });
    const contentType = response.headers.get('content-type') || '';
    if (!response.ok || !contentType.includes('text/html')) return { url, fetched: false, text: '' };
    return { url, fetched: true, text: textFromHtml(await response.text()) };
  } catch { return { url, fetched: false, text: '' }; }
}

const parseJsonText = (value) => {
  const cleaned = String(value || '').replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
  return JSON.parse(cleaned);
};

async function analyzeImplementation(payload) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY is required for implementation analysis.');
  const model = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
  const runs = (payload.runs || []).filter((run) => run.status === 'success');
  if (!runs.length) throw new Error('Run at least one successful test before implementation analysis.');
  const observedSourceUrls = runs.flatMap((run) => [...(run.citedSources || []), ...(run.retrievedSources || [])].map((item) => item.url).filter(Boolean));
  const configuredCompetitorUrls = (payload.competitorDomains || []).filter(Boolean).map((domain) => domain.startsWith('http') ? domain : `https://${domain}`);
  const sourceUrls = Array.from(new Set([...observedSourceUrls, ...configuredCompetitorUrls]).values()).slice(0, 8);
  const targetUrls = Array.from(new Set((payload.targetUrls || []).filter(Boolean))).slice(0, 4);
  const [sourcePages, targetPages] = await Promise.all([
    Promise.all(sourceUrls.map(fetchPageText)),
    Promise.all(targetUrls.map(fetchPageText)),
  ]);
  const answers = runs.map((run, index) => `RUN ${index + 1} (${run.platform})\nPROMPT: ${run.promptText}\nANSWER: ${run.answerText}`).join('\n\n').slice(0, 45000);
  const sourceCorpus = sourcePages.map((page) => `SOURCE URL: ${page.url}\nFETCHED: ${page.fetched}\nTEXT: ${page.text}`).join('\n\n').slice(0, 70000);
  const targetCorpus = targetPages.map((page) => `TARGET URL: ${page.url}\nFETCHED: ${page.fetched}\nTEXT: ${page.text}`).join('\n\n').slice(0, 50000);
  const prompt = `You are a rigorous GEO and content implementation analyst. Analyze observed AI answers, cited/retrieved source pages, and target website pages. Do not claim causation or invent page evidence. Find repeated answer criteria, similarities across source pages, evidence-backed target gaps, and concrete page changes. Every implementation must name a target URL and be usable by a content/SEO team.

Return ONLY valid JSON with this exact shape:
{"answerInsights":["..."],"sourceSimilarities":[{"pattern":"...","evidence":"...","implication":"..."}],"targetGaps":[{"targetUrl":"...","gap":"...","comparedWith":"...","impact":"..."}],"implementationPlan":[{"priority":"High|Medium|Low","targetUrl":"...","change":"...","example":"...","why":"...","successMetric":"..."}],"limitations":["..."]}

TARGET DOMAIN: ${payload.targetDomain}

OBSERVED ANSWERS:
${answers}

SOURCE PAGES:
${sourceCorpus || 'No source page text was available. State this limitation.'}

TARGET PAGES:
${targetCorpus || 'No target page text was available. Do not invent target gaps.'}`;
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }], generationConfig: { responseMimeType: 'application/json', temperature: 0.2 } }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error?.message || `Analysis returned ${response.status}`);
  const result = parseJsonText((data.candidates?.[0]?.content?.parts || []).map((part) => part.text || '').join(''));
  return { ...result, generatedAt: new Date().toISOString(), pagesAnalyzed: [...sourcePages.map((page) => ({ url: page.url, type: 'source', fetched: page.fetched })), ...targetPages.map((page) => ({ url: page.url, type: 'target', fetched: page.fetched }))] };
}

const brandsFrom = (answerText, sources, targetDomain, competitorDomains = []) => {
  const domains = [targetDomain, ...competitorDomains].filter(Boolean);
  return domains.map((domain) => {
    const clean = domain.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
    const brand = clean.split('.')[0];
    const cited = sources.some((item) => item.domain === clean || item.domain.endsWith(`.${clean}`));
    const mentioned = answerText.toLowerCase().includes(brand.toLowerCase()) || answerText.toLowerCase().includes(clean.toLowerCase());
    if (!cited && !mentioned) return null;
    return {
      brandName: brand,
      domain: clean,
      isTargetBrand: clean === targetDomain?.replace(/^www\./, ''),
      isDirectCompetitor: competitorDomains.some((item) => item.includes(clean)),
      isIndirectCompetitor: false,
      positionInAnswer: Math.max(1, answerText.toLowerCase().indexOf(brand.toLowerCase())),
      contextClaim: cited ? 'Domain was cited in the generated answer.' : 'Brand was mentioned without a linked citation.',
      recommended: mentioned,
    };
  }).filter(Boolean);
};

async function runGemini(payload) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY is not configured in Vercel.');
  const preferredModel = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
  const models = Array.from(new Set([preferredModel, 'gemini-3.6-flash']));
  let model = models[0];
  let data;
  let response;
  for (const candidateModel of models) {
    model = candidateModel;
    response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: `Use Google Search to research this question with current web sources. Answer clearly and ground factual claims in the sources you find. Question: ${payload.prompt}` }] }], tools: [{ google_search: {} }] }),
    });
    data = await response.json();
    if (response.ok) break;
    const message = data?.error?.message || '';
    if (!message.includes('no longer available') && !message.includes('not found')) break;
  }
  if (!response?.ok) throw new Error(data?.error?.message || `Gemini returned ${response?.status || 'an error'}`);
  const candidate = data.candidates?.[0] || {};
  const answerText = (candidate.content?.parts || []).map((part) => part.text || '').join('\n');
  const metadata = candidate.groundingMetadata || {};
  const retrievedSources = uniqueSources((metadata.groundingChunks || []).map((chunk) => source(chunk.web?.uri, chunk.web?.title)));
  return { model, answerText, searchQueries: metadata.webSearchQueries || [], retrievedSources, citedSources: retrievedSources, groundingSupports: metadata.groundingSupports || [], rawApiData: data };
}

async function runOpenAI(payload) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error('OPENAI_API_KEY is not configured in Vercel.');
  const model = process.env.OPENAI_MODEL || 'gpt-4.1-mini';
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({ model, input: `Search the web before answering. Use current sources and cite them. Question: ${payload.prompt}`, tools: [{ type: 'web_search_preview' }], tool_choice: 'required' }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error?.message || `OpenAI returned ${response.status}`);
  const textParts = (data.output || []).flatMap((item) => item.content || []).filter((item) => item.type === 'output_text');
  const answerText = textParts.map((item) => item.text || '').join('\n');
  const citedSources = uniqueSources(textParts.flatMap((item) => item.annotations || []).filter((item) => item.type === 'url_citation').map((item) => source(item.url, item.title)));
  const searchQueries = (data.output || []).filter((item) => item.type === 'web_search_call').flatMap((item) => item.action?.queries || []);
  return { model, answerText, searchQueries, retrievedSources: citedSources, citedSources, rawApiData: data };
}

async function runClaude(payload) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error('ANTHROPIC_API_KEY is not configured in Vercel.');
  const workspaceId = process.env.ANTHROPIC_WORKSPACE_ID;
  const model = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514';
  const headers = { 'Content-Type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' };
  if (workspaceId) headers['anthropic-workspace-id'] = workspaceId;
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers,
    body: JSON.stringify({ model, max_tokens: 2048, tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 5 }], messages: [{ role: 'user', content: `Search the web before answering. Use current sources and cite them. Question: ${payload.prompt}` }] }),
  });
  const data = await response.json();
  if (!response.ok) {
    const message = data?.error?.message || `Claude returned ${response.status}`;
    if (message.includes('anthropic-workspace-id')) throw new Error(`${message} Add ANTHROPIC_WORKSPACE_ID to this Vercel project's Environment Variables, then redeploy.`);
    throw new Error(message);
  }
  const answerText = (data.content || []).filter((item) => item.type === 'text').map((item) => item.text || '').join('\n');
  const searchQueries = (data.content || []).filter((item) => item.type === 'server_tool_use').map((item) => item.input?.query).filter(Boolean);
  const results = (data.content || []).filter((item) => item.type === 'web_search_tool_result').flatMap((item) => Array.isArray(item.content) ? item.content : []);
  const retrievedSources = uniqueSources(results.map((item) => source(item.url, item.title, item.encrypted_content ? '' : item.content?.[0]?.text || '')));
  const citationUrls = (data.content || []).filter((item) => item.type === 'text').flatMap((item) => item.citations || []).map((item) => item.url).filter(Boolean);
  const citedSources = uniqueSources(citationUrls.map((url) => retrievedSources.find((item) => item.url === url) || source(url)));
  return { model, answerText, searchQueries, retrievedSources, citedSources, rawApiData: data };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });
  if (req.body?.action === 'status') return json(res, 200, {
    gemini: { available: Boolean(process.env.GEMINI_API_KEY) },
    openai: { available: Boolean(process.env.OPENAI_API_KEY) },
    claude: { available: Boolean(process.env.ANTHROPIC_API_KEY), workspaceConfigured: Boolean(process.env.ANTHROPIC_WORKSPACE_ID) },
  });
  if (req.body?.action === 'analyze-implementation') {
    try { return json(res, 200, { status: 'success', analysis: await analyzeImplementation(req.body) }); }
    catch (error) { return json(res, 500, { status: 'failed', error: error?.message || 'Implementation analysis failed' }); }
  }
  if (req.body?.action !== 'execute') return json(res, 400, { error: 'Unsupported action' });
  try {
    const runners = { gemini: runGemini, openai: runOpenAI, claude: runClaude };
    const runner = runners[req.body.platform];
    if (!runner) return json(res, 400, { error: `Unsupported platform: ${req.body.platform}` });
    const result = await runner(req.body);
    return json(res, 200, { status: 'success', timestamp: new Date().toISOString(), ...result, mentionedBrands: brandsFrom(result.answerText, result.citedSources, req.body.targetDomain, req.body.competitorDomains) });
  } catch (error) {
    return json(res, 500, { status: 'failed', error: error?.message || 'Provider request failed' });
  }
}
