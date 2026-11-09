import { miseEnEvidence } from '../../lib/outils/embellissements'
import { Polynome } from '../../lib/mathFonctions/Polynome'
import { context } from '../../modules/context'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'
export const dateDePublication = '30/10/2021'
export const titre = 'Effectuer la division de polynômes'

/**
 *
 * @author Jean-claude Lhote
 * à partir d'un exercice de Éric Schrafstetter
 * abandon de l'usage de xcas au profit de Polynome.
 */
export const uuid = 'ad6a2'

export const refs = {
  'fr-fr': ['HPC100'],
  'fr-ch': [],
}
export default class DivisionDePolynomes extends Exercice {
  declare sup: number

  constructor() {
    super()

    this.consigne =
      'Calculer le quotient $Q(x)$ de la division de $P(x)$ par $D(x)$.'

    this.nbQuestions = 2

    this.spacingCorr = context.isHtml ? 2 : 1
    this.sup = 1 // Niveau de difficulté
  }

  nouvelleVersion() {
    for (
      let i = 0, texte, texteCorr, a, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      // Boucle principale où i+1 correspond au numéro de la question
      a = randint(-5, 5, 0)
      const diviseur = new Polynome({ coeffs: [a, 1] })
      const quotient = new Polynome({ rand: true, deg: 2 })
      const dividende = diviseur.multiply(quotient)

      const mon2 = new Polynome({ coeffs: [0, 0, quotient.monomes[2]] })
      const prod2 = diviseur.multiply(mon2)

      const dividende2 = dividende.add(prod2.multiply(-1))
      const mon3 = new Polynome({ coeffs: [0, quotient.monomes[1]] })

      const prod3 = diviseur.multiply(mon3)
      const dividende3 = dividende2.add(prod3.multiply(-1))

      const mon4 = new Polynome({ coeffs: [quotient.monomes[0]] })
      const prod4 = diviseur.multiply(mon4)

      texte = `$P(x)=${dividende.toLatex()}$ par $D(x)=${diviseur.toLatex()}$.`
      // Corrigé
      texteCorr = `$\\begin{array}{l|l} \\phantom{-}${dividende.toLatex()} & ${diviseur.toLatex()}\\\\`
      texteCorr += `\\underline{-(${prod2.toLatex()})} & \\overline{${quotient.toLatex()}}\\\\`
      texteCorr += `\\phantom{-(${dividende.monomes[3]}x^3}${dividende2.toLatex()} & \\\\`
      texteCorr += `\\phantom{-(${dividende.monomes[3]}x}\\underline{-(${prod3.toLatex()})} & \\\\`
      texteCorr += `\\phantom{-(${dividende.monomes[3]}x^3-(${prod2.monomes[2]}^2)}${dividende3.toLatex()} & \\\\`
      texteCorr += `\\phantom{-(${dividende.monomes[3]}x^3-(${prod2.monomes[2]}^2}\\underline{-(${prod4.toLatex()})} & \\\\`
      texteCorr += `\\phantom{-(${dividende.monomes[3]}x^3-(${prod2.monomes[2]}^2)-(${prod3.monomes[1]}x}0 & \\end{array}$`
      texteCorr += `<br>D'où $Q(x)=${miseEnEvidence(quotient.toLatex())}$.`

      if (this.listeQuestions.indexOf(texte) === -1) {
        // Si la question n'a jamais été posée, on en crée une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
