import { amcConvert } from '../../lib/amc/amcBuilders'
import { propositionsQcm } from '../../lib/interactif/qcm'
import {
  choice,
  combinaisonListes,
  shuffle2tableaux,
} from '../../lib/outils/arrayOutils'
import { texFractionFromString } from '../../lib/outils/deprecatedFractions'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { troncature } from '../../lib/outils/nombres'
import { sp } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

/**
 * Calcule le cosinus d'un angle en degrés
 */
function degCos(deg: number): number {
  return Math.cos((deg * Math.PI) / 180)
}

export const amcReady = true
export const amcType = 'qcmMult'
export const interactifReady = true

export const titre = 'Arrondir une valeur'

/**
 * * Encadrer_puis_arrondir_une_valeur
 * @author Mireille Gain, s'inspirant de 6N31-1 de Sébastien Lozano
 * Ajout Nouvel AMC : Janvier 2022 par EE
 */

export const uuid = 'ab793'

export const refs = {
  'fr-fr': ['6N1K', 'BP2AutoS7'],
  'fr-2016': ['6N31-3', 'BP2AutoS7'],
  'fr-ch': ['PR-40', '9R1NO2D-10', '9R2NO2D-10', '9R3NO2D-10', 'PRQNO05A-13'],
}
export default class ArrondirUneValeur6e extends Exercice {
  version: number
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Type de nombres',
      2,
      ' 1 : Nombres décimaux\n 2 : Fractions',
    ]
    this.besoinFormulaire2Numerique = [
      'Choix de sortie AMC',
      2,
      ' 1 : QCM\n 2 : Question ouverte',
    ]
    this.nbQuestions = 3
    this.sup = 1
    this.sup2 = 1
    this.spacingCorr = context.isHtml ? 2.5 : 1
    this.version = 6
  }

  nouvelleVersion() {
    if (this.version === 3) {
      this.sup = 3
    } else if (this.version === 4) {
      this.sup = 4
    }
    if (this.version === 2) {
      this.sup = 5
    }
    if (this.sup === 2 && !context.isHtml) {
      this.spacingCorr = 2.5
      this.spacing = 1.5
    }
    this.amcType = this.sup2 === 1 ? 'qcmMono' : 'AMCHybride'
    this.spacing = this.interactif && this.sup === 2 ? 3 : 1

    if (!context.isAmc && !this.interactif) {
      this.consigne = 'Encadrer '
      this.consigne += this.nbQuestions > 1 ? 'chaque' : 'ce'
      this.consigne +=
        " nombre à l'unité, puis au dixième, puis au centième.<br>Dans chaque cas, mettre ensuite en évidence son arrondi."
    } else {
      this.consigne =
        `Quels sont les encadrements où la valeur orange est la valeur arrondie du nombre à l'unité, au dixième et au centième${sp()}?`
    }

    let m,
      c,
      d,
      u,
      di,
      ci,
      mi,
      me,
      ce,
      de,
      n,
      den,
      num,
      nb,
      nbSansDegree,
      rac,
      angle,
      v
    const listeTypeDeQuestion =
      this.sup < 5
        ? combinaisonListes([this.sup], this.nbQuestions)
        : combinaisonListes([1, 2, 3, 4], this.nbQuestions)
    for (
      let i = 0, texte = '', texteCorr = '', cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      const tabrep = []
      const tabicone = []
      const preTabRep = []
      let preTabIcone = []
      this.autoCorrection[i] = {}
      switch (listeTypeDeQuestion[i]) {
        case 1: // arrondir un nombre simplement
          m = randint(0, 9)
          c = randint(0, 9)
          d = randint(0, 9)
          u = randint(2, 9)
          di = randint(1, 9)
          ci = randint(1, 9)
          mi = randint(1, 9, 5)
          me = randint(0, 1)
          ce = randint(0, 1)
          de = randint(0, 1)
          n =
            me * m * 1000 +
            ce * c * 100 +
            de * d * 10 +
            u * 1 +
            di * 0.1 +
            ci * 0.01 +
            mi * 0.001
          nb = texNombre(n)
          texte = `$${nb}$`
          break
        case 2: // arrondir une fraction
          den = choice([7, 9, 11, 13])
          num = randint(
            1,
            50,
            [
              7, 9, 11, 13, 14, 18, 21, 22, 26, 27, 28, 33, 35, 36, 39, 42, 44,
              45, 49,
            ],
          )
          n = num / den
          nb = texFractionFromString(num, den)
          di = 10 * troncature(n - troncature(n, 0), 1)
          ci = 100 * troncature(n - troncature(n, 1), 2)
          mi = 1000 * troncature(n - troncature(n, 2), 3)
          texte = ` $${nb}$${sp(10)}(Quand on écrit sur la calculatrice $${num}\\div ${den}$, elle renvoie${sp()}: $${texNombre(n)}$.)`
          break
        case 3: // arrondir une racine carrée
          rac = randint(
            2,
            300,
            [
              4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144, 169, 196, 225, 256,
              289,
            ],
          )
          rac = choice([2, 28, 14, 15])
          n = Math.sqrt(rac)
          nb = `\\sqrt{${rac}}`
          di = 10 * troncature(n - troncature(n, 0), 1)
          ci = 100 * troncature(n - troncature(n, 1), 2)
          mi = 1000 * troncature(n - troncature(n, 2), 3)
          texte = ` $${nb}$${sp(10)}(Quand on écrit sur la calculatrice $${nb}$, elle renvoie${sp()}: $${texNombre(n)}$.)`
          break
        case 4: // arrondir un calcul de longueur avec un cosinus
        default:
          v = randint(11, 99) / 10
          angle = randint(1, 89, 60)
          if (choice([true, false])) {
            n = v * degCos(angle)
            nb = `${texNombre(v)}\\cos(${angle}^\\circ)`
            di = 10 * troncature(n - troncature(n, 0), 1)
            ci = 100 * troncature(n - troncature(n, 1), 2)
            mi = 1000 * troncature(n - troncature(n, 2), 3)
            nbSansDegree = nb.replace('^\\circ', '')
          } else {
            // arrondir un calcul de longueur avec une division par cosinus
            n = v / degCos(angle)
            nb = `\\dfrac{${texNombre(v)}}{\\cos(${angle}^\\circ)}`
            nbSansDegree = nb.replace('^\\circ', '')
            di = 10 * troncature(n - troncature(n, 0), 1)
            ci = 100 * troncature(n - troncature(n, 1), 2)
            mi = 1000 * troncature(n - troncature(n, 2), 3)
          }
          texte = ` $${nb}$${sp(10)}(Quand on écrit sur la calculatrice $${nbSansDegree}$, elle renvoie${sp()}: $${texNombre(n)}$.)`
          break
      }

      texteCorr = `Encadrement et arrondi à l'unité${sp()}: `
      if (di < 5) {
        texteCorr += `$\\phantom{1234567}${miseEnEvidence(texNombre(troncature(n, 0)))} < ${nb} < ${texNombre(troncature(n + 1, 0))}$`
        preTabRep[0] = `$${miseEnEvidence(texNombre(troncature(n, 0)))} < ${nb} < ${texNombre(troncature(n + 1, 0))}$`
        preTabRep[1] = `$${texNombre(troncature(n, 0))} < ${nb} < ${miseEnEvidence(texNombre(troncature(n + 1, 0)))}$`
        preTabIcone = [true, false]
        if (choice([false, true])) {
          shuffle2tableaux(preTabRep, preTabIcone)
        }
        tabrep.push(preTabRep[0], preTabRep[1])
        tabicone.push(preTabIcone[0], preTabIcone[1])
      } else {
        texteCorr += `$\\phantom{1234567}${texNombre(troncature(n, 0))} < ${nb} < ${miseEnEvidence(texNombre(troncature(n + 1, 0)))}$`
        preTabRep[0] = `$${texNombre(troncature(n, 0))} < ${nb} < ${miseEnEvidence(texNombre(troncature(n + 1, 0)))}$`
        preTabRep[1] = `$${miseEnEvidence(texNombre(troncature(n, 0)))} < ${nb} < ${texNombre(troncature(n + 1, 0))}$`
        preTabIcone = [true, false]
        if (choice([false, true])) {
          shuffle2tableaux(preTabRep, preTabIcone)
        }
        tabrep.push(preTabRep[0], preTabRep[1])
        tabicone.push(preTabIcone[0], preTabIcone[1])
      }

      texteCorr += `<br>Encadrement et arrondi au dixième${sp()}: `
      if (ci < 5) {
        texteCorr += `$\\phantom{123}${miseEnEvidence(texNombre(troncature(n, 1)))} < ${nb} < ${texNombre(troncature(n + 0.1, 1))}$`
        preTabRep[0] = `$${miseEnEvidence(texNombre(troncature(n, 1)))} < ${nb} < ${texNombre(troncature(n + 0.1, 1))}$`
        preTabRep[1] = `$${texNombre(troncature(n, 1))} < ${nb} < ${miseEnEvidence(texNombre(troncature(n + 0.1, 1)))}$`
        preTabIcone = [true, false]
        if (choice([false, true])) {
          shuffle2tableaux(preTabRep, preTabIcone)
        }
        tabrep.push(preTabRep[0], preTabRep[1])
        tabicone.push(preTabIcone[0], preTabIcone[1])
      } else {
        texteCorr += `$\\phantom{123}${texNombre(troncature(n, 1))} < ${nb} < ${miseEnEvidence(texNombre(troncature(n + 0.1, 1)))}$`
        preTabRep[0] = `$${texNombre(troncature(n, 1))} < ${nb} < ${miseEnEvidence(texNombre(troncature(n + 0.1, 1)))}$`
        preTabRep[1] = `$${miseEnEvidence(texNombre(troncature(n, 1)))} < ${nb} < ${texNombre(troncature(n + 0.1, 1))}$`
        preTabIcone = [true, false]
        if (choice([false, true])) {
          shuffle2tableaux(preTabRep, preTabIcone)
        }
        tabrep.push(preTabRep[0], preTabRep[1])
        tabicone.push(preTabIcone[0], preTabIcone[1])
      }

      texteCorr += `<br>Encadrement et arrondi au centième${sp()}:  `
      if (mi < 5) {
        texteCorr += `$${miseEnEvidence(texNombre(troncature(n, 2)))} < ${nb} < ${texNombre(troncature(n + 0.01, 2))}$`
        preTabRep[0] = `$${miseEnEvidence(texNombre(troncature(n, 2)))} < ${nb} < ${texNombre(troncature(n + 0.01, 2))}$`
        preTabRep[1] = `$${texNombre(troncature(n, 2))} < ${nb} < ${miseEnEvidence(texNombre(troncature(n + 0.01, 2)))}$`
        preTabIcone = [true, false]
        if (choice([false, true])) {
          shuffle2tableaux(preTabRep, preTabIcone)
        }
        tabrep.push(preTabRep[0], preTabRep[1])
        tabicone.push(preTabIcone[0], preTabIcone[1])
      } else {
        texteCorr += `$${texNombre(troncature(n, 2))} < ${nb} < ${miseEnEvidence(texNombre(troncature(n + 0.01, 2)))}$`
        preTabRep[0] = `$${texNombre(troncature(n, 2))} < ${nb} < ${miseEnEvidence(texNombre(troncature(n + 0.01, 2)))}$`
        preTabRep[1] = `$${miseEnEvidence(texNombre(troncature(n, 2)))} < ${nb} < ${texNombre(troncature(n + 0.01, 2))}$`
        preTabIcone = [true, false]
        if (choice([false, true])) {
          shuffle2tableaux(preTabRep, preTabIcone)
        }
        tabrep.push(preTabRep[0], preTabRep[1])
        tabicone.push(preTabIcone[0], preTabIcone[1])
      }
      if (!context.isAmc || (context.isAmc && this.sup2 === 1)) {
        this.autoCorrection[i].enonce =
          `Quels sont les encadrements où la valeur orange est l'arrondi de ${texte} ?\\\\ \n Réponses possibles`
        this.autoCorrection[i].options = { vertical: true, ordered: true }
        this.autoCorrection[i].propositions = [
          {
            texte: tabrep[0],
            statut: tabicone[0],
            feedback: '',
          },
          {
            texte: tabrep[1],
            statut: tabicone[1],
            feedback: '',
          },
          {
            texte: tabrep[2],
            statut: tabicone[2],
            feedback: '',
          },
          {
            texte: tabrep[3],
            statut: tabicone[3],
            feedback: '',
          },
          {
            texte: tabrep[4],
            statut: tabicone[4],
            feedback: '',
          },
          {
            texte: tabrep[5],
            statut: tabicone[5],
            feedback: '',
          },
        ]
      }
      /* if (!context.isAmc) { // Cette façon de faire est totalement désuette... propositionQcm factorise le qcm et sa correction
        texte += '<br><br>Réponses possibles : <br>  '
        texteCorr = ''
        for (let i = 0; i < 6; i++) {
          texte += `$\\square\\;$ ${tabrep[i]}<br>`
          if (tabicone[i] === true) {
            texteCorr += `$\\blacksquare\\;$ ${tabrep[i]}<br>`
          } else {
            texteCorr += `$\\square\\;$ ${tabrep[i]}<br>`
          }
        }
      } */
      if (context.isAmc && this.sup2 !== 1) {
        this.autoCorrectionAMC[i] = {
          enonce: `On s en moque${sp()}!`,
          enonceAvant: false,
          propositions: [
            {
              type: 'AMCOpen',
              propositions: [
                // @ts-ignore
                {
                  enonce:
                    'Encadrer ' +
                    texte +
                    " à l'unité et entourer son arrondi à l'unité.",
                  statut: 1,
                },
              ],
            },
            {
              type: 'AMCOpen',
              propositions: [
                // @ts-ignore
                {
                  enonce:
                    'Encadrer ' +
                    texte +
                    ' au dixième et entourer son arrondi au dixième.',
                  statut: 1,
                },
              ],
            },
            {
              type: 'AMCOpen',
              propositions: [
                // @ts-ignore
                {
                  enonce:
                    'Encadrer ' +
                    texte +
                    ' au centième et entourer son arrondi au centième.',
                  statut: 1,
                },
              ],
            },
          ],
        }
        this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
      }
      if (this.questionJamaisPosee(i, di, ci, mi)) {
        // Si la question n'a jamais été posée, on en créé une autre
        if (this.interactif) {
          const props = propositionsQcm(this, i)
          texte += props.texte
        }
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        tabrep.length = 0
        tabicone.length = 0
        i++ // On passe à la question suivante
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
