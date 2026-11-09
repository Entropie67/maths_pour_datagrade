import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { Arbre } from '../../../modules/arbres'
import { context } from '../../../modules/context'
import { mathalea2d } from '../../../modules/mathalea2d'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Calculer une probabilité avec un arbre'
export const interactifReady = true

export const uuid = '5e27b'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can2025N5Q30 extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.canOfficielle = true
  }

  nouvelleVersion() {
    const pA = this.canOfficielle ? 0.6 : randint(1, 8) / 10
    const pAbarre = 1 - pA
    const pBsachantA = this.canOfficielle ? 0.3 : randint(1, 8) / 10
    const pBsachantAbarre = this.canOfficielle ? 0.2 : randint(1, 8) / 10
    this.reponse = texNombre(pA * pBsachantA + (1 - pA) * pBsachantAbarre, 2)
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
          visible: true,
          alter: '',
          enfants: [
            new Arbre({
              rationnel: false,
              nom: 'B',
              proba: pBsachantA,
              visible: true,
              alter: '',
            }),
            new Arbre({
              rationnel: false,
              visible: false,
              nom: '\\overline{B}',
              proba: 1,
            }),
          ],
        }),
        new Arbre({
          rationnel: false,
          nom: '\\overline{A}~',
          proba: 1,
          visible: false,
          enfants: [
            new Arbre({
              rationnel: false,
              visible: true,
              nom: 'B',
              proba: pBsachantAbarre,
            }),
            new Arbre({
              rationnel: false,
              visible: false,
              nom: '\\overline{B}',
              proba: 1 - pBsachantAbarre,
            }),
          ],
        }),
      ],
    })

    const arbreProfCollege = `\\[\\Proba[Arbre,Angle=40,Branche=3,Rayon=0.75,Incline=false]{A/$${pA}$,$\\overline{A}$/,B
/$${pBsachantA}$,$\\overline{B}$/,B/$${pBsachantAbarre}$,$\\overline{B}$/}\\]`

    omega.setTailles() // On calcule les tailles des arbres.
    const objets = omega.represente(0, 7, 0, 2, true, 1, 6) // On crée l'arbre complet echelle 1.4 feuilles verticales sens gauche-droite
    this.question = '$A$ et $B$ sont deux événements tels que :<br>'
    this.question += context.isHtml
      ? mathalea2d(
          {
            xmin: -0.1,
            xmax: 14,
            ymin: -1,
            ymax: 7,
            display: 'inline',
            scale: 0.5,
          },
          ...objets,
        )
      : arbreProfCollege

    if (this.interactif) {
      this.question += '$P(B)=$ '
    } else {
      this.question += '$P(B)=\\ldots$ '
    }

    this.correction = `On utilise la formule des probabilités totales pour calculer $P(B)$ :<br>
              $\\begin{aligned}
              P(B)&=P(A\\cap B)+P(\\bar{A}\\cap B)\\\\
              &=${texNombre(pA, 1)}\\times ${texNombre(pBsachantA, 1)}+${texNombre(pAbarre, 1)}\\times ${texNombre(pBsachantAbarre, 1)}\\\\
    &=${miseEnEvidence(this.reponse)}
              \\end{aligned}$
          `
    /* this.canEnonce = '$A$ et $B$ sont deux événements tels que :<br>' + mathalea2d({
      xmin: -0.1,
      xmax: 14,
      ymin: 0,
      ymax: 7,
      style: 'inline',
      scale: 0.6
    }, ...objets)
*/
    // Avec ProfCollege
    this.canEnonce =
      '$A$ et $B$ sont deux événements tels que :<br>' + arbreProfCollege

    /* Avec profCollege
    this.canEnonce = '$A$ et $B$ sont deux événements tels que :<br>' +
     `\\[\\Proba[Arbre,Branche=3,Rayon=0.75,Incline=false]{A/$0,2$,$\\overline{A}$/,B
/$0,2$,$\\overline{B}$/,B/$0,2$,$\\overline{B}$/}\\]`
*/
    this.canReponseACompleter = '$P(B)=\\ldots$'
  }
}
