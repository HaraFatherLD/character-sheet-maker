import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getTemplate } from '../src/templates/index.js';

test('AP-047 the clean design stacks its top row when narrow', () => {
  const css = getTemplate('clean').css;
  assert.ok(/\.cs-clean\{[^}]*container-type:inline-size/.test(css), 'clean root is a size container');
  const blocks = css.match(/@container \(max-width:\s*760px\)\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g) || [];
  assert.ok(blocks.some((b) => b.includes('.cs-clean')), 'a 760px container rule re-flows the clean layout');
});
