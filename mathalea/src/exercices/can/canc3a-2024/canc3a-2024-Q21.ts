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

export const uuid = '36031'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora (reprise du fichier de Jean-claude Lhote 6ième)

*/
export default class AbscisseEnDemisCM2 extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.nbQuestions = 1

    this.canOfficielle = true
  }

  nouvelleVersion() {
    let a1: number
    let a2: number
    const delta = 1
    if (this.canOfficielle) {
      a1 = 10
      a2 = 11
    } else {
      a1 = randint(5, 15)
      a2 = a1 + delta
    }

    const x = a2 + 0.5
    this.reponse = { reponse: { value: `\\frac{${2 * a2 + 1}}{2}` } } // this.reponse = String(x)
    const drGrad = droiteGraduee({
      Unite: 2,
      Min: a1,
      Max: a2 + 2,
      thickSec: true,
      thickSecDist: 0.5,
      labelsPrincipaux: false,
      labelListe: [
        [a2, String(a2)],
        [a2 + 1, String(a2 + 1)],
      ],
      pointListe: [[x, 'A']],
    })
    const objets = [drGrad]
    this.question = 'Donner le nombre qui repère le point A.<br>'
    this.question += mathalea2d(
      Object.assign({ scale: 0.5 }, fixeBordures(objets)),
      objets,
    )

    this.correction = `Le nombre qui repère le point A est : $${miseEnEvidence(texNombre(x, 1))}$.`
  }
}
