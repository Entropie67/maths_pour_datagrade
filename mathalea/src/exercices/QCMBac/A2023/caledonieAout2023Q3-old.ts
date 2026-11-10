// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 8eaa0 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import ExerciceQcm from '../../ExerciceQcm'
import { sp } from '../../../lib/outils/outilString'

export const uuid = '8eaa0'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Nouvelle Calédonie 08/23 : droite et plan'
export const dateDePublication = '05/11/2024'
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
    this.reponses = [
      'incluse dans le plan $(P)$.',
      'sécante et non orthogonale au plan $(P)$.',
      'strictement parallèle au plan $(P)$;',
      'orthogonale au plan $(P)$.',
    ]

    this.enonce =
      "On se place dans l'espace muni d'un repère orthonormé $\\left(O;\\vec{\\imath};\\vec{\\jmath};\\vec{k}\\right).$<br>"
    this.enonce +=
      `On considère le plan $(P)$ dont une équation cartésienne est${sp()}: $2x - y + z - 1 = 0.$<br>`
    this.enonce +=
      `On considère la droite $(\\Delta)$ dont une représentation paramétrique est${sp()}:<br>`
    this.enonce +=
      '$\\left\\{\\begin{array}{l}x=2 + u\\\\y=4 + u\\quad (u \\in \\mathbb R)\\\\z=1 - u\\end{array}\\right.$<br>'
    this.enonce += `La droite $(\\Delta)$ est${sp()}:`

    this.correction =
      'Un vecteur normal au plan (P) est $\\vec{n}\\left(\\begin{array}{c}2 \\\\ -1 \\\\ 2\\end{array}\\right)$ '
    this.correction +=
      'et un vecteur directeur de ( $\\Delta$ ) est $\\vec{u}=\\left(\\begin{array}{c}1 \\\\ 1 \\\\ -1\\end{array}\\right)$.<br>'
    this.correction +=
      `  On a${sp()}: $\\vec{n} \\cdot \\vec{u}=2 \\times 1-1 \\times 1+1 \\times(-1)=0$, donc $\\vec{n}$ et $\\vec{u}$ sont orthogonaux.`
    this.correction += '   Donc (P) et ( $\\Delta$ ) sont parallèles.<br>'
    this.correction +=
      "   S'il existe un point commun à $(P)$ et $(\\Delta)$, alors $(\\Delta)$ est incluse dans $(\\mathrm{P})$.<br>"
    this.correction +=
      ' $(\\Delta)$ passe par le point de coordonnées $(2 ; 4 ; 1)$. Or $2 \\times 2-4+1-1=0$, donc ce point est un point du plan (P).<br>'
    this.correction +=
      '  La droite ( $\\Delta$ ) est donc incluse dans le plan (P).<br>'
  }

  constructor() {
    super()
    this.options.vertical = true
    this.versionOriginale()
  }
}
