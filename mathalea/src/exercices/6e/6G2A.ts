import { codageSegments } from '../../lib/2d/CodageSegment'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { tracePoint } from '../../lib/2d/TracePoint'
import { cercle } from '../../lib/2d/cercle'
import { droite } from '../../lib/2d/droites'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { polygoneAvecNom } from '../../lib/2d/polygones'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { labelPoint } from '../../lib/2d/textes'
import { longueur } from '../../lib/2d/utilitairesGeometriques'
import {
  pointAdistance,
  pointIntersectionLC,
} from '../../lib/2d/utilitairesPoint'
import { amcConvert } from '../../lib/amc/amcBuilders'
import { bleuMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { propositionsQcm } from '../../lib/interactif/qcm'
import { ajouteChampTexte } from '../../lib/interactif/questionMathLive'
import { choisitLettresDifferentes } from '../../lib/outils/aleatoires'
import { arrayClone, combinaisonListes } from '../../lib/outils/arrayOutils'
import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { premiereLettreEnMajuscule } from '../../lib/outils/outilString'
import type { UneProposition } from '../../lib/types'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu } from '../../modules/outils'
import Exercice from '../Exercice'

export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCHybride'
export const titre = 'Connaitre le vocabulaire du cercle'

export const dateDePublication = '19/08/2022'
export const dateDeModifImportante = '01/10/2026'

/**
 * Exercice testant les connaissances des élèves sur le vocabulaire du cercle dans les deux sens (Un rayon est ... et [AB] est ...)
 * et en travaillant la reconnaissance et la production (QCM ou réponse libre)
 * @author Guillaume Valmont
 * Ajout Mireille du centre de cercle, milieu de diamètre le 16/11/2024
 * Un seul cercle dans la consigne, chaque phrase est une question à part entière (01/10/2026)
 */
export const uuid = '7e183'

export const refs = {
  'fr-fr': ['6G2A', '6AutoG1-4'],
  'fr-2016': ['6G10-4'],
  'fr-ch': ['10CTGM1A-1', '10LCGM1A-1', '10LSGM1A-1', 'PRQES02C-1', '9R1ES7A-1', '9R2ES7A-1', '9R3ES7A-1'],
}

type Proposition = UneProposition & { feedbackAlt?: string }

function ajouterAlternatives(
  fonction: (reponse: string) => string,
  reponses: string[],
) {
  const copieReponses = []
  for (const reponse of reponses) {
    copieReponses.push(reponse)
  }
  for (const reponse of copieReponses) {
    reponses.push(fonction(reponse))
  }
  return reponses
}

function longueurAlternative(longueur: string): string {
  return longueur.slice(1) + longueur.slice(0, 1)
}

function segmentAlternatif(reponse: string): string {
  if (reponse != null) {
    return '[' + reponse.slice(2, 3) + reponse.slice(1, 2) + ']'
  } else {
    window.notify("segmentAlternatif n'a pas de matière pour choisir", {
      reponse,
    })
    return ''
  }
}

type Sens = 'Un rayon est $\\ldots$' | '[AB] est $\\ldots$'

type ObjetDemande = {
  nom: string
  nature: string
  commentaire: string
  commentaireAlt: string
}

/**
 * Réponses acceptées en saisie libre
 */
function reponsesAttendues(
  sens: Sens,
  question: ObjetDemande,
  points: Record<'O' | 'A' | 'B' | 'C' | 'D' | 'E', { nom: string }>,
): string[] {
  const { O, A, B, C, D, E } = points
  let reponses: string[] = []
  if (sens === 'Un rayon est $\\ldots$') {
    reponses = [question.nom.replace(/\$/g, '')]
    switch (question.nature) {
      case 'le rayon':
        reponses.push(
          O.nom + B.nom,
          O.nom + C.nom,
          O.nom + D.nom,
          O.nom + E.nom,
        )
        reponses = ajouterAlternatives(longueurAlternative, reponses)
        break
      case 'le diamètre':
        reponses.push(longueurAlternative(reponses[0]))
        break
      case 'un rayon':
        reponses.push(
          '[' + O.nom + B.nom + ']',
          '[' + O.nom + C.nom + ']',
          '[' + O.nom + D.nom + ']',
          '[' + O.nom + E.nom + ']',
        )
        reponses = ajouterAlternatives(segmentAlternatif, reponses)
        break
      case 'un diamètre':
        reponses.push(segmentAlternatif(reponses[0]))
        break
      case 'une corde':
        for (const point1 of [A, B, C, D, E]) {
          for (const point2 of [A, B, C, D, E]) {
            if (point1.nom !== point2.nom) {
              reponses.push('[' + point1.nom + point2.nom + ']')
            }
          }
        }
        reponses = ajouterAlternatives(segmentAlternatif, reponses)
        break
    }
  } else {
    reponses = [question.nature]
    if (question.nature === 'un diamètre') {
      reponses.push('un diametre') // sans accent
      reponses.push('une corde')
    } else if (question.nature === 'le diamètre') {
      reponses.push('le diametre') // sans accent
    }
  }
  return reponses
}

export default class VocabulaireDuCercle extends Exercice {
  sup3ParDefaut = '1-2-3-4-5-6'
  constructor() {
    super()

    this.nbQuestions = 6

    this.besoinFormulaireNumerique = [
      'Sens des questions',
      3,
      '1 : Un rayon est...\n2 : [AB] est ...\n3 : Mélange',
    ]
    this.sup = 3
    this.besoinFormulaire2CaseACocher = ['QCM']
    this.sup2 = true
    this.correctionDetailleeDisponible = true
    // this.typesDeQuestionsParDefaut = '1-2-3-4-5-6-7'
    // this.sup3 = this.typesDeQuestionsParDefaut
    this.sup3 = this.sup3ParDefaut
    this.besoinFormulaire3Texte = [
      'Type de questions',
      [
        'Au moins deux nombres séparés par des tirets :',
        '1 : Le rayon',
        '2 : Un rayon',
        '3 : Le diamètre',
        '4 : Un diamètre',
        '5 : Une corde',
        '6 : Le centre',
        // '7 : Le centre, qui est aussi le milieu'
      ].join('\n'),
    ]

    this.spacingCorr = 1.5 // Interligne des réponses
  }

  nouvelleVersion() {
    // typesDeQuestions nécessite d'avoir au moins deux valeurs
    const typesDeQuestions =
      (String(this.sup3).match(/[1-6]/g) ?? '').length > 1
        ? this.sup3
        : this.sup3ParDefaut
    let sensDesQuestionsDisponibles: Sens[]
    switch (this.sup) {
      case 1:
        sensDesQuestionsDisponibles = ['Un rayon est $\\ldots$']
        break
      case 2:
        sensDesQuestionsDisponibles = ['[AB] est $\\ldots$']
        break
      default:
        sensDesQuestionsDisponibles = ['Un rayon est $\\ldots$', '[AB] est $\\ldots$']
        break
    }

    // Une seule figure pour toutes les questions
    const distanceMinEntrePoints = 2
    const distanceMinCorde = 3
    const distanceMaxCorde = 5.9
    const nomsDesPoints = choisitLettresDifferentes(6)
    const O = pointAbstrait(0, 0, nomsDesPoints[0])
    const leCercle = cercle(O, 3)
    const A = pointAdistance(O, 3, nomsDesPoints[1])
    let B, C, D, E
    do {
      B = pointAdistance(O, 3, nomsDesPoints[2])
      C = pointIntersectionLC(droite(O, B), leCercle, nomsDesPoints[3])
    } while (
      !C ||
      longueur(A, B) < distanceMinEntrePoints ||
      longueur(A, C) < distanceMinEntrePoints ||
      longueur(B, C) < distanceMinEntrePoints
    )
    do {
      D = pointAdistance(O, 3, nomsDesPoints[4])
    } while (
      longueur(A, D) < distanceMinEntrePoints ||
      longueur(B, D) < distanceMinEntrePoints ||
      longueur(C, D) < distanceMinEntrePoints
    )
    do {
      E = pointAdistance(O, 3, nomsDesPoints[5])
    } while (
      longueur(A, E) < distanceMinEntrePoints ||
      longueur(B, E) < distanceMinEntrePoints ||
      longueur(C, E) < distanceMinEntrePoints ||
      longueur(D, E) < distanceMinCorde ||
      longueur(D, E) > distanceMaxCorde
    )
    const OA = segment(O, A)
    const BC = segment(B, C)
    const DE = segment(D, E)
    const polygon = polygoneAvecNom(A, B, C, D, E)
    const codage = codageSegments('//', bleuMathalea, O, B, O, C, O, A)
    const objetsEnonce = [
      leCercle,
      labelPoint(O),
      tracePoint(O),
      OA,
      BC,
      DE,
      polygon[1],
      codage,
    ]
    const figure = mathalea2d(
      Object.assign({}, fixeBordures(objetsEnonce)),
      objetsEnonce,
    )
    const phraseAlignement = `Les points $${nomsDesPoints[3]}$, $${nomsDesPoints[0]}$ et $${nomsDesPoints[2]}$ sont alignés.`
    this.consigne =
      (this.sup2 ? 'Cocher la (ou les) bonne(s) réponse(s).' : 'Compléter.') +
      `<br>${phraseAlignement}<br>${figure}`

    // Les différents objets de la figure qui peuvent être demandés
    const questionsPossibles: ObjetDemande[] = []
    if (typesDeQuestions.includes('1')) {
      questionsPossibles.push({
        nom: `$${O.nom + A.nom}$`,
        nature: 'le rayon',
        commentaire: `${texteEnCouleurEtGras('Le', bleuMathalea)} rayon est une ${texteEnCouleurEtGras('longueur', bleuMathalea)}, il se note donc sans crochet.`,
        commentaireAlt: `${texteEnCouleurEtGras('Un', bleuMathalea)} rayon est un ${texteEnCouleurEtGras('segment', bleuMathalea)}, il se note donc avec des crochets.`,
      })
    }
    if (typesDeQuestions.includes('2')) {
      questionsPossibles.push({
        nom: `[$${O.nom + A.nom}$]`,
        nature: 'un rayon',
        commentaire: `${texteEnCouleurEtGras('Un', bleuMathalea)} rayon est un ${texteEnCouleurEtGras('segment', bleuMathalea)}, il se note donc avec des crochets.`,
        commentaireAlt: `${texteEnCouleurEtGras('Le', bleuMathalea)} rayon est une ${texteEnCouleurEtGras('longueur', bleuMathalea)}, il se note donc sans crochet.`,
      })
    }
    if (typesDeQuestions.includes('3')) {
      questionsPossibles.push({
        nom: `$${B.nom + C.nom}$`,
        nature: 'le diamètre',
        commentaire: `${texteEnCouleurEtGras('Le', bleuMathalea)} diamètre est une ${texteEnCouleurEtGras('longueur', bleuMathalea)}, il se note donc sans crochet.`,
        commentaireAlt: `${texteEnCouleurEtGras('Un', bleuMathalea)} diamètre est un ${texteEnCouleurEtGras('segment', bleuMathalea)}, il se note donc avec des crochets.`,
      })
    }
    if (typesDeQuestions.includes('4')) {
      questionsPossibles.push({
        nom: `[$${B.nom + C.nom}$]`,
        nature: 'un diamètre',
        commentaire: `${texteEnCouleurEtGras('Un', bleuMathalea)} diamètre est un ${texteEnCouleurEtGras('segment', bleuMathalea)}, il se note donc avec des crochets.<br>Un diamètre est une corde qui passe par le centre du cercle.`,
        commentaireAlt: `${texteEnCouleurEtGras('Le', bleuMathalea)} diamètre est une ${texteEnCouleurEtGras('longueur', bleuMathalea)}, il se note donc sans crochet.`,
      })
    }
    if (typesDeQuestions.includes('5')) {
      questionsPossibles.push({
        nom: `[$${D.nom + E.nom}$]`,
        nature: 'une corde',
        commentaire: '',
        commentaireAlt: '',
      })
    }
    if (typesDeQuestions.includes('6')) {
      questionsPossibles.push({
        nom: `$${O.nom}$`,
        nature: 'le centre',
        commentaire: '',
        commentaireAlt: '',
      })
    }
    const nomDiametre = `[$${B.nom + C.nom}$]`

    // Chaque question est un couple (objet, sens), on évite les doublons tant que possible
    const couples: { objet: ObjetDemande; sens: Sens }[] = []
    for (const objet of questionsPossibles) {
      for (const sens of sensDesQuestionsDisponibles) {
        couples.push({ objet, sens })
      }
    }
    const couplesChoisis = combinaisonListes(couples, this.nbQuestions)

    const propositionsUnRayonEst = questionsPossibles.map((objet) => ({
      texte: objet.nom,
      statut: false,
      feedback: objet.commentaire,
      feedbackAlt: objet.commentaireAlt,
    }))
    const propositionsABEst = questionsPossibles.map((objet) => ({
      texte: objet.nature,
      statut: false,
      feedback: objet.commentaire,
      feedbackAlt: objet.commentaireAlt,
    }))

    for (let i = 0; i < this.nbQuestions; i++) {
      const { objet: question, sens } = couplesChoisis[i]
      let texte = ''
      let texteCorr = ''
      let enonce: string
      const champ =
        this.interactif && !this.sup2
          ? ajouteChampTexte(this, i, KeyboardType.alphanumericAvecEspace)
          : '$\\ldots$'
      if (sens === 'Un rayon est $\\ldots$') {
        enonce = `${premiereLettreEnMajuscule(question.nature)} du cercle est ${champ}`
        texte = `${enonce}.`
        texteCorr = `${premiereLettreEnMajuscule(question.nature)} du cercle est ${texteEnCouleurEtGras(question.nom)}.<br>`
        if (question.nature === 'une corde')
          texteCorr += `${texteEnCouleurEtGras(nomDiametre)} étant un diamètre, c'est aussi une corde.<br>`
      } else {
        enonce = `${question.nom} est ${champ}`
        texte = `${enonce} du cercle.`
        texteCorr = `${premiereLettreEnMajuscule(question.nom)} est ${texteEnCouleurEtGras(question.nature)}${question.nom === nomDiametre ? ' et aussi ' + texteEnCouleurEtGras('une corde') : ''} du cercle.<br>`
      }
      if (this.correctionDetaillee && question.commentaire !== '')
        texteCorr += question.commentaire + '<br>'

      if (this.sup2 || context.isAmc) {
        const propositions: Proposition[] = arrayClone(
          sens === 'Un rayon est $\\ldots$'
            ? propositionsUnRayonEst
            : propositionsABEst,
        )
        const propositionsEE = propositions.map((proposition) => {
          const statut =
            proposition.texte === question.nom ||
            proposition.texte === question.nature ||
            (question.nature === 'un diamètre' &&
              proposition.texte === 'une corde') ||
            (question.nature === 'une corde' &&
              proposition.texte === nomDiametre)
          return {
            texte: proposition.texte ?? '',
            statut,
            feedback: statut ? proposition.feedback : proposition.feedbackAlt,
          }
        })
        if (!context.isAmc) {
          this.autoCorrection[i] = {
            enonce,
            options: { ordered: false },
            propositions: propositionsEE,
          }
          texte += propositionsQcm(this, i).texte
        } else {
          this.autoCorrectionAMC[i] = {
            enonce: `${phraseAlignement}<br>${figure}<br>À partir de la figure ci-dessus, compléter la phrase suivante.`,
            enonceAvant: true,
            enonceCentre: true,
            melange: true,
            options: { avecSymboleMult: true },
            propositions: [
              {
                type: 'qcmMult',
                enonce,
                propositions: propositionsEE,
              },
            ],
          }
          this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
        }
      } else {
        handleAnswers(this, i, {
          reponse: {
            value: reponsesAttendues(sens, question, { O, A, B, C, D, E }),
            options: { texteSansCasse: true },
          },
        })
      }

      this.listeQuestions[i] = texte
      this.listeCorrections[i] = texteCorr
    }
    listeQuestionsToContenu(this)
  }
}
