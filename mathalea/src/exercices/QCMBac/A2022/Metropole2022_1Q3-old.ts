// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid fa682 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { courbe } from '../../../lib/2d/Courbe'
import { repere } from '../../../lib/2d/reperes'
import { texteParPosition } from '../../../lib/2d/textes'
import { bleuMathalea } from '../../../lib/colors'
import { texteEnCouleurEtGras } from '../../../lib/outils/embellissements'
import { context } from '../../../modules/context'
import { mathalea2d } from '../../../modules/mathalea2d'
import ExerciceQcm from '../../ExerciceQcm'
import { sp } from '../../../lib/outils/outilString'

export const uuid = 'fa682'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Métropole 05/22 : convexité'
export const dateDePublication = '09/03/2025'
/**
 * Ceci est un exo construit à partir d'une question de qcm de Bac.
 * Il utilise la classe ExerciceQcm qui définit les contours de l'exo (sans version aléatoire)
 * Ce moule à exo dispose d'une méthode qcmCamExport qui permet de récupérer le JSON de la question et de la reponse pour qcmCam.
 * Il est interactif et dispose d'un export AMC d'office
 */
/**
 *
 * @author Stéphane Guyon
 *
 */
export default class SujetZero2024Ex5Q5Old extends ExerciceQcm {
  versionOriginale: () => void = () => {
    const r = repere({
      xMin: -1,
      yMin: -6,
      yMax: 1,
      xMax: 11,
      xUnite: 1,
      yUnite: 1,
      thickHauteur: 0.1,
      xLabelMin: -1,
      yLabelMin: -6,
      xLabelMax: 11,
      yLabelMax: 1,
      yThickDistance: 1,
      xThickDistance: 1,
      axeXStyle: '->',
      axeYStyle: '->',
      grilleYDistance: 1,
      grilleSecondaire: true,
      grilleSecondaireYDistance: 1,
      grilleSecondaireXDistance: 1,
      grilleSecondaireYMin: 0,
      grilleSecondaireYMax: 1,
      grilleSecondaireXMin: 0,
      grilleSecondaireXMax: 1,
    })

    const f = (x: number) => (2 * (x - 2)) / Math.exp(x / 2)

    const graphique = mathalea2d(
      {
        xmin: -1,
        xmax: 11,
        ymin: -7,
        ymax: 1,
        pixelsParCm: 30,
        scale: 1,
        center: !context.isHtml,
      },
      [
        courbe(f, {
          repere: r,
          xMin: -0.3,
          xMax: 11,
          color: bleuMathalea,
          epaisseur: 2,
        }),
        r,
        texteParPosition('1', 1, -0.4, 0, 'black', 1),
        texteParPosition('2', 2, -0.4, 0, 'black', 1),
        texteParPosition('0', 0.4, -0.4, 0, 'black', 1),
        texteParPosition('1', 0.4, 1, 0, 'black', 1),
        texteParPosition("$\\mathcal{C}_{f'}$", 0.8, -3.5, 0, bleuMathalea, 1),
      ],
    )
    this.reponses = [
      '$f$ est convexe sur $[0~;~2]$', // Réponse correcte (c)
      '$f$ est concave sur $]0~;~+\\infty[$', // Mauvaise réponse (a)
      '$f$ est convexe sur $]0~;~+\\infty[$', // Mauvaise réponse (b)
      '$f$ est convexe sur $[2~;~+\\infty[$', // Mauvaise réponse (d)
    ]

    this.enonce =
      "On donne la représentation graphique de la fonction dérivée $f'$ d'une fonction $f$ définie sur $\\R$.<br>"
    this.enonce += `${graphique}`
    this.enonce += `Parmi les affirmations suivantes, laquelle est correcte${sp()}?`

    this.correction =
      "La courbe de $f'$ montre que $f'$ est croissante sur $]0~;~2]$.<br>"
    this.correction +=
      "La dérivée de $f'$ est donc positive sur l'intervalle. On en déduit que $f''$ positive sur $[0~;~2]$.<br>"
    this.correction += `La bonne réponse est donc ${texteEnCouleurEtGras('$f$ est convexe sur $[0~;~2]$')}.`
  }

  constructor() {
    super()
    this.options.vertical = true
    this.versionOriginale()
  }
}
