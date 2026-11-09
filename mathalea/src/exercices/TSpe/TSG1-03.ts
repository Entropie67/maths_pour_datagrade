import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { randint } from '../../modules/outils'
import ExerciceSimple from '../ExerciceSimple'
export const titre = 'Effectuer un dénombrement (code)'
export const interactifReady = true

export const dateDePublication = '20/4/2025'

export const uuid = '32fa3'
export const refs = {
  'fr-fr': ['TSG1-03'],
  'fr-ch': ['4mProbStat-19'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Stéphane Guyon

*/
export default class NomExercice extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    const n = randint(3, 6) // nombre de chiffres
    const p = randint(3, 5) // nombre de lettres du code
    const lettre = randint(p + 1, 8) // nombre de lettres possibles pour le code.
    let produitLatex = '' // pour l'affichage en LaTeX
    let produitValeur = 1 // pour le calcul de la valeur numérique
    for (let i = 0; i < p; i++) {
      produitLatex += (i === 0 ? '' : ' \\times ') + (lettre - i)
      produitValeur *= lettre - i
    }
    const code = (() => {
      if (lettre === 3) return 'A, B, C'
      if (lettre === 4) return 'A, B, C, D'
      if (lettre === 5) return 'A, B, C, D, E'
      if (lettre === 6) return 'A, B, C, D, E, F'
      if (lettre === 7) return 'A, B, C, D, E, F, G'
      if (lettre === 8) return 'A, B, C, D, E, F, G, H'
      return ''
    })()
    this.question = `Un code secret est composé de $${n}$ chiffres (qui peuvent être identiques) suivis de $${p}$ lettres distinctes à choisir parmi $${code}$.<br>`
    this.question += 'Combien de codes secrets différents peut-on former ?'

    const resultat = 10 ** n * produitValeur

    this.correction = `Soit $X=\\left\\{0;1;\\ldots;9\\right\\}$ et $Y=\\left\\{${code.replaceAll(', ', ';')}\\right\\}$ :<br>`
    this.correction += `L'ordre est important dans ce code. Il s'agit donc d'un $${n + p}$-uplet composé de $${n}$ éléments de $X$ puis de $${p}$ éléments de $Y$. <br>`
    this.correction += `Pour les $${n}$ chiffres, il y a répétition possible, donc il y a $10^${n}$ possibilités. <br>`
    this.correction += `Pour les $${p}$ lettres, il n'y a pas de répétition possible, puisqu'elles sont distinctes. Il s'agit donc de choisir $${p}$ éléments parmi 
    $${lettre}$, en respectant l'ordre mais sans répétition ce qui correspond à l'arrangement : `
    this.correction += `$${produitLatex} = ${texNombre(produitValeur)}$.<br>`
    this.correction += `Il y a $10^${n} \\times ${texNombre(produitValeur)}$ possibilités de code. <br>`
    this.correction += `Ce qui donne au total $${miseEnEvidence(texNombre(resultat))}$ possibilités de code. <br>`
    this.reponse = resultat
  }
}
