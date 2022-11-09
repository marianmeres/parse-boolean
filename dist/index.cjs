'use strict';

const parseBoolean = (val) => {
    // booleans
    if (typeof val === 'boolean')
        return val;
    // integers
    if (Number.isInteger(val))
        return val !== 0;
    // non-strings
    if (typeof val !== 'string')
        return !!val;
    // normalize string
    val = val.toLowerCase().trim();
    // maybe numeric string?
    const num = parseFloat(val);
    if (!isNaN(num))
        return num !== 0;
    // true only few whitelisted, all else false
    switch (val) {
        case 'yes':
        case 'y':
        case 'true':
        case 't': // postgresql-like boolean convention
        case 'ok':
        case 'on':
        case 'enabled':
            return true;
        default:
            return false;
    }
};

exports.parseBoolean = parseBoolean;
