import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import { remplisLesBlancs } from '../../../lib/interactif/questionMathLive'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { listeQuestionsToContenu, randint } from '../../../modules/outils'
import Exercice from '../../Exercice'

import Decimal from 'decimal.js'
import { choice } from '../../../lib/outils/arrayOutils'
export const titre = 'Déterminer des racines carrées ou des carrés parfaits'
export const interactifReady = true

export const dateDePublication = '23/10/2024'
/**
 * @author Gilles Mora
 */
export const uuid = 'bd96a'

export const refs = {
  'fr-fr': ['can2N5-02', '2N50-flash2'],
  'fr-ch': ['10CTNO6A-4', '10LCNO6A-4', '10LSNO6A-4'],
}
export default class calculsRacinesCarresPafaitsDecimaux extends Exercice {
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
      let reponse, choix
      switch (randint(1, 2)) {
        case 1:
          choix = choice([true, false])
          a =
            choix === true
              ? new Decimal(randint(1, 12, 10)).div(choice([10, 100]))
              : new Decimal(randint(1, 12, 10)).mul(choice([10, 100]))
          b = a.pow(2)
          reponse = texNombre(a, 2)
          texte = 'Compléter.<br>'
          if (this.interactif) {
            handleAnswers(this, i, {
              champ1: { value: reponse },
            })
            texte += remplisLesBlancs(
              this,
              i,
              `\\sqrt{${texNombre(b, 4)}} = %{champ1}`,
              KeyboardType.clavierNumbers,
            )
          } else {
            texte += `$\\sqrt{${texNombre(b, 4)}} = \\ldots$`
          }
          texteCorr = `$\\sqrt{${texNombre(b, 4)}} =${miseEnEvidence(texNombre(a, 2))}$`

          this.canEnonce = 'Compléter.'
          this.canReponseACompleter = `$\\sqrt{${texNombre(b, 4)}} = \\ldots$`
          this.listeCanEnonces.push(this.canEnonce)
          this.listeCanReponsesACompleter.push(this.canReponseACompleter)
          break

        case 2:
          choix = choice([true, false])
          a =
            choix === true
              ? (a = new Decimal(randint(1, 12, 10)).div(10))
              : new Decimal(randint(1, 12, 10)).mul(10)
          b = a.pow(2)
          reponse = texNombre(b, 4)
          texte = 'Compléter.<br>'
          if (this.interactif) {
            handleAnswers(this, i, {
              champ1: { value: reponse },
            })
            texte += remplisLesBlancs(
              this,
              i,
              `\\sqrt{%{champ1}} = ${texNombre(a, 2)}`,
              KeyboardType.clavierDeBaseAvecFraction,
            )
          } else {
            texte += `$\\sqrt{\\ldots} =${texNombre(a, 2)} $`
          }
          texteCorr = `On a ${
            choix === true
              ? `$${texNombre(a, 2)}^2=${texNombre(b, 4)}$.`
              : `$${texNombre(a, 2)}^2=${new Decimal(a).div(10)}^2\\times 10^2=${texNombre(b, 4)}$.`
          }<br>
          Donc $\\sqrt{${miseEnEvidence(texNombre(b, 4))}} =${texNombre(a, 2)}$.<br>`

          this.canEnonce = 'Compléter.'
          this.canReponseACompleter = `$\\sqrt{\\ldots} =${texNombre(a, 2)} $`
          this.listeCanEnonces.push(this.canEnonce)
          this.listeCanReponsesACompleter.push(this.canReponseACompleter)
          break
      }
      if (this.questionJamaisPosee(i, String(a), String(b))) {
        this.listeCorrections[i] = texteCorr
        this.listeQuestions[i] = texte

        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
