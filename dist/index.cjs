'use strict';

const _defaults = ['yes', 'y', 'true', 't', 'ok', 'on', 'enabled'];
let _truthy = new Set(_defaults);
const parseBoolean = (val) => {
    // non-strings
    if (typeof val !== 'string')
        return !!val;
    // maybe numeric string?
    const num = parseFloat(val);
    if (!isNaN(num))
        return !!num;
    return _truthy.has(val.toLowerCase().trim());
};
//
parseBoolean.addTruthy = (v) => _truthy.add(`${v}`.toLowerCase().trim());
//
parseBoolean.reset = () => (_truthy = new Set(_defaults));

exports.parseBoolean = parseBoolean;
