import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { texFractionFromString } from '../../lib/outils/deprecatedFractions'
import { ecritureParentheseSiNegatif } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'
export const titre =
  'Utiliser les variations des fonctions de référence pour comparer des images'
export const dateDePublication = '07/01/2022'
/**
 *
 * @author Gilles Mora // Suppression de calcul et mise en place de Decimal par Jean-claude Lhote

*/

export const uuid = '1803c'

export const refs = {
  'fr-fr': ['2F41-1'],
  'fr-ch': ['NR'],
}
export default class ComparerAvecFctRef extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Type de questions',
      5,
      '1 : Carré\n2 : Inverse\n3 : Cube\n4 : Racine carrée\n5 : Mélange',
    ]

    this.nbQuestions = 2
    this.nbCols = 2 // Uniquement pour la sortie LaTeX
    this.nbColsCorr = 2 // Uniquement pour la sortie LaTeX
    this.sup = 1
    this.spacingCorr = 2
  }

  nouvelleVersion() {
    let typeDeQuestionsDisponibles
    if (this.sup === 1) {
      typeDeQuestionsDisponibles = ['carré']
    } else if (this.sup === 2) {
      typeDeQuestionsDisponibles = ['inverse']
    } else if (this.sup === 3) {
      typeDeQuestionsDisponibles = ['cube']
    } else if (this.sup === 4) {
      typeDeQuestionsDisponibles = ['racine carrée']
    } else {
      typeDeQuestionsDisponibles = [
        'carré',
        'carré',
        'inverse',
        'cube',
        'racine carrée',
      ]
    }
    const listeFractions1 = [
      [1, 2],
      [2, 3],
      [3, 4],
      [2, 5],
      [4, 5],
      [5, 6],
      [2, 7],
      [4, 7],
      [6, 7],
      [3, 8],
      [7, 8],
      [2, 9],
      [5, 9],
      [8, 9],
      [1, 11],
      [3, 11],
      [5, 11],
      [7, 11],
      [9, 11],
      [10, 11],
      [3, 13],
      [7, 13],
    ]
    const listeFractions2 = [
      [1, 3],
      [1, 4],
      [1, 5],
      [3, 5],
      [1, 6],
      [1, 7],
      [3, 7],
      [5, 7],
      [1, 8],
      [5, 8],
      [1, 9],
      [4, 9],
      [7, 9],
      [2, 11],
      [4, 11],
      [6, 11],
      [8, 11],
      [9, 11],
      [1, 13],
      [5, 13],
    ]
    const listeTypeQuestions = combinaisonListes(
      typeDeQuestionsDisponibles,
      this.nbQuestions,
    ) // Tous les types de questions sont posés mais l'ordre diffère à chaque "cycle"
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; ) {
      // Boucle principale où i+1 correspond au numéro de la question
      let texte = ''
      let texteCorr = ''
      const variables: number[] = []
      switch (
        listeTypeQuestions[i] // Suivant le type de question, le contenu sera différent
      ) {
        case 'carré':
          {
            const N = randint(1, 3)
            let a: number
            let b: number
            if (N === 1) {
              a =
                (randint(0, 5) * 1000 +
                  randint(5, 9) * 100 +
                  randint(5, 9) * 10 +
                  randint(0, 2)) /
                1000
              b = ((2 * randint(1, 9)) / 1000) * choice([1, -1]) + a
              texte = `En utilisant le sens de variation d'une fonction de référence, comparer $${texNombre(a)}^2$ et $${texNombre(b)}^2$.`
              texteCorr = `On doit comparer les carrés de deux nombres. On utilise donc la fonction carré.<br>
            La fonction carré étant strictement croissante sur $[0;+\\infty[$, elle conserve l'ordre. Cela signifie que deux nombres positifs sont rangés dans le même ordre que leurs carrés. <br>
            Autrement dit, si $a$ et $b$ sont deux nombres positifs et si $a < b$, alors $a^2 < b^2$.`

              if (a < b) {
                texteCorr += `<br>Comme $${texNombre(a, 3)}<${texNombre(b, 3)}$,
          alors $${texNombre(a, 3)}^2${miseEnEvidence('<')}${texNombre(b, 3)}^2$.`
              } else {
                texteCorr += `<br>Comme $${texNombre(b)}<${texNombre(a)}$,
          alors $${texNombre(b, 3)}^2${miseEnEvidence('<')}${texNombre(a, 3)}^2$.`
              }
            } else if (N === 2) {
              const fraction1 = choice(listeFractions1)
              const fraction2 = choice(listeFractions2)
              const n1 = fraction1[0]
              const d1 = fraction1[1]
              const n2 = fraction2[0]
              const d2 = fraction2[1]
              const d3 = d1 * d2
              const n3 = n1 * d2
              const n4 = n2 * d1
              texte = `En utilisant le sens de variation d'une fonction de référence, comparer $\\left(${texFractionFromString(n1, d1)}\\right)^2$ et $\\left(${texFractionFromString(n2, d2)}\\right)^2$.`
              texteCorr = `On doit comparer les carrés de deux nombres. On utilise donc la fonction carré.<br>
            La fonction carré étant strictement croissante sur $[0;+\\infty[$, elle conserve l'ordre. Cela signifie que deux nombres positifs sont rangés dans le même ordre que leurs carrés.<br>
            Autrement dit, si $a$ et $b$ sont deux nombres positifs et si $a < b$, alors $a^2 < b^2$.`
              if (n1 === n2) {
                texteCorr += `<br>On commence par comparer les fractions $${texFractionFromString(n1, d1)}$ et $${texFractionFromString(n2, d2)}$. <br>
            Les fractions ont le même numérateur. La plus grande est celle qui a le plus petit dénominateur. <br>
            `
                if (d1 < d2) {
                  texteCorr += `On a $${d1}<${d2}$, donc $${texFractionFromString(n2, d2)}<${texFractionFromString(n1, d1)}$.<br>
                <br>Comme $${texFractionFromString(n2, d2)}<${texFractionFromString(n1, d1)}$, alors $\\left(${texFractionFromString(n2, d2)}\\right)^2${miseEnEvidence('<')}\\left(${texFractionFromString(n1, d1)}\\right)^2$`
                } else {
                  texteCorr += `On a $${d2}<${d1}$, donc $${texFractionFromString(n1, d1)}<${texFractionFromString(n2, d2)}$.<br>
                <br> Comme, $${texFractionFromString(n1, d1)}<${texFractionFromString(n2, d2)}$, alors $\\left(${texFractionFromString(n1, d1)}\\right)^2${miseEnEvidence('<')}\\left(${texFractionFromString(n2, d2)}\\right)^2$`
                }
              }
              if (d1 === d2) {
                texteCorr += `<br>On commence par comparer les fractions $${texFractionFromString(n1, d1)}$ et $${texFractionFromString(n2, d2)}$. <br>
            Les fractions ont le même dénomérateur. La plus grande est celle qui a le plus grand numérateur. <br>
            `
                if (n2 < n1) {
                  texteCorr += `On a $${n2}<${n1}$, donc $${texFractionFromString(n2, d2)}<${texFractionFromString(n1, d1)}$.<br>
                <br>Comme $${texFractionFromString(n2, d2)}<${texFractionFromString(n1, d1)}$, alors $\\left(${texFractionFromString(n2, d2)}\\right)^2${miseEnEvidence('<')}\\left(${texFractionFromString(n1, d1)}\\right)^2$`
                } else {
                  texteCorr += `On a $${n1}<${n2}$, donc $${texFractionFromString(n1, d1)}<${texFractionFromString(n2, d2)}$.<br>
                <br>Comme, $${texFractionFromString(n1, d1)}<${texFractionFromString(n2, d2)}$, alors $\\left(${texFractionFromString(n1, d1)}\\right)^2${miseEnEvidence('<')}\\left(${texFractionFromString(n2, d2)}\\right)^2$`
                }
              }
              if (n1 !== n2 && d1 !== d2) {
                texteCorr += `<br>On commence par comparer les fractions $${texFractionFromString(n1, d1)}$ et $${texFractionFromString(n2, d2)}$. <br>
          Pour cela on les met au même dénominateur : $${texFractionFromString(n1, d1)}= ${texFractionFromString(n3, d3)}$ et $${texFractionFromString(n2, d2)}= ${texFractionFromString(n4, d3)}$<br>
          `
                if (n3 < n4) {
                  texteCorr += `On a $${n3}<${n4}$, donc $${texFractionFromString(n3, d3)}<${texFractionFromString(n4, d3)}$, soit $${texFractionFromString(n1, d1)}<${texFractionFromString(n2, d2)}$.<br>
                <br>Comme $${texFractionFromString(n1, d1)}<${texFractionFromString(n2, d2)}$, alors $\\left(${texFractionFromString(n1, d1)}\\right)^2${miseEnEvidence('<')}\\left(${texFractionFromString(n2, d2)}\\right)^2$`
                } else {
                  texteCorr += `On a $${n4}<${n3}$, donc $${texFractionFromString(n4, d3)}<${texFractionFromString(n3, d3)}$, soit $${texFractionFromString(n2, d2)}<${texFractionFromString(n1, d1)}$.<br>
                <br>Comme, $${texFractionFromString(n2, d2)}<${texFractionFromString(n1, d1)}$, alors $\\left(${texFractionFromString(n2, d2)}\\right)^2${miseEnEvidence('<')}\\left(${texFractionFromString(n1, d1)}\\right)^2$`
                }
              }
              variables.push(n1, d1, n2, d2, n3, d3, n4)
            } else {
              a =
                -(
                  randint(0, 5) * 1000 +
                  randint(5, 9) * 100 +
                  randint(5, 9) * 10 +
                  randint(0, 2)
                ) / 1000
              b = ((2 * randint(1, 9)) / 1000) * choice([1, -1]) + a
              texte = `En utilisant le sens de variation d'une fonction de référence, comparer $(${texNombre(a, 3)})^2$ et $(${texNombre(b, 3)})^2$.`
              texteCorr = `On doit comparer les carrés de deux nombres. On utilise donc la fonction carré.<br>
            La fonction carré étant strictement décroissante sur $]-\\infty;0]$, elle change l'ordre. <br>
            Cela signifie que deux nombres négatifs sont rangés dans l'ordre inverse de leurs carrés.<br>
            Autrement dit, si $a$ et $b$ sont deux nombres négatifs et si $a < b$, alors $a^2 > b^2$.`

              if (a < b) {
                texteCorr += `<br>Comme $${texNombre(a, 3)}<${texNombre(b, 3)}$, alors $(${texNombre(a, 3)})^2${miseEnEvidence('>')}(${texNombre(b, 3)})^2$`
              } else {
                texteCorr += `<br>Comme $${texNombre(b, 3)}<${texNombre(a, 3)}$, alors $(${texNombre(b, 3)})^2${miseEnEvidence('>')}(${texNombre(a, 3)})^2$`
              }

              variables.push(a, b)
            }
          }
          break
        case 'inverse':
          {
            const N = randint(1, 2)
            let a: number, b: number
            if (N === 1) {
              a = (randint(1, 9) * 10 + randint(5, 9)) / 10
              b = (randint(1, 9) / 10) * choice([1, -1]) + a
              texte = `En utilisant le sens de variation d'une fonction de référence, comparer $\\dfrac{1}{${texNombre(a, 1)}}$ et $\\dfrac{1}{${texNombre(b, 1)}}$.`
              texteCorr = `On doit comparer les inverses de deux nombres. On utilise donc la fonction inverse.<br>
              La fonction inverse étant strictement décroissante sur $]0;+\\infty[$, elle change l'ordre.
              Cela signifie que deux nombres strictement positifs sont rangés dans l'ordre inverse de leurs inverses.<br>
              Autrement dit, si $a$ et $b$ sont deux nombres strictement positifs et si $a < b$, alors $\\dfrac{1}{a} > \\dfrac{1}{b}$.<br>`

              if (a < b) {
                texteCorr += `Comme $${texNombre(a, 1)}<${texNombre(b, 1)}$, alors $\\dfrac{1}{${texNombre(a, 1)}}${miseEnEvidence('>')}\\dfrac{1}{${texNombre(b, 1)}}$`
              } else {
                texteCorr += `Comme $${texNombre(b, 1)}<${texNombre(a, 1)}$, alors $\\dfrac{1}{${texNombre(b, 1)}}${miseEnEvidence('>')}\\dfrac{1}{${texNombre(a, 1)}}$`
              }
            } else {
              a = (randint(1, 9) * 10 + randint(5, 9)) / 10
              b = (randint(1, 9) / 10) * choice([1, -1]) + a
              texte = `En utilisant le sens de variation d'une fonction de référence, comparer $-\\dfrac{1}{${texNombre(a, 1)}}$ et $-\\dfrac{1}{${texNombre(b, 1)}}$.`
              texteCorr = `On doit comparer $-\\dfrac{1}{${texNombre(a, 1)}}$ et $-\\dfrac{1}{${texNombre(b, 1)}}$ soit $\\dfrac{1}{-${texNombre(a, 1)}}$ et $\\dfrac{1}{-${texNombre(b, 1)}}$, c'est-à-dire
                les inverses de deux nombres (négatifs). On utilise donc la fonction inverse.<br>
                La fonction inverse étant strictement décroissante sur $]-\\infty;0[$, elle change l'ordre.
                Cela signifie que deux nombres strictement négatifs sont rangés dans l'ordre inverse de leurs inverses.<br>
                Autrement dit, si $a$ et $b$ sont deux nombres strictement négatifs et si $a < b$, alors $\\dfrac{1}{a} > \\dfrac{1}{b}$.<br>`

              if (a > b) {
                texteCorr += ` Comme $-${texNombre(a, 1)}<-${texNombre(b, 1)}$, alors $\\dfrac{1}{-${texNombre(a, 1)}}${miseEnEvidence('>')}\\dfrac{1}{-${texNombre(b, 1)}}$`
              } else {
                texteCorr += `Comme $-${texNombre(b, 1)}<-${texNombre(a, 1)}$, alors $\\dfrac{1}{-${texNombre(b, 1)}}${miseEnEvidence('>')}\\dfrac{1}{-${texNombre(a, 1)}}$`
              }
            }
            variables.push(a, b)
          }
          break

        case 'cube':
          {
            const a =
              ((randint(-10, 10) * 10 + randint(-9, 9, 0)) / 10) *
              choice([-1, 1])
            const b = (randint(1, 9) / 10) * choice([-1, 1])
            texte = `En utilisant le sens de variation d'une fonction de référence, comparer $${ecritureParentheseSiNegatif(a)}^3$
          et $${ecritureParentheseSiNegatif(b)}^3$.`
            texteCorr = `On doit comparer les cubes de deux nombres. On utilise donc la fonction cube.<br>
          La fonction cube étant strictement croissante sur $\\mathbb{R}$, elle conserve l'ordre.
          Cela signifie que deux nombres réels sont rangés dans le même ordre que leurs cubes.<br>
          Autrement dit, si $a$ et $b$ sont deux nombres réels et si $a < b$, alors $a^3 < b^3$.<br>`
            if (a < b) {
              texteCorr += `Comme $${texNombre(a, 1)}<${texNombre(b, 1)}$, alors $${ecritureParentheseSiNegatif(a)}^3${miseEnEvidence('<')}${ecritureParentheseSiNegatif(b)}^3$.`
            } else {
              texteCorr += `Comme $${texNombre(b, 1)}<${texNombre(a, 1)}$, alors $${ecritureParentheseSiNegatif(b)}^3${miseEnEvidence('<')}${ecritureParentheseSiNegatif(a)}^3$.`
            }
            variables.push(a, b)
          }
          break
        case 'racine carrée':
        default:
          {
            const a = (randint(0, 10) * 10 + randint(6, 9)) / 10
            const b = (randint(1, 5, 0) / 10) * choice([-1, 1]) + a
            texte = `En utilisant le sens de variation d'une fonction de référence, comparer $\\sqrt{${texNombre(a, 1)}}$ et $\\sqrt{${texNombre(b)}}$.`
            texteCorr = `On doit comparer les racines carrées de deux nombres. On utilise donc la fonction racine carrée.<br>
          La fonction racine carrée étant strictement croissante sur $[0;+\\infty[$, elle conserve l'ordre.
          Cela signifie que deux nombres réels positifs sont rangés dans le même ordre que leurs racines carrées.<br>
          Autrement dit, si $a$ et $b$ sont deux nombres réels positifs et si $a < b$, alors $\\sqrt{a} < \\sqrt{b}$.<br>`
            if (a < b) {
              texteCorr += ` Comme $${texNombre(a, 1)}<${texNombre(b, 1)}$, alors
          $\\sqrt{${texNombre(a, 1)}}${miseEnEvidence('<')}\\sqrt{${texNombre(b, 1)}}$.`
            } else {
              texteCorr += ` Comme $${texNombre(b, 1)}<${texNombre(a, 1)}$,
          alors $\\sqrt{${texNombre(b, 1)}}${miseEnEvidence('<')}\\sqrt{${texNombre(a, 1)}}$.`
            }

            variables.push(a, b)
          }
          break
      }

      if (this.listeQuestions.indexOf(texte) === -1) {
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
