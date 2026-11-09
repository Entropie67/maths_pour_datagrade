import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { ecritureParentheseSiNegatif } from '../../lib/outils/ecritures'
import { numAlpha } from '../../lib/outils/outilString'
import Exercice from '../Exercice'

import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif' // fonction qui va préparer l'analyse de la saisie
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { listeQuestionsToContenu } from '../../modules/outils'
/**
 * Problème à résoudre en utilisant les nombres relatifs
 * La dernière question est ouverte (et difficile pour prouver que l'on a trouvé toutes les solutions)
 * @author Matthieu DEVILLERS
 */

export const titre = 'Résoudre un problème avec les relatifs'
export const dateDePublication = '05/10/2024' // fonctions de mise en place des éléments interactifs
export const dateDeModifImportante = '13/10/2024'

export const interactifReady = true

export const uuid = 'a33b9'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}

export default class resoudreProblemeRelatifs extends Exercice {
  constructor() {
    super()

    this.nbQuestions = 1
    this.nbQuestionsModifiable = false
  }

  nouvelleVersion() {
    this.spacing = 2 // Interligne des questions
    this.spacingCorr = 2 // Interligne des réponses
    function solutionsScoreNul(nombQuestions: number, nombPoints: number[]) {
      const solutions: number[][] = [[]]
      for (let n = 0; n < nombQuestions; n++) {
        for (let m = 0; m < nombQuestions - n; m++) {
          if (
            n * nombPoints[0] -
              m * nombPoints[1] -
              (nombQuestions - n - m) * nombPoints[2] ===
              0 &&
            nombQuestions - n - m > 0
          ) {
            solutions.push([n, m, nombQuestions - n - m])
          }
        }
      }
      return solutions
    }
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let Solutions: Array<Array<number>>
      let longueurSolutions: number
      const nombreQuestions = choice([10, 20, 30])
      const nombresPoints = choice([
        [5, 3, 2],
        [7, 5, 3],
        [11, 7, 5],
      ])
      const candidats = combinaisonListes(
        [
          ['Margaux', 2],
          ['Célestin', 1],
          ['Maxime', 1],
          ['Georges', 1],
          ['Clémentine', 2],
          ['Éléonore', 2],
          ['François', 1],
          ['Martine', 2],
        ],
        3,
      )

      let texte = `Dans un jeu télévisé, les candidats doivent répondre à ${nombreQuestions} questions.<br>
      Pour chaque bonne réponse, ils marquent ${nombresPoints[0]} points.<br>
      Pour chaque mauvaise réponse, ils perdent ${nombresPoints[1]} points.<br>
      Enfin pour une absence de réponse, ils perdent ${nombresPoints[2]} points.<br>`

      let texteCorr = ''

      texte += numAlpha(0) + 'Quel est le score maximal à ce jeu ? '
      texte += ajouteChampTexteMathLive(this, 8 * i, KeyboardType.clavierDeBase)
      handleAnswers(this, 8 * i, {
        reponse: { value: String(nombreQuestions * nombresPoints[0]) },
      })
      texteCorr =
        numAlpha(0) +
        `On obtient le score maximal en répondant 
          correctement aux ${nombreQuestions} questions et en marquant ${nombresPoints[0]} points
          à chaque fois. <br>
          Score maximal $ = ${nombreQuestions} \\times ${nombresPoints[0]}$<br>
          $\\phantom{\\text{Score maxima}} = ${miseEnEvidence(String(nombreQuestions * nombresPoints[0]))}$`
      texte += '<br>' + numAlpha(1) + 'Quel est le score minimal à ce jeu ? '
      texte += ajouteChampTexteMathLive(
        this,
        8 * i + 1,
        KeyboardType.clavierDeBase,
      )
      handleAnswers(this, 8 * i + 1, {
        reponse: { value: String(-nombreQuestions * nombresPoints[1]) },
      })
      texteCorr +=
        '<br>' +
        numAlpha(1) +
        `On obtient le score minimal en répondant 
          faux aux ${nombreQuestions} questions et en marquant ${ecritureParentheseSiNegatif(-nombresPoints[1])} points
          à chaque fois. <br>
          Score minimal $ = ${nombreQuestions} \\times ${ecritureParentheseSiNegatif(-nombresPoints[1])}$<br>
          $\\phantom{\\text{Score minima}} = ${miseEnEvidence(String(-nombreQuestions * nombresPoints[1]))}$`
      texte +=
        '<br>' +
        numAlpha(2) +
        `${candidats[0][0]} a répondu à toutes les questions, dont ${nombreQuestions * 0.6} correctement.<br>
           Quel est son score ? `
      texte += ajouteChampTexteMathLive(
        this,
        8 * i + 2,
        KeyboardType.clavierDeBase,
      )
      handleAnswers(this, 8 * i + 2, {
        reponse: {
          value: String(
            nombreQuestions * 0.6 * nombresPoints[0] -
              nombreQuestions * 0.4 * nombresPoints[1],
          ),
        },
      })
      texteCorr +=
        '<br>' +
        numAlpha(2) +
        `${candidats[0][0]} a répondu à ${nombreQuestions} questions en tout,
          dont ${nombreQuestions * 0.6} correctement, donc ${candidats[0][0]} a répondu faux à ${nombreQuestions * 0.4} questions car 
          $ ${nombreQuestions} - ${nombreQuestions * 0.6} = ${nombreQuestions * 0.4}$.<br>
          Score de ` +
        candidats[0][0] +
        ` $= ${nombreQuestions * 0.6} \\times  ${nombresPoints[0]} + ${nombreQuestions * 0.4} \\times ${ecritureParentheseSiNegatif(-nombresPoints[1])}$<br>
          $\\phantom{\\text{Score d ${candidats[0][0]}} }= ${nombreQuestions * 0.6 * nombresPoints[0]} + ${ecritureParentheseSiNegatif(-nombreQuestions * 0.4 * nombresPoints[1])}$<br>
          $\\phantom{\\text{Score d ${candidats[0][0]}} }= ${miseEnEvidence(String(nombreQuestions * 0.6 * nombresPoints[0] - nombreQuestions * 0.4 * nombresPoints[1]))}$`
      texte +=
        '<br>' +
        numAlpha(3) +
        `${candidats[1][0]} n'a répondu qu'à ${nombreQuestions * 0.5} questions et ${nombreQuestions * 0.2}
      de ses réponses sont fausses.<br>
          Quel est son score ? `
      texte += ajouteChampTexteMathLive(
        this,
        8 * i + 3,
        KeyboardType.clavierDeBase,
      )
      handleAnswers(this, 8 * i + 3, {
        reponse: {
          value: String(
            nombreQuestions * 0.3 * nombresPoints[0] -
              nombreQuestions * 0.2 * nombresPoints[1] -
              nombreQuestions * 0.5 * nombresPoints[2],
          ),
        },
      })
      texteCorr +=
        '<br>' +
        numAlpha(3) +
        ` ${candidats[1][0]} n'a répondu qu'à ${nombreQuestions * 0.5} questions et ${nombreQuestions * 0.2} sont fausses, 
        donc ${candidats[1][0]} a répondu correctement à ${nombreQuestions * 0.3} questions car $${nombreQuestions * 0.5} - ${nombreQuestions * 0.2} = ${nombreQuestions * 0.3}$.<br>
         Score de ` +
        candidats[1][0] +
        ` $ = ${nombreQuestions * 0.3} \\times  ${nombresPoints[0]} + ${nombreQuestions * 0.2} \\times ${ecritureParentheseSiNegatif(-nombresPoints[1])} +  ${nombreQuestions * 0.5} \\times ${ecritureParentheseSiNegatif(-nombresPoints[2])}$<br>
         $\\phantom{\\text{Score d ${candidats[1][0]}}} = ${nombreQuestions * 0.3 * nombresPoints[0]} + ${ecritureParentheseSiNegatif(-nombreQuestions * 0.2 * nombresPoints[1])} + ${ecritureParentheseSiNegatif(-nombreQuestions * 0.5 * nombresPoints[2])}$<br>
         $\\phantom{\\text{Score d ${candidats[1][0]}}} = ${miseEnEvidence(String(nombreQuestions * 0.3 * nombresPoints[0] - nombreQuestions * 0.2 * nombresPoints[1] - nombreQuestions * 0.5 * nombresPoints[2]))}$`

      if (candidats[2][1] === 1) {
        texte +=
          '<br>' +
          numAlpha(4) +
          `${candidats[2][0]} a donné ${nombreQuestions * 0.7} mauvaises réponses et il n'a pas répondu aux autres questions.`
      } else {
        texte +=
          '<br>' +
          numAlpha(4) +
          `${candidats[2][0]} a donné ${nombreQuestions * 0.7} mauvaises réponses et elle n'a pas répondu aux autres questions.<br>
      Quel est son score ? `
      }
      texte += ajouteChampTexteMathLive(
        this,
        8 * i + 4,
        KeyboardType.clavierDeBase,
      )
      handleAnswers(this, 8 * i + 4, {
        reponse: {
          value: String(
            -nombreQuestions * 0.7 * nombresPoints[1] -
              nombreQuestions * 0.3 * nombresPoints[2],
          ),
        },
      })
      texteCorr +=
        '<br>' +
        numAlpha(4) +
        `${candidats[2][0]} a ${nombreQuestions * 0.7} réponses fausses et n'a pas répondu à ${nombreQuestions * 0.3} questions.<br>
         Score de ` +
        candidats[2][0] +
        ` $ = ${nombreQuestions * 0.7} \\times  ${ecritureParentheseSiNegatif(-nombresPoints[1])} + ${nombreQuestions * 0.3} \\times ${ecritureParentheseSiNegatif(-nombresPoints[2])}$<br>
         $\\phantom{\\text{Score de${candidats[2][0]}}} = ${ecritureParentheseSiNegatif(-nombreQuestions * 0.7 * nombresPoints[1])} + ${ecritureParentheseSiNegatif(-nombreQuestions * 0.3 * nombresPoints[2])}$<br>
         $\\phantom{\\text{Score de${candidats[2][0]}}} = ${miseEnEvidence(String(-nombreQuestions * 0.7 * nombresPoints[1] - nombreQuestions * 0.3 * nombresPoints[2]))}$`

      if (this.interactif) {
        // Question sans version interactive : il s'agit d'encourager la recherche d'une solution par essai/erreur et le format interactif ne parait pas le plus adapté.
        // De plus techniquement, ce n'est suffisamment simple pour moi.
        // Remi m'a suggéré de tenter quelque chose avec "Remplis les blancs" mais je préfère faire une MR en l'état : c'est utilisable.
      } else {
        texte +=
          '<br>' +
          numAlpha(5) +
          "Est-il possible d'obtenir un score nul à ce jeu ? Si oui, comment ?<br>"
        Solutions = solutionsScoreNul(nombreQuestions, nombresPoints)
        longueurSolutions = Solutions.length - 1
        if (longueurSolutions === 0) {
          texteCorr +=
            '<br>' +
            numAlpha(5) +
            "Il n'est pas possible d'avoir un score nul dans ce jeu"
        } else if (longueurSolutions === 1) {
          texteCorr +=
            '<br>' +
            numAlpha(5) +
            "Il est possible d'avoir un score nul d'une seule façon dans ce jeu : <br>"
          texteCorr +=
            'Solution unique : Nombre de bonnes réponses = ' +
            `$ ${miseEnEvidence(String(Solutions[1][0]))}$` +
            ' ; Nombre de mauvaises réponses = ' +
            `$ ${miseEnEvidence(String(Solutions[1][1]))}$` +
            " ; Nombre d'absence de réponses = " +
            `$ ${miseEnEvidence(String(Solutions[1][2]))}$`
        } else {
          texteCorr +=
            '<br>' +
            numAlpha(5) +
            "Il est possible d'avoir un score nul de " +
            longueurSolutions +
            ' façons différentes dans ce jeu : '
          for (let i = 1; i < longueurSolutions + 1; i++) {
            texteCorr +=
              '<br> Solution n°' +
              i +
              ' : Nombre de bonnes réponses = ' +
              `$ ${miseEnEvidence(String(Solutions[i][0]))}$` +
              ' ; Nombre de mauvaises réponses = ' +
              `$ ${miseEnEvidence(String(Solutions[i][1]))}$` +
              " ; Nombre d'absence de réponses = " +
              `$ ${miseEnEvidence(String(Solutions[i][2]))}$`
          }
        }
      }
      if (
        this.questionJamaisPosee(i, nombreQuestions, nombresPoints.join(''))
      ) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
