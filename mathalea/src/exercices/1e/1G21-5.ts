import {
  contains,
  isEqual,
  isEquivalentEquation,
  isReduced,
  onlyIrreducibleFractions,
  seq,
} from '../../lib/interactif/checks'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf0,
  ecritureParentheseSiNegatif,
  reduireAxPlusByPlusC,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { pgcd, ppcm } from '../../lib/outils/primalite'
import { texNombre } from '../../lib/outils/texNombre'
import FractionEtendue from '../../modules/FractionEtendue'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'
import { sp } from '../../lib/outils/outilString'
export const interactifReady = true

export const titre = 'Résoudre un problème de synthèse en géométrie repérée'

export const dateDePublication = '4/5/2026'

export const uuid = '828cb'
export const refs = {
  'fr-fr': ['1G21-5'],
  'fr-ch': [],
}

/**
 *
 * @author Stéphane Guyon
 *
 */
export default class SyntheseGeometrieReperee extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 6
    this.nbQuestionsModifiable = false
  }

  nouvelleVersion() {
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const xA = randint(-5, 5, 0)
      const yA = randint(-5, 5, 0)
      let xC, yC: number
      const xB = randint(-5, 5, [xA, 0])
      const yB = randint(-5, 5, [yA, 0])
      do {
        xC = randint(-5, 5, [xA, xB, 0])
        yC = randint(-5, 5, [yA, yB, 0])
      } while ((xC - xA) * (yB - yA) === (yC - yA) * (xB - xA)) // pour éviter que les points soient alignés
      let a = yB - yA // paramètre équation de (AB)
      let b = xA - xB // paramètre équation de (AB)
      let c = -a * xA - b * yA // paramètre équation de (AB)
      const pgcd1 = pgcd(a, b, c) // pour simplifier l'équation de (AB)
      const distanceCarree = (xB - xA) ** 2 + (yB - yA) ** 2 // distance au carré entre A et B
      const distanceEstUnCarreParfait = Number.isInteger(
        Math.sqrt(distanceCarree),
      ) // pour savoir si on peut donner la distance AB sans racine
      const rayoncarre = new FractionEtendue(distanceCarree, 4).simplifie() // rayon au carré du cercle de diamètre [AB]
      const xOmega = new FractionEtendue(xA + xB, 2).simplifie() // abscisse du centre du cercle de diamètre [AB]
      const yOmega = new FractionEtendue(yA + yB, 2).simplifie() // ordonnée du centre du cercle de diamètre [AB]
      const xOmegaOppose = new FractionEtendue(xA + xB, -2).simplifie() // opposé abscisse du centre du cercle de diamètre [AB]
      const yOmegaOppose = new FractionEtendue(yA + yB, -2).simplifie() // opposé ordonnée du centre du cercle de diamètre [AB]
      const termeCarreCercle = (
        variable: 'x' | 'y',
        coordonnee: FractionEtendue,
        coordonneeOpposee: FractionEtendue,
      ) =>
        coordonnee.s === 0
          ? `${variable}^2`
          : `\\left(${variable}${coordonneeOpposee.ecritureAlgebrique}\\right)^2` // Pour gérer abscisse ou ordonnée nulle de Omega dans l'équation du cercle, et éviter (x-0)^2 ou (y-0)^2
      let question1 = 'Déterminer une équation cartésienne de la droite $(AB)$.'
      question1 += ajouteChampTexteMathLive(
        this,
        0,
        KeyboardType.lyceeClassique,
        {
          texteAvant: `<br>Équation de $(AB)$${sp()}: `,
        },
      )
      let question2 =
        'Déterminer une équation cartésienne de la droite $(d)$, perpendiculaire à $(AB)$ et passant par $C$.'
      question2 += ajouteChampTexteMathLive(
        this,
        1,
        KeyboardType.lyceeClassique,
        {
          texteAvant: `<br>Équation de $(d)$${sp()}: `,
        },
      )

      let question3 =
        'Déterminer les coordonnées du point $H$, projeté orthogonal du point $C$ sur la droite $(AB)$.'
      question3 += ajouteChampTexteMathLive(
        this,
        2,
        KeyboardType.lyceeClassique,
        {
          texteAvant: `<br>Coordonnées de $H$${sp()}: `,
        },
      )

      const question4a =
        'Calculer la distance $AB$.' +
        ajouteChampTexteMathLive(this, 3, KeyboardType.lyceeClassique, {
          texteAvant: `<br>Distance $AB$${sp()}: `,
        })
      const question4b =
        'Déterminer les coordonnées du milieu $\\Omega$ du segment $[AB]$.' +
        ajouteChampTexteMathLive(this, 4, KeyboardType.lyceeClassique, {
          texteAvant: `<br>Coordonnées du milieu $\\Omega$${sp()}: `,
        })

      let question5 =
        'En déduire une équation du cercle de centre $\\Omega$ et de diamètre $[AB]$.'

      question5 += ajouteChampTexteMathLive(
        this,
        5,
        KeyboardType.lyceeClassique,
        {
          texteAvant: `<br>Équation du cercle${sp()}: `,
        },
      )
      let correction1 = `Un vecteur directeur de la droite $(AB)$ est $\\overrightarrow{AB} \\begin{pmatrix} ${xB}${ecritureAlgebriqueSauf0(-xA)} \\\\ ${yB}${ecritureAlgebriqueSauf0(-yA)} \\end{pmatrix}$, soit $\\overrightarrow{AB} \\begin{pmatrix} ${xB - xA} \\\\ ${yB - yA} \\end{pmatrix}$.<br>
      On sait qu'un vecteur directeur de coordonnées $\\vec{u} \\begin{pmatrix} -b \\\\ a \\end{pmatrix}$ engendre les droites d'équation cartésienne${sp()}: $ax+by+c=0$, avec $c\\in\\mathbb{R}$.<br>
      Le vecteur $\\overrightarrow{AB}$ engendre donc les droites d'équation cartésienne${sp()}: $${reduireAxPlusByPlusC(a, b, 0)}+c=0$, avec $c\\in\\mathbb{R}$.<br>
      Pour déterminer $c$, on utilise que $A(${xA} ;\\, ${yA})\\in (AB)$, ses coordonnées vérifient donc l'équation cartesienne de $(AB)$${sp()}:<br>
      $${a}\\times${ecritureParentheseSiNegatif(xA)}  ${ecritureAlgebrique(b)}\\times${ecritureParentheseSiNegatif(yA)} + c=0$,<br>
      d'où $c=${c}$.<br>
      On obtient${sp()}:  $${reduireAxPlusByPlusC(a, b, c)}=0$.`

      if (pgcd1 !== 1) {
        a = a / pgcd1
        b = b / pgcd1
        c = c / pgcd1
        correction1 += `<br>En divisant par ${pgcd1}, une équation cartésienne de la droite $(AB)$ est${sp()}: `
      } else if (a < 0 && b < 0) {
        a = -a
        b = -b
        c = -c
        correction1 += `<br>En multipliant par -1, une équation cartésienne de la droite $(AB)$ peut aussi s'écrire${sp()}: `
      } else {
        correction1 += `<br>Une équation cartésienne de la droite $(AB)$ est${sp()}: `
      }

      correction1 += `  $(AB):${miseEnEvidence(`${reduireAxPlusByPlusC(a, b, c)}=0`)}$.`
      const reponse1 = `${reduireAxPlusByPlusC(a, b, c)}=0`

      const a1 = -b // paramètre équation de (d)
      const b1 = a // paramètre équation de (d)
      const c1 = -a1 * xC - b1 * yC // paramètre équation de (d)
      const determinantSysteme = a * b1 - a1 * b // dénominateur coordonnées du point H
      const numerateurXH = c1 * b - c * b1 // numérateur de l'abscisse du point  H
      const numerateurYH = c * a1 - a * c1 // numérateur de l'ordonnée du point  H
      const xH = new FractionEtendue(
        numerateurXH,
        determinantSysteme,
      ).simplifie() // Abscisse du point  H
      const yH = new FractionEtendue(
        numerateurYH,
        determinantSysteme,
      ).simplifie() // Ordonnée du point  H
      const ppcm1 = ppcm(a, a1) // dans la résolution du système
      const ppcm2 = ppcm(b, b1) // dans la résolution du système

      const correction2 = `  Soit $\\vec n\\begin{pmatrix} a \\\\ b \\end{pmatrix}$ un vecteur normal à $(d)$. Comme $(d)$ est perpendiculaire à $(AB)$ alors $\\vec n$ est un vecteur directeur de $(AB)$.<br>
      Avec l'équation $(AB):${reduireAxPlusByPlusC(a, b, c)}=0$, on en déduit que  $\\vec{n}\\begin{pmatrix} ${-b} \\\\ ${a} \\end{pmatrix}$.<br>
      On sait qu'une droite possédant un vecteur normal $\\vec{n}\\begin{pmatrix} a \\\\ b \\end{pmatrix}$ a une équation cartésienne de la forme${sp()}: $ax+by+c=0$ où $c\\in \\mathbb{R}$.<br>
      Le vecteur normal $\\vec{n}\\begin{pmatrix} ${a1} \\\\ ${b1} \\end{pmatrix}$ engendre donc les droites d'équation cartésienne${sp()}:
      $${reduireAxPlusByPlusC(a1, b1, 0)}+c=0$, avec $c\\in\\mathbb{R}$.<br>
      Pour déterminer $c$, on utilise que $C(${xC} ;\\, ${yC})\\in (d)$, ses coordonnées vérifient donc l'équation cartesienne de $(d)$${sp()}:<br>
      $${a1}\\times${ecritureParentheseSiNegatif(xC)}  ${ecritureAlgebrique(b1)}\\times${ecritureParentheseSiNegatif(yC)} + c=0$,<br>
      d'où $c=${c1}$.<br>
      Une équation cartésienne de la droite $(d)$ est${sp()}:  $(d):${miseEnEvidence(`${reduireAxPlusByPlusC(a1, b1, c1)}=0`)}$.`
      const reponse2 = `${reduireAxPlusByPlusC(a1, b1, c1)}=0`
      let correction3 = `Le point $H$, projeté orthogonal du point $C$ sur la droite $(AB)$, est l’intersection de la droite $(AB)$ et de la droite $(d)$.<br>
	      On résout le système formé par les équations cartésiennes de $(AB)$ et de $(d)$ pour déterminer les coordonnées de $H$.<br>
	      $\\begin{cases}
	      ${reduireAxPlusByPlusC(a, b, c)}=0\\\\
	      ${reduireAxPlusByPlusC(a1, b1, c1)}=0
	      \\end{cases}$<br>
	     On décide de résoudre par combinaison linéaire, en commençant par éliminer $x$.<br> (D'autres choix sont possibles et certains sont peut-être plus rapides).<br>`
      if (a1 !== a && ppcm1 === a) {
        correction3 += `En multipliant la deuxième équation par $${texNombre(ppcm1)}$, le système est équivalent à${sp()}: $\\begin{cases}
	      ${reduireAxPlusByPlusC(a, b, c)}=0\\\\
	      ${reduireAxPlusByPlusC(a1 * ppcm1, b1 * ppcm1, c1 * ppcm1)}=0
	      \\end{cases}$<br>`
      } else if (a1 !== a && ppcm1 === a1) {
        correction3 += ` En multipliant la première équation par $${texNombre(ppcm1)}$, le système est équivalent à${sp()}:$\\begin{cases}
        ${reduireAxPlusByPlusC(a * ppcm1, b * ppcm1, c * ppcm1)}=0\\\\
        ${reduireAxPlusByPlusC(a1, b1, c1)}=0
        \\end{cases}$<br>`
      } else if (a1 !== a) {
        correction3 += `En multipliant la première équation par $${texNombre(a1)}$ et la deuxième équation par $${texNombre(a)}$, le système est équivalent à${sp()}:$\\begin{cases}
	      ${reduireAxPlusByPlusC(a * a1, b * a1, c * a1)}=0\\\\
	      ${reduireAxPlusByPlusC(a1 * a, b1 * a, c1 * a)}=0
	      \\end{cases}$<br>`
      }
      correction3 += `   En combinant les deux équations, on obtient${sp()}:<br>
	      $${determinantSysteme}y=${numerateurYH}$, d'où $y=${yH.texFractionSimplifiee}$.<br>
        On procède de la même manière pour éliminer $y$${sp()}: <br>`
      if (b1 !== b && ppcm2 === b) {
        correction3 += `En multipliant la deuxième équation par $${texNombre(ppcm2)}$, le système est équivalent à${sp()}: $\\begin{cases}
        ${reduireAxPlusByPlusC(a, b, c)}=0\\\\
        ${reduireAxPlusByPlusC(a1 * ppcm2, b1 * ppcm2, c1 * ppcm2)}=0
        \\end{cases}$<br>`
      } else if (b1 !== b && ppcm2 === b1) {
        correction3 += ` En multipliant la première équation par $${texNombre(ppcm2)}$, le système est équivalent à${sp()}:$\\begin{cases}
        ${reduireAxPlusByPlusC(a * ppcm2, b * ppcm2, c * ppcm2)}=0\\\\
        ${reduireAxPlusByPlusC(a1, b1, c1)}=0
        \\end{cases}$<br>`
      } else if (b1 !== b) {
        correction3 += `En multipliant la première équation par $${texNombre(b1)}$ et la deuxième équation par $${texNombre(b)}$, le système est équivalent à${sp()}:$\\begin{cases}
        ${reduireAxPlusByPlusC(a * b1, b * b1, -c * b1)}=0\\\\
        ${reduireAxPlusByPlusC(a1 * b, b1 * b, -c1 * b)}=0
        \\end{cases}$.<br>`
      }
      correction3 += `   En combinant les deux équations, on obtient${sp()}:<br>
        $${determinantSysteme}x=${numerateurXH}$, d'où $x=${xH.texFractionSimplifiee}$.<br>`

      correction3 += `  On vérifie que les coordonnées obtenues vérifient bien les équations cartésiennes de $(AB)$ et de $(d)$. <br>
	      Ainsi $\\begin{cases}x_H=${xH.texFractionSimplifiee}\\\\y_H=${yH.texFractionSimplifiee}\\end{cases}$.<br>
	      Les coordonnées du point $H$, projeté orthogonal du point $C$ sur la droite $(AB)$, sont${sp()}: $H${miseEnEvidence(`\\left(${xH.texFractionSimplifiee} ;\\, ${yH.texFractionSimplifiee} \\right)`)}$.`
      const reponse3 = `\\left(${xH.texFractionSimplifiee} ;\\, ${yH.texFractionSimplifiee} \\right)`
      const correction4a = `Pour calculer la distance $AB$, on utilise la formule${sp()}: $AB=\\sqrt{(x_B-x_A)^2+(y_B-y_A)^2}$.<br>
      En appliquant la formule avec les coordonnées de $A$ et $B$, on trouve${sp()}: $AB=\\sqrt{(${xB}${ecritureAlgebriqueSauf0(-xA)})^2+(${yB}${ecritureAlgebriqueSauf0(-yA)})^2}$.<br>
      En simplifiant, on trouve${sp()}:  $${miseEnEvidence(distanceEstUnCarreParfait ? `${Math.sqrt(distanceCarree)}` : `\\sqrt{${distanceCarree}}`)}$`

      const correction4b = `Pour calculer les coordonnées du milieu $\\Omega$ du segment $[AB]$, on utilise le résultat de cours${sp()}: $\\Omega \\left( \\dfrac{x_A+x_B}{2} ;\\, \\dfrac{y_A+y_B}{2} \\right)$.<br>
      En appliquant la formule avec les coordonnées de $A$ et $B$, on trouve${sp()}: $\\Omega \\left( \\dfrac{${xA}${ecritureAlgebriqueSauf0(xB)}}{2} ;\\, \\dfrac{${yA}${ecritureAlgebriqueSauf0(yB)}}{2} \\right)$.<br>
      En simplifiant, on trouve${sp()}: $\\Omega${miseEnEvidence(`\\left(${xOmega.texFractionSimplifiee} ;\\, ${yOmega.texFractionSimplifiee} \\right)`)}$.<br>`

      const reponse4a = `${distanceEstUnCarreParfait ? Math.sqrt(distanceCarree) : `\\sqrt{${distanceCarree}}`}`
      const reponse4b = `\\left(${xOmega.texFractionSimplifiee} ;\\, ${yOmega.texFractionSimplifiee} \\right)`

      let correction5 = `Le diamètre du cercle est $AB$ donc son rayon vaut${sp()}: $r=\\dfrac{AB}{2}=\\dfrac{\\sqrt{${distanceCarree}}}{2}$.<br>
      On en déduit que $r^2=\\dfrac{${distanceCarree}}{4}=  ${rayoncarre.texFractionSimplifiee}$.<br>
      On sait qu'une équation de cercle de centre $\\Omega(x_\\Omega ; y_\\Omega)$ et de rayon $r$ est sous la forme${sp()}: $ (x - x_\\Omega)^2 + (y - y_\\Omega)^2 = r^2 $.<br>
      En appliquant, on en déduit qu'une équation du cercle est
      $\\left(x-${xOmega.ecritureParentheseSiNegatif}\\right)^2 + \\left(y-${yOmega.ecritureParentheseSiNegatif}\\right)^2 = ${rayoncarre.texFractionSimplifiee}$.<br>
	      Finalement,
	      une équation du cercle de centre $\\Omega$ et de diamètre $[AB]$ est${sp()}: `
      correction5 += `$${miseEnEvidence(`${termeCarreCercle('x', xOmega, xOmegaOppose)} + ${termeCarreCercle('y', yOmega, yOmegaOppose)} = ${rayoncarre.texFractionSimplifiee}`)}$.`
      const reponse5 = `${termeCarreCercle('x', xOmega, xOmegaOppose)} + ${termeCarreCercle('y', yOmega, yOmegaOppose)} = ${rayoncarre.texFractionSimplifiee}`

      this.introduction = `Dans un repère orthonormé $(O;\\,\\vec{\\imath} ;\\,\\vec{\\jmath})$, on considère les points
         $A(${xA} ;\\, ${yA})$, $B(${xB} ;\\, ${yB} )$ et $C(${xC} ;\\, ${yC} \\, )$.<br>`

      if (this.questionJamaisPosee(i, a)) {
        handleAnswers(this, 0, {
          // equation droite (AB)
          reponse: {
            value: reponse1,
            compare: seq([
              contains({
                pattern: /=\s*0/,
                feedbackKo:
                  "Tu n'as pas écrit une équation cartésienne de la forme ax + by + c = 0.",
              }),
              isEquivalentEquation(),
            ]),
          },
        })
        handleAnswers(this, 1, {
          // equation droite (d)
          reponse: {
            value: reponse2,
            compare: seq([
              contains({
                pattern: /=\s*0/,
                feedbackKo:
                  "Tu n'as pas écrit une équation cartésienne de la forme ax + by + c = 0.",
              }),
              isEquivalentEquation(),
            ]),
          },
        })
        handleAnswers(this, 2, {
          // coordonnées du point H
          reponse: {
            value: reponse3,
            compare: seq([isEqual(), isReduced(), onlyIrreducibleFractions()]),
          },
        })
        handleAnswers(this, 3, {
          // distance AB
          reponse: {
            value: reponse4a,
            compare: seq([isEqual()]),
          },
        })

        handleAnswers(this, 4, {
          // coordonnées du point Omega
          reponse: {
            value: reponse4b,
            compare: seq([isEqual(), isReduced(), onlyIrreducibleFractions()]),
          },
        })
        handleAnswers(this, 5, {
          // équation du cercle
          reponse: {
            value: reponse5,
            compare: seq([isEqual()]),
          },
        })
        this.listeQuestions = [
          question1,
          question2,
          question3,
          question4a,
          question4b,
          question5,
        ]
        this.listeCorrections = [
          correction1,
          correction2,
          correction3,
          correction4a,
          correction4b,
          correction5,
        ]
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
