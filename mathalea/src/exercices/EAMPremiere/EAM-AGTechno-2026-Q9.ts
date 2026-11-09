import RepereBuilder from '../../lib/2d/RepereBuilder'
import { tableauDeVariation } from '../../lib/mathFonctions/etudeFonction'
import { spline } from '../../lib/mathFonctions/Spline'
import type {
  CelluleSigne,
  LigneSigne,
  TableauSVConfig,
} from '../../lib/interactif/tableauSignesVariations/types'
import { choice } from '../../lib/outils/arrayOutils'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { randint } from '../../modules/outils'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import ExerciceQcmACourt, { genereTableauxDeSignes } from '../ExerciceQcmACourt'

export const uuid = '9daa5'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = "Retrouver le tableau de signes d'une fonction"
export const dateDePublication = '29/06/2026'
export const dateDeModifImportante = '22/10/2026'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Jean-Claude Lhote
 *
 */
export default class AutoQ9AGt2026 extends ExerciceQcmACourt {
  private bornes: [number, number] = [0, 0]
  private racine = 0
  private signeAGauche: '+' | '-' = '+'

  private appliquerLesValeurs(params: {
    zeroDerivee1: number
    minMax1: number
    racine: number
    zeroDerivee2: number
    minMax2: number
    image0: number
    borneInf: number
    borneSup: number
    imageInf: number
    imageSup: number
  }): void {
    const inf = params.borneInf
    const sup = params.borneSup
    const mM1 = params.minMax1
    const zD1 = params.zeroDerivee1
    const zD2 = params.zeroDerivee2
    const mM2 = params.minMax2
    const rac = params.racine
    const f0 = params.image0
    const imInf = params.imageInf
    const imSup = params.imageSup
    this.bornes = [inf, sup]
    this.racine = rac
    this.signeAGauche = mM1 > 0 ? '+' : '-'
    const xMinRep = inf - 1
    const xMaxRep = sup + 2
    const yMinRep = Math.floor(Math.min(mM1, mM2)) - 1
    const yMaxRep = Math.ceil(Math.max(mM1, mM2)) + 1
    const repere = new RepereBuilder({
      xMin: xMinRep,
      xMax: xMaxRep,
      yMin: yMinRep,
      yMax: yMaxRep,
    })
      .setGrille({
        grilleX: { dx: 1 },
        grilleY: { dy: 1 },
      })
      .setThickX({ xMax: sup + 1, xMin: inf, dx: 1 })
      .setThickY({
        yMax: yMaxRep,
        yMin: yMinRep,
        dy: 1,
      })
      .setLabelsX([{ valeur: 1, texte: '1' }])
      .setLabelsY([{ valeur: 1, texte: '1' }])
      .buildCustom()
    const noeuds = [
      {
        x: inf,
        y: imInf,
        deriveeGauche: mM1 > imInf ? 2 : -2,
        deriveeDroit: mM1 > imInf ? 2 : -2,
        isVisible: false,
      },
      {
        x: zD1,
        y: mM1,
        deriveeDroit: 0,
        deriveeGauche: 0,
        isVisible: false,
      },
      {
        x: rac,
        y: 0,
        deriveeGauche: (2 * (mM2 - mM1)) / (zD2 - zD1),
        deriveeDroit: (2 * (mM2 - mM1)) / (zD2 - zD1),
        isVisible: false,
      },
      {
        x: 0,
        y: f0,
        deriveeDroit: mM1 < 0 ? 1 : -1,
        deriveeGauche: mM1 < 0 ? 1 : -1,
        isVisible: false,
      },
      {
        x: zD2,
        y: mM2,
        deriveeDroit: 0,
        deriveeGauche: 0,
        isVisible: false,
      },
      {
        x: sup,
        y: imSup,
        deriveeGauche: mM2 < imSup ? 1.5 : -1.5,
        deriveeDroit: mM2 < imSup ? 1.5 : -1.5,
        isVisible: false,
      },
    ]
    const s = spline(noeuds)

    const largeurPremiereColonne = 2 // Première colonne
    const deltacl = 0.8 // Distance entre la bordure et les premiers et derniers antécédents
    const espcl = context.isHtml ? 2 : 2 // Espace entre les antécédents

    const sol = tableauDeVariation({
      scale: 0.4,
      tabInit: [
        [
          ['$x$', 2, 30],
          [`$f(x)$`, 2, 20],
        ],
        [`$${inf}$`, 20, `$${texNombre(rac, 1)}$`, 20, `$${sup}$`, 20],
      ],
      tabLines: [
        [
          'Line',
          30,
          '',
          0,
          imInf < 0 ? '-' : '+',
          20,
          'z',
          20,
          imSup > 0 ? '+' : '-',
          20,
        ],
      ],
      // colorBackground: '',
      espcl,
      deltacl,
      lgt: largeurPremiereColonne,
    })
    const dist1 = tableauDeVariation({
      scale: 0.4,
      tabInit: [
        [
          ['$x$', 2, 30],
          [`$f(x)$`, 2, 20],
        ],
        [`$${inf}$`, 20, `$${texNombre(f0, 1)}$`, 20, `$${sup}$`, 20],
      ],
      tabLines: [['Line', 30, '', 0, '-', 20, 'z', 20, '+', 20]],
      // colorBackground: '',
      espcl,
      deltacl,
      lgt: largeurPremiereColonne,
    })
    const dist2 = tableauDeVariation({
      scale: 0.4,
      tabInit: [
        [
          ['$x$', 2, 30],
          [`$f(x)$`, 2, 20],
        ],
        [
          `$${inf}$`,
          20,
          `$${texNombre(zD1, 1)}$`,
          20,
          `$${texNombre(zD2, 1)}$`,
          20,
          `$${sup}$`,
          20,
        ],
      ],
      tabLines: [
        [
          'Line',
          30,
          '',
          20,
          mM1 > imInf ? '+' : '-',
          20,
          'z',
          20,
          mM2 > f0 ? '+' : '-',
          20,
          'z',
          20,
          mM2 > imSup ? '-' : '+',
          20,
        ],
      ],
      // colorBackground: '',
      espcl,
      deltacl,
      lgt: largeurPremiereColonne,
    })
    const dist3 = tableauDeVariation({
      scale: 0.4,
      tabInit: [
        [
          ['$x$', 2, 20],
          [`$f(x)$`, 2, 20],
        ],
        [
          `$${inf}$`,
          20,
          `$${rac < 0 ? texNombre(rac, 1) : '0'}$`,
          20,
          `$${rac < 0 ? '0' : texNombre(rac, 1)}$`,
          20,
          `$${sup}$`,
          20,
        ],
      ],
      tabLines: [
        [
          'Line',
          30,
          '',
          20,
          mM1 > 0 ? '+' : '-',
          20,
          'z',
          20,
          mM1 > 0 ? '-' : '+',
          20,
          'z',
          20,
          '+',
          20,
        ],
      ],
      // colorBackground: '',
      espcl,
      deltacl,
      lgt: largeurPremiereColonne,
    })

    const figure = mathalea2d(
      {
        xmin: xMinRep,
        xmax: xMaxRep,
        ymin: yMinRep,
        ymax: yMaxRep,
        scale: 0.5,
      },
      [
        repere,
        s.courbe({
          color: 'red',
          epaisseur: 1,
          ajouteNoeuds: true,
        }),
      ],
    )
    this.reponses = ['a', 'b', 'c', 'd'].map((x) => `$${x}$`)
    this.enonce = `Dans le repère ci-dessous, on a représenté la fonction $f$ définie sur l'intervalle $[${inf};${sup}]$.<br>
    ${figure}
    Le tableau de signes de la fonction $f$ est :<br>`
    this.reponses = [sol, dist1, dist2, dist3]

    this.correction = `La fonction $f$ s'annule en $x=${texNombre(rac, 1)}$. Entre $${inf}$ et $${texNombre(rac, 1)}$, la fonction est ${mM1 > 0 ? 'positive' : 'négative'} et entre $${texNombre(rac, 1)}$ et $${sup}$ elle est ${mM2 > 0 ? 'positive' : 'négative'}.<br>`
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs({
      borneInf: -5,
      borneSup: 3,
      zeroDerivee1: -3,
      minMax1: 2.5,
      zeroDerivee2: 1.5,
      minMax2: -2.5,
      racine: -1,
      image0: -1.5,
      imageInf: 0.5,
      imageSup: -1,
    })
  }

  versionAleatoire: () => void = () => {
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }
    const signe = choice([-1, 1])
    const borneInf = randint(-5, -4)
    const borneSup = borneInf + 10
    const zeroDerivee1 = randint(borneInf + 1, -2)
    const zeroDerivee2 = randint(2, borneSup - 1)
    const minMax1 = randint(3, 7) * 0.5 * signe
    const minMax2 = randint(3, 7) * 0.5 * (minMax1 > 0 ? -1 : 1)
    const imageInf = randint(1, 2) * 0.5 * (minMax1 > 0 ? 1 : -1)
    const imageSup = randint(1, 2) * 0.5 * (minMax2 > 0 ? 1 : -1)
    const racine = randint(zeroDerivee1 + 1, zeroDerivee2 - 1, 0)
    const image0 =
      racine < 0
        ? minMax2 < 0
          ? -randint(2, 3) * 0.5
          : randint(2, 3) * 0.5
        : minMax1 < 0
          ? -randint(2, 3) * 0.5
          : randint(2, 3) * 0.5

    this.appliquerLesValeurs({
      borneInf,
      borneSup,
      zeroDerivee1,
      zeroDerivee2,
      imageInf,
      imageSup,
      racine,
      image0,
      minMax1,
      minMax2,
    })
  }

  /** Tableau de signes de f(x) à compléter : la racine et les signes. */
  configTableauSignes(): TableauSVConfig {
    const [inf, sup] = this.bornes
    const aDroite = this.signeAGauche === '+' ? '-' : '+'
    const ligne = (signes: CelluleSigne['symbole'][]): LigneSigne => ({
      type: 'signe',
      label: 'f(x)',
      cellules: [
        { symbole: '' },
        ...signes.flatMap((signe, k): CelluleSigne[] => [
          ...(k > 0 ? [{ symbole: '|0' } as CelluleSigne] : []),
          { symbole: '', editable: true, expected: signe },
        ]),
        { symbole: '' },
      ],
    })
    return {
      variableName: 'x',
      colonnes: [
        { valeur: texNombre(inf, 1) },
        { valeur: '', editable: true, expected: texNombre(this.racine, 1) },
        { valeur: texNombre(sup, 1) },
      ],
      lignes: [ligne([this.signeAGauche, aDroite])],
    }
  }

  nouvelleVersion() {
    if (this.sup3) super.nouvelleVersion()
    else {
      genereTableauxDeSignes(this)
      // La réponse est un tableau de signes : la correction complète est conservée.
      for (let i = 0; i < this.listeQuestions.length; i++) {
        this.listeReponsesCourtes[i] = null
      }
    }
  }

  constructor() {
    super()
    // Seule, la question reste un QCM : c'est la composition qui choisit la saisie libre.
    this.sup3 = true
    this.enonceCourt = () =>
      this.enonce.replace(
        /Le tableau de signes de la fonction \$f\$ est :<br>\s*$/,
        'Déterminer le tableau de signes de la fonction $f$.',
      )
  }
}
