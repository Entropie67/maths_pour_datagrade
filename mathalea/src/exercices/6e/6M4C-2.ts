import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import { context } from '../../modules/context'
import Hms from '../../modules/Hms'
import { listeQuestionsToContenu, randint } from '../../modules/outils'

import { amcConvert } from '../../lib/amc/amcBuilders'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { minToHoraire } from '../../lib/outils/dateEtHoraires'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { sp } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
import Exercice from '../Exercice'

export const titre = 'Utiliser les heures décimales'
export const interactifReady = true
export const dateDeModifImportante = '24/09/2026'

export const amcReady = true
export const amcType = 'AMCHybride'
/**
 * Convertir une heure décimale dans le format HMS
 *
 * La partie décimale est 25, 75 ou un seul chiffre
 * @author Rémi Angot
 * Rendre l'exercice interactif Laurence Candille
 */
export const uuid = '6b3e4'

export const refs = {
  'fr-fr': ['6M4C-2'],
  'fr-2016': ['6D101'],
  'fr-ch': ['9R1GM4D-5', '9R2GM4D-5', '9R3GM4D-5', '10CTGM4B-3', '10LCGM4B-3', '10LSGM4B-3', 'PRQMG04D-7', 'PRQMG04E-4'],
}
export default class HeuresDecimales extends Exercice {
  constructor() {
    super()
    this.spacing = 2
    this.nbQuestions = 5
    this.comment =
      'La partie décimale peut être 0,1 ; 0,2 ; 0,3 ; 0,4 ; 0,5 ; 0,6 ; 0,7 ; 0,8 ; 0,9 ; 0,25 ou 0,75 de manière équiprobable.'
  }

  nouvelleVersion() {
    this.consigne =
      this.nbQuestions > 1
        ? 'Écrire les durées suivantes en heures et minutes.'
        : 'Écrire la durée suivante en heures et minutes.'

    for (
      let i = 0,
        partieEntiere,
        partieDecimale,
        minutes,
        texte,
        texteCorr,
        cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      partieEntiere = randint(1, 12)
      partieDecimale = choice([1, 2, 3, 4, 5, 6, 7, 8, 9, 25, 75])
      texte = `$${partieEntiere},${partieDecimale}~\\text{h}=$`
      texte += ajouteChampTexteMathLive(this, i, KeyboardType.clavierHms)
      texte += '<br>'

      if (partieDecimale === 25) {
        texteCorr = `$${partieEntiere},${partieDecimale}~\\text{h}=${partieEntiere}~\\text{h}+\\dfrac{1}{4}~\\text{h}=$`
        texteCorr += `${sp()}$${miseEnEvidence(minToHoraire(partieEntiere * 60 + 15, true))}$`
        minutes = 15
      } else if (partieDecimale === 75) {
        texteCorr = `$${partieEntiere},${partieDecimale}~\\text{h}=${partieEntiere}~\\text{h}+\\dfrac{3}{4}~\\text{h}=$`
        texteCorr += `${sp()}$${miseEnEvidence(minToHoraire(partieEntiere * 60 + 45, true))}$`
        minutes = 45
      } else if (partieDecimale === 5) {
        texteCorr = `$${partieEntiere},${partieDecimale}~\\text{h}=${partieEntiere}~\\text{h}+\\dfrac{1}{2}~\\text{h}=$`
        texteCorr += `${sp()}$${miseEnEvidence(minToHoraire(partieEntiere * 60 + 30, true))}$`
        minutes = 30
      } else {
        texteCorr = `Deux propositions de correction :<br>$${partieEntiere},${partieDecimale}~\\text{h}=${partieEntiere}~\\text{h}+\\dfrac{${partieDecimale}}{10}~\\text{h}`
        texteCorr += `=${partieEntiere}~\\text{h}+(${partieDecimale}\\times \\dfrac{1}{10}~\\text{h})`
        texteCorr += `=${partieEntiere}~\\text{h}+(${partieDecimale}\\times6~\\text{min})=$`
        texteCorr += `${sp()}$${miseEnEvidence(minToHoraire(partieEntiere * 60 + partieDecimale * 6, true))}$`
        texteCorr += `<br>$${partieEntiere},${partieDecimale}~\\text{h}=${partieEntiere}~\\text{h}+${texNombre(partieDecimale / 10)}~\\text{h}`
        texteCorr += `=${partieEntiere}~\\text{h}+(${texNombre(partieDecimale / 10)}\\times 1~\\text{h})`
        texteCorr += `=${partieEntiere}~\\text{h}+(${texNombre(partieDecimale / 10)}\\times 60~\\text{min})=$`
        texteCorr += `${sp()}$${miseEnEvidence(minToHoraire(partieEntiere * 60 + partieDecimale * 6, true))}$`
        minutes = partieDecimale * 6
      }
      if (!context.isAmc) {
        handleAnswers(this, i, {
          reponse: {
            value: new Hms({ hour: partieEntiere, minute: minutes }).toString(),
            options: { HMS: true },
          },
        })
      } else {
        this.autoCorrectionAMC[i] = {
          enonce: texte,
          propositions: [
            {
              type: 'AMCNum',
              propositions: [
                {
                  texte: texteCorr,
                  statut: '',
                  reponse: {
                    texte: "Nombre d'heures",
                    valeur: partieEntiere,
                    param: {
                      digits: 2,
                      decimals: 0,
                      signe: false,
                      approx: 0,
                    },
                  },
                },
              ],
            },
            {
              type: 'AMCNum',
              propositions: [
                {
                  texte: '',
                  statut: '',
                  reponse: {
                    texte: 'Nombre de minutes',
                    valeur: minutes,
                    param: {
                      digits: 2,
                      decimals: 0,
                      signe: false,
                      approx: 0,
                    },
                  },
                },
              ],
            },
          ],
        }
        this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
      }

      if (this.questionJamaisPosee(i, partieDecimale, partieEntiere)) {
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
