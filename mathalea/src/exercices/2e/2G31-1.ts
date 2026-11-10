import { amcConvert } from '../../lib/amc/amcBuilders'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { ecritureParentheseSiNegatif } from '../../lib/outils/ecritures'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { unSiPositifMoinsUnSinon } from '../../lib/outils/nombres'
import { pgcd } from '../../lib/outils/primalite'
import { getLang } from '../../lib/stores/languagesStore'
import { context } from '../../modules/context'
import FractionEtendue from '../../modules/FractionEtendue'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = "Déterminer le coefficient directeur d'une droite"
export const dateDeModifImportante = '27/04/2024'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCHybride'

/**
 * Déterminer le coefficient directeur d'une droite
 * @author Stéphane Guyon
 */
export const uuid = '1ea16'

export const refs = {
  'fr-fr': ['2G31-1'],
  'fr-ch': ['1mF2-1', '11LCFA2E-6', '11LSFA2E-6'],
}
export default class CoefficientDirecteurDeDroite extends Exercice {
  constructor() {
    super()

    this.nbQuestions = 3
    this.nbCols = 2 // Uniquement pour la sortie LaTeX
    this.nbColsCorr = 2 // Uniquement pour la sortie LaTeX
    this.sup = 1 // Niveau de difficulté
  }

  nouvelleVersion() {
    const lang = getLang()
    const typeQuestionsDisponibles = [
      'Droite oblique',
      'Droite oblique',
      'Droite oblique',
      'Droite oblique',
      'Droite verticale',
    ] // On créé 2 types de questions
    const listeTypeQuestions = combinaisonListes(
      typeQuestionsDisponibles,
      this.nbQuestions,
    ) // Tous les types de questions sont posés mais l'ordre diffère à chaque "cycle"
    if (lang === 'fr-CH') {
      if (!this.interactif) {
        this.consigne =
          'Déterminer, si elle existe, la pente de la droite $(AB)$.'
      } else {
        this.consigne =
          "Déterminer, si elle existe, la pente de la droite $(AB)$, écrire 'aucun' si la droite n'a pas de pente."
      }
    } else {
      if (!this.interactif) {
        this.consigne =
          "Soit $\\big(O ; \\vec \\imath,\\vec \\jmath\\big)$ un repère orthogonal. Déterminer, s'il existe et en l'expliquant, le coefficient directeur de la droite $(AB)$."
      } else {
        this.consigne =
          "Soit $\\big(O ; \\vec \\imath,\\vec \\jmath\\big)$ un repère orthogonal. Déterminer, s'il existe, le coefficient directeur de la droite $(AB)$, écrire 'aucun' si la droite n'a pas de coefficicient directeur."
      }
    }

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''
      let xA: number
      let xB: number
      let yA: number
      let yB: number
      // Boucle principale où i+1 correspond au numéro de la question
      switch (
        listeTypeQuestions[i] // Suivant le type de question, le contenu sera différent
      ) {
        case 'Droite oblique':
          {
            xA = randint(-5, 5)
            yA = randint(-5, 5)
            xB = randint(-5, 5, xA)
            yB = randint(-5, 5)
            let n = yB - yA
            let d = xB - xA

            texte = `Avec $A(${xA};${yA})$ et $B(${xB};${yB})$. `
            texteCorr = 'On observe que $ x_B\\neq x_A$.'
            texteCorr += "<br>La droite $(AB)$ n'est donc pas verticale."
            texteCorr +=
              '<br>On peut donc calculer le coefficient directeur $m$ de la droite.'
            texteCorr +=
              "<br>On sait d'après le cours : $m=\\dfrac{y_B-y_A}{x_B-x_A}$."
            texteCorr += `<br>On applique avec les données de l'énoncé : $m=\\dfrac{${yB}-${ecritureParentheseSiNegatif(yA)}}{${xB}-${ecritureParentheseSiNegatif(xA)}}`
            if ((pgcd(n, d) !== 1 || d === 1 || d < 0 || n < 0) && n !== 0) {
              texteCorr += `=${new FractionEtendue(n, d).texFraction}`
              texteCorr += `=${miseEnEvidence(new FractionEtendue(n, d).texFractionSimplifiee)}`
            } else
              texteCorr += `=${miseEnEvidence(new FractionEtendue(n, d).texFraction)}`

            texteCorr += '$.'

            // texte += `=${new FractionEtendue(n, d).texFractionSimplifiee}`
            handleAnswers(this, i, {
              reponse: {
                value: new FractionEtendue(n, d).texFractionSimplifiee,
              },
            })

            if (context.isAmc) {
              n =
                unSiPositifMoinsUnSinon(n) *
                unSiPositifMoinsUnSinon(d) *
                Math.abs(n)
              d = Math.abs(d)
              this.autoCorrectionAMC[i] = {
                enonce: `Soit $\\big(O ; \\vec \\imath,\\vec \\jmath\\big)$ un repère orthogonal. Soit $A(${xA};${yA})$ et $B(${xB};${yB})$.<br>Déterminer, s'il existe, le coefficient directeur de la droite $\\bm{(AB)}$ sous la forme d'une fraction irréductible (coder deux fois zéro si le coefficient n'existe pas).<br>`,
                propositions: [
                  {
                    type: 'qcmMono',
                    propositions: [
                      {
                        texte: 'Le coefficient existe',
                        statut: true,
                        feedback:
                          "On observe que $ x_B\\neq x_A$, donc la droite n'est pas verticale et elle a un coefficient directeur.",
                      },
                      {
                        texte: "Le coefficient n'existe pas",
                        statut: false,
                        feedback:
                          "On observe que $ x_B\\neq x_A$, donc la droite n'est pas verticale et elle a un coefficient directeur.",
                      },
                    ],
                  },
                  {
                    type: 'AMCNum',
                    propositions: [
                      {
                        texte: texteCorr,
                        statut: '',
                        reponse: {
                          texte: 'numérateur',
                          valeur: new FractionEtendue(n, d).n,
                          param: {
                            digits: 1,
                            decimals: 0,
                            signe: true,
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
                          texte: 'dénominateur',
                          valeur: new FractionEtendue(n, d).d,
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
                ],
              }
              this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
            }
          }
          break
        case 'Droite verticale':
        default:
          xA = randint(-5, 5)
          yA = randint(-5, 5)
          xB = xA
          yB = randint(-5, 5)

          texte = `Avec $A(${xA};${yA})$ et $B(${xB};${yB})$. `
          texteCorr = 'On observe que $ x_B = x_A$.'
          texteCorr += '<br>La droite $(AB)$ est donc verticale.'
          texteCorr += `<br>Elle n'admet donc ${texteEnCouleurEtGras('aucun')} coefficient directeur.`
          handleAnswers(this, i, {
            reponse: { value: 'aucun', options: { texteSansCasse: true } },
          })

          if (context.isAmc) {
            this.autoCorrectionAMC[i] = {
              enonce: `Soit $\\big(O ; \\vec \\imath,\\vec \\jmath\\big)$ un repère orthogonal. Soit $A(${xA};${yA})$ et $B(${xB};${yB})$.<br>Déterminer, s'il existe, le coefficient directeur de la droite $\\bm{(AB)}$ sous la forme d'une fraction irréductible (coder deux fois zéro si le coefficient n'existe pas).<br>`,
              propositions: [
                {
                  type: 'qcmMono',
                  propositions: [
                    {
                      texte: 'Le coefficient existe',
                      statut: false,
                      feedback:
                        "On observe que $ x_B = x_A$, donc la droite est verticale et elle n'a pas de coefficient directeur.",
                    },
                    {
                      texte: "Le coefficient n'existe pas",
                      statut: true,
                      feedback:
                        "On observe que $ x_B\\neq x_A$, donc la droite n'est pas verticale et elle a un coefficient directeur.",
                    },
                  ],
                },
                {
                  type: 'AMCNum',
                  propositions: [
                    {
                      texte: texteCorr,
                      statut: '',
                      reponse: {
                        texte: 'numérateur',
                        valeur: 0,
                        param: {
                          digits: 1,
                          decimals: 0,
                          signe: true,
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
                      texte: texteCorr,
                      statut: '',
                      reponse: {
                        texte: 'dénominateur',
                        valeur: 0,
                        param: {
                          digits: 1,
                          decimals: 0,
                          signe: true,
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
          break
      }
      texte += ajouteChampTexteMathLive(this, i, KeyboardType.alphanumeric, {
        texteAvant: '<br>Coefficient directeur de la droite $(AB)$ :',
      })
      if (this.questionJamaisPosee(i, xA, yA, xB, yB)) {
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
