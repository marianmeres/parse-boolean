import path from 'node:path';
import { strict as assert } from 'node:assert';
import { TestRunner } from '@marianmeres/test-runner';
import { fileURLToPath } from 'node:url';
import { parseBoolean } from '../dist/index.js';

const suite = new TestRunner(path.basename(fileURLToPath(import.meta.url)), {
	beforeEach: parseBoolean.reset,
});

// prettier-ignore
suite.test('TRUE', () => {
	[   {}, new Date(), () => null, true, 1, -1, 0.1, -0.1,
		'1', 'oN', 'tRUe', 'eNabLEd', 'enable', 'Ok', 'yES', 'y', 't',
	].forEach((v) => assert(parseBoolean(v), `Expecting true for: '${v}'`));
});

// prettier-ignore
suite.test('FALSE', () => {
	[   void 0, null, NaN, false, 0, 0.0, -0, -0.0,
		'', '  ', 'gimme some truth', 'yo',
	].forEach((v) => assert(!parseBoolean(v), `Expecting false for: '${v}'`));
});

suite.test('Custom dictionary', () => {
	assert(!parseBoolean('yo'));
	parseBoolean.addTruthy('yo'); // case insensitive
	assert(parseBoolean('yO'));
});

export default suite;
