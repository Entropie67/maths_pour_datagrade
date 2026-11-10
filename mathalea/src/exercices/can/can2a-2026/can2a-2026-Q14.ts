import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { context } from '../../../modules/context'

import ExerciceCan from '../../ExerciceCan'

import { latex2d } from '../../../lib/2d/textes'
import { mathalea2d } from '../../../modules/mathalea2d'

import { repere } from '../../../lib/2d/reperes'
import { bleuMathalea } from '../../../lib/colors'
import { spline, type NoeudSpline } from '../../../lib/mathFonctions/Spline'
import { choice } from '../../../lib/outils/arrayOutils'
export const titre = 'Résoudre une équation graphiquement'
export const interactifReady = true

export const uuid = 'zoga9'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can2a2026Q14 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsDeComparaison = { suiteDeNombres: true }
    this.optionsChampTexte = {
      texteAvant: ' <br>',
      texteApres: '(Séparer les solutions éventuelles par un point-virgule)',
    }
  }

  enonce(antecedent?: number): void {
    if (antecedent == null) {
      antecedent = choice([-1, 0, 1])
    }

    const noeuds: NoeudSpline[] = [
      { x: -2, y: 2, deriveeGauche: 1, deriveeDroit: -0.5, isVisible: false },
      { x: -1, y: 1, deriveeGauche: -2, deriveeDroit: -2, isVisible: false },
      { x: 0, y: -1, deriveeGauche: 0, deriveeDroit: 1, isVisible: false },
      { x: 1, y: 2, deriveeGauche: 1, deriveeDroit: 1.25, isVisible: false },
      { x: 3, y: 3, deriveeGauche: 0.25, deriveeDroit: 0, isVisible: false },
    ]

    const o = latex2d('O', -0.3, -0.3, { letterSize: 'scriptsize' })
    const theSpline = spline(noeuds)

    const repere1 = repere({
      xMin: -3,
      xMax: 4,
      yMin: -2,
      yMax: 4,
      grilleX: false,
      grilleY: false,
      yLabelEcart: 0.3,
      xThickMax: 4,
      yThickMax: 4,
      grilleSecondaire: true,
      grilleSecondaireYDistance: 1,
      grilleSecondaireXDistance: 1,
      grilleSecondaireYMin: -2,
      grilleSecondaireYMax: 4.05,
      grilleSecondaireXMin: -3,
      grilleSecondaireXMax: 4.05,
    })

    const courbe1 = theSpline.courbe({
      epaisseur: 1.5,
      ajouteNoeuds: false,
      color: bleuMathalea,
    })

    const labelCourbe = latex2d('(C)', -1.7, 2.3, {
      color: bleuMathalea,
      letterSize: 'scriptsize',
    })
    const objetsEnonce = [repere1, courbe1, labelCourbe, o]

    const graphique = mathalea2d(
      {
        pixelsParCm: 40,
        scale: 0.8,
        center: !context.isHtml,
        xmin: -3,
        ymin: -2,
        xmax: 4,
        ymax: 4,
      },
      objetsEnonce,
    )

    // Trouver l'image correspondante

    this.formatChampTexte = KeyboardType.clavierEnsemble
    this.reponse = ['-2;1', '1;-2', '\\{-2,1\\}', '\\{1;-2\\}']

    this.question = "Courbe d'une fonction $f$ sur $[-2\\,;\\,3]$<br><br>"
    this.question += graphique
    this.question += '<br>Solution(s) de $f(x)=2$'

    this.correction = `Les solutions de l'équation sont les abscisses respectives des points de $\\mathscr{C}_f$ qui ont pour ordonnée $2$.<br>
    On lit que la courbe coupe la droite horizontale d'équation $y=2$ en deux points d'abscisses $-2$ et $1$.<br>
    $S=\\{${miseEnEvidence('-2;1')}\\}$`

    this.canEnonce =
      "Courbe d'une fonction $f$ sur $[-2\\,;\\,3]$<br>" + graphique
    this.canReponseACompleter = 'Solution de $f(x)=2$<br>$S=\\ldots$'
    this.canNumeroLie = 14
    this.canLiee = [13]
  }

  nouvelleVersion(): void {
    if (this.canOfficielle) this.enonce(-1)
    else this.enonce()
  }
}
