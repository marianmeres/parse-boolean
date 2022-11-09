import path from 'node:path';
import { strict as assert } from 'node:assert';
import { TestRunner } from '@marianmeres/test-runner';
import { fileURLToPath } from 'node:url';
import { parseBoolean } from '../dist/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const suite = new TestRunner(path.basename(__filename), {
	beforeEach: () => (parseBoolean.truthy = []),
});

suite.test('booleans', () => {
	assert(parseBoolean(true));
	assert(!parseBoolean(false));
});

suite.test('TRUE: ints, floats', () => {
	// prettier-ignore
	[
		1, -1, 2, 1.23, -1.23, 0.12, -0.12,
		Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY
	]
		.forEach((v) => assert(parseBoolean(v)));
});

suite.test('TRUE: ints, floats (written as strings)', () => {
	// prettier-ignore
	[
		'1', '-1', '1.23', '-1.23', '0.12', '-0.12',
		'   123  ', ' 11 22 33 ' // see Number.parseFloat
	].forEach((v) =>
		assert(parseBoolean(v))
	);
});

suite.test('FALSE: ints, floats', () => {
	[0, 0.0, -0, -0.0].forEach((v) => assert(!parseBoolean(v)));
});

suite.test('FALSE: ints, floats (written as strings)', () => {
	['0', '0.0', '-0', '-0.0'].forEach((v) => assert(!parseBoolean(v)));
});

suite.test('TRUE: whitelisted strings', () => {
	['1', 'oN', 'tRUe', 'eNabLEd', 'Ok', 'yES', 'y', 't'].forEach((v) =>
		assert(parseBoolean(v))
	);
});

suite.test('FALSE: every other string', () => {
	['', '  ', 'foo', 'truthy', 'yo'].forEach((v) => assert(!parseBoolean(v)));
});

suite.test('TRUE: anything js truthy', () => {
	[{}, new Date(), () => null].forEach((v) => assert(parseBoolean(v)));
});

suite.test('FALSE: anything js falsey', () => {
	[void 0, null, NaN].forEach((v) => assert(!parseBoolean(v)));
});

suite.test('Custom dictionary', () => {
	assert(!parseBoolean('yo'));
	parseBoolean.truthy.push('yo');
	assert(parseBoolean('YO'));
});

export default suite;
