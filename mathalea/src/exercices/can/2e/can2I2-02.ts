import { distracteursDistincts } from '../../../lib/interactif/qcmDistractors'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { sp } from '../../../lib/outils/outilString'
import { texNombre } from '../../../lib/outils/texNombre'
import { context } from '../../../modules/context'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Passer du coefficient multiplicateur au taux d’évolution'
export const interactifReady = true

// Les exports suivants sont optionnels mais au moins la date de publication semble essentielle
export const dateDePublication = '09/12/2021' // La date de publication initiale au format 'jj/mm/aaaa' pour affichage temporaire d'un tag

/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export const dateDeModifImportante = '30/10/2026'
export const uuid = '031f0'

export const refs = {
  'fr-fr': ['can2I2-02', 'BP1CF10', '2I20-flash2'],
  'fr-ch': ['NR'],
}
export default class CoeffTaux extends ExerciceSimple {
  constructor() {
    super()
    this.versionQcmDisponible = true
    this.typeExercice = 'simple'
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    let taux!: number
    let coeff!: number

    switch (
      this.quotaChoice('type', ['a', 'b', 'b']) //, 'b', 'b'
    ) {
      case 'a':
        taux = choice([
          randint(1, 9) * 10,
          randint(1, 9),
          randint(1, 9) * 10 + randint(1, 9),
        ])
        coeff = 1 + taux / 100
        this.question = `Le taux d'évolution associé à un ${context.isDiaporama ? '<br>' : ''} coefficient multiplicateur de $${texNombre(coeff)}$ est : `

        this.optionsChampTexte = { texteApres: ' %' }
        this.correction = `Multiplier par $${texNombre(coeff)}$ revient à multiplier par $1+\\dfrac{${texNombre(taux)}}{100}$. <br>
        Cela revient donc à augmenter de $${taux}${sp(1)}\\%$. <br>
        Ainsi, le taux d'évolution associé au coefficient multiplicateur $${texNombre(coeff)}$ est $${miseEnEvidence(`+${taux}${sp()}\\%`)}$.<br><br>
        Autre formulation :<br>
        Multiplier une valeur par $${texNombre(coeff)}$ revient à en prendre $${texNombre(coeff * 100)}${sp(1)}\\%$.<br>
        Cela signifie qu'on l'augmente de $${texNombre(coeff * 100 - 100)}${sp(1)}\\%$ car $100${sp(1)}\\% +${texNombre(coeff * 100 - 100)}${sp(1)}\\%=${texNombre(coeff * 100)}${sp(1)}\\%$.<br>
        Le taux d'évolution est donc $${miseEnEvidence(`+${taux}${sp()}\\%`)}$.`
        this.reponse = this.versionQcm ? `$+${texNombre(taux, 0)}\\,\\%$` : taux
        this.distracteurs = [
          `$+${texNombre(1 + taux / 100, 3)}\\,\\%$`,
          `$+${texNombre(taux / 100, 4)}\\,\\%$`,
          `$+${texNombre(1 + taux / 1000, 4)}\\,\\%$`,
        ]
        this.canEnonce = 'Compléter.'
        this.canReponseACompleter = `Le taux d'évolution associé à un coefficient multiplicateur de $${texNombre(coeff, 2)}$ est $\\ldots$ $\\%$ `
        break
      case 'b':
        taux = choice([
          randint(1, 9) * 10,
          randint(1, 9),
          randint(1, 9) * 10 + randint(1, 9),
        ])
        coeff = 1 - taux / 100
        this.question = `Le taux d'évolution associé à un ${context.isDiaporama ? '<br>' : ''} coefficient multiplicateur de $${texNombre(coeff)}$ est `

        this.optionsChampTexte = { texteApres: ' %.' }
        this.correction = `Multiplier par $${texNombre(coeff)}$ revient à multiplier par $1-\\dfrac{${texNombre(taux)}}{100}$. <br>
        Cela revient donc à diminuer de $${taux}${sp(1)}\\%$. <br>
        Ainsi, le taux d'évolution associé au coefficient multiplicateur $${texNombre(coeff)}$ est $${miseEnEvidence(`-${taux}${sp()}\\%`)}$.<br><br>
        Autre formulation :<br>
        Multiplier une valeur par $${texNombre(coeff)}$ revient à en prendre $${texNombre(coeff * 100)}${sp(1)}\\%$.<br>
        Cela signifie qu'on la diminue de $${texNombre(100 - coeff * 100)}${sp(1)}\\%$ car $100${sp(1)}\\%-${texNombre(100 - coeff * 100)}${sp(1)}\\% =${texNombre(coeff * 100)}${sp(1)}\\%$.<br>
        Le taux d'évolution est donc $${miseEnEvidence(`-${taux}${sp()}\\%`)}$.`
        this.reponse = this.versionQcm
          ? `$${texNombre(-taux, 0)}\\,\\%$`
          : -taux
        this.distracteurs = [
          `$${texNombre(-taux / 10, 3)}\\,\\%$`,
          `$-${texNombre(100 - taux, 4)}\\,\\%$`,
          `$-${texNombre(1 - taux / 100, 4)}\\,\\%$`,
        ]
        this.canEnonce = 'Compléter.'
        this.canReponseACompleter = `Le taux d'évolution associé à un coefficient multiplicateur de $${texNombre(coeff, 2)}$ est $\\ldots$ $\\%$ `
        break
    }
    if (!this.interactif && !this.versionQcm) {
      // Pas de consigne en diaporama : la phrase à compléter suffit
      this.question = context.isDiaporama
        ? `${this.question} $\\ldots$ `
        : `Compléter :<br>${this.question} $\\ldots$ `
    }
    if (this.versionQcm) {
      // Secours : Confondre signe, coefficient multiplicateur et pourcentage.
      this.distracteurs = distracteursDistincts(
        String(this.reponse),
        this.distracteurs,
        [taux, -taux, coeff * 100, (coeff - 1) * 1000].map(
          (n) => `$${texNombre(n, 4)}\\,\\%$`,
        ),
        Math.max(3, this.distracteurs.length),
      )
    }
  }
}
