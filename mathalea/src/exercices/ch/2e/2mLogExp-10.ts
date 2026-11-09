import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import { remplisLesBlancs } from '../../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { listeQuestionsToContenu, randint } from '../../../modules/outils'
import Exercice from '../../Exercice'

export const titre = 'Utiliser les propriétés des logarithmes'
export const dateDePublication = '12/02/2026'
export const interactifReady = true

export const uuid = '2l10e'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['2mLogExp-10'],
}

/**
 * Propriétés des logarithmes
 * @author Nathan Scheinmann
 */
export default class ProprietesLogarithmes extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 4
    this.besoinFormulaireCaseACocher = ['Logarithme népérien (ln)', false]
    this.sup = false
  }

  nouvelleVersion() {
    const logString = this.sup ? '\\ln' : '\\log'

    const listeVariantes = combinaisonListes(
      ['somme', 'difference', 'puissance', 'combinaison'],
      this.nbQuestions,
    )

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''
      let cleUnique = ''
      let numerateur = 0
      let denominateur = 0

      // Propriétés des logarithmes (somme→produit, différence→quotient, puissance)
      const variante = listeVariantes[i]

      if (variante === 'somme') {
        // log_a(b) + log_a(c) = log_a(bc)
        const a = choice([2, 3, 5, 10])
        const b = randint(2, 10)
        const c = randint(2, 10)
        const produit = b * c

        cleUnique = `proprietes-somme-${a}-${b}-${c}`
        numerateur = produit
        denominateur = a

        texte = `Exprimer $\\log_{${a}}(${b}) + \\log_{${a}}(${c})$ sous la forme $\\dfrac{${logString}(\\ldots)}{${logString}(\\ldots)}$.`

        texteCorr = `On utilise la propriété : $\\log_a(b) + \\log_a(c) = \\log_a(b \\times c)$<br><br>`
        texteCorr += `$\\begin{aligned}\n`
        texteCorr += `\\log_{${a}}(${b}) + \\log_{${a}}(${c}) &= \\log_{${a}}(${b} \\times ${c})\\\\\n`
        texteCorr += `&= \\log_{${a}}(${produit})\\\\\n`
        texteCorr += `&= ${miseEnEvidence(`\\dfrac{${logString}(${produit})}{${logString}(${a})}`)}\n`
        texteCorr += `\\end{aligned}$`
      } else if (variante === 'difference') {
        // log_a(b) - log_a(c) = log_a(b/c)
        const a = choice([2, 3, 5, 10])
        const c = randint(2, 8)
        const multiple = randint(2, 5)
        const b = c * multiple

        cleUnique = `proprietes-difference-${a}-${b}-${c}`

        const quotient = b / c
        numerateur = quotient
        denominateur = a

        texte = `Exprimer $\\log_{${a}}(${b}) - \\log_{${a}}(${c})$ sous la forme $\\dfrac{${logString}(\\ldots)}{${logString}(\\ldots)}$.`

        texteCorr = `On utilise la propriété : $\\log_a(b) - \\log_a(c) = \\log_a\\left(\\dfrac{b}{c}\\right)$<br><br>`
        texteCorr += `$\\begin{aligned}\n`
        texteCorr += `\\log_{${a}}(${b}) - \\log_{${a}}(${c}) &= \\log_{${a}}\\left(\\dfrac{${b}}{${c}}\\right)\\\\\n`
        texteCorr += `&= \\log_{${a}}(${quotient})\\\\\n`
        texteCorr += `&= ${miseEnEvidence(`\\dfrac{${logString}(${quotient})}{${logString}(${a})}`)}\n`
        texteCorr += `\\end{aligned}$`
      } else if (variante === 'puissance') {
        // n·log_a(b) = log_a(b^n)
        const a = choice([2, 3, 5, 10])
        const b = randint(2, 6)
        const n = randint(2, 4)
        const puissance = b ** n

        cleUnique = `proprietes-puissance-${a}-${b}-${n}`
        numerateur = puissance
        denominateur = a

        texte = `Exprimer $${n}\\log_{${a}}(${b})$ sous la forme $\\dfrac{${logString}(\\ldots)}{${logString}(\\ldots)}$.`

        texteCorr = `On utilise la propriété : $n \\cdot \\log_a(b) = \\log_a(b^n)$<br><br>`
        texteCorr += `$\\begin{aligned}\n`
        texteCorr += `${n}\\log_{${a}}(${b}) &= \\log_{${a}}(${b}^{${n}})\\\\\n`
        texteCorr += `&= \\log_{${a}}(${puissance})\\\\\n`
        texteCorr += `&= ${miseEnEvidence(`\\dfrac{${logString}(${puissance})}{${logString}(${a})}`)}\n`
        texteCorr += `\\end{aligned}$`
      } else {
        // Combinaison : n·log_a(b) + log_a(c) = log_a(b^n·c)
        const a = choice([2, 3, 5, 10])
        const b = randint(2, 5)
        const c = randint(2, 8)
        const n = randint(2, 3)
        const resultatArg = b ** n * c

        cleUnique = `proprietes-combinaison-${a}-${b}-${c}-${n}`
        numerateur = resultatArg
        denominateur = a

        texte = `Exprimer $${n}\\log_{${a}}(${b}) + \\log_{${a}}(${c})$ sous la forme $\\dfrac{${logString}(\\ldots)}{${logString}(\\ldots)}$.`

        texteCorr = `On utilise les propriétés : $n \\cdot \\log_a(b) = \\log_a(b^n)$ et $\\log_a(x) + \\log_a(y) = \\log_a(xy)$<br><br>`
        texteCorr += `$\\begin{aligned}\n`
        texteCorr += `${n}\\log_{${a}}(${b}) + \\log_{${a}}(${c}) &= \\log_{${a}}(${b}^{${n}}) + \\log_{${a}}(${c})\\\\\n`
        texteCorr += `&= \\log_{${a}}(${b ** n}) + \\log_{${a}}(${c})\\\\\n`
        texteCorr += `&= \\log_{${a}}(${b ** n} \\times ${c})\\\\\n`
        texteCorr += `&= \\log_{${a}}(${resultatArg})\\\\\n`
        texteCorr += `&= ${miseEnEvidence(`\\dfrac{${logString}(${resultatArg})}{${logString}(${a})}`)}\n`
        texteCorr += `\\end{aligned}$`
      }

      if (this.interactif) {
        texte += '<br>'
        texte += remplisLesBlancs(
          this,
          i,
          `\\dfrac{${logString}(%{champ1})}{${logString}(%{champ2})}`,
          KeyboardType.clavierDeBase,
        )
        handleAnswers(this, i, {
          champ1: { value: `${numerateur}` },
          champ2: { value: `${denominateur}` },
        })
      }

      if (this.questionJamaisPosee(i, cleUnique)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
