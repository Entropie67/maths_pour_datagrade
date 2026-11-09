import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { Arbre } from '../../../modules/arbres'
import { mathalea2d } from '../../../modules/mathalea2d'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'
export const titre = "Calculer la probabilité d'une intersection"
export const interactifReady = true

export const uuid = 'lnpec'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can1a2022Q28 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierNumbers
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
  }

  enonce(pA?: number, pBsachantA?: number, pBsachantAbarre?: number) {
    if (pA == null || pBsachantA == null || pBsachantAbarre == null) {
      pA = randint(1, 9, 5) / 10
      pBsachantA = randint(1, 9, 5) / 10
      pBsachantAbarre = randint(1, 9, 5) / 10
    }

    const pAbarre = 1 - pA
    const pBbarresachantAbarre = 1 - pBsachantAbarre
    const reponse = pAbarre * pBbarresachantAbarre

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
          nom: 'A',
          proba: 1,
          visible: false,
          alter: '',
          enfants: [
            new Arbre({ rationnel: false, nom: 'B', proba: pBsachantA }),
            new Arbre({
              rationnel: false,
              nom: '\\overline{B}',
              visible: false,
              alter: '',
            }),
          ],
        }),
        new Arbre({
          rationnel: false,
          nom: '\\overline{A}',
          proba: pAbarre,
          enfants: [
            new Arbre({ rationnel: false, nom: 'B', proba: pBsachantAbarre }),
            new Arbre({
              rationnel: false,
              nom: '\\overline{B}',
              visible: false,
              alter: '',
            }),
          ],
        }),
      ],
    })

    omega.setTailles()
    const objets = omega.represente(0, 7, 0, 1.5, true, 1, 1)

    this.question = 'Soient $A$ et $B$ deux évènements tels que :<br>'
    this.question += mathalea2d(
      { xmin: -0.1, xmax: 14, ymin: 0, ymax: 7, display: 'inline', scale: 0.8 },
      ...objets,
    )

    if (this.interactif) {
      this.optionsChampTexte = {
        texteAvant: '<br>$P(\\overline{A}\\cap \\overline{B})=$',
      }
    } else {
      this.question += '<br>$P(\\overline{A}\\cap \\overline{B})=\\ldots$'
    }

    this.correction = `$P(\\overline{A}\\cap \\overline{B})=P(\\overline{A})\\times P_{\\overline{A}}(\\overline{B})$.<br>
$P(\\overline{A})=${texNombre(pAbarre, 1)}$.<br>
$P_{\\overline{A}}(\\overline{B})=1-${texNombre(pBsachantAbarre, 1)}=${texNombre(pBbarresachantAbarre, 1)}$.<br>
Ainsi, $P(\\overline{A}\\cap \\overline{B})=${texNombre(pAbarre, 1)}\\times ${texNombre(pBbarresachantAbarre, 1)}=${miseEnEvidence(texNombre(reponse, 2))}$.`
    this.reponse = reponse.toFixed(2)
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(0.7, 0.8, 0.5)
    else this.enonce()
  }
}
