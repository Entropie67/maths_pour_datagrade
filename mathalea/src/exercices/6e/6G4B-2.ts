import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import {
  ajouteChampTexteMathLive,
  remplisLesBlancs,
} from '../../lib/interactif/questionMathLive'
import { enleveDoublonNum } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Connaître la mesure de quelques angles particuliers'
export const amcReady = false
export const interactifReady = true

export const dateDePublication = '04/12/2025'
export const dateDeModifImportante = '14/12/2025'

/**
 * @author Éric Elter
 */
export const uuid = 'cded3'

export const refs = {
  'fr-fr': ['6G4B-2', '3AutoG04'],
  'fr-ch': ['9R1ES1C-5', '9R2ES1C-5', '9R3ES1C-5', 'PRQES01B-5'],
}
export default class MesureAnglesParticuliers extends Exercice {
  constructor() {
    super()
    this.consigne = 'Compléter.'
    this.sup = '1-2-3-4-5-6'
    this.spacing = 1
    this.nbQuestions = 6
    this.comment =
      "Par le peu d'angles disponibles, cet exerice ne possède que 8 questions au maximum."

    this.besoinFormulaireTexte = [
      "Type d'angles",
      [
        'Nombres séparés par des tirets :',
        '1 : Nul',
        '2 : Aigu',
        '3 : Droit',
        '4 : Obtus',
        '5 : Plat',
        '6 : Plein',
        '7 : Saillant',
        '8 : Rentrant',
        '9 : Mélange',
      ].join('\n'),
    ]
  }

  nouvelleVersion() {
    const listeTypeDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      max: 8,
      defaut: 9,
      melange: 9,
      nbQuestions: 8,
    }).map(Number)

    const typeQuestionsDisponibles = enleveDoublonNum(listeTypeDeQuestions)

    for (
      let i = 0, typeAngle, cpt = 0;
      i < Math.min(this.nbQuestions, typeQuestionsDisponibles.length) &&
      cpt < 50;
    ) {
      if (this.questionJamaisPosee(i, typeQuestionsDisponibles[i])) {
        let reponse1 = 0
        let reponse2 = 0
        let reponse = 0
        switch (typeQuestionsDisponibles[i]) {
          case 1:
            typeAngle = 'nul'
            reponse = 0
            break
          case 2:
            typeAngle = 'aigu'
            reponse1 = 0
            reponse2 = 90
            break
          case 3:
            typeAngle = 'droit'
            reponse = 90
            break
          case 4:
            typeAngle = 'obtus'
            reponse1 = 90
            reponse2 = 180
            break
          case 5:
            typeAngle = 'plat'
            reponse = 180
            break
          case 6:
            typeAngle = 'plein'
            reponse = 360
            break
          case 7:
            typeAngle = 'saillant'
            reponse1 = 0
            reponse2 = 180
            break
          default:
            typeAngle = 'rentrant'
            reponse1 = 180
            reponse2 = 360
            break
        }
        let texte = ''
        let texteCorr = ''
        switch (typeQuestionsDisponibles[i]) {
          case 1:
          case 3:
          case 5:
          case 6:
            texte = `Un angle ${typeAngle} mesure `

            texteCorr = texte + `$${miseEnEvidence(reponse)}^\\circ$.`

            texte += this.interactif
              ? ajouteChampTexteMathLive(this, i, KeyboardType.clavierNumbers, {
                  texteApres: '$^\\circ$.',
                })
              : '\\ldots\\ldots\\ldots $^\\circ$.'

            handleAnswers(this, i, {
              reponse: {
                value: reponse,
                options: { nombreDecimalSeulement: true },
              },
            })
            break
          default:
            texte = `Un angle ${typeAngle} mesure entre `

            texteCorr =
              texte +
              `$${miseEnEvidence(reponse1)}^\\circ$ et $${miseEnEvidence(reponse2)}^\\circ$.`

            texte += this.interactif
              ? remplisLesBlancs(
                  this,
                  i,
                  '%{champ1}^\\circ\\text{ et }%{champ2}^\\circ.',
                  KeyboardType.clavierNumbers,
                )
              : '\\ldots\\ldots\\ldots $^\\circ$ et \\ldots\\ldots\\ldots $^\\circ$.'
            handleAnswers(
              this,
              i,
              {
                bareme: (listePoints: number[]) => [
                  Math.min(listePoints[0], listePoints[1]),
                  1,
                ],
                champ1: { value: String(reponse1) },
                champ2: { value: String(reponse2) },
              },
              { formatInteractif: 'fillInTheBlank' },
            )
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
