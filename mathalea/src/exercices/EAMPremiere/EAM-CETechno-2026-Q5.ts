import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import { ecritureAlgebrique, rienSi1 } from '../../lib/outils/ecritures'
import { miseEnEvidence, texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import FractionEtendue from '../../modules/FractionEtendue'
import { randint } from '../../modules/outils'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'
import ExerciceQcmACourt from '../ExerciceQcmACourt'

export const uuid = '79fdf'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = "Donner les solutions d'une équation produit mul"
export const dateDePublication = '02/06/2026'
export const dateDeModifImportante = '22/10/2026'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora
 *
 */
export default class AutoQ5ANt2026 extends ExerciceQcmACourt {
  private solutions: string[] = []

  private appliquerLesValeurs(b: number, c: number, d: number): void {
    const sol1 = -b
    const sol2 = new FractionEtendue(-d, c).simplifie()

    this.solutions = [`${sol1}`, sol2.texFractionSimplifiee]
    const f1 = `x${ecritureAlgebrique(b)}`
    const f2 = `${rienSi1(c)}x${ecritureAlgebrique(d)}`

    this.enonce = `Les solutions de l'équation $(${f1})(${f2}) = 0$ sont :`

    // Distracteurs calqués sur l'image d'origine :
    // A. Correct : -b et -d/c
    const correct = `$${sol1}$ et $${sol2.texFractionSimplifiee}$.`
    // B. Erreur de signes et oubli du coefficient directeur c : b et d
    const dist1 = `$${b}$ et $${d}$.`
    // C. Correct pour la 1ère, erreur de signe pour la fraction : -b et d/c
    const dist2 = `$${sol1}$ et $${new FractionEtendue(d, c).simplifie().texFractionSimplifiee}$.`
    // D. Correct pour la 1ère, oubli du coefficient directeur c : -b et -d
    const dist3 = `$${sol1}$ et $${-d}$.`

    this.reponses = [correct, dist1, dist2, dist3]

    this.correction = `Un produit de facteurs est nul si, et seulement si, l'un au moins de ses facteurs est nul.<br><br>`
    this.correction += `$(${f1})(${f2}) = 0$ équivaut à $${f1} = 0$ ou $${f2} = 0$.<br><br>`
    this.correction += `$\\bullet\\quad ${f1} = 0$ a pour solution $x = ${sol1}$.<br>`
    this.correction += `$\\bullet\\quad ${f2} = 0$  a pour solution $x = ${sol2.texFractionSimplifiee}$.<br>`
    this.correction += `Les solutions sont donc $${miseEnEvidence(sol1)}$ ${texteEnCouleurEtGras('et')} $${miseEnEvidence(sol2.texFractionSimplifiee)}$.`
  }

  versionOriginale: () => void = () => {
    // Équation de l'image : (x - 2)(2x + 1) = 0
    this.appliquerLesValeurs(-2, 2, 1)
  }

  versionAleatoire: () => void = () => {
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }

    let compteur = 0
    do {
      const b = randint(-9, 9, [0]) // Évite x = 0 pour le premier facteur
      const c = choice([2, 3, 4, 5])
      const d = randint(-9, 9, [0, c, -c, 2 * c, -2 * c]) // Évite les solutions entières ou nulles pour le 2e facteur

      this.appliquerLesValeurs(b, c, d)
      compteur++
    } while (compteur < 100 && !aLeBonNombreDePropsDifferentes(this, 4, true))
  }

  constructor() {
    super()
    // Seule, la question reste un QCM : c'est la composition qui choisit la saisie libre.
    this.sup3 = true
    this.enonceCourt = () =>
      this.enonce.replace(
        /^Les solutions de (l'équation \$.*\$) sont :\s*$/,
        (_, equation: string) => `Résoudre ${equation}.`,
      )
    // La bonne réponse du QCM est de la forme « $-2$ et $-\dfrac{1}{2}$. » : on attend l'ensemble des solutions
    this.reponseCourte = () => `\\{${this.solutions.join(';')}\\}`
    this.correctionCourte = () => {
      const debut = (this.correction ?? '').lastIndexOf(
        'Les solutions sont donc',
      )
      return `${(this.correction ?? '').slice(0, debut)}L'ensemble des solutions est $S=${miseEnEvidence(`\\{${this.solutions.join(';')}\\}`)}$.`
    }
    this.compareReponseCourte = (saisie, reponse) =>
      fonctionComparaison(saisie, reponse, { ensembleDeNombres: true })
    this.texteAvantReponseCourte = '$S=$'
    this.clavierReponseCourte = KeyboardType.clavierEnsemble
  }
}
