# @marianmeres/parse-boolean

A little utility which parses any input to `boolean`. Almost as simple as `(v) => !!v`
except that it differently handles strings.

Only truthy strings are `true`, `t`, `yes`, `y`, `on`, `ok`, `enable`, `enabled` and
numeric ones except zero. All others are considered falsey. This dictionary can be globally
extended to your own needs. Case insensitive.

Mainly useful for string-to-boolean conversion from text config files, html form
values, or similar...

## Install

```shell
$ npm i @marianmeres/parse-boolean
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

## Custom dictionary example

```javascript
parseBoolean('yo'); // false
parseBoolean.addTruthy('yo');
parseBoolean('YO'); // true
```
