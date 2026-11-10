// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 6d6ea continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { repere, type RepereOptions } from '../../lib/2d/reperes'
import { latex2d } from '../../lib/2d/textes'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { context } from '../../modules/context'

import { courbe } from '../../lib/2d/Courbe'
import { bleuMathalea } from '../../lib/colors'
import { deuxColonnes } from '../../lib/format/miseEnPage'
import { mathalea2d, type Mathalea2DOptions } from '../../modules/mathalea2d'
import { randint } from '../../modules/outils'
import ExerciceQcmA from '../ExerciceQcmA'
export const dateDePublication = '04/10/2025'
export const uuid = '6d6ea'
/**
 *
 * @author Gilles Mora factorisation du code par Claude
 */
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre =
  'Résoudre graphiquement une inéquation du type $f(x)<g(x)$ (1)'
type CasConfig = {
  f: (x: number) => number
  g: (x: number) => number
  repere: RepereOptions
  mathalea: Mathalea2DOptions
  domaine: string
  curveMin: number
  curveMax: number
  labelPositions: { Cf: [number, number]; Cg: [number, number] }
  solutions: Record<string, string[]>
}

const casConfigs: Record<number, CasConfig> = {
  1: {
    f: (x: number) =>
      (-1 / 3) * x ** 3 + (2 / 3) * x ** 2 + (4 / 3) * x - 2 / 3,
    g: (x: number) => x,
    repere: {
      xMin: -3,
      yMin: -3,
      yMax: 4,
      xMax: 4,
      xLabelMin: -2,
      xLabelMax: 3,
      yLabelMax: 3,
      yLabelMin: -2,
      grilleSecondaireXDistance: 2,
    },
    mathalea: { xmin: -3, xmax: 4, ymin: -3, ymax: 4 },
    domaine: '[-2\\,;\\,3]',
    curveMin: -2,
    curveMax: 3,
    labelPositions: { Cf: [-2, 2.5], Cg: [3.5, 3] },
    solutions: {
      '<': [
        ']-1\\,;\\,1[\\cup ]2\\,;\\,3]',
        ']-1\\,;\\,1[\\cup ]2\\,;\\,3[',
        '[-1\\,;\\,1]',
        '[-2\\,;\\,-1[\\cup]1\\,;\\,2[',
      ],
      '>': [
        '[-2\\,;\\,-1[\\cup ]1\\,;\\,2[',
        ']-2\\,;\\,-1[\\cup ]1\\,;\\,2[',
        '[-2\\,;\\,-1]\\cup [1\\,;\\,2]',
        ']-1\\,;\\,1[\\cup ]2\\,;\\,3]',
      ],
      '\\leqslant': [
        '[-1\\,;\\,1]\\cup [2\\,;\\,3]',
        ']-1\\,;\\,1[\\cup ]2\\,;\\,3[',
        '[-1\\,;\\,1]',
        '[-2\\,;\\,-1]\\cup [1\\,;\\,2]',
      ],
      '\\geqslant': [
        '[-2\\,;\\,-1]\\cup [1\\,;\\,2]',
        ']-2\\,;\\,-1[\\cup ]1\\,;\\,2[',
        '[-1\\,;\\,1]\\cup [2\\,;\\,3]',
        '[1\\,;\\,2]',
      ],
    },
  },
  2: {
    f: (x: number) => (1 / 3) * x ** 3 - (2 / 3) * x ** 2 - (4 / 3) * x + 2 / 3,
    g: (x: number) => -x,
    repere: {
      xMin: -4,
      yMin: -4,
      yMax: 3,
      xMax: 4,
      xLabelMin: -2,
      xLabelMax: 3,
      yLabelMax: 2,
      yLabelMin: -3,
      grilleSecondaireXDistance: 2,
    },
    mathalea: { xmin: -3, xmax: 4, ymin: -4, ymax: 3 },
    domaine: '[-2\\,;\\,3]',
    curveMin: -2,
    curveMax: 3,
    labelPositions: { Cf: [-2.5, -1.5], Cg: [3.5, -3] },
    solutions: {
      '<': [
        '[-2\\,;\\,-1[\\cup ]1\\,;\\,2[',
        ']-1\\,;\\,1[\\cup ]2\\,;\\,3]',
        '[-2\\,;\\,-1]\\cup [1\\,;\\,2]',
        ']-1\\,;\\,1[\\cup ]2\\,;\\,3[',
      ],
      '>': [
        ']-1\\,;\\,1[\\cup ]2\\,;\\,3]',
        ']-1\\,;\\,1[\\cup ]2\\,;\\,3[',
        '[-2\\,;\\,-1[\\cup ]1\\,;\\,2[',
        ']-1\\,;\\,1[',
      ],
      '\\leqslant': [
        '[-2\\,;\\,-1]\\cup [1\\,;\\,2]',
        '[-1\\,;\\,1]\\cup [2\\,;\\,3]',
        '[-2\\,;\\,-1[\\cup ]1\\,;\\,2[',
        '[-2\\,;\\,-1]',
      ],
      '\\geqslant': [
        '[-1\\,;\\,1]\\cup [2\\,;\\,3]',
        ']-1\\,;\\,1[\\cup ]2\\,;\\,3]',
        '[-2\\,;\\,-1]\\cup [1\\,;\\,2]',
        '[-1\\,;\\,1]',
      ],
    },
  },
  3: {
    f: (x: number) =>
      (-1 / 3) * (x - 1) ** 3 +
      (2 / 3) * (x - 1) ** 2 +
      (4 / 3) * (x - 1) -
      2 / 3,
    g: (x: number) => x - 1,
    repere: {
      xMin: -2,
      yMin: -3,
      yMax: 4,
      xMax: 5,
      xLabelMin: -1,
      xLabelMax: 4,
      yLabelMax: 3,
      yLabelMin: -2,
      xThickMax: 5,
      grilleSecondaireXDistance: 1,
    },
    mathalea: { xmin: -2, xmax: 5, ymin: -3, ymax: 4 },
    domaine: '[-3\\,;\\,4]',
    curveMin: -1,
    curveMax: 4,
    labelPositions: { Cf: [-1.5, 2], Cg: [4.5, 3] },
    solutions: {
      '<': [
        ']0\\,;\\,2[\\cup ]3\\,;\\,4]',
        ']0\\,;\\,2[\\cup ]3\\,;\\,4[',
        '[0\\,;\\,2]',
        '[-1\\,;\\,0[\\cup]2\\,;\\,3[',
      ],
      '>': [
        '[-1\\,;\\,0[\\cup ]2\\,;\\,3[',
        ']-1\\,;\\,0[\\cup ]2\\,;\\,3[',
        '[-1\\,;\\,0]\\cup [2\\,;\\,3]',
        ']0\\,;\\,2[\\cup ]3\\,;\\,4]',
      ],
      '\\leqslant': [
        '[0\\,;\\,2]\\cup [3\\,;\\,4]',
        ']0\\,;\\,2[\\cup ]3\\,;\\,4[',
        '[0\\,;\\,2]',
        '[-1\\,;\\,0]\\cup [2\\,;\\,3]',
      ],
      '\\geqslant': [
        '[-1\\,;\\,0]\\cup [2\\,;\\,3]',
        ']-1\\,;\\,0[\\cup ]2\\,;\\,3[',
        '[0\\,;\\,2]\\cup [3\\,;\\,4]',
        '[2\\,;\\,3]',
      ],
    },
  },

  4: {
    f: (x: number) =>
      (-1 / 3) * (x + 1) ** 3 +
      (2 / 3) * (x + 1) ** 2 +
      (4 / 3) * (x + 1) -
      2 / 3,
    g: (x: number) => x + 1,
    repere: {
      xMin: -4,
      yMin: -3,
      yMax: 4,
      xMax: 3,
      xLabelMin: -3,
      xLabelMax: 3,
      yLabelMax: 3,
      yLabelMin: -2,
      grilleSecondaireXDistance: 1,
    },
    mathalea: { xmin: -4, xmax: 3, ymin: -3, ymax: 4 },
    domaine: '[-3\\,;\\,2]',
    curveMin: -3,
    curveMax: 2,
    labelPositions: { Cf: [-3.5, 2], Cg: [2.5, 3] },
    solutions: {
      '<': [
        ']-2\\,;\\,0[\\cup ]1\\,;\\,2]',
        ']-2\\,;\\,0[',
        '[-3\\,;\\,-2[\\cup ]0\\,;\\,1[',
        '[-2\\,;\\,0]\\cup [1\\,;\\,2]',
      ],
      '>': [
        '[-3\\,;\\,-2[\\cup ]0\\,;\\,1[',
        '[-3\\,;\\,-2]\\cup [0\\,;\\,1]',
        '[-2\\,;\\,0]\\cup [1\\,;\\,2]',
        ']-2\\,;\\,0[\\cup ]1\\,;\\,2]',
      ],
      '\\leqslant': [
        '[-2\\,;\\,0]\\cup [1\\,;\\,2]',
        '[-2\\,;\\,0]',
        '[-3\\,;\\,-2]\\cup [0\\,;\\,1]',
        ']-2\\,;\\,0[\\cup ]1\\,;\\,2[',
      ],
      '\\geqslant': [
        '[-3\\,;\\,-2]\\cup [0\\,;\\,1]',
        ']-3\\,;\\,-2[\\cup ]0\\,;\\,1[',
        '[-2\\,;\\,0]\\cup [1\\,;\\,2]',
        '[-3\\,;\\,-2]',
      ],
    },
  },
}
const textesSolutions: Record<string, string> = {
  '<': 'en dessous de',
  '>': 'au-dessus de',
  '\\leqslant': 'en dessous ou sur',
  '\\geqslant': 'au-dessus ou sur',
}

const symbolesMap: Record<number, string> = {
  1: '<',
  2: '>',
  3: '\\leqslant',
  4: '\\geqslant',
}

export default class auto1AF4dOld extends ExerciceQcmA {
  versionOriginale = () => {
    const o = latex2d('\\text{O}', -0.3, -0.3, { letterSize: 'scriptsize' })
    const config = casConfigs[1]

    const C = latex2d('C_f', 3.5, config.f(3), { color: bleuMathalea })
    const D = latex2d('C_g', 3.5, config.g(3), { color: 'red' })
    const r = repere({
      yUnite: 1,
      xUnite: 1,
      ...config.repere,
      thickHauteur: 0.2,
      xThickMin: -4,
      grilleXDistance: 1,
      grilleSecondaire: true,
      grilleSecondaireOpacite: 1,
      grilleSecondaireYDistance: 1,
      yThickMin: -5,
      axesEpaisseur: 2,
      grilleSecondaireYMin: -5.1,
      grilleSecondaireYMax: 5.1,
      grilleSecondaireXMin: -5.1,
      grilleSecondaireXMax: 5.1,
      xLabelEcart: 0.6,
      yLabelEcart: 0.6,
    })

    this.enonce = `${deuxColonnes(
      `Sur la figure ci-contre, $C_f$ et $C_g$ représentent respectivement les fonctions $f$ et $g$ définies sur $${config.domaine}$.<br>`,
      mathalea2d(
        {
          ...config.mathalea,
          pixelsParCm: 40,
          scale: 1,
          center: !context.isHtml,
        },
        r,
        o,
        C,
        D,
        courbe(config.f, {
          repere: r,
          xMin: config.curveMin,
          xMax: config.curveMax,
          color: bleuMathalea,
          epaisseur: 2,
        }),
        courbe(config.g, {
          repere: r,
          xMin: config.curveMin,
          xMax: config.curveMax,
          color: 'red',
          epaisseur: 2,
        }),
      ),
    )}`

    this.enonce +=
      "L'ensemble des solutions de l'inéquation $g(x)\\leqslant f(x)$ est : "
    this.reponses = [
      `$[-2\\,;\\,-1]\\cup [1\\,;\\,2]$`,
      `$[-2\\,;\\,-1]$`,
      `$[1\\,;\\,2]$`,
      `$[-2\\,;\\,-1]\\cap [1\\,;\\,2]$`,
    ]
    this.correction = `Les solutions de l'inéquation sont les abscisses respectives des points de $C_g$ qui se situent en dessous de $C_f$ ou sur $C_f$, soit $${miseEnEvidence(`[-2\\,;\\,-1]\\cup [1\\,;\\,2]`)}$.`
  }

  versionAleatoire = () => {
    const cas = randint(1, 4)
    const typeInequation = randint(1, 4)
    const config = casConfigs[cas]
    const symbole = symbolesMap[typeInequation]
    const solutions = config.solutions[symbole]

    const o = latex2d('\\text{O}', -0.3, -0.3, { letterSize: 'scriptsize' })
    const C = latex2d(
      'C_f',
      config.labelPositions.Cf[0],
      config.labelPositions.Cf[1],
      { color: bleuMathalea },
    )
    const D = latex2d(
      'C_g',
      config.labelPositions.Cg[0],
      config.labelPositions.Cg[1],
      { color: 'red' },
    )

    const r = repere({
      yUnite: 1,
      xUnite: 1,
      ...config.repere,
      thickHauteur: 0.2,
      xThickMin: -4,
      grilleXDistance: 1,
      grilleSecondaire: true,
      grilleSecondaireOpacite: 1,
      grilleSecondaireYDistance: 1,
      yThickMin: -5,
      axesEpaisseur: 2,
      grilleSecondaireYMin: -5.1,
      grilleSecondaireYMax: 5.1,
      grilleSecondaireXMin: -5.1,
      grilleSecondaireXMax: 5.1,
      xLabelEcart: 0.6,
      yLabelEcart: 0.6,
    })

    this.enonce = `${deuxColonnes(
      `Sur la figure ci-contre, $C_f$ et $C_g$ représentent respectivement les fonctions $f$ et $g$ définies sur $${config.domaine}$.<br>`,
      mathalea2d(
        {
          ...config.mathalea,
          pixelsParCm: 40,
          scale: 1,
          center: !context.isHtml,
        },
        r,
        o,
        C,
        D,
        courbe(config.f, {
          repere: r,
          xMin: config.curveMin,
          xMax: config.curveMax,
          color: bleuMathalea,
          epaisseur: 2,
        }),
        courbe(config.g, {
          repere: r,
          xMin: config.curveMin,
          xMax: config.curveMax,
          color: 'red',
          epaisseur: 2,
        }),
      ),
    )}`

    this.enonce += `L'ensemble des solutions de l'inéquation $f(x)${symbole} g(x)$ est : `
    this.reponses = solutions.map((s) => `$${s}$`)
    this.correction = `Les solutions de l'inéquation sont les abscisses respectives des points de $C_f$ qui se situent ${textesSolutions[symbole]} $C_g$, soit $${miseEnEvidence(solutions[0])}$.`
  }

  constructor() {
    super()
    this.versionAleatoire()
  }
}
