/** Default string values considered truthy (case-insensitive). */
const _defaultTruthy = ["yes", "y", "true", "t", "ok", "on", "enable", "enabled"];

/** Default string values considered falsy (case-insensitive). Used only by strict mode. */
const _defaultFalsy = ["no", "n", "false", "f", "off", "disable", "disabled"];

/** Matches syntactically valid finite decimal numbers (no hex, no Infinity, no NaN). */
const NUMERIC_RE = /^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/;

/** Options for a single parse call. */
export interface ParseBooleanOptions {
	/**
	 * If true, throws TypeError for strings that are neither numeric nor
	 * recognized in the truthy/falsy dictionaries. Defaults to false.
	 */
	strict?: boolean;
}

/** The shape of a parseBoolean instance (both the global and factory-produced ones). */
export interface ParseBoolean {
	(val: unknown, options?: ParseBooleanOptions): boolean;
	addTruthy: (v: string) => void;
	removeTruthy: (v: string) => void;
	addFalsy: (v: string) => void;
	removeFalsy: (v: string) => void;
	reset: () => void;
}

function normalize(v: string): string {
	return v.toLowerCase().trim();
}

/**
 * Creates an isolated parseBoolean instance with its own truthy/falsy dictionaries.
 *
 * Useful when different parts of an application need different boolean vocabularies
 * and should not share state through the global instance.
 *
 * @example
 * ```ts
 * const parse = createParseBoolean();
 * parse.addTruthy("si");
 * parse("si"); // true
 * ```
 */
export function createParseBoolean(): ParseBoolean {
	let truthy = new Set(_defaultTruthy);
	let falsy = new Set(_defaultFalsy);

	const fn = ((val: unknown, options?: ParseBooleanOptions): boolean => {
		if (typeof val !== "string") return !!val;

		const s = normalize(val);

		if (NUMERIC_RE.test(s)) {
			const num = Number(s);
			if (Number.isFinite(num)) return num !== 0;
		}

		if (truthy.has(s)) return true;

		if (options?.strict) {
			if (falsy.has(s)) return false;
			throw new TypeError(
				`parseBoolean: unrecognized value in strict mode: ${JSON.stringify(val)}`,
			);
		}

		return false;
	}) as ParseBoolean;

	fn.addTruthy = (v: string): void => {
		truthy.add(normalize(`${v}`));
	};
	fn.removeTruthy = (v: string): void => {
		truthy.delete(normalize(`${v}`));
	};
	fn.addFalsy = (v: string): void => {
		falsy.add(normalize(`${v}`));
	};
	fn.removeFalsy = (v: string): void => {
		falsy.delete(normalize(`${v}`));
	};
	fn.reset = (): void => {
		truthy = new Set(_defaultTruthy);
		falsy = new Set(_defaultFalsy);
	};

	return fn;
}

/**
 * Global registry key for shared state across module instances.
 * Using Symbol.for() ensures the same symbol is used even if the module
 * is duplicated by bundlers or multiple versions coexist.
 */
const GLOBAL_KEY = Symbol.for("@marianmeres/parse-boolean");

// deno-lint-ignore no-explicit-any
const globalRegistry = globalThis as any;

/**
 * Parses any input value to a boolean.
 *
 * For non-string values, uses standard truthy/falsy JavaScript conversion (!!val).
 * For strings, applies special parsing rules (case-insensitive, trimmed):
 * - Finite decimal numeric strings: zero is false, non-zero is true.
 *   Partial numeric strings like "123abc" are not numeric and fall through.
 *   Non-finite values ("Infinity", "NaN") are not numeric and fall through.
 * - Recognized truthy strings: "true", "t", "yes", "y", "on", "ok",
 *   "enable", "enabled" (extensible via `addTruthy`).
 * - In non-strict mode (default), all other strings are falsy.
 * - In strict mode (`{ strict: true }`), strings that match neither the
 *   truthy nor the falsy dictionary throw `TypeError`.
 *
 * State (truthy/falsy dictionaries) is stored on `globalThis` under a
 * `Symbol.for` key so customizations are shared across bundler-duplicated
 * copies of this module. For isolated state, use `createParseBoolean()`.
 *
 * @example
 * ```ts
 * parseBoolean("yes");                        // true
 * parseBoolean("ON");                         // true
 * parseBoolean("1");                          // true
 * parseBoolean("");                           // false
 * parseBoolean("foo");                        // false
 * parseBoolean("-0.0");                       // false
 * parseBoolean({});                           // true
 * parseBoolean(NaN);                          // false
 * parseBoolean("maybe", { strict: true });    // throws TypeError
 * ```
 */
export const parseBoolean: ParseBoolean = (globalRegistry[GLOBAL_KEY] ??=
	createParseBoolean());
