// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 94d92 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import ExerciceQcm from '../../ExerciceQcm'
import { sp } from '../../../lib/outils/outilString'

export const uuid = '94d92'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Métropole 09/23 : nature'
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
export default class metropoleSept2023Q2Old extends ExerciceQcm {
  versionOriginale: () => void = () => {
    this.reponses = [
      'géométrique de raison $\\mathrm{e}^2$',
      'arithmétique de raison $2$',
      'géométrique de raison $\\mathrm{e}$',
      'convergente vers $\\mathrm{e}$',
    ]

    this.enonce = `On considère la suite $\\left(u_n\\right)$ définie pour tout entier naturel $n$ par${sp()}: $u_n = \\mathrm{e}^{2n+1}.$
<br>La suite $\\left(u_n\\right)$ est${sp()}:`

    this.correction = `Si pour tout entier naturel $n$,${sp()}:<br>`
    this.correction +=
      '$u_n = \\mathrm{e}^{2n+1}$, alors $u_{n+1} = \\mathrm{e}^{2(n+1)+ 1} = \\mathrm{e}^{2n + 2 + 1} = \\mathrm{e}^{2} \\times \\mathrm{e}^{2n + 1} = \\mathrm{e}^{2} \\times u_n$. <br>'
    this.correction +=
      ' Cette égalité montre que la suite $\\left(u_n\\right)$ est géométrique de raison $\\mathrm{e}^{2}$ '
  }

  constructor() {
    super()
    this.options.vertical = true
    this.versionOriginale()
  }
}
