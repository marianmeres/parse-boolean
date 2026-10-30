import assert from "node:assert/strict";
import { test } from "node:test";
import { createParseBoolean, parseBoolean } from "../src/parse-boolean.ts";

test("TRUE", () => {
	parseBoolean.reset();
	[
		{},
		new Date(),
		() => null,
		true,
		1,
		-1,
		0.1,
		-0.1,
		"1",
		"oN",
		"tRUe",
		"eNabLEd",
		"enable",
		"ENABLE",
		"Ok",
		"yES",
		"y",
		"t",
		"  yes  ",
		"  1  ",
		"\t1\n",
		"+1",
		"-1",
		"1.5",
		".5",
		"1e5",
	].forEach((v) => {
		assert.ok(parseBoolean(v), `Expecting true for: '${v}'`);
	});
});

test("FALSE", () => {
	parseBoolean.reset();
	[
		void 0,
		null,
		NaN,
		false,
		0,
		0.0,
		-0,
		-0.0,
		"",
		"  ",
		"gimme some truth",
		"yo",
		"0",
		"0.0",
		"-0",
		"+0",
		"0e5",
		"1e-1000", // underflow -> 0
		"\t0\n",
	].forEach((v) => {
		assert.ok(!parseBoolean(v), `Expecting false for: '${v}'`);
	});
});

test("Partial numeric strings are not truthy (bug fix)", () => {
	parseBoolean.reset();
	["123abc", "1foo", "1.5.3", "0x1", "--1", "1 2"].forEach((v) => {
		assert.ok(!parseBoolean(v), `Expecting false for: '${v}'`);
	});
});

test("Non-finite numeric strings are not truthy", () => {
	parseBoolean.reset();
	["Infinity", "-Infinity", "+Infinity", "NaN", "infinity"].forEach((v) => {
		assert.ok(!parseBoolean(v), `Expecting false for: '${v}'`);
	});
});

test("Custom dictionary", () => {
	parseBoolean.reset();
	assert.ok(!parseBoolean("yo"));
	parseBoolean.addTruthy("yo");
	assert.ok(parseBoolean("yO"));
	parseBoolean.reset();
});

test("addTruthy normalizes input", () => {
	parseBoolean.reset();
	parseBoolean.addTruthy("  SI  ");
	assert.ok(parseBoolean("si"));
	assert.ok(parseBoolean("SI"));
	parseBoolean.reset();
});

test("removeTruthy removes default and custom entries", () => {
	parseBoolean.reset();
	assert.ok(parseBoolean("yes"));
	parseBoolean.removeTruthy("yes");
	assert.ok(!parseBoolean("yes"));

	parseBoolean.addTruthy("oui");
	assert.ok(parseBoolean("oui"));
	parseBoolean.removeTruthy("OUI");
	assert.ok(!parseBoolean("oui"));

	parseBoolean.reset();
	assert.ok(parseBoolean("yes"));
});

test("Reset dictionary", () => {
	parseBoolean.reset();
	parseBoolean.addTruthy("custom");
	assert.ok(parseBoolean("custom"));
	parseBoolean.reset();
	assert.ok(!parseBoolean("custom"));
	assert.ok(parseBoolean("yes"));
	assert.ok(parseBoolean("true"));
});

test("Strict mode: recognized truthy/falsy", () => {
	parseBoolean.reset();
	assert.equal(parseBoolean("yes", { strict: true }), true);
	assert.equal(parseBoolean("no", { strict: true }), false);
	assert.equal(parseBoolean("false", { strict: true }), false);
	assert.equal(parseBoolean("off", { strict: true }), false);
	assert.equal(parseBoolean("1", { strict: true }), true);
	assert.equal(parseBoolean("0", { strict: true }), false);
});

test("Strict mode: throws on unrecognized", () => {
	parseBoolean.reset();
	assert.throws(() => parseBoolean("maybe", { strict: true }), TypeError);
	assert.throws(() => parseBoolean("123abc", { strict: true }), TypeError);
});

test("Strict mode: non-strings still use truthy coercion", () => {
	parseBoolean.reset();
	assert.equal(parseBoolean({}, { strict: true }), true);
	assert.equal(parseBoolean(null, { strict: true }), false);
	assert.equal(parseBoolean(0, { strict: true }), false);
});

test("addFalsy / removeFalsy affect strict mode", () => {
	parseBoolean.reset();
	assert.throws(() => parseBoolean("nope", { strict: true }), TypeError);

	parseBoolean.addFalsy("nope");
	assert.equal(parseBoolean("nope", { strict: true }), false);
	assert.equal(parseBoolean("NOPE", { strict: true }), false);

	parseBoolean.removeFalsy("nope");
	assert.throws(() => parseBoolean("nope", { strict: true }), TypeError);

	parseBoolean.reset();
});

test("Factory instances are isolated", () => {
	const a = createParseBoolean();
	const b = createParseBoolean();

	a.addTruthy("si");
	assert.ok(a("si"));
	assert.ok(!b("si"));

	b.addTruthy("oui");
	assert.ok(b("oui"));
	assert.ok(!a("oui"));

	a.reset();
	assert.ok(!a("si"));
	assert.ok(b("oui"));
});

test("Factory instances are isolated from global", () => {
	parseBoolean.reset();
	const local = createParseBoolean();
	local.addTruthy("si");
	assert.ok(local("si"));
	assert.ok(!parseBoolean("si"));
});

test("addTruthy / reset return void (no internal Set leak)", () => {
	parseBoolean.reset();
	const addResult = parseBoolean.addTruthy("x");
	const resetResult = parseBoolean.reset();
	assert.equal(addResult, undefined);
	assert.equal(resetResult, undefined);
});
