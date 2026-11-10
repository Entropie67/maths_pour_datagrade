import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import Exercice from '../Exercice'

import { ecritureAlgebriqueSauf1, rienSi1 } from '../../lib/outils/ecritures'
import { listeQuestionsToContenu, randint } from '../../modules/outils'

export const titre = 'Exprimer en fonction de log(x)'
export const dateDePublication = '22/7/2024'
export const uuid = '2c0b2'
export const interactifReady = true

export const refs = {
  'fr-fr': ['TTE-8'],
  'fr-ch': ['2mLogExp-3'],
}

const listeExposants = [1, 2, 3, -1, -2, -3]
/**
 * Réduire une expression en fonction de ln/log de x
 * @author  Jean-claude Lhote

 */
export default class ExpressionsLogX extends Exercice {
  version: string
  constructor() {
    super()
    this.version = 'ln'
    this.nbQuestions = 2
    this.spacingCorr = 3
    this.sup = '1'
    this.besoinFormulaire2CaseACocher = ['Type de logarithme', true]
  }

  nouvelleVersion() {
    if (this.sup2) this.version = 'ln'
    else this.version = 'log'
    const logString = this.version !== 'ln' ? '\\log' : '\\ln'
    const pluriel = this.nbQuestions > 1 ? 's' : ''
    this.consigne = `Soit $x > 0$, exprimer le${pluriel} nombre${pluriel} suivant${pluriel} en fonction de $${logString} x$.`

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const [expA, expB, expC] = combinaisonListes(listeExposants, 3)
      const [a, b, c] = [
        randint(-5, 5, 0),
        randint(-5, 5, 0),
        randint(-5, 5, 0),
      ]
      let texte = `${rienSi1(a)}${logString}(${
        expA < 0
          ? `\\dfrac{1}{x${expA < -1 ? `^${-expA}` : ''}}`
          : `x${expA > 1 ? `^${expA}` : ''}`
      })`
      texte += `${ecritureAlgebriqueSauf1(b)}${logString}(${
        expB < 0
          ? `\\dfrac{1}{x${expB < -1 ? `^${-expB}` : ''}}`
          : `x${expB > 1 ? `^${expB}` : ''}`
      })`
      texte += `${ecritureAlgebriqueSauf1(c)}${logString}(${
        expC < 0
          ? `\\dfrac{1}{x${expC < -1 ? `^${-expC}` : ''}}`
          : `x${expC > 1 ? `^${expC}` : ''}`
      })`
      const corrA =
        expA === 1
          ? [`${rienSi1(a)}${logString}(x)`, `${rienSi1(a)}${logString}(x)`]
          : [
              `${rienSi1(a)}${logString}(x^{${expA}})`,
              `${rienSi1(a * expA)}${logString}(x)`,
            ]
      const corrB =
        expB === 1
          ? [
              `${ecritureAlgebriqueSauf1(b)}${logString}(x)`,
              `${ecritureAlgebriqueSauf1(b)}${logString}(x)`,
            ]
          : [
              `${ecritureAlgebriqueSauf1(b)}${logString}(x^{${expB}})`,
              `${ecritureAlgebriqueSauf1(b * expB)}${logString}(x)`,
            ]
      const corrC =
        expC === 1
          ? [
              `${ecritureAlgebriqueSauf1(c)}${logString}(x)`,
              `${ecritureAlgebriqueSauf1(c)}${logString}(x)`,
            ]
          : [
              `${ecritureAlgebriqueSauf1(c)}${logString}(x^{${expC}})`,
              `${ecritureAlgebriqueSauf1(c * expC)}${logString}(x)`,
            ]

      const coefficient = a * expA + b * expB + c * expC
      const coefficientTex = rienSi1(coefficient)
      const coefficientMisEnEvidence =
        Math.abs(coefficient) === 1
          ? coefficientTex
          : miseEnEvidence(coefficientTex)
      const resultatFinal = `=${coefficientMisEnEvidence}${logString}(x)`
      let texteCorr = `$${texte}=${corrA[0]}${corrB[0]}${corrC[0]}=${corrA[1]}${corrB[1]}${corrC[1]}`
      texteCorr += `${resultatFinal}$`
      const answer = `${coefficient}`

      if (this.questionJamaisPosee(i, a, b, c, expA, expB, expC)) {
        texte = `$${texte}$` // <- laisser le i et ajouter toutes les variables qui rendent les exercices différents (par exemple a, b, c et d)
        if (this.interactif) {
          texte += ajouteChampTexteMathLive(
            this,
            i,
            KeyboardType.clavierDeBase,
            {
              texteAvant: '$=$',
              texteApres: `$${logString}(x)$`,
              placeholder: '$\\ldots$',
            },
          )
          handleAnswers(this, i, { reponse: { value: answer } })
        } else {
          texte += ` $= \\ldots ${logString}(x)$`
        }
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
