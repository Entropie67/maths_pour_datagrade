import { miseEnEvidence } from '../../lib/outils/embellissements'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif' // fonction qui va préparer l'analyse de la saisie
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive' // fonctions de mise en place des éléments interactifs
import { choice, shuffle } from '../../lib/outils/arrayOutils'
import { ecritureParentheseSiNegatif } from '../../lib/outils/ecritures'
import { numAlpha } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
} from '../../modules/outils'
import Exercice from '../Exercice'
export const interactifReady = true

export const titre = "Donner des arrondis d'un quotient"

export const dateDePublication = '21/06/2026'

/**
 * Donner des arrondis ou des valeurs approchées d'un quotient.
 * @author Jean-Claude Lhote (variation de l'exercice 6N1L de Rémi Angot)
 */
export const uuid = '013fe'

export const refs = {
  'fr-fr': ['4C10-11'],
  'fr-2016': [],
  'fr-ch': ['10CTNO6B-6', '10LCNO6B-6', '10LSNO6B-6'],
}
export default class ValeurApprocheeQuotientRelatif extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.spacing = 2
    this.spacingCorr = 2
    this.besoinFormulaireTexte = [
      'Type de questions',
      `Nombres séparés par des tirets :
  1 : Arrondi
  2 : Valeur approchée
  3 : Troncature
  4 : Mélange`,
    ]
    this.sup = 1
    this.besoinFormulaire2Texte = [
      'Précision',
      `Nombres séparés par des tirets :
  1 : Unité
  2 : Dixième
  3 : Centième
  4 : Millième
  5 : Mélange`,
    ]
    this.sup2 = 5
  }

  nouvelleVersion() {
    const typesDeQuestions = gestionnaireFormulaireTexte({
      max: 3,
      defaut: 1,
      melange: 4,
      nbQuestions: 0,
      saisie: this.sup,
    })
    const precisions = gestionnaireFormulaireTexte({
      max: 4,
      defaut: 5,
      melange: 5,
      nbQuestions: 0,
      saisie: this.sup2,
    })
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      // Une fraction irréductible avec un dénominateur qui comporte un facteur différent de 2 ou de 5
      // aura une écriture décimale périodique infinie
      const k1 = choice([3, 7, 11, 13])
      const k2 = choice([3, 7, 11, 13], k1)
      const a =
        choice([3, 5, 7, 11, 13], [k1, k2]) *
        choice([3, 5, 7, 11, 13], [k1, k2])
      const b = k1 * k2

      let texte = `On sait que $${a}\\div${b}\\approx${texNombre(a / b, 6)}$.<br>Compléter les phrases suivantes.<br><br>`
      let texteCorr = ''
      let numQuest = 0
      const possibilites: { texte: string; texteCorr: string }[] = []
      for (const precision of precisions) {
        for (const typeDeQuestion of typesDeQuestions) {
          let type: string
          let reponse: string
          const exposant = Number(precision) - 1
          const parDefaut = choice([true, false])
          const diviseurNeg = choice([-1, 1])
          const dividendeNeg = choice([-1, 1])
          switch (typeDeQuestion) {
            case 1:
              type = "L'arrondi"
              reponse = texNombre(
                (a / b) * dividendeNeg * diviseurNeg,
                exposant,
              )
              break
            case 2:
              type = 'La valeur approchée'
              reponse = parDefaut
                ? texNombre(
                    (a / b) * dividendeNeg * diviseurNeg -
                      1 / (2 * 10 ** exposant),
                    exposant,
                  )
                : texNombre(
                    (a / b) * dividendeNeg * diviseurNeg +
                      1 / (2 * 10 ** exposant),
                    exposant,
                  )
              break
            case 3:
            default:
              type = 'La troncature'
              reponse = texNombre(
                Math.floor(
                  (a / b) * dividendeNeg * diviseurNeg * 10 ** exposant,
                ) /
                  10 ** exposant,
                exposant,
              )
              break
          }
          let textePrecision: string
          switch (precision) {
            case 1:
              textePrecision = "à l'unité près"
              break
            case 2:
              textePrecision = 'au dixième près'
              break
            case 3:
              textePrecision = 'au centième près'
              break
            case 4:
            default:
              textePrecision = 'au millième près'
              break
          }
          const ligne = `${type}${typeDeQuestion === 2 ? (parDefaut ? ' par défaut' : ' par excès') : ''} de $${a * dividendeNeg}\\div${ecritureParentheseSiNegatif(b * diviseurNeg)}$ ${textePrecision} est `
          possibilites.push({
            texte:
              ligne +
              (this.interactif
                ? ajouteChampTexteMathLive(
                    this,
                    i * typesDeQuestions.length * precisions.length + numQuest,
                    KeyboardType.clavierDeBase,
                  ) + '.'
                : ':') +
              '<br>',
            texteCorr: ligne + `$${miseEnEvidence(reponse)}$.<br>`,
          })
          handleAnswers(
            this,
            i * typesDeQuestions.length * precisions.length + numQuest,
            { reponse: { value: reponse } },
          )
          numQuest++
        }
      }
      const possibilitesMelangees = shuffle(possibilites)
      for (let j = 0; j < possibilitesMelangees.length; j++) {
        const possibilite = possibilitesMelangees[j]
        texte += numAlpha(j) + ' ' + possibilite.texte
        texteCorr += numAlpha(j) + ' ' + possibilite.texteCorr
      }
      if (this.questionJamaisPosee(i, a, b)) {
        // Si la question n'a jamais été posée, on en crée une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
