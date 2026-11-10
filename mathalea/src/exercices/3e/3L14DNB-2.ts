import { BoiteBuilder } from '../../lib/2d/BoiteBuilder'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { createList } from '../../lib/format/lists'
import { choice, shuffle2tableaux } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
  ecritureParentheseSiNegatif,
} from '../../lib/outils/ecritures'
import { texteItalique, miseEnEvidence, texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { signe } from '../../lib/outils/nombres'
import { context } from '../../modules/context'
import { fraction } from '../../modules/fractions'
import { mathalea2d } from '../../modules/mathalea2d'
import { randint } from '../../modules/outils'
import type { NestedObjetMathalea2dArray } from '../../types/2d'
import ExerciceBrevetA from '../ExerciceBrevetA'
import { sp } from '../../lib/outils/outilString'

export const uuid = '972f7'
export const refs = {
  'fr-fr': ['3L14DNB-2', '3Z1DNB-14'],
  'fr-ch': ['1mCL1-13', '11CTFA3D-3', '11LCFA3D-3', '11LSFA3D-3', '11LSFA3J-5'],
}
export const titre = 'Se préparer au DNB : programme de calcul et calcul littéral'
export const dateDePublication = '25/11/2024'

/**
 * @Author Jean-claude Lhote
 * Cet exerice exploite la nouvelle classe d'exercice que j'ai conçue pour les sujets de brevet
 * Il s'agit d'un exercice de type Brevet Aléatoirisé
 * codé à partir des sources de l'APMEP Antilles-Guyane 06/2024 retravaillées par L'équipe CoopMaths
 * La méthode privée appliquerLesValeurs permet de générer les valeurs aléatoires et de construire l'énoncé et la correction
 * La méthode versionOriginale permet de générer les valeurs de l'exercice telles qu'elles sont dans le sujet original
 * La méthode versionAleatoire permet de générer des valeurs aléatoires pour l'exercice
 */

/*

Voici un programme de calcul :

\begin{figure}[!h]
\begin{center}
\psset{unit=1cm,arrowsize=2pt 3}
\begin{pspicture}(-7,0)(7,8.4)
%\psgrid
\rput(0,0){\fbox{Résultat obtenu à l'arrivée}}
\rput(0,2){\fbox{Multiplier les deux nombres}}
\rput(-3,4){\fbox{Multiplier par 4}}\rput(3,4){\fbox{Soustraire 3}}
\rput(-3,6){\fbox{Ajouter 2}}\rput(3,6){\fbox{Multiplier par 5}}
\rput(0,8){\fbox{Nombre choisi au départ}}
\psline[linewidth=1.5pt]{->}(0,7.7)(-3,6.3)\psline[linewidth=1.5pt]{->}(0,7.7)(3,6.3)
\psline[linewidth=1.5pt]{->}(-3,5.7)(-3,4.3)\psline[linewidth=1.5pt]{->}(3,5.7)(3,4.3)
\psline[linewidth=1.5pt]{->}(-3,3.7)(0,2.3)\psline[linewidth=1.5pt]{->}(3,3.7)(0,2.3)
\psline[linewidth=1.5pt]{->}(0,1.7)(0,0.3)
\end{pspicture}
\end{center}
\end{figure}

\begin{enumerate}
\item Montrer que si on choisit 2 comme nombre de départ, le résultat à l'arrivée est 112.

\item Quel est le résultat obtenu à l'arrivée quand on choisit $-3$ comme nombre de départ ?

\item On choisit $x$ comme nombre de départ.

Parmi les expressions suivantes, lesquelles permettent d'exprimer le résultat à l'arrivée de ce programme de calcul. Aucune justification n'est demandée.

\begin{center}
\begin{tabular}{|c|c|c|c|}
\hline
Expression $A$ & Expression $B$ & Expression $C$ & Expression $D$ \\
\hline
$(x + 2 \times 4)(x \times 5 - 3)$ & $(4 x+ 2)(5x - 3)$ & $(4 x + 8)(5x - 3)$ & $(x + 2) \times 4 \times(5 x - 3)$ \\
\hline
\end{tabular}
\end{center}

\item Trouver les deux nombres de départ qui permettent d'obtenir $0$ à l'arrivée. Expliquer la démarche.

\item Développer et réduire l'expression $B$.

\end{enumerate}

*/
export default class Exercice3L14DNB1 extends ExerciceBrevetA {
  constructor() {
    super()
    this.besoinFormulaireCaseACocher = ['Sujet original', false]
    this.sup = false

    this.introduction =
      texteItalique("D'après l'exercice $2$ du brevet Amérique du Nord 2024.") +
      '<br><br>'

    this.versionAleatoire(0)
  }

  private appliquerLesValeurs(
    add1: number,
    mult1: number,
    mult2: number,
    add2: number,
    x0: number,
    x1: number,
  ) {
    const signe1 = signe(add1) === '+'
    const signe2 = signe(add2) === '+'
    const f = (x: number) => (x + add1) * mult1 * (x * mult2 + add2)
    const gauche = (x: number) => (x + add1) * mult1
    const droite = (x: number) => x * mult2 + add2
    const y0 = f(x0)
    const y1 = f(x1)
    const listeProps = [
      {
        exp: `\\Big(x${ecritureAlgebrique(add1)}\\times ${ecritureParentheseSiNegatif(mult1)}\\Big)\\Big(x\\times ${ecritureParentheseSiNegatif(mult2)}${ecritureAlgebrique(add2)}\\Big)`,
        isGood: false,
      },
      {
        exp: `\\Big(${mult1}x${ecritureAlgebrique(add1)}\\Big)\\Big(${mult2}x${ecritureAlgebrique(add2)}\\Big)`,
        isGood: false,
      },
      {
        exp: `\\Big(${mult1}x${ecritureAlgebrique(add1 * mult1)}\\Big)\\Big(${mult2}x${ecritureAlgebrique(add2)}\\Big)`,
        isGood: true,
      },
      {
        exp: `\\Big(x${ecritureAlgebrique(add1)}\\Big)\\times ${ecritureParentheseSiNegatif(mult1)}\\times\\Big(x\\times ${ecritureParentheseSiNegatif(mult2)}${ecritureAlgebrique(add2)}\\Big)`,
        isGood: true,
      },
    ]
    const props = ['A', 'B', 'C', 'D']
    shuffle2tableaux(listeProps, props)
    const indexB = props.findIndex((el) => el === 'B')
    const expression = listeProps[indexB].exp
    // enonce
    const question3 = `On choisit $x$ comme nombre de départ.<br>
    Parmi les expressions suivantes, lesquelles permettent d'exprimer le résultat à l'arrivée de ce programme de calcul. Aucune justification n'est demandée.<br>
    $\\def\\arraystretch{2}\\begin{array}{|c|c|c|c|}
    \\hline
    \\text{Expression A} & \\text{Expression B} & \\text{Expression C} & \\text{Expression D} \\\\
    \\hline
    ${listeProps.map((el) => el.exp).join(' & ')} \\\\
    \\hline
    \\end{array}$<br>
    <br>`
    const questions = createList({
      items: [
        `Montrer que, si on choisit $${x0}$ comme nombre de départ, le résultat du programme A est $${y0}$.`,
        `Quel est le résultat obtenu à l'arrivée si on choisit $${x1}$ comme nombre de départ${sp()}?`,
        question3,
        "Trouver les deux nombres de départ qui permettent d'obtenir $0$ à l'arrivée. Expliquer la démarche.",
        `Développer et réduire l'expression ${String.fromCharCode(65 + indexB)}.`,
      ],
      style: 'nombres',
    })
    const gauche0 = gauche(x0)
    const droite0 = droite(x0)
    const correction1 = `Tout d'abord, calculons le nombre de gauche du programme${sp()}:<br>
    $\\Big(${x0}${signe1 ? '+' : '-'}${Math.abs(add1)}\\Big)\\times ${mult1} = ${x0 + add1} \\times ${mult1} = ${gauche0}$<br>
    Ensuite, calculons le nombre de droite du programme${sp()}:<br>
    $${x0}\\times ${mult2}${ecritureAlgebrique(add2)} = ${x0 * mult2}${ecritureAlgebrique(add2)} = ${droite0}$<br>
    Enfin, le résultat du programme est${sp()}:<br>
    $${gauche0}\\times${ecritureParentheseSiNegatif(droite0)} = ${miseEnEvidence(y0)}$`
    const gauche1 = gauche(x1)
    const droite1 = droite(x1)
    const correction2 = `Tout d'abord, calculons le nombre de gauche du programme${sp()}:<br>
    $\\Big(${x1}${signe1 ? '+' : '-'}${Math.abs(add1)}\\Big)\\times ${mult1} = ${x1 + add1} \\times ${mult1} = ${gauche1}$<br>
    Ensuite, calculons le nombre de droite du programme${sp()}:<br>
    $${x1}\\times ${mult2}${ecritureAlgebrique(add2)} = ${x1 * mult2}${ecritureAlgebrique(add2)} = ${droite1}$<br>
    Enfin, le résultat du programme est${sp()}:<br>
    $${gauche1}\\times${ecritureParentheseSiNegatif(droite1)} = ${miseEnEvidence(y1)}$`
    const justifications = listeProps
      .map((el, index) => {
        const exp = el.exp
        return `Expression ${String.fromCharCode(65 + index)}${sp()}: $${exp}$ est ${texteEnCouleurEtGras(el.isGood ? 'vraie' : 'fausse')}`
      })
      .filter((el) => el.includes('vraie'))
      .join('<br>')
    const correction3 = `Le nombre de gauche s'exprime en fonction de x comme suit${sp()}:<br>
    $\\Big(x${ecritureAlgebrique(add1)}\\Big)\\times ${mult1} = ${mult1}x${ecritureAlgebrique(mult1 * add1)}$<br>
    Le nombre de droite s'exprime en fonction de x comme suit${sp()}:<br>
    $${mult2}x${ecritureAlgebrique(add2)}$<br>
    Le résultat du programme s'exprime en fonction de x comme suit${sp()}:<br>
    $\\Big(${mult1}x${ecritureAlgebrique(mult1 * add1)}\\Big)\\Big(${mult2}x${ecritureAlgebrique(add2)}\\Big)$ ou $\\Big(x${ecritureAlgebrique(add1)}\\Big)\\times${mult1}\\times\\Big(${mult2}x${ecritureAlgebrique(add2)}\\Big)$<br>`

    const correction4 = `Pour que le résultat du programme soit égal à $0$, il faut que l'un des deux nombres soit égal à $0$.<br>
    Le nombre de gauche est égal à $0$ si $x${signe1 ? '+' : '-'}${Math.abs(add1)} = 0$ donc $x = ${-add1}$.<br>
    Le nombre de droite est égal à $0$ si $${mult2}x${ecritureAlgebrique(add2)} = 0$ soit $${mult2}x = ${-add2}$ et donc $x=${fraction(-add2, mult2).simplifie().texFSD}$.<br>
    Le résultat du programme est égal à $0$ si $x = ${miseEnEvidence(-add1)}$ ou $x=${miseEnEvidence(fraction(-add2, mult2).simplifie().texFSD)}$.`
    const correction5 = `Développons l'expression ${String.fromCharCode(65 + indexB)}${sp()}:<br>
    $\\begin{aligned}${expression}&=${mult1}x\\times${mult2}x+${mult1}x\\times${ecritureParentheseSiNegatif(add2)}${ecritureAlgebrique(add1)}\\times${mult2}x${ecritureAlgebrique(add1)}\\times${ecritureParentheseSiNegatif(add2)}\\\\
    &=${mult1 * mult2}x^2${ecritureAlgebrique(mult1 * add2)}x${ecritureAlgebrique(mult2 * add1)}x${ecritureAlgebrique(add1 * add2)}\\\\
    &=${miseEnEvidence(`${mult1 * mult2}x^2${mult1 * add2 + add1 * mult2 !== 0 ? `${ecritureAlgebriqueSauf1(mult1 * add2 + mult2 * add1)}x` : ''}${ecritureAlgebrique(add1 * add2)}`)}\\end{aligned}$`

    const corrections = createList({
      items: [
        correction1,
        correction2,
        correction3 + justifications,
        correction4,
        correction5,
      ],
      style: 'nombres',
    })
    // création du diagramme svg
    const objets: NestedObjetMathalea2dArray = []
    const resultat = new BoiteBuilder({
      xMin: -4.5,
      yMin: -0.5,
      xMax: 4.5,
      yMax: 0.5,
    })
      .addTextIn({ textIn: "Résultat obtenu à l'arrivée" })
      .render()
    const multiplier = new BoiteBuilder({
      xMin: -4.5,
      yMin: 2,
      xMax: 4.5,
      yMax: 3,
    })
      .addTextIn({ textIn: 'Multiplier les deux nombres' })
      .render()
    const multiplier1 = new BoiteBuilder({
      xMin: -9,
      yMin: 4.5,
      xMax: -4,
      yMax: 5.5,
    })
      .addTextIn({ textIn: `Multiplier par ${mult1}` })
      .render()
    const addition1 = new BoiteBuilder({
      xMin: -8.5,
      yMin: 7,
      xMax: -4.5,
      yMax: 8,
    })
      .addTextIn({
        textIn: `${signe1 ? 'Ajouter' : 'Soustraire'} ${Math.abs(add1)}`,
      })
      .render()
    const addition2 = new BoiteBuilder({
      xMin: 4.5,
      yMin: 4.5,
      xMax: 8.5,
      yMax: 5.5,
    })
      .addTextIn({
        textIn: `${signe2 ? 'Ajouter' : 'Soustraire'} ${Math.abs(add2)}`,
      })
      .render()
    const multiplier2 = new BoiteBuilder({ xMin: 4, yMin: 7, xMax: 9, yMax: 8 })
      .addTextIn({ textIn: `Multiplier par ${mult2}` })
      .render()
    const depart = new BoiteBuilder({
      xMin: -4,
      yMin: 9.5,
      xMax: 4,
      yMax: 10.5,
    })
      .addTextIn({ textIn: 'Nombre choisi au départ' })
      .render()
    const flecheResultat = segment(0, 1.9, 0, 0.6)
    const flecheMultiplierG = segment(-6.5, 4.4, -0.2, 3.1)
    const flecheMultiplierD = segment(6.5, 4.4, 0.2, 3.1)
    const flecheMultiplier2 = segment(6.5, 6.9, 6.5, 5.6)
    const flecheMultiplier1 = segment(-6.5, 6.9, -6.5, 5.6)
    const flecheAddition1 = segment(-0.2, 9.4, -6.5, 8.1)
    const flecheAddition2 = segment(0.2, 9.4, 6.5, 8.1)
    for (const el of [
      flecheResultat,
      flecheMultiplierG,
      flecheMultiplierD,
      flecheMultiplier1,
      flecheMultiplier2,
      flecheAddition1,
      flecheAddition2,
    ]) {
      el.styleExtremites = '->'
      el.epaisseur = 2
    }

    objets.push(
      resultat,
      multiplier,
      multiplier1,
      multiplier2,
      addition1,
      addition2,
      depart,
    )
    objets.push(
      flecheResultat,
      flecheMultiplierG,
      flecheMultiplierD,
      flecheMultiplier1,
      flecheMultiplier2,
      flecheAddition1,
      flecheAddition2,
    )
    const figure = mathalea2d(Object.assign({}, fixeBordures(objets)), objets)
    this.enonce = `Voici un programme de calcul${sp()}:<br>
    ${
      context.isHtml
        ? figure
        : ` \\begin{figure}[!h]
    \\begin{center}
    \\psset{unit=1cm,arrowsize=2pt 3}
    \\begin{pspicture}(-7,0)(7,8.4)
    %\\psgrid
    \\rput(0,0){\\fbox{Résultat obtenu à l'arrivée}}
    \\rput(0,2){\\fbox{Multiplier les deux nombres}}
    \\rput(-3,4){\\fbox{Multiplier par $${mult1}$}}\\rput(3,4){\\fbox{${add2 > 0 ? 'Ajouter' : 'Soustraire'} $${Math.abs(add2)}$}}
    \\rput(-3,6){\\fbox{${add1 > 0 ? 'Ajouter' : 'Soustraire'} $${Math.abs(add1)}$}}\\rput(3,6){\\fbox{Multiplier par $${mult2}$}}
    \\rput(0,8){\\fbox{Nombre choisi au départ}}
    \\psline[linewidth=1.5pt]{->}(0,7.5)(-3,6.5)\\psline[linewidth=1.5pt]{->}(0,7.5)(3,6.5)
    \\psline[linewidth=1.5pt]{->}(-3,5.5)(-3,4.5)\\psline[linewidth=1.5pt]{->}(3,5.5)(3,4.5)
    \\psline[linewidth=1.5pt]{->}(-3,3.5)(0,2.5)\\psline[linewidth=1.5pt]{->}(3,3.5)(0,2.5)
    \\psline[linewidth=1.5pt]{->}(0,1.5)(0,0.5)
    \\end{pspicture}
    \\end{center}
    \\end{figure}`
    }
    ${questions}`
    this.correction = corrections
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(2, 4, 5, -3, 2, -3)
  }

  versionAleatoire: (i: number) => void = (i: number) => {
    let signe1 = 1
    let signe2 = 1
    let add1 = 2
    let add2 = -3
    let mult1 = -2
    let mult2 = 3
    let x0 = 2
    let x1 = -3
    do {
      signe1 = choice([1, -1])
      signe2 = -signe1
      add1 = randint(2, 5) * signe1
      add2 = randint(2, 5) * signe2
      mult1 = randint(2, 5)
      mult2 = randint(2, 5, mult1)
      x0 = randint(2, 7)
      x1 = -randint(2, 7, x0)
    } while (
      (x0 + add1) * mult1 * (x0 * mult2 + add2) === 0 ||
      (x1 + add1) * mult1 * (x1 * mult2 + add2) === 0
    )

    this.appliquerLesValeurs(add1, mult1, mult2, add2, x0, x1)
  }
}
