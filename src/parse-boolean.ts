/** Default string values considered truthy (case-insensitive). */
const _defaults = ["yes", "y", "true", "t", "ok", "on", "enable", "enabled"];

/**
 * Global registry key for shared state across module instances.
 * Using Symbol.for() ensures the same symbol is used even if the module
 * is duplicated by bundlers or multiple versions coexist.
 */
const GLOBAL_KEY = Symbol.for("@marianmeres/parse-boolean");

/**
 * Global state object storing the truthy dictionary.
 * Attached to globalThis to ensure state is shared across all imports,
 * preventing issues with duplicate module instances.
 */
// deno-lint-ignore no-explicit-any
const GLOBAL = ((globalThis as any)[GLOBAL_KEY] ??= {
	_truthy: new Set(_defaults),
});

/**
 * Parses any input value to a boolean.
 *
 * For non-string values, uses standard truthy/falsy JavaScript conversion (!!val).
 * For strings, applies special parsing rules:
 * - Numeric strings are parsed as numbers and then converted (zero is false)
 * - Specific truthy strings: "true", "t", "yes", "y", "on", "ok", "enable", "enabled"
 * - All other strings are considered falsy
 * - Case insensitive and trimmed
 *
 * @param val - The value to parse (can be any type)
 * @returns The parsed boolean value
 *
 * @example
 * ```ts
 * parseBoolean('yes');     // true
 * parseBoolean('ON');      // true
 * parseBoolean('1');       // true
 * parseBoolean('');        // false
 * parseBoolean('foo');     // false
 * parseBoolean('-0.0');    // false
 * parseBoolean({});        // true (non-string, truthy object)
 * parseBoolean(NaN);       // false (non-string, falsy value)
 * ```
 */
export function parseBoolean(val: unknown): boolean {
	// non-strings
	if (typeof val !== "string") return !!val;

	// maybe numeric string?
	const num = parseFloat(val);
	if (!Number.isNaN(num)) return !!num;

	return GLOBAL._truthy.has(val.toLowerCase().trim());
}

/**
 * Adds a custom string value to the truthy dictionary.
 * The value will be normalized (lowercased and trimmed) before being added.
 *
 * @param v - The string value to add to the truthy dictionary
 *
 * @example
 * ```ts
 * parseBoolean('custom');           // false
 * parseBoolean.addTruthy('custom');
 * parseBoolean('CUSTOM');           // true (case insensitive)
 * ```
 */
parseBoolean.addTruthy = (v: string): Set<string> =>
	GLOBAL._truthy.add(`${v}`.toLowerCase().trim());

/**
 * Resets the truthy dictionary to its default values.
 * Removes all custom values added via addTruthy().
 *
 * @example
 * ```ts
 * parseBoolean.addTruthy('custom');
 * parseBoolean('custom');  // true
 * parseBoolean.reset();
 * parseBoolean('custom');  // false
 * ```
 */
parseBoolean.reset = (): Set<string> => {
	GLOBAL._truthy = new Set(_defaults);
	return GLOBAL._truthy;
};
