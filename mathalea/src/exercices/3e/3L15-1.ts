import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { context } from '../../modules/context'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Résoudre une équation $x^2 = a$'
export const interactifReady = true

/**
 * Résoudre une équation de type x²=a
 * @author Jean-claude Lhote
 */
export const uuid = '57f44'

export const refs = {
  'fr-fr': ['3L15-1'],
  'fr-ch': ['11LSFA4E-5'],
}
export default class ResoudreEquatioeX2EgalA extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Niveau de difficulté',
      4,
      ' 1 : Solutions entières\n 2 : Solutions rationnelles\n 3 : Solutions irrationnelles\n 4 : Mélange',
    ]

    this.nbQuestions = 5

    this.sup = 1

    this.spacingCorr = context.isHtml ? 2 : 1.5
  }

  nouvelleVersion() {
    this.consigne =
      'Résoudre ' +
      (this.nbQuestions !== 1
        ? 'les équations suivantes'
        : "l'équation suivante") +
      '.'
    const listeFractions = [
      [1, 2],
      [1, 3],
      [2, 3],
      [1, 4],
      [3, 4],
      [1, 5],
      [2, 5],
      [3, 5],
      [4, 5],
      [1, 6],
      [5, 6],
      [1, 7],
      [2, 7],
      [3, 7],
      [4, 7],
      [5, 7],
      [6, 7],
      [1, 8],
      [3, 8],
      [5, 8],
      [7, 8],
      [1, 9],
      [2, 9],
      [4, 9],
      [5, 9],
      [7, 9],
      [8, 9],
      [1, 10],
      [3, 10],
      [7, 10],
      [9, 10],
    ]
    let listeTypeQuestions: number[] = []
    switch (this.sup) {
      case 1:
        listeTypeQuestions = combinaisonListes([1], this.nbQuestions)
        break
      case 2:
        listeTypeQuestions = combinaisonListes([2], this.nbQuestions)
        break
      case 3:
        listeTypeQuestions = combinaisonListes([3], this.nbQuestions)
        break
      case 4:
        listeTypeQuestions = combinaisonListes([1, 2, 3], this.nbQuestions)
    }
    for (
      let i = 0, fraction, ns, ds, a, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      switch (listeTypeQuestions[i]) {
        case 1:
          a = randint(1, 20) // x²=a*a donc x=a ou -a.
          texte = `$x^2=${a * a}$`
          texteCorr = `$x^2=${a * a}$ équivaut à $x = \\sqrt{${a * a}}$ ou $x = -\\sqrt{${a * a}}$.<br>Soit $x = ${a}$ ou $x = -${a}$.<br>`
          texteCorr += `Les solutions de l'équation sont donc $${miseEnEvidence(`${a};-${a}`)}$.<br>`
          texteCorr += `Il est équivalent de résoudre $x^2 - ${a * a}=0$, c'est-à-dire $x^2 - ${a}^{2}=0$.<br>Soit $(x - ${a})(x + ${a})=0$ qui donne les deux solutions ci-dessus. `
          handleAnswers(this, i, {
            reponse: {
              value: `${a};${-a}`,
              options: { suiteDeNombres: true },
            },
          })
          break
        case 2: // x²=(ns*ns)/(ds*ds) solutions rationnelles
          fraction = choice(listeFractions)
          ns = fraction[0]
          ds = fraction[1]
          a = ns * 1000 + ds // Pour avoir un marqueur de question unique (les doublons sont testés avec la variable a)
          texte = `$x^2=\\dfrac{${ns * ns}}{${ds * ds}}$`
          texteCorr = `$x^2=\\dfrac{${ns * ns}}{${ds * ds}}$ équivaut à $x = \\sqrt{\\dfrac{${ns * ns}}{${ds * ds}}}$ ou $x = -\\sqrt{\\dfrac{${ns * ns}}{${ds * ds}}}$.<br>Soit $x = \\dfrac{${ns}}{${ds}}$ ou $x = -\\dfrac{${ns}}{${ds}}$.<br>`
          texteCorr += `Les solutions de l'équation sont donc $${miseEnEvidence(`\\dfrac{${ns}}{${ds}};-\\dfrac{${ns}}{${ds}}`)}$.<br>`
          texteCorr += `Il est équivalent de résoudre $x^2 - \\dfrac{${ns * ns}}{${ds * ds}}=0$, c'est-à-dire $x^2 - (\\dfrac{${ns}}{${ds}})^{2}=0$.<br>Soit $(x - \\dfrac{${ns}}{${ds}})(x + \\dfrac{${ns}}{${ds}})=0$ qui donne les deux solutions ci-dessus. `
          handleAnswers(this, i, {
            reponse: {
              value: `\\dfrac{${ns}}{${ds}};-\\dfrac{${ns}}{${ds}}`,
              options: { suiteDeNombres: true },
            },
          })
          break
        case 3:
        default:
          a = randint(2, 50, [4, 9, 16, 25, 36, 49]) // solution irrationnelles
          texte = `$x^2=${a}$`
          texteCorr = `$x^2=${a}$ équivaut à $x = \\sqrt{${a}}$ ou $x = -\\sqrt{${a}}$.<br>`
          texteCorr += `Les solutions de l'équation sont donc $${miseEnEvidence(`\\sqrt{${a}};-\\sqrt{${a}}`)}$.<br>`
          texteCorr += `Il est équivalent de résoudre $x^2 - ${a}=0$, c'est-à-dire $x^2 - (\\sqrt{${a}})^{2}=0$.<br>Soit $(x - \\sqrt{${a}})(x + \\sqrt{${a}})=0$ qui donne les deux solutions ci-dessus. `
          handleAnswers(this, i, {
            reponse: {
              value: `\\sqrt{${a}};-\\sqrt{${a}}`,
              options: { suiteDeNombres: true },
            },
          })
          break
      }
      texte += ajouteChampTexteMathLive(this, i, KeyboardType.lyceeClassique)
      if (this.questionJamaisPosee(i, a)) {
        // Si la question n'a jamais été posée, on en créé une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    this.introduction =
      this.interactif && context.isHtml
        ? "<em>S'il y a plusieurs réponses, les séparer par un point-virgule.</em>"
        : ''
    listeQuestionsToContenu(this)
  }
}
