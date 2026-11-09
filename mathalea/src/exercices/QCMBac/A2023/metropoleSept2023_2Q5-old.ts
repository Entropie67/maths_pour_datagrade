// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 0287b continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import ExerciceQcm from '../../ExerciceQcm'
import { sp } from '../../../lib/outils/outilString'

export const uuid = '0287b'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Métropole 09/2024 : plan-droite'
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
export default class metropoleSept2024Ex4Q5Old extends ExerciceQcm {
  versionOriginale: () => void = () => {
    this.reponses = [
      "l'ensemble vide",
      'un plan',
      'une droite',
      'réduite à un point',
    ]

    this.enonce = this.sup3
      ? `L'espace est rapporté à un repère orthonormé $(O;\\vec{\\imath};\\vec{\\jmath};\\vec{k})$.
On considère${sp()}:<br>
$\\bullet~~$ Les points A$(-1~;~-2~;~3)$, B$(1~;~-2~;~7)$ et C$(1~;~0~;~2)$;<br>
$\\bullet~~$ La droite $(\\Delta)$ de représentation paramétrique${sp()}:  $\\left\\{\\begin{array}{l}x=1-t \\\\ y=2 \\\\ z=-4+3 t\\end{array}\\right.$, où $t \\in \\mathbb{R}$;<br>
$\\bullet~~$ Le plan $\\mathcal{P}$ d'équation cartésienne${sp()}: $3 x+2 y+z-4=0$;<br>
$\\bullet~~$ Le plan $\\mathcal{Q}$ d'équation cartésienne${sp()}: $-6 x-4 y-2 z+7=0$.<br>`
      : ''

    this.enonce +=
      `<br>L'intersection des plans $\\mathcal{P}$ et $\\mathcal{Q}$ est${sp()}:`

    this.correction =
      'Le plan $\\mathcal{P}$ a pour vecteur normal $\\vec n\\begin{pmatrix}3\\\\2\\\\1\\end{pmatrix}$.<br>'
    this.correction +=
      "et le plan $\\mathcal{Q}$ a pour vecteur normal $\\vec{n'}\\begin{pmatrix}-6\\\\-4\\\\-2\\end{pmatrix}$.<br>"
    this.correction +=
      "$\\vec{n'}=-2\\vec n$ donc les plans sont parallèles.<br>"
    this.correction +=
      'Les plans sont donc confondus ou strictement parallèles.<br>'
    this.correction +=
      'Pour vérifier, on teste avec le point T. On vérifie que le point T appartient à $\\mathcal{P}$.<br>'
    this.correction +=
      `$3x_{T} +2y_{T} +z_{T}-4= 3+0+1-4=0$ donc $\\text T \\in \\mathcal{P}$. <br> Mais comme${sp()}:<br>`
    this.correction +=
      '$-6x_{\\text T} -4y_{\\text T} -2z_{\\text T} +7= -6\\times 1 -4\\times 0 -2\\times 1+7=-1\\neq 0$ donc $\\text T \\notin \\mathcal{Q}$<br>'
    this.correction += 'Les deux plans sont donc strictement parallèles.'
  }

  constructor() {
    super()
    this.options.vertical = true
    this.versionOriginale()
    this.besoinFormulaire3CaseACocher = ["Avec le préambule de l'énoncé", true]
    this.sup3 = true
  }
}
