import { amcConvert } from '../../lib/amc/amcBuilders'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { sp } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const dateDePublication = '08/09/2025'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCHybride'
export const titre =
  'Encadrer des nombres positifs avec des puissances de 10 à coefficients'

/**
 * Encadrer par des puissances de 10 avec coefficients entiers consécutifs
 * @author Éric Elter (d'après 4C30-1)
 */
export const uuid = '4068b'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}

export default class PuissancesEncadrementCoefficients extends Exercice {
  classe = 4
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Niveau de difficulté',
      'Nombres séparés par des tirets :\n1 : Nombre entier naturel\n2 : Nombre décimal positif supérieur à 1 \n3 : Nombre décimal positif inférieur à 1\n4 : Mélange',
    ]
    this.sup = 4
    this.nbQuestions = 5

    this.classe = 4
  }

  nouvelleVersion() {
    const listeTypeDeQuestions = []
    let signeChange
    this.consigne =
      this.nbQuestions === 1
        ? 'Encadrer le nombre suivant '
        : 'Encadrer les nombres suivants '
    this.consigne +=
      'par deux expressions respectivement de la forme $k\\times10^n$ et $(k+1)\\times10^n$ où $k$ est un entier, non nul, à un chiffre et $n$ est un entier relatif.'

    signeChange = this.classe === 2

    const typeDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: this.classe === 4 ? 3 : 4,
      melange: this.classe === 4 ? 4 : 5,
      defaut: 1,
      nbQuestions: this.nbQuestions,
    })

    for (let ee = 0; ee < this.nbQuestions; ee++) {
      switch (typeDeQuestions[ee]) {
        case 1: // nombre entier positif
          listeTypeDeQuestions.push(
            choice(this.classe === 2 ? [1, 2, 3, 4, 5, 6] : [1, 2, 3, 4, 5]),
          )
          break
        case 2: // nombre décimal positif
          listeTypeDeQuestions.push(
            choice(this.classe === 2 ? [7, 8, 9, 10] : [7, 8, 9]),
          )
          break
        case 3: // nombre décimal positif inférieur à 1
          listeTypeDeQuestions.push(
            choice(this.classe === 2 ? [11, 12, 13, 14] : [11, 12, 13]),
          )
          break
        case 4: // Mélange
          listeTypeDeQuestions.push(
            choice([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]),
          )
          signeChange = true
          break
      }
    }

    // Fonction pour calculer l'encadrement avec coefficients
    const calculerEncadrement = (nombre: number) => {
      const abs = Math.abs(nombre)
      const signe = nombre >= 0 ? 1 : -1

      // Trouver l'ordre de grandeur
      let exposant = Math.floor(Math.log10(abs))
      let puissanceDix = Math.pow(10, exposant)

      // Calculer le coefficient pour la borne inférieure
      let coeffInf = Math.floor(abs / puissanceDix)

      // Si le coefficient est >= 10, ajuster
      if (coeffInf >= 10) {
        exposant++
        puissanceDix *= 10
        coeffInf = Math.floor(abs / puissanceDix)
      }

      const coeffSup = coeffInf + 1

      // Gérer le cas des nombres négatifs
      if (signe === -1) {
        return {
          coeffInf: -coeffSup,
          coeffSup: -coeffInf,
          exposant,
          borneInf: -coeffSup * puissanceDix,
          borneSup: -coeffInf * puissanceDix,
        }
      } else {
        return {
          coeffInf,
          coeffSup,
          exposant,
          borneInf: coeffInf * puissanceDix,
          borneSup: coeffSup * puissanceDix,
        }
      }
    }

    for (
      let i = 0,
        signe,
        texte,
        texteCorr,
        consigneAMC,
        nombre,
        encadrement,
        cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      // Générer un nombre selon le type de question
      if (listeTypeDeQuestions[i] < 7) {
        // nombre entier positif
        const j = listeTypeDeQuestions[i] - 1
        signe = signeChange ? choice([-1, 1]) : 1
        nombre = signe * randint(10 ** j + 1, 9 * 10 ** j - 1)
      } else if (listeTypeDeQuestions[i] < 11) {
        // nombre décimal positif
        const j = listeTypeDeQuestions[i] - 7
        signe = signeChange ? choice([-1, 1]) : 1
        nombre = (signe * randint(10001, 89999)) / 10 ** (4 - j)
      } else {
        // nombre décimal positif inférieur à 1
        const j = listeTypeDeQuestions[i] - 11
        signe = signeChange ? choice([-1, 1]) : 1
        nombre =
          (signe * randint(10 ** (4 - j - 1) + 1, 9 * 10 ** (4 - j - 1) - 1)) /
          10000
      }

      encadrement = calculerEncadrement(nombre)
      const nombreTexte = texNombre(nombre, 4)

      // Construire les expressions des bornes
      const borneInfExpr = `${encadrement.coeffInf}\\times10^{${encadrement.exposant}}`
      const borneSupExpr = `${encadrement.coeffSup}\\times10^{${encadrement.exposant}}`

      consigneAMC = `$\\dots\\dots\\dots${sp(1)}\\leqslant ${nombreTexte}\\leqslant${sp(1)}\\dots\\dots\\dots$`

      texte = this.interactif
        ? ajouteChampTexteMathLive(
            this,
            2 * i,
            KeyboardType.clavierDeBaseAvecFractionPuissanceCrochets,
          ) +
          `$\\leqslant ${nombreTexte}\\leqslant $` +
          ajouteChampTexteMathLive(
            this,
            2 * i + 1,
            KeyboardType.clavierDeBaseAvecFractionPuissanceCrochets,
          )
        : consigneAMC

      // Définir les réponses pour l'interactif
      handleAnswers(this, 2 * i, {
        reponse: {
          value: borneInfExpr,
          options: { ecritureScientifique: true },
        },
      })
      handleAnswers(this, 2 * i + 1, {
        reponse: {
          value: borneSupExpr,
          options: { ecritureScientifique: true },
        },
      })

      texteCorr = `$${miseEnEvidence(borneInfExpr)} \\leqslant ${nombreTexte} \\leqslant ${miseEnEvidence(borneSupExpr)}$`
      texteCorr += ` car $${borneInfExpr} = ${texNombre(encadrement.borneInf, 4)}$ et $${borneSupExpr} = ${texNombre(encadrement.borneSup, 4)}.$`

      if (context.isAmc) {
        this.autoCorrectionAMC[i] = {
          enonce:
            'Encadrer le nombre suivant par deux expressions de la forme $k\\times10^n$ et $(k+1)\\times10^n$ où $k$ est un entier non nul : ' +
            consigneAMC,
          enonceAvant: false,
          enonceApresNumQuestion: true,
          options: { barreseparation: true },
          propositions: [
            {
              type: 'AMCNum',
              propositions: [
                {
                  texte: '',
                  statut: '',
                  multicolsBegin: true,
                  reponse: {
                    texte: 'Coefficient de la borne inférieure',
                    valeur: encadrement.coeffInf,
                    param: {
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
                    texte: 'Exposant commun',
                    valeur: encadrement.exposant,
                    param: {
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
                  multicolsEnd: true,
                  reponse: {
                    texte: 'Coefficient de la borne supérieure',
                    valeur: encadrement.coeffSup,
                    param: {
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

      if (this.questionJamaisPosee(i, texte)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
