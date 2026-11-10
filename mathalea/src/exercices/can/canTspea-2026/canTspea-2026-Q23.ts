import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { Arbre } from '../../../modules/arbres'
import { context } from '../../../modules/context'
import { mathalea2d } from '../../../modules/mathalea2d'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'
export const titre = 'Calculer une probabilité avec un arbre'
export const interactifReady = true

export const uuid = 'yxwti'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/ export default class Can2026TermQ23 extends ExerciceCan {
  enonce(pA?: number, pAInterB?: number): void {
    if (pA == null || pAInterB == null) {
      // pA entre 0.2 et 0.8 pour que pAbarre ne soit pas nul
      pA = randint(2, 8) / 10
      // On choisit pAsachantB pour que pA * pAsachantB soit simple (ex: 0.2, 0.3...)
      const pBsachantA = randint(2, 5) / 10
      pAInterB = Number((pA * pBsachantA).toFixed(2))
    }

    const pAbarre = Number((1 - pA).toFixed(1))
    const pBsachantA = Number((pAInterB / pA).toFixed(2))

    this.reponse = texNombre(pBsachantA, 2)
    this.formatChampTexte = KeyboardType.clavierDeBase

    this.formatChampTexte = KeyboardType.clavierDeBase
    const arbreProfCollege = `\\Proba[Arbre,Angle=30,Branche=3,Rayon=0.65,Incline=false]{A/,$\\overline{A}$/{$${texNombre(pAbarre, 1)}$},B/,$\\overline{B}$/,B/,$\\overline{B}$/}`

    const omega = new Arbre({
      racine: true,
      enfants: [
        new Arbre({
          nom: 'A',
          visible: false,
          enfants: [
            new Arbre({ nom: 'B', visible: false }),
            new Arbre({ nom: '\\overline{B}', visible: false }),
          ],
        }),
        new Arbre({
          nom: '\\overline{A}',
          proba: pAbarre,
          rationnel: false,
          visible: true,
          enfants: [
            new Arbre({ nom: 'B', visible: false }),
            new Arbre({ nom: '\\overline{B}', visible: false }),
          ],
        }),
      ],
    })
    omega.setTailles()
    const objets = omega.represente(0, 6, 0, 2, true, 1, 6)

    this.question = `On donne $P(A \\cap B) = ${texNombre(pAInterB, 2)}$.<br>Calculer $P_A(B)$.<br>`
    this.question += context.isHtml
      ? mathalea2d(
          {
            xmin: -0.1,
            xmax: 14,
            ymin: -1,
            ymax: 6,
            display: 'inline',
            scale: 0.5,
          },
          ...objets,
        )
      : arbreProfCollege

    if (this.interactif) {
      this.question += '<br>$P_A(B) = $'
    } else {
      this.question += '<br>$P_A(B) = \\dots$'
    }

    this.correction = `On commence par compléter l'arbre : $P(A) = 1 - P(\\overline{A}) = 1 - ${texNombre(pAbarre, 1)} = ${texNombre(pA, 1)}$.<br>
    On utilise la formule : $P(A \\cap B) = P(A) \\times P_A(B)$.<br>
    $\\begin{aligned}
    P_A(B) &= \\dfrac{P(A \\cap B)}{P(A)} \\\\
    &= \\dfrac{${texNombre(pAInterB, 2)}}{${texNombre(pA, 1)}} \\\\
    &= ${miseEnEvidence(this.reponse)}
    \\end{aligned}$`

    this.canEnonce =
      `On donne $P(A \\cap B) = ${texNombre(pAInterB, 2)}$.<br>` +
      arbreProfCollege
    this.canReponseACompleter = `$P_A(B) = \\dots$`
  }

  nouvelleVersion(): void {
    if (this.canOfficielle) this.enonce(0.6, 0.12)
    else this.enonce()
  }
}
