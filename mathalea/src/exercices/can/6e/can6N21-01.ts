import { miseEnEvidence } from '../../../lib/outils/embellissements'
import Decimal from 'decimal.js'
import { choice } from '../../../lib/outils/arrayOutils'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'

export const titre =
  'Passer d’un calcul de fractions décimales à une écriture décimale'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
export const dateDePublication = '15/12/2021' // La date de publication initiale au format 'jj/mm/aaaa' pour affichage temporaire d'un tag
export const dateDeModifImportante = '16/01/2025'
/**
 * @author Gilles Mora
 */
export const uuid = '93bb5'

export const refs = {
  'fr-fr': ['can6N21-01', '6N2autoB-6', '6AutoN2-5'],
  'fr-ch': [],
}
export default class FractionDecimaleEcritureDecimale1 extends ExerciceSimple {
  constructor() {
    super()
    this.nbQuestions = 1

    this.typeExercice = 'simple'
  }

  nouvelleVersion() {
    let a, b, c, u
    switch (
      this.quotaChoice('cas', ['a', 'b', 'c', 'd', 'e']) //,
    ) {
      case 'a':
        a = randint(1, 9)
        b = randint(1, 9)
        c = randint(1, 9)

        this.reponse = new Decimal(a)
          .div(10)
          .add(new Decimal(b).div(100))
          .add(new Decimal(c).div(1000))

        if (choice([true, false])) {
          this.question = `Calculer $\\dfrac{${b}}{100}+\\dfrac{${a}}{10}+\\dfrac{${c}}{${texNombre(1000)}}$ sous forme décimale. `
          this.correction = `$\\dfrac{${b}}{100}+\\dfrac{${a}}{10}+\\dfrac{${c}}{${texNombre(1000)}}=${texNombre(b / 100)}+${texNombre(a / 10)}+${texNombre(c / 1000)}=${miseEnEvidence(texNombre(a / 10 + b / 100 + c / 1000))}$`
        } else {
          this.question = `Calculer $\\dfrac{${c}}{${texNombre(1000)}}+\\dfrac{${a}}{10}+\\dfrac{${b}}{100}$ sous forme décimale. `
          this.correction = `$\\dfrac{${c}}{${texNombre(1000)}}+\\dfrac{${a}}{10}+\\dfrac{${b}}{100}=${texNombre(c / 1000)}+${texNombre(a / 10)}+${texNombre(b / 100)}=${miseEnEvidence(texNombre(a / 10 + b / 100 + c / 1000))}$`
        }
        break
      case 'b':
        u = randint(1, 99)
        a = randint(1, 9, [20, 30, 40, 50])
        c = randint(1, 9)

        this.reponse = new Decimal(a)
          .div(10)
          .add(u)
          .add(new Decimal(c).div(1000))

        if (choice([true, false])) {
          this.question = `Calculer  $${u}+\\dfrac{${a}}{10}+\\dfrac{${c}}{${texNombre(1000)}}$ sous forme décimale. `
          this.correction = `$${u}+\\dfrac{${a}}{10}+\\dfrac{${c}}{${texNombre(1000)}}=${u}+${texNombre(a / 10)}+${texNombre(c / 1000)}=${miseEnEvidence(texNombre(u + a / 10 + c / 1000))}$`
        } else {
          this.question = `Calculer  $${u}+\\dfrac{${c}}{${texNombre(1000)}}+\\dfrac{${a}}{10}$ sous forme décimale. `
          this.correction = `$${u}+\\dfrac{${c}}{${texNombre(1000)}}+\\dfrac{${a}}{10}=${u}+${texNombre(c / 1000)}+${texNombre(a / 10)}=${miseEnEvidence(texNombre(u + a / 10 + c / 1000))}$
         `
        }
        break
      case 'c':
        u = randint(1, 99)
        b = randint(1, 9)
        c = randint(1, 9)

        this.reponse = new Decimal(b)
          .div(100)
          .add(u)
          .add(new Decimal(c).div(1000))

        if (choice([true, false])) {
          this.question = `Calculer  $${u}+\\dfrac{${b}}{100}+\\dfrac{${c}}{${texNombre(1000)}}$ sous forme décimale. `
          this.correction = `$${u}+\\dfrac{${b}}{100}+\\dfrac{${c}}{${texNombre(1000)}}=${u}+${texNombre(b / 100)}+${texNombre(c / 1000)}=${miseEnEvidence(texNombre(u + b / 100 + c / 1000))}$`
        } else {
          this.question = `Calculer  $${u}+\\dfrac{${c}}{${texNombre(1000)}}+\\dfrac{${b}}{100}$ sous forme décimale. `
          this.correction = `$${u}+\\dfrac{${c}}{${texNombre(1000)}}+\\dfrac{${b}}{100}=${u}+${texNombre(c / 1000)}+${texNombre(b / 100)}=${miseEnEvidence(texNombre(u + b / 100 + c / 1000))}$`
        }
        break
      case 'd':
        a = randint(1, 9)
        c = randint(1, 9)
        this.reponse = a * 0.1 + c * 0.001

        this.reponse = new Decimal(a).div(10).add(new Decimal(c).div(1000))

        if (choice([true, false])) {
          this.question = `Calculer  $\\dfrac{${a}}{10}+\\dfrac{${c}}{${texNombre(1000)}}$ sous forme décimale. `
          this.correction = `$\\dfrac{${a}}{10}+\\dfrac{${c}}{${texNombre(1000)}}=${texNombre(a / 10)}+${texNombre(c / 1000)}=${miseEnEvidence(texNombre(a / 10 + c / 1000))}$`
        } else {
          this.question = `Calculer $\\dfrac{${c}}{${texNombre(1000)}}+\\dfrac{${a}}{10}$ sous forme décimale. `
          this.correction = `$\\dfrac{${c}}{${texNombre(1000)}}+\\dfrac{${a}}{10}=${texNombre(c / 1000)}+${texNombre(a / 10)}=${miseEnEvidence(texNombre(a / 10 + c / 1000))}$`
        }
        break
      case 'e':
        u = randint(1, 99)
        b = randint(11, 99)
        c = randint(1, 9)
        this.reponse = u + b * 0.01 + c * 0.001

        this.reponse = new Decimal(b)
          .div(100)
          .add(u)
          .add(new Decimal(c).div(1000))

        if (choice([true, false])) {
          this.question = `Calculer  $${u}+\\dfrac{${b}}{100}+\\dfrac{${c}}{${texNombre(1000)}}$ sous forme décimale. `
          this.correction = `$${u}+\\dfrac{${b}}{100}+\\dfrac{${c}}{${texNombre(1000)}}=${u}+${texNombre(b / 100)}+${texNombre(c / 1000)}=${miseEnEvidence(texNombre(u + b / 100 + c / 1000))}$`
        } else {
          this.question = `Calculer  $${u}+\\dfrac{${c}}{${texNombre(1000)}}+\\dfrac{${b}}{100}$ sous forme décimale. `
          this.correction = `$${u}+\\dfrac{${c}}{${texNombre(1000)}}+\\dfrac{${b}}{100}=${u}+${texNombre(c / 1000)}+${texNombre(b / 100)}=${miseEnEvidence(texNombre(u + b / 100 + c / 1000))}$`
        }
        break
    }
  }
}
