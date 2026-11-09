// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 0649b continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import ExerciceQcm from '../../ExerciceQcm'
import { sp } from '../../../lib/outils/outilString'

export const uuid = '0649b'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Métropole 09/2024 : droite-plan'
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
export default class metropoleSept2024Ex4Q3Old extends ExerciceQcm {
  versionOriginale: () => void = () => {
    this.reponses = [
      'strictement parallèle au plan $\\mathcal{P}$',
      'orthogonale au plan $\\mathcal{P}$',
      'sécante au plan $\\mathcal{P}$',
      'incluse dans le plan $\\mathcal{P}$',
    ]

    this.enonce = this.sup3
      ? `L'espace est rapporté à un repère orthonormé $(O;\\vec{\\imath};\\vec{\\jmath};\\vec{k})$.
    On considère${sp()}:<br>
$\\bullet~~$ Les points A$(-1~;~-2~;~3)$, B$(1~;~-2~;~7)$ et C$(1~;~0~;~2)$;<br>
$\\bullet~~$ La droite $(\\Delta)$ de représentation paramétrique${sp()}:  $\\left\\{\\begin{array}{l}x=1-t \\\\ y=2 \\\\ z=-4+3 t\\end{array}\\right.$, où $t \\in \\mathbb{R}$;<br>
$\\bullet~~$ Le plan $\\mathcal{P}$ d'équation cartésienne${sp()}: $3 x+2 y+z-4=0$;<br>
$\\bullet~~$ Le plan $\\mathcal{Q}$ d'équation cartésienne${sp()}: $-6 x-4 y-2 z+7=0$.<br>`
      : ''

    this.enonce += `<br>La droite $(\\Delta)$ est${sp()}:`

    this.correction =
      `La droite $(\\Delta)$ a pour vecteur directeur${sp()}:<br> $\\vec{v}\\begin{pmatrix}-1\\\\0\\\\3\\end{pmatrix}$, `
    this.correction +=
      'et le plan $\\mathcal{P}$ a pour vecteur normal $\\vec n \\begin{pmatrix}3\\\\2\\\\1\\end{pmatrix}$.<br>'
    this.correction +=
      '$\\vec{v}\\cdot \\vec{n} = -1\\times 3 +0\\times 2+3\\times 1 = 0$ donc $\\vec{v}\\perp \\vec{v}$,<br>'
    this.correction += 'et donc $(\\Delta)$ est parallèle à $\\mathcal{P}$.<br>'
    this.correction +=
      'Le point H de coordonnées $H(1~;~2~;~-4)$ appartient à $(\\Delta)$.<br>'
    this.correction +=
      '$3x_{\\text H} +2y_{\\text H} +z_{\\text H}-4 =3\\times 1 + 2\\times 2 -4-4=-1\\neq 0$<br>'
    this.correction += ' donc $\\text H \\notin\\mathcal{P}$.<br>'
    this.correction +=
      "La droite $(\\Delta)$ n'est pas incluse dans le plan $\\mathcal{P}$."
  }

  constructor() {
    super()
    this.options.vertical = true
    this.versionOriginale()
    this.besoinFormulaire3CaseACocher = ["Avec le préambule de l'énoncé", true]
    this.sup3 = true
  }
}
