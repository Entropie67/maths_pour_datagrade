import { miseEnEvidence } from '../../lib/outils/embellissements'
import { createList } from '../../lib/format/lists'
import { ajouteQuestionMathlive } from '../../lib/interactif/questionMathLive'
import { tableauVariationsFonction } from '../../lib/mathFonctions/etudeFonction'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
  ecritureParentheseSiNegatif,
  reduireAxPlusB,
} from '../../lib/outils/ecritures'
import type FractionEtendue from '../../modules/FractionEtendue'
import { fraction } from '../../modules/fractions'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'
import { texNombre } from '../../lib/outils/texNombre'

export const titre = "Calculer la distance d'un point à une droite"
export const interactifReady = true

export const dateDePublication = '27/03/2025'

export const uuid = '24d3b'
export const refs = {
  'fr-fr': ['TSG2-26'],
  'fr-ch': ['3G96-3'],
}

/**
 * @author Jean-claude Lhote

*/
export default class DistancePointDroite extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.correctionDetailleeDisponible = true
    this.correctionDetaillee = true
    this.spacing = 2
    this.spacingCorr = 3
  }

  nouvelleVersion() {
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      // Quatre champs par problème : le problème i occupe les indices 4i à 4i + 3.
      const champ0 = 4 * i
      let texte = ''
      // On choisit la droite (d) passant par A et de vecteur directeur u
      // On choisit le point B qui n'est pas sur (d)
      let xA: number
      let yA: number
      let zA: number
      let AB1: number
      let AB2: number
      let AB3: number
      let delta: number
      let a: number
      let b: number
      let c: number
      let u1: number
      let u2: number
      let u3: number
      let x0: number
      let y0: number
      let z0: number
      xA = randint(-3, 3) // coordonnée x du point A
      yA = randint(-3, 3) // coordonnée y du point A
      zA = randint(-3, 3) // coordonnée z du point A
      do {
        u1 = randint(-3, 3, 0) // Composante x de u
        u2 = randint(-3, 3, 0) // Composante y de u
        u3 = randint(-3, 3, 0) // Composante z de u
        x0 = randint(-1, 1) // coordonnée x du point A
        y0 = randint(-1, 1) // coordonnée y du point A
        z0 = randint(-1, 1) // coordonnée z du point A

        while (xA === x0 && yA === y0 && zA === z0) {
          xA = randint(-3, 3)
          yA = randint(-3, 3)
          zA = randint(-3, 3)
        }
        // On calcule le vecteur AB
        AB1 = xA - x0
        AB2 = yA - y0
        AB3 = zA - z0
        a = u1 ** 2 + u2 ** 2 + u3 ** 2
        b = -2 * (AB1 * u1 + AB2 * u2 + AB3 * u3)

        c = AB1 ** 2 + AB2 ** 2 + AB3 ** 2
        delta = b ** 2 - 4 * a * c
      } while (
        (AB2 * u3 - AB3 * u2 === 0 &&
          AB3 * u1 - AB1 * u3 === 0 &&
          AB1 * u2 - AB2 * u1 === 0) ||
        delta > 0 ||
        b === 0
      ) // On recommence si AB et u sont colinéaires ou si on a un discriminent négatif, signe que la fonction n'est pas strictement positive.
      // On évite aussi b=0 pour avoir un terme de degré 1
      const exprF = `${a}x^2${ecritureAlgebriqueSauf1(b)}x${ecritureAlgebrique(c)}` // ce qu'il y aura sous le radical
      const xMinimum = fraction(-b, 2 * a).simplifie()
      // Début énoncé
      texte = `On se place dans un repère orthonormé $(O,\\vec{\\imath},\\vec{\\jmath},\\vec{k})$. On considère le point A de coordonnées $\\left(${xA}~;~${yA}~;~${zA}\\right)$ et la droite $(d)$ de représentation paramétrique :<br>`
      texte += `$(d)$ : $\\begin{cases} x = ${reduireAxPlusB(u1, x0, 't')}\\\\ y = ${reduireAxPlusB(u2, y0, 't')} \\quad (t\\in \\mathbb{R})\\\\ z = ${reduireAxPlusB(u3, z0, 't')} \\end{cases}$<br>`
      texte += 'Soit $M$ un point de (d).<br>'

      const question1 =
        'Exprimer $AM$ en fonction de $t$ en détaillant les calculs.' +
        ajouteQuestionMathlive({
          exercice: this,
          question: champ0,
          objetReponse: {
            reponse: { value: `\\sqrt{${exprF}}`.replaceAll('x', 't') },
          },
          reponseParams: { formatInteractif: 'mathalea-mathfield' },
          typeInteractivite: 'mathlive',
          texteAvant: ' $AM(t)=$',
        })
      const correction1 =
        `On a :<br>$\\begin{aligned}AM^2 &=\\left(x_A-x_M\\right)^2+\\left(y_A-y_M\\right)^2+\\left(z_A-z_M\\right)^2\\\\
      &= \\left(${xA}${ecritureAlgebrique(-x0)}${ecritureAlgebriqueSauf1(-u1)}t\\right)^2+\\left(${yA}${ecritureAlgebrique(-y0)}${ecritureAlgebriqueSauf1(-u2)}t\\right)^2+\\left(${zA}${ecritureAlgebrique(-z0)}${ecritureAlgebriqueSauf1(-u3)}t\\right)^2\\\\
     &=\\left(${xA - x0}${ecritureAlgebriqueSauf1(-u1)}t\\right)^2+\\left(${yA - y0}${ecritureAlgebriqueSauf1(-u2)}t\\right)^2+\\left(${zA - z0}${ecritureAlgebriqueSauf1(-u3)}t\\right)^2\\\\
     &=\\left(${u1 ** 2}+${u2 ** 2}+${u3 ** 2}\\right)t^2+2\\left(${-u1 * AB1}${ecritureAlgebrique(-AB2 * u2)}${ecritureAlgebrique(-AB3 * u3)}\\right)t+${AB1 ** 2}+${AB2 ** 2}+${AB3 ** 2}\\\\
     &=${a}t^2${ecritureAlgebriqueSauf1(b)}t${ecritureAlgebrique(c)}\\end{aligned}$<br>
     D'où $AM=${miseEnEvidence(`\\sqrt{${exprF.replaceAll('x', 't')}}`)}$`
          .replaceAll('-0', '')
          .replaceAll('+0', '')
          .replaceAll('(0+', '(')
          .replaceAll('(0-', '(') // ça c'est pour éviter d'avoir des +0 ou -0 dans les réponses

      let question2 = `On considère la fonction $f$ définie par $f(x) = \\sqrt{${exprF}}$.<br>`
      const question2a =
        "Justifier que $f$ est définie et dérivable sur $\\mathbb{R}$ puis calculer $f'(x)$ pour tout x." +
        ajouteQuestionMathlive({
          exercice: this,
          question: champ0 + 1,
          objetReponse: {
            reponse: {
              value: `\\frac{${2 * a}x${ecritureAlgebrique(b)}}{2\\sqrt{${exprF}}}`,
            },
          },
          reponseParams: { formatInteractif: 'mathalea-mathfield' },
          typeInteractivite: 'mathlive',
          texteAvant: ' $f^\\prime(x)=$',
        })
      const correction2a = `Calculons le discriminant de $u(x)=${exprF}$ :<br>$\\Delta=${ecritureParentheseSiNegatif(b)}^2-4\\times${a}\\times${c}=${texNombre(delta)}$.<br>
      Comme $\\Delta<0$, $${exprF}$ est du signe du coefficient du monome de degré $2$ (soit $${a}$).<br>
      $u(x)$ est donc strictement positif pour tout $x\\in\\mathbb{R}$ et $f$ est définie pour tout $x\\in\\mathbb{R}$.<br>
      $f$ est composée de la fonction racine carrée et d'une fonction polynôme de degré $2$ strictement positive.<br>
      La fonction racine carrée est dérivable sur $\\mathbb{R}^*$ et la fonction polynôme de degré $2$ est dérivable sur $\\mathbb{R}$.<br>
      $f$ est donc dérivable sur $\\mathbb{R}$ et $f'=\\dfrac{u'}{2\\sqrt{u}}$.<br>
      $f'(x)=\\dfrac{2\\times${a}x${ecritureAlgebrique(b)}}{2\\sqrt{${exprF}}}=${miseEnEvidence(`\\dfrac{${a}x${ecritureAlgebrique(b / 2)}}{\\sqrt{${exprF}}}`)}$`

      // Fraction pour mettre au même dénominateur
      const frac1 = fraction(xMinimum.den, xMinimum.den)
      // Le minimum de la fonction est atteint pour x = -b/2a
      const minimum = `\\sqrt{${xMinimum.produitFraction(xMinimum).multiplieEntier(a).sommeFraction(xMinimum.multiplieEntier(b)).ajouteEntier(c).simplifie().texFSD}}`

      // Construction du tableau de variations
      const fonctionF = (x: number | FractionEtendue) =>
        Math.sqrt(a * Number(x) ** 2 + b * Number(x) + c)
      const deriveeF = (x: number | FractionEtendue) =>
        (2 * a * Number(x) + b) / (2 * fonctionF(x))
      const tableau = tableauVariationsFonction(fonctionF, deriveeF, -10, 10, {
        ligneDerivee: true,
        substituts: [
          { antVal: -10, antTex: '-\\infty', imgTex: '+\\infty' },
          { antVal: 10, antTex: '+\\infty', imgTex: '+\\infty' },
          {
            antVal: -b / 2 / a,
            antTex: xMinimum.texFSD,
            imgTex: `$f(${xMinimum.texFSD.replace('dfrac', 'frac')})$`,
          },
        ],
      })

      const question2b =
        "Montrer que $f$ admet un minimum en une valeur $\\mu$ que l'on déterminera." +
        ajouteQuestionMathlive({
          exercice: this,
          question: champ0 + 2,
          objetReponse: { reponse: { value: xMinimum.texFSD } },
          reponseParams: { formatInteractif: 'mathalea-mathfield' },
          typeInteractivite: 'mathlive',
          texteAvant: ' $\\mu=$',
        })
      const correction2b = `Son dénominateur étant strictement positif, la dérivée de $f$ est du signe de $${a}x${ecritureAlgebrique(b / 2)}$.<br>
    $f'(x)$ est nulle pour $x=${xMinimum.texFSD}$, négative pour $x<${xMinimum.texFSD}$ et positive pour $x>${xMinimum.texFSD}$.<br>
    $f$ est donc décroissante sur $\\left]-\\infty;${xMinimum.texFSD}\\right]$, croissante sur $\\left[${xMinimum.texFSD};+\\infty\\right[$.<br>
     Elle atteint donc un minimum en $\\mu=${miseEnEvidence(xMinimum.texFSD)}$<br>
     ${tableau}`

      const question2c =
        'Que vaut ce minimum ?' +
        ajouteQuestionMathlive({
          exercice: this,
          question: champ0 + 3,
          objetReponse: { reponse: { value: minimum } },
          reponseParams: { formatInteractif: 'mathalea-mathfield' },
          typeInteractivite: 'mathlive',
          texteAvant: ' $f(\\mu)=$',
        })
      const correctionDetaillee2c = `On a :<br>$\\begin{aligned}
    f\\left(${xMinimum.texFSD}\\right)&=\\sqrt{${a}\\times\\left(${xMinimum.texFSD}\\right)^2${ecritureAlgebrique(b)}\\times${xMinimum.ecritureParentheseSiNegatif}+${c}}\\\\
    &=\\sqrt{${xMinimum.multiplieEntier(a).produitFraction(xMinimum).simplifie().texFSD}${xMinimum.multiplieEntier(b).simplifie().ecritureAlgebrique}${frac1.multiplieEntier(c).ecritureAlgebrique}}\\\\
    &=${minimum}\\end{aligned}$<br>`
      const correction2c = `${this.correctionDetaillee ? correctionDetaillee2c : ''}Le minimum de $f$ est :  $f\\left(${xMinimum.texFSD}\\right)=${miseEnEvidence(minimum)}$`
      const listeC2 = createList({
        items: [correction2a, correction2b, correction2c],
        style: 'alpha',
      })
      const listeQ2 = createList({
        items: [question2a, question2b, question2c],
        style: 'alpha',
      })
      question2 += listeQ2

      const question3 =
        'En déduire les coordonnées du projeté orthogonal de $A$ sur $(d)$.'
      const correctionDetaillee3 = `$M$ : $\\begin{cases} 
      x = ${u1}\\times ${xMinimum.ecritureParentheseSiNegatif} ${frac1.multiplieEntier(x0).ecritureAlgebrique}\\\\[10pt] 
      y = ${u2}\\times ${xMinimum.ecritureParentheseSiNegatif}${frac1.multiplieEntier(y0).ecritureAlgebrique}\\\\[10pt] 
      z = ${u3}\\times ${xMinimum.ecritureParentheseSiNegatif}${frac1.multiplieEntier(z0).ecritureAlgebrique} 
      \\end{cases}$
         soit $\\begin{cases} 
         x = ${xMinimum.multiplieEntier(u1).texFSD}${frac1.multiplieEntier(x0).ecritureAlgebrique}\\\\[10pt] 
         y = ${xMinimum.multiplieEntier(u2).texFSD}${frac1.multiplieEntier(y0).ecritureAlgebrique}\\\\[10pt] 
         z = ${xMinimum.multiplieEntier(u3).texFSD}${frac1.multiplieEntier(z0).ecritureAlgebrique} 
         \\end{cases}$<br>`
      let correction3 = `Soit M, le projeté orthogonal de $A$ sur $(d)$. On sait par définition que $AM$ est la distance minimale entre $A$ et un point de $(d)$.<br>
    D'après l'étude de la fonction précédente, les coordonnées de $M$ sont données par la valeur minimale $t=${xMinimum.texFSD}$ :<br>`
      if (this.correctionDetaillee) {
        correction3 += correctionDetaillee3
      }
      correction3 += `$M\\left( ${miseEnEvidence(`${xMinimum.multiplieEntier(u1).ajouteEntier(x0).texFractionSimplifiee}~;~ ${xMinimum.multiplieEntier(u2).ajouteEntier(y0).texFractionSimplifiee}~;~ ${xMinimum.multiplieEntier(u3).ajouteEntier(z0).texFractionSimplifiee}`)} \\right)$<br>`

      if (this.questionJamaisPosee(i, x0, y0, z0, u1, u2, u3)) {
        this.listeQuestions[i] =
          texte +
          createList({
            items: [question1, question2, question3],
            style: 'nombres',
          })
        this.listeCorrections[i] = createList({
          items: [correction1, listeC2, correction3],
          style: 'nombres',
        })
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
