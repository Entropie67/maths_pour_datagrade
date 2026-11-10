import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { remplisLesBlancs } from '../../lib/interactif/questionMathLive'
import { texFractionFromString } from '../../lib/outils/deprecatedFractions'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const interactifReady = true

export const titre =
  'Restituer, de manière automatique, des équivalences sur les fractions décimales'
export const dateDePublication = '08/06/2025'

/**
 * Restituer, de manière automatique, des équivalences sur les fractions décimales
 * @author Éric Elter (Mireille Gain pour variabilité possible du numérateur, entre 1 et 9)
 */
export const uuid = 'bcef9'
export const refs = {
  'fr-fr': ['6N2autoB-5'],
  'fr-2016': ['6C30-13'],
  'fr-ch': ['NR'],
}

export default class TrouverFractionDecimaleEgale extends Exercice {
  constructor() {
    super()
    this.consigne = 'Compléter.'
    this.comment =
      '12 questions sont possibles au maximum si le numérateur est égal à 1.'
    this.nbQuestions = 3
    this.besoinFormulaireTexte = [
      'Choix de la fraction',
      'Nombres sépares par des tirets :\n1 : 1/10\n2 : 1/100\n3 : 1/1 000\n4 : Mélange',
    ]
    this.besoinFormulaire2Numerique = [
      "Sens de l'égalité",
      3,
      `   1 : D'une fraction à un nombre décimal
    2 : D'un nombre décimal à une fraction
    3 : Mélange`,
    ]

    this.besoinFormulaire3Numerique = [
      'Choix du nombre cherché',
      3,
      `   1 : Nombre décimal
    2 : Dénominateur
    3 : Mélange`,
    ]

    this.besoinFormulaire4Numerique = [
      'Choix du numérateur',
      2,
      `   1 : Numérateur égal à 1
    2 : Numérateur variable de 1 à 9`,
    ]

    this.sup = 4
    this.sup2 = 3
    this.sup3 = 3
    this.sup4 = 1
  }

  nouvelleVersion() {
    const choixDenominateur = gestionnaireFormulaireTexte({
      saisie: this.sup,
      max: 3,
      melange: 4,
      defaut: 4,
      nbQuestions: 50,
    })

    const sensEgalite = gestionnaireFormulaireTexte({
      saisie: this.sup2,
      max: 2,
      melange: 3,
      defaut: 3,
      nbQuestions: 50,
    })
    const nombreCherche = gestionnaireFormulaireTexte({
      saisie: this.sup3,
      max: 2,
      melange: 3,
      defaut: 3,
      nbQuestions: 50,
    })
    const choixNumerateur = gestionnaireFormulaireTexte({
      saisie: this.sup4,
      max: 2,
      melange: 2,
      defaut: 1,
      nbQuestions: 50,
    })
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const numerateur = choixNumerateur[cpt] === 1 ? 1 : randint(1, 9)
      if (
        this.questionJamaisPosee(
          i,
          nombreCherche[cpt],
          sensEgalite[cpt],
          choixDenominateur[cpt],
          numerateur,
        )
      ) {
        // Si la question n'a jamais été posée, on en crée une autre
        let texte = ''
        let texteCorr = ''
        const denominateur = 10 ** parseInt(choixDenominateur[cpt].toString())
        const valeurDecimale =
          numerateur * 10 ** -parseInt(choixDenominateur[cpt].toString())
        if (sensEgalite[cpt] === 1) {
          if (nombreCherche[cpt] === 1) {
            texte = remplisLesBlancs(
              this,
              i,
              `\\dfrac{${numerateur}}{${texNombre(denominateur)}} =~%{champ1}`,
              KeyboardType.clavierNumbers,
              '\\ldots',
            )
            handleAnswers(
              this,
              i,
              { champ1: { value: valeurDecimale } },
              { formatInteractif: 'fillInTheBlank' },
            )
            texteCorr = `$${texFractionFromString(numerateur, texNombre(denominateur))}=${miseEnEvidence(texNombre(valeurDecimale))}$`
          } else {
            texte = remplisLesBlancs(
              this,
              i,
              `\\dfrac{${numerateur}}{%{champ1}} = ${texNombre(valeurDecimale)}`,
              KeyboardType.clavierNumbers,
              '\\ldots',
            )
            handleAnswers(
              this,
              i,
              { champ1: { value: denominateur } },
              { formatInteractif: 'fillInTheBlank' },
            )
            texteCorr = `$${texFractionFromString(numerateur, miseEnEvidence(texNombre(denominateur)))}=${texNombre(valeurDecimale)}$`
          }
        } else {
          if (nombreCherche[cpt] === 1) {
            texte = remplisLesBlancs(
              this,
              i,
              `%{champ1}~ = \\dfrac{${numerateur}}{${texNombre(denominateur)}}`,
              KeyboardType.clavierNumbers,
              '\\ldots',
            )
            handleAnswers(
              this,
              i,
              { champ1: { value: valeurDecimale } },
              { formatInteractif: 'fillInTheBlank' },
            )
            texteCorr = `$${miseEnEvidence(texNombre(valeurDecimale))}=${texFractionFromString(numerateur, texNombre(denominateur))}$`
          } else {
            texte = remplisLesBlancs(
              this,
              i,
              `${texNombre(valeurDecimale)}=\\dfrac{${numerateur}}{%{champ1}}`,
              KeyboardType.clavierNumbers,
              '\\ldots',
            )
            handleAnswers(
              this,
              i,
              { champ1: { value: denominateur } },
              { formatInteractif: 'fillInTheBlank' },
            )
            texteCorr = `$${texNombre(valeurDecimale)}=${texFractionFromString(numerateur, miseEnEvidence(texNombre(denominateur)))}$`
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
