import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Déterminer le nombre de centaines, dizaines'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
export const dateDePublication = '02/12/2021'
/**
 * @author Gilles Mora
 * Publié le 02 / 12 / 2021

 */
export const uuid = '73d76'

export const refs = {
  'fr-fr': ['can6N1-05', '6N1A-flash5'],
  'fr-ch': [],
}
export default class NombreDeDizaines extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    const a = this.quotaRandint('a', 0, 4)
    const b = randint(1, 9, a)
    const c = randint(1, 9, [a, b])
    const d = randint(1, 9, [a, b, c])
    const m = this.quotaChoice('m', ['centaines', 'dizaines'])
    const n = a * 1000 + b * 100 + c * 10 + d
    this.question = `Quel est le nombre entier de ${m} dans $${texNombre(n)}$ ? `
    if (a !== 0) {
      if (m === 'centaines') {
        this.correction = `Comme $${texNombre(a * 1000 + b * 100 + c * 10 + d)}=${a * 10 + b}\\times 100+${c * 10 + d}$, il y a $${miseEnEvidence(a * 10 + b)}$ ${m} dans $${texNombre(a * 1000 + b * 100 + c * 10 + d)}$.`
        this.reponse = a * 10 + b
      }
      if (m === 'dizaines') {
        this.correction = `Comme $${texNombre(a * 1000 + b * 100 + c * 10 + d)}=${a * 100 + b * 10 + c}\\times 10+${d}$, il y a $${miseEnEvidence(a * 100 + b * 10 + c)}$ ${m} dans $${texNombre(a * 1000 + b * 100 + c * 10 + d)}$.`
        this.reponse = a * 100 + b * 10 + c
      }
    } else {
      if (m === 'centaines') {
        this.correction = `Comme  $${b * 100 + c * 10 + d}=${b}\\times 100+${c * 10 + d}$, il y a $${miseEnEvidence(b)}$ ${m} dans $${a * 1000 + b * 100 + c * 10 + d}$.`
        this.reponse = b
      }
      if (m === 'dizaines') {
        this.correction = `Comme $${b * 100 + c * 10 + d}=${b * 10 + c}\\times 10+${d}$, il y a $${miseEnEvidence(b * 10 + c)}$ ${m} dans $${a * 1000 + b * 100 + c * 10 + d}$.`
        this.reponse = b * 10 + c
      }
    }
  }
}
