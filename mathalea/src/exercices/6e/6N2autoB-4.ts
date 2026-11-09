import { ensureAmcParam } from '../../lib/amc/amcHelpers'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import { texFractionFromString } from '../../lib/outils/deprecatedFractions'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { arrondi } from '../../lib/outils/nombres'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = "Donner l'écriture décimale d'une fraction décimale"
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'

/**
 * On donne une fraction qui a pour dénominateur 10, 100 ou 1 000, il faut donner l'écriture décimale.
 *
 * Le numérateur est de la forme X, XX, X0X, X00X ou XXX
 * @author Rémi Angot
 * 6N23
 */
export const uuid = '4b9d5'

export const refs = {
  'fr-fr': ['6N2autoB-4', 'BP2AutoC2'],
  'fr-2016': ['6N23', 'BP2AutoC2'],
  'fr-ch': ['9R1NO4E-3', '9R2NO4E-3', '9R3NO4E-3', 'PRQNO11A-5'],
}
export default class ExerciceEcritureDecimaleApartirDeFractionDecimale extends Exercice {
  constructor() {
    super()

    this.consigne = "Donner l'écriture décimale."
    this.spacing = 2
    this.spacingCorr = 2
    this.nbQuestions = 8
    this.nbCols = 2
    this.nbColsCorr = 2
  }

  nouvelleVersion() {
    for (
      let i = 0, a, b, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      a = choice(
        [
          randint(2, 9),
          randint(11, 99),
          randint(1, 9) * 100 + randint(1, 9),
          randint(1, 9) * 1000 + randint(1, 9),
        ],
        randint(101, 999),
      )
      // X, XX, X0X, X00X,XXX
      b = choice([10, 100, 1000])
      handleAnswers(this, i, { reponse: { value: arrondi(a / b) } })
      const amcParam = ensureAmcParam(this, i)
      amcParam.digits = 6
      amcParam.decimals = b === 10 ? 1 : b === 100 ? 2 : 3

      texte = context.isAmc ? "Donner l'écriture décimale de " : ''
      texte += `$${texFractionFromString(texNombre(a), texNombre(b))}$`
      texte += context.isAmc
        ? '.'
        : `${!this.interactif ? '$ = \\dotfill $' : '$=$' + ajouteChampTexteMathLive(this, i, KeyboardType.clavierNumbers)}`
      texteCorr =
        '$ ' +
        texFractionFromString(texNombre(a), texNombre(b)) +
        ' = ' +
        miseEnEvidence(texNombre(arrondi(a / b))) +
        ' $'
      if (this.questionJamaisPosee(i, a, b)) {
        // Si la question n'a jamais été posée, on en crée une autre
        if (context.isDiaporama) {
          texte = texte.replace('=\\dotfill', '')
        }
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
