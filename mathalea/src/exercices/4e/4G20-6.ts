import { amcConvert } from '../../lib/amc/amcBuilders'
import { addMultiMathfield } from '../../lib/customElements/MultiMathfield'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { toutAUnPoint } from '../../lib/interactif/fonctionsBaremes'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { nombreDeChiffresDansLaPartieEntiere } from '../../lib/outils/nombres'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Encadrer une racine carrée et en donner un arrondi'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCHybride'

/**
 * Encadrer une racine carrée et en donner une valeur approchée
 * @author Guillaume Valmont  (Amélioration AMC par Éric Elter)

 * Date de publication : 08/08/2021
 */
export const uuid = '516d2'

export const refs = {
  'fr-fr': ['4G20-6', 'BP2AutoS4'],
  'fr-ch': ['10CTNO6B-3', '10LCNO6B-3', '10LSNO6B-3', 'PRQNO07B-7'],
}
export default class CalculValeurApprocheeRacineCarree extends Exercice {
  constructor() {
    super()

    this.nbQuestions = 6

    this.nbCols = 2
    this.nbColsCorr = 2

    this.besoinFormulaireNumerique = [
      'Avec ou sans calculatrice',
      3,
      '1 : Avec calculatrice\n2 : Sans calculatrice\n3 : Mélange',
    ]
    this.besoinFormulaire2Numerique = [
      'Choix des corrections',
      2,
      '1 : Collège\n2 : Lycée',
    ]
    this.sup = 3
    this.sup2 = 1
  }

  nouvelleVersion() {
    let listeAvecOuSansCalculatrice
    if (this.sup === 1) {
      listeAvecOuSansCalculatrice = ['avec']
    } else if (this.sup === 2) {
      listeAvecOuSansCalculatrice = ['sans']
    } else {
      listeAvecOuSansCalculatrice = ['avec', 'sans']
    }
    listeAvecOuSansCalculatrice = combinaisonListes(
      listeAvecOuSansCalculatrice,
      this.nbQuestions,
    )
    const typeQuestionsDisponibles = ['unite', 'dixieme', 'centieme']

    const listeTypeQuestions = combinaisonListes(
      typeQuestionsDisponibles,
      this.nbQuestions,
    )
    for (
      let i = 0,
        texte,
        texteCorr,
        type,
        a,
        nbDec,
        reponse,
        pasReponse,
        reponseG,
        reponseD,
        cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      if (listeAvecOuSansCalculatrice[i] === 'avec') {
        a = randint(
          2,
          300,
          [
            4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144, 169, 196, 225, 256,
            289,
          ],
        )
        switch (listeTypeQuestions[i]) {
          case 'unite':
            type = "à l'unité"
            reponse = texNombre(Math.sqrt(a), 0)
            reponseG = texNombre(Math.floor(Math.sqrt(a)), 0)
            reponseD = texNombre(Math.ceil(Math.sqrt(a)), 0)
            nbDec = 0
            break
          case 'dixieme':
            type = 'au dixième'
            reponse = texNombre(Math.sqrt(a), 1)
            reponseG = texNombre(Math.floor(Math.sqrt(a) * 10) / 10, 1)
            reponseD = texNombre(Math.ceil(Math.sqrt(a) * 10) / 10, 1)
            nbDec = 1
            break
          case 'centieme':
          default:
            type = 'au centième'
            reponse = texNombre(Math.sqrt(a), 2)
            reponseG = texNombre(Math.floor(Math.sqrt(a) * 100) / 100, 2)
            reponseD = texNombre(Math.ceil(Math.sqrt(a) * 100) / 100, 2)
            nbDec = 2
            break
        }
        if (reponse === reponseG) pasReponse = reponseD
        else pasReponse = reponseG
        if (!this.interactif) {
          texte = `Encadrer $\\sqrt{${a}}$ ${type} près et en donner un arrondi ${type} près.`
        } else {
          texte = addMultiMathfield(this, i, {
            dataTemplate: `Donner la valeur arrondie ${type} près de $\\sqrt{${a}}$ : %{champ1}`,
            dataOptions: {
              champ1: {
                keyboard: KeyboardType.clavierNumbers,
                ldots: false,
              },
            },
          })
        }
        handleAnswers(
          this,
          i,
          {
            bareme: toutAUnPoint,
            champ1: {
              value: parseFloat(reponse.replaceAll(',', '.')),
            },
          },
          { formatInteractif: 'multi-mathfield' },
        )
        texteCorr = `$\\sqrt{${a}} \\approx ${texNombre(Math.sqrt(a), 6)}$.<br>`
        texteCorr += `Or $${reponseG} < ${texNombre(Math.sqrt(a), 6)} < ${reponseD}$,<br>`
        texteCorr += `et $${texNombre(Math.sqrt(a), 6)}$ est plus proche de $${reponse}$ que de $${pasReponse}$.<br>`
        texteCorr += `Donc l'arrondi ${type} près de $\\sqrt{${a}}$ est $${miseEnEvidence(miseEnEvidence(reponse))}$.`
      } else {
        a = randint(2, 143, [4, 9, 16, 25, 36, 49, 64, 81, 100, 121])
        reponseG = Math.floor(Math.sqrt(a))
        reponseD = Math.ceil(Math.sqrt(a))
        reponse = '' // C'est pour éviter un warning
        nbDec = 0 // idem
        texte = `Sans utiliser de calculatrice, encadrer $\\sqrt{${a}}$ entre deux nombres entiers consécutifs.<br>`
        texte += addMultiMathfield(this, i, {
          dataTemplate: `%{champ1}$<\\sqrt{${a}}<$%{champ2}`,
          dataOptions: {
            champ1: {
              keyboard: KeyboardType.clavierNumbers,
              ldots: true,
            },
            champ2: {
              keyboard: KeyboardType.clavierNumbers,
              ldots: true,
            },
          },
        })
        handleAnswers(
          this,
          i,
          {
            bareme: toutAUnPoint,
            champ1: { value: reponseG },
            champ2: { value: reponseD },
          },
          { formatInteractif: 'multi-mathfield' },
        )

        texteCorr = `$${reponseG}^2 = ${reponseG ** 2}$ et $${reponseD}^2 = ${reponseD ** 2}$.<br>`
        texteCorr += `Or $${reponseG ** 2} < ${a} < ${reponseD ** 2}$,<br>`
        if (this.sup2 === 1) {
          texteCorr += `donc $\\sqrt{${reponseG ** 2}} < \\sqrt{${a}} < \\sqrt{${reponseD ** 2}}$,<br>`
        } else {
          texteCorr += `donc $\\sqrt{${reponseG ** 2}} < \\sqrt{${a}} < \\sqrt{${reponseD ** 2}}$ puisque la fonction racine carrée est strictement croissante sur $\\mathbb{R}_+$,<br>`
        }
        texteCorr += `enfin $${miseEnEvidence(reponseG)} < \\sqrt{${a}} < ${miseEnEvidence(reponseD)}$.`
      }
      if (this.questionJamaisPosee(i, a)) {
        if (context.isAmc) {
          if (listeAvecOuSansCalculatrice[i] === 'avec') {
            this.autoCorrectionAMC[i] = {
              enonce: '',
              enonceAvant: false,
              propositions: [
                {
                  type: 'AMCOpen',
                  propositions: [
                    {
                      texte: texteCorr,
                      enonce: `À l'aide de la calculatrice, donner un encadrement de $\\sqrt{${a}}$ ${type} près puis la valeur arrondie ${type} près: \\\\`,
                      statut: 1,
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
                        texte: `arrondi de $\\sqrt{${a}}$ ${type} près :`,
                        valeur: [parseFloat(reponse.replaceAll(',', '.'))],
                        param: {
                          digits:
                            nombreDeChiffresDansLaPartieEntiere(
                              parseFloat(reponse.replaceAll(',', '.')),
                            ) + nbDec,
                          decimals: nbDec,
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
              enonce: '',
              enonceAvant: false,
              propositions: [
                {
                  type: 'AMCOpen',
                  propositions: [
                    {
                      texte: texteCorr,
                      enonce: `Sans utiliser de calculatrice, encadrer $\\sqrt{${a}}$ entre deux nombres entiers.\\\\`,
                      statut: 2,
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
                        texte: 'Entier inférieur',
                        valeur: [Number(reponseG)],
                        param: {
                          digits: nombreDeChiffresDansLaPartieEntiere(
                            Number(reponseG),
                          ),
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
                        texte: 'Entier supérieur',
                        valeur: [Number(reponseD)],
                        param: {
                          digits: nombreDeChiffresDansLaPartieEntiere(
                            Number(reponseD),
                          ),
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
