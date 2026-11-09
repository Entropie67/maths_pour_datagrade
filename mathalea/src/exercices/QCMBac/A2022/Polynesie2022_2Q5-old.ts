// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 2f559 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import ExerciceQcm from '../../ExerciceQcm'
import { sp } from '../../../lib/outils/outilString'

export const uuid = '2f559'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Polynésie 05/22 : tangente'
export const dateDePublication = '09/03/2025'
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
      '$y = 2\\mathrm{e}x - \\mathrm{e}$', // Réponse correcte (b)
      '$y = \\mathrm{e}x + \\mathrm{e}$', // Mauvaise réponse (a)
      '$y = 2\\mathrm{e}x + \\mathrm{e}$', // Mauvaise réponse (c)
      '$y = \\mathrm{e}x$', // Mauvaise réponse (d)
    ]

    this.enonce =
      "L'équation réduite de la tangente au point d'abscisse $1$ de la courbe de la fonction $f$<br> définie sur $\\R$ par "
    this.enonce += `$f(x) = x\\mathrm{e}^x$ est${sp()}:`

    this.correction = `On calcule la dérivée de $f$${sp()}:<br>`
    this.correction +=
      "$f'(x) = \\mathrm{e}^x + x\\mathrm{e}^x = (1 + x)\\mathrm{e}^x.$<br>"
    this.correction +=
      "Ainsi, $f'(1) = (1 + 1)\\mathrm{e}^1 = 2\\mathrm{e}$.<br>"
    this.correction +=
      'On a également $f(1) = 1 \\times \\mathrm{e}^1 = \\mathrm{e}$.<br>'
    this.correction += `L'équation de la tangente est donc${sp()}:<br>`
    this.correction +=
      "$y = f'(1)(x - 1) + f(1) = 2\\mathrm{e}(x - 1) + \\mathrm{e} = 2\\mathrm{e}x - 2\\mathrm{e} + \\mathrm{e} = 2\\mathrm{e}x - \\mathrm{e}.$<br>"
    this.correction += `La bonne réponse est donc $${miseEnEvidence('y = 2\\mathrm{e}x - \\mathrm{e}')}$`
  }

  constructor() {
    super()
    this.options.vertical = true
    this.versionOriginale()
  }
}
