import { bleuMathalea } from '../../lib/colors'
import { lampeMessage } from '../../lib/format/message'
import { choice } from '../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { ecritureAlgebrique, reduireAxPlusB } from '../../lib/outils/ecritures'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Démontrer une divisibilité par combinaison linéaire'
export const dateDePublication = '30/09/2026'
export const uuid = '249a3'

export const refs = {
  'fr-fr': ['TEA1-13'],
  'fr-ch': [],
}

/**
 * Démontrer une divisibilité à l'aide d'une combinaison linéaire de deux
 * expressions affines en n.
 *
 * @author Stéphane Guyon
 */
export default class DivisibiliteCombinaisonLineaire extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.nbQuestionsModifiable = false
  }

  nouvelleVersion(): void {
    const [coefficient1, coefficient2] = choice([
      [2, 3],
      [2, 5],
      [3, 4],
      [3, 5],
      [4, 5],
      [5, 6],
    ])
    const constante1 = randint(2, 7)
    const constante2 = -randint(1, 6)
    const expression1 = reduireAxPlusB(coefficient1, constante1, 'n')
    const expression2 = reduireAxPlusB(coefficient2, constante2, 'n')
    const produitCoefficients = coefficient1 * coefficient2
    const premierTermeConstant = coefficient2 * constante1
    const secondTermeConstant = -coefficient1 * constante2
    const resultat = premierTermeConstant + secondTermeConstant

    this.listeQuestions[0] = `Soient $a$ et $n$ deux entiers relatifs. Démontrer que si $a$ divise $${expression1}$ et $a$ divise $${expression2}$, alors $a$ divise $${resultat}$.`

    this.listeCorrections[0] = `Soient $a$ et $n$ deux entiers relatifs tels que $a$ divise $${expression1}$ et $${expression2}$.<br>

    ${lampeMessage({
      titre: 'Méthode :',
      texte: `Si $a$ divise deux entiers relatifs, alors $a$ divise toute combinaison linéaire de ces deux entiers relatifs.<br>L’astuce consiste à trouver une combinaison linéaire de $${expression1}$ et $${expression2}$ qui supprime les termes en $n$.`,
    })}
    On calcule la combinaison linéaire suivante :<br>
     $\\begin{aligned}
    ${coefficient2}\\left(${expression1}\\right)-${coefficient1}\\left(${expression2}\\right)
      &=${produitCoefficients}n${ecritureAlgebrique(premierTermeConstant)}${ecritureAlgebrique(-produitCoefficients)}n${ecritureAlgebrique(secondTermeConstant)}\\\\
      &=${premierTermeConstant}+${secondTermeConstant}\\\\
      &=${resultat}
    \\end{aligned}$.<br>
    Comme $a$ divise $${expression1}$ et $${expression2}$, il existe deux entiers relatifs $k$ et $\\ell$ tels que :<br>
    $${expression1}=ak\\quad\\text{et}\\quad ${expression2}=a\\ell$.<br>

   $\\begin{aligned}
    ${coefficient2}\\left(${expression1}\\right)-${coefficient1}\\left(${expression2}\\right)
      &=${coefficient2}ak-${coefficient1}a\\ell\\\\
      &=a\\left(${coefficient2}k-${coefficient1}\\ell\\right)
    \\end{aligned}$.<br>
    On a donc l'égalité
    $a\\left(${coefficient2}k-${coefficient1}\\ell\\right) = ${resultat}$.<br>
   Comme $k$ et $\\ell$ sont des entiers relatifs, $${coefficient2}k-${coefficient1}\\ell$ est un entier relatif.<br>

    ${texteEnCouleurEtGras('Conclusion :', bleuMathalea)}<br>
    Ainsi, $${miseEnEvidence('a')}$ ${texteEnCouleurEtGras('divise')} $${miseEnEvidence(String(resultat))}$.`

    listeQuestionsToContenu(this)
  }
}
