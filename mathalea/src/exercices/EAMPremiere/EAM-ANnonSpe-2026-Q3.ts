import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { all, contains, isEqual } from '../../lib/interactif/checks'
import { randint } from '../../modules/outils'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import ExerciceQcmACourt from '../ExerciceQcmACourt'

export const uuid = 'eed49'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Effectuer un calcul avec des puissances'
export const dateDePublication = '02/06/2026'
export const dateDeModifImportante = '22/10/2026'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora
 *
 */
export default class AutoQ3ANns2026 extends ExerciceQcmACourt {
  // D = c × 2^p × 2^q = c × 2^(p+q)
  private appliquerLesValeurs(c: number, p: number, q: number): void {
    this.enonce = `On considère le nombre $D=${c}\\times 2^{${p}}\\times 2^{${q}}$.<br>On a :`

    this.correction = `On utilise la propriété $a^n\\times a^p=a^{n+p}$ :<br>
$\\begin{aligned}
D&=${c}\\times 2^{${p}}\\times 2^{${q}}\\\\
&=${c}\\times 2^{${p}+${q}}\\\\
&=${miseEnEvidence(`${c}\\times 2^{${p + q}}`)}
\\end{aligned}$`

    this.reponses = [
      `$D=${c}\\times 2^{${p + q}}$`, // correct : on additionne les exposants
      `$D=${2 * c}^{${p + q}}$`, // (2c)^(p+q) : le coefficient passe dans la base
      `$D=${c}\\times 2^{${p * q}}$`, // c × 2^(p×q) : exposants multipliés
      `$D=${c + 4}^{${p + q}}$`, // (c+2+2)^(p+q) : on additionne les bases
    ]
  }

  versionOriginale: () => void = () => {
    // D = 3 × 2^5 × 2^3 = 3 × 2^8  (le sujet officiel : 6^8, 3×2^15, 7^8)
    this.appliquerLesValeurs(3, 5, 3)
  }

  versionAleatoire: () => void = () => {
    // Pont avec le mécanisme Can : « sujet officiel » => version originale figée.
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }
    // c ≠ 4 (sinon les bases 2c et c+4 coïncident) ; p ≥ 3 et q ≥ 2
    // garantissent p+q ≠ p×q (donc le distracteur « exposants multipliés » reste distinct).
    const c = choice([3, 5, 6, 7, 9, 10])
    const p = randint(3, 5)
    const q = randint(2, 4)
    this.appliquerLesValeurs(c, p, q)
    let compteur = 0
    do {
      const c = choice([3, 5, 6, 7, 9, 10])
      const p = randint(3, 5)
      const q = randint(2, 4)
      this.appliquerLesValeurs(c, p, q)
      compteur++
    } while (compteur < 100 && !aLeBonNombreDePropsDifferentes(this, 4, true))
  }

  constructor() {
    super()
    // Seule, la question reste un QCM : c'est la composition qui choisit la saisie libre.
    this.sup3 = true
    this.enonceCourt = () =>
      this.enonce.replace(
        /^On considère le nombre \$(D=[^$]*)\$\.<br>On a :\s*$/,
        (_, definition: string) =>
          `On considère le nombre $${definition}$.<br>Écrire $D$ sous la forme $c\\times 2^{k}$, où $c$ et $k$ sont des entiers.`,
      )
    // La bonne réponse du QCM est de la forme « $D=7\times 2^{6}$ » : on ne garde que le second membre
    this.reponseCourte = () =>
      this.reponses[0].replace(/^\$D=/, '').replace(/\$$/, '')
    this.texteAvantReponseCourte = '$D=$'
    // La réponse est de la forme c × 2^k : le nombre calculé (1792) ne convient pas
    this.compareReponseCourte = all([
      isEqual(),
      contains({
        pattern: /2\^/,
        feedbackKo: 'Écrire le résultat sous la forme $c\\times 2^{k}$.',
      }),
    ])
    this.clavierReponseCourte = KeyboardType.lyceeClassique
  }
}
