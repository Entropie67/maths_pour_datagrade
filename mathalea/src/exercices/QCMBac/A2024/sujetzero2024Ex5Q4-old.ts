// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 1bc77 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import ExerciceQcm from '../../ExerciceQcm'
import { sp } from '../../../lib/outils/outilString'

export const uuid = '1bc77'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Sujet zéro 2024 : listes ordonnées.'
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
export default class SujetZero2024Ex5Q4Old extends ExerciceQcm {
  versionOriginale: () => void = () => {
    this.reponses = [
      '$2^{10}$',
      '$2 \\times 10$',
      '$1 \\times 2 \\times 3 \\times \\cdots \\times 10$',
      '$\\dfrac{1 \\times 2 \\times 3 \\times \\cdots \\times 10}{1 \\times 2}$',
    ]

    this.enonce = `On effectue dix lancers d'une pièce de monnaie. Le résultat d'un lancer est «\u00a0pile\u00a0» ou «\u00a0face\u00a0».<br>
    On note la liste ordonnée des dix résultats.<br>
    Quel est le nombre de listes ordonnées possibles${sp()}?`
    this.correction =
      'Il y a $2$ résultats possibles si on effectue $1$ lancer, $2^2$ résultats possibles si on effectue $2$ lancers, etc., $2^{10}$ résultats possibles si on effectue $10$ lancers.'
  }

  constructor() {
    super()
    this.options.vertical = true
    this.versionOriginale()
  }
}
