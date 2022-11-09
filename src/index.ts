const _defaults = ['yes', 'y', 'true', 't', 'ok', 'on', 'enabled'];
let _truthy = new Set(_defaults);

export const parseBoolean = (val: any): boolean => {
	// non-strings
	if (typeof val !== 'string') return !!val;

	// maybe numeric string?
	const num = parseFloat(val);
	if (!isNaN(num)) return !!num;

	// prettier-ignore
	return _truthy.has(val.toLowerCase().trim());
};

// 
parseBoolean.addTruthy = (v: string) => _truthy.add(`${v}`.toLowerCase().trim());

//
parseBoolean.reset = () => (_truthy = new Set(_defaults));
