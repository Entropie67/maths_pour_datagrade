// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 4b8ca continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import ExerciceQcm from '../../ExerciceQcm'
import { sp } from '../../../lib/outils/outilString'

export const uuid = '4b8ca'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = "Métropole 09/2024 : point d'un plan"
export const dateDePublication = '28/10/2024'
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
      '$T(1~;~0~;~1)$',
      '$R(1~;~-3~;~1)$',
      '$S(1~;~2~;~-1)$',
      '$U(2~;~-1~;~1)$',
    ]

    this.enonce = this.sup3
      ? `L'espace est rapporté à un repère orthonormé $(O;\\vec{\\imath};\\vec{\\jmath};\\vec{k})$.<br>
On considère${sp()}:<br>
$\\bullet~~$ Les points A$(-1~;~-2~;~3)$, B$(1~;~-2~;~7)$ et C$(1~;~0~;~2)$;<br>
$\\bullet~~$ La droite $(\\Delta)$ de représentation paramétrique${sp()}:  $\\left\\{\\begin{array}{l}x=1-t \\\\ y=2 \\\\ z=-4+3 t\\end{array}\\right.$, où $t \\in \\mathbb{R}$;<br>
$\\bullet~~$ Le plan $\\mathcal{P}$ d'équation cartésienne${sp()}: $3 x+2 y+z-4=0$;<br>
$\\bullet~~$ Le plan $\\mathcal{Q}$ d'équation cartésienne${sp()}: $-6 x-4 y-2 z+7=0$.<br>`
      : ''
    this.enonce +=
      `Lequel des points suivants appartient au plan $\\mathcal{P}$${sp()}?`
    this.correction =
      '$3x_{T} +2y_{T} +z_{T}-4= 3+0+1-4=0$ donc $\\text T \\in \\mathcal{P}$'
  }

  constructor() {
    super()
    this.options.vertical = true
    this.versionOriginale()
    this.besoinFormulaire3CaseACocher = ["Avec le préambule de l'énoncé", true]
    this.sup3 = true
  }
}
