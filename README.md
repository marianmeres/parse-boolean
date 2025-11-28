# @marianmeres/parse-boolean

A little utility which parses any input to `boolean`. Almost as simple as `(v) => !!v`
except that it differently handles strings.

Only truthy strings are `true`, `t`, `yes`, `y`, `on`, `ok`, `enable`, `enabled` and
numeric ones except zero. All others are considered falsey. This dictionary can be globally
extended to your own needs. Case insensitive.

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
parseBoolean(value: any): boolean
```

## Examples

```javascript
parseBoolean('yEs'); // true
parseBoolean('ON'); // true
parseBoolean(''); // false
parseBoolean('foo'); // false
parseBoolean('-0.0'); // false
parseBoolean('{}'); // false
// all non-strings are casted as !!v
parseBoolean({}); // true
parseBoolean(NaN); // false
parseBoolean(123); // true
```

## Custom dictionary

You can extend the truthy dictionary with your own values:

```javascript
parseBoolean('yo'); // false
parseBoolean.addTruthy('yo');
parseBoolean('YO'); // true (case insensitive)
```

Reset the dictionary to remove all custom values:

```javascript
parseBoolean.addTruthy('custom');
parseBoolean('custom'); // true
parseBoolean.reset();
parseBoolean('custom'); // false
parseBoolean('yes'); // true (default values still work)
```

## API

### `parseBoolean(value: any): boolean`

Parses any input value to a boolean.

- **Non-string values**: Uses standard JavaScript truthy/falsy conversion (`!!value`)
- **Numeric strings**: Parsed as numbers (zero is false, non-zero is true)
- **String dictionary**: `"true"`, `"t"`, `"yes"`, `"y"`, `"on"`, `"ok"`, `"enable"`, `"enabled"` (case insensitive)
- **All other strings**: Considered falsy

### `parseBoolean.addTruthy(value: string): void`

Adds a custom string to the truthy dictionary. Values are normalized (lowercased and trimmed).

### `parseBoolean.reset(): void`

Resets the truthy dictionary to default values, removing all custom additions.
