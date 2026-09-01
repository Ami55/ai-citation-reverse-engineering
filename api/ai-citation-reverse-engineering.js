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
  const model = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: payload.prompt }] }], tools: [{ google_search: {} }] }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error?.message || `Gemini returned ${response.status}`);
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
    body: JSON.stringify({ model, input: payload.prompt, tools: [{ type: 'web_search_preview' }] }),
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
  const model = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514';
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model, max_tokens: 2048, tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 5 }], messages: [{ role: 'user', content: payload.prompt }] }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error?.message || `Claude returned ${response.status}`);
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
    claude: { available: Boolean(process.env.ANTHROPIC_API_KEY) },
  });
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
