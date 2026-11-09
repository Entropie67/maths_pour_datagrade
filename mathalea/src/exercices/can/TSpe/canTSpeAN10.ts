import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import Exercice from '../../Exercice'

import FractionEtendue from '../../../modules/FractionEtendue'
import { listeQuestionsToContenu, randint } from '../../../modules/outils'

export const titre = 'Exprimer en fonction de log(n) ou ln(n)'
export const dateDePublication = '22/7/2024'
export const uuid = 'ae1a7'
export const interactifReady = true

export const refs = {
  'fr-fr': ['canTSpeAN10'],
  'fr-ch': [],
}

/**
 * Exprimer un nombre en fonction de ln(2), ln(3), ln(5)...
 * @author  Jean-claude Lhote

 */
export default class ExpressionsLog extends Exercice {
  version: string
  constructor() {
    super()
    this.version = 'ln'
    this.nbQuestions = 1
    this.spacingCorr = 3
    this.besoinFormulaireCaseACocher = ['Type de logarithme', false]
    this.comment =
      "Exercice de simplification d'expressions avec des logarithmes"
  }

  nouvelleVersion() {
    if (this.sup) this.version = 'ln'
    else this.version = 'log'
    const logString = this.version !== 'ln' ? '\\log' : '\\ln'

    const listeTypeQuestions = combinaisonListes([1, 2, 3, 4], this.nbQuestions)
    const listeDeA = combinaisonListes([2, 3, 5], this.nbQuestions)
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const a = listeDeA[i]
      let texte: string
      let texteCorr: string
      let answer: string
      let k: number | FractionEtendue
      const n =
        a === 2 ? randint(2, 8) : a === 3 ? randint(2, 5) : randint(2, 4)

      if (listeTypeQuestions[i] === 1) {
        // log(a^n)
        k = 1
        texte = `${logString} ${a ** n}`
        texteCorr = `$${texte}=${logString} ${a}^${n}=${n}${logString} ${a}$`
        answer = `${n}${logString}(${a})`
      } else if (listeTypeQuestions[i] === 2) {
        // log (1/a^n)
        k = 1
        texte = `${logString} \\dfrac{1}{${a ** n}}`
        texteCorr = `$${texte}=${logString}(${a}^{-${n}})=${-n}${logString} ${a}$`
        answer = `${-n}${logString}(${a})`
      } else if (listeTypeQuestions[i] === 3) {
        // klog(a^n)
        k = choice([true, false])
          ? randint(2, 5)
          : new FractionEtendue(1, randint(1, 3) * n)
        texte =
          k instanceof FractionEtendue
            ? `${k.texFraction}${logString} ${a ** n}`
            : `${k}${logString} ${a ** n}`

        texteCorr =
          k instanceof FractionEtendue
            ? `$${texte}=${k.texFraction}${logString} ${a}^${n}=${k.multiplieEntier(n).texFraction}${logString} ${a}=${k.multiplieEntier(n).texFractionSimplifiee}${logString} ${a}$`
            : `$${texte}=${k}${logString} ${a}^${n}=${k}\\times ${n}${logString} ${a}=${k * n}${logString} ${a}$`
        answer =
          k instanceof FractionEtendue
            ? `${k.multiplieEntier(n).texFractionSimplifiee}${logString} ${a}`
            : `${k * n}${logString}(${a})`
      } else {
        // klog(1/a^n)
        k = choice([true, false])
          ? randint(2, 5)
          : new FractionEtendue(1, randint(1, 3) * n)
        texte =
          k instanceof FractionEtendue
            ? `${k.texFraction}${logString} \\dfrac{1}{${a ** n}}`
            : `${k}${logString} \\dfrac{1}{${a ** n}}`

        texteCorr =
          k instanceof FractionEtendue
            ? `$${texte}=${k.texFraction}${logString} ${a}^{${-n}}=${k.multiplieEntier(-n).texFraction}${logString} ${a}=${k.multiplieEntier(-n).texFractionSimplifiee}${logString} ${a}$`
            : `$${texte}=${k}${logString} ${a}^{${-n}}=${-n}\\times ${k}${logString} ${a}=${-k * n}${logString} ${a}$`
        answer =
          k instanceof FractionEtendue
            ? `${k.multiplieEntier(-n).texFractionSimplifiee}${logString} ${a}`
            : `${-k * n}${logString}(${a})`
      } // exponentiation
      // on reprend la correction pour mettre me dernier membre en évidence.
      const chunks = texteCorr.split('=')
      const lastChunk = chunks[chunks.length - 1]
      chunks[chunks.length - 1] =
        miseEnEvidence(lastChunk.substring(0, lastChunk.length - 1)) + '$'
      texteCorr = chunks.join('=')
      // et voilà, c'est fait pour toute les corrections.
      if (
        this.questionJamaisPosee(
          i,
          n,
          listeTypeQuestions[i],
          k instanceof FractionEtendue ? k.texFraction : k,
        )
      ) {
        texte =
          `Exprimer en fonction de $${logString} ${a}$ le nombre suivant  : ` +
          `$${texte}$` // <- laisser le i et ajouter toutes les variables qui rendent les exercices différents (par exemple a, b, c et d)
        if (this.interactif) {
          texte += ajouteChampTexteMathLive(
            this,
            i,
            KeyboardType.clavierFonctionsTerminales,
            { texteAvant: '=' },
          )
          handleAnswers(this, i, { reponse: { value: answer } })
        }
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
