// import Decimal from 'decimal.js'
import { courbe } from '../../lib/2d/Courbe'
import { repere } from '../../lib/2d/reperes'
import { addMultiMathfield } from '../../lib/customElements/MultiMathfield'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { resolutionSystemeLineaire2x2 } from '../../lib/mathFonctions/outilsMaths'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import {
  listeQuestionsToContenuSansNumero,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = "Lire les antécédents d'un nombre à partir d'un graphique"
export const interactifReady = true

export const dateDeModifImportante = '23/09/2023'

/**
 * Un graphique étant tracé, déterminer les antécédents de nombres donnés.
 * La fonction est un polynôme de degré 1, 2 ou 3 et les nombres des questions ne sont que des entiers.
 * Interactivité et multiples questions ajoutés par Jean-claude Lhote le 23/09/2023
 * @author Rémi Angot
 */

export const uuid = '8117f'

export const refs = {
  'fr-fr': ['3F13', '2F12-3', 'BP2AutoO8'],
  'fr-ch': ['10LCFA3B-5', '10LSFA3B-5', '11CTFA2A-5', 'PRQPF01B-5'],
}
export default class AntecedentGraphique extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Type de fonctions',
      3,
      '1 : Affine\n2 : Polynôme du 2nd degré\n3 : Mélange',
    ]

    this.sup = 2

    // this.spacingCorr = context.isHtml ? 3 : 1
    this.nbQuestions = 1

    // this.listeAvecNumerotation = false
  }

  nouvelleVersion() {
    let a = 0
    let b = 0
    let c = 0
    let x1 = 0
    let x2 = 0
    let x3 = 0
    let fx1 = 0
    let fx2 = 0
    let fx3 = 0
    let texte: string, texteCorr: string, f: (x: number) => number
    f = (x) => 0
    this.sup = Number(this.sup)
    for (let i = 0; i < this.nbQuestions;) {
      const initialiseVariables = function () {
        if (context.isHtml) {
          // repère -10 || 10
          x1 = randint(-6, -3)
          x2 = randint(x1 + 3, 2)
          x3 = randint(1, 8)
          fx1 = randint(-5, 5)
          fx2 = randint(-6, 6, fx1)
          fx3 = randint(-5, 5)
          c = randint(-5, 5)
        } else {
          // repère -5 || 5
          x1 = randint(-4, -2)
          x2 = randint(-1, 2, [0])
          x3 = randint(1, 4)
          fx1 = randint(-4, 4)
          fx2 = randint(-4, 4, fx1)
          fx3 = randint(-4, 4)
          c = randint(-3, 3)
        }
      }

      initialiseVariables()
      texte =
        'On a tracé ci-dessous la courbe représentative de la fonction $f$.<br>'
      texteCorr = ''
      const choix = this.sup === 1 ? 1 : this.sup === 2 ? 2 : (i % 2) + 1
      if (choix === 1) {
        a = (fx2 - fx1) / (x2 - x1)
        b = a * x1 - fx1
        f = (x) => a * x - b
        texte += `Déterminer, par lecture graphique, le (ou les) antécédent(s) de $${fx1}$ et de $${fx2}$ par cette fonction $f$.<br><br>`
        if (this.interactif) {
          texte += addMultiMathfield(this, i, {
            dataTemplate: `Le (ou les) antécédent(s) de $${fx1}$ (séparer les nombres avec un point-virgule). %{champ1}<br>
          Le (ou les) antécédent(s) de $${fx2}$ (séparer les nombres avec un point-virgule). %{champ2}`,
            dataOptions: {
              champ1: {
                keyboard:
                  KeyboardType.clavierDeBaseAvecFractionPuissanceCrochets,
                ldots: false,
              },
              champ2: {
                keyboard:
                  KeyboardType.clavierDeBaseAvecFractionPuissanceCrochets,
                ldots: false,
              },
            },
          })

          handleAnswers(
            this,
            i,
            {
              champ1: { value: x1, options: { suiteDeNombres: true } },
              champ2: { value: x2, options: { suiteDeNombres: true } },
            },
            { formatInteractif: 'multi-mathfield' },
          )
        }

        texteCorr = `L'antécédent de $${fx1}$ est $${miseEnEvidence(x1)}$, on note $f(${x1})=${fx1}$.<br>`
        texteCorr += `L'antécédent de $${fx2}$ est $${miseEnEvidence(x2)}$, on note $f(${x2})=${fx2}$.`
      } else if (choix === 2) {
        if (randint(1, 4) === 1) {
          // une fois sur 4 il n'y a qu'un seul antécédent
          const x0 = randint(-2, 2)
          let fx0 = randint(-4, 4, x0)
          if (!context.isHtml) {
            fx0 = randint(-2, 2, x0)
          }
          a = randint(-3, 3, 0)
          texte += `Déterminer, par lecture graphique, le (ou les) antécédent(s) de $${fx0}$ par cette fonction $f$.<br><br>`
          texte += ajouteChampTexteMathLive(
            this,
            i,
            KeyboardType.clavierDeBaseAvecFractionPuissanceCrochets,
            {
              texteAvant: `Le (ou les) antécédent(s) de $${fx0}$ (séparer les nombres avec un point-virgule) :`,
            },
          )
          handleAnswers(this, i, {
            reponse: { value: x0, options: { suiteDeNombres: true } },
          })
          texteCorr = `$${fx0}$ a un unique antécédent $${miseEnEvidence(x0)}$, on note $f(${x0})=${fx0}$.<br>`
          f = (x) => a * (x - x0) ** 2 + fx0
        } else {
          let tentatives = 0

          do {
            x1 = randint(-4, -1)
            x3 = randint(1, 4)
            fx1 = randint(-7, 7, [x1, x3])
            fx3 = fx1
            c = randint(-6, 6)
            ;[a, b] = resolutionSystemeLineaire2x2(x1, x3, fx1, fx3, c)
            tentatives++
          } while (
            (Number.isNaN(a) || Number.isNaN(b) || a === 0) &&
            tentatives < 50
          )

          // Si après 50 tentatives on n'a pas trouvé, on force des valeurs valides
          if (a === 0 || Number.isNaN(a) || Number.isNaN(b)) {
            console.warn('Forcing fallback values after 50 attempts')
            a = 1
            b = 0
            c = 0
            x1 = -2
            x3 = 2
            fx1 = 4
            fx3 = 4
          }
          x2 = 0
          fx2 = c
          f = (x) => a * x ** 2 + b * x + c
          texte += `Déterminer, par lecture graphique, le (ou les) antécédent(s) de $${fx1}$ par cette fonction $f$.<br><br>`
          texte += ajouteChampTexteMathLive(
            this,
            i,
            KeyboardType.clavierDeBaseAvecFractionPuissanceCrochets,
            {
              texteAvant: `Le (ou les) antécédent(s) de $${fx1}$ (séparer les nombres avec un point-virgule) :`,
            },
          )
          handleAnswers(this, i, {
            reponse: {
              value: `${x1};${x3}`,
              options: { suiteDeNombres: true },
            },
          })
          texteCorr = `$${fx1}$ a deux antécédents $${miseEnEvidence(`${x1};${x3}`)}$, on note $f(${x1})=f(${x3})=${fx1}$.<br>`
        }
      }
      const r = repere({ xMin: -10, xMax: 10, yMin: -10, yMax: 10 })
      const Cf = courbe(f, { repere: r, step: 0.2, color: 'purple' })
      texte += mathalea2d(
        { xmin: -10, xmax: 10, ymin: -10, ymax: 10, scale: 0.5 },
        r,
        Cf,
      )
      if (this.questionJamaisPosee(i, a, fx1)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
    }

    listeQuestionsToContenuSansNumero(this)
  }
}
