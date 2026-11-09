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

export const titre =
  "Utiliser la distributivité de la multiplication par rapport à l'addition dans des cas simples"
export const dateDePublication = '01/10/2026'
export const interactifReady = true

/**
 * Calculer a × (10 + u) ou (10 × t + u) × a en distribuant, avec a de 3 à 9
 * @author Rémi Angot
 */
export const uuid = '9d438'

export const refs = {
  'fr-fr': ['CM2N4L', 'CM1N4L'],
  'fr-ch': ['9R1NO6D-4', '9R2NO6D-4', '9R3NO6D-4'],
}
export default class DistributiviteCasSimples extends Exercice {
  constructor() {
    super()
    this.consigne =
      "Calculer en utilisant la distributivité de la multiplication par rapport à l'addition."
    this.nbCols = 1
    this.nbColsCorr = 1
    this.nbQuestions = 5
  }

  nouvelleVersion() {
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const a = randint(3, 9)
      const dizaines = randint(1, 9) * 10
      const unites = randint(2, 9)
      const b = dizaines + unites
      const facteurEnPremier = choice([true, false])
      const resultat = a * b
      const produitDizaines = a * dizaines
      const produitUnites = a * unites

      let texte: string
      let calcul: string
      if (facteurEnPremier) {
        texte = `$${a}\\times${b}$`
        calcul = `$${a}\\times${b}=${a}\\times(${dizaines}+${unites})=${a}\\times${dizaines}+${a}\\times${unites}=${texNombre(produitDizaines, 0)}+${texNombre(produitUnites, 0)}=${miseEnEvidence(texNombre(resultat, 0))}$`
      } else {
        texte = `$${b}\\times${a}$`
        calcul = `$${b}\\times${a}=(${dizaines}+${unites})\\times${a}=${dizaines}\\times${a}+${unites}\\times${a}=${texNombre(produitDizaines, 0)}+${texNombre(produitUnites, 0)}=${miseEnEvidence(texNombre(resultat, 0))}$`
      }
      const explication = texteEnCouleur(
        `On décompose $${b}$ en $${dizaines}+${unites}$ puis on distribue la multiplication par $${a}$.`,
        bleuMathalea,
      )
      const texteCorr = `${explication}<br>${calcul}`

      handleAnswers(this, i, { reponse: { value: resultat } })
      if (this.interactif) {
        texte += `$=$${ajouteChampTexteMathLive(this, i, KeyboardType.clavierNumbers)}`
      }

      if (this.questionJamaisPosee(i, a, b, String(facteurEnPremier))) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
