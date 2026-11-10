import { courbe } from '../../../lib/2d/Courbe'
import { fixeBordures } from '../../../lib/2d/fixeBordures'
import RepereBuilder from '../../../lib/2d/RepereBuilder'
import { latex2d } from '../../../lib/2d/textes'
import { bleuMathalea } from '../../../lib/colors'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { mathalea2d } from '../../../modules/mathalea2d'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Résoudre graphiquement une inéquation'
export const interactifReady = true

export const uuid = 'efdaf'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class ResoudreGraphiqumentInequation extends ExerciceSimple {
  constructor() {
    super()

    this.canOfficielle = true
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierEnsemble
    this.optionsChampTexte = { texteAvant: '$S=\\{$', texteApres: '$\\}$' }
  }

  nouvelleVersion() {
    let f1, f2
    if (this.canOfficielle) {
      f1 = function (x: number) {
        // fonction dérivée
        return 0.83 * x ** 2 - 1.5 * x - 1.33
      }
      f2 = function (x: number) {
        // fonction
        return (
          -0.0048 * x ** 5 +
          0.083 * x ** 4 +
          0.024 * x ** 3 -
          1.0833 * x ** 2 -
          0.019 * x +
          2.0
        )
      }
    } else {
      f1 = function (x: number) {
        // fonction dérivée
        return 0.83 * x ** 2 - 1.5 * x - 1.33
      }
      f2 = function (x: number) {
        // fonction
        return (
          -0.0048 * x ** 5 +
          0.083 * x ** 4 +
          0.024 * x ** 3 -
          1.0833 * x ** 2 -
          0.019 * x +
          2.0
        )
      }
    }
    const o = latex2d('\\text{O}', -0.3, -0.3, {
      color: 'black',
      letterSize: 'scriptsize',
    })
    const r1 = new RepereBuilder({ xMin: -2.5, xMax: 3.5, yMin: -3, yMax: 2.5 })
      .setUniteX(1.5)
      .setUniteY(1.5)
      .setLabelX({ xMin: -2.5, xMax: 2.5, dx: 1 })
      .setLabelY({ yMin: -3, yMax: 4, dy: 1 })
      .setGrille({
        grilleX: { dx: 1, xMin: -2.5, xMax: 2.5 },
        grilleY: { dy: 1, yMin: -3, yMax: 3 },
      })
      .setThickX({ xMin: -3, xMax: 3, dx: 1.5 })
      .setThickY({ yMin: -3, yMax: 3, dy: 1.5 })
      .buildStandard()
    const courbef1 = latex2d('\\mathscr{C}_g', 2.5, 2.7, {
      color: bleuMathalea,
    })
    const courbef2 = latex2d('\\mathscr{C}_f', -1.7, -1.8, { color: 'red' })
    const objets1 = [
      r1,
      o,
      courbef1,
      courbef2,
      courbe(f1, { repere: r1, color: bleuMathalea, epaisseur: 2 }),
      courbe(f2, { repere: r1, color: 'red', epaisseur: 2 }),
    ]
    const colonne1 = mathalea2d(
      Object.assign({ scale: 0.6 }, fixeBordures(objets1)),
      objets1,
    )
    this.question = `Courbes de deux fonctions $f$ et $g$<br>${colonne1}\n
    Solutions de $f(x)=g(x)$`
    if (this.interactif) {
      this.question += '<br>'
    }
    this.correction = `Les solutions sont les abscisses respectives des points d'intersection entre les deux courbes :
   $S=\\{${miseEnEvidence('-1\\,;\\,2')}\\}$. `

    this.reponse = ['-1;2', '2;-1', '\\{-1;2\\}', '\\{2;-1\\}']
    this.canEnonce = `Courbes de deux fonctions $f$ et $g$ <br>${colonne1}`
    this.canReponseACompleter = 'Solutions de $f(x)=g(x)$<br>$\\dots$'
    this.canNumeroLie = 15
    this.canLiee = [14, 13]
  }
}
