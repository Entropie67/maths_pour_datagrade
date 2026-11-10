import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureParentheseSiNegatif,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'

export const titre =
  'Développer les identités remarquables avec des racines carrées'
export const dateDeModifImportante = '25/04/2024'
export const interactifReady = true

/**
 * @author Stéphane Guyon
 * Relecture : Novembre 2021 par EE
 */
export const uuid = '91dc4'

export const refs = {
  'fr-fr': ['2N51-5'],
  'fr-ch': ['1mCN-11', '11LSNO3C-6'],
}
export default class IdentitesRemarquablesEtRacineCarree extends Exercice {
  constructor() {
    super()

    this.nbQuestions = 5
    this.nbCols = 2

    this.sup = 1
  }

  nouvelleVersion() {
    const typesDeQuestionsDisponibles = [1, 2, 3, 4, 5]
    let typesDeQuestions
    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )
    this.consigne =
      this.nbQuestions === 1
        ? 'Effectuer le calcul suivant.'
        : 'Effectuer les calculs suivants.'
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let a = 0
      let b = 0
      let c = 0
      let d = 0
      let texte = ''
      let texteCorr = ''
      let reponse = ''

      typesDeQuestions = listeTypeDeQuestions[i]
      switch (typesDeQuestions) {
        // Cas par cas, on définit le type de nombres que l'on souhaite
        // Combien de chiffres ? Quelles valeurs ?
        case 1:
          a = randint(2, 6) * choice([-1, 1])
          b = randint(2, 11, [4, 8, 9])
          c = randint(2, 6)

          texte = `\\left(${a} \\sqrt{${b}} +${c}\\right)^{2}`
          reponse = `${a * a * b + c * c}${ecritureAlgebrique(2 * a * c)}\\sqrt{${b}}`
          texteCorr = `$${texte}=\\left(${a} \\sqrt{${b}} \\right)^{2}+2\\times ${ecritureParentheseSiNegatif(a)}\\sqrt{${b}}\\times ${c}+${c}^{2}$<br>
                    $\\phantom{${texte}}=${ecritureParentheseSiNegatif(a)}^{2}\\times ${b} ${ecritureAlgebrique(2 * a * c)}\\sqrt{${b}}+ ${c * c}$<br>
                    $\\phantom{${texte}}=${a * a * b}${ecritureAlgebrique(2 * a * c)}\\sqrt{${b}}+${c * c}$<br>`
          break
        case 2:
          a = randint(2, 6) * choice([-1, 1])
          b = randint(2, 11, [4, 8, 9])
          c = randint(2, 6)

          texte = `\\left(${a} \\sqrt{${b}} -${c}\\right)^{2}`
          reponse = `${a * a * b + c * c}${ecritureAlgebrique(-2 * a * c)}\\sqrt{${b}}`
          texteCorr = `$${texte}=\\left(${a} \\sqrt{${b}} \\right)^{2}-2\\times ${ecritureParentheseSiNegatif(a)}\\sqrt{${b}}\\times ${c}+${c}^{2}$<br>
                    $\\phantom{${texte}}=${ecritureParentheseSiNegatif(a)}^{2}\\times ${b} ${ecritureAlgebrique(-2 * a * c)}\\sqrt{${b}}+ ${c * c}$<br>
                    $\\phantom{${texte}}=${a * a * b}${ecritureAlgebrique(-2 * a * c)}\\sqrt{${b}}+${c * c}$<br>`
          break
        case 3:
          a = randint(2, 6) * choice([-1, 1])
          b = randint(2, 11, [4, 8, 9])
          c = randint(2, 6)

          texte = `\\left(${a} \\sqrt{${b}} +${c}\\right)\\left(${a} \\sqrt{${b}}-${c}\\right)`
          reponse = `${a * a * b - c * c}`
          texteCorr = `$${texte}=\\left(${a} \\sqrt{${b}} \\right)^{2}-${c}^{2}$<br>
                    $\\phantom{${texte}}=${ecritureParentheseSiNegatif(a)}^{2}\\times ${b}-${c * c}$<br>
                        $\\phantom{${texte}}=${a * a * b}-${c * c}$<br>`
          break
        case 4:
          a = randint(2, 5) * choice([-1, 1])
          b = randint(3, 11, [4, 8, 9])
          c = randint(2, 5)
          d = randint(3, 11, [4, 8, 9, b, b * 2, b * 3, b * 5])

          texte = `\\left(${a} \\sqrt{${b}} +${c}\\sqrt{${d}}\\right)^{2}`
          reponse = `${a * a * b + c * c * d}${ecritureAlgebrique(2 * a * c)}\\sqrt{${b * d}}`
          texteCorr = `$${texte}=
                    \\left(${a} \\sqrt{${b}} \\right)^{2}+2\\times ${ecritureParentheseSiNegatif(a)}\\sqrt{${b}}\\times ${c}\\sqrt{${d}}+\\left(${c}\\sqrt{${d}}\\right)^{2}$<br>
                    $\\phantom{${texte}}=${ecritureParentheseSiNegatif(a)}^{2}\\times ${b} +2\\times ${ecritureParentheseSiNegatif(a)}
                    \\times \\sqrt{${b}}\\times ${ecritureParentheseSiNegatif(c)}    \\times\\sqrt{${d}}+ ${c * c}\\times ${d}$<br>
                    $\\phantom{${texte}}=${a * a * b} ${ecritureAlgebrique(2 * a * c)}\\sqrt{${b}\\times${d}} ${ecritureAlgebrique(c * c * d)}$<br>`
          break
        case 5:
        default:
          a = randint(2, 6) * choice([-1, 1])
          b = randint(2, 11, [4, 8, 9])
          c = randint(2, 6)
          d = randint(2, 11, [4, 8, 9])

          texte = `\\left(${a} \\sqrt{${b}} +${c}\\sqrt{${d}}\\right)\\left(${a} \\sqrt{${b}}-${c}\\sqrt{${d}}\\right)`
          reponse = `${a * a * b - c * c * d}`
          texteCorr = `$${texte}=\\left(${a} \\sqrt{${b}} \\right)^{2}-\\left(${c}\\sqrt{${d}}\\right)^{2}$<br>
                $\\phantom{${texte}}=${ecritureParentheseSiNegatif(a)}^{2}\\times ${b}-${c}^{2}\\times ${ecritureParentheseSiNegatif(d)}$<br>
                    $\\phantom{${texte}}=${a * a * b}-${c * c * d}$<br>`
          break
      }
      texteCorr += `$\\phantom{${texte}}=${miseEnEvidence(reponse)}$`
      texte = `$${texte}$`
      texte += ajouteChampTexteMathLive(
        this,
        i,
        KeyboardType.clavierFullOperations,
        { texteAvant: '$=$' },
      )
      handleAnswers(this, i, { reponse: { value: reponse } })

      if (this.questionJamaisPosee(i, a, b, c, d)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
