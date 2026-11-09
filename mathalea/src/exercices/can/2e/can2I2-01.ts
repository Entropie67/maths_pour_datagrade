import { distracteursDistincts } from '../../../lib/interactif/qcmDistractors'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { arrondi } from '../../../lib/outils/nombres'
import { texNombre } from '../../../lib/outils/texNombre'
import { context } from '../../../modules/context'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Passer du taux d’évolution au coefficient multiplicateur'
export const interactifReady = true

// Les exports suivants sont optionnels mais au moins la date de publication semble essentielle
export const dateDePublication = '09/12/2021' // La date de publication initiale au format 'jj/mm/aaaa' pour affichage temporaire d'un tag

/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export const dateDeModifImportante = '30/10/2026'
export const uuid = '4b11f'

export const refs = {
  'fr-fr': ['can2I2-01', 'BP1CF09', '2I20-flash1'],
  'fr-ch': ['NR'],
}
export default class TauxCoeff extends ExerciceSimple {
  constructor() {
    super()
    this.optionsChampTexte = { texteApres: '.' }
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
    this.versionQcmDisponible = true
  }

  nouvelleVersion() {
    let taux!: number

    const corrA = (taux: number, coefficient: number) => {
      return `Augmenter de $${taux}\\,\\%$ revient à multiplier par $1+\\dfrac{${taux}}{100}$.<br>
        Ainsi, le coefficient multiplicateur associé à une augmentation de $${taux}\\,\\%$ est $1+${texNombre(taux / 100)}$, soit $${miseEnEvidence(texNombre(coefficient))}$.<br><br>
        Autre formulation : <br>Augmenter de $${taux}\\,\\%$ une valeur revient à en prendre $${texNombre(100 + taux)}\\,\\%$ car $100\\,\\% + ${taux}\\,\\%=${texNombre(100 + taux)}\\,\\%$.<br>
        Ainsi, le coefficient multiplicateur associé à une augmentation de $${texNombre(taux)}\\,\\%$ est $\\dfrac{${texNombre(100 + taux)}}{100}$ soit $${miseEnEvidence(texNombre(coefficient))}$.`
    }

    const corrD = (taux: number, coefficient: number) => {
      return `Diminuer de $${taux}\\,\\%$ revient à multiplier par $1-\\dfrac{${taux}}{100}$.<br>
        Ainsi, le coefficient multiplicateur associé à une réduction de $${taux}\\,\\%$ est $1-${texNombre(taux / 100)}$, soit $${miseEnEvidence(texNombre(coefficient))}$.<br><br>
        Autre formulation : <br>Diminuer de $${taux}\\,\\%$ une valeur revient à en prendre $${texNombre(100 - taux)}\\,\\%$ car $100\\,\\% - ${texNombre(taux)}\\,\\%=${texNombre(100 - taux)}\\,\\%$.<br>
        Ainsi, le coefficient multiplicateur associé à une réduction de $${taux}\\,\\%$ est $\\dfrac{${texNombre(100 - taux)}}{100}$ soit $${miseEnEvidence(texNombre(coefficient))}$.`
    }

    switch (this.quotaChoice('type', ['a', 'a', 'b', 'b', 'c'])) {
      case 'a':
        taux = choice([
          randint(1, 9) * 10,
          randint(1, 9),
          randint(1, 9) * 10 + randint(1, 9),
        ])
        this.question = `Augmenter une valeur ${context.isDiaporama ? '<br>' : ''} de $${taux}\\,\\%$ revient à la multiplier par : `
        this.correction = corrA(taux, 1 + taux / 100)
        this.reponse = this.versionQcm
          ? `$${texNombre(1 + taux / 100, 4)}$`
          : arrondi(1 + taux / 100)
        this.distracteurs = [
          `$${texNombre(1 - taux / 100, 4)}$`,
          `$${texNombre(taux / 100, 4)}$`,
          `$${texNombre(1 + taux / 1000, 4)}$`,
        ]
        this.canEnonce = 'Compléter.'
        this.canReponseACompleter = `Augmenter une valeur de $${taux}\\,\\%$ revient à la multiplier par $\\ldots$`
        break

      case 'b':
        taux = choice([
          randint(1, 9) * 10,
          randint(1, 9),
          randint(1, 9) * 10 + randint(1, 9),
        ])
        this.question = `Diminuer une valeur ${context.isDiaporama ? '<br>' : ''} de $${taux}\\,\\%$ revient à la multiplier par :`
        this.correction = corrD(taux, 1 - taux / 100)
        this.reponse = this.versionQcm
          ? `$${texNombre(1 - taux / 100, 4)}$`
          : arrondi(1 - taux / 100)
        this.distracteurs = [
          `$${texNombre(1 + taux / 1000, 4)}$`,
          `$${texNombre(taux / 100, 4)}$`,
          `$${texNombre(1 - taux / 1000, 4)}$`,
        ]
        this.canEnonce = 'Compléter.'
        this.canReponseACompleter = `Diminuer une valeur de $${taux}\\,\\%$ revient à la multiplier par $\\ldots$`
        break

      case 'c':
        taux = randint(10, 40) * 10
        this.question = `Augmenter une valeur ${context.isDiaporama ? '<br>' : ''} de $${taux}\\,\\%$ revient à la multiplier par : `
        this.correction = corrA(taux, 1 + taux / 100)
        this.reponse = this.versionQcm
          ? `$${texNombre(1 + taux / 100, 4)}$`
          : arrondi(1 + taux / 100)
        this.distracteurs = [
          `$${texNombre(taux / 100, 4)}$`,
          `$${texNombre(taux / 1000, 4)}$`,
          `$${texNombre(10 - taux / 100, 4)}$`,
        ]
        this.canEnonce = 'Compléter.'
        this.canReponseACompleter = `Augmenter une valeur de $${taux}\\,\\%$ revient à la multiplier par $\\ldots$`
        break
    }

    if (!this.interactif && !this.versionQcm) {
      // Pas de consigne en diaporama : la phrase à compléter suffit
      this.question = context.isDiaporama
        ? `${this.question} $\\ldots$ `
        : `Compléter :<br>${this.question} $\\ldots$ `
    }
    if (this.versionQcm) {
      // Secours : Oublier la conversion en centièmes.
      this.distracteurs = distracteursDistincts(
        String(this.reponse),
        this.distracteurs,
        [1 + taux / 10, 1 - taux / 10, taux, 1 + taux].map(
          (n) => `$${texNombre(n, 4)}$`,
        ),
        Math.max(3, this.distracteurs.length),
      )
    }
  }
}
