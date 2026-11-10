import { tableauDeVariation } from '../../lib/mathFonctions/etudeFonction'
import { createList } from '../../lib/format/lists'
import { choice } from '../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import {
  ecritureAlgebrique,
  ecritureParentheseSiNegatif,
  reduireAxPlusB,
} from '../../lib/outils/ecritures'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'
import { sp } from '../../lib/outils/outilString'

export const titre =
  'Résoudre un exercice complet avec la fonction exponentielle'
export const dateDePublication = '17/08/2026'
export const uuid = 'd8a71'

export const refs = {
  'fr-fr': ['TSA3-50', 'TCA7-50'],
  'fr-ch': [],
}

/**
 * Étude complète d'une fonction de la forme (ax+b)e^{-x}+cx+d.
 * @author Stéphane Guyon
 */
export default class EtudeFonctionExponentielle extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.nbQuestionsModifiable = false
  }

  nouvelleVersion(): void {
    const a = randint(1, 3)
    const abscisseInflexion = choice([1, 2])
    const b = a * (2 - abscisseInflexion)
    const c = a + randint(1, 3)
    const d = randint(-4, 4)

    const facteurExponentiel = reduireAxPlusB(a, b)
    const facteurExponentielPourProduit =
      b === 0 ? facteurExponentiel : `\\left(${facteurExponentiel}\\right)`
    const partieAffine = reduireAxPlusB(c, d)
    const constanteFPrime = a - b
    const facteurFPrime = reduireAxPlusB(-a, constanteFPrime)
    const constanteFSeconde = b - 2 * a
    const facteurFSeconde = reduireAxPlusB(a, constanteFSeconde)
    const minimumFPrime =
      abscisseInflexion === 0
        ? texNombre(c - a)
        : `${texNombre(c)}-${a === 1 ? '' : texNombre(a)}\\mathrm e^{-${texNombre(abscisseInflexion)}}`
    const minimumFPrimeTableau = context.isTypst
      ? minimumFPrime
      : `\\scriptstyle ${minimumFPrime}`
    const imageInflexion =
      abscisseInflexion === 0
        ? texNombre(2 * a + d)
        : `${texNombre(2 * a)}\\mathrm e^{-${texNombre(abscisseInflexion)}}${ecritureAlgebrique(c * abscisseInflexion + d)}`
    const abscisseIntersection = -b / a
    const ordonneeIntersection = c * abscisseIntersection + d

    const ligneSigneFSeconde = ['Line', 20, '', 10, '-', 20, 'z', 20, '+', 10]
    const ligneVariationsFPrime = [
      'Var',
      10,
      '+/',
      20,
      `-/$${minimumFPrimeTableau}$`,
      20,
      '+/',
      10,
    ]
    const tableauFPrime = tableauDeVariation({
      tabInit: [
        [
          ['$x$', 2, 20],
          ["$f''(x)$", 2, 35],
          ["$f'(x)$", 4, 60],
        ],
        [
          '$-\\infty$',
          25,
          `$${texNombre(abscisseInflexion)}$`,
          25,
          '$+\\infty$',
          25,
        ],
      ],
      tabLines: [ligneSigneFSeconde, ligneVariationsFPrime],
      espcl: 9,
      deltacl: 0.8,
      lgt: 4.2,
      scale: 1,
      hauteurLignes: [18, 18, 30],
    })

    const correctionLimitePlus = `<b>Limite en $+\\infty$</b><br>
    On a :
    $\\begin{aligned}
    \\lim_{x\\to+\\infty}x&=+\\infty
    &\\text{et}\\quad \\lim_{x\\to+\\infty}\\mathrm e^{-x}&=0.
    \\end{aligned}$<br>
    Le produit $x\\mathrm e^{-x}$ présente donc une indétermination de type «${sp()}$0\\times\\infty$${sp()}». Pour lever cette indétermination, on utilise le théorème des croissances comparées :<br><br>
    $\\displaystyle \\lim_{x\\to+\\infty}x\\mathrm e^{-x}
    =\\lim_{x\\to+\\infty}\\dfrac{x}{\\mathrm e^x}
    =0$.<br>
    On en déduit par produit que $\\displaystyle \\lim_{x\\to+\\infty}${facteurExponentielPourProduit}\\mathrm e^{-x}=0$.<br>
    Comme $\\displaystyle \\lim_{x\\to+\\infty}\\left(${partieAffine}\\right)=+\\infty$, par somme, $${miseEnEvidence(`\\displaystyle \\lim_{x\\to+\\infty}f(x)=+\\infty`)}$.`
    const correctionLimiteMoins = `<b>Limite en $-\\infty$</b><br>
    $
    \\displaystyle\\lim_{x\\to-\\infty}${facteurExponentielPourProduit}=-\\infty$ 
   et $ \\displaystyle\\lim_{x\\to-\\infty}\\mathrm e^{-x}=+\\infty$ <br><br>
    Par produit, $\\displaystyle\\lim_{x\\to-\\infty}${facteurExponentielPourProduit}\\mathrm e^{-x}=-\\infty$
    et $ \\displaystyle\\lim_{x\\to-\\infty}\\left(${partieAffine}\\right)=-\\infty$.
   <br>
    Par somme, $${miseEnEvidence(`\\displaystyle \\lim_{x\\to-\\infty}f(x)=-\\infty`)}$.`
    const correctionLimites = createList({
      items: [correctionLimitePlus, correctionLimiteMoins],
      style: 'fleches',
    })

    this.listeQuestions[0] = `On considère la fonction $f$ définie sur $\\mathbb R$ par
    $f(x)=${facteurExponentielPourProduit}\\mathrm e^{-x}+${partieAffine}.$<br>
    On admet que la fonction $f$ est deux fois dérivable sur $\\mathbb R$.<br>
    On appelle $\\mathcal C_f$ sa courbe représentative dans un repère orthogonal du plan. On note $f'$ la fonction dérivée de $f$ et $f''$ sa fonction dérivée seconde.<br><br>
    1. Déterminer les limites de la fonction $f$ en $-\\infty$ et en $+\\infty$.<br><br>
    2. Pour tout réel $x$, calculer $f'(x)$.<br><br>
    3. Montrer que, pour tout réel $x$, $f''(x)=\\left(${facteurFSeconde}\\right)\\mathrm e^{-x}$.<br><br>
    4. Étudier la convexité de la fonction $f$. La courbe $\\mathcal C_f$ admet-elle un point d'inflexion ?<br><br>
    5. Étudier les variations de la fonction $f'$ sur $\\mathbb R$, puis dresser son tableau de variations en y faisant apparaître la valeur exacte de son extremum.<br>
    Les limites de la fonction $f'$ aux bornes de son ensemble de définition ne sont pas attendues.<br><br>
    6. En déduire le signe de la fonction $f'$ sur $\\mathbb R$, puis justifier que la fonction $f$ est strictement croissante sur $\\mathbb R$.<br><br>
    7. On considère la droite $\\Delta$ d'équation $y=${partieAffine}$. Étudier la position relative de la courbe $\\mathcal C_f$ par rapport à la droite $\\Delta$.`

    this.listeCorrections[0] = `<b>1.</b>${correctionLimites}<br>
    <b>2.</b> En utilisant la dérivée d'un produit de fonction dérivable : $(uv)'=u'v+uv'$,<br> 
    avec $u(x)=${facteurExponentiel}$, $\\quad v(x)=\\mathrm e^{-x}$ <br>
    et $u'(x)=${texNombre(a)}$, $\\quad v'(x)=-\\mathrm e^{-x}$ , on obtient :<br>
    $\\begin{aligned}
    f'(x)&=${texNombre(a)}\\mathrm e^{-x}-${facteurExponentielPourProduit}\\mathrm e^{-x}+${texNombre(c)}\\\\
    &=${miseEnEvidence(`\\left(${facteurFPrime}\\right)\\mathrm e^{-x}+${texNombre(c)}`)}.
    \\end{aligned}$<br>
    <b>3.</b> On dérive à nouveau :<br>
    $\\begin{aligned}
    f''(x)&=${texNombre(-a)}\\mathrm e^{-x}-\\left(${facteurFPrime}\\right)\\mathrm e^{-x}\\\\
    &=${miseEnEvidence(`\\left(${facteurFSeconde}\\right)\\mathrm e^{-x}`)}.
    \\end{aligned}$<br>
    <b>4.</b> Pour tout réel $x$, $\\mathrm e^{-x}>0$. Ainsi, $f''(x)$ est du signe du facteur $${facteurFSeconde}$.<br>
    On résout $${facteurFSeconde}>0$ :<br>
    $\\begin{aligned}
    ${facteurFSeconde}>0
    &\\iff ${reduireAxPlusB(a, 0)}>${texNombre(-constanteFSeconde)}\\\\
    &\\iff x>${texNombre(abscisseInflexion)}.
    \\end{aligned}$<br>
    Le facteur $${facteurFSeconde}$ est donc négatif sur $]-\\infty\\,;\\,${texNombre(abscisseInflexion)}[$, nul en $${texNombre(abscisseInflexion)}$ et positif sur $]${texNombre(abscisseInflexion)}\\,;\\,+\\infty[$.<br>
    Ainsi, ${texteEnCouleurEtGras(`$f$ est concave sur $]-\\infty\\,;\\,${texNombre(abscisseInflexion)}]$`)} et ${texteEnCouleurEtGras(`$f$ est convexe sur $[${texNombre(abscisseInflexion)}\\,;\\,+\\infty[$`)}.<br>
    La dérivée seconde s'annule et change de signe en $${texNombre(abscisseInflexion)}$. La courbe $\\mathcal C_f$ admet donc un point d'inflexion au point d'abscisse $${texNombre(abscisseInflexion)}$. Son ordonnée est :<br>
    $\\begin{aligned}
    f(${texNombre(abscisseInflexion)})&=\\left(${texNombre(a)}\\times${ecritureParentheseSiNegatif(abscisseInflexion)}${ecritureAlgebrique(b)}\\right)\\mathrm e^{-${ecritureParentheseSiNegatif(abscisseInflexion)}}+${texNombre(c)}\\times${ecritureParentheseSiNegatif(abscisseInflexion)}${ecritureAlgebrique(d)}\\\\
    &=${imageInflexion}.
    \\end{aligned}$<br>
    Le point d'inflexion de $\\mathcal C_f$ est donc $${miseEnEvidence(`I\\left(${texNombre(abscisseInflexion)}\\,;\\,${imageInflexion}\\right)`)}$.<br>
    <b>5.</b> D'après le signe de $f''$, la fonction $f'$ admet un minimum en $x=${texNombre(abscisseInflexion)}$ :
    $f'(${texNombre(abscisseInflexion)})=${minimumFPrime}$.<br>
    On en déduit le tableau de variations de $f'$ :<br><br>
    ${tableauFPrime}<br>
    ${texteEnCouleurEtGras(`Ainsi, la fonction $f'$ est décroissante sur $]-\\infty\\,;\\,${texNombre(abscisseInflexion)}]$ puis croissante sur $[${texNombre(abscisseInflexion)}\\,;\\,+\\infty[$`)}.<br>
    <b>6.</b> On a $0<\\mathrm e^{-${texNombre(abscisseInflexion)}}<1$. Comme $${texNombre(a)}>0$, on obtient successivement :<br>
    $\\begin{aligned}
    0&<${a === 1 ? '' : texNombre(a)}\\mathrm e^{-${texNombre(abscisseInflexion)}}<${texNombre(a)},\\\\
    -${a === 1 ? '' : texNombre(a)}\\mathrm e^{-${texNombre(abscisseInflexion)}}&>-${texNombre(a)},\\\\
    ${minimumFPrime}&>${texNombre(c - a)}>0.
    \\end{aligned}$<br>
    Ainsi, $f'(${texNombre(abscisseInflexion)})=${minimumFPrime}>0$.<br>
    Le minimum de $f'$ est strictement positif. Par conséquent, $f'(x)>0$ pour tout $x\\in\\mathbb R$ et ${texteEnCouleurEtGras(`la fonction $f$ est strictement croissante sur $\\mathbb R$`)}.<br>
    <b>7.</b> Pour étudier la position relative de la courbe $\\mathcal C_f$ par rapport à la droite $\\Delta$, il faut étudier le signe de $d(x)=f(x)-y$.<br>
    Pour tout réel $x$ :<br>
    $\\begin{aligned}
    d(x)&=f(x)-y\\\\
    &=${facteurExponentielPourProduit}\\mathrm e^{-x}+${partieAffine}-\\left(${partieAffine}\\right)\\\\
    &=${facteurExponentielPourProduit}\\mathrm e^{-x}.
    \\end{aligned}$<br>
    Comme $\\mathrm e^{-x}>0$, cette différence est du signe de $${facteurExponentiel}$. Elle s'annule pour $x=${texNombre(abscisseIntersection)}$.<br>
    ${texteEnCouleurEtGras(`La courbe $\\mathcal C_f$ est donc située en dessous de $\\Delta$ sur $]-\\infty\\,;\\,${texNombre(abscisseIntersection)}[$ et au-dessus de $\\Delta$ sur $]${texNombre(abscisseIntersection)}\\,;\\,+\\infty[$. Elle coupe $\\Delta$ au point $A\\left(${texNombre(abscisseIntersection)}\\,;\\,${texNombre(ordonneeIntersection)}\\right)$.`)}`

    listeQuestionsToContenu(this)
  }
}
