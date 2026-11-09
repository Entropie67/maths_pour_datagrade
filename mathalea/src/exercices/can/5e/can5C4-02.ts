import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { arrondi } from '../../../lib/outils/nombres'
import { texNombre } from '../../../lib/outils/texNombre'
import { fraction } from '../../../modules/fractions'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = "Écrire la valeur décimale d'une somme de fractions"
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
export const dateDeModifImportante = '30/10/2026'
/**
 * @author Gilles Mora
 */
export const uuid = 'b1881'

export const refs = {
  'fr-fr': ['can5C4-02', '6N2autoB-10', '5N3autoB-1'],
  'fr-ch': ['NR'],
}
export default class EntierPlusFractionVersDecimal extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    let a, b, c, maFraction, maFraction2
    let resultat

    switch (this.quotaChoice('typeDeQuestions', [1, 2, 3, 4])) {
      case 1: // fraction addition avec un entier
        c = choice([2, 4, 5])
        b = randint(1, c - 1)
        maFraction = fraction(b, c)
        a = randint(1, 4)
        resultat = a + b / c
        this.question = `Quelle est la valeur décimale de  $${a}+${maFraction.texFraction}$ ?`
        this.correction = `$${a}+${maFraction.texFraction} = ${a} + ${texNombre(maFraction.valeurDecimale)}= ${miseEnEvidence(texNombre(resultat))}$`
        this.reponse = arrondi(resultat, 3)
        break

      case 2: // addition entier et fraction avec den =100 ou 1000
        b = choice([100, 1000])
        a = randint(1, 15)
        c = randint(11, 19)
        maFraction = fraction(c, b)
        resultat = a + c / b

        this.question = `Quelle est la valeur décimale de $${a}+${maFraction.texFraction}$ ?
        `
        this.correction = `$${a}+${maFraction.texFraction} = ${miseEnEvidence(texNombre(resultat))}$`
        this.reponse = arrondi(resultat, 3)
        break
      case 3: // addition entier et fraction avec den =100 et 1000
        a = randint(1, 15)
        b = randint(11, 19)
        c = randint(1, 9)
        maFraction = fraction(b, 100)
        maFraction2 = fraction(c, 1000)
        resultat = a + b / 100 + c / 1000
        this.question = `Quelle est la valeur décimale de $${a}+${maFraction.texFraction}+${maFraction2.texFraction}$ ?
       `
        this.correction = `$${a}+${maFraction.texFraction}+${maFraction2.texFraction}=${a}+${texNombre(b / 100)}+${texNombre(c / 1000)}=${miseEnEvidence(texNombre(resultat))}$`
        this.reponse = arrondi(resultat, 3)
        break
      case 4: // addition entier et fraction avec den =1000 et 100
        a = randint(1, 15)
        b = randint(1, 9)
        c = randint(1, 9)
        maFraction = fraction(b, 1000)
        maFraction2 = fraction(c, 100)
        resultat = a + b / 1000 + c / 100
        this.question = `Quelle est la valeur décimale de $${a}+${maFraction.texFraction}+${maFraction2.texFraction}$ ?
        `
        this.correction = `$${a}+${maFraction.texFraction}+${maFraction2.texFraction}=${a}+${texNombre(b / 1000)}+${texNombre(c / 100)}=${miseEnEvidence(texNombre(resultat))}$`
        this.reponse = arrondi(resultat, 3)
        break
    }
  }
}
