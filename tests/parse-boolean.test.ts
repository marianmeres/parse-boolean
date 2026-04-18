import { assert, assertEquals, assertThrows } from "@std/assert";
import { createParseBoolean, parseBoolean } from "../src/parse-boolean.ts";

Deno.test("TRUE", () => {
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
	].forEach((v) => assert(parseBoolean(v), `Expecting true for: '${v}'`));
});

Deno.test("FALSE", () => {
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
	].forEach((v) => assert(!parseBoolean(v), `Expecting false for: '${v}'`));
});

Deno.test("Partial numeric strings are not truthy (bug fix)", () => {
	parseBoolean.reset();
	["123abc", "1foo", "1.5.3", "0x1", "--1", "1 2"].forEach((v) =>
		assert(!parseBoolean(v), `Expecting false for: '${v}'`)
	);
});

Deno.test("Non-finite numeric strings are not truthy", () => {
	parseBoolean.reset();
	["Infinity", "-Infinity", "+Infinity", "NaN", "infinity"].forEach((v) =>
		assert(!parseBoolean(v), `Expecting false for: '${v}'`)
	);
});

Deno.test("Custom dictionary", () => {
	parseBoolean.reset();
	assert(!parseBoolean("yo"));
	parseBoolean.addTruthy("yo");
	assert(parseBoolean("yO"));
	parseBoolean.reset();
});

Deno.test("addTruthy normalizes input", () => {
	parseBoolean.reset();
	parseBoolean.addTruthy("  SI  ");
	assert(parseBoolean("si"));
	assert(parseBoolean("SI"));
	parseBoolean.reset();
});

Deno.test("removeTruthy removes default and custom entries", () => {
	parseBoolean.reset();
	assert(parseBoolean("yes"));
	parseBoolean.removeTruthy("yes");
	assert(!parseBoolean("yes"));

	parseBoolean.addTruthy("oui");
	assert(parseBoolean("oui"));
	parseBoolean.removeTruthy("OUI");
	assert(!parseBoolean("oui"));

	parseBoolean.reset();
	assert(parseBoolean("yes"));
});

Deno.test("Reset dictionary", () => {
	parseBoolean.reset();
	parseBoolean.addTruthy("custom");
	assert(parseBoolean("custom"));
	parseBoolean.reset();
	assert(!parseBoolean("custom"));
	assert(parseBoolean("yes"));
	assert(parseBoolean("true"));
});

Deno.test("Strict mode: recognized truthy/falsy", () => {
	parseBoolean.reset();
	assertEquals(parseBoolean("yes", { strict: true }), true);
	assertEquals(parseBoolean("no", { strict: true }), false);
	assertEquals(parseBoolean("false", { strict: true }), false);
	assertEquals(parseBoolean("off", { strict: true }), false);
	assertEquals(parseBoolean("1", { strict: true }), true);
	assertEquals(parseBoolean("0", { strict: true }), false);
});

Deno.test("Strict mode: throws on unrecognized", () => {
	parseBoolean.reset();
	assertThrows(
		() => parseBoolean("maybe", { strict: true }),
		TypeError,
	);
	assertThrows(
		() => parseBoolean("123abc", { strict: true }),
		TypeError,
	);
});

Deno.test("Strict mode: non-strings still use truthy coercion", () => {
	parseBoolean.reset();
	assertEquals(parseBoolean({}, { strict: true }), true);
	assertEquals(parseBoolean(null, { strict: true }), false);
	assertEquals(parseBoolean(0, { strict: true }), false);
});

Deno.test("addFalsy / removeFalsy affect strict mode", () => {
	parseBoolean.reset();
	assertThrows(() => parseBoolean("nope", { strict: true }), TypeError);

	parseBoolean.addFalsy("nope");
	assertEquals(parseBoolean("nope", { strict: true }), false);
	assertEquals(parseBoolean("NOPE", { strict: true }), false);

	parseBoolean.removeFalsy("nope");
	assertThrows(() => parseBoolean("nope", { strict: true }), TypeError);

	parseBoolean.reset();
});

Deno.test("Factory instances are isolated", () => {
	const a = createParseBoolean();
	const b = createParseBoolean();

	a.addTruthy("si");
	assert(a("si"));
	assert(!b("si"));

	b.addTruthy("oui");
	assert(b("oui"));
	assert(!a("oui"));

	a.reset();
	assert(!a("si"));
	assert(b("oui"));
});

Deno.test("Factory instances are isolated from global", () => {
	parseBoolean.reset();
	const local = createParseBoolean();
	local.addTruthy("si");
	assert(local("si"));
	assert(!parseBoolean("si"));
});

Deno.test("addTruthy / reset return void (no internal Set leak)", () => {
	parseBoolean.reset();
	const addResult = parseBoolean.addTruthy("x");
	const resetResult = parseBoolean.reset();
	assertEquals(addResult, undefined);
	assertEquals(resetResult, undefined);
});
