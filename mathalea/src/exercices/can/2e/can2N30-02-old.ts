// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid d1bad continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { stringNombre, texNombre } from '../../../lib/outils/texNombre'
import FractionEtendue from '../../../modules/FractionEtendue'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = "Changer l'écriture d'un nombre"
export const interactifReady = true

export const dateDePublication = '13/08/2026'

/**
 * Changer l'écriture d'un nombre : écriture scientifique, décimale,
 * fractionnaire ou en pourcentage.
 * @author Stéphane Guyon
 */
export const uuid = 'd1bad'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}

export default class ChangerEcritureNombreOld extends ExerciceSimple {
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
        ])
        this.question = `Donner l'écriture scientifique de $${texNombre(nombre)}$.`
        this.reponse = `${stringNombre(mantisse)}\\times 10^{${exposant}}`
        this.optionsDeComparaison = { ecritureScientifique: true }
        this.correction = `On déplace la virgule pour obtenir un nombre compris entre $1$ et $10$ :<br>
$${texNombre(nombre)}=${miseEnEvidence(this.reponse)}$.`
        break
      }
      case 2: {
        const [numerateur, denominateur] = this.quotaChoice(
          'fractionDecimale',
          [
            [3, 4],
            [7, 20],
            [7, 25],
            [13, 50],
            [9, 8],
          ],
        )
        const decimal = numerateur / denominateur
        this.question = `Donner l'écriture décimale de $\\dfrac{${numerateur}}{${denominateur}}$.`
        this.reponse = decimal
        this.optionsDeComparaison = { nombreDecimalSeulement: true }
        this.correction = `$\\dfrac{${numerateur}}{${denominateur}}=${numerateur}\\div ${denominateur}=${miseEnEvidence(texNombre(decimal))}$.`
        break
      }
      case 3: {
        const [numerateur, denominateur] = this.quotaChoice(
          'fractionPourcentage',
          [
            [1, 4],
            [3, 5],
            [7, 20],
            [7, 25],
            [9, 50],
          ],
        )
        const pourcentage = (100 * numerateur) / denominateur
        this.question = `Donner l'écriture en pourcentage de $\\dfrac{${numerateur}}{${denominateur}}$.`
        this.reponse = pourcentage
        this.optionsChampTexte = { texteAvant: '<br>', texteApres: '$\\,\\%$' }
        this.optionsDeComparaison = { nombreDecimalSeulement: true }
        this.correction = `$\\dfrac{${numerateur}}{${denominateur}}=\\dfrac{${pourcentage}}{100}=${miseEnEvidence(`${texNombre(pourcentage)}\\,\\%`)}$.`
        break
      }
      case 4: {
        const pourcentage = this.quotaChoice(
          'pourcentageDecimal',
          [12, 18, 35, 72, 125],
        )
        const decimal = pourcentage / 100
        this.question = `Donner l'écriture décimale de $${pourcentage}\\,\\%$.`
        this.reponse = decimal
        this.optionsDeComparaison = { nombreDecimalSeulement: true }
        this.correction = `$${pourcentage}\\,\\%=\\dfrac{${pourcentage}}{100}=${miseEnEvidence(texNombre(decimal))}$.`
        break
      }
      case 5:
      default: {
        const [entier, nombreDeDecimales] = this.quotaChoice(
          'decimalFraction',
          [
            [248, 2],
            [125, 3],
            [175, 2],
            [32, 2],
            [1125, 3],
          ],
        )
        const puissanceDeDix = 10 ** nombreDeDecimales
        const decimal = entier / puissanceDeDix
        const fraction = new FractionEtendue(entier, puissanceDeDix).simplifie()
        this.question = `Donner l'écriture fractionnaire irréductible de $${texNombre(decimal)}$.`
        this.reponse = fraction.texFraction
        this.optionsDeComparaison = { fractionIrreductible: true }
        this.correction = `$${texNombre(decimal)}=\\dfrac{${entier}}{${puissanceDeDix}}=${miseEnEvidence(fraction.texFraction)}$.`
        break
      }
    }

    this.canEnonce = this.question
    this.canReponseACompleter = ''
  }
}
