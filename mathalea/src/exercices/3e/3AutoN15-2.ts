import { orangeMathalea } from '../../lib/colors'
import { demiDroiteInteractive } from '../../lib/customElements/demi_droite_interactive'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { lettreDepuisChiffre } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const interactifReady = true

export const titre =
  "Placer des points d'abscisses décimales relatives sur un axe gradué"
export const dateDePublication = '17/08/2026'

/**
 * Placer trois points d'abscisses décimales relatives dans l'intervalle [-3 ; 3].
 * Version compatible avec MetaExerciceCan grâce au custom element
 * demi-droite-interactive.
 *
 * @author Jean-Claude Lhote et Rémi Angot
 */
export const uuid = '8fb2c'

export const refs = {
  'fr-fr': ['3AutoN15-2'],
  'fr-ch': ['9R1NO3A-5', '9R2NO3A-5', '9R3NO3A-5'],
}

export default class PlacerPointsSurDemiDroiteRelatifs extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    this.contenu = this.consigne
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const label1 = lettreDepuisChiffre(i * 3 + 1)
      const label2 = lettreDepuisChiffre(i * 3 + 2)
      const label3 = lettreDepuisChiffre(i * 3 + 3)
      const dixieme1 = randint(-29, -1)
      const dixieme2 = randint(1, 29)
      const dixieme3 = randint(-29, 29, [0, dixieme1, dixieme2])
      const abs1 = dixieme1 / 10
      const abs2 = dixieme2 / 10
      const abs3 = dixieme3 / 10
      const points = [
        { pointValue: abs1, label: label1 },
        { pointValue: abs2, label: label2 },
        { pointValue: abs3, label: label3 },
      ]
      const x0 = 0
      const axisMin = -3
      const maxT = 3
      const partsCount = 60

      let texte = `Placer les points : $${label1}(${texNombre(abs1, 5)}), ${label2}(${texNombre(abs2, 5)}), ${label3}(${texNombre(abs3, 5)})$.`
      let texteCorr = ''

      texte += '<br><br>'
      texte += demiDroiteInteractive(this, i, {
        x0,
        axisMin,
        initialT: maxT,
        minT: maxT,
        maxT,
        partsCount,
        multiplePoints: true,
        showEqualityMarks: false,
      })

      texteCorr += `Les points $${label1}$, $${label2}$ et $${label3}$ sont placés aux abscisses respectives $${texNombre(abs1, 5)}$, $${texNombre(abs2, 5)}$ et $${texNombre(abs3, 5)}$.<br><br>`
      texteCorr += demiDroiteInteractive(this, i, {
        x0,
        axisMin,
        initialT: maxT,
        minT: maxT,
        maxT,
        partsCount,
        interactivityOn: false,
        multiplePoints: true,
        showEqualityMarks: false,
        points,
        id: `demi-droite-gradueeEx${this.numeroExercice}Q${i}Corr`,
        pointsColor: orangeMathalea,
      })

      if (this.questionJamaisPosee(i, abs1, abs2, abs3)) {
        handleAnswers(
          this,
          i,
          {
            reponse: {
              value: JSON.stringify({
                partsCount,
                maxT,
                axisMin,
                showNegative: true,
                points,
                x0,
              }),
            },
          },
          { formatInteractif: 'demi-droite-interactive' },
        )
        if (context.isHtml || context.isTypst) {
          this.listeQuestions.push(texte)
          this.listeCorrections.push(texteCorr)
        } else {
          this.listeQuestions.push(texte.replaceAll('<br><br>', '\n\n'))
          this.listeCorrections.push(
            texteCorr.replaceAll('<br><br>', '\n\n').replaceAll('<br>', '\n'),
          )
        }
        i++
      }
      cpt++
    }

    listeQuestionsToContenu(this)
  }
}
