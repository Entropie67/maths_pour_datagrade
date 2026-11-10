// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid dd1ed continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import ExerciceQcm from '../../ExerciceQcm'
import { sp } from '../../../lib/outils/outilString'

export const uuid = 'dd1ed'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Métropole 09/2024 : produit scalaire'
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
export default class metropoleSept2024Ex4Q4Old extends ExerciceQcm {
  versionOriginale: () => void = () => {
    this.reponses = [
      '$34^{\\circ}$',
      '$120^{\\circ}$',
      '$90^{\\circ}$',
      '$0^{\\circ}$',
    ]
    this.enonce = this.sup3
      ? `L'espace est rapporté à un repère orthonormé $(O;\\vec{\\imath};\\vec{\\jmath};\\vec{k})$.
  On considère${sp()}:<br>
$\\bullet~~$ Les points A$(-1~;~-2~;~3)$, B$(1~;~-2~;~7)$ et C$(1~;~0~;~2)$;<br>
$\\bullet~~$ La droite $(\\Delta)$ de représentation paramétrique${sp()}:  $\\left\\{\\begin{array}{l}x=1-t \\\\ y=2 \\\\ z=-4+3 t\\end{array}\\right.$, où $t \\in \\mathbb{R}$;<br>
$\\bullet~~$ Le plan $\\mathcal{P}$ d'équation cartésienne${sp()}: $3 x+2 y+z-4=0$;<br>
$\\bullet~~$ Le plan $\\mathcal{Q}$ d'équation cartésienne${sp()}: $-6 x-4 y-2 z+7=0$.<br>`
      : ''
    this.enonce += `On donne le produit scalaire $\\overrightarrow{BA} \\cdot \\overrightarrow{BC}=20$. <br>
Une mesure au degré près de l'angle $\\widehat{\\mathrm{ABC}}$ est${sp()}:`

    this.correction = `Calculons les normes des vecteurs $\\overrightarrow{BA}$ et $\\overrightarrow{BC}$.<br>
$\\overrightarrow{BA}  \\begin{pmatrix}x_A - x_B \\\\y_A - y_B \\\\z_A - z_B\\end{pmatrix}$ donc 
$\\overrightarrow{BA} \\begin{pmatrix}-2 \\\\0 \\\\-4\\end{pmatrix}$.<br>
La norme de $\\overrightarrow{BA}$ est donc${sp()}:$\\vert\\vert\\overrightarrow{BA}\\vert\\vert = \\sqrt{(-2)^2 + 0^2 + (-4)^2} = \\sqrt{4 + 0 + 16} = \\sqrt{20} = 2\\sqrt{5}$.<br>
De même, $\\overrightarrow{BC}\\begin{pmatrix}0 \\\\2 \\\\-5\\end{pmatrix}$.<br>
et $\\vert\\vert\\overrightarrow{BC}\\vert\\vert = \\sqrt{0^2 + 2^2 + (-5)^2} = \\sqrt{0 + 4 + 25} = \\sqrt{29}$.<br>
$\\overrightarrow{BA}\\cdot\\overrightarrow{BC}=\\vert\\vert\\overrightarrow{BA}\\vert\\vert\\times \\vert\\vert\\overrightarrow{BC}\\vert\\vert \\times \\cos\\widehat{\\mathrm{ABC}}$<br>
Comme $\\overrightarrow{BA}\\cdot\\overrightarrow{BC}=20$, on en déduit une valeur approchée de $\\cos\\widehat{\\mathrm{ABC}}$.<br>
$\\cos\\widehat{\\mathrm{ABC}}=\\dfrac{20}{2\\sqrt{145}}\\approx 0,83$.<br>
$\\widehat{\\mathrm{ABC}}\\approx 34^{\\circ}$.<br>`
  }

  constructor() {
    super()
    this.options.vertical = true
    this.versionOriginale()
    this.besoinFormulaire3CaseACocher = ["Avec le préambule de l'énoncé", true]
    this.sup3 = true
  }
}
