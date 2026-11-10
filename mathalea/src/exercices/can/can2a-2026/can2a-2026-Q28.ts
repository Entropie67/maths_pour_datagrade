import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
  rienSi1,
} from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import FractionEtendue from '../../../modules/FractionEtendue'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'
export const titre = 'Résoudre une équation produit-nul'
export const interactifReady = true

export const uuid = 'psts5'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can2a2026Q28 extends ExerciceCan {
  constructor() {
    super()
    this.optionsDeComparaison = {
      suiteDeNombres: true,
    }
    this.formatChampTexte = KeyboardType.clavierFullOperations
    this.optionsChampTexte = {
      texteAvant: '<br>$S=\\{$',
      texteApres:
        "$\\}$<br>(S'il y a plusieurs solutions, les écrire séparées d'un point-virgule)",
    }
  }

  enonce(a?: number, b?: number): void {
    if (a == null || b == null) {
      a = randint(2, 5)
      b = choice([1, -1])
    }

    const sol2 = new FractionEtendue(-b, a)

    this.reponse = [
      `0;${sol2.texFSD}`,
      `${sol2.texFSD};0`,
      `0;${sol2.valeurDecimale}`,
      `${sol2.valeurDecimale};0`,
    ]

    const equationTexte = `${rienSi1(a)}x^2${ecritureAlgebriqueSauf1(b)}x=0`
    const factorisationTexte = `x(${rienSi1(a)}x${ecritureAlgebrique(b)})=0`
    const equation2Texte = `${rienSi1(a)}x${ecritureAlgebrique(b)}=0`

    this.question = `Résoudre, dans $\\mathbb{R}$, l'équation : $${equationTexte}$.`

    this.correction = `$${equationTexte}$<br>
    En factorisant, on obtient une équation produit-nul  : $${factorisationTexte}$<br>
    Un produit de facteurs est nul si et seulement si l'un au moins de ses facteurs est nul.<br>
    Donc : $x=0$ ou $${equation2Texte}$.<br>
    Ainsi : $x=0$ ou $x=${a === 1 ? `${-b}` : `\\dfrac{${-b}}{${a}}`}$.<br>
    $S=\\left\\{${miseEnEvidence(`0\\,;\\,${sol2.texFSD}`)}\\right\\}$`

    this.canEnonce = `Résoudre, dans $\\mathbb{R}$, l'équation : $${equationTexte}$`
    this.canReponseACompleter = '$S=\\ldots$'

    if (this.interactif) {
      this.question += '<br>'
    }
  }

  nouvelleVersion(): void {
    if (this.canOfficielle) this.enonce(1, 1)
    else this.enonce()
  }
}
