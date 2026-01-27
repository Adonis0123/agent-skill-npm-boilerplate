import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildGithubCommitsUrl,
  checkRemoteSourceForUpdate,
  extractLatestShaFromGithubCommitsResponse,
  parseRemoteSource,
  shouldSkipByCooldown,
} from '../src/remote-update-check.js';

test('parseRemoteSource parses owner/repo/path', () => {
  assert.deepEqual(parseRemoteSource('vercel-labs/agent-skills/skills/react-best-practices'), {
    owner: 'vercel-labs',
    repo: 'agent-skills',
    repoPath: 'skills/react-best-practices',
  });
});

test('parseRemoteSource supports github.com URL prefix', () => {
  assert.deepEqual(parseRemoteSource('https://github.com/owner/repo/sub/dir'), {
    owner: 'owner',
    repo: 'repo',
    repoPath: 'sub/dir',
  });
});

test('buildGithubCommitsUrl includes path when provided', () => {
  const url = buildGithubCommitsUrl('owner/repo/a/b');
  assert.ok(url);
  assert.match(url!, /^https:\/\/api\.github\.com\/repos\/owner\/repo\/commits\?per_page=1&path=/);
});

test('shouldSkipByCooldown obeys cooldown', () => {
  const now = new Date('2026-01-01T00:00:00.000Z');
  const last = new Date('2025-12-31T23:59:30.000Z').toISOString();
  assert.equal(shouldSkipByCooldown(last, now, 60_000), true);
  assert.equal(shouldSkipByCooldown(last, now, 10_000), false);
});

test('extractLatestShaFromGithubCommitsResponse extracts sha', () => {
  const sha = extractLatestShaFromGithubCommitsResponse(JSON.stringify([{ sha: 'abc123' }]));
  assert.equal(sha, 'abc123');
});

test('checkRemoteSourceForUpdate sets baseline without notifying', async () => {
  const remoteSource = 'owner/repo/path';
  const fetchText = async () => JSON.stringify([{ sha: 'aaa' }]);

  const { result, updatedManifest } = await checkRemoteSourceForUpdate({
    remoteSource,
    manifest: {},
    fetchText,
    now: new Date('2026-01-01T00:00:00.000Z'),
    force: true,
  });

  assert.equal(result.hasUpdate, false);
  assert.equal(result.latestSha, 'aaa');
  assert.equal(updatedManifest.remoteCache?.[remoteSource]?.lastSeenSha, 'aaa');
});

test('checkRemoteSourceForUpdate notifies only when sha changes', async () => {
  const remoteSource = 'owner/repo/path';
  const manifest = {
    remoteCache: {
      [remoteSource]: { lastSeenSha: 'aaa', lastCheckedAt: '2025-12-31T00:00:00.000Z' },
    },
  };

  const fetchText = async () => JSON.stringify([{ sha: 'bbb' }]);

  const { result, updatedManifest } = await checkRemoteSourceForUpdate({
    remoteSource,
    manifest,
    fetchText,
    now: new Date('2026-01-01T00:00:00.000Z'),
    force: true,
  });

  assert.equal(result.hasUpdate, true);
  assert.equal(result.cachedSha, 'aaa');
  assert.equal(result.latestSha, 'bbb');
  assert.equal(updatedManifest.remoteCache?.[remoteSource]?.lastSeenSha, 'bbb');
});

test('checkRemoteSourceForUpdate respects cooldown when not forced', async () => {
  const remoteSource = 'owner/repo/path';
  const manifest = {
    remoteCache: {
      [remoteSource]: { lastSeenSha: 'aaa', lastCheckedAt: '2026-01-01T00:00:00.000Z' },
    },
  };

  let called = 0;
  const fetchText = async () => {
    called += 1;
    return JSON.stringify([{ sha: 'bbb' }]);
  };

  const { result } = await checkRemoteSourceForUpdate({
    remoteSource,
    manifest,
    fetchText,
    now: new Date('2026-01-01T00:10:00.000Z'),
    cooldownMs: 24 * 60 * 60 * 1000,
    force: false,
  });

  assert.equal(result.skippedByCooldown, true);
  assert.equal(called, 0);
});

test('checkRemoteSourceForUpdate passes timeout to fetchText', async () => {
  const remoteSource = 'owner/repo/path';
  let receivedTimeout: number | undefined;

  const fetchText = async (_url: string, init?: { timeout?: number }) => {
    receivedTimeout = init?.timeout;
    return JSON.stringify([{ sha: 'aaa' }]);
  };

  await checkRemoteSourceForUpdate({
    remoteSource,
    manifest: {},
    fetchText,
    now: new Date('2026-01-01T00:00:00.000Z'),
    force: true,
    timeout: 5000,
  });

  assert.equal(receivedTimeout, 5000);
});

test('checkRemoteSourceForUpdate passes GitHub token in headers', async () => {
  const remoteSource = 'owner/repo/path';
  let receivedHeaders: Record<string, string> | undefined;

  const fetchText = async (_url: string, init?: { headers?: Record<string, string> }) => {
    receivedHeaders = init?.headers;
    return JSON.stringify([{ sha: 'aaa' }]);
  };

  await checkRemoteSourceForUpdate({
    remoteSource,
    manifest: {},
    fetchText,
    now: new Date('2026-01-01T00:00:00.000Z'),
    force: true,
    githubToken: 'ghp_test_token',
  });

  assert.equal(receivedHeaders?.authorization, 'Bearer ghp_test_token');
});

test('checkRemoteSourceForUpdate handles timeout errors gracefully', async () => {
  const remoteSource = 'owner/repo/path';

  const fetchText = async () => {
    throw new Error('Request timeout after 10000ms');
  };

  const { result, updatedManifest } = await checkRemoteSourceForUpdate({
    remoteSource,
    manifest: {},
    fetchText,
    now: new Date('2026-01-01T00:00:00.000Z'),
    force: true,
    timeout: 10000,
  });

  assert.equal(result.hasUpdate, false);
  assert.equal(result.error, 'Request timeout after 10000ms');
  assert.ok(updatedManifest.remoteCache?.[remoteSource]?.lastCheckedAt);
});

