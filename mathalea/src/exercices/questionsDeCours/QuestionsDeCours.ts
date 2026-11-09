import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { addMathaleaQcm } from '../../lib/customElements/MathaleaQcm'
import { ajouteSelecteurQuestionsDeCours } from '../../lib/customElements/QuestionsDeCoursSelecteur'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { propositionsQcm } from '../../lib/interactif/qcm'
import {
  ajouteChampTexte,
  ajouteChampTexteMathLive,
} from '../../lib/interactif/questionMathLive'
import { shuffle } from '../../lib/outils/arrayOutils'
import {
  parseFiltreNiveauQuestionsDeCours,
  questionCorrespondAuNiveau,
  type QuestionDeCours,
  questionDeCoursParId,
  questionsDeCours,
} from '../../lib/questionsDeCours/banque'
import { globalOptions } from '../../lib/stores/globalOptions'
import type { OptionsComparaisonType } from '../../lib/types'
import { context } from '../../modules/context'
import { listeQuestionsToContenu } from '../../modules/outils'
import Exercice from '../Exercice'
import { get } from 'svelte/store'
import { sp } from '../../lib/outils/outilString'

export const titre = 'Questions de cours'
export const dateDePublication = '20/08/2026'
export const interactifReady = true
export const dateDeModifImportante = '31/10/2026'
export const uuid = 'afd39'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * Version native de l'app « Questions de cours » (jusqu'ici affichée dans une
 * iframe par `src/exercices/apps/questions-de-cours.ts`, qui reste en place).
 *
 * L'enseignant choisit des questions dans la banque
 * (`src/lib/questionsDeCours/banque.ts`) ; MathALÉA se charge du reste :
 * interactivité, corrections, barème, impression et export.
 *
 * @author Rémi Angot
 */
export default class QuestionsDeCours extends Exercice {
  constructor() {
    super()
    this.consigne = ''
    this.nbQuestions = 5
    this.nbCols = 1
    this.nbColsCorr = 1
    this.interactifReady = true
    this.besoinFormulaireTexte = [
      'Questions choisies',
      'Identifiants séparés par des virgules. Laisser vide pour tirer au hasard dans toute la banque.',
    ]
    this.sup = ''
    this.sup2 = ''
  }

  nouvelleVersion() {
    const { choisies, questions, inconnus } = this.selectionDeQuestions()
    this.introduction = this.enTeteVueProf(choisies, inconnus)
    // On ne touche pas à `this.nbQuestions` : le réglage de l'enseignant doit
    // survivre à une sélection momentanément plus courte, sans quoi il resterait
    // bloqué sur la plus petite valeur rencontrée.
    const nombreDeQuestions = Math.min(this.nbQuestions, questions.length)
    const tirage = shuffle(questions).slice(0, nombreDeQuestions)

    for (let i = 0; i < tirage.length; i++) {
      const question = tirage[i]
      let texte = question.question
      let texteCorr = question.correction ?? correctionParDefaut(question)

      if (question.type === 'qcm') {
        const optionsQcm = { radio: true, ordered: true, vertical: false }
        const propositionsAffichees = selectionnePropositionsQcm(question)
        handleAnswers(
          this,
          i,
          {
            qcm: {
              enonce: texte,
              correction: texteCorr,
              options: optionsQcm,
              propositions: propositionsAffichees.map((proposition) => ({
                texte: proposition,
                statut: question.answers.includes(proposition),
              })),
            },
          },
          { formatInteractif: 'mathalea-qcm' },
        )
        if (context.isHtml) {
          texte += addMathaleaQcm(this, i, {
            ...optionsQcm,
            interactivityOn: this.interactif,
          })
        } else if (!context.isAmc) {
          const qcmLatex = propositionsQcm(this, i)
          texte += qcmLatex.texte
          texteCorr += qcmLatex.texteCorr
        }
      } else if (question.type === 'text') {
        handleAnswers(
          this,
          i,
          {
            reponse: {
              value: reponsesTexteAcceptees(question),
              options: { texteSansCasse: true },
            },
          },
          { formatInteractif: 'mathalea-textfield' },
        )
        texte = ajouteChampDeSaisie(
          texte,
          ajouteChampTexte(this, i, KeyboardType.alphanumeric),
        )
      } else {
        handleAnswers(this, i, {
          reponse: {
            value: question.answers,
            options: optionsDeComparaison(question),
          },
        })
        texte = ajouteChampDeSaisie(
          texte,
          ajouteChampTexteMathLive(
            this,
            i,
            KeyboardType.clavierPersonnalisable,
            { dataKeys: touchesDeLaQuestion(question) },
          ),
        )
      }

      // Une correction rédigée dans la banque ne met pas toujours sa réponse
      // en évidence : fournir la réponse attendue aux exports minimaux.
      if (question.type !== 'qcm') {
        this.listeReponsesCourtes[i] = correctionParDefaut(question)
      }
      this.listeQuestions[i] = texte
      this.listeCorrections[i] = texteCorr
    }
    listeQuestionsToContenu(this)
  }

  /**
   * Les questions retenues par l'enseignant, dans l'ordre de la banque. Une
   * sélection vide vaut « toute la banque » : l'exercice reste utilisable avant
   * tout réglage. Si en plus un filtre de niveau a été réglé dans le
   * sélecteur (mémorisé dans `sup2`, ex : « jusqu'au niveau 5e »), le tirage
   * au hasard s'y limite plutôt que de piocher partout.
   */
  private selectionDeQuestions(): {
    choisies: QuestionDeCours[]
    questions: QuestionDeCours[]
    inconnus: string[]
  } {
    const ids = String(this.sup ?? '')
      .split(/[,;\s]+/)
      .filter((id) => id !== '')
    const choisies: QuestionDeCours[] = []
    const inconnus: string[] = []
    for (const id of ids) {
      const question = questionDeCoursParId(id)
      // Une sélection partagée peut contenir l'id d'une question retirée de la
      // banque : on l'ignore plutôt que de casser tout l'exercice.
      if (question === undefined) inconnus.push(id)
      else if (!choisies.includes(question)) choisies.push(question)
    }
    let questions = choisies.length > 0 ? choisies : questionsDeCours
    if (choisies.length === 0) {
      const filtre = parseFiltreNiveauQuestionsDeCours(String(this.sup2 ?? ''))
      if (filtre !== undefined) {
        questions = questionsDeCours.filter((question) =>
          questionCorrespondAuNiveau(question, filtre.mode, filtre.niveau),
        )
      }
    }
    return { choisies, questions, inconnus }
  }

  /**
   * En vue enseignante uniquement : le sélecteur de questions, suivi le cas
   * échéant d'un avertissement sur les identifiants inconnus. L'élève et les
   * exports n'en voient rien.
   */
  private enTeteVueProf(
    choisies: QuestionDeCours[],
    inconnus: string[],
  ): string {
    const vue = get(globalOptions).v
    const estVueProf = vue === undefined || vue === ''
    if (!context.isHtml || context.isTypst || context.isAmc || !estVueProf) {
      return ''
    }
    const selecteur = ajouteSelecteurQuestionsDeCours({
      numeroExercice: this.numeroExercice ?? 0,
      selection: choisies.map((question) => question.id),
      nbQuestions: this.nbQuestions,
      filtreNiveau: choisies.length === 0 ? String(this.sup2 ?? '') : '',
    })
    if (inconnus.length === 0) return selecteur
    const pluriel = inconnus.length > 1 ? 's' : ''
    return (
      selecteur +
      `<span class="text-sm italic">Identifiant${pluriel} inconnu${pluriel} et ignoré${pluriel}${sp()}: ${inconnus.join(', ')}.</span>`
    )
  }
}

/** Nombre de propositions affichées pour une question `qcm`, bonne réponse comprise. */
const NB_PROPOSITIONS_QCM = 4

/**
 * Choisit au hasard les propositions affichées pour une question `qcm` : la
 * (les) bonne(s) réponse(s) sont toujours présentes, complétées par des
 * fausses réponses piochées dans `badPropositions` jusqu'à
 * `NB_PROPOSITIONS_QCM`, puis l'ensemble est mélangé.
 */
function selectionnePropositionsQcm(question: QuestionDeCours): string[] {
  const bonnesReponses = shuffle([...new Set(question.answers)]).slice(
    0,
    NB_PROPOSITIONS_QCM,
  )
  // Filet de sécurité : la bonne réponse ne devrait pas figurer dans
  // `badPropositions`, mais on l'exclut au cas où pour ne pas la doubler.
  const mauvaisesReponses = question.badPropositions.filter(
    (proposition) => !question.answers.includes(proposition),
  )
  const mauvaisesRetenues = shuffle(mauvaisesReponses).slice(
    0,
    Math.max(0, NB_PROPOSITIONS_QCM - bonnesReponses.length),
  )
  return shuffle([...bonnesReponses, ...mauvaisesRetenues])
}

/**
 * Complète l'énoncé d'une question à saisie avec ce qui permet d'y répondre.
 * La banque termine souvent l'énoncé par des pointillés (`\ldots`) à
 * compléter sur papier ; quand un champ interactif existe, ces pointillés
 * sont remplacés en ligne par le champ (pas de retour à la ligne, qui
 * laisserait le champ isolé sous l'énoncé).
 */
function ajouteChampDeSaisie(texte: string, champ: string): string {
  if (champ !== '')
    return texte.replace(/\$\\ldots\$\s*$|\\ldots(?=\$?\s*$)/, '') + champ
  // `context.isHtml` reste vrai pendant la régénération pour Typst : les
  // pointillés doivent y apparaître comme dans la sortie LaTeX.
  return texte + (context.isHtml && !context.isTypst ? '' : ' \\dotfill')
}

/** Traduction des modes de comparaison de la banque en options MathALÉA. */
function optionsDeComparaison(
  question: QuestionDeCours,
): OptionsComparaisonType {
  switch (question.comparison) {
    case 'expressionsForcementReduites':
      return { expressionsForcementReduites: true }
    // `isSame` exigeait dans l'app l'écriture exacte attendue ; la seule
    // question concernée demande une factorisation, ce que MathALÉA sait
    // vérifier explicitement.
    case 'isSame':
      return { factorisation: true }
    default:
      return {}
  }
}

/**
 * Les touches de la banque, complétées par la racine carrée quand une réponse
 * en contient et que la banque ne l'a pas prévue.
 */
function touchesDeLaQuestion(question: QuestionDeCours): string[] {
  const touches = question.keys ?? []
  const besoinRacine = question.answers.some((reponse) =>
    reponse.includes('\\sqrt'),
  )
  return besoinRacine && !touches.includes('SQRT')
    ? [...touches, 'SQRT']
    : touches
}

/** La correction affichée quand le JSON n'en fournit pas. */
function correctionParDefaut(question: QuestionDeCours): string {
  if (question.type === 'math')
    return `$${miseEnEvidence(question.answers[0])}$`
  return texteEnCouleurEtGras(question.answers[0])
}

function sansAccents(texte: string): string {
  return texte.normalize('NFD').replace(/\p{Diacritic}/gu, '')
}

/**
 * La comparaison de textes de MathALÉA ignore la casse mais pas les accents :
 * on accepte donc explicitement les variantes sans accents.
 */
function reponsesTexteAcceptees(question: QuestionDeCours): string[] {
  const reponses = new Set<string>()
  for (const answer of question.answers) {
    reponses.add(answer)
    reponses.add(sansAccents(answer))
  }
  return [...reponses]
}
