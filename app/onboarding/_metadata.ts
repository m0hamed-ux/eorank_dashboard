"use server"

// Server-side site metadata fetch for onboarding: title, description, og image.
// SSRF-guarded — this server fetches a USER-SUPPLIED host, so the same rules
// as the backend's app/core/domains.py apply: public https domains only, no
// IPs/localhost/internal namespaces, and the post-redirect URL is re-checked.

const MAX_HTML_BYTES = 512 * 1024
const FETCH_TIMEOUT_MS = 8000

const LABEL_RE = /^(?!-)[a-z0-9-]{1,63}(?<!-)$/
const TLD_RE = /^(?:[a-z]{2,63}|xn--[a-z0-9-]{2,59})$/
const BLOCKED_EXACT = new Set(["localhost"])
const BLOCKED_SUFFIXES = [
  ".localhost",
  ".local",
  ".internal",
  ".home.arpa",
  ".arpa",
  ".test",
  ".invalid",
  ".example",
  ".onion",
]

function isSafePublicHost(host: string): boolean {
  const domain = host.toLowerCase().replace(/\.$/, "")
  if (!domain || domain.length > 253) return false
  if (!/^[\x21-\x7e]+$/.test(domain)) return false // ASCII only
  if (domain.includes("@") || domain.includes(":")) return false
  if (BLOCKED_EXACT.has(domain)) return false
  if (BLOCKED_SUFFIXES.some((s) => domain.endsWith(s))) return false
  const labels = domain.split(".")
  if (labels.length < 2) return false
  if (!labels.every((l) => LABEL_RE.test(l))) return false
  // Alphabetic/punycode TLD kills every numeric/hex IP encoding.
  if (!TLD_RE.test(labels[labels.length - 1])) return false
  return true
}

function decodeEntities(value: string): string {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&#x27;", "'")
    .replaceAll("&nbsp;", " ")
    .trim()
}

function metaContent(html: string, key: string): string | null {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  // <meta property="key" content="..."> in either attribute order.
  const patterns = [
    new RegExp(
      `<meta[^>]*(?:property|name)=["']${escaped}["'][^>]*content=["']([^"']*)["']`,
      "i"
    ),
    new RegExp(
      `<meta[^>]*content=["']([^"']*)["'][^>]*(?:property|name)=["']${escaped}["']`,
      "i"
    ),
  ]
  for (const pattern of patterns) {
    const match = html.match(pattern)
    if (match?.[1]) return decodeEntities(match[1])
  }
  return null
}

async function readCapped(response: Response): Promise<string> {
  const reader = response.body?.getReader()
  if (!reader) return ""
  const decoder = new TextDecoder("utf-8", { fatal: false })
  let html = ""
  let received = 0
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    received += value.byteLength
    html += decoder.decode(value, { stream: true })
    if (received >= MAX_HTML_BYTES) {
      await reader.cancel()
      break
    }
  }
  return html
}

export type SiteMetadata = {
  ok: true
  title: string
  description: string
  image: string | null
  domain: string
  aliases: string[]
}

export type SiteMetadataError = { ok: false; error: string }

export async function fetchSiteMetadata(
  rawDomain: string
): Promise<SiteMetadata | SiteMetadataError> {
  const domain = rawDomain
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .split(/[/?#]/)[0]

  if (!isSafePublicHost(domain)) {
    return { ok: false, error: "Enter a valid public domain like acme.com." }
  }

  let response: Response
  try {
    response = await fetch(`https://${domain}/`, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      redirect: "follow",
      headers: {
        "User-Agent": "EORankBot/0.1 (+https://eorank.com)",
        Accept: "text/html,application/xhtml+xml",
      },
      cache: "no-store",
    })
  } catch {
    return {
      ok: false,
      error: "We couldn't reach that site. Check the domain and try again.",
    }
  }

  // Redirects may land anywhere — re-validate the final host (SSRF guard).
  let finalUrl: URL
  try {
    finalUrl = new URL(response.url)
  } catch {
    return { ok: false, error: "That site redirected somewhere invalid." }
  }
  if (
    finalUrl.protocol !== "https:" ||
    finalUrl.port !== "" ||
    !isSafePublicHost(finalUrl.hostname)
  ) {
    return { ok: false, error: "That site redirected somewhere we can't follow." }
  }

  const contentType = response.headers.get("content-type") ?? ""
  if (!response.ok || !contentType.includes("text/html")) {
    return {
      ok: false,
      error: "That site didn't return a readable page. You can fill the details manually.",
    }
  }

  const html = await readCapped(response)

  const titleTag = html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]
  const title = (
    metaContent(html, "og:site_name") ??
    metaContent(html, "og:title") ??
    (titleTag ? decodeEntities(titleTag) : "")
  ).slice(0, 120)

  const description = (
    metaContent(html, "description") ??
    metaContent(html, "og:description") ??
    ""
  ).slice(0, 2000)

  // Site ICON (favicon family), not og:image — og images are social banners,
  // the icon is the actual brand mark. Preference: apple-touch-icon (large,
  // square) > <link rel=icon> with the biggest declared size > /favicon.ico.
  const image = await pickSiteIcon(html, finalUrl)

  const aliases = suggestAliases({ title, domain })

  return { ok: true, title, description, image, domain, aliases }
}

function sanitizeIconUrl(raw: string, base: URL): string | null {
  // Held to the backend's logo rules (https, public host, no port) so the
  // later POST /companies never 422s on it.
  try {
    const resolved = new URL(raw, base)
    if (
      resolved.protocol === "https:" &&
      resolved.port === "" &&
      isSafePublicHost(resolved.hostname) &&
      resolved.href.length <= 2048
    ) {
      return resolved.href
    }
  } catch {
    // fall through
  }
  return null
}

async function pickSiteIcon(html: string, finalUrl: URL): Promise<string | null> {
  type Candidate = { url: string; score: number }
  const candidates: Candidate[] = []

  for (const tag of html.match(/<link\b[^>]*>/gi) ?? []) {
    const rel = tag.match(/rel=["']([^"']*)["']/i)?.[1]?.toLowerCase() ?? ""
    if (!/(^|\s)(icon|shortcut icon|apple-touch-icon(-precomposed)?)(\s|$)/.test(rel)) {
      continue
    }
    const href = tag.match(/href=["']([^"']*)["']/i)?.[1]
    if (!href) continue
    const url = sanitizeIconUrl(decodeEntities(href), finalUrl)
    if (!url) continue

    // Rank: apple-touch-icon (usually 180px) beats rel=icon beats shortcut;
    // within a rel, the biggest declared size wins.
    const relScore = rel.includes("apple-touch-icon") ? 3000 : rel === "icon" ? 2000 : 1000
    const sizes = tag.match(/sizes=["'](\d+)x\d+["']/i)?.[1]
    candidates.push({ url, score: relScore + Math.min(Number(sizes ?? 0), 999) })
  }

  if (candidates.length > 0) {
    candidates.sort((a, b) => b.score - a.score)
    return candidates[0].url
  }

  // No declared icon — probe the /favicon.ico convention.
  const fallback = `https://${finalUrl.hostname}/favicon.ico`
  try {
    const probe = await fetch(fallback, {
      method: "HEAD",
      signal: AbortSignal.timeout(4000),
      redirect: "follow",
      cache: "no-store",
    })
    if (probe.ok) return fallback
  } catch {
    // unreachable — no icon
  }
  return null
}

function suggestAliases({ title, domain }: { title: string; domain: string }): string[] {
  const suggestions: string[] = []
  const seen = new Set<string>()
  const titleKey = title.trim().toLowerCase()

  const push = (value: string) => {
    const alias = value.trim().slice(0, 50)
    const key = alias.toLowerCase()
    if (alias && key !== titleKey && !seen.has(key)) {
      seen.add(key)
      suggestions.push(alias)
    }
  }

  // "Acme — CRM for teams" → "Acme"
  const shortName = title.split(/[—–|:•·]/)[0]
  if (shortName && shortName.trim() !== title.trim()) push(shortName)

  // acme.com → "acme" + "Acme"
  const label = domain.split(".")[0]
  if (label && label.length >= 2) {
    push(label)
    push(label.charAt(0).toUpperCase() + label.slice(1))
  }

  return suggestions.slice(0, 5)
}
