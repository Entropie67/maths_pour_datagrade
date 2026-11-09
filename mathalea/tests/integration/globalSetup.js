import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

export async function teardown() {
  const fullPath = resolve(
    'tests/integration/logs/interactivity_all_results.json',
  )
  const failedPath = resolve(
    'tests/integration/logs/interactivity_all_failed_results.json',
  )
  const summaryPath = resolve(
    'tests/integration/logs/interactivity_all_questions_counts.json',
  )

  let full = JSON.parse(readFileSync(fullPath, 'utf-8'))

  try {
    const summary = JSON.parse(readFileSync(summaryPath, 'utf-8'))
    full = { ...summary, ...full }
    writeFileSync(fullPath, JSON.stringify(full, null, 2))
  } catch {}

  const failedSuites = full.testResults
    .map((suite) => ({
      ...suite,
      assertionResults: suite.assertionResults
        .filter((t) => t.status === 'failed')
        .map((t) => ({
          ...t,
          failureMessages: t.failureMessages.map((msg) =>
            msg
              .replace(/: expected .* \/\/ Object\.is equality[\s\S]*/m, '')
              .replace(/^AssertionError: /, ''),
          ),
        })),
    }))
    .filter((suite) => suite.assertionResults.length > 0)

  const numFailedTests = failedSuites.reduce(
    (sum, s) => sum + s.assertionResults.length,
    0,
  )

  writeFileSync(
    failedPath,
    JSON.stringify(
      {
        ...full,
        numTotalTestSuites: failedSuites.length,
        numPassedTestSuites: 0,
        numFailedTestSuites: failedSuites.length,
        numPendingTestSuites: 0,
        numTotalTests: numFailedTests,
        numPassedTests: 0,
        numFailedTests,
        testResults: failedSuites,
      },
      null,
      2,
    ),
  )
}
