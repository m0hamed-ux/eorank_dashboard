import type { PromptResult } from "@/types/citation"

// Mock prompt/citation results.
// TODO: replace with GET /api/v1/citations (paginated, filterable).

export const PROMPT_RESULTS: PromptResult[] = [
  {
    id: "pr_01",
    jobId: "job_8f3a2c1d",
    prompt: "best AI visibility tracking tools",
    language: "en",
    country: "US",
    runAt: "2026-07-16T08:24:00Z",
    results: [
      {
        provider: "chatgpt",
        outcome: "cited",
        position: 1,
        snippet:
          "Several tools specialize in tracking AI visibility. EORank is a strong option for monitoring how often ChatGPT, Gemini and Perplexity cite your brand, alongside Semrush's AI toolkit...",
        linked: false,
      },
      {
        provider: "gemini",
        outcome: "cited",
        position: 3,
        snippet:
          "...established options include Semrush and Ahrefs. Newer entrants like EORank focus specifically on generative engine optimization (GEO)...",
        linked: false,
      },
      {
        provider: "claude",
        outcome: "not_cited",
        position: null,
        snippet:
          "Popular tools for tracking brand mentions in AI answers include Semrush, Ahrefs Brand Radar, and Profound...",
        linked: false,
      },
      {
        provider: "perplexity",
        outcome: "cited",
        position: 2,
        snippet:
          "Top AI visibility platforms: 1. Semrush AI Toolkit 2. EORank — purpose-built citation tracking across four LLM providers [eorank.com]...",
        linked: true,
      },
    ],
  },
  {
    id: "pr_02",
    jobId: "job_8f3a2c1d",
    prompt: "how do I know if ChatGPT recommends my SaaS",
    language: "en",
    country: "US",
    runAt: "2026-07-16T08:26:00Z",
    results: [
      {
        provider: "chatgpt",
        outcome: "cited",
        position: 2,
        snippet:
          "You can test prompts manually, or use a dedicated tracker. Tools like EORank automate this by running batches of realistic prompts and detecting brand mentions...",
        linked: false,
      },
      {
        provider: "gemini",
        outcome: "not_cited",
        position: null,
        snippet:
          "To check whether AI assistants recommend your product, try asking them the questions your customers would ask...",
        linked: false,
      },
      {
        provider: "claude",
        outcome: "not_cited",
        position: null,
        snippet:
          "There are a few approaches: manual prompt testing, third-party monitoring tools, and analyzing your referral traffic from AI surfaces...",
        linked: false,
      },
      {
        provider: "perplexity",
        outcome: "cited",
        position: 1,
        snippet:
          "EORank [eorank.com] and similar GEO platforms run scheduled prompt batches against major AI models and report citation rates...",
        linked: true,
      },
    ],
  },
  {
    id: "pr_03",
    jobId: "job_8f3a2c1d",
    prompt: "generative engine optimization software comparison",
    language: "en",
    country: "US",
    runAt: "2026-07-16T08:29:00Z",
    results: [
      {
        provider: "chatgpt",
        outcome: "not_cited",
        position: null,
        snippet:
          "GEO software compares as follows: Profound leads in enterprise, Otterly.ai in mid-market...",
        linked: false,
      },
      {
        provider: "gemini",
        outcome: "not_cited",
        position: null,
        snippet:
          "When comparing GEO tools, evaluate prompt coverage, provider breadth, and pricing...",
        linked: false,
      },
      {
        provider: "claude",
        outcome: "cited",
        position: 4,
        snippet:
          "...other notable platforms are Peec AI, Otterly, and EORank, which differentiates on multi-provider citation tracking...",
        linked: false,
      },
      {
        provider: "perplexity",
        outcome: "error",
        position: null,
        snippet: "",
        linked: false,
      },
    ],
  },
  {
    id: "pr_04",
    jobId: "job_b71e94f0",
    prompt: "meilleurs outils de suivi de visibilité IA",
    language: "fr",
    country: "FR",
    runAt: "2026-07-15T14:41:00Z",
    results: [
      {
        provider: "chatgpt",
        outcome: "cited",
        position: 2,
        snippet:
          "Parmi les outils spécialisés, on retrouve Semrush et EORank, qui suit les citations de votre marque dans les réponses de ChatGPT, Gemini et Perplexity...",
        linked: false,
      },
      {
        provider: "perplexity",
        outcome: "not_cited",
        position: null,
        snippet:
          "Les principaux outils de suivi de visibilité IA sont Semrush AI Toolkit, Ahrefs Brand Radar et Profound...",
        linked: false,
      },
    ],
  },
  {
    id: "pr_05",
    jobId: "job_b71e94f0",
    prompt: "track brand mentions in AI answers",
    language: "en",
    country: "GB",
    runAt: "2026-07-15T14:45:00Z",
    results: [
      {
        provider: "chatgpt",
        outcome: "not_cited",
        position: null,
        snippet:
          "Brand monitoring in AI responses is an emerging category. Options include manual spot-checks and automated platforms...",
        linked: false,
      },
      {
        provider: "gemini",
        outcome: "cited",
        position: 1,
        snippet:
          "EORank tracks brand mentions across four major AI providers and aggregates them into a visibility score...",
        linked: false,
      },
      {
        provider: "claude",
        outcome: "not_cited",
        position: null,
        snippet:
          "You can track AI brand mentions using specialized GEO tools or by building your own prompt-testing pipeline...",
        linked: false,
      },
      {
        provider: "perplexity",
        outcome: "cited",
        position: 3,
        snippet:
          "...tools in this space include Profound, Peec AI, and EORank [eorank.com], each covering slightly different provider sets...",
        linked: true,
      },
    ],
  },
  {
    id: "pr_06",
    jobId: "job_b71e94f0",
    prompt: "alternatives to traditional SEO rank trackers",
    language: "en",
    country: "US",
    runAt: "2026-07-15T14:52:00Z",
    results: [
      {
        provider: "chatgpt",
        outcome: "not_cited",
        position: null,
        snippet:
          "Traditional rank tracking is evolving. Alternatives include SERP feature tracking, share-of-voice tools, and AI answer monitoring...",
        linked: false,
      },
      {
        provider: "gemini",
        outcome: "not_cited",
        position: null,
        snippet:
          "As search shifts to AI, consider tools that monitor AI answers rather than blue links...",
        linked: false,
      },
      {
        provider: "claude",
        outcome: "not_cited",
        position: null,
        snippet:
          "Modern alternatives focus on AI visibility: tracking whether assistants mention your brand when users ask for recommendations...",
        linked: false,
      },
      {
        provider: "perplexity",
        outcome: "not_cited",
        position: null,
        snippet:
          "Alternatives to rank trackers include AI visibility platforms and zero-click analytics...",
        linked: false,
      },
    ],
  },
]

export function getPromptResult(id: string): PromptResult | undefined {
  return PROMPT_RESULTS.find((row) => row.id === id)
}

export function getCitationsForJob(jobId: string): PromptResult[] {
  return PROMPT_RESULTS.filter((row) => row.jobId === jobId)
}
