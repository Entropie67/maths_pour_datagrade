import { bleuMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteEnCouleur,
} from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  'Multiplier un nombre entier inférieur à 10 par un nombre entier de dizaines ou de centaines'
export const dateDePublication = '03/11/2026'
export const amcReady = true
export const amcType = 'AMCNum'
export const interactifReady = true

/**
 * Calculer a × (d × 10) ou a × (d × 100) avec a et d entiers de 2 à 9
 * @author Rémi Angot
 */
export const uuid = '44ffa'

export const refs = {
  'fr-fr': ['CM1N4I'],
  'fr-ch': [],
}
export default class MultiplierParDizainesOuCentaines extends Exercice {
  constructor() {
    super()
    this.consigne = 'Calculer.'
    this.nbCols = 2
    this.nbColsCorr = 1
    this.besoinFormulaireTexte = [
      'Second facteur',
      [
        'Nombres séparés par des tirets :',
        '1 : Dizaines',
        '2 : Centaines',
        '3 : Mélange',
      ].join('\n'),
    ]
    this.sup = '3'
  }

  nouvelleVersion() {
    const listeTypes = combinaisonListes(
      gestionnaireFormulaireTexte({
        saisie: this.sup,
        max: 2,
        melange: 3,
        defaut: 3,
        nbQuestions: this.nbQuestions,
      }).map(Number),
      this.nbQuestions,
    )
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      const a = randint(2, 9)
      const chiffre = randint(2, 9)
      const puissance = 10 ** listeTypes[i]
      const nombreRond = chiffre * puissance
      const produitChiffres = a * chiffre
      const resultat = a * nombreRond
      const unite = listeTypes[i] === 1 ? 'dizaines' : 'centaines'
      const facteurEnPremier = choice([true, false])

      const produit = facteurEnPremier
        ? `${a}\\times${texNombre(nombreRond, 0)}`
        : `${texNombre(nombreRond, 0)}\\times${a}`
      const explication = texteEnCouleur(
        `$${texNombre(nombreRond, 0)}$, c'est $${chiffre}$ ${unite}. $${a}\\times${chiffre}$ ${unite} font $${produitChiffres}$ ${unite}.`,
        bleuMathalea,
      )
      const texteCorr = `${explication}<br>$${produit}=${a}\\times${chiffre}\\times${texNombre(puissance, 0)}=${produitChiffres}\\times${texNombre(puissance, 0)}=${miseEnEvidence(texNombre(resultat, 0))}$`

      if (this.questionJamaisPosee(i, a, nombreRond)) {
        handleAnswers(this, i, { reponse: { value: resultat } })
        this.listeQuestions[i] =
          `$${produit}=$` +
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
