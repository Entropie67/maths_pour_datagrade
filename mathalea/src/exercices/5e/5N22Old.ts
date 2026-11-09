import { codageAngle } from '../../lib/2d/angles'
import { cercleCentrePoint } from '../../lib/2d/cercle'
import { codageAngleDroit } from '../../lib/2d/CodageAngleDroit'
import { PointAbstrait, pointAbstrait } from '../../lib/2d/PointAbstrait'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { labelPoint } from '../../lib/2d/textes'
import { rotation } from '../../lib/2d/transformations'
import { bleuMathalea } from '../../lib/colors'
import { lampeMessage } from '../../lib/format/message'
import { texteGras } from '../../lib/format/style'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { shuffle } from '../../lib/outils/arrayOutils'
import { texteEnCouleur } from '../../lib/outils/embellissements'
import { numAlpha } from '../../lib/outils/outilString'
import { fraction } from '../../modules/fractions'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const interactifReady = true

export const dateDeModificationImportante = '17/03/2026' // Rendu interactif par Jean-claude Lhote
export const titre = 'Résoudre un problème en utilisant des fractions'

/**
 * * Résoudre un problème additif de fractions niv 5e
 * @author Sébastien Lozano
 */
export const uuid = 'b6250'

export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
// une fonction pour gérer le codage des angles
function myCodageAngle(
  A: PointAbstrait,
  O: PointAbstrait,
  B: PointAbstrait,
  angle: number,
  [...args],
) {
  if (angle === 90) {
    return codageAngleDroit(A, O, B)
  } else {
    return codageAngle(A, O, angle, ...args)
  }
}

// une fonction pour gérer le texte en fonction de l'angle
function myTexteVolsCorr(angle: number) {
  switch (angle) {
    case 90:
      return `du secteur est un angle droit, il mesure $${angle}^\\circ$ sur les $360^\\circ$ d'un tour complet, donc il représente $\\dfrac{${angle}}{360}$ du disque soit $\\dfrac{1}{4}$.`
    case 30:
      return `rouge apparaît $3$ fois, l'angle vert vaut $180^\\circ$ et il y a un angle droit.<br>
L'angle pour un tour complet vaut $360^\\circ$, donc l'angle rouge vaut $(360-180-90)\\div 3 = ${angle}^\\circ$.<br>
L'angle rouge mesure $${angle}^\\circ$ sur les $360^\\circ$ d'un tour complet, donc il représente $\\dfrac{${angle}}{360}$ du disque soit $\\dfrac{1}{12}$.
`
    case 180:
    default:
      return `du secteur est un angle plat, il mesure $${angle}^\\circ$ sur les $360^\\circ$ d'un tour complet, donc il représente $\\dfrac{${angle}}{360}$ du disque soit $\\dfrac{1}{2}$.`
  }
}

// une fonction pour positionner le label
// y est l'ordonnée du point
function myLabelPosition(y: number) {
  if (y < 0) {
    return 'below'
  } else {
    return 'above'
  }
}
export default class ProblemesAdditifsFractions5eOld extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    this.introduction = lampeMessage({
      titre: '',
      texte: 'Calculatrice autorisée',
      couleur: 'nombres',
    })
    for (
      let i = 0, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      // on définit les fractions pour les vols et les arguments pour le graphique
      type FracVols = [
        number,
        number,
        [number, string, string, number, number, string, number],
      ][]
      let fracVols: FracVols = [
        [1, 12, [1.8, ' ', 'black', 2, 1, 'red', 0.4]],
        [1, 12, [1.8, ' ', 'black', 2, 1, 'red', 0.4]],
        [1, 12, [1.8, ' ', 'black', 2, 1, 'red', 0.4]],
        [1, 4, [1.8, ' ', 'black', 2, 1, bleuMathalea, 0.4]],
        [1, 2, [1.8, ' ', 'black', 2, 1, 'green', 0.4]],
      ]
      // on mélange pour l'aléatoire tant que les deux premieres fractions sont égales
      do {
        fracVols = shuffle(fracVols)
      } while (fracVols[0][1] === fracVols[1][1])

      // let q1a = randint(1,5); // indice pour faire varier la 1ere question sur la destination
      // let q1b = randint(1,5,[q1a]); // indice pour faire varier la 2eme question sur la destination
      let nbVolsTotal
      let destinationsVols = [
        ["l'", 'Afrique'],
        ["l'", 'Asie'],
        ["l'", 'Amérique'],
        ["l'", 'Europe'],
        ['la', ' France'],
      ]
      destinationsVols = shuffle(destinationsVols)
      do {
        nbVolsTotal = randint(200, 600)
      } while (
        nbVolsTotal % 2 !== 0 ||
        nbVolsTotal % 3 !== 0 ||
        nbVolsTotal % 4 !== 0
      )

      // pour les situations
      type Situation = {
        fin_enonce_situation: string
        nom_enonce: string
        last_question: string[]
        cat1: {
          destination: string
          article: string
          nom: string
          frac: FracVols[0]
          angle: number
          arg_graph: [number, string, string, number, number, string, number]
        }
        cat2: {
          destination: string
          article: string
          nom: string
          frac: FracVols[1]
          angle: number
          arg_graph: [number, string, string, number, number, string, number]
        }
        cat3: {
          destination: string
          article: string
          nom: string
          frac: FracVols[2]
          angle: number
          arg_graph: [number, string, string, number, number, string, number]
        }
        cat4: {
          destination: string
          article: string
          nom: string
          frac: FracVols[3]
          angle: number
          arg_graph: [number, string, string, number, number, string, number]
        }
        cat5: {
          destination: string
          article: string
          nom: string
          frac: FracVols[4]
          angle: number
          arg_graph: [number, string, string, number, number, string, number]
        }
        nb_total: number
        fig: string
      }
      const situations: Situation = {
        // case 0 --> vols
        fin_enonce_situation:
          "vols d'une compagnie aérienne selon la destination",
        nom_enonce: 'vols',
        last_question: [
          'cette compagnie a affrété',
          'vols',
          'le nombre de vols',
          'Le nombre de vols',
        ],
        cat1: {
          destination: destinationsVols[0][0] + destinationsVols[0][1],
          article: destinationsVols[0][0],
          nom: destinationsVols[0][1],
          frac: fracVols[0],
          angle: 360 / fracVols[0][1],
          arg_graph: fracVols[0][2],
        },
        cat2: {
          destination: destinationsVols[1][0] + destinationsVols[1][1],
          article: destinationsVols[1][0],
          nom: destinationsVols[1][1],
          frac: fracVols[1],
          angle: 360 / fracVols[1][1],
          arg_graph: fracVols[1][2],
        },
        cat3: {
          destination: destinationsVols[2][0] + destinationsVols[2][1],
          article: destinationsVols[2][0],
          nom: destinationsVols[2][1],
          frac: fracVols[2],
          angle: 360 / fracVols[2][1],
          arg_graph: fracVols[2][2],
        },
        cat4: {
          destination: destinationsVols[3][0] + destinationsVols[3][1],
          article: destinationsVols[3][0],
          nom: destinationsVols[3][1],
          frac: fracVols[3],
          angle: 360 / fracVols[3][1],
          arg_graph: fracVols[3][2],
        },
        cat5: {
          destination: destinationsVols[4][0] + destinationsVols[4][1],
          article: destinationsVols[4][0],
          nom: destinationsVols[4][1],
          frac: fracVols[4],
          angle: 360 / fracVols[4][1],
          arg_graph: fracVols[4][2],
        },
        nb_total: nbVolsTotal,
        fig: '',
      }

      // on prépare la fenetre mathalea2d
      const fenetreMathalea2D = {
        xmin: -10,
        ymin: -8,
        xmax: 10,
        ymax: 8,
        pixelsParCm: 20,
        scale: 0.5,
      }
      const OVols = pointAbstrait(0, 0)
      const AVols = pointAbstrait(fenetreMathalea2D.xmin + 6, 0)
      const cVols = cercleCentrePoint(OVols, AVols, bleuMathalea)
      cVols.epaisseur = 2
      // on trace les quartiers
      // cat1
      const BVols = rotation(AVols, OVols, situations.cat1.angle)
      const segmentOAVols = segment(OVols, AVols)
      const segmentOBVols = segment(OVols, BVols)
      const codageAOB = myCodageAngle(
        AVols,
        OVols,
        BVols,
        situations.cat1.angle,
        situations.cat1.arg_graph,
      )
      // cat2
      const CVols = rotation(BVols, OVols, situations.cat2.angle)
      const segmentOCVols = segment(OVols, CVols)
      const codageBOC = myCodageAngle(
        BVols,
        OVols,
        CVols,
        situations.cat2.angle,
        situations.cat2.arg_graph,
      )
      // cat3
      const DVols = rotation(CVols, OVols, situations.cat3.angle)
      const segmentODVols = segment(OVols, DVols)
      const codageCOD = myCodageAngle(
        CVols,
        OVols,
        DVols,
        situations.cat3.angle,
        situations.cat3.arg_graph,
      )
      // cat4
      const EVols = rotation(DVols, OVols, situations.cat4.angle)
      const segmentOEVols = segment(OVols, EVols)
      const codageDOE = myCodageAngle(
        DVols,
        OVols,
        EVols,
        situations.cat4.angle,
        situations.cat4.arg_graph,
      )
      // cat5
      const FVols = rotation(EVols, OVols, situations.cat5.angle)
      const segmentOFVols = segment(OVols, FVols)
      const codageEOF = myCodageAngle(
        EVols,
        OVols,
        FVols,
        situations.cat5.angle,
        situations.cat5.arg_graph,
      )

      // légende
      const ALegende = pointAbstrait(fenetreMathalea2D.xmin + 4, 0)
      const LVolsegmentcat1 = rotation(
        ALegende,
        OVols,
        situations.cat1.angle / 2,
        situations.cat1.nom,
      )
      LVolsegmentcat1.positionLabel = myLabelPosition(LVolsegmentcat1.y)
      const LLVolsegmentcat1 = rotation(
        AVols,
        OVols,
        situations.cat1.angle / 2,
        situations.cat1.nom,
      )
      const segmentLegendeCat1 = segment(LVolsegmentcat1, LLVolsegmentcat1)
      segmentLegendeCat1.styleExtremites = '->'
      segmentLegendeCat1.pointilles = 5

      const LVolsegmentcat2 = rotation(
        LVolsegmentcat1,
        OVols,
        situations.cat1.angle / 2 + situations.cat2.angle / 2,
        situations.cat2.nom,
      )
      LVolsegmentcat2.positionLabel = myLabelPosition(LVolsegmentcat2.y)
      const LLVolsegmentcat2 = rotation(
        BVols,
        OVols,
        situations.cat2.angle / 2,
        situations.cat2.nom,
      )
      const segmentLegendeCat2 = segment(LVolsegmentcat2, LLVolsegmentcat2)
      segmentLegendeCat2.styleExtremites = '->'
      segmentLegendeCat2.pointilles = 5

      const LVolsegmentcat3 = rotation(
        LVolsegmentcat2,
        OVols,
        situations.cat2.angle / 2 + situations.cat3.angle / 2,
        situations.cat3.nom,
      )
      LVolsegmentcat3.positionLabel = myLabelPosition(LVolsegmentcat3.y)
      const LLVolsegmentcat3 = rotation(
        CVols,
        OVols,
        situations.cat3.angle / 2,
        situations.cat3.nom,
      )
      const segmentLegendeCat3 = segment(LVolsegmentcat3, LLVolsegmentcat3)
      segmentLegendeCat3.styleExtremites = '->'
      segmentLegendeCat3.pointilles = 5

      const LVolsegmentcat4 = rotation(
        LVolsegmentcat3,
        OVols,
        situations.cat3.angle / 2 + situations.cat4.angle / 2,
        situations.cat4.nom,
      )
      LVolsegmentcat4.positionLabel = myLabelPosition(LVolsegmentcat4.y)
      const LLVolsegmentcat4 = rotation(
        DVols,
        OVols,
        situations.cat4.angle / 2,
        situations.cat4.nom,
      )
      const segmentLegendeCat4 = segment(LVolsegmentcat4, LLVolsegmentcat4)
      segmentLegendeCat4.styleExtremites = '->'
      segmentLegendeCat4.pointilles = 5

      const LVolsegmentcat5 = rotation(
        LVolsegmentcat4,
        OVols,
        situations.cat4.angle / 2 + situations.cat5.angle / 2,
        situations.cat5.nom,
      )
      LVolsegmentcat5.positionLabel = myLabelPosition(LVolsegmentcat5.y)
      const LLVolsegmentcat5 = rotation(
        EVols,
        OVols,
        situations.cat5.angle / 2,
        situations.cat5.nom,
      )
      const segmentLegendeCat5 = segment(LVolsegmentcat5, LLVolsegmentcat5)
      segmentLegendeCat5.styleExtremites = '->'
      segmentLegendeCat5.pointilles = 5

      const mesAppels = [
        cVols,
        segmentOAVols,
        segmentOBVols,
        segmentOCVols,
        segmentODVols,
        segmentOEVols,
        segmentOFVols,
        codageAOB,
        codageBOC,
        codageCOD,
        codageDOE,
        codageEOF,
        labelPoint(LVolsegmentcat1),
        labelPoint(LVolsegmentcat2),
        labelPoint(LVolsegmentcat3),
        labelPoint(LVolsegmentcat4),
        labelPoint(LVolsegmentcat5),
        segmentLegendeCat1,
        segmentLegendeCat2,
        segmentLegendeCat3,
        segmentLegendeCat4,
        segmentLegendeCat5,
      ]
      const figVols = mathalea2d(fenetreMathalea2D, mesAppels)
      situations.fig = figVols

      let indexSouSegmentQuestion = 0
      let indexSouSegmentQuestionCorr = 0

      const enonces = {
        enonce: `
On a représenté sur le diagramme circulaire ci-dessous la répartition des ${situations.fin_enonce_situation}.<br>
${texteGras('Les angles de même couleur ont la même mesure.')}<br>
${texteGras("L'angle vert est un angle plat.")}<br>
${situations.fig}

${numAlpha(indexSouSegmentQuestion++)} Quelle fraction représente les ${situations.nom_enonce} vers ${situations.cat1.destination} ?${ajouteChampTexteMathLive(this, 3 * i, KeyboardType.clavierDeBaseAvecFraction)}<br>
${numAlpha(indexSouSegmentQuestion++)} Quelle fraction représente les ${situations.nom_enonce} vers ${situations.cat2.destination} ?${ajouteChampTexteMathLive(this, 3 * i + 1, KeyboardType.clavierDeBaseAvecFraction)}<br>
${numAlpha(indexSouSegmentQuestion++)} Sachant que ${situations.last_question[0]} $${situations.nb_total}$ ${situations.last_question[1]}
et que les ${situations.nom_enonce} vers ${situations.cat3.destination} représentent $\\dfrac{${situations.cat3.frac[0]}}{${situations.cat3.frac[1]}}$ de ce total,
calculer ${situations.last_question[2]} vers ${situations.cat3.destination} ?${ajouteChampTexteMathLive(this, 3 * i + 2, KeyboardType.clavierDeBaseAvecFraction)}

`,
        correction: `
${numAlpha(indexSouSegmentQuestionCorr++)} Pour ${situations.cat1.destination}, l'angle ${myTexteVolsCorr(situations.cat1.angle)}<br>
${texteEnCouleur(`La fraction qui représente les ${situations.nom_enonce} vers ${situations.cat1.destination} vaut donc $\\dfrac{${situations.cat1.frac[0]}}{${situations.cat1.frac[1]}}$`)}.<br>

${numAlpha(indexSouSegmentQuestionCorr++)} Pour ${situations.cat2.destination}, l'angle ${myTexteVolsCorr(situations.cat2.angle)}<br>
${texteEnCouleur(`La fraction qui représente les ${situations.nom_enonce} vers ${situations.cat2.destination} vaut donc $\\dfrac{${situations.cat2.frac[0]}}{${situations.cat2.frac[1]}}$`)}<br>

${numAlpha(indexSouSegmentQuestionCorr++)} Calculons $\\dfrac{${situations.cat3.frac[0]}}{${situations.cat3.frac[1]}}$ de $${situations.nb_total}$ :<br>
$\\dfrac{${situations.cat3.frac[0]}}{${situations.cat3.frac[1]}}\\times ${situations.nb_total} = \\dfrac{${situations.cat3.frac[0]}\\times ${situations.nb_total}}{${situations.cat3.frac[1]}} = \\dfrac{${situations.cat3.frac[0]}\\times ${situations.nb_total / situations.cat3.frac[1]}\\times ${situations.cat3.frac[1]}}{${situations.cat3.frac[1]}} = \\dfrac{${situations.cat3.frac[0]}\\times ${situations.nb_total / situations.cat3.frac[1]}\\times \\cancel{${situations.cat3.frac[1]}}}{\\cancel{${situations.cat3.frac[1]}}} = ${situations.cat3.frac[0]}\\times ${situations.nb_total / situations.cat3.frac[1]} = ${situations.nb_total / situations.cat3.frac[1]}$<br>
${texteEnCouleur(`${situations.last_question[3]} vers ${situations.cat3.destination} vaut donc $${situations.nb_total / situations.cat3.frac[1]}$.`)}
`,
      }

      texte = `${enonces.enonce}`
      texteCorr = `${enonces.correction}`

      if (this.listeQuestions.indexOf(texte) === -1) {
        // Si la question n'a jamais été posée, on en créé une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        handleAnswers(this, 3 * i, {
          reponse: {
            value: fraction(situations.cat1.frac[0], situations.cat1.frac[1])
              .texFraction,
            options: { fractionEgale: true },
          },
        })
        handleAnswers(this, 3 * i + 1, {
          reponse: {
            value: fraction(situations.cat2.frac[0], situations.cat2.frac[1])
              .texFraction,
            options: { fractionEgale: true },
          },
        })
        handleAnswers(this, 3 * i + 2, {
          reponse: { value: situations.nb_total / situations.cat3.frac[1] },
        })
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
