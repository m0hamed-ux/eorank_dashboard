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

  // og:image — absolutized, then held to the backend's logo rules (https,
  // public host, no port) so the later POST /companies never 422s on it.
  let image: string | null = null
  const rawImage =
    metaContent(html, "og:image") ?? metaContent(html, "twitter:image")
  if (rawImage) {
    try {
      const resolved = new URL(rawImage, finalUrl)
      if (
        resolved.protocol === "https:" &&
        resolved.port === "" &&
        isSafePublicHost(resolved.hostname) &&
        resolved.href.length <= 2048
      ) {
        image = resolved.href
      }
    } catch {
      image = null
    }
  }

  return { ok: true, title, description, image, domain }
}
