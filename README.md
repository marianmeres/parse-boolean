# @marianmeres/parse-boolean

[![NPM version](https://img.shields.io/npm/v/@marianmeres/parse-boolean.svg)](https://www.npmjs.com/package/@marianmeres/parse-boolean)
[![JSR version](https://jsr.io/badges/@marianmeres/parse-boolean)](https://jsr.io/@marianmeres/parse-boolean)

A little utility which parses any input to `boolean`. Almost as simple as `(v) => !!v`
except that it handles strings deliberately.

Truthy strings are `true`, `t`, `yes`, `y`, `on`, `ok`, `enable`, `enabled` and
finite non-zero numeric strings. All other strings are considered falsy. The truthy
dictionary can be extended. Case insensitive, trimmed.

Mainly useful for string-to-boolean conversion from text config files, html form
values, or similar...

## Install

```sh
npm install @marianmeres/parse-boolean    # or pnpm add
deno add jsr:@marianmeres/parse-boolean   # Deno
```

Zero dependencies. Runs anywhere (Node, browsers, Deno). The [CLI](#cli) needs Node
(>= 24.12).

## Usage

```typescript
parseBoolean(value: unknown, options?: { strict?: boolean }): boolean
```

## Examples

```javascript
parseBoolean('yEs');      // true
parseBoolean('ON');       // true
parseBoolean('1');        // true
parseBoolean('1.5');      // true
parseBoolean('');         // false
parseBoolean('foo');      // false
parseBoolean('-0.0');     // false
parseBoolean('{}');       // false
parseBoolean('123abc');   // false (not a valid number)
parseBoolean('Infinity'); // false (not a finite number)
// all non-strings are cast as !!v
parseBoolean({});         // true
parseBoolean(NaN);        // false
parseBoolean(123);        // true
```

## Custom dictionary

Extend the truthy dictionary with your own values:

```javascript
parseBoolean('yo'); // false
parseBoolean.addTruthy('yo');
parseBoolean('YO'); // true (case insensitive)

parseBoolean.removeTruthy('yo');
parseBoolean('yo'); // false again
```

Reset all custom additions back to defaults:

```javascript
parseBoolean.addTruthy('custom');
parseBoolean('custom'); // true
parseBoolean.reset();
parseBoolean('custom'); // false
parseBoolean('yes');    // true (default values still work)
```

## Strict mode

In strict mode `parseBoolean` throws `TypeError` when it sees a string that is
neither numeric nor present in the truthy or falsy dictionaries. Useful for
config parsing, where an unrecognized value should be an error, not silently
coerced to `false`.

```javascript
parseBoolean('yes',   { strict: true }); // true
parseBoolean('no',    { strict: true }); // false
parseBoolean('maybe', { strict: true }); // throws TypeError
```

Default falsy dictionary: `false`, `f`, `no`, `n`, `off`, `disable`, `disabled`.
Extend it the same way as the truthy one:

```javascript
parseBoolean.addFalsy('nope');
parseBoolean('nope', { strict: true }); // false

parseBoolean.removeFalsy('nope');
```

## Isolated instances

The default `parseBoolean` shares its dictionary via `globalThis` (so bundler
duplicates stay in sync). If you need an isolated parser — e.g. different parts
of an app using different vocabularies — use `createParseBoolean()`:

```javascript
import { createParseBoolean } from '@marianmeres/parse-boolean';

const parse = createParseBoolean();
parse.addTruthy('si');
parse('si');         // true
parseBoolean('si');  // false (global is untouched)
```

## CLI

The npm package also ships a `parse-boolean` binary. It prints `true` or `false`, and
its exit code carries the same answer, like `grep`: **0 = true, 1 = false, 2 = error**
(invalid arguments, or an unrecognized value with `--strict`). So it works directly in
shell conditions:

```sh
npx @marianmeres/parse-boolean yes        # prints "true", exit 0

if parse-boolean -q -- "$DEBUG"; then
	echo "debug on"
fi

parse-boolean --strict -- "$FEATURE_FLAG" # exit 2 on a typo like "ture"
parse-boolean --truthy si -- "$ACTIVO"    # extend the dictionary for this call
```

| Option            | Does                                                                     |
| ----------------- | ------------------------------------------------------------------------ |
| `-s`, `--strict`  | exit 2 on a string that is neither numeric nor in either dictionary      |
| `-q`, `--quiet`   | print nothing; the exit code is the answer                               |
| `--truthy <word>` | add a word to the truthy dictionary (repeatable)                         |
| `--falsy <word>`  | add a word to the falsy dictionary (repeatable; matters with `--strict`) |
| `--version`       | print the version                                                        |
| `-h`, `--help`    | show usage                                                               |

Put the value after `--`. A value starting with `-` (such as `-1`) is otherwise read as
an option, which is exactly what an environment variable can contain.

Note the exit code under `set -e`: `v=$(parse-boolean no)` exits the script, as `grep`
would. Use `v=$(parse-boolean no || true)`, or the exit code alone.

## API

### `parseBoolean(value: unknown, options?: { strict?: boolean }): boolean`

Parses any input value to a boolean.

- **Non-string values**: standard JavaScript truthy/falsy conversion (`!!value`).
- **Numeric strings**: finite decimals only (integers, floats, scientific notation).
  Zero is false, non-zero is true. Partial numerics like `"123abc"` and non-finite
  values like `"Infinity"` / `"NaN"` fall through to the dictionary.
- **Truthy dictionary**: `"true"`, `"t"`, `"yes"`, `"y"`, `"on"`, `"ok"`,
  `"enable"`, `"enabled"` (case insensitive, trimmed, extensible).
- **Other strings**: falsy in default mode; throw `TypeError` in strict mode
  unless listed in the falsy dictionary.

### `parseBoolean.addTruthy(value: string): void`

Adds a string to the truthy dictionary. Normalized (lowercased and trimmed).

### `parseBoolean.removeTruthy(value: string): void`

Removes a string from the truthy dictionary. Normalized.

### `parseBoolean.addFalsy(value: string): void`

Adds a string to the falsy dictionary (used only by strict mode). Normalized.

### `parseBoolean.removeFalsy(value: string): void`

Removes a string from the falsy dictionary. Normalized.

### `parseBoolean.reset(): void`

Resets both truthy and falsy dictionaries to their defaults.

### `createParseBoolean(): ParseBoolean`

Returns a fresh `parseBoolean` instance with its own isolated dictionaries.
Has the same surface as the global `parseBoolean`.

## Development

Node LTS (`.node-version`), pnpm, Biome, `node:test`. The source is erasable-only
TypeScript that Node runs directly; `dist/` is built only for publishing.

| Command                             | Does                                               |
| ----------------------------------- | -------------------------------------------------- |
| `pnpm install`                      | installs the dev tooling                           |
| `pnpm test` / `pnpm run test:watch` | `node --test` over `tests/**/*.test.ts`            |
| `pnpm run typecheck`                | `tsc --noEmit` over `src` and `tests`              |
| `pnpm run lint` / `pnpm run format` | `biome check .` read-only / with `--write`         |
| `pnpm run ci`                       | typecheck + lint + test, what CI runs              |
| `pnpm run build`                    | `tsc -p tsconfig.build.json` → `dist/`             |
| `pnpm run rp` / `pnpm run rpm`      | patch / minor release, then publish to npm and JSR |

## Package Identity

- **Name:** @marianmeres/parse-boolean
- **Author:** Marian Meres
- **Repository:** https://github.com/marianmeres/parse-boolean
- **License:** MIT
