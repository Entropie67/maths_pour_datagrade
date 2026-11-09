import { BoiteBuilder } from '../../../lib/2d/BoiteBuilder'
import { fixeBordures } from '../../../lib/2d/fixeBordures'
import { FlecheBuilder } from '../../../lib/2d/fleches'
import { MetaInteractif2d } from '../../../lib/2d/interactif2d'
import { segment } from '../../../lib/2d/segmentsVecteurs'
import { latex2d } from '../../../lib/2d/textes'
import { bleuMathalea } from '../../../lib/colors'
import { ajouteFeedback } from '../../../lib/interactif/questionMathLive'
import { choice } from '../../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteEnCouleur,
} from '../../../lib/outils/embellissements'
import { range } from '../../../lib/outils/nombres'
import { context } from '../../../modules/context'
import { mathalea2d } from '../../../modules/mathalea2d'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Calculer des additions avec des sauts de $9$ ou $19$'
export const interactifReady = true

export const uuid = '1473f'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Jean-claude Lhote
 */
export default class Can2026CE2Q7 extends ExerciceCan {
  enonce(start?: number, saut?: number, step1?: number, step2?: number) {
    if (start == null || saut == null || step1 == null || step2 == null) {
      start = 100 + randint(1, 5) * 10 + randint(2, 7)
      saut = choice([9, 19])
      step1 = randint(1, 2)
      step2 = randint(step1 + 1, 3)
    }
    this.reponse = {
      field0: { value: start + saut * step1 },
      field1: { value: start + saut * step2 },
    }
    this.question = 'Compléter les cases vides'
    const trait = segment(-0.3, 0, 4.2, 0)
    const graduations = [0, 1, 2, 3, 4].map((i) => segment(i, -0.1, i, 0.1))
    const boxes = [
      new BoiteBuilder({
        xMin: step1 - 0.4,
        xMax: step1 + 0.4,
        yMin: -1,
        yMax: -0.2,
      }).render(),
      new BoiteBuilder({
        xMin: step2 - 0.4,
        xMax: step2 + 0.4,
        yMin: -1,
        yMax: -0.2,
      }).render(),
    ]
    const startNb = latex2d(String(start), 0, -0.5, { letterSize: 'small' })
    const inputs = new MetaInteractif2d(
      [
        {
          x: step1,
          y: -0.6,
          content: '%{champ1}',
          classe: 'numbers',
          blanc: '\\ldots',
          index: 0,
          opacity: 1,
        },
        {
          x: step2,
          y: -0.6,
          content: '%{champ1}',
          classe: 'numbers',
          blanc: '\\ldots',
          index: 1,
          opacity: 1,
        },
      ],
      { exercice: this, question: 0 },
    )

    const liste = range(step2 - 1).map((i) => {
      const maFleche = new FlecheBuilder({
        coords: [
          [i + 0.1, 0.3],
          [0.5, 1],
          [0.7, 1],
          [0.8, 0],
        ],
        color: 'orange',
        epaisseur: 2,
        styleLigne: 'curved',
        stylePointe: 'straight',
        scalePointe: 1.2,
        anglePointe: 5,
      }).make()
      return maFleche
    })
    const saut2d = latex2d(`+${saut}`, 0.4, 1.3, {
      color: 'black',
      letterSize: 'small',
    })
    const objets = [
      trait,
      ...graduations,
      ...boxes,
      startNb,
      inputs,
      ...liste.flat(),
      saut2d,
    ]
    const figure = mathalea2d(
      Object.assign({ pixelsParCm: 40 }, fixeBordures(objets)),
      objets,
    )
    this.canReponseACompleter = figure
    if (context.isHtml) {
      this.question +=
        this.canReponseACompleter +
        (context.isHtml
          ? `<span id="resultatCheckEx${this.numeroExercice}Q${0}"></span>${ajouteFeedback(this, 0)}`
          : '')
    }
    this.correction =
      `La première case contient : $${start}+${step1 === 1 ? String(saut) : `${step1}\\times ${saut}`}=${miseEnEvidence(start + saut * step1)}$ et la deuxième case contient : $${start}+${step2}\\times ${saut}=${miseEnEvidence(start + saut * step2)}$.<br>
    ` +
      texteEnCouleur(
        `Mentalement, pour ajouter $${saut}$, on peut ajouter $${saut + 1}$ puis retrancher $1$.`,
        bleuMathalea,
      )
  }

  nouvelleVersion() {
    this.formatInteractif = 'MetaInteractif2d'
    if (this.canOfficielle || this.sup) this.enonce(127, 9, 1, 2)
    else this.enonce()
  }
}
