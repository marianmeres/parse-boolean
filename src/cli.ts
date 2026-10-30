import { readFileSync } from "node:fs";
import process from "node:process";
import { parseArgs } from "node:util";
import { createParseBoolean } from "./parse-boolean.ts";

const USAGE = `
parse-boolean: Parse a value to a boolean, the way parseBoolean() does.

Usage: parse-boolean [options] [--] <value>

Prints "true" or "false". Exit code 0 means true, 1 means false (like grep), so it
works directly in shell conditions. Exit code 2: invalid arguments, or with --strict
an unrecognized value.

Options:
  --strict, -s      Fail (exit 2) on a string that is neither numeric nor in the
                    truthy or falsy dictionary, instead of treating it as false
  --quiet, -q       Print nothing; the exit code is the answer
  --truthy <word>   Add a word to the truthy dictionary (repeatable)
  --falsy <word>    Add a word to the falsy dictionary (repeatable; --strict only)
  --version         Print the version
  --help, -h        Show this help message

A value starting with "-" (e.g. "-1") must come after "--". Pass untrusted input
(environment variables) after "--" anyway.

Examples:
  npx @marianmeres/parse-boolean yes                 # true, exit 0
  if parse-boolean -q -- "$DEBUG"; then echo debug; fi
  parse-boolean --strict -- "$FEATURE_FLAG"          # exit 2 on a typo like "ture"
  parse-boolean --truthy si -- "$ACTIVO"
`;

/** Invalid invocation: message on stderr, exit code 2. */
function usageError(message: string): void {
	console.error(`Error: ${message}`);
	console.error("Run with --help for usage.");
	process.exitCode = 2;
}

/** Version from package.json, one level above both `src/` and the published `dist/`. */
function getVersion(): string {
	const url = new URL("../package.json", import.meta.url);
	return JSON.parse(readFileSync(url, "utf8")).version;
}

/**
 * Runs the CLI. Sets `process.exitCode` (0 true, 1 false, 2 invalid arguments or an
 * unrecognized value in strict mode) instead of calling `process.exit`, so buffered
 * stdout is flushed.
 *
 * @param argv - Arguments without the runtime and script (default: process.argv)
 */
export function main(argv: string[] = process.argv.slice(2)): void {
	let parsed: ReturnType<typeof parse>;
	try {
		parsed = parse(argv);
	} catch (error) {
		usageError(error instanceof Error ? error.message : String(error));
		return;
	}
	const { values, positionals } = parsed;

	if (values.help) {
		console.log(USAGE);
		return;
	}

	if (values.version) {
		console.log(getVersion());
		return;
	}

	if (positionals.length !== 1) {
		usageError(
			positionals.length
				? `Expected exactly one value, got ${positionals.length}.`
				: "Missing the value to parse.",
		);
		return;
	}

	const parseBoolean = createParseBoolean();
	for (const word of values.truthy ?? []) parseBoolean.addTruthy(word);
	for (const word of values.falsy ?? []) parseBoolean.addFalsy(word);

	let result: boolean;
	try {
		result = parseBoolean(positionals[0], { strict: values.strict });
	} catch (error) {
		console.error(`Error: ${error instanceof Error ? error.message : error}`);
		process.exitCode = 2;
		return;
	}

	if (!values.quiet) console.log(String(result));
	process.exitCode = result ? 0 : 1;
}

function parse(argv: string[]) {
	return parseArgs({
		args: argv,
		strict: true,
		allowPositionals: true,
		options: {
			strict: { type: "boolean", short: "s", default: false },
			quiet: { type: "boolean", short: "q", default: false },
			truthy: { type: "string", multiple: true },
			falsy: { type: "string", multiple: true },
			version: { type: "boolean", default: false },
			help: { type: "boolean", short: "h", default: false },
		},
	});
}
