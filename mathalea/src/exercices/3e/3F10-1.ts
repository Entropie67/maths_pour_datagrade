import { droiteParPointEtPente } from '../../lib/2d/droites'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { repere } from '../../lib/2d/reperes'
import { tracePoint } from '../../lib/2d/TracePoint'
import { propositionsQcm } from '../../lib/interactif/qcm'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { rangeMinMax } from '../../lib/outils/nombres'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const dateDeModifImportante = '01/11/2024'
export const interactifReady = true

export const amcReady = true
export const amcType = 'qcmMult'
export const titre =
  'Utiliser le vocabulaire et les notations des fonctions (généralités)'

/**
 * Répondre à des questions sur les fonctions.
 *
 * @author Jean-claude Lhote
 */
export const uuid = '0eecd'

export const refs = {
  'fr-fr': ['3F10-1', '2F10-1', 'BP2AutoO2'],
  'fr-ch': ['1mF1-4', '10LCFA3C-1', '10LSFA3C-1', '11CTFA2B-1'],
}
export default class VocabulaireNotationsFonctions extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Choix des questions',
      3,
      '1 : Vocabulaire\n2 : Notations \n3 : Mélange',
    ]
    this.besoinFormulaire2CaseACocher = [
      'Avec éventuellement un graphique',
      false,
    ]
    this.sup = 2
    this.spacing = 2
    this.nbQuestions = 3
    this.consigne = 'Cocher toutes les réponses correctes.'
  }

  nouvelleVersion() {
    let typesDeQuestionsDisponibles
    const r = repere({ xMin: -10, xMax: 10, yMin: -10, yMax: 10 })
    switch (this.sup) {
      case 1: // vocabulaire
        typesDeQuestionsDisponibles = ['vocabulaire']
        break
      case 2: // notations
        typesDeQuestionsDisponibles = ['notations']
        break
      case 3: // mélange vocabulaire et notations
      default:
        typesDeQuestionsDisponibles = ['vocabulaire', 'notations']
        break
    }
    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )
    const sousChoix = combinaisonListes(rangeMinMax(0, 4), this.nbQuestions) // pour choisir aléatoirement des questions dans chaque catégorie
    for (
      let i = 0,
        x,
        y,
        m,
        d,
        A,
        reponses: [string, boolean][][] = [],
        monQcm,
        cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      this.autoCorrection[i] = {}
      let texte = ''
      let texteCorr = ''
      let enonce = ''
      // on ne choisit que des nombres compris entre 1 et 20
      x = randint(-9, 9, [0, 1, -1])
      y = randint(-9, 9, x)
      switch (listeTypeDeQuestions[i]) {
        case 'vocabulaire':
          switch (sousChoix[i]) {
            case 0:
              enonce = `$f$ est la fonction qui à $${x}$ associe $${y}$, alors pour la fonction $f$ :`
              break
            case 1:
              enonce = `$${x}$ a pour image $${y}$ par la fonction $f$, alors pour la fonction $f$ :`
              break
            case 2:
              enonce = `$${y}$ a pour antécédent $${x}$ par la fonction $f$, alors pour la fonction $f$ :`
              break
            case 3:
              enonce = `L'image de $${x}$ par la fonction $f$ est $${y}$, alors pour la fonction $f$ :`
              break
            case 4:
            default:
              enonce = `$${y}$ est l'image de $${x}$ par la fonction $f$, alors pour la fonction $f$ :`
              break
          }
          reponses[i] = [
            [`$${x}$ est un antécédent de $${y}$.`, true],
            [`$${x}$ est l'image de $${y}$.`, false],
            [`$${y}$ est un antécédent de $${x}$.`, false],
            [`$${y}$ est l'image de $${x}$.`, true],
          ]
          break

        case 'notations':
        default:
          if (!this.sup2 && sousChoix[i] === 3)
            sousChoix[i] = choice([0, 1, 2, 4])
          switch (sousChoix[i]) {
            case 0:
              enonce = `On sait que $f(${x})=${y}$, alors pour la fonction $f$ :`
              reponses[i] = [
                [`$${x}$ est un antécédent de $${y}$.`, true],
                [`$${x}$ est l'image de $${y}$.`, false],
                [`$${y}$ est un antécédent de $${x}$.`, false],
                [`$${y}$ est l'image de $${x}$.`, true],
              ]
              break
            case 1:
              enonce = `$f : ${x} \\longmapsto ${y}$, alors pour la fonction $f$ :`
              reponses[i] = [
                [`$${x}$ est un antécédent de $${y}$.`, true],
                [`$${x}$ est l'image de $${y}$.`, false],
                [`$${y}$ est un antécédent de $${x}$.`, false],
                [`$${y}$ est l'image de $${x}$.`, true],
              ]
              break
            case 2:
              enonce = `Pour $x=${x}$, $f(x)=${y}$, alors pour la fonction $f$ :`
              reponses[i] = [
                [`$${x}$ est un antécédent de $${y}$.`, true],
                [`$${x}$ est l'image de $${y}$.`, false],
                [`$${y}$ est un antécédent de $${x}$.`, false],
                [`$${y}$ est l'image de $${x}$.`, true],
              ]
              break
            case 3:
              A = pointAbstrait(x, y)
              d = droiteParPointEtPente(A, randint(-4, 4, 0) / 2, '', 'red')
              enonce =
                'La fonction $f$ est représentée par la droite rouge ci-dessous.<br>'
              enonce +=
                mathalea2d(
                  {
                    xmin: -10,
                    ymin: -10,
                    xmax: 10,
                    ymax: 10,
                    pixelsParCm: 15,
                    scale: 0.5,
                  },
                  r,
                  d,
                  tracePoint(A),
                ) + '<br>Alors pour la fonction $f$ :'
              reponses[i] = [
                [`$${x}$ est un antécédent de $${y}$.`, true],
                [`$${x}$ est l'image de $${y}$.`, false],
                [`$${y}$ est un antécédent de $${x}$.`, false],
                [`$${y}$ est l'image de $${x}$.`, true],
              ]
              break
            case 4:
            default:
              m = randint(-9, 9, [x, y])
              enonce = `On sait que $f(${x})=f(${y})=${m}$, alors pour la fonction $f$ :`
              reponses[i] = [
                [`$${x}$ et $${y}$ sont des antécédents de $${m}$.`, true],
                [`$${m}$ est l'image de $${x}$ et de $${y}$.`, true],
                [`$${x}$ et $${y}$ sont des images de $${m}$.`, false],
                [`$${m}$ est un antécédent de $${x}$ et $${y}$.`, false],
              ]
              break
          }
          break
      }
      this.autoCorrection[i] = {
        enonce,
        options: { ordered: false, vertical: true },
        propositions: [],
      }
      for (let k = 0; k < reponses[i].length; k++) {
        this.autoCorrection[i].propositions?.push({
          texte: reponses[i][k][0],
          statut: reponses[i][k][1],
        })
      }
      monQcm = propositionsQcm(this, i)
      if (!context.isAmc) {
        texte = enonce + monQcm.texte
        texteCorr = enonce + monQcm.texteCorr
      } else {
        texte = enonce
        texteCorr = ''
      }

      if (
        this.questionJamaisPosee(i, listeTypeDeQuestions[i], x, y, sousChoix[i])
      ) {
        // Si la question n'a jamais été posée, on en créé une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
