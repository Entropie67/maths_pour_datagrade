import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import {
  ecritureParentheseSiNegatif,
  reduireAxPlusB,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { pgcd } from '../../lib/outils/primalite'
import { getLang } from '../../lib/stores/languagesStore'
import FractionEtendue from '../../modules/FractionEtendue'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Déterminer une équation réduite de droite'
export const dateDeModifImportante = '08/12/2024'
export const interactifReady = true

/**
 *
 * @author Stéphane Guyon + modif Gilles Mora (droite verticale)
 */
export const uuid = '0cee9'

export const refs = {
  'fr-fr': ['2G31-2'],
  'fr-ch': ['1mF2-2', '11LCFA2E-7', '11LSFA2E-7'],
}
export default class EquationReduiteDeDroites extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Niveau de difficulté',
      2,
      "1 : Détermination équation réduite de droite à partir de 2 points \n2 : Détermination équation réduite à partir d'un point et d'un vecteur directeur.",
    ]

    this.nbQuestions = 1
    this.nbCols = 2 // Uniquement pour la sortie LaTeX
    this.nbColsCorr = 2 // Uniquement pour la sortie LaTeX
    this.sup = 1 // Niveau de difficulté
  }

  nouvelleVersion() {
    const lang = getLang()
    if (lang === 'fr-CH') {
      if (this.sup === 1) {
        this.consigne =
          'Déterminer une équation réduite de ' +
          (this.nbQuestions !== 1 ? 'chaque' : 'la') +
          ' droite $(AB)$ avec les points $A$ et $B$ de coordonnées suivantes.'
      } else {
        this.consigne =
          'Déterminer une équation réduite de ' +
          (this.nbQuestions !== 1 ? 'chaque' : 'la') +
          ' droite $(d)$  passant par le point $A$  et ayant comme pente $m$.'
      }
    } else {
      if (this.sup === 1)
        this.consigne =
          'Soit $\\big(O ; \\vec \\imath,\\vec \\jmath\\big)$ un repère orthogonal.<br>Déterminer une équation réduite de ' +
          (this.nbQuestions !== 1 ? 'chaque' : 'la') +
          ' droite $(AB)$ avec les points $A$ et $B$ de coordonnées suivantes.'
      else
        this.consigne =
          'Soit $\\big(O ; \\vec \\imath,\\vec \\jmath\\big)$ un repère orthogonal.<br>Déterminer une équation réduite de ' +
          (this.nbQuestions !== 1 ? 'chaque' : 'la') +
          ' droite $(d)$  passant par le point $A$  et ayant le vecteur $\\vec {u}$ comme vecteur directeur. $A$ et $\\vec {u}$ ont les coordonnées suivantes.'
    }

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let xA: number
      let xB: number
      let yA: number
      let yB: number
      let xu: number
      let yu: number
      let n: number
      let d: number
      let texte = ''
      let texteCorr = ''
      let reponse: string[] | string
      if (this.sup === 1) {
        // case 'A et B':
        xA = randint(-7, 7)
        yA = randint(-7, 7)
        xB = randint(-7, 7, xA)
        yB = randint(-7, 7, yA)
        xu = xB - xA
        yu = yB - yA
        n = yB - yA
        d = xB - xA
        while (xA === xB && yA === yB) {
          yA = randint(-7, 7)
          yB = randint(-7, 7)
          xA = randint(-7, 7)
          xu = xB - xA
          yu = yB - yA
          n = yB - yA
          d = xB - xA
        }

        texte = `$A(${xA}\\,;\\,${yA})$ et $B(${xB}\\,;\\,${yB})$`
        texteCorr = 'On observe que $ x_B\\neq x_A$.'
        texteCorr +=
          '<br>La droite $(AB)$ a donc une équation du type $y=mx+p$.'
        texteCorr +=
          '<br>On commence par calculer le coefficient directeur $m$ :'
        texteCorr +=
          "<br>On sait d'après le cours : $m=\\dfrac{y_B-y_A}{x_B-x_A}$."
        texteCorr += `<br>On applique avec les données de l'énoncé : $m=\\dfrac{${yB}-${ecritureParentheseSiNegatif(yA)}}{${xB}-${ecritureParentheseSiNegatif(xA)}}`
      } else {
        // case 'A et u':
        xA = randint(-5, 5)
        yA = randint(-5, 5)
        xu = randint(-5, 5, 0)
        yu = randint(-5, 5)
        n = yu
        d = xu
        if (lang === 'fr-CH') {
          texte = `$A(${xA}\\,;\\,${yA})$ et $m`
          texte += `=${new FractionEtendue(n, d).texFraction}`
          if ((pgcd(n, d) !== 1 || d === 1 || d < 0 || n < 0) && n !== 0) {
            texte += `=${new FractionEtendue(n, d).texFractionSimplifiee}`
          }
          texte += '$.'
        } else {
          texte = `$A(${xA}\\,;\\,${yA})$ et $\\vec {u} \\begin{pmatrix}${xu}\\\\${yu}\\end{pmatrix}$`
          texteCorr =
            "On observe que $ \\vec u$ n'est pas colinéaire au vecteur $\\vec \\jmath$, puisque son déplacement horizontal est non nul."
          texteCorr +=
            "<br>La droite $(d)$ n'est donc pas verticale. Elle admet donc une équation du type : $(d) :y=mx+p$."
          texteCorr +=
            '<br>On commence par calculer le coefficient directeur $m$.'
          texteCorr +=
            "<br>On sait d'après le cours que si $\\vec u \\begin{pmatrix}a\\\\b\\end{pmatrix}$, alors $m=\\dfrac{b}{a}$."
          texteCorr += "<br>On applique avec les données de l'énoncé : $m"
        }
      }
      const nomDroite = this.sup === 1 ? 'AB' : 'd'
      if (this.sup === 1 && xA === xB!) {
        texte += ajouteChampTexteMathLive(
          this,
          i,
          KeyboardType.clavierFullOperations,
          {
            texteAvant: `<br>$(${nomDroite}) :$`,
          },
        )
        reponse = [`x=${xA}`, `${xA}=x`]
      } else {
        texte += ajouteChampTexteMathLive(
          this,
          i,
          KeyboardType.clavierFullOperations,
          {
            texteAvant: `<br>$(${nomDroite}) : y=$`,
          },
        )
        reponse = reduireAxPlusB(
          new FractionEtendue(n, d).simplifie(),
          new FractionEtendue(d * yA - n * xA, d).simplifie(),
        )
      }
      handleAnswers(this, i, { reponse: { value: reponse } })
      if (lang !== 'fr-CH') {
        // Correction commune aux deux this.sup
        texteCorr += `=${new FractionEtendue(n, d).texFraction}`
        if ((pgcd(n, d) !== 1 || d === 1 || d < 0 || n < 0) && n !== 0) {
          texteCorr += `=${new FractionEtendue(n, d).texFractionSimplifiee}`
        }
        texteCorr += '$.<br><br>'
      } else {
        texteCorr = ''
      }
      texteCorr += `L'équation de la droite $(${nomDroite})$ est donc de la forme : $y=`
      texteCorr += `${new FractionEtendue(n, d).texFractionSimplifiee} \\times x+p$`
      texteCorr += `<br><br>Comme $A \\in (${nomDroite})$, les coordonnées du point $A$ vérifient l'équation, donc :`
      texteCorr += `<br>$${yA}=${new FractionEtendue(n, d).texFractionSimplifiee} \\times ${ecritureParentheseSiNegatif(xA)} +p$`
      texteCorr += `<br>$\\iff p=${yA}${new FractionEtendue(-n, d).simplifie().texFractionSignee} \\times ${ecritureParentheseSiNegatif(xA)}$`
      texteCorr += `<br>$\\iff p=${new FractionEtendue(d * yA - n * xA, d).texFractionSimplifiee}$`
      texteCorr += `<br>Au final, $(${nomDroite}) : y = ${miseEnEvidence(Array.isArray(reponse) ? reponse[0] : reponse)}$.`
      // if (d * yA - n * xA !== 0) { // cas ou p!=0 :
      if (this.sup === 1 && yA === yB!) {
        texteCorr = `On constate que $y_A=y_B=${yA}$, c'est donc une droite horizontale d'équation $y = ${miseEnEvidence(yA)}$.`
      }
      if (this.sup === 1 && xA === xB!) {
        texteCorr = `On constate que $x_A=x_B=${xA}$, c'est donc une droite verticale d'équation $ ${miseEnEvidence(`x =${xA}`)}$.`
      }
      // }

      if (this.questionJamaisPosee(i, xA, yA, xu, yu)) {
        // Si la question n'a jamais été posée, on en crée une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
