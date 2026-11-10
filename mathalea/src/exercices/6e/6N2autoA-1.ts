import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { remplisLesBlancs } from '../../lib/interactif/questionMathLive'
import { combinaisonListes, shuffle } from '../../lib/outils/arrayOutils'
import { texFractionFromString } from '../../lib/outils/deprecatedFractions'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { range1 } from '../../lib/outils/nombres'
import { texNombre } from '../../lib/outils/texNombre'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const interactifReady = true

// export const titre = 'Compléter des égalités contenant une fraction décimale de numérateur 1'
export const titre =
  'Restituer, de manière automatique, des relations entre fractions décimales et nombres décimaux'
export const dateDePublication = '08/06/2025'

/**
 * Trouver une fraction décimale égale à une autre dont le numérateur vaut 1
 * @author Éric Elter
 */
export const uuid = 'e47ca'
export const refs = {
  'fr-fr': ['6N2autoA-1', '6AutoN1-2'],
  'fr-2016': ['6C30-12'],
  'fr-ch': ['9R1NO4E-2', '9R2NO4E-2', '9R3NO4E-2', 'PRQNO11A-4'],
}

export default class TrouverFractionDecimale2 extends Exercice {
  constructor() {
    super()
    this.comment = '15 questions sont possibles au maximum.'
    this.consigne = 'Compléter.'
    this.nbQuestions = 3
    this.besoinFormulaireNumerique = [
      "Choix de l'opération",
      3,
      `   1 : 1/10 = ...
    2 : 1/100 = ...
    3 : Mélange`,
    ]
    this.besoinFormulaire2Numerique = [
      "Choix de l'opération",
      3,
      ` 1 : Avec multiplication
    2 : Sans multiplication
    3 : Mélange`,
    ]

    this.sup = 3
    this.sup2 = 3
  }

  nouvelleVersion() {
    const choixDenominateur = gestionnaireFormulaireTexte({
      saisie: this.sup,
      max: 2,
      melange: 3,
      defaut: 3,
      nbQuestions: 100,
    })
    const avecMultiplication = gestionnaireFormulaireTexte({
      saisie: this.sup2,
      max: 2,
      melange: 3,
      defaut: 3,
      nbQuestions: 100,
    })

    let choixParmi6 = shuffle(range1(6)) // Dans le cas où 1/10=... avec multiplication
    choixParmi6 = combinaisonListes(choixParmi6, 100)

    let choixParmi3 = shuffle(range1(3)) // Dans les autres cas
    choixParmi3 = combinaisonListes(choixParmi3, 100)

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 100;) {
      if (
        this.questionJamaisPosee(
          i,
          choixDenominateur[cpt],
          avecMultiplication[cpt],
          choixDenominateur[cpt] === 1 && avecMultiplication[cpt] === 1
            ? choixParmi6[cpt]
            : choixParmi3[cpt],
        )
      ) {
        // Si la question n'a jamais été posée, on en crée une autre
        let texte = ''
        let texteCorr = ''
        if (choixDenominateur[cpt] === 1) {
          // 1/10
          if (avecMultiplication[cpt] === 1) {
            switch (choixParmi6[cpt]) {
              case 1:
                texte = remplisLesBlancs(
                  this,
                  i,
                  '\\dfrac{1}{%{champ1}} = 10 \\times \\dfrac{1}{100}',
                  KeyboardType.clavierNumbers,
                  '\\ldots',
                )
                handleAnswers(
                  this,
                  i,
                  { champ1: { value: 10 } },
                  { formatInteractif: 'fillInTheBlank' },
                )
                texteCorr = `$${texFractionFromString(1, miseEnEvidence(10))}=10 \\times ${texFractionFromString(1, 100)}$`
                break
              case 2:
                texte += remplisLesBlancs(
                  this,
                  i,
                  '\\dfrac{1}{10} = %{champ1} \\times \\dfrac{1}{100}',
                  KeyboardType.clavierNumbers,
                  '\\ldots',
                )
                handleAnswers(
                  this,
                  i,
                  { champ1: { value: 10 } },
                  { formatInteractif: 'fillInTheBlank' },
                )
                texteCorr = `$${texFractionFromString(1, 10)}=${miseEnEvidence(10)} \\times ${texFractionFromString(1, 100)}$`
                break
              case 3:
                texte += remplisLesBlancs(
                  this,
                  i,
                  '\\dfrac{1}{10} = 10 \\times \\dfrac{1}{%{champ1}}',
                  KeyboardType.clavierNumbers,
                  '\\ldots',
                )
                handleAnswers(
                  this,
                  i,
                  { champ1: { value: 100 } },
                  { formatInteractif: 'fillInTheBlank' },
                )
                texteCorr = `$${texFractionFromString(1, 10)}=10 \\times ${texFractionFromString(1, miseEnEvidence(100))}$`
                break
              case 4:
                texte += remplisLesBlancs(
                  this,
                  i,
                  `\\dfrac{1}{%{champ1}} = 100 \\times \\dfrac{1}{${texNombre(1000)}}`,
                  KeyboardType.clavierNumbers,
                  '\\ldots',
                )
                handleAnswers(
                  this,
                  i,
                  { champ1: { value: 10 } },
                  { formatInteractif: 'fillInTheBlank' },
                )
                texteCorr = `$${texFractionFromString(1, miseEnEvidence(10))}=100 \\times ${texFractionFromString(1, texNombre(1000))}$`
                break
              case 5:
                texte += remplisLesBlancs(
                  this,
                  i,
                  `\\dfrac{1}{10} = %{champ1} \\times \\dfrac{1}{${texNombre(1000)}}`,
                  KeyboardType.clavierNumbers,
                  '\\ldots',
                )
                handleAnswers(
                  this,
                  i,
                  { champ1: { value: 100 } },
                  { formatInteractif: 'fillInTheBlank' },
                )
                texteCorr = `$${texFractionFromString(1, 10)}=${miseEnEvidence(100)} \\times ${texFractionFromString(1, texNombre(1000))}$`
                break
              case 6:
                texte += remplisLesBlancs(
                  this,
                  i,
                  '\\dfrac{1}{10} = 100 \\times \\dfrac{1}{%{champ1}}',
                  KeyboardType.clavierNumbers,
                  '\\ldots',
                )
                handleAnswers(
                  this,
                  i,
                  { champ1: { value: 1000 } },
                  { formatInteractif: 'fillInTheBlank' },
                )
                texteCorr = `$${texFractionFromString(1, 10)}=100 \\times ${texFractionFromString(1, miseEnEvidence(texNombre(1000)))}$`
                break
            }
          } else {
            switch (choixParmi3[cpt]) {
              case 1:
                texte = remplisLesBlancs(
                  this,
                  i,
                  `\\dfrac{1}{%{champ1}} = \\dfrac{100}{${texNombre(1000)}}`,
                  KeyboardType.clavierNumbers,
                  '\\ldots',
                )
                handleAnswers(
                  this,
                  i,
                  { champ1: { value: 10 } },
                  { formatInteractif: 'fillInTheBlank' },
                )
                texteCorr = `$${texFractionFromString(1, miseEnEvidence(10))}=\\dfrac{100}{${texNombre(1000)}}$`
                break
              case 2:
                texte = remplisLesBlancs(
                  this,
                  i,
                  `\\dfrac{1}{10} = \\dfrac{%{champ1}}{${texNombre(1000)}}`,
                  KeyboardType.clavierNumbers,
                  '\\ldots',
                )
                handleAnswers(
                  this,
                  i,
                  { champ1: { value: 100 } },
                  { formatInteractif: 'fillInTheBlank' },
                )
                texteCorr = `$${texFractionFromString(1, 10)}=\\dfrac{${miseEnEvidence(100)}}{${texNombre(1000)}}$`
                break
              case 3:
                texte = remplisLesBlancs(
                  this,
                  i,
                  '\\dfrac{1}{10} = \\dfrac{100}{%{champ1}}',
                  KeyboardType.clavierNumbers,
                  '\\ldots',
                )
                handleAnswers(
                  this,
                  i,
                  { champ1: { value: 1000 } },
                  { formatInteractif: 'fillInTheBlank' },
                )
                texteCorr = `$${texFractionFromString(1, 10)}=\\dfrac{100}{${miseEnEvidence(texNombre(1000))}}$`
                break
            }
          }
        } else {
          // 1/100
          if (avecMultiplication[cpt] === 1) {
            switch (choixParmi3[cpt]) {
              case 1:
                texte = remplisLesBlancs(
                  this,
                  i,
                  `\\dfrac{1}{%{champ1}} = 10 \\times \\dfrac{1}{${texNombre(1000)}}`,
                  KeyboardType.clavierNumbers,
                  '\\ldots',
                )
                handleAnswers(
                  this,
                  i,
                  { champ1: { value: 100 } },
                  { formatInteractif: 'fillInTheBlank' },
                )
                texteCorr = `$${texFractionFromString(1, miseEnEvidence(100))}=10 \\times ${texFractionFromString(1, texNombre(1000))}$`
                break
              case 2:
                texte = remplisLesBlancs(
                  this,
                  i,
                  `\\dfrac{1}{100} = %{champ1} \\times \\dfrac{1}{${texNombre(1000)}}`,
                  KeyboardType.clavierNumbers,
                  '\\ldots',
                )
                handleAnswers(
                  this,
                  i,
                  { champ1: { value: 10 } },
                  { formatInteractif: 'fillInTheBlank' },
                )
                texteCorr = `$${texFractionFromString(1, 100)}=${miseEnEvidence(10)} \\times ${texFractionFromString(1, texNombre(1000))}$`
                break
              case 3:
                texte = remplisLesBlancs(
                  this,
                  i,
                  '\\dfrac{1}{100} = 10 \\times \\dfrac{1}{%{champ1}}',
                  KeyboardType.clavierNumbers,
                  '\\ldots',
                )
                handleAnswers(
                  this,
                  i,
                  { champ1: { value: 1000 } },
                  { formatInteractif: 'fillInTheBlank' },
                )
                texteCorr = `$${texFractionFromString(1, 100)}=10 \\times ${texFractionFromString(1, miseEnEvidence(texNombre(1000)))}$`
                break
            }
          } else {
            switch (choixParmi3[cpt]) {
              case 1:
                texte = remplisLesBlancs(
                  this,
                  i,
                  `\\dfrac{1}{%{champ1}} = \\dfrac{10}{${texNombre(1000)}}`,
                  KeyboardType.clavierNumbers,
                  '\\ldots',
                )
                handleAnswers(
                  this,
                  i,
                  { champ1: { value: 100 } },
                  { formatInteractif: 'fillInTheBlank' },
                )
                texteCorr = `$${texFractionFromString(1, miseEnEvidence(100))}=\\dfrac{10}{${texNombre(1000)}}$`
                break
              case 2:
                texte = remplisLesBlancs(
                  this,
                  i,
                  `\\dfrac{1}{100} = \\dfrac{%{champ1}}{${texNombre(1000)}}`,
                  KeyboardType.clavierNumbers,
                  '\\ldots',
                )
                handleAnswers(
                  this,
                  i,
                  { champ1: { value: 10 } },
                  { formatInteractif: 'fillInTheBlank' },
                )
                texteCorr = `$${texFractionFromString(1, 100)}=\\dfrac{${miseEnEvidence(10)}}{${texNombre(1000)}}$`
                break
              case 3:
                texte = remplisLesBlancs(
                  this,
                  i,
                  '\\dfrac{1}{100} = \\dfrac{10}{%{champ1}}',
                  KeyboardType.clavierNumbers,
                  '\\ldots',
                )
                handleAnswers(
                  this,
                  i,
                  { champ1: { value: 1000 } },
                  { formatInteractif: 'fillInTheBlank' },
                )
                texteCorr = `$${texFractionFromString(1, 100)}=\\dfrac{10}{${miseEnEvidence(texNombre(1000))}}$`
                break
            }
          }
        }

        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
