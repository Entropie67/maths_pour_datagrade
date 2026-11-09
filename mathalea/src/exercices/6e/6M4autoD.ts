import { choixDeroulant } from '../../lib/customElements/ListeDeroulanteElement'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { choice } from '../../lib/outils/arrayOutils'
import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const dateDePublication = '02/08/2025'
export const titre = 'Choisir les bonnes unités de mesure de durées longues'
export const interactifReady = true

/**
 * Choisir les bonnes unités de mesure de durées longues
 * @author Éric Elter
 */
export const uuid = '0cf13'

export const refs = {
  'fr-fr': ['6M4autoD'],
  'fr-2016': ['6D10-2'],
  'fr-ch': ['10CTGM4B-10', '10LCGM4B-10', '10LSGM4B-10', '9R1GM4D-9', '9R2GM4D-9', '9R3GM4D-9', 'PRQMG04A-5', 'PRQMG04D-10'],
}

export default class AutoChoisirDureeAnnees extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const durees = [
        ['millénaire', 'années', texNombre(1000), 'mil', 'a'],
        ['siècle', 'années', '100', 's', 'a'],
        ['année non bissextile', 'jours', 365, 'anb', 'j'],
        ['année bissextile', 'jours', 366, 'ab', 'j'],
      ]
      const choix = randint(0, 2)
      const unite1ATrouver = choice([true, false])
      if (this.questionJamaisPosee(i, choix, unite1ATrouver ? 0 : 1)) {
        const reponse = unite1ATrouver ? durees[choix][3] : durees[choix][4]
        const choixListeDeroulante = unite1ATrouver
          ? [
              { label: 'Choisir une proposition', value: '' },
              { label: 'millénaire', value: 'mil' },
              { label: 'siècle', value: 's' },
              { label: 'année non bissextile', value: 'anb' },
              { label: 'année bissextile', value: 'ab' },
            ]
          : [
              { label: 'Choisir une proposition', value: '' },
              { label: 'années', value: 'a' },
              { label: 'jours', value: 'j' },
              { label: 'heures', value: 'h' },
              { label: 'minutes', value: 'min' },
              { label: 'secondes', value: 's' },
            ]
        const texte = unite1ATrouver
          ? '$1$ ' +
            (this.interactif
              ? choixDeroulant(this, i, { choices: choixListeDeroulante })
              : '$\\ldots\\ldots\\ldots\\ldots$') +
            ` = $${durees[choix][2]}$ ${durees[choix][1]}`
          : `$1$ ${durees[choix][0]} = $${durees[choix][2]}$ ` +
            (this.interactif
              ? choixDeroulant(this, i, { choices: choixListeDeroulante })
              : '$\\ldots\\ldots\\ldots\\ldots$')

        const texteCorr = unite1ATrouver
          ? `$1$ ${texteEnCouleurEtGras(durees[choix][0])} = $${durees[choix][2]}$ ${durees[choix][1]}`
          : `$1$ ${durees[choix][0]} = $${durees[choix][2]}$ ${texteEnCouleurEtGras(durees[choix][1])}`

        handleAnswers(
          this,
          i,
          { reponse: { value: reponse } },
          { formatInteractif: 'liste-deroulante' },
        )

        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr

        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this) // On envoie l'exercice à la fonction de mise en page
  }
}
