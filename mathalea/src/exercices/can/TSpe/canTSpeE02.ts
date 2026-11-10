import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import { remplisLesBlancs } from '../../../lib/interactif/questionMathLive'
import { ecritureParentheseSiNegatif } from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { lettreDepuisChiffre, sp } from '../../../lib/outils/outilString'
import { texNombre } from '../../../lib/outils/texNombre'
import { listeQuestionsToContenu, randint } from '../../../modules/outils'
import Exercice from '../../Exercice'

export const titre = "Calculer les coordonnées d'un vecteur"
export const dateDePublication = '04/10/2024'
export const interactifReady = true

/**
 *
 * @author Stéphane Guyon
 */

export const uuid = '11dd8'
export const refs = {
  'fr-fr': ['canTSpeE02'],
  'fr-ch': ['3G92-12'],
}

export default class CoordonneesVecteur extends Exercice {
  constructor() {
    super()

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
      const xV = xB - xA
      const yV = yB - yA
      const zV = zB - zA
      texte = `Dans un repère orthonormé $\\big(O~;~\\vec \\imath~;~\\vec \\jmath~;~\\vec k\\big)$, on donne les points $${pointA}$ et $${pointB}$ de coordonnées respectives :`
      texte += `<br>$${pointA}(${xA}~;~${yA}~;~${zA})$ et  $${pointB}(${xB}~;~${yB}~;~${zB})$.<br>`
      texte += `Déterminer les coordonnées du vecteur $\\overrightarrow{${pointA}${pointB}}$`
      if (this.interactif) {
        texte +=
          sp() + ': ' +
          remplisLesBlancs(
            this,
            i,
            '\\begin{pmatrix}%{champ1}\\\\%{champ2}\\\\%{champ3}\\end{pmatrix}.',
          )
      } else {
        texte += '.'
      }
      handleAnswers(this, i, {
        champ1: { value: texNombre(xV, 1) },
        champ2: { value: texNombre(yV, 1) },
        champ3: { value: texNombre(zV, 1) },
      })
      texteCorr =
        'On calcule la différence des coordonnées des deux points :<br>'
      texteCorr += 'On obtient :  '
      texteCorr += `$\\overrightarrow{${pointA}${pointB}}\\begin{pmatrix} ${xB}-${ecritureParentheseSiNegatif(xA)} \\\\${yB}-${ecritureParentheseSiNegatif(yA)}\\\\${zB}-${ecritureParentheseSiNegatif(zA)}\\end{pmatrix}$<br>`
      texteCorr += `Cela donne au final :  $\\overrightarrow{${pointA}${pointB}}${miseEnEvidence(`\\begin{pmatrix} ${xB - xA}\\\\${yB - yA}\\\\${zB - zA}\\end{pmatrix}`)}$<br>`

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
