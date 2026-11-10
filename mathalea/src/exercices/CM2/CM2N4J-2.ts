import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'
import { sp } from '../../lib/outils/outilString'

export const titre = 'Soustraire $9$'
export const amcReady = true
export const interactifReady = true

export const amcType = 'AMCNum'

/**
 * Un nombre à 2 chiffres ne terminant pas par 9 - 9
 * @author Rémi Angot

 */
export const uuid = 'd8a39'

export const refs = {
  'fr-fr': ['CM2N4J-2', 'CM1N4H-3'],
  'fr-2016': ['CM006'],
  'fr-ch': ['9R1NO6B-5', '9R2NO6B-5', '9R3NO6B-5'],
}
export default class Soustraire9 extends Exercice {
  constructor() {
    super()

    this.consigne = `Calculer${sp()}:`

    this.nbCols = 2
    this.nbColsCorr = 2
  }

  nouvelleVersion() {
    for (
      let i = 0, texte, texteCorr, a, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      a = randint(1, 9) * 10 + randint(0, 8)
      texte = `$${a}-9$`
      texteCorr = `$${a}-9=${miseEnEvidence(a - 9)}$`
      handleAnswers(this, i, { reponse: { value: a - 9 } })
      if (this.interactif)
        texte += ` = ${ajouteChampTexteMathLive(this, i, KeyboardType.clavierNumbers)}`

      if (this.listeQuestions.indexOf(texte) === -1) {
        // Si la question n'a jamais été posée, on en crée une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
  // this.besoinFormulaireNumerique = ['Niveau de difficulté',3];
}
