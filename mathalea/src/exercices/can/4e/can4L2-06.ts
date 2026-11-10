import { distracteursDistincts } from '../../../lib/interactif/qcmDistractors'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import ExerciceSimple from '../../ExerciceSimple'

import Decimal from 'decimal.js'
import { choice } from '../../../lib/outils/arrayOutils'
import { rienSi1 } from '../../../lib/outils/ecritures'
import { texNombre } from '../../../lib/outils/texNombre'
import { context } from '../../../modules/context'
export const titre = 'Réduire une expression littérale avec des décimaux'
export const interactifReady = true

export const dateDePublication = '17/04/2024'
export const dateDeModifImportante = '30/10/2026'
export const uuid = 'c80b3'
export const refs = {
  'fr-fr': ['can4L2-06', '2L10-flash4'],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class ReduireDecimaux extends ExerciceSimple {
  constructor() {
    super()

    this.canOfficielle = false
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecVariable
    this.versionQcmDisponible = true
    this.optionsDeComparaison = { exclusifFactorisation: true }
  }

  nouvelleVersion() {
    const variable = choice(['x', 'y', 'a', 'b', 'n'])
    const b = new Decimal(this.quotaRandint('b', 1, 99)).div(100)
    const a = this.quotaRandint('a', 1, 2)
    let reduction: Decimal
    if (context.isAmc) this.versionQcm = false
    switch (this.quotaChoice('cas', [1, 2])) {
      case 1: // x-ax ou 2x-ax
        reduction = b.mul(-1).plus(a)
        this.reponse = texNombre(reduction, 2) + `${variable}`
        this.question = this.versionQcm
          ? `Une écriture simplifiée de $${rienSi1(a)}${variable}-${texNombre(b, 2)}${variable}$ est :`
          : `Écrire le plus simplement possible  $${rienSi1(a)}${variable}-${texNombre(b, 2)}${variable}$.`
        if (this.interactif && !this.versionQcm) {
          this.question += `<br>$${rienSi1(a)}${variable}-${texNombre(b, 2)}${variable}=$`
        }
        this.correction = "À l'aide d'une factorisation, on obtient :<br>"
        if (a === 1) {
          this.correction += `$\\begin{aligned}
          ${variable}-${texNombre(b, 2)}${variable}&=1${variable}-${texNombre(b, 2)}${variable}\\\\
          &=(${a}-${texNombre(b, 2)})${variable}\\\\
          &=${miseEnEvidence(`${texNombre(reduction, 2)}${variable}`)}
          \\end{aligned}$`
        } else {
          this.correction += `$\\begin{aligned}
          ${a}${variable}-${texNombre(b, 2)}${variable}  &=(${a}-${texNombre(b, 2)})${variable}\\\\        
          &=${miseEnEvidence(`${texNombre(reduction, 2)}${variable}`)}
          \\end{aligned}$`
        }

        break
      case 2: // ax-x ou ax-2x
        reduction = b.sub(a)
        this.reponse = texNombre(reduction, 2) + `${variable}`
        this.question = this.versionQcm
          ? `Une écriture simplifiée de $${texNombre(b, 2)}${variable}-${rienSi1(a)}${variable}$ est :`
          : `Écrire le plus simplement possible  $${texNombre(b, 2)}${variable}-${rienSi1(a)}${variable}$.`
        if (this.interactif && !this.versionQcm) {
          this.question += `<br>$${texNombre(b, 2)}${variable}-${rienSi1(a)}${variable}=$`
        }
        this.correction = "À l'aide d'une factorisation, on obtient :<br>"
        if (a === 1) {
          this.correction += `$\\begin{aligned}
          ${texNombre(b, 2)}${variable}-${variable}&=${texNombre(b, 2)}${variable}-1${variable}\\\\
      &=(${texNombre(b, 2)}-1)${variable}\\\\
      &=${miseEnEvidence(`${texNombre(reduction, 2)}${variable}`)}
      \\end{aligned}$`
        } else {
          this.correction += `$\\begin{aligned}
          ${texNombre(b, 2)}${variable}-${rienSi1(a)}${variable}  &=(${texNombre(b, 2)}-${a})${variable}\\\\        
      &=${miseEnEvidence(`${texNombre(reduction, 2)}${variable}`)}
      \\end{aligned}$`
        }

        break
    }

    if (this.versionQcm) {
      const distracteurs: string[] = []
      // Erreur : addition au lieu de soustraction
      distracteurs.push(`$${texNombre(b.plus(a), 2)}${variable}$`)
      // Erreur : signe opposé
      distracteurs.push(`$${texNombre(reduction!.neg(), 2)}${variable}$`)
      // Erreur : oubli du 1 devant la variable
      distracteurs.push(`$${texNombre(b, 2)}${variable}$`)

      this.reponse = '$' + this.reponse + '$'
      this.distracteurs = distracteurs
    }
    if (this.versionQcm) {
      // Secours : Multiplier les coefficients, ajouter un carré ou oublier la variable.
      this.distracteurs = distracteursDistincts(
        String(this.reponse),
        this.distracteurs,
        [
          `$${texNombre(b.mul(a), 2)}${variable}$`,
          `$${texNombre(b.plus(a), 2)}${variable}^2$`,
          `$${texNombre(reduction!, 2)}$`,
        ],
        Math.max(3, this.distracteurs.length),
      )
    }
  }
}
