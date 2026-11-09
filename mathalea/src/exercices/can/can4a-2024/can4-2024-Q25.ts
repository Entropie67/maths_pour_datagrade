import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Résoudre un problème de reste'
export const interactifReady = true

export const uuid = 'f2c62'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class NomExercice extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsChampTexte = { texteApres: 'L' }

    this.canOfficielle = false
  }

  nouvelleVersion() {
    if (this.canOfficielle) {
      this.reponse = 0.5
      this.question = `Je bois deux tiers d'une bouteille d'eau de $1,5$ L. <br>
      Quelle est la quantité d'eau restante ? `
      this.correction = `$1,5$ L $=3\\times 0,5$ L.<br>Après avoir bu deux tiers de la bouteille, il en reste un tiers, soit $${miseEnEvidence(texNombre(this.reponse))}$ L.`
    } else {
      if (choice([true, false])) {
        const a = choice(['le tiers', 'deux tiers'])
        this.reponse = a === 'le tiers' ? 1 : 0.5
        this.question = `J'ouvre une bouteille d'eau de $1,5$ L. <br>
      Je bois ${a} de la bouteille. <br>
      La quantité d'eau restante est : `
        this.correction = `$1,5$ L $=3\\times 0,5$ L.<br>Après avoir bu ${a} de la bouteille, il en reste ${a === 'le tiers' ? 'les deux tiers' : 'le tiers'}, soit $${miseEnEvidence(texNombre(this.reponse))}$ L.`
      } else {
        const a = choice(['le quart', 'trois quarts'])
        this.reponse = a === 'le quart' ? 0.75 : 0.25
        this.question = `J'ouvre une bouteille d'eau de $1$ L. <br>
      Je bois ${a} de la bouteille. <br>
      La quantité d'eau restante est : `
        this.correction = `$1$ L $=4\\times 0,25$ L.<br>
        Après avoir bu ${a} de la bouteille, il en reste ${a === 'le quart' ? 'trois quart' : 'le quart'}, soit $${miseEnEvidence(texNombre(this.reponse))}$ L.`
      }
    }

    this.canReponseACompleter = '$\\ldots$ L'
  }
}
