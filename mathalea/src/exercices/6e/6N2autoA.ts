import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { remplisLesBlancs } from '../../lib/interactif/questionMathLive'
import { texFractionFromString } from '../../lib/outils/deprecatedFractions'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const interactifReady = true

export const titre = 'Trouver la fraction décimale égale à $1$'
export const dateDePublication = '07/06/2025'

/**
 * Trouver la fraction décimale égale à 1
 * @author Éric Elter
 */
export const uuid = '65ce1'
export const refs = {
  'fr-fr': ['6N2autoA', '6AutoN1'],
  'fr-2016': ['6C30-11'],
  'fr-ch': ['9R1NO4E-1', '9R2NO4E-1', '9R3NO4E-1', 'PRQNO11A-3'],
}

export default class TrouverFractionDecimale extends Exercice {
  constructor() {
    super()
    this.consigne = 'Compléter.'
    this.nbQuestions = 3
    this.besoinFormulaireTexte = [
      "Choix de l'opération",
      `Nombres séparés par des tirets :
    1 : Que des dénominateurs connus
    2 : Que des numérateurs connus
    3 : Mélange`,
    ]
    this.besoinFormulaire2Texte = [
      'Choix du dénominateur',
      `Nombres séparés par des tirets :
    1 : 10
    2 : 100
    3 : 1 000
    4 : Mélange`,
    ]
    this.besoinFormulaire3CaseACocher = ['Avec multiplication']
    this.sup = 3
    this.sup2 = 4
    this.sup3 = false
  }

  nouvelleVersion() {
    const listeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      max: 2,
      melange: 3,
      defaut: 3,
      nbQuestions: 50,
    })
    const denominateursPossibles = gestionnaireFormulaireTexte({
      saisie: this.sup2,
      max: 3,
      melange: 4,
      defaut: 4,
      nbQuestions: 6,
    })
    let reponse = 0

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      switch (denominateursPossibles[i]) {
        case 1:
          reponse = 10
          break
        case 2:
          reponse = 100
          break
        case 3:
          reponse = 1000
          break
      }

      if (this.questionJamaisPosee(i, reponse, listeQuestions[cpt])) {
        // Si la question n'a jamais été posée, on en créé une autre
        let texte = '$1=$ '
        let texteCorr = '$1='
        if (this.sup3) {
          texte +=
            listeQuestions[i] === 1
              ? remplisLesBlancs(
                  this,
                  i,
                  `%{champ1} \\times \\dfrac{1}{${texNombre(reponse)}}`,
                  KeyboardType.clavierNumbers,
                  '\\ldots',
                )
              : remplisLesBlancs(
                  this,
                  i,
                  `${texNombre(reponse)} \\times \\dfrac{1}{%{champ1}}`,
                  KeyboardType.clavierNumbers,
                  '\\ldots',
                )
          texteCorr +=
            listeQuestions[i] === 1
              ? `${miseEnEvidence(texNombre(reponse))} \\times ${texFractionFromString(1, texNombre(reponse))}$`
              : `${texNombre(reponse)} \\times ${texFractionFromString(1, miseEnEvidence(texNombre(reponse)))}$`
        } else {
          texte +=
            listeQuestions[i] === 1
              ? remplisLesBlancs(
                  this,
                  i,
                  `\\dfrac{%{champ1}}{${texNombre(reponse)}}`,
                  KeyboardType.clavierNumbers,
                  '\\ldots',
                )
              : remplisLesBlancs(
                  this,
                  i,
                  `\\dfrac{${texNombre(reponse)}}{%{champ1}}`,
                  KeyboardType.clavierNumbers,
                  '\\ldots',
                )
          texteCorr +=
            listeQuestions[i] === 1
              ? `${texFractionFromString(miseEnEvidence(texNombre(reponse)), texNombre(reponse))}$`
              : `${texFractionFromString(texNombre(reponse), miseEnEvidence(texNombre(reponse)))}$`
        }
        handleAnswers(
          this,
          i,
          { champ1: { value: reponse } },
          { formatInteractif: 'fillInTheBlank' },
        )
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
