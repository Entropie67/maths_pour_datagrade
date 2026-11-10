import { bleuMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteEnCouleur,
} from '../../lib/outils/embellissements'
import { arrondi } from '../../lib/outils/nombres'
import { texNombre } from '../../lib/outils/texNombre'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  'Ajouter ou soustraire un nombre entier à un nombre décimal sans retenue'
export const dateDePublication = '01/10/2026'
export const amcReady = true
export const amcType = 'AMCNum'
export const interactifReady = true

/**
 * Ajouter ou soustraire un entier (à un ou deux chiffres) à un nombre décimal, sans retenue.
 * @author Rémi Angot
 */
export const uuid = 'e3e9b'

export const refs = {
  'fr-fr': ['CM2N4E'],
  'fr-ch': ['9R1NO6B-9', '9R2NO6B-9', '9R3NO6B-9'],
}
export default class AjouterSoustraireEntierSansRetenue extends Exercice {
  constructor() {
    super()
    this.consigne = 'Calculer.'
    this.nbCols = 2
    this.nbColsCorr = 2
  }

  nouvelleVersion() {
    const typesDeQuestions = combinaisonListes(
      ['addition', 'soustraction'],
      this.nbQuestions,
    )
    const tailles = combinaisonListes(
      ['unites', 'dizainesUnites'],
      this.nbQuestions,
    )
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      const addition = typesDeQuestions[i] === 'addition'
      const unitesSeulement = tailles[i] === 'unites'
      const nbDecimales = randint(1, 2)
      const partieDecimale = randint(
        1,
        10 ** nbDecimales - 1,
        [10, 20, 30, 40, 50, 60, 70, 80, 90],
      )
      const dizainesA = randint(2, 8)
      const unitesA = randint(1, 8)
      let dizainesB = 0
      let unitesB: number
      if (addition) {
        unitesB = randint(1, 9 - unitesA)
        if (!unitesSeulement) dizainesB = randint(1, 9 - dizainesA)
      } else {
        unitesB = randint(1, unitesA)
        if (!unitesSeulement) dizainesB = randint(1, dizainesA - 1)
      }
      const a = 10 * dizainesA + unitesA
      const b = 10 * dizainesB + unitesB
      const decimal = arrondi(
        a + partieDecimale / 10 ** nbDecimales,
        nbDecimales,
      )
      const resultat = arrondi(
        addition ? decimal + b : decimal - b,
        nbDecimales,
      )
      const signe = addition ? '+' : '-'
      const partieEntiereResultat = addition ? a + b : a - b
      const texte = `$${texNombre(decimal, nbDecimales)}${signe}${b}=$`
      const texteCorr =
        texteEnCouleur(
          `Il n'y a pas de retenue : on ${addition ? 'ajoute' : 'soustrait'} $${b}$ ${addition ? 'à' : 'de'} la partie entière, $${a}$, et la partie décimale ne change pas.<br>` +
            `$${a}${signe}${b}=${partieEntiereResultat}$`,
          bleuMathalea,
        ) +
        `<br>$${texNombre(decimal, nbDecimales)}${signe}${b}=${miseEnEvidence(texNombre(resultat, nbDecimales))}$`
      if (
        this.questionJamaisPosee(i, a, b, partieDecimale, nbDecimales, signe)
      ) {
        handleAnswers(this, i, { reponse: { value: resultat } })
        this.listeQuestions[i] =
          texte +
          (this.interactif
            ? ajouteChampTexteMathLive(this, i, KeyboardType.clavierNumbers)
            : '$\\dots$')
        this.listeCorrections[i] = texteCorr
        i++
      }
    }
    listeQuestionsToContenu(this)
  }
}
