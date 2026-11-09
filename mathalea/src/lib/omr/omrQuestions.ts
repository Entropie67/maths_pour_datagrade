import { splitSubQuestions } from '../../components/setup/typst/buildTypstDocument'
import { htmlToTypst } from '../../components/setup/typst/latexToTypst'
import {
  getShortAnswer,
  minimalCorrection,
} from '../../components/setup/typst/minimalCorrection'
import { normalizeAMCNumBlocks } from '../amc/amcNormalize'
import type { AMCNumBlock, AutoCorrectionAMC } from '../amc/amcTypes'
import type {
  OmrColonneNumerique,
  OmrExerciceSource,
  OmrQuestionSource,
} from './buildOmrDocument'

/**
 * Conversion des exercices MathALÉA en questions à lecture optique.
 *
 * On part du rendu **HTML** de l'exercice, et non de son rendu LaTeX pour AMC :
 * `htmlToTypst` sait déjà transformer ce HTML en Typst — c'est ce que fait la
 * vue « Impression » — alors qu'aucune passerelle LaTeX vers Typst n'existe
 * pour les énoncés.
 *
 * La **structure des réponses**, elle, vient de `autoCorrectionAMC`, que
 * `omrPreparation` fait remplir par le moteur d'inférence AMC
 * (`mathaleaEnsureAMCCompatibility`). C'est ce moteur qui sait reconnaître un
 * QCM, une réponse numérique ou une question ouverte à partir de ce que le
 * moteur interactif a produit ; le refaire ici ne reconnaîtrait qu'une poignée
 * d'exercices. `autoCorrection` reste lu en dernier recours, pour les appels
 * qui n'ont pas fait tourner l'inférence.
 */

/** La forme minimale d'exercice dont cette conversion a besoin. */
export interface ExercicePourOmr {
  id?: string
  titre?: string
  amcType?: string
  listeQuestions: string[]
  listeCorrections?: string[]
  listeReponsesCourtes?: (string | null | undefined)[]
  reponseCourteDisponible?: boolean
  autoCorrection?: unknown[]
  /** Structure de réponse normalisée par l'inférence AMC */
  autoCorrectionAMC?: unknown[]
  /** Points par question ; à défaut, 1 point chacune */
  pointsParQuestion?: number
}

/** Une proposition telle que la remplit le moteur interactif. */
interface PropositionBrute {
  texte?: string
  statut?: unknown
}

/**
 * Un item de réponse, dans la forme que produit l'inférence AMC.
 *
 * Un item d'`AMCHybride` porte ses sous-questions dans `propositions`, chacune
 * avec son propre `type` : c'est la même forme, imbriquée d'un cran.
 */
interface ItemAmc {
  type?: string
  enonce?: string
  propositions?: Array<PropositionBrute & Partial<ItemAmc>>
  reponse?: AutoCorrectionAMC['reponse']
  options?: { correction?: string }
}

/** Nombre de points d'une question. */
function points(exercice: ExercicePourOmr): number {
  const valeur = exercice.pointsParQuestion
  return Number.isFinite(valeur) && (valeur as number) > 0
    ? (valeur as number)
    : 1
}

const CHIFFRES = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']

/**
 * Colonnes de chiffres codant une réponse numérique donnée telle quelle.
 *
 * Le nombre de colonnes suit celui des chiffres attendus : une réponse à trois
 * chiffres n'a aucune raison d'occuper la place d'une réponse à six. Le signe
 * n'obtient sa colonne que si la réponse est négative.
 */
export function colonnesNumeriques(valeur: string): OmrColonneNumerique[] {
  const negatif = valeur.trim().startsWith('-')
  const chiffres = valeur.replace(/[^0-9]/g, '')
  const colonnes: OmrColonneNumerique[] = []
  if (negatif) {
    colonnes.push({ label: 'signe', attendu: '-', valeurs: ['+', '-'] })
  }
  for (const chiffre of chiffres) {
    colonnes.push({ attendu: chiffre, valeurs: CHIFFRES })
  }
  return colonnes
}

/**
 * Signe imprimé entre deux colonnes d'un bloc numérique.
 *
 * AMC transporte dans `Tpoint` ce qu'il glisse entre la partie entière et la
 * suivante : une virgule pour un décimal, un filet pour une fraction — dont on
 * ne garde ici que la barre oblique, faute de place entre deux colonnes.
 */
function separateurDuBloc(bloc: AMCNumBlock): string {
  const tpoint = bloc.options?.Tpoint
  if (typeof tpoint !== 'string') return ','
  if (tpoint.includes('vrule')) return '/'
  const nettoye = tpoint.trim()
  return nettoye.length === 1 ? nettoye : ','
}

/**
 * Colonnes de chiffres d'un bloc numérique normalisé par AMC.
 *
 * `digits` compte les colonnes de chiffres, `decimals` combien d'entre elles
 * sont à droite de la virgule : c'est le même contrat que celui qu'AMC passe à
 * `AMCnumericChoices`, et il porte tout ce qu'il faut pour dessiner la grille.
 */
export function colonnesDepuisBloc(bloc: AMCNumBlock): OmrColonneNumerique[] {
  if (!Number.isFinite(bloc.value)) return []
  const decimals = Math.max(0, Math.round(bloc.decimals ?? 0))
  const chiffres = Math.abs(bloc.value).toFixed(decimals).replace('.', '')
  // une virgule veut toujours un chiffre devant elle : « ,5 » ne se lit pas
  const largeur = Math.max(bloc.digits ?? 0, chiffres.length, decimals + 1)
  const rembourres = chiffres.padStart(largeur, '0')
  const colonnes: OmrColonneNumerique[] = []
  if (bloc.sign) {
    colonnes.push({
      label: 'signe',
      attendu: bloc.value < 0 ? '-' : '+',
      valeurs: ['+', '-'],
    })
  }
  const indexVirgule = rembourres.length - decimals
  for (const [index, chiffre] of [...rembourres].entries()) {
    colonnes.push({
      attendu: chiffre,
      valeurs: CHIFFRES,
      ...(decimals > 0 && index === indexVirgule
        ? { separateurAvant: separateurDuBloc(bloc) }
        : {}),
    })
  }
  if (bloc.label != null && colonnes.length > 0) colonnes[0].label = bloc.label
  return colonnes
}

/**
 * Colonnes d'une réponse numérique AMC.
 *
 * `normalizeAMCNumBlocks` est la fonction qu'utilise déjà l'export AMC : elle
 * sait tirer d'une valeur et de ses paramètres le nombre de chiffres, celui de
 * décimales et la présence d'un signe — y compris pour une fraction ou une
 * écriture scientifique, qui donnent alors plusieurs blocs à la suite.
 */
export function colonnesDepuisReponse(
  reponse: AutoCorrectionAMC['reponse'],
): OmrColonneNumerique[] {
  if (reponse?.valeur == null) return []
  try {
    return normalizeAMCNumBlocks(reponse).flatMap(colonnesDepuisBloc)
  } catch {
    return []
  }
}

/**
 * Identifiant court et stable d'une question dans le document.
 *
 * Un énoncé peut donner plusieurs questions à cases — ses sous-questions, ou
 * les blocs d'un `AMCHybride` : chaque niveau ajoute son rang.
 */
export function identifiantQuestion(
  indexExercice: number,
  indexQuestion: number,
  ...rangs: number[]
): string {
  return `e${indexExercice}q${indexQuestion}${rangs.map((rang) => `b${rang}`).join('')}`
}

/** Le texte s'il en est un ; `undefined` plutôt qu'une chaîne vide. */
function texteOuRien(valeur: unknown): string | undefined {
  return typeof valeur === 'string' && valeur.trim() !== '' ? valeur : undefined
}

/** Ce qui accompagne toute question, quel que soit son type. */
interface Commun {
  qid: string
  enonce: string
  correction?: string
  correctionMinimale?: string
  points: number
}

/**
 * Convertit énoncé et correction, communs à tous les types de question.
 *
 * Les deux versions de la correction sont converties d'avance :
 * `minimalCorrection` travaille sur le HTML, que `buildOmrDocument` ne connaît
 * pas — c'est ce qui le garde indépendant du moteur d'exercices. Aucune des
 * deux n'est imprimée sur la copie de l'élève, seulement dans le corrigé du
 * professeur (`OmrDocumentOptions.corrige`).
 */
function commun(
  qid: string,
  enonceSource: string,
  correctionSource: string | undefined,
  pointsQuestion: number,
  figures?: string[],
  shortAnswer?: string | null,
): Commun {
  return {
    qid,
    enonce: htmlToTypst(enonceSource, figures),
    correction:
      correctionSource == null
        ? undefined
        : htmlToTypst(correctionSource, figures),
    correctionMinimale:
      correctionSource == null
        ? undefined
        : htmlToTypst(
            minimalCorrection(correctionSource, shortAnswer),
            figures,
          ),
    points: pointsQuestion,
  }
}

/** Propositions d'un QCM, converties en Typst. */
function propositionsQcm(
  propositions: PropositionBrute[] | undefined,
  figures?: string[],
) {
  return (propositions ?? [])
    .filter((proposition) => typeof proposition?.texte === 'string')
    .map((proposition) => ({
      texte: htmlToTypst(proposition.texte as string, figures),
      correct: Boolean(proposition.statut),
    }))
}

/**
 * Convertit un item dont l'inférence AMC a déjà arrêté le type.
 *
 * @returns `null` quand le type annoncé ne se retrouve pas dans l'item — une
 *   réponse numérique sans valeur, par exemple : mieux vaut alors laisser
 *   l'heuristique historique tenter sa chance que d'imprimer une question sans
 *   case, que la lecture optique ne saurait pas noter
 */
function questionDepuisItemAmc(
  type: string,
  item: ItemAmc,
  base: Commun,
  figures?: string[],
): OmrQuestionSource | null {
  if (type === 'qcmMono' || type === 'qcmMult') {
    const propositions = propositionsQcm(item.propositions, figures)
    if (propositions.length === 0) return null
    const nbCorrectes = propositions.filter((p) => p.correct).length
    return {
      ...base,
      type: type === 'qcmMult' || nbCorrectes > 1 ? 'qcmMult' : 'qcmMono',
      propositions,
    }
  }
  if (type === 'AMCNum') {
    // l'inférence pose la réponse sur l'item, les blocs d'un AMCHybride la
    // rangent d'un cran plus bas, dans leur unique proposition
    const colonnes = colonnesDepuisReponse(
      item.reponse ?? item.propositions?.[0]?.reponse,
    )
    if (colonnes.length === 0) return null
    return { ...base, type: 'AMCNum', colonnes }
  }
  if (type === 'AMCOpen') return { ...base, type: 'AMCOpen' }
  return null
}

/** Ce qu'il faut savoir pour convertir une réponse en question à cases. */
interface ContexteQuestion {
  exercice: ExercicePourOmr
  indexExercice: number
  /** Rang de l'énoncé dans l'exercice — celui de sa correction aussi */
  indexEnonce: number
  /**
   * Rang de la réponse dans `autoCorrectionAMC`, qui peut en compter plusieurs
   * pour un même énoncé.
   */
  indexReponse: number
  /** Rangs déjà posés dans l'identifiant des questions produites */
  rangs: number[]
  /** Plusieurs réponses se partagent l'énoncé, déjà découpé en morceaux */
  partage: boolean
  /** Énoncé à imprimer, déjà découpé quand plusieurs réponses se le partagent */
  enonce: string
  figures?: string[]
}

/** Sous-questions d'un `AMCHybride`, une question à cases chacune. */
function questionsDepuisBlocs(
  contexte: ContexteQuestion,
  item: ItemAmc,
): OmrQuestionSource[] {
  const { exercice, figures } = contexte
  const questions: OmrQuestionSource[] = []
  for (const [indexBloc, bloc] of (item.propositions ?? []).entries()) {
    // chaque bloc annonce son intitulé là où son type le range : l'énoncé du
    // bloc, ou le libellé posé devant les cases d'une réponse numérique
    const intitule =
      texteOuRien(bloc.enonce) ??
      texteOuRien(bloc.propositions?.[0]?.reponse?.texte)
    const enonceSource = [
      indexBloc === 0 ? texteOuRien(contexte.enonce) : undefined,
      intitule,
    ]
      .filter((morceau) => morceau != null)
      .join('<br>')
    // la correction rédigée n'est portée que par le bloc où l'inférence l'a
    // posée : la répéter sous chaque sous-question alourdirait le corrigé
    const correctionSource =
      texteOuRien(bloc.options?.correction) ??
      texteOuRien(bloc.propositions?.[0]?.texte) ??
      (indexBloc === 0
        ? texteOuRien(exercice.listeCorrections?.[contexte.indexEnonce])
        : undefined)
    const question = questionDepuisItemAmc(
      String(bloc.type ?? ''),
      bloc,
      commun(
        identifiantQuestion(
          contexte.indexExercice,
          contexte.indexEnonce,
          ...contexte.rangs,
          indexBloc,
        ),
        enonceSource,
        correctionSource,
        points(exercice),
        figures,
        // Une réponse de l'énoncé entier n'est pas celle de chaque sous-bloc.
        correctionSource === exercice.listeCorrections?.[contexte.indexEnonce]
          ? getShortAnswer(exercice, contexte.indexEnonce)
          : getShortAnswer(exercice, contexte.indexEnonce) === null
            ? null
            : undefined,
      ),
      figures,
    )
    if (question != null) questions.push(question)
  }
  return questions
}

/**
 * Reconnaissance historique, quand aucune inférence AMC n'a tourné.
 *
 * Elle ne lit que ce que le moteur interactif laisse directement visible ;
 * c'est l'inférence qui couvre tout le reste.
 */
function questionDepuisAutoCorrection(
  exercice: ExercicePourOmr,
  item: ItemAmc | undefined,
  base: Commun,
  figures?: string[],
): OmrQuestionSource | null {
  const propositions = (item?.propositions ?? []).filter(
    (proposition) => typeof proposition?.texte === 'string',
  )
  if (propositions.length > 0) {
    const converties = propositions.map((proposition) => ({
      texte: htmlToTypst(proposition.texte as string, figures),
      correct: proposition.statut === true,
    }))
    const nbCorrectes = converties.filter((p) => p.correct).length
    return {
      ...base,
      type:
        exercice.amcType === 'qcmMult' || nbCorrectes > 1
          ? 'qcmMult'
          : 'qcmMono',
      propositions: converties,
    }
  }

  const valeur = item?.reponse?.valeur
  if (typeof valeur === 'string' || typeof valeur === 'number') {
    const colonnes = colonnesNumeriques(String(valeur))
    if (colonnes.length > 0) return { ...base, type: 'AMCNum', colonnes }
  }

  if (exercice.amcType === 'AMCOpen') return { ...base, type: 'AMCOpen' }
  return null
}

/**
 * L'item groupe-t-il plusieurs sous-questions, chacune avec son type ?
 *
 * C'est la forme d'un `AMCHybride`. On la reconnaît à sa structure plutôt qu'au
 * type déclaré par l'exercice : quelques exercices annoncent `AMCHybride` mais
 * ne construisent leurs blocs qu'en contexte AMC, et la structure qui parvient
 * ici est alors plate.
 */
function estConteneurDeBlocs(item: ItemAmc): boolean {
  return (item.propositions ?? []).some(
    (proposition) => typeof proposition?.type === 'string',
  )
}

/**
 * Énoncé imprimé sur la copie.
 *
 * `listeQuestions` vient de la passe non interactive : c'est l'énoncé destiné
 * au papier. L'item de réponse en porte un autre, celui qu'a vu le moteur
 * interactif — champs de saisie compris. On ne lui donne la priorité que pour
 * un QCM, dont il ne garde que la question : les propositions, la lecture
 * optique les imprime elle-même, avec leurs cases.
 */
function enonceDeLaQuestion(
  contexte: ContexteQuestion,
  item: ItemAmc | undefined,
): string {
  const { exercice } = contexte
  const estQcm =
    exercice.amcType === 'qcmMono' ||
    exercice.amcType === 'qcmMult' ||
    (exercice.amcType == null && (item?.propositions?.length ?? 0) > 0)
  // quand plusieurs réponses se partagent l'énoncé, le morceau reçu ne porte
  // pas les propositions du QCM : il les précède, et les deux vont ensemble
  if (contexte.partage) {
    return [
      texteOuRien(contexte.enonce),
      estQcm ? texteOuRien(item?.enonce) : undefined,
    ]
      .filter((morceau) => morceau != null)
      .join('<br>')
  }
  return (
    (estQcm ? texteOuRien(item?.enonce) : undefined) ??
    texteOuRien(contexte.enonce) ??
    texteOuRien(item?.enonce) ??
    ''
  )
}

/**
 * Convertit une réponse en question à cases.
 *
 * @returns la ou les questions qu'elle donne — plusieurs pour un `AMCHybride`,
 *   dont chaque bloc se note séparément ; aucune quand la réponse n'a pas de
 *   structure exploitable, elle est alors simplement ignorée plutôt que
 *   d'imprimer une question sans case
 */
function questionsDepuisReponse(
  contexte: ContexteQuestion,
): OmrQuestionSource[] {
  const { exercice, figures } = contexte
  const itemAmc = ((exercice.autoCorrectionAMC ?? [])[contexte.indexReponse] ??
    undefined) as ItemAmc | undefined
  const itemInteractif = ((exercice.autoCorrection ?? [])[
    contexte.indexReponse
  ] ?? undefined) as ItemAmc | undefined
  const item = itemAmc ?? itemInteractif
  const enonce = enonceDeLaQuestion(contexte, item)

  if (itemAmc != null && estConteneurDeBlocs(itemAmc)) {
    return questionsDepuisBlocs({ ...contexte, enonce }, itemAmc)
  }

  const base = commun(
    identifiantQuestion(
      contexte.indexExercice,
      contexte.indexEnonce,
      ...contexte.rangs,
    ),
    enonce,
    texteOuRien(exercice.listeCorrections?.[contexte.indexEnonce]),
    points(exercice),
    figures,
    getShortAnswer(exercice, contexte.indexEnonce),
  )
  const question =
    itemAmc != null && exercice.amcType != null
      ? questionDepuisItemAmc(exercice.amcType, itemAmc, base, figures)
      : null
  const retenue =
    question ?? questionDepuisAutoCorrection(exercice, item, base, figures)
  return retenue == null ? [] : [retenue]
}

/** Nombre de réponses que l'exercice a produites, structure AMC en priorité. */
function nombreDeReponses(exercice: ExercicePourOmr): number {
  const amc = exercice.autoCorrectionAMC?.length ?? 0
  return amc > 0 ? amc : (exercice.autoCorrection?.length ?? 0)
}

/**
 * Combien de réponses se partagent chaque énoncé.
 *
 * Un exercice où l'élève complète quatre phrases sous un même énoncé produit
 * quatre réponses pour un énoncé : l'inférence les laisse à plat quand elle
 * n'a pas de raison d'en faire des blocs.
 */
function reponsesParEnonce(exercice: ExercicePourOmr): number {
  const nbEnonces = exercice.listeQuestions.length
  const nbReponses = nombreDeReponses(exercice)
  if (nbEnonces === 0 || nbReponses <= nbEnonces) return 1
  return nbReponses % nbEnonces === 0 ? nbReponses / nbEnonces : 1
}

/**
 * Un composant interactif — champ de saisie, QCM, tableau — est-il resté dans
 * l'énoncé ?
 *
 * On les reconnaît à leur nom d'élément personnalisé, qui porte un tiret là où
 * aucune balise HTML n'en a. Un tel énoncé ne s'imprime pas : il porte les
 * réponses de l'élève, et le convertir en Typst ne donnerait rien de lisible.
 */
const COMPOSANT_INTERACTIF = /<[a-z][a-z0-9]*-[a-z0-9-]+[\s/>]/i

/**
 * Découpe un énoncé en autant de morceaux qu'il porte de réponses.
 *
 * L'énoncé imprimé les porte toutes à la fois — « a) … b) … » — et il faut
 * savoir laquelle va devant quelles cases. `splitSubQuestions` est le
 * découpage que fait déjà la vue « Impression » pour numéroter les
 * sous-questions ; le préambule commun reste avec la première.
 *
 * Faute de repères, un énoncé qui énumère ses réponses en une phrase reste
 * imprimable d'un bloc : il part alors avec la première, et les suivantes ne
 * reçoivent qu'un numéro de réponse — c'est ainsi qu'AMC présente déjà ce
 * genre d'exercice.
 *
 * @returns `null` quand l'énoncé n'est de toute façon pas imprimable, parce
 *   qu'il a gardé les composants interactifs de ses sous-questions
 */
function decouperEnonce(enonce: string, morceaux: number): string[] | null {
  const decoupe = splitSubQuestions(enonce)
  if (decoupe != null && decoupe.items.length === morceaux) {
    const pieces = decoupe.items.map((item, index) =>
      index === 0 && decoupe.head.trim() !== ''
        ? `${decoupe.head}<br>${item}`
        : item,
    )
    if (pieces.every((piece) => !COMPOSANT_INTERACTIF.test(piece)))
      return pieces
  }
  if (COMPOSANT_INTERACTIF.test(enonce)) return null
  return Array.from({ length: morceaux }, (_, rang) => {
    const numero = `Réponse ${rang + 1}`
    return rang === 0 ? `${enonce}<br>${numero}` : numero
  })
}

/**
 * Dernier recours : l'énoncé, et la rangée de cases que le professeur noircira
 * en corrigeant.
 *
 * Quelques exercices annoncent un type AMC mais ne construisent leur structure
 * qu'en contexte AMC, où les énoncés sont du LaTeX inutilisable ici. Plutôt que
 * de les faire disparaître de l'évaluation, on les imprime en question ouverte
 * — c'est déjà le repli que l'inférence applique à tout ce qu'elle ne sait pas
 * ramener à des cases.
 */
function questionOuvertePourDefaut(
  contexte: ContexteQuestion,
): OmrQuestionSource[] {
  const { exercice } = contexte
  if (exercice.amcType == null) return []
  if (COMPOSANT_INTERACTIF.test(contexte.enonce)) return []
  return [
    {
      ...commun(
        identifiantQuestion(contexte.indexExercice, contexte.indexEnonce),
        contexte.enonce,
        texteOuRien(exercice.listeCorrections?.[contexte.indexEnonce]),
        points(exercice),
        contexte.figures,
        getShortAnswer(exercice, contexte.indexEnonce),
      ),
      type: 'AMCOpen',
    },
  ]
}

/** Convertit toutes les questions d'un exercice. */
export function questionsDepuisExercice(
  exercice: ExercicePourOmr,
  indexExercice: number,
  figures?: string[],
): OmrQuestionSource[] {
  const parEnonce = reponsesParEnonce(exercice)
  const questions: OmrQuestionSource[] = []
  for (const [indexEnonce, enonce] of exercice.listeQuestions.entries()) {
    const morceaux =
      parEnonce > 1 ? decouperEnonce(enonce, parEnonce) : [enonce]
    if (morceaux == null) return []
    const deLEnonce: OmrQuestionSource[] = []
    for (let rang = 0; rang < parEnonce; rang++) {
      deLEnonce.push(
        ...questionsDepuisReponse({
          exercice,
          indexExercice,
          indexEnonce,
          indexReponse: indexEnonce * parEnonce + rang,
          rangs: parEnonce > 1 ? [rang] : [],
          partage: parEnonce > 1,
          enonce: morceaux[rang],
          figures,
        }),
      )
    }
    questions.push(
      ...(deLEnonce.length > 0
        ? deLEnonce
        : questionOuvertePourDefaut({
            exercice,
            indexExercice,
            indexEnonce,
            indexReponse: indexEnonce * parEnonce,
            rangs: [],
            partage: false,
            enonce,
            figures,
          })),
    )
  }
  return questions
}

/**
 * Convertit une liste d'exercices en gardant le groupement.
 *
 * L'exercice est l'unité que règle la palette de l'aperçu — colonnes,
 * espacement, insertion après lui : l'aplatir ferait perdre cette prise.
 * Un exercice dont aucune question ne se prête à la lecture optique est écarté
 * plutôt que d'imprimer un titre sans question dessous.
 */
export function exercicesDepuisExercices(
  exercices: readonly ExercicePourOmr[],
  figures?: string[],
): OmrExerciceSource[] {
  return exercices
    .map((exercice, index) => ({
      titre: exercice.titre,
      questions: questionsDepuisExercice(exercice, index, figures),
    }))
    .filter((exercice) => exercice.questions.length > 0)
}

/** Toutes les questions d'une liste d'exercices, exercices confondus. */
export function questionsDepuisExercices(
  exercices: readonly ExercicePourOmr[],
): OmrQuestionSource[] {
  return exercices.flatMap((exercice, index) =>
    questionsDepuisExercice(exercice, index),
  )
}
