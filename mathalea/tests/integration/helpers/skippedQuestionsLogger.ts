import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

export function writeQuestionsSummary(counts: {
  comparisonTestedQuestionsCount: number
  comparisonSkippedQuestionsCount: number
  domTestedQuestionsCount: number
  domSkippedQuestionsCount: number
  eitherTestedQuestionsCount: number
}) {
  const logsDir = resolve('tests/integration/logs')
  mkdirSync(logsDir, { recursive: true })
  writeFileSync(
    resolve('tests/integration/logs/interactivity_all_questions_counts.json'),
    JSON.stringify(counts, null, 2),
  )
}

export type SkippedQuestion = {
  filePath: string
  titre: string
  seed: string
  scenario?: string
  strategy: 'comparison-only' | 'full-dom' | 'qcm-verification'
  questionIndex: number
  format: string
  skipReason: string
}

type SkippedQuestionWithoutStrategy = Omit<SkippedQuestion, 'strategy'>

function skippedKeyWithoutStrategy(entry: SkippedQuestion): string {
  return [
    entry.filePath,
    entry.scenario ?? '',
    entry.format,
    entry.skipReason,
  ].join('|')
}

function toQuestions(
  keys: Set<string>,
  representativeByKey: Map<string, SkippedQuestionWithoutStrategy>,
) {
  return [...keys]
    .map((key) => representativeByKey.get(key))
    .filter((q): q is SkippedQuestionWithoutStrategy => q != null)
}

export function writeSkippedQuestionsLogs(skippedQuestions: SkippedQuestion[]) {
  const logsDir = resolve('tests/integration/logs')
  mkdirSync(logsDir, { recursive: true })

  const eitherPath = resolve(
    'tests/integration/logs/interactivity_all_skipped_questions_either_results.json',
  )
  const comparisonPath = resolve(
    'tests/integration/logs/interactivity_all_skipped_questions_comparison_results.json',
  )
  const domPath = resolve(
    'tests/integration/logs/interactivity_all_skipped_questions_dom_results.json',
  )
  const bothPath = resolve(
    'tests/integration/logs/interactivity_all_skipped_questions_both_results.json',
  )
  const skipReasonsSummaryPath = resolve(
    'tests/integration/logs/interactivity_all_skipped_questions_by_reason.json',
  )

  const skippedInComparisonOnly = new Set<string>()
  const skippedInFullDom = new Set<string>()
  const representativeByKey = new Map<string, SkippedQuestionWithoutStrategy>()

  for (const entry of skippedQuestions) {
    const key = skippedKeyWithoutStrategy(entry)
    if (!representativeByKey.has(key)) {
      representativeByKey.set(key, {
        filePath: entry.filePath,
        titre: entry.titre,
        seed: entry.seed,
        scenario: entry.scenario,
        questionIndex: entry.questionIndex,
        format: entry.format,
        skipReason: entry.skipReason,
      })
    }
    if (entry.strategy === 'comparison-only') {
      skippedInComparisonOnly.add(key)
    } else {
      skippedInFullDom.add(key)
    }
  }

  const skippedInBoth = new Set<string>()
  for (const key of skippedInComparisonOnly) {
    if (skippedInFullDom.has(key)) skippedInBoth.add(key)
  }

  const skippedInEither = new Set<string>([
    ...skippedInComparisonOnly,
    ...skippedInFullDom,
  ])

  const eitherQuestions = toQuestions(skippedInEither, representativeByKey)
  const comparisonQuestions = toQuestions(
    skippedInComparisonOnly,
    representativeByKey,
  )
  const domQuestions = toQuestions(skippedInFullDom, representativeByKey)
  const bothQuestions = toQuestions(skippedInBoth, representativeByKey)

  writeFileSync(
    eitherPath,
    JSON.stringify(
      {
        numUniqueQuestionsSkippedOnlyInComparisonOnly:
          skippedInComparisonOnly.size - skippedInBoth.size,
        numUniqueQuestionsSkippedOnlyInFullDom:
          skippedInFullDom.size - skippedInBoth.size,
        numUniqueQuestionsSkippedInEither: skippedInEither.size,
        numUniqueQuestionsSkippedInBoth: skippedInBoth.size,
        skippedQuestions: eitherQuestions,
      },
      null,
      2,
    ),
  )

  writeFileSync(
    comparisonPath,
    JSON.stringify(
      {
        numUniqueQuestionsSkippedInComparisonOnly: comparisonQuestions.length,
        skippedQuestions: comparisonQuestions,
      },
      null,
      2,
    ),
  )

  writeFileSync(
    domPath,
    JSON.stringify(
      {
        numUniqueQuestionsSkippedInFullDom: domQuestions.length,
        skippedQuestions: domQuestions,
      },
      null,
      2,
    ),
  )

  writeFileSync(
    bothPath,
    JSON.stringify(
      {
        numUniqueQuestionsSkippedInBoth: bothQuestions.length,
        skippedQuestions: bothQuestions,
      },
      null,
      2,
    ),
  )

  const strategies = [
    'comparison-only',
    'full-dom',
    'qcm-verification',
  ] as const
  const summary: Record<
    string,
    { totalSkipped: number; byReason: Record<string, number> }
  > = {}

  for (const strategy of strategies) {
    const filtered = skippedQuestions.filter((q) => q.strategy === strategy)
    const byReason: Record<string, number> = {}
    for (const q of filtered) {
      byReason[q.skipReason] = (byReason[q.skipReason] ?? 0) + 1
    }
    const sortedByReason = Object.fromEntries(
      Object.keys(byReason)
        .sort()
        .map((k) => [k, byReason[k]]),
    )
    summary[strategy] = {
      totalSkipped: filtered.length,
      byReason: sortedByReason,
    }
  }

  writeFileSync(skipReasonsSummaryPath, JSON.stringify(summary, null, 2))
}
