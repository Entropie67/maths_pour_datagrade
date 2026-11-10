import { propositionsQcm } from '../lib/interactif/qcm'
import { shuffle } from '../lib/outils/arrayOutils'
import { texteEnCouleurEtGras } from '../lib/outils/embellissements'
import { context } from '../modules/context'
import { listeQuestionsToContenu } from '../modules/outils'
import Exercice from './Exercice'
export const interactifReady = true

// export const titre = 'A trouver'
// export const dateDePublication = '01/01/2000'
// export const interactifReady = true

/**
 * @author Rémi Angot
 * Exercice vrai ou faux
 * Une sélection aléatoire d'affirmations est proposée à l'élève qui doit dire si elles sont vraies ou fausses
 * Ces affirmations sont tirées de this.affirmations
 */

interface Affirmation {
  texte: string
  statut: boolean
  correction: string
}

export default class VraiFaux extends Exercice {
  affirmations: Affirmation[]
  constructor() {
    super()
    this.nbQuestions = 1
    this.consigne = 'Pour chaque affirmation, dire si elle est vraie ou fausse.'
    this.affirmations = []
  }

  nouvelleVersion() {
    this.consigne =
      this.consigne === ''
        ? this.nbQuestions === 1
          ? 'Dire si cette affirmation est vraie ou fausse.'
          : 'Pour chaque affirmation, dire si elle est vraie ou fausse.'
        : this.consigne
    this.affirmations = shuffle(this.affirmations)
    this.nbQuestions = Math.min(this.affirmations.length, this.nbQuestions)
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = this.affirmations[i].texte
      const propositions = [
        {
          texte: 'Vrai',
          statut: this.affirmations[i].statut,
        },
        {
          texte: 'Faux',
          statut: !this.affirmations[i].statut,
        },
      ]
      this.autoCorrection[i] = {
        options: { ordered: true, vertical: false, radio: true },
        enonce: texte,
        propositions,
      }
      const monQcm = propositionsQcm(this, i)
      if (!context.isAmc && this.interactif) {
        texte += monQcm.texte
      }
      let correction = `L'affirmation est ${texteEnCouleurEtGras(this.affirmations[i].statut ? 'vraie' : 'fausse')}.<br>`
      correction += this.affirmations[i].correction

      if (this.questionJamaisPosee(i, this.affirmations[i].texte)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = correction
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
