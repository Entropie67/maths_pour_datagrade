import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { remplisLesBlancs } from '../../lib/interactif/questionMathLive'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { context } from '../../modules/context'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Connaître la relation de Pascal'

export const interactifReady = true

export const dateDePublication = '25/4/2025'
export const dateDeModifImportante = '10/06/2026'

export const uuid = '300a4'
export const refs = {
  'fr-fr': ['TSG1-08'],
  'fr-ch': ['4mProbStat-18'],
}
/**
 * @author Stéphane Guyon
 */

export default class relationPascal extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''
      const n = randint(5, 18)
      const k = randint(1, n - 1)
      texte = `Simplifier sans effectuer de calculs $\\dbinom{${n - 1}}{${k - 1}}+\\dbinom{${n - 1}}{${k}}$`
      texteCorr = "C'est un résultat de cours, la relation de Pascal.<br>"
      texteCorr +=
        'On sait que pour tout entiers $n$ et $k$, tels que $k\\leqslant n$, on a : $\\dbinom{n}{k} = \\dbinom{n-1}{k-1} + \\dbinom{n-1}{k}$.<br>'
      texteCorr += `Donc $\\dbinom{${n - 1}}{${k - 1}} + \\dbinom{${n - 1}}{${k}} = ${miseEnEvidence(`\\dbinom{${n}}{${k}}`)}$.<br><br>`
      if (context.isHtml)
        texteCorr +=
          '<iframe src="https://podeduc.apps.education.fr/video/90025-demontrer-la-relation-de-pascal/?is_iframe=true" width="640" height="360" style="padding: 0; margin: 0; border:0" allowfullscreen title="Demontrer la Relation de Pascal" ></iframe>'
      if (this.interactif) {
        texte += remplisLesBlancs(
          this,
          i,
          '=\\begin{pmatrix}%{champ1}\\\\%{champ2}\\end{pmatrix}',
        )
        handleAnswers(this, i, { champ1: { value: n }, champ2: { value: k } })
      }
      texte += '.'
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
