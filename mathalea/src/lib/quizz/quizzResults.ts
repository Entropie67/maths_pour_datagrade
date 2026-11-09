import type { QuizzPlayer, QuizzScoring } from '../../modules/quizz/types'

/**
 * Export CSV des résultats d'une partie multi-joueurs.
 *
 * Le serveur ne stocke rien : à la fin de la partie (statut FINISHED), il
 * envoie au seul manager l'événement `game:results` (classement complet +
 * réponses par question) et le CSV est construit ici, dans le navigateur de
 * l'enseignant.
 */

/** Enregistrement d'une question jouée (charge `game:results`). */
export interface QuizzResultsQuestion {
  question: string
  answers: string[]
  solutions: number[]
  correction: string
  /** Nombre de joueurs ayant choisi chaque proposition. */
  responses: Record<number, number>
}

/** Réponse d'un joueur à une question (null si question non jouée pour lui). */
export interface QuizzResultsAnswer {
  answerIds: number[] | null
  correct: boolean
  points: number
}

export interface QuizzGameResults {
  subject: string
  scoring: QuizzScoring
  questions: QuizzResultsQuestion[]
  players: Array<{
    player: QuizzPlayer
    rank: number
    answers: Array<QuizzResultsAnswer | null>
  }>
}

/** Lettre d'affichage d'une proposition (0 → A, 1 → B…). */
const lettre = (index: number): string => String.fromCharCode(65 + index)

/**
 * Convertit un fragment HTML (KaTeX inclus) en texte plat pour une cellule
 * CSV : les formules KaTeX sont dédupliquées (le rendu MathML, masqué à
 * l'écran, répéterait le contenu du rendu HTML).
 */
export function stripHtmlForCsv(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  for (const node of doc.querySelectorAll('.katex-mathml')) node.remove()
  return (doc.body.textContent ?? '').replace(/\s+/g, ' ').trim()
}

/** Échappe une cellule CSV (séparateur « ; », convention Excel française). */
function csvCell(value: string | number): string {
  const text = String(value)
  if (/[;\n"]/.test(text)) return `"${text.replaceAll('"', '""')}"`
  return text
}

const csvLine = (cells: Array<string | number>): string =>
  cells.map(csvCell).join(';')

/**
 * Construit le contenu CSV (séparateur « ; ») des résultats :
 * informations de la partie, points par question, réponses détaillées,
 * puis le rappel des questions avec l'histogramme des choix.
 */
export function buildQuizzResultsCsv(results: QuizzGameResults): string {
  const lines: string[] = []
  const questionNumbers = results.questions.map((_, index) => `Q${index + 1}`)

  // Informations de la partie
  lines.push(csvLine(['Quizz', results.subject]))
  lines.push(csvLine(['Date', new Date().toLocaleString('fr-FR')]))
  lines.push(csvLine(['Mode de score', results.scoring]))
  lines.push(csvLine(['Joueurs', results.players.length]))
  lines.push('')

  // Points par question
  lines.push(csvLine(['Points par question']))
  lines.push(csvLine(['Rang', 'Pseudo', 'Total', ...questionNumbers]))
  for (const { player, rank, answers } of results.players) {
    const points = results.questions.map(
      (_, index) => answers[index]?.points ?? 0,
    )
    lines.push(csvLine([rank, player.username, player.points, ...points]))
  }
  lines.push('')

  // Réponses détaillées (lettres choisies)
  lines.push(csvLine(['Réponses détaillées']))
  lines.push(csvLine(['Rang', 'Pseudo', ...questionNumbers]))
  for (const { player, rank, answers } of results.players) {
    const choix = results.questions.map((_, index) => {
      const answer = answers[index]
      if (answer == null || answer.answerIds == null) return '—'
      return answer.answerIds.map(lettre).join(',')
    })
    lines.push(csvLine([rank, player.username, ...choix]))
  }
  lines.push('')

  // Rappel des questions et histogramme des choix
  lines.push(csvLine(['Questions']))
  const maxAnswers = Math.max(
    0,
    ...results.questions.map((question) => question.answers.length),
  )
  lines.push(
    csvLine([
      'N°',
      'Question',
      'Bonne(s) réponse(s)',
      ...Array.from({ length: maxAnswers }, (_, i) => `Choix ${lettre(i)}`),
    ]),
  )
  for (const [index, question] of results.questions.entries()) {
    lines.push(
      csvLine([
        index + 1,
        stripHtmlForCsv(question.question),
        question.solutions.map(lettre).join(','),
        ...Array.from({ length: maxAnswers }, (_, i) =>
          i < question.answers.length ? (question.responses[i] ?? 0) : '',
        ),
      ]),
    )
  }
  return lines.join('\r\n')
}

/** Nom de fichier de l'export : titre du quizz assaini + date. */
function csvFileName(subject: string): string {
  const base =
    subject
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase() || 'quizz'
  const date = new Date().toISOString().slice(0, 10)
  return `quizz-${base}-${date}.csv`
}

/** Déclenche le téléchargement du CSV des résultats (BOM pour Excel). */
export function downloadQuizzResultsCsv(results: QuizzGameResults): void {
  const blob = new Blob(['\uFEFF' + buildQuizzResultsCsv(results)], {
    type: 'text/csv;charset=utf-8',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = csvFileName(results.subject)
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
