import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { remplisLesBlancs } from '../../lib/interactif/questionMathLive'
import {
  choice,
  combinaisonListes,
  sortRandomlyLikeV8,
} from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { pgcd, ppcmListe } from '../../lib/outils/primalite'
import FractionEtendue from '../../modules/FractionEtendue'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'
export const titre =
  'Comparer trois fractions (dénominateurs non multiples) et un nombre entier'
export const interactifReady = true

export const dateDePublication = '25/10/2025'

export const uuid = '80ed9'
export const refs = {
  'fr-fr': ['4C20-2'],
  'fr-ch': ['9R2NO4H-11', '9R3NO4H-11', 'PRQNO05B-11'],
}

/**
 * @author Rémi Angot
 */
export default class Comparer3FractionsDenominateursNonMultiples extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    const orders = combinaisonListes(
      ['croissant', 'décroissant'],
      this.nbQuestions,
    )
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      // On choisit les dénominateurs pour qu'il y ait un entier
      // deux dénominateurs multiples et un 3e dénominateur premier  avec les 2 autres
      const denominateursPossibles = [1]
      switch (randint(1, 7)) {
        case 1:
          denominateursPossibles.push(2, 4, choice([3, 5, 7, 9]))
          break
        case 2:
          denominateursPossibles.push(2, 6, choice([5, 7, 9]))
          break
        case 3:
          denominateursPossibles.push(2, 8, choice([3, 5, 7, 9]))
          break
        case 4:
          denominateursPossibles.push(3, 6, choice([4, 5, 7, 9]))
          break
        case 5:
          denominateursPossibles.push(3, 9, choice([2, 4, 5, 7, 9]))
          break
        case 6:
          denominateursPossibles.push(4, 8, choice([3, 5, 7, 9]))
          break
        case 7:
          denominateursPossibles.push(5, 10, choice([3, 7, 9]))
          break
      }
      const denominateurs = sortRandomlyLikeV8(denominateursPossibles)
      const denominateurCommun = ppcmListe(denominateursPossibles)
      const numerateurs = []
      const order = orders[i]
      const signeComparaison = order === 'croissant' ? '<' : '>'

      for (
        let indiceFraction = 0;
        indiceFraction < denominateurs.length;
        indiceFraction++
      ) {
        let numerateur = randint(1, 2 * denominateurs[indiceFraction])
        let cpt = 0
        if (denominateurs[indiceFraction] !== 1) {
          // Fraction irréductible
          while (pgcd(numerateur, denominateurs[indiceFraction]) !== 1) {
            numerateur = randint(1, 2 * denominateurs[indiceFraction])
            cpt++
            if (cpt > 30) throw new Error("Problème de génération de l'énoncé")
          }
        }
        numerateurs.push(numerateur)
      }

      const fractions = [
        new FractionEtendue(numerateurs[0], denominateurs[0]),
        new FractionEtendue(numerateurs[1], denominateurs[1]),
        new FractionEtendue(numerateurs[2], denominateurs[2]),
        new FractionEtendue(numerateurs[3], denominateurs[3]),
      ]
      const orderedFractions = fractions.toSorted((a, b) =>
        order === 'croissant'
          ? a.valeurDecimale - b.valeurDecimale
          : b.valeurDecimale - a.valeurDecimale,
      )

      let question = `Ranger les nombres suivants dans l'ordre ${order} : `
      question += '$'
      question += fractions
        .map((fraction) => `${fraction.texFraction}`)
        .join('\\text{, } ~ ')
      question += '$.'
      let correction = `Un dénominateur commun possible est $${denominateurCommun}$.<br><br>`

      // Mise au dénominateur commun
      for (
        let indiceFraction = 0;
        indiceFraction < orderedFractions.length;
        indiceFraction++
      ) {
        const den = orderedFractions[indiceFraction].den
        const num = orderedFractions[indiceFraction].num
        const k = denominateurCommun / den
        if (num !== den) {
          correction += `$${orderedFractions[indiceFraction].texFraction} = \\dfrac{${num} \\times ${k}}{${den} \\times ${k}} = ${orderedFractions[indiceFraction].reduire(k).texFraction}$<br><br>`
        } else {
          // 1 se met directement au dénominateur commun
          correction += `$${orderedFractions[indiceFraction].texFraction} = ${orderedFractions[indiceFraction].reduire(k).texFraction}$<br><br>`
        }
      }

      correction += `Finalement, on a : $${miseEnEvidence(orderedFractions.map((fraction) => `${fraction.texFraction}`).join(`~${signeComparaison} ~`))}$.`

      if (this.interactif) {
        question += '<br>'
        question += remplisLesBlancs(
          this,
          i,
          `%{champ1}~${signeComparaison}~%{champ2}~${signeComparaison}~%{champ3}~${signeComparaison}~%{champ4}`,
          ` ${KeyboardType.clavierDeBaseAvecFraction}`,
        )
        handleAnswers(this, i, {
          bareme: (listePoints) => [
            listePoints[0] + listePoints[1] + listePoints[2] + listePoints[3],
            4,
          ],
          champ1: {
            value: orderedFractions[0],
            options: { fractionIdentique: true },
          },
          champ2: {
            value: orderedFractions[1],
            options: { fractionIdentique: true },
          },
          champ3: {
            value: orderedFractions[2],
            options: { fractionIdentique: true },
          },
          champ4: {
            value: orderedFractions[3],
            options: { fractionIdentique: true },
          },
        })
      }
      if (this.questionJamaisPosee(i, ...denominateurs)) {
        this.listeQuestions.push(question ?? '')
        this.listeCorrections.push(correction ?? '')
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
