import airePerimetre from '../../json/questionsDeCours/airePerimetre.json'
import calculLitteral from '../../json/questionsDeCours/calculLitteral.json'
import denombrement from '../../json/questionsDeCours/denombrement.json'
import derivees from '../../json/questionsDeCours/derivees.json'
import droites from '../../json/questionsDeCours/droites.json'
import evolutions from '../../json/questionsDeCours/evolutions.json'
import exponentielle from '../../json/questionsDeCours/exponentielle.json'
import fonctions from '../../json/questionsDeCours/fonctions.json'
import fonctionsReferences from '../../json/questionsDeCours/fonctionsReferences.json'
import geometrieAnalytique from '../../json/questionsDeCours/geometrieAnalytique.json'
import primitives from '../../json/questionsDeCours/primitives.json'
import probabilites from '../../json/questionsDeCours/probabilites.json'
import produitScalaire from '../../json/questionsDeCours/produitScalaire.json'
import proportionnalite from '../../json/questionsDeCours/proportionnalite.json'
import puissances from '../../json/questionsDeCours/puissances.json'
import racinesCarrees from '../../json/questionsDeCours/racinesCarrees.json'
import secondDegre from '../../json/questionsDeCours/secondDegre.json'
import suites from '../../json/questionsDeCours/suites.json'
import trigonometrie1 from '../../json/questionsDeCours/trigonometrie1.json'
import trigonometrie2 from '../../json/questionsDeCours/trigonometrie2.json'
import variablesAleatoires from '../../json/questionsDeCours/variablesAleatoires.json'
import volumeAireLaterale from '../../json/questionsDeCours/volumeAireLaterale.json'

/**
 * Banque de questions de cours.
 *
 * Les fichiers de `src/json/questionsDeCours/` sont repris de l'app externe
 * `questions-de-cours` (https://coopmaths.fr/apps/questions-de-cours). Leurs
 * noms de champs d'origine (en anglais) sont conservés tels quels pour que la
 * banque reste synchronisable avec le dépôt de l'app.
 *
 * L'app validait la banque avec `zod`. Ici la validation est écrite à la main
 * (pas de nouvelle dépendance) et surtout vérifiée par `banque.test.ts` : une
 * question invalide fait échouer les tests unitaires plutôt que de casser un
 * exercice en production, où elle est simplement ignorée.
 */

/** Niveaux du plus jeune au plus âgé : première classe où la notion est vue. */
export const NIVEAUX_QUESTIONS_DE_COURS = [
  '6',
  '5',
  '4',
  '3',
  '2',
  '1',
  'T',
] as const
export type NiveauQuestionDeCours = (typeof NIVEAUX_QUESTIONS_DE_COURS)[number]

export const TYPES_QUESTIONS_DE_COURS = ['math', 'qcm', 'text'] as const
export type TypeQuestionDeCours = (typeof TYPES_QUESTIONS_DE_COURS)[number]

/** Comment un niveau choisi filtre les questions : sélecteur enseignant et tirage au hasard. */
export const MODES_NIVEAU_QUESTIONS_DE_COURS = ['avant', 'egal', 'apres'] as const
export type ModeNiveauQuestionDeCours =
  (typeof MODES_NIVEAU_QUESTIONS_DE_COURS)[number]

/** Modes de comparaison hérités de l'app, traduits en options MathALÉA. */
export const COMPARAISONS_QUESTIONS_DE_COURS = [
  'isEqual',
  'isSame',
  'expressionsForcementReduites',
] as const
export type ComparaisonQuestionDeCours =
  (typeof COMPARAISONS_QUESTIONS_DE_COURS)[number]

/** Une question de la banque, une fois validée et normalisée. */
export type QuestionDeCours = {
  /** Identifiant unique, utilisé dans les paramètres de l'exercice et l'URL. */
  id: string
  level: NiveauQuestionDeCours
  /** Toujours un tableau, même quand le JSON ne donne qu'un thème. */
  themes: string[]
  /** Titre affiché côté enseignant, jamais à l'élève. */
  title: string
  /** Énoncé, avec éventuellement du LaTeX entre `$`. */
  question: string
  /** Réponses acceptées ; la première sert de correction par défaut. */
  answers: string[]
  correction?: string
  /** Touches supplémentaires du clavier de l'app (non encore portées). */
  keys: string[]
  /**
   * Fausses réponses du QCM ; la bonne réponse (`answers`) est ajoutée
   * automatiquement par l'exercice, elle ne doit pas être répétée ici.
   * Simples suggestions pour les autres types.
   */
  badPropositions: string[]
  comparison: ComparaisonQuestionDeCours
  type: TypeQuestionDeCours
}

const CLES_AUTORISEES = new Set([
  'id',
  'level',
  'themes',
  'title',
  'question',
  'answer',
  'correction',
  'keys',
  'badPropositions',
  'comparison',
  'type',
])

type SourceBanque = { fichier: string; questions: unknown[] }

/** Les séries de questions, dans l'ordre d'affichage souhaité. */
const SOURCES: SourceBanque[] = [
  { fichier: 'airePerimetre', questions: airePerimetre.questions },
  { fichier: 'calculLitteral', questions: calculLitteral.questions },
  { fichier: 'denombrement', questions: denombrement.questions },
  { fichier: 'derivees', questions: derivees.questions },
  { fichier: 'droites', questions: droites.questions },
  { fichier: 'evolutions', questions: evolutions.questions},
  { fichier: 'exponentielle', questions: exponentielle.questions },
  { fichier: 'fonctions', questions: fonctions.questions },
  { fichier: 'fonctionsReferences', questions: fonctionsReferences.questions },
  { fichier: 'geometrieAnalytique', questions: geometrieAnalytique.questions },
  { fichier: 'primitives', questions: primitives.questions },
  { fichier: 'probabilites', questions: probabilites.questions },
  { fichier: 'produitScalaire', questions: produitScalaire.questions },
  { fichier: 'proportionnalite', questions: proportionnalite.questions },
  { fichier: 'puissances', questions: puissances.questions },
  { fichier: 'racinesCarrees', questions: racinesCarrees.questions },
  { fichier: 'secondDegre', questions: secondDegre.questions },
  { fichier: 'suites', questions: suites.questions },
  { fichier: 'trigonometrie1', questions: trigonometrie1.questions },
  { fichier: 'trigonometrie2', questions: trigonometrie2.questions },
  { fichier: 'variablesAleatoires', questions: variablesAleatoires.questions },
  { fichier: 'volumeAireLaterale', questions: volumeAireLaterale.questions },
]

/** Une chaîne seule est acceptée partout où un tableau est attendu. */
function versTableauDeChaines(valeur: unknown): string[] | null {
  if (typeof valeur === 'string') return [valeur]
  if (Array.isArray(valeur) && valeur.every((v) => typeof v === 'string')) {
    return valeur as string[]
  }
  return null
}

function estChaineNonVide(valeur: unknown): valeur is string {
  return typeof valeur === 'string' && valeur.trim() !== ''
}

/**
 * Valide une question brute du JSON. Retourne `null` et alimente `erreurs`
 * dès qu'un champ est absent, mal typé ou inconnu (une clé mal orthographiée
 * comme `proposition` au lieu de `propositions` est ainsi détectée).
 */
function valideQuestion(
  brute: unknown,
  origine: string,
  erreurs: string[],
): QuestionDeCours | null {
  const signale = (message: string) => {
    erreurs.push(`${origine} : ${message}`)
    return null
  }
  if (typeof brute !== 'object' || brute == null || Array.isArray(brute)) {
    return signale("la question n'est pas un objet")
  }
  const donnees = brute as Record<string, unknown>
  for (const cle of Object.keys(donnees)) {
    if (!CLES_AUTORISEES.has(cle)) return signale(`clé inconnue « ${cle} »`)
  }
  if (!estChaineNonVide(donnees.id)) return signale('id manquant')
  const id = donnees.id
  if (!estChaineNonVide(donnees.title)) return signale(`${id} : title manquant`)
  if (!estChaineNonVide(donnees.question)) {
    return signale(`${id} : question manquante`)
  }
  const level = donnees.level
  if (
    typeof level !== 'string' ||
    !(NIVEAUX_QUESTIONS_DE_COURS as readonly string[]).includes(level)
  ) {
    return signale(`${id} : level invalide (${String(level)})`)
  }
  const themes = versTableauDeChaines(donnees.themes)
  if (themes == null || themes.length === 0) {
    return signale(`${id} : themes invalide`)
  }
  const answers = versTableauDeChaines(donnees.answer)
  if (answers == null || answers.length === 0) {
    return signale(`${id} : answer invalide`)
  }
  const type = donnees.type ?? 'math'
  if (
    typeof type !== 'string' ||
    !(TYPES_QUESTIONS_DE_COURS as readonly string[]).includes(type)
  ) {
    return signale(`${id} : type invalide (${String(type)})`)
  }
  const comparison = donnees.comparison ?? 'isEqual'
  if (
    typeof comparison !== 'string' ||
    !(COMPARAISONS_QUESTIONS_DE_COURS as readonly string[]).includes(comparison)
  ) {
    return signale(`${id} : comparison invalide (${String(comparison)})`)
  }
  const keys =
    donnees.keys === undefined ? [] : versTableauDeChaines(donnees.keys)
  if (keys == null) return signale(`${id} : keys invalide`)
  const badPropositions =
    donnees.badPropositions === undefined
      ? []
      : versTableauDeChaines(donnees.badPropositions)
  if (badPropositions == null) {
    return signale(`${id} : badPropositions invalide`)
  }
  if (
    donnees.correction !== undefined &&
    typeof donnees.correction !== 'string'
  ) {
    return signale(`${id} : correction invalide`)
  }
  if (type === 'qcm') {
    const bassin = new Set([...badPropositions, ...answers])
    if (bassin.size < 2) {
      return signale(
        `${id} : une question qcm doit avoir au moins deux propositions distinctes (bonne réponse comprise)`,
      )
    }
  }
  return {
    id,
    level: level as NiveauQuestionDeCours,
    themes,
    title: donnees.title,
    question: donnees.question,
    answers,
    correction: donnees.correction as string | undefined,
    keys,
    badPropositions,
    comparison: comparison as ComparaisonQuestionDeCours,
    type: type as TypeQuestionDeCours,
  }
}

function chargeBanque(): { questions: QuestionDeCours[]; erreurs: string[] } {
  const erreurs: string[] = []
  const questions: QuestionDeCours[] = []
  const idsRencontres = new Set<string>()
  for (const source of SOURCES) {
    for (const brute of source.questions) {
      const question = valideQuestion(brute, source.fichier, erreurs)
      if (question == null) continue
      if (idsRencontres.has(question.id)) {
        erreurs.push(`${source.fichier} : id « ${question.id} » en doublon`)
        continue
      }
      idsRencontres.add(question.id)
      questions.push(question)
    }
  }
  return { questions, erreurs }
}

const banque = chargeBanque()

/**
 * Erreurs de validation de la banque, exposées pour les tests unitaires.
 * En production les questions fautives sont simplement ignorées.
 */
export const erreursBanqueQuestionsDeCours = banque.erreurs

/** Toutes les questions valides, dans l'ordre des JSON. */
export const questionsDeCours: QuestionDeCours[] = banque.questions

const questionsParId = new Map(
  questionsDeCours.map((question) => [question.id, question]),
)

/** La question de la banque, ou `undefined` si l'identifiant est inconnu. */
export function questionDeCoursParId(id: string): QuestionDeCours | undefined {
  return questionsParId.get(id)
}

/** Une question correspond-elle au niveau choisi, selon le mode (avant/égal/après) ? */
export function questionCorrespondAuNiveau(
  question: QuestionDeCours,
  mode: ModeNiveauQuestionDeCours,
  niveau: NiveauQuestionDeCours,
): boolean {
  const rang = (n: string) =>
    (NIVEAUX_QUESTIONS_DE_COURS as readonly string[]).indexOf(n)
  const rangQuestion = rang(question.level)
  const rangChoisi = rang(niveau)
  if (mode === 'avant') return rangQuestion <= rangChoisi
  if (mode === 'apres') return rangQuestion >= rangChoisi
  return rangQuestion === rangChoisi
}

/**
 * Encodage compact du filtre de niveau du sélecteur dans `sup2` (ex : `avant:5`).
 * Utilisé quand l'enseignant n'a choisi aucune question mais a réglé ce
 * filtre, pour que le tirage au hasard s'y limite plutôt que de piocher dans
 * toute la banque.
 */
export function formatFiltreNiveauQuestionsDeCours(
  mode: ModeNiveauQuestionDeCours,
  niveau: NiveauQuestionDeCours,
): string {
  return `${mode}:${niveau}`
}

/** L'inverse de `formatFiltreNiveauQuestionsDeCours`, ou `undefined` si invalide. */
export function parseFiltreNiveauQuestionsDeCours(
  valeur: string,
):
  | { mode: ModeNiveauQuestionDeCours; niveau: NiveauQuestionDeCours }
  | undefined {
  const [mode, niveau] = valeur.split(':')
  if (
    !(MODES_NIVEAU_QUESTIONS_DE_COURS as readonly string[]).includes(mode)
  ) {
    return undefined
  }
  if (!(NIVEAUX_QUESTIONS_DE_COURS as readonly string[]).includes(niveau)) {
    return undefined
  }
  return {
    mode: mode as ModeNiveauQuestionDeCours,
    niveau: niveau as NiveauQuestionDeCours,
  }
}

/** Les questions regroupées par thème, dans l'ordre des JSON. */
export const questionsDeCoursParTheme: Map<string, QuestionDeCours[]> =
  new Map()
for (const question of questionsDeCours) {
  for (const theme of question.themes) {
    const liste = questionsDeCoursParTheme.get(theme)
    if (liste === undefined) {
      questionsDeCoursParTheme.set(theme, [question])
    } else {
      liste.push(question)
    }
  }
}
