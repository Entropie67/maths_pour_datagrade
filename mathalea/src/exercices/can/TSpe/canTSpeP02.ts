import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import { remplisLesBlancs } from '../../../lib/interactif/questionMathLive'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { listeQuestionsToContenu, randint } from '../../../modules/outils'
import Exercice from '../../Exercice'

export const titre = "Calculer la variance d'une loi binomiale"
export const dateDePublication = '05/12/2025'
export const interactifReady = true

/**
 *
 * @author Stéphane Guyon
 */

export const uuid = '3a071'
export const refs = {
  'fr-fr': ['canTSpeP02'],
  'fr-ch': [],
}

export default class VarianceBinomiale extends Exercice {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''

      const n = choice([10, 20, 30, 40, 50])
      const p = randint(1, 9) / 10

      texte = `On répète $${n}$ fois et de manière indépendante une épreuve de Bernoulli, de paramètre $${texNombre(p, 2)}$. <br>
        Soit $X$ la variable aléatoire qui compte le nombre de succès obtenus. <br>Déterminer sa variance.<br>`
      handleAnswers(this, i, {
        champ1: { value: texNombre(n * p * (1 - p)) },
      })
      if (this.interactif) {
        texte += remplisLesBlancs(this, i, `<br>V(X)=~%{champ1}.`)
      }

      texteCorr = ` D'après l'énoncé, $X$ suit une loi binomiale de paramètres $n=${n}$ et $p=${texNombre(p, 2)}$.  <br>
      La variance d'une variable aléatoire qui suit une loi binomiale est donnée par la formule : 
      $V(X)=n\\times p \\times (1-p).$  <br>
      On obtient : <br>
      $V(X)=${n} \\times ${texNombre(p, 2)} \\times ${texNombre(1 - p, 2)}.$ <br>
      On en déduit que : $V(X)=${miseEnEvidence(texNombre(n * p * (1 - p)))}$.`
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
