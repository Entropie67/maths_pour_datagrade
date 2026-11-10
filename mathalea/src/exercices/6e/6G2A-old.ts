// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 03b49 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
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
import type { AMCUneProposition } from '../../lib/amc/amcTypes'
import { bleuMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { propositionsQcm } from '../../lib/interactif/qcm'
import { ajouteChampTexte } from '../../lib/interactif/questionMathLive'
import { choisitLettresDifferentes } from '../../lib/outils/aleatoires'
import {
  arrayClone,
  combinaisonListes,
  shuffle,
} from '../../lib/outils/arrayOutils'
import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import {
  numAlpha,
  premiereLettreEnMajuscule,
} from '../../lib/outils/outilString'
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
export const dateDeModifImportante = '22/01/2024'

/**
 * Exercice testant les connaissances des élèves sur le vocabulaire du cercle dans les deux sens (Un rayon est ... et [AB] est ...)
 * et en travaillant la reconnaissance et la production (QCM ou réponse libre)
 * @author Guillaume Valmont
 * Ajout Mireille du centre de cercle, milieu de diamètre et nombre de sous-questions le 16/11/2024

 */
export const uuid = '03b49'

export const refs = {
  'fr-fr': [],
  'fr-2016': [],
  'fr-ch': ['NR'],
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

export default class VocabulaireDuCercleOld extends Exercice {
  sup3ParDefaut = '1-2-3-4-5-6'
  constructor() {
    super()

    this.nbQuestions = 1

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
    this.consigne = this.sup2
      ? 'Cocher la (ou les) bonne(s) réponse(s).'
      : 'Compléter.'
    if (context.isHtml) this.consigne += '<br>'

    const nbSousQuestionMax = 7 // Il y a 6 types de sous-questions pour l'instant... si ça venait à changer, mettre à jour ce paramètre
    let sensDesQuestionsDisponibles
    switch (this.sup) {
      case 1:
        sensDesQuestionsDisponibles = ['Un rayon est ...']
        break
      case 2:
        sensDesQuestionsDisponibles = ['[AB] est ...']
        break
      default:
        sensDesQuestionsDisponibles = ['Un rayon est ...', '[AB] est ...']
        break
    }
    const sensDesQuestions = combinaisonListes(
      sensDesQuestionsDisponibles,
      this.nbQuestions * nbSousQuestionMax,
    )
    const distanceMinEntrePoints = 2
    const distanceMinCorde = 3
    const distanceMaxCorde = 5.9
    for (
      let i = 0, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      const objetsEnonce = [] // on initialise le tableau des objets Mathalea2d de l'enoncé
      const propositionsAMC: AMCUneProposition[] = []

      texte = ''
      texteCorr = ''
      const nomsDesPoints = choisitLettresDifferentes(6)
      const O = pointAbstrait(0, 0, nomsDesPoints[0])
      const leCercle = cercle(O, 3)
      const A = pointAdistance(O, 3, nomsDesPoints[1])
      texte += `Les points $${nomsDesPoints[3]}$, $${nomsDesPoints[0]}$ et $${nomsDesPoints[2]}$ sont alignés.`
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
      objetsEnonce.push(
        leCercle,
        labelPoint(O),
        tracePoint(O),
        OA,
        BC,
        DE,
        polygon[1],
        codage,
      )
      // const params = { xmin: -4, ymin: -4, xmax: 4, ymax: 4, pixelsParCm: 20, scale: 1, optionsTikz: 'baseline=(current bounding box.north)' }
      // On ajoute au texte de l'énoncé, la figure à main levée et la figure de l'enoncé.
      const figure = mathalea2d(
        Object.assign({}, fixeBordures(objetsEnonce)),
        objetsEnonce,
      )
      texte += figure
      // On ajoute au texte de la correction, la figure de la correction
      texteCorr += texte

      let questions = []

      if (typesDeQuestions.includes('1')) {
        questions.push({
          nom: `$${O.nom + A.nom}$`,
          nature: 'le rayon',
          commentaire: `${texteEnCouleurEtGras('Le', bleuMathalea)} rayon est une ${texteEnCouleurEtGras('longueur', bleuMathalea)}, il se note donc sans crochet.`,
          commentaireAlt: `${texteEnCouleurEtGras('Un', bleuMathalea)} rayon est un ${texteEnCouleurEtGras('segment', bleuMathalea)}, il se note donc avec des crochets.`,
          sens: sensDesQuestions[i * nbSousQuestionMax + 2],
        })
      }
      if (typesDeQuestions.includes('2')) {
        questions.push({
          nom: `[$${O.nom + A.nom}$]`,
          nature: 'un rayon',
          commentaire: `${texteEnCouleurEtGras('Un', bleuMathalea)} rayon est un ${texteEnCouleurEtGras('segment', bleuMathalea)}, il se note donc avec des crochets.`,
          commentaireAlt: `${texteEnCouleurEtGras('Le', bleuMathalea)} rayon est une ${texteEnCouleurEtGras('longueur', bleuMathalea)}, il se note donc sans crochet.`,
          sens: sensDesQuestions[i * nbSousQuestionMax],
        })
      }
      if (typesDeQuestions.includes('3')) {
        questions.push({
          nom: `$${B.nom + C.nom}$`,
          nature: 'le diamètre',
          commentaire: `${texteEnCouleurEtGras('Le', bleuMathalea)} diamètre est une ${texteEnCouleurEtGras('longueur', bleuMathalea)}, il se note donc sans crochet.`,
          commentaireAlt: `${texteEnCouleurEtGras('Un', bleuMathalea)} diamètre est un ${texteEnCouleurEtGras('segment', bleuMathalea)}, il se note donc avec des crochets.`,
          sens: sensDesQuestions[i * nbSousQuestionMax + 3],
        })
      }
      if (typesDeQuestions.includes('4')) {
        questions.push({
          nom: `[$${B.nom + C.nom}$]`,
          nature: 'un diamètre',
          commentaire: `${texteEnCouleurEtGras('Un', bleuMathalea)} diamètre est un ${texteEnCouleurEtGras('segment', bleuMathalea)}, il se note donc avec des crochets.<br>Un diamètre est une corde qui passe par le centre du cercle.`,
          commentaireAlt: `${texteEnCouleurEtGras('Le', bleuMathalea)} diamètre est une ${texteEnCouleurEtGras('longueur', bleuMathalea)}, il se note donc sans crochet.`,
          sens: sensDesQuestions[i * nbSousQuestionMax + 1],
        })
      }
      if (typesDeQuestions.includes('5')) {
        questions.push({
          nom: `[$${D.nom + E.nom}$]`,
          nature: 'une corde',
          commentaire: '',
          commentaireAlt: '',
          sens: sensDesQuestions[i * nbSousQuestionMax + 4],
        })
      }
      if (typesDeQuestions.includes('6')) {
        questions.push({
          nom: `$${O.nom}$`,
          nature: 'le centre',
          commentaire: '',
          commentaireAlt: '',
          sens: sensDesQuestions[i * nbSousQuestionMax + 5],
        })
      }
      /* if (typesDeQuestions.includes('7')) {
        questions.push(
          { // Ajout Mireille
            nom: `$${O.nom}$`,
            nature: `le centre du cercle, qui est aussi le milieu de [${B.nom + C.nom}]`,
            commentaire: `On parle du ${texteEnCouleurEtGras('centre d\'un cercle', bleuMathalea)} ; pour un ${texteEnCouleurEtGras('segment', bleuMathalea)}, on parle de son ${texteEnCouleurEtGras('milieu', bleuMathalea)}.`,
            commentaireAlt: '',
            sens: sensDesQuestions[i * nbSousQuestionMax + 5]
          })
      } */

      const propositionsUnRayonEst = []
      for (const question of questions) {
        const texteProposition = question.nom
        propositionsUnRayonEst.push({
          texte: texteProposition,
          statut: false,
          feedback: question.commentaire,
          feedbackAlt: question.commentaireAlt,
        })
      }
      const propositionsABEst = []
      for (const question of questions) {
        const texteProposition = question.nature
        propositionsABEst.push({
          texte: texteProposition,
          statut: false,
          feedback: question.commentaire,
          feedbackAlt: question.commentaireAlt,
        })
      }
      let j = 0
      let nomDiametre = ''
      for (const question of questions) {
        if (question.nature === 'un diamètre') {
          nomDiametre = question.nom
          break
        }
      }
      questions = shuffle(questions).slice(0, nbSousQuestionMax)
      for (const question of questions) {
        let enonce
        const propositionsEE = []
        texte += numAlpha(j)
        texteCorr += numAlpha(j)
        if (question.sens === 'Un rayon est ...') {
          enonce =
            `${premiereLettreEnMajuscule(question.nature)} du cercle est ` +
            (this.interactif && !this.sup2
              ? ajouteChampTexte(
                  this,
                  i * questions.length + j,
                  KeyboardType.alphanumericAvecEspace,
                )
              : '...')
          texte += `${enonce}.`
          texteCorr += `${premiereLettreEnMajuscule(question.nature)} du cercle est ${texteEnCouleurEtGras(question.nom)}.<br>`
          if (question.nature === 'une corde')
            texteCorr += `${texteEnCouleurEtGras(nomDiametre)} étant un diamètre, c'est aussi une corde.<br>`
        }
        if (question.sens === '[AB] est ...') {
          enonce =
            `${question.nom} est ` +
            (this.interactif && !this.sup2
              ? ajouteChampTexte(
                  this,
                  i * questions.length + j,
                  KeyboardType.alphanumericAvecEspace,
                )
              : '...')
          texte += `${enonce} du cercle.`
          texteCorr += `${premiereLettreEnMajuscule(question.nom)} est ${texteEnCouleurEtGras(question.nature)}${question.nom === nomDiametre ? ' et aussi ' + texteEnCouleurEtGras('une corde') : ''} du cercle.<br>`
        }
        if (this.correctionDetaillee && question.commentaire !== '')
          texteCorr += question.commentaire + '<br>'
        if (this.sup2 || context.isAmc) {
          let propositions: Proposition[] = []
          if (question.sens === 'Un rayon est ...') {
            // clone réalise la deep copy d'un array ou d'un objet... ce qui rend propositions indépendant des changements de propositionsUnRayonEst
            propositions = arrayClone(propositionsUnRayonEst)
          }
          if (question.sens === '[AB] est ...') {
            // clone réalise la deep copy d'un array ou d'un objet... ce qui rend propositions indépendant des changements de propositionsABEst
            propositions = arrayClone(propositionsABEst)
          }
          for (let ee = 0; ee < propositions.length; ee++) {
            const statut =
              propositions[ee].texte === question.nom ||
              propositions[ee].texte === question.nature ||
              (question.nature === 'un diamètre' &&
                propositions[ee].texte === 'une corde') ||
              (question.nature === 'une corde' &&
                propositions[ee].texte === nomDiametre)
            let feedback
            if (statut) feedback = propositions[ee].feedback
            else feedback = propositions[ee].feedbackAlt
            propositionsEE.push({
              texte: propositions[ee].texte ?? '',
              statut,
              feedback,
            })
          }
          if (!context.isAmc) {
            this.autoCorrection[i * questions.length + j] = {
              enonce,
              options: { ordered: false },
              propositions: propositionsEE,
            }
            texte +=
              propositionsQcm(this, i * questions.length + j).texte + '<br>'
          } else if (context.isAmc) {
            propositionsAMC[j] = {
              type: 'qcmMult', // on donne le type de la première question-réponse qcmMono, qcmMult, AMCNum, AMCOpen
              enonce,
              propositions: propositionsEE,
            }
          }
        } else {
          let reponses: string[] = []
          if (question.sens === 'Un rayon est ...') {
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
              case 'le milieu': // Ajout Mireille
                reponses.push(B.nom + C.nom)
                break
            }
          }

          if (question.sens === '[AB] est ...') {
            reponses = [question.nature]
            if (question.nature === 'un diamètre') {
              reponses.push('un diametre') // Réponse provisoire (à supprimer)
              reponses.push('une corde')
            } else if (question.nature === 'le diamètre') {
              reponses.push('le diametre') // Réponse provisoire (à supprimer)
            }
          }

          handleAnswers(this, i * questions.length + j, {
            reponse: { value: reponses, options: { texteSansCasse: true } },
          })
        }
        texte += '<br>'

        if (this.correctionDetaillee) texteCorr += '<br>'
        j++
      }

      // Si la question n'a jamais été posée, on l'enregistre
      if (this.questionJamaisPosee(i, ...nomsDesPoints)) {
        // <- laisser le i et ajouter toutes les variables qui rendent les exercices différents (par exemple a, b, c et d)
        // Dans cet exercice, on n'utilise pas a, b, c et d mais A, B, C et D alors remplace-les !
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr

        if (context.isAmc) {
          this.autoCorrectionAMC[i] = {
            enonce:
              figure +
              'À partir de la figure ci-dessus, compléter les phrases suivantes.',
            enonceAvant: true, // EE : ce champ est facultatif et permet (si false) de supprimer l'énoncé ci-dessus avant la numérotation de chaque question.
            enonceCentre: true, // EE : ce champ est facultatif et permet (si true) de centrer le champ 'enonce' ci-dessus.
            melange: true, // EE : ce champ est facultatif et permet (si false) de ne pas provoquer le mélange des questions.
            options: { avecSymboleMult: true }, // facultatif. Par défaut, multicols est à false. Ce paramètre provoque un multicolonnage (sur 2 colonnes par défaut) des propositions : pratique quand on met plusieurs AMCNum. !!! Attention, cela ne fonctionne pas, nativement, pour AMCOpen. !!!
            propositions: propositionsAMC,
          }
          this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
        }

        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
