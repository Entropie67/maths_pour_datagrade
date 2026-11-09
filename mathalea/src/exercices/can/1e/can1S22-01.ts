import { choice } from '../../../lib/outils/arrayOutils'
import { ecritureParentheseSiNegatif } from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Appliquer la définition d’une suite géométrique'
export const interactifReady = true

// Les exports suivants sont optionnels mais au moins la date de publication semble essentielle
export const dateDePublication = '18/02/2026' // La date de publication initiale au format 'jj/mm/aaaa' pour affichage temporaire d'un tag
// export const dateDeModifImportante = '14/02/2022' // Une date de modification importante au format 'jj/mm/aaaa' pour affichage temporaire d'un tag

/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Stéphane Guyon (Découpage de cans1S10 par Jean-claude Lhote)

*/
export const uuid = 'cd45f'

export const refs = {
  'fr-fr': ['can1S22-01'],
  'fr-ch': [],
}
export default class CalculTerme extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    const nomSuite = ['u', 'v', 'w']
    const s = choice(nomSuite)

    const u = randint(-3, 3, 0)
    const q = randint(2, 3)

    const i = randint(2, 3)
    this.question = `Soit $(${s}_n)$ une suite géométrique de premier terme $${s}_0=${u}$ et de raison $q=${q}$.<br>

Calculer le terme $${s}_{${i}}$.`
    if (!this.interactif) {
      this.question += ''
    } else {
      this.question += `<br> $${s}_{${i}}=\\ldots\\ldots$`
    }
    this.correction = `Comme la suite $(${s}_n)$ est géométrique de premier terme $${s}_0=${u}$ et de raison $q=${q}$,<br>
       pour tout entier $n$, $${s}_{n+1} = ${q}${s}_n$.<br>
       Donc `
    let current = u
    for (let k = 0; k < i; k++) {
      this.correction += `$${s}_{${k + 1}} = ${q} \\times ${ecritureParentheseSiNegatif(current)} = ${current * q}$ <br>`
      current *= q
    }
    this.correction += ` La réponse est donc $${s}_{${i}} = ${miseEnEvidence(u * Math.pow(q, i))}$.<br>On aurait pu aussi directement utiliser la forme explicite d'une suite géométrique : $${s}_n = ${s}_0 \\times q^n$.<br>`
    this.correction += `Ce qui donne le même résultat : $${s}_{${i}} = ${u} \\times ${q}^{${i}} = ${miseEnEvidence(u * Math.pow(q, i))}$.<br>`
    this.reponse = u * Math.pow(q, i)

    this.canReponseACompleter = `$${s}_{${i}}=\\ldots$`
  }
}
