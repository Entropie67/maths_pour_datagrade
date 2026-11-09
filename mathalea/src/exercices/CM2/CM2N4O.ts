import Decimal from 'decimal.js'
import { bleuMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteEnCouleur,
} from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Diviser un nombre entier par $4$ ou par $8$'
export const dateDePublication = '01/10/2026'
export const interactifReady = true

/**
 * Diviser un entier pair par 4, ou un multiple de 4 par 8, en divisant successivement par 2
 * @author Rémi Angot
 */
export const uuid = '7c942'

export const refs = {
  'fr-fr': ['CM2N4O'],
  'fr-ch': ['9R1NO6C-7', '9R2NO6C-7', '9R3NO6C-7'],
}
export default class DiviserPar4Ou8 extends Exercice {
  constructor() {
    super()
    this.consigne = 'Calculer.'
    this.nbCols = 2
    this.nbColsCorr = 2
    this.besoinFormulaireTexte = [
      'Diviseurs',
      'Nombres séparés par des tirets :\n4 : Division par 4\n8 : Division par 8',
    ]
    this.sup = '4-8'
  }

  nouvelleVersion() {
    // Si la saisie ne contient ni 4 ni 8, on propose les deux diviseurs
    const diviseurs = String(this.sup)
      .split('-')
      .map(Number)
      .filter((d) => d === 4 || d === 8)
    if (diviseurs.length === 0) diviseurs.push(4, 8)
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const diviseur = choice(diviseurs)
      // Le quotient est un entier ou un nombre se terminant par ,5
      const a = diviseur === 4 ? randint(3, 49) * 2 : randint(3, 40) * 4
      const quotient = new Decimal(a).div(diviseur)
      // On évite les quotients entiers de 1 à 12 qui relèvent des tables de multiplication
      if (quotient.isInteger() && quotient.lte(12)) {
        cpt++
        continue
      }

      let texte = `$${a}\\div${diviseur}$`
      const moitie1 = new Decimal(a).div(2)
      const moitie2 = moitie1.div(2)
      let explication: string
      let calcul: string
      if (diviseur === 4) {
        explication = 'Diviser par $4$ revient à diviser par $2$ deux fois.'
        calcul = `$${a}\\div4=(${a}\\div2)\\div2=${texNombre(moitie1, 0)}\\div2=${miseEnEvidence(texNombre(quotient, 1))}$`
      } else {
        const moitie3 = moitie2.div(2)
        explication = 'Diviser par $8$ revient à diviser par $2$ trois fois.'
        calcul = `$${a}\\div8=((${a}\\div2)\\div2)\\div2=(${texNombre(moitie1, 0)}\\div2)\\div2=${texNombre(moitie2, 1)}\\div2=${miseEnEvidence(texNombre(moitie3, 1))}$`
      }
      const texteCorr = `${texteEnCouleur(explication, bleuMathalea)}<br>${calcul}`

      handleAnswers(this, i, { reponse: { value: quotient } })
      if (this.interactif) {
        texte += `$=$${ajouteChampTexteMathLive(this, i, KeyboardType.clavierNumbers)}`
      }

      if (this.questionJamaisPosee(i, a, diviseur)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
