/**
 * Rapport d'accessibilité : liste des vues, résumé des résultats d'axe-core,
 * comparaison de deux passages et rendu Markdown. Aucun navigateur ni accès
 * disque ici : le pilotage est dans `tasks/a11y-report.ts`.
 *
 * Voir documentation/tests/rapport-accessibilite.md
 */

export const A11Y_REPORT_VERSION = 1
export const A11Y_SEED = 'rgaa'
const EXERCISE = 'uuid=a4d87&id=6M2B-1'

export const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']
export const BEST_PRACTICE_TAG = 'best-practice'
/** Réglage de l'audit initial : le changer rend deux passages incomparables. */
export const AXE_TAGS = [...WCAG_TAGS, BEST_PRACTICE_TAG]

/**
 * Racine du fragment publié par le projet `www` sur l'accueil : son contenu change
 * avec les actualités et ses défauts ne viennent pas de ce dépôt.
 */
export const VITRINE_SELECTOR = '.vitrine-alea'
/** Zones que axe ne mesure pas : les changer rend deux passages incomparables. */
export const AXE_EXCLUDED_SELECTORS = [VITRINE_SELECTOR]

export type RuleCategory = 'wcag' | 'best-practice'

export interface A11yView {
  name: string
  /** Ce qui suit l'adresse du serveur, tel quel */
  query: string
  /** Sélecteurs Playwright qui prouvent que la vue affiche son contenu */
  ready: string[]
  /** Sélecteur d'un état transitoire, qui doit avoir disparu avant la mesure */
  busy?: string
  /** La visite guidée s'ouvre sur cette vue : il faut l'attendre et la fermer */
  tour?: boolean
  /**
   * Message d'échec de la vue : elle reste mesurable, mais sans son contenu
   * principal. Le rapport le signale au lieu d'attendre un contenu qui ne vient pas.
   */
  degraded?: { selector: string; label: string }
}

const exerciseView = (
  view: string,
  ready: string[],
  options: Pick<A11yView, 'busy' | 'degraded'> = {},
): A11yView => ({
  name: view,
  query: `?${EXERCISE}&alea=${A11Y_SEED}&v=${view}`,
  ready,
  ...options,
})

const typstFailure = (selector: string) => ({
  degraded: { selector, label: 'aperçu Typst non compilé' },
})
// Ces trois vues partagent le même bandeau de diagnostics, sans identifiant
const TYPST_PANEL = {
  busy: '.bx-spin',
  ...typstFailure('.font-mono.bg-red-100 p'),
}

/**
 * Les 20 vues mesurées. Une vue inconnue retombe sans erreur sur l'accueil :
 * chaque sélecteur `ready` est propre à sa vue, pour qu'un paramètre devenu
 * invalide se voie comme une erreur et non comme une mesure de la mauvaise page.
 */
export const A11Y_VIEWS: A11yView[] = [
  {
    name: 'accueil',
    query: '',
    ready: ['#startComponent #sidenav'],
    tour: true,
  },
  {
    name: 'accueil-exercice',
    query: `?${EXERCISE}&alea=${A11Y_SEED}&v=&z=1`,
    ready: ['#startComponent [data-exercise-render-state="ready"]'],
  },
  {
    name: 'accueil-exercice-interactif',
    query: `?${EXERCISE}&alea=${A11Y_SEED}&i=1`,
    ready: ['#startComponent [data-exercise-render-state="ready"] math-field'],
  },
  {
    name: 'eleve',
    query: `?${EXERCISE}&alea=${A11Y_SEED}&i=1&v=eleve&es=0111001`,
    ready: ['#exercises-list #exercice0Q0 math-field'],
  },
  {
    name: 'can',
    query: `?${EXERCISE}&alea=${A11Y_SEED}&i=1&v=can`,
    ready: ['button:has-text("Démarrer")'],
  },
  exerciseView('diaporama', ['#diaporama button:has-text("Démarrer")']),
  exerciseView('latex', ['#launchInlinePreview']),
  exerciseView('typst', ['.typst-preview-pane svg'], {
    busy: '.typst-preview-veil',
    ...typstFailure('[data-testid="typst-diagnostics"]'),
  }),
  exerciseView('amc', ['#amcBuilder #sidenav']),
  exerciseView('moodle', ['#gift-btn']),
  exerciseView('anki', ['h1:has-text("Importation")']),
  exerciseView('alacarte', ['#document-title-input']),
  exerciseView('confeleve', ['#config-eleve-titre-input']),
  exerciseView('flashcards', ['.typst-preview svg'], TYPST_PANEL),
  exerciseView('i-have-who-has', ['.typst-preview svg'], TYPST_PANEL),
  exerciseView('slides', ['.typst-preview svg'], TYPST_PANEL),
  // Les commandes se masquent seules 4 s après l'ouverture. La mesure porte sur
  // la vue au repos, signalée par ce message : c'est l'état que voyait l'audit
  // (7 s après `load`), et le seul qui ne dépend pas du moment de la mesure.
  exerciseView('tbi', [
    '#tbi-tab-panel #exercice0Q0',
    'text=Tapoter pour afficher les commandes',
  ]),
  {
    name: 'parcours',
    query: '?v=parcours',
    ready: ['button:has-text("Se connecter")'],
  },
  {
    name: 'mes-sauvegardes',
    query: '?v=mes-sauvegardes',
    ready: ['button:has-text("Nouveau dossier")'],
  },
  {
    name: 'tools',
    query: '?v=tools',
    ready: ['#toolsComponent #exercisesPart'],
  },
]

/** Résultat d'axe-core, réduit à ce que le rapport utilise */
export interface AxeRuleResult {
  id: string
  help: string
  helpUrl: string
  tags: string[]
  impact?: string | null
  nodes: { target: unknown[]; html: string; impact?: string | null }[]
}

export interface AxeSummaryInput {
  violations: AxeRuleResult[]
  incomplete: AxeRuleResult[]
  passes: unknown[]
}

export interface RuleInfo {
  help: string
  helpUrl: string
  category: RuleCategory
  /** Impact le plus grave relevé sur la règle pendant ce passage */
  impact: string
}

export interface NodeExample {
  target: string
  html: string
}

export interface RuleCount {
  count: number
  examples: NodeExample[]
}

export interface ViewMarkers {
  /** Champs dont le nom et le focus sont dans le shadow DOM */
  mathFields: number
  /** Vitrine de coopmaths.fr affichée (et exclue de la mesure), absente en CI */
  vitrine: boolean
  /** Message de la vue quand elle n'a pas pu afficher son contenu principal */
  degraded: string | null
}

export type ErrorKind =
  | 'navigateur'
  | 'navigation'
  | 'etat-reel'
  | 'visite-guidee'
  | 'parametres'
  | 'axe'

export interface MeasuredView {
  status: 'ok'
  query: string
  durationMs: number
  notes: string[]
  markers: ViewMarkers
  violations: Record<string, RuleCount>
  /** axe n'a pas su trancher : à vérifier à la main, ni défaut ni réussite */
  incomplete: Record<string, number>
}

export interface FailedView {
  status: 'error'
  query: string
  durationMs: number
  error: { kind: ErrorKind; message: string }
}

export type ViewResult = MeasuredView | FailedView

export interface RunConfig {
  axeVersion: string
  tags: string[]
  excluded: string[]
  browser: string
  viewport: { width: number; height: number }
  seed: string
}

export interface A11yRun {
  version: number
  generatedAt: string
  commit: string
  environment: 'ci' | 'local'
  baseUrl: string
  config: RunConfig
  rules: Record<string, RuleInfo>
  views: Record<string, ViewResult>
}

export function categorizeRule(tags: string[]): RuleCategory {
  return tags.some((tag) => WCAG_TAGS.includes(tag)) ? 'wcag' : 'best-practice'
}

const IMPACT_ORDER = ['minor', 'moderate', 'serious', 'critical']
const IMPACT_LABELS: Record<string, string> = {
  minor: 'mineur',
  moderate: 'modéré',
  serious: 'sérieux',
  critical: 'critique',
}

function worstImpact(rule: AxeRuleResult): string {
  const impacts = [rule.impact, ...rule.nodes.map((node) => node.impact)]
  return impacts.reduce<string>(
    (worst, impact) =>
      IMPACT_ORDER.indexOf(impact ?? '') > IMPACT_ORDER.indexOf(worst)
        ? (impact as string)
        : worst,
    'inconnu',
  )
}

/** Une cible traverse les frames et les shadow DOM par tableaux imbriqués */
export function formatTarget(target: unknown[]): string {
  return target
    .map((part) => (Array.isArray(part) ? formatTarget(part) : String(part)))
    .join(' >>> ')
}

const MAX_EXAMPLES = 3
const MAX_HTML_LENGTH = 160

// Des id contiennent l'horodatage du rendu : sans cela, les exemples
// changeraient à chaque passage alors que le défaut est le même.
const withoutTimestamps = (text: string) => text.replace(/\d{10,}/g, '…')

function toExample(node: AxeRuleResult['nodes'][number]): NodeExample {
  const html = withoutTimestamps(node.html.replace(/\s+/g, ' '))
  return {
    target: withoutTimestamps(formatTarget(node.target)),
    html:
      html.length > MAX_HTML_LENGTH
        ? `${html.slice(0, MAX_HTML_LENGTH)}…`
        : html,
  }
}

function sortedRecord<T>(entries: [string, T][]): Record<string, T> {
  return Object.fromEntries(entries.sort(([a], [b]) => (a < b ? -1 : 1)))
}

/**
 * Résume une analyse d'axe et complète `rules`. Renvoie `null` si axe n'a évalué
 * aucune règle : ce serait un faux « zéro défaut ».
 */
export function summarizeAxeResults(
  results: AxeSummaryInput,
  rules: Record<string, RuleInfo>,
): Pick<MeasuredView, 'violations' | 'incomplete'> | null {
  const evaluated =
    results.violations.length +
    results.incomplete.length +
    results.passes.length
  if (evaluated === 0) return null
  for (const rule of [...results.violations, ...results.incomplete]) {
    const impact = worstImpact(rule)
    const known = rules[rule.id]
    rules[rule.id] = {
      help: rule.help,
      helpUrl: rule.helpUrl,
      category: categorizeRule(rule.tags),
      impact:
        known &&
        IMPACT_ORDER.indexOf(known.impact) > IMPACT_ORDER.indexOf(impact)
          ? known.impact
          : impact,
    }
  }
  return {
    violations: sortedRecord(
      results.violations.map((rule) => [
        rule.id,
        {
          count: rule.nodes.length,
          examples: rule.nodes.slice(0, MAX_EXAMPLES).map(toExample),
        },
      ]),
    ),
    incomplete: sortedRecord(
      results.incomplete.map((rule) => [rule.id, rule.nodes.length]),
    ),
  }
}

export interface Totals {
  measured: number
  failed: number
  wcag: number
  bestPractice: number
  incomplete: number
}

const isMeasured = (view: ViewResult | undefined): view is MeasuredView =>
  view?.status === 'ok'

function countViewDefects(
  run: A11yRun,
  view: MeasuredView,
  category: RuleCategory,
): number {
  return Object.entries(view.violations)
    .filter(([rule]) => run.rules[rule]?.category === category)
    .reduce((sum, [, { count }]) => sum + count, 0)
}

const sumIncomplete = (view: MeasuredView) =>
  Object.values(view.incomplete).reduce((sum, count) => sum + count, 0)

export function computeTotals(run: A11yRun, viewNames?: string[]): Totals {
  const names = viewNames ?? Object.keys(run.views)
  const totals: Totals = {
    measured: 0,
    failed: 0,
    wcag: 0,
    bestPractice: 0,
    incomplete: 0,
  }
  for (const name of names) {
    const view = run.views[name]
    if (!isMeasured(view)) {
      totals.failed++
      continue
    }
    totals.measured++
    totals.wcag += countViewDefects(run, view, 'wcag')
    totals.bestPractice += countViewDefects(run, view, 'best-practice')
    totals.incomplete += sumIncomplete(view)
  }
  return totals
}

export interface RuleChange {
  view: string
  rule: string
  before: number
  after: number
}

export interface Comparison {
  state: 'absent' | 'illisible' | 'ok'
  previous?: { generatedAt: string; commit: string; environment: string }
  /** Ce qui peut expliquer un écart sans que le site ait changé */
  warnings: string[]
  changes: RuleChange[]
  /** Vue mesurée d'un côté seulement : aucun écart n'est calculé pour elle */
  notComparable: { view: string; reason: string }[]
  /** Totaux sur les seules vues mesurées dans les deux passages */
  before?: Totals
  after?: Totals
}

/** Vérifie qu'un JSON relu est bien un passage dans le format attendu */
const isObject = (value: unknown) => typeof value === 'object' && value !== null

function isViewResult(value: unknown): boolean {
  const view = value as MeasuredView | null
  if (!isObject(view) || view === null) return false
  return (
    (view.status as string) === 'error' ||
    (isObject(view.markers) &&
      isObject(view.violations) &&
      isObject(view.incomplete))
  )
}

/**
 * Tout ce que la comparaison lit : un fichier incomplet doit être signalé comme
 * illisible, pas faire perdre le rapport du passage en cours.
 */
export function isA11yRun(value: unknown): value is A11yRun {
  const run = value as A11yRun | null
  return (
    isObject(run) &&
    run !== null &&
    run.version === A11Y_REPORT_VERSION &&
    isObject(run.views) &&
    isObject(run.rules) &&
    isObject(run.config) &&
    Array.isArray(run.config.tags) &&
    Array.isArray(run.config.excluded) &&
    isObject(run.config.viewport) &&
    Object.values(run.views).every(isViewResult)
  )
}

function configWarnings(previous: A11yRun, current: A11yRun): string[] {
  const warnings: string[] = []
  const was = previous.config
  const now = current.config
  if (was.axeVersion !== now.axeVersion) {
    warnings.push(
      `axe-core est passé de ${was.axeVersion} à ${now.axeVersion} : un écart peut venir de l'outil.`,
    )
  }
  if (was.browser !== now.browser) {
    warnings.push(
      `Le navigateur est passé de ${was.browser} à ${now.browser} : un écart peut venir de l'outil.`,
    )
  }
  if (was.tags.join() !== now.tags.join()) {
    warnings.push(
      `Les règles demandées à axe ont changé (${was.tags.join(', ')} → ${now.tags.join(', ')}) : les totaux ne sont pas comparables.`,
    )
  }
  if (was.excluded.join() !== now.excluded.join()) {
    warnings.push(
      `Les zones exclues de la mesure ont changé (${was.excluded.join(', ') || 'aucune'} → ${now.excluded.join(', ') || 'aucune'}) : les totaux ne sont pas comparables.`,
    )
  }
  if (
    was.viewport.width !== now.viewport.width ||
    was.viewport.height !== now.viewport.height
  ) {
    warnings.push(
      `La taille de fenêtre a changé (${was.viewport.width}×${was.viewport.height} → ${now.viewport.width}×${now.viewport.height}) : les totaux ne sont pas comparables.`,
    )
  }
  if (was.seed !== now.seed) {
    warnings.push(
      `La graine a changé (${was.seed} → ${now.seed}) : les exercices affichés diffèrent.`,
    )
  }
  if (previous.environment !== current.environment) {
    warnings.push(
      `Le passage précédent a été fait en ${previous.environment}, celui-ci en ${current.environment} : le serveur ne sert pas le même contenu (l'accueil affiche ses liens rapides et son carrousel quand la vitrine manque, par exemple).`,
    )
  }
  return warnings
}

export function compareRuns(
  previous: A11yRun | null,
  current: A11yRun,
  state: 'absent' | 'illisible' | 'ok',
): Comparison {
  if (previous === null || state !== 'ok') {
    return {
      state: state === 'ok' ? 'absent' : state,
      warnings: [],
      changes: [],
      notComparable: [],
    }
  }
  const warnings = configWarnings(previous, current)
  const changes: RuleChange[] = []
  const notComparable: Comparison['notComparable'] = []
  const compared: string[] = []
  const names = [
    ...new Set([...Object.keys(current.views), ...Object.keys(previous.views)]),
  ]
  for (const name of names) {
    const was = previous.views[name]
    const now = current.views[name]
    if (was === undefined || now === undefined) {
      notComparable.push({
        view: name,
        reason:
          was === undefined
            ? 'vue absente du passage précédent'
            : 'vue retirée de la liste',
      })
    } else if (was.query !== now.query) {
      notComparable.push({
        view: name,
        reason: `adresse modifiée (${was.query} → ${now.query})`,
      })
    } else if (!isMeasured(was) || !isMeasured(now)) {
      const reasons = []
      if (!isMeasured(was)) reasons.push('en erreur au passage précédent')
      if (!isMeasured(now)) reasons.push('en erreur à ce passage')
      notComparable.push({ view: name, reason: reasons.join(' et ') })
    } else {
      compared.push(name)
      if (was.markers.vitrine !== now.markers.vitrine) {
        warnings.push(
          `Vue ${name} : la vitrine de coopmaths.fr ${now.markers.vitrine ? 'est revenue et remplace' : 'a disparu, remplacée par'} les liens rapides et le carrousel, ce qui peut expliquer un écart.`,
        )
      }
      if (was.markers.degraded !== now.markers.degraded) {
        warnings.push(
          `Vue ${name} : ${now.markers.degraded === null ? 'elle a retrouvé son contenu principal' : `elle a perdu son contenu principal (${now.markers.degraded})`}, ce qui peut expliquer un écart.`,
        )
      }
      const rules = new Set([
        ...Object.keys(was.violations),
        ...Object.keys(now.violations),
      ])
      for (const rule of rules) {
        const before = was.violations[rule]?.count ?? 0
        const after = now.violations[rule]?.count ?? 0
        if (before !== after) changes.push({ view: name, rule, before, after })
      }
    }
  }
  changes.sort(
    (a, b) =>
      b.after - b.before - (a.after - a.before) ||
      a.view.localeCompare(b.view) ||
      a.rule.localeCompare(b.rule),
  )
  return {
    state: 'ok',
    previous: {
      generatedAt: previous.generatedAt,
      commit: previous.commit,
      environment: previous.environment,
    },
    warnings,
    changes,
    notComparable,
    before: computeTotals(previous, compared),
    after: computeTotals(current, compared),
  }
}

export const LIMITS_NOTICE =
  "**Ce rapport mesure, il ne certifie pas : il ne donne aucun taux de conformité RGAA et ne permet pas d'en déduire un.** " +
  "axe-core ne détecte qu'une partie des défauts : il ne dit rien de la pertinence d'un texte ni du vécu avec un lecteur d'écran. " +
  "« 0 défaut » signifie seulement qu'axe-core n'en a pas trouvé."

const escapeCell = (text: string) =>
  text.replace(/\|/g, '\\|').replace(/\s+/g, ' ').trim()

const signed = (value: number) => (value > 0 ? `+${value}` : `${value}`)

const plural = (count: number, one: string, many = `${one}s`) =>
  `${count} ${count > 1 ? many : one}`

interface RuleTotal {
  rule: string
  info: RuleInfo
  count: number
  views: string[]
}

function ruleTotals(run: A11yRun, category: RuleCategory): RuleTotal[] {
  const totals = new Map<string, RuleTotal>()
  for (const [name, view] of Object.entries(run.views)) {
    if (!isMeasured(view)) continue
    for (const [rule, { count }] of Object.entries(view.violations)) {
      const info = run.rules[rule]
      if (info?.category !== category) continue
      const total = totals.get(rule) ?? { rule, info, count: 0, views: [] }
      total.count += count
      total.views.push(name)
      totals.set(rule, total)
    }
  }
  return [...totals.values()].sort(
    (a, b) => b.count - a.count || a.rule.localeCompare(b.rule),
  )
}

function viewTotal(run: A11yRun, view: MeasuredView): number {
  return (
    countViewDefects(run, view, 'wcag') +
    countViewDefects(run, view, 'best-practice')
  )
}

function mostAffectedViews(run: A11yRun, limit: number) {
  return Object.entries(run.views)
    .filter((entry): entry is [string, MeasuredView] => isMeasured(entry[1]))
    .map(([name, view]) => ({ name, total: viewTotal(run, view) }))
    .filter(({ total }) => total > 0)
    .sort((a, b) => b.total - a.total || a.name.localeCompare(b.name))
    .slice(0, limit)
}

function comparisonLine(comparison: Comparison): string {
  if (comparison.state === 'absent') {
    return '- **Évolution** : aucun passage précédent, rien à comparer.'
  }
  if (comparison.state === 'illisible') {
    return '- **Évolution** : le fichier du passage précédent est illisible, rien à comparer.'
  }
  const { before, after, previous, changes, notComparable } = comparison
  if (!before || !after || !previous) return ''
  const skipped = notComparable.length
    ? ` ; ${plural(notComparable.length, 'vue non comparable', 'vues non comparables')}`
    : ''
  const worse = changes.filter((c) => c.after > c.before).length
  const better = changes.filter((c) => c.after < c.before).length
  const detail = changes.length
    ? `WCAG ${signed(after.wcag - before.wcag)}, bonnes pratiques ${signed(after.bestPractice - before.bestPractice)}, à vérifier ${signed(after.incomplete - before.incomplete)} (${worse} hausse${worse > 1 ? 's' : ''}, ${better} baisse${better > 1 ? 's' : ''} par vue et par règle)`
    : `aucun écart de défauts, à vérifier ${signed(after.incomplete - before.incomplete)}`
  return `- **Évolution depuis le ${previous.generatedAt.slice(0, 10)} (${previous.commit})** : ${detail}${skipped}.`
}

/** Le résumé court, placé en tête du rapport et affiché dans le terminal */
export function renderSummary(run: A11yRun, comparison: Comparison): string {
  const totals = computeTotals(run)
  const total = totals.measured + totals.failed
  const lines = [
    `- **Passage** : ${run.generatedAt.slice(0, 16).replace('T', ' ')} UTC, commit ${run.commit}, environnement ${run.environment}, axe-core ${run.config.axeVersion}.`,
    `- **Vues mesurées** : ${totals.measured} sur ${total}.`,
  ]
  const failed = Object.entries(run.views).filter(
    ([, view]) => !isMeasured(view),
  )
  if (failed.length > 0) {
    lines.push(
      `- **⚠️ ${plural(failed.length, 'vue en erreur', 'vues en erreur')}, non ${failed.length > 1 ? 'mesurées' : 'mesurée'} (ce n'est pas zéro défaut)** : ${failed.map(([name]) => name).join(', ')}.`,
    )
  }
  if (totals.measured === 0) {
    lines.push(
      "- **Aucune vue mesurée : ce rapport ne dit rien de l'état du site.**",
    )
    return lines.join('\n')
  }
  const degraded = Object.entries(run.views).filter(
    ([, view]) => isMeasured(view) && view.markers.degraded !== null,
  )
  if (degraded.length > 0) {
    lines.push(
      `- **⚠️ Mesurées sans leur contenu principal** : ${degraded.map(([name, view]) => `${name} (${(view as MeasuredView).markers.degraded})`).join(', ')}.`,
    )
  }
  const scope =
    failed.length > 0 ? ` (sur les ${totals.measured} vues mesurées)` : ''
  const wcagRules = ruleTotals(run, 'wcag').length
  const practiceRules = ruleTotals(run, 'best-practice').length
  lines.push(
    `- **Défauts WCAG** : ${plural(totals.wcag, 'élément')}, ${plural(wcagRules, 'règle')}${scope}.`,
    `- **Bonnes pratiques** : ${plural(totals.bestPractice, 'élément')}, ${plural(practiceRules, 'règle')}${scope}.`,
    `- **À vérifier à la main** (axe n'a pas su trancher) : ${plural(totals.incomplete, 'élément')}.`,
  )
  const affected = mostAffectedViews(run, 3)
  if (affected.length > 0) {
    lines.push(
      `- **Vues les plus touchées** : ${affected.map(({ name, total }) => `${name} (${total})`).join(', ')}.`,
    )
  }
  lines.push(comparisonLine(comparison))
  return lines.filter(Boolean).join('\n')
}

function renderComparison(run: A11yRun, comparison: Comparison): string[] {
  if (comparison.state !== 'ok') return []
  const out = ['', '## Évolution depuis le passage précédent', '']
  for (const warning of comparison.warnings) out.push(`> ⚠️ ${warning}`, '')
  if (comparison.changes.length === 0) {
    out.push('Aucun écart de défauts sur les vues comparables.', '')
  } else {
    out.push(
      '| Vue | Règle | Catégorie | Avant | Après | Écart |',
      '| --- | --- | --- | ---: | ---: | ---: |',
    )
    for (const { view, rule, before, after } of comparison.changes) {
      const category =
        run.rules[rule]?.category === 'wcag' ? 'WCAG' : 'Bonne pratique'
      out.push(
        `| ${view} | \`${rule}\` | ${category} | ${before} | ${after} | ${signed(after - before)} |`,
      )
    }
    out.push('')
  }
  if (comparison.notComparable.length > 0) {
    out.push('Vues non comparables, sans écart calculé :', '')
    for (const { view, reason } of comparison.notComparable) {
      out.push(`- ${view} : ${reason}.`)
    }
    out.push('')
  }
  return out
}

function renderRuleTable(run: A11yRun, category: RuleCategory): string[] {
  const rules = ruleTotals(run, category)
  if (rules.length === 0) {
    return ['Aucun défaut relevé par axe-core sur les vues mesurées.', '']
  }
  const out = [
    '| Règle | Ce qui est demandé | Impact | Éléments | Vues |',
    '| --- | --- | --- | ---: | ---: |',
  ]
  for (const { rule, info, count, views } of rules) {
    const impact = IMPACT_LABELS[info.impact] ?? info.impact
    out.push(
      `| [\`${rule}\`](${info.helpUrl}) | ${escapeCell(info.help)} | ${impact} | ${count} | ${views.length} |`,
    )
  }
  out.push('')
  return out
}

function renderViewTable(run: A11yRun): string[] {
  const out = [
    '| Vue | État | WCAG | Bonnes pratiques | À vérifier | Remarques |',
    '| --- | --- | ---: | ---: | ---: | --- |',
  ]
  for (const [name, view] of Object.entries(run.views)) {
    if (!isMeasured(view)) {
      out.push(
        `| ${name} | ⚠️ erreur | non mesuré | non mesuré | non mesuré | ${escapeCell(view.error.kind)} |`,
      )
      continue
    }
    out.push(
      `| ${name} | ${view.markers.degraded === null ? 'mesurée' : '⚠️ sans son contenu'} | ${countViewDefects(run, view, 'wcag')} | ${countViewDefects(run, view, 'best-practice')} | ${sumIncomplete(view)} | ${escapeCell(view.notes.join(' ; '))} |`,
    )
  }
  out.push('')
  return out
}

function renderViewDetails(run: A11yRun): string[] {
  const out: string[] = []
  for (const [name, view] of Object.entries(run.views)) {
    if (!isMeasured(view) || Object.keys(view.violations).length === 0) continue
    out.push(
      `### ${name}`,
      '',
      `Adresse : \`${view.query || '(racine)'}\``,
      '',
      '| Règle | Catégorie | Éléments | Premier exemple |',
      '| --- | --- | ---: | --- |',
    )
    for (const [rule, { count, examples }] of Object.entries(view.violations)) {
      const category =
        run.rules[rule]?.category === 'wcag' ? 'WCAG' : 'Bonne pratique'
      const example = examples[0] ? `\`${escapeCell(examples[0].target)}\`` : ''
      out.push(`| \`${rule}\` | ${category} | ${count} | ${example} |`)
    }
    out.push('')
  }
  return out
}

export function renderMarkdown(run: A11yRun, comparison: Comparison): string {
  const failed = Object.entries(run.views).filter(
    (entry): entry is [string, FailedView] => !isMeasured(entry[1]),
  )
  const out = [
    "# Rapport d'accessibilité automatique",
    '',
    `> ${LIMITS_NOTICE}`,
    '',
    '## Résumé',
    '',
    renderSummary(run, comparison),
    ...renderComparison(run, comparison),
  ]
  if (failed.length > 0) {
    out.push(
      '',
      '## Vues en erreur',
      '',
      "Ces vues n'ont pas été mesurées. Elles n'entrent dans aucun total.",
      '',
      '| Vue | Type | Message |',
      '| --- | --- | --- |',
    )
    for (const [name, view] of failed) {
      out.push(
        `| ${name} | ${view.error.kind} | ${escapeCell(view.error.message)} |`,
      )
    }
  }
  out.push(
    '',
    '## Défauts WCAG par règle',
    '',
    ...renderRuleTable(run, 'wcag'),
    '## Bonnes pratiques par règle',
    '',
    "Ces règles d'axe-core ne correspondent à aucun critère WCAG.",
    '',
    ...renderRuleTable(run, 'best-practice'),
    '## Défauts par vue',
    '',
    ...renderViewTable(run),
    '## Détail par vue',
    '',
    ...renderViewDetails(run),
    '## Conditions de mesure',
    '',
    `- Serveur : \`${run.baseUrl}\`.`,
    `- Navigateur : ${run.config.browser}, fenêtre ${run.config.viewport.width}×${run.config.viewport.height}, thème clair, contexte neuf pour chaque vue.`,
    `- Graine : \`${run.config.seed}\`. Règles axe-core : ${run.config.tags.map((tag) => `\`${tag}\``).join(', ')}.`,
    `- Zones exclues : ${run.config.excluded.map((selector) => `\`${selector}\``).join(', ')} (la vitrine de coopmaths.fr, sur l'accueil).`,
    "- Les animations ne sont pas figées : sur une vue signalée, un écart d'un passage à l'autre sur `color-contrast` peut venir de l'instant de la mesure.",
    "- Chaque vue est mesurée dans son état initial : ni les questions de la course aux nombres ou du diaporama après « Démarrer », ni les menus et fenêtres qu'il faut ouvrir.",
    '',
    'Voir [la documentation du rapport](../documentation/tests/rapport-accessibilite.md).',
    '',
  )
  return out.join('\n')
}
