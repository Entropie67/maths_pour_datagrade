import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { reduireAxPlusB, rienSi1 } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import FractionEtendue from '../../modules/FractionEtendue'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Résoudre des équations avec la fonction exponentielle'
export const dateDePublication = '06/08/2025'
export const interactifReady = true

/**
 * Calculer la dérivée d'une fonction avec exp
 * @author Stéphane Guyon
 */

export const uuid = '61ed0'

export const refs = {
  'fr-fr': ['1AN30-3', 'TSA3-21', 'TCA7-21'],
  'fr-ch': [''],
}

export default class DeriveeExp1AN303 extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.besoinFormulaireTexte = [
      'Choix des questions',
      'Nombres séparés par des tirets :\n1 : $\\mathrm{e}^{ax+b}=0 \\text{ ou } \\mathrm{e}^{ax+b}=1$\n2 : $\\mathrm{e}^{ax+b} =\\mathrm{e}^{cx+d}$ \n3 : Mélange',
    ]
    this.sup = '3'
    this.spacing = 1.5
    this.spacingCorr = 1.5
  }

  nouvelleVersion() {
    const listeDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 2,
      melange: 3,
      defaut: 3,
      nbQuestions: this.nbQuestions,
    })
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''
      let value = ''
      const texteIntro = "Résoudre, dans $\\mathbb{R}$, l'équation : $"
      const propriete = `On utilise la propriété : <br>
              Pour tous réels $a$ et $b$, $\\mathrm{e}^a = \\mathrm{e}^b \\iff a = b$<br>
             On en déduit que :<br>`
      switch (listeDeQuestions[i]) {
        case 1: // e^x=0 ou 1
          {
            const a = randint(-10, 10, 0)
            const b = randint(-5, 5)
            const k = randint(0, 1)

            texte =
              texteIntro + `\\mathrm{e}^{${reduireAxPlusB(a, b)}} = ${k}$.<br>`
            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierFonctionsTerminalesEnsemble,
              { texteAvant: '<br>$S=$' },
            )
            if (k === 0) {
              texteCorr = `Pour tout réel $x$, $\\mathrm{e}^{${reduireAxPlusB(a, b)}}>0$.<br>
              L'équation n'a donc pas de solution et $S=${miseEnEvidence('\\emptyset')}$.`
              value = `\\emptyset`
            } else {
              const solution = new FractionEtendue(-b, a).simplifie()
              texteCorr = `${propriete}`
              texteCorr += `$\\begin{aligned}
              \\phantom{iff}&\\mathrm{e}^{${reduireAxPlusB(a, b)}}=1\\\\
              \\iff& \\mathrm{e}^{${reduireAxPlusB(a, b)}}=\\mathrm{e}^0\\\\
              \\iff& ${reduireAxPlusB(a, b)}=0\\\\
              \\iff& x=${solution.texFractionSimplifiee}
              \\end{aligned}$<br>
              Donc $S=${miseEnEvidence(`\\left\\{${solution.texFractionSimplifiee}\\right\\}`)}$.`
              value = `\\left\\{${solution.texFractionSimplifiee}\\right\\}`
            }

            handleAnswers(this, i, {
              reponse: { value, options: { ensembleDeNombres: true } },
            })
          }
          break
        case 2: // e^ax+b= e^cx+d
          {
            const a = randint(-10, 10, 0)
            const b = randint(-5, 5)
            const c = randint(-10, 10, 0)
            const d = randint(-5, 5, b)

            texte =
              texteIntro +
              `\\mathrm{e}^{${reduireAxPlusB(a, b)}} = \\mathrm{e}^{${reduireAxPlusB(c, d)}}$.<br>`
            texteCorr = `${propriete}`
            if (a === c) {
              texteCorr += `$\\begin{aligned}
	                \\phantom{iff}&\\mathrm{e}^{${reduireAxPlusB(a, b)}} = \\mathrm{e}^{${reduireAxPlusB(c, d)}}\\\\
	                \\iff& ${reduireAxPlusB(a, b)} = ${reduireAxPlusB(c, d)}\\\\
	                \\iff& ${b}=${d}
	               \\end{aligned}$<br>
	                Ce qui est faux. Donc $S=${miseEnEvidence('\\emptyset')}$.`
              value = `\\emptyset`
            } else {
              const solution = new FractionEtendue(d - b, a - c).simplifie()
              texteCorr += `$\\begin{aligned}
	              \\phantom{iff}&\\mathrm{e}^{${reduireAxPlusB(a, b)}} = \\mathrm{e}^{${reduireAxPlusB(c, d)}}\\\\
	              \\iff& ${reduireAxPlusB(a, b)} = ${reduireAxPlusB(c, d)}\\\\
	              \\iff& ${rienSi1(a - c)}x = ${d - b}\\\\
	              \\iff& x = ${solution.texFractionSimplifiee}\\end{aligned}$<br>
	              Donc $S=${miseEnEvidence(`\\left\\{${solution.texFractionSimplifiee}\\right\\}`)}$`
              value = `\\left\\{${solution.texFractionSimplifiee}\\right\\}`
            }

            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierFonctionsTerminalesEnsemble,
              { texteAvant: '<br>$S=$' },
            )

            handleAnswers(this, i, {
              reponse: { value, options: { ensembleDeNombres: true } },
            })
          }
          break
      }
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
