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

export const uuid = '242d5'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Résoudre une équation du premier degré'
export const dateDePublication = '02/06/2026'
export const dateDeModifImportante = '22/10/2026'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora
 *
 */
export default class AutoQ6ANns2026 extends ExerciceQcmACourt {
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

    this.enonce = `L'équation $${membreGauche} = ${membreDroit}$ a pour solution :`

    this.correction = `Il s'agit d'une équation du premier degré. On isole les $x$ dans le membre de gauche :<br>`
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
    // Version de l'image : 3x - 5 = x + 3  =>  x = 4
    this.appliquerLesValeurs(3, -5, 1, 3, -4, 8, 6)
  }

  versionAleatoire: () => void = () => {
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }

    // [a, b, c, d, dist1, dist2, dist3]
    const donnees: [number, number, number, number, number, number, number][] =
      [
        [3, -5, 1, 3, -4, 8, 6], // 3x - 5 = x + 3 => x = 4
        [5, 1, 2, 10, -3, 9, 5], // 5x + 1 = 2x + 10 => x = 3
        [2, 7, 5, -8, -5, -15, 3], // 2x + 7 = 5x - 8 => x = 5
        [6, -3, 2, 5, -2, 8, 4], // 6x - 3 = 2x + 5 => x = 2
        [3, 4, 1, 14, -5, 10, 6], // 3x + 4 = x + 14 => x = 5
        [7, -2, 3, 10, -3, 12, 1], // 7x - 2 = 3x + 10 => x = 3
        [4, 5, 6, -1, -3, -6, 2], // 4x + 5 = 6x - 1 => x = 3
        [5, -4, 1, 24, -7, 28, 5], // 5x - 4 = x + 24 => x = 7
        [2, -6, -1, 12, -6, 18, 4], // 2x - 6 = -x + 12 => x = 6
        [4, -7, 2, 11, -9, 18, 7], // 4x - 7 = 2x + 11 => x = 9
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
        /^L'équation \$(.*)\$ a pour solution :\s*$/,
        (_, equation: string) => `Résoudre l'équation $${equation}$.`,
      )
    // La bonne réponse du QCM est de la forme « $x = 7$ » : on ne garde que la valeur
    this.reponseCourte = () =>
      this.reponses[0].replace(/^\$x = /, '').replace(/\$$/, '')
    this.texteAvantReponseCourte = '$x=$'
    this.clavierReponseCourte = KeyboardType.clavierDeBaseAvecFraction
  }
}
