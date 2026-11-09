import { courbe } from '../../lib/2d/Courbe'
import { lectureImage } from '../../lib/2d/LectureImage'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { repere } from '../../lib/2d/reperes'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { latex2d, texteParPosition } from '../../lib/2d/textes'
import { tracePoint } from '../../lib/2d/TracePoint'
import { createList } from '../../lib/format/lists'
import { texteCentre } from '../../lib/format/miseEnPage'
import { tableauSignesFonction, tableauVariationsFonction } from '../../lib/mathFonctions/etudeFonction'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
  reduireAxPlusB,
  rienSi1,
} from '../../lib/outils/ecritures'
import { miseEnEvidence, texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { context } from '../../modules/context'
import FractionEtendue from '../../modules/FractionEtendue'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'
import { bleuMathalea } from '../../lib/colors'

export const titre = 'Travailler sur les fonctions affines'
export const dateDePublication = '18/04/2026'
/**
 * Déterminer une fonction affine à partir de deux images
 * @author  Gilles Mora
 */
export const uuid = '66d4e'

export const refs = {
  'fr-fr': ['2F21-10'],
  'fr-ch': ['11CTFA2D-6', '11LCFA2D-6', '11LSFA2D-6'],
}
export default class Determinerfonctionaffine extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Type d\'exercice',
      4,
      '1 : Avec l\'expression algébrique (1)\n 2 : Avec l\'expression algébrique (2)\n 3 : Avec deux images (coefficient directeur entier)\n 4 : Avec deux images (coefficient directeur fractionnaire)\n 5 : Avec tableaux de signes et de variations\n 6 : Mélange des cas précédents',
    ]

    this.nbQuestions = 1
    this.spacingCorr = context.isHtml ? 2 : 1
    this.sup = 1
    this.comment = `Dnas cet exercice, on propose $5$ situations différentes pour travailler sur une fonction affine.`
  }

  nouvelleVersion() {
    let typesDeQuestionsDisponibles: number[] = []
    if (this.sup === 1) {
      typesDeQuestionsDisponibles = [1] // 
    } else if (this.sup === 2) {
      typesDeQuestionsDisponibles = [2] //
    } else if (this.sup === 3) {
      typesDeQuestionsDisponibles = [3] // 
    } else if (this.sup === 4) {
      typesDeQuestionsDisponibles = [4] // 
    } else if (this.sup === 5) {
      typesDeQuestionsDisponibles = [5] // 
    } else{
      typesDeQuestionsDisponibles = [1, 2, 3, 4, 5] // Mélange des cas précédents
    }

    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; ) {
      const typesDeQuestions = listeTypeDeQuestions[i]
      let texte = ''
      let texteCorr = ''
      const variables: number[] = []
      
      switch (typesDeQuestions) {
    case 1:
  {
    const m = randint(-5, 5, [0])
    // On impose que le second point (1 ; p+m) reste dans le cadre du repère.
    let p = randint(-4, 4, [0])
    while (Math.abs(p + m) > 5) {
      p = randint(-4, 4, [0])
    }

    const listeFractions = [[1, 2], [1, 3], [1, 4], [2, 3], [3, 4], [1, 7], [1, 8], [1, 9], [2, 5], [3, 5], [4, 5]]
    const valeur = choice(listeFractions)
    const maFraction = new FractionEtendue(valeur[0], valeur[1]).multiplieEntier(choice([-1, 1]))
    const maFonction = choice([`${reduireAxPlusB(m, p)}`, `${p}${ecritureAlgebriqueSauf1(m)}x`])

    const F = (x: number) => m * x + p

    // Calcul de f(maFraction) = m × (a/b) + p
    const produit = maFraction.multiplieEntier(m)
    const imageMaFraction = produit.sommeFraction(new FractionEtendue(p, 1))

    // Résolution de f(x) = 0  ⇔  x = -p/m
    const solution = new FractionEtendue(-p, m)

    const o = texteParPosition('O', -0.3, -0.3, 0, 'black', 1)
    const r = repere({
      xMin: -3,
      xMax: 3,
      xUnite: 2,
      yMin: -6,
      yMax: 6,
      thickHauteur: 0.1,
      xLabelMin: -2,
      xLabelMax: 2,
      yLabelMax: 5,
      yLabelMin: -5,
      axeXStyle: '->',
      axeYStyle: '->',
      xThickMin: -3,
      yThickMin: -6,
      yThickMax: 6,
      grilleXDistance: 2,
    })

    // Segments pour illustrer le coefficient directeur (cf. can3F3-02.ts)
    const s1 = segment(0, p, 2, p, 'green')
    const s2 = segment(2, p, 2, p + m, 'red')
    s1.epaisseur = 2
    s2.epaisseur = 2
    s1.styleExtremites = '->'
    s2.styleExtremites = '->'

    texte = `Soit $f$ la fonction définie sur $\\mathbb R$ par $f(x)=${maFonction}$.<br>
            On note $\\mathcal{D}$ sa représentation graphique dans un repère. <br>`
    texte += createList({
      items: [
        `Justifier que $f$ est une fonction affine.`,
        `Calculer $f\\left(${maFraction.texFSD}\\right)$ en détaillant les calculs. Donner une interprétation graphique de ce résultat.`,
        `Résoudre $f(x)=0$. Donner une interprétation graphique de ce résultat.`,
        `Donner les coordonnées du point d'intersection de $\\mathcal{D}$ avec l'axe des ordonnées.`,
        `Représenter graphiquement $\\mathcal{D}$ dans le repère ci-dessous.<br><br>` + mathalea2d(
          {
            xmin: -6,
            xmax: 6,
            ymin: -6,
            ymax: 6,
            pixelsParCm: 25,
            scale: 0.6,
            center: !context.isHtml,
          },
          r,
          o,
        ),
      ],
      style: 'nombres',
    })

    texteCorr = createList({
      items: [
        // Q1
        `$x\\mapsto ${rienSi1(m)}x${ecritureAlgebrique(p)}$ est de la forme $x\\mapsto mx+p$  avec $m=${m}$ et $p=${p}$. <br>
        On reconnaît donc la forme algébrique d'une fonction affine, donc $f$ est une fonction affine.`,

        // Q2 : calcul de f(maFraction)
        `On remplace $x$ par $${maFraction.texFSD}$ dans l'expression de $f$ :<br>
        $\\begin{aligned}
           f\\left(${maFraction.texFSD}\\right) &= ${maFonction===reduireAxPlusB(m, p) ? `${m===1 ? ``: `${m}\\times`} ${maFraction.texFSP} ${ecritureAlgebrique(p)}` : `${p} ${ecritureAlgebriqueSauf1(m)}\\times ${maFraction.texFSP}`} \\\\
            &= ${maFonction===reduireAxPlusB(m, p) ? `${produit.texFSD} ${ecritureAlgebrique(p)}`: `${p}${produit.texFractionSignee}` }\\\\
             &= ${miseEnEvidence(imageMaFraction.texFractionSimplifiee)}
             \\end{aligned}$<br>
Graphiquement, cela signifie que le point de coordonnées $${miseEnEvidence(`\\left(${maFraction.texFSD}\\,;\\,${imageMaFraction.texFractionSimplifiee}\\right)`)}$ appartient à $\\mathcal{D}$.`,

        // Q3 : résolution de f(x) = 0
        `On résout l'équation $f(x)=0$ en isolant $x$ dans le membre de gauche.<br>
        $\\begin{aligned}
          f(x)&=0\\\\
           ${maFonction}&=0 \\\\
            ${rienSi1(m)}x&=${-p} \\\\
             x&=${solution.texFractionSimplifiee}
          \\end{aligned}$<br>
L'unique solution est $${miseEnEvidence(`${solution.texFractionSimplifiee}`)}$.<br>
Graphiquement, cela signifie que $\\mathcal{D}$ coupe l'axe des abscisses au point de coordonnées $${miseEnEvidence(`\\left(${solution.texFractionSimplifiee}\\,;\\,0\\right)`)}$.`,

        // Q4 : intersection avec l'axe des ordonnées
        `L'ordonnée à l'origine de $f$ est $p=${p}$, donc $\\mathcal{D}$ coupe l'axe des ordonnées au point de coordonnées $${miseEnEvidence(`(0\\,;\\,${p})`)}$.`,

        // Q5 : tracé avec illustration du coefficient directeur
        `On place le point d'ordonnée à l'origine $A(0\\,;\\,${p})$. <br>
        À partir de $A$, on se déplace de $1$ vers la droite (déplacement horizontal) puis de $${m}$ verticalement (${m > 0 ? 'vers le haut' : 'vers le bas'}, car $m=${m}${m > 0 ? '>0' : '<0'}$) pour obtenir un second point de $\\mathcal{D}$, puis on trace la droite.<br>` + mathalea2d(
          {
            xmin: -6,
            xmax: 6,
            ymin: -6,
            ymax: 6,
            pixelsParCm: 25,
            scale: 0.6,
            center: !context.isHtml,
          },
          r,
          o,
          courbe(F, { repere: r, color: bleuMathalea, epaisseur: 2 }),
          s1,
          s2,
        latex2d('1', 1, m > 0 ? p - 0.4 : p + 0.4, { color: 'green' }),
          latex2d(`${m}`, 2.3, p + m / 2, { color: 'red' }),
        ),
      ],
      style: 'nombres',
    })
  }
  break
case 2:
  {
    const m = randint(-5, 5, [0])
    // On impose que le second point (1 ; p+m) reste dans le cadre du repère.
    let p = randint(-4, 4, [0])
    while (Math.abs(p + m) > 5) {
      p = randint(-4, 4, [0])
    }

    const listeFractions = [[1, 2], [1, 3], [1, 4], [2, 3], [3, 4], [1, 7], [1, 8], [1, 9], [2, 5], [3, 5], [4, 5]]
    const valeur = choice(listeFractions)
    const maFraction = new FractionEtendue(valeur[0], valeur[1]).multiplieEntier(choice([-1, 1]))
    const maFonction = choice([`${reduireAxPlusB(m, p)}`, `${p}${ecritureAlgebriqueSauf1(m)}x`])

    const F = (x: number) => m * x + p

    // Calcul de f(maFraction)
    const produit = maFraction.multiplieEntier(m)
    const imageMaFraction = produit.sommeFraction(new FractionEtendue(p, 1))

    // Résolution de f(x) = 0
    const solution = new FractionEtendue(-p, m)

    const o = texteParPosition('O', -0.3, -0.3, 0, 'black', 1)
    const r = repere({
      xMin: -3,
      xMax: 3,
      xUnite: 2,
      yMin: -6,
      yMax: 6,
      thickHauteur: 0.1,
      xLabelMin: -2,
      xLabelMax: 2,
      yLabelMax: 5,
      yLabelMin: -5,
      axeXStyle: '->',
      axeYStyle: '->',
      xThickMin: -3,
      yThickMin: -6,
      yThickMax: 6,
      grilleXDistance: 2,
    })

    // Segments pour illustrer le coefficient directeur
    const s1 = segment(0, p, 2, p, 'green')
    const s2 = segment(2, p, 2, p + m, 'red')
    s1.epaisseur = 2
    s2.epaisseur = 2
    s1.styleExtremites = '->'
    s2.styleExtremites = '->'

    texte = `Soit $f$ la fonction définie sur $\\mathbb R$ par $f(x)=${maFonction}$.<br>
            On note $\\mathcal{D}$ sa représentation graphique dans un repère. <br>`
    texte += createList({
      items: [
        `Justifier que $f$ est une fonction affine.`,
        `Déterminer l'ordonnée du point de $\\mathcal{D}$ dont l'abscisse est $${maFraction.texFSD}$.`,
        `Déterminer les coordonnées du point d'intersection entre $\\mathcal{D}$ et l'axe des abscisses.`,
        `Représenter graphiquement $\\mathcal{D}$ dans le repère ci-dessous.<br><br>` + mathalea2d(
          {
            xmin: -6,
            xmax: 6,
            ymin: -6,
            ymax: 6,
            pixelsParCm: 25,
            scale: 0.6,
            center: !context.isHtml,
          },
          r,
          o,
        ),
      ],
      style: 'nombres',
    })

    texteCorr = createList({
      items: [
        // Q1
        `$x\\mapsto ${rienSi1(m)}x${ecritureAlgebrique(p)}$ est de la forme $x\\mapsto mx+p$  avec $m=${m}$ et $p=${p}$. <br>
        On reconnaît donc la forme algébrique d'une fonction affine, donc $f$ est une fonction affine.`,

        // Q2 : l'ordonnée du point d'abscisse maFraction est f(maFraction)
        `L'ordonnée du point de $\\mathcal{D}$ d'abscisse $${maFraction.texFSD}$ est $f\\left(${maFraction.texFSD}\\right)$. On remplace $x$ par $${maFraction.texFSD}$ dans l'expression de $f$ :<br>
        $\\begin{aligned}
           f\\left(${maFraction.texFSD}\\right) &= ${maFonction === reduireAxPlusB(m, p) ? `${m === 1 ? `` : `${m}\\times`} ${maFraction.texFSP} ${ecritureAlgebrique(p)}` : `${p} ${ecritureAlgebriqueSauf1(m)}\\times ${maFraction.texFSP}`} \\\\
            &= ${maFonction === reduireAxPlusB(m, p) ? `${produit.texFSD} ${ecritureAlgebrique(p)}` : `${p}${produit.texFractionSignee}`}\\\\
             &= ${miseEnEvidence(imageMaFraction.texFractionSimplifiee)}
             \\end{aligned}$<br>
L'ordonnée cherchée est donc $${miseEnEvidence(imageMaFraction.texFractionSimplifiee)}$.`,

        // Q3 : intersection avec l'axe des abscisses = résoudre f(x) = 0
        `Le point d'intersection entre $\\mathcal{D}$ et l'axe des abscisses a pour ordonnée $0$. On résout donc l'équation $f(x)=0$ :<br>
        $\\begin{aligned}
          f(x)&=0\\\\
           ${maFonction}&=0 \\\\
            ${rienSi1(m)}x&=${-p} \\\\
             x&=${solution.texFractionSimplifiee}
          \\end{aligned}$<br>
$\\mathcal{D}$ coupe l'axe des abscisses au point de coordonnées $${miseEnEvidence(`\\left(${solution.texFractionSimplifiee}\\,;\\,0\\right)`)}$.`,

        // Q4 : tracé avec illustration du coefficient directeur
        `On place le point d'ordonnée à l'origine $A(0\\,;\\,${p})$. <br>
        À partir de $A$, on se déplace de $1$ vers la droite (déplacement horizontal) puis de $${m}$ verticalement (${m > 0 ? 'vers le haut' : 'vers le bas'}, car $m=${m}${m > 0 ? '>0' : '<0'}$) pour obtenir un second point de $\\mathcal{D}$, puis on trace la droite.<br>` + mathalea2d(
          {
            xmin: -6,
            xmax: 6,
            ymin: -6,
            ymax: 6,
            pixelsParCm: 25,
            scale: 0.6,
            center: !context.isHtml,
          },
          r,
          o,
          courbe(F, { repere: r, color: bleuMathalea, epaisseur: 2 }),
          s1,
          s2,
          latex2d('1', 1, m > 0 ? p - 0.4 : p + 0.4, { color: 'green' }),
          latex2d(`${m}`, 2.3, p + m / 2, { color: 'red' }),
        ),
      ],
      style: 'nombres',
    })
  }
  break
       case 3:
  {
    const p = randint(-4, 4, [0])
    const m = randint(-3, 3, [0])
    let valeur1 = randint(-4, 4, [0])
    let valeur2 = randint(-4, 4, [0, valeur1, valeur1 - 1, valeur1 + 1])
    do {
      valeur1 = randint(-4, 4, [0])
      valeur2 = randint(-4, 4, [0, valeur1, valeur1 - 1, valeur1 + 1])
    } while (Math.abs(m * valeur1 + p) > 9 || Math.abs(m * valeur2 + p) > 9)
    const F = (x: number) => m * x + p

    const o = texteParPosition('O', -0.3, -0.3, 0, 'black', 1)
    const r = repere({
      xMin: -5,
      xMax: 5,
      yUnite: 0.5,
      yMin: Math.min(-5, m * valeur1 + p - 1, m * valeur2 + p - 1),
      yMax: Math.max(5, m * valeur1 + p + 1, m * valeur2 + p + 1),
      thickHauteur: 0.1,
      xLabelMin: -4,
      xLabelMax: 4,
      yLabelMax: Math.max(5, m * valeur1 + p + 1, m * valeur2 + p + 1) - 1,
      yLabelMin: Math.min(-5, m * valeur1 + p - 1, m * valeur2 + p - 1) + 1,
      axeXStyle: '->',
      axeYStyle: '->',
      xThickMin: -5,
      yThickMin: Math.min(-5, m * valeur1 + p - 1, m * valeur2 + p - 1) - 1,
      yThickMax: Math.max(5, m * valeur1 + p + 1, m * valeur2 + p + 1) + 1,
      grilleYDistance: 0.5,
    })

    // Calcul du coefficient directeur pour la correction Q2
    // m = (f(v2) - f(v1)) / (v2 - v1)
    const deltaY = F(valeur2) - F(valeur1)
    const deltaX = valeur2 - valeur1

    texte = `Soit $f$ la fonction affine définie sur $\\mathbb R$ par $f(x)=mx+p$ (avec $m$ et $p$ deux réels) vérifiant :<br><br>
${texteCentre(`$f(${valeur1})=${F(valeur1)}$ et $f(${valeur2})=${F(valeur2)}$`)}. <br>
            On note $\\mathcal{D}$ sa représentation graphique dans un repère. <br>`
    texte += createList({
      items: [
        `Représenter $\\mathcal{D}$ dans le repère suivant. Laisser des traces graphiques.<br><br>` + mathalea2d(
          {
            xmin: -5,
            xmax: 5,
            ymin: Math.min(-5, m * valeur1 + p - 1, m * valeur2 + p - 1) / 2,
            ymax: Math.max(5, m * valeur1 + p + 1, m * valeur2 + p + 1) / 2,
            pixelsParCm: 35,
            scale: 1,
            center: !context.isHtml,
          },
          r,
          o,
        ),
        `Montrer, par le calcul, que $f(x)=${rienSi1(m)}x+p$.`,
        `En déduire la valeur de $p$.`,
      ],
      style: 'nombres',
    })

    texteCorr = createList({
      items: [
        // Q1 : tracé (on place les deux points donnés et on trace la droite)
        `On place les deux points $A(${valeur1}\\,;\\,${F(valeur1)})$ et $B(${valeur2}\\,;\\,${F(valeur2)})$ dans le repère, puis on trace la droite $\\mathcal{D}$ passant par ces deux points.<br>` + mathalea2d(
          {
            xmin: -5,
            xmax: 5,
            ymin: Math.min(-5, m * valeur1 + p - 1, m * valeur2 + p - 1) / 2,
            ymax: Math.max(5, m * valeur1 + p + 1, m * valeur2 + p + 1) / 2,
            pixelsParCm: 35,
            scale: 1,
            center: !context.isHtml,
          },
          r,
          o,
          courbe(F, { repere: r, color: bleuMathalea, epaisseur: 2 }),
        ),

        // Q2 : calcul du coefficient directeur
        `$f$ est une fonction affine, donc son coefficient directeur $m$ est donné par :<br>
        $\\begin{aligned}
          m &= \\dfrac{f(${valeur2})-f(${valeur1})}{${valeur2}-(${valeur1})}\\\\
            &= \\dfrac{${F(valeur2)}-(${F(valeur1)})}{${valeur2}-(${valeur1})}\\\\
            &= \\dfrac{${deltaY}}{${deltaX}}\\\\
            &= ${miseEnEvidence(`${m}`)}
          \\end{aligned}$<br>
On a donc $f(x)=${rienSi1(m)}x+p$.`,

        // Q3 : détermination de p
        `On utilise l'une des deux égalités, par exemple $f(${valeur1})=${F(valeur1)}$ :<br>
        $\\begin{aligned}
          f(${valeur1})&=${F(valeur1)}\\\\
          ${rienSi1(m)}\\times (${valeur1})+p&=${F(valeur1)}\\\\
          ${m * valeur1}+p&=${F(valeur1)}\\\\
          p&=${F(valeur1)}-(${m * valeur1})\\\\
          p&=${miseEnEvidence(`${p}`)}
          \\end{aligned}$<br>
On conclut : $f(x)=${miseEnEvidence(reduireAxPlusB(m, p))}$.`,
      ],
      style: 'nombres',
    })
  }
  break


case 4:
  {
    // 10 configurations prédéfinies : [a, b, p, v1, v2]
    // avec m = a/b (fraction irréductible prédéfinie), p entier,
    // v1 et v2 entiers tels que f(v1) et f(v2) soient entiers (donc v1 et v2 multiples de b).
    // Les images sont toutes dans [-8 ; 8].
    const configurations: [number, number, number, number, number][] = [
      // [a, b, p, v1, v2]   → m = a/b, p entier
      [1, 3, 2, -3, 3],   // f(-3) = 1,  f(3) = 3
      [2, 3, -1, -3, 3],  // f(-3) = -3, f(3) = 1
      [1, 4, 1, -4, 4],   // f(-4) = 0,  f(4) = 2
      [3, 4, -2, -4, 4],  // f(-4) = -5, f(4) = 1
      [1, 5, 3, -5, 5],   // f(-5) = 2,  f(5) = 4
      [2, 5, -2, -5, 5],  // f(-5) = -4, f(5) = 0
      [-1, 3, 1, -3, 3],  // f(-3) = 2,  f(3) = 0
      [-3, 4, 2, -4, 4],  // f(-4) = 5,  f(4) = -1
      [-2, 5, 1, -5, 5],  // f(-5) = 3,  f(5) = -1
      [-4, 5, -1, -5, 5], // f(-5) = 3,  f(5) = -5
    ]
    const [a, b, p, valeur1, valeur2] = choice(configurations)
    const mFrac = new FractionEtendue(a, b) // m = a/b irréductible

    const F = (x: number) => (a * x) / b + p
    const f1 = F(valeur1) // entier par construction
    const f2 = F(valeur2) // entier par construction

    const o = texteParPosition('O', -0.3, -0.3, 0, 'black', 1)
    const r = repere({
      xMin: -6,
      xMax: 6,
      yUnite: 1,
      yMin: Math.min(-5, f1 - 1, f2 - 1),
      yMax: Math.max(5, f1 + 1, f2 + 1),
      thickHauteur: 0.1,
      xLabelMin: -5,
      xLabelMax: 5,
      yLabelMax: Math.max(5, f1 + 1, f2 + 1) - 1,
      yLabelMin: Math.min(-5, f1 - 1, f2 - 1) + 1,
      axeXStyle: '->',
      axeYStyle: '->',
      xThickMin: -6,
      yThickMin: Math.min(-5, f1 - 1, f2 - 1) - 1,
      yThickMax: Math.max(5, f1 + 1, f2 + 1) + 1,
      grilleYDistance: 1,
    })

    // Pour la correction Q2
    const deltaY = f2 - f1
    const deltaX = valeur2 - valeur1
    const coeffDirFrac = new FractionEtendue(deltaY, deltaX) // se simplifie en a/b

    texte = `Soit $f$ la fonction affine définie sur $\\mathbb R$ par $f(x)=mx+p$ (avec $m$ et $p$ deux réels) vérifiant :<br><br>
${texteCentre(`$f(${valeur1})=${f1}$ et $f(${valeur2})=${f2}$`)}. <br>
            On note $\\mathcal{D}$ sa représentation graphique dans un repère. <br>`
    texte += createList({
      items: [
        `Représenter $\\mathcal{D}$ dans le repère suivant. Laisser des traces graphiques.<br><br>` + mathalea2d(
          {
            xmin: -6,
            xmax: 6,
            ymin: Math.min(-5, f1 - 1, f2 - 1) ,
            ymax: Math.max(5, f1 + 1, f2 + 1) ,
            pixelsParCm: 35,
            scale: 1,
            center: !context.isHtml,
          },
          r,
          o,
        ),
        `Montrer, par le calcul, que $m=${mFrac.texFractionSimplifiee}$.`,
        `En déduire la valeur de $p$.`,
      ],
      style: 'nombres',
    })

    // m × v1 sous forme de fraction, pour la Q3
    const mv1 = new FractionEtendue(a * valeur1, b)
const ptA = pointAbstrait(valeur1, f1, 'A', 'above left')
    const ptB = pointAbstrait(valeur2, f2, 'B', 'above left')
    const tA = tracePoint(ptA, 'black')
    const tB = tracePoint(ptB, 'black')

  
   
    texteCorr = createList({
      items: [
         `On place les deux points $A(${valeur1}\\,;\\,${f1})$ et $B(${valeur2}\\,;\\,${f2})$ dans le repère, puis on trace la droite $\\mathcal{D}$ passant par ces deux points.<br>` + mathalea2d(
          {
            xmin: -6,
            xmax: 6,
            ymin: Math.min(-5, f1 - 1, f2 - 1) ,
            ymax: Math.max(5, f1 + 1, f2 + 1) ,
            pixelsParCm: 35,
            scale: 1,
            center: !context.isHtml,
          },
          r,
          o,
          courbe(F, { repere: r, color: bleuMathalea, epaisseur: 2 }),
          tA,
          tB,
          lectureImage(valeur1, f1, 1, 1, 'red'),
          lectureImage(valeur2, f2, 1, 1, 'red'),
        ),
        // Q2 : calcul du coefficient directeur
        `$f$ est une fonction affine, donc son coefficient directeur $m$ est donné par :<br>
        $\\begin{aligned}
          m &= \\dfrac{f(${valeur2})-f(${valeur1})}{${valeur2}-(${valeur1})}\\\\
            &= \\dfrac{${f2}-(${f1})}{${valeur2}-(${valeur1})}\\\\
            &= \\dfrac{${deltaY}}{${deltaX}}\\\\
            &= ${miseEnEvidence(coeffDirFrac.texFractionSimplifiee)}
          \\end{aligned}$<br>
On a donc $f(x)=${mFrac.texFractionSimplifiee}\\,x+p$.`,

        // Q3 : détermination de p
        `On utilise l'égalité $f(${valeur1})=${f1}$ :<br>
        $\\begin{aligned}
          f(${valeur1})&=${f1}\\\\
          ${mFrac.texFSP}\\times (${valeur1})+p&=${f1}\\\\
          ${mv1.texFractionSimplifiee}+p&=${f1}\\\\
          p&=${f1}${ecritureAlgebrique(-a * valeur1 / b)}\\\\
          p&=${miseEnEvidence(`${p}`)}
          \\end{aligned}$<br>
On conclut : $f(x)=${miseEnEvidence(`${mFrac.texFractionSimplifiee}\\,x${ecritureAlgebrique(p)}`)}$.`,
      ],
      style: 'nombres',
    })
  }
  break
    case 5:
default:
  {
    // Choix de m et p : racine -p/m entière, non nulle, dans [-3 ; 3]
    let m = randint(-5, 5, [0])
    let p = randint(-9, 9, [0])
    let racine = -p / m
    while (p % m !== 0 || racine < -3 || racine > 3 || racine === 0) {
      m = randint(-5, 5, [0])
      p = randint(-9, 9, [0])
      racine = -p / m
    }
    const maFonction = choice([`${reduireAxPlusB(m, p)}`, `${p}${ecritureAlgebriqueSauf1(m)}x`])
    const F = (x: number) => m * x + p
    const racineTex = `${racine}`
    const casQ3 = choice(['dessus', 'dessous', 'departetdautre'])
    const denominateursPossibles = [3, 4, 5, 6, 7]
    const den1Q3 = choice(denominateursPossibles)
    let den2Q3 = choice(denominateursPossibles)
    while (den2Q3 === den1Q3) den2Q3 = choice(denominateursPossibles)

    let signe1Dec: number
    let signe2Dec: number
    if (casQ3 === 'dessus') {
      signe1Dec = 1
      signe2Dec = 1
    } else if (casQ3 === 'dessous') {
      signe1Dec = -1
      signe2Dec = -1
    } else {
      signe1Dec = -1
      signe2Dec = 1
    }

    const frac1Q3 = new FractionEtendue(racine * den1Q3 + signe1Dec, den1Q3)
    const frac2Q3 = new FractionEtendue(racine * den2Q3 + signe2Dec, den2Q3)

    const v1Q3 = frac1Q3.valeurDecimale
    const v2Q3 = frac2Q3.valeurDecimale
    const F1Q3 = m * v1Q3 + p
    const F2Q3 = m * v2Q3 + p
    const signe1Q3 = F1Q3 > 0 ? 'positif' : 'négatif'
    const signe2Q3 = F2Q3 > 0 ? 'positif' : 'négatif'
    const signeProduitQ3 = F1Q3 * F2Q3 > 0 ? 'positif' : 'négatif'
    const regleSignesQ3 = F1Q3 * F2Q3 > 0
      ? `Le produit de deux nombres de même signe est positif.`
      : `Le produit de deux nombres de signes contraires est négatif.`

    const comparerAvecRacine = (frac: FractionEtendue): string => {
      const numRacine = racine * frac.den
      const compSymb = frac.valeurDecimale > racine ? '>' : '<'
      return `$${racineTex}=\\dfrac{${numRacine}}{${frac.den}}$, et $${frac.num}${compSymb}${numRacine}$, donc $${frac.texFSD}${compSymb}${racineTex}$`
    }
    const justif1Q3 = comparerAvecRacine(frac1Q3)
    const justif2Q3 = comparerAvecRacine(frac2Q3)

    // -------------------------------------------------------------------
    // Q4 : intervalle [alpha ; beta] contenant la racine
    // -------------------------------------------------------------------
    const alpha = Math.floor(racine) - randint(1, 2)
    const beta = Math.ceil(racine) + randint(1, 2)

   
    
   

    const tolerance = 0.005

  
    texte = `Soit $f$ la fonction définie sur $\\mathbb R$ par $f(x)=${maFonction}$. <br>`
    texte += createList({
      items: [
        `Justifier que $f$ est une fonction affine.`,
        `Dresser le tableau de signes de $f$ sur $\\mathbb{R}$.`,
        `Quel est le signe du produit $f\\left(${frac1Q3.texFSD}\\right)\\times f\\left(${frac2Q3.texFSD}\\right)$ ? Justifier.`,
        `Dresser, en justifiant, le tableau de variations de $f$ sur l'intervalle $[${alpha}\\,;\\,${beta}]$.`,

      ],
      style: 'nombres',
    })

    texteCorr = createList({
      items: [
        `$x\\mapsto ${rienSi1(m)}x${ecritureAlgebrique(p)}$ est de la forme $x\\mapsto mx+p$ avec $m=${m}$ et $p=${p}$. <br>
        On reconnaît la forme algébrique d'une fonction affine, donc $f$ est une fonction affine.`,
        `On résout $f(x)=0$ :<br>
$\\begin{aligned}
${maFonction}&=0 \\\\
 ${rienSi1(m)}x&=${-p} \\\\
  x&=${racineTex}
  \\end{aligned}$<br>
Comme le coefficient directeur $m$ ${m > 0 ? 'est positif' : 'est négatif'}, $f$ est ${m > 0 ? 'strictement croissante' : 'strictement décroissante'} sur $\\mathbb R$,  
donc les valeurs de $f(x)$ sont d'abord ${m > 0 ? 'négatives puis positives.' : 'positives puis négatives.'} ` +
          tableauSignesFonction(F, alpha - 1, beta + 1, {
            step: 0.5,
            tolerance,
            substituts: [
              { antVal: alpha - 1, antTex: `$-\\infty$` },
              { antVal: beta + 1, antTex: `$+\\infty$` },
            ],
          }),

        // Q3
        `On compare chacune des deux fractions à la racine $${racineTex}$ en les mettant au même dénominateur.<br>
$\\bullet$ ${justif1Q3}.<br>
D'après le tableau de signes, $f\\left(${frac1Q3.texFSD}\\right)$ est donc ${signe1Q3}.<br>
$\\bullet$ ${justif2Q3}.<br>
D'après le tableau de signes, $f\\left(${frac2Q3.texFSD}\\right)$ est donc ${signe2Q3}.<br>
${regleSignesQ3}<br>
Donc $${miseEnEvidence(`f\\left(${frac1Q3.texFSD}\\right)\\times f\\left(${frac2Q3.texFSD}\\right)`)}$ ${texteEnCouleurEtGras(`est ${signeProduitQ3}`)}.`,

        // Q4
        `Le coefficient directeur de $f$ est $m=${m}${m > 0 ? '>0' : '<0'}$, donc $f$ est ${m > 0 ? 'strictement croissante' : 'strictement décroissante'} sur $\\mathbb R$, et en particulier sur $[${alpha}\\,;\\,${beta}]$.<br>
On calcule les images aux bornes : $f(${alpha})=${F(alpha)}$ et $f(${beta})=${F(beta)}$.<br>` +
          tableauVariationsFonction(
            F,
            (x: number) => m,
            alpha,
            beta,
            {
              ligneDerivee: false,
              step: 0.5,
              tolerance,
              substituts: [
                { antVal: alpha, antTex: `$${alpha}$`, imgVal: F(alpha), imgTex: `$${F(alpha)}$` },
                { antVal: beta, antTex: `$${beta}$`, imgVal: F(beta), imgTex: `$${F(beta)}$` },
              ],
            },
          ) ],
      style: 'nombres',
    })
  }
  break
      }
      // Uniformisation : Mise en place de la réponse attendue en interactif en orange et gras
    
     
     
      if (this.questionJamaisPosee(i, variables.map(String).join(';'))) {
        // Si la question n'a jamais été posée, on en créé une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
