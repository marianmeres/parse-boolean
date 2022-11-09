# @marianmeres/parse-boolean

A little utility which parses any input to `boolean`. Note that **it does not always
simply convert** the input (as `!!val`) but rather adds more human-like touch to the
decision. Put it in another words, it understands few english truthy-like words such as
`true`, `on`, `enabled`, `yes`, `y`, `ok` and `t`.

Mainly usefull for string inputs conversion (e.g. text config files, form values, ...)

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
