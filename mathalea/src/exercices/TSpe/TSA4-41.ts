import { KeyboardType } from '../../lib/interactif/claviers/keyboard'

import { bleuMathalea } from '../../lib/colors'
import { createList } from '../../lib/format/lists'
import {
  ecritureAlgebrique,
  ecritureParentheseSiNegatif,
  reduireAxPlusB,
  rienSi1,
} from '../../lib/outils/ecritures'
import {
  texteEnCouleurEtGras,
  miseEnEvidence,
} from '../../lib/outils/embellissements'
import FractionEtendue from '../../modules/FractionEtendue'
import { randint } from '../../modules/outils'
import ExerciceSimple from '../ExerciceSimple'
export const dateDePublication = '27/12/2025'
export const dateDeModifImportante = '17/01/2026'
export const interactifReady = false
export const titre = 'Résoudre un problème avec le théorème du point fixe'

/**
 * @author Stéphane Guyon
 */
export const uuid = '5d294'

export const refs = {
  'fr-fr': ['TSA4-41'],
  'fr-ch': [],
}
export default class ProblemePointFixe extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierEnsemble
    this.optionsDeComparaison = { ensembleDeNombres: true }
  }

  nouvelleVersion() {
    let a, l, c, d, b: number
    do {
      a = randint(-3, 3, 0)
      l = randint(1, 7) // limite de la suite
      c = randint(-2, 2, [0, a])
      d = randint(-5, 5, [0])
      b = l * (c * l + d - a) // définition de b pour vérifier f(l)=l
    } while (a * d - b * c <= 0 || d / c < 0 || b / d < 0 || b === 0)

    const alpha = 0
    const m = Math.floor(a / c) // partie entière de a/c
    const beta = randint(m + 2, 10)
    const delta = (d - a) * (d - a) - 4 * c * -b
    const determinant = a * d - b * c
    const racineDelta = Math.sqrt(delta)
    const l1 = new FractionEtendue(-d + a + racineDelta, 2 * c) // solution de l'équation f(l)=l
    const l2 = new FractionEtendue(-d + a - racineDelta, 2 * c) // solution de l'équation f(l)=l
    const L1 = l1.valeurDecimale // l1 en number
    const L2 = l2.valeurDecimale // l2 en number
    const u0 = randint(l + 1, beta - 1, [L1, L2]) // choix de u0 dans l'intervalle mais différent des solutions de f(x)=x
    // const variation = u0 < l ? 'croissante' : 'décroissante'
    // EE : J'ai supprimé la définition ci-dessus par celle ci-dessous.
    // EE : Mais je ne comprends pas trop pourquoi car la fonction semble toujours croissante d'ailleurs dans la récurrence qui ...
    // EE : ... indique cette croissance systématique. Je pense que cette ligne est dûe à un copier-coller malheureux depuis un autre exo.
    // EE : Je laisse ainsi néanmoins.
    const variation = determinant > 0 ? 'croissante' : 'décroissante'

    const u1 = new FractionEtendue(a * u0 + b, c * u0 + d)
    const I = `$[${alpha}~;~${beta}]$`
    let nb = 0 // nombre de solutions dans l'intervalle
    const fAlpha = new FractionEtendue(a * alpha + b, c * alpha + d)
    const fBeta = new FractionEtendue(a * beta + b, c * beta + d)
    const question1a = `Montrer que la fonction $f$ est ${variation} sur l'intervalle ${I}.`
    const question1b = `Résoudre dans ${I} l'équation $f(x) = x$. `
    const question1 = createList({
      style: 'alpha',
      items: [question1a, question1b],
    })
    const question2a = `Calculer $u_1$.`
    const question2b = `Montrer que pour tout entier naturel $n$, $${alpha} \\leqslant u_{n+1}\\leqslant u_n \\leqslant ${beta}$. `
    const question2 = createList({
      style: 'alpha',
      items: [question2a, question2b],
    })

    const question3a = `Montrer que la suite $\\left(u_n\\right)$ converge vers un réel $\\ell$.`
    const question3b = `Calculer la valeur de $\\ell$.`
    const question3 = createList({
      style: 'alpha',
      items: [question3a, question3b],
    })

    // *************.   énoncé
    this.question = `Soit $f$ la fonction définie sur l'intervalle ${I} par
			$f(x) = \\dfrac{${reduireAxPlusB(a, b)}}{${reduireAxPlusB(c, d)}}.$<br>
			On considère la suite $\\left(u_n\\right)$ définie par :
			$u_0 = ${u0}$ et pour tout entier naturel $n$, par $u_{n+1} = f\\left(u_n\\right).$<br>`
    this.question += createList({
      style: 'nombres',
      items: [question1, question2, question3],
    })

    // *************.   Réponse question 1
    //
    const reponse1a = `Pour tout $x\\in [${alpha}~;~${beta}]$, on pose <br>
      $u(x)=${reduireAxPlusB(a, b)}$ et $v(x)= ${reduireAxPlusB(c, d)}$.<br>
      Les fonctions $u$ et $v$ sont dérivables sur l'intervalle ${I} et on a : <br>
      $u'(x)=${a}$ et $v'(x)=${c}$.<br>
      De plus, pour tout $x\\in [${alpha}~;~${beta}]$, on a $v(x) \\neq 0$.<br>
      Ainsi, $f=\\dfrac{u}{v}$ est dérivable sur ${I}, et par dérivation d'un quotient on en déduit que : <br>
      $\\begin{aligned}
      f'(x) &= \\dfrac{u'(x)v(x)-u(x)v'(x)}{v(x)^2} \\\\
      &= \\dfrac{${a}(${reduireAxPlusB(c, d)} ) ${ecritureAlgebrique(-c)}(${reduireAxPlusB(a, b)})}{(${reduireAxPlusB(c, d)})^2} \\\\
      &= \\dfrac{${a * d}${ecritureAlgebrique(-b * c)}}{(${reduireAxPlusB(c, d)})^2} \\\\
       &= \\dfrac{${determinant}}{(${reduireAxPlusB(c, d)})^2} \\\\
      \\end{aligned} $ <br>
      Le dénominateur étant strictement positif sur l'intervalle ${I}, on a $f'(x)${determinant > 0 ? '>' : '<'}0$.<br>
     La fonction $f$ est donc strictement ${texteEnCouleurEtGras(variation)} sur l'intervalle ${I}.<br>`

    let reponse1b = `On résout sur ${I} :<br>
     $\\begin{aligned}
      f(x) &= x \\\\
      \\dfrac{${reduireAxPlusB(a, b)}}{${reduireAxPlusB(c, d)}}&= x \\\\
      ${reduireAxPlusB(a, b)}&=${c}x^2 ${ecritureAlgebrique(d)}x\\\\
      ${rienSi1(c)}x^2 ${ecritureAlgebrique(d - a)}x ${ecritureAlgebrique(-b)} &= 0 \\\\
      \\end{aligned}$ <br>
      Le discriminant de ce polynôme du second degré est <br>
      $\\begin{aligned}
      \\Delta &= b^2-4ac\\\\
      &= ${ecritureParentheseSiNegatif(d - a)}^2 - 4 \\times (${ecritureParentheseSiNegatif(c)}) \\times ${ecritureParentheseSiNegatif(-b)} \\\\
      &= ${(d - a) * (d - a)} ${ecritureAlgebrique(4 * c * b)} \\\\
      &=${delta}> 0
      \\end{aligned}$ <br>
      Ainsi, l'équation admet deux solutions réelles distinctes données par <br>
      $\\begin{aligned}
      x_1 &= \\dfrac{-b - \\sqrt{\\Delta}}{2 a} & x_2 &= \\dfrac{-b + \\sqrt{\\Delta}}{2 a} \\\\
      &=\\dfrac{-${ecritureParentheseSiNegatif(d - a)} - \\sqrt{${delta}}}{2 \\times ${ecritureParentheseSiNegatif(c)}} &&= \\dfrac{-${ecritureParentheseSiNegatif(d - a)}+ \\sqrt{${delta}}}{2 \\times ${ecritureParentheseSiNegatif(c)}} \\\\
      &= \\dfrac{${-d + a} - ${racineDelta} }{ ${2 * c}}& &= \\dfrac{${-d + a} +${racineDelta} }{ ${2 * c}} \\\\
       &= ${l1.texFractionSimplifiee}& &= ${l2.texFractionSimplifiee} \\\\
       \\end{aligned}$ <br>`
    // On vérifie que $${alpha} < x_1 < ${beta}$ et $${alpha} < x_2 < ${beta}$.
    // Donc l'équation admet deux solutions dans l'intervalle ${I}.<br>`
    reponse1b += `On vérifie que `
    if (l1.valeurDecimale >= alpha && l1.valeurDecimale <= beta) {
      reponse1b += ` $${l1.texFractionSimplifiee} \\in [${alpha}~;~${beta}]$ `
      nb = nb + 1
    } else {
      reponse1b += ` $${l1.texFractionSimplifiee} \\notin [${alpha}~;~${beta}]$ `
    }
    if (l2.valeurDecimale >= alpha && l2.valeurDecimale <= beta) {
      reponse1b += `et que $${l2.texFractionSimplifiee} \\in [${alpha}~;~${beta}]$.<br>`
      nb = nb + 1
    } else {
      reponse1b += `et que $${l2.texFractionSimplifiee} \\notin [${alpha}~;~${beta}]$.<br>`
    }
    reponse1b += `L'équation $f(x)=x$ admet donc $${miseEnEvidence(nb)}$ solution${nb > 1 ? 's' : ''} dans l'intervalle ${I}.<br>`

    // *************.   Réponse question 2
    //

    const reponse2a = `Pour tout entier naturel $n$, on a $u_{n+1} = f\\left(u_n\\right).$<br>
      En particulier, on a <br>$\\begin{aligned}
      u_1 &= f\\left(u_0\\right) \\\\
      &= f\\left(${u0}\\right) \\\\
      &= \\dfrac{${a}\\times ${ecritureParentheseSiNegatif(u0)} ${ecritureAlgebrique(b)}}{${c} \\times ${ecritureParentheseSiNegatif(u0)} ${ecritureAlgebrique(d)}} \\\\
      &=${u1.texFractionSimplifiee}\\end{aligned}$.<br>`

    let reponse2b = `Pour tout entier naturel $n$, on pose la propriété $\\mathcal{P}_n$ : $${alpha}\\leqslant u_{n+1} \\leqslant u_n \\leqslant ${beta}.$<br>
    On va démontrer par récurrence que la propriété $\\mathcal{P}_n$ est vraie pour tout entier naturel $n$.<br>
    ${texteEnCouleurEtGras('Initiatisation :', bleuMathalea)} <br>
    Pour $n=0$, on a d'après l'énoncé $u_0=${u0}$.<br>
    On a calculé, à la question $2$.a, $u_1=${u1.texFractionSimplifiee}$.<br>
    On vérifie que : $${alpha} \\leqslant u_1 \\leqslant u_0\\leqslant ${beta}.$<br>
    Ainsi, la propriété $\\mathcal{P}_0$ est vraie.<br>
    La propriété est donc initialisée au rang $n=0$.<br>
    ${texteEnCouleurEtGras('Hérédité :', bleuMathalea)} <br>
    Soit $k$ un entier naturel tel que la propriété $\\mathcal{P}_k$ est vraie, c'est-à-dire que $${alpha} \\leqslant u_{k+1}\\leqslant u_k \\leqslant ${beta}.$<br>
    On cherche à montrer qu'alors, la propriété $\\mathcal{P}_{k+1}$ est vraie, c'est-à-dire que $${alpha} \\leqslant u_{k+2}\\leqslant u_{k+1} \\leqslant ${beta}.$<br>
    D'après l'hypothèse de récurrence : <br>`
    reponse2b += `
 $ ${alpha} \\leqslant u_{k+1}\\leqslant u_k \\leqslant ${beta}$<br>
 Par croissance de la fonction $f$ sur ${I}, on en déduit que : <br>
$f(${alpha}) \\leqslant f(u_{k+1})\\leqslant f(u_k) \\leqslant f(${beta}) $<br>
 or $f(${alpha})= \\dfrac{${a}\\times ${ecritureParentheseSiNegatif(alpha)}${ecritureAlgebrique(b)}}{${c} \\times ${alpha}${ecritureAlgebrique(d)}}=${fAlpha.texFractionSimplifiee}$ 
 et $f(${beta})=\\dfrac{${a}\\times ${ecritureParentheseSiNegatif(beta)}${ecritureAlgebrique(b)}}{${c} \\times ${beta}${ecritureAlgebrique(d)}}=${fBeta.texFractionSimplifiee}$, 
   donc : <br>
   $${fAlpha.texFractionSimplifiee} \\leqslant f(u_{k+1})\\leqslant f(u_k) \\leqslant ${fBeta.texFractionSimplifiee}$<br>
   Comme pour tout entier naturel $n$, $f(u_n)=u_{n+1}$, <br>
   $${fAlpha.texFractionSimplifiee} \\leqslant u_{k+2} \\leqslant u_{k+1}\\leqslant ${fBeta.texFractionSimplifiee}$<br>
   
   Ce qui implique que : <br>
  
    $${alpha} \\leqslant ${fAlpha.texFractionSimplifiee} \\leqslant u_{k+2} \\leqslant ${fBeta.texFractionSimplifiee}\\leqslant ${beta} $<br>
    et donc : <br>
  $${alpha} \\leqslant u_{k+2}\\leqslant u_{k+1} \\leqslant ${beta} $.<br>
       Ainsi, la propriété $\\mathcal{P}_{k+1}$ est vraie.<br>
       L'hérédité de la propriété est démontrée pour tout entier naturel $n$.<br>
        ${texteEnCouleurEtGras('Conclusion :', bleuMathalea)} <br>
        La propriété $\\mathcal{P}_n$ est initialisée au rang $n-0$ et héréditaire pour tout entier naturel $n$.<br>
        Par le principe de récurrence, on en déduit qu'elle est vraie pour tout entier naturel $n$. <br>
        Pour tout entier naturel $n$, $${alpha} \\leqslant u_n \\leqslant ${beta}.$<br>`

    // *************.   Réponse question 3
    //
    const reponse3a = `Comme pour tout entier naturel $n$, $${alpha} \\leqslant u_n \\leqslant ${beta}$, on en déduit que le suite $(u_n)$ est bornée. <br>
      D'autre part, pour tout entier naturel $n$, $u_{n+1} \\leqslant u_n $, on en déduit que la suite $(u_n)$ est décroissante.<br>
      La suite $(u_n)$ est donc décroissante et minorée. D'après le théorème de convergence des suites monotones, elle converge donc vers un réel $\\ell$.<br>`
    const reponse3b = `
      La suite $(u_n)$ converge vers un réel $l\\in $ ${I}. <br>
      Pour tout entier naturel $n$, $u_{n+1} = f\\left(u_n\\right).$<br>
      $f$ étant dérivable sur l'intervalle ${I}, elle est continue sur ${I}.<br>
      D'après le théorème du point fixe, la limite $\\ell$ vérifie l'égalité $f(\\ell)=\\ell$.<br>
     La seule solution de cette équation dans ${I} est $l=${l}$, d'après la question $1$.b.<br>
     La suite $(u_n)$ converge donc vers $${miseEnEvidence(l)}$.<br>`

    // *************.   CreateList réponses
    //
    const reponse1 = createList({
      style: 'alpha',
      items: [reponse1a, reponse1b],
    })

    const reponse2 = createList({
      style: 'alpha',
      items: [reponse2a, reponse2b],
    })
    const reponse3 = createList({
      style: 'alpha',
      items: [reponse3a, reponse3b],
    })

    this.reponse = createList({
      style: 'nombres',
      items: [reponse1, reponse2, reponse3],
    })

    // Affichage du corrigé dans la version non interactive
    this.correction = this.reponse
    this.canEnonce = this.question
  }
}
