import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { factorielle, randint } from '../../modules/outils'
import ExerciceSimple from '../ExerciceSimple'
import { deDevant } from '../../lib/outils/outilString'
export const titre = "Effectuer un dénombrement (rangement d'objets)"
export const interactifReady = true

export const dateDePublication = '20/4/2025'

export const uuid = '7ccc5'
export const refs = {
  'fr-fr': ['TSG1-02'],
  'fr-ch': [],
}

/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Stéphane Guyon

*/
export default class NomExercice extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    const n = randint(3, 10)
    let kuplet = ''
    if (n === 2) {
      kuplet = 'couple'
    }
    if (n === 3) {
      kuplet = 'triplet'
    }
    if (n === 4) {
      kuplet = 'quadruplet'
    }
    if (n === 5) {
      kuplet = 'quintuplet'
    }
    if (n >= 6) {
      kuplet = `$${n}$-uplet`
    }
    const factorielleN = factorielle(n)
    const prenom = choice([
      'Raoul',
      'Simone',
      'Lucien',
      'Bernadette',
      'Lucienne',
      'Edmond',
      'Roger',
      'Cunégonde',
    ])
    const objet = choice([
      'livres',
      'timbres',
      'cartes',
      'cahiers',
      'carnets',
      'CD',
      'boîtes',
    ])
    this.question = `${prenom} classe ses $${n}$ ${objet} et souhaite les ranger sur la même étagère.<br> Quel est le nombre de rangements possibles ?`
    this.correction = `Le problème ${deDevant(prenom)} revient à déterminer le nombre de permutations d'un ${kuplet}.<br> On sait que le nombre de permutations d'un $k$-uplet est $k~!$.<br>On calcule donc $${n}~!=${texNombre(factorielleN)}$<br> Donc le nombre de rangements possibles des $${n}$ ${objet} est égal à $${miseEnEvidence(texNombre(factorielle(n)))}$.`
    this.reponse = factorielleN
  }
}
