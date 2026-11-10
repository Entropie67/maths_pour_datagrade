import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { generateCleaner } from '../../lib/interactif/cleaners'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import type { ResultType } from '../../lib/types'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  'Donner la probabilité d’un événement ni certain, ni impossible'
export const dateDePublication = '23/10/2026'
export const interactifReady = true

export const uuid = 'e5a77'
export const refs = {
  'fr-fr': ['1A-P01-3'],
  'fr-ch': ['11LCNO4B-7', '11LSNO4B-7'],
}

const nettoieFraction = generateCleaner(['espaces', 'fractionsMemesNegatives'])

/**
 * Fraction de dénominateur imposé strictement comprise entre 0 et 1 (événement ni
 * certain ni impossible). Plusieurs réponses sont justes : on vérifie la forme et la valeur.
 */
function compareFractionStricte(denominateur: number) {
  return (saisie: string): ResultType => {
    // MathLive écrit \frac45 pour 4/5 : le nettoyeur le ramène à \frac{4}{5}
    const ecriture = nettoieFraction(saisie)
    const fraction =
      ecriture.match(/^\\frac\{(\d+)\}\{(\d+)\}$/) ??
      ecriture.match(/^(\d+)\/(\d+)$/)
    if (fraction == null) {
      return { isOk: false, feedback: 'Une fraction est attendue.' }
    }
    const [numerateur, denominateurSaisi] = [
      Number(fraction[1]),
      Number(fraction[2]),
    ]
    if (denominateurSaisi !== denominateur) {
      return {
        isOk: false,
        feedback: `Le dénominateur doit être $${denominateur}$.`,
      }
    }
    if (numerateur <= 0 || numerateur >= denominateur) {
      return {
        isOk: false,
        feedback:
          'Cette fraction n’est pas strictement comprise entre $0$ et $1$.',
      }
    }
    return { isOk: true }
  }
}

/**
 * Savoir qu'une probabilité est un nombre compris entre 0 et 1 :
 * donner une fraction de dénominateur imposé qui peut être une probabilité.
 * @author Arnaud Meistermann
 */
export default class DonnerUneProbabilite extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
  }

  nouvelleVersion(): void {
    this.consigne = ''

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      const denominateur = randint(3, 9)
      let texte = `Donner une fraction de dénominateur $${denominateur}$ qui peut être la probabilité d’un événement ni certain, ni impossible.`
      if (this.interactif) {
        texte += `<br>${ajouteChampTexteMathLive(this, i, KeyboardType.clavierDeBaseAvecFraction)}`
      }
      handleAnswers(this, i, {
        reponse: {
          value: `\\dfrac{1}{${denominateur}}`,
          compare: compareFractionStricte(denominateur),
        },
      })
      const correction = `Une probabilité est comprise entre $0$ et $1$. Elle vaut $0$ pour un événement impossible et $1$ pour un événement certain.<br>
      Il faut donc $0<\\dfrac{a}{${denominateur}}<1$, c’est-à-dire que $a$ est un entier compris entre $1$ et $${denominateur - 1}$.<br>
      Par exemple, $${miseEnEvidence(`\\dfrac{1}{${denominateur}}`)}$ convient, tout comme $\\dfrac{${denominateur - 1}}{${denominateur}}$.`

      if (this.questionJamaisPosee(i, denominateur)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = correction
        i++
      }
    }
    listeQuestionsToContenu(this)
  }
}
