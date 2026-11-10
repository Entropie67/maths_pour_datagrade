import Exercice from '../../Exercice'

import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import { remplisLesBlancs } from '../../../lib/interactif/questionMathLive'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { listeQuestionsToContenu, randint } from '../../../modules/outils'
export const titre = 'Encadrer une racine carrée'
export const interactifReady = true

export const dateDeModifImportante = '20/09/2024'
/**
 * @author Gilles Mora
 */
export const uuid = '0ad86'

export const refs = {
  'fr-fr': ['can3C3-03', '2N50-flash4'],
  'fr-ch': ['NR'],
}
export default class EncadreRacine extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.spacing = 1.5
    this.correctionDetailleeDisponible = true
    this.correctionDetaillee = false
  }

  nouvelleVersion() {
    this.spacingCorr = 1.5

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''

      const a = randint(3, 125, [4, 9, 16, 25, 36, 49, 64, 81, 100, 121])

      texte = 'Compléter par deux entiers consécutifs.<br>'
      if (this.interactif) {
        texte += remplisLesBlancs(
          this,
          i,
          ` %{champ1} < \\sqrt{${a}} <  %{champ2}`,
          KeyboardType.clavierDeBase,
        )
      } else {
        texte += `$\\ldots < \\sqrt{${a}} < \\ldots$`
      }
      this.correction = `On encadre $${a}$ par deux carrés d'entiers : <br>
$${Math.floor(Math.sqrt(a))}^2< ${a} < ${Math.ceil(Math.sqrt(a))}^2$<br>`

      if (this.correctionDetaillee) {
        this.correction += `En prenant la racine carrée de chacun de ces nombres, on obtient : <br>
   $\\sqrt{${Math.floor(Math.sqrt(a))}^2}< \\sqrt{${a}} < \\sqrt{${Math.ceil(Math.sqrt(a))}^2}$ (on ne change pas le sens des inégalités en prenant les racines carrées)<br>`
      }
      this.correction += ` On en déduit  : $${miseEnEvidence(texNombre(Math.floor(Math.sqrt(a)), 0))}<\\sqrt{${a}}< ${miseEnEvidence(texNombre(Math.ceil(Math.sqrt(a)), 0))}$
     `

      handleAnswers(this, i, {
        bareme: (listePoints) => [Math.min(listePoints[0], listePoints[1]), 1],
        champ1: { value: `${Math.floor(Math.sqrt(a))}` },
        champ2: { value: `${Math.ceil(Math.sqrt(a))}` },
      })

      this.canEnonce = 'Compléter par deux entiers consécutifs.'
      this.canReponseACompleter = `$\\ldots < \\sqrt{${a}} <\\ldots$`
      if (this.questionJamaisPosee(i, a)) {
        this.listeCorrections[i] = this.correction
        this.listeQuestions[i] = texte
        this.listeCanEnonces[i] = this.canEnonce
        this.listeCanReponsesACompleter[i] = this.canReponseACompleter
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
