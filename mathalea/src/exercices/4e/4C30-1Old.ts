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

export const dateDeModifImportante = '06/10/2025'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCHybride'
export const titre = 'Encadrer des nombres positifs avec des puissances de 10'

/**
 * Encadrer par des puissances de 10
 * @author Sébastien Lozano (Modifications apportées par Éric Elter)
 */
export const uuid = '760d7'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export default class PuissancesEncadrement extends Exercice {
  classe = 4
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Niveau de difficulté',
      'Nombres séparés par des tirets :\n1 : Nombre entier naturel\n2 : Nombre décimal positif supérieur à 1 \n3 : Nombre décimal positif inférieur à 1\n4 : Mélange',
    ]

    this.sup = 4
    this.nbQuestions = 5

    this.classe = 4 // Ce distinguo permet de supprimer les 10^0 du niveau 4ème
  }

  nouvelleVersion() {
    const listeTypeDeQuestions = []
    this.consigne =
      this.nbQuestions === 1
        ? "Encadrer le nombre suivant par deux puissances de 10 d'exposants consécutifs."
        : "Encadrer les nombres suivants par deux puissances de 10 d'exposants consécutifs."

    // this.sup2 might be undefined
    if (this.sup2) {
      this.consigne +=
        "<br>Dans le cas où le nombre est négatif, on utilisera les opposés de puissances de 10 d'exposants consécutifs."
    }

    const signeChange = this.classe === 2 && !!this.sup2

    const typeDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 3,
      melange: 4,
      defaut: 1,
      nbQuestions: this.nbQuestions,
    })
    for (let ee = 0; ee < this.nbQuestions; ee++) {
      switch (typeDeQuestions[ee]) {
        case 1: // nombre entier
          listeTypeDeQuestions.push(
            choice(this.classe === 2 ? [1, 2, 3, 4, 5, 6] : [1, 2, 3, 4, 5]),
          )
          break
        case 2: // nombre décimal supérieur à 1
          listeTypeDeQuestions.push(
            choice(this.classe === 2 ? [7, 8, 9, 10] : [7, 8, 9]),
          )
          break
        case 3: // nombre décimal inférieur à 1
          listeTypeDeQuestions.push(
            choice(this.classe === 2 ? [11, 12, 13, 14] : [11, 12, 13]),
          )
          break
        case 4: // Mélange
          listeTypeDeQuestions.push(
            choice(
              [1, 2, 3, 4, 5, 7, 8, 9, 11, 12, 13].concat(
                this.classe === 2 ? [6, 10, 14] : [],
              ),
            ),
          )
          break
      }
    }

    for (
      let i = 0,
        signe,
        texte,
        texteCorr,
        consigneAMC,
        exposantInf,
        exposantSup,
        cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      // nombre entier positif, entre 1 et 10, puis 10 et 100 puis ....100 000 et 1 000 000
      const entPos = []

      for (let j = this.classe === 2 ? 0 : 1; j < 6; j++) {
        signe = signeChange ? choice([-1, 1]) : 1
        entPos.push({
          val: `${texNombre(signe * randint(10 ** j + 1, 10 ** (j + 1) - 1), 0)}`,
          exposantInf: signe === 1 ? j : j + 1,
          exposantSup: signe === 1 ? j + 1 : j,
          puissance_inf: signe === 1 ? `10^{${j}}` : `-10^{${j + 1}}`,
          puissance_sup: signe === 1 ? `10^{${j + 1}}` : `-10^{${j}}`,
          puissance_inf_num:
            signe === 1
              ? `${texNombre(10 ** j, 0)}`
              : `${texNombre(-1 * 10 ** (j + 1), 0)}`,
          puissance_sup_num:
            signe === 1
              ? `${texNombre(10 ** (j + 1), 0)}`
              : `${texNombre(-1 * 10 ** j, 0)}`,
        })
      }

      // nombre décimal positif entre 1 et 10 000 avec 1,2,3 puis 4 décimales
      const decPos = []
      for (let j = this.classe === 2 ? 0 : 1; j < 4; j++) {
        signe = signeChange ? choice([-1, 1]) : 1
        decPos.push({
          val: `${texNombre((signe * randint(10001, 99999)) / 10 ** (4 - j), 4)}`,
          exposantInf: signe === 1 ? j : j + 1,
          exposantSup: signe === 1 ? j + 1 : j,
          puissance_inf: signe === 1 ? `10^{${j}}` : `-10^{${j + 1}}`,
          puissance_sup: signe === 1 ? `10^{${j + 1}}` : `-10^{${j}}`,
          puissance_inf_num:
            signe === 1
              ? `${texNombre(10 ** j, 0)}`
              : `${texNombre(-1 * 10 ** (j + 1), 0)}`,
          puissance_sup_num:
            signe === 1
              ? `${texNombre(10 ** (j + 1), 0)}`
              : `${texNombre(-1 * 10 ** j, 0)}`,
        })
      }
      // nombre décimal positif inférieur à 1, entre 0,1 et 1 puis entre 0,01 et 0,1 puis 0,001 et 0,0001
      const decPosInfUn = []
      for (let j = this.classe === 2 ? 0 : 1; j < 4; j++) {
        signe = signeChange ? choice([-1, 1]) : 1
        decPosInfUn.push({
          val: `${texNombre((signe * randint(10 ** (4 - j - 1) + 1, 10 ** (4 - j) - 1)) / 10000, 4)}`,
          exposantInf: signe === 1 ? -j - 1 : -j,
          exposantSup: signe === 1 ? -j : -j - 1,
          puissance_inf: signe === 1 ? `10^{${-(j + 1)}}` : `-10^{${-j}}`,
          puissance_sup: signe === 1 ? `10^{${-j}}` : `-10^{${-(j + 1)}}`,
          puissance_inf_num:
            signe === 1
              ? `${texNombre(10 ** -(j + 1), 4)}`
              : `${texNombre(-1 * 10 ** -j, 4)}`,
          puissance_sup_num:
            signe === 1
              ? `${texNombre(10 ** -j, 3)}`
              : `${texNombre(-1 * 10 ** -(j + 1), 4)}`,
        })
      }
      if (listeTypeDeQuestions[i] < 7) {
        // nombre entier positif
        consigneAMC = `$\\dots\\dots\\dots${sp(1)}\\leqslant ${entPos[listeTypeDeQuestions[i] - 1].val}\\leqslant${sp(1)}\\dots\\dots\\dots$`
        texte = this.interactif
          ? ajouteChampTexteMathLive(
              this,
              2 * i,
              KeyboardType.clavierDeBaseAvecFractionPuissanceCrochets,
            ) +
            `$\\leqslant ${entPos[listeTypeDeQuestions[i] - 1].val}\\leqslant $` +
            ajouteChampTexteMathLive(
              this,
              2 * i + 1,
              KeyboardType.clavierDeBaseAvecFractionPuissanceCrochets,
            )
          : consigneAMC
        exposantInf = entPos[listeTypeDeQuestions[i] - 1].exposantInf
        exposantSup = entPos[listeTypeDeQuestions[i] - 1].exposantSup
        handleAnswers(
          this,
          2 * i,
          {
            reponse: {
              value: String(entPos[listeTypeDeQuestions[i] - 1].puissance_inf),
              options: { puissance: true },
            },
          },
          { formatInteractif: 'mathlive' },
        )
        handleAnswers(
          this,
          2 * i + 1,
          {
            reponse: {
              value: String(entPos[listeTypeDeQuestions[i] - 1].puissance_sup),
              options: { puissance: true },
            },
          },
          { formatInteractif: 'mathlive' },
        )
        texteCorr = `$${miseEnEvidence(entPos[listeTypeDeQuestions[i] - 1].puissance_inf)} \\leqslant ${entPos[listeTypeDeQuestions[i] - 1].val} \\leqslant ${miseEnEvidence(entPos[listeTypeDeQuestions[i] - 1].puissance_sup)}$`
        texteCorr += ` car $${entPos[listeTypeDeQuestions[i] - 1].puissance_inf} = ${entPos[listeTypeDeQuestions[i] - 1].puissance_inf_num}$ et $${entPos[listeTypeDeQuestions[i] - 1].puissance_sup} = ${entPos[listeTypeDeQuestions[i] - 1].puissance_sup_num}.$`
      } else if (listeTypeDeQuestions[i] < 11) {
        // nombre décimal positif
        consigneAMC = `$\\dots\\dots\\dots${sp(1)}\\leqslant ${decPos[listeTypeDeQuestions[i] - 7].val}\\leqslant${sp(1)}\\dots\\dots\\dots$`
        texte = this.interactif
          ? ajouteChampTexteMathLive(
              this,
              2 * i,
              KeyboardType.clavierDeBaseAvecFractionPuissanceCrochets,
            ) +
            `$\\leqslant ${decPos[listeTypeDeQuestions[i] - 7].val}\\leqslant $` +
            ajouteChampTexteMathLive(
              this,
              2 * i + 1,
              KeyboardType.clavierDeBaseAvecFractionPuissanceCrochets,
            )
          : consigneAMC
        exposantInf = decPos[listeTypeDeQuestions[i] - 7].exposantInf
        exposantSup = decPos[listeTypeDeQuestions[i] - 7].exposantSup
        handleAnswers(
          this,
          2 * i,
          {
            reponse: {
              value: String(decPos[listeTypeDeQuestions[i] - 7].puissance_inf),
              options: { puissance: true },
            },
          },
          { formatInteractif: 'mathlive' },
        )
        handleAnswers(
          this,
          2 * i + 1,
          {
            reponse: {
              value: String(decPos[listeTypeDeQuestions[i] - 7].puissance_sup),
              options: { puissance: true },
            },
          },
          { formatInteractif: 'mathlive' },
        )
        texteCorr = `$${miseEnEvidence(decPos[listeTypeDeQuestions[i] - 7].puissance_inf)} \\leqslant ${decPos[listeTypeDeQuestions[i] - 7].val} \\leqslant ${miseEnEvidence(decPos[listeTypeDeQuestions[i] - 7].puissance_sup)}$`
        texteCorr += ` car $${decPos[listeTypeDeQuestions[i] - 7].puissance_inf} = ${decPos[listeTypeDeQuestions[i] - 7].puissance_inf_num}$ et $${decPos[listeTypeDeQuestions[i] - 7].puissance_sup} = ${decPos[listeTypeDeQuestions[i] - 7].puissance_sup_num}.$`
      } else {
        // nombre décimal positif inferieur à 1
        consigneAMC = `$\\dots\\dots\\dots${sp(1)}\\leqslant ${decPosInfUn[listeTypeDeQuestions[i] - 11].val}\\leqslant${sp(1)}\\dots\\dots\\dots$`
        texte = this.interactif
          ? ajouteChampTexteMathLive(
              this,
              2 * i,
              KeyboardType.clavierDeBaseAvecFractionPuissanceCrochets,
            ) +
            `$\\leqslant ${decPosInfUn[listeTypeDeQuestions[i] - 11].val}\\leqslant $` +
            ajouteChampTexteMathLive(
              this,
              2 * i + 1,
              KeyboardType.clavierDeBaseAvecFractionPuissanceCrochets,
            )
          : consigneAMC
        exposantInf = decPosInfUn[listeTypeDeQuestions[i] - 11].exposantInf
        exposantSup = decPosInfUn[listeTypeDeQuestions[i] - 11].exposantSup
        handleAnswers(
          this,
          2 * i,
          {
            reponse: {
              value: String(
                decPosInfUn[listeTypeDeQuestions[i] - 11].puissance_inf,
              ),
              options: { puissance: true },
            },
          },
          { formatInteractif: 'mathlive' },
        )
        handleAnswers(
          this,
          2 * i + 1,
          {
            reponse: {
              value: String(
                decPosInfUn[listeTypeDeQuestions[i] - 11].puissance_sup,
              ),
              options: { puissance: true },
            },
          },
          { formatInteractif: 'mathlive' },
        )
        texteCorr = `$${miseEnEvidence(decPosInfUn[listeTypeDeQuestions[i] - 11].puissance_inf)} \\leqslant ${decPosInfUn[listeTypeDeQuestions[i] - 11].val} \\leqslant ${miseEnEvidence(decPosInfUn[listeTypeDeQuestions[i] - 11].puissance_sup)}$`
        texteCorr += ` car $${decPosInfUn[listeTypeDeQuestions[i] - 11].puissance_inf} = ${decPosInfUn[listeTypeDeQuestions[i] - 11].puissance_inf_num}$ et $${decPosInfUn[listeTypeDeQuestions[i] - 11].puissance_sup} = ${decPosInfUn[listeTypeDeQuestions[i] - 11].puissance_sup_num}.$`
      }
      if (context.isAmc) {
        this.autoCorrectionAMC[i] = {
          enonce:
            "Encadrer le nombre suivant par deux puissances de 10 d'exposants consécutifs : " +
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
                    texte: 'Exposant de la puissance de 10 de gauche',
                    valeur: exposantInf,
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
                    texte: 'Exposant de la puissance de 10 de droite',
                    valeur: exposantSup,
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
