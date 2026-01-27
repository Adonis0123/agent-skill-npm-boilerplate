import fs from 'fs';
import path from 'path';
import os from 'os';

export interface ParsedRemoteSource {
  owner: string;
  repo: string;
  /** Optional sub-path within repo (no leading slash) */
  repoPath?: string;
}

export interface RemoteCacheEntry {
  /** ISO string */
  lastCheckedAt?: string;
  /** Latest seen commit SHA for this path */
  lastSeenSha?: string;
}

export interface SkillsManifest {
  skills?: Record<string, unknown>;
  remoteCache?: Record<string, RemoteCacheEntry>;
}

export interface RemoteUpdateCheckResult {
  remoteSource: string;
  latestSha?: string;
  cachedSha?: string;
  hasUpdate: boolean;
  skippedByCooldown: boolean;
  error?: string;
}

export type FetchText = (
  url: string,
  init?: { headers?: Record<string, string>; timeout?: number }
) => Promise<string>;

/**
 * Get GitHub token from environment variable for authenticated requests.
 * Authenticated requests have higher rate limits (5000 req/hour vs 60 req/hour).
 *
 * Environment variables checked (in order):
 * - GITHUB_TOKEN
 * - GH_TOKEN
 */
export function getGithubToken(): string | undefined {
  return process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
}

export function parseRemoteSource(remoteSource: string): ParsedRemoteSource | null {
  const trimmed = remoteSource.trim().replace(/^https?:\/\/github\.com\//, '');
  const parts = trimmed.split('/').filter(Boolean);
  if (parts.length < 2) {
    return null;
  }
  const [owner, repo, ...rest] = parts;
  const repoPath = rest.length ? rest.join('/') : undefined;
  return { owner, repo, repoPath };
}

export function buildGithubCommitsUrl(remoteSource: string): string | null {
  const parsed = parseRemoteSource(remoteSource);
  if (!parsed) return null;
  const base = `https://api.github.com/repos/${encodeURIComponent(parsed.owner)}/${encodeURIComponent(
    parsed.repo
  )}/commits?per_page=1`;
  if (!parsed.repoPath) return base;
  return `${base}&path=${encodeURIComponent(parsed.repoPath)}`;
}

export function readManifest(manifestPath: string): SkillsManifest {
  if (!fs.existsSync(manifestPath)) {
    return {};
  }
  try {
    return JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  } catch {
    return {};
  }
}

export function writeManifest(manifestPath: string, manifest: SkillsManifest): void {
  const dir = path.dirname(manifestPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
}

export function getDefaultManifestPaths(cwd: string = process.cwd()): string[] {
  const paths: string[] = [];

  // Personal skills
  paths.push(path.join(os.homedir(), '.claude', 'skills', '.skills-manifest.json'));

  // Project skills (best-effort)
  paths.push(path.join(cwd, '.claude', 'skills', '.skills-manifest.json'));

  return Array.from(new Set(paths));
}

export function getRemoteSourcesFromManifest(manifest: SkillsManifest): string[] {
  const skills = manifest.skills && typeof manifest.skills === 'object' ? manifest.skills : {};
  const sources: string[] = [];

  for (const value of Object.values(skills)) {
    if (!value || typeof value !== 'object') continue;
    const source = (value as any).source;
    if (typeof source === 'string' && source.trim()) {
      sources.push(source.trim());
    }
  }

  return Array.from(new Set(sources));
}

export function shouldSkipByCooldown(
  lastCheckedAtIso: string | undefined,
  now: Date,
  cooldownMs: number
): boolean {
  if (!lastCheckedAtIso) return false;
  const last = new Date(lastCheckedAtIso);
  if (Number.isNaN(last.getTime())) return false;
  return now.getTime() - last.getTime() < cooldownMs;
}

export function extractLatestShaFromGithubCommitsResponse(jsonText: string): string | null {
  try {
    const data = JSON.parse(jsonText);
    if (Array.isArray(data) && data.length > 0 && data[0] && typeof data[0] === 'object') {
      const sha = (data[0] as any).sha;
      return typeof sha === 'string' && sha ? sha : null;
    }
    return null;
  } catch {
    return null;
  }
}

export async function checkRemoteSourceForUpdate(options: {
  remoteSource: string;
  manifest: SkillsManifest;
  now?: Date;
  cooldownMs?: number;
  force?: boolean;
  fetchText: FetchText;
  /** Request timeout in milliseconds (default: 10000ms = 10s) */
  timeout?: number;
  /** GitHub token for authenticated requests (optional, increases rate limit) */
  githubToken?: string;
}): Promise<{ result: RemoteUpdateCheckResult; updatedManifest: SkillsManifest }> {
  const {
    remoteSource,
    manifest,
    now = new Date(),
    cooldownMs = 24 * 60 * 60 * 1000,
    force = false,
    fetchText,
    timeout = 10000,
    githubToken,
  } = options;

  const updatedManifest: SkillsManifest = {
    ...manifest,
    remoteCache: { ...(manifest.remoteCache || {}) },
  };

  const cacheEntry = updatedManifest.remoteCache?.[remoteSource] || {};
  const cachedSha = cacheEntry.lastSeenSha;

  if (!force && shouldSkipByCooldown(cacheEntry.lastCheckedAt, now, cooldownMs)) {
    return {
      result: {
        remoteSource,
        cachedSha,
        hasUpdate: false,
        skippedByCooldown: true,
      },
      updatedManifest,
    };
  }

  const url = buildGithubCommitsUrl(remoteSource);
  if (!url) {
    return {
      result: {
        remoteSource,
        cachedSha,
        hasUpdate: false,
        skippedByCooldown: false,
        error: 'Invalid remoteSource format',
      },
      updatedManifest,
    };
  }

  try {
    const headers: Record<string, string> = {
      'user-agent': 'claude-skills-remote-update-checker',
      accept: 'application/vnd.github+json',
    };

    // Add GitHub token if provided (increases rate limit from 60 to 5000 req/hour)
    if (githubToken) {
      headers.authorization = `Bearer ${githubToken}`;
    }

    const text = await fetchText(url, { headers, timeout });
    const latestSha = extractLatestShaFromGithubCommitsResponse(text);

    // Update cache timestamps even if SHA can't be extracted (to avoid hammering API)
    updatedManifest.remoteCache![remoteSource] = {
      ...cacheEntry,
      lastCheckedAt: now.toISOString(),
      ...(latestSha ? { lastSeenSha: latestSha } : {}),
    };

    // Baseline: if no cached SHA yet, set it but do not notify
    if (!cachedSha && latestSha) {
      return {
        result: {
          remoteSource,
          latestSha,
          cachedSha,
          hasUpdate: false,
          skippedByCooldown: false,
        },
        updatedManifest,
      };
    }

    const hasUpdate = Boolean(cachedSha && latestSha && cachedSha !== latestSha);

    return {
      result: {
        remoteSource,
        latestSha: latestSha || undefined,
        cachedSha,
        hasUpdate,
        skippedByCooldown: false,
      },
      updatedManifest,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    updatedManifest.remoteCache![remoteSource] = {
      ...cacheEntry,
      lastCheckedAt: now.toISOString(),
    };
    return {
      result: {
        remoteSource,
        cachedSha,
        hasUpdate: false,
        skippedByCooldown: false,
        error: message,
      },
      updatedManifest,
    };
  }
}

