import Decimal from 'decimal.js'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { randint } from '../../modules/outils'
import ExerciceSimple from '../ExerciceSimple'
export const dateDePublication = '11/10/2025'
export const dateDeModifImportante = '30/09/2026'
export const uuid = '72f4c'

export const refs = {
  'fr-fr': ['1A-C03-10', '2A-N3-5'],
  'fr-ch': ['10LCNO5A-4', '10LSNO5A-4'],
}
export const interactifReady = true

export const amcReady = true
export const amcType = 'qcmMono'
export const titre = "Passer de l'écriture scientifique à l'écriture décimale"

/**
 *
 * @author Gilles Mora
 *
 */
export default class Auto1AC3j extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.spacing = 1.5
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
    this.optionsChampTexte = { texteAvant: '<br>' }
    this.versionQcmDisponible = true
    this.versionQcm = false
    this.tip = `
  <p style="margin: 0 0 10px 0;">
    Il faut passer d'une écriture scientifique à une écriture décimale.
  </p>
  <ul style="list-style-type: disc; padding-left: 1.5em; margin: 0 0 14px 0; line-height: 2;">
    <li>Regarder le signe de l'exposant de $10$.</li>
    <li>Déplacer la virgule du nombre dans le bon sens.</li>
    <li>Compter soigneusement le nombre de rangs de déplacement.</li>
    <li>Construire au brouillon un tableau de numération en cas d'hésitation.</li>
  </ul>`
  }

  nouvelleVersion() {
    if (context.isAmc) this.versionQcm = true

    const a = choice([
      new Decimal(randint(101, 999)).div(100),
      new Decimal(randint(1001, 9999)).div(1000),
    ])
    const n = this.quotaChoice('signe', [-1, 1]) * randint(2, 5)
    const puissance = new Decimal(10).pow(n)
    const resultat = a.mul(puissance)

    this.question = `Quelle est l'écriture décimale du nombre dont l'écriture scientifique est $${texNombre(a, 4)}\\times 10^{${n}}$ ?`
    this.correction = `Multiplier par $10^{${n}}$ revient à multiplier par $${texNombre(puissance, 6)}$, donc l'écriture décimale de $${texNombre(a, 6)}\\times 10^{${n}}$ est : $${miseEnEvidence(texNombre(resultat, 8))}$.`

    if (this.versionQcm) {
      this.reponse = `$${texNombre(resultat, 8)}$`
      this.distracteurs = [
        `$${texNombre(a.mul(new Decimal(10).pow(n - 1)), 8)}$`,
        `$${texNombre(a.mul(new Decimal(10).pow(-n)), 8)}$`,
        n < 0
          ? `$${texNombre(a.mul(new Decimal(10).pow(n + 1)), 8)}$`
          : `$${texNombre(a.floor().mul(puissance).plus(a.div(10)), 8)}$`,
      ]
    } else {
      this.question = `Donner l'écriture décimale du nombre dont l'écriture scientifique est $${texNombre(a, 4)}\\times 10^{${n}}$.`
      this.reponse = resultat
    }
  }
}
