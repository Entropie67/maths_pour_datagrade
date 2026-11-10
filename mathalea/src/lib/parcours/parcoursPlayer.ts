/**
 * Passage d'un parcours comme un élève, dans le navigateur : séances, essais,
 * bilan et ouverture des paliers. Logique reprise de l'application MathALÉA
 * (mathalea-mobile, src/lib/progression.ts et objectifs.ts), sans stockage :
 * l'aperçu de l'éditeur garde tout en mémoire.
 */
import {
  DEFAULT_THRESHOLD,
  levelGroups,
  type Access,
  type Parcours,
  type Step,
} from './parcoursTypes'

/** Vérification d'une question : seule la première compte */
export interface Attempt {
  step: number
  question: number
  correct: boolean
  points: number
  total: number
  answers: Record<string, string>
}

export interface Session {
  parcours: Parcours // version figée : modifier le parcours ne change pas la séance en cours
  steps: number[] // étapes du parcours travaillées dans cette séance
  seeds: Record<number, string>
  questionCounts: Record<number, number>
  position: number // rang de la question affichée
  drafts: Record<string, Record<string, string>> // clé « étape-question »
  attempts: Attempt[]
  submitted?: boolean // validation à la fin : tentative soumise
  order?: string[] // questions mélangées (clés « étape-question »), tirées une fois
  // Questions sans réponse à saisir : hors du score ; vrai quand la correction a été ouverte
  paper?: Record<string, boolean>
}

export interface StepResult {
  points: number // somme des scores de questions (chacune entre 0 et 1)
  total: number // nombre de questions
  complete: boolean
}

export const questionKey = (step: number, question: number) =>
  `${step}-${question}`

/** Titre vu par l'élève : « Exercice n » si l'enseignant l'a masqué */
export const studentTitle = (s: Step, i: number) =>
  s.titreMasque ? `Exercice ${i + 1}` : s.titre

/** Questions mélangées : sans effet avec une page par exercice */
export const isShuffled = (p: Pick<Parcours, 'melanger' | 'presentation'>) =>
  !!p.melanger && p.presentation !== 'un_exo_par_page'

export function newSession(
  parcours: Parcours,
  steps = parcours.etapes.map((_, i) => i),
): Session {
  return {
    parcours: JSON.parse(JSON.stringify(parcours)),
    steps,
    seeds: {},
    questionCounts: {},
    position: 0,
    drafts: {},
    attempts: [],
  }
}

/** Questions de la séance, exercice par exercice */
export function sessionQuestions(s: Session) {
  return s.steps.flatMap((step) =>
    Array.from({ length: s.questionCounts[step] ?? 0 }, (_, question) => ({
      step,
      question,
    })),
  )
}

/** Nombre pseudo-aléatoire entre 0 et 1 tiré d'une graine (mulberry32) */
function generator(seed: string) {
  let h = 1779033703
  for (let i = 0; i < seed.length; i++)
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353)
  let a = h >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Copie mélangée (Fisher-Yates) : même graine, même ordre */
export function shuffle<T>(list: T[], seed: string): T[] {
  const random = generator(seed)
  const t = [...list]
  for (let i = t.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[t[i], t[j]] = [t[j], t[i]]
  }
  return t
}

/** Tire l'ordre des questions une fois qu'elles sont toutes préparées */
export function fixOrder(s: Session, seed = `${Math.random()}`) {
  if (!isShuffled(s.parcours)) {
    s.order = undefined
    return
  }
  const keys = sessionQuestions(s).map((q) => questionKey(q.step, q.question))
  const valid =
    s.order &&
    s.order.length === keys.length &&
    keys.every((k) => s.order!.includes(k))
  if (!valid) s.order = shuffle(keys, seed)
}

/** Questions dans l'ordre d'affichage : mélangé si la séance a un ordre tiré */
export function orderedQuestions(s: Session) {
  const questions = sessionQuestions(s)
  if (!s.order || s.order.length !== questions.length) return questions
  const rank = new Map(s.order.map((k, i) => [k, i]))
  if (questions.some((q) => !rank.has(questionKey(q.step, q.question))))
    return questions
  return [...questions].sort(
    (a, b) =>
      rank.get(questionKey(a.step, a.question))! -
      rank.get(questionKey(b.step, b.question))!,
  )
}

/** Première vérification de chaque question : c'est elle qui compte */
export function firstAttempts(s: Session) {
  const first = new Map<string, Attempt>()
  for (const a of s.attempts) {
    const key = questionKey(a.step, a.question)
    if (!first.has(key)) first.set(key, a)
  }
  return first
}

/** Score d'une question entre 0 et 1 */
export const score = (a: Attempt | undefined) =>
  a && a.total > 0 ? a.points / a.total : a?.correct ? 1 : 0

/** Question à faire sur papier : ni réponse ni score */
export const onPaper = (s: Session, step: number, question: number) =>
  s.paper?.[questionKey(step, question)] !== undefined

/** Bilan d'une séance : score par exercice, questions passées */
export function summary(s: Session) {
  const first = firstAttempts(s)
  const all = sessionQuestions(s)
  const questions = all.filter((q) => !onPaper(s, q.step, q.question))
  const done = (q: { step: number; question: number }) =>
    first.has(questionKey(q.step, q.question))
  const byStep = s.steps.map((step) => {
    const qs = questions.filter((q) => q.step === step)
    const answered = qs.filter(done)
    const points = answered.reduce(
      (a, q) => a + score(first.get(questionKey(q.step, q.question))),
      0,
    )
    const paper = all.filter(
      (q) => q.step === step && onPaper(s, q.step, q.question),
    )
    const seen = paper.filter(
      (q) => s.paper![questionKey(q.step, q.question)],
    ).length
    return {
      step,
      points,
      total: qs.length,
      answered: answered.length,
      paper: paper.length,
      seen,
    }
  })
  const points = byStep.reduce((a, e) => a + e.points, 0)
  const total = byStep.reduce((a, e) => a + e.total, 0)
  return {
    byStep,
    points,
    total,
    // Rien à réussir (tout sur papier) : rien de manqué
    percentage: total > 0 ? Math.round((100 * points) / total) : 100,
    correct: [...first.values()].filter((a) => score(a) === 1).length,
    skipped: questions.filter((q) => !done(q)),
  }
}

/** Résultats après une séance : le dernier passage de chaque exercice compte */
export function finishSession(
  results: Record<number, StepResult>,
  s: Session,
): Record<number, StepResult> {
  const r = { ...results }
  for (const e of summary(s).byStep)
    r[e.step] = {
      points: e.points,
      total: e.total,
      complete: e.answered === e.total,
    }
  return r
}

/** Paliers du parcours (un seul sans paliers valides) et leur état pour l'élève */
export function levelStates(
  p: Parcours,
  results: Record<number, StepResult>,
  now = Date.now(),
) {
  const groups = levelGroups(p)
  const withLevels = groups.length > 1
  const levels = groups.map((steps, k) => {
    const l = withLevels ? p.paliers![k] : undefined
    return {
      titre: l?.titre ?? '',
      steps,
      access: (k === 0 ? 'libre' : (l?.acces ?? 'libre')) as Access,
      threshold: l?.seuil ?? DEFAULT_THRESHOLD,
      ressource: l?.ressource,
      pause: l?.pause,
      opening: l?.ouverture,
      // Fiche du palier ; celle du parcours compte pour le premier (ou sans paliers)
      fiche: l?.fiche ?? (k === 0 ? p.fiche : undefined),
    }
  })
  const progress = levels.map((x) => {
    const rs = x.steps.map((i) => results[i])
    const points = rs.reduce((a, r) => a + (r?.points ?? 0), 0)
    const total = rs.reduce((a, r) => a + (r?.total ?? 0), 0)
    return {
      finished: rs.length > 0 && rs.every((r) => r?.complete),
      done: rs.filter((r) => r).length,
      percentage: total > 0 ? Math.round((100 * points) / total) : 100,
    }
  })
  // Date d'ouverture pas encore atteinte : fermé, quel que soit le seuil
  const beforeOpening = levels.map(
    (x) => !!x.opening && now < Date.parse(x.opening),
  )
  const open: boolean[] = []
  levels.forEach((x, k) => {
    if (beforeOpening[k]) return open.push(false)
    if (k === 0 || x.access !== 'seuil') return open.push(true)
    open.push(
      open[k - 1] &&
        progress[k - 1].finished &&
        progress[k - 1].percentage >= x.threshold,
    )
  })
  return levels.map((x, k) => {
    const next = levels[k + 1]
    const expected =
      next?.access === 'seuil' ? next.threshold : DEFAULT_THRESHOLD
    return {
      ...x,
      ...progress[k],
      open: open[k],
      beforeOpening: beforeOpening[k],
      toReview: progress[k].finished && progress[k].percentage < expected,
    }
  })
}

export type LevelState = ReturnType<typeof levelStates>[number]

/** Ce qui manque pour ouvrir un palier fermé, d'après le précédent */
export function levelCondition(
  x: LevelState,
  previous: LevelState,
  dateLabel: (opening: string) => string,
) {
  const date = x.beforeOpening ? `à partir du ${dateLabel(x.opening!)}` : ''
  const reached = previous.finished && previous.percentage >= x.threshold
  const threshold =
    x.access === 'seuil' && !reached
      ? `au moins ${x.threshold} % (${previous.finished ? `tu as ${previous.percentage} %` : 'termine tous ses exercices'})`
      : ''
  return date && threshold ? `${date}, avec ${threshold}` : date || threshold
}
