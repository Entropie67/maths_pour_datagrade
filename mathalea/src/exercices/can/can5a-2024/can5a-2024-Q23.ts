import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'

import { fixeBordures } from '../../../lib/2d/fixeBordures'
import { plaque3d } from '../../../lib/3d/3dProjectionMathalea2d/BarreEtPlaque3dPerspectiveCavaliere'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { context } from '../../../modules/context'
import { mathalea2d } from '../../../modules/mathalea2d'

export const titre = 'Déterminer un nombre de cubes dans une pyramide'
export const interactifReady = true

export const uuid = '5191d'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Jean-claude Lhote pour la pyramide et Gilles Mora pour essayer d'en faire quelque chose de bien....

*/
export default class NomExercice extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    context.anglePerspective = 40
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.nbQuestions = 1
    this.canOfficielle = false
    // this.formatInteractif = 'mathlive'
  }

  nouvelleVersion() {
    if (this.canOfficielle) {
      const objets = []
      const nbEtages = 5
      for (let i = 0; i < nbEtages; i++) {
        const l = nbEtages - 2 * i
        const plaque = plaque3d(i * 0.8, i * 0.8, i * 0.805, 0.8, l, l, 'gray')
        objets.push(plaque.c2d)
      }
      this.question = mathalea2d(
        Object.assign({}, fixeBordures(objets)),
        objets,
      )
      this.question +=
        'Les étages de cette construction sont pleins.<br>Le nombre total de cubes est : '
      this.reponse = '35'
      this.correction = `Il y a $1+3\\times 3+5\\times 5=${miseEnEvidence(35)}$ petits cubes.`
    } else {
      const objets = []
      const nbEtages = randint(2, 5)
      for (let i = 0; i < nbEtages; i++) {
        const l = nbEtages - i
        const plaque = plaque3d(i * 0.4, i * 0.4, i * 0.765, 0.7, l, l, 'gray')
        objets.push(plaque.c2d)
      }
      this.question = mathalea2d(
        Object.assign({}, fixeBordures(objets)),
        objets,
      )
      this.question +=
        'Les étages de cette construction sont pleins.<br>Le nombre total de cubes est : '
      this.reponse = String(
        (nbEtages * (nbEtages + 1) * (nbEtages * 2 + 1)) / 6,
      )
      this.correction =
        'Chaque étage de la pyramide est un pavé droit de section carrée.<br>'
      this.correction +=
        'Si on part du haut, on a $1$ cube de côté, ce qui fait $1$ cube, puis $2$ cubes de côtés ce qui fait $2\\times2=4$ cubes $\\ldots$<br>'
      this.correction += `Le nombre total de cubes est la somme des $${nbEtages}$ premiers carrés d'entier :<br>$`
      for (let i = 1; i <= nbEtages; i++) {
        this.correction += `${i}^2+`
      }
      this.correction =
        this.correction.substring(0, this.correction.length - 1) + '='
      for (let i = 1; i <= nbEtages; i++) {
        this.correction += `${i ** 2}+`
      }
      this.correction =
        this.correction.substring(0, this.correction.length - 1) +
        `=${miseEnEvidence(this.reponse)}$`
    }

    if (!this.interactif) {
      this.question += ' $\\ldots$'
    }
  }
}
