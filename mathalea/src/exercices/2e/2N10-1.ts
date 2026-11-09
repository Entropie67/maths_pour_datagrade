import { amcConvert } from '../../lib/amc/amcBuilders'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const amcReady = true
export const amcType = 'AMCOpen'
export const interactifReady = true

export const titre =
  'Déterminer le plus petit ensemble de nombres auquel un nombre appartient'
export const dateDeModifImportante = '13/08/2024'

// Modification la 1/11/23 par Rémi Angot
// computeEngine a un problème avec l'ensemble N qui n'est pas isSame avec lui même donc je suis passé par un format texte
// Eric : 28/02/2025 Version 0.54.1 : le pb ci-dessus n'est plus d'actualité.

/**
 * @author Stéphane Guyon (Exportable AMC et autres modifs par Éric Elter)
 */

export const uuid = '25fb4'

export const refs = {
  'fr-fr': ['2N10-1'],
  'fr-ch': ['11LCNO5A-1', '11LSNO5A-1'],
}
export default class EnsembleDeNombres extends Exercice {
  constructor() {
    super()

    this.consigne =
      'Parmi $\\mathbb{R}$, $\\mathbb{Q}$, $\\mathbb{D}$, $\\mathbb{Z}$ et $\\mathbb{N}$, déterminer le plus petit ensemble de nombres auquel le nombre proposé appartient.'
    this.nbQuestions = 5
    this.nbCols = 2
    this.nbColsCorr = 2
    this.sup = 10
    this.besoinFormulaireTexte = [
      'Type de questions',
      [
        'Nombres séparés par des tirets  :',
        '1 : Entier naturel',
        '2 : Entier relatif',
        '3 : Nombre décimal',
        "4 : Racine carrée d'un carré",
        '5 : Fraction égale à un entier',
        '6 : Nombre rationnel',
        '7 : Fraction égale à un décimal',
        '8 : Racine carrée irrationnelle',
        '9 : Nombre irrationnel',
        '10 : Mélange',
      ].join('\n'),
    ]
  }

  nouvelleVersion() {
    const typesDeQuestionsDisponibles = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 9,
      melange: 10,
      defaut: 10,
      nbQuestions: this.nbQuestions,
    })
    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let a = 0
      let b = 0
      let c = 0
      let d = 0
      let texte = ''
      let texteCorr = ''
      switch (listeTypeDeQuestions[i]) {
        // Cas par cas, on définit le type de nombres que l'on souhaite
        // Combien de chiffres ? Quelles valeurs ?
        case 1:
          b = 0
          a = randint(0, 150)

          texte = `$${a} \\in $`
          texteCorr = `$${a}$ est un entier naturel. On a donc $${a}\\in ${miseEnEvidence('\\mathbb{N}')}$.`
          handleAnswers(this, i, {
            reponse: { value: '\\mathbb{N}', options: { intervalle: true } },
          })
          break
        case 2:
          a = randint(1, 150) * -1

          texte = `$${a} \\in $`
          texteCorr = `$${a}$ est un entier relatif. On a donc $${a}\\in ${miseEnEvidence('\\mathbb{Z}')}$.`
          handleAnswers(this, i, {
            reponse: { value: '\\mathbb{Z}', options: { intervalle: true } },
          })
          break
        case 3:
          d = randint(1, 9)
          b = randint(0, 9) * choice([-1, 1])
          c = randint(0, 9)
          a = b + c / 10 + d / 100
          a = a * choice([-1, 1])

          texte = `$${texNombre(b + c / 10 + d / 100)}\\in $`
          texteCorr = `$${texNombre(b + c / 10 + d / 100)}$ est un nombre décimal. On a donc $${texNombre(b + c / 10 + d / 100)}\\in ${miseEnEvidence('\\mathbb{D}')}$.`
          handleAnswers(this, i, {
            reponse: { value: '\\mathbb{D}', options: { intervalle: true } },
          })
          break
        case 4:
          a = randint(2, 16)

          texte = `$\\sqrt{${texNombre(a * a)}}\\in $`
          texteCorr = `$\\sqrt{${a * a}}=${a}$  est un entier naturel. On a donc $\\sqrt{${texNombre(a * a)}}\\in ${miseEnEvidence('\\mathbb{N}')}$.`
          handleAnswers(this, i, {
            reponse: { value: '\\mathbb{N}', options: { intervalle: true } },
          })
          break
        case 5:
          a = randint(2, 16)
          b = randint(2, 6)
          if (choice([true, false])) {
            texte = `$\\dfrac{${texNombre(b * a)}}{${a}}\\in $`
            texteCorr = `$\\dfrac{${texNombre(b * a)}}{${a}}=\\dfrac{${b}\\times ${a}}{${a}}=${b}$  est un entier naturel. On a donc $\\dfrac{${texNombre(b * a)}}{${a}}\\in ${miseEnEvidence('\\mathbb{N}')}$.`
            handleAnswers(this, i, {
              reponse: { value: '\\mathbb{N}', options: { intervalle: true } },
            })
          } else {
            b = -b
            texte = `$\\dfrac{${texNombre(b * a)}}{${a}}\\in $`
            texteCorr = `$\\dfrac{${texNombre(b * a)}}{${a}}=\\dfrac{${b}\\times ${a}}{${a}}=${b}$  est un entier relatif. On a donc $\\dfrac{${texNombre(b * a)}}{${a}}\\in ${miseEnEvidence('\\mathbb{Z}')}$.`
            handleAnswers(this, i, {
              reponse: { value: '\\mathbb{Z}', options: { intervalle: true } },
            })
          }
          break
        case 6:
          a = choice([
            3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 39, 41, 43, 47, 53, 57, 61,
            67, 71, 73, 79, 83, 87, 89,
          ])
          b = choice(
            [
              3, 7, 11, 13, 17, 19, 23, 29, 31, 37, 39, 41, 43, 47, 53, 57, 61,
              67, 71, 73, 79, 83, 87, 89,
            ],
            [a],
          )
          a = choice([a, -a])
          texte = `$\\dfrac{${a}}{${b}}\\in $`
          texteCorr = `$\\dfrac{${a}}{${b}}$ est une fraction d'entiers qui n'est pas égal à un nombre entier ou à un nombre décimal. On a donc $\\dfrac{${a}}{${b}}\\in ${miseEnEvidence('\\mathbb{Q}')}$.`
          handleAnswers(this, i, {
            reponse: { value: '\\mathbb{Q}', options: { intervalle: true } },
          })
          break
        case 7:
          b = choice([4, 5, 8, 10])
          a = randint(4, 100)
          while (a % b === 0) {
            a = randint(4, 100)
          }
          a = choice([a, -a])

          texte = `$\\dfrac{${a}}{${b}}\\in $`
          texteCorr = `$\\dfrac{${a}}{${b}}=${texNombre(a / b)}$  est un nombre décimal. On a donc $\\dfrac{${a}}{${b}}\\in ${miseEnEvidence('\\mathbb{D}')}$.`
          handleAnswers(this, i, {
            reponse: { value: '\\mathbb{D}', options: { intervalle: true } },
          })
          break
        case 8:
          {
            a = randint(2, 99, [4, 9, 16, 25, 36, 49, 64, 81])
            const signeAjoute = choice(['', '-'])
            texte = `$${signeAjoute}\\sqrt{${a}} \\in $`
            texteCorr = `$${signeAjoute}\\sqrt{${a}}$ est un nombre irrationnel car $${a}$ n'est pas le carré d'un nombre entier, décimal ou fractionnaire. On a donc $${signeAjoute}\\sqrt{${a}}\\in ${miseEnEvidence('\\mathbb{R}')}$.`
            handleAnswers(this, i, {
              reponse: { value: '\\mathbb{R}', options: { intervalle: true } },
            })
          }
          break
        case 9:
        default:
          a = randint(2, 20)
          a = choice([a, -a])
          texte = `$${a}\\pi \\in $`
          texteCorr = `$${a}\\pi$ est un nombre irrationnel. On a donc $${a}\\pi \\in ${miseEnEvidence('\\mathbb{R}')}$.`
          handleAnswers(this, i, {
            reponse: { value: '\\mathbb{R}', options: { intervalle: true } },
          })
          break
      }
      if (context.isAmc) {
        this.autoCorrectionAMC[i].propositions = [
          { texte: this.listeCorrections[i], statut: '1' },
        ]
        this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
      }
      texte += this.interactif
        ? ajouteChampTexteMathLive(
            this,
            i,
            KeyboardType.clavierEnsemblePredefini,
          )
        : '$\\dots$'

      if (this.questionJamaisPosee(i, listeTypeDeQuestions[i], a, b, c, d)) {
        // Si la question n'a jamais été posée, on en créé une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
