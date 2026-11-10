import { choice } from '../../../lib/outils/arrayOutils'
import { ecritureParentheseSiNegatif } from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Calculer la raison d’une suite arithmétique'
export const interactifReady = true

// Les exports suivants sont optionnels mais au moins la date de publication semble essentielle
export const dateDePublication = '18/02/2022' // La date de publication initiale au format 'jj/mm/aaaa' pour affichage temporaire d'un tag
// export const dateDeModifImportante = '14/02/2022' // Une date de modification importante au format 'jj/mm/aaaa' pour affichage temporaire d'un tag

/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora (découpage de can1S22-05 => can1S22-08 par Jean-Claude Lhote)

*/
export const uuid = 'cd45d'

export const refs = {
  'fr-fr': ['can1S22-05'],
  'fr-ch': [],
}
export default class CalculRaison extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    const nomSuite = ['u', 'v', 'w']
    const s = choice(nomSuite)

    const u = randint(-15, 15, 0)
    const r = randint(-15, 15, 0)
    const v = u + r
    const i = randint(0, 10)
    this.question = `Soit $(${s}_n)$ une suite arithmétique telle que :<br>
$${s}_{${i}}=${u}$ et  $${s}_{${i + 1}}=${v}$.<br>

Donner la raison $r$ de cette suite.`
    if (!this.interactif) {
      this.question += ''
    } else {
      this.question += '<br> $r=$'
    }
    this.correction = `La raison est donnée par la différence de deux termes consécutifs :<br>
        $r=${s}_{${i + 1}}-${s}_{${i}}=${v}-${ecritureParentheseSiNegatif(u)}=${miseEnEvidence(v - u)}$.`

    this.reponse = r

    this.canReponseACompleter = '$r=\\ldots$'
  }
}
