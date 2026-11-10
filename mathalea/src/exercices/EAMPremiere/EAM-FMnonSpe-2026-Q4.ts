import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
  reduireAxPlusB,
  rienSi1,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import ExerciceQcmACourt from '../ExerciceQcmACourt'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'

export const uuid = '3c098'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Développer une identité remarquable'
export const dateDePublication = '02/06/2026'
export const dateDeModifImportante = '22/10/2026'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora
 *
 */
export default class AutoQ4FMns2026 extends ExerciceQcmACourt {
  private appliquerLesValeurs(
    a: number,
    b: number,
    c: number,
    d: number,
    dist1: number,
    dist2: number,
    dist3: number,
  ): void {
    const sol = (d - b) / (a - c)

    // Utilisation de reduireAxPlusB pour un formatage parfait des membres
    const membreGauche = reduireAxPlusB(a, b)
    const membreDroit = reduireAxPlusB(c, d)

    this.enonce = `La solution de l'équation $${membreGauche} = ${membreDroit}$ est :`

    this.correction = `Il s'agit d'une équation du premier degré. On regroupe les termes en $x$ dans le membre de gauche et les termes constants dans le membre de droite :<br>`
    this.correction += `$\\begin{aligned} ${membreGauche} &= ${membreDroit} \\\\`

    // Utilisation de rienSi1 et ecritureAlgebrique pour les étapes intermédiaires
    this.correction += `${rienSi1(a)}x ${ecritureAlgebriqueSauf1(-c)}x &= ${d} ${ecritureAlgebrique(-b)}\\\\`

    // reduireAxPlusB gère élégamment le cas où le coefficient est 1, -1, ou autre
    this.correction += `${reduireAxPlusB(a - c, 0)} &= ${d - b} \\\\`

    if (a - c !== 1 && a - c !== -1) {
      this.correction += `x &= \\dfrac{${d - b}}{${a - c}} \\\\`
    } else if (a - c === -1) {
      // Si a - c = -1, l'étape précédente a affiché "-x = ...", on rajoute juste l'inversion des signes
      this.correction += `x &= ${-(d - b)} \\\\`
    }

    this.correction += `x &= ${miseEnEvidence(sol.toString())} \\end{aligned}$`

    this.reponses = [
      `$x = ${sol}$`,
      `$x = ${dist1}$`,
      `$x = ${dist2}$`,
      `$x = ${dist3}$`,
    ]
  }

  versionOriginale: () => void = () => {
    // Version de l'image : 7x + 4 = 5x + 6  =>  x = 1
    // Distracteurs de l'image : -1, 0, 2
    this.appliquerLesValeurs(7, 4, 5, 6, -1, 0, 2)
  }

  versionAleatoire: () => void = () => {
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }

    // [a, b, c, d, dist1, dist2, dist3]
    const donnees: [number, number, number, number, number, number, number][] =
      [
        [7, 4, 5, 6, -1, 0, 2], // 7x + 4 = 5x + 6 => x = 1
        [8, 3, 5, 12, -3, 0, 4], // 8x + 3 = 5x + 12 => x = 3
        [4, 5, 2, 13, -4, 2, 6], // 4x + 5 = 2x + 13 => x = 4
        [10, -1, 6, 7, -2, 0, 4], // 10x - 1 = 6x + 7 => x = 2
        [9, -2, 6, 7, -3, 1, 4], // 9x - 2 = 6x + 7 => x = 3
        [5, 7, 3, 15, -4, 2, 8], // 5x + 7 = 3x + 15 => x = 4
        [6, 2, 2, 10, -2, 4, 6], // 6x + 2 = 2x + 10 => x = 2
        [7, -5, 4, 4, -3, 0, 6], // 7x - 5 = 4x + 4 => x = 3
        [9, 1, 5, 9, -2, 1, 4], // 9x + 1 = 5x + 9 => x = 2
        [8, -4, 3, 11, -3, 1, 5], // 8x - 4 = 3x + 11 => x = 3
      ]

    let compteur = 0
    do {
      const [a, b, c, d, dist1, dist2, dist3] = choice(donnees)
      this.appliquerLesValeurs(a, b, c, d, dist1, dist2, dist3)
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
        /^La solution de (l'équation \$.*\$) est :\s*$/,
        (_, equation: string) => `Résoudre ${equation}.`,
      )
    // La bonne réponse du QCM est de la forme « $x = 1$ » : on ne garde que la valeur
    this.reponseCourte = () =>
      this.reponses[0].replace(/^\$x = /, '').replace(/\$$/, '')
    this.texteAvantReponseCourte = '$x=$'
    this.clavierReponseCourte = KeyboardType.clavierDeBaseAvecFraction
  }
}
