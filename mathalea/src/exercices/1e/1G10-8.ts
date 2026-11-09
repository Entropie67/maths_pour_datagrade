import { afficheLongueurSegment } from '../../lib/2d/afficheLongueurSegment'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { polygoneAvecNom } from '../../lib/2d/polygones'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { latex2d } from '../../lib/2d/textes'
import { createList } from '../../lib/format/lists'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { ecritureParentheseSiNegatif } from '../../lib/outils/ecritures'
import { context } from '../../modules/context'
import FractionEtendue from '../../modules/FractionEtendue'
import { mathalea2d } from '../../modules/mathalea2d'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'
export const titre = "Utiliser le produit scalaire pour montrer l'orthogonalité"
export const dateDePublication = '29/04/2025'

/**
 *
 * @author Gilles Mora

 */
export const uuid = 'ec888'

export const refs = {
  'fr-fr': ['1G10-8'],
  'fr-ch': ['3G95-8'],
}

export default class UtiliserProduitScalaire extends Exercice {
  constructor() {
    super()
    // Déclaré explicitement pour le contrôle des corrections minimales : démonstration d'orthogonalité : pas de réponse courte.
    this.reponseCourteDisponible = false
    this.nbQuestions = 1
    // this.nbQuestionsModifiable= false
    this.sup = 5
    this.spacing = 2
    this.besoinFormulaireTexte = [
      'Type de questions',
      [
        'Nombres séparés par des tirets :',
        '1 : Montrer que deux droites sont perpendiculaires',
        "2 : Montrer qu'un triangle est rectangle",
        '3 : Montrer que deux droites sont perpendiculaires dans un rectangle',
        '4 : Montrer que deux droites sont perpendiculaires dans un rectangle (avec un repère)',
        '5 : Mélange',
      ].join('\n'),
    ]
  }

  nouvelleVersion() {
    const typesDeQuestionsDisponibles = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 4,
      melange: 5,
      defaut: 5,
      nbQuestions: this.nbQuestions,
    })
    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )

    // Tous les types de questions sont posées mais l'ordre diffère à chaque "cycle"

    for (
      let i = 0,
        texte,
        texteCorr,
        objets,
        nomA,
        nomB,
        nomC,
        nomD,
        nomE,
        nomF,
        AE,
        AF,
        BE,
        CF,
        listeLong,
        long,
        l1,
        l2,
        lE,
        lF,
        xA,
        xB,
        xC,
        xD,
        dx,
        dy,
        yA,
        yB,
        yC,
        yD,
        A,
        B,
        C,
        D,
        E,
        F,
        poly,
        seg1,
        seg2,
        indiceFirstLetter,
        listeValeurs,
        val,
        cpt = 0;
      i < this.nbQuestions && cpt < 50;

    ) {
      indiceFirstLetter = randint(65, 75)
      nomA = String.fromCharCode(indiceFirstLetter)
      nomB = String.fromCharCode(indiceFirstLetter + 1)
      nomC = String.fromCharCode(indiceFirstLetter + 2)
      nomD = String.fromCharCode(indiceFirstLetter + 3)
      nomE = String.fromCharCode(indiceFirstLetter + 4)
      nomF = String.fromCharCode(indiceFirstLetter + 5)
      listeValeurs = [
        [3, 4, 2, 6],
        [-3, 4, 2, -6],
        [2, 6, 12, 1],
        [2, 9, 3, 6],
        [2, 3, 1, 6],
        [2, -9, 3, -6],
        [6, 5, 10, 3],
        [6, -5, -10, 3],
        [-5, 6, -3, 10],
        [2, -12, -6, 4],
        [3, -8, -6, 4],
        [2, 12, 1, 24],
        [2, -12, -8, 3],
        [3, 3, 1, 9],
        [3, -3, 1, -9],
        [3, 3, 1, 9],
        [2, 8, 4, 4],
        [-4, 4, -8, 2],
        [7, 4, 14, 2],
        [-14, 2, -7, 4],
      ] //
      val = choice(listeValeurs)
      switch (
        listeTypeDeQuestions[i] // listeTypeDeQuestions[i]
      ) {
        case 1: //
          switch (randint(1, 2)) {
            case 1:
              xA = randint(-10, 10)
              yA = randint(-10, 10)
              xB = randint(-10, 10, xA)
              yB = randint(-10, 10)
              xC = randint(-10, 10, [xA, xB])
              yC = randint(-10, 10)
              dx = xB - xA
              dy = yB - yA
              xD = xC - dy
              yD = yC + dx
              break
            case 2:
            default:
              xA = randint(-10, 10)
              yA = randint(-10, 10)
              xB = xA + val[0]
              yB = yA + val[2]
              xC = randint(-10, 10)
              yC = randint(-10, 10)
              xD = xC + val[1]
              yD = -val[3] + yC
              break
          }
          texte = `Dans un repère orthonormé, on considère les points $${nomA}(${xA}\\,;\\,${yA})$, $${nomB}(${xB}\\,;\\,${yB})$, $${nomC}(${xC}\\,;\\,${yC})$ et $${nomD}(${xD}\\,;\\,${yD})$.<br>
          Montrer que les droites $(${nomA}${nomB})$ et $(${nomC}${nomD})$ sont perpendiculaires.`
          texteCorr = `On commence par calculer les coordonnées des vecteurs $\\overrightarrow{${nomA}${nomB}}$ et $\\overrightarrow{${nomC}${nomD}}$.<br>
         $\\overrightarrow{${nomA}${nomB}}\\begin{pmatrix}${xB}-${ecritureParentheseSiNegatif(xA)}\\\\${yB}-${ecritureParentheseSiNegatif(yA)}\\end{pmatrix}$,
           soit $\\overrightarrow{${nomA}${nomB}}\\begin{pmatrix}${xB - xA}\\\\${yB - yA}\\end{pmatrix}$.<br><br>
         $\\overrightarrow{${nomC}${nomD}}\\begin{pmatrix}${xD}-${ecritureParentheseSiNegatif(xC)}\\\\${yD}-${ecritureParentheseSiNegatif(yC)}\\end{pmatrix}$,
           soit $\\overrightarrow{${nomC}${nomD}}\\begin{pmatrix}${xD - xC}\\\\${yD - yC}\\end{pmatrix}$.<br><br>
          Ainsi, $\\overrightarrow{${nomA}${nomB}}\\cdot \\overrightarrow{${nomC}${nomD}}
          =${xB - xA}\\times ${ecritureParentheseSiNegatif(xD - xC)}
         +${ecritureParentheseSiNegatif(yB - yA)}\\times${ecritureParentheseSiNegatif(yD - yC)}
          =${(xB - xA) * (xD - xC) + (yB - yA) * (yD - yC)}$<br>
          Comme $\\overrightarrow{${nomA}${nomB}}\\cdot \\overrightarrow{${nomC}${nomD}}=0$, on en déduit que les vecteurs $\\overrightarrow{${nomA}${nomB}}$ et $\\overrightarrow{${nomC}${nomD}}$ sont orthogonaux et donc que les droites $(${nomA}${nomB})$ et $(${nomC}${nomD})$ sont perpendiculaires.`
          break

        case 2: //
          nomC = nomA
          switch (randint(1, 2)) {
            case 1:
              xA = randint(-10, 10)
              yA = randint(-10, 10)
              xB = randint(-10, 10, xA)
              yB = randint(-10, 10)
              xC = xA
              yC = yA
              dx = xB - xA
              dy = yB - yA
              xD = xC - dy
              yD = yC + dx
              break
            case 2:
            default:
              xA = randint(-10, 10)
              yA = randint(-10, 10)
              xB = xA + val[0]
              yB = yA + val[2]
              xC = xA
              yC = yA
              xD = xC + val[1]
              yD = -val[3] + yC
              break
          }
          texte = `Dans un repère orthonormé, on considère les points $${nomA}(${xA}\\,;\\,${yA})$, $${nomB}(${xB}\\,;\\,${yB})$ et $${nomD}(${xD}\\,;\\,${yD})$.<br>
        Montrer que le triangle $${nomA}${nomB}${nomD}$ est rectangle en $${nomA}$.`
          texteCorr = `On commence par calculer les coordonnées des vecteurs $\\overrightarrow{${nomA}${nomB}}$ et $\\overrightarrow{${nomA}${nomD}}$.<br>
       $\\overrightarrow{${nomA}${nomB}}\\begin{pmatrix}${xB}-${ecritureParentheseSiNegatif(xA)}\\\\${yB}-${ecritureParentheseSiNegatif(yA)}\\end{pmatrix}$,
         soit $\\overrightarrow{${nomA}${nomB}}\\begin{pmatrix}${xB - xA}\\\\${yB - yA}\\end{pmatrix}$.<br><br>
       $\\overrightarrow{${nomC}${nomD}}\\begin{pmatrix}${xD}-${ecritureParentheseSiNegatif(xC)}\\\\${yD}-${ecritureParentheseSiNegatif(yC)}\\end{pmatrix}$,
         soit $\\overrightarrow{${nomC}${nomD}}\\begin{pmatrix}${xD - xC}\\\\${yD - yC}\\end{pmatrix}$.<br><br>
        Ainsi, $\\overrightarrow{${nomA}${nomB}}\\cdot \\overrightarrow{${nomC}${nomD}}
        =${xB - xA}\\times ${ecritureParentheseSiNegatif(xD - xC)}
       +${ecritureParentheseSiNegatif(yB - yA)}\\times${ecritureParentheseSiNegatif(yD - yC)}
        =${(xB - xA) * (xD - xC) + (yB - yA) * (yD - yC)}$<br>
        Comme $\\overrightarrow{${nomA}${nomB}}\\cdot \\overrightarrow{${nomC}${nomD}}=0$, on en déduit que les vecteurs $\\overrightarrow{${nomA}${nomB}}$ et $\\overrightarrow{${nomC}${nomD}}$ sont orthogonaux et donc que le triangle $${nomA}${nomB}${nomD}$ est rectangle en $${nomA}$.`
          break

        case 3:
          switch (randint(1, 2)) {
            case 1:
              objets = []
              listeLong = [
                [12, 4, 1, 1],
                [6, 4, 1, 2],
                [15, 5, 2, 1],
                [6, 3, 1, 1],
                [8, 4, 2, 1],
                [12, 6, 2, 2],
                [14, 7, 3, 2],
              ] // AB, AD, AE, AF,
              long = choice(listeLong)
              yC = long[1]
              xB = long[0]
              AE = new FractionEtendue(long[2], long[1]).simplifie()
              AF = new FractionEtendue(long[3], long[0]).simplifie()
              A = pointAbstrait(0, 0, nomA)
              B = pointAbstrait(xB, 0, nomB)
              C = pointAbstrait(xB, yC, nomC)
              D = pointAbstrait(0, yC, nomD)
              E = pointAbstrait(0, long[2], nomE)
              F = pointAbstrait(long[3], 0, nomF)
              seg1 = segment(E, C)
              seg2 = segment(D, F)
              l1 = afficheLongueurSegment(C, B, 'black', 0.5, '', true)
              l2 = afficheLongueurSegment(D, C, 'black', 0.5, '', true)
              lE = latex2d(`${nomE}`, -0.5, long[2], {
                letterSize: 'normalsize',
              })
              lF = latex2d(`${nomF}`, long[3], -0.5, {
                letterSize: 'normalsize',
              })
              poly = polygoneAvecNom(A, B, C, D)
              objets.push(poly, seg1, seg2, lE, lF, l1, l2)
              texte =
                `Dans un rectangle $${nomA}${nomB}${nomC}${nomD}$ de longueur $${long[0]}$ et de largeur $${long[1]}$, on considère les points $${nomE}$ et $${nomF}$ tels que :<br>
              $\\overrightarrow{${nomA}${nomE}}=${AE.texFraction}\\overrightarrow{${nomA}${nomD}}$ et $\\overrightarrow{${nomA}${nomF}}=${AF.texFraction}\\overrightarrow{${nomA}${nomB}}$.<br>
              Montrer que les droites $(${nomE}${nomC})$ et $(${nomD}${nomF})$ sont perpendiculaires.<br>` +
                mathalea2d(
                  Object.assign(
                    { scale: 0.7, pixelsParCm: 25, display: 'inline' } as const,
                    fixeBordures(objets),
                  ),
                  objets,
                )
              texteCorr =
                `D'une part, $\\overrightarrow{${nomE}${nomC}}= \\overrightarrow{${nomE}${nomD}}+ \\overrightarrow{${nomD}${nomC}}$.<br>
              D'autre part, $\\overrightarrow{${nomD}${nomF}}= \\overrightarrow{${nomD}${nomA}}+ \\overrightarrow{${nomA}${nomF}}$.<br>
              Ainsi : <br>$\\begin{aligned}
              \\overrightarrow{${nomE}${nomC}}\\cdot \\overrightarrow{${nomD}${nomF}}&=(\\overrightarrow{${nomE}${nomD}}+ \\overrightarrow{${nomD}${nomC}})\\cdot (\\overrightarrow{${nomD}${nomA}}+ \\overrightarrow{${nomA}${nomF}})\\\\
              &=\\underbrace{\\overrightarrow{${nomE}${nomD}}\\cdot \\overrightarrow{${nomD}${nomA}}}_{=-${nomE}${nomD}\\times ${nomD}${nomA}}+\\underbrace{\\overrightarrow{${nomE}${nomD}}\\cdot\\overrightarrow{${nomA}${nomF}}}_{=0}+ \\underbrace{\\overrightarrow{${nomD}${nomC}}\\cdot \\overrightarrow{${nomD}${nomA}}}_{=0}+ \\underbrace{\\overrightarrow{${nomD}${nomC}}\\cdot \\overrightarrow{${nomA}${nomF}}}_{=${nomD}${nomC}\\times ${nomA}${nomF}}
              \\end{aligned}$<br><br>
              Justifications : ` +
                createList({
                  items: [
                    `$\\overrightarrow{${nomE}${nomD}}\\cdot \\overrightarrow{${nomD}${nomA}}=-${nomE}${nomD}\\times ${nomD}${nomA}$ car les vecteurs $\\overrightarrow{${nomE}${nomD}}$ et $\\overrightarrow{${nomD}${nomA}}$ sont colinéaires de sens contraires.`,
                    `$\\overrightarrow{${nomE}${nomD}}\\cdot\\overrightarrow{${nomA}${nomF}}=0$ car $\\overrightarrow{${nomE}${nomD}}\\perp \\overrightarrow{${nomA}${nomF}}$.`,
                    `$\\overrightarrow{${nomD}${nomC}}\\cdot\\overrightarrow{${nomD}${nomA}}=0$ car $\\overrightarrow{${nomD}${nomC}}\\perp \\overrightarrow{${nomD}${nomA}}$.`,
                    `$\\overrightarrow{${nomD}${nomC}}\\cdot \\overrightarrow{${nomA}${nomF}}=${nomD}${nomC}\\times ${nomA}${nomF}$ car les vecteurs $\\overrightarrow{${nomD}${nomC}}$ et $\\overrightarrow{${nomA}${nomF}}$ sont colinéaires de même sens.<br>`,
                  ],
                  style: 'fleches',
                }) +
                `${context.isHtml ? '<br>' : ''}Comme : <br>
                $${nomE}${nomD} = ${long[1]}-${AE.texFraction}\\times ${long[1]} =${long[1] - long[2]}$ et $${nomA}${nomF} = ${AF.texFraction}\\times ${long[0]} =${long[3]}$, on obtient :<br>
               
              $\\begin{aligned}
              \\overrightarrow{${nomE}${nomC}}\\cdot \\overrightarrow{${nomD}${nomF}}&=-${long[1]}\\times ${long[1] - long[2]}+${long[0]}\\times ${long[3]}\\\\
              &=0
              \\end{aligned}$<br> 
               Comme $\\overrightarrow{${nomE}${nomC}}\\cdot \\overrightarrow{${nomD}${nomF}}=0$, on en déduit que les vecteurs $\\overrightarrow{${nomE}${nomC}}$ et $\\overrightarrow{${nomD}${nomF}}$ sont orthogonaux et donc que les droites $(${nomE}${nomC})$ et $(${nomD}${nomF})$ sont perpendiculaires.`
              break
            case 2:
            default:
              objets = []
              listeLong = [
                [9, 6, 3, 2],
                [12, 4, 3, 1],
                [8, 4, 2, 1],
                [10, 5, 4, 2],
                [6, 4, 3, 2],
                [12, 8, 6, 4],
                [9, 6, 3, 2],
              ] // AB, AD, BE, CF,
              long = choice(listeLong)
              yC = long[1]
              xB = long[0]
              BE = new FractionEtendue(long[2], long[1]).simplifie()
              CF = new FractionEtendue(long[3], long[0]).simplifie()
              A = pointAbstrait(0, 0, nomA)
              B = pointAbstrait(xB, 0, nomB)
              C = pointAbstrait(xB, yC, nomC)
              D = pointAbstrait(0, yC, nomD)
              E = pointAbstrait(xB, long[2], nomE)
              F = pointAbstrait(long[0] - long[3], yC, nomF)
              seg1 = segment(E, A)
              seg2 = segment(B, F)
              l1 = afficheLongueurSegment(B, A, 'black', 0.5, '', true)
              l2 = afficheLongueurSegment(A, D, 'black', 0.5, '', true)
              lE = latex2d(`${nomE}`, long[0] + 0.5, long[2], {
                letterSize: 'normalsize',
              })
              lF = latex2d(`${nomF}`, long[0] - long[3], long[1] + 0.5, {
                letterSize: 'normalsize',
              })
              poly = polygoneAvecNom(A, B, C, D)
              objets.push(poly, seg1, seg2, lE, lF, l1, l2)
              texte =
                `Dans un rectangle $${nomA}${nomB}${nomC}${nomD}$ de longueur $${long[0]}$ et de largeur $${long[1]}$, on considère les points $${nomE}$ et $${nomF}$ tels que :<br>
             $\\overrightarrow{${nomB}${nomE}}=${BE.texFraction}\\overrightarrow{${nomB}${nomC}}$ et $\\overrightarrow{${nomC}${nomF}}=${CF.texFraction}\\overrightarrow{${nomC}${nomD}}$.<br>
              Montrer que les droites $(${nomA}${nomE})$ et $(${nomB}${nomF})$ sont perpendiculaires.<br>` +
                mathalea2d(
                  Object.assign(
                    { scale: 0.7, pixelsParCm: 25, display: 'inline' } as const,
                    fixeBordures(objets),
                  ),
                  objets,
                )
              texteCorr =
                `D'une part, $\\overrightarrow{${nomA}${nomE}}= \\overrightarrow{${nomA}${nomB}}+ \\overrightarrow{${nomB}${nomE}}$.<br>
              D'autre part, $\\overrightarrow{${nomB}${nomF}}= \\overrightarrow{${nomB}${nomC}}+ \\overrightarrow{${nomC}${nomF}}$.<br><br>
              Ainsi : <br>$\\begin{aligned}
              \\overrightarrow{${nomA}${nomE}}\\cdot \\overrightarrow{${nomB}${nomF}}&=(\\overrightarrow{${nomA}${nomB}}+ \\overrightarrow{${nomB}${nomE}})\\cdot (\\overrightarrow{${nomB}${nomC}}+ \\overrightarrow{${nomC}${nomF}})\\\\
              &=\\underbrace{\\overrightarrow{${nomA}${nomB}}\\cdot \\overrightarrow{${nomB}${nomC}}}_{=0}
              +\\underbrace{\\overrightarrow{${nomA}${nomB}}\\cdot\\overrightarrow{${nomC}${nomF}}}_{-${nomA}${nomB}\\times ${nomC}${nomF}}
              + \\underbrace{\\overrightarrow{${nomB}${nomE}}\\cdot \\overrightarrow{${nomB}${nomC}}}_{${nomB}${nomE}\\times ${nomB}${nomC}}
              + \\underbrace{\\overrightarrow{${nomB}${nomE}}\\cdot \\overrightarrow{${nomC}${nomF}}}_{=0}
              \\end{aligned}$<br><br>
              Justifications : ` +
                createList({
                  items: [
                    `$\\overrightarrow{${nomA}${nomB}}\\cdot \\overrightarrow{${nomB}${nomC}}=0$ car $\\overrightarrow{${nomA}${nomB}}\\perp \\overrightarrow{${nomB}${nomC}}$.`,
                    `$\\overrightarrow{${nomA}${nomB}}\\cdot\\overrightarrow{${nomC}${nomF}}=-${nomA}${nomB}\\times ${nomC}${nomF}$ car les vecteurs $\\overrightarrow{${nomA}${nomB}}$ et $\\overrightarrow{${nomC}${nomF}}$ sont colinéaires de sens contraires.`,
                    `$\\overrightarrow{${nomB}${nomE}}\\cdot \\overrightarrow{${nomB}${nomC}}=${nomB}${nomE}\\times ${nomB}${nomC}$ car les vecteurs $\\overrightarrow{${nomB}${nomE}}$ et $\\overrightarrow{${nomB}${nomC}}$ sont colinéaires de même sens.`,
                    `$\\overrightarrow{${nomB}${nomE}}\\cdot \\overrightarrow{${nomC}${nomF}}=0$ car $\\overrightarrow{${nomB}${nomE}}\\perp \\overrightarrow{${nomC}${nomF}}$.
                                     `,
                  ],
                  style: 'fleches',
                }) +
                `${context.isHtml ? '<br>' : ''}Comme : <br>
              $${nomC}${nomF} = ${CF.texFraction}\\times ${long[0]} =${long[3]}$ et $${nomB}${nomE} = ${BE.texFraction}\\times ${long[1]} =${long[2]}$, on obtient :<br>
               
              $\\begin{aligned}
               \\overrightarrow{${nomA}${nomE}}\\cdot \\overrightarrow{${nomB}${nomF}} &=-${nomA}${nomB}\\times ${nomC}${nomF}+${nomB}${nomE}\\times ${nomB}${nomC}\\\\
               &=-${long[0]}\\times ${long[3]}+${long[2]}\\times ${long[1]}\\\\
              &=0
              \\end{aligned}$<br> 
             Comme $\\overrightarrow{${nomA}${nomE}}\\cdot \\overrightarrow{${nomB}${nomF}}=0$, on en déduit que les vecteurs $\\overrightarrow{${nomA}${nomE}}$ et $\\overrightarrow{${nomB}${nomF}}$ sont orthogonaux et donc que les droites $(${nomA}${nomE})$ et $(${nomB}${nomF})$ sont perpendiculaires.`
              break
          }
          break

        case 4:
        default:
          switch (randint(1,2)) {
            case 1:
              objets = []
              listeLong = [
                [12, 4, 1, 1],
                [6, 4, 1, 2],
                [15, 5, 2, 1],
                [6, 3, 1, 1],
                [8, 4, 2, 1],
                [12, 6, 2, 2],
                [14, 7, 3, 2],
              ] // AB, AD, AE, AF,
              long = choice(listeLong)
              yC = long[1]
              xB = long[0]
              AE = new FractionEtendue(long[2], long[1]).simplifie()
              AF = new FractionEtendue(long[3], long[0]).simplifie()
              A = pointAbstrait(0, 0, nomA)
              B = pointAbstrait(xB, 0, nomB)
              C = pointAbstrait(xB, yC, nomC)
              D = pointAbstrait(0, yC, nomD)
              E = pointAbstrait(0, long[2], nomE)
              F = pointAbstrait(long[3], 0, nomF)
              seg1 = segment(E, C)
              seg2 = segment(D, F)
              l1 = afficheLongueurSegment(C, B, 'black', 0.5, '', true)
              l2 = afficheLongueurSegment(D, C, 'black', 0.5, '', true)
              lE = latex2d(`${nomE}`, -0.5, long[2], {
                letterSize: 'normalsize',
              })
              lF = latex2d(`${nomF}`, long[3], -0.5, {
                letterSize: 'normalsize',
              })
              poly = polygoneAvecNom(A, B, C, D)
              objets.push(poly, seg1, seg2, lE, lF, l1, l2)
              texte =
                `Dans un rectangle $${nomA}${nomB}${nomC}${nomD}$ de longueur $${long[0]}$ et de largeur $${long[1]}$, on considère les points $${nomE}$ et $${nomF}$ tels que :<br>
                $\\overrightarrow{${nomA}${nomE}}=${AE.texFraction}\\overrightarrow{${nomA}${nomD}}$ et $\\overrightarrow{${nomA}${nomF}}=${AF.texFraction}\\overrightarrow{${nomA}${nomB}}$.<br>
               On considère le repère $\\left(${nomA}\\,;\\,\\dfrac{1}{${long[0]}}\\overrightarrow{${nomA}${nomB}}\\,,\\, \\dfrac{1}{${long[1]}}\\overrightarrow{${nomA}${nomD}}\\right)$.
               ` +
                createList({
                  items: [
                    'Montrer que ce repère est un repère orthonormé.',
                    'Donner les coordonnées de tous les points de la figure.',
                    `Montrer que les droites $(${nomE}${nomC})$ et $(${nomD}${nomF})$ sont perpendiculaires.`,
                  ],
                  style: 'nombres',
                }) +
                mathalea2d(
                  Object.assign(
                    { scale: 0.7, pixelsParCm: 25, display: 'inline' } as const,
                    fixeBordures(objets),
                  ),
                  objets,
                )
              texteCorr = createList({
                items: [
                  `Les vecteurs $\\overrightarrow{${nomA}${nomB}}$ et $\\overrightarrow{${nomA}${nomD}}$ sont orthogonaux. <br>
                        De plus, $\\left\\Vert \\dfrac{1}{${long[0]}}\\overrightarrow{${nomA}${nomB}}\\right\\Vert=1$ et $\\left\\Vert \\dfrac{1}{${long[1]}}\\overrightarrow{${nomA}${nomD}}\\right\\Vert=1$.<br>
                        
                        
                        
                        On en déduit que le repère $\\left(${nomA}\\,;\\,\\dfrac{1}{${long[0]}}\\overrightarrow{${nomA}${nomB}}\\,,\\, \\dfrac{1}{${long[1]}}\\overrightarrow{${nomA}${nomD}}\\right)$ est un repère orthonormé.`,
                  `$${nomA}(0\\,;\\,0)$, $${nomB}(${long[0]}\\,;\\,0)$, $${nomC}(${long[0]}\\,;\\,${long[1]})$, $${nomD}(0\\,;\\,${long[1]})$, $${nomE}(0\\,;\\,${long[2]})$ et $${nomF}(${long[3]}\\,;\\,0)$`,
                  `Pour montrer que les droites $(${nomE}${nomC})$ et $(${nomD}${nomF})$ sont perpendiculaires, on calcule le produit scalaire $\\overrightarrow{${nomE}${nomC}}\\cdot \\overrightarrow{${nomD}${nomF}}$.<br>
     $\\overrightarrow{${nomE}${nomC}}\\begin{pmatrix}${long[0]}-0\\\\${long[1]}-${long[2]}\\end{pmatrix}$, soit $\\overrightarrow{${nomE}${nomC}}\\begin{pmatrix}${long[0]}\\\\${long[1] - long[2]}\\end{pmatrix}$<br>
     $\\overrightarrow{${nomD}${nomF}}\\begin{pmatrix}${long[3]}-0\\\\0-${long[1]}\\end{pmatrix}$, soit $\\overrightarrow{${nomD}${nomF}}\\begin{pmatrix}${long[3]}\\\\${-long[1]}\\end{pmatrix}$<br><br>
           Ainsi : <br>
       $\\begin{aligned}
     \\overrightarrow{${nomE}${nomC}}\\cdot \\overrightarrow{${nomD}${nomF}}&=${long[0]}\\times ${long[3]}+${long[1] - long[2]}\\times ${ecritureParentheseSiNegatif(-long[1])}\\\\
     &=0                               
         \\end{aligned}$<br>
            Comme $\\overrightarrow{${nomE}${nomC}}\\cdot \\overrightarrow{${nomD}${nomF}}=0$, on en déduit que les vecteurs $\\overrightarrow{${nomE}${nomC}}$ et $\\overrightarrow{${nomD}${nomF}}$ sont orthogonaux et donc que les droites $(${nomE}${nomC})$ et $(${nomD}${nomF})$ sont perpendiculaires.`,
                ],
                style: 'nombres',
              })
              break
            case 2:
            default:
              objets = []
              listeLong = [
                [9, 6, 3, 2],
                [12, 4, 3, 1],
                [8, 4, 2, 1],
                [10, 5, 4, 2],
                [6, 4, 3, 2],
                [12, 8, 6, 4],
                [9, 6, 3, 2],
              ] // AB, AD, BE, CF,
              long = choice(listeLong)
              yC = long[1]
              xB = long[0]
              BE = new FractionEtendue(long[2], long[1]).simplifie()
              CF = new FractionEtendue(long[3], long[0]).simplifie()
              A = pointAbstrait(0, 0, nomA)
              B = pointAbstrait(xB, 0, nomB)
              C = pointAbstrait(xB, yC, nomC)
              D = pointAbstrait(0, yC, nomD)
              E = pointAbstrait(xB, long[2], nomE)
              F = pointAbstrait(long[0] - long[3], yC, nomF)
              seg1 = segment(E, A)
              seg2 = segment(B, F)
              l1 = afficheLongueurSegment(B, A, 'black', 0.5, '', true)
              l2 = afficheLongueurSegment(A, D, 'black', 0.5, '', true)
              lE = latex2d(`${nomE}`, long[0] + 0.5, long[2], {
                letterSize: 'normalsize',
              })
              lF = latex2d(`${nomF}`, long[0] - long[3], long[1] + 0.5, {
                letterSize: 'normalsize',
              })
              poly = polygoneAvecNom(A, B, C, D)
              objets.push(poly, seg1, seg2, lE, lF, l1, l2)
              texte =
                `Dans un rectangle $${nomA}${nomB}${nomC}${nomD}$ de longueur $${long[0]}$ et de largeur $${long[1]}$, on considère les points $${nomE}$ et $${nomF}$ tels que :<br>
               $\\overrightarrow{${nomB}${nomE}}=${BE.texFraction}\\overrightarrow{${nomB}${nomC}}$ et $\\overrightarrow{${nomC}${nomF}}=${CF.texFraction}\\overrightarrow{${nomC}${nomD}}$.<br>
              On considère le repère $\\left(${nomA}\\,;\\,\\dfrac{1}{${long[0]}}\\overrightarrow{${nomA}${nomB}}\\,,\\, \\dfrac{1}{${long[1]}}\\overrightarrow{${nomA}${nomD}}\\right)$.
               ` +
                createList({
                  items: [
                    'Montrer que ce repère est un repère orthonormé.',
                    'Donner les coordonnées de tous les points de la figure.',
                    ` Montrer que les droites $(${nomA}${nomE})$ et $(${nomB}${nomF})$ sont perpendiculaires.`,
                  ],
                  style: 'nombres',
                }) +
                mathalea2d(
                  Object.assign(
                    { scale: 0.7, pixelsParCm: 25, display: 'inline' } as const,
                    fixeBordures(objets),
                  ),
                  objets,
                )
              texteCorr = createList({
                items: [
                  `Les vecteurs $\\overrightarrow{${nomA}${nomB}}$ et $\\overrightarrow{${nomA}${nomD}}$ sont orthogonaux. <br>
                        De plus, $\\left\\Vert \\dfrac{1}{${long[0]}}\\overrightarrow{${nomA}${nomB}}\\right\\Vert=1$ et $\\left\\Vert \\dfrac{1}{${long[1]}}\\overrightarrow{${nomA}${nomD}}\\right\\Vert=1$.<br>
                        
                        
                        
                        On en déduit que le repère $\\left(${nomA}\\,;\\,\\dfrac{1}{${long[0]}}\\overrightarrow{${nomA}${nomB}}\\,,\\, \\dfrac{1}{${long[1]}}\\overrightarrow{${nomA}${nomD}}\\right)$ est un repère orthonormé.`,
                  `$${nomA}(0\\,;\\,0)$, $${nomB}(${long[0]}\\,;\\,0)$, $${nomC}(${long[0]}\\,;\\,${long[1]})$, $${nomD}(0\\,;\\,${long[1]})$, $${nomE}(${long[0]}\\,;\\,${long[2]})$ et $${nomF}(${long[0] - long[3]}\\,;\\,${long[1]})$`,
                  `Pour montrer que les droites $(${nomA}${nomE})$ et $(${nomB}${nomF})$ sont perpendiculaires, on calcule le produit scalaire $\\overrightarrow{${nomA}${nomE}}\\cdot \\overrightarrow{${nomB}${nomF}}$.<br>
     $\\overrightarrow{${nomA}${nomE}}\\begin{pmatrix}${long[0]}-0\\\\${long[2]}-0\\end{pmatrix}$, soit $\\overrightarrow{${nomA}${nomE}}\\begin{pmatrix}${long[0]}\\\\${long[2]}\\end{pmatrix}$<br>
     $\\overrightarrow{${nomB}${nomF}}\\begin{pmatrix}${long[0] - long[3]}-${long[0]}\\\\${long[1]}-0\\end{pmatrix}$, soit $\\overrightarrow{${nomB}${nomF}}\\begin{pmatrix}${-long[3]}\\\\${long[1]}\\end{pmatrix}$<br><br>
           Ainsi : <br>
       $\\begin{aligned}
    \\overrightarrow{${nomA}${nomE}}\\cdot \\overrightarrow{${nomB}${nomF}}&=${long[0]}\\times(${-long[3]})+${long[2]}\\times ${long[1]}\\\\
     &=0                               
         \\end{aligned}$<br>
         Comme $\\overrightarrow{${nomA}${nomE}}\\cdot \\overrightarrow{${nomB}${nomF}}=0$, on en déduit que les vecteurs $\\overrightarrow{${nomA}${nomE}}$ et $\\overrightarrow{${nomB}${nomF}}$ sont orthogonaux et donc que les droites $(${nomA}${nomE})$ et $(${nomB}${nomF})$ sont perpendiculaires.`,
                ],
                style: 'nombres',
              })
              break
          }
          break
      }

      if (this.questionJamaisPosee(i, texte)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
