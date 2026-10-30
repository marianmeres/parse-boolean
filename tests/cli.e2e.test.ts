// End-to-end: spawn the CLI (src/bin.ts on Node) and check the stream contract and
// exit codes: 0 true, 1 false, 2 invalid arguments or strict-mode rejection.

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import process from "node:process";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const BIN = fileURLToPath(new URL("../src/bin.ts", import.meta.url));

function cli(...args: string[]): { code: number | null; stdout: string; stderr: string } {
	const { status, stdout, stderr } = spawnSync(process.execPath, [BIN, ...args], {
		encoding: "utf8",
		stdio: ["ignore", "pipe", "pipe"],
	});
	return { code: status, stdout, stderr };
}

test("truthy value: prints true, exits 0", () => {
	for (const v of ["yes", "ON", "1", " true "]) {
		const r = cli(v);
		assert.equal(r.code, 0, v);
		assert.equal(r.stdout, "true\n", v);
		assert.equal(r.stderr, "", v);
	}
});

test("falsy value: prints false, exits 1", () => {
	for (const v of ["no", "0", "", "foo"]) {
		const r = cli(v);
		assert.equal(r.code, 1, v);
		assert.equal(r.stdout, "false\n", v);
		assert.equal(r.stderr, "", v);
	}
});

test("--quiet prints nothing, exit code is the answer", () => {
	assert.deepEqual(cli("-q", "yes"), { code: 0, stdout: "", stderr: "" });
	assert.deepEqual(cli("--quiet", "no"), { code: 1, stdout: "", stderr: "" });
});

test("values starting with '-' go after '--'", () => {
	assert.equal(cli("--", "-1").code, 0);
	assert.equal(cli("--", "-0").code, 1);
	assert.equal(cli("-q", "--", "--strict").code, 1);

	const r = cli("-1");
	assert.equal(r.code, 2);
	assert.match(r.stderr, /'--'/);
});

test("--strict: recognized values pass, unrecognized exit 2", () => {
	assert.equal(cli("--strict", "yes").code, 0);
	assert.equal(cli("-s", "off").code, 1);
	assert.equal(cli("-s", "0").code, 1);

	const r = cli("--strict", "maybe");
	assert.equal(r.code, 2);
	assert.equal(r.stdout, "");
	assert.match(r.stderr, /unrecognized value in strict mode: "maybe"/);
});

test("--truthy / --falsy extend the dictionaries, repeatable", () => {
	assert.equal(cli("si").code, 1);
	assert.equal(cli("--truthy", "si", "SI").code, 0);
	assert.equal(cli("--truthy", "si", "--truthy", "oui", "oui").code, 0);

	assert.equal(cli("-s", "nope").code, 2);
	assert.equal(cli("-s", "--falsy", "nope", "nope").code, 1);
});

test("missing or extra value: exit 2", () => {
	for (const args of [[], ["yes", "no"]]) {
		const r = cli(...args);
		assert.equal(r.code, 2, args.join(" "));
		assert.equal(r.stdout, "");
		assert.match(r.stderr, /--help/);
	}
});

test("unknown option: exit 2", () => {
	const r = cli("--nope", "yes");
	assert.equal(r.code, 2);
	assert.match(r.stderr, /Unknown option '--nope'/);
});

test("--help and --version exit 0", () => {
	const help = cli("--help");
	assert.equal(help.code, 0);
	assert.match(help.stdout, /Usage: parse-boolean/);

	const pkg = JSON.parse(
		readFileSync(new URL("../package.json", import.meta.url), "utf8"),
	);
	assert.deepEqual(cli("--version"), {
		code: 0,
		stdout: `${pkg.version}\n`,
		stderr: "",
	});
});
