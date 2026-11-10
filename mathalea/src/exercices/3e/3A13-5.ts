import { amcConvert } from '../../lib/amc/amcBuilders'
import { bleuMathalea, orangeMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { numAlpha, sp } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import operation from '../../modules/operations'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = "Jouer avec la compréhension des multiples d'un nombre"

export const amcReady = true
export const amcType = 'AMCHybride'
export const interactifReady = true

export const dateDePublication = '30/09/2023'

/**
 * Combien ajouter (ou soustraire) à un nombre pour qu'il devienne multiple d'un autre ?
 * @author Éric ELTER
 */

export const uuid = '2ae9b'

export const refs = {
  'fr-fr': ['3A13-5'],
  'fr-ch': ['9R1NO1A-7', '9R2NO1A-7', '9R3NO1A-7'],
}
export default class DivisionEuclidienneEtAjout extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireCaseACocher = ['Inclure la division euclidienne']

    this.besoinFormulaire2Numerique = [
      'Type de questions',
      3,
      '1 : Ajouter un nombre\n2 : Soustraire un nombre\n3 : Mélange',
    ]

    this.besoinFormulaire3Texte = [
      'Nombre de dizaines dans le diviseur',
      'Nombres séparés par des tirets :\nChoix entre 0 et 29\n30 : Mélange',
    ]

    this.nbQuestions = 5
    this.sup = true
    this.sup2 = 3
    this.sup3 = '14-15-16-17'
  }

  nouvelleVersion() {
    const dizaineDiviseur = gestionnaireFormulaireTexte({
      saisie: this.sup3,
      min: 0,
      max: 29,
      melange: 30,
      defaut: 20,
      nbQuestions: this.nbQuestions,
    })
    const signe = combinaisonListes(['+', '-'], this.nbQuestions)
    for (
      let i = 0,
        dividende,
        quotient,
        reste,
        diviseur,
        reponse,
        texteDivAMC,
        texteNbAMC,
        texte,
        texteCorr,
        cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      texte = ''
      texteCorr = ''
      const choixOperation =
        this.sup2 === 3 ? signe[i] : this.sup2 === 1 ? '+' : '-'
      diviseur =
        dizaineDiviseur[i] === 0
          ? randint(5, 9)
          : Number(dizaineDiviseur[i]) * 10 + randint(1, 9)
      quotient = randint(26, 196, [
        30,
        40,
        50,
        60,
        70,
        80,
        90,
        100,
        110,
        120,
        130,
        140,
        150,
        160,
        170,
        180,
        190,
        diviseur,
      ])
      reste = randint(3, diviseur - 1, [20, 30, 40, 50])
      dividende = quotient * diviseur + reste

      if (this.sup) {
        texteDivAMC =
          numAlpha(0) +
          `Effectuer la division euclidienne de $${texNombre(dividende)}$ par $${texNombre(diviseur)}$.`
        texte += texteDivAMC + '<br>'
        texteNbAMC = numAlpha(1) + ' Quel '
        texteCorr +=
          numAlpha(0) +
          operation({
            operande1: dividende,
            operande2: diviseur,
            type: 'divisionE',
            options: { solution: true, colore: orangeMathalea },
          }) +
          `$${texNombre(dividende)}=${diviseur}\\times${quotient}+${reste}$`
        texteCorr += '<br><br>' + numAlpha(1)
      } else {
        texteNbAMC = `Sachant que $${texNombre(dividende)}=${diviseur}\\times${quotient}+${reste}$, quel `
      }

      texteCorr += `Sachant que $${texNombre(dividende)}= ${miseEnEvidence(`${diviseur}\\times${quotient}`, 'green')}${miseEnEvidence(`${sp()}+${sp()}${reste}`, 'black')}$, alors $${texNombre(dividende)}$ est encadré par deux multiples consécutifs de $${diviseur}$ de la façon suivante :<br>`
      texteCorr += `${sp(10)}$${miseEnEvidence(`${diviseur}\\times${quotient}`, 'green')} < ${texNombre(dividende)} < ${miseEnEvidence(`${diviseur}\\times${quotient}`, 'green')}${miseEnEvidence(`${sp()}+${sp()}${diviseur}`, bleuMathalea)}$<br>`

      if (choixOperation === '+') {
        texteNbAMC += `est le plus petit entier naturel à ajouter à $${texNombre(dividende)}$ pour que la somme obtenue soit multiple de $${diviseur}$ ?`
        texteCorr += `${sp(10)}$${miseEnEvidence(`${diviseur}`, bleuMathalea)}${sp()}-${sp()} ${miseEnEvidence(`${reste}`, 'black')} ${sp()}=${sp()} ${miseEnEvidence(`${diviseur - reste}`)}$<br>`
        texteCorr += `Donc en ajoutant $${miseEnEvidence(diviseur - reste)}$ à $${texNombre(dividende)}$, on obtiendra le plus petit multiple de $${diviseur}$ supérieur à $${texNombre(dividende)}$.<br>`
        reponse = diviseur - reste
      } else {
        texteNbAMC += `est le plus petit entier naturel à soustraire à $${texNombre(dividende)}$ pour que la différence obtenue soit multiple de $${diviseur}$ ?`
        texteCorr += `Donc en enlevant $${miseEnEvidence(reste)}$ à $${texNombre(dividende)}$, on obtiendra le plus grand multiple de $${diviseur}$ inférieur à $${texNombre(dividende)}$.<br>`
        reponse = reste
      }

      texte += texteNbAMC

      if (this.interactif) {
        handleAnswers(this, i, { reponse: { value: reponse } })
        texte +=
          '<br>' +
          ajouteChampTexteMathLive(this, i, KeyboardType.clavierNumbers)
      }
      if (context.isAmc) {
        this.autoCorrectionAMC[i] = this.sup
          ? {
              enonce: '',
              enonceAvant: false,
              propositions: [
                {
                  type: 'AMCOpen',
                  propositions: [
                    {
                      enonce: texteDivAMC,
                      texte: '',
                      statut: 3,
                      pointilles: false,
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
                        texte: texteNbAMC,
                        valeur: [reponse],
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
          : {
              enonce: '',
              enonceAvant: false,
              propositions: [
                {
                  type: 'AMCNum',
                  propositions: [
                    {
                      texte: '',
                      statut: '',
                      reponse: {
                        texte: texteNbAMC,
                        valeur: [reponse],
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

      if (this.questionJamaisPosee(i, dividende, quotient)) {
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
