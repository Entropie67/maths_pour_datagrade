import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { stringNombre, texNombre } from '../../../lib/outils/texNombre'
import FractionEtendue from '../../../modules/FractionEtendue'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = "Changer l'écriture d'un nombre"
export const interactifReady = true

export const dateDePublication = '13/08/2026'

/**
 * Changer l'écriture d'un nombre : écriture scientifique, décimale,
 * fractionnaire ou en pourcentage.
 * @author Stéphane Guyon
 */

export const uuid = '1fa97'

export const refs = {
  'fr-fr': ['can2N11-01'],
  'fr-ch': [],
}

export default class ChangerEcritureNombre extends ExerciceSimple {
  constructor() {
    super()
    this.nbQuestions = 1
    this.typeExercice = 'simple'
    this.spacingCorr = 1.5
    this.optionsChampTexte = { texteAvant: '<br>' }
    this.formatChampTexte =
      KeyboardType.clavierDeBaseAvecFractionPuissanceCrochets
  }

  nouvelleVersion() {
    this.optionsChampTexte = { texteAvant: '<br>' }
    this.optionsDeComparaison = {}

    switch (this.quotaChoice('cas', [1, 2, 3, 4, 5])) {
      case 1: {
        const [nombre, mantisse, exposant] = this.quotaChoice('scientifique', [
          [5320000, 5.32, 6],
          [74500, 7.45, 4],
          [0.001405, 1.405, -3],
          [0.00062, 6.2, -4],
          [8200000, 8.2, 6],
          [91000, 9.1, 4],
          [0.0000521, 5.21, -5],
          [634000000, 6.34, 8],
          [0.00097, 9.7, -4],
        ])
        this.question = `Donner l'écriture scientifique de $${texNombre(nombre)}$.`
        this.reponse = `${stringNombre(mantisse)}\\times 10^{${exposant}}`
        this.optionsDeComparaison = { ecritureScientifique: true }
        this.correction = `On déplace la virgule pour obtenir un nombre compris entre $1$ et $10$ :<br>
$${texNombre(nombre)}=${miseEnEvidence(this.reponse)}$`
        break
      }
      case 2: {
        let numerateur: number, denominateur: number
        if (choice([true, false])) {
          denominateur = choice([4, 20, 25, 50])
          numerateur = randint(1, denominateur - 1)
        } else {
          ;[numerateur, denominateur] = this.quotaChoice('fractionDecimale', [
            [3, 4],
            [7, 20],
            [7, 25],
            [13, 50],
            [11, 4],
            [13, 4],
            [9, 25],
            [21, 50],
            [33, 50],
          ])
        }
        const decimal = numerateur / denominateur
        this.question = `Donner l'écriture décimale de $\\dfrac{${numerateur}}{${denominateur}}$.`
        this.reponse = decimal
        this.optionsDeComparaison = { nombreDecimalSeulement: true }
        this.correction = `$\\dfrac{${numerateur}}{${denominateur}}=${numerateur}\\div ${denominateur}=${miseEnEvidence(texNombre(decimal))}$`
        break
      }
      case 3: {
        let numerateur: number, denominateur: number
        if (choice([true, false])) {
          denominateur = choice([4, 5, 20, 25, 50])
          numerateur = randint(1, denominateur - 1)
        } else {
          ;[numerateur, denominateur] = this.quotaChoice(
            'fractionPourcentage',
            [
              [1, 4],
              [3, 5],
              [7, 20],
              [7, 25],
              [9, 50],
              [1, 5],
              [3, 4],
              [1, 20],
              [17, 20],
              [9, 20],
            ],
          )
        }
        const pourcentage = (100 * numerateur) / denominateur
        this.question = `Donner l'écriture en pourcentage de $\\dfrac{${numerateur}}{${denominateur}}$.`
        this.reponse = pourcentage
        this.optionsChampTexte = { texteAvant: '<br>', texteApres: '$\\,\\%$' }
        this.optionsDeComparaison = { nombreDecimalSeulement: true }
        this.correction = `$\\dfrac{${numerateur}}{${denominateur}}=\\dfrac{${pourcentage}}{100}=${miseEnEvidence(`${texNombre(pourcentage)}\\,\\%`)}$`
        break
      }
      case 4: {
        const pourcentage = choice([true, false])
          ? randint(1, 150)
          : this.quotaChoice('pourcentageDecimal', [
              12, 18, 35, 72, 125, 8, 24, 56, 90, 145,
            ])
        const decimal = pourcentage / 100
        this.question = `Donner l'écriture décimale de $${pourcentage}\\,\\%$.`
        this.reponse = decimal
        this.optionsDeComparaison = { nombreDecimalSeulement: true }
        this.correction = `$${pourcentage}\\,\\%=\\dfrac{${pourcentage}}{100}=${miseEnEvidence(texNombre(decimal))}$`
        break
      }
      case 5:
      default: {
        const [entier, nombreDeDecimales] = this.quotaChoice(
          'decimalFraction',
          [
            [248, 2],
            [175, 2],
            [32, 2],
            [15, 2],
            [24, 2],
            [45, 2],
            [64, 2],
            [36, 2],
          ],
        )
        const puissanceDeDix = 10 ** nombreDeDecimales
        const decimal = entier / puissanceDeDix
        const fraction = new FractionEtendue(entier, puissanceDeDix).simplifie()
        this.question = `Donner l'écriture fractionnaire irréductible de $${texNombre(decimal)}$.`
        this.reponse = fraction.texFraction
        this.optionsDeComparaison = { fractionIrreductible: true }
        this.correction = `$${texNombre(decimal)}=\\dfrac{${entier}}{${puissanceDeDix}}=${miseEnEvidence(fraction.texFraction)}$`
        break
      }
    }

    this.canEnonce = this.question
    this.canReponseACompleter = ''
  }
}
