import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { listeQuestionsToContenu, randint } from '../../modules/outils'

import Exercice from '../Exercice'

export const titre = 'Trouver le complément à $100$'
export const amcReady = true
export const interactifReady = true

export const amcType = 'AMCNum'

/**
 * 100-...=
 * @author Rémi Angot

 */
export const uuid = '67962'

export const refs = {
  'fr-fr': ['CM2N4A-14Old'],
  'fr-2016': ['CM012'],
  'fr-ch': [''],
}
export default class ComplementA100Old extends Exercice {
  constructor() {
    super()

    this.besoinFormulaireNumerique = [
      "Type d'écriture",
      2,
      `   1 : 100 - n = ...
    2 : n + ... = 100`,
    ]
    this.sup = 1

    this.nbCols = 2
    this.nbColsCorr = 2
  }

  nouvelleVersion() {
    for (
      let i = 0, texte, texteCorr, a, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      a = randint(11, 89)

      texte =
        this.sup === 1 ? `$100 - ${texNombre(a)} = $` : `$ ${texNombre(a)} + $`

      if (this.interactif && this.sup === 1) {
        texte += ajouteChampTexteMathLive(this, i, KeyboardType.clavierNumbers)
      } else if (this.sup === 1) {
        texte += `$ ...... $`
      }
      if (this.interactif && this.sup === 2) {
        texte += ajouteChampTexteMathLive(this, i, KeyboardType.clavierNumbers)
        texte += `$ = 100$`
      } else if (this.sup === 2) {
        texte += `$ ...... = 100$`
      }
      texteCorr =
        this.sup === 1
          ? `$ 100 - ${a}=${miseEnEvidence(texNombre(100 - a))}$`
          : `$ ${texNombre(a)} + ${miseEnEvidence(texNombre(100 - a))} = 100$`
      handleAnswers(
        this,
        i,
        { reponse: { value: 100 - a } },
        { formatInteractif: 'mathlive' },
      )

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
