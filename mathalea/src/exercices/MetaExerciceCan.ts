import Decimal from 'decimal.js'
import {
  listOfCustomElements,
  mathaleaCustomElementsRegistry,
} from '../lib/customElements/MathaleaCustomElement'
import { MetaCustomElement } from '../lib/customElements/MetaCustomElement'
import { composeQuestionContext } from '../lib/components/questionContext'
import { handleAnswers } from '../lib/interactif/gestionInteractif'
import { propositionsQcm } from '../lib/interactif/qcm'
import { buildSimpleVersionQcm } from '../lib/interactif/qcmBuilder'
import {
  ajouteChampTexte,
  ajouteChampTexteMathLive,
  remplisLesBlancs,
} from '../lib/interactif/questionMathLive'
import type {
  ItabDbleEntry,
  Itableau,
} from '../lib/interactif/tableaux/AjouteTableauMathlive'
import { creeTableauMathliveElement } from '../lib/interactif/tableaux/AjouteTableauMathlive'
import { getDistracteurs } from '../lib/interactif/qcmDistractors'
import { Complexe } from '../lib/mathFonctions/Complexe'
import { combinaisonListes, shuffle } from '../lib/outils/arrayOutils'
import { range1 } from '../lib/outils/nombres'
import type {
  AnswerValueType,
  AutoCorrection,
  ClickFigures,
  Valeur,
} from '../lib/types'
import {
  interactivityTypeToCustomElementFormat,
  isMathaleaCustomElementFormat,
  isValeur,
  mathliveCompatibleToCustomElementFormat,
  type InteractivityType,
  type OptionsComparaisonType,
  type TableauMathliveType,
} from '../lib/types'
import { context } from '../modules/context'
import FractionEtendue from '../modules/FractionEtendue'
import Grandeur from '../modules/Grandeur'
import Hms from '../modules/Hms'
import { gestionnaireFormulaireTexte } from '../modules/outils'
import Exercice from './Exercice'
import ExerciceQcmACourt from './ExerciceQcmACourt'
import ExerciceSimple from './ExerciceSimple'
import { sp } from '../lib/outils/outilString'

export const interactifReady = true

type QuestionWithOptionalTableau = ExerciceSimple & {
  tableau?: ItabDbleEntry | Itableau
  typeTableau?: TableauMathliveType
}

function getQcmAutoCorrection(
  question: Exercice,
  destinationIndex: number,
): AutoCorrection | undefined {
  const atDestination = question.autoCorrection[destinationIndex]
  if (atDestination?.propositions != null) return atDestination
  const first = question.autoCorrection[0]
  return first?.propositions != null ? first : undefined
}

function cloneQcmAutoCorrection(source: AutoCorrection): AutoCorrection {
  return {
    ...source,
    // Une entrée portant des propositions est déjà identifiée comme un QCM.
    // Le méta-exercice la réhéberge donc sous le format moderne, même si le
    // sous-exercice historique n'avait pas renseigné `formatInteractif`.
    formatInteractif: 'mathalea-qcm',
    options: source.options == null ? undefined : { ...source.options },
    propositions: source.propositions?.map((proposition) => ({
      ...proposition,
    })),
  }
}

function getRegisteredCustomElementTag(format: string | undefined) {
  if (format == null || !listOfCustomElements.includes(format)) return null
  const elementClass = mathaleaCustomElementsRegistry.get(format)
  if (elementClass == null) {
    throw Error(
      "Une classe de listOfCustomElements n'est pas enregistrée dans le registre mathaleaCustomElementsRegistry",
    )
  }
  return format as InteractivityType
}

function getSimpleQuestionCustomElementFormat(question: Exercice) {
  // figureApigeom et d'autres champs enregistrent leur format pendant la
  // génération, sur la réponse de la question plutôt que sur l'exercice.
  const formatInteractif =
    question.autoCorrection[0]?.formatInteractif ??
    question.formatInteractif ??
    'mathlive'
  const format =
    formatInteractif === 'mathlive' &&
    typeof question.reponse === 'object' &&
    question.reponse != null &&
    'champ1' in question.reponse
      ? 'fill-in-the-blank'
      : (interactivityTypeToCustomElementFormat(formatInteractif) ??
        mathliveCompatibleToCustomElementFormat(formatInteractif) ??
        formatInteractif)
  return getRegisteredCustomElementTag(format)
}

function getClassicQuestionCustomElementFormat(question: Exercice) {
  const format =
    mathliveCompatibleToCustomElementFormat(
      question.autoCorrection[0]?.formatInteractif,
    ) ?? question.autoCorrection[0]?.formatInteractif
  return getRegisteredCustomElementTag(format)
}

/**
 * Réindexe les identifiants historiques `champTexteEx{n}Q0` que portent les
 * customElements de saisie (attribut `mathfield-id` de `mathalea-mathfield`,
 * `mathalea-textfield` et `fill-in-the-blank`, ids des cellules de
 * `tableau-mathlive`…).
 *
 * Les sous-exercices agrégés fabriquent toujours leur champ avec l'index 0 :
 * sans ce remappage, plusieurs questions du méta-exercice partagent le même
 * `mathfield-id` et `verifySingleMathLiveField` ne retrouve plus le champ de la
 * question réellement affichée.
 *
 * Le nom du callback de vérification (`champTexteEx{n}Q0-verification`) est
 * volontairement laissé intact : c'est une clé du registre statique du
 * customElement, alimentée à la construction de la question, et la renommer ici
 * la rendrait introuvable.
 */
function remapLegacyFieldIds(
  questionHtml: string,
  sourceNumeroExercice: number,
  destinationNumeroExercice: number,
  destinationIndex: number,
) {
  const pattern = (exerciceNumber: number) =>
    new RegExp(`champTexteEx${exerciceNumber}Q0(?!-verification)`, 'g')
  return remapDomReadyPayloadQuestionIds(
    questionHtml
      .replace(
        pattern(sourceNumeroExercice),
        `champTexteEx${destinationNumeroExercice}Q${destinationIndex}`,
      )
      .replace(
        pattern(0),
        `champTexteEx${destinationNumeroExercice}Q${destinationIndex}`,
      ),
    destinationNumeroExercice,
    destinationIndex,
  )
}

function decodeHtmlAttribute(value: string) {
  return value.replace(
    /&(quot|amp|lt|gt);/g,
    (_match, entity: string) =>
      ({ quot: '"', amp: '&', lt: '<', gt: '>' })[
        entity as 'quot' | 'amp' | 'lt' | 'gt'
      ],
  )
}

function encodeHtmlAttribute(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

function remapDomReadyPayloadQuestionIds(
  questionHtml: string,
  destinationNumeroExercice: number,
  destinationIndex: number,
) {
  return questionHtml.replace(
    /(<mathalea-dom-ready\b[^>]*\spayload=")([^"]*)(")/g,
    (_match, before: string, rawPayload: string, after: string) => {
      try {
        const payload = JSON.parse(decodeHtmlAttribute(rawPayload)) as Record<
          string,
          unknown
        >
        if ('numeroExercice' in payload) {
          payload.numeroExercice = destinationNumeroExercice
        }
        if ('indiceQuestion' in payload) {
          payload.indiceQuestion = destinationIndex
        }
        if ('questionIndex' in payload) {
          payload.questionIndex = destinationIndex
        }
        return `${before}${encodeHtmlAttribute(JSON.stringify(payload))}${after}`
      } catch {
        return `${before}${rawPayload}${after}`
      }
    },
  )
}

function remapCustomElementQuestionIds(
  questionHtml: string,
  tag: InteractivityType,
  sourceNumeroExercice: number | undefined,
  destinationNumeroExercice: number | undefined,
  destinationIndex: number,
) {
  const sourceExercice = sourceNumeroExercice ?? 0
  const destinationExercice = destinationNumeroExercice ?? 0
  let html = remapLegacyFieldIds(
    questionHtml,
    sourceExercice,
    destinationExercice,
    destinationIndex,
  )
    .replaceAll(
      `${tag}Ex${sourceExercice}Q0`,
      `${tag}Ex${destinationExercice}Q${destinationIndex}`,
    )
    .replaceAll(
      `resultatCheckEx${sourceExercice}Q0`,
      `resultatCheckEx${destinationExercice}Q${destinationIndex}`,
    )
    .replaceAll(
      `feedbackEx${sourceExercice}Q0`,
      `feedbackEx${destinationExercice}Q${destinationIndex}`,
    )
    .replaceAll(
      `tabMathliveEx${sourceExercice}Q0`,
      `tabMathliveEx${destinationExercice}Q${destinationIndex}`,
    )
    .replaceAll(
      `Ex${sourceExercice}Q0`,
      `Ex${destinationExercice}Q${destinationIndex}`,
    )
    .replaceAll(
      'resultatCheckEx0Q0',
      `resultatCheckEx${destinationExercice}Q${destinationIndex}`,
    )
    .replaceAll(
      'feedbackEx0Q0',
      `feedbackEx${destinationExercice}Q${destinationIndex}`,
    )
    .replaceAll(
      'tabMathliveEx0Q0',
      `tabMathliveEx${destinationExercice}Q${destinationIndex}`,
    )
    .replaceAll('Ex0Q0', `Ex${destinationExercice}Q${destinationIndex}`)

  if (tag === 'meta-interactif-2d') {
    html = html.replace(
      /id="MetaInteractif2dEx\d+Q\d+field(\d+)"/g,
      `id="MetaInteractif2dEx${destinationExercice}Q${destinationIndex}field$1"`,
    )
  }
  return html
}

/** Réhéberger aussi les composants du contexte, avant de composer l'énoncé. */
function composeHostedQuestion(
  question: Exercice,
  destinationIndex: number,
  questionHtml: string,
): string {
  const introduction = remapCustomElementQuestionIds(
    question.introduction ?? '',
    'apigeom-figure',
    question.numeroExercice,
    question.numeroExercice,
    destinationIndex,
  ).replace(/<apigeom-figure\b[^>]*>/g, (tag) =>
    tag.replace(
      /(\sindex=)(["']?)(\d+)\2/g,
      (_match, prefix: string, quote: string) =>
        `${prefix}${quote}${destinationIndex}${quote}`,
    ),
  )
  return composeQuestionContext(
    { consigne: question.consigne, introduction },
    questionHtml,
  )
}

function remapClickFigures(
  figures: ClickFigures | undefined,
  sourceNumeroExercice: number,
  destinationNumeroExercice: number,
  destinationIndex: number,
): ClickFigures | undefined {
  if (!Array.isArray(figures)) return undefined
  return figures.map((figure) => ({
    ...figure,
    id: figure.id
      .replaceAll(
        `Ex${sourceNumeroExercice}Q0`,
        `Ex${destinationNumeroExercice}Q${destinationIndex}`,
      )
      .replaceAll(
        'Ex0Q0',
        `Ex${destinationNumeroExercice}Q${destinationIndex}`,
      ),
  }))
}

function injectSimpleQuestionCustomElement({
  meta,
  question,
  questionIndex,
  tag,
  formatChampTexte,
  optionsChampTexte,
}: {
  meta: MetaExercice
  question: Exercice
  questionIndex: number
  tag: InteractivityType
  formatChampTexte: string
  optionsChampTexte: Parameters<typeof ajouteChampTexte>[3]
}) {
  const questionHtml = remapDomReadyPayloadQuestionIds(
    String(question.question ?? ''),
    meta.numeroExercice ?? 0,
    questionIndex,
  )
  if (questionHtml.includes(`<${tag}`)) {
    return remapCustomElementQuestionIds(
      questionHtml,
      tag,
      question.numeroExercice,
      meta.numeroExercice,
      questionIndex,
    )
  }

  if (tag === 'mathalea-mathfield') {
    return (
      questionHtml +
      ajouteChampTexteMathLive(
        meta,
        questionIndex,
        formatChampTexte,
        optionsChampTexte,
      )
    )
  }
  if (tag === 'mathalea-textfield') {
    return (
      questionHtml +
      ajouteChampTexte(meta, questionIndex, formatChampTexte, optionsChampTexte)
    )
  }
  if (tag === 'fill-in-the-blank') {
    return remplisLesBlancs(
      meta,
      questionIndex,
      questionHtml,
      formatChampTexte,
      '\\ldots',
    )
  }
  if (tag === 'tableau-mathlive') {
    const questionWithTableau = question as QuestionWithOptionalTableau
    if (questionWithTableau.tableau == null) {
      window.notify(
        `Tableau non défini pour l'interactivité tableau-mathlive. Exercice ${meta.id} ${meta.uuid}`,
        { question },
      )
      return questionHtml
    }
    return (
      questionHtml +
      creeTableauMathliveElement({
        numeroExercice: meta.numeroExercice ?? 0,
        question: questionIndex,
        tableau: questionWithTableau.tableau,
        typeTableau: questionWithTableau.typeTableau ?? 'doubleEntree',
        classes: formatChampTexte,
      })
    )
  }

  return remapCustomElementQuestionIds(
    questionHtml,
    tag,
    question.numeroExercice,
    meta.numeroExercice,
    questionIndex,
  )
}

function normalizeSimpleAnswerValue(answer: unknown): AnswerValueType {
  if (typeof answer === 'string' || typeof answer === 'number') {
    return String(answer)
  }
  if (answer instanceof FractionEtendue) return answer.texFraction
  if (answer instanceof Decimal) return answer.toString()
  if (answer instanceof Complexe) return answer.tex()
  return answer as AnswerValueType
}

function buildSimpleQuestionAnswerValue(
  question: Exercice,
  tag: InteractivityType | undefined,
): Valeur {
  const options =
    question.optionsDeComparaison == null
      ? ({} as OptionsComparaisonType)
      : (question.optionsDeComparaison as OptionsComparaisonType)
  const compare = question.compare
  const answer = question.reponse

  if (tag === 'fill-in-the-blank') {
    if (typeof answer === 'string') {
      return {
        champ1: {
          value: answer,
          compare,
          options,
        },
      }
    }
    return answer as Valeur
  }

  if (isValeur(answer)) return answer

  return {
    reponse: {
      value: normalizeSimpleAnswerValue(answer),
      compare,
      options,
    },
  }
}

/**
 * Une sous-question est « custom » quand l'exercice corrige lui-même les
 * réponses via `correctionInteractive`. Selon l'âge de l'exercice, le format
 * est déclaré à trois endroits : l'export de module recopié sur l'instance,
 * le champ des exercices simples, ou l'objet réponse des exercices classiques.
 */
function estQuestionCustom(question: Exercice): boolean {
  // Sans fonction de correction il n'y a rien de custom à brancher : on laisse
  // le traitement par défaut s'appliquer.
  if (typeof question.correctionInteractive !== 'function') return false
  // Un exercice qui délègue à un customElement enregistré n'est pas custom.
  if (isMathaleaCustomElementFormat(question.formatInteractif)) return false
  if (
    isMathaleaCustomElementFormat(question.autoCorrection[0]?.formatInteractif)
  ) {
    return false
  }
  if (
    question.autoCorrection[0]?.formatInteractif != null &&
    question.autoCorrection[0].formatInteractif !== 'custom'
  ) {
    return false
  }
  if (question.autoCorrection[0]?.valeur != null) return false
  return (
    question.formatInteractif === 'custom' ||
    question.autoCorrection[0]?.formatInteractif === 'custom'
  )
}

/**
 * Empreinte d'une question générée, indépendante des identifiants DOM (qui
 * dépendent du rang dans la composition) : sert à repérer une répétition
 * identique d'une même question.
 */
function signatureDeQuestion(question: Exercice): string {
  const { enonce, reponses } = question as {
    enonce?: string
    reponses?: string[]
  }
  return JSON.stringify([
    question.question,
    enonce,
    question.correction,
    question.reponse,
    reponses,
    String(question.listeQuestions[0] ?? '').replace(/Ex\d+Q\d+/g, ''),
    String(question.listeCorrections[0] ?? '').replace(/Ex\d+Q\d+/g, ''),
  ])
}

/**
 * Un sous-exercice qui déclare `nouvelleVersion(numeroExercice, numeroQuestion)`
 * produit lui-même sa question à l'index demandé : lui appliquer en plus le
 * décalage `indexQuestionHote` décalerait ses identifiants deux fois.
 */
function gereSonIndexDeQuestion(question: Exercice): boolean {
  return question.nouvelleVersion.length >= 2
}

/**
 * Un sous-exercice range la figure de son unique question à l'index 0, alors
 * que `correctionInteractive(i)` est appelée avec l'index de la question dans
 * l'exercice affiché. On déplace donc la figure de tête à cet index, les
 * éventuelles figures suivantes (corrections, figures annexes) restant dans le
 * tableau pour être détruites par `reinit()`.
 */
function alignFiguresSurIndexHote(
  question: Exercice,
  indexQuestion: number,
): void {
  if (indexQuestion === 0) return
  for (const cle of ['figuresApiGeom', 'figuresApiGeomCorr'] as const) {
    const figures = question[cle]
    if (figures == null || figures.length === 0) continue
    const [figureQuestion, ...autres] = figures
    const alignees: typeof figures = []
    alignees[indexQuestion] = figureQuestion
    alignees.push(...autres)
    question[cle] = alignees
  }
}

/**
 * Nombre de points d'une question custom. Un exercice `exoCustomResultat`
 * renvoie un tableau de résultats dont la longueur n'est connue qu'après
 * correction : quand il expose ses bonnes réponses, on s'en sert pour annoncer
 * le barème avant toute saisie.
 */
function pointsMaxQuestionCustom(question: Exercice): number {
  const goodAnswers = (question as { goodAnswers?: unknown }).goodAnswers
  if (Array.isArray(goodAnswers) && goodAnswers.length > 0) {
    return goodAnswers.length
  }
  return 1
}

export default class MetaExercice extends Exercice {
  Exercices: (typeof Exercice)[]
  correctionInteractives: ((i: number) => string | string[])[]
  /** Les sous-questions sont en saisie libre par défaut : la case « Version QCM » les repasse en QCM. */
  private versionQcmPourLesQuestions: boolean
  /** Commentaire écrit par la composition elle-même : il remplace celui des annales CAN. */
  private commentaireDeLaComposition?: string
  /**
   * @param ExercicesCAN les questions agrégées
   * @param options.versionQcm propose la case « Version QCM » (4e paramètre) si les
   * questions agrégées sont des `ExerciceQcmACourt`
   */
  constructor(
    ExercicesCAN: (typeof Exercice)[],
    options: { versionQcm?: boolean } = {},
  ) {
    super()
    this.versionQcmPourLesQuestions = options.versionQcm === true
    this.Exercices = ExercicesCAN
    this.correctionInteractives = []
    this.besoinFormulaireCaseACocher = ['Sujet officiel']
    this.nbQuestions = this.Exercices.length
    this.sup = false
    this.sup2 = Array.from({ length: this.nbQuestions }, (_, i) => i + 1).join(
      '-',
    ) // Toutes les questions de 1 à 30 (ou 20 pour les CE)
    this.sup3 = false
    if (this.versionQcmPourLesQuestions) {
      this.besoinFormulaire4CaseACocher = ['Version QCM', false]
      this.sup4 = false
    }
  }

  /**
   * Les vues qui corrigent question par question appellent
   * `correctionInteractive` sur l'exercice affiché : pour un méta-exercice,
   * c'est celle du sous-exercice réhébergé à cet index.
   */
  correctionInteractive(i: number): string | string[] {
    return this.correctionInteractives[i]?.(i) ?? 'KO'
  }

  /**
   * Branche une sous-question custom sur le pipeline générique : la
   * `correctionInteractive` du sous-exercice est enregistrée en callback et
   * l'énoncé reçoit l'ancre `<meta-custom>` que `verifQuestion()` retrouvera.
   * Retourne le HTML de la question, ancre comprise.
   */
  private brancheQuestionCustom(
    Question: Exercice,
    indexQuestion: number,
    questionHtml: string,
  ): string {
    alignFiguresSurIndexHote(Question, Question.indexQuestionHote ?? 0)
    const numeroExercice = this.numeroExercice ?? 0
    const pointsMax = pointsMaxQuestionCustom(Question)
    const callbackKey = MetaCustomElement.keyFor(numeroExercice, indexQuestion)
    // La fermeture sur `Question` est indispensable : `correctionInteractive`
    // est parfois une méthode de prototype qui lit `this.numeroExercice` et
    // `this.answers`.
    const corrige = (i: number) => {
      const resultat = Question.correctionInteractive!(i)
      if (Question.answers != null) {
        this.answers = { ...this.answers, ...Question.answers }
      }
      return resultat
    }
    MetaCustomElement.registerCallback(callbackKey, {
      exercice: Question,
      run: corrige,
      pointsMax,
    })
    // Chemin historique, conservé pour les CAN qui lisent `correctionInteractives`
    this.correctionInteractives[indexQuestion] = corrige
    this.autoCorrection[indexQuestion] = { formatInteractif: 'meta-custom' }
    return (
      questionHtml +
      MetaCustomElement.create({
        numeroExercice,
        questionIndex: indexQuestion,
        callbackKey,
        pointsMax,
      })
    )
  }

  nouvelleVersion(): void {
    // Les sous-exercices de la version précédente ne doivent pas rester dans le
    // registre statique des callbacks.
    MetaCustomElement.unregisterCallbacksWithPrefix(
      `${MetaCustomElement.elementTag}:${this.numeroExercice ?? 0}:`,
    )
    this.commentaireDeLaComposition ??= this.comment ?? ''
    this.correctionInteractives = []
    this.listeCanEnonces = []
    this.listeCanReponsesACompleter = []
    this.listeCanLiees = []
    this.listeCanNumerosLies = []
    this.answers = {}
    this.nbQuestionsModifiable = this.sup3
    this.besoinFormulaire2Texte = false
    let listeTypeDeQuestions: (string | number)[]
    const listeDeQuestions = this.sup2
    let exercicesRef = this.Exercices
    const nbTotalQuestions = exercicesRef.length
    if (this.sup3) {
      this.sup2 = false
    } else {
      exercicesRef = this.Exercices
      this.nbQuestions = String(this.sup2).includes('-')
        ? this.sup2.split('-').length
        : 1
    }

    if (this.sup2) {
      listeTypeDeQuestions = gestionnaireFormulaireTexte({
        saisie: listeDeQuestions,
        min: 1,
        max: 30,
        defaut: 1,
        melange: 31,
        shuffle: false,
        nbQuestions: String(this.sup2).includes('-')
          ? this.sup2.split('-').length
          : 1,
      })
    } else {
      listeTypeDeQuestions = range1(this.nbQuestions)
      exercicesRef = this.Exercices

      const base = Math.floor(this.nbQuestions / 3)
      const reste = this.nbQuestions % 3
      let repartition = [base, base, base]
      for (let i = 0; i < reste; i++) {
        repartition[i]++
      }
      repartition = combinaisonListes(repartition, 3)

      let exercices1 = exercicesRef.slice(
        0,
        Math.floor(Math.max(nbTotalQuestions / 3, repartition[0])),
      )
      exercices1 = shuffle(exercices1)
      exercices1 = exercices1.slice(0, repartition[0])

      let exercices2 = exercicesRef.slice(
        Math.max(nbTotalQuestions / 3, repartition[0]),
        Math.max((2 * nbTotalQuestions) / 3, repartition[0] + repartition[1]),
      )
      exercices2 = shuffle(exercices2)
      exercices2 = exercices2.slice(0, repartition[1])

      let exercices3 = exercicesRef.slice(
        Math.max((2 * nbTotalQuestions) / 3, repartition[0] + repartition[1]),
        nbTotalQuestions,
      )
      exercices3 = shuffle(exercices3)
      exercices3 = exercices3.slice(0, repartition[2])

      exercicesRef = [...exercices1, ...exercices2, ...exercices3]
    }
    let indexQuestion = 0
    this.reinit() // On réinitialise les listes de questions parce qu'on a eu des soucis (est-ce que MetaExercice passe par le nouvelleVersionWrapper ?)

    const nbOccurrences = new Map<string | number, number>()
    const questionsDejaPosees = new Map<string | number, string[]>()
    for (const item of listeTypeDeQuestions) {
      // Pour les questions soient dans l'ordre choisi par l'utilisateur
      let numExo = 1
      for (const UnExercice of exercicesRef) {
        if (item === numExo) {
          // Permet de ne choisir que certaines questions
          const creerQuestion = (suffixeGraine: string) => {
            const Question = new UnExercice()
            Question.numeroExercice = this.numeroExercice
            Question.canOfficielle = !!this.sup
            Question.interactif = this.interactif
            if (
              this.versionQcmPourLesQuestions &&
              Question instanceof ExerciceQcmACourt
            ) {
              // En AMC, les questions restent des QCM.
              Question.sup3 = context.isAmc || this.sup4
            }
            // Dans un sujet officiel, les sous-exercices sont figés : ils ne
            // consomment donc généralement aucun aléa avant de mélanger leur
            // QCM. Leur donner tous la graine du méta-exercice les faisait alors
            // produire la même permutation des propositions (et la même lettre
            // de bonne réponse). Une graine stable, distincte par rang, conserve
            // le sujet reproductible sans toucher aux tirages des sujets non
            // officiels déjà partagés.
            Question.seed = this.sup
              ? `${this.seed}-question-${indexQuestion}`
              : this.seed
            // Une question choisie plusieurs fois (par exemple « 4-4-4 ») recevrait
            // sinon la graine de la composition à chaque fois, et donc trois fois
            // les mêmes valeurs : les répétitions ont leur propre graine, la
            // première occurrence gardant celle des liens déjà partagés.
            if (suffixeGraine !== '') Question.seed += `-${suffixeGraine}`
            // Le méta-exercice ne réhéberge que la première question de chaque
            // sous-exercice sélectionné. La limiter avant sa génération évite de
            // tirer et construire des questions qui seront aussitôt ignorées et
            // permet aux consignes dépendant du nombre de questions d'employer
            // le singulier.
            Question.nbQuestions = 1
            // Le sous-exercice fabrique ses identifiants DOM à partir de cet
            // index : il produit ainsi directement ceux de la question affichée,
            // sans réécriture de chaîne après coup.
            Question.indexQuestionHote = gereSonIndexDeQuestion(Question)
              ? 0
              : indexQuestion
            Question.nouvelleVersionWrapper(this.numeroExercice ?? 0)
            return Question
          }
          // Première occurrence : graine d'origine ; répétition : graine dérivée,
          // puis nouvel essai tant que la même question vient d'être posée.
          const rang = nbOccurrences.get(item) ?? 0
          nbOccurrences.set(item, rang + 1)
          let Question = creerQuestion(rang === 0 ? '' : `repetition-${rang}`)
          const dejaPosees = questionsDejaPosees.get(item) ?? []
          for (
            let essai = 1;
            rang > 0 &&
            essai <= 20 &&
            dejaPosees.includes(signatureDeQuestion(Question));
            essai++
          ) {
            Question = creerQuestion(`repetition-${rang}-${essai}`)
          }
          dejaPosees.push(signatureDeQuestion(Question))
          questionsDejaPosees.set(item, dejaPosees)
          // Une question qui déclare sa réponse courte (ou son absence, pour une
          // construction) la garde une fois hébergée à son index dans la composition.
          const reponseCourte =
            Question.reponseCourteDisponible === false
              ? null
              : Question.listeReponsesCourtes[0]
          if (reponseCourte !== undefined) {
            this.listeReponsesCourtes[indexQuestion] = reponseCourte
          }
          //* ************ Question Exo simple *************//
          if (Question.listeQuestions.length === 0) {
            // On est en présence d'un exo simple
            this.listeCorrections[indexQuestion] = Question.correction ?? ''
            const formatChampTexte = String(Question.formatChampTexte ?? '')
            const optionsChampTexte = Question.optionsChampTexte ?? {}
            if (Question.canEnonce != null)
              this.listeCanEnonces[indexQuestion] = Question.canEnonce
            if (Question.canReponseACompleter != null)
              this.listeCanReponsesACompleter[indexQuestion] =
                Question.canReponseACompleter
            this.listeCanLiees[indexQuestion] = Question.canLiee
            this.listeCanNumerosLies[indexQuestion] = Question.canNumeroLie

            // Exo simple avec version QCM (distracteurs définis + versionQcm activée)
            if (
              Question instanceof ExerciceSimple &&
              Question.versionQcm &&
              Question.distracteurs.length > 0 &&
              Question.reponse != null
            ) {
              const distracteurs = getDistracteurs(Question)
              const qcmData = buildSimpleVersionQcm(Question, indexQuestion, {
                question: Question.question ?? '',
                correction: Question.correction ?? '',
                reponse: Question.reponse as AnswerValueType,
                distracteurs,
                options: Question.versionQcmOptions ?? { radio: true },
              })
              Question.question = qcmData.question
              Question.correction = qcmData.correction
              this.listeCorrections[indexQuestion] = qcmData.correction
              this.listeQuestions[indexQuestion] = composeHostedQuestion(
                Question,
                indexQuestion,
                qcmData.question,
              )
              this.autoCorrection[indexQuestion] =
                Question.autoCorrection[indexQuestion]
              indexQuestion++
              break
            }
            const customElementFormat =
              getSimpleQuestionCustomElementFormat(Question)
            const qcmAutoCorrection = getQcmAutoCorrection(
              Question,
              indexQuestion,
            )
            if (qcmAutoCorrection != null) {
              this.autoCorrection[indexQuestion] =
                cloneQcmAutoCorrection(qcmAutoCorrection)
              this.listeQuestions[indexQuestion] = String(
                Question.question ?? '',
              )
            } else if (estQuestionCustom(Question)) {
              // Avant `customElementFormat` : faute de `formatInteractif`,
              // `getSimpleQuestionCustomElementFormat()` retombe sur
              // `mathalea-mathfield` et collerait un champ de saisie à une
              // question qui se corrige toute seule.
              // Les identifiants apigeom sont produits au bon index par
              // `figureApigeom()` ; seuls restent à réindexer les blocs que
              // l'exercice écrit lui-même dans son énoncé.
              const enonce = String(Question.question ?? '')
                .replaceAll(
                  `feedbackEx${this.numeroExercice}Q0`,
                  `feedbackEx${this.numeroExercice}Q${indexQuestion}`,
                )
                .replaceAll(
                  `resultatCheckEx${this.numeroExercice}Q0`,
                  `resultatCheckEx${this.numeroExercice}Q${indexQuestion}`,
                )
              // Même règle que `mathaleaHandleExerciceSimple` : un exercice
              // simple custom dont l'énoncé contient des `%{}` est un texte à
              // trous. Le moteur pose les champs, la vérification reste à la
              // charge de l'exercice.
              const questionHtml = enonce.includes('%{')
                ? remplisLesBlancs(
                    this,
                    indexQuestion,
                    enonce,
                    `fillInTheBlank ${formatChampTexte}`,
                    '\\ldots',
                  )
                : enonce
              this.listeQuestions[indexQuestion] = this.brancheQuestionCustom(
                Question,
                indexQuestion,
                questionHtml,
              )
            } else if (customElementFormat != null) {
              const tag = customElementFormat
              if (tag === 'apigeom-figure') {
                alignFiguresSurIndexHote(
                  Question,
                  Question.indexQuestionHote ?? 0,
                )
              }
              const rawQuestionHtml = String(Question.question ?? '')
              const questionHtml =
                tag === MetaCustomElement.elementTag &&
                rawQuestionHtml.includes('%{')
                  ? remplisLesBlancs(
                      this,
                      indexQuestion,
                      rawQuestionHtml,
                      `fillInTheBlank ${formatChampTexte}`,
                      '\\ldots',
                    )
                  : injectSimpleQuestionCustomElement({
                      meta: this,
                      question: Question,
                      questionIndex: indexQuestion,
                      tag,
                      formatChampTexte,
                      optionsChampTexte,
                    })
              this.listeQuestions[indexQuestion] = questionHtml
              if (tag === MetaCustomElement.elementTag) {
                this.autoCorrection[indexQuestion] = {
                  ...(Question.autoCorrection[0] ?? {}),
                  formatInteractif: tag,
                }
                const entry = MetaCustomElement.getEntry(
                  MetaCustomElement.keyFor(
                    this.numeroExercice ?? 0,
                    indexQuestion,
                  ),
                )
                if (entry != null) {
                  this.correctionInteractives[indexQuestion] = entry.run
                }
              } else {
                handleAnswers(
                  this,
                  indexQuestion,
                  buildSimpleQuestionAnswerValue(Question, tag),
                  {
                    ...(tag === 'fill-in-the-blank' ? optionsChampTexte : {}),
                    formatInteractif: tag,
                  },
                )
              }
            } else {
              // * ***************** Question MathLive *****************//
              this.listeQuestions[indexQuestion] =
                remapDomReadyPayloadQuestionIds(
                  String(Question.question ?? ''),
                  this.numeroExercice ?? 0,
                  indexQuestion,
                ) +
                ajouteChampTexteMathLive(
                  this,
                  indexQuestion,
                  formatChampTexte,
                  optionsChampTexte,
                )
              if (Question.compare == null) {
                const reponse = Question.reponse
                const options =
                  Question.optionsDeComparaison == null
                    ? {}
                    : (Question.optionsDeComparaison as OptionsComparaisonType)
                if (reponse instanceof FractionEtendue) {
                  handleAnswers(
                    this,
                    indexQuestion,
                    {
                      reponse: {
                        value: reponse.texFraction,
                        options,
                      },
                    },
                    { formatInteractif: Question.formatInteractif },
                  )
                } else if (reponse instanceof Decimal) {
                  handleAnswers(
                    this,
                    indexQuestion,
                    {
                      reponse: { value: reponse.toString(), options },
                    },
                    { formatInteractif: Question.formatInteractif },
                  )
                } else if (
                  reponse instanceof Grandeur ||
                  reponse instanceof Hms
                ) {
                  handleAnswers(
                    this,
                    indexQuestion,
                    {
                      reponse: { value: reponse, options },
                    },
                    { formatInteractif: Question.formatInteractif },
                  )
                } else if (reponse instanceof Complexe) {
                  handleAnswers(
                    this,
                    indexQuestion,
                    {
                      reponse: { value: reponse.tex(), options },
                    },
                    { formatInteractif: Question.formatInteractif },
                  )
                } else if (Array.isArray(reponse)) {
                  handleAnswers(
                    this,
                    indexQuestion,
                    {
                      reponse: { value: reponse, options },
                    },
                    { formatInteractif: Question.formatInteractif },
                  )
                } else if (isValeur(reponse)) {
                  handleAnswers(
                    this,
                    indexQuestion,
                    // Object.assign(reponse, { options }),
                    { reponse: { value: reponse.reponse!.value, options } },
                  )
                } else {
                  handleAnswers(
                    this,
                    indexQuestion,
                    {
                      reponse: { value: String(Question.reponse), options },
                    },
                    { formatInteractif: Question.formatInteractif },
                  )
                }
              } else {
                const compare = Question.compare
                const options =
                  Question.optionsDeComparaison == null
                    ? {}
                    : Question.optionsDeComparaison
                if (
                  typeof Question.reponse === 'string' ||
                  typeof Question.reponse === 'number'
                ) {
                  const reponse = String(Question.reponse)
                  handleAnswers(
                    this,
                    indexQuestion,
                    {
                      reponse: {
                        value: reponse,
                        compare,
                        options,
                      },
                    },
                    { formatInteractif: Question.formatInteractif },
                  )
                } else if (typeof Question.reponse === 'object') {
                  const reponse = Question.reponse
                  if (reponse instanceof FractionEtendue) {
                    handleAnswers(
                      this,
                      indexQuestion,
                      {
                        reponse: {
                          value: reponse.texFraction,
                          compare,
                          options,
                        },
                      },
                      { formatInteractif: Question.formatInteractif },
                    )
                  } else if (reponse instanceof Decimal) {
                    handleAnswers(
                      this,
                      indexQuestion,
                      {
                        reponse: {
                          value: reponse.toString(),
                          compare,
                          options,
                        },
                      },
                      { formatInteractif: Question.formatInteractif },
                    )
                  } else if (reponse instanceof Grandeur) {
                    handleAnswers(
                      this,
                      indexQuestion,
                      {
                        reponse: {
                          value: reponse.toString(),
                          compare,
                          options,
                        },
                      },
                      { formatInteractif: Question.formatInteractif },
                    )
                  } else if (Array.isArray(reponse)) {
                    handleAnswers(
                      this,
                      indexQuestion,
                      {
                        reponse: { value: reponse, compare, options },
                      },
                      { formatInteractif: Question.formatInteractif },
                    )
                  } else {
                    handleAnswers(
                      this,
                      indexQuestion,
                      Object.assign(reponse as Valeur, { compare, options }),
                      { formatInteractif: Question.formatInteractif },
                    )
                  }
                } else {
                  window.notify(
                    'Erreur avec cette question qui contient une reponse au format inconnu',
                    { reponse: Question.reponse },
                  )
                }
              }
            }
          } else {
            //* ***************** Question Exo classique *****************//
            this.listeQuestions[indexQuestion] = Question.listeQuestions[0]
            this.listeCorrections[indexQuestion] = Question.listeCorrections[0]
            if (Question.canEnonce != null)
              this.listeCanEnonces[indexQuestion] = Question.canEnonce
            if (Question.canReponseACompleter != null)
              this.listeCanReponsesACompleter[indexQuestion] =
                Question.canReponseACompleter
            const qcmAutoCorrection = getQcmAutoCorrection(
              Question,
              indexQuestion,
            )
            this.autoCorrection[indexQuestion] =
              qcmAutoCorrection == null
                ? Question.autoCorrection[0]
                : cloneQcmAutoCorrection(qcmAutoCorrection)
            const customElementFormat =
              getClassicQuestionCustomElementFormat(Question)
            if (qcmAutoCorrection == null && customElementFormat != null) {
              const tag = customElementFormat
              const questionHtml = remapCustomElementQuestionIds(
                String(Question.listeQuestions[0]),
                tag,
                Question.numeroExercice,
                this.numeroExercice,
                indexQuestion,
              )

              this.listeQuestions[indexQuestion] = questionHtml
              if (
                tag === 'clique-figure' ||
                tag === 'apigeom-figure' ||
                tag === MetaCustomElement.elementTag
              ) {
                if (tag === 'apigeom-figure') {
                  // La callback reçoit l'index de la question affichée ; la
                  // figure du sous-exercice doit être disponible au même index.
                  alignFiguresSurIndexHote(
                    Question,
                    Question.indexQuestionHote ?? 0,
                  )
                }
                this.autoCorrection[indexQuestion] = {
                  ...(Question.autoCorrection[0] ?? {}),
                  formatInteractif: tag,
                }
                if (tag === 'clique-figure') {
                  this.cliqueFiguresArray ??= []
                  const figures = remapClickFigures(
                    Question.cliqueFiguresArray?.[0],
                    Question.numeroExercice ?? 0,
                    this.numeroExercice ?? 0,
                    indexQuestion,
                  )
                  if (figures != null)
                    this.cliqueFiguresArray[indexQuestion] = figures
                }
              } else {
                handleAnswers(
                  this,
                  indexQuestion,
                  Question.autoCorrection[0].valeur as Valeur,
                  {
                    formatInteractif: tag as InteractivityType,
                  },
                )
              }
            } else if (qcmAutoCorrection == null) {
              this.listeQuestions[indexQuestion] = remapLegacyFieldIds(
                this.listeQuestions[indexQuestion],
                Question.numeroExercice ?? 0,
                this.numeroExercice ?? 0,
                indexQuestion,
              )
              this.listeQuestions[indexQuestion] = this.listeQuestions[
                indexQuestion
              ]
                .replaceAll(
                  'resultatCheckEx0Q0',
                  `resultatCheckEx${this.numeroExercice ?? 0}Q${indexQuestion}`,
                )
                .replaceAll(
                  'feedbackEx0Q0',
                  `feedbackEx${this.numeroExercice ?? 0}Q${indexQuestion}`,
                )

              // fin d'alimentation des listes de question et de correction pour cette question
              const formatInteractif =
                Question.autoCorrection[0]?.formatInteractif
              if (estQuestionCustom(Question)) {
                if (gereSonIndexDeQuestion(Question)) {
                  // L'exercice sait produire sa question directement à l'index
                  // demandé : on le relance avec les coordonnées de l'hôte.
                  Question.reinit()
                  Question.nouvelleVersionWrapper(
                    this.numeroExercice,
                    indexQuestion,
                  )
                  this.listeQuestions[indexQuestion] =
                    Question.listeQuestions[indexQuestion] ?? ''
                  this.listeCorrections[indexQuestion] =
                    Question.listeCorrections[indexQuestion] ?? ''
                }
                this.listeQuestions[indexQuestion] = this.brancheQuestionCustom(
                  Question,
                  indexQuestion,
                  this.listeQuestions[indexQuestion] ?? '',
                )
              } else {
                const reponse = Question.autoCorrection[0]?.valeur
                if (reponse != null)
                  handleAnswers(this, indexQuestion, reponse as Valeur, {
                    formatInteractif,
                  })
              }
            }
          }
          const qcmAutoCorrection = getQcmAutoCorrection(
            Question,
            indexQuestion,
          )
          if (qcmAutoCorrection != null) {
            // qcm
            this.autoCorrection[indexQuestion] =
              cloneQcmAutoCorrection(qcmAutoCorrection)
            // Les propositions ont déjà été mélangées par buildQcmForExercise et la correction
            // a été construite avec cet ordre. On empêche un second mélange pour que la lettre
            // annoncée dans la correction corresponde à ce qui est affiché dans la question.
            this.autoCorrection[indexQuestion].options = {
              ...(this.autoCorrection[indexQuestion].options ?? {}),
              ordered: true,
            }
            const monQcm = propositionsQcm(this, indexQuestion, {
              style: 'margin:0 3px 0 3px;',
              format: this.interactif ? 'case' : 'lettre',
            }) // update les références HTML
            // `propositionsQcm()` utilise encore le marqueur historique `qcm`
            // pendant le rendu. La question agrégée expose ensuite le format
            // moderne qui doit piloter le dispatch et les exports.
            this.autoCorrection[indexQuestion].formatInteractif = 'mathalea-qcm'
            this.listeCanReponsesACompleter[indexQuestion] =
              Question.canReponseACompleter != null
                ? Question.canReponseACompleter
                : monQcm.texte
            const objetReponse = this.autoCorrection[indexQuestion]
            const enonce = 'enonce' in objetReponse ? objetReponse.enonce : ''
            this.listeQuestions[indexQuestion] = enonce + monQcm.texte
            if (this.listeCorrections[indexQuestion] == null)
              this.listeCorrections[indexQuestion] = monQcm.texteCorr
          }

          // Ajouter le contexte après les branches qui reconstruisent l'énoncé.
          this.listeQuestions[indexQuestion] = composeHostedQuestion(
            Question,
            indexQuestion,
            this.listeQuestions[indexQuestion],
          )
          indexQuestion++
          break
        }
        numExo++
      }
    }
    // Une deuxième sécurité pour virer les questions en trop
    if (indexQuestion > 30) {
      indexQuestion = 30
      window.notify(
        'malgré des précautions prises, on a fabriqué plus de 30 questions dans MetaExercice',
        { nbQuestions: indexQuestion },
      )
      this.listeQuestions = this.listeQuestions.slice(0, indexQuestion)
      this.listeCorrections = this.listeCorrections.slice(0, indexQuestion)
      this.autoCorrection = this.autoCorrection.slice(0, indexQuestion)
    }

    this.besoinFormulaire2Texte = this.sup3
      ? false
      : ['Questions à afficher', 'Numéros séparés par des tirets :']
    this.besoinFormulaire3CaseACocher = ['Questions tirées au hasard']
    this.comment =
      this.commentaireDeLaComposition ||
      `Cet exercice fait partie des annales des Courses Aux Nombres (CAN).<br>
  Il est plus souvent composé de 30 questions (parfois 20 pour les CE1/CE2) réparties de la façon suivante. 
  Les 10 premières questions, parfois communes à plusieurs niveaux, font appel à des questions élémentaires et les 20 suivantes (qui ne sont pas rangées dans un ordre de difficulté) sont un peu plus «${sp()}coûteuses${sp()}» cognitivement.<br>
  Par défaut, les questions sont rangées dans le même ordre que le sujet officiel avec des données aléatoires. Ainsi, en cliquant sur «${sp()}Nouvelles données${sp()}», on obtient une nouvelle Course Aux Nombres avec des données différentes.<br>
  Dans les CAN depuis 2024, «${sp()}Questions à afficher${sp()}» permet de choisir certaines questions parmi les 30. <br>
  Dans les CAN d'avant 2024, on pouvait seulement choisir le nombre de questions comme décrit ci-après. <br>
  En cochant «${sp()}Questions tirées au hasard${sp()}», on peut choisir un nombre de questions inférieur à 30 : on fabrique une «${sp()}mini${sp()}» Course Aux Nombres qui respecte la proportion de nombre de questions élémentaires par rapport aux autres.
  Par exemple, en choisissant 20 questions, la course aux nombres sera composée de 7 ou 8 questions élémentaires choisies aléatoirement dans les 10 premières questions du sujet officiel puis de 12 ou 13 autres questions choisies aléatoirement parmi les 20 autres questions du sujet officiel.`
  }
}
