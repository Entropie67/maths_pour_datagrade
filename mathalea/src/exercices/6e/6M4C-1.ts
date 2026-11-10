import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteEnCouleur,
} from '../../lib/outils/embellissements'
import { context } from '../../modules/context'
import Hms from '../../modules/Hms'

import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { listeQuestionsToContenu, randint } from '../../modules/outils'

import { amcConvert } from '../../lib/amc/amcBuilders'
import { bleuMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { arrondi } from '../../lib/outils/nombres'
import Exercice from '../Exercice'

export const titre = 'Convertir en min vers h et min ou en s vers min et s'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCHybride'
export const dateDeModifImportante = '14/05/2022'

/**
 * @author Rémi Angot
 * Ajout d'une option "Mélange" par Guillaume Valmont le 14/05/2022
 */

export const uuid = '4f8f4'

export const refs = {
  'fr-fr': ['6M4C-1'],
  'fr-2016': ['6D13'],
  'fr-ch': ['9R1GM4D-4', '9R2GM4D-4', '9R3GM4D-4', '10CTGM4B-2', '10LCGM4B-2', '10LSGM4B-2', 'PRQMG04D-1'],
}
export default class ConversionHeuresMinutesOuMinutesEtSecondes extends Exercice {
  can: boolean
  constructor(can = false) {
    super()
    this.besoinFormulaireNumerique = [
      "Type d'unité de départ",
      3,
      '1 : Minutes\n2 : Secondes\n3 : Mélange',
    ]
    this.nbQuestions = 5
    this.correctionDetailleeDisponible = true
    this.correctionDetaillee = false
    this.sup = 1
    this.can = can
  }

  nouvelleVersion() {
    let typeQuestionsDisponibles = ['min vers h et min', 's vers min et s']
    if (this.sup === 1) typeQuestionsDisponibles = ['min vers h et min']
    else if (this.sup === 2) typeQuestionsDisponibles = ['s vers min et s']
    const listeTypeQuestions = combinaisonListes(
      typeQuestionsDisponibles,
      this.nbQuestions,
    )
    for (
      let i = 0, cpt = 0, a, b, d, texte, texteCorr;
      i < this.nbQuestions && cpt < 50;
    ) {
      a = randint(2, 4)
      b = randint(10, 59)
      d = arrondi(a * 60 + b)
      if (listeTypeQuestions[i] === 'min vers h et min') {
        texte =
          `Convertir $${d}$ minutes en heures ($\\text{h}$) et minutes ($\\text{min}$).` +
          ajouteChampTexteMathLive(this, i, KeyboardType.clavierHms)
        this.canEnonce = `Convertir $${d}$ minutes en heures et minutes.`
        this.canReponseACompleter = '$\\ldots$ h $\\ldots$ min'
      } else {
        texte =
          `Convertir $${d}$ secondes en minutes ($\\text{min}$) et secondes ($\\text{s}$).` +
          ajouteChampTexteMathLive(this, i, KeyboardType.clavierHms)
        this.canEnonce = `Convertir $${d}$ secondes en minutes et secondes.`
        this.canReponseACompleter = '$\\ldots$ min $\\ldots$ s'
      }
      if (this.can) {
        if (listeTypeQuestions[i] === 'min vers h et min') {
          texteCorr =
            texteEnCouleur(
              `
    Mentalement : <br>
On cherche le multiple de $60$ inférieur à $${d}$ le plus grand possible. C'est $${Math.floor(d / 60)}\\times 60 = ${Math.floor(d / 60) * 60}$.<br>
Ainsi $${d} = ${Math.floor(d / 60) * 60} + ${d % 60}$ donc $${d}\\text{~min~}= ${Math.floor(d / 60)}\\text{~h~}${d % 60}\\text{~min}$.`,
              bleuMathalea,
            ) + '<br>'
        } else {
          texteCorr =
            texteEnCouleur(
              `
           Mentalement : <br>
      On cherche le multiple de $60$ inférieur à $${d}$ le plus grand possible. C'est $${Math.floor(d / 60)}\\times 60 = ${Math.floor(d / 60) * 60}$.<br>
      Ainsi $${d} = ${Math.floor(d / 60) * 60} + ${d % 60}$ donc $${d}\\text{~s~}= ${Math.floor(d / 60)}\\text{~min~}${d % 60}\\text{~s}$.`,
              bleuMathalea,
            ) + '<br>'
        }
        this.listeCanEnonces.push(this.canEnonce)
        this.listeCanReponsesACompleter.push(this.canReponseACompleter)
      } else
        texteCorr = this.correctionDetaillee
          ? `On doit effectuer la division euclidienne de $${d}$ par $60$ car il y a $60$ minutes dans une heure.<br>Le quotient entier donne le nombre d'heures et le reste enter donne le nombre de minutes.<br>`
          : ''

      if (listeTypeQuestions[i] === 'min vers h et min') {
        texteCorr += `$${d} = (${a} \\times 60) + ${b}$ donc $${d}$ minutes = $${miseEnEvidence(a)}\\text{ h }${miseEnEvidence(String(b).padStart(2, '0'))}\\text{ min}$.`
      } else {
        texteCorr += `$${d} = (${a} \\times 60) + ${b}$ donc $${d}$ s = $${miseEnEvidence(a)}\\text{ min }${miseEnEvidence(b)}\\text{ s}$.`
      }
      if (this.questionJamaisPosee(i, a, b, d)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr

        if (context.isAmc) {
          if (listeTypeQuestions[i] === 'min vers h et min') {
            this.autoCorrectionAMC[i] = {
              enonce: texte,
              options: { multicols: true },
              propositions: [
                {
                  type: 'AMCNum',
                  propositions: [
                    {
                      texte: texteCorr,
                      statut: '',
                      reponse: {
                        texte: 'Heure($\\text{s}$)',
                        valeur: a,
                        param: {
                          digits: 1,
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
                        texte: 'Minute($\\text{min}$)',
                        valeur: b,
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
          } else {
            this.autoCorrectionAMC[i] = {
              enonce: texte,
              options: { multicols: true },
              propositions: [
                {
                  type: 'AMCNum',
                  propositions: [
                    {
                      texte: texteCorr,
                      statut: '',
                      reponse: {
                        texte: 'Minutes($\\text{min}$)',
                        valeur: a,
                        param: {
                          digits: 1,
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
                        texte: 'Secondes($\\text{s}$)',
                        valeur: b,
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
        } else {
          if (listeTypeQuestions[i] === 'min vers h et min') {
            handleAnswers(this, i, {
              reponse: {
                value: new Hms({ hour: a, minute: b }).toString(),
                options: { HMS: true },
              },
            })
          } else {
            handleAnswers(this, i, {
              reponse: {
                value: new Hms({ minute: a, second: b }).toString(),
                options: { HMS: true },
              },
            })
          }
        }

        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
