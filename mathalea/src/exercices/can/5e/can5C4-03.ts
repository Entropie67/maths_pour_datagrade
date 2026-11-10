import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { arrondi } from '../../../lib/outils/nombres'
import { texNombre } from '../../../lib/outils/texNombre'
import { fraction } from '../../../modules/fractions'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = "Écrire la valeur décimale d'une fraction"
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
export const dateDePublication = '30/03/2023'
/**
 * @author Gilles Mora
 */
export const uuid = '4d164'

export const refs = {
  'fr-fr': ['can5C4-03', '5N3autoB-2'],
  'fr-ch': ['NR'],
}
export default class FractionVersDecimal extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    let a, b, c, maFraction
    let resultat

    switch (this.quotaChoice('typeDeQuestions', [1, 2, 3])) {
      case 1: // conversion fraction <->décimale cinquième
        a = randint(1, 12, [5, 10])

        maFraction = fraction(a, 5)
        resultat = arrondi(a / 5, 1)
        this.question = `Quelle est la valeur décimale de  $${maFraction.texFraction}$ ?`
        this.correction = `$${maFraction.texFraction}=${miseEnEvidence(texNombre(resultat))}$`
        this.reponse = resultat
        break

      case 2: // conversion fraction <->décimale  quart
        b = choice([1, 3, 5, 7, 9, 11])
        maFraction = fraction(b, 4)
        resultat = arrondi(b / 4, 2)
        this.question = `Quelle est la valeur décimale de  $${maFraction.texFraction}$ ?`
        this.correction = `$${maFraction.texFraction}=${miseEnEvidence(texNombre(resultat))}$`
        this.reponse = resultat

        break

      case 3: // conversion fraction <->décimale  demi
        c = choice([3, 5, 7, 9, 11, 13, 15])
        maFraction = fraction(c, 2)
        resultat = arrondi(c / 2, 1)
        this.question = `Quelle est la valeur décimale de  $${maFraction.texFraction}$ ?`
        this.correction = `$${maFraction.texFraction}=${miseEnEvidence(texNombre(resultat))}$`
        this.reponse = resultat

        break
    }
  }
}
