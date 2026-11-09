import { miseEnEvidence } from '../../lib/outils/embellissements'
import Decimal from 'decimal.js'
import { codageAngleDroit } from '../../lib/2d/CodageAngleDroit'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import type { PointAbstrait } from '../../lib/2d/PointAbstrait'
import { polygone } from '../../lib/2d/polygones'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { labelPoint, texteParPoint } from '../../lib/2d/textes'
import { texteSurSegment } from '../../lib/2d/texteSurSegment'
import { longueur } from '../../lib/2d/utilitairesGeometriques'
import { milieu, pointSurSegment } from '../../lib/2d/utilitairesPoint'
import { choice } from '../../lib/outils/arrayOutils'
import { texFractionFromString } from '../../lib/outils/deprecatedFractions'
import { creerNomDePolygone } from '../../lib/outils/outilString'
import { stringNombre, texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'
export const titre = 'Résoudre des problèmes avec le théorème de Thalès'

/**
 * Banque de problèmes utilisant le théorème de Thalès et différentes propriétés de géométrie
 * @author Rémi Angot
 */
export const uuid = 'eea67'

export const refs = {
  'fr-fr': ['3G20-1', 'BP2AutoR7', 'BP2G14'],
  'fr-ch': ['11LCGM3B-4', '11LSGM3B-4', 'PRQMG03C-7'],
}
export default class ProblemesThales extends Exercice {
  declare sup: number

  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Type de questions',
      3,
      '1 : Triangles rectangles imbriqués\n2 : Triangles dans un rectangle\n3 : Mélange',
    ]

    this.nbQuestions = 1
    this.nbQuestionsModifiable = false

    this.sup = 3
  }

  nouvelleVersion() {
    let texte = ''
    let texteCorr = ''
    const typesDeQuestions =
      this.sup === 1 || this.sup === 2 ? this.sup : choice([1, 2])
    let A: string | PointAbstrait = '',
      B: string | PointAbstrait = '',
      C: string | PointAbstrait = '',
      D: string | PointAbstrait = '',
      E: string | PointAbstrait = '',
      M,
      N,
      x = 0,
      k = 0,
      y = 0,
      p,
      codage1,
      codage2,
      codage3,
      codage4,
      sMN,
      sBD,
      sCote,
      texte1,
      texte2,
      texte3,
      texte4,
      labels,
      BC,
      BD,
      MN
    const [nomA, nomB, nomC, nomD] = creerNomDePolygone(4, ['MNQD'])
    switch (typesDeQuestions) {
      case 1:
        x = randint(6, 10)
        k = new Decimal(randint(12, 19)).div(10).toNumber()
        y = new Decimal(randint(30, 50)).div(10).toNumber()
        ;[A, B, C, D, E] = creerNomDePolygone(5, 'QD')
        texte = `On sait que $${A}${E}=${x}\\text{ cm}$ ; $${A}${D}=${texNombre(k * x, 1)}\\text{ cm}$ et $${E}${B}=${texNombre(y, 1)}\\text{ cm}$.<br>`
        texte += `Calculer la valeur exacte de $${D}${C}$.`
        if (context.isHtml) {
          // Pour le svg toutes les longueurs sont multipliées par 20
          const fig1 = `<div><svg width="450" height="300" viewBox="-40 -40 450 300" xmlns="http://www.w3.org/2000/svg">
 <polygon points="0,0 ${k * x * 20},0 ${k * x * 20},${k * y * 20} " fill="none" stroke="black" />
 <line x1="${x * 20}" y1="0" x2="${x * 20}" y2="${y * 20}" stroke="black" /> //[BE]
 <polyline points="${x * 20 - 10},0 ${x * 20 - 10},10 ${x * 20},10" fill="none" stroke="black" /> //Angle droit en E
 <polyline points="${k * x * 20 - 10},0 ${k * x * 20 - 10},10 ${k * x * 20},10" fill="none" stroke="black" /> //Angle droit en D
 <text x="-10" y="-10" text-anchor="middle" alignment-baseline="central">${A}</text>
 <text x="${x * 20}" y="-10" text-anchor="middle" alignment-baseline="central">${E}</text>
 <text x="${x * 20}" y="${y * 20 + 10}" text-anchor="middle" alignment-baseline="central">${B}</text>
 <text x="${x * k * 20 + 10}" y="-10" text-anchor="middle" alignment-baseline="central">${D}</text>
<text x="${x * k * 20 + 10}" y="${k * y * 20 + 10}" text-anchor="middle" alignment-baseline="central">${C}</text>
</svg></div>`

          const fig2 = `<div><svg width="450" height="300" viewBox="-40 -260 450 300" xmlns="http://www.w3.org/2000/svg">
 <polygon points="0,0 ${k * x * 20},0 ${k * x * 20},${-k * y * 20} " fill="none" stroke="black" />
 <line x1="${x * 20}" y1="0" x2="${x * 20}" y2="${-y * 20}" stroke="black" /> //[BE]
 <polyline points="${x * 20 - 10},0 ${x * 20 - 10},-10 ${x * 20},-10" fill="none" stroke="black" /> //Angle droit en E
 <polyline points="${k * x * 20 - 10},0 ${k * x * 20 - 10},-10 ${k * x * 20},-10" fill="none" stroke="black" /> //Angle droit en D
 <text x="-10" y="-10" text-anchor="middle" alignment-baseline="central">${A}</text>
 <text x="${x * 20}" y="10" text-anchor="middle" alignment-baseline="central">${E}</text>
 <text x="${x * 20}" y="${-y * 20 - 10}" text-anchor="middle" alignment-baseline="central">${B}</text>
 <text x="${x * k * 20 + 10}" y="10" text-anchor="middle" alignment-baseline="central">${D}</text>
 <text x="${x * k * 20 + 10}" y="${-k * y * 20 - 10}" text-anchor="middle" alignment-baseline="central">${C}</text>
</svg></div>`

          texte += choice([fig1, fig2])
        } else {
          const fig1 = `\\begin{tikzpicture}[scale=.6]
\\draw (0,0)--(${k * x},0)--(${k * x},${-k * y})--cycle;
\\draw (${x},0)--(${x},${-y});
\\draw (${x},0) rectangle ++(-.5,-.5);
\\draw (${k * x},0) rectangle ++(-.5,-.5);
\\node [above left] at (0,0) {${A}};
\\node [above] at (${x},0) {${E}};
\\node [above right] at (${k * x},0) {${D}};
\\node [below right] at (${k * x},${-k * y}) {${C}};
\\node [below] at (${x},${-y}) {${B}};
\\end{tikzpicture}`

          const fig2 = `\\begin{tikzpicture}[scale=.6]
\\draw (0,0)--(${k * x},0)--(${k * x},${k * y})--cycle;
\\draw (${x},0)--(${x},${y});
\\draw (${x},0) rectangle ++(.5,.5);
\\draw (${k * x},0) rectangle ++(.5,.5);
\\node [below left] at (0,0) {${A}};
\\node [below] at (${x},0) {${E}};
\\node [below right] at (${k * x},0) {${D}};
\\node [above right] at (${k * x},${k * y}) {${C}};
\\node [above] at (${x},${y}) {${B}};
\\end{tikzpicture}`

          texte += '<br>' + choice([fig1, fig2])
        }
        texteCorr = `Les droites $(${E}${B})$ et $(${D}${C})$ sont perpendiculaires à la même droite $(${A}${D})$, elles sont donc parallèles entre elles.`
        texteCorr += `<br>De plus les points $${A}$, $${E}$, $${D}$ et $${A}$, $${B}$, $${C}$ sont alignés dans cet ordre donc d'après le théorème de Thalès on a :`
        texteCorr += `<br><br>$\\dfrac{${A}${E}}{${A}${D}}=\\dfrac{${E}${B}}{${D}${C}}=\\dfrac{${A}${B}}{${A}${C}}$`
        texteCorr += `<br><br>$\\dfrac{${x}}{${texNombre(k * x)}}=\\dfrac{${texNombre(y)}}{${D}${C}}$`
        texteCorr += `<br><br>$${D}${C}=\\dfrac{${texNombre(k * x)}\\times${texNombre(y)}}{${x}}=${miseEnEvidence(texNombre(k * y))}$`
        break

      case 2:
        BC = randint(2, 6)
        BD = 2 * BC
        MN = new Decimal(choice([2, 3, 4])).div(10).mul(BD)
        A = pointAbstrait(0, 4, nomA, 'above')
        B = pointAbstrait(7, 4, nomB, 'above')
        C = pointAbstrait(7, 0, nomC, 'below')
        D = pointAbstrait(0, 0, nomD, 'below')
        p = polygone(A, B, C, D)
        codage1 = codageAngleDroit(D, A, B)
        codage2 = codageAngleDroit(A, B, C)
        codage3 = codageAngleDroit(B, C, D)
        codage4 = codageAngleDroit(C, D, A)
        M = pointSurSegment(A, B, longueur(A, B) / 3, 'M', 'above')
        N = pointSurSegment(A, D, longueur(A, D) / 3, 'N', 'left')
        sMN = segment(M, N)
        sBD = segment(B, D)
        sCote = segment(
          pointAbstrait(N.x - 1.3, N.y),
          pointAbstrait(D.x - 1.3, D.y),
        )
        sCote.styleExtremites = '<->'
        texte1 = texteParPoint(
          '?',
          milieu(pointAbstrait(N.x - 1.5, N.y), pointAbstrait(D.x - 1.5, D.y)),
          0,
          'black',
          1,
          'gauche',
        )
        texte2 = texteSurSegment(BD + ' cm', B, D)
        texte3 = texteSurSegment(stringNombre(MN) + ' cm', M, N)
        texte4 = texteSurSegment(BC + ' cm', B, C)

        labels = labelPoint(M, N, A, B, C, D)

        texte = `Sur la figure ci-dessous $${nomA + nomB + nomC + nomD}$ est un rectangle et $(MN)$ est parallèle à la diagonale $(${nomB + nomD})$.`
        texte += `<br>Calculer la longueur $${nomD + 'N'}$ au millimètre près.<br><br>`
        texte += mathalea2d(
          {
            xmin: -2,
            xmax: 9,
            ymin: -1.5,
            ymax: 5,
            scale: 0.8,
          },
          p,
          codage1,
          codage2,
          codage3,
          codage4,
          sMN,
          sBD,
          sCote,
          texte1,
          texte2,
          texte3,
          texte4,
          labels,
        )

        texteCorr = `Dans le triangle $${nomA + nomB + nomD}$, $M$ est un point de $[${nomA + nomB}]$, $N$ est un point de $[${nomA + nomD}]$ et $(MN)$ est parallèle à $(${nomB + nomD})$ donc d'après le théorème de Thalès on a : `
        texteCorr += `<br><br> $${texFractionFromString(nomA + 'M', nomA + nomB)}=${texFractionFromString(nomA + 'N', nomA + nomD)}=${texFractionFromString('MN', nomB + nomD)}$`
        texteCorr += `<br><br> $${texFractionFromString(nomA + 'M', nomA + nomB)}=${texFractionFromString(nomA + 'N', BC)}=${texFractionFromString(texNombre(MN, 1), BD)}$`
        texteCorr += `<br><br> $${nomA}N = ${texFractionFromString(BC + '\\times' + stringNombre(MN), BD)}=${texNombre(MN.mul(BC).div(BD), 1)}\\text{ cm}$`
        texteCorr += `<br><br> Les points $${nomA}$, $N$ et $${nomD}$ sont alignés dans cet ordre donc $N${nomD}=${nomA + nomD}-${nomA}N= ${BC}-${texNombre(MN.mul(BC).div(BD), 1)}=${miseEnEvidence(texNombre(MN.mul(-BC).div(BD).plus(BC), 1))}\\text{ cm}$.`
        break
    }

    this.listeQuestions[0] = texte
    this.listeCorrections[0] = texteCorr
    listeQuestionsToContenu(this)

    // this.besoinFormulaire2CaseACocher = ['Sans figures']
  }
}
