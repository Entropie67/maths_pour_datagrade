import type {
  OmrBox,
  OmrBoxReading,
  OmrEvaluation,
  OmrQuestion,
} from './omrTypes'

/**
 * Notation d'une copie à partir des cases lues.
 *
 * Le principe qui gouverne tout ce fichier : **une lecture douteuse ne se
 * transforme jamais en note**. Dès qu'une case d'une question est ambiguë, ou
 * que la réponse est structurellement impossible (deux cases cochées là où on
 * en attend une), la question ressort avec un statut à arbitrer plutôt qu'avec
 * un zéro. C'est au professeur de trancher, pas au seuil de binarisation.
 */

/** Ce qui a pu être conclu d'une question. */
export type OmrQuestionStatut =
  /** Réponse lue sans ambiguïté */
  | 'lu'
  /** Au moins une case entre les deux seuils : à arbitrer */
  | 'ambigu'
  /** Aucune case cochée */
  | 'sansReponse'
  /** Plusieurs cases cochées là où une seule est attendue */
  | 'multiple'
  /** La page portant la question n'a pas été retrouvée dans le scan */
  | 'pageManquante'

/** Note et diagnostic d'une question. */
export interface OmrQuestionResult {
  qid: string
  statut: OmrQuestionStatut
  points: number
  pointsMax: number
  /** Ce qui a été lu : lettres cochées, valeur numérique reconstituée… */
  reponse?: string
}

/** Bilan d'une copie. */
export interface OmrCopieResult {
  copieId: string
  eleve: { id: string; nom: string }
  questions: OmrQuestionResult[]
  points: number
  pointsMax: number
  /** Rangs, dans la copie, des pages absentes du scan */
  pagesManquantes: number[]
  /** Nombre de questions demandant un arbitrage */
  aArbitrer: number
}

/** Barème d'un QCM à choix multiples, aux conventions d'AMC. */
type Bareme = NonNullable<OmrQuestion['bareme']>

/**
 * Note un QCM à choix multiples.
 *
 * Sans barème explicite, la règle est le tout ou rien : toutes les bonnes
 * cases cochées, aucune mauvaise. Avec un barème, on suit les conventions
 * d'AMC — `b` points par case correctement traitée (bonne cochée ou mauvaise
 * laissée vide), `m` (négatif) par case mal traitée, le tout borné par `p` et
 * `P` — exprimées ici dans les points de la question.
 */
function noterQcmMult(
  boxes: readonly OmrBox[],
  cochees: ReadonlySet<string>,
  pointsMax: number,
  bareme?: Bareme,
): number {
  const toutJuste = boxes.every((box) => box.correct === cochees.has(box.id))
  if (bareme == null || bareme.mz === true) return toutJuste ? pointsMax : 0

  const b = bareme.b ?? 1
  const m = bareme.m ?? 0
  let total = 0
  for (const box of boxes) {
    total += box.correct === cochees.has(box.id) ? b : m
  }
  const plancher = bareme.p ?? 0
  const plafond = bareme.P ?? pointsMax
  return Math.min(plafond, Math.max(plancher, total))
}

/**
 * Reconstitue une réponse numérique : une case cochée par colonne de chiffres.
 *
 * Une colonne sans case cochée, ou avec plusieurs, rend la réponse illisible —
 * on le signale plutôt que de deviner.
 */
function lireNumerique(
  boxes: readonly OmrBox[],
  cochees: ReadonlySet<string>,
): { valeur: string; attendue: string; statut: OmrQuestionStatut } {
  // les identifiants de cases valent `qid.colonne_ligne` (voir `idCase`)
  const colonnes = new Map<string, OmrBox[]>()
  for (const box of boxes) {
    const colonne = box.id.slice(box.id.lastIndexOf('.') + 1).split('_')[0]
    const liste = colonnes.get(colonne) ?? []
    liste.push(box)
    colonnes.set(colonne, liste)
  }
  const cles = [...colonnes.keys()].sort((a, b) => Number(a) - Number(b))

  let valeur = ''
  let attendue = ''
  let statut: OmrQuestionStatut = 'lu'
  for (const cle of cles) {
    const casesColonne = colonnes.get(cle) as OmrBox[]
    attendue += casesColonne.find((box) => box.correct)?.valeur ?? '?'
    const marquees = casesColonne.filter((box) => cochees.has(box.id))
    if (marquees.length === 1) valeur += marquees[0].valeur ?? '?'
    else {
      valeur += marquees.length === 0 ? '_' : '*'
      if (statut === 'lu') {
        statut = marquees.length === 0 ? 'sansReponse' : 'multiple'
      }
    }
  }
  return { valeur, attendue, statut }
}

/** Lettre affichée pour une case de QCM : A, B, C… selon son rang. */
function lettre(index: number): string {
  return String.fromCharCode(65 + index)
}

/**
 * Note une question à partir des cases qui la composent.
 *
 * @param lectures lectures indexées par identifiant de case
 */
export function noterQuestion(
  question: OmrQuestion,
  boxes: readonly OmrBox[],
  lectures: ReadonlyMap<string, OmrBoxReading>,
): OmrQuestionResult {
  const base = { qid: question.qid, pointsMax: question.points }

  const manquantes = boxes.filter((box) => !lectures.has(box.id))
  if (boxes.length === 0 || manquantes.length > 0) {
    return { ...base, statut: 'pageManquante', points: 0 }
  }

  const ambigue = boxes.some(
    (box) => lectures.get(box.id)?.status === 'ambigue',
  )
  const cochees = new Set(
    boxes
      .filter((box) => lectures.get(box.id)?.status === 'cochee')
      .map((box) => box.id),
  )

  if (question.type === 'AMCNum') {
    const { valeur, attendue, statut } = lireNumerique(boxes, cochees)
    const reponse = valeur
    if (ambigue) return { ...base, statut: 'ambigu', points: 0, reponse }
    if (statut !== 'lu') return { ...base, statut, points: 0, reponse }
    return {
      ...base,
      statut: 'lu',
      points: valeur === attendue ? question.points : 0,
      reponse,
    }
  }

  if (question.type === 'AMCOpen') {
    // c'est le correcteur qui noircit une case ; sa valeur est la note
    const marquees = boxes.filter((box) => cochees.has(box.id))
    if (ambigue) return { ...base, statut: 'ambigu', points: 0 }
    if (marquees.length === 0) {
      return { ...base, statut: 'sansReponse', points: 0 }
    }
    if (marquees.length > 1) return { ...base, statut: 'multiple', points: 0 }
    const points = Number(marquees[0].valeur ?? 0)
    return {
      ...base,
      statut: 'lu',
      points: Number.isFinite(points) ? points : 0,
      reponse: marquees[0].valeur,
    }
  }

  const reponse = boxes
    .map((box, index) => (cochees.has(box.id) ? lettre(index) : ''))
    .filter((l) => l !== '')
    .join('')
  if (ambigue) return { ...base, statut: 'ambigu', points: 0, reponse }

  if (question.type === 'qcmMono') {
    const marquees = boxes.filter((box) => cochees.has(box.id))
    if (marquees.length === 0) {
      return { ...base, statut: 'sansReponse', points: 0, reponse }
    }
    if (marquees.length > 1) {
      return { ...base, statut: 'multiple', points: 0, reponse }
    }
    return {
      ...base,
      statut: 'lu',
      points: marquees[0].correct ? question.points : 0,
      reponse,
    }
  }

  return {
    ...base,
    statut: 'lu',
    points: noterQcmMult(boxes, cochees, question.points, question.bareme),
    reponse,
  }
}

/**
 * Note une copie entière.
 *
 * @param lectures toutes les cases lues pour cette copie, quelle que soit la page
 * @param pagesLues rangs, dans la copie, des pages effectivement analysées
 */
export function noterCopie(
  evaluation: OmrEvaluation,
  copieId: string,
  lectures: readonly OmrBoxReading[],
  pagesLues: readonly number[],
): OmrCopieResult {
  const copie = evaluation.copies.find((c) => c.copieId === copieId)
  if (copie == null) {
    throw new Error(`copie inconnue : ${copieId}`)
  }
  const boxes = evaluation.layouts[copie.layoutId] ?? []
  const parId = new Map(lectures.map((lecture) => [lecture.id, lecture]))
  const parQuestion = new Map<string, OmrBox[]>()
  for (const box of boxes) {
    const liste = parQuestion.get(box.qid) ?? []
    liste.push(box)
    parQuestion.set(box.qid, liste)
  }

  const questions = evaluation.questions.map((question) =>
    noterQuestion(question, parQuestion.get(question.qid) ?? [], parId),
  )
  const attendues = new Set(boxes.map((box) => box.page))
  const pagesManquantes = [...attendues]
    .filter((page) => !pagesLues.includes(page))
    .sort((a, b) => a - b)

  return {
    copieId,
    eleve: copie.eleve,
    questions,
    points: questions.reduce((somme, q) => somme + q.points, 0),
    pointsMax: questions.reduce((somme, q) => somme + q.pointsMax, 0),
    pagesManquantes,
    aArbitrer: questions.filter(
      (q) => q.statut !== 'lu' && q.statut !== 'sansReponse',
    ).length,
  }
}
