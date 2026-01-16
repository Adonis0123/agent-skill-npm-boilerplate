# Skill Package Creation Checklist

Use this checklist to verify each step when creating a new skill package.

---

## Phase 1: Planning

- [ ] **Define skill purpose** - Clear understanding of what the skill does
- [ ] **Identify trigger phrases** - Specific phrases users would say
- [ ] **Choose mode** - Local (bundled) or Remote (fetch from upstream)
- [ ] **Plan resources** - Determine needed references/, src/, assets/

---

## Phase 2: Directory Structure

### Create Package Directory

```bash
mkdir -p packages/{{SKILL_NAME}}/{references,src}
```

### Verification

- [ ] Directory exists: `packages/{{SKILL_NAME}}/`
- [ ] Subdirectories created as needed: `references/`, `src/`

---

## Phase 3: Configuration Files

### .claude-skill.json

- [ ] File created: `packages/{{SKILL_NAME}}/.claude-skill.json`
- [ ] `name` field matches skill identifier
- [ ] `version` field set (start with `1.0.0`)
- [ ] `package` field matches npm package name
- [ ] `remoteSource` field set (if using remote mode)
- [ ] `files` mapping configured for extra files
- [ ] `targets.claude-code.enabled` is `true`
- [ ] `targets.cursor.enabled` is `true`

### package.json

- [ ] File created: `packages/{{SKILL_NAME}}/package.json`
- [ ] `name` is `@adonis0123/{{SKILL_NAME}}`
- [ ] `version` matches .claude-skill.json
- [ ] `description` is clear and descriptive
- [ ] `scripts.postinstall` is `node install-skill.js`
- [ ] `scripts.preuninstall` is `node uninstall-skill.js`
- [ ] `scripts.test` is configured
- [ ] `files` array includes all necessary files
- [ ] `repository.directory` points to correct path

---

## Phase 4: SKILL.md

### Frontmatter

- [ ] `name` field present
- [ ] `description` uses third person ("This skill should be used when...")
- [ ] `description` includes specific trigger phrases
- [ ] `version` field present

### Content

- [ ] Introduction explains skill purpose
- [ ] Core workflow documented
- [ ] Writing style is imperative (not second person)
- [ ] Body is under 2,000 words
- [ ] References to supporting files included
- [ ] Examples provided where helpful

---

## Phase 5: Sync and Build

### Run Sync Script

```bash
pnpm sync
```

### Verification

- [ ] Sync completed without errors
- [ ] `install-skill.js` generated in package directory
- [ ] `uninstall-skill.js` generated in package directory
- [ ] Package detected as correct mode (local/remote)

---

## Phase 6: Testing

### Run Package Test

```bash
cd packages/{{SKILL_NAME}} && npm test
```

### Verification

- [ ] Test passed without errors
- [ ] Skill installed to `.claude/skills/{{SKILL_NAME}}/`
- [ ] Skill installed to `.cursor/skills/{{SKILL_NAME}}/`
- [ ] SKILL.md copied correctly
- [ ] All configured files copied

### Run Full Test Suite

```bash
pnpm test:all
```

- [ ] All packages pass tests

### Clean Up Test Files

```bash
rm -rf packages/{{SKILL_NAME}}/.claude packages/{{SKILL_NAME}}/.cursor
```

---

## Phase 7: Pre-Publish Checklist

### Content Review

- [ ] SKILL.md content is accurate and helpful
- [ ] No placeholder text remaining ({{...}})
- [ ] All referenced files exist
- [ ] Examples are complete and working

### Package Review

- [ ] `files` in package.json includes all needed files
- [ ] No sensitive information in package
- [ ] README.md present (optional but recommended)

---

## Phase 8: Publishing

### Publish Package

```bash
# Interactive publish
pnpm publish

# Or direct publish
cd packages/{{SKILL_NAME}} && npm publish --access public
```

### Post-Publish Verification

- [ ] Package appears on npm registry
- [ ] Global install works: `npm install -g @adonis0123/{{SKILL_NAME}}`
- [ ] Skill installs to correct locations
- [ ] Skill triggers correctly in Claude Code

---

## Quick Commands Reference

| Step | Command |
|------|---------|
| Create directory | `mkdir -p packages/SKILL_NAME/{references,src}` |
| Sync scripts | `pnpm sync` |
| Test single package | `cd packages/SKILL_NAME && npm test` |
| Test all packages | `pnpm test:all` |
| Interactive publish | `pnpm publish` |
| Direct publish | `npm publish --access public` |

---

## Common Issues

### Issue: Sync script not generating files

**Check:**
- `.claude-skill.json` exists and is valid JSON
- Running from project root directory

### Issue: Test fails with "config not found"

**Check:**
- `.claude-skill.json` has correct structure
- `name` field is present

### Issue: Remote fetch fails

**Check:**
- `remoteSource` path is correct (degit format)
- Repository is public
- Network connectivity

### Issue: Files not copied during install

**Check:**
- `files` mapping in `.claude-skill.json` is correct
- Source files exist in package directory
- File paths are relative to package root

---

## Template Quick Start

To create a new skill quickly:

1. Copy an existing package as template:
   ```bash
   cp -r packages/weekly-report packages/NEW_SKILL_NAME
   ```

2. Update all configuration files with new skill name

3. Replace SKILL.md content

4. Run `pnpm sync && npm test`
