import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import assert from 'node:assert/strict'
import test from 'node:test'

const require = createRequire(new URL('../mathalea/package.json', import.meta.url))
const ts = require('typescript')
const source = readFileSync(new URL('../mathalea/tests/e2e/helpers/issue.ts', import.meta.url), 'utf8')
const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText
const { createIssue } = await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`)

test('tickets : aucune requête sans jeton, authentification configurée sinon', async () => {
  const previous = { CI: process.env.CI, CI_TEST_TICKETS: process.env.CI_TEST_TICKETS, MATHALEA_GITLAB_TOKEN: process.env.MATHALEA_GITLAB_TOKEN }
  const originalFetch = globalThis.fetch
  const calls = []
  try {
    process.env.CI = '1'
    process.env.CI_TEST_TICKETS = 'CREATE'
    delete process.env.MATHALEA_GITLAB_TOKEN
    globalThis.fetch = async (url, options) => {
      calls.push({ url, options })
      return options.method === 'GET' ? new Response('[]', { status: 200 }) : new Response('{}', { status: 201 })
    }
    await createIssue('https://example.test/?id=6N2A-1', ['test'], [], () => {})
    assert.equal(calls.length, 0)
    process.env.MATHALEA_GITLAB_TOKEN = 'test-placeholder-not-a-credential'
    await createIssue('https://example.test/?id=6N2A-1', ['test'], [], () => {})
    assert.equal(calls.length, 2)
    assert.deepEqual(calls.map(c => c.options.method), ['GET', 'POST'])
    for (const call of calls) assert.equal(call.options.headers.get('PRIVATE-TOKEN'), 'test-placeholder-not-a-credential')
    delete process.env.CI_TEST_TICKETS
    await createIssue('https://example.test/?id=6N2A-1', ['test'], [], () => {})
    assert.equal(calls.length, 2)
  } finally {
    globalThis.fetch = originalFetch
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key]
      else process.env[key] = value
    }
  }
})
