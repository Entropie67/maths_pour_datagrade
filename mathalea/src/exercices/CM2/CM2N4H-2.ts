import { miseEnEvidence } from '../../lib/outils/embellissements'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import { arrondi } from '../../lib/outils/nombres'
import { texNombre } from '../../lib/outils/texNombre'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Diviser un nombre décimal par $10$, $100$ ou $1000$'
export const amcReady = true
export const interactifReady = true

export const amcType = 'AMCNum'
/**
 * Un entier à un 1 ou 2 chiffres, un nombre décimal avec une partie décimale à un ou 2 chiffres à diviser par 10, 100 ou 1000
 * @author Rémi Angot

 */
export const uuid = 'fc635'

export const refs = {
  'fr-fr': ['CM2N4H-2'],
  'fr-2016': ['CM017'],
  'fr-ch': ['9R1NO6F-3', '9R2NO6F-3', '9R3NO6F-3'],
}
export default class DiviserDecimalPar101001000 extends Exercice {
  constructor() {
    super()

    this.consigne = 'Calculer.'

    this.nbCols = 2
    this.nbColsCorr = 2
  }

  nouvelleVersion() {
    for (
      let i = 0, texte, texteCorr, a, b, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      a = choice([
        randint(1, 9),
        randint(11, 99),
        arrondi(randint(11, 99) / 10),
        arrondi(randint(101, 999) / 100),
        arrondi(randint(1, 9) / 10),
      ])
      b = choice([10, 100, 1000])
      texte = `$${texNombre(a)}\\div${texNombre(b)}=$`
      texteCorr = `$${texNombre(a)}\\div${texNombre(b)}=${miseEnEvidence(texNombre(a / b))}$`
      handleAnswers(this, i, { reponse: { value: arrondi(a / b) } })
      if (this.interactif)
        texte += ajouteChampTexteMathLive(this, i, KeyboardType.clavierNumbers)

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
