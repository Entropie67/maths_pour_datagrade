import { codageSegments } from '../../../lib/2d/CodageSegment'
import { droite } from '../../../lib/2d/droites'
import { pointAbstrait } from '../../../lib/2d/PointAbstrait'
import { segmentAvecExtremites } from '../../../lib/2d/segmentsVecteurs'
import { latex2d } from '../../../lib/2d/textes'
import { tracePointSurDroite } from '../../../lib/2d/TracePointSurDroite'
import { milieu } from '../../../lib/2d/utilitairesPoint'
import { bleuMathalea } from '../../../lib/colors'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { context } from '../../../modules/context'
import { mathalea2d } from '../../../modules/mathalea2d'
import ExerciceCan from '../../ExerciceCan'
export const titre = 'Multiplier un entier avec un décimal'
export const interactifReady = true

export const uuid = '9rxyk'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can2a2026Q17 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierNumbers
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
    this.optionsChampTexte = { texteAvant: '$x=$', texteApres: ' $\\text{cm}$' }
  }

  enonce(
    longueurTotale?: number,
    nbSegments?: number,
    longueurFin?: number,
  ): void {
    if (longueurTotale == null || nbSegments == null || longueurFin == null) {
      const listeValeurs: [number, number, number][] = [
        [27, 2, 5], // 27 = 2x + 5
        [30, 3, 6], // 30 = 3x + 6
        [25, 2, 7], // 25 = 2x + 7
        [32, 3, 8], // 32 = 3x + 8
        [28, 2, 4], // 28 = 2x + 4
        [35, 3, 5], // 35 = 3x + 5
        [26, 2, 6], // 26 = 2x + 6
        [33, 3, 9], // 33 = 3x + 9
      ]
      const choix = choice(listeValeurs)
      longueurTotale = choix[0]
      nbSegments = choix[1]
      longueurFin = choix[2]
    }

    // Calcul de x
    const x = (longueurTotale - longueurFin) / nbSegments

    this.reponse = x

    let graphique: string

    if (context.isHtml) {
      const objets = []
      const pointsSurAB2 = []

      const A = pointAbstrait(0, 0, 'A', 'below')
      const B = pointAbstrait(16, 0, 'B', 'below')
      const A3 = pointAbstrait(0, 1, 'A1', 'below')
      const B3 = pointAbstrait(16, 1, 'A1', 'below')
      const B2 = pointAbstrait(14, 0, 'B2', 'below')
      const C = pointAbstrait(14, 0, 'C', 'below')
      const CB = segmentAvecExtremites(C, B)
      CB.styleExtremites = '|-|'
      CB.tailleExtremites = 5
      CB.epaisseur = 1.5

      const AB = segmentAvecExtremites(A, B)
      const AB2 = segmentAvecExtremites(A, B2)
      AB2.tailleExtremites = 3
      AB.tailleExtremites = 3
      AB.epaisseur = 2
      AB2.epaisseur = 1.5

      const A3B3 = segmentAvecExtremites(A3, B3)
      A3B3.styleExtremites = '<->'
      AB2.styleExtremites = '|-|'
      AB.styleExtremites = '-|'

      objets.push(AB, CB)
      const d = droite(A, B2)

      const Texte2 = latex2d(
        `${longueurTotale} \\text{ cm}`,
        milieu(A3, B3).x,
        milieu(A3, B3).y + 0.5,
        { letterSize: 'scriptsize' },
      )

      const Texte3 = latex2d(
        `${longueurFin} \\text{ cm}`,
        milieu(C, B).x,
        milieu(C, B).y - 0.6,
        { letterSize: 'scriptsize' },
      )

      for (let i = 1; i < nbSegments; i++) {
        pointsSurAB2.push(
          pointAbstrait((i * 14) / nbSegments, 0),
          pointAbstrait((i * 14) / nbSegments, 0),
        )
        const maTrace = tracePointSurDroite(pointsSurAB2[2 * (i - 1)], d)
        maTrace.taille = 1
        objets.push(tracePointSurDroite(pointsSurAB2[2 * (i - 1)], d))
      }

      for (let i = 0; i < nbSegments; i++) {
        const debut = (i * 14) / nbSegments
        const fin = ((i + 1) * 14) / nbSegments
        const milieuSegment = (debut + fin) / 2
        const TexteX = latex2d('x', milieuSegment, -0.6, {
          letterSize: 'scriptsize',
        })
        objets.push(TexteX)
      }

      objets.push(
        codageSegments('//', bleuMathalea, A, ...pointsSurAB2, B2),
        AB2,
        A3B3,
        Texte2,
        Texte3,
      )

      graphique = mathalea2d(
        {
          xmin: -1.5,
          ymin: -1.5,
          xmax: 18,
          ymax: 2,
          scale: 0.4,
          pixelsParCm: 15,
        },
        objets,
      )
    } else {
      // Version TikZ pour PDF
      const longueurSegment = 2 // cm par segment x
      const longueurTotaleDessin = nbSegments * longueurSegment + 1.5

      let tikz = '\\begin{tikzpicture}[line cap=round,line join=round]\n'
      tikz += '% Segment principal\n'
      tikz += `\\draw[line width=1.5pt] (0,0) -- (${longueurTotaleDessin},0);\n`

      // Marques verticales de séparation
      tikz += `\\draw[line width=1pt] (0,0.15) -- (0,-0.15);\n`
      for (let i = 1; i <= nbSegments; i++) {
        const pos = i * longueurSegment
        tikz += `\\draw[line width=1pt] (${pos},0.15) -- (${pos},-0.15);\n`
      }
      tikz += `\\draw[line width=1pt] (${longueurTotaleDessin},0.15) -- (${longueurTotaleDessin},-0.15);\n`

      // Codages // sur chaque segment x
      for (let i = 0; i < nbSegments; i++) {
        const posDebut = i * longueurSegment
        const posFin = (i + 1) * longueurSegment
        const posMilieu = (posDebut + posFin) / 2

        // Deux petits traits //
        tikz += `\\draw[line width=0.8pt] (${posMilieu - 0.1},-0.1) -- (${posMilieu - 0.03},0.13);\n`
        tikz += `\\draw[line width=0.8pt] (${posMilieu + 0.03},-0.1) -- (${posMilieu + 0.1},0.13);\n`
      }

      // Labels x sous chaque segment
      for (let i = 0; i < nbSegments; i++) {
        const posX = (i + 0.5) * longueurSegment
        tikz += `\\node[below] at (${posX},-0.3) {$x$};\n`
      }

      // Label longueur finale
      const posFinale = nbSegments * longueurSegment
      const posMilieuFin = (posFinale + longueurTotaleDessin) / 2
      tikz += `\\node[below] at (${posMilieuFin},-0.3) {$${longueurFin}$ cm};\n`

      // Flèche du haut avec longueur totale
      tikz += `\\draw[<->] (0,0.6) -- (${longueurTotaleDessin},0.6);\n`
      tikz += `\\node[above] at (${longueurTotaleDessin / 2},0.6) {$${longueurTotale}$ cm};\n`

      tikz += '\\end{tikzpicture}'

      graphique = tikz
    }

    this.question = graphique

    this.correction = `On a : $${nbSegments}x+${longueurFin}=${longueurTotale}$.<br>
    Ainsi, $${nbSegments}x=${longueurTotale}-${longueurFin}=${longueurTotale - longueurFin}$.<br>
    D'où : $x=\\dfrac{${longueurTotale - longueurFin}}{${nbSegments}}=${miseEnEvidence(x)}$ cm.`

    this.canEnonce = graphique
    this.canReponseACompleter = '$x=\\ldots$ cm'

    if (!this.interactif) {
      this.question += '<br>$x=\\ldots$ $\\text{cm}$'
    }
  }

  nouvelleVersion(): void {
    if (this.canOfficielle) this.enonce(27, 2, 5)
    else this.enonce()
  }
}
