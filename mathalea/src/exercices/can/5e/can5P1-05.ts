import { texPrix } from '../../../lib/format/style'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'

/**
 * Construit la correction : on passe par le prix de 100 g (prix au kg divisé
 * par 10, car 1 kg = 10×100 g), sauf si la question demande déjà 100 g (dans
 * ce cas, ce prix de 100 g est directement la réponse, inutile de le
 * multiplier par 1).
 */
function texteCorrectionPrix(
  a: number,
  b: number,
  b2: number,
  nomProduit: string,
): string {
  if (b === 100) {
    return `Comme $1$ kg $=10\\times100$ g, le prix de $${b}$ g ${nomProduit} est donné par : <br>
$${texPrix(a)}\\div 10=${texPrix(b2)}$.<br>
Le prix de $${b}$ g ${nomProduit} est $${miseEnEvidence(texPrix(b2))}~\\text{€}$.<br>`
  }
  const facteur = b / 100
  return `Comme $1$ kg $=10\\times100$ g, le prix de $100$ g ${nomProduit} est : <br>
$${texPrix(a)}\\div 10=${texPrix(a / 10)}~\\text{€}$.<br>
Or $${b}$ g $=${facteur}\\times100$ g, donc le prix de $${b}$ g ${nomProduit} est : <br>
$${facteur}\\times ${texPrix(a / 10)}=${texPrix(b2)}~\\text{€}$.<br>
Le prix de $${b}$ g ${nomProduit} est $${miseEnEvidence(texPrix(b2))}~\\text{€}$.<br>`
}
export const titre = "Calculer un prix à partir d'un prix au kg"
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
export const dateDePublication = '13/11/2022'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

 * Date de publication
*/

export const dateDeModifImportante = '31/10/2026'
export const uuid = '7b350'

export const refs = {
  'fr-fr': ['can5P1-05', '5P1C-flash3'],
  'fr-ch': ['9R1FA1D-8', '9R2FA1D-8', '9R3FA1D-8'],
}
export default class CalculPrix extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.optionsDeComparaison = {
      nombreDecimalSeulement: true,
    }
    this.optionsChampTexte = { texteApres: '€', texteAvant: '<br>' }
  }

  nouvelleVersion() {
    let a, b, n, b1, b2, reponse
    switch (
      this.quotaChoice('typeDeQuestions', [1, 2, 3]) //,
    ) {
      case 1:
        a = randint(2, 6)
        n = choice([
          ' de pommes de terre',
          ' de carottes',
          ' de courgettes',
          'de navets',
          'de tomates',
          'de poireaux',
          "d'aubergines",
        ])
        b = randint(1, 9) * 100
        b1 = b / 1000
        b2 = b1 * a
        reponse = b2
        this.question = `Le prix d'un kg ${n} est $${texPrix(a)}~\\text{€}$. <br>
Quel est le prix de $${b}$ g ? `

        this.correction = texteCorrectionPrix(a, b, b2, n)

        this.reponse = reponse
        break

      case 2:
        a = randint(7, 15)
        n = choice(['de cerises', 'de fraises', 'de framboises'])
        b = randint(1, 9) * 100
        b1 = b / 1000
        b2 = b1 * a
        reponse = b2
        this.question = `Le prix d'un kg ${n} est $${texPrix(a)}~\\text{€}$. <br>
Quel est le prix de $${b}$ g ? `

        this.correction = texteCorrectionPrix(a, b, b2, n)

        this.reponse = reponse
        break

      case 3:
      default:
        a = randint(16, 25)
        n = choice([
          'du Costa Rica',
          'du Kenya',
          'de Colombie',
          "d'Ethiopie",
          'du Salvador',
          'du Nicaragua',
          'du Mexique',
          'du Honduras',
          'du Guatemala',
        ])
        b = randint(1, 9) * 100
        b1 = b / 1000
        b2 = b1 * a
        reponse = b2
        this.question = `Le prix d'un kg de café ${n} est $${texPrix(a)}~\\text{€}$. <br>
Quel est le prix de $${b}$ g ? `

        this.correction = texteCorrectionPrix(a, b, b2, `de café ${n}`)

        this.reponse = reponse
        break
    }
    this.reponse = this.reponse.toFixed(2)

    this.canReponseACompleter = '$\\ldots~\\text{€}$'
  }
}
