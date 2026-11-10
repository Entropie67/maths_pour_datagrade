import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../../lib/interactif/questionMathLive'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { compareNombres } from '../../../lib/outils/nombres'
import { texNombre } from '../../../lib/outils/texNombre'
import { listeQuestionsToContenu } from '../../../modules/outils'
import Exercice from '../../Exercice'

export const interactifReady = true
export const titre = 'Décomposer en produit de facteurs premiers'

/**
 * Modèle d'exercice très simple pour la course aux nombres.
 * Repris de 5N1L-4.ts (sup=1, sup2/sup3/sup4=false) : décomposition à 3 facteurs premiers.
 * @author Rémi Angot
 */
export const dateDeModifImportante = '23/09/2026'

export const uuid = 'b4ea0'

export const refs = {
  'fr-fr': ['can5C6-04', '5N1L-flash1'],
  'fr-ch': ['NR'],
}
export default class DecomposerFacteursPremierSimple extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    const listeFacteurs1 = [2, 3, 5]
    const listeFacteurs2 = [2, 5, 7, 11]
    const facteurs = [
      choice(listeFacteurs1),
      choice(listeFacteurs1),
      choice(listeFacteurs2),
    ].sort(compareNombres)
    const n = facteurs[0] * facteurs[1] * facteurs[2]
    const reponse = facteurs.join('\\times')

    const ensembleDeFacteurs = [...new Set(facteurs)]
    const produitAvecPuissances = ensembleDeFacteurs
      .map((facteur) => {
        const puissance = facteurs.filter((f) => f === facteur).length
        return puissance > 1 ? `${facteur}^${puissance}` : `${facteur}`
      })
      .join(' \\times ')

    this.listeQuestions[0] =
      `Décomposer $${texNombre(n)}$ en produit de facteurs premiers.<br>` +
      ajouteChampTexteMathLive(
        this,
        0,
        KeyboardType.clavierDeBaseAvecFractionPuissanceCrochets,
        { texteAvant: '' },
      )
    handleAnswers(this, 0, {
      reponse: {
        value: [reponse, produitAvecPuissances],
        options: { exclusifFactorisation: true },
      },
    })

    this.listeCorrections[0] = `$${texNombre(n)} = ${facteurs[0]} \\times ${facteurs[1] * facteurs[2]}$<br>
    $${texNombre(n)} = ${facteurs[0]} \\times ${facteurs[1]} \\times ${facteurs[2]}$<br>
    Donc la décomposition en produit de facteurs premiers de $${texNombre(n)}$ est $${miseEnEvidence(reponse.replaceAll('\\times', ' \\times '))}$.`

    this.canEnonce = `Décomposer $${texNombre(n)}$ en produit de facteurs premiers.`
    this.canReponseACompleter = `$${texNombre(n)}=\\ldots$`
    this.listeCanEnonces = [this.canEnonce]
    this.listeCanReponsesACompleter = [this.canReponseACompleter]
    listeQuestionsToContenu(this)
  }
}
