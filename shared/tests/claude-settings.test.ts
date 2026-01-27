import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

import { addClaudeHooks, readClaudeSettings, removeClaudeHooks } from '../src/claude-settings.js';
import type { ClaudeHooksConfig } from '../src/types.js';

function setupTempSettingsPath(t: { after: (fn: () => void) => void }): string {
  const originalEnv = process.env.CLAUDE_CODE_SETTINGS_PATH;
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'claude-settings-'));
  const settingsPath = path.join(dir, 'settings.json');

  process.env.CLAUDE_CODE_SETTINGS_PATH = settingsPath;

  t.after(() => {
    if (originalEnv === undefined) {
      delete process.env.CLAUDE_CODE_SETTINGS_PATH;
    } else {
      process.env.CLAUDE_CODE_SETTINGS_PATH = originalEnv;
    }
    try {
      fs.rmSync(dir, { recursive: true, force: true });
    } catch {
      // best-effort cleanup
    }
  });

  return settingsPath;
}

test('addClaudeHooks merges hooks under same matcher (does not skip)', (t) => {
  const settingsPath = setupTempSettingsPath(t);

  fs.mkdirSync(path.dirname(settingsPath), { recursive: true });
  fs.writeFileSync(
    settingsPath,
    JSON.stringify(
      {
        hooks: {
          SessionEnd: [
            {
              matcher: '*',
              hooks: [{ type: 'command', command: 'echo existing' }],
            },
          ],
        },
      },
      null,
      2
    ),
    'utf-8'
  );

  const modified = addClaudeHooks(
    {
      SessionEnd: [
        {
          matcher: '*',
          hooks: [{ type: 'command', command: 'node /tmp/remote-skill-update-check.js' }],
        },
      ],
    },
    'test-skill'
  );
  assert.equal(modified, true);

  const settings = readClaudeSettings() as any;
  assert.ok(settings.hooks);
  assert.equal(settings.hooks.SessionEnd.length, 1);
  assert.equal(settings.hooks.SessionEnd[0].matcher, '*');
  assert.equal(settings.hooks.SessionEnd[0].hooks.length, 2);
});

test('addClaudeHooks is idempotent (no duplicate hooks)', (t) => {
  setupTempSettingsPath(t);

  const hookConfig: ClaudeHooksConfig = {
    SessionEnd: [
      {
        matcher: '*',
        hooks: [{ type: 'command', command: 'node /tmp/remote-skill-update-check.js' }],
      },
    ],
  };

  const first = addClaudeHooks(hookConfig, 'test-skill');
  const second = addClaudeHooks(hookConfig, 'test-skill');

  assert.equal(first, true);
  assert.equal(second, false);

  const settings = readClaudeSettings() as any;
  assert.equal(settings.hooks.SessionEnd.length, 1);
  assert.equal(settings.hooks.SessionEnd[0].hooks.length, 1);
});

test('removeClaudeHooks removes only matching hook commands and preserves others', (t) => {
  const settingsPath = setupTempSettingsPath(t);

  fs.mkdirSync(path.dirname(settingsPath), { recursive: true });
  fs.writeFileSync(
    settingsPath,
    JSON.stringify(
      {
        hooks: {
          SessionEnd: [
            {
              matcher: '*',
              hooks: [
                { type: 'command', command: 'echo keep' },
                { type: 'command', command: 'node /tmp/remote-skill-update-check.js' },
              ],
            },
          ],
        },
      },
      null,
      2
    ),
    'utf-8'
  );

  const modified = removeClaudeHooks(
    {
      SessionEnd: [
        {
          matcher: '*',
          hooks: [{ type: 'command', command: 'node /tmp/remote-skill-update-check.js' }],
        },
      ],
    },
    'test-skill'
  );

  assert.equal(modified, true);

  const settings = readClaudeSettings() as any;
  assert.equal(settings.hooks.SessionEnd.length, 1);
  assert.equal(settings.hooks.SessionEnd[0].hooks.length, 1);
  assert.equal(settings.hooks.SessionEnd[0].hooks[0].command, 'echo keep');
});

test('addClaudeHooks normalizes legacy hook types and dedupes by command', (t) => {
  const settingsPath = setupTempSettingsPath(t);

  fs.mkdirSync(path.dirname(settingsPath), { recursive: true });
  fs.writeFileSync(
    settingsPath,
    JSON.stringify(
      {
        hooks: {
          SessionEnd: [
            {
              matcher: '*',
              hooks: [
                { type: 'shell', command: 'node /tmp/remote-skill-update-check.js' },
                { type: 'command', command: 'node /tmp/remote-skill-update-check.js' }
              ],
            },
          ],
        },
      },
      null,
      2
    ),
    'utf-8'
  );

  const modified = addClaudeHooks(
    {
      SessionEnd: [
        {
          matcher: '*',
          hooks: [{ type: 'command', command: 'node /tmp/remote-skill-update-check.js' }],
        },
      ],
    },
    'test-skill'
  );

  assert.equal(modified, true);

  const settings = readClaudeSettings() as any;
  assert.equal(settings.hooks.SessionEnd[0].hooks.length, 1);
  assert.equal(settings.hooks.SessionEnd[0].hooks[0].type, 'command');
  assert.equal(settings.hooks.SessionEnd[0].hooks[0].command, 'node /tmp/remote-skill-update-check.js');
});

