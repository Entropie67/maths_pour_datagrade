import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import { remplisLesBlancs } from '../../../lib/interactif/questionMathLive'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { listeQuestionsToContenu, randint } from '../../../modules/outils'
import Exercice from '../../Exercice'

export const titre = "Calculer l'espérance d'une loi binomiale"
export const dateDePublication = '05/12/2025'
export const interactifReady = true

/**
 *
 * @author Stéphane Guyon
 */

export const uuid = '88488'
export const refs = {
  'fr-fr': ['canTSpeP01'],
  'fr-ch': [],
}

export default class EsperanceBinomiale extends Exercice {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''

      const n = randint(4, 20)
      const p = randint(1, 9) / 10

      texte = `On répète $${n}$ fois et de manière indépendante une épreuve de Bernoulli, de paramètre $${texNombre(p, 2)}$. <br>
        Soit $X$ la variable aléatoire qui compte le nombre de succès obtenus. <br>`
      texte += `Déterminer son espérance.`
      handleAnswers(this, i, {
        champ1: { value: texNombre(n * p) },
      })
      if (this.interactif) {
        texte += '<br>' + remplisLesBlancs(this, i, `<br>E(X)=~%{champ1}`)
      }

      texteCorr = `D'après l'énoncé, $X$ suit une loi binomiale de paramètres $n=${n}$ et $p=${texNombre(p, 2)}.$  <br>
      L'espérance d'une variable aléatoire qui suit une loi binomiale est donnée par la formule : 
      $E(X)=n\\times p.$  <br>
      On obtient : <br>
      $E(X)=${n} \\times ${texNombre(p, 2)}.$ <br>
      On en déduit que : $E(X)=${miseEnEvidence(`${texNombre(n * p)}`)}.$`

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
