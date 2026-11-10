import { choice } from '../../../lib/outils/arrayOutils'
import { texFractionReduite } from '../../../lib/outils/deprecatedFractions'
import { sp } from '../../../lib/outils/outilString'
import { texNombre } from '../../../lib/outils/texNombre'

import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../../lib/interactif/questionMathLive'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import Hms from '../../../modules/Hms'
import { listeQuestionsToContenu, randint } from '../../../modules/outils'
import Exercice from '../../Exercice'

export const titre =
  'Convertir des heures décimales en heures/minutes et inversement'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
export const dateDePublication = '08/02/2022' // La date de publication initiale au format 'jj/mm/aaaa' pour affichage temporaire d'un tag
export const dateDeModifImportante = '06/02/2025'
/**
 * @author Gilles Mora
 */
export const uuid = '47802'

export const refs = {
  'fr-fr': ['can5D-02', '6M4C-flash9'],
  'fr-ch': ['NR'],
}
export default class HeuresDecimalesHeuresMinutes2 extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    let a, b, d, texte, texteCorr
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      switch (
        choice([1, 2]) //, 'b'
      ) {
        case 1:
          a = randint(1, 5)
          b = choice([0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0.25, 0.75])
          d = b * 60
          if (!this.interactif) {
            texte = `Convertir en heures/minutes : <br>$${texNombre(a + b)}$ h $=$ $\\ldots\\ldots$ h $\\ldots\\ldots$ min`
          } else {
            texte = `Convertir en heures/minutes : <br>$${texNombre(a + b)}$ h $=$`
            texte += ajouteChampTexteMathLive(this, i, KeyboardType.clavierHms)
          }
          texteCorr = `$${texNombre(a + b)}$h$ = ${a}$ h $ + ${texNombre(b)} \\times 60$ min $ = ${miseEnEvidence(`${a}\\text{ h }${d}\\text{ min}`)}$`
          handleAnswers(this, i, {
            reponse: {
              value: new Hms({ hour: a, minute: d }).toString(),
              options: { HMS: true },
            },
          })
          this.canEnonce = 'Compléter.'
          this.canReponseACompleter = `$${texNombre(a + b)}$ h $=\\ldots$ h $\\ldots$ min`
          break

        case 2:
        default:
          a = randint(1, 5)
          b = choice([0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0.25, 0.75])
          d = b * 60
          if (!this.interactif) {
            texte = `Compléter par un nombre décimal : <br>$${texNombre(a)}$ h $${texNombre(b * 60)}$ min $=$ $\\ldots\\ldots$ h`
          } else {
            texte = `Compléter par un nombre décimal : <br>$${texNombre(a)}$ h $${texNombre(b * 60)}$ min $=$`
            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierNumbers,
              {
                texteApres: sp(1) + 'h',
              },
            )
          }
          handleAnswers(this, i, { reponse: { value: (a + b).toString() } })
          texteCorr = `$${texNombre(b * 60)}$ min $= \\dfrac{${texNombre(b * 60)}}{60}$ h $=${texFractionReduite(b * 60, 60)}$ h $= ${texNombre(b)}$ h. <br>
            Ainsi, $${texNombre(a)}$ h $${texNombre(b * 60)}$ min $= ${miseEnEvidence(`${texNombre(a + b)}`)}$ h.`
          this.canEnonce = 'Compléter par un nombre décimal.'
          this.canReponseACompleter = `$${texNombre(a)}$ h $${texNombre(b * 60)}$ min $= \\ldots\\ldots$ h`
          break
      }
      if (this.questionJamaisPosee(i, a, b)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr

        this.listeCanEnonces.push(this.canEnonce)
        this.listeCanReponsesACompleter.push(this.canReponseACompleter)
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
