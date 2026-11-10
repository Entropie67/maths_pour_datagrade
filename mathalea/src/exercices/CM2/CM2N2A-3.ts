import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'

import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexte } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import { denominateurEnLettre } from '../../modules/fractions'
import { nombreEnLettres } from '../../modules/nombreEnLettres'
import { randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Lire une fraction'
export const interactifReady = true

export const dateDePublication = '12/11/2024'
export const uuid = 'f8528'
export const refs = {
  'fr-fr': ['CM2N2A-3'],
  'fr-2016': ['c3N21'],
  'fr-ch': ['9R1NO4A-6', '9R2NO4A-6', '9R3NO4A-6', 'PRQNO10A-1'], // Primaire anciennement : ['9NO10-15'],
}
/**
 * @Author Jean-Claude LHOTE
 */
export default class LireUneFraction extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 5
  }

  nouvelleVersion(): void {
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const numerateur = randint(2, 15)
      const denominateur = choice([2, 3, 4, 5, 6, 7, 8, 9], [numerateur])
      const texte =
        `Comment se lit la fraction $\\dfrac{${numerateur}}{${denominateur}}$ ? ` +
        ajouteChampTexte(this, i, KeyboardType.alphanumericAvecEspace)
      const value = `${nombreEnLettres(numerateur)} ${denominateurEnLettre(denominateur, numerateur > 1)}`
      const texteCorr = `La fraction $\\dfrac{${numerateur}}{${denominateur}}$ se lit ${texteEnCouleurEtGras(value)}.`
      if (this.questionJamaisPosee(i, numerateur, denominateur)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr

        handleAnswers(this, i, {
          reponse: { value, options: { texteSansCasse: true } },
        })
        i++
      }
      cpt++
    }
  }
}
