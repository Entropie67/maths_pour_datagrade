import Decimal from 'decimal.js'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = "Calculer un produit par déduction d'un autre produit"
export const interactifReady = true

export const dateDePublication = '06/07/2025'
/**
 * @author Gilles Mora
 */
export const uuid = 'a3046'

export const refs = {
  'fr-fr': ['can6C2-09', '6N2D-flash1'],
  'fr-ch': [],
}
export default class ProduitParDeduction extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.spacing = 1.5
    this.spacingCorr = 1.5
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  nouvelleVersion() {
    switch (this.quotaChoice('typeDeQuestions', [1, 2])) {
      case 1: // avec deux entiers
        {
          const coeff = choice([10, 100, 1000])
          const facteur1 = randint(4, 9) * 10 + randint(1, 9)
          const facteur2 = randint(7, 9)

          const resultatEntier = facteur1 * facteur2
          this.question = `Compléter l'égalité sachant que $${texNombre(facteur1, 0)}\\times ${texNombre(facteur2, 0)}=${texNombre(resultatEntier, 0)}$.<br> `

          this.question += `$${texNombre(facteur1 / coeff, 3)}\\times ${texNombre(facteur2, 0)}=$`
          if (!this.interactif) {
            this.question += ' $\\ldots$'
          }
          this.canEnonce = `Compléter l'égalité sachant que $${texNombre(facteur1, 0)}\\times ${texNombre(facteur2, 0)}=${texNombre(resultatEntier, 0)}$. `
          this.canReponseACompleter = `$${texNombre(facteur1 / coeff, 3)}\\times ${texNombre(facteur2, 0)}=\\ldots$`
          this.reponse = texNombre(resultatEntier / coeff, 3)
          const coeffInverse = new Decimal(1).div(coeff)
          this.correction = `On utilise le résultat du calcul donné : <br>
       $\\begin{aligned}
         ${texNombre(facteur1 / coeff, 3)}\\times ${texNombre(facteur2, 0)}&=(${texNombre(facteur1, 0)}\\times ${texNombre(coeffInverse, 3)})\\times ${texNombre(facteur2, 0)}\\\\
         &=${texNombre(facteur1, 0)}\\times ${texNombre(facteur2, 0)}\\times ${texNombre(coeffInverse, 3)}\\\\
         &=${texNombre(resultatEntier, 0)}\\times ${texNombre(coeffInverse, 3)}\\\\
         &=${miseEnEvidence(texNombre(resultatEntier / coeff, 3))}
         \\end{aligned}$`
        }
        break
      case 2:
        {
          // produit donné = entier × décimal
          const coeff = choice([10, 100, 1000, 0.1, 0.01, 0.001])
          const entier = choice([7, 8, 9, 16, 17]) // entier simple
          const decimalBase = randint(21, 59, [30, 40, 50]) // exemple : 34, 45, ...
          const decimal = new Decimal(decimalBase).div(coeff)
          const produitDecimal = new Decimal(entier).mul(decimal)

          const decimalStr = texNombre(decimal, 3)

          // On inverse le coeff pour multiplier et retrouver la version entière du produit
          const decimalEquivalent = new Decimal(decimal).mul(coeff) // devient un entier
          const produitEquivalent = entier * decimalEquivalent.toNumber()

          this.question = `Compléter l'égalité sachant que $${entier} \\times ${decimalStr} = ${texNombre(produitDecimal, 3)}$.<br>
$${entier} \\times ${texNombre(decimalEquivalent, 0)} = $`

          if (!this.interactif) {
            this.question += ' $\\ldots$'
          }
          this.canEnonce = `Compléter l'égalité sachant que $${entier} \\times ${decimalStr} = ${texNombre(produitDecimal, 3)}$. `
          this.canReponseACompleter = `$${entier} \\times ${texNombre(decimalEquivalent, 0)} = \\ldots$`
          this.reponse = texNombre(produitEquivalent, 0)
          // texteEnCouleurEtGras(nb3, bleuMathalea) ?
          this.correction = `On utilise la relation entre les deux écritures :<br>
$\\begin{aligned}
${entier} \\times ${decimalStr} &= ${entier} \\times \\left(${texNombre(decimalEquivalent, 0)} \\times ${texNombre(new Decimal(1).div(coeff), 3)}\\right) \\\\
&= ${entier} \\times ${texNombre(decimalEquivalent, 0)} \\times ${texNombre(new Decimal(1).div(coeff), 3)} \\\\
\\text{et } ${texNombre(produitDecimal, 3)}&= ${texNombre(produitEquivalent, 0)} \\times ${texNombre(new Decimal(1).div(coeff), 3)}\\\\
\\end{aligned}\\\\$<br>
$\\text{donc } ${entier} \\times ${texNombre(decimalEquivalent, 0)} = ${miseEnEvidence(texNombre(produitEquivalent, 0))}$`
        }
        break
    }
  }
}
