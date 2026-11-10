import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { droiteGraduee } from '../../../lib/2d/DroiteGraduee'
import { fixeBordures } from '../../../lib/2d/fixeBordures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { mathalea2d } from '../../../modules/mathalea2d'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Déterminer une abscisse sur une droite graduée'
export const interactifReady = true

export const uuid = 'e3c35'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Jean-claude Lhote

*/
export default class AbscisseEnDemis extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.nbQuestions = 1

    this.canOfficielle = false
  }

  nouvelleVersion() {
    let a1: number
    const delta = 1
    if (this.canOfficielle) {
      a1 = 11
    } else {
      a1 = randint(5, 15)
    }
    const a2 = a1 + delta
    const x = a2 + 0.5
    this.reponse = { reponse: { value: `\\frac{${2 * a2 + 1}}{2}` } }
    const drGrad = droiteGraduee({
      Unite: 2,
      Min: a1 - 1,
      Max: a2 + 1,
      thickSec: true,
      thickSecDist: 0.5,
      labelsPrincipaux: false,
      labelListe: [
        [a1, String(a1)],
        [a2, String(a2)],
      ],
      pointListe: [[x, 'A']],
    })
    const objets = [drGrad]
    this.question = "Quelle est l'abscisse du point A ?<br>"
    this.question += mathalea2d(
      Object.assign({ scale: 0.5 }, fixeBordures(objets)),
      objets,
    )

    this.correction = `L'abscisse du point A est $${miseEnEvidence(texNombre(x, 1))}$.`
  }
}
