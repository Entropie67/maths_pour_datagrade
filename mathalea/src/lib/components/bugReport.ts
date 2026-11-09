/**
 * Construction des signalements de bug sur un exercice.
 *
 * Deux canaux sont proposés à l'utilisateur :
 * - un mail à l'équipe (ouvert à toutes et tous : élèves, parents, enseignants) ;
 * - un ticket sur la forge (réservé de fait aux personnes disposant d'un compte,
 *   typiquement un compte académique).
 *
 * Le texte du signalement est identique dans les deux cas afin qu'il puisse aussi
 * être simplement copié/collé ailleurs.
 */

export const BUG_REPORT_EMAIL = 'contact@coopmaths.fr'
export const FORGE_NEW_ISSUE_URL =
  'https://forge.apps.education.fr/coopmaths/mathalea/-/issues/new'

export type BugReportContext = {
  /** Référence de l'exercice (ex : `3L11`) */
  exerciceId?: string
  /** Titre de l'exercice (ex : `Calcul littéral`) */
  exerciceTitle?: string
  /** Indice (0-based) de l'exercice dans la série */
  exerciceIndex?: number
  /** URL complète de la page au moment du signalement */
  url?: string
  /**
   * URL de l'exercice seul (même graine, mêmes options), utile quand la
   * série en contient plusieurs
   */
  exerciseUrl?: string
  /** `navigator.userAgent` */
  userAgent?: string
  /** Date du signalement */
  date?: Date
}

/**
 * Nom et version du navigateur déduits de l'user agent.
 * L'ordre des tests est important : les navigateurs dérivés de Chromium
 * annoncent tous `Chrome/` dans leur user agent.
 * @author Rémi Angot
 */
export function detectBrowser(userAgent: string): string {
  if (!userAgent) return 'inconnu'
  const patterns: Array<[string, RegExp]> = [
    ['Edge', /\b(?:Edg|Edge|EdgA|EdgiOS)\/([\d.]+)/],
    ['Opera', /\bOPR\/([\d.]+)/],
    ['Samsung Internet', /\bSamsungBrowser\/([\d.]+)/],
    ['Firefox', /\bFirefox\/([\d.]+)/],
    ['Firefox', /\bFxiOS\/([\d.]+)/],
    ['Chrome', /\bCriOS\/([\d.]+)/],
    ['Chrome', /\bChrome\/([\d.]+)/],
  ]
  for (const [name, pattern] of patterns) {
    const found = userAgent.match(pattern)
    if (found) return `${name} ${found[1]}`
  }
  if (/\bSafari\//.test(userAgent)) {
    const version = userAgent.match(/\bVersion\/([\d.]+)/)
    return version ? `Safari ${version[1]}` : 'Safari'
  }
  return 'inconnu'
}

/**
 * Système d'exploitation déduit de l'user agent.
 * @author Rémi Angot
 */
export function detectOs(userAgent: string): string {
  if (!userAgent) return 'inconnu'
  if (/\bAndroid\b/.test(userAgent)) return 'Android'
  if (/\biPhone\b|\biPod\b/.test(userAgent)) return 'iOS'
  if (/\biPad\b/.test(userAgent)) return 'iPadOS'
  if (/\bWindows NT\b/.test(userAgent)) return 'Windows'
  if (/\bCrOS\b/.test(userAgent)) return 'ChromeOS'
  if (/\bMac OS X\b|\bMacintosh\b/.test(userAgent)) return 'macOS'
  if (/\bLinux\b/.test(userAgent)) return 'Linux'
  return 'inconnu'
}

/**
 * Date au format `jj/mm/aaaa`.
 * @author Rémi Angot
 */
export function formatBugReportDate(date: Date): string {
  const jour = date.getDate().toString().padStart(2, '0')
  const mois = (date.getMonth() + 1).toString().padStart(2, '0')
  return `${jour}/${mois}/${date.getFullYear()}`
}

/**
 * Titre du signalement.
 * @author Rémi Angot
 */
export function buildBugReportTitle({
  exerciceId,
  exerciceTitle,
  exerciceIndex,
}: BugReportContext): string {
  const reference = exerciceId?.trim() ?? ''
  const titre = exerciceTitle?.trim() ?? ''
  const rang =
    exerciceIndex != null && exerciceIndex >= 0
      ? ` (ex n°${exerciceIndex + 1})`
      : ''
  if (reference && titre)
    return `Bug dans l'exercice ${reference}${rang} : ${titre}`
  const designation = titre || reference
  return designation
    ? `Bug dans l'exercice${rang} : ${designation}`
    : 'Bug dans un exercice'
}

/**
 * Corps du signalement, en markdown (lisible tel quel dans un mail,
 * mis en forme dans un ticket de la forge).
 * @author Rémi Angot
 */
export function buildBugReportDescription({
  exerciceId,
  url,
  exerciseUrl,
  userAgent = '',
  date = new Date(),
}: BugReportContext): string {
  return [
    '## Description du problème',
    '',
    '[à compléter par l’utilisateur]',
    '',
    '## Contexte',
    '',
    `- URL : ${url || 'inconnue'}`,
    ...(exerciseUrl ? [`- URL de l'exercice seul : ${exerciseUrl}`] : []),
    `- Exercice : ${exerciceId || 'inconnu'}`,
    `- Navigateur : ${detectBrowser(userAgent)}`,
    `- Système : ${detectOs(userAgent)}`,
    `- Date : ${formatBugReportDate(date)}`,
    '',
  ].join('\n')
}

/**
 * Lien `mailto:` pré-rempli avec le titre et la description.
 * @author Rémi Angot
 */
export function buildMailtoUrl(title: string, description: string): string {
  const params = new URLSearchParams({ subject: title, body: description })
  // URLSearchParams encode les espaces avec `+`, ce que les clients mail
  // n'interprètent pas dans un mailto:
  return `mailto:${BUG_REPORT_EMAIL}?${params.toString().replace(/\+/g, '%20')}`
}

/**
 * Lien de création d'un ticket sur la forge, pré-rempli avec le titre et la description.
 * @author Rémi Angot
 */
export function buildForgeIssueUrl(title: string, description: string): string {
  const params = new URLSearchParams({
    'issue[title]': title,
    'issue[description]': description,
  })
  return `${FORGE_NEW_ISSUE_URL}?${params.toString()}`
}
