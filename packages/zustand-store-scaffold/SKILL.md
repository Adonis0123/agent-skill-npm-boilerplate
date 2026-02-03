---
name: zustand-store-scaffold
description: "Scaffold Zustand stores quickly using this repo's patterns. Use when creating or updating Zustand stores, contexts, providers, or slice-based core stores (createStore + immer, createCoreSlice), especially under web/src/pages/_components/**/store and packages/ag-ui-view/**/store."
---

# Zustand Store Scaffold

## Quick Start
- Run `python3 /home/adonis/.codex/skills/zustand-store-scaffold/scripts/scaffold_zustand_store.py --pattern web --name ToolList --path web/src/pages/_components/ToolList/store`
- Run `python3 /home/adonis/.codex/skills/zustand-store-scaffold/scripts/scaffold_zustand_store.py --pattern core --name CoreAgent --path packages/ag-ui-view/src/core/helpers/isomorphic/store`
- Add `--force` to overwrite existing files.

## Choose Pattern
- Use `web` for component-level stores with `index.ts`, `context.ts`, `provider.tsx`.
- Use `core` for slice-based stores with `index.ts` and `slices/core.ts`.

## Use Generator
- Pass `--name` as PascalCase.
- Pass `--path` to the target store folder.
- Avoid overwriting unless you intend to regenerate files.

## Customize Output
- Define state and actions in the generated interfaces.
- Update `initialState` to include required fields.
- In web stores, update `{{StoreName}}Props` or replace with component props if needed.
- In core stores, expand `{{StoreName}}SliceState` and `{{StoreName}}SliceActions`.

## References
- Read `references/store-patterns.md` for repo-specific examples.
