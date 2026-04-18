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
deno add jsr:@marianmeres/parse-boolean
```
```sh
npm install @marianmeres/parse-boolean
```

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

## Package Identity

- **Name:** @marianmeres/parse-boolean
- **Author:** Marian Meres
- **Repository:** https://github.com/marianmeres/parse-boolean
- **License:** MIT
