// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 6eaec continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import ExerciceQcm from '../ExerciceQcm'

export const uuid = '6eaec'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'QCM de cours : convexité'
export const dateDePublication = '03/11/2024'
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
export default class metropoleSept2024Ex4Q1Old extends ExerciceQcm {
  versionOriginale: () => void = () => {
    this.reponses = [
      '$(T_A)$ et $(T_B)$ sont au-dessus de $\\mathcal {C_f}$, et $[AB]$ en dessous de $\\mathcal {C_f}$.',
      '$(T_A)$ et $(T_B)$ sont en dessous de $\\mathcal {C_f}$, et $[AB]$ en dessous de $\\mathcal {C_f}$.',
      '$(T_A)$ et $(T_B)$ sont au-dessus de $\\mathcal {C_f}$, et $[AB]$ au-dessus de $\\mathcal {C_f}$.',
      '$(T_A)$ et $(T_B)$ sont en dessous de $\\mathcal {C_f}$, et $[AB]$ au-dessus de $\\mathcal {C_f}$.',
    ]

    this.enonce =
      'Soit $f$ deux fois dérivable et une fonction concave sur un intervalle $[a;b]$.<br> Dans un repère orthonormé, on place deux points $A$ et $B$ de $\\mathcal {C_f}$, la courbe représentative de $f$ sur cet intervalle.<br>'
    this.enonce +=
      'On appelle $(T_A)$ et $(T_B)$ les deux tangentes à $\\mathcal {C_f}$, respectivement au point $A$ et au point $B$.'
    this.enonce +=
      '<br> On appelle $[AB]$ la corde représentant le segment $[AB]$.<br>'

    this.correction =
      "C'est un résultat de cours. La fonction étant concave sur l'intervalle $[a;b]$, les tangentes sont au-dessus de la courbe $\\mathcal {C_f}$ et les cordes en dessous de $\\mathcal {C_f}$.<br> "
  }

  constructor() {
    super()
    this.options.vertical = true
    this.versionOriginale()
  }
}
