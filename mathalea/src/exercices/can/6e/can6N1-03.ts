import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre =
  'Déterminer un nombre à partir de son nombre de centaines, dizaines, unités'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
export const dateDePublication = '01/07/2021'
export const dateDeModifImportante = '26/10/2024'
/**
 * @author Jean-claude Lhote +Gilles Mora pour modif (intégration du can6N1-02)
 * Créé pendant l'été 2021

 */
export const uuid = '1dbee'

export const refs = {
  'fr-fr': ['can6N1-03', '6N1A-flash3', '6AutoN3-1'],
  'fr-ch': ['NR'],
}
export default class RecomposerEntierMoinsSimple extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    const c = this.quotaRandint('c', 2, 30)
    const d = randint(2, 30, c)
    const u = randint(2, 30, [c, d])
    switch (
      this.quotaChoice('cas', [1, 2, 3]) //
    ) {
      case 1:
        this.reponse = c * 100 + d * 10
        this.question = `Écrire le nombre égal à $${c}$ centaines et $${d}$ dizaines.`
        this.correction = `$\\begin{aligned}
        ${c} \\times 100 + ${d} \\times 10 &= ${texNombre(c * 100)} + ${d * 10}\\\\
        &=${miseEnEvidence(texNombre(c * 100 + d * 10))}
        \\end{aligned}$`
        break

      case 2:
        this.reponse = c * 100 + u
        this.question = `Écrire le nombre égal à $${texNombre(c)}$ centaines et $${texNombre(u)}$ unités. `
        this.correction = `$\\begin{aligned}
        ${texNombre(c)} \\times 100 + ${texNombre(u)}\\times 1 &=${texNombre(c * 100)}+${u}\\\\
        &= ${miseEnEvidence(texNombre(c * 100 + u))}
        \\end{aligned}$`
        break

      case 3:
        this.reponse = d * 10 + u
        this.question = `Écrire le nombre égal à $${texNombre(d)}$ dizaines et $${texNombre(u)}$ unités. `
        this.correction = `$\\begin{aligned}
        ${texNombre(d)} \\times 10 + ${texNombre(u)}\\times 1 &=${texNombre(d * 10)}+${u}\\\\
        &= ${miseEnEvidence(texNombre(d * 10 + u))}
        \\end{aligned}$`
        break
    }
    if (this.interactif) {
      this.question += '<br>'
    }
  }
}
