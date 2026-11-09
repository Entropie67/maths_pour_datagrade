import Decimal from 'decimal.js'
import { choixDeroulant } from '../../lib/customElements/ListeDeroulanteElement'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { combinaisonListes, shuffle } from '../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { context } from '../../modules/context'
import { listeQuestionsToContenu } from '../../modules/outils'
import Exercice from '../Exercice'

import { amcConvert } from '../../lib/amc/amcBuilders'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { texNombre } from '../../lib/outils/texNombre'

export const titre = 'Associer puissances de $10$ et préfixes'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCOpen'
export const dateDePublication = '12/04/2022' // La date de publication initiale au format 'jj/mm/aaaa' pour affichage temporaire d'un tag

/**
 * Associer une puissance de 10 à un préfixe
 * @author Rémi Angot
 */
export const uuid = 'b0b3c'

export const refs = {
  'fr-fr': ['4C30-4'],
  'fr-ch': ['10LCNO4C-3', '10LSNO4C-3'],
}
export default class PuissancesEtPrefixe extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 5
    this.nbCols = 2

    this.sup = 1
    this.besoinFormulaireNumerique = [
      'Type de questions',
      2,
      '1: De la puissance de 10 au préfixe\n2: Du préfixe à la puissance de 10',
    ]
  }

  nouvelleVersion() {
    this.consigne =
      this.sup === 1
        ? 'Trouver le préfixe correspondant ' +
          (this.nbQuestions === 1
            ? 'à la puissance de 10 suivante.'
            : 'aux puissances de $10$ suivantes.')
        : 'Trouver la puissance de $10$ correspondant ' +
          (this.nbQuestions === 1
            ? 'au préfixe suivant.'
            : 'aux préfixes suivants.')

    const exposants = [
      [-9, 'nano', 'un milliardième'],
      [-6, 'micro', 'un millionième'],
      [-3, 'milli', 'un millième'],
      [-2, 'centi', 'un centième'],
      [-1, 'déci', 'un dixième'],
      [1, 'déca', 'dix'],
      [2, 'hecto', 'cent'],
      [3, 'kilo', 'mille'],
      [6, 'méga', 'un-million'],
      [9, 'giga', 'un-milliard'],
      // [12, 'téra', 'mille-milliards'],
    ]
    const listeExposants = combinaisonListes(exposants, this.nbQuestions)
    for (
      let i = 0, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      const exposant = listeExposants[i][0]
      const prefixe = listeExposants[i][1]
      const description = listeExposants[i][2]
      const reponseDecimale = new Decimal(10).pow(exposant)
      if (this.sup === 1) {
        texte =
          `$10^{${exposant}}$` +
          choixDeroulant(this, i, {
            choices: [
              { label: 'Choisir le bon préfixe', value: '' },
              ...shuffle([
                { label: 'nano', value: 'nano' },
                { label: 'micro', value: 'micro' },
                { label: 'milli', value: 'milli' },
                { label: 'centi', value: 'centi' },
                { label: 'déci', value: 'déci' },
                { label: 'déca', value: 'déca' },
                { label: 'hecto', value: 'hecto' },
                { label: 'kilo', value: 'kilo' },
                { label: 'méga', value: 'méga' },
                { label: 'giga', value: 'giga' },
                //    { label: 'téra', value: 'téra' },
              ]),
            ],
          })
        handleAnswers(
          this,
          i,
          { reponse: { value: prefixe } },
          { formatInteractif: 'liste-deroulante' },
        )
        texteCorr = `$10^{${exposant}}$, c'est ${description} donc le préfixe correspondant est ${texteEnCouleurEtGras(prefixe)}.`
      } else {
        texte = this.interactif
          ? `Le préfixe ${prefixe} est associé à : ` +
            ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierDeBaseAvecFractionPuissanceCrochets,
            )
          : `${prefixe}`
        handleAnswers(this, i, { reponse: { value: `10^{${exposant}}` } })
        texteCorr = `Le préfixe ${prefixe} est associé à ${description}, soit $${miseEnEvidence(`10^{${exposant}}`)}$ ou $${miseEnEvidence(texNombre(reponseDecimale, 9))}$.`
      }
      if (context.isAmc) {
        this.autoCorrectionAMC[i].enonce =
          this.sup === 1
            ? `Quel est le préfixe correspondant à $10^{${exposant}}$ ? $\\ldots$ `
            : `Quelle est la puissance de $10$ correspondant au préfixe ${prefixe} ? $\\ldots$ `
        this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
        this.autoCorrectionAMC[i].propositions = [
          { statut: 1, sanscadre: true, texte: texteCorr },
        ]
        this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
      }
      if (this.questionJamaisPosee(i, exposant)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
