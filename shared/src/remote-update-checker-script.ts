/**
 * Generates a standalone Node script that:
 * - reads .skills-manifest.json (personal + project)
 * - checks GitHub for latest commit for each remoteSource (daily cooldown)
 * - prints reminder ONLY when updates are detected
 *
 * Note: this script is designed to be installed into user's ~/.claude/scripts
 * and executed by Claude Code SessionEnd hook (shell).
 */

export const REMOTE_UPDATE_CHECKER_VERSION = '2';
import path from 'path';
import os from 'os';

export function getRemoteUpdateCheckerScriptContents(): string {
  const version = REMOTE_UPDATE_CHECKER_VERSION;

  // Keep this as CommonJS for maximum compatibility with `node script.js`.
  return `#!/usr/bin/env node
/* remote-skill-update-checker v${version} */

const fs = require('fs');
const path = require('path');
const os = require('os');
const https = require('https');

const DEFAULT_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 1 day
const DEFAULT_TIMEOUT_MS = 10000; // 10 seconds

function parseArgs(argv) {
  const args = new Set(argv.slice(2));
  return {
    force: args.has('--force') || args.has('-f'),
    verbose: args.has('--verbose') || args.has('-v'),
  };
}

/**
 * Get GitHub token from environment for authenticated requests.
 * Authenticated requests have higher rate limits (5000 req/hour vs 60 req/hour).
 */
function getGithubToken() {
  return process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
}

function readJson(filePath) {
  try {
    if (!fs.existsSync(filePath)) return null;
    const txt = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(txt);
  } catch {
    return null;
  }
}

function writeJson(filePath, obj) {
  try {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(obj, null, 2), 'utf-8');
  } catch {
    // ignore
  }
}

function getManifestPaths() {
  const cwd = process.cwd();
  return Array.from(
    new Set([
      path.join(os.homedir(), '.claude', 'skills', '.skills-manifest.json'),
      path.join(cwd, '.claude', 'skills', '.skills-manifest.json'),
    ])
  );
}

function getRemoteSourcesFromManifest(manifest) {
  const skills = manifest && typeof manifest.skills === 'object' ? manifest.skills : {};
  const sources = [];
  for (const v of Object.values(skills || {})) {
    if (!v || typeof v !== 'object') continue;
    const s = v.source;
    if (typeof s === 'string' && s.trim()) sources.push(s.trim());
  }
  return Array.from(new Set(sources));
}

function parseRemoteSource(remoteSource) {
  const trimmed = String(remoteSource || '')
    .trim()
    .replace(/^https?:\\/\\/github\\.com\\//, '');
  const parts = trimmed.split('/').filter(Boolean);
  if (parts.length < 2) return null;
  const owner = parts[0];
  const repo = parts[1];
  const repoPath = parts.slice(2).join('/') || null;
  return { owner, repo, repoPath };
}

function buildCommitsUrl(remoteSource) {
  const parsed = parseRemoteSource(remoteSource);
  if (!parsed) return null;
  const base =
    'https://api.github.com/repos/' +
    encodeURIComponent(parsed.owner) +
    '/' +
    encodeURIComponent(parsed.repo) +
    '/commits?per_page=1';
  if (!parsed.repoPath) return base;
  return base + '&path=' + encodeURIComponent(parsed.repoPath);
}

function shouldSkipByCooldown(lastCheckedAtIso, now, cooldownMs) {
  if (!lastCheckedAtIso) return false;
  const last = new Date(lastCheckedAtIso);
  if (Number.isNaN(last.getTime())) return false;
  return now.getTime() - last.getTime() < cooldownMs;
}

/**
 * Fetch text from URL with timeout and optional GitHub token.
 * @param {string} url - URL to fetch
 * @param {object} options - Options
 * @param {number} [options.timeout=10000] - Timeout in milliseconds
 * @param {string} [options.githubToken] - GitHub token for authenticated requests
 * @returns {Promise<string>} Response text
 */
function fetchText(url, options = {}) {
  const timeout = options.timeout || DEFAULT_TIMEOUT_MS;
  const githubToken = options.githubToken || getGithubToken();

  return new Promise((resolve, reject) => {
    const headers = {
      'user-agent': 'claude-skills-remote-update-checker',
      accept: 'application/vnd.github+json',
    };

    // Add GitHub token if available (increases rate limit from 60 to 5000 req/hour)
    if (githubToken) {
      headers.authorization = 'Bearer ' + githubToken;
    }

    const req = https.request(
      url,
      {
        method: 'GET',
        headers: headers,
      },
      (res) => {
        let data = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          clearTimeout(timeoutId);
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            resolve(data);
          } else {
            reject(new Error('HTTP ' + (res.statusCode || 0)));
          }
        });
      }
    );

    // Timeout handler
    const timeoutId = setTimeout(() => {
      req.destroy();
      reject(new Error('Request timeout after ' + timeout + 'ms'));
    }, timeout);

    req.on('error', (err) => {
      clearTimeout(timeoutId);
      reject(err);
    });

    req.end();
  });
}

function extractLatestSha(jsonText) {
  try {
    const data = JSON.parse(jsonText);
    if (Array.isArray(data) && data[0] && typeof data[0] === 'object' && typeof data[0].sha === 'string') {
      return data[0].sha || null;
    }
    return null;
  } catch {
    return null;
  }
}

async function main() {
  const { force, verbose } = parseArgs(process.argv);
  const now = new Date();
  const cooldownMs = DEFAULT_COOLDOWN_MS;
  const githubToken = getGithubToken();

  const manifestPaths = getManifestPaths();
  const updates = [];

  for (const manifestPath of manifestPaths) {
    const manifest = readJson(manifestPath) || {};
    const sources = getRemoteSourcesFromManifest(manifest);
    if (!sources.length) continue;

    manifest.remoteCache = manifest.remoteCache && typeof manifest.remoteCache === 'object' ? manifest.remoteCache : {};

    for (const remoteSource of sources) {
      const prevEntry = manifest.remoteCache[remoteSource] || {};
      const prevSha = prevEntry.lastSeenSha || null;

      const url = buildCommitsUrl(remoteSource);
      if (!url) continue;

      if (!force && shouldSkipByCooldown(prevEntry.lastCheckedAt, now, cooldownMs)) {
        continue;
      }

      try {
        const text = await fetchText(url, {
          timeout: DEFAULT_TIMEOUT_MS,
          githubToken: githubToken,
        });
        const latestSha = extractLatestSha(text);

        manifest.remoteCache[remoteSource] = {
          ...prevEntry,
          lastCheckedAt: now.toISOString(),
          ...(latestSha ? { lastSeenSha: latestSha } : {}),
        };
        writeJson(manifestPath, manifest);

        // Baseline: first time seeing sha => do not notify
        if (!prevSha && latestSha) continue;

        if (prevSha && latestSha && prevSha !== latestSha) {
          updates.push({ remoteSource, prevSha, latestSha });
        }
      } catch (e) {
        manifest.remoteCache[remoteSource] = {
          ...prevEntry,
          lastCheckedAt: now.toISOString(),
        };
        writeJson(manifestPath, manifest);
        if (verbose) {
          console.log('[remote-skill-check] error', remoteSource, String(e && e.message ? e.message : e));
        }
      }
    }
  }

  if (updates.length > 0) {
    console.log('\\n📡 检测到远程 skill 有更新：');
    for (const u of updates) {
      console.log('  -', u.remoteSource);
      console.log('    ', (u.prevSha || '').slice(0, 7), '->', (u.latestSha || '').slice(0, 7));
    }
    console.log('\\n💡 建议重新安装对应 skill 以拉取最新版本（remoteSource 模式不会自动更新）。\\n');
    process.exitCode = 0;
  }
}

main().catch(() => {
  // ignore
});
`;
}

export function getRemoteUpdateCheckerScriptInstallPath(): string {
  const scriptsDir = path.join(os.homedir(), '.claude', 'scripts');
  return path.join(scriptsDir, 'remote-skill-update-check.js');
}

