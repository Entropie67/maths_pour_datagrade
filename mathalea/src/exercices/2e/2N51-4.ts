import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
  ecritureParentheseSiNegatif,
  rienSi1,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { abs, signe } from '../../lib/outils/nombres'

export const titre =
  'Appliquer la double distributivité avec les racines carrées'
export const dateDeModifImportante = '30/09/2025'
export const interactifReady = true

/**
 * @author Stéphane Guyon + Gilles Mora pour modification
 */
export const uuid = '660de'

export const refs = {
  'fr-fr': ['2N51-4'],
  'fr-ch': ['1mCN-10', '11LSNO3C-5'],
}
export default class DoubleDistributiviteAvecRacineCarree extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Choix des questions',
      3,
      '1 : Coefficient égal à 1 \n2 : Coefficient différent de 1\n3 : Mélange',
    ]
    this.sup = 1
    // this.correctionDetaillee = false
    // this.correctionDetailleeDisponible = true
    this.spacing = 2
    this.nbQuestions = 1
    this.nbCols = 2
  }

  nouvelleVersion() {
    let typesDeQuestionsDisponibles: number[] = []
    if (this.sup === 1) {
      typesDeQuestionsDisponibles = [3]
    } else if (this.sup === 2) {
      typesDeQuestionsDisponibles = [1, 2]
    } else {
      typesDeQuestionsDisponibles = [1, 2, 3]
    }

    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )

    this.consigne =
      this.nbQuestions === 1
        ? 'Développer le produit suivant.'
        : 'Développer les produits suivants.'
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const typesDeQuestions = listeTypeDeQuestions[i]

      let a1 = 0
      let a2 = 0
      let a = 0
      let b1 = 0
      let b2 = 0
      let aaa = 0
      let aa1 = 0
      let aa2 = 0
      let bb = 0
      let bb1 = 0
      let bb2 = 0
      let bb3 = 0
      let texte = ''
      let texteCorr = ''
      let reponse = ''

      switch (typesDeQuestions) {
        // Cas par cas, on définit le type de nombres que l'on souhaite
        // Combien de chiffres ? Quelles valeurs ?
        case 1:
          a1 = randint(2, 9) * choice([-1, 1, 1])
          a = randint(2, 11, [4, 8, 9])
          b1 = randint(2, 9) * choice([-1, 1])
          a2 = randint(2, 9)
          b2 = randint(2, 9) * choice([-1, 1])
          aa1 = a1 * a2 * a
          bb = b1 * b2
          aa2 = a1 * b2 + b1 * a2
          aaa = aa1 + bb
          if (aa2 === 0) {
            b2 = -b2
            bb = b1 * b2
            aa2 = a1 * b2 + b1 * a2
            aaa = aa1 + bb
          }
          texte = `\\left(${a1}\\sqrt{${a}}${ecritureAlgebrique(b1)}\\right)\\left(${a2}\\sqrt{${a}}${ecritureAlgebrique(b2)}\\right)`
          reponse = `${aa2} \\sqrt{${a}}${ecritureAlgebrique(aaa)}`
          texteCorr = `On développe en utilisant la double distributivité : <br><br>
          $\\begin{aligned}
${texte}&=${a1}\\sqrt{${a}}\\times ${a2}\\sqrt{${a}}${ecritureAlgebrique(a1)}\\sqrt{${a}} \\times ${ecritureParentheseSiNegatif(b2)} ${ecritureAlgebrique(b1)} \\times ${a2}\\sqrt{${a}}${ecritureAlgebrique(b1)} \\times ${ecritureParentheseSiNegatif(b2)}\\\\
   &=\\underbrace{${a1}\\times ${a2}}_{=${a1 * a2}}\\times\\underbrace{\\sqrt{${a}}\\times \\sqrt{${a}}}_{=${a}}${ecritureAlgebrique(a1 * b2)}\\sqrt{${a}} ${ecritureAlgebrique(b1 * a2)}\\sqrt{${a}}${ecritureAlgebrique(b1 * b2)}\\\\
   &=${a1 * a2}\\times ${a} +(${a1 * b2}${ecritureAlgebrique(b1 * a2)})\\sqrt{${a}} ${ecritureAlgebrique(bb)}\\\\
                   &=${miseEnEvidence(`${rienSi1(aa2)} \\sqrt{${a}}${ecritureAlgebrique(aaa)}`)}
                   \\end{aligned}$
                  `
          break

        case 2:
          a1 = randint(2, 9) * choice([-1, 1, 1])
          a = randint(2, 11, [4, 8, 9])
          b1 = randint(2, 9) * choice([-1, 1, 1])
          b2 = randint(2, 9)
          a2 = randint(2, 9)
          aa1 = a1 * b2
          aa2 = a1 * a2
          bb = b1 * b2
          bb1 = b1 * a2
          bb2 = bb + aa2 * a
          bb3 = aa1 + bb1
          texte = `\\left(${a1}\\sqrt{${a}}${ecritureAlgebrique(b1)}\\right)\\left(${b2} ${ecritureAlgebrique(a2)}\\sqrt{${a}}\\right)`
          reponse = `${bb3}\\sqrt{${a}}${ecritureAlgebrique(bb2)}`
          texteCorr = `On développe en utilisant la double distributivité : <br><br>
          $\\begin{aligned}
${texte}&=${a1}\\sqrt{${a}}\\times ${b2}${ecritureAlgebrique(a1)}\\sqrt{${a}} \\times ${ecritureParentheseSiNegatif(a2)}\\sqrt{${a}}${ecritureAlgebrique(b1)} \\times ${b2} ${ecritureAlgebrique(b1)} \\times ${a2}\\sqrt{${a}}\\\\
 &=${aa1}\\sqrt{${a}}${signe(a1)} \\underbrace{${abs(a1)}\\times ${a2}}_{=${abs(a1) * a2}}\\times \\underbrace{\\sqrt{${a}}\\times \\sqrt{${a}}}_{=${a}} ${ecritureAlgebrique(bb)} ${ecritureAlgebrique(bb1)} \\sqrt{${a}} \\\\
&=(${aa1}${ecritureAlgebrique(bb1)})\\sqrt{${a}} ${ecritureAlgebrique(aa2)}\\times ${a} ${ecritureAlgebrique(bb)} \\\\
                   &=${miseEnEvidence(`${rienSi1(bb3)}\\sqrt{${a}}${ecritureAlgebrique(bb2)}`)}
                   \\end{aligned}$`
          break

        case 3:
        default:
          a1 = 1
          a = randint(2, 11, [4, 8, 9])
          b1 = randint(2, 9) * choice([-1, 1])
          a2 = 1
          b2 = randint(2, 9) * choice([-1, 1])
          aa1 = a1 * a2 * a
          bb = b1 * b2
          aa2 = a1 * b2 + b1 * a2
          aaa = aa1 + bb
          if (aa2 === 0) {
            b2 = -b2
            bb = b1 * b2
            aa2 = a1 * b2 + b1 * a2
            aaa = aa1 + bb
          }
          texte = `\\left(\\sqrt{${a}}${ecritureAlgebrique(b1)}\\right)\\left(\\sqrt{${a}}${ecritureAlgebrique(b2)}\\right)`
          reponse = `${rienSi1(aa2)} \\sqrt{${a}}${ecritureAlgebrique(aaa)}`
          texteCorr = `On développe en utilisant la double distributivité : <br><br>
          $\\begin{aligned}
${texte}&=\\underbrace{\\sqrt{${a}}\\times \\sqrt{${a}}}_{=${a}}${ecritureAlgebriqueSauf1(a1)}\\sqrt{${a}} \\times ${ecritureParentheseSiNegatif(b2)} ${ecritureAlgebrique(b1)} \\times \\sqrt{${a}}${ecritureAlgebrique(b1)} \\times ${ecritureParentheseSiNegatif(b2)}\\\\
   &=${a}${ecritureAlgebrique(a1 * b2)}\\sqrt{${a}} ${ecritureAlgebrique(b1 * a2)}\\sqrt{${a}}${ecritureAlgebrique(b1 * b2)}\\\\
   &=${a}+(${a1 * b2} ${ecritureAlgebrique(b1 * a2)})\\sqrt{${a}} ${ecritureAlgebrique(b1 * b2)}\\\\
                   &=${miseEnEvidence(reponse)}
                   \\end{aligned}$`
          break
      }
      texte = `$${texte}$`
      texte += ajouteChampTexteMathLive(
        this,
        i,
        KeyboardType.clavierFullOperations,
        { texteAvant: '$=$' },
      )
      handleAnswers(this, i, { reponse: { value: reponse } })

      if (this.questionJamaisPosee(i, a1, a2, a, b1, b2)) {
        // <- laisser le i et ajouter toutes les variables qui rendent les exercices différents (par exemple a, b, c et d)
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
