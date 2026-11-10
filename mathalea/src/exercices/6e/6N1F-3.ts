import { miseEnEvidence } from '../../lib/outils/embellissements'
import type { MathfieldElement } from 'mathlive'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import ce from '../../lib/interactif/comparisonFunctions'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import {
  ajouteChampTexteMathLive,
  remplisLesBlancs,
} from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'
import { sp } from '../../lib/outils/outilString'

export const titre =
  "Écrire une fraction sur $100$ puis sous la forme d'un pourcentage"
export const interactifReady = true

export const dateDePublication = '06/02/2021'
export const dateDeModifImportante = '03/04/2024'

/**
 * Une fraction étant donnée, il faut l'écrire avec 100 au dénominateur puis donner son écriture sous forme de pourcentage.
 * @author Rémi Angot
 */

export const uuid = '0e58f'

export const refs = {
  'fr-fr': ['6N1F-3', '5N3autoK-3'],
  'fr-ch': ['9R1NO4G-1', '9R2NO4G-1', '9R3NO4G-1', 'PRQNO03A-3', 'PRQNO11B-1', 'PRQPF05A-2'],
}
export default class FractionVersPourcentage extends Exercice {
  constructor() {
    super()

    this.consigne = 'Compléter.'
    this.nbQuestions = 6
    this.nbCols = 2
    this.nbColsCorr = 2

    this.besoinFormulaireNumerique = [
      'Difficulté',
      2,
      "1 : Partir d'une fraction de dénominateur autre que 100\n2 : Partir d'une fraction de dénominateur 100",
    ]
    this.sup = 1
  }

  nouvelleVersion() {
    this.introduction =
      this.interactif && this.sup === 1
        ? `La première fraction est facultative${sp()}: elle sera corrigée, mais ne sera pas prise en compte dans le barème.`
        : ''

    const typeDeDenominateurs = [10, 20, 50, 1000, 2, 4, 5, 200]
    const listeTypeDeQuestions = combinaisonListes(
      typeDeDenominateurs,
      this.nbQuestions,
    )
    for (
      let i = 0, texte, texteCorr, percenti, den, num, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      // Boucle principale où i+1 correspond au numéro de la question
      den = listeTypeDeQuestions[i]
      if (den === 2) {
        num = choice([1, 3, 5])
      } else if (den === 1000) {
        num = 10 * randint(1, 99)
      } else if (den === 200) {
        num = 2 * randint(1, 99)
      } else {
        num = randint(1, den - 1)
      }
      percenti = Math.round((num * 100) / den)
      if (this.sup === 1) {
        if (this.interactif) {
          texte = remplisLesBlancs(
            this,
            i,
            `\\dfrac{${num}}{${texNombre(den)}}=\\dfrac{%{champ1}}{%{champ2}}=\\dfrac{%{champ3}}{100}=%{champ4}\\%`,
            'clavierDeBase',
            '\\ldots\\ldots',
          )
        } else {
          texte = `$\\dfrac{${num}}{${texNombre(den)}}=~\\dfrac{\\ldots\\ldots\\ldots\\ldots\\ldots}{\\ldots\\ldots\\ldots\\ldots\\ldots}=\\dfrac{\\ldots\\ldots}{100}~=~{\\ldots\\ldots}~\\%$`
        }
        if (den < 100) {
          texteCorr = `$\\dfrac{${num}}{${texNombre(den)}}=\\dfrac{${num}{\\color{blue}\\times${100 / den}}}{${texNombre(den)}{\\color{blue}\\times${100 / den}}}=\\dfrac{${percenti}}{100}=${miseEnEvidence(percenti)}~\\%$`
        } else {
          texteCorr = `$\\dfrac{${num}}{${texNombre(den)}}=\\dfrac{${num}{\\color{blue}\\div${den / 100}}}{${texNombre(den)}{\\color{blue}\\div${den / 100}}}=\\dfrac{${percenti}}{100}=${miseEnEvidence(percenti)}~\\%$`
        }
        handleAnswers(
          this,
          i,
          {
            champ1: { value: den },
            champ2: { value: num },
            champ3: { value: String(percenti) },
            champ4: { value: String(percenti) },
          },
          { formatInteractif: 'meta-custom', digits: 3, decimals: 0 },
        )
      } else {
        texte = `$\\dfrac{${percenti}}{100}= $${context.isHtml && this.interactif ? ajouteChampTexteMathLive(this, i, KeyboardType.clavierNumbers, { texteApres: ' %' }) : '$\\ldots\\ldots\\%$'}`
        texteCorr = `$\\dfrac{${texNombre(percenti, 0)}}{100}=${miseEnEvidence(texNombre(percenti, 0))}~\\%$`
        handleAnswers(
          this,
          i,
          { reponse: { value: percenti } },
          { digits: 3, decimals: 0 },
        )
      }

      if (this.questionJamaisPosee(i, den, num)) {
        // <- laisser le i et ajouter toutes les variables qui rendent les exercices différents (par exemple a, b, c et d)
        // Si la question n'a jamais été posée, on en crée une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }

  correctionInteractive = (i: number) => {
    const reponseAttendue = String(this.autoCorrection[i].valeur?.champ4?.value)
    if (this.answers === undefined) this.answers = {}
    let result = 'KO'
    let feedback = ''
    const mf = document.querySelector(
      `math-field#champTexteEx${this.numeroExercice}Q${i}`,
    ) as MathfieldElement
    if (mf == null) {
      window.notify(
        `La correction de 5N11-3 n'a pas trouvé de mathfield d'id champTexteEx${this.numeroExercice}Q${i}`,
        { exercice: this },
      )
    } else {
      this.answers[`Ex${this.numeroExercice}Q${i}`] = mf.getValue()
      const spanResultat = document.querySelector(
        `span#resultatCheckEx${this.numeroExercice}Q${i}`,
      ) as HTMLSpanElement
      let num1 = mf.getPromptValue('champ1')
      num1 = num1.replace(',', '.')
      const den1 = mf.getPromptValue('champ2')
      const num2 = mf.getPromptValue('champ3')
      const champ4 = mf.getPromptValue('champ4')
      let test1: boolean = true
      let test1Bis: boolean = true
      if (num1 !== '' && den1 !== '') {
        test1 =
          (num1.includes('\\times')
            ? ce
                .parse(
                  `\\frac{${Number(num1.split('\\times')[0]) * Number(num1.split('\\times')[1] ?? 1)}}{${Number(den1.split('\\times')[0]) * Number(den1.split('\\times')[1] ?? 1)}}`,
                )
                .isEqual(ce.parse(`\\frac{${reponseAttendue}}{100}`))
            : ce
                .parse(
                  `\\frac{${Number(num1.split('\\div')[0]) * Number(num1.split('\\div')[1] ?? 1)}}{${Number(den1.split('\\div')[0]) * Number(den1.split('\\div')[1] ?? 1)}}`,
                )
                .isEqual(ce.parse(`\\frac{${reponseAttendue}}{100}`))) ?? false

        test1Bis = ce.parse(den1).isEqual(ce.parse('100')) ?? false
      }
      if (num2 === '') {
        feedback +=
          'Il faut saisir un numérateur pour la fraction sur $100$.<br>'
      }
      if (champ4 === '') {
        feedback += 'Le résultat final est obligatoire.<br>'
      }
      const test1Ter = den1 === '' || num1 === ''
      const test2 = ce.parse(num2).isSame(ce.parse(reponseAttendue))
      const test3 = ce.parse(champ4).isSame(ce.parse(reponseAttendue))
      let smiley
      if (test2 && test3) {
        smiley = '😎'
        result = 'OK'
        if (test1) {
          // On a bon, mais regardons le premier calcul facultatif ici il est correct
          if (!test1Bis) {
            // pas égal à 100 au dénominateur
            feedback +=
              'La première fraction est correcte mais le dénominateur ne vaut pas $100$.'
          }
          // sinon, il n'y a rien a dire.
        } else {
          // le premier calcul est faux, il faut le dire
          if (test1Ter) {
            feedback += 'La première fraction est incomplète.'
          } else {
            feedback += 'La première fraction est incorrecte.'
          }
        }
      } else {
        // ici le résultat est faux (ou la fraction sur 100)
        smiley = '☹️'
        result = 'KO'
        if (test1Ter) {
          feedback += 'La première fraction est incomplète'
        } else {
          if (test1) {
            // On regarde le premier calcul ici il est juste
            if (!test1Bis) {
              // pas égal à 100 au dénominateur
              feedback +=
                'La première fraction est correcte mais le dénominateur ne vaut pas $100$'
            } else {
              feedback += 'La première fraction est correcte'
            }
          } else {
            feedback += 'La première fraction est incorrecte'
          } // ici, le premier calcul est faux donc tout est faux, y a rien a dire
        }
        feedback += ' et au moins un des résultats finaux est faux.'
      }
      const divDuFeedback = document.querySelector(
        `div#feedbackEx${this.numeroExercice}Q${i}`,
      ) as HTMLDivElement
      spanResultat.innerHTML = smiley
      if (divDuFeedback) {
        divDuFeedback.innerHTML = feedback
        spanResultat.after(divDuFeedback)
        divDuFeedback.style.display = 'block'
      }
      mf.setPromptState('champ1', test1 ? 'correct' : 'incorrect', true)
      mf.setPromptState('champ2', test1 ? 'correct' : 'incorrect', true)
      mf.setPromptState('champ3', test2 ? 'correct' : 'incorrect', true)
      mf.setPromptState('champ4', test3 ? 'correct' : 'incorrect', true)
    }
    return result
  }
}
