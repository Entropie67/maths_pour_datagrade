// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 7e718 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import ExerciceQcm from '../../ExerciceQcm'
import { sp } from '../../../lib/outils/outilString'

export const uuid = '7e718'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = "Métropole 09/2024 : nature d'un triangle"
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
export default class metropoleSept2024Ex4Q2Old extends ExerciceQcm {
  versionOriginale: () => void = () => {
    this.reponses = [
      'rectangle non isocèle',
      'équilatéral',
      'rectangle isocèle',
      'isocèle non rectangle',
    ]

    this.enonce = this.sup3
      ? `L'espace est rapporté à un repère orthonormé $(O;\\vec{\\imath};\\vec{\\jmath};\\vec{k})$.
      On considère${sp()}:<br>
$\\bullet~~$ Les points A$(-1~;~-2~;~3)$, B$(1~;~-2~;~7)$ et C$(1~;~0~;~2)$;<br>
$\\bullet~~$ La droite $(\\Delta)$ de représentation paramétrique${sp()}:  $\\left\\{\\begin{array}{l}x=1-t \\\\ y=2 \\\\ z=-4+3 t\\end{array}\\right.$, où $t \\in \\mathbb{R}$;<br>
$\\bullet~~$ Le plan $\\mathcal{P}$ d'équation cartésienne${sp()}: $3 x+2 y+z-4=0$;<br>
$\\bullet~~$ Le plan $\\mathcal{Q}$ d'équation cartésienne${sp()}: $-6 x-4 y-2 z+7=0$.<br>`
      : ''

    this.enonce += `<br>Le triangle ABC est${sp()}:`

    this.correction =
      `On calcule les coordonnés des vecteurs $\\overrightarrow{AB}$ et $\\overrightarrow{AC}$ on obtient${sp()}:<br>`
    this.correction +=
      '$\\overrightarrow{AB}\\begin{pmatrix} 2\\\\0\\\\4\\end{pmatrix}$ et $\\overrightarrow{AC}\\begin{pmatrix} 2\\\\2\\\\-1 \\end{pmatrix}$.<br>'
    this.correction +=
      'Donc $\\overrightarrow{AB}\\cdot\\overrightarrow{AC} = 2\\times 2+0\\times 2+4\\times (-1)=0$ <br>'
    this.correction +=
      'donc $\\overrightarrow{AB}\\perp \\overrightarrow{AC}$ donc ABC est rectangle en A.<br>'
    this.correction +=
      "D'autre parent, $\\text{AB}^2=2^2+0^2+4^2=20$ et $\\text{AC}^2=2^2+2^2+(-1)^2=9$, donc $\\text{AB}\\neq \\text{AC}$<br>"
    this.correction += "Le triangle ABC n'est pas isocèle."
  }

  constructor() {
    super()
    this.options.vertical = true
    this.besoinFormulaire3CaseACocher = ["Avec le préambule de l'énoncé", true]
    this.sup3 = true
    this.versionOriginale()
  }
}
