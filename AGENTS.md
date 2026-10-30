# @marianmeres/parse-boolean — Agent Guide

## Quick Reference

- **What**: `parseBoolean(value, { strict? })` — any value to `boolean`; strings parsed
  deliberately (finite numerics, extensible truthy/falsy dictionaries, case-insensitive,
  trimmed). Plus a `parse-boolean` CLI. Zero runtime dependencies.
- **Stack**: TypeScript (erasable-only), Node LTS (`.node-version`), pnpm, `node:test`,
  Biome.
- **Install**: `pnpm install` | **Test**: `pnpm test` | **Check all**: `pnpm run ci` |
  **Build**: `pnpm run build`
- **Distribution**: one source, two registries. npm gets `dist/` (ESM + `.d.ts`, the
  `parse-boolean` bin); JSR (`jsr.json`) gets the library source only, for the Deno
  consumers that still import it via `jsr:`.

## Project Structure

```
src/index.ts                 package entry (npm "exports" + JSR "exports"); re-exports parse-boolean.ts
src/parse-boolean.ts         the library: parseBoolean, createParseBoolean, types
src/cli.ts                   CLI: main(argv), node:util parseArgs; npm only (excluded from JSR)
src/bin.ts                   npm `bin` entry; shebang; calls main() unconditionally
tests/parse-boolean.test.ts  library suite (also run on Deno by `test:deno`)
tests/cli.e2e.test.ts        spawns `node src/bin.ts`; stdout / stderr / exit codes
jsr.json                     JSR name / exports / include; no version (set at publish)
dist/                        `tsc -p tsconfig.build.json` output; gitignored; all npm gets
tmp/                         scratch, gitignored
```

## Critical Conventions

1. **Runtime policy**: Node at the keyboard and in production, npm as the registry. No
   `Deno.*`, `Bun.*`, `jsr:` or `npm:` specifiers, no `@std/*`. The library uses no
   runtime APIs at all (it also runs in browsers); `node:*` only in `cli.ts` / `bin.ts`,
   imported explicitly. Deno is a _consumer_ runtime (JSR), not a dev runtime.
2. **Global state is deliberate**: the default `parseBoolean` lives on `globalThis` under
   `Symbol.for("@marianmeres/parse-boolean")`, so bundler-duplicated copies share the
   dictionaries. `createParseBoolean()` is the isolated alternative; the CLI uses it.
3. **CLI contract** (keep `USAGE`, README "CLI" and `tests/cli.e2e.test.ts` in step):
   stdout `true`/`false`; exit 0 true, 1 false, 2 invalid args or strict-mode rejection;
   errors on stderr only. `main()` sets `process.exitCode`, never calls `process.exit`.
4. **Erasable TypeScript**: no `enum`, `namespace`, constructor parameter properties;
   `import type` for types; explicit `.ts` import extensions. `pnpm run typecheck` is the
   only type gate. Every export keeps an explicit type (JSR slow-types check).
5. **Formatting**: Biome (tabs, 4 wide, 90 cols, double quotes; manifests 2 spaces).
   `pnpm run format` before committing; `pnpm run lint` is the read-only check CI runs.
   `markdown.formatter.formatEmbeds: false` keeps README code blocks as written: the
   examples rely on aligned `// true` / `// false` comment columns.
6. **Versioning / releasing** (human action): `package.json` is the manifest of record;
   `jsr.json` has no `version`. `pnpm run rp` / `rpm` = `@marianmeres/release` via npx
   (bump, commit, tag, push), then `pnpm publish` (`prepublishOnly`: `ci` + `build`),
   then `publish:jsr` (`test:deno` + `deno publish --no-check --set-version`).

## Before Making Changes

- [ ] Library change: extend `tests/parse-boolean.test.ts`, update README "API"
- [ ] CLI change: `USAGE` in `src/cli.ts`, README "CLI" table, an e2e test
- [ ] `pnpm run ci`; `pnpm run test:deno` too when touching the library

## Documentation Index

- [README.md](./README.md) — human-facing docs (usage, CLI, API)
