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

export const titre = 'Multiplier un nombre décimal par $10$, $100$ ou $1\\,000$'
export const dateDePublication = '01/10/2026'
export const amcReady = true
export const amcType = 'AMCNum'
export const interactifReady = true

/**
 * Multiplier par 10, 100 ou 1 000 un nombre ayant 0, 1, 2 ou 3 chiffres après la virgule.
 * La correction explique le déplacement du chiffre des unités.
 * @author Rémi Angot
 */
export const uuid = 'e730e'

export const refs = {
  'fr-fr': ['CM2N4G-3'],
  'fr-ch': ['9R1NO6E-5', '9R2NO6E-5', '9R3NO6E-5'],
}
export default class MultiplierDecimalPar101001000 extends Exercice {
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
    const nbsDecimales = combinaisonListes([0, 1, 2, 3], this.nbQuestions)
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      const facteur = facteurs[i]
      const nbDecimales = nbsDecimales[i]
      const partieEntiere = randint(1, 99)
      // le dernier chiffre après la virgule n'est jamais nul
      const partieDecimale =
        nbDecimales === 0
          ? 0
          : 10 * randint(0, 10 ** (nbDecimales - 1) - 1) + randint(1, 9)
      const nombre = arrondi(
        partieEntiere + partieDecimale / 10 ** nbDecimales,
        nbDecimales,
      )
      const resultat = arrondi(nombre * facteur, nbDecimales)
      const nbDecimalesResultat = Math.max(
        0,
        nbDecimales - Math.round(Math.log10(facteur)),
      )
      const calcul = `${texNombre(nombre, nbDecimales)}\\times${texNombre(facteur, 0)}`
      const texte = `$${calcul}=$`
      const texteCorr = `${explicationDecalageDesChiffres(nombre, nbDecimales, facteur, 'multiplier')}<br>$${calcul}=${miseEnEvidence(texNombre(resultat, nbDecimalesResultat))}$`
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
