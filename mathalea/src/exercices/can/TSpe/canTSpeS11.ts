import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Raisonnement par récurrence'
export const interactifReady = true

export const dateDePublication = '19/02/2025'

export const uuid = '667d6'
export const refs = {
  'fr-fr': [''], // exo déréférencé - Pose problème de rigueur - Stéphane Guyon
  'fr-ch': [],
}

/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Stéphane Guyon

*/
export default class recurrence extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.optionsChampTexte = { texteAvant: '<br> $n$' }
    this.formatChampTexte = KeyboardType.clavierCompareAvecNombres
  }

  nouvelleVersion() {
    const n = randint(2, 8)
    const p = randint(2, 8, n)
    let reponse = ''
    this.question = `Une propriété $\\mathcal{P}_n$ est vraie pour $n=${n}$ et est héréditaire pour tout entier $p\\geqslant ${p}$.`
    this.question +=
      '<br>Pour quelle(s) valeur(s) de $n$ la propriété $\\mathcal{P}_n$ est-elle vraie ?'
    if (p < n) {
      this.correction = `Comme $n=${n}>p=${p}$, on peut dire que la propriété $\\mathcal{P}_n$ est vraie pour une valeur à partir de laquelle elle est héréditaire. `
      this.correction += `<br>$\\mathcal{P}_n$ est donc vraie à partir du rang $n=${n}$, c'est-à-dire pour $n${miseEnEvidence(`\\geqslant ${n}`)}$.`
      reponse = `\\geqslant ${n}`
    } else {
      this.correction = `Comme $n=${n} < p=${p}$, il n'existe pas d'entier $k$ pour lequel $\\mathcal{P}_k$ est vraie et héréditaire.`
      this.correction += `<br> $\\mathcal{P}_n$ est donc vraie uniquement en $n=${miseEnEvidence(n)}$.`
      reponse = `=${n}`
    }
    this.reponse = reponse
  }
}
