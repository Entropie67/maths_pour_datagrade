import { shuffle } from '../../../lib/outils/arrayOutils'
import { ecritureParentheseSiNegatif } from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Utiliser la règle des signes'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'

/**
 * @author Jean-claude Lhote
 * Créé pendant l'été 2021

 */
export const uuid = 'a630a'

export const refs = {
  'fr-fr': ['can4C1-02'],
  'fr-ch': [],
}
export default class RegleDesSignes extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    let a = this.quotaRandint('a', -5, 5, [-1, 0, 1])
    const b = randint(-4, 4, [-1, 0, 1, a])
    const c = this.quotaRandint('c', 2, 3)
    if (a > 0 && b > 0) {
      a = -a
    }
    const d = a * b * c
    const f = shuffle([a, b, c]) // on brasse les facteurs
    switch (this.quotaRandint('cas', 0, 2)) {
      case 0:
        this.question = `$${f[0]}\\times ${ecritureParentheseSiNegatif(f[1])}\\times$ ? $=${d}$.<br>

        ? $=$`
        this.reponse = f[2]
        this.correction = `Comme le produit $${f[0]}\\times ${ecritureParentheseSiNegatif(f[1])}$
        est ${f[0] * f[1] > 0 ? 'positif' : 'négatif'} et que le résultat est ${d > 0 ? 'positif' : 'négatif'} alors le facteur manquant est forcément ${f[2] > 0 ? 'positif' : 'négatif'}.<br>`
        this.correction += `De plus, comme $${Math.abs(f[0])}\\times ${Math.abs(f[1])}=
        ${Math.abs(f[0] * f[1])}$,
        on cherche le nombre qui multiplié par $${Math.abs(f[0] * f[1])}$ donne $${Math.abs(d)}$.
         C'est $${Math.abs(d)}\\div ${Math.abs(f[0] * f[1])}=${Math.abs(f[2])}$. <br>`
        this.correction += `On en déduit que le facteur manquant est : $${f[2]}$.<br> On a bien : $${f[0]}\\times ${ecritureParentheseSiNegatif(f[1])}\\times ${miseEnEvidence(String(ecritureParentheseSiNegatif(f[2])))}=${d}$`
        this.canEnonce = `$${f[0]}\\times ${ecritureParentheseSiNegatif(f[1])}\\times$ ? $=${d}$.
      `
        this.canReponseACompleter = ' ? $=\\ldots $'
        break
      case 1:
        this.question = `$${f[0]}\\times$ ? $\\times ${ecritureParentheseSiNegatif(f[2])}=${d}$<br>

        ? $=$`
        this.reponse = f[1]
        this.correction = `Comme le produit $${f[0]}\\times ${ecritureParentheseSiNegatif(f[2])}$
        est ${f[0] * f[2] > 0 ? 'positif' : 'négatif'} et que le résultat est ${d > 0 ? 'positif' : 'négatif'} alors le facteur manquant est forcément ${f[1] > 0 ? 'positif' : 'négatif'}.<br>`
        this.correction += `De plus, comme $${Math.abs(f[0])}\\times ${Math.abs(f[2])}=${Math.abs(f[0] * f[2])}$,
        on cherche le nombre qui multiplié par $${Math.abs(f[0] * f[2])}$ donne $${Math.abs(d)}$.
        C'est $${Math.abs(d)}\\div ${Math.abs(f[0] * f[2])}=${Math.abs(f[1])}$. <br>`
        this.correction += `On en déduit que le facteur manquant est :
        $${f[1]}$. <br>On a bien : $${f[0]}\\times ${miseEnEvidence(String(ecritureParentheseSiNegatif(f[1])))} \\times ${ecritureParentheseSiNegatif(f[2])}=${d}$. <br>`
        this.canEnonce = `$${f[0]}\\times$ ? $\\times ${ecritureParentheseSiNegatif(f[2])}=${d}$
      `
        this.canReponseACompleter = ' ? $=\\ldots $'
        break
      case 2:
        this.question = `? $\\times ${ecritureParentheseSiNegatif(f[1])}\\times ${ecritureParentheseSiNegatif(f[2])}=${d}$<br>
        
        ? $=$`
        this.reponse = f[0]
        this.correction = `Comme le produit $${f[1]}\\times ${ecritureParentheseSiNegatif(f[2])}$ est ${f[1] * f[2] > 0 ? 'positif' : 'négatif'} et que le résultat est ${d > 0 ? 'positif' : 'négatif'} alors le facteur manquant est forcément ${f[0] > 0 ? 'positif' : 'négatif'}.<br>`
        this.correction += `De plus, comme $${Math.abs(f[1])}\\times ${Math.abs(f[2])}=${Math.abs(f[1] * f[2])}$,
        on cherche le nombre qui multiplié par $${Math.abs(f[1] * f[2])}$ donne $${Math.abs(d)}$.
        C'est $${Math.abs(d)}\\div ${Math.abs(f[1] * f[2])}=${Math.abs(f[0])}$. <br>`
        this.correction += `On en déduit que le facteur manquant est : $${f[0]}$. <br>On a bien : $${miseEnEvidence(f[0])}\\times ${ecritureParentheseSiNegatif(f[1])} \\times ${ecritureParentheseSiNegatif(f[2])}=${d}$`
        this.canEnonce = `? $\\times ${ecritureParentheseSiNegatif(f[1])}\\times ${ecritureParentheseSiNegatif(f[2])}=${d}$
      `
        this.canReponseACompleter = ' ? $=\\ldots $'
        break
    }
  }
}
