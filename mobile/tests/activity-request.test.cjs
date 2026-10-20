const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const ts = require('typescript');

const source = ts.transpileModule(fs.readFileSync(require.resolve('../src/services/api.ts'), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
}).outputText;

function loadApi(fetch) {
  const exports = {};
  const deadlines = [];
  vm.runInNewContext(source, {
    exports, Headers, AbortController, console,
    fetch,
    setTimeout(fn, delay) { deadlines.push(delay); return setTimeout(fn, 5); },
    clearTimeout,
    require(name) {
      if (name === 'react-native') return { Platform: { OS: 'ios' } };
      if (name === '@react-native-async-storage/async-storage') return { getItem: async () => 'test', removeItem: async () => {} };
      throw new Error(name);
    },
  });
  return { api: exports.api, deadlines };
}

test('activity save preserves payload and uses a bounded wait', async () => {
  const { api, deadlines } = loadApi(async (url, options) => {
    assert.ok(url.endsWith('/atividades'));
    assert.deepEqual(JSON.parse(options.body), { item_id: 'exercise', tipo: 'treinei_hoje' });
    return new Response('{"id":"saved"}', { status: 201 });
  });
  assert.equal((await api.criarAtividade('exercise', 'treinei_hoje')).id, 'saved');
  assert.deepEqual(deadlines, [15000]);
});

test('a stalled save aborts and reports TIMEOUT', async () => {
  const { api } = loadApi((url, { signal }) => new Promise((resolve, reject) => {
    signal.addEventListener('abort', () => reject(new Error('aborted')));
  }));
  await assert.rejects(api.criarAtividade('exercise', 'treinei_hoje'), e => e.code === 'TIMEOUT');
});

test('strict confirmation propagates server failure instead of reporting incomplete', async () => {
  const { api } = loadApi(async () => new Response('unavailable', { status: 503 }));
  await assert.rejects(api.verificarFezHoje('exercise', 'treinei_hoje', true), e => e.status === 503);
});

test('confirmation returns persisted completion', async () => {
  const { api, deadlines } = loadApi(async () => new Response('{"fez_hoje":true}'));
  assert.equal(await api.verificarFezHoje('exercise', 'treinei_hoje', true), true);
  assert.deepEqual(deadlines, [10000]);
});
