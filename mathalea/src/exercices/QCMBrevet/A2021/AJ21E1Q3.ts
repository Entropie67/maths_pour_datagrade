import { tableauColonneLigne } from '../../../lib/2d/tableau'
import { choice } from '../../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureParentheseSiNegatif,
} from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { stringNombre, texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import { nombreElementsDifferents } from '../../ExerciceQcm'
import ExerciceQcmA from '../../ExerciceQcmA'

export const uuid = '47d33'
export const refs = {
  'fr-fr': ['3A1QCM-2'],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Tableur (06/2021 Asie)'
export const dateDePublication = '09/11/2024'
/**
 *
 * @author Jean-Claude LHOTE
 * jean-claude.lhote@ac-nancy-metz.fr
 */

export default class AsieJuin21Exo1Q3 extends ExerciceQcmA {
  private appliquerLesValeurs(
    a: number,
    b: number,
    c: number,
    A1: number,
    B1: number,
  ): void {
    const A2 = a * A1 ** 2 + b * A1 + c
    const bonneReponse = a * B1 ** 2 + b * B1 + c
    const maunvaiseReponse1 = (a * B1) ** 2 + b * B1 + c
    const maunvaiseReponse2 = a * B1 * -B1 + b * B1 + c
    this.reponses = [
      `$${texNombre(bonneReponse, 0)}$`,
      `$${texNombre(maunvaiseReponse1, 0)}$`,
      `$${texNombre(maunvaiseReponse2, 0)}$`,
    ]
    this.enonce = `Dans la cellule A2 du tableur ci-dessous, on a saisi la formule $=${String(a)}\\ast \\text{A1}\\ast \\text{A1} ${ecritureAlgebrique(b)}\\ast \\text{A1} ${ecritureAlgebrique(c)}$ puis on l'a étiré vers la droite.<br>
    Quel nombre obtient-on dans la cellule B2 ?`
    const entetesLigne = ['1', '2']
    const entetesColonne = ['', 'A', 'B']
    const tabLignes = [
      stringNombre(A1, 0),
      stringNombre(B1, 0),
      stringNombre(A2, 0),
      '',
    ]
    const tableau = tableauColonneLigne(entetesColonne, entetesLigne, tabLignes)
    this.enonce += tableau
    this.correction = `La formule calcule :<br>$\\begin{aligned}
    ${String(a)}\\times ${ecritureParentheseSiNegatif(B1)}^2${ecritureAlgebrique(b)}\\times ${ecritureParentheseSiNegatif(B1)}${ecritureAlgebrique(c)}&=${String(a)}\\times ${B1 * B1}${ecritureAlgebrique(b * B1)}${ecritureAlgebrique(c)}\\\\
   &=${a * B1 * B1}${ecritureAlgebrique(b * B1)}${ecritureAlgebrique(c)}\\\\
   &=${miseEnEvidence(texNombre(bonneReponse, 0))}
   \\end{aligned}$`
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(-5, 2, -14, -4, -3)
  }

  versionAleatoire: () => void = () => {
    const n = 3
    do {
      const A1 = randint(-7, -3)
      const B1 = A1 + 1
      const a = choice([2, 3, 4, 5])
      const b = choice([2, 3, 4, 5])
      const c = randint(2, 15) * choice([-1, 1])
      this.appliquerLesValeurs(a, b, c, A1, B1)
    } while (nombreElementsDifferents(this.reponses) < n)
  }

  constructor() {
    super()
    this.versionAleatoire()
  }
}
