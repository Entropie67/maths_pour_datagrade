import { droiteGraduee } from '../../../lib/2d/DroiteGraduee'
import { fixeBordures } from '../../../lib/2d/fixeBordures'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { mathalea2d } from '../../../modules/mathalea2d'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Trouver un nombre sur une droite graduée'
export const interactifReady = true

export const uuid = 'b2be1'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora
 */
export default class Can2025CM1Q26 extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
  }

  nouvelleVersion() {
    const a1 = 0
    const a2 = 2

    const x = this.canOfficielle ? 3 : randint(1, 7, 4)
    this.reponse = { reponse: { value: `\\frac{${x}}{4}` } } // this.reponse = String(x)
    const drGrad = droiteGraduee({
      Unite: 4,
      Min: a1,
      Max: a2,
      thickSec: true,
      thickSecDist: 0.25,
      labelsPrincipaux: true,
      pointListe: [[x / 4, 'A']],
    })
    const objets = [drGrad]
    this.question = 'Quel nombre repère le point $A$ ?<br>'
    this.question += mathalea2d(
      Object.assign({ scale: 0.5 }, fixeBordures(objets)),
      objets,
    )

    this.correction = `L'unité est partagée en $4$. Ainsi, chaque part correspond à $0,25$.<br>
       Le nombre $${miseEnEvidence(texNombre(x / 4, 2))}$ repère le point $A$.`
  }
}
