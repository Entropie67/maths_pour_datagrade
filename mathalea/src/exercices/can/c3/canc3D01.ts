import { cercle } from '../../../lib/2d/cercle'
import { colorToLatexOrHTML } from '../../../lib/2d/colorToLatexOrHtml'
import { pointAbstrait } from '../../../lib/2d/PointAbstrait'
import { segment } from '../../../lib/2d/segmentsVecteurs'
import { rotation } from '../../../lib/2d/transformations'
import { amcConvert } from '../../../lib/amc/amcBuilders'
import { bleuMathalea } from '../../../lib/colors'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { context } from '../../../modules/context'
import { mathalea2d } from '../../../modules/mathalea2d'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = "Lire l'heure"
export const dateDePublication = '4/11/2021'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCHybride'

/**
 * @author Jean-claude Lhote
 */
export const uuid = '2ce11'

export const refs = {
  'fr-fr': ['canc3D01', '6M4autoA-flash1', '6AutoT1', 'CM1M6A', 'CM2M3A'],
  'fr-ch': ['NR'],
}
export default class LireHeure extends ExerciceSimple {
  constructor() {
    super()

    this.nbQuestions = 1
    this.besoinFormulaireCaseACocher = ["Avec des horaires de l'après-midi"]
    this.sup = false // Par défaut, non coché
    this.typeExercice = 'simple'
    this.formatChampTexte = KeyboardType.clavierHms
  }

  nouvelleVersion() {
    const horloge = []
    const O = pointAbstrait(0, 0)
    const C = cercle(O, 2)
    horloge.push(C)
    const s = segment(1.5, 0, 1.9, 0)
    for (let i = 0; i < 4; i++) {
      horloge.push(rotation(s, O, 90 * i))
    }
    const t = segment(1.7, 0, 1.9, 0)
    for (let i = 0; i < 4; i++) {
      horloge.push(rotation(t, O, 30 + i * 90), rotation(t, O, 60 + i * 90))
    }

    const isAfternoon = this.sup
      ? this.quotaRandint('isAfternoon', 0, 1) === 1
      : false
    const h = isAfternoon ? randint(1, 11) + 12 : randint(0, 11)
    const m = this.quotaRandint('m', 0, 11) * 5

    const alpha = 90 - (h % 12) * 30 - m / 2
    const beta = 90 - m * 6
    const grandeAiguille = rotation(segment(O, pointAbstrait(1.5, 0)), O, beta)
    const petiteAiguille = rotation(segment(O, pointAbstrait(1, 0)), O, alpha)
    grandeAiguille.color = context.isHtml
      ? colorToLatexOrHTML('red')
      : colorToLatexOrHTML('black')
    grandeAiguille.epaisseur = 2
    petiteAiguille.color = context.isHtml
      ? colorToLatexOrHTML(bleuMathalea)
      : colorToLatexOrHTML('black')
    petiteAiguille.epaisseur = 4
    horloge.push(petiteAiguille, grandeAiguille)

    const periode = isAfternoon ? "de l'après-midi" : 'du matin'
    this.question =
      `Quelle est l'heure ${periode} indiquée par cette horloge ? <br>
    
    ` +
      mathalea2d(
        {
          xmin: -3,
          ymin: -3,
          xmax: 3,
          ymax: 3,
          scale: 0.7,
          center: !context.isHtml,
        },
        horloge,
      )
    this.reponse = { reponse: { value: `${h}h ${m}`, options: { HMS: true } } }
    this.correction = `$${miseEnEvidence(`${h}\\text{ h }${m === 0 ? '' : m === 5 ? '0' + m : m}`)}$`
    if (context.isAmc) {
      this.autoCorrectionAMC = [
        {
          enonce: this.question,
          propositions: [
            {
              type: 'AMCNum',
              propositions: [
                {
                  texte: this.correction,
                  reponse: {
                    texte: 'heure',
                    valeur: [h],
                    param: {
                      digits: 2,
                      decimals: 0,
                      signe: false,
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
                  reponse: {
                    texte: 'minutes',
                    valeur: [m],
                    param: {
                      digits: 2,
                      decimals: 0,
                      signe: false,
                    },
                  },
                },
              ],
            },
          ],
        },
      ]
      this.questionsAMC = this.autoCorrectionAMC.map((questionAMC) =>
        amcConvert(questionAMC),
      )
    }

    this.canReponseACompleter = '$\\ldots$ h $\\ldots$ min'
  }
}
