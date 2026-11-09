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
  'Ajouter ou soustraire $8$, $9$, $18$, $19$, $28$, $29$, …, $98$ ou $99$ à un nombre'
export const dateDePublication = '01/10/2026'
export const interactifReady = true

/**
 * Ajouter ou soustraire 8, 9, 18, 19, …, 98 ou 99 en passant par la dizaine supérieure
 * @author Rémi Angot
 */
export const uuid = '5b40d'

export const refs = {
  'fr-fr': ['CM2N4J-3'],
  'fr-ch': ['9R1NO6B-8', '9R2NO6B-8', '9R3NO6B-8'],
}
export default class AjouterOuSoustraire8Ou9 extends Exercice {
  constructor() {
    super()
    this.consigne = 'Calculer.'
    this.nbCols = 2
    this.nbColsCorr = 2
  }

  nouvelleVersion() {
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      const n = randint(0, 9) * 10 + choice([8, 9])
      const estAddition = choice([true, false])
      if (this.creerQuestion(i, n, estAddition)) i++
    }
    listeQuestionsToContenu(this)
  }

  /**
   * Tire le premier terme puis remplit la question i : a + n ou a - n.
   * @returns true si la question est acceptée (jamais posée)
   */
  creerQuestion(i: number, n: number, estAddition: boolean) {
    const complement = n - (n % 10) + 10 // dizaine supérieure à n
    const ecart = complement - n // 1 ou 2
    let a: number
    let resultat: number
    let texte: string
    let explication: string
    let calcul: string
    if (estAddition) {
      a = randint(11, 199)
      resultat = a + n
      texte = `$${texNombre(a, 0)}+${n}$`
      explication = `Ajouter $${n}$ revient à ajouter $${complement}$ et soustraire $${ecart}$.`
      calcul = `$${texNombre(a, 0)}+${n}=${texNombre(a, 0)}+${complement}-${ecart}=${texNombre(a + complement, 0)}-${ecart}=${miseEnEvidence(texNombre(resultat, 0))}$`
    } else {
      a = randint(n + 1, n + 150)
      resultat = a - n
      texte = `$${texNombre(a, 0)}-${n}$`
      explication = `Soustraire $${n}$ revient à soustraire $${complement}$ et ajouter $${ecart}$.`
      calcul = `$${texNombre(a, 0)}-${n}=${texNombre(a, 0)}-${complement}+${ecart}=${texNombre(a - complement, 0)}+${ecart}=${miseEnEvidence(texNombre(resultat, 0))}$`
    }
    const texteCorr = `${texteEnCouleur(explication, bleuMathalea)}<br>${calcul}`

    handleAnswers(this, i, { reponse: { value: resultat } })
    if (this.interactif) {
      texte += `$=$${ajouteChampTexteMathLive(this, i, KeyboardType.clavierNumbers)}`
    }

    if (this.questionJamaisPosee(i, a, n, String(estAddition))) {
      this.listeQuestions[i] = texte
      this.listeCorrections[i] = texteCorr
      return true
    }
    return false
  }
}
