import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import { remplisLesBlancs } from '../../../lib/interactif/questionMathLive'
import { ecritureParentheseSiNegatif } from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { lettreDepuisChiffre, sp } from '../../../lib/outils/outilString'
import { texNombre } from '../../../lib/outils/texNombre'
import { listeQuestionsToContenu, randint } from '../../../modules/outils'
import Exercice from '../../Exercice'

export const titre = "Calculer les coordonnées du milieu d'un segment"
export const dateDePublication = '05/10/2024'
export const interactifReady = true

/**
 *
 * @author Stéphane Guyon
 */

export const uuid = '8977b'
export const refs = {
  'fr-fr': ['canTSpeE01'],
  'fr-ch': [],
}

export default class MilieuSegment extends Exercice {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierLimites
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''
      const choixLettre = randint(1, 23, [9, 10, 11, 15])
      const pointA = lettreDepuisChiffre(choixLettre)
      const pointB = lettreDepuisChiffre(
        randint(1, 23, [9, 10, 11, 15, choixLettre]),
      )
      const xA = randint(-6, 6)
      const yA = randint(-6, 6)
      const zA = randint(-6, 6)
      const xB = randint(-6, 6, xA)
      const yB = randint(-6, 6, yA)
      const zB = randint(-6, 6, zA)
      const xV = (xB + xA) / 2
      const yV = (yB + yA) / 2
      const zV = (zB + zA) / 2
      texte = `Dans un repère orthonormé $\\big(O~;~\\vec \\imath~;~\\vec \\jmath~;~\\vec k\\big)$, on donne les points $${pointA}$ et $${pointB}$ de coordonnées respectives :`
      texte += `<br>$${pointA}(${xA}~;~${yA}~;~${zA})$ et  $${pointB}(${xB}~;~${yB}~;~${zB})$.<br>`
      texte += `Déterminer les coordonnées du point $I$ milieu du segment $[${pointA}${pointB}]$`

      if (this.interactif) {
        texte +=
          sp() + ': ' + remplisLesBlancs(this, i, 'I(%{champ1};%{champ2};%{champ3}).')
      } else texte += '.'
      handleAnswers(this, i, {
        champ1: { value: texNombre(xV, 1) },
        champ2: { value: texNombre(yV, 1) },
        champ3: { value: texNombre(zV, 1) },
      })
      texteCorr =
        'On calcule la demi-somme des coordonnées des deux points :<br>'
      texteCorr += 'On obtient :  '
      texteCorr += `$I\\left( \\dfrac{${xA}+${ecritureParentheseSiNegatif(xB)}}{2} ; \\dfrac{${yA}+${ecritureParentheseSiNegatif(yB)}}{2}; \\dfrac{${zA}+${ecritureParentheseSiNegatif(zB)}}{2}\\right)$<br>`
      texteCorr += `ce qui donne finalement : $I(${miseEnEvidence(`${texNombre((xA + xB) / 2, 1)}~;~${texNombre((yA + yB) / 2, 1)}~;~${texNombre((zA + zB) / 2, 1)} `)})$`

      if (this.questionJamaisPosee(i, texte)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
