// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 570b7 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import ExerciceQcm from '../../ExerciceQcm'
import { sp } from '../../../lib/outils/outilString'

export const uuid = '570b7'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Métropole 09/23 : primitive'
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
export default class metropoleSept2023Q1Old extends ExerciceQcm {
  versionOriginale: () => void = () => {
    this.reponses = [
      '$F(x) = \\dfrac12 \\mathrm{e}^{x^2 - 3}$',
      '$F(x) = 2x\\mathrm{e}^{x^2 - 3}$',
      '$F(x) = \\left(2x^2 + 1\\right)\\mathrm{e}^{x^2 - 3}$',
      '$F(x) = \\dfrac12 x\\mathrm{e}^{x^2 - 3}$',
    ]

    this.enonce = `On considère la fonction $f$ définie sur $\\mathbb R$ par 
$f(x) = x \\mathrm{e}^{x^2 - 3}.$<br>

Une des primitives $F$ de la fonction $f$ sur $\\mathbb R$ est définie par${sp()}:`

    this.correction =
      "Avec $F(x) = \\dfrac12 \\mathrm{e}^{x^2 - 3}$, on a $F'(x) = 2x \\times \\dfrac12\\mathrm{e}^{x^2 - 3} = x\\mathrm{e}^{x^2 - 3} = f(x)$ "
  }

  constructor() {
    super()
    this.options.vertical = true
    this.versionOriginale()
  }
}
