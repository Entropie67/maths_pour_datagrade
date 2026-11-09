import { bleuMathalea } from '../../lib/colors'
import {
  addMathaleaSolveur,
  baremeSolveur,
  commentaireSolveur,
  formulaireBaremeSolveur,
  modeSolveur,
  optionsSolveur,
} from '../../lib/customElements/MathaleaSolveurElement'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { texFractionFromString } from '../../lib/outils/deprecatedFractions'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { listeQuestionsToContenu, randint } from '../../modules/outils'

import { Complexe } from '../../lib/mathFonctions/Complexe'
import Exercice from '../Exercice'
export const titre = 'Résoudre une équation du premier degré dans $\\mathbb{C}$'
export const interactifReady = true
export const dateDePublication = '30/10/2021'

/**
 *
 * @author Éric Schrafstetter
 */
export const uuid = '8e72e'

export const refs = {
  'fr-fr': ['TEC1-41'],
  'fr-ch': [],
}
export default class EquationDuPremierDegreDansC extends Exercice {
  constructor() {
    super()

    this.comment = commentaireSolveur
    this.besoinFormulaireCaseACocher = ['Mode entrainement en non interactif']
    this.sup = false
    this.besoinFormulaire2Numerique = formulaireBaremeSolveur()
    this.sup2 = 1

    this.consigne =
      'Résoudre dans $\\mathbb{C}$ les équations ci-dessous. On écrira les solutions éventuelles sous forme algébrique.'
    this.nbQuestions = 2

    this.spacingCorr = 2
  }

  nouvelleVersion() {
    for (
      let i = 0, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      // Boucle principale où i+1
      //  correspond au numéro de la question

      const z1 = new Complexe(randint(-20, 20, 0), randint(-20, 20, 0)) // L'énoncé est du type z1 * z + z2 = 0
      const z2 = new Complexe(randint(-20, 20, 0), randint(-20, 20, 0))
      const z1Bar = z1.conjugue()
      const moinsZ2 = z2.negate()
      const num = moinsZ2.mul(z1Bar)
      const z1z1Bar = z1.mul(z1Bar)

      // zsol = multiply(z2.neg(), z1.inverse()) // la solution est - z2 / z1
      const zSol = z2.negate().div(z1)

      // Enoncé
      const equation = `(${z1})z${'+'.repeat(Number(z2.re) > 0 ? 1 : 0)}${z2}=0` // ajout d'un signe + si partie réelle positive
      // Corrigé
      texteCorr = "Passons le terme constant du côté droit de l'équation :"
      texteCorr += `<br>$(${z1.tex()})z=${moinsZ2.tex()}$`
      texteCorr += `<br>Ce qui donne : $z = \\dfrac{${moinsZ2.tex()}}{${z1.tex()}}$`
      texteCorr += `<br>Pour faire disparaître le $i$ du dénominateur, utilisons le conjugué $\\overline{${z1.tex()}}=${z1Bar.tex()}$ du dénominateur :`
      texteCorr += `<br>$z = ${texFractionFromString(moinsZ2.tex(), z1.tex())}\\times ${miseEnEvidence(texFractionFromString(z1Bar.tex(), z1Bar.tex()), bleuMathalea)}$`
      texteCorr += `<br>Or $(${z1.tex()})(${z1Bar.tex()})=${z1.mul(z1Bar).tex()}$ `
      texteCorr += `et $(${moinsZ2.tex()})(${z1Bar.tex()})=${num.tex()}$`
      texteCorr += '<br>On en déduit que :'
      texteCorr += `<br>$z = ${texFractionFromString(num.tex(), z1z1Bar.tex())} = ${zSol.tex()}$`
      texteCorr += `<br>La solution de l'équation $${equation}$ est $${miseEnEvidence(zSol.tex())}$.`

      if (this.questionJamaisPosee(i, equation)) {
        // Si la question n'a jamais été posée, on en crée une autre
        texte = addMathaleaSolveur(this, i, {
          initial: equation,
          kind: 'equation',
          variable: 'z',
          complex: true,
          ...optionsSolveur(this.interactif, this.sup, this.sup2),
        })
        handleAnswers(
          this,
          i,
          {
            reponse: { value: `z=${zSol.tex()}` },
            bareme: baremeSolveur(modeSolveur(this.sup2)),
          },
          { formatInteractif: 'mathalea-solveur' },
        )
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
  // this.besoinFormulaireNumerique = ['Niveau de difficulté', 3]
}
