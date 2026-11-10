import { courbe } from '../../lib/2d/Courbe'
import { orangeMathalea } from '../../lib/colors'
import { creerTableauSignesVariations } from '../../lib/customElements/TableauSignesVariationsElement'
import { configCorrige } from '../../lib/interactif/tableauSignesVariations/helpers'
import { repere } from '../../lib/2d/reperes'
import type {
  CelluleSigne,
  LigneSigne,
  TableauSVConfig,
} from '../../lib/interactif/tableauSignesVariations/types'
import { tableauSignesFonction } from '../../lib/mathFonctions/etudeFonction'
import { choice } from '../../lib/outils/arrayOutils'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import type FractionEtendue from '../../modules/FractionEtendue'
import { mathalea2d } from '../../modules/mathalea2d'

import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import ExerciceQcmACourt, { genereTableauxDeSignes } from '../ExerciceQcmACourt'

export const uuid = 'd7202'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Développer une identité remarquable'
export const dateDePublication = '02/06/2026'
export const dateDeModifImportante = '22/10/2026'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora
 *
 */
export default class AutoQ8FMt2026 extends ExerciceQcmACourt {
  private sens = 1
  private racines: [number, number] = [0, 0]
  private compteurTableauxCorriges = 0

  // sens = +1 : parabole vers le haut ; sens = -1 : vers le bas. Racines r1 < r2 (écart 4).
  private appliquerLesValeurs(sens: number, r1: number, r2: number): void {
    const a = 0.25 // écart de racines 4 => sommet à ∓1
    const xV = (r1 + r2) / 2
    const rMin = Math.min(r1, r2)
    const rMax = Math.max(r1, r2)
    this.sens = sens
    this.racines = [rMin, rMax]

    const f = (x: number | FractionEtendue) =>
      sens * a * (Number(x) - r1) * (Number(x) - r2)
    const fInverse = (x: number | FractionEtendue) => -f(x) // signes inversés (mauvais sens)
    const fSommet = (x: number | FractionEtendue) => sens * (Number(x) - xV) // une seule racine, au sommet
    const fDecale = (x: number | FractionEtendue) =>
      sens * a * (Number(x) - (r1 + 1)) * (Number(x) - (r2 - 1)) // racines mal lues

    // --- GRAPHIQUE (ÉNONCÉ) ---
    const xMin = rMin - 5
    const xMax = rMax + 3
    const yMin = sens > 0 ? -2 : -6
    const yMax = sens > 0 ? 6 : 2

    const r = repere({
      xMin,
      xMax,
      yMin,
      yMax,
      thickHauteur: 0.1,
      grilleSecondaire: true,
      grilleSecondaireXDistance: 1,
      grilleSecondaireYDistance: 1,
      xLabelMin: xMin + 1,
      xLabelMax: xMax - 1,
      yLabelMin: yMin + 1,
      yLabelMax: yMax - 1,
      axeXStyle: '->',
      axeYStyle: '->',
    })

    const figure = mathalea2d(
      {
        xmin: xMin - 0.5,
        xmax: xMax + 0.5,
        ymin: yMin - 1.05,
        ymax: yMax + 0.05,
        pixelsParCm: 25,
        scale: 0.6,
        center: !context.isHtml,
      },
      r,
      courbe(f, { repere: r, color: 'red', epaisseur: 2 }),
    )

    this.enonce = `On considère la représentation graphique d'une fonction $f$ polynôme du second degré, définie sur $\\mathbb{R}$.<br><br>
${figure}
Le tableau de signes de cette fonction $f$ est :`

    // --- RÉPONSES (tableaux de signes) ---
    const opts = {
      step: 1,
      tolerance: 0.1,
      substituts: [
        { antVal: -20, antTex: '-\\infty' },
        { antVal: 20, antTex: '+\\infty' },
      ],
    }
    this.reponses = [
      `${tableauSignesFonction(f, -20, 20, opts)}`,
      `${tableauSignesFonction(fInverse, -20, 20, opts)}`, // signes inversés
      `${tableauSignesFonction(fSommet, -20, 20, opts)}`, // racine au sommet
      `${tableauSignesFonction(fDecale, -20, 20, opts)}`, // racines mal lues
    ]

    // --- CORRECTION ---
    this.correction = `La courbe coupe l'axe des abscisses en $x=${rMin}$ et $x=${rMax}$.<br>`
    this.correction += `La fonction est positive lorsque sa courbe représentative est située au-dessus de l'axe des abscisses et elle est négative lorsque sa courbe est au-dessous de l'axe des abscisses.`
    this.correction += `<br>On lit donc le tableau de signes suivant :<br><br>`
    // En saisie libre, le tableau est entièrement en évidence ; en interactif, seules les cellules à compléter le sont.
    this.correction +=
      this.interactif && !this.sup3
        ? creerTableauSignesVariations(
            configCorrige(this.configTableauSignes(), { enEvidence: true }),
            {
              readonly: true,
              id: `tableauCorrigeEx${this.numeroExercice}N${++this.compteurTableauxCorriges}`,
            },
          )
        : `${tableauSignesFonction(f, -20, 20, this.sup3 ? opts : { ...opts, couleur: orangeMathalea })}`
  }

  versionOriginale: () => void = () => {
    // Sujet de l'image : parabole vers le haut, racines 2 et 6  =>  + 0 - 0 +
    this.appliquerLesValeurs(1, 2, 6)
  }

  versionAleatoire: () => void = () => {
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }
    const sens = choice([1, -1])
    const r1 = choice([1, 2, 3, 4])
    const r2 = r1 + 4
    this.appliquerLesValeurs(sens, r1, r2)
  }

  /** Tableau de signes de f(x) à compléter : les racines et les signes. */
  configTableauSignes(): TableauSVConfig {
    const [rMin, rMax] = this.racines
    const exterieur = this.sens > 0 ? '+' : '-'
    const interieur = this.sens > 0 ? '-' : '+'
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
        { valeur: '-\\infty' },
        { valeur: '', editable: true, expected: texNombre(rMin, 2) },
        { valeur: '', editable: true, expected: texNombre(rMax, 2) },
        { valeur: '+\\infty' },
      ],
      lignes: [ligne([exterieur, interieur, exterieur])],
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
        /Le tableau de signes de cette fonction \$f\$ est :\s*$/,
        'Déterminer le tableau de signes de cette fonction $f$.',
      )
    this.options.vertical = true
  }
}
