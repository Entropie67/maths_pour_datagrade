import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import { remplisLesBlancs } from '../../../lib/interactif/questionMathLive'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { listeQuestionsToContenu, randint } from '../../../modules/outils'
import Exercice from '../../Exercice'

export const titre = 'Déterminer des racines carrées ou des carrés parfaits'
export const interactifReady = true

export const dateDePublication = '21/10/2024'
/**
 * @author Gilles Mora
 */
export const dateDeModifImportante = '17/09/2026'

export const uuid = 'bd54e'

export const refs = {
  'fr-fr': ['can3C3-02', '2N50-flash5'],
  'fr-ch': ['10CTNO6A-5', '10LCNO6A-5', '10LSNO6A-5'],
}
export default class calculsRacinesCarresPafaits extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.spacing = 1.5
  }

  nouvelleVersion() {
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''
      let a, b
      let reponse
      const cas = randint(1, 2)
      switch (cas) {
        case 1:
          a = randint(1, 12)
          b = a ** 2
          reponse = texNombre(a, 0)
          texte = 'Compléter.<br>'
          if (this.interactif) {
            handleAnswers(this, i, {
              champ1: { value: reponse },
            })
            texte += remplisLesBlancs(
              this,
              i,
              `\\sqrt{${texNombre(b, 0)}} = %{champ1}`,
              KeyboardType.clavierNumbers,
            )
          } else {
            texte += `$\\sqrt{${texNombre(b, 0)}} = \\ldots$`
          }
          texteCorr = `$\\sqrt{${texNombre(b, 0)}} =${miseEnEvidence(texNombre(a, 0))}$`

          this.canEnonce = 'Compléter.'
          this.canReponseACompleter = `$\\sqrt{${texNombre(b, 0)}} = \\ldots$`
          this.listeCanEnonces.push(this.canEnonce)
          this.listeCanReponsesACompleter.push(this.canReponseACompleter)
          break

        case 2:
          a = randint(1, 12)
          b = a ** 2
          reponse = texNombre(b, 0)
          texte = 'Compléter.<br>'
          if (this.interactif) {
            handleAnswers(this, i, {
              champ1: { value: reponse },
            })
            texte += remplisLesBlancs(
              this,
              i,
              `\\sqrt{%{champ1}} = ${texNombre(a, 0)}`,
              KeyboardType.clavierDeBaseAvecFraction,
            )
          } else {
            texte += `$\\sqrt{\\ldots} =${texNombre(a, 0)} $`
          }
          texteCorr = `$\\sqrt{${miseEnEvidence(texNombre(b, 0))}} =${texNombre(a, 0)}$`

          this.canEnonce = 'Compléter.'
          this.canReponseACompleter = `$\\sqrt{\\ldots} =${texNombre(a, 0)} $`
          this.listeCanEnonces.push(this.canEnonce)
          this.listeCanReponsesACompleter.push(this.canReponseACompleter)
          break
      }
      if (this.questionJamaisPosee(i, cas, String(a))) {
        this.listeCorrections[i] = texteCorr
        this.listeQuestions[i] = texte

        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
