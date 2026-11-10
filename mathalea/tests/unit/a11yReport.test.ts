import { describe, expect, it } from 'vitest'
import {
  A11Y_REPORT_VERSION,
  A11Y_VIEWS,
  AXE_TAGS,
  categorizeRule,
  compareRuns,
  computeTotals,
  formatTarget,
  isA11yRun,
  LIMITS_NOTICE,
  renderMarkdown,
  renderSummary,
  summarizeAxeResults,
} from '../../tasks/lib/a11yReport'
import type {
  A11yRun,
  AxeRuleResult,
  MeasuredView,
  RuleInfo,
  ViewResult,
} from '../../tasks/lib/a11yReport'

const RULES: Record<string, RuleInfo> = {
  'color-contrast': {
    help: 'Contraste suffisant',
    helpUrl: 'https://example.org/color-contrast',
    category: 'wcag',
    impact: 'serious',
  },
  region: {
    help: 'Contenu dans une région',
    helpUrl: 'https://example.org/region',
    category: 'best-practice',
    impact: 'moderate',
  },
}

function measured(
  counts: Record<string, number>,
  overrides: Partial<MeasuredView> = {},
): MeasuredView {
  return {
    status: 'ok',
    query: '?v=a',
    durationMs: 1,
    notes: [],
    markers: { mathFields: 0, vitrine: false, degraded: null },
    violations: Object.fromEntries(
      Object.entries(counts).map(([rule, count]) => [
        rule,
        { count, examples: [] },
      ]),
    ),
    incomplete: {},
    ...overrides,
  }
}

const failed: ViewResult = {
  status: 'error',
  query: '?v=a',
  durationMs: 1,
  error: { kind: 'etat-reel', message: 'État réel non atteint' },
}

function run(
  views: Record<string, ViewResult>,
  overrides: Partial<A11yRun> = {},
): A11yRun {
  return {
    version: A11Y_REPORT_VERSION,
    generatedAt: '2026-11-07T10:00:00.000Z',
    commit: 'abc1234',
    environment: 'local',
    baseUrl: 'http://localhost:5173/alea/',
    config: {
      axeVersion: '4.14.0',
      tags: AXE_TAGS,
      excluded: ['.vitrine-alea'],
      browser: 'Chromium 140',
      viewport: { width: 1280, height: 800 },
      seed: 'rgaa',
    },
    rules: RULES,
    views,
    ...overrides,
  }
}

const axeRule = (overrides: Partial<AxeRuleResult>): AxeRuleResult => ({
  id: 'color-contrast',
  help: 'Contraste suffisant',
  helpUrl: 'https://example.org',
  tags: ['wcag2aa'],
  impact: 'serious',
  nodes: [{ target: ['#a'], html: '<a id="a"></a>' }],
  ...overrides,
})

describe('liste des vues', () => {
  it('compte les 20 vues, chacune avec un état réel à attendre', () => {
    expect(A11Y_VIEWS).toHaveLength(20)
    expect(new Set(A11Y_VIEWS.map((view) => view.name)).size).toBe(20)
    for (const view of A11Y_VIEWS) expect(view.ready.length).toBeGreaterThan(0)
  })

  it('fixe la graine de toutes les vues avec exercice', () => {
    const withExercise = A11Y_VIEWS.filter((v) => v.query.includes('uuid='))
    expect(withExercise).toHaveLength(16)
    for (const view of withExercise) expect(view.query).toContain('alea=rgaa')
  })
})

describe('classement des règles', () => {
  it('sépare WCAG et bonnes pratiques', () => {
    expect(categorizeRule(['cat.color', 'wcag2aa', 'wcag143'])).toBe('wcag')
    expect(categorizeRule(['wcag21a'])).toBe('wcag')
    expect(categorizeRule(['cat.semantics', 'best-practice'])).toBe(
      'best-practice',
    )
  })
})

describe('summarizeAxeResults', () => {
  it('compte les éléments par règle et note les règles rencontrées', () => {
    const rules: Record<string, RuleInfo> = {}
    const summary = summarizeAxeResults(
      {
        violations: [
          axeRule({
            nodes: [
              { target: ['#a'], html: '<a></a>' },
              { target: ['#b'], html: '<b></b>' },
            ],
          }),
        ],
        incomplete: [axeRule({ id: 'aria-valid-attr-value' })],
        passes: [],
      },
      rules,
    )
    expect(summary?.violations['color-contrast'].count).toBe(2)
    expect(summary?.incomplete).toEqual({ 'aria-valid-attr-value': 1 })
    expect(rules['color-contrast'].category).toBe('wcag')
  })

  it('garde le pire impact relevé sur une règle, tous passages de vues confondus', () => {
    const rules: Record<string, RuleInfo> = {}
    const input = (impact: string) => ({
      violations: [axeRule({ impact, nodes: [] })],
      incomplete: [],
      passes: [],
    })
    summarizeAxeResults(input('critical'), rules)
    summarizeAxeResults(input('minor'), rules)
    expect(rules['color-contrast'].impact).toBe('critical')
  })

  it('renvoie null si axe n’a rien évalué : ce n’est pas zéro défaut', () => {
    expect(
      summarizeAxeResults({ violations: [], incomplete: [], passes: [] }, {}),
    ).toBeNull()
  })

  it('accepte zéro défaut quand des règles ont réussi', () => {
    const summary = summarizeAxeResults(
      { violations: [], incomplete: [], passes: [axeRule({})] },
      {},
    )
    expect(summary).toEqual({ violations: {}, incomplete: {} })
  })

  it('retire les horodatages des exemples, qui changent à chaque rendu', () => {
    const summary = summarizeAxeResults(
      {
        violations: [
          axeRule({
            nodes: [
              {
                target: ['#searchInputField-1794056192461'],
                html: '<input id="searchInputField-1794056192461">',
              },
            ],
          }),
        ],
        incomplete: [],
        passes: [],
      },
      {},
    )
    const [example] = summary?.violations['color-contrast'].examples ?? []
    expect(example.target).toBe('#searchInputField-…')
    expect(example.html).not.toContain('1794056192461')
  })
})

describe('formatTarget', () => {
  it('rend lisible la traversée d’un shadow DOM', () => {
    expect(formatTarget(['math-field#a', '.ML__sink'])).toBe(
      'math-field#a >>> .ML__sink',
    )
    expect(formatTarget([['math-field#a', '.ML__sink']])).toBe(
      'math-field#a >>> .ML__sink',
    )
  })
})

describe('computeTotals', () => {
  it('ne compte jamais une vue en erreur comme zéro défaut', () => {
    const totals = computeTotals(
      run({ a: measured({ 'color-contrast': 2, region: 1 }), b: failed }),
    )
    expect(totals).toEqual({
      measured: 1,
      failed: 1,
      wcag: 2,
      bestPractice: 1,
      incomplete: 0,
    })
  })
})

describe('compareRuns', () => {
  it('signale l’absence de passage précédent et un fichier illisible', () => {
    const current = run({ a: measured({}) })
    expect(compareRuns(null, current, 'absent').state).toBe('absent')
    expect(compareRuns(null, current, 'illisible').state).toBe('illisible')
  })

  it('relève les hausses, les baisses, les règles apparues et disparues', () => {
    const comparison = compareRuns(
      run({ a: measured({ 'color-contrast': 5, region: 1 }) }),
      run({ a: measured({ 'color-contrast': 3, label: 2 }) }),
      'ok',
    )
    expect(comparison.changes).toEqual([
      { view: 'a', rule: 'label', before: 0, after: 2 },
      { view: 'a', rule: 'region', before: 1, after: 0 },
      { view: 'a', rule: 'color-contrast', before: 5, after: 3 },
    ])
  })

  it('ne conclut à aucune amélioration quand une vue tombe en erreur', () => {
    const comparison = compareRuns(
      run({ a: measured({ 'color-contrast': 5 }), b: measured({ region: 1 }) }),
      run({ a: failed, b: measured({ region: 1 }) }),
      'ok',
    )
    expect(comparison.changes).toEqual([])
    expect(comparison.notComparable).toEqual([
      { view: 'a', reason: 'en erreur à ce passage' },
    ])
    expect(comparison.before?.wcag).toBe(0)
    expect(comparison.after?.wcag).toBe(0)
  })

  it('ne compte pas comme une hausse une vue de nouveau mesurée', () => {
    const comparison = compareRuns(
      run({ a: failed }),
      run({ a: measured({ 'color-contrast': 5 }) }),
      'ok',
    )
    expect(comparison.changes).toEqual([])
    expect(comparison.notComparable[0].reason).toBe(
      'en erreur au passage précédent',
    )
  })

  it('ne compare pas une vue dont l’adresse a changé', () => {
    const comparison = compareRuns(
      run({ a: measured({ region: 1 }, { query: '?v=ancienne' }) }),
      run({ a: measured({ region: 9 }) }),
      'ok',
    )
    expect(comparison.changes).toEqual([])
    expect(comparison.notComparable[0].reason).toContain('adresse modifiée')
  })

  it('prévient quand l’outil ou l’environnement a changé', () => {
    const previous = run(
      { a: measured({}) },
      {
        environment: 'ci',
        config: {
          axeVersion: '4.13.0',
          tags: ['wcag2a'],
          excluded: [],
          browser: 'Chromium 139',
          viewport: { width: 1000, height: 800 },
          seed: 'autre',
        },
      },
    )
    const { warnings } = compareRuns(previous, run({ a: measured({}) }), 'ok')
    expect(warnings).toHaveLength(7)
    expect(warnings[0]).toContain('4.13.0')
  })

  it('prévient quand la vitrine ou le contenu principal change', () => {
    const { warnings } = compareRuns(
      run({
        a: measured(
          {},
          {
            markers: {
              mathFields: 0,
              vitrine: true,
              degraded: 'aperçu Typst non compilé',
            },
          },
        ),
      }),
      run({ a: measured({}) }),
      'ok',
    )
    expect(warnings).toHaveLength(2)
    expect(warnings.join()).toContain('vitrine')
    expect(warnings.join()).toContain('retrouvé son contenu')
  })
})

describe('isA11yRun', () => {
  it('rejette un fichier d’un autre format', () => {
    expect(isA11yRun(run({}))).toBe(true)
    expect(isA11yRun(null)).toBe(false)
    expect(isA11yRun([])).toBe(false)
    expect(isA11yRun({ version: 999, views: {}, rules: {}, config: {} })).toBe(
      false,
    )
    expect(isA11yRun({ version: A11Y_REPORT_VERSION })).toBe(false)
  })

  it('rejette un passage incomplet, que la comparaison ne saurait pas lire', () => {
    const complete = run({ a: measured({}) })
    expect(isA11yRun(complete)).toBe(true)
    expect(
      isA11yRun({
        ...complete,
        config: { ...complete.config, excluded: undefined },
      }),
    ).toBe(false)
    expect(isA11yRun({ ...complete, views: { a: { status: 'ok' } } })).toBe(
      false,
    )
    expect(isA11yRun({ ...complete, views: { a: null } })).toBe(false)
  })
})

describe('rendu du rapport', () => {
  const absent = compareRuns(null, run({}), 'absent')

  it('écrit les limites en tête, sans jamais donner de taux', () => {
    const markdown = renderMarkdown(run({ a: measured({ region: 1 }) }), absent)
    expect(markdown).toContain(LIMITS_NOTICE)
    expect(LIMITS_NOTICE).toContain('aucun taux de conformité RGAA')
    expect(markdown.indexOf(LIMITS_NOTICE)).toBeLessThan(
      markdown.indexOf('## Résumé'),
    )
    expect(markdown).not.toMatch(/\d\s*%/)
  })

  it('montre clairement une vue en erreur, sans zéro à sa place', () => {
    const markdown = renderMarkdown(
      run({ a: measured({ region: 1 }), b: failed }),
      absent,
    )
    expect(markdown).toContain('1 vue en erreur')
    expect(markdown).toContain("ce n'est pas zéro défaut")
    expect(markdown).toContain('État réel non atteint')
    expect(markdown).toContain('| b | ⚠️ erreur | non mesuré |')
  })

  it('ne donne aucun total quand aucune vue n’est mesurée', () => {
    const summary = renderSummary(run({ a: failed, b: failed }), absent)
    expect(summary).toContain('Aucune vue mesurée')
    expect(summary).not.toContain('Défauts WCAG')
  })

  it('dit quand le passage précédent est illisible', () => {
    const current = run({ a: measured({}) })
    expect(
      renderSummary(current, compareRuns(null, current, 'illisible')),
    ).toContain('illisible')
  })

  it('sépare WCAG et bonnes pratiques', () => {
    const markdown = renderMarkdown(
      run({ a: measured({ 'color-contrast': 4, region: 1 }) }),
      absent,
    )
    const wcag = markdown.slice(
      markdown.indexOf('## Défauts WCAG'),
      markdown.indexOf('## Bonnes pratiques'),
    )
    expect(wcag).toContain('color-contrast')
    expect(wcag).not.toContain('`region`')
    expect(markdown).toContain('**Bonnes pratiques** : 1 élément, 1 règle')
  })

  it('signale une vue mesurée sans son contenu principal', () => {
    const summary = renderSummary(
      run({
        a: measured(
          {},
          {
            markers: {
              mathFields: 0,
              vitrine: false,
              degraded: 'aperçu Typst non compilé : erreur',
            },
          },
        ),
      }),
      absent,
    )
    expect(summary).toContain('Mesurées sans leur contenu principal')
  })

  it('résume l’évolution et détaille les écarts', () => {
    const previous = run({ a: measured({ 'color-contrast': 5 }) })
    const current = run({ a: measured({ 'color-contrast': 7 }) })
    const markdown = renderMarkdown(
      current,
      compareRuns(previous, current, 'ok'),
    )
    expect(markdown).toContain('WCAG +2')
    expect(markdown).toContain('| a | `color-contrast` | WCAG | 5 | 7 | +2 |')
  })

  it('échappe les barres verticales qui casseraient un tableau', () => {
    const current = run(
      { a: measured({ 'color-contrast': 1 }) },
      {
        rules: {
          'color-contrast': { ...RULES['color-contrast'], help: 'a | b' },
        },
      },
    )
    expect(renderMarkdown(current, absent)).toContain('a \\| b')
  })
})
