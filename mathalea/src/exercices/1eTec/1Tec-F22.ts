import { createList } from '../../lib/format/lists'
import { choice } from '../../lib/outils/arrayOutils'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf0,
  ecritureAlgebriqueSauf1,
  ecritureParentheseSiMoins,
  rienSi1,
} from '../../lib/outils/ecritures'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'

import { propositionsQcm } from '../../lib/interactif/qcm'

export const titre =
  'Factoriser un polynôme du second degré avec ses deux racines'
export const dateDePublication = '20/3/2026' // La date de publication initiale au format 'jj/mm/aaaa' pour affichage temporaire d'un tag
export const interactifReady = true

export const uuid = '61ff2'
export const refs = {
  'fr-fr': ['1Tec-F23'],
  'fr-ch': [],
}
export function calculImageTrinome(a: number, b: number, c: number, x: number) {
  // écrit le calcul de l'image de x par ax²+bx+c avec a!=0
  let texteCorr = ` $ \\begin{aligned}f(${x})&= `
  // Gestion du terme en x²
  texteCorr +=
    a === -1
      ? `-${ecritureParentheseSiMoins(x)}^2`
      : a === 1
        ? `${ecritureParentheseSiMoins(x)}^2`
        : `${a}\\times${ecritureParentheseSiMoins(x)}^2`
  // Gestion du terme en x
  texteCorr +=
    b === 1
      ? `+${ecritureParentheseSiMoins(x)} ${ecritureAlgebriqueSauf0(c)}`
      : b === -1
        ? `-${ecritureParentheseSiMoins(x)} ${ecritureAlgebriqueSauf0(c)}`
        : b !== 0
          ? `${ecritureAlgebrique(b)}\\times${ecritureParentheseSiMoins(x)} ${ecritureAlgebriqueSauf0(c)}`
          : ``
  // Développement de l'expression
  texteCorr +=
    x === 0
      ? ''
      : `\\\\ &= ${a * x * x}${ecritureAlgebriqueSauf0(b * x)}${ecritureAlgebriqueSauf0(c)}`
  // Résultat final
  texteCorr += `\\\\&=${a * x * x + b * x + c} \\end{aligned}$`
  return texteCorr
}

/**
 *
 * @author Arnaud Meistermann
 */

export default class factoriseTrinomeAvecRacines extends Exercice {
  constructor() {
    super()
    this.consigne = ''

    this.nbQuestions = 4
  }

  nouvelleVersion() {
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''
      const x1 = randint(-9, 9, 0)
      const x2 = randint(-9, 9, [0, x1, -x1])
      const a = choice([1, -1, 2, -2, -3, 3])
      const b = -a * x1 - a * x2
      const c = a * x1 * x2
      texte = `Soit $f$ la fonction définie sur $\\mathbb{R}$ par $f(x)= ${rienSi1(a)}x^2${ecritureAlgebriqueSauf1(b)}x${ecritureAlgebriqueSauf0(c)}$.<br>`
      texte += createList({
        items: [
          `Démontrer que $${x1}$ et $${x2}$ sont les racines de $f$.`,
          `En déduire une forme factorisée de $f$.`,
        ],
        style: 'alpha',
      })
      let reponse1 = `On calcule les images de $${x1}$ et $${x2}$ par $f$.<br>`
      reponse1 += calculImageTrinome(a, b, c, x1) + '<br>'
      reponse1 += `Donc $${miseEnEvidence(`${x1}`)}$ ${texteEnCouleurEtGras('est une racine de ')} $${miseEnEvidence(`f`)}$.<br> `
      reponse1 += calculImageTrinome(a, b, c, x2) + '<br>'
      reponse1 += `Donc $${miseEnEvidence(`${x2}`)}$ ${texteEnCouleurEtGras('est une racine de ')} $${miseEnEvidence(`f`)}$. <br>`
      let reponse2 =
        "On sait que si un polynôme écrit sous la forme $f(x)=ax^2+bx+c$ admet deux racines $x_1$ et $x_2$ alors il peut s'écrire sous la forme $f(x)=a(x-x_1)(x-x_2)$.<br>"
      reponse2 += `Or, $${x1}$ et $${x2}$ sont les racines de $f$ et le coefficient en $x^2$ est $${a}$. <br> Donc $${miseEnEvidence(`f(x)=${rienSi1(a)}(x${ecritureAlgebrique(-x1)})(x${ecritureAlgebrique(-x2)})`)}.$`
      texteCorr += createList({
        items: [reponse1, reponse2],
        style: 'alpha',
      })

      const bonneReponse = `${rienSi1(a)}(x${ecritureAlgebrique(-x1)})(x${ecritureAlgebrique(-x2)})`
      const distracteur1 = `${rienSi1(-a)}(x${ecritureAlgebrique(-x1)})(x${ecritureAlgebrique(-x2)})`
      const distracteur2 = `${rienSi1(a)}(x${ecritureAlgebrique(x1)})(x${ecritureAlgebrique(x2)})`
      const distracteur3 = `${rienSi1(-a)}(x${ecritureAlgebrique(x1)})(x${ecritureAlgebrique(x2)})`

      this.autoCorrection[i] = {
        options: { ordered: true, radio: true },

        enonce: '',
        propositions: [
          { texte: `$f(x)=${bonneReponse}$`, statut: true },
          { texte: `$f(x)=${distracteur1}$`, statut: false },
          { texte: `$f(x)=${distracteur2}$`, statut: false },
          { texte: `$f(x)=${distracteur3}$`, statut: false },
        ],
      }
      const monQCM = propositionsQcm(this, i)

      if (this.questionJamaisPosee(i, a, x1, x2)) {
        if (this.interactif) {
          this.listeQuestions[i] = texte + monQCM.texte
        } else {
          this.listeQuestions[i] = texte
        }
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
