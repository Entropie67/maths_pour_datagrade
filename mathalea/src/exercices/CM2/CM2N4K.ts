import { bleuMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import {
  miseEnEvidence,
  texteEnCouleur,
} from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  'Multiplier un nombre entier, inférieur à $10$, de dizaines, de centaines ou de milliers par un nombre entier, inférieur à $10$, de dizaines, de centaines ou de milliers'
export const dateDePublication = '01/10/2026'
export const interactifReady = true

/**
 * Multiplier deux nombres de la forme d × 10, d × 100 ou d × 1 000 (d entier de 2 à 9)
 * @author Rémi Angot
 */
export const uuid = '2a90b'

export const refs = {
  'fr-fr': ['CM2N4K'],
  'fr-ch': ['9R1NO6C-3', '9R2NO6C-3', '9R3NO6C-3'],
}
export default class MultiplierDizainesCentainesMilliers extends Exercice {
  constructor() {
    super()
    this.consigne = 'Calculer.'
    this.nbCols = 2
    this.nbColsCorr = 2
  }

  nouvelleVersion() {
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const d1 = randint(2, 9)
      const d2 = randint(2, 9)
      const p1 = randint(1, 3)
      const p2 = randint(1, 3)
      const a = d1 * 10 ** p1
      const b = d2 * 10 ** p2
      const produitChiffres = d1 * d2
      const facteur = 10 ** (p1 + p2)
      const resultat = a * b

      let texte = `$${texNombre(a, 0)}\\times${texNombre(b, 0)}$`
      const explication = texteEnCouleur(
        `On multiplie $${d1}$ par $${d2}$ puis on multiplie par $${texNombre(10 ** p1, 0)}\\times${texNombre(10 ** p2, 0)}=${texNombre(facteur, 0)}$.`,
        bleuMathalea,
      )
      const texteCorr = `${explication}<br>$${texNombre(a, 0)}\\times${texNombre(b, 0)}=${d1}\\times${d2}\\times${texNombre(facteur, 0)}=${texNombre(produitChiffres, 0)}\\times${texNombre(facteur, 0)}=${miseEnEvidence(texNombre(resultat, 0))}$`

      handleAnswers(this, i, { reponse: { value: resultat } })
      if (this.interactif) {
        texte += `$=$${ajouteChampTexteMathLive(this, i, KeyboardType.clavierNumbers)}`
      }

      if (this.questionJamaisPosee(i, a, b)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
