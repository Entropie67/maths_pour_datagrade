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

export const uuid = '07690'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora (reprise du fichier de Jean-claude Lhote 6ième)

*/

export default class AbscisseEnDemiBisCM2 extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.nbQuestions = 1

    this.canOfficielle = false
  }

  nouvelleVersion() {
    let a1: number
    const delta = 3
    if (this.canOfficielle) {
      a1 = 20
    } else {
      a1 = 2 + randint(2, 6) * 3
    }
    const a2 = a1 + delta
    const x = a1 + delta / 2
    this.reponse = { reponse: { value: `\\frac{${2 * a1 + delta}}{2}` } }
    const drGrad = droiteGraduee({
      Unite: 1,
      Min: a1 - delta,
      Max: a2 + delta,
      thickOffset: 1,
      thickDistance: 3,
      thickSec: true,
      thickSecDist: 1.5,
      labelsPrincipaux: false,
      labelListe: [
        [a1 + 1, String(a1)],
        [a2 + 1, String(a2)],
      ],
      pointListe: [[x + 1, 'A']],
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
