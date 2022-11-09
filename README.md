# @marianmeres/parse-boolean

A little utility which parses any input to `boolean`. Note that **it does not always
simply convert** the input (as `!!val`) but rather adds more human-like touch to the
decision. In another words, it understands few english truthy-like words such as
`true`, `on`, `enabled`, `yes`, `y`, `ok` and `t`.

The truthy words dictionary can be globally extended to your own needs (e.g. to add words
in a different language).

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
parseBoolean('')      // false
parseBoolean('foo')   // false
parseBoolean('yEs')   // true
parseBoolean('ON')    // true
parseBoolean('{}')    // false
parseBoolean({})      // true
parseBoolean('-0.0')  // false
parseBoolean('NO')    // false
parseBoolean(NaN)     // false
parseBoolean(123)     // true
```

## Custom dictionary example

```javascript
parseBoolean('yo')  // false

// note, that the added words MUST be lowercased to work correctly
parseBoolean.truthy.push('yo')

parseBoolean('YO')  // true
```
