import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { arrondi } from '../../../lib/outils/nombres'
import { prenomM } from '../../../lib/outils/Personne'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Dénombrer dans une situation concrète'
export const interactifReady = true

/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

 * Date de publication septembre 2021
*/
export const uuid = '38207'

export const refs = {
  'fr-fr': ['can2P1-02', '2P10-flash2'],
  'fr-ch': ['NR'],
}
export default class Denombrement extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    let a, b, c, prenom1
    switch (this.quotaChoice('type', ['a', 'b'])) {
      case 'a':
        a = randint(3, 5)
        b = randint(2, 4)
        c = randint(2, 4)
        this.question = `À la cantine, il y a toujours $${a}$ entrées différentes, $${b}$ plats différents et $${c}$ desserts différents.<br>
        Combien de menus (composés d'une entrée, d'un plat et d'un dessert) différents peut-on avoir dans cette cantine ?`

        this.correction = `On peut avoir : $${a}\\times ${b}\\times ${c} =${miseEnEvidence(a * b * c)}$ menus différents.`
        this.reponse = arrondi(a * b * c)
        break
      case 'b':
        a = randint(2, 8)
        b = randint(2, 10)
        prenom1 = prenomM()
        this.question = `Pour composer son costume, ${prenom1} a le choix entre $${a}$ chemises et $${b}$ cravates.<br>
        De combien de manières différentes peut-il composer son costume ?`

        this.correction = `Il a : $${a}\\times ${b} =${miseEnEvidence(a * b)}$ manières de composer son costume.`
        this.reponse = arrondi(a * b)
        break
    }
  }
}
