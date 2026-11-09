// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 59365 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
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
export const uuid = '59365'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export default class calculsRacinesCarresPafaitsOld extends Exercice {
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
      const exp = randint(-4, 4, 0)
      switch (randint(1, 2)) {
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
      if (this.questionJamaisPosee(i, exp, String(a), String(b))) {
        this.listeCorrections[i] = texteCorr
        this.listeQuestions[i] = texte

        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
