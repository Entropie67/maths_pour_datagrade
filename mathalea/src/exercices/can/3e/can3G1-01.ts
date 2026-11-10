import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Calculer et utiliser un agrandissement/réduction'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'

/**
 * @author Gilles Mora
  * Créé pendant l'été 2021

*/
export const uuid = 'dcc68'

export const refs = {
  'fr-fr': ['can3G1-01'],
  'fr-ch': ['9R1FA1E-4', '9R2FA1E-4', '9R3FA1E-4', '10CTFA1A-4', '10LCFA1A-4', '10LSFA1A-4'],
}
export default class AgrandissementReduction extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    let a, b, c
    switch (this.quotaChoice('cas', ['a', 'b', 'c', 'c'])) {
      case 'a':
        a = randint(2, 10)

        this.question = `Les longueurs d'un triangle sont multipliées par $${a}$.<br>

        Par quelle valeur est multipliée son aire ?
        `

        this.reponse = a * a
        this.correction = ` Si les longueurs sont multipliées par $k$, les aires sont multipliées par $k^2$, soit ici par $${a}^2=${miseEnEvidence(a ** 2)}$.<br>
        `
        break
      case 'b':
        a = randint(2, 10)
        b = a * a
        this.question = `L'aire d'un quadrilatère a été multipliée par $${b}$.<br>

        Par quelle valeur ont été multipliées les longueurs de ce quadrilatère ?
        `

        this.reponse = a
        this.correction = ` Si les aires sont multipliées par $k$, les longueurs sont multipliées par $\\sqrt{k}$, soit ici par $\\sqrt{${b}}=${miseEnEvidence(a)}$.<br>
        `
        break
      case 'c':
        a = randint(2, 4) // aire
        c = randint(2, 4) // coefficient

        this.question = `Les longueurs d'un rectangle de $${a}\\text{ cm}^2$ sont multipliées par $${c}$.<br>

            Quelle est l'aire du rectangle ainsi obtenu ? `
        this.optionsChampTexte = { texteApres: '$\\text{ cm}^2$' }
        this.reponse = a * c * c
        this.correction = ` Si les longueurs sont multipliées par $k$, les aires sont multipliées par $k^2$, soit ici par $${c}^2=${c ** 2}$.<br>
            Ainsi, l'aire du nouveau rectangle est : $${a}\\times ${c * c}=${miseEnEvidence(a * c * c)}\\text{ cm}^2$.
    `
        break
    }
  }
}
