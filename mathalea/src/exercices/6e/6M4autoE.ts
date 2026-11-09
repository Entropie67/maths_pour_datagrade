import { choixDeroulant } from '../../lib/customElements/ListeDeroulanteElement'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { choice } from '../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const dateDePublication = '02/08/2025'
export const titre = "Choisir des rapports entre fraction d'heure et minutes"
export const interactifReady = true

/**
 * Choisir des rapports entre fraction d\'heure et minutes
 * @author Éric Elter
 */
export const uuid = 'de920'

export const refs = {
  'fr-fr': ['6M4autoE'],
  'fr-2016': ['6D10-3'],
  'fr-ch': ['9R1NO4I-3', '9R2NO4I-3', '9R3NO4I-3'],
}

export default class AutoChoisirFractionHeure extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.consigne = `Trouver la fraction d'heure qui convient.`
    this.comment = `Devant le peu de possibilités, cet exercice est limité à 6 questions maximum.`
  }

  nouvelleVersion() {
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const durees = [
        ["Un quart d'heure", '\\dfrac14', '15', ' est égal', 'q'],
        ['Une demi-heure', '\\dfrac12', '30', 'est égale', 'd'],
        ["Trois quarts d'heure", '\\dfrac34', '45', 'sont égaux', 'tq'],
      ]
      const choix = randint(0, 2)
      const estUnePhrase = choice([true, false])
      if (this.questionJamaisPosee(i, choix, estUnePhrase ? 0 : 1)) {
        const reponse = durees[choix][4]
        const choixListeDeroulante = estUnePhrase
          ? [
              { label: 'Choisir une proposition', value: '' },
              { label: "Un quart d'heure", value: 'q' },
              { label: 'Une demi-heure', value: 'd' },
              { label: "Trois quarts d'heure", value: 'tq' },
              { label: 'Une heure', value: 'ab' },
            ]
          : [
              { label: 'Choisir une proposition', value: '' },
              { latex: '\\dfrac14 \\text{h}', value: 'q' },
              { latex: '\\dfrac12 \\text{h}', value: 'd' },
              { latex: '\\dfrac34 \\text{h}', value: 'tq' },
              { latex: '1 \\text{h}', value: 'ab' },
            ]
        const texte = estUnePhrase
          ? (this.interactif
              ? choixDeroulant(this, i, { choices: choixListeDeroulante })
              : '$\\ldots\\ldots\\ldots\\ldots$') +
            ` ${durees[choix][3]} à $${durees[choix][2]}$ minutes.`
          : (this.interactif
              ? choixDeroulant(this, i, { choices: choixListeDeroulante })
              : '$\\ldots\\ldots\\ldots\\ldots$') +
            ` = $${durees[choix][2]}$ minutes.`

        const texteCorr = estUnePhrase
          ? `${texteEnCouleurEtGras(durees[choix][0])} ${durees[choix][3]} à $${durees[choix][2]}$ minutes.`
          : `$${miseEnEvidence(`${durees[choix][1]} \\text{h}`)} = ${durees[choix][2]}$ minutes.`

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
