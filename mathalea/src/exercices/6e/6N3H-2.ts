import { miseEnEvidence } from '../../lib/outils/embellissements'
import type { MathfieldElement } from 'mathlive'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { remplisLesBlancs } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import { ppcm } from '../../lib/outils/primalite'
import type { IExercice } from '../../lib/types'
import { fraction } from '../../modules/fractions'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Mettre des fractions sous un dénominateur commun'
export const interactifReady = true

export const dateDePublication = '18/06/2026'

/**
 * On propose deux fractions à dénominateurs multiples, il faut produire les fractions équivalentes sous un dénominateur commun.
 * un paramètre permet de choisir le rapport entre le numérateur et le dénominateur imposé et un autre permet l'exploration hors programme de dénominateurs non multiples.
 * @author Jean-claude Lhote
 */
export const uuid = '06634'

export const refs = {
  'fr-fr': ['6N3H-2'],
  'fr-2016': [],
  'fr-ch': ['9R1NO4D-6', '9R2NO4D-6', '9R3NO4D-6', 'PRQNO10B-6'],
}

export default class EgalitesEntreFractions extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'choix de rapports entre dénominateurs',
      '0: Mélange\n1: 2 ou 5\n2: 3 ou 4\n3: 3 ou 4 ou 6\n4: 6 ou 8\n5: 7 ou 9\n6: 2 ou 3 ou 4 ou 5\n7: 6 ou 7 ou 8 ou 9\n8: un rapport à 2 chiffres',
    ]
    this.besoinFormulaire2CaseACocher = [
      'Hors programme (dénominateurs non multiples)',
      false,
    ]
    this.besoinFormulaire3Numerique = [
      'Valeur maximale du dénominateur des fractions équivalentes',
      3,
      '1: 50\n2: 100\n3: 200',
    ]

    this.sup = '0'
    this.sup2 = false
    this.sup3 = 2

    this.spacing = 2
    this.spacingCorr = 2
    this.nbQuestions = 5
  }

  nouvelleVersion() {
    const callback = (exercice: IExercice, question: number) => {
      const objetReponse = exercice.autoCorrection[question].valeur
      const answer1 = parseInt(String(objetReponse!.champ1!.value))
      const answer2 = parseInt(String(objetReponse!.champ2!.value))
      const answer3 = parseInt(String(objetReponse!.champ3!.value))
      const answer4 = parseInt(String(objetReponse!.champ4!.value))
      const spanReponseLigne = document.querySelector(
        `#resultatCheckEx${exercice.numeroExercice}Q${question}`,
      )
      let feedback: string = ''
      const mfe = document.querySelector(
        `#champTexteEx${exercice.numeroExercice}Q${question}`,
      ) as MathfieldElement
      const prompts = mfe.getPrompts()
      if (prompts.length !== 4) {
        return {
          isOk: false,
          feedback:
            "erreur dans le programme : Les zones n'ont pas été trouvées",
          score: { nbBonnesReponses: 0, nbReponses: 1 },
        }
      }
      const saisies = prompts.map((prompt) => mfe.getPromptValue(prompt))
      const thereSomeDecimals = saisies.some(
        (v) =>
          parseInt(v.replace(',', '.')) !== parseFloat(v.replace(',', '.')),
      )
      if (thereSomeDecimals) {
        return {
          isOk: false,
          feedback:
            'Il faut saisir des nombres entiers pour les numérateurs et dénominateurs',
          score: { nbBonnesReponses: 0, nbReponses: 1 },
        }
      }
      const [num1, den1, num2, den2] = saisies.map((v) => parseInt(String(v)))
      if (prompts.map((prompt) => mfe.getPromptValue(prompt)).includes('')) {
        return {
          isOk: false,
          feedback:
            'Il faut remplir toutes les zones pour que la correction soit possible',
          score: { nbBonnesReponses: 0, nbReponses: 1 },
        }
      }
      const isNumCommuns = den1 === den2 && den1 !== 0
      const isOk =
        (answer1 === Number(num1) &&
          answer2 === Number(den1) &&
          answer3 === Number(num2) &&
          answer4 === Number(den2)) ||
        (isNumCommuns &&
          answer1 * den1 === answer2 * num1 &&
          answer3 * den2 === answer4 * num2)
      if (!isOk) {
        if ([num1, den1, num2, den2].some((v) => isNaN(v))) {
          feedback = 'Les valeurs saisies ne sont pas des nombres'
        } else {
          if (!isNumCommuns) {
            feedback =
              'Les dénominateurs doivent être les mêmes pour les deux fractions saisies'
          }

          feedback +=
            num1 / den1 !== answer1 / answer2
              ? `La fraction ${num1}/${den1} n'est pas équivalente à ${answer1}/${answer2}`
              : ''
          feedback +=
            num2 / den2 !== answer3 / answer4
              ? `La fraction ${num2}/${den2} n'est pas équivalente à ${answer3}/${answer4}`
              : ''
        }
      }

      const resultat = {
        isOk,
        feedback,
        score: {
          nbBonnesReponses: isOk ? 1 : 0,
          nbReponses: 1,
        },
      }
      // on met le smiley
      if (spanReponseLigne != null) {
        spanReponseLigne.innerHTML = resultat.isOk ? '😎' : '☹️'
      }
      const spanFeedback = document.querySelector(
        `#feedbackEx${exercice.numeroExercice}Q${question}`,
      )
      // on met le feedback
      if (feedback != null && spanFeedback != null && feedback.length > 0) {
        spanFeedback.innerHTML = '💡 ' + feedback
        spanFeedback.classList.add(
          'py-2',
          'italic',
          'text-coopmaths-warn-darkest',
          'dark:text-coopmathsdark-warn-darkest',
        )
      }
      return resultat
    }
    const horsProgramme = this.sup2
    const reduction = this.sup4 === 2
    this.consigne =
      "Compléter les égalités de fractions afin d'obtenir deux fractions ayant le même dénominateur."
    const valeurMaxDenom = horsProgramme
      ? 200
      : [60, 100, 200][Math.max(Math.min(this.sup3 ?? 2, 3), 1) - 1]
    const listeChoixRapports = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 8,
      melange: 0,
      defaut: 0,
      nbQuestions: this.nbQuestions,
      listeOfCase: [
        '2,5',
        '3,4',
        '3,4,6',
        '6,8',
        '7,9',
        '2,3,4,5',
        '6,7,8,9',
        '11,12,15,16,20',
      ],
    }).map((s: string | number) =>
      String(s)
        .split(',')
        .map((v: string) => parseInt(v, 10)),
    )
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''
      let denom1 = 1
      let denom2 = 1
      let num1 = 1
      let num2 = 1
      let k = 1
      let k2 = 1
      let k3 = 1
      if (horsProgramme) {
        let compteur = 0
        do {
          k = choice(listeChoixRapports[i])
          k2 = choice(listeChoixRapports[i], k)
          k3 = k * k2
          denom1 = k2
          denom2 = k
          num1 = randint(1, 9, denom1)
          num2 = randint(1, 9, denom2)
          compteur++
        } while (
          compteur < 50 &&
          (k3 > valeurMaxDenom ||
            denom1 % denom2 === 0 ||
            denom2 % denom1 === 0)
        )
        const pp = ppcm(denom1, denom2)
        const fac1 = pp / denom1
        const fac2 = pp / denom2
        texte = `${remplisLesBlancs(this, i, `\\dfrac{${num1}}{${denom1}} = \\dfrac{%{champ1}}{%{champ2}}\\text{ et }\\dfrac{${num2}}{${denom2}} = \\dfrac{%{champ3}}{%{champ4}}`, 'fillInTheBlank', '\\ldots')}`
        texteCorr = `$\\dfrac{${num1}}{${denom1}} = \\dfrac{${num1} \\times ${fac1}}{${denom1} \\times ${fac1}} = ${miseEnEvidence(`\\dfrac{${num1 * fac1}}{${pp}}`)}$ et $\\dfrac{${num2}}{${denom2}} = \\dfrac{${num2} \\times ${fac2}}{${denom2} \\times ${fac2}} = ${miseEnEvidence(`\\dfrac{${num2 * fac2}}{${pp}}`)}$`
        handleAnswers(
          this,
          i,
          {
            champ1: { value: String(num1 * k) },
            champ2: { value: String(k3) },
            champ3: { value: String(num2 * k2) },
            champ4: { value: String(k3) },
            callback,
          },
          { formatInteractif: 'fillInTheBlank' },
        )
      } else {
        k = choice(listeChoixRapports[i])
        if (Math.random() < 0.5) {
          // on change seulement la première fraction, si on multiplie sinon on change la deuxième fraction
          denom1 = randint(2, Math.floor(valeurMaxDenom / k))
          denom2 = denom1 * k
          num1 = randint(1, 9, denom1)
          num2 = randint(1, 9, denom2)
          if (!reduction) {
            // On procède par multiplication
            texte = `${remplisLesBlancs(this, i, `\\dfrac{${num1}}{${denom1}} = \\dfrac{%{champ1}}{%{champ2}}\\text{ et }\\dfrac{${num2}}{${denom2}} = \\dfrac{%{champ3}}{%{champ4}}`, 'fillInTheBlank', '\\ldots')}`
            texteCorr = `$\\dfrac{${num1}}{${denom1}} = \\dfrac{${num1} \\times ${k}}{${denom1} \\times ${k}} = ${miseEnEvidence(`\\dfrac{${num1 * k}}{${denom1 * k}}`)}$ et $${miseEnEvidence(`\\dfrac{${num2}}{${denom2}}`)}$`
            handleAnswers(this, i, {
              champ1: { value: String(num1 * k) },
              champ2: { value: String(denom1 * k) },
              champ3: { value: String(num2) },
              champ4: { value: String(denom2) },
              callback,
            })
          } else {
            // On procède par division
            num2 = randint(1, 9, denom2) * k
            texte = `${remplisLesBlancs(this, i, `\\dfrac{${num1}}{${denom1}} = \\dfrac{%{champ1}}{%{champ2}}\\text{ et }\\dfrac{${num2}}{${denom2}} = \\dfrac{%{champ3}}{%{champ4}}`, 'fillInTheBlank', '\\ldots')}`
            texteCorr = `$${miseEnEvidence(`\\dfrac{${num1}}{${denom1}}`)}$ et $\\dfrac{${num2}}{${denom2}} = \\dfrac{${num2} \\div ${k}}{${denom2} \\div ${k}} = ${miseEnEvidence(`\\dfrac{${num2 / k}}{${denom2 / k}}`)}$`
            handleAnswers(this, i, {
              champ1: { value: String(num1) },
              champ2: { value: String(denom1) },
              champ3: { value: String(num2 / k) },
              champ4: { value: String(denom2 / k) },
              callback,
            })
          }
        } else {
          // on change seulement la deuxième fraction, l'autre reste la même
          denom2 = randint(2, Math.floor(valeurMaxDenom / k))
          denom1 = denom2 * k
          num1 = randint(1, 9, denom1) * k
          num2 = randint(1, 9, denom2)
          const fraction1 = fraction(num1, denom1)
          const fraction2 = fraction(num2, denom2)
          if (!reduction) {
            // On procède par multiplication
            texte = `${remplisLesBlancs(this, i, `\\dfrac{${num1}}{${denom1}} = \\dfrac{%{champ1}}{%{champ2}}\\text{ et }\\dfrac{${num2}}{${denom2}} = \\dfrac{%{champ3}}{%{champ4}}`, 'fillInTheBlank', '\\ldots')}`
            texteCorr = `$${miseEnEvidence(fraction1.texFraction)}$ et $${fraction2.texFraction} = \\dfrac{${num2} \\times ${k}}{${denom2} \\times ${k}} = ${miseEnEvidence(`\\dfrac{${num2 * k}}{${denom2 * k}}`)}$`
            handleAnswers(this, i, {
              champ1: { value: String(num1) },
              champ2: { value: String(denom1) },
              champ3: { value: String(num2 * k) },
              champ4: { value: String(denom2 * k) },
              callback,
            })
          } else {
            // On procède par division
            num1 /= k
            denom1 /= k
            const fraction2bis = fraction(num2 * k, denom2 * k)
            const fraction1bis = fraction(num1, denom1)
            texte = `${remplisLesBlancs(this, i, `\\dfrac{${num1}}{${denom1}} = \\dfrac{%{champ1}}{%{champ2}}\\text{ et }\\dfrac{${num2 * k}}{${denom2 * k}} = \\dfrac{%{champ3}}{%{champ4}}`, 'fillInTheBlank', '\\ldots')}`
            texteCorr = `$${miseEnEvidence(fraction1bis.texFraction)}$ et $${fraction2bis.texFraction} = \\dfrac{${num2 * k} \\div ${k}}{${denom2 * k} \\div ${k}} = ${miseEnEvidence(fraction2.texFraction)}$`
            handleAnswers(this, i, {
              champ1: { value: String(num1) },
              champ2: { value: String(denom1) },
              champ3: { value: String(num2) },
              champ4: { value: String(denom2) },
              callback,
            })
          }
        }
      }

      if (this.questionJamaisPosee(i, num1, denom1, num2, denom2, k)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
