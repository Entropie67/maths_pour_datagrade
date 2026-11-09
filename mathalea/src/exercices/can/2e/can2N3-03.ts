import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import {
  obtenirListeFractionsIrreductibles,
  texFractionFromString,
} from '../../../lib/outils/deprecatedFractions'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { context } from '../../../modules/context'
import FractionEtendue from '../../../modules/FractionEtendue'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Calculer un nombre connaissant son inverse'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
export const dateDePublication = '10/11/2022'
export const dateDeModifImportante = '04/08/2025'
/**
 * @author Gilles Mora

*/

export const uuid = 'd9488'

export const refs = {
  'fr-fr': ['can2N3-03'],
  'fr-ch': ['NR'],
}
export default class NombreInverse extends ExerciceSimple {
  constructor() {
    super()
    this.versionQcmDisponible = true
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
  }

  nouvelleVersion() {
    const maFraction = this.quotaChoice(
      'maFraction',
      obtenirListeFractionsIrreductibles(),
    )
    const a = this.quotaRandint('a', 1, 4)
    const b = maFraction[0]
    const c = maFraction[1]
    const d = new FractionEtendue(a * c + b, c)
    const e = new FractionEtendue(a * c - b, c)
    const listeNom = ['R', 'x', 'y', 'T', 'z', 'U', 'A', 'B', 'C']
    const Nom = choice(listeNom)

    if (context.isAmc) this.versionQcm = false
    // Champ de réponse à la ligne, précédé du nom de l'inconnue
    this.optionsChampTexte = { texteAvant: `<br>$${Nom}=$` }
    if (this.quotaChoice('ordre', [true, false])) {
      this.reponse = this.versionQcm
        ? `$${Nom}=${new FractionEtendue(a * c + b, c).inverse().texFraction}$`
        : new FractionEtendue(a * c + b, c).inverse().texFraction
      this.question = this.versionQcm
        ? `On considère l'égalité $\\dfrac{1}{${Nom}}=${a}+${texFractionFromString(b, c)}$.<br> On a :`
        : `Calculer $${Nom}$  sachant que :
     $\\dfrac{1}{${Nom}}=${a}+${texFractionFromString(b, c)}$.`
      this.correction = `$\\dfrac{1}{${Nom}}=${a}+${texFractionFromString(b, c)} = \\dfrac{${a} \\times ${c}}{${c}} + \\dfrac{${b}}{${c}} = \\dfrac{${a * c}}{${c}} + \\dfrac{${b}}{${c}}  =${d.texFraction}$<br><br>
   L'inverse de $${Nom}$ vaut  $${d.texFraction}$, donc `
      this.correction += this.versionQcm
        ? `$${miseEnEvidence(`${Nom}=${d.inverse().texFraction}`)}$.`
        : `$${Nom}=${miseEnEvidence(`${d.inverse().texFraction}`)}$.`
      this.canEnonce = `$\\dfrac{1}{${Nom}}=${a}+${texFractionFromString(b, c)}$` // 'Compléter'
      this.canReponseACompleter = `$${Nom}=\\ldots$`

      if (this.versionQcm) {
        this.distracteurs = [
          `$${Nom}=${new FractionEtendue(a * c + b, c).texFraction}$`,
          `$${Nom}=${new FractionEtendue(a + b, c).texFractionSimplifiee}$`,
          `$${Nom}=${new FractionEtendue(a + b, c).inverse().texFractionSimplifiee}$`,
          `$${Nom}=${new FractionEtendue(a * b + c, b).inverse().texFractionSimplifiee}$`,
        ]
      }
    } else {
      this.reponse = this.versionQcm
        ? `$${Nom}=${new FractionEtendue(a * c - b, c).inverse().texFraction}$`
        : new FractionEtendue(a * c - b, c).inverse().texFraction
      this.question = this.versionQcm
        ? `On considère l'égalité $\\dfrac{1}{${Nom}}=${a}-${texFractionFromString(b, c)}$. <br>On a :`
        : `Calculer $${Nom}$ sachant que : 
         $\\dfrac{1}{${Nom}}=${a}-${texFractionFromString(b, c)}$.`
      this.correction = `$\\dfrac{1}{${Nom}}=${a}-${texFractionFromString(b, c)} = \\dfrac{${a} \\times ${c}}{${c}} - \\dfrac{${b}}{${c}} = \\dfrac{${a * c}}{${c}} - \\dfrac{${b}}{${c}}  =${e.texFraction}$<br><br>
        L'inverse de $${Nom}$ vaut  $${e.texFraction}$, donc $${Nom}=${miseEnEvidence(`${e.inverse().texFraction}`)}$.`
      this.canEnonce = `$\\dfrac{1}{${Nom}}=${a}-${texFractionFromString(b, c)}$` // 'Compléter'
      this.canReponseACompleter = `$${Nom}=\\ldots$`

      if (this.versionQcm) {
        this.distracteurs = [
          `$${Nom}=${new FractionEtendue(a * c - b, c).texFraction}$`,
          `$${Nom}=${new FractionEtendue(a - b, c).texFractionSimplifiee}$`,
          `${a - b === 0 ? `$${Nom}=${new FractionEtendue(a + b, c).inverse().texFractionSimplifiee}$` : `$${Nom}=${new FractionEtendue(a - b, c).inverse().texFractionSimplifiee}$`}`,
          `$${Nom}=${new FractionEtendue(a * b + c, b).inverse().texFractionSimplifiee}$`,
        ]
      }
    }
  }
}
