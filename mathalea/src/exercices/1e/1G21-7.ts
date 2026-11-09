import {
  all,
  isEqual,
  isReduced,
  onlyIrreducibleFractions,
} from '../../lib/interactif/checks'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { remplisLesBlancs } from '../../lib/interactif/questionMathLive'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
  ecritureParentheseSiNegatif,
  reduireAxPlusByPlusC,
  rienSi1,
} from '../../lib/outils/ecritures'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import FractionEtendue from '../../modules/FractionEtendue'
export const titre =
  "Déterminer les coordonnées d'un projeté orthogonal sur une droite"
export const dateDePublication = '30/06/2024'
export const interactifReady = true

/**
 *
 * @author Gilles Mora et Nathan Scheinmann (ajout du cas avec la formule)
 */
export const uuid = 'cee3b'

export const refs = {
  'fr-fr': ['1G21-7'],
  'fr-ch': ['3G96-1'],
}

class EqCartVectNormal extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.besoinFormulaireCaseACocher = [
      'Correction avec la formule de projection orthogonale',
      false,
    ]
    this.sup = false
  }

  nouvelleVersion(): void {
    // Lettre entre A et W mais pas L, M, N ou O pour ne pas avoir O dans les 4 points

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''
      const b = randint(-2, 2, 0)
      const a = b * randint(-3, 3, 0)
      const xH = a * randint(-3, 3, 0)
      const yH = randint(-3, 3, 0)
      const xA = a * randint(-3, 3, [0, xH / a])
      const yA = (b / a) * xA - (b / a) * xH + yH // pour que A soit sur la pendiculaire à d passant par A
      const constante = -xH * a - yH * b // pour que H soit sur d
      const xB = 0
      const yB = -constante / b
      const ux = -b
      const uy = a
      const produitScalaire = (xA - xB) * ux + (yA - yB) * uy
      const normeCarree = ux ** 2 + uy ** 2
      const coefficientProjection = new FractionEtendue(
        produitScalaire,
        normeCarree,
      )
      const coordonneeXProjection = new FractionEtendue(
        produitScalaire * ux,
        normeCarree,
      )
      const coordonneeYProjection = new FractionEtendue(
        produitScalaire * uy,
        normeCarree,
      )
      texte = `Dans un repère orthonormé $(O\\,;\\, \\vec{i}\\,,\\,\\vec{j})$, on considère la droite 
         $d$ d'équation 
         $${reduireAxPlusByPlusC(a, b, constante)}=0$ et le point $A(${xA}\\,;\\,${yA})$. <br>
         Déterminer les coordonnées du point $H$ projeté orthogonal de $A$ sur $d$.
          `
      if (this.sup === true) {
        texteCorr = `On sait, d'après le cours, que si une droite $(d)$ a une équation cartésienne de la forme $ax+by+c=0$,
       alors un vecteur directeur de cette droite est   : $\\vec {u} \\begin{pmatrix}-b\\\\a\\end{pmatrix}$.`

        texteCorr += `<br>Un vecteur directeur de la droite $d$ est donc $\\vec u \\begin{pmatrix}${ux}\\\\${uy}\\end{pmatrix}$.<br>
        On prend $x=0$ dans l'équation de $d$ : on obtient $y=${yB}$, donc le point $B(${xB}\\,;\\,${yB})$ appartient à $d$.<br>
        Le point $H$ étant le projeté orthogonal de $A$ sur $d$, le vecteur $\\overrightarrow{BH}$ est le projeté orthogonal du vecteur $\\overrightarrow{BA}$ sur $\\vec u$.<br>
        On utilise donc la formule : 
        $\\overrightarrow{BH}=\\dfrac{\\overrightarrow{BA}\\cdot\\vec u}{\\Vert\\vec u\\Vert^2}\\vec u$.<br>
        Or $\\overrightarrow{BA}\\begin{pmatrix}${xA - xB}\\\\${yA - yB}\\end{pmatrix}$, donc :<br>
        $\\dfrac{\\overrightarrow{BA}\\cdot\\vec u}{\\Vert\\vec u\\Vert^2}
        =\\dfrac{${xA - xB}\\times ${ecritureParentheseSiNegatif(ux)}+${ecritureParentheseSiNegatif(yA - yB)}\\times ${ecritureParentheseSiNegatif(uy)}}{${ux}^2+${uy}^2}
        =${coefficientProjection.texFractionSimplifiee}$.<br>
        Ainsi $\\overrightarrow{BH}=${coefficientProjection.texFSP}\\begin{pmatrix}${ux}\\\\${uy}\\end{pmatrix}
        =\\begin{pmatrix}${coordonneeXProjection.texFractionSimplifiee}\\\\${coordonneeYProjection.texFractionSimplifiee}\\end{pmatrix}$.<br>
        Comme $B(${xB}\\,;\\,${yB})$, on obtient 
        $H(${new FractionEtendue(xB * normeCarree + produitScalaire * ux, normeCarree).texFractionSimplifiee}\\,;\\,${new FractionEtendue(yB * normeCarree + produitScalaire * uy, normeCarree).texFractionSimplifiee})$.<br>`
        texteCorr += `On en déduit que le point $H$ a pour coordonnées $(${miseEnEvidence(texNombre(xH, 0))}\\,;\\,${miseEnEvidence(texNombre(yH, 0))})$.`
      } else {
        texteCorr = `On sait, d'après le cours, que si une droite $(d)$ a une équation cartésienne de la forme $ax+by+c=0$,
       alors un vecteur directeur de cette droite est   : $\\vec {u} \\begin{pmatrix}-b\\\\a\\end{pmatrix}$.`

        texteCorr += `<br>Un vecteur directeur de la droite $d$ est donc $\\vec u \\begin{pmatrix}${-b}\\\\${a}\\end{pmatrix}$.<br>
      En notant $(x_H\\,;\\,y_H)$ les coordonnées du point $H$, on a $\\overrightarrow{AH}\\begin{pmatrix}x_H${ecritureAlgebrique(-xA)}\\\\y_H${ecritureAlgebrique(-yA)}\\end{pmatrix}$.<br>
      $H$ étant le projeté orthogonal de $A$ sur $d$, on a $\\overrightarrow{AH}\\cdot \\vec{u}=0$.<br>
      En appliquant cette égalité avec les coordonnées des vecteurs $\\overrightarrow{AH}$ et $\\vec u$, on obtient :<br>
       $${-b}\\times (x_H${ecritureAlgebrique(-xA)})+${ecritureParentheseSiNegatif(a)}\\times (y_H${ecritureAlgebrique(-yA)})
       =0$ soit $${reduireAxPlusByPlusC(-b, a, xA * b - a * yA, 'x_H', 'y_H')}=0$.`

        texteCorr += ` <br><br>Puisque le point $H$ est sur $d$ ses coordonnées vérifient aussi l'équation cartésienne de $d$, soit : <br>
      $${reduireAxPlusByPlusC(a, b, constante, 'x_H', 'y_H')}=0$.<br>

      Ainsi les coordonnées du point $H$ verifient simultanément les deux équations : 
      $\\begin{cases} ${reduireAxPlusByPlusC(a, b, constante, 'x_H', 'y_H')}=0 \\\\ ${reduireAxPlusByPlusC(-b, a, xA * b - a * yA, 'x_H', 'y_H')}=0 \\end{cases}$
       `
        texteCorr += `<br><br>On résout le système (par substitution en isolant $y_H$ dans la première équation) : <br><br>
       $\\begin{cases} ${reduireAxPlusByPlusC(a, b, constante, 'x_H', 'y_H')}=0 \\\\ ${reduireAxPlusByPlusC(-b, a, xA * b - a * yA, 'x_H', 'y_H')}=0 \\end{cases}
       \\iff \\begin{cases} y_H=${rienSi1(-a / b)}x_H${ecritureAlgebrique(-constante / b)} \\\\ ${reduireAxPlusByPlusC(-b, a, xA * b - a * yA, 'x_H', 'y_H')}=0 \\end{cases}
       \\iff \\begin{cases} y_H=${rienSi1(-a / b)}x_H${ecritureAlgebrique(-constante / b)} \\\\ ${rienSi1(-b)}x_H${ecritureAlgebriqueSauf1(a)}(${rienSi1(-a / b)}x_H${ecritureAlgebrique(-constante / b)})${ecritureAlgebrique(xA * b - a * yA)}=0 \\end{cases}
       \\iff \\begin{cases} y_H=${yH}\\\\ x_H=${xH}\\end{cases}$`
        texteCorr += ` <br><br>On en déduit que le point $H$ a pour coordonnées $(${miseEnEvidence(texNombre(xH, 0))}\\,;\\,${miseEnEvidence(texNombre(yH, 0))})$.`
      }
      if (this.interactif) {
        texte +=
          '<br>Les coordonnées du point $H$ sont :' +
          remplisLesBlancs(this, i, '(%{champ1};{%{champ2}).')
        handleAnswers(
          this,
          i,
          {
            bareme: (listePoints: number[]) => [
              Math.min(listePoints[0], listePoints[1]),
              1,
            ],
            champ1: {
              value: String(xH),
              compare: all([
                isEqual(),
                isReduced(),
                onlyIrreducibleFractions(),
              ]),
            },
            champ2: {
              value: String(yH),
              compare: all([
                isEqual(),
                isReduced(),
                onlyIrreducibleFractions(),
              ]),
            },
          },
          { formatInteractif: 'fillInTheBlank' },
        )
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

export default EqCartVectNormal
