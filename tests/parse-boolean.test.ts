import { assert } from "@std/assert";
import { parseBoolean } from "../src/parse-boolean.ts";

Deno.test("TRUE", () => {
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
	].forEach((v) => assert(parseBoolean(v), `Expecting true for: '${v}'`));
});

Deno.test("FALSE", () => {
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
	].forEach((v) => assert(!parseBoolean(v), `Expecting false for: '${v}'`));
});

Deno.test("Custom dictionary", () => {
	parseBoolean.reset();
	assert(!parseBoolean("yo"));
	parseBoolean.addTruthy("yo"); // case insensitive
	assert(parseBoolean("yO"));
	parseBoolean.reset();
});

Deno.test("Reset dictionary", () => {
	parseBoolean.reset();
	parseBoolean.addTruthy("custom");
	assert(parseBoolean("custom"));
	parseBoolean.reset();
	assert(!parseBoolean("custom"));
	// default values should still work after reset
	assert(parseBoolean("yes"));
	assert(parseBoolean("true"));
	parseBoolean.reset();
});
