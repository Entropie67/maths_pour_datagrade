import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { context } from '../../../modules/context'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Déterminer une évolution globale'
export const interactifReady = true

// Les exports suivants sont optionnels mais au moins la date de publication semble essentielle
export const dateDePublication = '16/07/2025' // La date de publication initiale au format 'jj/mm/aaaa' pour affichage temporaire d'un tag

/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora (factorisée par ia)

*/
export const uuid = '7d3d1'

export const refs = {
  'fr-fr': ['can2I2-05', '2I21-flash2'],
  'fr-ch': ['NR'],
}
export default class EvolSuccessives extends ExerciceSimple {
  constructor() {
    super()
    this.optionsChampTexte = { texteApres: '$\\,\\%$.' }
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
    this.versionQcmDisponible = true
  }

  nouvelleVersion() {
    const estAugmentation = this.quotaChoice('estAugmentation', [
      true,
      false,
      false,
    ])
    const taux = estAugmentation ? choice([10, 20, 30]) : randint(1, 9) * 10
    const CM = estAugmentation ? 1 + taux / 100 : 1 - taux / 100
    const CM2 = CM * CM
    const variation = CM2 - 1
    const variationPourcent = (CM2 - 1) * 100

    const typeTexte = estAugmentation ? 'augmentations' : 'baisses'

    this.question = `Le prix d’un article connait deux ${typeTexte} ${context.isDiaporama ? '<br>' : ''} successives de $${taux}\\,\\%$. <br>
      Le taux d'évolution global associé est :`

    this.correction = `Le coefficient multiplicateur associé à une ${estAugmentation ? 'augmentation' : 'baisse'} de $${taux}\\,\\%$ est $${texNombre(CM, 2)}$.<br>
      Le coefficient multiplicateur associé à deux ${typeTexte} successives de $${taux}\\,\\%$ est le produit des coefficients multiplicateurs, soit $${texNombre(CM, 2)}\\times ${texNombre(CM, 2)}=${texNombre(CM2, 2)}$.<br>
      L'évolution globale est donnée par $${texNombre(CM2, 2)}-1=${texNombre(variation, 2)}=`
    this.correction += this.versionQcm
      ? `${miseEnEvidence(texNombre(variationPourcent, 2) + '\\,\\%')}$.`
      : `${miseEnEvidence(texNombre(variationPourcent, 2))}\\,\\%$.`

    this.reponse = this.versionQcm
      ? `$${texNombre(variationPourcent, 2)}\\,\\%$`
      : `${texNombre(variationPourcent, 2)}`

    this.distracteurs = [
      `$${texNombre(2 * taux, 2)}\\,\\%$`,
      `$${texNombre(taux, 2)}\\,\\%$`,
      `$${texNombre(variationPourcent + 5, 2)}\\,\\%$`,
    ]

    this.canEnonce = `Le prix d’un article connait deux ${typeTexte} successives de $${taux}\\,\\%$.<br>Compléter.`
    this.canReponseACompleter = "L'évolution globale est : $\\ldots\\,\\%$."
    if (!this.interactif && !this.versionQcm) {
      // La consigne se place entre la situation et la phrase à compléter (pas en diaporama)
      if (!context.isDiaporama) {
        this.question = this.question.replace('. <br>', '. <br>Compléter.<br>')
      }
      this.question += ' $\\ldots\\,\\%$.'
    }
  }
}
