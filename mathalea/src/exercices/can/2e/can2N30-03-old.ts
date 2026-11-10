// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid c4a8f continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../../lib/interactif/questionMathLive'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import FractionEtendue from '../../../modules/FractionEtendue'
import { listeQuestionsToContenu } from '../../../modules/outils'
import Exercice from '../../Exercice'

export const titre =
  'Écrire un nombre sous forme de fraction irréductible et sous forme décimale'
export const interactifReady = true

export const dateDePublication = '17/08/2026'

/**
 * Passer de différentes écritures d'un nombre à une fraction irréductible,
 * puis à son écriture décimale.
 * @author Stéphane Guyon
 */
export const uuid = 'c4a8f'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}

type Donnee = {
  expression: string
  fraction: FractionEtendue
  calcul: string
}

export default class EcrituresFractionnaireEtDecimaleOld extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.sup = 3
    this.sup2 = 5
    this.besoinFormulaireNumerique = [
      'Écriture demandée',
      3,
      '1 : Fraction irréductible\n2 : Écriture décimale\n3 : Mélange',
    ]
    this.besoinFormulaire2Numerique = [
      'Type de nombre proposé',
      5,
      '1 : Pourcentage\n2 : Fraction\n3 : Puissance de 10\n4 : Quotient avec un numérateur décimal\n5 : Mélange',
    ]
  }

  nouvelleVersion(): void {
    const typeNombre = Number(this.sup2)
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      let donnee: Donnee
      const cas =
        typeNombre === 1
          ? 4
          : typeNombre === 2
            ? 1
            : typeNombre === 3
              ? 3
              : typeNombre === 4
                ? 2
                : choice([1, 2, 3, 4])

      switch (cas) {
        case 1: {
          const [numerateurBase, denominateurBase] = choice([
            [3, 2],
            [5, 4],
            [7, 4],
            [9, 5],
            [11, 4],
            [13, 5],
            [15, 4],
          ])
          const facteur = choice([2, 3, 4, 5, 10])
          const fraction = new FractionEtendue(
            numerateurBase * facteur,
            denominateurBase * facteur,
          )
          donnee = {
            expression: fraction.texFraction,
            fraction,
            calcul: fraction.texFraction,
          }
          break
        }
        case 2: {
          const numerateurDecimalDixieme = choice([15, 25, 35, 45, 55, 75])
          const denominateur = choice([10, 100])
          donnee = {
            expression: `\\dfrac{${texNombre(numerateurDecimalDixieme / 10)}}{${denominateur}}`,
            fraction: new FractionEtendue(
              numerateurDecimalDixieme,
              10 * denominateur,
            ),
            calcul: `\\dfrac{${texNombre(numerateurDecimalDixieme / 10)}}{${denominateur}}=\\dfrac{${numerateurDecimalDixieme}}{${10 * denominateur}}`,
          }
          break
        }
        case 3: {
          const entier = choice([120, 250, 320, 450, 520, 750])
          const exposant = choice([1, 2, 3])
          donnee = {
            expression: `${entier}\\times 10^{-${exposant}}`,
            fraction: new FractionEtendue(entier, 10 ** exposant),
            calcul: `${entier}\\times 10^{-${exposant}}=\\dfrac{${entier}}{${10 ** exposant}}`,
          }
          break
        }
        case 4:
        default: {
          const pourcentage = choice([15, 20, 25, 35, 40, 45, 60, 75, 125])
          donnee = {
            expression: `${pourcentage}\\,\\%`,
            fraction: new FractionEtendue(pourcentage, 100),
            calcul: `${pourcentage}\\,\\%=\\dfrac{${pourcentage}}{100}`,
          }
          break
        }
      }

      const fractionIrreductible = donnee.fraction.simplifie()
      const decimal = fractionIrreductible.valeurDecimale
      const typeReponse =
        Number(this.sup) === 1
          ? 'fraction'
          : Number(this.sup) === 2
            ? 'decimal'
            : choice(['fraction', 'decimal'])
      const fractionDemandee = typeReponse === 'fraction'
      const reponseAttendue = fractionDemandee
        ? fractionIrreductible.texFraction
        : texNombre(decimal)

      if (!this.questionJamaisPosee(i, donnee.expression, typeReponse)) {
        continue
      }

      let texte = `Écrire $A=${donnee.expression}$ ${fractionDemandee ? "sous la forme d'une fraction irréductible" : 'sous forme décimale'}.`

      if (this.interactif) {
        texte += ajouteChampTexteMathLive(
          this,
          i,
          KeyboardType.clavierDeBaseAvecFraction,
          { texteAvant: '<br>$A=$' },
        )
      }

      handleAnswers(this, i, {
        reponse: {
          value: reponseAttendue,
          options: fractionDemandee
            ? { fractionIrreductible: true }
            : { nombreDecimalSeulement: true },
        },
      })

      this.listeQuestions[i] = texte
      this.listeCorrections[i] = fractionDemandee
        ? `$A=${donnee.calcul}=${miseEnEvidence(fractionIrreductible.texFraction)}$.`
        : `$A=${donnee.calcul}=${fractionIrreductible.texFraction}=${miseEnEvidence(texNombre(decimal))}$.`
      this.canEnonce = `Écrire $A=${donnee.expression}$ ${fractionDemandee ? "sous la forme d'une fraction irréductible" : 'sous forme décimale'}.`
      this.canReponseACompleter = '$A=\\ldots$'
      this.listeCanEnonces.push(this.canEnonce)
      this.listeCanReponsesACompleter.push(this.canReponseACompleter)

      i++
    }

    listeQuestionsToContenu(this)
  }
}
