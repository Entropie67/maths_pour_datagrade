import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Calculer l’aire ou un périmètre d’un carré'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'

/**
 * @author Gilles Mora
  * Créé pendant l'été 2021

*/
export const uuid = 'db589'

export const refs = {
  'fr-fr': ['can3M-01'],
  'fr-ch': [],
}
export default class CarreAire extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    let a, c
    switch (this.quotaChoice('cas', ['a', 'b'])) {
      case 'a':
        a = randint(1, 10)

        this.question = `Quelle est l'aire d'un carré dont le périmètre est $${4 * a}\\text{ cm}$ ?`
        this.reponse = a * a
        this.correction = `Le côté du carré est $${4 * a}\\div 4=${a}$, donc son aire est : $${a}\\times ${a}=${miseEnEvidence(a ** 2)}\\text{ cm}^2$.`
        this.optionsChampTexte = { texteApres: '$\\text{ cm}^2$' }

        this.canReponseACompleter = '$\\ldots\\text{ cm}^2$'
        break
      case 'b':
        a = randint(1, 10)
        c = a * a
        this.question = `Déterminer le périmètre d'un carré d'aire $${c}\\text{ cm}^2$. `
        this.reponse = 4 * a
        this.correction = `Le côté du carré est $\\sqrt{${c}}=${a}$. Son périmètre est donc $4\\times ${a}=${miseEnEvidence(4 * a)}\\text{ cm}$.`
        this.optionsChampTexte = { texteApres: ' $\\text{cm}$' }

        this.canReponseACompleter = '$\\ldots\\text{ cm}$'
        break
    }
  }
}
