import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { Arbre } from '../../../modules/arbres'
import { mathalea2d } from '../../../modules/mathalea2d'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'
export const titre = 'Calculer une probabilité avec un arbre'
export const interactifReady = true

export const uuid = '6hybs'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can1a2026Q23 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
  }

  enonce(
    pA?: number,
    pBbarreSachantA?: number,
    pBsachantAbarre?: number,
  ): void {
    if (pA == null || pBbarreSachantA == null || pBsachantAbarre == null) {
      pA = randint(1, 8) / 10
      pBbarreSachantA = randint(1, 8) / 10
      pBsachantAbarre = randint(1, 8) / 10
    }

    const pAbarre = 1 - pA
    const pBsachantA = 1 - pBbarreSachantA
    const pBbarreSachantAbarre = 1 - pBsachantAbarre
    const resultat = pA * pBbarreSachantA
    this.reponse = texNombre(resultat, 2)

    const omega = new Arbre({
      racine: true,
      rationnel: false,
      nom: '',
      proba: 1,
      visible: false,
      alter: '',
      enfants: [
        new Arbre({
          rationnel: false,
          nom: 'A~',
          proba: pA,
          visible: false,
          alter: '',
          enfants: [
            new Arbre({
              rationnel: false,
              nom: 'B',
              proba: pBsachantA,
              visible: false,
              alter: '',
            }),
            new Arbre({
              rationnel: false,
              visible: true,
              nom: '\\overline{B}',
              proba: pBbarreSachantA,
            }),
          ],
        }),
        new Arbre({
          rationnel: false,
          nom: '\\overline{A}~',
          proba: pAbarre,
          visible: true,
          enfants: [
            new Arbre({
              rationnel: false,
              visible: true,
              nom: 'B',
              proba: pBsachantAbarre,
            }),
            new Arbre({
              rationnel: false,
              visible: true,
              nom: '\\overline{B}',
              proba: pBbarreSachantAbarre,
            }),
          ],
        }),
      ],
    })
    // Cause une erreur de compilation latex et est incompatible avec Typst
    //const arbreProfCollege = `\\Proba[Arbre,Angle=30,Branche=3,Rayon=0.65,Incline=false]{A/,$\\overline{A}$/$${texNombre(pAbarre, 1)}$,B/,$\\overline{B}$/$${texNombre(pBbarreSachantA, 1)}$,B/$${texNombre(pBsachantAbarre, 1)}$,$\\overline{B}$/$${texNombre(pBbarreSachantAbarre, 1)}$}`

    omega.setTailles()
    const objets = omega.represente(0, 6, 0, 2, true, 1, 6)

    this.question = mathalea2d(
      {
        xmin: -0.1,
        xmax: 14,
        ymin: -1.5,
        ymax: 6,
        display: 'inline',
        scale: 0.5,
      },
      ...objets,
    )
    // : arbreProfCollege. ! ne foonctionne pas

    if (this.interactif) {
      this.question += '$P(A\\cap \\overline{B})=$ '
    } else {
      this.question += '$P(A\\cap \\overline{B})=\\ldots$ '
    }

    this.correction = `On commence par compléter l'arbre : $P(A)=1-${texNombre(pAbarre, 1)}=${texNombre(pA, 1)}$.<br>
    On utilise ensuite la formule : $P(A\\cap \\overline{B})=P(A)\\times P_A(\\overline{B})$.<br>
              $\\begin{aligned}
              P(A\\cap \\overline{B})&=P(A)\\times P_A(\\overline{B})\\\\
              &=${texNombre(pA, 1)}\\times ${texNombre(pBbarreSachantA, 1)}\\\\
    &=${miseEnEvidence(this.reponse)}
              \\end{aligned}$
          `
    this.canEnonce = mathalea2d(
      {
        xmin: -0.1,
        xmax: 14,
        ymin: -1.5,
        ymax: 6,
        display: 'inline',
        scale: 0.5,
      },
      ...objets,
    )
    this.canReponseACompleter = '$P(A\\cap \\overline{B})=\\ldots$'
  }

  nouvelleVersion(): void {
    if (this.canOfficielle) this.enonce(0.3, 0.4, 0.2)
    else this.enonce()
  }
}
