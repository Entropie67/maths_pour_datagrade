import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
  rienSi1,
} from '../../lib/outils/ecritures'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { remplisLesBlancs } from '../../lib/interactif/questionMathLive'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { abs } from '../../lib/outils/nombres'
import {
  listeDesDiviseurs,
  premiersEntreBornes,
} from '../../lib/outils/primalite'
import { texNombre } from '../../lib/outils/texNombre'
import { sp } from '../../lib/outils/outilString'
export const titre =
  "Résoudre des problèmes avec des systèmes d'équations du premier degré"
export const interactifReady = true

export const dateDePublication = '21/03/2024'
export const uuid = '6fbf9'
export const refs = {
  'fr-ch': ['11LSFA4G-11'],
  'fr-fr': ['2G34-8'],
}
// export const dateDeModifImportante = '24/10/2021'

/**
 *
 * @author Nathan Scheinmann
 */

export default class systemeEquationsPremDeg extends Exercice {
  constructor() {
    super()

    this.nbQuestions = 3
    this.sup = 3
    this.correctionDetailleeDisponible = true
    this.besoinFormulaireNumerique = [
      'Type de questions',
      3,
      'Problème élèves \n2 : Problème rectangle \n3 : Mélange',
    ]
  }

  nouvelleVersion() {
    if (this.nbQuestions === 1) {
      this.consigne = `Résoudre le problème suivant${sp()}:`
    } else {
      this.consigne = `Résoudre les problèmes suivants${sp()}:`
    }

    let typeQuestionsDisponibles: ('p1' | 'p2')[]
    if (this.sup === 1) {
      typeQuestionsDisponibles = ['p1']
    } else if (this.sup === 2) {
      typeQuestionsDisponibles = ['p2']
    } else {
      typeQuestionsDisponibles = ['p1', 'p2']
    }
    const eqToLatex = function (
      vect: Array<number>,
      nomVal: Array<string>,
      inSys: boolean,
    ) {
      let expr = ''
      let checkPreviousNull = true
      for (let i = 0; i < 3; i++) {
        if (vect.slice(0, 3).every((item) => item === 0) && i === 0) {
          expr = expr + '0'
        } else if (!(vect[i] === 0) && checkPreviousNull) {
          if (nomVal[i] === '') {
            expr = expr + `${texNombre(vect[i], 0)}${nomVal[i]}`
          } else {
            expr = expr + `${rienSi1(vect[i])}${nomVal[i]}`
          }
          checkPreviousNull = false
        } else if (!(vect[i] === 0) && !checkPreviousNull) {
          if (nomVal[i] === '') {
            expr = expr + `${ecritureAlgebrique(vect[i])}${nomVal[i]}`
          } else {
            expr = expr + `${ecritureAlgebriqueSauf1(vect[i])}${nomVal[i]}`
          }
          checkPreviousNull = false
        }
      }
      if (inSys === true) {
        expr = expr + ' &='
      } else {
        expr = expr + '='
      }
      checkPreviousNull = true
      for (let i = 3; i < 6; i++) {
        if (vect.slice(3).every((item) => item === 0) && i === 3) {
          expr = expr + '0'
        } else if (!(vect[i] === 0) && checkPreviousNull) {
          if (nomVal[i] === '') {
            expr = expr + `${texNombre(vect[i], 0)}${nomVal[i]}`
          } else {
            expr = expr + `${rienSi1(vect[i])}${nomVal[i]}`
          }
          checkPreviousNull = false
        } else if (!(vect[i] === 0) && !checkPreviousNull) {
          if (nomVal[i] === '') {
            expr = expr + `${ecritureAlgebrique(vect[i])}${nomVal[i]}`
          } else {
            expr = expr + `${ecritureAlgebriqueSauf1(vect[i])}${nomVal[i]}`
          }
          checkPreviousNull = false
        }
      }
      return expr
    }
    const printSystem = function (eq1: string, eq2: string) {
      let expr = ''
      expr =
        expr +
        `\\begin{cases}\\begin{aligned}${eq1}\\\\${eq2}\\end{aligned}\\end{cases}`
      return expr
    }

    const listeTypeQuestions = combinaisonListes(
      typeQuestionsDisponibles,
      this.nbQuestions,
    )
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      this.comment =
        "Dans cet exercice, des problèmes sont donnés à résoudre. Les solutions sont entières. Le premier problème se résout par la méthode de comparaison et le deuxième problème fait intervenir un membre du second degré qui s'annule. Le système est ensuite résolu par le méthode de combinaison linéaire."
      // Problème 1
      let diff = 1
      let va: number
      let vb: number
      let na: number
      let a: number
      let nb: number
      let b: number
      let tot: number
      let plusMoins: string
      let plusMoinsSigne: string
      let divN: number[]

      do {
        let n: number
        do {
          n = randint(10, 2000, premiersEntreBornes(10, 2000))
          divN = listeDesDiviseurs(n)
        } while (divN.length < 7)
        va = randint(2, Math.ceil(divN.length / 2))
        vb = randint(2, Math.ceil(divN.length / 2), [va])
        na = divN[va]
        a = divN[divN.length - 1 - va]
        nb = divN[vb]
        b = divN[divN.length - 1 - vb]
        tot = na * a
        diff = na - nb
        plusMoins = diff > 0 ? 'plus' : 'moins'
        plusMoinsSigne = diff > 0 ? '-' : '+'
      } while (diff === 1)
      // Problème 2
      const largeur = randint(10, 30)
      const longueur = randint(largeur + 1, 45)
      const perimetre = 2 * (longueur + largeur)
      let cLongueur = randint(5, longueur - 5)
      let cLargeur = randint(5, largeur - 5)
      const choixLongueur = choice([0, 1])
      const choixLargeur = choice([0, 1])
      if (choixLongueur === 0) {
        cLongueur = -cLongueur
      }
      if (choixLargeur === 0) {
        cLargeur = -cLargeur
      }
      const sLongueur = [
        ['-', 'diminue'],
        ['+', 'augmente'],
      ][choixLongueur]
      const sLargeur = [
        ['-', 'diminue'],
        ['+', 'augmente'],
      ][choixLargeur]
      const diffAire =
        cLongueur * cLargeur + longueur * cLargeur + cLongueur * largeur
      const diffAireSigneTexte = diffAire > 0 ? 'augmente' : 'diminue'
      let texte = ''
      let texteCorr = ''
      switch (listeTypeQuestions[i]) {
        case 'p1':
          texte = `On doit répartir des élèves dans des groupes pour une excursion. Si on met $${String(a)}$ élèves par groupe, alors on a besoin de $${String(abs(diff))}$ groupes de ${plusMoins} que si on met $${String(b)}$ élèves par groupe. Combien d'élèves y a-t-il${sp()}?`
          texteCorr =
            texteCorr +
            `On pose \\[\\begin{cases}\\begin{aligned}x&=\\text{Nombre total d'élèves}\\\\ y&=\\text{Le nombre de groupes de } ${String(a)} \\text{ élèves}\\end{aligned}\\end{cases}\\] On a donc  $y$ groupes de $${String(a)}$ élèves et $y${plusMoinsSigne + String(abs(diff))}$ groupes de $${String(b)}$ élèves. On a donc le système suivant${sp()}:<br> \\[${printSystem(eqToLatex([0, a, 0, 1, 0, 0], ['x', 'y', '', 'x', 'y', ''], true), eqToLatex([0, b, 0, 1, 0, 0], ['x', `(y${plusMoinsSigne + abs(diff)})`, '', 'x', 'y', ''], true))}\\] On le résout par substitution et on obtient d'abord que $y=${String(na)}$ et par suite que $x=${texNombre(tot)}$. Le nombre d'élèves est donc $${miseEnEvidence(texNombre(tot))}$.`
          if (this.interactif) {
            texte +=
              '<br>' +
              remplisLesBlancs(
                this,
                i,
                "\\text{Le nombre d'élèves est }%{champ1}",
              )
            handleAnswers(
              this,
              i,
              {
                bareme: (listePoints: number[]) => [listePoints[0], 1],
                champ1: { value: String(tot) },
              },
              { formatInteractif: 'fillInTheBlank' },
            )
          }
          if (this.questionJamaisPosee(i, a, b, tot)) {
            this.listeQuestions[i] = texte
            this.listeCorrections[i] = texteCorr
            i++
          }
          break
        case 'p2':
          texte = `Le périmètre d'un terrain rectangulaire vaut $${String(
            perimetre,
          )}\\,\\text{m}$. Si on ${sLargeur[1]} la largeur d'un terrain rectangulaire de $${String(abs(cLargeur))}\\,\\text{m}$ et on
         ${sLongueur[1]} la longueur de $${String(abs(cLongueur))}\\,\\text{m}$, l'aire du terrain ${diffAireSigneTexte} de $${texNombre(abs(diffAire))}\\,\\text{m}^2$. Déterminer les mesures du terrain${sp()}?`
          texteCorr =
            texteCorr +
            `On pose \\[\\begin{cases}\\begin{aligned}x&=\\text{Largeur initiale}\\\\ y&=\\text{Longueur initiale}\\end{aligned}\\end{cases}\\] On a le système suivant avec la première équation obtenue par l'égalité sur l'aire et la deuxième sur le périmètre${sp()}:<br> \\[${printSystem(eqToLatex([1, 0, 0, 1, 0, diffAire], [`(x${sLargeur[0] + String(abs(cLargeur))})(y${sLongueur[0] + String(abs(cLongueur))})`, 'y', '', 'xy', 'y', ''], true), eqToLatex([2, 2, 0, 0, 0, perimetre], ['x', 'y', '', 'x', 'y', ''], true))}\\] On le résout le système et on obtient d'abord que $x=${largeur}\\,\\text{m}$ et $y=${longueur}\\,\\text{m}$. La largeur du terrain vaut $${miseEnEvidence(largeur)}\\,\\text{m}$ et sa longueur $${miseEnEvidence(longueur)}\\,\\text{m}$.`
          if (this.interactif) {
            texte +=
              '<br>' +
              remplisLesBlancs(
                this,
                i,
                '\\text{La largeur vaut }%{champ1}\\,\\text{m} \\text{ et la longueur vaut }%{champ2}\\,\\text{m}',
              )
            handleAnswers(
              this,
              i,
              {
                bareme: (listePoints: number[]) => [
                  listePoints[0] + listePoints[1],
                  2,
                ],
                champ1: { value: String(largeur) },
                champ2: { value: String(longueur) },
              },
              { formatInteractif: 'fillInTheBlank' },
            )
          }
          if (
            this.questionJamaisPosee(i, largeur, longueur, cLargeur, cLongueur)
          ) {
            this.listeQuestions[i] = texte
            this.listeCorrections[i] = texteCorr
            i++
          }
          break
      }
      cpt++
      listeQuestionsToContenu(this)
    }
  }
}
