import { choice } from '../../../lib/outils/arrayOutils'
import {
    ecritureAlgebrique,
    ecritureAlgebriqueSauf1,
    ecritureParentheseSiNegatif,
    reduirePolynomeDegre3,
    rienSi1,
} from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import EquationSecondDegre from '../../../modules/EquationSecondDegre'
import FractionEtendue from '../../../modules/FractionEtendue'
import {
    gestionnaireFormulaireTexte,
    listeQuestionsToContenu,
    randint,
} from '../../../modules/outils'
import Exercice from '../../Exercice'

export const titre =
  "Déterminer l'équation de la tangente à une courbe ou un cercle passant par un point"
export const dateDePublication = '04/09/2025'
export const interactifReady = false
export const uuid = 'asdea'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['2mEqCar-3'],
}

/**
 * Tangente à une courbe passant par un point
 * @author Nathan Scheinmann
 */

export default class ExerciceTangenteCourbe extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Tangente à',
      '1 : Une courbe\n2 : Un cercle\n3 : Mélange',
    ]
    this.sup = 1
    this.nbQuestions = 3
  }

  nouvelleVersion() {
    const listeTypeDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 2,
      melange: 3,
      defaut: 3,
      listeOfCase: ['courbe', 'cercle'],
      shuffle: true,
      nbQuestions: this.nbQuestions,
    })
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''
      let solutions = []
      if (listeTypeDeQuestions[i] === 'courbe') {
        let a, b, c, d, e, x1, y1
        do {
          x1 = randint(-5, 5, [0])
          y1 = randint(-5, 5, [0])
          a = randint(-5, 5, [0])
          b = y1 - a * x1
          e = randint(-5, 5, [0])
          c = e - y1 + a * x1
          d = 2 * c + a
        } while (c === 0)
        texte = `Déterminer les équations de toutes les tangentes à la courbe d'équation $y = ${reduirePolynomeDegre3(0, c, d, e)}$ passant par le point $(${x1} \\,;\\, ${y1})$.`
        texteCorr = `On pose $y=ax+b$ la droite tangente avec inconnues $a$ et $b$.<br> On va déterminer les valeurs de $a$ et $b$.<br> La droite passe par le point $(${x1}\\,;\\,${y1})$, donc $${y1}=${rienSi1(x1)}a+b$, d'où $b=${y1}${ecritureAlgebriqueSauf1(-x1)}a$. On obtient 
            \\[y=ax${ecritureAlgebrique(y1)}${ecritureAlgebriqueSauf1(-x1)}a\\]
            On impose que cette droite et la courbe aient un unique point d'intersection, donc que le système
            \\[\\begin{cases}
            y=${reduirePolynomeDegre3(0, c, d, e)}\\\\
            y=ax${ecritureAlgebrique(y1)}${ecritureAlgebriqueSauf1(-x1)}a
            \\end{cases}\\]
            ait une unique solution. On résout le système par comparaison :
            \\[${reduirePolynomeDegre3(0, c, d, e)}=ax${ecritureAlgebrique(y1)}${ecritureAlgebriqueSauf1(-x1)}a\\]
            Cette équation est équivalente à 
            \\[${rienSi1(c)}x^2${d < 0 ? `-(${-d}+a)` : `(${d}-a)`}x${ecritureAlgebriqueSauf1(x1)}a${ecritureAlgebrique(e - y1)}=0\\]
            Le discriminant de ce polynôme doit être nul, afin que l'équation ait une unique solution. Il vaut :
            \\[\\Delta=(${d}-a)^2-4\\cdot${ecritureParentheseSiNegatif(c)}\\cdot\\left(${rienSi1(x1)}a${ecritureAlgebrique(e - y1)}\\right).\\] On impose donc $\\Delta=0$, d'où
            \\[(${d}-a)^2-4\\cdot${ecritureParentheseSiNegatif(c)}\\cdot\\left(${rienSi1(x1)}a${ecritureAlgebrique(e - y1)}\\right)=0\\]
            On obtient l'équation du second degré en $a$ suivante :
            \\[a^2${ecritureAlgebriqueSauf1(-(2 * d + 4 * c * x1))}a${ecritureAlgebrique(d * d - 4 * c * (e - y1))}=0.\\]
            On résout cette équation et on obtient comme ensemble de solutions
            `
        const eqSecA = EquationSecondDegre.aPartirDesCoefficients(
          new FractionEtendue(1, 1),
          new FractionEtendue(-(2 * d + 4 * c * x1), 1),
          new FractionEtendue(d * d - 4 * c * (e - y1), 1),
          new FractionEtendue(0, 1),
          new FractionEtendue(0, 1),
          new FractionEtendue(0, 1),
          { format: 'initial', variable: 'a' },
        )
        const solEq = eqSecA.solutionFrac()
        texteCorr += `$${eqSecA.ensembleDeSolutionsTex}$.`
        if (eqSecA.delta.num === 0) {
          texteCorr += ` Il y a qu'une seule valeur de $a$ possible et donc une seule tangente.
          On déduit l'ordonnée à l'origine en substituant la valeur trouvée pour $a$ dans $b=${y1}${ecritureAlgebriqueSauf1(-x1)}a$.<br>`
          const a2 = solEq[0] as FractionEtendue
          const b2 = new FractionEtendue(y1, 1).sommeFraction(
            a2.multiplieEntier(-x1),
          )
          texteCorr += `\\[b=${b2.texFractionSimplifiee}\\]
        L'équation de la tangente est donc :<br>
        \\[${miseEnEvidence(`y=${rienSi1(a2.simplifie())}x${b2.simplifie().texFractionSignee}`)}.\\]
        `
        } else {
          ;`
        Ces deux solutions correspondent aux pentes des deux tangentes.<br> On déduit l'ordonnée à l'origine de chaque droite en substituant la valeur trouvée pour $a$ dans $b=${y1}${ecritureAlgebriqueSauf1(-x1)}a$.<br>`
          const a2 = solEq[0] as FractionEtendue
          const a1 = solEq[1] as FractionEtendue
          const b1 = new FractionEtendue(y1, 1).sommeFraction(
            a1.multiplieEntier(-x1),
          )
          const b2 = new FractionEtendue(y1, 1).sommeFraction(
            a2.multiplieEntier(-x1),
          )
          texteCorr += `\\[b=${b1.texFractionSimplifiee} \\text{ si } a=${a1.texFractionSimplifiee}\\quad \\text{ ou } b=${b2.texFractionSimplifiee} \\text{ si } a=${a2.texFractionSimplifiee}\\]
        Les équations des tangentes sont donc :<br>
        \\[${miseEnEvidence(`y=${rienSi1(a1.simplifie())}x${b1.simplifie().texFractionSignee}`)} \\text{ et } ${miseEnEvidence(`y=${rienSi1(a2.simplifie())}x${b2.simplifie().texFractionSignee}`)}.\\]
        `
        }
        solutions = [eqSecA.solutionsListeTex[0]]
      } else {
        const listeCarre = [
          [
            [1, 8],
            [4, 7],
          ],
          [
            [9, 13],
            [15, 5],
          ],
        ]
        const choixListe = choice([0, 1])
        const listeDesChoix = [
          [0, 0],
          [0, 1],
          [1, 0],
          [1, 1],
        ]
        const choixRayon = choice([0, 1, 2, 3])
        const choixX = choice([0, 1])
        const r =
          listeCarre[choixListe][listeDesChoix[choixRayon][0]][
            listeDesChoix[choixRayon][1]
          ]
        const c =
          listeCarre[choixListe][listeDesChoix[choixRayon][0]][
            (listeDesChoix[choixRayon][1] + 1) % 2
          ]
        let x1, y1, x2, y2, a, b
        x2 = randint(-14, 14, [0])
        y2 = randint(-14, 14, [0])
        x1 =
          listeCarre[choixListe][(listeDesChoix[choixRayon][0] + 1) % 2][
            choixX
          ] + x2
        y1 =
          listeCarre[choixListe][(listeDesChoix[choixRayon][0] + 1) % 2][
            (choixX + 1) % 2
          ] + y2
        texte = `Déterminer les équations de toutes les tangentes au cercle d'équation $(x${ecritureAlgebrique(-x2)})^2+(y${ecritureAlgebrique(-y2)})^2 = ${r ** 2}$ passant par le point $(${x1} \\,;\\, ${y1})$.`
        texteCorr = `On pose $y=ax+b$ la droite tangente avec inconnues $a$ et $b$.<br> On va déterminer les valeurs de $a$ et $b$.<br> La droite passe par le point $(${x1}\\,;\\,${y1})$, donc $${y1}=${rienSi1(x1)}a+b$, d'où $b=${y1}${ecritureAlgebriqueSauf1(-x1)}a$. On obtient 
            \\[y=ax${ecritureAlgebrique(y1)}${ecritureAlgebriqueSauf1(-x1)}a\\]
            On impose que cette droite et la courbe aient un unique point d'intersection, donc que le système
            \\[\\begin{cases}
             ${r ** 2}=(x${ecritureAlgebrique(-x2)})^2+(y${ecritureAlgebrique(-y2)})^2\\\\
            y=ax${ecritureAlgebrique(y1)}${ecritureAlgebriqueSauf1(-x1)}a
            \\end{cases}\\]
            ait une unique solution. On résout le système par substitution de la valeur de $y$ dans la première équation :
            \\[\\begin{cases}
             ${r ** 2}=(x${ecritureAlgebrique(-x2)})^2+(ax${ecritureAlgebrique(y1)}${ecritureAlgebriqueSauf1(-x1)}a${ecritureAlgebrique(-y2)})^2\\\\
            y=ax${ecritureAlgebrique(y1)}${ecritureAlgebriqueSauf1(-x1)}a
            \\end{cases}\\iff\\begin{cases}
             ${r ** 2}=(x${ecritureAlgebrique(-x2)})^2+(ax${ecritureAlgebriqueSauf1(-x1)}a${ecritureAlgebrique(y1 - y2)})^2\\\\
            y=ax${ecritureAlgebrique(y1)}${ecritureAlgebriqueSauf1(-x1)}a
            \\end{cases}\\]
            La première équation du système est équivalente à 
            \\[(a^2+1)x^2+(${rienSi1(-2 * x1)}a^2${ecritureAlgebriqueSauf1(2 * y1 - 2 * y2)}a${ecritureAlgebriqueSauf1(-2 * x2)})x${ecritureAlgebriqueSauf1(x1 ** 2)}a^2${ecritureAlgebriqueSauf1(2 * x1 * y2 - 2 * y1 * x1)}a${ecritureAlgebrique(x2 ** 2 + (y1 - y2) ** 2 - r ** 2)}=0\\]
            Le discriminant de ce polynôme doit être nul, afin que l'équation ait une unique solution. Il vaut :
            \\[\\Delta=(${rienSi1(-2 * x1)}a^2${ecritureAlgebriqueSauf1(2 * y1 - 2 * y2)}a${ecritureAlgebriqueSauf1(-2 * x2)})^2-4(a^2+1)(${rienSi1(x1 ** 2)}a^2${ecritureAlgebriqueSauf1(2 * x1 * y2 - 2 * y1 * x1)}a${ecritureAlgebrique(x2 ** 2 + (y1 - y2) ** 2 - r ** 2)}).\\] On impose donc $\\Delta=0$ et on obtient l'équation du second degré en $a$ suivante :
            \\[${rienSi1(4 * r ** 2 - 4 * x1 ** 2 + 8 * x1 * x2 - 4 * x2 ** 2)}a^2${ecritureAlgebriqueSauf1(8 * x1 * y1 - 8 * x2 * y1 - 8 * x1 * y2 + 8 * x2 * y2)}a${ecritureAlgebrique(4 * r ** 2 - 4 * y1 ** 2 + 8 * y1 * y2 - 4 * y2 ** 2)}=0.\\]
            On résout cette équation et on obtient les deux solutions
            `
        const eqSecA = EquationSecondDegre.aPartirDesCoefficients(
          new FractionEtendue(
            4 * r ** 2 - 4 * x1 ** 2 + 8 * x1 * x2 - 4 * x2 ** 2,
            1,
          ),
          new FractionEtendue(
            8 * x1 * y1 - 8 * x2 * y1 - 8 * x1 * y2 + 8 * x2 * y2,
            1,
          ),
          new FractionEtendue(
            4 * r ** 2 - 4 * y1 ** 2 + 8 * y1 * y2 - 4 * y2 ** 2,
            1,
          ),
          new FractionEtendue(0, 1),
          new FractionEtendue(0, 1),
          new FractionEtendue(0, 1),
          { format: 'initial', variable: 'a' },
        )
        texteCorr += `$${eqSecA.ensembleDeSolutionsTex}$. Ces deux solutions correspondent aux pentes des deux tangentes.<br> On en déduit l'ordonnées à l'origine de chaque droite en substituant la valeur trouvée pour $a$ dans $b=${y1}${ecritureAlgebriqueSauf1(-x1)}a$.<br>`
        const a2 = new FractionEtendue(
          c * r + x1 * (y2 - y1) + x2 * y1 - x2 * y2,
          r ** 2 - (x1 - x2) ** 2,
        )
        const a1 = new FractionEtendue(
          -c * r + x1 * (y2 - y1) + x2 * y1 - x2 * y2,
          r ** 2 - (x1 - x2) ** 2,
        )
        const b1 = new FractionEtendue(y1, 1).sommeFraction(
          a1.multiplieEntier(-x1),
        )
        const b2 = new FractionEtendue(y1, 1).sommeFraction(
          a2.multiplieEntier(-x1),
        )
        texteCorr += `\\[b=${b1.texFractionSimplifiee} \\text{ si } a=${a1.texFractionSimplifiee}\\quad \\text{ ou } b=${b2.texFractionSimplifiee} \\text{ si } a=${a2.texFractionSimplifiee}\\]
        Les équations des tangentes sont donc :<br>
        \\[${miseEnEvidence(`y=${rienSi1(a1.simplifie())}x${b1.simplifie().texFractionSignee}`)} \\text{ et } ${miseEnEvidence(`y=${rienSi1(a2.simplifie())}x${b2.simplifie().texFractionSignee}`)}.\\]
        
`
        solutions = [eqSecA.solutionsListeTex[0], eqSecA.solutionsListeTex[1]]
      }

      if (this.questionJamaisPosee(i, solutions[0])) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
