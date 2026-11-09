import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { arrondi } from '../../lib/outils/nombres'
import { texNombre } from '../../lib/outils/texNombre'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'
import { explicationDecalageDesChiffres } from './_numeration'

export const titre = 'Diviser un nombre décimal par $10$, $100$ ou $1\\,000$'
export const dateDePublication = '01/10/2026'
export const amcReady = true
export const amcType = 'AMCNum'
export const interactifReady = true

/**
 * Diviser par 10, 100 ou 1 000 un nombre ayant 0, 1 ou 2 chiffres après la virgule.
 * La correction explique le déplacement du chiffre des unités.
 * @author Rémi Angot
 */
export const uuid = 'df9d3'

export const refs = {
  'fr-fr': ['CM2N4H-3'],
  'fr-ch': ['9R1NO6F-4', '9R2NO6F-4', '9R3NO6F-4'],
}
export default class DiviserDecimalPar101001000 extends Exercice {
  constructor() {
    super()
    this.consigne = 'Calculer.'
    this.nbCols = 2
    this.nbColsCorr = 2
  }

  nouvelleVersion() {
    const facteurs = combinaisonListes(
      [10, 100, 1000] as const,
      this.nbQuestions,
    )
    const nbsDecimales = combinaisonListes([0, 1, 2], this.nbQuestions)
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      const facteur = facteurs[i]
      const nbDecimales = nbsDecimales[i]
      const exposant = Math.round(Math.log10(facteur))
      const partieEntiere = randint(1, 999)
      // le dernier chiffre après la virgule n'est jamais nul
      const partieDecimale =
        nbDecimales === 0
          ? 0
          : 10 * randint(0, 10 ** (nbDecimales - 1) - 1) + randint(1, 9)
      const nombre = arrondi(
        partieEntiere + partieDecimale / 10 ** nbDecimales,
        nbDecimales,
      )
      const nbDecimalesResultat = nbDecimales + exposant
      const resultat = arrondi(nombre / facteur, nbDecimalesResultat)
      const calcul = `${texNombre(nombre, nbDecimales)}\\div${texNombre(facteur, 0)}`
      const texte = `$${calcul}=$`
      const texteCorr = `${explicationDecalageDesChiffres(nombre, nbDecimales, facteur, 'diviser')}<br>$${calcul}=${miseEnEvidence(texNombre(resultat, nbDecimalesResultat))}$`
      if (
        this.questionJamaisPosee(
          i,
          partieEntiere,
          partieDecimale,
          nbDecimales,
          facteur,
        )
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
