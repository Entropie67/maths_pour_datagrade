import { courbe } from '../../lib/2d/Courbe'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import RepereBuilder from '../../lib/2d/RepereBuilder'
import { tableauColonneLigne } from '../../lib/2d/tableau'
import { createList } from '../../lib/format/lists'
import { choice } from '../../lib/outils/arrayOutils'
import {
  doubleDeveloppement,
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
} from '../../lib/outils/ecritures'
import { miseEnEvidence, texteGras } from '../../lib/outils/embellissements'
import { rangeMinMax } from '../../lib/outils/nombres'
import { prenomF } from '../../lib/outils/Personne'
import { texNombre } from '../../lib/outils/texNombre'
import { fraction } from '../../modules/fractions'
import { mathalea2d } from '../../modules/mathalea2d'
import { randint } from '../../modules/outils'
import ExerciceBrevetA from '../ExerciceBrevetA'
import { sp } from '../../lib/outils/outilString'

export const uuid = 'fb6e3'
export const refs = {
  'fr-fr': ['3Z1OS-01'],
  'fr-ch': ['1mF3-13'],
}
export const titre = 'Se préparer à la seconde : fonction, équation, calcul littéral'
export const dateDePublication = '06/04/2025'

/**
 * @Author Jean-claude Lhote
 * Cet exerice exploite la nouvelle classe d'exercice que j'ai conçue pour les sujets de brevet
 * Il s'agit d'un exercice de type Brevet Aléatoirisé
 * La méthode privée appliquerLesValeurs permet de générer les valeurs aléatoires et de construire l'énoncé et la correction
 * La méthode versionOriginale permet de générer les valeurs de l'exercice telles qu'elles sont dans le sujet original
 * La méthode versionAleatoire permet de générer des valeurs aléatoires pour l'exercice
 */
export default class ExerciceOS01 extends ExerciceBrevetA {
  constructor() {
    super()
    this.besoinFormulaireCaseACocher = ['Sujet original', false]
    this.sup = false
    this.versionAleatoire()
    this.comment =
      "Cet exercice est le fruit d'une réflexion d'un groupe de professeurs de la circonscription de Commercy. Il a été conçu pour être utilisé lors d'une séance coopérative avec des élèves de 3ème et de 2nde. Il est basé sur le thème de la fonction et de l'équation, et vise à aider les élèves à mieux comprendre ces concepts mathématiques. L'exercice est conçu pour être utilisé en classe, mais peut également être utilisé comme devoir à la maison."
  }

  private appliquerLesValeurs(
    a: number,
    b: number,
    c: number,
    d: number,
    xMin: number,
    xMax: number,
    prenom: string,
  ): void {
    const aa = a * c
    const bb = a * d + b * c
    const cc = b * d
    const f = (x: number) => aa * x ** 2 + bb * x + cc
    const vals = rangeMinMax(Math.round(xMin * 2), Math.round(xMax * 2)).map(
      (e) => e / 2,
    )
    const indexAl = randint(2, Math.round((vals.length - 1) / 2)) * 2 - 1
    this.enonce =
      texteGras(`Partie 1${sp()}: Recherche d'antécédents de $\\mathbf{0}$ par une fonction`) +
      '<br>'
    const entCol = ['x', ...vals.map((el) => texNombre(el, 1))]
    const entLigne = ['f(x)']
    const tabLigne = vals.map((e) => '')
    tabLigne[indexAl] = texNombre(f(vals[indexAl]), 1)
    const tableau = tableauColonneLigne(entCol, entLigne, tabLigne)
    const tableauCorrection = tableauColonneLigne(
      entCol,
      entLigne,
      vals.map((e) => texNombre(f(e), 1)),
    )
    this.enonce += `Soit $f(x) = ${aa}x^2${ecritureAlgebriqueSauf1(bb)}x${ecritureAlgebrique(cc)}$`
    const question11 = `Compléter le tableau de valeurs suivant à l'aide de la calculatrice${sp()}:<br>
${tableau}`
    const question12 = 'En déduire un antécédent de $0$ par la fonction $f$.'
    const question13 =
      "Conjecturer l'existence d'un deuxième antécédent de $0$ par la fonction $f$. Expliquer clairement votre raisonnement."
    const listeQuestion1 = createList({
      items: [question11, question12, question13],
      style: 'nombres',
    })
    const correction11 = `Le tableau de valeurs est${sp()}:<br>
    ${tableauCorrection}`
    const correction12 = `D'après le tableau précédent, un antécédent de $0$ par la fonction $f$ est $${miseEnEvidence(-b / a)}$ car $f(${-b / a})=${0}$.`
    const xInf = Math.floor((-d / c) * 2) / 2
    const xSup = Math.ceil((-d / c) * 2) / 2
    const yInf = f(xInf)
    const ySup = f(xSup)
    const yMax = Math.max(...vals.map((e) => f(e))) + 10
    const yMin = Math.min(...vals.map((e) => f(e))) - 10

    const correction13 = `On remarque que $f(${texNombre(xInf, 1)})=${texNombre(yInf, 1)}$ est ${yInf < 0 ? 'négatif' : 'positif'} et que $f(${texNombre(xSup, 1)})=${texNombre(ySup, 1)}$ est ${ySup < 0 ? 'négatif' : 'positif'}.<br>
    Comme $f$ est une fonction du second degré, c'est donc une parabole qui coupe l'axe des abscisses en deux points.<br>
    Le premier à l'abscisse $${-b / a}$ et le deuxième entre l'abscisse $${texNombre(xInf, 1)}$ et l'abscisse $${texNombre(xSup, 1)}$.`
    this.correction = `${texteGras(`Partie 1${sp()}:`)}<br>${createList({
      items: [correction11, correction12, correction13],
      style: 'nombres',
    })}`

    this.enonce += listeQuestion1
    this.enonce += texteGras(`Partie 2${sp()}: Prouver la conjecture`) + '<br>'
    const question21 = `Montrer que $f(x) = \\left(${a}x${ecritureAlgebrique(b)}\\right)\\left(${c}x${ecritureAlgebrique(d)}\\right)$`
    const developpement = doubleDeveloppement({
      a,
      b,
      c,
      d,
      x: 'x',
      reduire: true,
    })
    const resultat = `${aa}x^2${ecritureAlgebriqueSauf1(bb)}x${ecritureAlgebrique(cc)}`
    const correction21 = `Développons${sp()}:<br>
    $\\begin{aligned}\\left(${a}x${ecritureAlgebrique(b)}\\right)\\left(${c}x${ecritureAlgebrique(d)}\\right)&=${developpement[0]}\\\\
    &=${developpement[1]}\\\\
    ${developpement[2] != null ? `&=${developpement[2]}\\\\` : ''}
    &=${resultat}\\end{aligned}$<br>`
    const question22a = `$${a}x${ecritureAlgebrique(b)}=0$`
    const correctiion22a = `Résolvons${sp()}:<br>$\\begin{aligned}
    ${a}x${ecritureAlgebrique(b)}&=0\\\\
    ${a}x&=${-b}\\\\
    x&=${-b / a}
    \\end{aligned}$`
    const question22b = `$${c}x${ecritureAlgebrique(d)}=0$`
    const correction22b = `Résolvons${sp()}:<br>$\\begin{aligned}
    ${c}x${ecritureAlgebrique(d)}&=0\\\\
    ${c}x&=${-d}\\\\
    x&=${fraction(-d, c).texFSD}
    \\end{aligned}$`
    const quesstion22c = `En déduire les deux solutions de l'équation $\\left(${a}x${ecritureAlgebrique(b)}\\right)\\left(${c}x${ecritureAlgebrique(d)}\\right)=0$`
    const correction22c = `Un produit est nul si l'un de ses facteurs est nul.<br>
    Donc l'équation $\\left(${a}x${ecritureAlgebrique(b)}\\right)\\left(${c}x${ecritureAlgebrique(d)}\\right)=0$ est vérifiée si $${a}x${ecritureAlgebrique(b)}=0$ ou bien si $${c}x${ecritureAlgebrique(d)}=0$.<br>
    Donc les solutions de l'équation $\\left(${a}x${ecritureAlgebrique(b)}\\right)\\left(${c}x${ecritureAlgebrique(d)}\\right)=0$ sont $${-b / a}$ et $${fraction(-d, c).texFSD}$.`
    const question22 = `Résoudre${sp()}:
    ${createList({
      items: [question22a, question22b, quesstion22c],
      style: 'alpha',
    })}`
    const correction22 = createList({
      items: [correctiion22a, correction22b, correction22c],
      style: 'alpha',
    })

    const rep = new RepereBuilder({ xMin, xMax, yMax, yMin })
      .setUniteY(0.2)
      .setUniteX(4)
      .setLabelY({ yMin, yMax, dy: 10 })
      .setThickX({ xMin, xMax, dx: 0.5 })
      .setThickY({ yMin, yMax, dy: 10 })
      .setGrille({
        grilleX: { xMin, xMax, dx: 1 },
        grilleY: { yMin, yMax, dy: 10 },
      })
      .setGrilleSecondaire({
        grilleX: { xMin, xMax, dx: 0.2 },
        grilleY: { yMin, yMax, dy: 2 },
      })
    rep.yLabelEcart = 0.8
    const repBuild = rep.buildCustom()
    const cF = courbe(f, {
      repere: repBuild,
      yUnite: 0.2,
      step: 0.1,
      color: 'ForestGreen',
      xMin,
      xMax,
    })
    const figure = mathalea2d(
      Object.assign(
        { pixelsParCm: 20, scale: 0.4 },
        fixeBordures([...repBuild.objets, cF]),
      ),
      repBuild.objets,
      cF,
    )
    const question23 =
      "En déduire toutes les valeurs de $x$ pour lesquelles la fonction $f$ s'annule."
    const correction23 = `La fonction $f$, d'après les questions $1$ et $2$, s'annule pour $x=${-b / a}$ et $x=${fraction(-d, c).texFSD}$ et seulement pour ces deux valeurs.'`
    const question24 = `${prenom} a obtenu avec un traceur la courbe de la fonction $f$ ci-dessous. Elle annonce que la courbe de la fonction $f$ coupe l'axe des abscisses en $${texNombre(-b / a, 1)}$ et $${texNombre(-d / c, 2)}$. A-t-elle raison${sp()}?<br>${figure}`
    const correction24 = `${prenom} a tort car la fonction $f$ s'annule pour $x=${fraction(-d, c).texFSD}$ et $${fraction(-d, c).texFSD}\\neq ${texNombre(-d / c, 2)}$.<br>
    Cependant, elle en a founi une bonne approximation au centième près.`
    this.enonce += createList({
      items: [question21, question22, question23, question24],
      style: 'nombres',
    })
    this.correction += `${texteGras(`Partie 2${sp()}:`)}<br>${createList({
      items: [correction21, correction22, correction23, correction24],
      style: 'nombres',
    })}`
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(4, -8, -3, 1, -1, 3, 'Pauline')
  }

  versionAleatoire: () => void = () => {
    let a: number
    let b: number
    let c: number
    let d: number
    let x1: number
    let x2: number
    const prenom = prenomF()
    do {
      a = randint(1, 4) * 2
      b = a * randint(1, 3) * choice([-1, 1])
      c = -choice([3, 6])
      d = randint(1, -c - 1, 3)
      x1 = -b / a
      x2 = -d / c
    } while (Math.abs(x1 - x2) < 1 || a * c < -20)
    const racines = [x1, x2].sort((a, b) => a - b)
    const xMin = Math.floor(racines[0]) - 0.5
    const xMax = Math.max(Math.ceil(racines[1]), xMin + 4)
    this.appliquerLesValeurs(
      a,
      b,
      c,
      d,
      xMin,
      xMax,
      Array.isArray(prenom) ? prenom[0] : prenom,
    )
  }
}
