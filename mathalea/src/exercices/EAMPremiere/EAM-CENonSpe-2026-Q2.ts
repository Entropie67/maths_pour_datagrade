import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { randint } from '../../modules/outils'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import ExerciceQcmACourt from '../ExerciceQcmACourt'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'

export const uuid = '3fc6a'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Effectuer un calcul avec une puissance'
export const dateDePublication = '02/06/2026'
export const dateDeModifImportante = '22/10/2026'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora
 *
 */
export default class AutoQ2CEns2026 extends ExerciceQcmACourt {
  private appliquerLesValeurs(a: number, b: number, c: number): void {
    const bCarre = b * b // b²
    const produit = a * bCarre // a × b²
    const resultat = produit + c // a × b² + c

    // Distracteurs (chacun cible une erreur précise)
    const carreDuProduit = a * b * (a * b) // (a×b)²
    const dist1 = carreDuProduit + c // (ab)² + c : carré appliqué au produit a×b
    const dist2 = carreDuProduit - c // (ab)² - c : idem, avec erreur de signe sur c
    const dist3 = 2 * a * b + c // 2ab + c : carré confondu avec ×2

    this.enonce = `On considère $B=${a}\\times ${b}^2+${c}$. On a :`

    this.correction = `On respecte les priorités opératoires : on calcule d'abord la puissance, puis la multiplication, et enfin l'addition.<br>
$\\begin{aligned}
B&=${a}\\times ${b}^2+${c}\\\\
&=${a}\\times ${bCarre}+${c}\\\\
&=${produit}+${c}\\\\
&=${miseEnEvidence(`${resultat}`)}
\\end{aligned}$`

    this.reponses = [
      `$B=${resultat}$`,
      `$B=${dist1}$`,
      `$B=${dist2}$`,
      `$B=${dist3}$`,
    ]
  }

  versionOriginale: () => void = () => {
    // 2 × 5² + 3
    this.appliquerLesValeurs(2, 5, 3)
  }

  versionAleatoire = () => {
    // Pont avec le mécanisme Can : si le méta a coché « sujet officiel »,
    // on produit la version originale figée au lieu d'un tirage aléatoire.
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }
    let compteur = 0
    do {
      const a = randint(2, 3)
      const b = randint(2, 6, a)
      const c = randint(3, 10)
      this.appliquerLesValeurs(a, b, c)
      compteur++
    } while (compteur < 100 && !aLeBonNombreDePropsDifferentes(this, 4, true))
  }

  constructor() {
    super()
    this.compareReponseCourte = (saisie, reponse) =>
      fonctionComparaison(saisie, reponse, { nombreDecimalSeulement: true })
    // Seule, la question reste un QCM : c'est la composition qui choisit la saisie libre.
    this.sup3 = true
    this.enonceCourt = () =>
      this.enonce.replace(
        /^On considère \$(B=[^$]*)\$\. On a :\s*$/,
        (_, definition: string) =>
          `On considère $${definition}$.<br>Calculer $B$.`,
      )
    // La bonne réponse du QCM est de la forme « $B=53$ » : on ne garde que le second membre
    this.reponseCourte = () =>
      this.reponses[0].replace(/^\$B=/, '').replace(/\$$/, '')
    this.texteAvantReponseCourte = '$B=$'
    this.clavierReponseCourte = KeyboardType.clavierDeBase
  }
}
